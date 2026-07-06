import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { splitSqlStatements } from "./lib/split-sql-statements.mjs";

const DDL_KEYWORDS =
  /^\s*(CREATE|DROP|ALTER|GRANT|REVOKE|TRUNCATE|COMMENT|SET|RESET|LOCK|REINDEX|CLUSTER|VACUUM|ANALYZE)\b/i;

function loadEnvFile(filePath) {
  return readFile(filePath, "utf8")
    .then((content) => {
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    })
    .catch(() => {});
}

function usage() {
  console.log(`
Usage:
  node scripts/run-cloudbase-migrations.mjs [options]

Options:
  --dry-run          Print statements without calling CloudBase API
  --from 001         Start at migration prefix (e.g. 001, 014)
  --to 025           Stop at migration prefix
  --file 014         Run a single migration prefix only
  --env-file path    Load env vars from file (default: .env.cloudbase, .env.local)

Required env:
  CLOUDBASE_ENV_ID
  TENCENTCLOUD_SECRET_ID   (or TENCENTCLOUD_SECRETID)
  TENCENTCLOUD_SECRET_KEY  (or TENCENTCLOUD_SECRETKEY)
  CLOUDBASE_REGION         (default: ap-shanghai)
`);
}

function parseArgs(argv) {
  const options = {
    dryRun: false,
    from: null,
    to: null,
    file: null,
    envFiles: [".env.cloudbase", ".env.local"],
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--from") options.from = argv[++i];
    else if (arg === "--to") options.to = argv[++i];
    else if (arg === "--file") options.file = argv[++i];
    else if (arg === "--env-file") options.envFiles = [argv[++i]];
    else if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    }
  }

  return options;
}

function migrationSortKey(name) {
  return Number(name.slice(0, 3));
}

function shouldRun(name, options) {
  const prefix = name.slice(0, 3);
  if (options.file) {
    const wanted = String(options.file).padStart(3, "0").slice(0, 3);
    return prefix === wanted;
  }
  if (options.from && migrationSortKey(name) < migrationSortKey(`${options.from}_`)) {
    return false;
  }
  if (options.to && migrationSortKey(name) > migrationSortKey(`${options.to}_`)) {
    return false;
  }
  return true;
}

function wrapDdl(sql) {
  const escaped = sql.replace(/'/g, "''");
  return `DO $$ BEGIN EXECUTE '${escaped}'; END $$;`;
}

async function createTcbClient(region, secretId, secretKey) {
  let tencentcloud;
  try {
    tencentcloud = await import("tencentcloud-sdk-nodejs");
  } catch {
    throw new Error(
      "Missing dependency tencentcloud-sdk-nodejs. Run: npm install --save-dev tencentcloud-sdk-nodejs",
    );
  }

  const TcbClient = tencentcloud.default.tcb.v20180608.Client;
  return new TcbClient({
    credential: { secretId, secretKey },
    region,
    profile: {
      httpProfile: { endpoint: "tcb.tencentcloudapi.com" },
    },
  });
}

async function executeSql(client, envId, sql, retryWithWrap = true) {
  const req = { EnvId: envId, Sql: sql };
  try {
    return await client.ExecutePGSql(req);
  } catch (error) {
    if (retryWithWrap && DDL_KEYWORDS.test(sql.trim())) {
      return executeSql(client, envId, wrapDdl(sql), false);
    }
    throw error;
  }
}

function preview(sql) {
  const oneLine = sql.replace(/\s+/g, " ").trim();
  return oneLine.length > 120 ? `${oneLine.slice(0, 117)}...` : oneLine;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const root = process.cwd();

  for (const envFile of options.envFiles) {
    await loadEnvFile(path.join(root, envFile));
  }

  const envId = process.env.CLOUDBASE_ENV_ID?.trim();
  const secretId = (
    process.env.TENCENTCLOUD_SECRET_ID ?? process.env.TENCENTCLOUD_SECRETID
  )?.trim();
  const secretKey = (
    process.env.TENCENTCLOUD_SECRET_KEY ?? process.env.TENCENTCLOUD_SECRETKEY
  )?.trim();
  const region = process.env.CLOUDBASE_REGION?.trim() ?? "ap-shanghai";

  if (!options.dryRun && envId && secretId && secretKey) {
    if (!secretId.startsWith("AKID") || secretId.length < 30) {
      console.error(`
Invalid TENCENTCLOUD_SECRET_ID.

ExecutePGSql requires Tencent Cloud CAM API keys:
  https://console.cloud.tencent.com/cam/capi

Do NOT use:
  - CloudBase env id (e.g. ai-iep-xxxx)
  - CloudBase Publishable Key / API Key JWT (eyJ...)

Expected SecretId format: AKIDxxxxxxxx (about 36 characters)
`);
      process.exit(1);
    }
    if (secretKey.startsWith("eyJ")) {
      console.error(`
Invalid TENCENTCLOUD_SECRETKEY.

You pasted a CloudBase API Key (JWT). Migration needs CAM SecretKey (~32 chars)
from https://console.cloud.tencent.com/cam/capi — not the CloudBase Auth API Key.
`);
      process.exit(1);
    }
  }

  const migrationsDir = path.join(root, "cloudbase", "migrations");
  const files = (await readdir(migrationsDir))
    .filter((f) => f.endsWith(".sql"))
    .sort()
    .filter((f) => shouldRun(f, options));

  if (files.length === 0) {
    console.error("No migration files matched the given filters.");
    process.exit(1);
  }

  let client = null;
  if (!options.dryRun) {
    if (!envId || !secretId || !secretKey) {
      console.error(`
Missing CloudBase credentials.

1. Copy cloudbase/env.example to .env.cloudbase
2. Fill in CLOUDBASE_ENV_ID, TENCENTCLOUD_SECRET_ID, TENCENTCLOUD_SECRET_KEY
3. Run: npm install --save-dev tencentcloud-sdk-nodejs
4. Run: node scripts/run-cloudbase-migrations.mjs

Or dry-run locally:
  node scripts/run-cloudbase-migrations.mjs --dry-run
`);
      process.exit(1);
    }
    client = await createTcbClient(region, secretId, secretKey);
  }

  console.log(
    options.dryRun
      ? `[dry-run] ${files.length} migration file(s)`
      : `[live] env=${envId} region=${region} files=${files.length}`,
  );

  let totalStatements = 0;
  let totalErrors = 0;

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = await readFile(filePath, "utf8");
    const statements = splitSqlStatements(sql);
    console.log(`\n==> ${file} (${statements.length} statements)`);

    for (let index = 0; index < statements.length; index += 1) {
      const statement = statements[index];
      totalStatements += 1;
      const label = `[${file} #${index + 1}/${statements.length}]`;

      if (options.dryRun) {
        console.log(`${label} ${preview(statement)}`);
        continue;
      }

      try {
        await executeSql(client, envId, statement);
        console.log(`${label} OK`);
      } catch (error) {
        totalErrors += 1;
        console.error(`${label} FAILED`);
        console.error(preview(statement));
        console.error(error.message ?? error);
        if (process.env.CLOUDBASE_STOP_ON_ERROR !== "0") {
          process.exit(1);
        }
      }

      // Gentle pacing to reduce InternalError bursts on large migrations.
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }

  console.log(
    `\nDone. files=${files.length} statements=${totalStatements} errors=${totalErrors}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

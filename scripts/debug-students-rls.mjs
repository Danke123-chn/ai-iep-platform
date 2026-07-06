import { readFile } from "node:fs/promises";

async function loadEnv(file) {
  try {
    const content = await readFile(file, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
  } catch {
    // ignore
  }
}

function parseRows(res) {
  return (res.Rows ?? []).map((row) => JSON.parse(row));
}

await loadEnv(".env.cloudbase");

const tencentcloud = await import("tencentcloud-sdk-nodejs");
const Client = tencentcloud.default.tcb.v20180608.Client;
const client = new Client({
  credential: {
    secretId: process.env.TENCENTCLOUD_SECRET_ID,
    secretKey: process.env.TENCENTCLOUD_SECRETKEY,
  },
  region: process.env.CLOUDBASE_REGION ?? "ap-shanghai",
  profile: { httpProfile: { endpoint: "tcb.tencentcloudapi.com" } },
});

const envId = process.env.CLOUDBASE_ENV_ID;

async function sql(query) {
  return client.ExecutePGSql({ EnvId: envId, Sql: query });
}

const students = parseRows(
  await sql(`
    SELECT name, user_id, created_at::text
    FROM public.students
    ORDER BY created_at DESC
    LIMIT 15
  `),
);

const users = parseRows(
  await sql(`
    SELECT id::text, sub, phone_number
    FROM auth.users
    ORDER BY created_at DESC
    LIMIT 10
  `),
);

console.log("Recent students:");
for (const row of students) {
  console.log(`  name=${row[0]} user_id=${row[1]} created=${row[2]}`);
}

console.log("\nAuth users (id vs JWT sub):");
for (const row of users) {
  console.log(`  id=${row[0]} sub=${row[1]} phone=${row[2]}`);
}

const columns = parseRows(
  await sql(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'auth' AND table_name = 'users'
    ORDER BY ordinal_position
  `),
);

console.log("\nauth.users columns:", columns.map((r) => r[0]).join(", "));

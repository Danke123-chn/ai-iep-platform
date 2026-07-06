import { readFile } from "node:fs/promises";
import path from "node:path";
import { buildInsert } from "./lib/sql-format.mjs";
import {
  buildReferenceIdMaps,
  remapForeignKeys,
} from "./lib/id-remap.mjs";
import {
  executePgSql,
  getCloudBaseClient,
  parsePgRows,
} from "./lib/cloudbase-client.mjs";

const IMPORT_ORDER = [
  { table: "students", userColumns: ["user_id"] },
  { table: "ieps", userColumns: ["user_id"] },
  { table: "iep_goals", userColumns: [] },
  { table: "assessment_sessions", userColumns: ["assessor_id"] },
  { table: "vb_mapp_milestone_scores", userColumns: [] },
  { table: "vb_mapp_barrier_scores", userColumns: [] },
  { table: "vb_mapp_transition_scores", userColumns: [] },
  { table: "c_pep3_developmental_scores", userColumns: [] },
  { table: "c_pep3_pathological_scores", userColumns: [] },
  { table: "kg_integration_scores", userColumns: [] },
  { table: "kg_integration_behavior_records", userColumns: [] },
  { table: "elem_integration_scores", userColumns: [] },
  { table: "elem_integration_behavior_records", userColumns: [] },
];

const TRUNCATE_ORDER = [...IMPORT_ORDER].reverse().map((item) => item.table);
const BATCH_SIZE = 25;

function parseArgs(argv) {
  return {
    truncate: argv.includes("--truncate"),
    dryRun: argv.includes("--dry-run"),
    useOriginalUserIds: argv.includes("--use-original-user-ids"),
    file:
      argv.find((arg, index) => argv[index - 1] === "--file") ??
      path.join("cloudbase", "data", "supabase-export.json"),
  };
}

function normalizeEmail(email) {
  return email?.trim().toLowerCase() ?? null;
}

async function loadCloudBaseUsers(clientBundle) {
  const res = await executePgSql(
    clientBundle,
    "SELECT sub, email FROM auth.users WHERE email IS NOT NULL AND email <> ''",
  );
  const byEmail = new Map();
  for (const [sub, email] of parsePgRows(res)) {
    const key = normalizeEmail(email);
    if (key) byEmail.set(key, sub);
  }
  return byEmail;
}

function buildUserMap(supabaseUsers, cloudbaseUsersByEmail) {
  const map = new Map();
  const missing = [];

  for (const user of supabaseUsers) {
    const email = normalizeEmail(user.email);
    if (!email) {
      missing.push({ id: user.id, reason: "no email" });
      continue;
    }
    const cloudbaseSub = cloudbaseUsersByEmail.get(email);
    if (!cloudbaseSub) {
      missing.push({ id: user.id, email, reason: "not in CloudBase" });
      continue;
    }
    map.set(user.id, cloudbaseSub);
  }

  return { map, missing };
}

function transformRow(row, userColumns, userMap, useOriginalUserIds) {
  const next = { ...row };
  if (useOriginalUserIds) return next;
  for (const column of userColumns) {
    const mapped = userMap.get(next[column]);
    if (!mapped) return null;
    next[column] = mapped;
  }
  return next;
}

function normalizeStudentRow(row) {
  const next = { ...row };
  if (next.school_name && !next.school) {
    next.school = next.school_name;
  }
  delete next.school_name;

  if (
    (!next.disability_types || next.disability_types.length === 0) &&
    next.disability_type
  ) {
    next.disability_types = [next.disability_type];
  }
  delete next.disability_type;

  if (!next.placement_types && next.placement_type) {
    next.placement_types = [next.placement_type];
  }
  delete next.placement_type;

  return next;
}

function normalizeRow(table, row) {
  if (table === "students") return normalizeStudentRow(row);
  return row;
}

async function loadTableColumns(clientBundle, table) {
  const res = await executePgSql(
    clientBundle,
    `SELECT column_name, udt_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${table}' ORDER BY ordinal_position`,
  );
  const columns = new Set();
  const types = {};
  for (const [name, udtName] of parsePgRows(res)) {
    columns.add(name);
    types[name] = udtName;
  }
  return { columns, types };
}

async function truncateTables(clientBundle, dryRun) {
  const sql = `TRUNCATE TABLE ${TRUNCATE_ORDER.map((t) => `public.${t}`).join(", ")} RESTART IDENTITY CASCADE`;
  if (dryRun) {
    console.log(`[dry-run] ${sql}`);
    return;
  }
  await executePgSql(clientBundle, sql);
  console.log("Truncated existing business data.");
}

async function importTable(
  clientBundle,
  table,
  rows,
  userColumns,
  userMap,
  dryRun,
  useOriginalUserIds,
  tableColumns,
  columnTypes,
  referenceIdMaps,
) {
  const transformed = [];
  let skipped = 0;

  for (const row of rows) {
    let next = transformRow(row, userColumns, userMap, useOriginalUserIds);
    if (!next) {
      skipped += 1;
      continue;
    }
    next = normalizeRow(table, next);
    next = remapForeignKeys(table, next, referenceIdMaps);
    const filtered = {};
    for (const [key, value] of Object.entries(next)) {
      if (tableColumns.has(key)) filtered[key] = value;
    }
    transformed.push(filtered);
  }

  if (transformed.length === 0) {
    console.log(`  ${table}: 0 imported (${skipped} skipped)`);
    return { imported: 0, skipped };
  }

  const columns = [...tableColumns].filter((column) =>
    transformed.some((row) => Object.prototype.hasOwnProperty.call(row, column)),
  );
  let imported = 0;

  for (let i = 0; i < transformed.length; i += BATCH_SIZE) {
    const batch = transformed.slice(i, i + BATCH_SIZE);
    const sql = buildInsert(table, batch, columns, columnTypes);
    if (!sql) continue;

    if (dryRun) {
      console.log(`  [dry-run] ${table} batch ${i / BATCH_SIZE + 1}: ${batch.length} rows`);
    } else {
      await executePgSql(clientBundle, sql);
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
    imported += batch.length;
  }

  console.log(`  ${table}: ${imported} imported (${skipped} skipped)`);
  return { imported, skipped };
}

async function verifyCounts(clientBundle, tables) {
  console.log("\nVerification:");
  for (const table of tables) {
    const res = await executePgSql(
      clientBundle,
      `SELECT COUNT(*)::text FROM public.${table}`,
    );
    const count = parsePgRows(res)[0]?.[0] ?? "?";
    console.log(`  ${table}: ${count}`);
  }
}

async function main() {
  const root = process.cwd();
  const options = parseArgs(process.argv.slice(2));
  const filePath = path.isAbsolute(options.file)
    ? options.file
    : path.join(root, options.file);

  const raw = await readFile(filePath, "utf8");
  const payload = JSON.parse(raw);

  const clientBundle = await getCloudBaseClient(root);
  const cloudbaseUsersByEmail = await loadCloudBaseUsers(clientBundle);
  const { map: userMap, missing } = buildUserMap(
    payload.authUsers ?? [],
    cloudbaseUsersByEmail,
  );

  console.log(`Loaded export: ${filePath}`);
  console.log(`User map: ${userMap.size} matched, ${missing.length} unmatched`);

  if (missing.length > 0) {
    console.log("\nUnmatched Supabase users (rows for these users will be skipped):");
    for (const item of missing.slice(0, 20)) {
      console.log(
        `  - ${item.email ?? item.id}: ${item.reason}`,
      );
    }
    if (missing.length > 20) {
      console.log(`  ... and ${missing.length - 20} more`);
    }
  }

  if (userMap.size === 0 && !options.useOriginalUserIds) {
    console.error(
      "\nNo users mapped. Either:\n" +
        "  1) Register the same email accounts in CloudBase, then re-run import, or\n" +
        "  2) Run with --use-original-user-ids to import now, then run cloudbase:remap-users after users register.",
    );
    process.exit(1);
  }

  if (options.useOriginalUserIds) {
    console.log(
      "Using original Supabase user IDs (varchar). Run cloudbase:remap-users after CloudBase signup.",
    );
  }

  if (options.truncate) {
    await truncateTables(clientBundle, options.dryRun);
  }

  const referenceIdMaps = options.dryRun
    ? {}
    : await buildReferenceIdMaps(
        clientBundle,
        payload.referenceTables ?? {},
      );
  console.log(
    `Reference ID maps: milestones=${referenceIdMaps.milestone_id?.size ?? 0}, barriers=${referenceIdMaps.barrier_id?.size ?? 0}, kg=${referenceIdMaps.kg_item_id?.size ?? 0}`,
  );

  const tableColumnsCache = new Map();
  const columnTypesCache = new Map();
  for (const { table } of IMPORT_ORDER) {
    if (!options.dryRun) {
      const { columns, types } = await loadTableColumns(clientBundle, table);
      tableColumnsCache.set(table, columns);
      columnTypesCache.set(table, types);
    }
  }

  for (const { table, userColumns } of IMPORT_ORDER) {
    const rows = payload.tables?.[table] ?? [];
    console.log(`Importing ${table} (${rows.length} rows)...`);
    const tableColumns =
      tableColumnsCache.get(table) ??
      new Set(Object.keys(normalizeRow(table, rows[0] ?? {})));
    const columnTypes = columnTypesCache.get(table) ?? {};
    await importTable(
      clientBundle,
      table,
      rows,
      userColumns,
      userMap,
      options.dryRun,
      options.useOriginalUserIds,
      tableColumns,
      columnTypes,
      referenceIdMaps,
    );
  }

  if (!options.dryRun) {
    await verifyCounts(
      clientBundle,
      IMPORT_ORDER.map((item) => item.table),
    );
  }

  console.log("\nImport finished.");
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});

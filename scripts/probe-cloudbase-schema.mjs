import { readFile } from "node:fs/promises";

async function loadEnv(file) {
  try {
    const content = await readFile(file, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
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

const tables = parseRows(
  await sql(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `),
);

const views = parseRows(
  await sql(`
    SELECT table_name
    FROM information_schema.views
    WHERE table_schema = 'public'
    ORDER BY table_name
  `),
);

const countTables = [
  "vb_mapp_milestones",
  "c_pep3_developmental_items",
  "kg_integration_items",
  "elem_integration_items",
];

const counts = {};
for (const table of countTables) {
  try {
    const res = await sql(`SELECT COUNT(*)::text AS c FROM public.${table}`);
    counts[table] = parseRows(res)[0]?.[0] ?? "?";
  } catch {
    counts[table] = "missing";
  }
}

const authUsers = parseRows(
  await sql(`
    SELECT COUNT(*)::text AS total,
           COUNT(*) FILTER (WHERE email IS NOT NULL AND email <> '')::text AS with_email
    FROM auth.users
  `),
);

const businessCounts = parseRows(
  await sql(`
    SELECT 'students' AS t, COUNT(*)::text FROM public.students
    UNION ALL SELECT 'ieps', COUNT(*)::text FROM public.ieps
    UNION ALL SELECT 'assessment_sessions', COUNT(*)::text FROM public.assessment_sessions
  `),
);

console.log("Tables:", tables.map((r) => r[0]).join(", ") || "(none)");
console.log("Views:", views.map((r) => r[0]).join(", ") || "(none)");
console.log("Seed counts:", counts);
console.log("Auth users:", { total: authUsers[0]?.[0], withEmail: authUsers[0]?.[1] });
console.log("Business rows:", Object.fromEntries(businessCounts.map((r) => [r[0], r[1]])));

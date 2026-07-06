import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { loadEnvFiles } from "./lib/load-env.mjs";

const BUSINESS_TABLES = [
  "students",
  "ieps",
  "iep_goals",
  "assessment_sessions",
  "vb_mapp_milestone_scores",
  "vb_mapp_barrier_scores",
  "vb_mapp_transition_scores",
  "c_pep3_developmental_scores",
  "c_pep3_pathological_scores",
  "kg_integration_scores",
  "kg_integration_behavior_records",
  "elem_integration_scores",
  "elem_integration_behavior_records",
];

const REFERENCE_TABLES = [
  "vb_mapp_milestones",
  "vb_mapp_barriers",
  "vb_mapp_transitions",
  "c_pep3_developmental_items",
  "c_pep3_pathological_items",
  "kg_integration_items",
  "elem_integration_items",
];

const PAGE_SIZE = 1000;

function normalizeStudentRow(row) {
  const next = { ...row };
  if (!next.placement_types && next.placement_type) {
    next.placement_types = [next.placement_type];
  }
  delete next.placement_type;
  return next;
}

async function fetchAllRows(supabase, table) {
  const rows = [];
  let from = 0;

  while (true) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase.from(table).select("*").range(from, to);
    if (error) throw new Error(`${table}: ${error.message}`);
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  if (table === "students") {
    return rows.map(normalizeStudentRow);
  }
  return rows;
}

async function fetchAuthUsers(supabase) {
  const users = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: PAGE_SIZE,
    });
    if (error) throw new Error(`auth.users: ${error.message}`);
    users.push(
      ...data.users.map((user) => ({
        id: user.id,
        email: user.email ?? null,
      })),
    );
    if (data.users.length < PAGE_SIZE) break;
    page += 1;
  }

  return users;
}

async function main() {
  const root = process.cwd();
  await loadEnvFiles(root);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_KEY ??
    process.env.SUPABASE_SECRET_KEY;

  if (!url || !serviceRoleKey) {
    console.error(`
Missing Supabase export credentials.

Add to .env.local:
  NEXT_PUBLIC_SUPABASE_URL=...
  SUPABASE_SERVICE_ROLE_KEY=...

Get service role key from Supabase Dashboard → Project Settings → API → service_role
`);
    process.exit(1);
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log("Exporting Supabase auth users...");
  const authUsers = await fetchAuthUsers(supabase);
  console.log(`  auth users: ${authUsers.length}`);

  const tables = {};
  for (const table of BUSINESS_TABLES) {
    console.log(`Exporting ${table}...`);
    tables[table] = await fetchAllRows(supabase, table);
    console.log(`  ${table}: ${tables[table].length} rows`);
  }

  const referenceTables = {};
  for (const table of REFERENCE_TABLES) {
    console.log(`Exporting reference ${table}...`);
    referenceTables[table] = await fetchAllRows(supabase, table);
    console.log(`  ${table}: ${referenceTables[table].length} rows`);
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    source: url,
    authUsers,
    tables,
    referenceTables,
  };

  const outDir = path.join(root, "cloudbase", "data");
  await mkdir(outDir, { recursive: true });
  const outFile = path.join(outDir, "supabase-export.json");
  await writeFile(outFile, JSON.stringify(payload, null, 2), "utf8");

  console.log(`\nSaved ${outFile}`);
  console.log(
    "Next: ensure matching users exist in CloudBase (same email), then run:",
  );
  console.log("  npm run cloudbase:import-data");
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});

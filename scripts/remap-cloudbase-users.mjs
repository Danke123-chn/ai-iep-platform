import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  executePgSql,
  getCloudBaseClient,
  parsePgRows,
} from "./lib/cloudbase-client.mjs";

const USER_ID_TABLES = [
  { table: "students", column: "user_id" },
  { table: "ieps", column: "user_id" },
  { table: "assessment_sessions", column: "assessor_id" },
];

function normalizeEmail(email) {
  return email?.trim().toLowerCase() ?? null;
}

async function main() {
  const root = process.cwd();
  const filePath = path.join(root, "cloudbase", "data", "supabase-export.json");
  const payload = JSON.parse(await readFile(filePath, "utf8"));
  const clientBundle = await getCloudBaseClient(root);

  const cloudbaseUsers = parsePgRows(
    await executePgSql(
      clientBundle,
      "SELECT sub, email FROM auth.users WHERE email IS NOT NULL AND email <> ''",
    ),
  );
  const cloudbaseByEmail = new Map(
    cloudbaseUsers.map(([sub, email]) => [normalizeEmail(email), sub]),
  );

  let remapped = 0;
  let pending = 0;

  console.log("Remapping Supabase user IDs → CloudBase sub by email...\n");

  for (const user of payload.authUsers ?? []) {
    const email = normalizeEmail(user.email);
    if (!email) {
      console.log(`  skip ${user.id}: no email`);
      pending += 1;
      continue;
    }

    const cloudbaseSub = cloudbaseByEmail.get(email);
    if (!cloudbaseSub) {
      console.log(`  pending ${email}: not registered in CloudBase yet`);
      pending += 1;
      continue;
    }

    if (cloudbaseSub === user.id) {
      console.log(`  ok ${email}: already mapped`);
      continue;
    }

    for (const { table, column } of USER_ID_TABLES) {
      const res = await executePgSql(
        clientBundle,
        `UPDATE public.${table} SET ${column} = '${cloudbaseSub.replace(/'/g, "''")}' WHERE ${column} = '${String(user.id).replace(/'/g, "''")}'`,
      );
      if (res.AffectedRows > 0) {
        console.log(`  ${email}: ${table}.${column} → ${res.AffectedRows} rows`);
      }
    }
    remapped += 1;
  }

  console.log(`\nDone. remapped=${remapped} pending=${pending}`);
  if (pending > 0) {
    console.log(
      "Ask pending users to register in CloudBase with the same email, then re-run:",
    );
    console.log("  npm run cloudbase:remap-users");
  }
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});

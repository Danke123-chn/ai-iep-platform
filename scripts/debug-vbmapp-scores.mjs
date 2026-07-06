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

const sessions = parseRows(
  await sql(`
    SELECT id::text, status, session_date::text
    FROM public.assessment_sessions
    WHERE tool_type = 'vb_mapp'
    ORDER BY created_at DESC
    LIMIT 5
  `),
);

console.log("Recent vb_mapp sessions:");
for (const row of sessions) {
  console.log(`  id=${row[0]} status=${row[1]} date=${row[2]}`);
}

if (sessions.length === 0) process.exit(0);

const sessionId = sessions[0][0];

for (const [table, label] of [
  ["vb_mapp_milestone_scores", "milestone"],
  ["vb_mapp_barrier_scores", "barrier"],
  ["vb_mapp_transition_scores", "transition"],
]) {
  const stats = parseRows(
    await sql(`
      SELECT
        count(*)::text AS total,
        count(*) FILTER (WHERE score != 'NT')::text AS scored
      FROM public.${table}
      WHERE session_id = '${sessionId}'
    `),
  )[0];
  console.log(`${label}: total=${stats[0]} non-NT=${stats[1]}`);
}

const sampleBarrier = parseRows(
  await sql(`
    SELECT barrier_id::text, score
    FROM public.vb_mapp_barrier_scores
    WHERE session_id = '${sessionId}' AND score != 'NT'
    LIMIT 5
  `),
);
console.log("Sample non-NT barrier scores:", sampleBarrier);

const sampleTransition = parseRows(
  await sql(`
    SELECT transition_id::text, score
    FROM public.vb_mapp_transition_scores
    WHERE session_id = '${sessionId}' AND score != 'NT'
    LIMIT 5
  `),
);
console.log("Sample non-NT transition scores:", sampleTransition);

const barrierDefs = parseRows(
  await sql(`SELECT count(*)::text FROM public.vb_mapp_barriers`),
)[0][0];
const transitionDefs = parseRows(
  await sql(`SELECT count(*)::text FROM public.vb_mapp_transitions`),
)[0][0];
console.log(`Barrier defs: ${barrierDefs}, transition defs: ${transitionDefs}`);

const joinSample = parseRows(
  await sql(`
    SELECT b.id::text, s.score
    FROM public.vb_mapp_barriers b
    LEFT JOIN public.vb_mapp_barrier_scores s
      ON s.barrier_id = b.id AND s.session_id = '${sessionId}'
    ORDER BY b.sort_order
    LIMIT 5
  `),
);
console.log("Join sample (barrier id, score):", joinSample);

const summaryRow = parseRows(
  await sql(`
    SELECT summary IS NOT NULL AS has_summary,
           summary LIKE '%均为未测%' AS mentions_untested
    FROM public.assessment_sessions
    WHERE id = '${sessionId}'
  `),
)[0];
console.log("Session summary:", summaryRow);

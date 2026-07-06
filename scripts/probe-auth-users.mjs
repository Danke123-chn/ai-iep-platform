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

const sql =
  "SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_schema = 'auth' AND table_name = 'users' ORDER BY ordinal_position";

const res = await client.ExecutePGSql({
  EnvId: process.env.CLOUDBASE_ENV_ID,
  Sql: sql,
});

console.log(JSON.stringify(res, null, 2));

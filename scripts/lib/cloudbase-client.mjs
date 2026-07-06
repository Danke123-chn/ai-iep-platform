import { loadEnvFiles } from "./load-env.mjs";

let clientPromise = null;

export async function getCloudBaseClient(root = process.cwd()) {
  if (!clientPromise) {
    clientPromise = createClient(root);
  }
  return clientPromise;
}

async function createClient(root) {
  await loadEnvFiles(root);

  const secretId =
    process.env.TENCENTCLOUD_SECRET_ID ?? process.env.TENCENTCLOUD_SECRETID;
  const secretKey =
    process.env.TENCENTCLOUD_SECRET_KEY ?? process.env.TENCENTCLOUD_SECRETKEY;
  const envId = process.env.CLOUDBASE_ENV_ID?.trim();
  const region = process.env.CLOUDBASE_REGION?.trim() ?? "ap-shanghai";

  if (!envId || !secretId || !secretKey) {
    throw new Error(
      "Missing CloudBase credentials in .env.cloudbase (CLOUDBASE_ENV_ID, TENCENTCLOUD_SECRET_ID, TENCENTCLOUD_SECRETKEY).",
    );
  }

  const tencentcloud = await import("tencentcloud-sdk-nodejs");
  const Client = tencentcloud.default.tcb.v20180608.Client;

  return {
    envId,
    client: new Client({
      credential: { secretId, secretKey },
      region,
      profile: { httpProfile: { endpoint: "tcb.tencentcloudapi.com" } },
    }),
  };
}

export function parsePgRows(res) {
  return (res.Rows ?? []).map((row) => JSON.parse(row));
}

export async function executePgSql(clientBundle, sql) {
  return clientBundle.client.ExecutePGSql({
    EnvId: clientBundle.envId,
    Sql: sql,
  });
}

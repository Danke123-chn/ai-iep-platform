import { PostgrestClient } from "@supabase/postgrest-js";
import {
  getCloudBaseEnvId,
  getCloudBasePublishableKey,
} from "@/lib/cloudbase/config";

export function createAuthenticatedPostgrestClient(accessToken: string) {
  const envId = getCloudBaseEnvId();
  const accessKey = getCloudBasePublishableKey();

  if (!envId || !accessKey) {
    throw new Error(
      "CloudBase 环境变量未配置，请检查 NEXT_PUBLIC_CLOUDBASE_ENV_ID 与 NEXT_PUBLIC_CLOUDBASE_PUBLISHABLE_KEY。",
    );
  }

  const url = `https://${envId}.api.tcloudbasegateway.com/v1/rdb/rest`;

  return new PostgrestClient(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: accessKey,
      "Accept-Profile": envId,
      "Content-Profile": envId,
    },
    schema: "public",
  });
}

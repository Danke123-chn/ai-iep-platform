import cloudbase from "@cloudbase/js-sdk";
import "@cloudbase/js-sdk/mysql";
import {
  getCloudBaseEnvId,
  getCloudBasePublishableKey,
} from "@/lib/cloudbase/config";

export function createServerApp() {
  const envId = getCloudBaseEnvId();
  const accessKey = getCloudBasePublishableKey();

  if (!envId || !accessKey) {
    throw new Error(
      "CloudBase 环境变量未配置，请检查 NEXT_PUBLIC_CLOUDBASE_ENV_ID 与 NEXT_PUBLIC_CLOUDBASE_PUBLISHABLE_KEY。",
    );
  }

  return cloudbase.init({
    env: envId,
    region: "ap-shanghai",
    accessKey,
  });
}

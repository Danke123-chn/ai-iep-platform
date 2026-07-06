export const CLOUDBASE_SESSION_COOKIE = "cloudbase_session";

export function getCloudBaseEnvId(): string | undefined {
  return process.env.NEXT_PUBLIC_CLOUDBASE_ENV_ID;
}

export function getCloudBasePublishableKey(): string | undefined {
  return process.env.NEXT_PUBLIC_CLOUDBASE_PUBLISHABLE_KEY;
}

export function isCloudBaseConfigured(): boolean {
  return Boolean(getCloudBaseEnvId() && getCloudBasePublishableKey());
}

export function getCloudBaseConfigError(): string | null {
  if (isCloudBaseConfigured()) return null;
  return "CloudBase 环境变量未配置。请在 .env.local 中设置 NEXT_PUBLIC_CLOUDBASE_ENV_ID 和 NEXT_PUBLIC_CLOUDBASE_PUBLISHABLE_KEY，然后重启 dev server。";
}

export function getSupabaseUrlError(
  search: string,
  hash: string,
): string | null {
  const searchParams = new URLSearchParams(search);
  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));

  const errorCode =
    hashParams.get("error_code") ?? searchParams.get("error_code");
  const errorDescription =
    hashParams.get("error_description") ?? searchParams.get("error_description");

  if (errorCode === "otp_expired") {
    return "验证链接已过期或已被使用。请重新注册或重新申请邮件，并尽快点击最新链接。";
  }

  if (
    errorCode === "access_denied" &&
    errorDescription?.toLowerCase().includes("expired")
  ) {
    return "验证链接已过期或已被使用。请重新注册或重新申请邮件，并尽快点击最新链接。";
  }

  if (errorCode === "otp_disabled") {
    return "邮箱验证功能未开启，请联系管理员。";
  }

  return null;
}

export function clearAuthHashFromUrl() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.hash) return;
  url.hash = "";
  window.history.replaceState(null, "", url.pathname + url.search);
}

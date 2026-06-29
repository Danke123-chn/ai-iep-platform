const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "Failed to fetch":
    "无法连接 Supabase 服务。请检查 NEXT_PUBLIC_SUPABASE_URL 是否正确，并确认 Supabase 项目已在控制台创建且网络可访问。",
  REQUEST_TIMEOUT:
    "请求超时，请检查网络连接或稍后再试。",
  "Invalid login credentials":
    "邮箱或密码不正确。若尚未注册，请先注册；若刚注册，请检查邮箱是否已完成验证。",
  "Email not confirmed":
    "邮箱尚未验证。请查收验证邮件，或在 Supabase 控制台关闭 Email 确认要求。",
  "User already registered":
    "该邮箱已注册，请直接登录。",
  "email rate limit exceeded":
    "发送过于频繁，请等待 1 小时后再试，或减少重复点击发送按钮。",
  "over_email_send_rate_limit":
    "发送过于频繁，请等待 1 小时后再试。",
};

export function getAuthErrorMessage(message: string): string {
  return AUTH_ERROR_MESSAGES[message] ?? message;
}

export async function withAuthTimeout<T>(
  promise: Promise<T>,
  ms = 20000,
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("REQUEST_TIMEOUT")), ms);
    }),
  ]);
}

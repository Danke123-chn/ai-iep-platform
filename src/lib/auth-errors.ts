const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "Failed to fetch":
    "无法连接 CloudBase 服务。请检查 NEXT_PUBLIC_CLOUDBASE_ENV_ID 与 NEXT_PUBLIC_CLOUDBASE_PUBLISHABLE_KEY 是否正确，并确认环境已在控制台创建且网络可访问。",
  REQUEST_TIMEOUT: "请求超时，请检查网络连接或稍后再试。",
  "Invalid login credentials": "手机号或密码不正确。若尚未注册，请先注册。",
  "Invalid credentials": "手机号或密码不正确。若尚未注册，请先注册。",
  "Email not confirmed": "邮箱尚未验证，请查收验证邮件后重试。",
  "User already registered": "该手机号已注册，请直接登录。",
  phone_already_exists: "该手机号已注册，请直接登录。",
  user_not_found: "该手机号尚未注册，请先注册。",
  invalid_password: "密码不正确，请检查后重试。",
  INVALID_PASSWORD: "密码不正确，请检查后重试。",
  password_too_weak: "密码强度不足，需 8–32 位且包含字母和数字。",
  password_not_set:
    "该手机号尚未设置密码。请前往注册页，用短信验证码重新设置密码；或改用验证码登录。",
  "账号密码未设置":
    "该手机号尚未设置密码。请前往注册页，用短信验证码重新设置密码；或改用验证码登录。",
  invalid_code: "验证码错误或已过期，请重新获取后再试。",
  code_expired: "验证码已过期，请重新获取。",
  "phone_number format invalid":
    "手机号格式不正确，请输入 11 位中国大陆手机号（如 13800000000）。",
  "phone format invalid":
    "手机号格式不正确，请输入 11 位中国大陆手机号（如 13800000000）。",
  "SMS login is not enabled":
    "短信验证码登录未开启，请在 CloudBase 控制台 → 身份认证 → 登录方式 中启用。",
  "region not supported":
    "当前环境地域不支持短信登录，请使用上海地域的 CloudBase PG 环境。",
  "email rate limit exceeded":
    "发送过于频繁，请等待 1 小时后再试，或减少重复点击发送按钮。",
  "over_email_send_rate_limit": "发送过于频繁，请等待 1 小时后再试。",
};

export function extractAuthErrorMessage(
  err: unknown,
  fallback = "操作失败，请稍后再试",
): string {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  if (typeof err === "string" && err.trim()) {
    return err;
  }

  if (err && typeof err === "object") {
    const record = err as Record<string, unknown>;

    for (const key of ["message", "error_msg", "error_description", "msg"]) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }

    for (const key of ["code", "error_code", "errorCode"]) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }

    const nested = record.error;
    if (nested && typeof nested === "object") {
      const nestedMessage = extractAuthErrorMessage(nested, "");
      if (nestedMessage) return nestedMessage;
    }
  }

  return fallback;
}

export function getAuthErrorMessage(message: string): string {
  if (
    message.includes("verification code does not match") ||
    message.includes("无效的验证码")
  ) {
    return "验证码错误或已过期，请重新获取后再试。";
  }

  if (
    message.includes("password_not_set") ||
    message.includes("账号密码未设置")
  ) {
    return AUTH_ERROR_MESSAGES.password_not_set;
  }

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

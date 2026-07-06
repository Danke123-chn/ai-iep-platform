"use client";

import { setSessionCookie } from "@/app/actions/auth";
import { extractAuthErrorMessage, withAuthTimeout } from "@/lib/auth-errors";
import { getBrowserApp } from "@/lib/cloudbase/browser-app";
import { normalizeChinaPhone } from "@/lib/cloudbase/phone";

export type PhoneOtpSession = {
  verifyOtp: (params: { token: string }) => Promise<{
    data?: unknown;
    error?: { message?: string } | null;
  }>;
};

export type SignupVerificationSession = {
  verificationId: string;
  isUser: boolean;
};

type V1PhoneAuth = {
  sendPhoneCode: (phoneNumber: string) => Promise<boolean>;
  signUpWithPhoneCode: (
    phoneNumber: string,
    phoneCode: string,
    password: string,
  ) => Promise<unknown>;
  signInWithPhoneCodeOrPassword: (params: {
    phoneNumber: string;
    phoneCode?: string;
    password?: string;
  }) => Promise<unknown>;
  getVerification: (params: { phone_number: string }) => Promise<{
    verification_id: string;
    is_user?: boolean;
  }>;
  verify: (params: {
    verification_id: string;
    verification_code: string;
  }) => Promise<{ verification_token: string }>;
  forceResetPwdByPhoneCode: (params: {
    phoneNumber: string;
    phoneCode: string;
    password: string;
  }) => Promise<unknown>;
  signUp: (params: Record<string, string>) => Promise<unknown>;
};

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 32;

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return `密码长度需为 ${PASSWORD_MIN}–${PASSWORD_MAX} 位`;
  }
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "密码需同时包含字母和数字";
  }
  return null;
}

function getAuth() {
  return getBrowserApp().auth({ persistence: "local" });
}

function getV1PhoneAuth(): V1PhoneAuth {
  return getAuth() as unknown as V1PhoneAuth;
}

function requirePhone(phoneInput: string): string {
  const phone = normalizeChinaPhone(phoneInput);
  if (!phone) {
    throw new Error("请输入有效的中国大陆手机号（11 位，以 1 开头）");
  }
  return phone;
}

function getPhoneDigits(phoneInput: string): string {
  return requirePhone(phoneInput).replace(/^\+86/, "");
}

function formatPhoneForAuth(digits: string): string {
  return `+86 ${digits}`;
}

async function runAuthCall<T>(
  promise: Promise<T>,
  fallback: string,
): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    throw new Error(extractAuthErrorMessage(err, fallback));
  }
}

async function persistSessionFromAuth(): Promise<void> {
  const auth = getAuth();
  const tokenResult = await auth.getAccessToken();
  const accessToken =
    tokenResult?.accessToken ??
    (tokenResult as { access_token?: string } | null)?.access_token;

  if (!accessToken) {
    throw new Error("登录成功但未获取到凭证，请重试");
  }

  await setSessionCookie(accessToken);
}

export async function sendPhoneLoginCode(
  phoneInput: string,
): Promise<PhoneOtpSession> {
  const phone = requirePhone(phoneInput);

  const auth = getAuth();
  const result = await withAuthTimeout(
    auth.signInWithOtp({
      phone,
      options: { shouldCreateUser: false },
    }) as Promise<{
      data?: PhoneOtpSession;
      error?: { message?: string } | null;
    }>,
  );

  if (result.error) {
    throw new Error(result.error.message ?? "发送验证码失败");
  }

  if (!result.data?.verifyOtp) {
    throw new Error("发送验证码失败，请稍后再试");
  }

  return result.data;
}

export async function verifyPhoneLoginCode(
  otpSession: PhoneOtpSession,
  code: string,
): Promise<void> {
  const trimmed = code.trim();
  if (!trimmed) {
    throw new Error("请输入短信验证码");
  }

  const result = await withAuthTimeout(otpSession.verifyOtp({ token: trimmed }));

  const error = (result as { error?: { message?: string } | null }).error;
  if (error) {
    throw new Error(error.message ?? "验证码错误或已过期");
  }

  await persistSessionFromAuth();
}

export async function sendPhoneSignupCode(
  phoneInput: string,
  password: string,
): Promise<SignupVerificationSession> {
  const passwordError = validatePassword(password);
  if (passwordError) {
    throw new Error(passwordError);
  }

  const digits = getPhoneDigits(phoneInput);
  const auth = getV1PhoneAuth();
  const verification = await runAuthCall(
    withAuthTimeout(
      auth.getVerification({ phone_number: formatPhoneForAuth(digits) }),
    ),
    "发送验证码失败，请稍后再试",
  );

  if (!verification.verification_id) {
    throw new Error("发送验证码失败，请稍后再试");
  }

  return {
    verificationId: verification.verification_id,
    isUser: Boolean(verification.is_user),
  };
}

export async function verifyPhoneSignupCode(
  session: SignupVerificationSession,
  phoneInput: string,
  code: string,
  password: string,
): Promise<void> {
  const passwordError = validatePassword(password);
  if (passwordError) {
    throw new Error(passwordError);
  }

  const trimmed = code.trim();
  if (!trimmed) {
    throw new Error("请输入短信验证码");
  }

  const digits = getPhoneDigits(phoneInput);
  const formattedPhone = formatPhoneForAuth(digits);
  const auth = getV1PhoneAuth();

  const verified = await runAuthCall(
    withAuthTimeout(
      auth.verify({
        verification_id: session.verificationId,
        verification_code: trimmed,
      }),
    ),
    "验证码校验失败，请重新获取后再试",
  );

  if (!verified.verification_token) {
    throw new Error("验证码校验失败，请重新获取后再试");
  }

  if (session.isUser) {
    await runAuthCall(
      withAuthTimeout(
        auth.forceResetPwdByPhoneCode({
          phoneNumber: digits,
          phoneCode: verified.verification_token,
          password,
        }),
      ),
      "设置密码失败，请稍后再试",
    );
  } else {
    await runAuthCall(
      withAuthTimeout(
        auth.signUp({
          phone_number: formattedPhone,
          password,
          verification_code: trimmed,
          verification_token: verified.verification_token,
        }),
      ),
      "注册失败，请稍后再试",
    );
  }

  await persistSessionFromAuth();
}

export async function signInWithPhonePassword(
  phoneInput: string,
  password: string,
): Promise<void> {
  if (!password) {
    throw new Error("请输入密码");
  }

  const phone = requirePhone(phoneInput);
  const auth = getAuth();

  const result = await withAuthTimeout(
    auth.signInWithPassword({ phone, password }) as Promise<{
      data?: unknown;
      error?: { message?: string; code?: string } | null;
    }>,
  );

  if (result.error) {
    throw new Error(
      result.error.message ?? result.error.code ?? "登录失败，请稍后再试",
    );
  }

  await persistSessionFromAuth();
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { getCloudBaseConfigError } from "@/lib/cloudbase/config";
import {
  sendPhoneSignupCode,
  validatePassword,
  verifyPhoneSignupCode,
  type PhoneOtpSession,
  type SignupVerificationSession,
} from "@/lib/cloudbase/phone-sms";
import { extractAuthErrorMessage, getAuthErrorMessage } from "@/lib/auth-errors";

export default function SignupPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [otpSession, setOtpSession] = useState<SignupVerificationSession | null>(
    null,
  );
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  function validateSignupForm(): string | null {
    const configError = getCloudBaseConfigError();
    if (configError) return configError;

    if (!phone.trim()) return "请输入手机号";

    const passwordError = validatePassword(password);
    if (passwordError) return passwordError;

    if (password !== confirmPassword) return "两次输入的密码不一致";

    return null;
  }

  async function handleSendCode() {
    setError(null);

    const validationError = validateSignupForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const session = await sendPhoneSignupCode(phone, password);
      setOtpSession(session);
      setCodeSent(true);
      setCountdown(60);
    } catch (err) {
      const message = extractAuthErrorMessage(
        err,
        "发送验证码失败，请稍后再试",
      );
      setError(getAuthErrorMessage(message));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const validationError = validateSignupForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!codeSent || !otpSession) {
      await handleSendCode();
      return;
    }

    if (!code.trim()) {
      setError("请输入短信验证码");
      return;
    }

    setLoading(true);
    try {
      await verifyPhoneSignupCode(otpSession, phone, code, password);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const message = extractAuthErrorMessage(err, "注册失败，请稍后再试");
      setError(getAuthErrorMessage(message));
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              注册
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              填写手机号、设置密码并完成短信验证
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {codeSent && otpSession?.isUser && (
              <div
                role="status"
                className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
              >
                该手机号已注册。验证后将为此账户设置登录密码，之后可用密码或验证码登录。
              </div>
            )}

            {codeSent && (
              <div
                role="status"
                className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
              >
                验证码已发送至 <strong>{phone}</strong>，请查收短信。
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="phone"
                className="mb-1.5 block text-sm font-medium text-zinc-700"
              >
                手机号
              </label>
              <div className="flex gap-2">
                <span className="inline-flex items-center rounded-lg border border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-600">
                  +86
                </span>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  required
                  pattern="1[3-9]\d{9}"
                  maxLength={11}
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))
                  }
                  placeholder="13800000000"
                  className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-zinc-700"
              >
                密码
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={32}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8–32 位，含字母和数字"
                className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-medium text-zinc-700"
              >
                确认密码
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={32}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入密码"
                className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
              />
            </div>

            <div>
              <label
                htmlFor="code"
                className="mb-1.5 block text-sm font-medium text-zinc-700"
              >
                短信验证码
              </label>
              <div className="flex gap-2">
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required={codeSent}
                  maxLength={6}
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="6 位验证码"
                  className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                />
                <button
                  type="button"
                  disabled={loading || countdown > 0}
                  onClick={handleSendCode}
                  className="shrink-0 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {countdown > 0 ? `${countdown}s` : codeSent ? "重发" : "获取验证码"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? codeSent
                  ? "注册中…"
                  : "发送中…"
                : codeSent
                  ? "注册"
                  : "获取验证码并继续"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            已有账户？{" "}
            <Link
              href="/auth/login"
              className="font-medium text-zinc-900 hover:underline"
            >
              去登录
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-zinc-400">
            请确保 CloudBase 控制台已开启「短信验证码登录」与「用户名密码登录」
          </p>
        </div>
      </div>
    </div>
  );
}

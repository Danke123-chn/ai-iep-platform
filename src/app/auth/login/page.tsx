"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { getCloudBaseConfigError } from "@/lib/cloudbase/config";
import {
  sendPhoneLoginCode,
  signInWithPhonePassword,
  verifyPhoneLoginCode,
  type PhoneOtpSession,
} from "@/lib/cloudbase/phone-sms";
import { extractAuthErrorMessage, getAuthErrorMessage } from "@/lib/auth-errors";

type LoginMode = "password" | "sms";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  const [mode, setMode] = useState<LoginMode>("password");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [otpSession, setOtpSession] = useState<PhoneOtpSession | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (searchParams.get("reason") === "session_expired") {
      setError("登录已过期，请重新登录。");
    }
  }, [searchParams]);

  function resetSmsState() {
    setCode("");
    setOtpSession(null);
    setCodeSent(false);
    setCountdown(0);
  }

  function switchMode(next: LoginMode) {
    setMode(next);
    setError(null);
    resetSmsState();
    setPassword("");
  }

  async function handleSendCode() {
    setError(null);

    const configError = getCloudBaseConfigError();
    if (configError) {
      setError(configError);
      return;
    }

    setLoading(true);
    try {
      const session = await sendPhoneLoginCode(phone);
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

    const configError = getCloudBaseConfigError();
    if (configError) {
      setError(configError);
      return;
    }

    if (mode === "password") {
      setLoading(true);
      try {
        await signInWithPhonePassword(phone, password);
        router.push(redirectTo);
        router.refresh();
      } catch (err) {
        const message = extractAuthErrorMessage(err, "登录失败，请稍后再试");
        setError(getAuthErrorMessage(message));
        setLoading(false);
      }
      return;
    }

    if (!codeSent || !otpSession) {
      await handleSendCode();
      return;
    }

    setLoading(true);
    try {
      await verifyPhoneLoginCode(otpSession, code);
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      const message = extractAuthErrorMessage(err, "登录失败，请稍后再试");
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
              登录
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              使用手机号和密码，或短信验证码登录
            </p>
          </div>

          <div className="mb-6 flex rounded-lg border border-zinc-200 bg-zinc-50 p-1">
            <button
              type="button"
              onClick={() => switchMode("password")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                mode === "password"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              密码登录
            </button>
            <button
              type="button"
              onClick={() => switchMode("sms")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                mode === "sms"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              验证码登录
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "sms" && codeSent && (
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

            {mode === "password" ? (
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
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
                />
              </div>
            ) : (
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
                    {countdown > 0
                      ? `${countdown}s`
                      : codeSent
                        ? "重发"
                        : "获取验证码"}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "登录中…"
                : mode === "password"
                  ? "登录"
                  : codeSent
                    ? "登录"
                    : "获取验证码"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            还没有账户？{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-zinc-900 hover:underline"
            >
              去注册
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-zinc-400">
            验证码登录仅限已注册手机号；新用户请先注册
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50">
          <p className="text-sm text-zinc-500">加载中…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

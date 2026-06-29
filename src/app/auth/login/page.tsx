"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import {
  clearAuthHashFromUrl,
  getSupabaseUrlError,
} from "@/lib/auth-url-errors";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const callbackError = searchParams.get("error");
  const resetSuccess = searchParams.get("message") === "password_reset_success";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    callbackError === "auth_callback_error"
      ? "验证链接无效或已过期，请重新尝试。"
      : null,
  );
  const [success, setSuccess] = useState(
    resetSuccess || searchParams.get("message") === "email_confirmed",
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const hashError = getSupabaseUrlError(
      window.location.search,
      window.location.hash,
    );
    if (hashError) {
      setError(hashError);
      setSuccess(false);
      clearAuthHashFromUrl();
    }
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(getAuthErrorMessage(signInError.message));
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
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
              使用邮箱和密码登录您的账户
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {success && (
              <div
                role="status"
                className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
              >
                {resetSuccess
                  ? "密码已更新，请使用新密码登录。"
                  : "邮箱已验证成功，请登录。"}
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
                {(error.includes("过期") || error.includes("无效")) && (
                  <Link
                    href="/auth/forgot-password"
                    className="mt-2 block font-medium underline"
                  >
                    重新申请重置密码
                  </Link>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-zinc-700"
              >
                邮箱
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-zinc-700"
                >
                  密码
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:underline"
                >
                  忘记密码？
                </Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 位字符"
                className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "登录中…" : "登录"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            还没有账户？{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-zinc-900 hover:underline"
            >
              立即注册
            </Link>
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

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import {
  clearAuthHashFromUrl,
  getSupabaseUrlError,
} from "@/lib/auth-url-errors";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const urlError = getSupabaseUrlError(
      window.location.search,
      window.location.hash,
    );
    if (urlError) {
      setError(urlError);
      setHasSession(false);
      setCheckingSession(false);
      clearAuthHashFromUrl();
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session?.user) {
        setHasSession(true);
        setCheckingSession(false);
        setError(null);
      }
    });

    async function initAuth() {
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        window.history.replaceState(null, "", "/auth/reset-password");

        if (exchangeError) {
          setError(getAuthErrorMessage(exchangeError.message));
          setHasSession(false);
          setCheckingSession(false);
          return;
        }

        setHasSession(true);
        setCheckingSession(false);
        return;
      }

      if (token_hash && type) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          type: type as EmailOtpType,
          token_hash,
        });

        window.history.replaceState(null, "", "/auth/reset-password");

        if (verifyError) {
          setError(getAuthErrorMessage(verifyError.message));
          setHasSession(false);
          setCheckingSession(false);
          return;
        }

        setHasSession(true);
        setCheckingSession(false);
        return;
      }

      // 等待浏览器客户端处理 hash 中的 access_token
      await new Promise((resolve) => setTimeout(resolve, 100));

      const {
        data: { user },
      } = await supabase.auth.getUser();
      setHasSession(!!user);
      setCheckingSession(false);
    }

    initAuth();

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (password.length < 6) {
      setError("密码至少需要 6 位字符");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(getAuthErrorMessage(updateError.message));
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    router.push("/auth/login?message=password_reset_success");
    router.refresh();
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500">验证链接中…</p>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              链接无效或已过期
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              {error ??
                "请重新申请重置密码邮件，并尽快点击最新一封邮件中的链接。"}
            </p>
            <p className="mt-3 text-xs text-zinc-400">
              提示：每封邮件链接只能使用一次；邮箱客户端可能会预加载链接导致失效。
            </p>
            <Link
              href="/auth/forgot-password"
              className="mt-6 inline-block rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              重新发送重置邮件
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              设置新密码
            </h1>
            <p className="mt-2 text-sm text-zinc-500">请输入您的新密码</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-zinc-700"
              >
                新密码
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 位字符"
                className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-medium text-zinc-700"
              >
                确认新密码
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="再次输入新密码"
                className="w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "保存中…" : "更新密码"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

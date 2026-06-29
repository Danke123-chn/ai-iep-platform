"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { getAuthErrorMessage } from "@/lib/auth-errors";
import {
  clearAuthHashFromUrl,
  getSupabaseUrlError,
} from "@/lib/auth-url-errors";

export default function ConfirmPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "SIGNED_IN" && session?.user) {
        setStatus("success");
        router.push("/dashboard");
        router.refresh();
      }
    });

    async function confirmEmail() {
      const urlError = getSupabaseUrlError(
        window.location.search,
        window.location.hash,
      );
      if (urlError) {
        setError(urlError);
        setStatus("error");
        clearAuthHashFromUrl();
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        window.history.replaceState(null, "", "/auth/confirm");

        if (cancelled) return;

        if (exchangeError) {
          setError(getAuthErrorMessage(exchangeError.message));
          setStatus("error");
          return;
        }

        setStatus("success");
        router.push("/dashboard");
        router.refresh();
        return;
      }

      if (token_hash && type) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          type: type as EmailOtpType,
          token_hash,
        });
        window.history.replaceState(null, "", "/auth/confirm");

        if (cancelled) return;

        if (verifyError) {
          setError(getAuthErrorMessage(verifyError.message));
          setStatus("error");
          return;
        }

        setStatus("success");
        router.push("/dashboard");
        router.refresh();
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 150));

      if (cancelled) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email_confirmed_at) {
        setStatus("success");
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setError("验证链接无效或缺少参数。请重新注册或使用最新验证邮件。");
      setStatus("error");
    }

    confirmEmail();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500">正在验证邮箱…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500">验证成功，正在跳转…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            邮箱验证失败
          </h1>
          <p className="mt-2 text-sm text-zinc-500">{error}</p>
          <p className="mt-3 text-xs text-zinc-400">
            提示：验证链接只能使用一次，请使用最新邮件中的链接。
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/auth/signup"
              className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              重新注册
            </Link>
            <Link
              href="/auth/login"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:underline"
            >
              返回登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

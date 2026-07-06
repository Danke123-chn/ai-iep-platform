"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          邮箱验证
        </h1>
        <p className="mt-4 text-sm text-zinc-600">
          CloudBase 使用邮箱验证码完成注册，不再使用 Supabase 式邮件链接验证。
          {message === "use_password_login"
            ? " 请返回登录页，使用邮箱和密码登录。"
            : " 若已完成验证码注册，请直接登录。"}
        </p>
        <Link
          href="/auth/login"
          className="mt-6 block w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          前往登录
        </Link>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50">
          <p className="text-sm text-zinc-500">加载中…</p>
        </div>
      }
    >
      <ConfirmContent />
    </Suspense>
  );
}

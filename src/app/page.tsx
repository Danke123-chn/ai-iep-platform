import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-4 py-16">
      <main className="w-full max-w-lg text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-zinc-500">
          AI IEP Platform
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          智能个别化教育计划平台
        </h1>
        <p className="mt-4 text-base leading-7 text-zinc-600">
          为特教工作者提供 IEP 制定、跟踪与管理工具。登录或注册以进入控制台。
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/auth/login"
            className="rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            登录
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-lg border border-zinc-300 bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            注册
          </Link>
        </div>

        <p className="mt-8 text-sm text-zinc-500">
          已有账户？{" "}
          <Link
            href="/dashboard"
            className="font-medium text-zinc-900 hover:underline"
          >
            进入控制台
          </Link>
        </p>
      </main>
    </div>
  );
}

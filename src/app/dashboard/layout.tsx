import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { ToastProvider } from "@/components/ui/toast";
import { requireDashboardSession } from "@/lib/auth/guard-dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireDashboardSession();
  return (
    <div className="min-h-full bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-lg font-semibold text-zinc-100"
            >
              AI IEP Platform
            </Link>
            <nav className="hidden items-center gap-4 sm:flex">
              <Link
                href="/dashboard"
                className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
              >
                控制台
              </Link>
              <Link
                href="/dashboard/students"
                className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
              >
                学生档案
              </Link>
              <Link
                href="/dashboard/assessments"
                className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
              >
                评估报告
              </Link>
              <Link
                href="/dashboard/iep"
                className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
              >
                IEP 列表
              </Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <ToastProvider>{children}</ToastProvider>
      </main>
    </div>
  );
}

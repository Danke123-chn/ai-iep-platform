import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true });

  const studentCount = count ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-zinc-100">控制台</h1>
      <p className="mt-2 text-zinc-400">
        欢迎回来{user?.email ? `，${user.email}` : ""}。
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-500">学生总数</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-100">
            {studentCount}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-zinc-200">快捷入口</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Link
            href="/dashboard/students"
            className="group rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-zinc-700"
          >
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg bg-zinc-800 text-xl transition-colors group-hover:bg-zinc-700">
                👥
              </div>
              <div>
                <h3 className="font-medium text-zinc-100">我的学生</h3>
                <p className="mt-0.5 text-sm text-zinc-500">
                  查看和管理学生档案
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

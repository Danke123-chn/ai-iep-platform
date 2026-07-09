import Link from "next/link";
import { GettingStartedSelector } from "@/components/assessments/getting-started-selector";
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
      <div className="mb-10">
        <h1 className="text-2xl font-semibold text-zinc-100">开始评估</h1>
        <p className="mt-2 max-w-2xl text-zinc-400">
          欢迎{user?.email ? `，${user.email}` : ""}。您可以通过上传已有评估报告，或使用在线标准化量表完成评估，进而为学生建立档案并生成 IEP。
        </p>
      </div>

      <GettingStartedSelector />

      {studentCount > 0 && (
        <div className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-zinc-200">
                已有 {studentCount} 名学生档案
              </p>
              <p className="mt-1 text-sm text-zinc-500">
                可为已有学生继续评估，或查看历史报告与 IEP
              </p>
            </div>
            <Link
              href="/dashboard/students"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
            >
              查看学生档案 →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

import Link from "next/link";

type PlaceholderProps = {
  params: Promise<{ id: string; sessionId: string }>;
  toolName: string;
};

export async function AssessmentFormPlaceholder({
  params,
  toolName,
}: PlaceholderProps) {
  const { id, sessionId } = await params;

  return (
    <div className="mx-auto max-w-2xl text-center">
      <h1 className="text-2xl font-semibold text-zinc-100">{toolName} 评估表单</h1>
      <p className="mt-2 text-sm text-zinc-400">
        会话 ID：{sessionId.slice(0, 8)}…
      </p>
      <p className="mt-6 text-zinc-300">
        评估录入表单将在下一步实现（Prompt 2 / 3）。
      </p>
      <Link
        href={`/dashboard/students/${id}/assessments/new`}
        className="mt-8 inline-block rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
      >
        返回选择评估工具
      </Link>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DeleteAssessmentDialog } from "@/components/assessments/delete-assessment-dialog";
import type { InProgressSessionSummary } from "@/lib/assessments/assessment-session-utils";
import { getAssessmentFormPath } from "@/lib/assessments/assessment-session-utils";
import { createClient } from "@/lib/supabase/client";
import { getDbErrorMessage } from "@/lib/supabase/db-errors";
import {
  ASSESSMENT_TOOLS,
} from "@/lib/types/assessment_types";

type InProgressSessionsProps = {
  studentId: string;
  initialSessions: InProgressSessionSummary[];
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InProgressSessions({
  studentId,
  initialSessions,
}: InProgressSessionsProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState(initialSessions);
  const [deletingSession, setDeletingSession] =
    useState<InProgressSessionSummary | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleConfirmDelete() {
    if (!deletingSession) return;

    setDeleteLoading(true);
    setDeleteError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("assessment_sessions")
      .delete()
      .eq("id", deletingSession.id);

    if (error) {
      setDeleteError(getDbErrorMessage(error.message));
      setDeleteLoading(false);
      return;
    }

    setSessions((prev) => prev.filter((s) => s.id !== deletingSession.id));
    setDeletingSession(null);
    setDeleteLoading(false);
    router.refresh();
  }

  if (sessions.length === 0) return null;

  const deletingTool = deletingSession
    ? ASSESSMENT_TOOLS.find((t) => t.value === deletingSession.tool_type)
    : null;

  return (
    <>
      <div className="mb-8 rounded-xl border border-amber-900/40 bg-amber-950/20 p-6">
        <h2 className="text-sm font-medium text-amber-200">进行中的评估</h2>
        <p className="mt-1 text-xs text-amber-200/70">
          以下评估已保存进度，可继续填写或删除
        </p>

        {deleteError && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400"
          >
            删除失败：{deleteError}
          </div>
        )}

        <ul className="mt-4 space-y-3">
          {sessions.map((session) => {
            const tool = ASSESSMENT_TOOLS.find(
              (t) => t.value === session.tool_type,
            );
            const href = getAssessmentFormPath(
              studentId,
              session.id,
              session.tool_type,
            );

            return (
              <li
                key={session.id}
                className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900/80 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-zinc-100">
                    {tool?.label ?? session.tool_type}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    已评 {session.scoredCount} 项 · 最近保存{" "}
                    {formatDate(session.updated_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={href}
                    className="inline-flex flex-1 justify-center rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:flex-none"
                    style={{ backgroundColor: tool?.color ?? "#534AB7" }}
                  >
                    继续评估
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(null);
                      setDeletingSession(session);
                    }}
                    className="inline-flex flex-1 justify-center rounded-lg border border-red-900/50 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-950/50 sm:flex-none"
                  >
                    删除
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <DeleteAssessmentDialog
        toolLabel={deletingTool?.label ?? "评估"}
        open={deletingSession !== null}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => !deleteLoading && setDeletingSession(null)}
      />
    </>
  );
}

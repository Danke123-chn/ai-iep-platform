"use client";

import Link from "next/link";

type AssessmentFormActionsProps = {
  backHref: string;
  backLabel?: string;
  accentColor: string;
  showComplete: boolean;
  saving: boolean;
  completing: boolean;
  onSave: () => void;
  onSaveAndLeave: () => void;
  onComplete: () => void;
};

export function AssessmentFormActions({
  backHref,
  backLabel = "返回",
  accentColor,
  showComplete,
  saving,
  completing,
  onSave,
  onSaveAndLeave,
  onComplete,
}: AssessmentFormActionsProps) {
  const busy = saving || completing;

  return (
    <div className="mt-8 flex flex-col gap-3 border-t border-zinc-800 pt-6">
      <p className="text-xs text-zinc-500">
        评分会自动保存；也可点击下方按钮一次性保存全部进度，稍后继续评估。
      </p>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={backHref}
          className="inline-flex justify-center rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800"
        >
          {backLabel}
        </Link>
        {showComplete && (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onSave}
              disabled={busy}
              className="inline-flex justify-center rounded-lg border border-zinc-600 px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "保存中…" : "保存进度"}
            </button>
            <button
              type="button"
              onClick={onSaveAndLeave}
              disabled={busy}
              className="inline-flex justify-center rounded-lg border border-zinc-600 px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "保存中…" : "保存并离开"}
            </button>
            <button
              type="button"
              onClick={onComplete}
              disabled={busy}
              className="inline-flex justify-center rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: accentColor }}
            >
              {completing ? "提交中…" : "完成评估"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

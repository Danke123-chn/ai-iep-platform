"use client";

type DeleteAssessmentDialogProps = {
  toolLabel: string;
  open: boolean;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function DeleteAssessmentDialog({
  toolLabel,
  open,
  loading,
  onConfirm,
  onCancel,
}: DeleteAssessmentDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
        aria-hidden
      />
      <div
        role="alertdialog"
        aria-labelledby="delete-assessment-title"
        aria-describedby="delete-assessment-desc"
        className="relative w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl"
      >
        <h2
          id="delete-assessment-title"
          className="text-lg font-semibold text-zinc-100"
        >
          确认删除
        </h2>
        <p id="delete-assessment-desc" className="mt-2 text-sm text-zinc-400">
          确定要删除进行中的「{toolLabel}」评估吗？已保存的评分数据将被清除，此操作无法撤销。
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "删除中…" : "确认删除"}
          </button>
        </div>
      </div>
    </div>
  );
}

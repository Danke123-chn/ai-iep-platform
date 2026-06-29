"use client";

type RegenerateIepDialogProps = {
  open: boolean;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function RegenerateIepDialog({
  open,
  loading,
  onConfirm,
  onCancel,
}: RegenerateIepDialogProps) {
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
        aria-labelledby="regenerate-iep-title"
        aria-describedby="regenerate-iep-desc"
        className="relative w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl"
      >
        <h2
          id="regenerate-iep-title"
          className="text-lg font-semibold text-zinc-100"
        >
          再次生成 IEP
        </h2>
        <p id="regenerate-iep-desc" className="mt-2 text-sm text-zinc-400">
          将基于当前保存的评估数据重新调用 AI 生成 IEP 目标。原有的目标内容及已记录的进度标记将被替换，此操作无法撤销。
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
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "生成中…" : "确认再次生成"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RegenerateLoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <div className="flex justify-center">
          <div className="size-10 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-400" />
        </div>
        <p className="mt-6 text-center text-sm font-medium text-zinc-200">
          AI 正在重新生成 IEP，预计需要 1-3 分钟…
        </p>
        <p className="mt-2 text-center text-xs text-zinc-500">
          请勿关闭页面
        </p>
      </div>
    </div>
  );
}

export { RegenerateLoadingOverlay };

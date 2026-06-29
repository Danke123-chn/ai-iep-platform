"use client";

import { useEffect, useState } from "react";
import {
  GOAL_PROGRESS_LABELS,
  type GoalProgressStatus,
  type ShortTermGoal,
} from "@/types/iep";
import { getProgressStatusColor, todayDateString } from "@/lib/iep-progress";

type ProgressUpdateModalProps = {
  open: boolean;
  goalContent: string;
  initialGoal: ShortTermGoal;
  onClose: () => void;
  onSave: (data: {
    progress: GoalProgressStatus;
    progress_notes: string;
    progress_updated_at: string;
  }) => Promise<void>;
};

const PROGRESS_OPTIONS: GoalProgressStatus[] = ["P", "C", "D", "S", "E"];

export function ProgressUpdateModal({
  open,
  goalContent,
  initialGoal,
  onClose,
  onSave,
}: ProgressUpdateModalProps) {
  const [progress, setProgress] = useState<GoalProgressStatus>("P");
  const [notes, setNotes] = useState("");
  const [updatedAt, setUpdatedAt] = useState(todayDateString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setProgress(initialGoal.progress ?? initialGoal.status ?? "P");
      setNotes(initialGoal.progress_notes ?? "");
      setUpdatedAt(initialGoal.progress_updated_at ?? todayDateString());
      setError(null);
    }
  }, [open, initialGoal]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSave({
        progress,
        progress_notes: notes,
        progress_updated_at: updatedAt,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="关闭"
        className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-zinc-100">更新进度</h2>
        <p className="mt-2 line-clamp-2 text-sm text-zinc-400">{goalContent}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {error && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-medium text-zinc-300">进度状态</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {PROGRESS_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setProgress(option)}
                  className={`rounded-lg border px-2 py-2 text-center text-xs transition-colors ${
                    progress === option
                      ? getProgressStatusColor(option)
                      : "border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  <span className="block font-bold">{option}</span>
                  <span className="mt-0.5 block">{GOAL_PROGRESS_LABELS[option]}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="progress-notes"
              className="mb-1.5 block text-sm font-medium text-zinc-300"
            >
              进度备注
            </label>
            <textarea
              id="progress-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="记录本次进度更新的具体情况…"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-500"
            />
          </div>

          <div>
            <label
              htmlFor="progress-date"
              className="mb-1.5 block text-sm font-medium text-zinc-300"
            >
              更新日期
            </label>
            <input
              id="progress-date"
              type="date"
              required
              value={updatedAt}
              onChange={(e) => setUpdatedAt(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {loading ? "保存中…" : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

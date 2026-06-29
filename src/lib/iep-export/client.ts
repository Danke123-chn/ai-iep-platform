"use client";

export type { IepExportData } from "@/lib/iep-export/types";
export { buildTeachingSuggestions } from "@/lib/iep-export/teaching-suggestions";
export { exportIepToPdf, downloadExportFile } from "@/lib/iep-export/pdf-client";

import type { IepStatus } from "@/types/iep";

export function getIepStatusColor(status: IepStatus): string {
  const colors = {
    draft: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
    in_progress: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    completed: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  };
  return colors[status];
}

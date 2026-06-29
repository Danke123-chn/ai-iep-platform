import type {
  GoalProgressStatus,
  IepGoalRecord,
  ProgressStats,
  ShortTermGoal,
} from "@/types/iep";

export function getShortTermGoalProgress(
  goal: ShortTermGoal,
): GoalProgressStatus | null {
  if (goal.progress) return goal.progress;
  if (goal.status) return goal.status;
  return null;
}

export function computeProgressStats(goals: IepGoalRecord[]): ProgressStats {
  const stats: ProgressStats = {
    total: 0,
    P: 0,
    C: 0,
    D: 0,
    S: 0,
    E: 0,
    unset: 0,
  };

  for (const goal of goals) {
    for (const stg of goal.short_term_goals) {
      stats.total += 1;
      const progress = getShortTermGoalProgress(stg);
      if (!progress) {
        stats.unset += 1;
      } else {
        stats[progress] += 1;
      }
    }
  }

  return stats;
}

export function getProgressStatusColor(status: GoalProgressStatus): string {
  const colors: Record<GoalProgressStatus, string> = {
    P: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    C: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    D: "bg-red-500/15 text-red-300 border-red-500/30",
    S: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    E: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  };
  return colors[status];
}

export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { AssessmentFormActions } from "@/components/assessments/assessment-form-actions";
import { AssessmentPlanPeriodFields } from "@/components/assessments/plan-period-fields";
import { ScoreButtonRow } from "@/components/assessments/score-button-row";
import { VbMappMilestoneSection } from "@/components/assessments/vb-mapp-milestone-section";
import { VbMappStatsPanel } from "@/components/assessments/vb-mapp-stats-panel";
import type { VbMappAssessmentData } from "@/lib/assessments/load-vb-mapp-data";
import { fillVbMappUntestedScores } from "@/lib/assessments/fill-untested-scores";
import { saveVbMappProgress } from "@/lib/assessments/save-assessment-progress";
import type { VbMappTab } from "@/lib/assessments/vb-mapp-stats";
import { createClient } from "@/lib/supabase/client";
import { getDbErrorMessage } from "@/lib/supabase/db-errors";
import {
  VB_MAPP_BARRIER_SCORE_OPTIONS,
  type BarrierScore,
  type MilestoneScore,
  type TransitionScore,
} from "@/lib/types/assessment_types";

const TABS: { id: VbMappTab; label: string }[] = [
  { id: "milestones", label: "里程碑评估" },
  { id: "barriers", label: "障碍评估" },
  { id: "transitions", label: "过渡评估" },
];

function splitAssessmentLabel(text: string): { title: string; body?: string } {
  const idx = text.indexOf("——");
  if (idx === -1) return { title: text };
  return { title: text.slice(0, idx), body: text.slice(idx + 2) };
}

type VbMappFormProps = VbMappAssessmentData;

export function VbMappForm({
  session,
  student,
  milestones,
  barriers,
  transitions,
  milestoneScores: initialMs,
  milestoneNotes: initialMsNotes,
  barrierScores: initialBr,
  barrierNotes: initialBrNotes,
  transitionScores: initialTr,
  transitionNotes: initialTrNotes,
}: VbMappFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<VbMappTab>("milestones");
  const [milestoneScores, setMilestoneScores] = useState(initialMs);
  const [milestoneNotes, setMilestoneNotes] = useState(initialMsNotes);
  const [barrierScores, setBarrierScores] = useState(initialBr);
  const [barrierNotes, setBarrierNotes] = useState(initialBrNotes);
  const [transitionScores, setTransitionScores] = useState(initialTr);
  const [transitionNotes, setTransitionNotes] = useState(initialTrNotes);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  const showSaved = useCallback(() => {
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }, []);

  async function saveMilestoneScore(id: string, score: MilestoneScore) {
    setMilestoneScores((prev) => ({ ...prev, [id]: score }));
    setSavingId(id);
    setSaveStatus("saving");
    setSaveError(null);

    const supabase = createClient();
    const { error } = await supabase.from("vb_mapp_milestone_scores").upsert(
      {
        session_id: session.id,
        milestone_id: id,
        score,
        notes: milestoneNotes[id] ?? null,
      },
      { onConflict: "session_id,milestone_id" },
    );

    setSavingId(null);
    if (error) {
      setSaveStatus("error");
      setSaveError(getDbErrorMessage(error.message));
      return;
    }
    showSaved();
  }

  async function saveMilestoneNotes(id: string, notes: string) {
    setMilestoneNotes((prev) => ({ ...prev, [id]: notes }));
    if (milestoneScores[id] === undefined) return;

    setSaveStatus("saving");
    const supabase = createClient();
    const { error } = await supabase.from("vb_mapp_milestone_scores").upsert(
      {
        session_id: session.id,
        milestone_id: id,
        score: milestoneScores[id],
        notes: notes || null,
      },
      { onConflict: "session_id,milestone_id" },
    );

    if (error) {
      setSaveStatus("error");
      setSaveError(getDbErrorMessage(error.message));
      return;
    }
    showSaved();
  }

  async function saveBarrierScore(id: string, score: BarrierScore) {
    setBarrierScores((prev) => ({ ...prev, [id]: score }));
    setSavingId(id);
    setSaveStatus("saving");

    const supabase = createClient();
    const { error } = await supabase.from("vb_mapp_barrier_scores").upsert(
      {
        session_id: session.id,
        barrier_id: id,
        score,
        notes: barrierNotes[id] ?? null,
      },
      { onConflict: "session_id,barrier_id" },
    );

    setSavingId(null);
    if (error) {
      setSaveStatus("error");
      setSaveError(getDbErrorMessage(error.message));
      return;
    }
    showSaved();
  }

  async function saveTransitionScore(id: string, score: TransitionScore) {
    setTransitionScores((prev) => ({ ...prev, [id]: score }));
    setSavingId(id);
    setSaveStatus("saving");

    const supabase = createClient();
    const { error } = await supabase.from("vb_mapp_transition_scores").upsert(
      {
        session_id: session.id,
        transition_id: id,
        score,
        notes: transitionNotes[id] ?? null,
      },
      { onConflict: "session_id,transition_id" },
    );

    setSavingId(null);
    if (error) {
      setSaveStatus("error");
      setSaveError(getDbErrorMessage(error.message));
      return;
    }
    showSaved();
  }

  async function persistProgress(): Promise<boolean> {
    setSaveError(null);
    setSavingProgress(true);
    setSaveStatus("saving");

    const supabase = createClient();
    const error = await saveVbMappProgress(supabase, session.id, {
      milestoneScores,
      milestoneNotes,
      barrierScores,
      barrierNotes,
      transitionScores,
      transitionNotes,
    });

    setSavingProgress(false);

    if (error) {
      setSaveStatus("error");
      setSaveError(getDbErrorMessage(error));
      return false;
    }

    showSaved();
    return true;
  }

  async function handleSaveProgress() {
    await persistProgress();
  }

  async function handleSaveAndLeave() {
    const ok = await persistProgress();
    if (!ok) return;

    router.push(`/dashboard/students/${student.id}/assessments/new`);
    router.refresh();
  }

  async function handleComplete() {
    setCompleting(true);
    setSaveError(null);

    const supabase = createClient();

    const filled = await fillVbMappUntestedScores(supabase, session.id, {
      milestones,
      barriers,
      transitions,
      milestoneScores,
      barrierScores,
      transitionScores,
      milestoneNotes,
      barrierNotes,
      transitionNotes,
    });

    if (filled.error) {
      setSaveError(getDbErrorMessage(filled.error));
      setCompleting(false);
      return;
    }

    setMilestoneScores(filled.milestoneScores);
    setBarrierScores(filled.barrierScores);
    setTransitionScores(filled.transitionScores);

    const { error } = await supabase
      .from("assessment_sessions")
      .update({ status: "completed" })
      .eq("id", session.id);

    if (error) {
      setSaveError(getDbErrorMessage(error.message));
      setCompleting(false);
      return;
    }

    router.push(
      `/dashboard/students/${student.id}/assessments/${session.id}`,
    );
    router.refresh();
  }

  return (
    <div>
      <div className="sticky top-16 z-10 -mx-4 mb-6 border-b border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-zinc-100 text-zinc-900"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs">
            {session.status !== "completed" && (
              <button
                type="button"
                onClick={handleSaveAndLeave}
                disabled={savingProgress || completing}
                className="rounded-md border border-zinc-700 px-2.5 py-1 text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-50"
              >
                {savingProgress ? "保存中…" : "保存并离开"}
              </button>
            )}
            {saveStatus === "saving" && (
              <span className="text-zinc-500">保存中…</span>
            )}
            {saveStatus === "saved" && (
              <span className="text-emerald-400">已保存</span>
            )}
            {saveStatus === "error" && saveError && (
              <span className="text-red-400">{saveError}</span>
            )}
            {session.status === "completed" && (
              <span className="rounded-full bg-emerald-950/50 px-2 py-0.5 text-emerald-400">
                已完成
              </span>
            )}
          </div>
        </div>
      </div>

      <AssessmentPlanPeriodFields session={session} className="mb-6" />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          {activeTab === "milestones" && (
            <VbMappMilestoneSection
              milestones={milestones}
              scores={milestoneScores}
              notes={milestoneNotes}
              onScore={saveMilestoneScore}
              onNotes={saveMilestoneNotes}
              savingId={savingId}
            />
          )}

          {activeTab === "barriers" && (
            <div className="space-y-3">
              {barriers.length === 0 ? (
                <p className="text-center text-sm text-zinc-500">
                  未加载障碍定义数据
                </p>
              ) : (
                barriers.map((item, index) => {
                  const { title, body } = splitAssessmentLabel(item.barrier_name_zh);
                  return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-zinc-500">
                          {index + 1}. {item.category}
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-zinc-200">
                          {title}
                        </p>
                        {body ? (
                          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                            {body}
                          </p>
                        ) : null}
                      </div>
                      <ScoreButtonRow
                        options={VB_MAPP_BARRIER_SCORE_OPTIONS}
                        value={barrierScores[item.id] as BarrierScore | undefined}
                        onChange={(v) => saveBarrierScore(item.id, v as BarrierScore)}
                        disabled={savingId === item.id}
                      />
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "transitions" && (
            <div className="space-y-3">
              {transitions.length === 0 ? (
                <p className="text-center text-sm text-zinc-500">
                  未加载过渡定义数据
                </p>
              ) : (
                transitions.map((item, index) => {
                  const { title, body } = splitAssessmentLabel(item.transition_name_zh);
                  return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-zinc-500">
                          {index + 1}. {item.category}
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-zinc-200">
                          {title}
                        </p>
                        {body ? (
                          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                            {body}
                          </p>
                        ) : null}
                      </div>
                      <ScoreButtonRow
                        options={VB_MAPP_BARRIER_SCORE_OPTIONS}
                        value={
                          transitionScores[item.id] as TransitionScore | undefined
                        }
                        onChange={(v) =>
                          saveTransitionScore(item.id, v as TransitionScore)
                        }
                        disabled={savingId === item.id}
                      />
                    </div>
                  </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <VbMappStatsPanel
          activeTab={activeTab}
          milestones={milestones}
          barriers={barriers}
          transitions={transitions}
          milestoneScores={milestoneScores}
          barrierScores={barrierScores}
          transitionScores={transitionScores}
        />
      </div>

      <AssessmentFormActions
        backHref={`/dashboard/students/${student.id}/assessments/new`}
        accentColor="#534AB7"
        showComplete={session.status !== "completed"}
        saving={savingProgress}
        completing={completing}
        onSave={handleSaveProgress}
        onSaveAndLeave={handleSaveAndLeave}
        onComplete={handleComplete}
      />
    </div>
  );
}

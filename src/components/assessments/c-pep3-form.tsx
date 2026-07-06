"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { AssessmentFormActions } from "@/components/assessments/assessment-form-actions";
import { AssessmentPlanPeriodFields } from "@/components/assessments/plan-period-fields";
import { Cpep3ItemSection } from "@/components/assessments/c-pep3-item-section";
import { Cpep3StatsPanel } from "@/components/assessments/c-pep3-stats-panel";
import type { Cpep3AssessmentData } from "@/lib/assessments/load-c-pep3-data";
import { fillCpep3UntestedScores } from "@/lib/assessments/fill-untested-scores";
import { saveCpep3Progress } from "@/lib/assessments/save-assessment-progress";
import type { Cpep3Tab } from "@/lib/assessments/c-pep3-stats";
import { createClient } from "@/lib/supabase/client";
import { getDbErrorMessage } from "@/lib/supabase/db-errors";
import {
  C_PEP3_DEV_SCORE_OPTIONS,
  C_PEP3_PAT_SCORE_OPTIONS,
  type DevScore,
  type PatScore,
} from "@/lib/types/assessment_types";

const TABS: { id: Cpep3Tab; label: string }[] = [
  { id: "developmental", label: "发展领域评估" },
  { id: "pathological", label: "病理领域评估" },
];

type Cpep3FormProps = Cpep3AssessmentData;

export function Cpep3Form({
  session,
  student,
  devItems,
  patItems,
  devScores: initialDevScores,
  devNotes: initialDevNotes,
  patScores: initialPatScores,
  patNotes: initialPatNotes,
}: Cpep3FormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Cpep3Tab>("developmental");
  const [devScores, setDevScores] = useState(initialDevScores);
  const [devNotes, setDevNotes] = useState(initialDevNotes);
  const [patScores, setPatScores] = useState(initialPatScores);
  const [patNotes, setPatNotes] = useState(initialPatNotes);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  const showSaved = useCallback(() => {
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }, []);

  async function saveDevScore(id: string, score: DevScore) {
    setDevScores((prev) => ({ ...prev, [id]: score }));
    setSavingId(id);
    setSaveStatus("saving");
    setSaveError(null);

    const supabase = createClient();
    const { error } = await supabase.from("c_pep3_developmental_scores").upsert(
      {
        session_id: session.id,
        item_id: id,
        score,
        notes: devNotes[id] ?? null,
      },
      { onConflict: "session_id,item_id" },
    );

    setSavingId(null);
    if (error) {
      setSaveStatus("error");
      setSaveError(getDbErrorMessage(error.message));
      return;
    }
    showSaved();
  }

  async function saveDevNotes(id: string, notes: string) {
    setDevNotes((prev) => ({ ...prev, [id]: notes }));
    if (!devScores[id]) return;

    setSaveStatus("saving");
    const supabase = createClient();
    const { error } = await supabase.from("c_pep3_developmental_scores").upsert(
      {
        session_id: session.id,
        item_id: id,
        score: devScores[id],
        notes: notes || null,
      },
      { onConflict: "session_id,item_id" },
    );

    if (error) {
      setSaveStatus("error");
      setSaveError(getDbErrorMessage(error.message));
      return;
    }
    showSaved();
  }

  async function savePatScore(id: string, score: PatScore) {
    setPatScores((prev) => ({ ...prev, [id]: score }));
    setSavingId(id);
    setSaveStatus("saving");
    setSaveError(null);

    const supabase = createClient();
    const { error } = await supabase.from("c_pep3_pathological_scores").upsert(
      {
        session_id: session.id,
        item_id: id,
        score,
        notes: patNotes[id] ?? null,
      },
      { onConflict: "session_id,item_id" },
    );

    setSavingId(null);
    if (error) {
      setSaveStatus("error");
      setSaveError(getDbErrorMessage(error.message));
      return;
    }
    showSaved();
  }

  async function savePatNotes(id: string, notes: string) {
    setPatNotes((prev) => ({ ...prev, [id]: notes }));
    if (!patScores[id]) return;

    setSaveStatus("saving");
    const supabase = createClient();
    const { error } = await supabase.from("c_pep3_pathological_scores").upsert(
      {
        session_id: session.id,
        item_id: id,
        score: patScores[id],
        notes: notes || null,
      },
      { onConflict: "session_id,item_id" },
    );

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
    const error = await saveCpep3Progress(supabase, session.id, {
      devScores,
      devNotes,
      patScores,
      patNotes,
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

    const filled = await fillCpep3UntestedScores(supabase, session.id, {
      devItems,
      patItems,
      devScores,
      patScores,
      devNotes,
      patNotes,
    });

    if (filled.error) {
      setSaveError(getDbErrorMessage(filled.error));
      setCompleting(false);
      return;
    }

    setDevScores(filled.devScores);
    setPatScores(filled.patScores);

    const { error } = await supabase
      .from("assessment_sessions")
      .update({ status: "completed" })
      .eq("id", session.id);

    if (error) {
      setSaveError(getDbErrorMessage(error.message));
      setCompleting(false);
      return;
    }

    router.push(`/dashboard/students/${student.id}/assessments/${session.id}`);
    router.refresh();
  }

  function devCountLabel(domainItems: { id: string }[]) {
    const passed = domainItems.filter((i) => devScores[i.id] === "P").length;
    const tested = domainItems.filter(
      (i) => devScores[i.id] && devScores[i.id] !== "NT",
    ).length;
    return tested > 0 ? `${passed}/${tested} 通过` : `${domainItems.length} 项`;
  }

  function patCountLabel(domainItems: { id: string }[]) {
    const abnormal = domainItems.filter(
      (i) => patScores[i.id] === "M" || patScores[i.id] === "S",
    ).length;
    const tested = domainItems.filter(
      (i) => patScores[i.id] && patScores[i.id] !== "NT",
    ).length;
    return tested > 0
      ? `${abnormal}/${tested} 异常`
      : `${domainItems.length} 项`;
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
          {activeTab === "developmental" && (
            <Cpep3ItemSection
              items={devItems}
              scores={devScores}
              notes={devNotes}
              scoreOptions={C_PEP3_DEV_SCORE_OPTIONS}
              emptyMessage="未加载发展领域数据。请在 Supabase 执行 011_c_pep3_schema.sql。"
              onScore={(id, score) => saveDevScore(id, score as DevScore)}
              onNotes={saveDevNotes}
              savingId={savingId}
              countLabel={devCountLabel}
            />
          )}

          {activeTab === "pathological" && (
            <Cpep3ItemSection
              items={patItems}
              scores={patScores}
              notes={patNotes}
              scoreOptions={C_PEP3_PAT_SCORE_OPTIONS}
              emptyMessage="未加载病理领域数据。请在 Supabase 执行 011_c_pep3_schema.sql。"
              onScore={(id, score) => savePatScore(id, score as PatScore)}
              onNotes={savePatNotes}
              savingId={savingId}
              countLabel={patCountLabel}
            />
          )}
        </div>

        <Cpep3StatsPanel
          activeTab={activeTab}
          devItems={devItems}
          patItems={patItems}
          devScores={devScores}
          patScores={patScores}
        />
      </div>

      <AssessmentFormActions
        backHref={`/dashboard/students/${student.id}/assessments/new`}
        accentColor="#0F6E56"
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

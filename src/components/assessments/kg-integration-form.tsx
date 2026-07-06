"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { AssessmentFormActions } from "@/components/assessments/assessment-form-actions";
import { AssessmentPlanPeriodFields } from "@/components/assessments/plan-period-fields";
import { Cpep3ItemSection } from "@/components/assessments/c-pep3-item-section";
import { KgIntegrationBehaviorSection } from "@/components/assessments/kg-integration-behavior-section";
import { KgIntegrationStatsPanel } from "@/components/assessments/kg-integration-stats-panel";
import { fillIntegrationUntestedScores } from "@/lib/assessments/fill-untested-scores";
import { getIntegrationConfig } from "@/lib/assessments/integration-assessment-config";
import type { IntegrationAssessmentData } from "@/lib/assessments/load-integration-assessment-data";
import type { KgIntegrationTab } from "@/lib/assessments/kg-integration-stats";
import { saveIntegrationProgress } from "@/lib/assessments/save-assessment-progress";
import { createClient } from "@/lib/supabase/client";
import { getDbErrorMessage } from "@/lib/supabase/db-errors";
import {
  KG_INTEGRATION_SCORE_OPTIONS,
  type KgIntegrationBehaviorRecord,
  type KgIntegrationItem,
  type KgIntegrationScore,
} from "@/lib/types/assessment_types";

const TABS: { id: KgIntegrationTab; label: string }[] = [
  { id: "activity", label: "A. 融合活动评估" },
  { id: "skill", label: "B. 融合技能评估" },
  { id: "behavior", label: "C. 问题行为评估" },
];

type IntegrationAssessmentFormProps = IntegrationAssessmentData;

function toSectionItems(items: KgIntegrationItem[]) {
  return items.map((item) => ({
    id: item.id,
    domain: item.domain,
    domain_label_zh: item.domain_label_zh,
    item_number: item.item_number,
    description: item.description
      ? `${item.skill_name}：${item.description}`
      : item.skill_name,
  }));
}

export function IntegrationAssessmentForm({
  toolType,
  session,
  student,
  activityItems,
  skillItems,
  scores: initialScores,
  notes: initialNotes,
  behaviorRecords: initialBehaviorRecords,
}: IntegrationAssessmentFormProps) {
  const config = getIntegrationConfig(toolType);
  const accent = config.accentColor;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<KgIntegrationTab>("activity");
  const [scores, setScores] = useState(initialScores);
  const [notes, setNotes] = useState(initialNotes);
  const [behaviorRecords, setBehaviorRecords] = useState(initialBehaviorRecords);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  const activitySectionItems = useMemo(
    () => toSectionItems(activityItems),
    [activityItems],
  );
  const skillSectionItems = useMemo(
    () => toSectionItems(skillItems),
    [skillItems],
  );
  const allItems = useMemo(
    () => [...activityItems, ...skillItems],
    [activityItems, skillItems],
  );

  const showSaved = useCallback(() => {
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }, []);

  async function saveScore(id: string, score: KgIntegrationScore) {
    setScores((prev) => ({ ...prev, [id]: score }));
    setSavingId(id);
    setSaveStatus("saving");
    setSaveError(null);

    const supabase = createClient();
    const { error } = await supabase.from(config.scoresTable).upsert(
      {
        session_id: session.id,
        item_id: id,
        score,
        notes: notes[id] ?? null,
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

  async function saveNotes(id: string, noteText: string) {
    setNotes((prev) => ({ ...prev, [id]: noteText }));
    if (!scores[id]) return;

    setSaveStatus("saving");
    const supabase = createClient();
    const { error } = await supabase.from(config.scoresTable).upsert(
      {
        session_id: session.id,
        item_id: id,
        score: scores[id],
        notes: noteText || null,
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

  async function saveBehaviorRecord(
    record: KgIntegrationBehaviorRecord,
  ): Promise<boolean> {
    const supabase = createClient();
    const payload = {
      session_id: session.id,
      behavior_description: record.behavior_description || null,
      occurrence_time: record.occurrence_time || null,
      frequency_intensity: record.frequency_intensity || null,
      location: record.location || null,
      duration: record.duration || null,
      measures_taken: record.measures_taken || null,
      behavior_impact: record.behavior_impact || null,
      sort_order: record.sort_order,
    };

    if (record.id.startsWith("temp-")) {
      const { data, error } = await supabase
        .from(config.behaviorTable)
        .insert(payload)
        .select("*")
        .single();
      if (error || !data) {
        setSaveError(getDbErrorMessage(error?.message ?? "保存行为记录失败"));
        return false;
      }
      setBehaviorRecords((prev) =>
        prev.map((r) => (r.id === record.id ? (data as KgIntegrationBehaviorRecord) : r)),
      );
      return true;
    }

    const { error } = await supabase
      .from(config.behaviorTable)
      .update(payload)
      .eq("id", record.id);
    if (error) {
      setSaveError(getDbErrorMessage(error.message));
      return false;
    }
    return true;
  }

  async function deleteBehaviorRecord(id: string): Promise<boolean> {
    const supabase = createClient();
    const { error } = await supabase
      .from(config.behaviorTable)
      .delete()
      .eq("id", id);
    if (error) {
      setSaveError(getDbErrorMessage(error.message));
      return false;
    }
    return true;
  }

  async function persistProgress(): Promise<boolean> {
    setSaveError(null);
    setSavingProgress(true);
    setSaveStatus("saving");

    const supabase = createClient();
    const error = await saveIntegrationProgress(supabase, toolType, session.id, {
      scores,
      notes,
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

    const filled = await fillIntegrationUntestedScores(supabase, toolType, session.id, {
      items: allItems,
      scores,
      notes,
    });

    if (filled.error) {
      setSaveError(getDbErrorMessage(filled.error));
      setCompleting(false);
      return;
    }

    setScores(filled.scores);

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

  function countLabel(domainItems: { id: string }[]) {
    const full = domainItems.filter((i) => scores[i.id] === "2").length;
    const tested = domainItems.filter(
      (i) => scores[i.id] && scores[i.id] !== "NT" && scores[i.id] !== "NA",
    ).length;
    return tested > 0 ? `${full}/${tested} 独立` : `${domainItems.length} 项`;
  }

  return (
    <div>
      <div className="sticky top-16 z-10 -mx-4 mb-6 border-b border-zinc-800 bg-zinc-950/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1">
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
          {activeTab === "activity" && (
            <Cpep3ItemSection
              items={activitySectionItems}
              scores={scores}
              notes={notes}
              scoreOptions={KG_INTEGRATION_SCORE_OPTIONS}
              emptyMessage={`未加载融合活动评估数据。请在 Supabase 执行 ${config.migrationHint} 迁移。`}
              onScore={(id, score) => saveScore(id, score as KgIntegrationScore)}
              onNotes={saveNotes}
              savingId={savingId}
              countLabel={countLabel}
            />
          )}

          {activeTab === "skill" && (
            <Cpep3ItemSection
              items={skillSectionItems}
              scores={scores}
              notes={notes}
              scoreOptions={KG_INTEGRATION_SCORE_OPTIONS}
              emptyMessage={`未加载融合技能评估数据。请在 Supabase 执行 ${config.migrationHint} 迁移。`}
              onScore={(id, score) => saveScore(id, score as KgIntegrationScore)}
              onNotes={saveNotes}
              savingId={savingId}
              countLabel={countLabel}
            />
          )}

          {activeTab === "behavior" && (
            <KgIntegrationBehaviorSection
              sessionId={session.id}
              records={behaviorRecords}
              onChange={setBehaviorRecords}
              onSaveRecord={saveBehaviorRecord}
              onDeleteRecord={deleteBehaviorRecord}
              disabled={session.status === "completed"}
            />
          )}
        </div>

        <KgIntegrationStatsPanel
          activeTab={activeTab}
          activityItems={activityItems}
          skillItems={skillItems}
          scores={scores}
          behaviorCount={
            behaviorRecords.filter((r) => r.behavior_description?.trim()).length
          }
        />
      </div>

      <AssessmentFormActions
        backHref={`/dashboard/students/${student.id}/assessments/new`}
        accentColor={accent}
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

export function KgIntegrationForm(
  props: Omit<IntegrationAssessmentData, "toolType">,
) {
  return <IntegrationAssessmentForm {...props} toolType="kg_integration" />;
}

export function ElemIntegrationForm(
  props: Omit<IntegrationAssessmentData, "toolType">,
) {
  return <IntegrationAssessmentForm {...props} toolType="elem_integration" />;
}

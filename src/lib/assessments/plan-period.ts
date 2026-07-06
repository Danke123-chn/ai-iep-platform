import {
  getDefaultDates,
  getDefaultSchoolYear,
  getDefaultSemester,
} from "@/lib/iep-utils";
import type { AssessmentSession } from "@/lib/types/assessment_types";

export type AssessmentPlanPeriod = {
  schoolYear: string;
  semester: "上学期" | "下学期";
  planStartDate: string;
  planEndDate: string;
};

export type SessionPlanPeriodSource = Pick<
  AssessmentSession,
  "school_year" | "semester" | "plan_start_date" | "plan_end_date" | "notes"
>;

const PLAN_PERIOD_NOTES_MARKER = "__planPeriod__";
const PLAN_PERIOD_NOTES_END = "__endPlanPeriod__";

export function isPlanPeriodColumnError(message: string): boolean {
  return (
    /Could not find the '(school_year|semester|plan_start_date|plan_end_date)' column of 'assessment_sessions'/.test(
      message,
    ) || /assessment_sessions.*(school_year|semester|plan_start_date|plan_end_date)/.test(message)
  );
}

export function getDefaultPlanPeriod(): AssessmentPlanPeriod {
  const semester = getDefaultSemester();
  const dates = getDefaultDates(semester);
  return {
    schoolYear: getDefaultSchoolYear(),
    semester,
    planStartDate: dates.startDate,
    planEndDate: dates.endDate,
  };
}

export function parsePlanPeriodFromNotes(
  notes: string | null | undefined,
): AssessmentPlanPeriod | null {
  if (!notes?.includes(PLAN_PERIOD_NOTES_MARKER)) return null;

  const start = notes.indexOf(PLAN_PERIOD_NOTES_MARKER) + PLAN_PERIOD_NOTES_MARKER.length;
  const end = notes.indexOf(PLAN_PERIOD_NOTES_END, start);
  const raw = end === -1 ? notes.slice(start) : notes.slice(start, end);

  try {
    const parsed = JSON.parse(raw) as Partial<AssessmentPlanPeriod>;
    if (
      typeof parsed.schoolYear !== "string" ||
      (parsed.semester !== "上学期" && parsed.semester !== "下学期") ||
      typeof parsed.planStartDate !== "string" ||
      typeof parsed.planEndDate !== "string"
    ) {
      return null;
    }
    return parsed as AssessmentPlanPeriod;
  } catch {
    return null;
  }
}

export function formatPlanPeriodNotes(
  plan: AssessmentPlanPeriod,
  existingNotes: string | null | undefined,
): string {
  const userNotes = stripPlanPeriodFromNotes(existingNotes);
  const encoded = `${PLAN_PERIOD_NOTES_MARKER}${JSON.stringify(plan)}${PLAN_PERIOD_NOTES_END}`;
  return userNotes ? `${encoded}\n${userNotes}` : encoded;
}

export function stripPlanPeriodFromNotes(notes: string | null | undefined): string {
  if (!notes) return "";

  const markerIndex = notes.indexOf(PLAN_PERIOD_NOTES_MARKER);
  if (markerIndex === -1) return notes.trim();

  const endIndex = notes.indexOf(PLAN_PERIOD_NOTES_END, markerIndex);
  const after =
    endIndex === -1
      ? ""
      : notes.slice(endIndex + PLAN_PERIOD_NOTES_END.length).trim();

  const before = notes.slice(0, markerIndex).trim();
  return [before, after].filter(Boolean).join("\n").trim();
}

function resolvePlanPeriodFromColumns(
  session: SessionPlanPeriodSource,
): AssessmentPlanPeriod | null {
  const hasAnyColumn =
    session.school_year ||
    session.semester ||
    session.plan_start_date ||
    session.plan_end_date;

  if (!hasAnyColumn) return null;

  const semester =
    session.semester === "上学期" || session.semester === "下学期"
      ? session.semester
      : getDefaultSemester();
  const defaults = getDefaultDates(semester);

  return {
    schoolYear: session.school_year?.trim() || getDefaultSchoolYear(),
    semester,
    planStartDate:
      session.plan_start_date?.slice(0, 10) || defaults.startDate,
    planEndDate: session.plan_end_date?.slice(0, 10) || defaults.endDate,
  };
}

export function resolvePlanPeriodFromSession(
  session: SessionPlanPeriodSource,
): AssessmentPlanPeriod {
  return (
    resolvePlanPeriodFromColumns(session) ??
    parsePlanPeriodFromNotes(session.notes) ??
    getDefaultPlanPeriod()
  );
}

export function toIepPlanPeriod(plan: AssessmentPlanPeriod) {
  return {
    schoolYear: plan.schoolYear,
    semester: plan.semester,
    startDate: plan.planStartDate,
    endDate: plan.planEndDate,
  };
}

export function toSessionPlanPeriodPayload(plan: AssessmentPlanPeriod) {
  return {
    school_year: plan.schoolYear.trim(),
    semester: plan.semester,
    plan_start_date: plan.planStartDate,
    plan_end_date: plan.planEndDate,
  };
}

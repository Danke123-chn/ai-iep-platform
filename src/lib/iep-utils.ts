import { ASSESSMENT_LEVEL_LABELS, ASSESSMENT_DOMAIN_KEYS } from "@/types/iep";
import type {
  AssessmentData,
  GoalProgressStatus,
  IepDomainMode,
  IepGenerateRequest,
  IepStatus,
} from "@/types/iep";
import { formatPlacementTypes, type Student } from "@/lib/types/student";

function calculateAge(birthDate: string | null): number | undefined {
  if (!birthDate) return undefined;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return undefined;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

export function validateIepGenerateRequest(
  body: unknown,
): IepGenerateRequest | null {
  if (!body || typeof body !== "object") return null;
  const data = body as Partial<IepGenerateRequest>;

  if (
    !data.studentId ||
    !data.schoolYear ||
    !data.semester ||
    !data.startDate ||
    !data.endDate ||
    !Array.isArray(data.domains)
  ) {
    return null;
  }

  if (data.semester !== "上学期" && data.semester !== "下学期") {
    return null;
  }

  const domainMode: IepDomainMode = data.domainMode ?? "generic";
  if (
    domainMode !== "generic" &&
    domainMode !== "vb_mapp" &&
    domainMode !== "c_pep3" &&
    domainMode !== "kg_integration" &&
    domainMode !== "elem_integration"
  ) {
    return null;
  }

  if (data.domains.length === 0) {
    return null;
  }

  if (
    domainMode === "generic" &&
    data.domains.length !== ASSESSMENT_DOMAIN_KEYS.length
  ) {
    return null;
  }

  if (domainMode === "vb_mapp" && data.domains.length < 3) {
    return null;
  }

  if (domainMode === "c_pep3" && data.domains.length < 5) {
    return null;
  }

  if (domainMode === "kg_integration" && data.domains.length < 3) {
    return null;
  }

  if (domainMode === "elem_integration" && data.domains.length < 3) {
    return null;
  }

  for (const domain of data.domains) {
    if (
      !domain.key ||
      !domain.name ||
      domain.level === null ||
      domain.level === undefined ||
      domain.level < 1 ||
      domain.level > 5
    ) {
      return null;
    }
  }

  return {
    ...data,
    domainMode,
  } as IepGenerateRequest;
}

export function toAssessmentData(
  payload: IepGenerateRequest,
  student: Student,
): AssessmentData {
  return {
    student: {
      name: student.name,
      gender: student.gender ?? undefined,
      birthDate: student.birth_date ?? undefined,
      age: calculateAge(student.birth_date),
      disabilityTypes: student.disability_types,
      school: student.school ?? undefined,
      grade: student.grade ?? undefined,
      className: student.class_name ?? undefined,
      placementType: (() => {
        const formatted = formatPlacementTypes(student.placement_types);
        return formatted !== "未填写" ? formatted : undefined;
      })(),
    },
    domains: payload.domains.map((domain) => ({
      key: domain.key,
      name: domain.name,
      level: domain.level ?? undefined,
      levelDescription: domain.level
        ? ASSESSMENT_LEVEL_LABELS[domain.level]
        : undefined,
      notes: domain.description || undefined,
    })),
    domainMode: payload.domainMode,
    toolType: payload.toolType,
    assessmentSessionId: payload.assessmentSessionId,
    assessDate: payload.startDate,
    assessorNotes: `学年 ${payload.schoolYear}，${payload.semester}`,
    schoolYear: payload.schoolYear,
    semester: payload.semester,
    startDate: payload.startDate,
    endDate: payload.endDate,
  };
}

export function getDefaultSchoolYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (month >= 9) {
    return `${year}-${year + 1}`;
  }
  return `${year - 1}-${year}`;
}

export function getDefaultSemester(): "上学期" | "下学期" {
  const month = new Date().getMonth() + 1;
  return month >= 2 && month <= 7 ? "下学期" : "上学期";
}

export function getDefaultDates(semester: "上学期" | "下学期"): {
  startDate: string;
  endDate: string;
} {
  const year = new Date().getFullYear();
  if (semester === "上学期") {
    return {
      startDate: `${year}-09-01`,
      endDate: `${year + 1}-01-31`,
    };
  }
  return {
    startDate: `${year}-03-01`,
    endDate: `${year}-07-15`,
  };
}

export function getIepStatus(iep: {
  generated_at: string | null;
  end_date: string;
}): IepStatus {
  if (!iep.generated_at) return "draft";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(iep.end_date);
  if (end < today) return "completed";
  return "in_progress";
}

export function inferGoalProgressStatus(
  startDate: string,
  endDate: string,
): GoalProgressStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "P";
  }

  if (today < start) return "D";

  const daysPastEnd = Math.floor(
    (today.getTime() - end.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysPastEnd > 14) return "E";
  if (today > end) return "C";

  const daysSinceStart = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (daysSinceStart <= 7) return "S";

  return "P";
}

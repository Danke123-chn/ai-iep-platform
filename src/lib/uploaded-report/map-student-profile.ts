import {
  DISABILITY_TYPES,
  GENDER_OPTIONS,
  type DisabilityType,
  type Gender,
} from "@/lib/types/student";

export type RawExtractedStudentProfile = {
  name?: string;
  gender?: string;
  birth_date?: string;
  disability_types?: string[];
  school?: string;
  grade?: string;
  class_name?: string;
  parent_name?: string;
  parent_phone?: string;
  family_notes?: string;
};

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function normalizeGender(value: string | undefined): Gender | null {
  if (!value) return null;
  return GENDER_OPTIONS.includes(value as Gender) ? (value as Gender) : null;
}

function normalizeBirthDate(value: string | undefined): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim();
  return DATE_REGEX.test(trimmed) ? trimmed : null;
}

function normalizeDisabilityTypes(values: string[] | undefined): DisabilityType[] {
  if (!values?.length) return [];

  const mapped = values
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      if (DISABILITY_TYPES.includes(item as DisabilityType)) {
        return item as DisabilityType;
      }
      return "其他" as DisabilityType;
    });

  return [...new Set(mapped)];
}

export function mapExtractedStudentProfile(
  raw: RawExtractedStudentProfile | undefined | null,
) {
  return {
    name: raw?.name?.trim() || "待补充姓名",
    gender: normalizeGender(raw?.gender),
    birth_date: normalizeBirthDate(raw?.birth_date),
    disability_types: normalizeDisabilityTypes(raw?.disability_types),
    school: raw?.school?.trim() || null,
    grade: raw?.grade?.trim() || null,
    class_name: raw?.class_name?.trim() || null,
    parent_name: raw?.parent_name?.trim() || null,
    parent_phone: raw?.parent_phone?.trim() || null,
    family_notes: raw?.family_notes?.trim() || null,
  };
}

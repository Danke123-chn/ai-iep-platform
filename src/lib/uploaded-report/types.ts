import type { AssessmentLevel, IepDomainMode, IepFormDomain } from "@/types/iep";
import type { DisabilityType, Gender } from "@/lib/types/student";

export type ExtractedStudentProfile = {
  name: string;
  gender: Gender | null;
  birth_date: string | null;
  disability_types: DisabilityType[];
  school: string | null;
  grade: string | null;
  class_name: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  family_notes: string | null;
};

export type DetectedReportTool =
  | "vb_mapp"
  | "c_pep3"
  | "kg_integration"
  | "elem_integration"
  | "generic";

export type UploadedReportInterpretation = {
  fileName: string;
  mimeType: string;
  detectedToolType: DetectedReportTool;
  domainMode: IepDomainMode;
  summary: string;
  reportAnalysis: string;
  strengths: string;
  needs: string;
  domains: IepFormDomain[];
  studentProfile?: ExtractedStudentProfile;
  extractedTextPreview: string;
  uploadedAt: string;
};

export const UPLOAD_REPORT_ACCEPT =
  ".doc,.docx,.pdf,.jpg,.jpeg,.png,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp";

export const UPLOAD_REPORT_MAX_BYTES = 10 * 1024 * 1024;

export function parseUploadedReportSummary(
  summary: string | null,
): UploadedReportInterpretation | null {
  if (!summary?.trim()) return null;
  try {
    const data = JSON.parse(summary) as UploadedReportInterpretation;
    if (!data.fileName || !Array.isArray(data.domains)) return null;
    return data;
  } catch {
    return null;
  }
}

export function normalizeInterpretationDomains(
  domains: unknown,
): IepFormDomain[] {
  if (!Array.isArray(domains)) return [];

  return domains
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const levelRaw = Number(record.level);
      const level =
        levelRaw >= 1 && levelRaw <= 5 ? (levelRaw as AssessmentLevel) : null;
      const name =
        typeof record.name === "string" && record.name.trim()
          ? record.name.trim()
          : `领域 ${index + 1}`;
      const key =
        typeof record.key === "string" && record.key.trim()
          ? record.key.trim()
          : `domain_${index + 1}`;
      const description =
        typeof record.description === "string" ? record.description : "";

      return { key, name, level, description };
    })
    .filter((item): item is IepFormDomain => item !== null);
}

export function detectedToolToDomainMode(
  detected: DetectedReportTool,
): IepDomainMode {
  switch (detected) {
    case "vb_mapp":
      return "vb_mapp";
    case "c_pep3":
      return "c_pep3";
    case "kg_integration":
      return "kg_integration";
    case "elem_integration":
      return "elem_integration";
    default:
      return "generic";
  }
}

export function detectedToolToIepToolType(
  detected: DetectedReportTool,
): "vb_mapp" | "c_pep3" | "kg_integration" | "elem_integration" | undefined {
  if (detected === "generic") return undefined;
  return detected;
}

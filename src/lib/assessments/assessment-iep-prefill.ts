import type { IntegrationAssessmentTool } from "@/lib/assessments/integration-assessment-config";
import {
  detectedToolToIepToolType,
  type UploadedReportInterpretation,
} from "@/lib/uploaded-report/types";
import type { IepDomainMode, IepFormDomain } from "@/types/iep";

export type AssessmentIepPrefill = {
  studentId: string;
  sessionId: string;
  toolType:
    | "vb_mapp"
    | "c_pep3"
    | IntegrationAssessmentTool
    | "uploaded_report";
  domainMode: IepDomainMode;
  toolLabel: string;
  sessionDate: string;
  schoolYear: string;
  semester: "上学期" | "下学期";
  startDate: string;
  endDate: string;
  domains: IepFormDomain[];
  uploadedInterpretation?: UploadedReportInterpretation;
};

export function getIepToolTypeFromPrefill(
  prefill: AssessmentIepPrefill,
): "vb_mapp" | "c_pep3" | "kg_integration" | "elem_integration" | undefined {
  if (prefill.toolType === "uploaded_report" && prefill.uploadedInterpretation) {
    return detectedToolToIepToolType(
      prefill.uploadedInterpretation.detectedToolType,
    );
  }
  if (prefill.toolType === "uploaded_report") return undefined;
  return prefill.toolType;
}

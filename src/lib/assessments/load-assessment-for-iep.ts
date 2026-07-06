import {
  mapCpep3ToIepDomains,
  mapIntegrationToIepDomains,
  mapVbMappToIepDomains,
} from "@/lib/assessments/map-assessment-to-iep";
import type { AssessmentIepPrefill } from "@/lib/assessments/assessment-iep-prefill";
export type { AssessmentIepPrefill } from "@/lib/assessments/assessment-iep-prefill";
export { getIepToolTypeFromPrefill } from "@/lib/assessments/assessment-iep-prefill";
import {
  loadAssessmentResult,
  type Cpep3ResultData,
  type IntegrationResultData,
  type UploadedReportResultData,
  type VbMappResultData,
} from "@/lib/assessments/load-assessment-result";
import {
  isIntegrationTool,
  type IntegrationAssessmentTool,
} from "@/lib/assessments/integration-assessment-config";
import type { AssessmentTool } from "@/lib/types/assessment_types";
import type { IepDomainMode, IepFormDomain } from "@/types/iep";
import type { UploadedReportInterpretation } from "@/lib/uploaded-report/types";
import {
  resolvePlanPeriodFromSession,
  toIepPlanPeriod,
} from "@/lib/assessments/plan-period";

function buildPrefillBase(
  result: Awaited<ReturnType<typeof loadAssessmentResult>>,
  studentId: string,
  sessionId: string,
  domainMode: IepDomainMode,
  toolType: AssessmentIepPrefill["toolType"],
  domains: IepFormDomain[],
  uploadedInterpretation?: UploadedReportInterpretation,
): AssessmentIepPrefill {
  if (!result) {
    throw new Error("评估结果不存在");
  }

  const plan = toIepPlanPeriod(resolvePlanPeriodFromSession(result.session));

  return {
    studentId,
    sessionId,
    toolType,
    domainMode,
    toolLabel: result.toolLabel,
    sessionDate: result.session.session_date,
    schoolYear: plan.schoolYear,
    semester: plan.semester,
    startDate: plan.startDate,
    endDate: plan.endDate,
    domains,
    uploadedInterpretation,
  };
}

export async function loadAssessmentForIep(
  studentId: string,
  sessionId: string,
  userId: string,
): Promise<AssessmentIepPrefill | null> {
  const result = await loadAssessmentResult(studentId, sessionId, userId);
  if (!result) return null;

  if (result.session.tool_type === "uploaded_report") {
    const uploaded = result as UploadedReportResultData;
    const { interpretation } = uploaded;
    return buildPrefillBase(
      result,
      studentId,
      sessionId,
      interpretation.domainMode,
      "uploaded_report",
      interpretation.domains,
      interpretation,
    );
  }

  if (result.session.tool_type === "vb_mapp") {
    const vb = result as VbMappResultData;
    return buildPrefillBase(
      result,
      studentId,
      sessionId,
      "vb_mapp",
      "vb_mapp",
      mapVbMappToIepDomains(
        vb.milestoneSummary,
        vb.barrierAverage,
        vb.transitionAverage,
        vb.barriers,
        vb.transitions,
      ),
    );
  }

  if (isIntegrationTool(result.session.tool_type as AssessmentTool)) {
    const toolType = result.session.tool_type as IntegrationAssessmentTool;
    const integration = result as IntegrationResultData;
    return buildPrefillBase(
      result,
      studentId,
      sessionId,
      toolType,
      toolType,
      mapIntegrationToIepDomains(
        toolType,
        integration.summary,
        integration.behaviorRecords,
      ),
    );
  }

  const cpep = result as Cpep3ResultData;
  return buildPrefillBase(
    result,
    studentId,
    sessionId,
    "c_pep3",
    "c_pep3",
    mapCpep3ToIepDomains(cpep.devSummary, cpep.patSummary),
  );
}

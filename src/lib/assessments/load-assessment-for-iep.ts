import {
  mapCpep3ToIepDomains,
  mapIntegrationToIepDomains,
  mapVbMappToIepDomains,
} from "@/lib/assessments/map-assessment-to-iep";
import {
  loadAssessmentResult,
  type Cpep3ResultData,
  type IntegrationResultData,
  type VbMappResultData,
} from "@/lib/assessments/load-assessment-result";
import {
  isIntegrationTool,
  type IntegrationAssessmentTool,
} from "@/lib/assessments/integration-assessment-config";
import type { AssessmentTool } from "@/lib/types/assessment_types";
import type { IepDomainMode, IepFormDomain } from "@/types/iep";

export type AssessmentIepPrefill = {
  studentId: string;
  sessionId: string;
  toolType: "vb_mapp" | "c_pep3" | IntegrationAssessmentTool;
  domainMode: IepDomainMode;
  toolLabel: string;
  sessionDate: string;
  domains: IepFormDomain[];
};

export async function loadAssessmentForIep(
  studentId: string,
  sessionId: string,
  userId: string,
): Promise<AssessmentIepPrefill | null> {
  const result = await loadAssessmentResult(studentId, sessionId, userId);
  if (!result) return null;

  if (result.session.tool_type === "vb_mapp") {
    const vb = result as VbMappResultData;
    return {
      studentId,
      sessionId,
      toolType: "vb_mapp",
      domainMode: "vb_mapp",
      toolLabel: result.toolLabel,
      sessionDate: result.session.session_date,
      domains: mapVbMappToIepDomains(
        vb.milestoneSummary,
        vb.barrierAverage,
        vb.transitionAverage,
        vb.barriers,
        vb.transitions,
      ),
    };
  }

  if (isIntegrationTool(result.session.tool_type as AssessmentTool)) {
    const toolType = result.session.tool_type as IntegrationAssessmentTool;
    const integration = result as IntegrationResultData;
    return {
      studentId,
      sessionId,
      toolType,
      domainMode: toolType,
      toolLabel: result.toolLabel,
      sessionDate: result.session.session_date,
      domains: mapIntegrationToIepDomains(
        toolType,
        integration.summary,
        integration.behaviorRecords,
      ),
    };
  }

  const cpep = result as Cpep3ResultData;
  return {
    studentId,
    sessionId,
    toolType: "c_pep3",
    domainMode: "c_pep3",
    toolLabel: result.toolLabel,
    sessionDate: result.session.session_date,
    domains: mapCpep3ToIepDomains(cpep.devSummary, cpep.patSummary),
  };
}

import { loadIntegrationAssessmentData } from "@/lib/assessments/load-integration-assessment-data";

export type { IntegrationAssessmentData as KgIntegrationAssessmentData } from "@/lib/assessments/load-integration-assessment-data";

export async function loadKgIntegrationAssessmentData(
  studentId: string,
  sessionId: string,
  userId: string,
) {
  return loadIntegrationAssessmentData(
    "kg_integration",
    studentId,
    sessionId,
    userId,
  );
}

export async function loadElemIntegrationAssessmentData(
  studentId: string,
  sessionId: string,
  userId: string,
) {
  return loadIntegrationAssessmentData(
    "elem_integration",
    studentId,
    sessionId,
    userId,
  );
}

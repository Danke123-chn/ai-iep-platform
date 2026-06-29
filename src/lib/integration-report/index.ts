export {
  buildIntegrationReportWordBuffer,
  getIntegrationReportFilename,
} from "@/lib/integration-report/word-document";
export {
  loadIntegrationReportData,
  saveIntegrationReportContent,
} from "@/lib/integration-report/load-data";
export { generateIntegrationReportNarratives } from "@/lib/integration-report/generate-narratives";
export {
  buildDefaultIntegrationReportContent,
  parseIntegrationReportContent,
  isIntegrationReportContent,
} from "@/lib/integration-report/report-content";
export {
  buildIntegrationReportDomainRows,
  formatDomainScoreLabel,
  getIntegrationReportTitle,
  getIntegrationSchoolLabel,
} from "@/lib/integration-report/domain-rows";
export type {
  IntegrationReportData,
  IntegrationReportContent,
  IntegrationReportDomainRow,
} from "@/lib/integration-report/types";

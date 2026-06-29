export function getIepExportFilename(
  studentName: string,
  schoolYear: string,
  ext: "pdf" | "docx",
): string {
  const safeName = studentName.replace(/[\\/:*?"<>|]/g, "_") || "学生";
  return `IEP_${safeName}_${schoolYear}.${ext}`;
}

export function getProgressReportFilename(
  studentName: string,
  schoolYear: string,
): string {
  const safeName = studentName.replace(/[\\/:*?"<>|]/g, "_") || "学生";
  return `IEP进度报告_${safeName}_${schoolYear}.docx`;
}

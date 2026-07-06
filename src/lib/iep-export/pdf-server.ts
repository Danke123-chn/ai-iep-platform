import type { IepExportData } from "@/lib/iep-export/types";
import {
  buildAssessmentTableRows,
  buildBasicInfoRows,
  buildGoalTableRows,
  buildIepSubtitle,
  buildIepTeachingSuggestions,
  IEP_DOC_TITLE,
  IEP_SIGNATURE_LINES,
} from "@/lib/iep-export/document-content";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function buildIepPdfBuffer(data: IepExportData): Promise<Buffer> {
  const margin = 15;
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageWidth = doc.internal.pageSize.getWidth();

  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(IEP_DOC_TITLE, pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(buildIepSubtitle(data), pageWidth / 2, y, { align: "center" });
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("一、基本信息", margin, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    body: buildBasicInfoRows(data),
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2 },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("二、发展现状评估", margin, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["评估领域", "等级", "等级说明", "具体描述"]],
    body: buildAssessmentTableRows(data).map((row) => [
      row.domain,
      row.level,
      row.levelLabel,
      row.description,
    ]),
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: "bold" },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("三、长短期目标", margin, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["领域", "长期目标", "短期目标", "评量方式", "起止日期", "进度"]],
    body: buildGoalTableRows(data).map((row) => [
      row.domain,
      row.longTermGoal,
      row.shortTermGoal,
      row.assessmentMethod,
      row.dateRange,
      row.progress,
    ]),
    styles: { font: "helvetica", fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: "bold" },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("四、教学决定建议", margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  for (const item of buildIepTeachingSuggestions(data)) {
    const lines = doc.splitTextToSize(`• ${item}`, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 2;
  }

  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("五、签名区", margin, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  for (const line of IEP_SIGNATURE_LINES) {
    doc.text(line, margin, y);
    y += 8;
  }

  return Buffer.from(doc.output("arraybuffer"));
}

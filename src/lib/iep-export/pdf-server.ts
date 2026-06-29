import type { IepExportData } from "@/lib/iep-export/types";
import { buildTeachingSuggestions } from "@/lib/iep-export/teaching-suggestions";
import { getShortTermGoalProgress } from "@/lib/iep-progress";
import { formatDisabilityTypes, formatPlacementTypes } from "@/lib/types/student";
import {
  ASSESSMENT_LEVEL_LABELS,
  GOAL_PROGRESS_LABELS,
  IEP_STATUS_LABELS,
  type IepGenerateRequest,
} from "@/types/iep";
import { getIepStatus } from "@/lib/iep-utils";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function buildIepPdfBuffer(data: IepExportData): Promise<Buffer> {
  const { iep, student, goals } = data;
  const assessment = iep.assessment_data as IepGenerateRequest;
  const status = getIepStatus(iep);
  const margin = 15;

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const addHeaderFooter = () => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("个别化教育计划（IEP）", margin, 10);
      doc.text(
        `第 ${i} 页 / 共 ${pageCount} 页`,
        pageWidth - margin,
        pageHeight - 8,
        { align: "right" },
      );
    }
  };

  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("个别化教育计划（IEP）", pageWidth / 2, y, { align: "center" });
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(
    `${student?.name ?? "未知学生"}  ${iep.school_year}  ${iep.semester}`,
    pageWidth / 2,
    y,
    { align: "center" },
  );
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("一、基本信息", margin, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["项目", "内容", "项目", "内容"]],
    body: [
      ["姓名", student?.name ?? "—", "性别", student?.gender ?? "—"],
      ["学校", student?.school ?? "—", "年级", student?.grade ?? "—"],
      ["班级", student?.class_name ?? "—", "安置", student ? formatPlacementTypes(student.placement_types) : "—"],
      [
        "障碍类型",
        student ? formatDisabilityTypes(student.disability_types) : "—",
        "状态",
        IEP_STATUS_LABELS[status],
      ],
      ["学年", iep.school_year, "学期", iep.semester],
      ["起始", iep.start_date, "结束", iep.end_date],
    ],
    styles: { font: "helvetica", fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("二、发展现状评估", margin, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["领域", "等级", "说明", "描述"]],
    body: (assessment.domains ?? []).map((d) => [
      d.name,
      d.level ? `${d.level}级` : "—",
      d.level ? ASSESSMENT_LEVEL_LABELS[d.level] : "—",
      d.description || "—",
    ]),
    styles: { font: "helvetica", fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("三、长短期目标", margin, y);
  y += 4;

  const goalBody: string[][] = [];
  for (const goal of goals) {
    for (const [index, stg] of goal.short_term_goals.entries()) {
      const progress = getShortTermGoalProgress(stg);
      goalBody.push([
        index === 0 ? goal.domain_name : "",
        index === 0 ? goal.long_term_goal.slice(0, 40) : "",
        stg.content.slice(0, 50),
        stg.assessmentMethod.slice(0, 20),
        `${stg.startDate}~${stg.endDate}`,
        progress ? `${progress}(${GOAL_PROGRESS_LABELS[progress]})` : "—",
      ]);
    }
  }

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["领域", "长期目标", "短期目标", "评量", "日期", "进度"]],
    body: goalBody,
    styles: { font: "helvetica", fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("四、教学决定建议", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  for (const item of buildTeachingSuggestions(data)) {
    const lines = doc.splitTextToSize(`• ${item}`, pageWidth - margin * 2);
    if (y + lines.length * 5 > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
    doc.text(lines, margin, y);
    y += lines.length * 5;
  }

  y += 8;
  if (y > pageHeight - 40) {
    doc.addPage();
    y = 20;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("五、签名区", margin, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("班主任签名：________________    日期：________________", margin, y);
  y += 8;
  doc.text("家长签名：____________________    日期：________________", margin, y);

  addHeaderFooter();

  return Buffer.from(doc.output("arraybuffer"));
}

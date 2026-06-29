import type { IepExportData, ProgressReportContent } from "@/lib/iep-export/types";
import { buildTeachingSuggestions } from "@/lib/iep-export/teaching-suggestions";
import { getShortTermGoalProgress } from "@/lib/iep-progress";
import { getIepStatus } from "@/lib/iep-utils";
import { formatDisabilityTypes, formatPlacementTypes } from "@/lib/types/student";
import {
  ASSESSMENT_LEVEL_LABELS,
  GOAL_PROGRESS_LABELS,
  IEP_STATUS_LABELS,
  type IepGenerateRequest,
} from "@/types/iep";
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

const FONT = "SimSun";
const SIZE_ER = 44; // 二号字 ≈ 22pt
const SIZE_NORMAL = 24; // 小四 ≈ 12pt
const SIZE_SMALL = 21; // 五号 ≈ 10.5pt

const cellBorder = {
  top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
};

function textParagraph(
  text: string,
  options?: { bold?: boolean; size?: number; alignment?: (typeof AlignmentType)[keyof typeof AlignmentType] },
) {
  return new Paragraph({
    alignment: options?.alignment,
    children: [
      new TextRun({
        text,
        font: FONT,
        size: options?.size ?? SIZE_NORMAL,
        bold: options?.bold,
      }),
    ],
  });
}

function tableCell(
  text: string,
  options?: { bold?: boolean; width?: number },
) {
  return new TableCell({
    borders: cellBorder,
    width: options?.width
      ? { size: options.width, type: WidthType.PERCENTAGE }
      : undefined,
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            font: FONT,
            size: SIZE_SMALL,
            bold: options?.bold,
          }),
        ],
      }),
    ],
  });
}

function heading1(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [
      new TextRun({ text, font: FONT, size: SIZE_NORMAL, bold: true }),
    ],
  });
}

function calculateAge(birthDate: string | null): string {
  if (!birthDate) return "—";
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return "—";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
  return `${age}岁`;
}

export async function buildIepWordBuffer(data: IepExportData): Promise<Buffer> {
  const { iep, student, goals } = data;
  const assessment = iep.assessment_data as IepGenerateRequest;
  const status = getIepStatus(iep);
  const teachingSuggestions = buildTeachingSuggestions(data);

  const basicInfoRows = [
    ["姓名", student?.name ?? "—", "性别", student?.gender ?? "—"],
    ["年龄", calculateAge(student?.birth_date ?? null), "学校", student?.school ?? "—"],
    ["年级", student?.grade ?? "—", "班级", student?.class_name ?? "—"],
    [
      "障碍类型",
      student ? formatDisabilityTypes(student.disability_types) : "—",
      "安置方式",
      student ? formatPlacementTypes(student.placement_types) : "—",
    ],
    ["学年", iep.school_year, "学期", iep.semester],
    ["计划起始", iep.start_date, "计划结束", iep.end_date],
    ["IEP 状态", IEP_STATUS_LABELS[status], "生成日期", iep.generated_at?.slice(0, 10) ?? "—"],
  ];

  const basicTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: basicInfoRows.map(
      (row) =>
        new TableRow({
          children: row.map((cell, i) =>
            tableCell(cell, { bold: i % 2 === 0, width: 25 }),
          ),
        }),
    ),
  });

  const assessmentRows = [
    new TableRow({
      children: [
        tableCell("评估领域", { bold: true, width: 18 }),
        tableCell("等级", { bold: true, width: 10 }),
        tableCell("等级说明", { bold: true, width: 22 }),
        tableCell("具体描述", { bold: true, width: 50 }),
      ],
    }),
    ...(assessment.domains ?? []).map(
      (domain) =>
        new TableRow({
          children: [
            tableCell(domain.name),
            tableCell(domain.level ? `${domain.level}级` : "—"),
            tableCell(
              domain.level ? ASSESSMENT_LEVEL_LABELS[domain.level] : "—",
            ),
            tableCell(domain.description || "—"),
          ],
        }),
    ),
  ];

  const assessmentTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: assessmentRows,
  });

  const goalRows = [
    new TableRow({
      children: [
        tableCell("领域", { bold: true, width: 12 }),
        tableCell("长期目标", { bold: true, width: 18 }),
        tableCell("短期目标", { bold: true, width: 22 }),
        tableCell("评量方式", { bold: true, width: 14 }),
        tableCell("起止日期", { bold: true, width: 16 }),
        tableCell("进度", { bold: true, width: 8 }),
      ],
    }),
  ];

  for (const goal of goals) {
    if (goal.short_term_goals.length === 0) {
      goalRows.push(
        new TableRow({
          children: [
            tableCell(goal.domain_name),
            tableCell(goal.long_term_goal),
            tableCell("—"),
            tableCell("—"),
            tableCell("—"),
            tableCell("—"),
          ],
        }),
      );
      continue;
    }

    goal.short_term_goals.forEach((stg, index) => {
      const progress = getShortTermGoalProgress(stg);
      const progressLabel = progress
        ? `${progress}(${GOAL_PROGRESS_LABELS[progress]})`
        : "未更新";

      goalRows.push(
        new TableRow({
          children: [
            tableCell(index === 0 ? goal.domain_name : ""),
            tableCell(index === 0 ? goal.long_term_goal : ""),
            tableCell(stg.content),
            tableCell(stg.assessmentMethod),
            tableCell(`${stg.startDate} ~ ${stg.endDate}`),
            tableCell(progressLabel),
          ],
        }),
      );
    });
  }

  const goalsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: goalRows,
  });

  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "个别化教育计划（IEP）",
          font: FONT,
          size: SIZE_ER,
          bold: true,
        }),
      ],
    }),
    textParagraph(
      `${student?.name ?? "未知学生"}    ${iep.school_year}    ${iep.semester}`,
      { alignment: AlignmentType.CENTER, size: SIZE_NORMAL },
    ),
    textParagraph(""),
    heading1("一、基本信息"),
    basicTable,
    textParagraph(""),
    heading1("二、发展现状评估"),
    assessmentTable,
    textParagraph(""),
    heading1("三、长短期目标"),
    goalsTable,
    textParagraph(""),
    heading1("四、教学决定建议"),
    ...teachingSuggestions.map((item) => textParagraph(`• ${item}`)),
    textParagraph(""),
    heading1("五、签名区"),
    textParagraph("班主任签名：________________________    日期：________________"),
    textParagraph(""),
    textParagraph("家长签名：________________________    日期：________________"),
    textParagraph(""),
    textParagraph("学校盖章：________________________    日期：________________"),
  ];

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

export async function buildProgressReportWordBuffer(
  data: IepExportData,
  report: ProgressReportContent,
): Promise<Buffer> {
  const { iep, student } = data;

  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "个别化教育计划（IEP）进度报告",
          font: FONT,
          size: SIZE_ER,
          bold: true,
        }),
      ],
    }),
    textParagraph(
      `${student?.name ?? "未知学生"}    ${iep.school_year}    ${iep.semester}`,
      { alignment: AlignmentType.CENTER },
    ),
    textParagraph(`报告日期：${new Date().toISOString().slice(0, 10)}`, {
      alignment: AlignmentType.CENTER,
      size: SIZE_SMALL,
    }),
    textParagraph(""),
    heading1("一、报告概述"),
    textParagraph(report.overview),
    textParagraph(""),
    heading1("二、各领域目标完成情况"),
    ...report.domainSummaries.map((item) => textParagraph(`• ${item}`)),
    textParagraph(""),
    heading1("三、教学建议"),
    ...report.teachingSuggestions.map((item) => textParagraph(`• ${item}`)),
    textParagraph(""),
    heading1("四、下阶段调整方向"),
    ...report.nextPhaseAdjustments.map((item) => textParagraph(`• ${item}`)),
    textParagraph(""),
    heading1("五、签名确认"),
    textParagraph("班主任签名：________________________    日期：________________"),
    textParagraph(""),
    textParagraph("特教负责人签名：____________________    日期：________________"),
    textParagraph(""),
    textParagraph("家长签名：________________________    日期：________________"),
  ];

  const doc = new Document({ sections: [{ properties: {}, children }] });
  return Buffer.from(await Packer.toBuffer(doc));
}

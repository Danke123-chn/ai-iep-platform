import type { IepExportData, ProgressReportContent } from "@/lib/iep-export/types";
import {
  buildAssessmentTableRows,
  buildBasicInfoRows,
  buildGoalTableRows,
  buildIepSubtitle,
  buildIepTeachingSuggestions,
  IEP_DOC_TITLE,
  IEP_SIGNATURE_LINES,
} from "@/lib/iep-export/document-content";
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

export async function buildIepWordBuffer(data: IepExportData): Promise<Buffer> {
  const basicInfoRows = buildBasicInfoRows(data);
  const assessmentRows = buildAssessmentTableRows(data);
  const goalRows = buildGoalTableRows(data);
  const teachingSuggestions = buildIepTeachingSuggestions(data);

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

  const assessmentTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          tableCell("评估领域", { bold: true, width: 18 }),
          tableCell("等级", { bold: true, width: 10 }),
          tableCell("等级说明", { bold: true, width: 22 }),
          tableCell("具体描述", { bold: true, width: 50 }),
        ],
      }),
      ...assessmentRows.map(
        (row) =>
          new TableRow({
            children: [
              tableCell(row.domain),
              tableCell(row.level),
              tableCell(row.levelLabel),
              tableCell(row.description),
            ],
          }),
      ),
    ],
  });

  const goalsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
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
      ...goalRows.map(
        (row) =>
          new TableRow({
            children: [
              tableCell(row.domain),
              tableCell(row.longTermGoal),
              tableCell(row.shortTermGoal),
              tableCell(row.assessmentMethod),
              tableCell(row.dateRange),
              tableCell(row.progress),
            ],
          }),
      ),
    ],
  });

  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: IEP_DOC_TITLE,
          font: FONT,
          size: SIZE_ER,
          bold: true,
        }),
      ],
    }),
    textParagraph(buildIepSubtitle(data), {
      alignment: AlignmentType.CENTER,
      size: SIZE_NORMAL,
    }),
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
    ...IEP_SIGNATURE_LINES.map((line) => textParagraph(line)),
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

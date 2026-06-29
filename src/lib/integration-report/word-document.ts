import {
  formatDomainScoreLabel,
  getIntegrationReportTitle,
  getIntegrationSchoolLabel,
} from "@/lib/integration-report/domain-rows";
import type { IntegrationReportData } from "@/lib/integration-report/types";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

const FONT = "SimSun";
const SIZE_TITLE = 44;
const SIZE_NORMAL = 24;
const SIZE_SMALL = 21;

const cellBorder = {
  top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
};

function p(
  text: string,
  opts?: {
    bold?: boolean;
    size?: number;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
  },
) {
  return new Paragraph({
    alignment: opts?.alignment,
    spacing: { after: 120 },
    children: [
      new TextRun({
        text,
        font: FONT,
        size: opts?.size ?? SIZE_NORMAL,
        bold: opts?.bold,
      }),
    ],
  });
}

function cell(
  text: string,
  opts?: { bold?: boolean; width?: number },
) {
  return new TableCell({
    borders: cellBorder,
    width: opts?.width
      ? { size: opts.width, type: WidthType.PERCENTAGE }
      : undefined,
    children: text.split("\n").map(
      (line) =>
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              font: FONT,
              size: SIZE_SMALL,
              bold: opts?.bold,
            }),
          ],
        }),
    ),
  });
}

function formatDateZh(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

export async function buildIntegrationReportWordBuffer(
  data: IntegrationReportData,
): Promise<Buffer> {
  const { student, session, reportContent, domainRows, toolType } = data;
  const content = reportContent;
  const schoolLabel = getIntegrationSchoolLabel(toolType);
  const title = getIntegrationReportTitle(toolType);

  const header = [
    p(title, {
      bold: true,
      size: SIZE_TITLE,
      alignment: AlignmentType.CENTER,
    }),
    p(`学生：${student.name}`),
    p(`${schoolLabel}：${student.school ?? ""}`),
    p(`班级：${content.className || student.class_name || ""}`),
    p(`融合教师：${content.assessorName}`),
    p(`评估时间：${formatDateZh(session.session_date)}`),
    p(""),
  ];

  const tableRows = [
    new TableRow({
      children: [
        cell("领域（得分）", { bold: true, width: 22 }),
        cell("现状分析", { bold: true, width: 39 }),
        cell("建议", { bold: true, width: 39 }),
      ],
    }),
    ...domainRows.map((row) => {
      const analysis =
        row.domainKey === "behavior"
          ? content.behaviorAnalysis
          : (content.domainAnalysis[row.domainKey] ?? "");
      const recommendation =
        row.domainKey === "behavior"
          ? content.behaviorRecommendation
          : (content.domainRecommendations[row.domainKey] ?? "");

      return new TableRow({
        children: [
          cell(formatDomainScoreLabel(row)),
          cell(analysis),
          cell(recommendation),
        ],
      });
    }),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...header,
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows,
          }),
          p(""),
          p("评估签字：________________"),
          p("家长签字：________________"),
        ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

export function getIntegrationReportFilename(
  toolType: IntegrationReportData["toolType"],
  studentName: string,
  sessionDate: string,
  ext: "docx" | "pdf",
): string {
  const prefix =
    toolType === "kg_integration"
      ? "幼儿园融合能力评估报告"
      : "小学融合能力评估报告";
  const date = sessionDate.slice(0, 10);
  return `${prefix}-${studentName}-${date}.${ext}`;
}

import { formatDisabilityTypes, formatPlacementTypes } from "@/lib/types/student";
import { calculateStudentAge } from "@/lib/student-utils";
import type { Cpep3ReportData } from "@/lib/cpep3-report/types";
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
const SIZE_TITLE = 52;
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

function cell(text: string, opts?: { bold?: boolean; width?: number }) {
  return new TableCell({
    borders: cellBorder,
    width: opts?.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            font: FONT,
            size: SIZE_SMALL,
            bold: opts?.bold,
          }),
        ],
      }),
    ],
  });
}

function formatDateZh(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

function formatBirthDate(birthDate: string | null): string {
  if (!birthDate) return "";
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return birthDate;
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

export async function buildCpep3ReportWordBuffer(
  data: Cpep3ReportData,
): Promise<Buffer> {
  const { student, session, reportContent, devSummary, patSummary } = data;
  const content = reportContent;

  const coverLines = [
    p("C-PEP-3 评 估 报 告", {
      bold: true,
      size: SIZE_TITLE,
      alignment: AlignmentType.CENTER,
    }),
    p(`评 估 人：${content.assessorName}`),
    p(`儿童姓名：${student.name}`),
    p(`出生日期：${formatBirthDate(student.birth_date)}`),
    p(`实际年龄：${calculateStudentAge(student.birth_date)}`),
    p(`评估日期：${formatDateZh(session.session_date)}`),
    p(""),
  ];

  const part1 = [
    p("第一部分  学生基本信息", { bold: true }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            cell("学生姓名", { bold: true, width: 15 }),
            cell(student.name, { width: 18 }),
            cell("学生性别", { bold: true, width: 15 }),
            cell(student.gender ?? "", { width: 18 }),
            cell("出生日期", { bold: true, width: 15 }),
            cell(formatBirthDate(student.birth_date), { width: 19 }),
          ],
        }),
        new TableRow({
          children: [
            cell("实际年龄", { bold: true }),
            cell(calculateStudentAge(student.birth_date), { width: 18 }),
            cell("诊断结果", { bold: true }),
            cell(formatDisabilityTypes(student.disability_types), { width: 35 }),
          ],
        }),
        new TableRow({
          children: [
            cell("目前安置形式", { bold: true }),
            cell(formatPlacementTypes(student.placement_types), { width: 85 }),
          ],
        }),
      ],
    }),
    p(""),
  ];

  const part2 = [
    p("第二部分  评估总结", { bold: true }),
    ...content.observationNarrative.split(/\n+/).filter(Boolean).map((t) => p(t)),
    p(content.overallConclusion),
    p(""),
    p("优势与待加强领域", { bold: true, size: SIZE_SMALL }),
    p(content.strengthWeaknessSummary),
    p(""),
  ];

  const devNarratives = devSummary.flatMap((row) => [
    p(`${row.domain_label_zh}：${content.devDomainNarratives[row.domain] ?? ""}`),
  ]);

  const devTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          cell("发展领域", { bold: true, width: 18 }),
          cell("P", { bold: true, width: 10 }),
          cell("E", { bold: true, width: 10 }),
          cell("F", { bold: true, width: 10 }),
          cell("NT", { bold: true, width: 10 }),
          cell("通过率", { bold: true, width: 12 }),
        ],
      }),
      ...devSummary.map(
        (row) =>
          new TableRow({
            children: [
              cell(row.domain_label_zh),
              cell(String(row.passed_count)),
              cell(String(row.emerging_count)),
              cell(String(row.failed_count)),
              cell(String(row.not_tested_count)),
              cell(`${Math.round(Number(row.pass_rate ?? 0))}%`),
            ],
          }),
      ),
      new TableRow({
        children: [
          cell("合计", { bold: true }),
          cell(String(data.devTotalPassed), { bold: true }),
          cell(String(data.devTotalEmerging), { bold: true }),
          cell(String(data.devTotalFailed), { bold: true }),
          cell(String(data.devTotalNotTested), { bold: true }),
          cell(""),
        ],
      }),
    ],
  });

  const devSection = [
    p("第三部分  发展领域计分总表", { bold: true }),
    ...devNarratives,
    p(""),
    devTable,
    p(""),
  ];

  const patNarratives = patSummary.flatMap((row) => [
    p(`${row.domain_label_zh}：${content.patDomainNarratives[row.domain] ?? ""}`),
  ]);

  const patTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          cell("病理/行为领域", { bold: true, width: 22 }),
          cell("A", { bold: true, width: 10 }),
          cell("M", { bold: true, width: 10 }),
          cell("S", { bold: true, width: 10 }),
          cell("NT", { bold: true, width: 10 }),
          cell("异常比例", { bold: true, width: 12 }),
        ],
      }),
      ...patSummary.map((row) => {
        const tested =
          Number(row.appropriate_count) +
          Number(row.mild_count) +
          Number(row.severe_count);
        const abnormal = Number(row.mild_count) + Number(row.severe_count);
        const rate =
          tested > 0 ? `${Math.round((abnormal / tested) * 100)}%` : "—";
        return new TableRow({
          children: [
            cell(row.domain_label_zh),
            cell(String(row.appropriate_count)),
            cell(String(row.mild_count)),
            cell(String(row.severe_count)),
            cell(String(row.not_tested_count)),
            cell(rate),
          ],
        });
      }),
    ],
  });

  const patSection = [
    p("第四部分  病理/行为表现计分总表", { bold: true }),
    ...patNarratives,
    p(""),
    patTable,
    p(""),
  ];

  const part5 = [
    p("第五部分  教育训练纲要与家长信息", { bold: true }),
    p("教育训练纲要：", { bold: true, size: SIZE_SMALL }),
    ...content.trainingOutline.split(/\n+/).filter(Boolean).map((t) => p(t)),
    p(""),
    p("受试者合作程度：", { bold: true, size: SIZE_SMALL }),
    p(content.cooperationLevel),
    p(""),
    p("家庭养育环境及家长期望：", { bold: true, size: SIZE_SMALL }),
    ...content.familyExpectations.split(/\n+/).filter(Boolean).map((t) => p(t)),
    p(""),
    p("第六部分  总结与建议", { bold: true }),
    ...content.summaryRecommendations.split(/\n+/).filter(Boolean).map((t) =>
      p(t),
    ),
    p(""),
    p(
      "备注：此评估结果是针对评估时学生所展现出的能力为依据所制定的评估报告。如您对评估报告有任何疑问，请联系评估师进行讲解。",
      { size: SIZE_SMALL },
    ),
    p(""),
    p("评估签字：________________"),
    p("家长签字：________________"),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...coverLines,
          ...part1,
          ...part2,
          ...devSection,
          ...patSection,
          ...part5,
        ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

export function getCpep3ReportFilename(
  studentName: string,
  sessionDate: string,
  ext: "docx" | "pdf",
): string {
  const date = sessionDate.slice(0, 10);
  return `C-PEP-3评估报告-${studentName}-${date}.${ext}`;
}

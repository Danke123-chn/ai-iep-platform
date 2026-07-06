import { formatDisabilityTypes, formatPlacementTypes } from "@/lib/types/student";
import { calculateStudentAge } from "@/lib/student-utils";
import type { Cpep3ReportData } from "@/lib/cpep3-report/types";
import {
  INFO_LABEL_WIDTH_6,
  INFO_VALUE_WIDTH_6,
  INFO_VALUE_WIDTH_6_LAST,
  wordLabelCell,
  wordTableLayout,
  wordTableRow,
  wordValueCell,
} from "@/lib/export/word-table-cells";
import {
  AlignmentType,
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TextRun,
} from "docx";

const FONT = "SimSun";
const SIZE_TITLE = 52;
const SIZE_NORMAL = 24;
const SIZE_SMALL = 21;

const DEV_TABLE_WIDTHS = [18, 10, 10, 10, 10, 12];
const PAT_TABLE_WIDTHS = [22, 10, 10, 10, 10, 12];

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
      ...wordTableLayout,
      rows: [
        new TableRow({
          children: [
            wordLabelCell("学生姓名", INFO_LABEL_WIDTH_6),
            wordValueCell(student.name, INFO_VALUE_WIDTH_6),
            wordLabelCell("学生性别", INFO_LABEL_WIDTH_6),
            wordValueCell(student.gender ?? "", INFO_VALUE_WIDTH_6),
            wordLabelCell("出生日期", INFO_LABEL_WIDTH_6),
            wordValueCell(formatBirthDate(student.birth_date), INFO_VALUE_WIDTH_6_LAST),
          ],
        }),
        new TableRow({
          children: [
            wordLabelCell("实际年龄"),
            wordValueCell(calculateStudentAge(student.birth_date)),
            wordLabelCell("诊断结果"),
            wordValueCell(formatDisabilityTypes(student.disability_types)),
          ],
        }),
        new TableRow({
          children: [
            wordLabelCell("目前安置形式"),
            wordValueCell(formatPlacementTypes(student.placement_types), 82, 3),
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
    ...wordTableLayout,
    rows: [
      wordTableRow(
        ["发展领域", "P", "E", "F", "NT", "通过率"],
        DEV_TABLE_WIDTHS,
        { header: true },
      ),
      ...devSummary.map((row) =>
        wordTableRow(
          [
            row.domain_label_zh,
            String(row.passed_count),
            String(row.emerging_count),
            String(row.failed_count),
            String(row.not_tested_count),
            `${Math.round(Number(row.pass_rate ?? 0))}%`,
          ],
          DEV_TABLE_WIDTHS,
        ),
      ),
      wordTableRow(
        [
          "合计",
          String(data.devTotalPassed),
          String(data.devTotalEmerging),
          String(data.devTotalFailed),
          String(data.devTotalNotTested),
          "",
        ],
        DEV_TABLE_WIDTHS,
      ),
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
    ...wordTableLayout,
    rows: [
      wordTableRow(
        ["病理/行为领域", "A", "M", "S", "NT", "异常比例"],
        PAT_TABLE_WIDTHS,
        { header: true },
      ),
      ...patSummary.map((row) => {
        const tested =
          Number(row.appropriate_count) +
          Number(row.mild_count) +
          Number(row.severe_count);
        const abnormal = Number(row.mild_count) + Number(row.severe_count);
        const rate =
          tested > 0 ? `${Math.round((abnormal / tested) * 100)}%` : "—";
        return wordTableRow(
          [
            row.domain_label_zh,
            String(row.appropriate_count),
            String(row.mild_count),
            String(row.severe_count),
            String(row.not_tested_count),
            rate,
          ],
          PAT_TABLE_WIDTHS,
        );
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

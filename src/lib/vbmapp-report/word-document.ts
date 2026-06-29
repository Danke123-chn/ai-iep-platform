import {
  getVbMappSeverityLabel,
  isVbMappNt,
} from "@/lib/types/assessment_types";
import { formatDisabilityTypes, formatPlacementTypes } from "@/lib/types/student";
import { levelLabelZh } from "@/lib/vbmapp-report/score-data";
import type { VbMappReportData } from "@/lib/vbmapp-report/types";
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
  opts?: { bold?: boolean; size?: number; alignment?: (typeof AlignmentType)[keyof typeof AlignmentType] },
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

export async function buildVbMappReportWordBuffer(
  data: VbMappReportData,
): Promise<Buffer> {
  const { student, session, reportContent, domainScores, barriers, transitions } =
    data;
  const content = reportContent;

  const coverLines = [
    p("评 估 报 告", { bold: true, size: SIZE_TITLE, alignment: AlignmentType.CENTER }),
    p(`评 估 人：${content.assessorName}`),
    p(`儿童姓名：${student.name}`),
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
            cell("诊断结果", { bold: true }),
            cell(formatDisabilityTypes(student.disability_types), { width: 35 }),
            cell("目前安置形式", { bold: true }),
            cell(formatPlacementTypes(student.placement_types), { width: 35 }),
          ],
        }),
        new TableRow({
          children: [
            cell("学校", { bold: true }),
            cell(student.school ?? "", { width: 35 }),
            cell("年级班级", { bold: true }),
            cell(`${student.grade ?? ""} ${student.class_name ?? ""}`.trim(), {
              width: 35,
            }),
          ],
        }),
        new TableRow({
          children: [
            cell("家长姓名", { bold: true }),
            cell(student.parent_name ?? "", { width: 35 }),
            cell("联系电话", { bold: true }),
            cell(student.parent_phone ?? "", { width: 35 }),
          ],
        }),
        new TableRow({
          children: [
            cell("备注", { bold: true }),
            cell(student.family_notes ?? "", { width: 85 }),
          ],
        }),
      ],
    }),
    p(""),
  ];

  const part2Intro = [
    p("第二部分  学生现阶段能力", { bold: true }),
    ...content.observationNarrative.split(/\n+/).filter(Boolean).map((t) => p(t)),
    p(content.overallConclusion),
    p(""),
    p("一、 VB-MAPP 里程碑计分总表", { bold: true }),
  ];

  const domainParagraphs = domainScores.map((row) =>
    p(`${row.domainLabel}：${content.domainNarratives[row.domain] ?? ""}`),
  );

  const scoreGrid = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          cell("领域", { bold: true, width: 16 }),
          cell("第一级得分", { bold: true, width: 14 }),
          cell("第二级得分", { bold: true, width: 14 }),
          cell("第三级得分", { bold: true, width: 14 }),
          cell("1分", { bold: true, width: 10 }),
          cell("1/2分", { bold: true, width: 10 }),
          cell("0分", { bold: true, width: 10 }),
          cell("未测", { bold: true, width: 12 }),
        ],
      }),
      ...domainScores.map(
        (row) =>
          new TableRow({
            children: [
              cell(row.domainLabel),
              cell(`${row.level1Score}/${row.level1Total}`),
              cell(`${row.level2Score}/${row.level2Total}`),
              cell(`${row.level3Score}/${row.level3Total}`),
              cell(String(row.passed)),
              cell(String(row.partial)),
              cell(String(row.failed)),
              cell(String(row.notTested)),
            ],
          }),
      ),
    ],
  });

  const barrierSection = [
    p(""),
    p("二、  VB-MAPP 障碍积分表", { bold: true }),
    p("障碍评估："),
    p(content.barrierNarrative),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            cell("序号", { bold: true, width: 8 }),
            cell("障碍项目", { bold: true, width: 52 }),
            cell("类别", { bold: true, width: 20 }),
            cell("严重度", { bold: true, width: 20 }),
          ],
        }),
        ...barriers.map((b, i) =>
          new TableRow({
            children: [
              cell(String(i + 1)),
              cell(b.barrier_name_zh),
              cell(b.category),
              cell(
                isVbMappNt(b.score)
                  ? "未测"
                  : getVbMappSeverityLabel(b.score),
              ),
            ],
          }),
        ),
      ],
    }),
  ];

  const transitionSection = [
    p(""),
    p("三、 VB-MAPP 转衔积分表", { bold: true }),
    p("转衔评估："),
    p(content.transitionNarrative),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            cell("序号", { bold: true, width: 8 }),
            cell("转衔项目", { bold: true, width: 52 }),
            cell("类别", { bold: true, width: 20 }),
            cell("得分", { bold: true, width: 20 }),
          ],
        }),
        ...transitions.map((t, i) =>
          new TableRow({
            children: [
              cell(String(i + 1)),
              cell(t.transition_name_zh),
              cell(t.category),
              cell(
                isVbMappNt(t.score)
                  ? "未测"
                  : getVbMappSeverityLabel(t.score),
              ),
            ],
          }),
        ),
      ],
    }),
  ];

  const part5 = [
    p(""),
    p("第五部分  总结与建议", { bold: true }),
    ...content.summaryRecommendations.split(/\n+/).filter(Boolean).map((t) => p(t)),
    p(""),
    p(
      "备注：此评估结果是针对评估时学生所展现出的能力为依据所制定的评估报告。如您对评估报告有任何疑问，请联系评估治疗师进行讲解。如您对评估结果没有意见，请签字，谢谢。",
      { size: SIZE_SMALL },
    ),
    p(""),
    p("评估签字：________________"),
    p("家长签字：________________"),
    p(`能力水平参考：${levelLabelZh(data.dominantLevel)}`, { size: SIZE_SMALL }),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...coverLines,
          ...part1,
          ...part2Intro,
          ...domainParagraphs,
          p(""),
          scoreGrid,
          ...barrierSection,
          ...transitionSection,
          ...part5,
        ],
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(doc));
}

export function getVbMappReportFilename(
  studentName: string,
  sessionDate: string,
  ext: "docx" | "pdf",
): string {
  const date = sessionDate.slice(0, 10);
  return `VB-MAPP评估报告-${studentName}-${date}.${ext}`;
}

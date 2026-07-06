import {
  getVbMappSeverityLabel,
  isVbMappNt,
} from "@/lib/types/assessment_types";
import { formatDisabilityTypes, formatPlacementTypes } from "@/lib/types/student";
import { levelLabelZh } from "@/lib/vbmapp-report/score-data";
import type { VbMappReportData } from "@/lib/vbmapp-report/types";
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

const SCORE_GRID_WIDTHS = [16, 14, 14, 14, 10, 10, 10, 12];
const ITEM_TABLE_WIDTHS = [8, 52, 20, 20];

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
            wordLabelCell("诊断结果"),
            wordValueCell(formatDisabilityTypes(student.disability_types)),
            wordLabelCell("目前安置形式"),
            wordValueCell(formatPlacementTypes(student.placement_types)),
          ],
        }),
        new TableRow({
          children: [
            wordLabelCell("学校"),
            wordValueCell(student.school ?? ""),
            wordLabelCell("年级班级"),
            wordValueCell(`${student.grade ?? ""} ${student.class_name ?? ""}`.trim()),
          ],
        }),
        new TableRow({
          children: [
            wordLabelCell("家长姓名"),
            wordValueCell(student.parent_name ?? ""),
            wordLabelCell("联系电话"),
            wordValueCell(student.parent_phone ?? ""),
          ],
        }),
        new TableRow({
          children: [
            wordLabelCell("备注"),
            wordValueCell(student.family_notes ?? "", 82, 3),
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
    ...wordTableLayout,
    rows: [
      wordTableRow(
        [
          "领域",
          "第一级得分",
          "第二级得分",
          "第三级得分",
          "1分",
          "1/2分",
          "0分",
          "未测",
        ],
        SCORE_GRID_WIDTHS,
        { header: true },
      ),
      ...domainScores.map((row) =>
        wordTableRow(
          [
            row.domainLabel,
            `${row.level1Score}/${row.level1Total}`,
            `${row.level2Score}/${row.level2Total}`,
            `${row.level3Score}/${row.level3Total}`,
            String(row.passed),
            String(row.partial),
            String(row.failed),
            String(row.notTested),
          ],
          SCORE_GRID_WIDTHS,
        ),
      ),
    ],
  });

  const barrierSection = [
    p(""),
    p("二、  VB-MAPP 障碍积分表", { bold: true }),
    p("障碍评估："),
    p(content.barrierNarrative),
    new Table({
      ...wordTableLayout,
      rows: [
        wordTableRow(
          ["序号", "障碍项目", "类别", "严重度"],
          ITEM_TABLE_WIDTHS,
          { header: true },
        ),
        ...barriers.map((b, i) =>
          wordTableRow(
            [
              String(i + 1),
              b.barrier_name_zh,
              b.category,
              isVbMappNt(b.score)
                ? "未测"
                : getVbMappSeverityLabel(b.score),
            ],
            ITEM_TABLE_WIDTHS,
          ),
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
      ...wordTableLayout,
      rows: [
        wordTableRow(
          ["序号", "转衔项目", "类别", "得分"],
          ITEM_TABLE_WIDTHS,
          { header: true },
        ),
        ...transitions.map((t, i) =>
          wordTableRow(
            [
              String(i + 1),
              t.transition_name_zh,
              t.category,
              isVbMappNt(t.score)
                ? "未测"
                : getVbMappSeverityLabel(t.score),
            ],
            ITEM_TABLE_WIDTHS,
          ),
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

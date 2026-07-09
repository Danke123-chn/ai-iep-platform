import type { ExtractedReportContent } from "@/lib/uploaded-report/extract-text";
import { truncateText } from "@/lib/uploaded-report/extract-text";
import { buildUploadInterpretSystemPrompt } from "@/lib/prompts/shared/expert-base";

export const UPLOAD_REPORT_SYSTEM_PROMPT = buildUploadInterpretSystemPrompt();

const UPLOAD_REPORT_JSON_SCHEMA = `只输出 JSON，不要 markdown：
{
  "studentProfile": {
    "name": "学生姓名（必填，从报告中提取）",
    "gender": "男 | 女 | null",
    "birth_date": "YYYY-MM-DD 或 null",
    "disability_types": ["孤独症","阿斯伯格","发育迟缓","注意力缺陷","情绪行为障碍","其他"],
    "school": "就读学校或 null",
    "grade": "年级或 null",
    "class_name": "班级或 null",
    "parent_name": "家长姓名或 null",
    "parent_phone": "11位手机号或 null",
    "family_notes": "家庭情况备注或 null"
  },
  "detectedToolType": "vb_mapp | c_pep3 | kg_integration | elem_integration | generic",
  "summary": "200字以内的评估总结",
  "reportAnalysis": "详细解读，含主要发现与建议",
  "strengths": "优势概述",
  "needs": "待支持需求概述",
  "domains": [
    { "key": "唯一标识", "name": "领域名称", "level": 1-5, "description": "该领域现状与依据" }
  ]
}

studentProfile 须从报告原文提取，无法确定的字段填 null，不得编造；name 若确实无法识别则填「待补充姓名」。
disability_types 仅使用上述枚举值，可多项；无法归类时使用「其他」。
domains 数量建议 6-12 个，须与报告中的评估结构一致；若无法判断具体工具，detectedToolType 填 generic，领域使用通用特教六大领域命名。
信息不完整或 OCR 不清处，在 description 中标注「待确认/待补充」，不得编造。`;

export function buildUploadReportTextPrompt(
  content: ExtractedReportContent,
  studentName?: string,
): string {
  const studentHint = studentName
    ? `已知学生姓名：${studentName}（请核对报告是否一致）`
    : "请从报告中提取学生基本信息（studentProfile）";

  return `请解读以下特殊教育评估报告全文，并输出结构化 JSON。

${studentHint}
文件名：${content.fileName}

报告正文：
${truncateText(content.text)}

请识别报告可能对应的评估工具（vb_mapp / c_pep3 / kg_integration / elem_integration / generic），提取 studentProfile 与各评估领域的现状等级（1-5，1=极重度困难，5=基本达标），并撰写解读。

${UPLOAD_REPORT_JSON_SCHEMA}`;
}

export function buildUploadReportImagePrompt(
  content: ExtractedReportContent,
  studentName?: string,
): string {
  const studentHint = studentName
    ? `已知学生姓名：${studentName}（请核对报告是否一致）`
    : "请从报告中提取学生基本信息（studentProfile）";

  return `以下是一张特殊教育评估报告的图片（base64）。请识别图中文字与表格，完成与文本报告相同的解读任务。

${studentHint}
文件名：${content.fileName}
图片 MIME：${content.mimeType}

图片 base64（可能较长，请尽力 OCR 识别）：
${truncateText(content.text, 8000)}

只输出 JSON，结构同文本报告解读要求。`;
}

import type { ExtractedReportContent } from "@/lib/uploaded-report/extract-text";
import { truncateText } from "@/lib/uploaded-report/extract-text";
import { buildUploadInterpretSystemPrompt } from "@/lib/prompts/shared/expert-base";

export const UPLOAD_REPORT_SYSTEM_PROMPT = buildUploadInterpretSystemPrompt();

const UPLOAD_REPORT_JSON_SCHEMA = `只输出 JSON，不要 markdown：
{
  "detectedToolType": "vb_mapp | c_pep3 | kg_integration | elem_integration | generic",
  "summary": "200字以内的评估总结",
  "reportAnalysis": "详细解读，含主要发现与建议",
  "strengths": "优势概述",
  "needs": "待支持需求概述",
  "domains": [
    { "key": "唯一标识", "name": "领域名称", "level": 1-5, "description": "该领域现状与依据" }
  ]
}

domains 数量建议 6-12 个，须与报告中的评估结构一致；若无法判断具体工具，detectedToolType 填 generic，领域使用通用特教六大领域命名。
信息不完整或 OCR 不清处，在 description 中标注「待确认/待补充」，不得编造。`;

export function buildUploadReportTextPrompt(
  content: ExtractedReportContent,
  studentName: string,
): string {
  return `请解读以下特殊教育评估报告全文，并输出结构化 JSON。

学生姓名：${studentName}
文件名：${content.fileName}

报告正文：
${truncateText(content.text)}

请识别报告可能对应的评估工具（vb_mapp / c_pep3 / kg_integration / elem_integration / generic），提取各评估领域的现状等级（1-5，1=极重度困难，5=基本达标），并撰写解读。

${UPLOAD_REPORT_JSON_SCHEMA}`;
}

export function buildUploadReportImagePrompt(
  content: ExtractedReportContent,
  studentName: string,
): string {
  return `以下是一张特殊教育评估报告的图片（base64）。请识别图中文字与表格，完成与文本报告相同的解读任务。

学生姓名：${studentName}
文件名：${content.fileName}
图片 MIME：${content.mimeType}

图片 base64（可能较长，请尽力 OCR 识别）：
${truncateText(content.text, 8000)}

只输出 JSON，结构同文本报告解读要求。`;
}

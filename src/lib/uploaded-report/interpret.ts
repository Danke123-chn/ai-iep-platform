import { chatCompletion } from "@/lib/deepseek";
import {
  buildUploadReportImagePrompt,
  buildUploadReportTextPrompt,
  UPLOAD_REPORT_SYSTEM_PROMPT,
} from "@/lib/prompts/upload/interpret";
import type { ExtractedReportContent } from "@/lib/uploaded-report/extract-text";
import { truncateText } from "@/lib/uploaded-report/extract-text";
import {
  detectedToolToDomainMode,
  normalizeInterpretationDomains,
  type DetectedReportTool,
  type UploadedReportInterpretation,
} from "@/lib/uploaded-report/types";

type RawInterpretation = {
  detectedToolType?: string;
  summary?: string;
  reportAnalysis?: string;
  strengths?: string;
  needs?: string;
  domains?: unknown;
};

function parseDetectedTool(value: string | undefined): DetectedReportTool {
  switch (value) {
    case "vb_mapp":
    case "c_pep3":
    case "kg_integration":
    case "elem_integration":
      return value;
    default:
      return "generic";
  }
}

function extractJsonObject(text: string): RawInterpretation {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("AI 返回格式无效，请重试");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as RawInterpretation;
}

export async function interpretUploadedReport(params: {
  content: ExtractedReportContent;
  studentName: string;
}): Promise<UploadedReportInterpretation> {
  const { content, studentName } = params;
  const userPrompt =
    content.kind === "image"
      ? buildUploadReportImagePrompt(content, studentName)
      : buildUploadReportTextPrompt(content, studentName);

  const response = await chatCompletion(
    [
      {
        role: "system",
        content: UPLOAD_REPORT_SYSTEM_PROMPT,
      },
      { role: "user", content: userPrompt },
    ],
    { timeoutMs: 120_000, jsonMode: true },
  );

  const raw = extractJsonObject(response.content);
  const detectedToolType = parseDetectedTool(raw.detectedToolType);
  const domains = normalizeInterpretationDomains(raw.domains);

  if (domains.length === 0) {
    throw new Error("AI 未能从报告中提取评估领域，请换一份更清晰的报告重试");
  }

  return {
    fileName: content.fileName,
    mimeType: content.mimeType,
    detectedToolType,
    domainMode: detectedToolToDomainMode(detectedToolType),
    summary: raw.summary?.trim() || "已完成报告解读。",
    reportAnalysis: raw.reportAnalysis?.trim() || "",
    strengths: raw.strengths?.trim() || "",
    needs: raw.needs?.trim() || "",
    domains,
    extractedTextPreview:
      content.kind === "text"
        ? truncateText(content.text, 500)
        : "（图片报告，已交由 AI 识别）",
    uploadedAt: new Date().toISOString(),
  };
}

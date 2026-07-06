const TEXT_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export type ExtractedReportContent = {
  kind: "text" | "image";
  text: string;
  mimeType: string;
  fileName: string;
};

function extensionOf(fileName: string): string {
  const match = fileName.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : "";
}

export function resolveUploadMimeType(file: File): string {
  if (file.type) return file.type;
  const ext = extensionOf(file.name);
  if (ext === "pdf") return "application/pdf";
  if (ext === "doc") return "application/msword";
  if (ext === "docx")
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return file.type;
}

export function isSupportedUploadMime(mimeType: string): boolean {
  return TEXT_MIME_TYPES.has(mimeType) || IMAGE_MIME_TYPES.has(mimeType);
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  const merged = Array.isArray(text) ? text.join("\n\n") : text;
  return merged?.trim() ?? "";
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value?.trim() ?? "";
}

export async function extractReportContent(
  file: File,
): Promise<ExtractedReportContent> {
  const mimeType = resolveUploadMimeType(file);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (mimeType === "application/pdf") {
    const text = await extractPdfText(buffer);
    if (!text) {
      throw new Error("未能从 PDF 中提取文字，请尝试上传 Word 或更清晰的扫描件");
    }
    return { kind: "text", text, mimeType, fileName: file.name };
  }

  if (
    mimeType === "application/msword" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    if (mimeType.endsWith("wordprocessingml.document") || file.name.endsWith(".docx")) {
      const text = await extractDocxText(buffer);
      if (!text) {
        throw new Error("未能从 Word 文档中提取文字，请确认文件未加密");
      }
      return { kind: "text", text, mimeType, fileName: file.name };
    }
    throw new Error("暂不支持 .doc 格式，请将文件另存为 .docx 后上传");
  }

  if (IMAGE_MIME_TYPES.has(mimeType)) {
    return {
      kind: "image",
      text: buffer.toString("base64"),
      mimeType,
      fileName: file.name,
    };
  }

  throw new Error("不支持的文件格式，请上传 Word、PDF 或图片（JPG/PNG/WebP）");
}

export function truncateText(text: string, max = 12000): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n\n…（内容已截断，仅分析前 ${max} 字）`;
}

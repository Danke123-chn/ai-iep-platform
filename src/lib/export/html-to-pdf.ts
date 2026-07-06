"use client";

type PdfMargins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type JsPdfDoc = {
  internal: {
    pageSize: {
      getWidth(): number;
      getHeight(): number;
    };
  };
  addPage(): void;
  addImage(
    imageData: string,
    format: string,
    x: number,
    y: number,
    width: number,
    height: number,
    alias?: string,
    compression?: string,
  ): void;
  setPage(page: number): void;
  setFontSize(size: number): void;
  setTextColor(r: number, g: number, b: number): void;
  text(
    text: string,
    x: number,
    y: number,
    options?: { align?: "left" | "center" | "right" | "justify" },
  ): void;
  save(filename: string): void;
  getNumberOfPages(): number;
};

type Html2CanvasFn = (
  element: HTMLElement,
  options?: Record<string, unknown>,
) => Promise<HTMLCanvasElement>;

type JsPdfConstructor = new (options?: {
  orientation?: "portrait" | "landscape";
  unit?: string;
  format?: string;
}) => JsPdfDoc;

const PDF_INLINE_PROPS = [
  "display",
  "position",
  "box-sizing",
  "width",
  "height",
  "min-width",
  "min-height",
  "max-width",
  "max-height",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-top-style",
  "border-right-style",
  "border-bottom-style",
  "border-left-style",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "border-radius",
  "border-collapse",
  "table-layout",
  "flex",
  "flex-direction",
  "flex-wrap",
  "align-items",
  "align-self",
  "justify-content",
  "gap",
  "grid-template-columns",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "letter-spacing",
  "text-align",
  "text-decoration",
  "white-space",
  "word-break",
  "vertical-align",
  "color",
  "background-color",
  "opacity",
] as const;

const UNSUPPORTED_COLOR_FN = /lab\(|oklch\(|lch\(|color-mix\(/i;

type KeepTogetherRect = {
  top: number;
  bottom: number;
  kind: "table" | "row" | "block" | "line";
  /** 整块内容高度（canvas 像素），用于判断是否需要整体移到下一页 */
  blockHeight?: number;
};

/** 表格行超过此高度（CSS px）时，才在单元格内按行分页 */
const MAX_ATOMIC_ROW_CSS_PX = 680;

function isNestedInTable(el: Element): boolean {
  if (el.tagName.toLowerCase() === "table") return false;
  return Boolean(el.closest("table"));
}

function getRelativeBox(
  box: { top: number; bottom: number },
  rootRect: DOMRect,
  scale: number,
  buffer: number,
): { top: number; bottom: number; height: number } {
  const top = (box.top - rootRect.top) * scale - buffer;
  const bottom = (box.bottom - rootRect.top) * scale + buffer;
  return { top, bottom, height: bottom - top };
}

function pushRect(
  rects: KeepTogetherRect[],
  top: number,
  bottom: number,
  kind: KeepTogetherRect["kind"],
  extraBottom = 0,
): void {
  const paddedBottom = bottom + extraBottom;
  if (paddedBottom - top < 1) return;
  rects.push({ top, bottom: paddedBottom, kind });
}

function addElementLineRects(
  el: Element,
  root: HTMLElement,
  rootRect: DOMRect,
  scale: number,
  buffer: number,
  rects: KeepTogetherRect[],
  allowInTable = false,
): void {
  if (!allowInTable && el.closest("table")) return;

  const lines = el.getClientRects();
  if (lines.length === 0) {
    const box = el.getBoundingClientRect();
    const rect = getRelativeBox(box, rootRect, scale, buffer);
    pushRect(rects, rect.top, rect.bottom, "line");
    return;
  }

  const linePadding = Math.max(2, Math.round(scale * 1.5));
  for (const line of lines) {
    if (line.height < 1) continue;
    const rect = getRelativeBox(line, rootRect, scale, buffer);
    pushRect(rects, rect.top, rect.bottom, "line", linePadding);
  }
}

function collectKeepTogetherRects(
  root: HTMLElement,
  scale: number,
): KeepTogetherRect[] {
  const rects: KeepTogetherRect[] = [];
  const rootRect = root.getBoundingClientRect();
  const buffer = Math.max(4, Math.round(scale * 4));
  const blockBuffer = Math.max(8, Math.round(scale * 6));
  const rowBuffer = Math.max(4, Math.round(scale * 2));

  for (const el of root.querySelectorAll("[data-pdf-keep-with-next]")) {
    const next = el.nextElementSibling;
    if (!(next instanceof HTMLElement)) continue;

    const headRect = el.getBoundingClientRect();
    let tailBottom = next.getBoundingClientRect().bottom;

    if (next.tagName.toLowerCase() === "table") {
      const firstBodyRow = next.querySelector("tbody tr");
      const theadRow = next.querySelector("thead tr");
      if (firstBodyRow) {
        tailBottom = firstBodyRow.getBoundingClientRect().bottom;
      } else if (theadRow) {
        tailBottom = theadRow.getBoundingClientRect().bottom;
      }
    }

    const top = (headRect.top - rootRect.top) * scale - buffer;
    const bottom = (tailBottom - rootRect.top) * scale + buffer;
    const height = bottom - top;
    pushRect(rects, top, bottom, "block", blockBuffer);
    const last = rects[rects.length - 1];
    if (last) last.blockHeight = height;
  }

  for (const table of root.querySelectorAll("table")) {
    const theadRow = table.querySelector("thead tr");
    const firstBodyRow = table.querySelector("tbody tr");
    if (theadRow && firstBodyRow) {
      const headBox = theadRow.getBoundingClientRect();
      const bodyBox = firstBodyRow.getBoundingClientRect();
      const top = (headBox.top - rootRect.top) * scale - buffer;
      const bottom = (bodyBox.bottom - rootRect.top) * scale + rowBuffer;
      const height = bottom - top;
      pushRect(rects, top, bottom, "block", rowBuffer);
      const last = rects[rects.length - 1];
      if (last) last.blockHeight = height;
    }

    for (const row of table.querySelectorAll("tr")) {
      const rawBox = row.getBoundingClientRect();
      const rowBox = getRelativeBox(rawBox, rootRect, scale, buffer);
      pushRect(
        rects,
        rowBox.top,
        rowBox.bottom,
        "row",
        rowBuffer,
      );
      const last = rects[rects.length - 1];
      if (last) {
        last.blockHeight = rowBox.height;
      }

      if (rawBox.height > MAX_ATOMIC_ROW_CSS_PX) {
        for (const cell of row.querySelectorAll("th, td")) {
          addElementLineRects(cell, root, rootRect, scale, buffer, rects, true);
        }
      }
    }
  }

  for (const block of root.querySelectorAll(
    "[data-pdf-keep-together], [data-pdf-block]",
  )) {
    if (isNestedInTable(block)) continue;
    const rawBox = block.getBoundingClientRect();
    const box = getRelativeBox(rawBox, rootRect, scale, blockBuffer);
    pushRect(rects, box.top, box.bottom, "block", Math.max(4, Math.round(scale * 2)));
    const last = rects[rects.length - 1];
    if (last) {
      last.blockHeight = box.height;
    }

    for (const el of block.querySelectorAll(
      "p, h1, h2, h3, h4, li, pre, [data-pdf-text-block]",
    )) {
      addElementLineRects(el, root, rootRect, scale, buffer, rects);
    }
  }

  const lineSelectors = [
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "label",
    "li",
    "input",
    "[data-pdf-text-block]",
  ].join(", ");

  for (const el of root.querySelectorAll(lineSelectors)) {
    if (el.closest("[data-pdf-keep-together], [data-pdf-block]")) continue;
    addElementLineRects(el, root, rootRect, scale, buffer, rects);
  }

  return rects.sort((a, b) => a.top - b.top);
}

function wouldSplitAt(y: number, rects: KeepTogetherRect[]): boolean {
  const eps = 1;
  return rects.some((rect) => rect.top + eps < y && y < rect.bottom - eps);
}

function findNextSliceEnd(
  yStart: number,
  pageHeightPx: number,
  canvasHeight: number,
  keepTogether: KeepTogetherRect[],
): number {
  const idealEnd = Math.min(yStart + pageHeightPx, canvasHeight);
  if (idealEnd >= canvasHeight) return canvasHeight;

  if (!wouldSplitAt(idealEnd, keepTogether)) {
    return idealEnd;
  }

  const minSlicePx = Math.max(12, Math.floor(pageHeightPx * 0.02));
  const candidates = new Set<number>();

  for (const rect of keepTogether) {
    if (rect.kind === "block" || rect.kind === "row") {
      const unitHeight = rect.blockHeight ?? rect.bottom - rect.top;
      const crossesBreak = rect.top < idealEnd && rect.bottom > idealEnd;
      if (crossesBreak && unitHeight <= pageHeightPx && rect.top > yStart) {
        candidates.add(rect.top);
      }
    }

    if (rect.top > yStart && rect.top <= idealEnd) {
      candidates.add(rect.top);
    }
    if (rect.bottom > yStart && rect.bottom <= idealEnd) {
      candidates.add(rect.bottom);
    }
    if (rect.top < idealEnd && rect.bottom > idealEnd && rect.top > yStart) {
      candidates.add(rect.top);
    }
  }

  const valid = [...candidates]
    .filter((y) => y > yStart + minSlicePx)
    .filter((y) => !wouldSplitAt(y, keepTogether))
    .sort((a, b) => b - a);

  if (valid.length > 0) {
    return valid[0];
  }

  const blockers = keepTogether
    .filter((rect) => rect.top < idealEnd && rect.bottom > idealEnd)
    .sort((a, b) => {
      const priority = (rect: KeepTogetherRect) =>
        rect.kind === "row" || rect.kind === "block" ? 0 : 1;
      const byKind = priority(a) - priority(b);
      if (byKind !== 0) return byKind;
      return a.top - b.top;
    });

  if (blockers.length > 0) {
    const breakAt = blockers[0].top;
    if (breakAt > yStart) {
      return breakAt;
    }
  }

  for (let y = Math.floor(idealEnd); y > yStart + minSlicePx; y -= 1) {
    if (!wouldSplitAt(y, keepTogether)) {
      return y;
    }
  }

  if (blockers.length > 0 && blockers[0].top > yStart) {
    return blockers[0].top;
  }

  return idealEnd;
}

function getVisiblePdfBlocks(
  root: HTMLElement,
  selector: string,
): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
    (block) => {
      if (!root.contains(block)) return false;
      const style = window.getComputedStyle(block);
      if (style.display === "none" || style.visibility === "hidden") {
        return false;
      }
      const rect = block.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    },
  );
}

type PageCursor = {
  y: number;
};

function ensurePdfPageSpace(
  pdf: JsPdfDoc,
  cursor: PageCursor,
  neededHeightMm: number,
  margins: PdfMargins,
  pageHeightMm: number,
): void {
  const maxY = margins.top + (pageHeightMm - margins.top - margins.bottom);
  if (cursor.y + neededHeightMm > maxY + 0.5) {
    pdf.addPage();
    cursor.y = margins.top;
  }
}

function renderCanvasSliceToPdf(
  pdf: JsPdfDoc,
  canvas: HTMLCanvasElement,
  yOffsetPx: number,
  sliceHeightPx: number,
  cursor: PageCursor,
  margins: PdfMargins,
  contentWidthMm: number,
): number {
  const sliceCanvas = document.createElement("canvas");
  sliceCanvas.width = canvas.width;
  sliceCanvas.height = sliceHeightPx;

  const ctx = sliceCanvas.getContext("2d");
  if (!ctx) {
    throw new Error("无法创建 PDF 画布");
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, sliceCanvas.width, sliceHeightPx);
  ctx.drawImage(
    canvas,
    0,
    yOffsetPx,
    canvas.width,
    sliceHeightPx,
    0,
    0,
    canvas.width,
    sliceHeightPx,
  );

  const sliceHeightMm = (sliceHeightPx * contentWidthMm) / canvas.width;
  const imageData = sliceCanvas.toDataURL("image/png");

  pdf.addImage(
    imageData,
    "PNG",
    margins.left,
    cursor.y,
    contentWidthMm,
    sliceHeightMm,
  );

  return sliceHeightMm;
}

function placeCanvasOnPdf(
  pdf: JsPdfDoc,
  canvas: HTMLCanvasElement,
  cursor: PageCursor,
  margins: PdfMargins,
  blockGapMm: number,
): void {
  const pageHeightMm = pdf.internal.pageSize.getHeight();
  const contentWidthMm =
    pdf.internal.pageSize.getWidth() - margins.left - margins.right;
  const maxContentHeightMm = pageHeightMm - margins.top - margins.bottom;
  const blockHeightMm = (canvas.height * contentWidthMm) / canvas.width;

  if (blockHeightMm <= maxContentHeightMm) {
    ensurePdfPageSpace(pdf, cursor, blockHeightMm, margins, pageHeightMm);
    renderCanvasSliceToPdf(
      pdf,
      canvas,
      0,
      canvas.height,
      cursor,
      margins,
      contentWidthMm,
    );
    cursor.y += blockHeightMm + blockGapMm;
    return;
  }

  const pageHeightPx = Math.floor(
    (maxContentHeightMm * canvas.width) / contentWidthMm,
  );
  if (pageHeightPx <= 0) {
    throw new Error("PDF 页面尺寸无效");
  }

  let yOffsetPx = 0;
  while (yOffsetPx < canvas.height) {
    const sliceHeightPx = Math.min(pageHeightPx, canvas.height - yOffsetPx);
    const sliceHeightMm = (sliceHeightPx * contentWidthMm) / canvas.width;
    ensurePdfPageSpace(pdf, cursor, sliceHeightMm, margins, pageHeightMm);
    renderCanvasSliceToPdf(
      pdf,
      canvas,
      yOffsetPx,
      sliceHeightPx,
      cursor,
      margins,
      contentWidthMm,
    );
    yOffsetPx += sliceHeightPx;
    if (yOffsetPx < canvas.height) {
      pdf.addPage();
      cursor.y = margins.top;
    } else {
      cursor.y += blockGapMm;
    }
  }
}

export type ExportHtmlToPdfOptions = {
  filename: string;
  margin?: number | number[];
  scale?: number;
  headerText?: string;
  footerText?: string;
};

export type ExportBlocksToPdfOptions = ExportHtmlToPdfOptions & {
  blockSelector?: string;
  blockGapMm?: number;
};

/** 按 DOM 块逐段截图并排版，适合 IEP 等卡片式文档 */
export async function exportBlocksToPdf(
  element: HTMLElement,
  options: ExportBlocksToPdfOptions,
): Promise<void> {
  const blockSelector = options.blockSelector ?? "[data-pdf-block]";
  const blockGapMm = options.blockGapMm ?? 4;
  const { html2canvas, jsPDF } = await loadPdfLibs();
  const margins = parseMargin(options.margin);
  const restoreLayout = prepareElementLayout(element);
  const restoreTextareaHeight = expandTextareasForPdf(element);
  await waitForLayout();
  const restoreTextareas = swapTextareasForPdf(element);
  await waitForLayout();

  const hadExportClass = element.classList.contains("pdf-export-mode");
  if (!hadExportClass) {
    element.classList.add("pdf-export-mode");
  }
  document.body.classList.add("pdf-export-active");

  const scale = options.scale ?? 2;

  try {
    await waitForLayout();
    const blocks = getVisiblePdfBlocks(element, blockSelector);
    if (blocks.length === 0) {
      throw new Error("未找到可导出的 PDF 内容块");
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const cursor: PageCursor = { y: margins.top };

    for (const block of blocks) {
      const canvas = await html2canvas(block, {
        scale,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        scrollX: 0,
        scrollY: 0,
        width: block.scrollWidth,
        height: block.scrollHeight,
        windowWidth: block.scrollWidth,
        onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
          prepareClonedDocumentForCapture(clonedDoc, clonedElement);
        },
      });

      placeCanvasOnPdf(pdf, canvas, cursor, margins, blockGapMm);
    }

    addHeaderFooter(
      pdf,
      margins,
      options.headerText,
      options.footerText,
    );
    pdf.save(options.filename);
  } finally {
    if (!hadExportClass) {
      element.classList.remove("pdf-export-mode");
    }
    document.body.classList.remove("pdf-export-active");
    restoreTextareas();
    restoreTextareaHeight();
    restoreLayout();
  }
}

function computeSliceBoundaries(
  canvasHeight: number,
  pageHeightPx: number,
  keepTogether: KeepTogetherRect[],
): number[] {
  const boundaries = [0];
  let yStart = 0;

  while (yStart < canvasHeight - 1) {
    const yEnd = findNextSliceEnd(
      yStart,
      pageHeightPx,
      canvasHeight,
      keepTogether,
    );
    boundaries.push(yEnd);
    if (yEnd >= canvasHeight) break;
    if (yEnd <= yStart) {
      boundaries.push(Math.min(yStart + pageHeightPx, canvasHeight));
      break;
    }
    yStart = yEnd;
  }

  if (boundaries[boundaries.length - 1] < canvasHeight) {
    boundaries.push(canvasHeight);
  }

  return boundaries;
}

let pdfLibsLoader: Promise<{
  html2canvas: Html2CanvasFn;
  jsPDF: JsPdfConstructor;
}> | null = null;

function parseMargin(margin?: number | number[]): PdfMargins {
  if (typeof margin === "number") {
    return { top: margin, right: margin, bottom: margin, left: margin };
  }
  if (Array.isArray(margin)) {
    if (margin.length >= 4) {
      return {
        top: margin[0],
        right: margin[1],
        bottom: margin[2],
        left: margin[3],
      };
    }
    if (margin.length === 2) {
      return {
        top: margin[0],
        right: margin[1],
        bottom: margin[0],
        left: margin[1],
      };
    }
    if (margin.length === 1) {
      const value = margin[0];
      return { top: value, right: value, bottom: value, left: value };
    }
  }
  return { top: 15, right: 12, bottom: 15, left: 12 };
}

async function loadPdfLibs() {
  if (typeof window === "undefined") {
    throw new Error("PDF 导出仅支持在浏览器中使用");
  }

  if (!pdfLibsLoader) {
    pdfLibsLoader = Promise.all([import("html2canvas"), import("jspdf")]).then(
      ([html2canvasModule, jspdfModule]) => {
        const html2canvasCandidate =
          (html2canvasModule as { default?: Html2CanvasFn }).default ??
          (html2canvasModule as unknown as Html2CanvasFn);
        const jsPDFCandidate =
          (jspdfModule as { jsPDF?: JsPdfConstructor }).jsPDF ??
          (jspdfModule as { default?: { jsPDF?: JsPdfConstructor } }).default
            ?.jsPDF;

        if (typeof html2canvasCandidate !== "function") {
          throw new Error("无法加载 html2canvas");
        }
        if (typeof jsPDFCandidate !== "function") {
          throw new Error("无法加载 jsPDF");
        }

        return {
          html2canvas: html2canvasCandidate,
          jsPDF: jsPDFCandidate,
        };
      },
    );
  }

  return pdfLibsLoader;
}

async function waitForLayout(): Promise<void> {
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function stripUnsupportedStylesheets(doc: Document): void {
  doc.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
    node.remove();
  });
}

function inlineResolvedStyles(root: HTMLElement, doc: Document): void {
  const view = doc.defaultView;
  if (!view) return;

  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];
  for (const el of elements) {
    const computed = view.getComputedStyle(el);
    for (const prop of PDF_INLINE_PROPS) {
      const value = computed.getPropertyValue(prop);
      if (!value || value === "initial" || value === "inherit") continue;
      if (UNSUPPORTED_COLOR_FN.test(value)) continue;
      el.style.setProperty(prop, value);
    }
  }
}

function prepareClonedDocumentForCapture(
  clonedDoc: Document,
  clonedElement: HTMLElement,
): void {
  inlineResolvedStyles(clonedElement, clonedDoc);
  stripUnsupportedStylesheets(clonedDoc);
}

function prepareElementLayout(element: HTMLElement): () => void {
  const prev = {
    overflow: element.style.overflow,
    maxHeight: element.style.maxHeight,
    boxShadow: element.style.boxShadow,
  };

  element.style.overflow = "visible";
  element.style.maxHeight = "none";
  element.style.boxShadow = "none";
  element.scrollTop = 0;
  element.scrollIntoView({ block: "start", inline: "nearest" });

  return () => {
    element.style.overflow = prev.overflow;
    element.style.maxHeight = prev.maxHeight;
    element.style.boxShadow = prev.boxShadow;
  };
}

function expandTextareasForPdf(element: HTMLElement): () => void {
  const saved: Array<{
    textarea: HTMLTextAreaElement;
    height: string;
    overflow: string;
  }> = [];

  for (const textarea of element.querySelectorAll("textarea")) {
    saved.push({
      textarea,
      height: textarea.style.height,
      overflow: textarea.style.overflow,
    });
    textarea.style.height = `${textarea.scrollHeight}px`;
    textarea.style.overflow = "hidden";
  }

  return () => {
    for (const { textarea, height, overflow } of saved) {
      textarea.style.height = height;
      textarea.style.overflow = overflow;
    }
  };
}

function swapTextareasForPdf(element: HTMLElement): () => void {
  const replacements: Array<{
    textarea: HTMLTextAreaElement;
    div: HTMLDivElement;
  }> = [];

  for (const textarea of element.querySelectorAll("textarea")) {
    const contentHeight = Math.max(textarea.scrollHeight, textarea.offsetHeight, 48);
    const div = document.createElement("div");
    div.textContent = textarea.value;
    div.className = textarea.className;
    div.style.whiteSpace = "pre-wrap";
    div.style.width = "100%";
    div.style.border = "1px solid #d4d4d8";
    div.style.borderRadius = "4px";
    div.style.padding = "8px 12px";
    div.style.fontSize = "14px";
    div.style.lineHeight = "1.625";
    div.style.color = "#18181b";
    div.style.backgroundColor = "#ffffff";
    div.style.minHeight = `${contentHeight}px`;
    div.style.height = `${contentHeight}px`;
    div.style.boxSizing = "border-box";
    div.style.overflow = "visible";
    div.dataset.pdfTextBlock = "true";

    textarea.insertAdjacentElement("beforebegin", div);
    textarea.style.display = "none";
    replacements.push({ textarea, div });
  }

  return () => {
    for (const { textarea, div } of replacements) {
      textarea.style.display = "";
      div.remove();
    }
  };
}

/** 按页裁剪 canvas，并在表格行/整块内容边界处分页 */
function addCanvasToPdf(
  pdf: JsPdfDoc,
  canvas: HTMLCanvasElement,
  margins: PdfMargins,
  sliceBoundaries: number[],
): void {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margins.left - margins.right;

  const canvasWidth = canvas.width;

  for (let pageIndex = 1; pageIndex < sliceBoundaries.length; pageIndex++) {
    if (pageIndex > 1) {
      pdf.addPage();
    }

    const yOffset = sliceBoundaries[pageIndex - 1];
    const yEnd = sliceBoundaries[pageIndex];
    const sliceHeight = yEnd - yOffset;

    if (sliceHeight <= 0) continue;

    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvasWidth;
    sliceCanvas.height = sliceHeight;

    const ctx = sliceCanvas.getContext("2d");
    if (!ctx) {
      throw new Error("无法创建 PDF 画布");
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasWidth, sliceHeight);
    ctx.drawImage(
      canvas,
      0,
      yOffset,
      canvasWidth,
      sliceHeight,
      0,
      0,
      canvasWidth,
      sliceHeight,
    );

    const sliceData = sliceCanvas.toDataURL("image/png");
    const sliceHeightMm = (sliceHeight * contentWidth) / canvasWidth;

    pdf.addImage(
      sliceData,
      "PNG",
      margins.left,
      margins.top,
      contentWidth,
      sliceHeightMm,
    );
  }
}

function isAsciiOnly(text: string): boolean {
  return /^[\x20-\x7E]*$/.test(text);
}

function addHeaderFooter(
  pdf: JsPdfDoc,
  margins: PdfMargins,
  headerText?: string,
  footerText?: string,
): void {
  if (!headerText && !footerText) return;

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const totalPages = pdf.getNumberOfPages();

  for (let page = 1; page <= totalPages; page++) {
    pdf.setPage(page);
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);

    if (headerText && isAsciiOnly(headerText)) {
      pdf.text(headerText, margins.left, Math.max(8, margins.top - 6));
    }

    if (footerText && isAsciiOnly(footerText)) {
      pdf.text(
        footerText
          .replace("{page}", String(page))
          .replace("{total}", String(totalPages)),
        pageWidth - margins.right,
        pageHeight - Math.max(6, margins.bottom - 6),
        { align: "right" },
      );
    }
  }
}

export async function exportHtmlToPdf(
  element: HTMLElement,
  options: ExportHtmlToPdfOptions,
): Promise<void> {
  const { html2canvas, jsPDF } = await loadPdfLibs();
  const margins = parseMargin(options.margin);
  const restoreLayout = prepareElementLayout(element);
  const restoreTextareaHeight = expandTextareasForPdf(element);
  await waitForLayout();
  const restoreTextareas = swapTextareasForPdf(element);
  await waitForLayout();

  const hadExportClass = element.classList.contains("pdf-export-mode");
  if (!hadExportClass) {
    element.classList.add("pdf-export-mode");
  }
  document.body.classList.add("pdf-export-active");

  const scale = options.scale ?? 2;

  try {
    await waitForLayout();
    const keepTogetherRects = collectKeepTogetherRects(element, scale);

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      width: element.scrollWidth,
      height: element.scrollHeight,
      onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
        prepareClonedDocumentForCapture(clonedDoc, clonedElement);
      },
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeightMm = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - margins.left - margins.right;
    const contentHeight = pageHeightMm - margins.top - margins.bottom;
    const pageHeightPx = Math.floor((contentHeight * canvas.width) / contentWidth);

    if (pageHeightPx <= 0) {
      throw new Error("PDF 页面尺寸无效");
    }

    const expectedHeight = element.scrollHeight * scale;
    const heightScale =
      expectedHeight > 0 ? canvas.height / expectedHeight : 1;
    const adjustedRects = keepTogetherRects.map((rect) => ({
      ...rect,
      top: rect.top * heightScale,
      bottom: rect.bottom * heightScale,
      blockHeight: rect.blockHeight
        ? rect.blockHeight * heightScale
        : undefined,
    }));

    const sliceBoundaries = computeSliceBoundaries(
      canvas.height,
      pageHeightPx,
      adjustedRects,
    );

    addCanvasToPdf(pdf, canvas, margins, sliceBoundaries);
    addHeaderFooter(
      pdf,
      margins,
      options.headerText,
      options.footerText,
    );
    pdf.save(options.filename);
  } finally {
    if (!hadExportClass) {
      element.classList.remove("pdf-export-mode");
    }
    document.body.classList.remove("pdf-export-active");
    restoreTextareas();
    restoreTextareaHeight();
    restoreLayout();
  }
}

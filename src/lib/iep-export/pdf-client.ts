"use client";

import type { IepExportData } from "@/lib/iep-export/types";
import { getIepExportFilename } from "@/lib/iep-export/filenames";
import { exportHtmlToPdf } from "@/lib/export/html-to-pdf";

export async function exportIepToPdf(
  element: HTMLElement,
  data: IepExportData,
): Promise<void> {
  const filename = getIepExportFilename(
    data.student?.name ?? "学生",
    data.iep.school_year,
    "pdf",
  );

  const wrapper = element.parentElement;
  const prevWrapperStyle = wrapper?.getAttribute("style") ?? "";
  const prevElementStyle = element.getAttribute("style") ?? "";

  if (wrapper) {
    wrapper.style.cssText =
      "position:fixed;left:0;top:0;z-index:99999;pointer-events:none;background:#ffffff;";
  }
  element.style.opacity = "1";

  try {
    await exportHtmlToPdf(element, {
      filename,
      margin: [15, 15, 15, 15],
      scale: 2,
    });
  } finally {
    if (wrapper) {
      if (prevWrapperStyle) wrapper.setAttribute("style", prevWrapperStyle);
      else wrapper.removeAttribute("style");
    }
    if (prevElementStyle) element.setAttribute("style", prevElementStyle);
    else element.removeAttribute("style");
  }
}

export async function downloadExportFile(
  iepId: string,
  format: "word" | "progress",
): Promise<void> {
  const response = await fetch(`/api/iep/${iepId}/export?format=${format}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error ?? "导出失败");
  }

  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename\*=UTF-8''(.+)|filename="(.+)"/);
  const filename = decodeURIComponent(
    match?.[1] ?? match?.[2] ?? `export.${format === "word" ? "docx" : "docx"}`,
  );

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

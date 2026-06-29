"use client";

import type { IepExportData } from "@/lib/iep-export/types";
import { getIepExportFilename } from "@/lib/iep-export/filenames";

export async function exportIepToPdf(
  element: HTMLElement,
  data: IepExportData,
): Promise<void> {
  const html2pdf = (await import("html2pdf.js")).default;
  const filename = getIepExportFilename(
    data.student?.name ?? "学生",
    data.iep.school_year,
    "pdf",
  );

  element.classList.add("pdf-export-mode");
  document.body.classList.add("pdf-export-active");

  try {
    const worker = html2pdf().set({
      margin: [20, 15, 20, 15],
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    });

    const pdf = await worker.from(element).toPdf().get("pdf");

    const totalPages = pdf.internal.getNumberOfPages();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text("个别化教育计划（IEP）", 15, 10);
      pdf.text(
        `第 ${i} 页 / 共 ${totalPages} 页`,
        pageWidth - 15,
        pageHeight - 8,
        { align: "right" },
      );
    }

    pdf.save(filename);
  } finally {
    element.classList.remove("pdf-export-mode");
    document.body.classList.remove("pdf-export-active");
  }
}

export async function downloadExportFile(
  iepId: string,
  format: "word" | "progress",
): Promise<void> {
  const response = await fetch(`/api/iep/${iepId}/export?format=${format}`);

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

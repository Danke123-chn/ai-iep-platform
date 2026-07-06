/** 导出 PDF 前临时展开内容，导出后还原 */
export function prepareIepDocumentForPdf(root: HTMLElement): () => void {
  const restored: Array<{ el: HTMLElement; hadHidden: boolean }> = [];

  for (const el of root.querySelectorAll<HTMLElement>(
    "article .border-t, article .pdf-goal-header",
  )) {
    if (el.classList.contains("hidden")) {
      restored.push({ el, hadHidden: true });
      el.classList.remove("hidden");
      el.classList.add("pdf-export-expanded");
    }
  }

  return () => {
    for (const { el, hadHidden } of restored) {
      el.classList.remove("pdf-export-expanded");
      if (hadHidden) {
        el.classList.add("hidden");
      }
    }
  };
}

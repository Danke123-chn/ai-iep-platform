declare module "jspdf-autotable" {
  import type { jsPDF } from "jspdf";

  interface AutoTableOptions {
    startY?: number;
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
    head?: string[][];
    body?: string[][];
    styles?: Record<string, unknown>;
    headStyles?: Record<string, unknown>;
  }

  export default function autoTable(doc: jsPDF, options: AutoTableOptions): void;
}

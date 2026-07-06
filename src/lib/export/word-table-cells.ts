import {
  AlignmentType,
  BorderStyle,
  Paragraph,
  ShadingType,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";

export const WORD_TABLE_FONT = "SimSun";
export const WORD_TABLE_SIZE = 21;

/** 四列基本信息表：标签 | 值 | 标签 | 值 */
export const INFO_LABEL_WIDTH = 18;
export const INFO_VALUE_WIDTH = 32;

/** 六列基本信息表（首行）：标签 | 值 × 3 组 */
export const INFO_LABEL_WIDTH_6 = 12;
export const INFO_VALUE_WIDTH_6 = 21;
export const INFO_VALUE_WIDTH_6_LAST = 22;

const cellBorder = {
  top: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
  left: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
  right: { style: BorderStyle.SINGLE, size: 1, color: "999999" },
};

const cellMargins = {
  top: 80,
  bottom: 80,
  left: 140,
  right: 140,
};

export const wordTableLayout = {
  width: { size: 100, type: WidthType.PERCENTAGE },
  layout: TableLayoutType.FIXED,
} as const;

type WordTableCellOptions = {
  width: number;
  bold?: boolean;
  label?: boolean;
  columnSpan?: number;
  alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
};

export function wordTableCell(
  text: string,
  options: WordTableCellOptions,
): TableCell {
  const lines = text.split("\n");

  return new TableCell({
    borders: cellBorder,
    width: { size: options.width, type: WidthType.PERCENTAGE },
    columnSpan: options.columnSpan,
    verticalAlign: VerticalAlign.CENTER,
    margins: cellMargins,
    shading: options.label
      ? { fill: "F4F4F5", type: ShadingType.CLEAR }
      : undefined,
    children: lines.map(
      (line) =>
        new Paragraph({
          alignment: options.alignment,
          spacing: { before: 0, after: 0 },
          children: [
            new TextRun({
              text: line,
              font: WORD_TABLE_FONT,
              size: WORD_TABLE_SIZE,
              bold: options.bold ?? options.label,
            }),
          ],
        }),
    ),
  });
}

export function wordLabelCell(
  text: string,
  width = INFO_LABEL_WIDTH,
  columnSpan?: number,
): TableCell {
  return wordTableCell(text, { width, label: true, columnSpan });
}

export function wordValueCell(
  text: string,
  width = INFO_VALUE_WIDTH,
  columnSpan?: number,
): TableCell {
  return wordTableCell(text, { width, columnSpan });
}

export function wordTableRow(
  texts: string[],
  widths: number[],
  opts?: { header?: boolean },
): TableRow {
  return new TableRow({
    children: texts.map((text, index) =>
      wordTableCell(text, {
        width: widths[index] ?? widths[widths.length - 1],
        bold: opts?.header,
        label: opts?.header,
      }),
    ),
  });
}

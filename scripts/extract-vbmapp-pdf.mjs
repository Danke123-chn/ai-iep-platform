import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFParse } from "pdf-parse";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfPath = path.join(__dirname, "../tmp-vbmapp-report.pdf");
const buf = fs.readFileSync(pdfPath);

const parser = new PDFParse({ data: buf });
const result = await parser.getText();
await parser.destroy();

const outPath = path.join(__dirname, "vbmapp-report-template-text.txt");
fs.writeFileSync(outPath, result.text, "utf8");
console.log("pages:", result.total);
console.log("chars:", result.text.length);
console.log(result.text);

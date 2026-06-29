import fs from "node:fs";
import path from "node:path";

const envPath = path.join(process.cwd(), ".env.local");
const buffer = fs.readFileSync(envPath);

let content;
if (buffer[0] === 0xff && buffer[1] === 0xfe) {
  content = buffer.toString("utf16le").replace(/^\uFEFF/, "");
} else if (buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
  content = buffer.toString("utf8").replace(/^\uFEFF/, "");
} else {
  content = buffer.toString("utf8");
}

// Repair UTF-16 saved as UTF-8 (NUL byte between each ASCII character).
if (content.includes("\u0000")) {
  content = content.replace(/\u0000/g, "");
}

content = content.replace(/\r\n/g, "\n").trimEnd() + "\n";
fs.writeFileSync(envPath, content, { encoding: "utf8" });

const keys = content
  .split("\n")
  .filter((line) => line && !line.startsWith("#"))
  .map((line) => line.split("=")[0].trim())
  .filter(Boolean);

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];
const missing = required.filter((key) => !keys.includes(key));

console.log("Converted .env.local to UTF-8");
console.log("Keys found:", keys.length);
console.log(
  missing.length === 0
    ? "Required Supabase keys: OK"
    : `Missing keys: ${missing.join(", ")}`,
);

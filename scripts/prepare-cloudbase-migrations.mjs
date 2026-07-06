import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dir = path.join(process.cwd(), "cloudbase", "migrations");
const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

let stripped = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  const content = await readFile(filePath, "utf8");
  const next = content
    .split(/\r?\n/)
    .filter((line) => !/notify pgrst/i.test(line))
    .join("\n");
  if (next !== content) {
    await writeFile(filePath, next.endsWith("\n") ? next : `${next}\n`, "utf8");
    stripped++;
  }
}

console.log(`Processed ${files.length} files, stripped notify from ${stripped} files.`);

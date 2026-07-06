import { readFile } from "node:fs/promises";
import path from "node:path";

export async function loadEnvFiles(root, files = [".env.cloudbase", ".env.local"]) {
  for (const file of files) {
    await loadEnvFile(path.join(root, file));
  }
}

export async function loadEnvFile(filePath) {
  try {
    const content = await readFile(filePath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // ignore missing files
  }
}

/**
 * Verify CloudBase app env + anonymous DB access
 * Usage: node scripts/verify-cloudbase-env.mjs
 */
import { readFile } from "node:fs/promises";

async function loadEnv(file) {
  try {
    const content = await readFile(file, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
  } catch {
    // ignore
  }
}

await loadEnv(".env.local");

const envId = process.env.NEXT_PUBLIC_CLOUDBASE_ENV_ID;
const accessKey = process.env.NEXT_PUBLIC_CLOUDBASE_PUBLISHABLE_KEY;

if (!envId || !accessKey) {
  console.error("Missing NEXT_PUBLIC_CLOUDBASE_* in .env.local");
  process.exit(1);
}

console.log("Env ID:", envId);
console.log("Publishable Key:", `${accessKey.slice(0, 12)}...${accessKey.slice(-8)}`);

const base = `https://${envId}.api.tcloudbasegateway.com/v1/rdb/rest/students?select=id&limit=1`;
const res = await fetch(base, {
  headers: {
    Authorization: `Bearer ${accessKey}`,
    apikey: accessKey,
    Accept: "application/json",
  },
});

console.log("RDB probe status:", res.status, res.statusText);
const body = await res.text();
if (res.ok) {
  console.log("RDB probe OK:", body.slice(0, 120));
} else {
  console.error("RDB probe failed:", body.slice(0, 300));
  process.exit(1);
}

console.log("\nCloudBase env looks good. Run: npm run dev");

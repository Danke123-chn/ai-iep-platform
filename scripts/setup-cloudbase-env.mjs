/**
 * Fetch CloudBase Publishable Key via CAM API and merge into .env.local
 *
 * Usage:
 *   node scripts/setup-cloudbase-env.mjs
 *   node scripts/setup-cloudbase-env.mjs --dry-run
 */
import { readFile, writeFile } from "node:fs/promises";

async function loadEnvFile(filePath) {
  try {
    const content = await readFile(filePath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 0) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // ignore missing file
  }
}

function upsertEnvLines(content, entries) {
  const lines = content.split(/\r?\n/);
  const keys = new Set(Object.keys(entries));

  const kept = lines.filter((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return true;
    const eq = trimmed.indexOf("=");
    if (eq < 0) return true;
    const key = trimmed.slice(0, eq).trim();
    return !keys.has(key);
  });

  while (kept.length > 0 && kept[kept.length - 1].trim() === "") {
    kept.pop();
  }

  const block = [
    "",
    "# --- CloudBase PG（Next.js 应用）---",
    ...Object.entries(entries).map(([key, value]) => `${key}=${value}`),
    "",
  ];

  return [...kept, ...block].join("\n");
}

const dryRun = process.argv.includes("--dry-run");

await loadEnvFile(".env.cloudbase");
await loadEnvFile(".env.local");

const envId = process.env.CLOUDBASE_ENV_ID ?? process.env.NEXT_PUBLIC_CLOUDBASE_ENV_ID;
const secretId =
  process.env.TENCENTCLOUD_SECRET_ID ?? process.env.TENCENTCLOUD_SECRETID;
const secretKey =
  process.env.TENCENTCLOUD_SECRETKEY ?? process.env.TENCENTCLOUD_SECRET_KEY;

if (!envId || !secretId || !secretKey) {
  console.error(
    "Missing CLOUDBASE_ENV_ID / TENCENTCLOUD_SECRET_ID / TENCENTCLOUD_SECRETKEY in .env.cloudbase",
  );
  process.exit(1);
}

const tencentcloud = await import("tencentcloud-sdk-nodejs");
const Client = tencentcloud.default.tcb.v20180608.Client;
const client = new Client({
  credential: { secretId, secretKey },
  region: process.env.CLOUDBASE_REGION ?? "ap-shanghai",
  profile: { httpProfile: { endpoint: "tcb.tencentcloudapi.com" } },
});

async function listKeys(keyType) {
  const res = await client.DescribeApiKeyList({
    EnvId: envId,
    KeyType: keyType,
    PageNumber: 1,
    PageSize: 20,
  });
  return res.ApiKeyList ?? res.ApiKeySet ?? res.Keys ?? [];
}

let publishableKey = process.env.NEXT_PUBLIC_CLOUDBASE_PUBLISHABLE_KEY?.trim();

if (!publishableKey) {
  console.log("Fetching Publishable Key (publish_key) from CloudBase API...");
  const publishKeys = await listKeys("publish_key");
  const active = publishKeys.find(
    (item) =>
      item.ApiKey &&
      (item.Status === undefined ||
        item.Status === 1 ||
        item.Status === "1" ||
        item.Status === "active"),
  );
  publishableKey = active?.ApiKey ?? publishKeys[0]?.ApiKey;

  if (!publishableKey) {
    if (dryRun) {
      console.log("No publish_key found; would call CreateApiKey in live mode.");
    } else {
      console.log("No publish_key found, creating one...");
      const created = await client.CreateApiKey({
        EnvId: envId,
        KeyType: "publish_key",
        KeyName: "nextjs-local",
      });
      publishableKey = created.ApiKey;
    }
  }
}

const entries = {
  NEXT_PUBLIC_CLOUDBASE_ENV_ID: envId,
};

if (publishableKey) {
  entries.NEXT_PUBLIC_CLOUDBASE_PUBLISHABLE_KEY = publishableKey;
}

let envLocal = "";
try {
  envLocal = await readFile(".env.local", "utf8");
} catch {
  envLocal = "# Local environment\n";
}

const nextContent = upsertEnvLines(envLocal, entries);

if (dryRun) {
  console.log("\n--- .env.local additions ---");
  for (const [key, value] of Object.entries(entries)) {
    const preview =
      key.includes("KEY") && value.length > 24
        ? `${value.slice(0, 12)}...${value.slice(-8)}`
        : value;
    console.log(`${key}=${preview}`);
  }
  process.exit(0);
}

await writeFile(".env.local", nextContent, "utf8");

console.log("Updated .env.local with:");
console.log(`  NEXT_PUBLIC_CLOUDBASE_ENV_ID=${envId}`);
if (publishableKey) {
  console.log(
    `  NEXT_PUBLIC_CLOUDBASE_PUBLISHABLE_KEY=${publishableKey.slice(0, 12)}...${publishableKey.slice(-8)}`,
  );
} else {
  console.warn("  Publishable Key not set — check CloudBase console manually.");
}

console.log("\nRestart dev server: npm run dev");

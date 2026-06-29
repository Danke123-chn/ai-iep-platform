const path = require("path");
const fs = require("fs");

const appDir = process.env.APP_DIR || "/var/www/ai-iep-platform";
const envPath = path.join(appDir, ".env.production");
const env = {};

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
}

module.exports = {
  apps: [
    {
      name: "ai-iep-platform",
      script: "server.js",
      cwd: path.join(appDir, ".next/standalone"),
      instances: 1,
      autorestart: true,
      max_memory_restart: "600M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
        ...env,
      },
    },
  ],
};

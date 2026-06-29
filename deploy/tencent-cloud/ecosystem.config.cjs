module.exports = {
  apps: [
    {
      name: "ai-iep-platform",
      script: "server.js",
      cwd: "/var/www/ai-iep-platform/.next/standalone",
      instances: 1,
      autorestart: true,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};

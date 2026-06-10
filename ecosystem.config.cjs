const path = require("node:path");

// Default 4 workers (PM2 cluster). Set WEB_CONCURRENCY=1 on a small VPS if needed.
const instances = process.env.WEB_CONCURRENCY || "4";

module.exports = {
  apps: [
    {
      name: "mezitouch-questionnaire",
      cwd: __dirname,
      script: path.join(__dirname, "scripts/server.cjs"),
      interpreter: "node",
      instances,
      exec_mode: "cluster",
      autorestart: true,
      max_memory_restart: "512M",
      // Pass through Coolify/Docker env (ADMIN_EMAILS, Supabase keys, etc.)
      env: {
        ...process.env,
        NODE_ENV: "production",
      },
    },
  ],
};

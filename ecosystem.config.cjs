const path = require("node:path");

// Default 1 worker — faster on small VPS; set WEB_CONCURRENCY=2+ for bigger servers.
const instances = process.env.WEB_CONCURRENCY || "1";

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
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};

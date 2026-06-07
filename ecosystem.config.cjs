const path = require("node:path");

// Default 2 workers — "max" on a small VPS often uses too much RAM and feels slower.
const instances = process.env.WEB_CONCURRENCY || "2";

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

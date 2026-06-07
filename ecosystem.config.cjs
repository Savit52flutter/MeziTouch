const path = require("node:path");

const instances = process.env.WEB_CONCURRENCY || "max";

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

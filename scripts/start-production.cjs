const { spawn } = require("node:child_process");
const path = require("node:path");

const root = path.join(__dirname, "..");
const workers = process.env.WEB_CONCURRENCY ?? "4";

if (workers === "1") {
  require("./server.cjs");
} else {
  const pm2Runtime = path.join(root, "node_modules/pm2/bin/pm2-runtime");
  const ecosystem = path.join(root, "ecosystem.config.cjs");

  const child = spawn(process.execPath, [pm2Runtime, "start", ecosystem], {
    cwd: root,
    stdio: "inherit",
    env: process.env,
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.exit(1);
      return;
    }

    process.exit(code ?? 0);
  });
}

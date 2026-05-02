import { spawn } from "node:child_process";
import { loadEnvFiles } from "./load-env.mjs";

loadEnvFiles([".env", "apps/backend/.env", "apps/frontend/.env"]);

const processes = [
  spawn("node", ["--watch", "apps/backend/src/server.js"], { stdio: "inherit", env: process.env }),
  spawn("node", ["--watch", "apps/frontend/server.js"], { stdio: "inherit", env: process.env })
];

function shutdown() {
  for (const child of processes) {
    if (!child.killed) child.kill("SIGTERM");
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

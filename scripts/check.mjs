import { spawnSync } from "node:child_process";

const files = [
  "apps/backend/src/server.js",
  "apps/backend/src/routes/analyze.js",
  "apps/frontend/server.js",
  "apps/frontend/src/app.js",
  "packages/shared/src/index.js"
];

let failed = false;

for (const file of files) {
  const result = spawnSync("node", ["--check", file], { stdio: "inherit" });
  if (result.status !== 0) failed = true;
}

process.exit(failed ? 1 : 0);

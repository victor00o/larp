import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function parseEnvFile(content) {
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function loadEnvFiles(paths = []) {
  for (const filePath of paths) {
    const resolved = path.resolve(filePath);
    if (!existsSync(resolved)) {
      continue;
    }

    parseEnvFile(readFileSync(resolved, "utf8"));
  }
}

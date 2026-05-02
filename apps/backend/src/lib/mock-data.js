import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../../../");

const files = [
  "sample-data/private/orchard-condo.json",
  "sample-data/private/queenstown-overpriced.json",
  "sample-data/hdb/bishan-4rm.json",
  "sample-data/hdb/punggol-attractive.json"
];

let cache = null;

export async function loadMockScenarios() {
  if (cache) return cache;

  const scenarios = await Promise.all(
    files.map(async (relativePath) => {
      const raw = await readFile(path.join(rootDir, relativePath), "utf8");
      return JSON.parse(raw);
    })
  );

  cache = scenarios;
  return cache;
}

export async function getMockScenarioById(id) {
  const scenarios = await loadMockScenarios();
  return scenarios.find((scenario) => scenario.id === id) || null;
}

export async function listMockScenarios() {
  const scenarios = await loadMockScenarios();
  return scenarios.map(({ id, label, property_type }) => ({ id, label, property_type }));
}

import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnvFiles } from "../../scripts/load-env.mjs";

loadEnvFiles([".env", "apps/frontend/.env"]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, "src");
const port = Number(process.env.FRONTEND_PORT || 3000);
const host = "127.0.0.1";
const backendBaseUrl = process.env.BACKEND_BASE_URL || "http://localhost:4000";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8"
};

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === "/runtime-config.js") {
      res.writeHead(200, { "Content-Type": "application/javascript; charset=utf-8" });
      res.end(`window.SHADOW_MARKET_CONFIG = ${JSON.stringify({ backendBaseUrl })};`);
      return;
    }

    const requestPath = req.url === "/" ? "/index.html" : req.url;
    const filePath = path.join(srcDir, requestPath);
    const content = await readFile(filePath);
    const contentType = mimeTypes[path.extname(filePath)] || "text/plain; charset=utf-8";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(port, host, () => {
  console.log(`Shadow Market frontend listening on http://${host}:${port}`);
});

import http from "node:http";
import { createApiError } from "../../../packages/shared/src/index.js";
import { loadEnvFiles } from "../../../scripts/load-env.mjs";
import { HttpError } from "./lib/http-error.js";
import { listMockScenarios } from "./lib/mock-data.js";
import { analyzeRoute } from "./routes/analyze.js";

loadEnvFiles([".env", "apps/backend/.env"]);

const port = Number(process.env.BACKEND_PORT || 4000);
const host = "127.0.0.1";

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload, null, 2));
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "INVALID_JSON_BODY", "Request body must contain valid JSON.");
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      res.end();
      return;
    }

    if (req.method === "GET" && req.url === "/health") {
      sendJson(res, 200, { ok: true, service: "shadow-market-backend" });
      return;
    }

    if (req.method === "GET" && req.url === "/mock-scenarios") {
      sendJson(res, 200, { scenarios: await listMockScenarios() });
      return;
    }

    if (req.method === "POST" && req.url === "/analyze") {
      const body = await readJsonBody(req);
      const result = await analyzeRoute(body);
      sendJson(res, 200, result);
      return;
    }

    sendJson(res, 404, createApiError({ code: "NOT_FOUND", message: "Route not found." }));
  } catch (error) {
    if (error instanceof HttpError) {
      sendJson(res, error.status, createApiError({
        code: error.code,
        message: error.message,
        details: error.details,
      }));
      return;
    }

    sendJson(
      res,
      500,
      createApiError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unexpected backend error.",
        details: error instanceof Error ? { message: error.message } : null,
      })
    );
  }
});

server.listen(port, host, () => {
  console.log(`Shadow Market backend listening on http://${host}:${port}`);
});

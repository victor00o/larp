import { safeJsonParse } from "../../lib/utils.js";
import {
  normalizeTinyFishComparables,
  normalizeTinyFishDuplicates,
  normalizeTinyFishListingDetails,
  normalizeTinyFishPublicDataReferences,
} from "./normalizers.js";

function getTinyFishConfig() {
  return {
    apiKey: process.env.TINYFISH_API_KEY || "",
    baseUrl: process.env.TINYFISH_BASE_URL || "https://agent.tinyfish.ai",
    pollAttempts: Number(process.env.TINYFISH_POLL_ATTEMPTS || 8),
    pollIntervalMs: Number(process.env.TINYFISH_POLL_INTERVAL_MS || 1500),
  };
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const raw = await response.text();
  return {
    response,
    payload: safeJsonParse(raw, {}),
  };
}

export async function runTinyFishGoal({ url, goal }) {
  const config = getTinyFishConfig();

  if (!config.apiKey) {
    return { ok: false, message: "TINYFISH_API_KEY is not configured." };
  }

  const { response, payload } = await fetchJson(`${config.baseUrl}/v1/automation/run-async`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": config.apiKey,
    },
    body: JSON.stringify({
      url,
      goal,
      browser_profile: "lite",
      api_integration: "shadow-market-mvp",
    }),
  });

  if (!response.ok || !payload.run_id) {
    return { ok: false, message: payload?.error?.message || `TinyFish start failed with ${response.status}.` };
  }

  return {
    ok: true,
    run_id: payload.run_id,
    data: payload.result || {},
    status: payload.status || "RUNNING",
  };
}

export async function pollTinyFishRun(runId) {
  const config = getTinyFishConfig();

  if (!config.apiKey) {
    return { ok: false, message: "TINYFISH_API_KEY is not configured." };
  }

  for (let attempt = 0; attempt < config.pollAttempts; attempt += 1) {
    await sleep(config.pollIntervalMs);

    const { response, payload } = await fetchJson(`${config.baseUrl}/v1/runs/${runId}`, {
      headers: {
        "X-API-Key": config.apiKey,
      },
    });

    if (!response.ok) {
      return {
        ok: false,
        message: payload?.error?.message || `TinyFish poll failed with ${response.status}.`,
      };
    }

    if (payload.status === "COMPLETED") {
      return {
        ok: true,
        run_id: runId,
        data: payload.result || payload.resultJson || {},
        raw: payload,
      };
    }

    if (payload.status === "FAILED" || payload.status === "CANCELLED") {
      return {
        ok: false,
        message: payload?.error?.message || `TinyFish run ended with status ${payload.status}.`,
      };
    }
  }

  return {
    ok: false,
    message: "TinyFish run did not complete within the polling window.",
  };
}

export async function retrieveWithTinyFish({ url, goal, propertyType, sourceFlow }) {
  const run = await runTinyFishGoal({ url, goal });
  if (!run.ok) {
    return run;
  }

  const completedRun = run.data && Object.keys(run.data).length
    ? { ok: true, run_id: run.run_id, data: run.data, raw: run }
    : await pollTinyFishRun(run.run_id);

  if (!completedRun.ok) {
    return completedRun;
  }

  return {
    ok: true,
    run_id: completedRun.run_id,
    listing_details: normalizeTinyFishListingDetails(completedRun.data?.listing, url),
    public_data_references: normalizeTinyFishPublicDataReferences(completedRun.data?.public_data_references, sourceFlow),
    comparable_candidate_data: normalizeTinyFishComparables(completedRun.data?.comparables, propertyType),
    duplicate_candidate_data: normalizeTinyFishDuplicates(completedRun.data?.duplicates),
    raw: completedRun.data,
  };
}

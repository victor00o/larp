import { safeJsonParse } from "../../lib/utils.js";
import {
  AGENTQL_EXTRACTION_MODES,
  createListingPageExtractionResult,
  createResultPageExtractionResult,
} from "./contracts.js";
import { normalizeAgentQLListingPage, normalizeAgentQLResultPage } from "./normalizers.js";
import { LISTING_PAGE_QUERY, RESULT_PAGE_QUERY } from "./queries.js";

async function postAgentQLQuery({ url, query }) {
  const response = await fetch(`${process.env.AGENTQL_BASE_URL || "https://api.agentql.com/v1"}/query-data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.AGENTQL_API_KEY,
    },
    body: JSON.stringify({
      url,
      query,
      params: {
        mode: "fast",
      },
    }),
  });

  const rawText = await response.text();
  const payload = safeJsonParse(rawText, {});

  if (!response.ok) {
    return {
      ok: false,
      message: payload?.error?.message || `AgentQL request failed with ${response.status}.`,
      payload,
    };
  }

  return {
    ok: true,
    payload,
  };
}

export async function extractListingPageWithAgentQLLive(url) {
  const result = await postAgentQLQuery({ url, query: LISTING_PAGE_QUERY });
  if (!result.ok) {
    return createListingPageExtractionResult({
      ok: false,
      mode: AGENTQL_EXTRACTION_MODES.LIVE,
      message: result.message,
      raw: result.payload,
    });
  }

  return createListingPageExtractionResult({
    ok: true,
    mode: AGENTQL_EXTRACTION_MODES.LIVE,
    message: "AgentQL listing-page extraction completed.",
    listing: normalizeAgentQLListingPage(url, result.payload),
    raw: result.payload,
  });
}

export async function extractResultPageWithAgentQLLive(url) {
  const result = await postAgentQLQuery({ url, query: RESULT_PAGE_QUERY });
  if (!result.ok) {
    return createResultPageExtractionResult({
      ok: false,
      mode: AGENTQL_EXTRACTION_MODES.LIVE,
      message: result.message,
      raw: result.payload,
    });
  }

  return createResultPageExtractionResult({
    ok: true,
    mode: AGENTQL_EXTRACTION_MODES.LIVE,
    message: "AgentQL result-page extraction completed.",
    results: normalizeAgentQLResultPage(result.payload),
    raw: result.payload,
  });
}

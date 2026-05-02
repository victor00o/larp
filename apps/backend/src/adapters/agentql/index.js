import { AGENTQL_EXTRACTION_MODES } from "./contracts.js";
import { extractListingPageWithAgentQLLive, extractResultPageWithAgentQLLive } from "./live.js";
import { extractListingPageWithAgentQLStub, extractResultPageWithAgentQLStub } from "./stub.js";

function resolveMode() {
  return process.env.AGENTQL_ENABLED === "true" && process.env.AGENTQL_API_KEY
    ? AGENTQL_EXTRACTION_MODES.LIVE
    : AGENTQL_EXTRACTION_MODES.STUB;
}

export async function extractListingPageWithAgentQL(url) {
  const mode = resolveMode();
  if (mode === AGENTQL_EXTRACTION_MODES.LIVE) {
    return extractListingPageWithAgentQLLive(url);
  }
  return extractListingPageWithAgentQLStub(url);
}

export async function extractResultPageWithAgentQL(url) {
  const mode = resolveMode();
  if (mode === AGENTQL_EXTRACTION_MODES.LIVE) {
    return extractResultPageWithAgentQLLive(url);
  }
  return extractResultPageWithAgentQLStub(url);
}

export { AGENTQL_EXTRACTION_MODES };

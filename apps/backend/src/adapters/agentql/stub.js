import {
  AGENTQL_EXTRACTION_MODES,
  createEmptyListingExtraction,
  createListingPageExtractionResult,
  createResultPageExtractionResult,
} from "./contracts.js";

export async function extractListingPageWithAgentQLStub(url) {
  return createListingPageExtractionResult({
    ok: false,
    mode: AGENTQL_EXTRACTION_MODES.STUB,
    message: "AgentQL listing-page extraction is stubbed. System will continue with fallback extraction.",
    listing: createEmptyListingExtraction(url),
    raw: null,
  });
}

export async function extractResultPageWithAgentQLStub() {
  return createResultPageExtractionResult({
    ok: false,
    mode: AGENTQL_EXTRACTION_MODES.STUB,
    message: "AgentQL result-page extraction is stubbed. System will continue without result-page extraction.",
    results: [],
    raw: null,
  });
}

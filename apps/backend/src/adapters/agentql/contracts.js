export const AGENTQL_EXTRACTION_MODES = {
  STUB: "stub",
  LIVE: "live",
};

export function createEmptyListingExtraction(url = "") {
  return {
    url,
    portal: url ? new URL(url).hostname.replace(/^www\./, "") : "",
    property_type: "",
    project_name: "",
    address_or_block: "",
    location: "",
    district_or_town: "",
    price: 0,
    currency: "SGD",
    bedrooms: 0,
    bathrooms: 0,
    area_sqft: 0,
    floor_level: "",
    flat_type: "",
    lease_commence_year: null,
    description: "",
    agent_name: "",
    image_urls: [],
  };
}

export function createListingPageExtractionResult({
  ok = false,
  mode = AGENTQL_EXTRACTION_MODES.STUB,
  message = "",
  listing = createEmptyListingExtraction(),
  raw = null,
} = {}) {
  return {
    ok,
    mode,
    message,
    listing,
    raw,
  };
}

export function createResultPageExtractionResult({
  ok = false,
  mode = AGENTQL_EXTRACTION_MODES.STUB,
  message = "",
  results = [],
  raw = null,
} = {}) {
  return {
    ok,
    mode,
    message,
    results,
    raw,
  };
}

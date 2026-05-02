import { extractListingPageWithAgentQL, extractResultPageWithAgentQL } from "../../adapters/agentql/index.js";

function emptyListingFromInput(input) {
  const isUrl = /^https?:\/\//i.test(input);
  return {
    url: isUrl ? input : "",
    portal: isUrl ? new URL(input).hostname.replace(/^www\./, "") : "manual-input",
    property_type: "",
    project_name: "",
    address_or_block: isUrl ? "" : input,
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
    description: isUrl ? "" : input,
    agent_name: "",
    image_urls: []
  };
}

export async function extractListing({ mode, input, mockScenario }) {
  if (mode === "mock" && mockScenario) {
    return {
      listing: structuredClone(mockScenario.listing),
      sourceSummary: structuredClone(mockScenario.source_summary),
      message: "Loaded listing from mock scenario."
    };
  }

  const fallback = emptyListingFromInput(input || "");

  if (!fallback.url) {
    return {
      listing: fallback,
      sourceSummary: {
        listing_sources: ["manual search input"],
        public_data_sources: [],
        notes: ["Live extraction skipped because the input was not a URL."]
      },
      message: "Used manual search input fallback."
    };
  }

  try {
    // AgentQL is optional. When enabled, it can normalize messy listing pages and
    // search result pages before TinyFish-driven retrieval continues.
    const extracted = await extractListingPageWithAgentQL(fallback.url);
    if (!extracted.ok) {
      return {
        listing: fallback,
        sourceSummary: {
          listing_sources: [fallback.portal],
          public_data_sources: [],
          notes: [`AgentQL fallback: ${extracted.message}`]
        },
        message: "Used URL fallback because AgentQL extraction was unavailable."
      };
    }

    return {
      listing: extracted.listing,
      sourceSummary: {
        listing_sources: [extracted.listing.portal],
        public_data_sources: [],
        notes: [
          "Structured listing-page extraction attempted via AgentQL.",
          "AgentQL remains optional; TinyFish retrieval still handles live browsing and evidence gathering.",
        ]
      },
      message: "Extracted listing with AgentQL."
    };
  } catch (error) {
    return {
      listing: fallback,
      sourceSummary: {
        listing_sources: [fallback.portal],
        public_data_sources: [],
        notes: [`AgentQL exception: ${error instanceof Error ? error.message : "Unknown error"}`]
      },
      message: "Used URL fallback because extraction threw an error."
    };
  }
}

export async function extractResultPage({ url }) {
  // This remains optional for the MVP. Use it later when we want structured
  // extraction from portal search results before duplicate/comparable analysis.
  return extractResultPageWithAgentQL(url);
}

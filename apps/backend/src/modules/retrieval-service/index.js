import { MODES, PROPERTY_TYPES, SOURCE_FLOWS } from "../../../../../packages/shared/src/index.js";
import { extractListing } from "../extractor/index.js";
import { retrieveMarketContext } from "../public-data-retriever/index.js";

function buildMockRetrievalTrace(mockScenario) {
  return [
    {
      step: "retrieve_listing_details",
      status: "completed",
      message: `Loaded listing details from mock scenario '${mockScenario?.id || "unknown"}'.`,
    },
    {
      step: "retrieve_public_data_references",
      status: "completed",
      message: "Loaded mock public-data references and comparable context.",
    },
    {
      step: "retrieve_duplicate_candidates",
      status: "completed",
      message: "Loaded mock duplicate candidate set.",
    },
    {
      step: "retrieve_comparable_candidates",
      status: "completed",
      message: "Loaded mock comparable candidate set.",
    },
  ];
}

function buildLiveRetrievalTrace({ listingMessage, marketNotes = [] }) {
  return [
    {
      step: "retrieve_listing_details",
      status: "completed",
      message: listingMessage,
    },
    {
      step: "retrieve_public_data_references",
      status: "completed",
      message: marketNotes[0] || "Retrieved source-aware public-data references.",
    },
    {
      step: "retrieve_duplicate_candidates",
      status: "completed",
      message: marketNotes[1] || "Retrieved duplicate candidates.",
    },
    {
      step: "retrieve_comparable_candidates",
      status: "completed",
      message: marketNotes[2] || "Retrieved comparable candidates.",
    },
  ];
}

export async function retrieveNormalizedPropertyData({
  mode,
  input,
  propertyType,
  retrievalPlan,
  mockScenario,
}) {
  // Retrieval normalization boundary:
  // downstream analysis should not need to know whether data came from mock fixtures,
  // TinyFish live retrieval, or optional AgentQL-assisted extraction.
  const extraction = await extractListing({ mode, input, mockScenario });
  const listingDetails = extraction.listing;
  const resolvedPropertyType = propertyType || listingDetails.property_type || PROPERTY_TYPES.PRIVATE;

  const retrieval = await retrieveMarketContext({
    mode,
    propertyType: resolvedPropertyType,
    retrievalPlan,
    listing: listingDetails,
    mockScenario,
  });

  const isHdbFlow = retrievalPlan.public_data_flow === SOURCE_FLOWS.HDB_RESALE;
  const sourceSummarySeed = retrieval.sourceSummary;
  const retrievalTrace =
    mode === MODES.MOCK
      ? buildMockRetrievalTrace(mockScenario)
      : buildLiveRetrievalTrace({
          listingMessage: extraction.message,
          marketNotes: retrieval.notes,
        });

  return {
    listing_details: listingDetails,
    public_data_references: retrieval.publicDataReferences,
    comparable_candidate_data: retrieval.comparables,
    duplicate_candidate_data: retrieval.duplicateCandidates,
    cross_site_candidate_data: retrieval.crossSiteCandidates || retrieval.duplicateCandidates,
    source_summary_seed: {
      ...sourceSummarySeed,
      notes: [
        ...(sourceSummarySeed.notes || []),
        isHdbFlow
          ? "Retrieval service used the HDB / data.gov.sg-oriented branch."
          : "Retrieval service used the URA-oriented private residential branch.",
      ],
    },
    retrieval_trace: retrievalTrace,
    retrieval_notes: [...(extraction.sourceSummary?.notes || []), ...(retrieval.notes || [])],
  };
}

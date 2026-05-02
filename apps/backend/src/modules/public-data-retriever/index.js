import { PROPERTY_TYPES, SOURCE_FLOWS } from "../../../../../packages/shared/src/index.js";
import { buildTinyFishGoal } from "../tinyfish-goal-builder/index.js";
import { runTinyFishSync } from "../tinyfish-runner/index.js";

function buildSourceSummary(retrievalPlan) {
  if (retrievalPlan.public_data_flow === SOURCE_FLOWS.HDB_RESALE) {
    return {
      listing_sources: [],
      public_data_sources: ["HDB / data.gov.sg resale references"],
      notes: ["HDB flow keeps public data branching explicit and separate from URA."]
    };
  }

  return {
    listing_sources: [],
    public_data_sources: ["URA-oriented private residential references"],
    notes: ["Private residential flow keeps URA-oriented public data branching explicit."]
  };
}

function mockPublicDataReferences(propertyType) {
  if (propertyType === PROPERTY_TYPES.HDB) {
    return [
      {
        source_flow: SOURCE_FLOWS.HDB_RESALE,
        source: "data.gov.sg / HDB",
        title: "HDB resale reference set",
        url: "public://data-gov-sg/hdb",
        note: "Mock HDB resale reference set for demo reliability.",
      },
    ];
  }

  return [
    {
      source_flow: SOURCE_FLOWS.URA_PRIVATE,
      source: "URA",
      title: "URA private residential reference set",
      url: "public://ura/private-residential",
      note: "Mock URA-oriented reference set for demo reliability.",
    },
  ];
}

function starterComparables(listing, propertyType) {
  if (propertyType === PROPERTY_TYPES.HDB) {
    return [
      {
        url: "public://hdb/same-block-placeholder",
        project_name_or_block: listing.address_or_block || "Same block comparable",
        property_type: PROPERTY_TYPES.HDB,
        price: listing.price ? Math.round(listing.price * 0.97) : 0,
        area_sqft: listing.area_sqft || 1000,
        match_type: "same_block"
      },
      {
        url: "public://hdb/nearby-placeholder",
        project_name_or_block: listing.district_or_town || listing.location || "Nearby town comparable",
        property_type: PROPERTY_TYPES.HDB,
        price: listing.price ? Math.round(listing.price * 0.99) : 0,
        area_sqft: listing.area_sqft || 980,
        match_type: "similar_layout"
      }
    ];
  }

  return [
    {
      url: "public://ura/same-project-placeholder",
      project_name_or_block: listing.project_name || "Same project comparable",
      property_type: PROPERTY_TYPES.PRIVATE,
      price: listing.price ? Math.round(listing.price * 0.96) : 0,
      area_sqft: listing.area_sqft || 1200,
      match_type: "same_project"
    },
    {
      url: "public://ura/nearby-placeholder",
      project_name_or_block: listing.location || listing.district_or_town || "Nearby district comparable",
      property_type: PROPERTY_TYPES.PRIVATE,
      price: listing.price ? Math.round(listing.price * 0.98) : 0,
      area_sqft: listing.area_sqft || 1180,
      match_type: "nearby"
    }
  ];
}

function starterPublicDataReferences(retrievalPlan) {
  if (retrievalPlan.public_data_flow === SOURCE_FLOWS.HDB_RESALE) {
    return [
      {
        source_flow: SOURCE_FLOWS.HDB_RESALE,
        source: "data.gov.sg / HDB",
        title: "Starter HDB resale public-data reference",
        url: "public://data-gov-sg/hdb/starter",
        note: "Placeholder reference until live TinyFish retrieval is expanded.",
      },
    ];
  }

  return [
    {
      source_flow: SOURCE_FLOWS.URA_PRIVATE,
      source: "URA",
      title: "Starter private residential public-data reference",
      url: "public://ura/private/starter",
      note: "Placeholder reference until live TinyFish retrieval is expanded.",
    },
  ];
}

function buildGoal(listing, retrievalPlan) {
  if (retrievalPlan.public_data_flow === SOURCE_FLOWS.HDB_RESALE) {
    return [
      "Open the subject listing and extract the block, town, floor range, flat type, area, asking price, photos, and agent details.",
      "Then search listing portals plus HDB or data.gov.sg-style public sources for the same HDB resale flat.",
      "Return normalized JSON with listing, public_data_references, duplicates, and comparables.",
      "Prioritize same block, same town, similar flat type, similar area, similar price, shared photos, and same agent clues.",
      `Subject: ${listing.address_or_block || listing.url}`,
    ].join(" ");
  }

  return [
    "Open the subject listing and extract the project name, address, floor level, bedrooms, bathrooms, area, asking price, photos, and agent details.",
    "Then search listing portals plus URA-style public sources for the same private residential property.",
    "Return normalized JSON with listing, public_data_references, duplicates, and comparables.",
    "Prioritize same project, same address, similar area, similar bedroom count, similar price, shared photos, and same agent clues.",
    `Subject: ${listing.project_name || listing.address_or_block || listing.url}`,
  ].join(" ");
}

export async function retrieveMarketContext({ mode, propertyType, retrievalPlan, listing, mockScenario }) {
  if (mode === "mock" && mockScenario) {
    return {
      duplicateCandidates: structuredClone(mockScenario.duplicates),
      crossSiteCandidates: structuredClone(mockScenario.duplicates),
      comparables: structuredClone(mockScenario.comparables),
      publicDataReferences: mockPublicDataReferences(propertyType),
      sourceSummary: structuredClone(mockScenario.source_summary),
      notes: [
        "Loaded mock public-data references.",
        "Loaded mock duplicate candidates.",
        "Loaded mock comparable candidates.",
      ]
    };
  }

  const sourceSummary = buildSourceSummary(retrievalPlan);
  const comparables = starterComparables(listing, propertyType);
  const publicDataReferences = starterPublicDataReferences(retrievalPlan);
  const duplicateCandidates = [];
  const crossSiteCandidates = [];
  const notes = [
    "Used source-aware starter public-data references while live retrieval remains partial.",
    "Used starter duplicate candidate fallback while live browsing remains partial.",
    "Used starter comparable candidate fallback so the demo remains resilient without full browsing coverage.",
  ];

  if (!listing.url) {
    notes.push("TinyFish skipped because no listing URL was provided.");
    return { duplicateCandidates, crossSiteCandidates, comparables, publicDataReferences, sourceSummary, notes };
  }

  try {
    const run = await runTinyFishSync({
      url: listing.url,
      goal: buildTinyFishGoal({
        task: "multi_source_screening",
        propertyType,
        listing,
      }),
      propertyType,
      sourceFlow: retrievalPlan.public_data_flow,
    });
    if (!run.ok) {
      notes.push(`TinyFish fallback: ${run.message}`);
      return { duplicateCandidates, crossSiteCandidates, comparables, publicDataReferences, sourceSummary, notes };
    }

    notes[0] = `TinyFish public-data retrieval completed via ${retrievalPlan.public_data_flow}.`;
    notes[1] = "TinyFish duplicate candidate retrieval completed.";
    notes[2] = "TinyFish comparable candidate retrieval completed.";

    if (Array.isArray(run.public_data_references)) {
      publicDataReferences.splice(0, publicDataReferences.length, ...run.public_data_references);
    }
    if (run.listing_details && (run.listing_details.project_name || run.listing_details.address_or_block || run.listing_details.price)) {
      Object.assign(listing, {
        ...listing,
        ...run.listing_details,
        property_type: propertyType,
      });
      notes.push("TinyFish enriched the subject listing with live extracted details.");
    }
    if (Array.isArray(run.duplicate_candidate_data)) {
      duplicateCandidates.push(...run.duplicate_candidate_data);
      crossSiteCandidates.push(...run.duplicate_candidate_data);
    }
    if (Array.isArray(run.comparable_candidate_data)) {
      comparables.splice(0, comparables.length, ...run.comparable_candidate_data);
    }
  } catch (error) {
    notes.push(`TinyFish exception: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  return { duplicateCandidates, crossSiteCandidates, comparables, publicDataReferences, sourceSummary, notes };
}

import {
  PROPERTY_TYPES,
  SOURCE_FLOWS,
  createEmptySourceSummary,
} from "../../../../../packages/shared/src/index.js";
import { normalizeText } from "../../lib/utils.js";

const ROUTING_CONFIG = {
  [PROPERTY_TYPES.PRIVATE]: {
    normalized_property_type: PROPERTY_TYPES.PRIVATE,
    retrieval_plan: {
      public_data_flow: SOURCE_FLOWS.URA_PRIVATE,
      listing_search_strategy: "project_name_and_address_matching",
      comparable_strategy: "same_project_then_nearby_private",
      duplicate_strategy: "project_area_bedroom_price_image_agent",
    },
    source_summary_seed: {
      ...createEmptySourceSummary(),
      public_data_sources: ["URA-oriented private residential references"],
      notes: ["Private residential routing selected URA-oriented downstream retrieval."],
    },
  },
  [PROPERTY_TYPES.HDB]: {
    normalized_property_type: PROPERTY_TYPES.HDB,
    retrieval_plan: {
      public_data_flow: SOURCE_FLOWS.HDB_RESALE,
      listing_search_strategy: "block_flat_type_and_area_matching",
      comparable_strategy: "same_block_then_nearby_hdb",
      duplicate_strategy: "block_area_flat_type_price_image_agent",
    },
    source_summary_seed: {
      ...createEmptySourceSummary(),
      public_data_sources: ["HDB / data.gov.sg resale references"],
      notes: ["HDB routing selected HDB / data.gov.sg-oriented downstream retrieval."],
    },
  },
};

function normalizeOverride(overridePropertyType) {
  if (overridePropertyType === PROPERTY_TYPES.PRIVATE || overridePropertyType === PROPERTY_TYPES.HDB) {
    return overridePropertyType;
  }
  return null;
}

function inferPropertyType({ input = "", listingMetadata = {} }) {
  if (listingMetadata.property_type === PROPERTY_TYPES.PRIVATE || listingMetadata.property_type === PROPERTY_TYPES.HDB) {
    return {
      propertyType: listingMetadata.property_type,
      reason: "Used parsed listing metadata property_type.",
    };
  }

  const haystack = normalizeText(
    [
      input,
      listingMetadata.url,
      listingMetadata.project_name,
      listingMetadata.address_or_block,
      listingMetadata.location,
      listingMetadata.district_or_town,
      listingMetadata.description,
      listingMetadata.flat_type,
      listingMetadata.floor_level,
    ]
      .filter(Boolean)
      .join(" ")
  );

  const hdbHints = [
    "hdb",
    "blk",
    "block",
    "4 room",
    "5 room",
    "executive",
    "street",
    "lease commence",
    "bishan",
    "ang mo kio",
    "toa payoh",
  ];

  if (listingMetadata.flat_type || listingMetadata.lease_commence_year || hdbHints.some((hint) => haystack.includes(hint))) {
    return {
      propertyType: PROPERTY_TYPES.HDB,
      reason: "Detected HDB cues from flat type, lease data, or address text.",
    };
  }

  return {
    propertyType: PROPERTY_TYPES.PRIVATE,
    reason: "Defaulted to private residential because no HDB-specific cues were found.",
  };
}

export function resolvePropertyRouting({ input = "", overridePropertyType = null, listingMetadata = {} }) {
  const manualOverride = normalizeOverride(overridePropertyType);
  const classified = manualOverride
    ? {
        propertyType: manualOverride,
        reason: "Used user-specified property type override.",
      }
    : inferPropertyType({ input, listingMetadata });

  const config = ROUTING_CONFIG[classified.propertyType];

  return {
    normalized_property_type: config.normalized_property_type,
    retrieval_plan: structuredClone(config.retrieval_plan),
    source_summary_seed: structuredClone(config.source_summary_seed),
    classification_reason: classified.reason,
    used_manual_override: Boolean(manualOverride),
  };
}

export const PROPERTY_TYPES = {
  PRIVATE: "private_residential",
  HDB: "hdb",
};

export const MODES = {
  MOCK: "mock",
  LIVE: "live",
};

export const SOURCE_FLOWS = {
  URA_PRIVATE: "ura_private_residential",
  HDB_RESALE: "hdb_resale_public",
};

export const PRICING_SIGNALS = {
  UNDERPRICED: "underpriced",
  FAIR: "fair",
  OVERPRICED: "overpriced",
};

export const RECOMMENDATION_ACTIONS = {
  HOLD: "keep_current_price",
  REDUCE: "consider_reducing_price",
  TEST_LOWER: "consider_testing_lower_listing_band",
  URGENT: "urgent_price_adjustment_may_be_warranted",
};

export const TRACE_STATUSES = {
  PENDING: "pending",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
};

export const COMPARABLE_MATCH_TYPES = [
  "same_project",
  "same_block",
  "nearby",
  "similar_layout",
  "public_record",
];

export function createEmptyListing() {
  return {
    url: "",
    portal: "",
    property_type: PROPERTY_TYPES.PRIVATE,
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

export function createEmptySourceSummary() {
  return {
    listing_sources: [],
    public_data_sources: [],
    notes: [],
  };
}

export function createEmptySignals() {
  return {
    estimated_true_days_on_market: 0,
    estimated_relist_count: 0,
    median_comparable_psf: 0,
    subject_psf: 0,
    premium_discount_pct: 0,
    cross_site_consistency_signal: "",
    liquidity_signal: "",
    pricing_signal: PRICING_SIGNALS.FAIR,
    confidence: 0,
  };
}

export function createEmptyCrossSiteSummary() {
  return {
    sites_compared: [],
    price_by_site: [],
    metadata_differences: [],
    same_property_confidence: 0,
  };
}

export function createEmptyPricingRecommendation() {
  return {
    action: RECOMMENDATION_ACTIONS.HOLD,
    suggested_adjustment_pct_low: null,
    suggested_adjustment_pct_high: null,
    suggested_price_low: null,
    suggested_price_high: null,
    reasoning: "",
  };
}

export function createEmptyAnalysisResult() {
  return {
    listing: createEmptyListing(),
    source_summary: createEmptySourceSummary(),
    cross_site_summary: createEmptyCrossSiteSummary(),
    duplicates: [],
    comparables: [],
    signals: createEmptySignals(),
    pricing_recommendation: createEmptyPricingRecommendation(),
    explanation: "",
    trace: [],
  };
}

export function createTraceStep(step, status, message) {
  return { step, status, message };
}

export function createApiError({ code, message, details = null }) {
  return {
    error: {
      code,
      message,
      details,
    },
  };
}

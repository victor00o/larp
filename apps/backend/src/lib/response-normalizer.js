import {
  COMPARABLE_MATCH_TYPES,
  PRICING_SIGNALS,
  PROPERTY_TYPES,
  RECOMMENDATION_ACTIONS,
  TRACE_STATUSES,
  createEmptyAnalysisResult,
} from "../../../../packages/shared/src/index.js";

function normalizeString(value) {
  return typeof value === "string" ? value : "";
}

function normalizeNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function normalizeAnalysisResult(result) {
  const base = createEmptyAnalysisResult();
  const listing = result?.listing || {};
  const sourceSummary = result?.source_summary || {};
  const crossSiteSummary = result?.cross_site_summary || {};
  const signals = result?.signals || {};
  const pricingRecommendation = result?.pricing_recommendation || {};

  return {
    listing: {
      ...base.listing,
      url: normalizeString(listing.url),
      portal: normalizeString(listing.portal),
      property_type: Object.values(PROPERTY_TYPES).includes(listing.property_type)
        ? listing.property_type
        : base.listing.property_type,
      project_name: normalizeString(listing.project_name),
      address_or_block: normalizeString(listing.address_or_block),
      location: normalizeString(listing.location),
      district_or_town: normalizeString(listing.district_or_town),
      price: normalizeNumber(listing.price),
      currency: normalizeString(listing.currency || "SGD"),
      bedrooms: normalizeNumber(listing.bedrooms),
      bathrooms: normalizeNumber(listing.bathrooms),
      area_sqft: normalizeNumber(listing.area_sqft),
      floor_level: normalizeString(listing.floor_level),
      flat_type: normalizeString(listing.flat_type),
      lease_commence_year:
        listing.lease_commence_year === null || Number.isFinite(Number(listing.lease_commence_year))
          ? listing.lease_commence_year === null
            ? null
            : Number(listing.lease_commence_year)
          : null,
      description: normalizeString(listing.description),
      agent_name: normalizeString(listing.agent_name),
      image_urls: normalizeArray(listing.image_urls).map((item) => normalizeString(item)),
    },
    source_summary: {
      listing_sources: normalizeArray(sourceSummary.listing_sources).map((item) => normalizeString(item)),
      public_data_sources: normalizeArray(sourceSummary.public_data_sources).map((item) => normalizeString(item)),
      notes: normalizeArray(sourceSummary.notes).map((item) => normalizeString(item)),
    },
    cross_site_summary: {
      sites_compared: normalizeArray(crossSiteSummary.sites_compared).map((item) => normalizeString(item)),
      price_by_site: normalizeArray(crossSiteSummary.price_by_site).map((item) => ({
        site: normalizeString(item?.site),
        url: normalizeString(item?.url),
        price: normalizeNumber(item?.price),
      })),
      metadata_differences: normalizeArray(crossSiteSummary.metadata_differences).map((item) =>
        normalizeString(item)
      ),
      same_property_confidence: normalizeNumber(crossSiteSummary.same_property_confidence),
    },
    duplicates: normalizeArray(result?.duplicates).map((item) => ({
      url: normalizeString(item?.url),
      match_score: normalizeNumber(item?.match_score),
      price: normalizeNumber(item?.price),
      area_sqft: normalizeNumber(item?.area_sqft),
      agent_name: normalizeString(item?.agent_name),
      first_seen_date: normalizeString(item?.first_seen_date),
      reason: normalizeArray(item?.reason).map((reason) => normalizeString(reason)),
    })),
    comparables: normalizeArray(result?.comparables).map((item) => ({
      url: normalizeString(item?.url),
      project_name_or_block: normalizeString(item?.project_name_or_block),
      property_type: Object.values(PROPERTY_TYPES).includes(item?.property_type)
        ? item.property_type
        : base.listing.property_type,
      price: normalizeNumber(item?.price),
      area_sqft: normalizeNumber(item?.area_sqft),
      psf: normalizeNumber(item?.psf),
      match_type: COMPARABLE_MATCH_TYPES.includes(item?.match_type) ? item.match_type : "public_record",
      source: normalizeString(item?.source),
    })),
    signals: {
      estimated_true_days_on_market: normalizeNumber(signals.estimated_true_days_on_market),
      estimated_relist_count: normalizeNumber(signals.estimated_relist_count),
      median_comparable_psf: normalizeNumber(signals.median_comparable_psf),
      subject_psf: normalizeNumber(signals.subject_psf),
      premium_discount_pct: normalizeNumber(signals.premium_discount_pct),
      cross_site_consistency_signal: normalizeString(signals.cross_site_consistency_signal),
      liquidity_signal: normalizeString(signals.liquidity_signal),
      pricing_signal: Object.values(PRICING_SIGNALS).includes(signals.pricing_signal)
        ? signals.pricing_signal
        : PRICING_SIGNALS.FAIR,
      confidence: normalizeNumber(signals.confidence),
    },
    pricing_recommendation: {
      action: Object.values(RECOMMENDATION_ACTIONS).includes(pricingRecommendation.action)
        ? pricingRecommendation.action
        : base.pricing_recommendation.action,
      suggested_adjustment_pct_low:
        pricingRecommendation.suggested_adjustment_pct_low === null
          ? null
          : normalizeNumber(pricingRecommendation.suggested_adjustment_pct_low),
      suggested_adjustment_pct_high:
        pricingRecommendation.suggested_adjustment_pct_high === null
          ? null
          : normalizeNumber(pricingRecommendation.suggested_adjustment_pct_high),
      suggested_price_low:
        pricingRecommendation.suggested_price_low === null
          ? null
          : normalizeNumber(pricingRecommendation.suggested_price_low),
      suggested_price_high:
        pricingRecommendation.suggested_price_high === null
          ? null
          : normalizeNumber(pricingRecommendation.suggested_price_high),
      reasoning: normalizeString(pricingRecommendation.reasoning),
    },
    explanation: normalizeString(result?.explanation),
    trace: normalizeArray(result?.trace).map((item) => ({
      step: normalizeString(item?.step),
      status: Object.values(TRACE_STATUSES).includes(item?.status) ? item.status : TRACE_STATUSES.PENDING,
      message: normalizeString(item?.message),
    })),
  };
}

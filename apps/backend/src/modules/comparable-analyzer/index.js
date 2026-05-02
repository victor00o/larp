import { clamp, median } from "../../lib/utils.js";

export function computePsf(price, areaSqft) {
  if (!price || !areaSqft) return 0;
  return Math.round(price / areaSqft);
}

function weightComparable(item, listing, propertyType) {
  let weight = 1;

  if (propertyType === "hdb") {
    if (item.match_type === "same_block") weight += 0.4;
    if (item.match_type === "similar_layout") weight += 0.25;
    if (listing.flat_type && item.project_name_or_block?.toLowerCase().includes((listing.location || "").toLowerCase())) {
      weight += 0.05;
    }
  } else {
    if (item.match_type === "same_project") weight += 0.4;
    if (item.match_type === "nearby") weight += 0.15;
  }

  return weight;
}

function weightedMedianPsf(comparables, listing, propertyType) {
  const expanded = [];
  for (const item of comparables) {
    const weight = Math.max(1, Math.round(weightComparable(item, listing, propertyType) * 2));
    for (let count = 0; count < weight; count += 1) {
      expanded.push(item.psf);
    }
  }
  return median(expanded);
}

export function derivePricingVerdict(subjectPsf, medianComparablePsf, propertyType, estimatedTrueDaysOnMarket = 0) {
  if (!subjectPsf || !medianComparablePsf) return "fair";
  const ratio = subjectPsf / medianComparablePsf;
  const underThreshold = propertyType === "hdb" ? 0.95 : 0.94;
  let overThreshold = propertyType === "hdb" ? 1.05 : 1.06;

  if (estimatedTrueDaysOnMarket >= 45) {
    overThreshold -= 0.01;
  }

  if (ratio <= underThreshold) return "underpriced";
  if (ratio >= overThreshold) return "overpriced";
  return "fair";
}

export function analyzeComparables(listing, comparables, propertyType, { duplicateSummary } = {}) {
  const normalized = (comparables || [])
    .filter((item) => item.price && item.area_sqft)
    .map((item) => ({
      ...item,
      property_type: item.property_type || propertyType,
      psf: item.psf || computePsf(item.price, item.area_sqft)
    }));

  const subjectPsf = computePsf(listing.price, listing.area_sqft);
  const medianComparablePsf = weightedMedianPsf(normalized, listing, propertyType);
  const estimatedTrueDaysOnMarket = duplicateSummary?.estimated_true_days_on_market || 0;

  let confidence = 0.45;
  confidence += normalized.length >= 3 ? 0.2 : normalized.length * 0.05;
  confidence += listing.price && listing.area_sqft ? 0.15 : 0;
  confidence += propertyType === "hdb" ? 0.1 : 0.05;
  confidence += normalized.some((item) => item.match_type === "same_block" || item.match_type === "same_project") ? 0.08 : 0;
  confidence -= normalized.length === 0 ? 0.15 : 0;

  return {
    comparables: normalized,
    signals: {
      subject_psf: subjectPsf,
      median_comparable_psf: medianComparablePsf,
      premium_discount_pct:
        subjectPsf && medianComparablePsf
          ? Number((((subjectPsf - medianComparablePsf) / medianComparablePsf) * 100).toFixed(1))
          : 0,
      pricing_signal: derivePricingVerdict(subjectPsf, medianComparablePsf, propertyType, estimatedTrueDaysOnMarket),
      confidence: Number(clamp(confidence, 0.2, 0.92).toFixed(2))
    }
  };
}

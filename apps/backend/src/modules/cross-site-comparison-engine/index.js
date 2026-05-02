import { clamp, ratioSimilarity, tokenSimilarity } from "../../lib/utils.js";

function compareMetadata(subject, candidate, propertyType) {
  const differences = [];

  if (subject.price && candidate.price && subject.price !== candidate.price) {
    differences.push(`Price differs by SGD ${Math.abs(subject.price - candidate.price).toLocaleString("en-SG")}`);
  }
  if (subject.area_sqft && candidate.area_sqft && subject.area_sqft !== candidate.area_sqft) {
    differences.push(`Area differs by ${Math.abs(subject.area_sqft - candidate.area_sqft)} sqft`);
  }

  if (propertyType === "hdb") {
    if (subject.flat_type && candidate.flat_type && tokenSimilarity(subject.flat_type, candidate.flat_type) < 1) {
      differences.push("Flat type labels differ across sites");
    }
  } else if (
    subject.project_name &&
    candidate.project_name &&
    tokenSimilarity(subject.project_name, candidate.project_name) < 1
  ) {
    differences.push("Project naming varies across sites");
  }

  if (subject.agent_name && candidate.agent_name && tokenSimilarity(subject.agent_name, candidate.agent_name) < 0.8) {
    differences.push("Agent identity differs across sites");
  }

  return differences;
}

export function buildCrossSiteSummary(subject, duplicateCandidates = [], propertyType) {
  const sitesCompared = new Set([subject.portal].filter(Boolean));
  const priceBySite = [];
  const metadataDifferences = new Set();
  let aggregateConfidence = 0.35;

  if (subject.portal) {
    priceBySite.push({
      site: subject.portal,
      url: subject.url || "",
      price: subject.price || 0,
    });
  }

  for (const candidate of duplicateCandidates) {
    if (candidate.portal) {
      sitesCompared.add(candidate.portal);
    }

    priceBySite.push({
      site: candidate.portal || "unknown",
      url: candidate.url || "",
      price: candidate.price || 0,
    });

    for (const difference of compareMetadata(subject, candidate, propertyType)) {
      metadataDifferences.add(difference);
    }

    const identityScore =
      propertyType === "hdb"
        ? tokenSimilarity(subject.address_or_block, candidate.address_or_block)
        : tokenSimilarity(subject.project_name || subject.address_or_block, candidate.project_name || candidate.address_or_block);
    const priceScore = ratioSimilarity(subject.price, candidate.price);
    const areaScore = ratioSimilarity(subject.area_sqft, candidate.area_sqft);

    aggregateConfidence += identityScore * 0.2 + priceScore * 0.1 + areaScore * 0.1;
  }

  return {
    sites_compared: [...sitesCompared],
    price_by_site: priceBySite,
    metadata_differences: [...metadataDifferences],
    same_property_confidence: Number(clamp(aggregateConfidence, 0.2, 0.98).toFixed(2)),
  };
}

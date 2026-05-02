export function generateExplanation({ listing, propertyType, signals, duplicateSummary, sourceSummary }) {
  const subject = listing.address_or_block || listing.project_name || listing.location || "the subject property";
  const contextAnchor =
    propertyType === "hdb"
      ? listing.address_or_block || listing.location || "the subject flat"
      : listing.project_name || listing.address_or_block || "the subject property";
  const marketText =
    signals.pricing_signal === "underpriced"
      ? "looks slightly below comparable PSF levels"
      : signals.pricing_signal === "overpriced"
        ? "looks above comparable PSF levels"
        : "looks broadly in line with comparable PSF levels";

  const relistText = duplicateSummary.estimated_relist_count
    ? `We found ${duplicateSummary.estimated_relist_count} likely duplicate or relist signal(s), suggesting a truer time on market of about ${duplicateSummary.estimated_true_days_on_market} days.`
    : "We did not find strong duplicate evidence, so time-on-market confidence is lower.";

  const branchText =
    propertyType === "hdb"
      ? `The HDB check leans on block, town, and flat-type style matching around ${contextAnchor}.`
      : `The private residential check leans on project-name and address matching around ${contextAnchor}.`;

  const confidenceText =
    signals.confidence >= 0.8
      ? "Overall confidence is relatively strong for a heuristic demo."
      : signals.confidence >= 0.6
        ? "Overall confidence is moderate."
        : "Overall confidence is limited because the evidence set is thin or mixed.";

  const sourceText = sourceSummary.public_data_sources.length
    ? `Public context used: ${sourceSummary.public_data_sources.join(", ")}.`
    : "Public context is still partial.";
  const liquidityText =
    signals.liquidity_signal === "high_friction"
      ? "Observed signals suggest higher sale friction."
      : signals.liquidity_signal === "moderate_friction"
        ? "Observed signals suggest some sale friction."
        : "Observed signals suggest healthy marketability.";

  return `${propertyType === "hdb" ? "This HDB resale listing" : "This private residential listing"} at ${subject} ${marketText}. Subject PSF is ${signals.subject_psf || "n/a"} versus a comparable median of ${signals.median_comparable_psf || "n/a"}, a ${signals.premium_discount_pct || 0}% premium/discount signal. ${branchText} ${relistText} ${liquidityText} ${confidenceText} ${sourceText}`;
}

import { clamp } from "../../lib/utils.js";

export function buildPricingAnalysis({ subjectPsf, medianComparablePsf, estimatedTrueDaysOnMarket, estimatedRelistCount, crossSiteSummary }) {
  const premiumDiscountPct =
    subjectPsf && medianComparablePsf
      ? Number((((subjectPsf - medianComparablePsf) / medianComparablePsf) * 100).toFixed(1))
      : 0;

  let consistencySignal = "consistent";
  if ((crossSiteSummary.metadata_differences || []).length >= 3 || (crossSiteSummary.same_property_confidence || 0) < 0.55) {
    consistencySignal = "mixed";
  } else if ((crossSiteSummary.metadata_differences || []).length > 0) {
    consistencySignal = "mostly_consistent";
  }

  let liquidityScore = 0.35;
  liquidityScore += premiumDiscountPct <= 0 ? 0.12 : premiumDiscountPct >= 8 ? -0.18 : -0.05;
  liquidityScore += estimatedTrueDaysOnMarket >= 60 ? -0.2 : estimatedTrueDaysOnMarket >= 30 ? -0.1 : 0.06;
  liquidityScore += estimatedRelistCount >= 2 ? -0.14 : estimatedRelistCount === 1 ? -0.06 : 0.04;
  liquidityScore += consistencySignal === "consistent" ? 0.08 : consistencySignal === "mixed" ? -0.08 : 0;

  const liquiditySignal =
    liquidityScore >= 0.42
      ? "healthy"
      : liquidityScore >= 0.26
        ? "moderate_friction"
        : "high_friction";

  return {
    premium_discount_pct: premiumDiscountPct,
    cross_site_consistency_signal: consistencySignal,
    liquidity_signal: liquiditySignal,
    liquidity_score: Number(clamp(liquidityScore, 0.05, 0.95).toFixed(2)),
  };
}

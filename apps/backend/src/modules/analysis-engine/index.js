import { buildDuplicateEvidence } from "../duplicate-matcher/index.js";
import { analyzeComparables } from "../comparable-analyzer/index.js";
import { buildCrossSiteSummary } from "../cross-site-comparison-engine/index.js";
import { generateExplanation } from "../explanation-generator/index.js";
import { buildPredictionSummary } from "../prediction-engine/index.js";
import { buildPricingAnalysis } from "../pricing-analysis-engine/index.js";
import { buildPricingRecommendation } from "../pricing-recommendation-engine/index.js";
import { clamp } from "../../lib/utils.js";

function computeOverallConfidence({ comparableConfidence, duplicateConfidence, duplicateCount, comparableCount }) {
  let score = comparableConfidence * 0.65 + duplicateConfidence * 0.35;

  if (!duplicateCount) {
    score -= 0.05;
  }
  if (comparableCount < 2) {
    score -= 0.07;
  }

  return Number(clamp(score, 0.15, 0.95).toFixed(2));
}

export function runAnalysisEngine({
  listing,
  propertyType,
  duplicateCandidates,
  comparables,
  sourceSummary,
  crossSiteCandidates = [],
}) {
  // Heuristic demo engine:
  // optimize for understandable and inspectable outputs, not production valuation accuracy.
  const duplicateSummary = buildDuplicateEvidence(listing, duplicateCandidates, propertyType);
  const comparableSummary = analyzeComparables(listing, comparables, propertyType, {
    duplicateSummary,
  });
  const crossSiteSummary = buildCrossSiteSummary(listing, crossSiteCandidates, propertyType);
  const pricingAnalysis = buildPricingAnalysis({
    subjectPsf: comparableSummary.signals.subject_psf,
    medianComparablePsf: comparableSummary.signals.median_comparable_psf,
    estimatedTrueDaysOnMarket: duplicateSummary.estimated_true_days_on_market,
    estimatedRelistCount: duplicateSummary.estimated_relist_count,
    crossSiteSummary,
  });

  const signals = {
    ...comparableSummary.signals,
    ...pricingAnalysis,
    estimated_true_days_on_market: duplicateSummary.estimated_true_days_on_market,
    estimated_relist_count: duplicateSummary.estimated_relist_count,
    confidence: computeOverallConfidence({
      comparableConfidence: comparableSummary.signals.confidence,
      duplicateConfidence: duplicateSummary.confidence,
      duplicateCount: duplicateSummary.duplicates.length,
      comparableCount: comparableSummary.comparables.length,
    }),
  };
  const predictionSummary = buildPredictionSummary({ signals });
  const pricingRecommendation = buildPricingRecommendation({
    listing,
    signals,
    predictionSummary,
  });

  const explanation = generateExplanation({
    listing,
    propertyType,
    signals,
    duplicateSummary,
    sourceSummary,
  });

  return {
    duplicates: duplicateSummary.duplicates,
    comparables: comparableSummary.comparables,
    cross_site_summary: crossSiteSummary,
    signals,
    pricing_recommendation: pricingRecommendation,
    explanation,
    duplicateSummary,
    comparableSummary,
  };
}

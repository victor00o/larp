import { MODES, createEmptyAnalysisResult } from "../../../../packages/shared/src/index.js";
import { HttpError } from "../lib/http-error.js";
import { getMockScenarioById } from "../lib/mock-data.js";
import { normalizeAnalysisResult } from "../lib/response-normalizer.js";
import { createInitialTrace, updateTrace } from "../lib/traces.js";
import { validateAnalyzeRequest } from "../lib/validation.js";
import { classifyProperty } from "../modules/property-classifier/index.js";
import { buildLivePlaceholderAnalysisContext } from "../modules/live-placeholder/index.js";
import { retrieveNormalizedPropertyData } from "../modules/retrieval-service/index.js";
import { runAnalysisEngine } from "../modules/analysis-engine/index.js";

function mergeSourceSummary(base, next) {
  return {
    listing_sources: [...new Set([...(base.listing_sources || []), ...(next.listing_sources || [])])],
    public_data_sources: [...new Set([...(base.public_data_sources || []), ...(next.public_data_sources || [])])],
    notes: [...(base.notes || []), ...(next.notes || [])]
  };
}

export async function analyzeRoute(body) {
  const { input, mode, mockScenarioId, propertyType: overridePropertyType } = validateAnalyzeRequest(body);
  const trace = createInitialTrace();
  const result = createEmptyAnalysisResult();
  result.trace = trace;

  const mockScenario = mode === MODES.MOCK ? await getMockScenarioById(mockScenarioId) : null;
  if (mode === MODES.MOCK && !mockScenario) {
    throw new HttpError(404, "MOCK_SCENARIO_NOT_FOUND", `Mock scenario '${mockScenarioId}' was not found.`, {
      mockScenarioId,
    });
  }

  if (mode === MODES.LIVE) {
    const liveContext = await buildLivePlaceholderAnalysisContext({ input });
    result.source_summary.notes.push(liveContext.note);
  }

  updateTrace(trace, "extract_listing", "running", "Preparing retrieval inputs.");
  const retrievalBootstrap =
    mode === MODES.MOCK && mockScenario
      ? { listing: structuredClone(mockScenario.listing), sourceSummary: structuredClone(mockScenario.source_summary) }
      : { listing: result.listing, sourceSummary: result.source_summary };
  result.listing = retrievalBootstrap.listing;
  result.source_summary = retrievalBootstrap.sourceSummary;
  updateTrace(trace, "extract_listing", "completed", mode === MODES.MOCK ? "Prepared mock retrieval inputs." : "Prepared live retrieval inputs.");

  updateTrace(trace, "classify_property", "running", "Determining private residential vs HDB branch.");
  const classification = classifyProperty({
    input,
    overridePropertyType,
    listingMetadata: result.listing,
  });
  const propertyType = classification.normalized_property_type;
  result.listing.property_type = propertyType;
  result.source_summary = mergeSourceSummary(result.source_summary, classification.source_summary_seed);
  result.source_summary.notes.push(
    `Classification: ${classification.classification_reason}`,
    `Retrieval plan: ${classification.retrieval_plan.public_data_flow}`
  );
  updateTrace(
    trace,
    "classify_property",
    "completed",
    `${classification.used_manual_override ? "Manual override applied." : "Auto-classified."} ${classification.classification_reason}`
  );

  updateTrace(trace, "retrieve_market_context", "running", "Collecting public data context and likely relists.");
  const retrievalContext = await retrieveNormalizedPropertyData({
    mode,
    input,
    propertyType,
    retrievalPlan: classification.retrieval_plan,
    mockScenario,
  });
  result.listing = retrievalContext.listing_details;
  result.listing.property_type = propertyType;
  result.source_summary = mergeSourceSummary(result.source_summary, retrievalContext.source_summary_seed);
  result.source_summary.notes.push(...retrievalContext.retrieval_notes);
  result.trace.push(...retrievalContext.retrieval_trace);
  updateTrace(trace, "retrieve_market_context", "completed", retrievalContext.retrieval_trace.map((item) => item.message).join(" "));

  updateTrace(trace, "score_duplicates", "running", "Scoring duplicate and relist evidence.");
  const analysis = runAnalysisEngine({
    listing: result.listing,
    propertyType,
    duplicateCandidates: retrievalContext.duplicate_candidate_data,
    comparables: retrievalContext.comparable_candidate_data,
    sourceSummary: result.source_summary,
    crossSiteCandidates: retrievalContext.cross_site_candidate_data,
  });
  result.cross_site_summary = analysis.cross_site_summary;
  result.duplicates = analysis.duplicates;
  result.signals.estimated_true_days_on_market = analysis.signals.estimated_true_days_on_market;
  result.signals.estimated_relist_count = analysis.signals.estimated_relist_count;
  updateTrace(trace, "score_duplicates", "completed", analysis.duplicates.length ? `Found ${analysis.duplicates.length} likely duplicate(s).` : "No strong duplicate evidence found.");

  updateTrace(trace, "analyze_comparables", "running", "Calculating comparable PSF context.");
  result.comparables = analysis.comparables;
  result.signals = {
    ...result.signals,
    ...analysis.signals,
  };
  updateTrace(trace, "analyze_comparables", "completed", `Computed subject PSF ${result.signals.subject_psf} and median comparable PSF ${result.signals.median_comparable_psf}.`);

  updateTrace(trace, "generate_explanation", "running", "Summarizing the findings.");
  result.explanation = analysis.explanation;
  result.pricing_recommendation = analysis.pricing_recommendation;
  updateTrace(trace, "generate_explanation", "completed", "Generated natural-language explanation.");

  return normalizeAnalysisResult(result);
}

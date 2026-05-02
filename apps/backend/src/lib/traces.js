import { createTraceStep } from "../../../../packages/shared/src/index.js";

export function createInitialTrace() {
  return [
    createTraceStep("extract_listing", "pending", "Waiting to extract listing details."),
    createTraceStep("classify_property", "pending", "Waiting to classify property type."),
    createTraceStep("retrieve_market_context", "pending", "Waiting to retrieve listing and public data context."),
    createTraceStep("score_duplicates", "pending", "Waiting to score duplicate and relist evidence."),
    createTraceStep("analyze_comparables", "pending", "Waiting to analyze PSF context."),
    createTraceStep("generate_explanation", "pending", "Waiting to summarize the findings.")
  ];
}

export function updateTrace(trace, step, status, message) {
  const target = trace.find((item) => item.step === step);
  if (target) {
    target.status = status;
    target.message = message;
  }
}

import { RECOMMENDATION_ACTIONS } from "../../../../../packages/shared/src/index.js";

function roundPrice(value) {
  return Math.round(value / 1000) * 1000;
}

export function buildPricingRecommendation({ listing, signals, predictionSummary }) {
  if (!listing.price) {
    return {
      action: RECOMMENDATION_ACTIONS.HOLD,
      suggested_adjustment_pct_low: null,
      suggested_adjustment_pct_high: null,
      suggested_price_low: null,
      suggested_price_high: null,
      reasoning: "Price recommendation is limited because the subject asking price is missing.",
    };
  }

  if (signals.pricing_signal === "underpriced" && predictionSummary.urgency === "low") {
    return {
      action: RECOMMENDATION_ACTIONS.HOLD,
      suggested_adjustment_pct_low: null,
      suggested_adjustment_pct_high: null,
      suggested_price_low: null,
      suggested_price_high: null,
      reasoning: "The listing appears attractive relative to observed comparables and does not show strong signs of sale friction. A price cut is not currently indicated.",
    };
  }

  if (signals.pricing_signal === "fair" && predictionSummary.urgency === "low") {
    return {
      action: RECOMMENDATION_ACTIONS.HOLD,
      suggested_adjustment_pct_low: null,
      suggested_adjustment_pct_high: null,
      suggested_price_low: null,
      suggested_price_high: null,
      reasoning: "The listing is close to comparable pricing and does not show strong staleness signals. Holding the current price may be reasonable.",
    };
  }

  const lowPct =
    signals.liquidity_signal === "high_friction" ? 4 : signals.pricing_signal === "overpriced" ? 3 : 2;
  const highPct =
    signals.liquidity_signal === "high_friction" ? 7 : signals.pricing_signal === "overpriced" ? 6 : 4;
  const suggestedPriceLow = roundPrice(listing.price * (1 - highPct / 100));
  const suggestedPriceHigh = roundPrice(listing.price * (1 - lowPct / 100));

  const action =
    predictionSummary.urgency === "high"
      ? RECOMMENDATION_ACTIONS.URGENT
      : signals.pricing_signal === "overpriced"
        ? RECOMMENDATION_ACTIONS.REDUCE
        : RECOMMENDATION_ACTIONS.TEST_LOWER;

  return {
    action,
    suggested_adjustment_pct_low: lowPct,
    suggested_adjustment_pct_high: highPct,
    suggested_price_low: suggestedPriceLow,
    suggested_price_high: suggestedPriceHigh,
    reasoning:
      signals.pricing_signal === "overpriced"
        ? `This listing appears ${Math.abs(signals.premium_discount_pct)}% above the comparable median PSF and shows signs of sale friction. Consider reducing the listing by ${lowPct}% to ${highPct}% to improve marketability.`
        : `This listing does not look severely overpriced, but observed marketability signals suggest testing a lower listing band. Consider a ${lowPct}% to ${highPct}% adjustment if traction remains weak.`,
  };
}

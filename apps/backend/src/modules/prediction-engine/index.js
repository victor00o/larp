export function buildPredictionSummary({ signals }) {
  const needsPriceAction =
    signals.pricing_signal === "overpriced" ||
    signals.liquidity_signal === "high_friction" ||
    signals.estimated_true_days_on_market >= 45;

  const urgency =
    signals.liquidity_signal === "high_friction" || signals.estimated_true_days_on_market >= 75
      ? "high"
      : needsPriceAction
        ? "medium"
        : "low";

  return {
    needs_price_action: needsPriceAction,
    urgency,
  };
}

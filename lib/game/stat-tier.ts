export function getTrustTier(value: number) {
  if (value >= 80) return "Locked In";
  if (value >= 60) return "Strong";
  if (value >= 40) return "Shaky";
  if (value >= 20) return "Wobbling";
  return "Gone";
}

export function getExposureTier(value: number) {
  if (value >= 80) return "Critical";
  if (value >= 60) return "Hot";
  if (value >= 40) return "Rising";
  if (value >= 20) return "Low";
  return "Quiet";
}

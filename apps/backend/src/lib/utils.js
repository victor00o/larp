export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function ratioSimilarity(subjectValue, candidateValue) {
  if (!subjectValue || !candidateValue) return 0;
  return clamp(1 - Math.abs(subjectValue - candidateValue) / subjectValue, 0, 1);
}

export function median(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

export function normalizeText(input = "") {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function tokenSimilarity(a = "", b = "") {
  const left = new Set(normalizeText(a).split(" ").filter(Boolean));
  const right = new Set(normalizeText(b).split(" ").filter(Boolean));
  if (!left.size || !right.size) return 0;

  let overlap = 0;
  for (const token of left) {
    if (right.has(token)) overlap += 1;
  }

  return overlap / new Set([...left, ...right]).size;
}

export function daysSince(dateString) {
  const then = new Date(dateString);
  if (Number.isNaN(then.getTime())) return 0;
  return Math.max(0, Math.round((Date.now() - then.getTime()) / 86400000));
}

export function safeJsonParse(raw, fallback = null) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

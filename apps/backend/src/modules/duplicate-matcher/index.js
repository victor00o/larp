import { clamp, daysSince, ratioSimilarity, tokenSimilarity } from "../../lib/utils.js";

export function imageOverlap(subjectImages = [], candidateImages = []) {
  if (!subjectImages.length || !candidateImages.length) return 0;
  const candidateSet = new Set(candidateImages);
  const matches = subjectImages.filter((url) => candidateSet.has(url)).length;
  return matches / Math.max(subjectImages.length, candidateImages.length);
}

function buildWeights(propertyType) {
  if (propertyType === "hdb") {
    return {
      primaryIdentity: 0.28,
      secondaryIdentity: 0.22,
      area: 0.15,
      layout: 0.15,
      price: 0.1,
      image: 0.06,
      agent: 0.04,
    };
  }

  return {
    primaryIdentity: 0.28,
    secondaryIdentity: 0.18,
    area: 0.15,
    layout: 0.12,
    price: 0.14,
    image: 0.08,
    agent: 0.05,
  };
}

function normalizeCandidate(candidate, score, reason) {
  return {
    url: candidate.url,
    match_score: score,
    price: candidate.price || 0,
    area_sqft: candidate.area_sqft || 0,
    agent_name: candidate.agent_name || "",
    first_seen_date: candidate.listed_at || "",
    reason,
  };
}

export function scoreDuplicateCandidate(subject, candidate, propertyType) {
  const identityPrimary =
    propertyType === "hdb"
      ? tokenSimilarity(subject.address_or_block, candidate.address_or_block)
      : tokenSimilarity(subject.project_name, candidate.project_name);
  const identitySecondary =
    propertyType === "hdb"
      ? tokenSimilarity(subject.location || subject.district_or_town, candidate.address_or_block || candidate.project_name)
      : tokenSimilarity(subject.address_or_block, candidate.address_or_block);
  const areaScore = ratioSimilarity(subject.area_sqft, candidate.area_sqft);
  const layoutScore =
    propertyType === "hdb"
      ? subject.flat_type && candidate.flat_type
        ? tokenSimilarity(subject.flat_type, candidate.flat_type)
        : subject.bedrooms && candidate.bedrooms && subject.bedrooms === candidate.bedrooms
          ? 0.8
        : 0
      : subject.bedrooms && candidate.bedrooms && subject.bedrooms === candidate.bedrooms
        ? 1
        : 0;
  const priceScore = ratioSimilarity(subject.price, candidate.price);
  const imageScore = imageOverlap(subject.image_urls, candidate.image_urls);
  const agentScore = tokenSimilarity(subject.agent_name, candidate.agent_name);
  const weights = buildWeights(propertyType);

  const matchScore = Number(
    (
      identityPrimary * weights.primaryIdentity +
      identitySecondary * weights.secondaryIdentity +
      areaScore * weights.area +
      layoutScore * weights.layout +
      priceScore * weights.price +
      imageScore * weights.image +
      agentScore * weights.agent
    ).toFixed(2)
  );

  const reason = [];
  if (identityPrimary > 0.55) {
    reason.push(propertyType === "hdb" ? "Strong block/address similarity" : "Strong project-name similarity");
  }
  if (identitySecondary > 0.55) {
    reason.push(propertyType === "hdb" ? "Town/block text aligns" : "Strong address similarity");
  }
  if (areaScore > 0.95) reason.push("Nearly identical area");
  if (layoutScore > 0.9) reason.push(propertyType === "hdb" ? "Matching flat type" : "Matching bedroom count");
  if (priceScore > 0.95) reason.push("Tight asking price proximity");
  if (imageScore > 0) reason.push("Shared listing images");
  if (agentScore > 0.8) reason.push("Similar agent identity");

  return {
    match_score: matchScore,
    reason,
    evidence_scores: {
      identity_primary: Number(identityPrimary.toFixed(2)),
      identity_secondary: Number(identitySecondary.toFixed(2)),
      area: Number(areaScore.toFixed(2)),
      layout: Number(layoutScore.toFixed(2)),
      price: Number(priceScore.toFixed(2)),
      image: Number(imageScore.toFixed(2)),
      agent: Number(agentScore.toFixed(2)),
    },
  };
}

export function buildDuplicateEvidence(subject, candidates, propertyType = "private_residential") {
  const threshold = propertyType === "hdb" ? 0.55 : 0.55;
  const scoredCandidates = (candidates || []).map((candidate) => {
    const scored = scoreDuplicateCandidate(subject, candidate, propertyType);
    return {
      ...normalizeCandidate(candidate, scored.match_score, scored.reason),
      evidence_scores: scored.evidence_scores,
    };
  });

  const duplicates = scoredCandidates
    .filter((item) => item.match_score >= threshold)
    .sort((a, b) => b.match_score - a.match_score);

  const earliest = duplicates.map((item) => item.first_seen_date).filter(Boolean).sort()[0];
  const averageScore =
    duplicates.length > 0
      ? duplicates.reduce((sum, item) => sum + item.match_score, 0) / duplicates.length
      : 0.35;
  let confidence = averageScore;
  confidence += earliest ? 0.12 : -0.06;
  confidence += duplicates.length >= 2 ? 0.08 : duplicates.length === 1 ? 0.03 : -0.05;

  return {
    duplicates,
    estimated_true_days_on_market: earliest ? daysSince(earliest) : 0,
    estimated_relist_count: duplicates.length,
    earliest_observation_date: earliest || "",
    confidence: Number(clamp(confidence, 0.15, 0.95).toFixed(2)),
  };
}

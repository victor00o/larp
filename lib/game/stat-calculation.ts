import { clamp, formatCompactNumber } from "@/lib/utils";
import type {
  BoardTile,
  CrisisState,
  GameAction,
  GameHistoryEntry,
  Stats,
  StatsDelta,
} from "@/lib/types";

const boardSlots = [
  { x: 2, y: 1 },
  { x: 1, y: 2 },
  { x: 3, y: 2 },
  { x: 2, y: 3 },
  { x: 1, y: 1 },
  { x: 4, y: 1 },
  { x: 0, y: 2 },
  { x: 3, y: 4 },
  { x: 4, y: 3 },
  { x: 2, y: 4 },
];

export function createDefaultStats(overrides: Partial<Stats> = {}): Stats {
  return {
    followers: 0,
    engagement: 6,
    money: 0,
    trust: 50,
    exposureRisk: 15,
    burnout: 20,
    credibility: 50,
    ...overrides,
  };
}

export function clampStats(stats: Stats): Stats {
  return {
    followers: Math.max(0, Math.round(stats.followers)),
    engagement: clamp(Number(stats.engagement.toFixed(1)), 0, 50),
    money: Math.round(stats.money),
    trust: clamp(Math.round(stats.trust), 0, 100),
    exposureRisk: clamp(Math.round(stats.exposureRisk), 0, 100),
    burnout: clamp(Math.round(stats.burnout), 0, 100),
    credibility: clamp(Math.round(stats.credibility), 0, 100),
  };
}

function isMonetizationAction(action?: Pick<GameAction, "title" | "boardTile">) {
  if (!action) return false;
  return (
    action.title.toLowerCase().includes("monetize") ||
    action.boardTile.toLowerCase().includes("funnel") ||
    action.boardTile.toLowerCase().includes("brand deal")
  );
}

export function applyStatDelta(
  stats: Stats,
  delta: StatsDelta,
  action?: Pick<GameAction, "title" | "boardTile">
): Stats {
  const next = { ...stats };
  for (const [key, rawValue] of Object.entries(delta)) {
    const statKey = key as keyof Stats;
    let value = rawValue ?? 0;
    if (statKey === "money" && value > 0 && stats.trust <= 0 && isMonetizationAction(action)) {
      value = value * 0.5;
    }
    next[statKey] += value;
  }
  return clampStats(next);
}

export function applyActionEffects(stats: Stats, actions: GameAction[]) {
  return actions.reduce((current, action) => applyStatDelta(current, action.statEffects, action), stats);
}

export function applyBoardUpgrade(board: BoardTile[], tileLabel: string, accent: BoardTile["accent"]) {
  const existing = board.find((tile) => tile.label === tileLabel);
  if (existing) {
    return board.map((tile) => (tile.id === existing.id ? { ...tile, level: tile.level + 1 } : tile));
  }

  const used = new Set(board.map((tile) => `${tile.x}:${tile.y}`));
  const slot = boardSlots.find((candidate) => !used.has(`${candidate.x}:${candidate.y}`)) ?? boardSlots[0];

  return [
    ...board,
    {
      id: `${accent}-${tileLabel.toLowerCase().replace(/\s+/g, "-")}-${board.length + 1}`,
      label: tileLabel,
      kind: tileLabel,
      level: 1,
      accent,
      x: slot.x,
      y: slot.y,
    },
  ];
}

export function applyActionsToBoard(board: BoardTile[], actions: GameAction[], accent: BoardTile["accent"]) {
  return actions.reduce((current, action) => applyBoardUpgrade(current, action.boardTile, accent), board);
}

export function calculateCloutScore(stats: Stats) {
  return Math.round(
    stats.followers * (stats.engagement / 100) * (stats.trust / 100) * (stats.credibility / 100) +
      stats.money -
      stats.exposureRisk * 100 -
      stats.burnout * 50
  );
}

export function createBoardFromLabels(labels: string[], accent: BoardTile["accent"]) {
  return labels.map((label, index) => {
    const slot = boardSlots[index] ?? { x: 2, y: 2 };
    return {
      id: `${accent}-${label.toLowerCase().replace(/\s+/g, "-")}-${index}`,
      label,
      kind: label,
      level: 1,
      accent,
      x: slot.x,
      y: slot.y,
    };
  });
}

export function resolveCrises(stats: Stats) {
  let next = { ...stats };
  const crises: CrisisState[] = [];
  let skipActionsNextMonth = 0;

  if (next.exposureRisk >= 100) {
    next = clampStats({
      ...next,
      followers: next.followers * 0.6,
      trust: next.trust - 30,
      credibility: next.credibility - 20,
      exposureRisk: 70,
    });
    crises.push({
      type: "exposed",
      title: "Exposure Crisis",
      description: "Receipts landed. The aura did not survive the comments section.",
      impact: "Followers -40%, Trust -30, Credibility -20, Exposure Risk reset to 70.",
    });
  }

  if (next.burnout >= 100) {
    next = clampStats({
      ...next,
      burnout: 65,
      engagement: next.engagement - 5,
    });
    crises.push({
      type: "burnout",
      title: "Burnout Crisis",
      description: "You optimized the brand right into a nervous system complaint.",
      impact: "Engagement -5. Burnout reset to 65. The next month starts shaky.",
    });
  }

  if (next.trust <= 0) {
    crises.push({
      type: "trust",
      title: "Trust Crisis",
      description: "Your audience still watches, but now they watch like investigators.",
      impact: "Monetization is 50% weaker until trust recovers above zero.",
    });
  }

  return {
    stats: clampStats(next),
    crises,
    skipActionsNextMonth,
  };
}

export function summarizeGrowth(history: GameHistoryEntry[]) {
  if (!history.length) {
    return {
      biggestGrowthMonth: "Month 1, when hope still had a pulse.",
      biggestScandal: "None. Suspiciously clean.",
      bestDecision: "Starting the run.",
      worstDecision: "None yet.",
    };
  }

  const bestGrowth = [...history].sort(
    (left, right) =>
      right.afterStats.followers - right.beforeStats.followers - (left.afterStats.followers - left.beforeStats.followers)
  )[0];

  const worstTrust = [...history].sort((left, right) => left.afterStats.trust - right.afterStats.trust)[0];
  const bestDecision = [...history].sort(
    (left, right) =>
      calculateCloutScore(right.afterStats) - calculateCloutScore(right.beforeStats) -
      (calculateCloutScore(left.afterStats) - calculateCloutScore(left.beforeStats))
  )[0];
  const worstDecision = [...history].sort(
    (left, right) =>
      calculateCloutScore(left.afterStats) - calculateCloutScore(left.beforeStats) -
      (calculateCloutScore(right.afterStats) - calculateCloutScore(right.beforeStats))
  )[0];

  return {
    biggestGrowthMonth: `Month ${bestGrowth.month}: +${formatCompactNumber(
      bestGrowth.afterStats.followers - bestGrowth.beforeStats.followers
    )} followers.`,
    biggestScandal: `Month ${worstTrust.month}: ${worstTrust.eventTitle}.`,
    bestDecision: `Month ${bestDecision.month}: ${bestDecision.selectedActions.join(" + ")}.`,
    worstDecision: `Month ${worstDecision.month}: ${worstDecision.selectedActions.join(" + ")}.`,
  };
}

export function deriveFinalTitle(
  stats: Stats,
  personaId: string | null,
  moneyDelta: number
): string {
  if (stats.burnout >= 75) return "Monk Mode Casualty";
  if (stats.followers < 20_000 && stats.money < 5_000 && stats.trust < 30) return "Algorithm Casualty";
  if (stats.followers >= 80_000 && stats.trust < 35) return "Engagement Farmer";
  if (moneyDelta >= 30_000 && stats.exposureRisk >= 65) return "Profitable But Suspicious";
  if (stats.trust >= 70 && stats.followers < 70_000) return "Broke But Respected";
  if (stats.credibility >= 75 && stats.money >= 40_000) return "Actual Founder";
  if (
    ["fitness-influencer", "beauty-influencer", "wellness-creator"].includes(personaId ?? "") &&
    stats.followers >= 90_000
  ) {
    return "Glow-Up Mogul";
  }
  return "Self-Made-ish Legend";
}

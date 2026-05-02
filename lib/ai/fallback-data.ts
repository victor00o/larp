import { getAllBaseActions } from "@/lib/game/actions";
import { calculateCloutScore, deriveFinalTitle, summarizeGrowth } from "@/lib/game/stat-calculation";
import { getPersonaById, personas } from "@/lib/personas";
import { createId, formatCompactNumber, initialsFromName, pickOne } from "@/lib/utils";
import type {
  FinalRecapData,
  GameAction,
  GameEvent,
  GameHistoryEntry,
  GameProfile,
  MonthPreparation,
  Stats,
  StoredGameState,
} from "@/lib/types";

const firstNames = [
  "Avery",
  "Milan",
  "Sage",
  "Rhea",
  "Kai",
  "Nova",
  "Jules",
  "Theo",
  "Zara",
  "Roman",
];

const lastNames = ["Vale", "Mercer", "Lane", "Cross", "Sloane", "Crown", "Quinn", "Marlow", "West", "Hart"];

const rivalArchetypes = [
  "The Algorithm's Favourite",
  "Corporate Visionary",
  "Dropshipping Demon",
  "Glow-Up Rival",
  "LinkedIn Prophet",
  "Fake Finance Oracle",
];

const monthlyHeadlines = [
  "The algorithm is hungry.",
  "Trust is down. Engagement is up. Classic.",
  "Someone asked for receipts.",
  "Your audience is suspicious but entertained.",
  "One controversy away from a podcast invitation.",
];

const monthlyNarratives = [
  "Your last post landed harder than expected. A few people loved the confidence. A few more started asking how real any of this actually is.",
  "The internet has decided you are either a genius or a deeply committed bit. Unfortunately, both drive comments.",
  "You can feel the persona working. You can also feel it asking more from your nervous system than you originally budgeted for.",
  "Attention is compounding, but so is scrutiny. The line between mystique and nonsense is starting to feel very thin.",
];

const actionTemplates: Array<Omit<GameAction, "id" | "source">> = [
  {
    title: "Post a 4AM Discipline Reel",
    description: "Film coffee, low light, and one line about how ordinary people love excuses.",
    group: "build",
    icon: "Sunrise",
    cost: { burnout: 8 },
    upside: "High follower growth",
    risk: "People may call it cringe.",
    statEffects: { followers: 3_200, engagement: 2.1, trust: -2, exposureRisk: 4, burnout: 8 },
    boardTile: "Content Studio",
  },
  {
    title: "Launch a Soft-Sell Mini Offer",
    description: "Package the vibe into a tiny paid product while pretending it is just for the community.",
    group: "build",
    icon: "PackageCheck",
    cost: { trust: -4, burnout: 5 },
    upside: "Strong money gain",
    risk: "Audience can smell a funnel.",
    statEffects: { followers: 450, money: 3_800, trust: -4, credibility: -1, burnout: 5, exposureRisk: 3 },
    boardTile: "Product Funnel",
  },
  {
    title: "Host a Founder-Friends Dinner",
    description: "Create social proof by sitting near people with good titles and better lighting.",
    group: "build",
    icon: "UtensilsCrossed",
    cost: { money: -650, burnout: 4 },
    upside: "Raises credibility",
    risk: "Can look staged if over-captioned.",
    statEffects: { followers: 1_100, money: 250, trust: 3, credibility: 5, burnout: 4 },
    boardTile: "Podcast Booth",
  },
  {
    title: "Post a Vague Enemy Monologue",
    description: "Talk about fake friends, weak discipline, and invisible jealousy without naming anyone.",
    group: "drama",
    icon: "Drama",
    cost: { burnout: 7 },
    upside: "Big engagement spike",
    risk: "Makes you look unstable.",
    statEffects: { followers: 2_900, engagement: 4.8, trust: -4, exposureRisk: 9, burnout: 7 },
    boardTile: "Drama Zone",
  },
  {
    title: "Borrow a Luxury Setting for Content",
    description: "Spend just enough to imply a lifestyle you absolutely do not maintain daily.",
    group: "drama",
    icon: "CarFront",
    cost: { money: -1_700, burnout: 4 },
    upside: "Boosts aspiration",
    risk: "If it looks rented, trust suffers.",
    statEffects: { followers: 2_100, engagement: 2.6, trust: -3, exposureRisk: 5, burnout: 4, credibility: 1 },
    boardTile: "Lifestyle Flex Suite",
  },
];

const eventTemplates: GameEvent[] = [
  {
    title: "Receipts Please",
    description: "Your latest post blew up. Unfortunately, now the comments want proof, context, and maybe timestamps.",
    responses: [
      {
        label: "Show real proof",
        description: "Give them actual context and let the boring truth do the heavy lifting.",
        statEffects: { followers: 900, engagement: 1, trust: 8, exposureRisk: -5, burnout: 3, credibility: 6 },
      },
      {
        label: "Attack the haters",
        description: "Pretend transparency is for people without aura.",
        statEffects: { followers: 3_100, engagement: 4, trust: -8, exposureRisk: 12, burnout: 6, credibility: -4 },
      },
      {
        label: "Post something prettier",
        description: "Distract instead of explain. It usually works for a little while.",
        statEffects: { followers: 1_800, engagement: 2.5, trust: -3, exposureRisk: 5, burnout: 4 },
      },
    ],
  },
  {
    title: "Brand Deal Energy",
    description: "A sponsor appears. They like your reach. They are less sure about your comments section.",
    responses: [
      {
        label: "Take the deal",
        description: "Cash the check and hope the audience forgives the script.",
        statEffects: { money: 5_400, trust: -4, exposureRisk: 2, burnout: 4, credibility: -1 },
      },
      {
        label: "Negotiate publicly",
        description: "Act selective and let that itself become content.",
        statEffects: { followers: 1_500, money: 2_200, trust: 2, credibility: 3, burnout: 3 },
      },
      {
        label: "Say no for the aura",
        description: "Leave money on the table to make the brand feel more expensive.",
        statEffects: { trust: 5, credibility: 5, burnout: 1, money: -800 },
      },
    ],
  },
  {
    title: "Old Clip Resurfaces",
    description: "A stale clip with a worse haircut and a worse opinion has found fresh oxygen.",
    responses: [
      {
        label: "Own it",
        description: "Say you were cringe, say you evolved, say it calmly.",
        statEffects: { trust: 7, exposureRisk: -4, credibility: 4, followers: 500, burnout: 2 },
      },
      {
        label: "Delete and deny",
        description: "Classic strategy. Rarely elegant.",
        statEffects: { followers: 1_200, engagement: 2, trust: -7, exposureRisk: 9, burnout: 5 },
      },
      {
        label: "Turn it into merch",
        description: "If shame is inevitable, at least monetize the quote.",
        statEffects: { followers: 2_600, engagement: 3.5, money: 2_000, trust: -5, exposureRisk: 6 },
      },
    ],
  },
];

function buildName(seed = Date.now()) {
  return `${pickOne(firstNames, seed)} ${pickOne(lastNames, seed + 1)}`;
}

function mutateStats(stats: Stats, bonus: Partial<Stats> = {}) {
  return {
    ...stats,
    ...bonus,
  };
}

export function buildFallbackProfile(personaId: string): GameProfile {
  const persona = getPersonaById(personaId) ?? personas[0];
  const seed = persona.name.length * 101;
  const name = buildName(seed);

  return {
    id: createId("player"),
    categoryId: persona.categoryId,
    personaId: persona.id,
    name,
    personaType: persona.name,
    shortBio: `${persona.subtitle}. Trying to look inevitable on the internet.`,
    backstory: `Started as a regular ${persona.name.toLowerCase()} who realized that people trust confidence before they trust detail.`,
    contentStyle: persona.styleNotes.join(", "),
    startingHook: `“${pickOne(monthlyHeadlines, seed)}” but make it look self-made.`,
    weakness: persona.weakness,
    specialAbility: persona.specialAbility,
    avatarLabel: initialsFromName(name),
    stats: mutateStats(persona.baseStats),
  };
}

export function buildFallbackRivalProfile(personaId: string): GameProfile {
  const basePersona = getPersonaById(personaId) ?? personas[0];
  const rivals = personas.filter((persona) => persona.id !== basePersona.id);
  const rivalPersona = pickOne(rivals, basePersona.name.length * 33);
  const title = pickOne(rivalArchetypes, rivalPersona.name.length * 7);
  const name = `${title}`;

  return {
    id: createId("rival"),
    categoryId: rivalPersona.categoryId,
    personaId: rivalPersona.id,
    name,
    personaType: rivalPersona.name,
    shortBio: `Always online, always strangely favored by the feed.`,
    backstory: "Nobody knows where they came from. Everyone hates how well their posts convert.",
    contentStyle: `${rivalPersona.styleNotes.join(", ")} with extra algorithm luck.`,
    startingHook: "Posts once, wins twice, never explains the math.",
    weakness: "Looks invincible until the audience starts noticing the repetition.",
    specialAbility: "The Feed Blessing. Gains slightly higher passive monthly reach.",
    avatarLabel: initialsFromName(name),
    stats: mutateStats(rivalPersona.baseStats, {
      followers: rivalPersona.baseStats.followers + 1_500,
      money: rivalPersona.baseStats.money + 1_500,
      trust: rivalPersona.baseStats.trust + 3,
      exposureRisk: Math.max(10, rivalPersona.baseStats.exposureRisk - 2),
    }),
  };
}

export function buildFallbackMonthPreparation(gameState: Partial<StoredGameState>): MonthPreparation {
  const monthSeed = gameState.month ?? 1;
  const persona = getPersonaById(gameState.playerProfile?.personaId ?? "");
  const actionCards = actionTemplates
    .slice(monthSeed % 2, monthSeed % 2 + 3)
    .map((template, index) => ({
      ...template,
      id: createId(`ai-action-${monthSeed}-${index}`),
      source: "ai" as const,
      description: persona ? `${template.description} ${persona.styleNotes[0]}.` : template.description,
    }));

  return {
    headline: pickOne(monthlyHeadlines, monthSeed * 13),
    narrative: pickOne(monthlyNarratives, monthSeed * 17),
    actionCards,
  };
}

export function buildFallbackEvent(gameState: Partial<StoredGameState>) {
  return pickOne(eventTemplates, (gameState.month ?? 1) * 9);
}

export function buildFallbackRivalActions(gameState: Partial<StoredGameState>) {
  const month = gameState.month ?? 1;
  const baseActions = getAllBaseActions();
  const first = baseActions[(month * 3) % baseActions.length];
  return [first];
}

export function buildFallbackSummary(params: {
  month: number;
  historyEntry: Pick<GameHistoryEntry, "selectedActions" | "rivalActions" | "eventTitle" | "verdict">;
}) {
  const { month, historyEntry } = params;
  return {
    summary:
      `Month ${month} closed with ${historyEntry.selectedActions.join(" + ")} on your side and ` +
      `${historyEntry.rivalActions.join(" + ")} from the rival. ${historyEntry.eventTitle} made everything louder.`,
    verdict: historyEntry.verdict,
  };
}

export function buildFallbackFinalRecap(gameState: StoredGameState): FinalRecapData {
  const growth = summarizeGrowth(gameState.history);
  const playerScore = calculateCloutScore(gameState.playerStats);
  const rivalScore = calculateCloutScore(gameState.rivalStats);
  const openingFollowers = gameState.playerProfile?.stats.followers ?? 0;
  const moneyDelta = gameState.playerStats.money - (gameState.playerProfile?.stats.money ?? 0);
  const title = deriveFinalTitle(gameState.playerStats, gameState.playerProfile?.personaId ?? null, moneyDelta);
  const winner = playerScore >= rivalScore ? "won" : "lost";

  return {
    title,
    synopsis:
      `You ${winner} the year with ${formatCompactNumber(gameState.playerStats.followers)} followers, ` +
      `${formatCompactNumber(Math.max(0, gameState.playerStats.followers - openingFollowers))} net new reach, and a clout score of ${playerScore.toLocaleString()}.`,
    biggestGrowthMonth: growth.biggestGrowthMonth,
    biggestScandal: growth.biggestScandal,
    bestDecision: growth.bestDecision,
    worstDecision: growth.worstDecision,
    shareCard:
      `${title}\n` +
      `Followers: ${formatCompactNumber(gameState.playerStats.followers)}\n` +
      `Money: ${gameState.playerStats.money.toLocaleString()}\n` +
      `Trust: ${gameState.playerStats.trust}\n` +
      `Exposure: ${gameState.playerStats.exposureRisk}\n` +
      `Score: ${playerScore.toLocaleString()}`,
  };
}

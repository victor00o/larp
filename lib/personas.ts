import type { PersonaCategory, PersonaOption, Stats } from "@/lib/types";

const createStats = (stats: Partial<Stats>): Stats => ({
  followers: 4_800,
  engagement: 8,
  money: 3_500,
  trust: 55,
  exposureRisk: 18,
  burnout: 24,
  credibility: 52,
  ...stats,
});

export const personaCategories: PersonaCategory[] = [
  {
    id: "hustle-commerce",
    name: "Hustle Commerce",
    icon: "Coins",
    description:
      "Dropshippers, day traders, resellers, and course sellers. Fast growth, high risk, low trust.",
    tags: ["Fast growth", "Volatile cash", "Receipt risk"],
    riskLevel: "High",
  },
  {
    id: "founder-business",
    name: "Founder / Business",
    icon: "Building2",
    description:
      "Startup founders, agency owners, and business builders. High credibility ceiling, high burnout.",
    tags: ["Narrative leverage", "Burnout spiral", "Room energy"],
    riskLevel: "Medium",
  },
  {
    id: "corporate-fake-finance",
    name: "Corporate / Fake Finance Bro",
    icon: "BriefcaseBusiness",
    description:
      "LinkedIn thought leaders, productivity gurus, and finance bros. Viral advice, cringe risk, monetization potential.",
    tags: ["Advice virality", "Cringe risk", "PDF monetization"],
    riskLevel: "Medium",
  },
  {
    id: "fitness-beauty",
    name: "Fitness / Beauty",
    icon: "Sparkles",
    description:
      "Fitness influencers, beauty creators, wellness personalities, and lifestyle gurus. High engagement, high aesthetic pressure.",
    tags: ["High engagement", "Visual polish", "Lifestyle pressure"],
    riskLevel: "Medium",
  },
];

export const personas: PersonaOption[] = [
  {
    id: "dropshipper",
    categoryId: "hustle-commerce",
    name: "Dropshipper",
    subtitle: "Cash flow first, receipts later",
    description: "Makes every beach club table feel like a funnel and every funnel feel like destiny.",
    icon: "ShoppingBag",
    growth: 5,
    risk: 5,
    trustPotential: 2,
    monetization: 5,
    baseStats: createStats({ followers: 6_400, money: 5_200, trust: 39, exposureRisk: 30, credibility: 35 }),
    specialAbility: "Midnight Funnel. First Monetize each month gains +25% money.",
    weakness: "People immediately ask for receipts once you over-explain success.",
    styleNotes: ["Lifestyle flexes", "Stripe screenshots", "Remote-work mythmaking"],
    startingBoard: ["Content Studio", "Product Funnel", "Lifestyle Flex Suite"],
  },
  {
    id: "day-trader",
    categoryId: "hustle-commerce",
    name: "Day Trader",
    subtitle: "Discipline content with leverage attached",
    description: "Turns every chart candle into a morality tale about focus, hunger, and caffeine.",
    icon: "CandlestickChart",
    growth: 4,
    risk: 5,
    trustPotential: 2,
    monetization: 4,
    baseStats: createStats({ followers: 5_600, money: 6_700, trust: 41, exposureRisk: 28, credibility: 38 }),
    specialAbility: "Green Day. Hot Take gains +2 engagement when trust is above 40.",
    weakness: "Losses make the timeline smell fear immediately.",
    styleNotes: ["4AM reels", "Chart screenshots", "Discipline monologues"],
    startingBoard: ["Trading Desk", "Content Studio", "Drama Zone"],
  },
  {
    id: "reseller",
    categoryId: "hustle-commerce",
    name: "Reseller",
    subtitle: "Scarcity is a personality trait",
    description: "Builds mystique through limited drops, coded availability, and suspiciously perfect timing.",
    icon: "PackagePlus",
    growth: 3,
    risk: 4,
    trustPotential: 3,
    monetization: 4,
    baseStats: createStats({ followers: 5_100, money: 4_800, trust: 48, exposureRisk: 22, credibility: 44 }),
    specialAbility: "Sold Out Again. Improve Product grants +2 trust if money is positive.",
    weakness: "Once delivery complaints stack up, the aura goes thin fast.",
    styleNotes: ["Limited drops", "Backdoor sourcing", "Scarcity copywriting"],
    startingBoard: ["Product Funnel", "Community Hub", "Brand Deal Room"],
  },
  {
    id: "startup-founder",
    categoryId: "founder-business",
    name: "Startup Founder",
    subtitle: "Shipping blur and airport espresso",
    description: "Lives between pitch decks, founder dinners, and vague product screenshots.",
    icon: "Rocket",
    growth: 4,
    risk: 3,
    trustPotential: 5,
    monetization: 4,
    baseStats: createStats({ followers: 4_900, money: 7_000, trust: 64, exposureRisk: 16, burnout: 35, credibility: 66 }),
    specialAbility: "In The Room. Network gains +3 credibility and +3 trust.",
    weakness: "High-status chaos turns into burnout before it turns into compounding.",
    styleNotes: ["Founder dinners", "Airport check-ins", "Clean product shots"],
    startingBoard: ["Startup Office", "Product Lab", "Podcast Booth"],
  },
  {
    id: "agency-owner",
    categoryId: "founder-business",
    name: "Agency Owner",
    subtitle: "Case studies, calls, and borderline confidence",
    description: "Sells expertise and certainty with suspiciously fast client turnaround.",
    icon: "MonitorSmartphone",
    growth: 3,
    risk: 3,
    trustPotential: 4,
    monetization: 5,
    baseStats: createStats({ followers: 4_300, money: 6_300, trust: 58, exposureRisk: 17, credibility: 60 }),
    specialAbility: "Case Study Loop. Post Content also grants +900 money when credibility is above 60.",
    weakness: "Every grand claim begs for client proof.",
    styleNotes: ["Client wins", "Dashboard screenshots", "No-BS tone"],
    startingBoard: ["Client War Room", "Content Studio", "Community Hub"],
  },
  {
    id: "small-business-owner",
    categoryId: "founder-business",
    name: "Small Business Owner",
    subtitle: "Earnest grind with aesthetic packaging",
    description: "Wins through consistency, process, and a surprisingly loyal audience.",
    icon: "Store",
    growth: 3,
    risk: 2,
    trustPotential: 5,
    monetization: 4,
    baseStats: createStats({ followers: 3_700, money: 4_100, trust: 68, exposureRisk: 12, credibility: 70 }),
    specialAbility: "Community Loyalty. Recover adds +3 trust and +2 credibility.",
    weakness: "Growth is slower, and flashy rivals can outrun you short-term.",
    styleNotes: ["Behind the scenes", "Customer moments", "Maker energy"],
    startingBoard: ["Workshop Floor", "Newsletter Desk", "Community Hub"],
  },
  {
    id: "corporate-bro",
    categoryId: "corporate-fake-finance",
    name: "Corporate Bro",
    subtitle: "Inbox warrior, airport philosopher",
    description: "Builds status through polished routines, expensive coffee, and performative leadership wisdom.",
    icon: "LaptopMinimalCheck",
    growth: 4,
    risk: 3,
    trustPotential: 3,
    monetization: 4,
    baseStats: createStats({ followers: 4_200, money: 5_000, trust: 50, exposureRisk: 20, credibility: 48 }),
    specialAbility: "Calendar Authority. Copy Trend gains +1 trust instead of losing it.",
    weakness: "Audiences can smell recycled mentorship content immediately.",
    styleNotes: ["Commute rituals", "Leadership captions", "Conference badge selfies"],
    startingBoard: ["Boardroom Set", "Newsletter Desk", "Podcast Booth"],
  },
  {
    id: "fake-finance-bro",
    categoryId: "corporate-fake-finance",
    name: "Fake Finance Bro",
    subtitle: "Actual jargon, questionable depth",
    description: "Talks like a market oracle while strategically never being fully specific.",
    icon: "BadgeDollarSign",
    growth: 4,
    risk: 4,
    trustPotential: 2,
    monetization: 4,
    baseStats: createStats({ followers: 5_000, money: 5_800, trust: 43, exposureRisk: 24, credibility: 40 }),
    specialAbility: "Confidence Premium. Flex Harder also adds +1 credibility when money is above 10k.",
    weakness: "Specific questions turn the character into vapor.",
    styleNotes: ["Macro threads", "Steakhouse optics", "Watch shots"],
    startingBoard: ["Trading Desk", "Boardroom Set", "Lifestyle Flex Suite"],
  },
  {
    id: "productivity-guru",
    categoryId: "corporate-fake-finance",
    name: "Productivity Guru",
    subtitle: "Systems, templates, and deeply optimized vibes",
    description: "Convinces everyone that color-coded Notion pages are a path to significance.",
    icon: "NotebookTabs",
    growth: 3,
    risk: 3,
    trustPotential: 4,
    monetization: 5,
    baseStats: createStats({ followers: 4_600, money: 4_900, trust: 56, exposureRisk: 15, credibility: 54 }),
    specialAbility: "Template Economy. Monetize gains +20% money if trust is above 50.",
    weakness: "One lazy week and the whole discipline myth starts to wobble.",
    styleNotes: ["Desk setups", "Routine screenshots", "Time-block theater"],
    startingBoard: ["Newsletter Desk", "Content Studio", "Recovery Zone"],
  },
  {
    id: "fitness-influencer",
    categoryId: "fitness-beauty",
    name: "Fitness Influencer",
    subtitle: "Endorphins, symmetry, and subtle product placement",
    description: "Grows through transformation arcs, discipline theater, and high-performing thirst traps.",
    icon: "Dumbbell",
    growth: 5,
    risk: 3,
    trustPotential: 4,
    monetization: 4,
    baseStats: createStats({ followers: 5_900, money: 3_800, trust: 53, engagement: 10.5, credibility: 57 }),
    specialAbility: "Form Check. Post Content gains +2 engagement.",
    weakness: "The aesthetic machine punishes every tired month.",
    styleNotes: ["Gym mirrors", "Supplement drops", "Discipline edits"],
    startingBoard: ["Gym Setup", "Content Studio", "Recovery Zone"],
  },
  {
    id: "beauty-influencer",
    categoryId: "fitness-beauty",
    name: "Beauty Influencer",
    subtitle: "Polish, routine, and brand-soft power",
    description: "Turns every morning ritual into a high-margin storyline.",
    icon: "Gem",
    growth: 4,
    risk: 3,
    trustPotential: 4,
    monetization: 5,
    baseStats: createStats({ followers: 5_400, money: 4_600, trust: 58, engagement: 11.2, credibility: 55 }),
    specialAbility: "Pretty Conversion. Improve Product adds +1 engagement and +700 money.",
    weakness: "Audiences are generous until the sponsorships feel too fake.",
    styleNotes: ["Mirror shots", "PR unboxings", "Calm luxury tone"],
    startingBoard: ["Beauty Suite", "Brand Deal Room", "Content Studio"],
  },
  {
    id: "wellness-creator",
    categoryId: "fitness-beauty",
    name: "Wellness Creator",
    subtitle: "Soft voice, expensive routines, controlled chaos",
    description: "Sells emotional regulation through beautifully lit tea, rituals, and coastal restraint.",
    icon: "Leaf",
    growth: 3,
    risk: 2,
    trustPotential: 5,
    monetization: 4,
    baseStats: createStats({ followers: 4_500, money: 4_200, trust: 66, exposureRisk: 12, credibility: 61 }),
    specialAbility: "Nervous System Reset. Recover removes an extra 6 burnout.",
    weakness: "One public meltdown and the serenity economy gets weird fast.",
    styleNotes: ["Morning rituals", "Retreat aesthetics", "Soft-spoken authority"],
    startingBoard: ["Recovery Zone", "Newsletter Desk", "Beauty Suite"],
  },
];

const personaEmojiById: Record<string, string> = {
  dropshipper: "🛍️",
  "day-trader": "📈",
  reseller: "📦",
  "startup-founder": "🚀",
  "agency-owner": "💼",
  "small-business-owner": "🏪",
  "corporate-bro": "💻",
  "fake-finance-bro": "💸",
  "productivity-guru": "🗂️",
  "fitness-influencer": "💪",
  "beauty-influencer": "💎",
  "wellness-creator": "🌿",
};

const categoryEmojiById: Record<string, string> = {
  "hustle-commerce": "🪙",
  "founder-business": "🏢",
  "corporate-fake-finance": "💼",
  "fitness-beauty": "✨",
};

export function getCategoryById(categoryId: string) {
  return personaCategories.find((category) => category.id === categoryId) ?? null;
}

export function getPersonasForCategory(categoryId: string) {
  return personas.filter((persona) => persona.categoryId === categoryId);
}

export function getPersonaById(personaId: string) {
  return personas.find((persona) => persona.id === personaId) ?? null;
}

export function getPersonaVisual(personaId?: string | null, categoryId?: string | null) {
  const persona = personaId ? getPersonaById(personaId) : null;
  if (persona) {
    return {
      icon: persona.icon,
      emoji: personaEmojiById[persona.id] ?? "🎭",
    };
  }

  const category = categoryId ? getCategoryById(categoryId) : null;
  if (category) {
    return {
      icon: category.icon,
      emoji: categoryEmojiById[category.id] ?? "🎭",
    };
  }

  return {
    icon: "Sparkles",
    emoji: "🎭",
  };
}

export type Screen = "landing" | "category" | "persona" | "profile" | "dashboard" | "recap";
export type SidebarMode = "build" | "drama";
export type Accent = "player" | "rival";
export type RiskLevel = "Low" | "Medium" | "High";
export type GenerateType =
  | "profile"
  | "rivalProfile"
  | "monthlyNarrative"
  | "actions"
  | "event"
  | "rivalAction"
  | "summary"
  | "finalRecap";

export interface Stats {
  followers: number;
  engagement: number;
  money: number;
  trust: number;
  exposureRisk: number;
  burnout: number;
  credibility: number;
}

export type StatsDelta = Partial<Stats>;

export interface PersonaCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  tags: string[];
  riskLevel: RiskLevel;
}

export interface PersonaOption {
  id: string;
  categoryId: string;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  growth: number;
  risk: number;
  trustPotential: number;
  monetization: number;
  baseStats: Stats;
  specialAbility: string;
  weakness: string;
  styleNotes: string[];
  startingBoard: string[];
}

export interface GameProfile {
  id: string;
  categoryId: string;
  personaId: string;
  name: string;
  personaType: string;
  shortBio: string;
  backstory: string;
  contentStyle: string;
  startingHook: string;
  weakness: string;
  specialAbility: string;
  avatarLabel: string;
  stats: Stats;
}

export interface BoardTile {
  id: string;
  label: string;
  kind: string;
  level: number;
  accent: Accent;
  x: number;
  y: number;
}

export interface GameAction {
  id: string;
  title: string;
  description: string;
  source: "base" | "ai";
  group: SidebarMode;
  icon: string;
  cost: StatsDelta;
  upside: string;
  risk: string;
  statEffects: StatsDelta;
  boardTile: string;
}

export interface EventResponse {
  label: string;
  description: string;
  statEffects: StatsDelta;
}

export interface GameEvent {
  title: string;
  description: string;
  responses: EventResponse[];
}

export interface MonthPreparation {
  headline: string;
  narrative: string;
  actionCards: GameAction[];
}

export interface CrisisState {
  type: "exposed" | "burnout" | "trust";
  title: string;
  description: string;
  impact: string;
}

export interface GameHistoryEntry {
  month: number;
  headline: string;
  narrative: string;
  selectedActions: string[];
  rivalActions: string[];
  eventTitle: string;
  eventResponse: string;
  summary: string;
  verdict: string;
  beforeStats: Stats;
  afterStats: Stats;
  rivalBeforeStats: Stats;
  rivalAfterStats: Stats;
  crises: CrisisState[];
}

export interface FinalRecapData {
  title: string;
  synopsis: string;
  biggestGrowthMonth: string;
  biggestScandal: string;
  bestDecision: string;
  worstDecision: string;
  shareCard: string;
}

export interface PendingMonthResult {
  playerBeforeStats: Stats;
  rivalBeforeStats: Stats;
  playerProjectedStats: Stats;
  rivalProjectedStats: Stats;
  playerProjectedBoard: BoardTile[];
  rivalProjectedBoard: BoardTile[];
  selectedActions: GameAction[];
  rivalActions: GameAction[];
}

export interface ToastMessage {
  id: string;
  title: string;
  body: string;
  tone: "success" | "warning" | "danger" | "neutral";
}

export interface StoredGameState {
  screen: Screen;
  month: number;
  sidebarMode: SidebarMode;
  selectedCategoryId: string | null;
  selectedPersonaId: string | null;
  playerProfile: GameProfile | null;
  rivalProfile: GameProfile | null;
  playerStats: Stats;
  rivalStats: Stats;
  playerBoard: BoardTile[];
  rivalBoard: BoardTile[];
  monthlyHeadline: string;
  monthlyNarrative: string;
  generatedActions: GameAction[];
  selectedActionIds: string[];
  history: GameHistoryEntry[];
  activeEvent: GameEvent | null;
  pendingMonthResult: PendingMonthResult | null;
  monthSummary: GameHistoryEntry | null;
  crisisQueue: CrisisState[];
  finalRecap: FinalRecapData | null;
  hasUsedFallback: boolean;
  skipActionsNextMonth: number;
  lastSavedAt: string | null;
}

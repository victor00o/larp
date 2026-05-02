"use client";

import { useEffect, useMemo, useState } from "react";
import { generateGameContent } from "@/lib/ai/ai-generation";
import {
  buildFallbackEvent,
  buildFallbackFinalRecap,
  buildFallbackMonthPreparation,
  buildFallbackProfile,
  buildFallbackRivalActions,
  buildFallbackRivalProfile,
  buildFallbackSummary,
} from "@/lib/ai/fallback-data";
import { getAllBaseActions } from "@/lib/game/actions";
import {
  applyActionEffects,
  applyActionsToBoard,
  calculateCloutScore,
  clampStats,
  createBoardFromLabels,
  createDefaultStats,
  resolveCrises,
} from "@/lib/game/stat-calculation";
import { getPersonaById } from "@/lib/personas";
import { createId, initialsFromName } from "@/lib/utils";
import type {
  EventResponse,
  FinalRecapData,
  GameAction,
  GameEvent,
  GameHistoryEntry,
  GameProfile,
  SidebarMode,
  Stats,
  StatsDelta,
  StoredGameState,
  ToastMessage,
} from "@/lib/types";

const STORAGE_KEY = "self-made-ish-save-v1";

const initialState: StoredGameState = {
  screen: "landing",
  month: 1,
  sidebarMode: "build",
  selectedCategoryId: null,
  selectedPersonaId: null,
  playerProfile: null,
  rivalProfile: null,
  playerStats: createDefaultStats(),
  rivalStats: createDefaultStats(),
  playerBoard: [],
  rivalBoard: [],
  monthlyHeadline: "The algorithm is hungry.",
  monthlyNarrative: "Build the persona before the persona builds you.",
  generatedActions: [],
  selectedActionIds: [],
  history: [],
  activeEvent: null,
  pendingMonthResult: null,
  monthSummary: null,
  crisisQueue: [],
  finalRecap: null,
  hasUsedFallback: false,
  skipActionsNextMonth: 0,
  lastSavedAt: null,
};

function createSavedSnapshot(state: StoredGameState) {
  return {
    ...state,
    selectedActionIds: [...state.selectedActionIds],
    generatedActions: [...state.generatedActions],
    history: [...state.history],
    playerBoard: [...state.playerBoard],
    rivalBoard: [...state.rivalBoard],
    crisisQueue: [...state.crisisQueue],
  };
}

function normalizeProfile(profile: Partial<GameProfile> | null | undefined, fallback: GameProfile): GameProfile {
  const candidate = profile ?? {};
  return {
    ...fallback,
    ...candidate,
    avatarLabel: candidate.avatarLabel || initialsFromName(candidate.name || fallback.name),
    stats: clampStats({
      ...fallback.stats,
      ...(candidate.stats ?? {}),
    }),
  };
}

function normalizeAction(action: Partial<GameAction>, index: number): GameAction {
  return {
    id: action.id ?? createId(`action-${index}`),
    title: action.title ?? "Untitled Move",
    description: action.description ?? "The audience believes something happened here.",
    source: action.source ?? "ai",
    group: action.group ?? "build",
    icon: action.icon ?? "Sparkles",
    cost: action.cost ?? {},
    upside: action.upside ?? "Momentum",
    risk: action.risk ?? "Scrutiny",
    statEffects: action.statEffects ?? {},
    boardTile: action.boardTile ?? "Content Studio",
  };
}

function normalizeEvent(event: Partial<GameEvent> | null | undefined, fallback: GameEvent): GameEvent {
  if (!event) return fallback;
  return {
    title: event.title ?? fallback.title,
    description: event.description ?? fallback.description,
    responses:
      event.responses?.map((response, index) => ({
        label: response.label ?? fallback.responses[index]?.label ?? `Option ${index + 1}`,
        description: response.description ?? fallback.responses[index]?.description ?? "A choice was made.",
        statEffects: response.statEffects ?? fallback.responses[index]?.statEffects ?? {},
      })) ?? fallback.responses,
  };
}

function applyDelta(stats: Stats, delta: StatsDelta): Stats {
  return clampStats({
    followers: stats.followers + (delta.followers ?? 0),
    engagement: stats.engagement + (delta.engagement ?? 0),
    money: stats.money + (delta.money ?? 0),
    trust: stats.trust + (delta.trust ?? 0),
    exposureRisk: stats.exposureRisk + (delta.exposureRisk ?? 0),
    burnout: stats.burnout + (delta.burnout ?? 0),
    credibility: stats.credibility + (delta.credibility ?? 0),
  });
}

function deriveVerdict(before: Stats, after: Stats, rivalBefore: Stats, rivalAfter: Stats) {
  const playerDelta = calculateCloutScore(after) - calculateCloutScore(before);
  const rivalDelta = calculateCloutScore(rivalAfter) - calculateCloutScore(rivalBefore);

  if (playerDelta > rivalDelta + 2_000) return "You widened the gap. The rival looked briefly mortal.";
  if (rivalDelta > playerDelta + 2_000) return "The rival found the timeline's weak spot before you did.";
  return "Trust moved. Attention moved faster. The month counts as a draw.";
}

export function useGameState() {
  const [state, setState] = useState<StoredGameState>(initialState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const maxActions = useMemo(() => 1, []);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) setCanContinue(true);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || !state.playerProfile) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(createSavedSnapshot(state)));
    setCanContinue(true);
  }, [isHydrated, state]);

  function pushToast(title: string, body: string, tone: ToastMessage["tone"] = "neutral") {
    const id = createId("toast");
    setToasts((current) => [...current, { id, title, body, tone }].slice(-4));
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  }

  function removeToast(toastId: string) {
    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  }

  async function prepareMonth(snapshot: StoredGameState) {
    setIsLoading(true);
    setLoadingMessage("The algorithm is tuning the next month...");

    const fallback = buildFallbackMonthPreparation(snapshot);

    try {
      const [narrativeResponse, actionsResponse] = await Promise.all([
        generateGameContent<{ headline: string; narrative: string }>("monthlyNarrative", snapshot),
        generateGameContent<{ actionCards: GameAction[] }>("actions", snapshot),
      ]);

      const actionCards = (actionsResponse.data.actionCards ?? fallback.actionCards)
        .slice(0, 3)
        .map(normalizeAction);
      const fallbackUsed = narrativeResponse.fallbackUsed || actionsResponse.fallbackUsed;

      setState((current) => ({
        ...snapshot,
        monthlyHeadline: narrativeResponse.data.headline || fallback.headline,
        monthlyNarrative: narrativeResponse.data.narrative || fallback.narrative,
        generatedActions: actionCards,
        selectedActionIds: [],
        hasUsedFallback: current.hasUsedFallback || fallbackUsed,
      }));

      if (fallbackUsed) {
        pushToast("Fallback active", "AI missed the beat, so local flavor kept the month alive.", "neutral");
      }
    } catch {
      setState((current) => ({
        ...snapshot,
        monthlyHeadline: fallback.headline,
        monthlyNarrative: fallback.narrative,
        generatedActions: fallback.actionCards.slice(0, 3),
        selectedActionIds: [],
        hasUsedFallback: current.hasUsedFallback || true,
      }));
      pushToast("Fallback active", "AI generation failed, but the run stayed playable.", "warning");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  }

  async function generateProfiles(personaId: string) {
    const fallbackPlayer = buildFallbackProfile(personaId);
    const fallbackRival = buildFallbackRivalProfile(personaId);

    setIsLoading(true);
    setLoadingMessage("Generating your profile and your nemesis...");

    try {
      const [playerResponse, rivalResponse] = await Promise.all([
        generateGameContent<Partial<GameProfile>>("profile", { selectedPersonaId: personaId }),
        generateGameContent<Partial<GameProfile>>("rivalProfile", { selectedPersonaId: personaId }),
      ]);

      const playerProfile = normalizeProfile(playerResponse.data, fallbackPlayer);
      const rivalProfile = normalizeProfile(rivalResponse.data, fallbackRival);
      const playerPersona = getPersonaById(playerProfile.personaId) ?? getPersonaById(personaId);
      const rivalPersona = getPersonaById(rivalProfile.personaId);

      setState((current) => ({
        ...current,
        screen: "profile",
        selectedPersonaId: personaId,
        playerProfile,
        rivalProfile,
        playerStats: playerProfile.stats,
        rivalStats: rivalProfile.stats,
        playerBoard: createBoardFromLabels(playerPersona?.startingBoard ?? [], "player"),
        rivalBoard: createBoardFromLabels(rivalPersona?.startingBoard ?? ["Content Studio", "Drama Zone"], "rival"),
        hasUsedFallback: current.hasUsedFallback || playerResponse.fallbackUsed || rivalResponse.fallbackUsed,
      }));

      if (playerResponse.fallbackUsed || rivalResponse.fallbackUsed) {
        pushToast("Fallback profile", "Local personas stepped in while AI was unavailable.", "neutral");
      }
    } catch {
      const playerPersona = getPersonaById(personaId);
      const rivalPersona = getPersonaById(fallbackRival.personaId);

      setState((current) => ({
        ...current,
        screen: "profile",
        selectedPersonaId: personaId,
        playerProfile: fallbackPlayer,
        rivalProfile: fallbackRival,
        playerStats: fallbackPlayer.stats,
        rivalStats: fallbackRival.stats,
        playerBoard: createBoardFromLabels(playerPersona?.startingBoard ?? [], "player"),
        rivalBoard: createBoardFromLabels(rivalPersona?.startingBoard ?? ["Content Studio", "Drama Zone"], "rival"),
        hasUsedFallback: current.hasUsedFallback || true,
      }));
      pushToast("Fallback profile", "The game built both profiles locally.", "warning");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  }

  function startNewGame() {
    setState({
      ...initialState,
      screen: "landing",
    });
  }

  function continueSavedGame() {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as StoredGameState;
      setState(parsed);
      setCanContinue(true);
      pushToast("Save loaded", "The persona survived the reload.", "success");
    } catch {
      pushToast("Save error", "The save was corrupted, so the game started fresh.", "danger");
    }
  }

  function chooseCategory(categoryId: string) {
    setState((current) => ({
      ...current,
      screen: "persona",
      selectedCategoryId: categoryId,
      selectedPersonaId: null,
    }));
  }

  async function choosePersona(personaId: string) {
    setState((current) => ({
      ...current,
      screen: "profile",
      selectedPersonaId: personaId,
      playerProfile: null,
      rivalProfile: null,
    }));
    await generateProfiles(personaId);
  }

  async function regenerateProfiles() {
    if (!state.selectedPersonaId) return;
    await generateProfiles(state.selectedPersonaId);
  }

  async function acceptProfiles() {
    if (!state.playerProfile || !state.rivalProfile) return;
    const snapshot: StoredGameState = {
      ...state,
      screen: "dashboard",
      month: 1,
      history: [],
      finalRecap: null,
      monthSummary: null,
      activeEvent: null,
      pendingMonthResult: null,
      selectedActionIds: [],
      skipActionsNextMonth: 0,
      crisisQueue: [],
    };

    setState(snapshot);
    await prepareMonth(snapshot);
  }

  function backToPersona() {
    setState((current) => ({
      ...current,
      screen: "persona",
      playerProfile: null,
      rivalProfile: null,
    }));
  }

  function backToStart() {
    setState((current) => ({
      ...current,
      screen: "landing",
      selectedPersonaId: null,
    }));
  }

  function setSidebarMode(mode: SidebarMode) {
    setState((current) => ({
      ...current,
      sidebarMode: mode,
    }));
  }

  function toggleAction(actionId: string) {
    setState((current) => {
      if (current.selectedActionIds.includes(actionId)) {
        return {
          ...current,
          selectedActionIds: current.selectedActionIds.filter((id) => id !== actionId),
        };
      }

      if (current.selectedActionIds.length >= maxActions) {
        pushToast(
          "Action cap reached",
          `You can only queue ${maxActions} action${maxActions > 1 ? "s" : ""} this month.`,
          "warning"
        );
        return current;
      }

      return {
        ...current,
        selectedActionIds: [...current.selectedActionIds, actionId],
      };
    });
  }

  async function runMonth() {
    const allActions = [...getAllBaseActions(), ...state.generatedActions];
    const selectedActions = state.selectedActionIds
      .map((actionId) => allActions.find((action) => action.id === actionId))
      .filter((action): action is GameAction => Boolean(action));

    if (selectedActions.length !== maxActions) {
      pushToast(
        "Need more choices",
        `Pick exactly ${maxActions} action${maxActions > 1 ? "s" : ""} before running the month.`,
        "warning"
      );
      return;
    }

    setIsLoading(true);
    setLoadingMessage("The algorithm is deciding your fate...");

    try {
      const fallbackRivalActions = buildFallbackRivalActions(state);
      const fallbackEvent = buildFallbackEvent(state);

      const rivalActionResponse = await generateGameContent<{ actions: GameAction[]; log: string }>("rivalAction", {
        ...state,
        selectedActions,
      }).catch(() => ({
        data: {
          actions: fallbackRivalActions,
          log: "The rival posted something smug, vague, and somehow effective.",
        },
        fallbackUsed: true,
      }));

      const rivalActions = (rivalActionResponse.data.actions ?? fallbackRivalActions)
        .slice(0, 1)
        .map(normalizeAction);
      const projectedPlayerStats = applyActionEffects(state.playerStats, selectedActions);
      const projectedRivalStats = applyActionEffects(state.rivalStats, rivalActions);
      const projectedPlayerBoard = applyActionsToBoard(state.playerBoard, selectedActions, "player");
      const projectedRivalBoard = applyActionsToBoard(state.rivalBoard, rivalActions, "rival");

      const eventResponse = await generateGameContent<GameEvent>("event", {
        ...state,
        selectedActions,
        rivalActions,
        projectedPlayerStats,
        projectedRivalStats,
      }).catch(() => ({
        data: fallbackEvent,
        fallbackUsed: true,
      }));

      setState((current) => ({
        ...current,
        pendingMonthResult: {
          playerBeforeStats: current.playerStats,
          rivalBeforeStats: current.rivalStats,
          playerProjectedStats: projectedPlayerStats,
          rivalProjectedStats: projectedRivalStats,
          playerProjectedBoard: projectedPlayerBoard,
          rivalProjectedBoard: projectedRivalBoard,
          selectedActions,
          rivalActions,
        },
        activeEvent: normalizeEvent(eventResponse.data, fallbackEvent),
        skipActionsNextMonth: 0,
        hasUsedFallback: current.hasUsedFallback || rivalActionResponse.fallbackUsed || eventResponse.fallbackUsed,
      }));

      if (rivalActionResponse.fallbackUsed || eventResponse.fallbackUsed) {
        pushToast("Fallback month", "Local rival logic or event writing filled a gap.", "neutral");
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  }

  async function chooseEventResponse(response: EventResponse) {
    if (!state.pendingMonthResult || !state.activeEvent) return;

    setIsLoading(true);
    setLoadingMessage("Writing the month summary...");

    try {
      const playerAfterEvent = applyDelta(state.pendingMonthResult.playerProjectedStats, response.statEffects);
      const playerResolved = resolveCrises(playerAfterEvent);
      const rivalResolved = resolveCrises(state.pendingMonthResult.rivalProjectedStats);

      const baseEntry: GameHistoryEntry = {
        month: state.month,
        headline: state.monthlyHeadline,
        narrative: state.monthlyNarrative,
        selectedActions: state.pendingMonthResult.selectedActions.map((action) => action.title),
        rivalActions: state.pendingMonthResult.rivalActions.map((action) => action.title),
        eventTitle: state.activeEvent.title,
        eventResponse: response.label,
        summary: "",
        verdict: deriveVerdict(
          state.pendingMonthResult.playerBeforeStats,
          playerResolved.stats,
          state.pendingMonthResult.rivalBeforeStats,
          rivalResolved.stats
        ),
        beforeStats: state.pendingMonthResult.playerBeforeStats,
        afterStats: playerResolved.stats,
        rivalBeforeStats: state.pendingMonthResult.rivalBeforeStats,
        rivalAfterStats: rivalResolved.stats,
        crises: playerResolved.crises,
      };

      const fallbackSummary = buildFallbackSummary({
        month: state.month,
        historyEntry: baseEntry,
      });

      const summaryResponse = await generateGameContent<{ summary: string; verdict: string }>("summary", {
        ...state,
        baseEntry,
      }).catch(() => ({
        data: fallbackSummary,
        fallbackUsed: true,
      }));

      const historyEntry: GameHistoryEntry = {
        ...baseEntry,
        summary: summaryResponse.data.summary || fallbackSummary.summary,
        verdict: summaryResponse.data.verdict || fallbackSummary.verdict,
      };

      setState((current) => ({
        ...current,
        playerStats: playerResolved.stats,
        rivalStats: rivalResolved.stats,
        playerBoard: current.pendingMonthResult?.playerProjectedBoard ?? current.playerBoard,
        rivalBoard: current.pendingMonthResult?.rivalProjectedBoard ?? current.rivalBoard,
        history: [...current.history, historyEntry],
        monthSummary: historyEntry,
        activeEvent: null,
        pendingMonthResult: null,
        crisisQueue: [...current.crisisQueue, ...playerResolved.crises],
        skipActionsNextMonth: playerResolved.skipActionsNextMonth,
        hasUsedFallback: current.hasUsedFallback || summaryResponse.fallbackUsed,
      }));

      if (playerResolved.crises.length) {
        pushToast("Crisis triggered", playerResolved.crises[0].title, "danger");
      }
      if (summaryResponse.fallbackUsed) {
        pushToast("Fallback summary", "The game wrote the recap locally this month.", "neutral");
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  }

  async function continueAfterSummary() {
    if (!state.monthSummary) return;

    if (state.month >= 12) {
      setIsLoading(true);
      setLoadingMessage("Packing your final recap...");
      try {
        const fallbackRecap = buildFallbackFinalRecap(state);
        const recapResponse = await generateGameContent<FinalRecapData>("finalRecap", state).catch(() => ({
          data: fallbackRecap,
          fallbackUsed: true,
        }));

        setState((current) => ({
          ...current,
          screen: "recap",
          monthSummary: null,
          finalRecap: recapResponse.data ?? fallbackRecap,
          hasUsedFallback: current.hasUsedFallback || recapResponse.fallbackUsed,
        }));

        if (recapResponse.fallbackUsed) {
          pushToast("Fallback recap", "The final wrap-up was assembled locally.", "neutral");
        }
      } finally {
        setIsLoading(false);
        setLoadingMessage("");
      }
      return;
    }

    const snapshot: StoredGameState = {
      ...state,
      month: state.month + 1,
      screen: "dashboard",
      selectedActionIds: [],
      monthSummary: null,
      activeEvent: null,
      pendingMonthResult: null,
    };

    setState(snapshot);
    await prepareMonth(snapshot);
  }

  function dismissCrisis() {
    setState((current) => ({
      ...current,
      crisisQueue: current.crisisQueue.slice(1),
    }));
  }

  function saveProgress() {
    const snapshot: StoredGameState = {
      ...state,
      lastSavedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(createSavedSnapshot(snapshot)));
    setState(snapshot);
    setCanContinue(true);
    pushToast("Progress saved", "Your empire has been safely bottled.", "success");
  }

  function restartGame() {
    window.localStorage.removeItem(STORAGE_KEY);
    setCanContinue(false);
    setState(initialState);
    pushToast("Run reset", "The algorithm forgot everything. Mostly.", "neutral");
  }

  function copyRecapToClipboard() {
    if (!state.finalRecap) return;
    navigator.clipboard.writeText(state.finalRecap.shareCard);
    pushToast("Copied", "Share card copied to clipboard.", "success");
  }

  return {
    state,
    isHydrated,
    canContinue,
    isLoading,
    loadingMessage,
    toasts,
    maxActions,
    startNewGame,
    continueSavedGame,
    chooseCategory,
    choosePersona,
    regenerateProfiles,
    acceptProfiles,
    backToPersona,
    backToStart,
    setSidebarMode,
    toggleAction,
    runMonth,
    chooseEventResponse,
    continueAfterSummary,
    dismissCrisis,
    saveProgress,
    restartGame,
    copyRecapToClipboard,
    removeToast,
  };
}

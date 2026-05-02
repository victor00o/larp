import { NextResponse } from "next/server";
import { createDefaultStats } from "@/lib/game/stat-calculation";
import {
  buildFallbackEvent,
  buildFallbackFinalRecap,
  buildFallbackMonthPreparation,
  buildFallbackProfile,
  buildFallbackRivalActions,
  buildFallbackRivalProfile,
  buildFallbackSummary,
} from "@/lib/ai/fallback-data";
import { createId, initialsFromName } from "@/lib/utils";
import type { GenerateType, GameAction, GameEvent, GameProfile, StoredGameState } from "@/lib/types";

const SYSTEM_PROMPT =
  "You generate content for a satirical but safe internet persona simulator. " +
  "Keep it funny, fictional, non-explicit, and non-harmful. " +
  "Do not generate real financial advice, medical advice, dieting instructions, dangerous behavior, or explicit content. " +
  "Always return valid JSON matching the requested schema. Return JSON only.";

function coerceProfile(value: unknown, fallback: GameProfile): GameProfile {
  const candidate = (value ?? {}) as Partial<GameProfile> & { startingStats?: GameProfile["stats"] };
  return {
    ...fallback,
    ...candidate,
    avatarLabel: candidate.avatarLabel || initialsFromName(candidate.name || fallback.name),
    stats: {
      ...fallback.stats,
      ...(candidate.stats ?? candidate.startingStats ?? {}),
    },
  };
}

function coerceAction(value: unknown, index: number): GameAction {
  const candidate = (value ?? {}) as Partial<GameAction>;
  return {
    id: candidate.id ?? createId(`ai-action-${index}`),
    title: candidate.title ?? "Untitled Move",
    description: candidate.description ?? "The feed accepted a mysterious action.",
    source: candidate.source ?? "ai",
    group: candidate.group ?? "build",
    icon: candidate.icon ?? "Sparkles",
    cost: candidate.cost ?? {},
    upside: candidate.upside ?? "Momentum",
    risk: candidate.risk ?? "Audience scrutiny",
    statEffects: candidate.statEffects ?? {},
    boardTile: candidate.boardTile ?? "Content Studio",
  };
}

function coerceEvent(value: unknown, fallback: GameEvent): GameEvent {
  const candidate = (value ?? {}) as Partial<GameEvent>;
  return {
    title: candidate.title ?? fallback.title,
    description: candidate.description ?? fallback.description,
    responses:
      candidate.responses?.map((response, index) => ({
        label: response.label ?? fallback.responses[index]?.label ?? `Option ${index + 1}`,
        description: response.description ?? fallback.responses[index]?.description ?? "Something happened.",
        statEffects: response.statEffects ?? fallback.responses[index]?.statEffects ?? {},
      })) ?? fallback.responses,
  };
}

function sanitizeGameState(gameState: Partial<StoredGameState>) {
  return {
    month: gameState.month,
    monthlyHeadline: gameState.monthlyHeadline,
    monthlyNarrative: gameState.monthlyNarrative,
    selectedCategoryId: gameState.selectedCategoryId,
    selectedPersonaId: gameState.selectedPersonaId,
    playerProfile: gameState.playerProfile
      ? {
          name: gameState.playerProfile.name,
          personaType: gameState.playerProfile.personaType,
          weakness: gameState.playerProfile.weakness,
          specialAbility: gameState.playerProfile.specialAbility,
        }
      : null,
    rivalProfile: gameState.rivalProfile
      ? {
          name: gameState.rivalProfile.name,
          personaType: gameState.rivalProfile.personaType,
          weakness: gameState.rivalProfile.weakness,
        }
      : null,
    playerStats: gameState.playerStats,
    rivalStats: gameState.rivalStats,
    history: gameState.history?.slice(-3).map((entry) => ({
      month: entry.month,
      verdict: entry.verdict,
      selectedActions: entry.selectedActions,
      rivalActions: entry.rivalActions,
      eventTitle: entry.eventTitle,
    })),
  };
}

function buildPrompt(type: GenerateType, gameState: Partial<StoredGameState>) {
  switch (type) {
    case "profile":
      return {
        schema:
          '{"name":"","personaType":"","shortBio":"","backstory":"","contentStyle":"","startingHook":"","weakness":"","specialAbility":"","avatarLabel":"","startingStats":{"followers":0,"engagement":0,"money":0,"trust":0,"exposureRisk":0,"burnout":0,"credibility":0}}',
        user: `Generate a player profile JSON for the selected persona. Game state: ${JSON.stringify(sanitizeGameState(gameState))}`,
      };
    case "rivalProfile":
      return {
        schema:
          '{"name":"","personaType":"","shortBio":"","backstory":"","contentStyle":"","startingHook":"","weakness":"","specialAbility":"","avatarLabel":"","startingStats":{"followers":0,"engagement":0,"money":0,"trust":0,"exposureRisk":0,"burnout":0,"credibility":0}}',
        user: `Generate a funny rival profile called The Algorithm's Favourite or a similarly satirical persona. Game state: ${JSON.stringify(sanitizeGameState(gameState))}`,
      };
    case "monthlyNarrative":
      return {
        schema: '{"headline":"","narrative":""}',
        user: `Write a short month setup for the current game state. Game state: ${JSON.stringify(sanitizeGameState(gameState))}`,
      };
    case "actions":
      return {
        schema:
          '{"actionCards":[{"title":"","description":"","group":"build","icon":"Sparkles","cost":{"money":0,"burnout":0},"upside":"","risk":"","statEffects":{"followers":0,"engagement":0,"money":0,"trust":0,"exposureRisk":0,"burnout":0,"credibility":0},"boardTile":""}]}',
        user: `Generate 3 flavorful action cards for this month. Game state: ${JSON.stringify(sanitizeGameState(gameState))}`,
      };
    case "event":
      return {
        schema:
          '{"title":"","description":"","responses":[{"label":"","description":"","statEffects":{"followers":0,"engagement":0,"money":0,"trust":0,"exposureRisk":0,"burnout":0,"credibility":0}}]}',
        user: `Generate a random event with 3 choices for this month. Game state: ${JSON.stringify(sanitizeGameState(gameState))}`,
      };
    case "rivalAction":
      return {
        schema:
          '{"actions":[{"title":"","description":"","group":"drama","icon":"Sparkles","cost":{"money":0,"burnout":0},"upside":"","risk":"","statEffects":{"followers":0,"engagement":0,"money":0,"trust":0,"exposureRisk":0,"burnout":0,"credibility":0},"boardTile":""}],"log":""}',
        user: `Generate 1 rival action and a single-sentence rival log. Game state: ${JSON.stringify(sanitizeGameState(gameState))}`,
      };
    case "summary":
      return {
        schema: '{"summary":"","verdict":""}',
        user: `Write a month summary and a one-sentence verdict. Game state: ${JSON.stringify(sanitizeGameState(gameState))}`,
      };
    case "finalRecap":
      return {
        schema:
          '{"title":"","synopsis":"","biggestGrowthMonth":"","biggestScandal":"","bestDecision":"","worstDecision":"","shareCard":""}',
        user: `Write the final wrapped-style recap. Game state: ${JSON.stringify(sanitizeGameState(gameState))}`,
      };
  }
}

function getFallback(type: GenerateType, gameState: Partial<StoredGameState>) {
  const safeState: StoredGameState = {
    screen: "dashboard",
    month: gameState.month ?? 1,
    sidebarMode: gameState.sidebarMode ?? "build",
    selectedCategoryId: gameState.selectedCategoryId ?? null,
    selectedPersonaId: gameState.selectedPersonaId ?? null,
    playerProfile: gameState.playerProfile ?? null,
    rivalProfile: gameState.rivalProfile ?? null,
    playerStats: gameState.playerStats ?? createDefaultStats(),
    rivalStats: gameState.rivalStats ?? createDefaultStats(),
    playerBoard: gameState.playerBoard ?? [],
    rivalBoard: gameState.rivalBoard ?? [],
    monthlyHeadline: gameState.monthlyHeadline ?? "The algorithm is hungry.",
    monthlyNarrative: gameState.monthlyNarrative ?? "Attention is compounding. So is scrutiny.",
    generatedActions: gameState.generatedActions ?? [],
    selectedActionIds: gameState.selectedActionIds ?? [],
    history: gameState.history ?? [],
    activeEvent: gameState.activeEvent ?? null,
    pendingMonthResult: gameState.pendingMonthResult ?? null,
    monthSummary: gameState.monthSummary ?? null,
    crisisQueue: gameState.crisisQueue ?? [],
    finalRecap: gameState.finalRecap ?? null,
    hasUsedFallback: gameState.hasUsedFallback ?? true,
    skipActionsNextMonth: gameState.skipActionsNextMonth ?? 0,
    lastSavedAt: gameState.lastSavedAt ?? null,
  };

  switch (type) {
    case "profile":
      return buildFallbackProfile(gameState.selectedPersonaId ?? "startup-founder");
    case "rivalProfile":
      return buildFallbackRivalProfile(gameState.selectedPersonaId ?? "startup-founder");
    case "monthlyNarrative": {
      const fallback = buildFallbackMonthPreparation(gameState);
      return { headline: fallback.headline, narrative: fallback.narrative };
    }
    case "actions":
      return { actionCards: buildFallbackMonthPreparation(gameState).actionCards };
    case "event":
      return buildFallbackEvent(gameState);
    case "rivalAction":
      return {
        actions: buildFallbackRivalActions(gameState),
        log: "The rival posted something smug, vague, and annoyingly effective.",
      };
    case "summary": {
      const fallback = buildFallbackSummary({
        month: gameState.month ?? 1,
        historyEntry: {
          selectedActions: ["Post Content"],
          rivalActions: ["Hot Take"],
          eventTitle: "Receipts Please",
          verdict: "Trust bent. Reach kept climbing.",
        },
      });
      return fallback;
    }
    case "finalRecap":
      return buildFallbackFinalRecap(safeState);
  }
}

function normalizeGenerated(type: GenerateType, raw: unknown, gameState: Partial<StoredGameState>) {
  const fallback = getFallback(type, gameState);
  switch (type) {
    case "profile":
      return coerceProfile(raw, fallback as GameProfile);
    case "rivalProfile":
      return coerceProfile(raw, fallback as GameProfile);
    case "monthlyNarrative": {
      const candidate = (raw ?? {}) as { headline?: string; narrative?: string };
      return {
        headline: candidate.headline ?? (fallback as { headline: string }).headline,
        narrative: candidate.narrative ?? (fallback as { narrative: string }).narrative,
      };
    }
    case "actions": {
      const candidate = (raw ?? {}) as { actionCards?: unknown[] };
      return {
        actionCards:
          candidate.actionCards?.map((action, index) => coerceAction(action, index)) ??
          (fallback as { actionCards: GameAction[] }).actionCards,
      };
    }
    case "event":
      return coerceEvent(raw, fallback as GameEvent);
    case "rivalAction": {
      const candidate = (raw ?? {}) as { actions?: unknown[]; log?: string };
      return {
        actions:
          candidate.actions?.map((action, index) => coerceAction(action, index)) ??
          (fallback as { actions: GameAction[] }).actions,
        log: candidate.log ?? (fallback as { log: string }).log,
      };
    }
    case "summary": {
      const candidate = (raw ?? {}) as { summary?: string; verdict?: string };
      return {
        summary: candidate.summary ?? (fallback as { summary: string }).summary,
        verdict: candidate.verdict ?? (fallback as { verdict: string }).verdict,
      };
    }
    case "finalRecap": {
      const candidate = (raw ?? {}) as Partial<ReturnType<typeof buildFallbackFinalRecap>>;
      return {
        ...(fallback as ReturnType<typeof buildFallbackFinalRecap>),
        ...candidate,
      };
    }
  }
}

export async function POST(request: Request) {
  let requestedType: GenerateType = "monthlyNarrative";
  let requestedState: Partial<StoredGameState> = {};
  try {
    const { type, gameState } = (await request.json()) as {
      type: GenerateType;
      gameState: Partial<StoredGameState>;
    };
    requestedType = type;
    requestedState = gameState ?? {};

    if (!type) {
      return NextResponse.json({ error: "Missing generation type." }, { status: 400 });
    }

    const fallback = getFallback(type, gameState ?? {});
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    if (!apiKey) {
      return NextResponse.json({ data: fallback, fallbackUsed: true });
    }

    const prompt = buildPrompt(type, gameState ?? {});

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.9,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: `${prompt.user}\nMatch this JSON shape exactly:\n${prompt.schema}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ data: fallback, fallbackUsed: true });
    }

    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ data: fallback, fallbackUsed: true });
    }

    const parsed = JSON.parse(content);
    const normalized = normalizeGenerated(type, parsed, gameState ?? {});
    return NextResponse.json({ data: normalized, fallbackUsed: false });
  } catch {
    return NextResponse.json({ data: getFallback(requestedType, requestedState), fallbackUsed: true }, { status: 200 });
  }
}

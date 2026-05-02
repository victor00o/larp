"use client";

import * as React from "react";
import { PlayCircle } from "lucide-react";
import { ActionCard } from "@/components/game/action-card";
import { GameLog } from "@/components/game/game-log";
import { IsometricBoard } from "@/components/game/isometric-board";
import { LeftSidebar } from "@/components/game/left-sidebar";
import { ProfileAvatar } from "@/components/game/profile-avatar";
import { TopHud } from "@/components/game/top-hud";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getExposureTier, getTrustTier } from "@/lib/game/stat-tier";
import { cn, formatCompactNumber } from "@/lib/utils";
import type { BoardTile, GameAction, GameHistoryEntry, GameProfile, Stats } from "@/lib/types";

interface MainDashboardProps {
  month: number;
  playerProfile: GameProfile | null;
  rivalProfile: GameProfile | null;
  playerStats: Stats;
  rivalStats: Stats;
  playerBoard: BoardTile[];
  selectedActionIds: string[];
  generatedActions: GameAction[];
  monthlyHeadline: string;
  monthlyNarrative: string;
  history: GameHistoryEntry[];
  maxActions: number;
  onToggleAction: (actionId: string) => void;
  onSave: () => void;
  onRestart: () => void;
  onRunMonth: () => void;
}

export function MainDashboard({
  month,
  playerProfile,
  rivalProfile,
  playerStats,
  rivalStats,
  playerBoard,
  selectedActionIds,
  generatedActions,
  monthlyHeadline,
  monthlyNarrative,
  history,
  maxActions,
  onToggleAction,
  onSave,
  onRestart,
  onRunMonth,
}: MainDashboardProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const recentHistory = history.slice(-3).reverse();
  const selectedCount = selectedActionIds.length;
  const buttonLabel = maxActions === 1 ? "Run Month" : `Run ${maxActions} Moves`;

  return (
    <div className="min-h-screen bg-bg text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,208,132,0.07),transparent_28%),radial-gradient(circle_at_top_right,rgba(255,64,64,0.08),transparent_26%)]" />
      <div className="absolute inset-0 bg-hud-grid bg-[size:82px_82px] opacity-[0.08]" />

      <div className="relative mx-auto flex max-w-[1720px] gap-6 px-4 pb-8 pt-4 lg:px-6">
        <LeftSidebar
          playerProfile={playerProfile}
          playerStats={playerStats}
          history={history}
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen((open) => !open)}
        />

        <div className="min-w-0 flex-1 lg:pl-[290px]">
          <TopHud
            playerProfile={playerProfile}
            rivalProfile={rivalProfile}
            playerStats={playerStats}
            rivalStats={rivalStats}
            month={month}
            onSave={onSave}
            onRestart={onRestart}
          />

          <div className="mt-6 grid gap-6">
            <Card className="border-white/8 bg-white/[0.035] p-7 lg:p-9">
              <div className="max-w-3xl">
                <div className="text-base uppercase tracking-[0.22em] text-player">{monthlyHeadline}</div>
                <h2 className="mt-4 text-6xl font-semibold tracking-[-0.06em] text-white">Month {month}</h2>
                <p className="mt-4 text-2xl leading-10 text-white/72">{monthlyNarrative}</p>
              </div>
            </Card>

            <section>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <div className="text-4xl font-semibold tracking-[-0.05em] text-white">Pick your move.</div>
                </div>
                <div className="rounded-full border border-white/8 bg-white/[0.04] px-5 py-2.5 text-lg text-white/65">
                  {selectedCount} / {maxActions} selected
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-3">
                {generatedActions.map((action) => (
                  <ActionCard
                    key={action.id}
                    action={action}
                    selected={selectedActionIds.includes(action.id)}
                    onClick={() => onToggleAction(action.id)}
                  />
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  size="lg"
                  onClick={onRunMonth}
                  disabled={selectedActionIds.length !== maxActions}
                  className="h-16 rounded-2xl px-10 text-lg"
                >
                  <PlayCircle className="h-5 w-5" />
                  {buttonLabel}
                </Button>
                <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-base text-white/62">
                  One move only.
                </div>
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <Card className="border-player/15 bg-panel/95 p-6 shadow-player">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.24em] text-player">Your board</div>
                    <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
                      {playerProfile?.personaType ?? "Your Persona"}
                    </div>
                    <div className="mt-1 text-base text-white/55">Content. Chaos. Recovery. Repeat.</div>
                  </div>
                  <div className="rounded-full border border-player/15 bg-player/10 px-5 py-2.5 text-base text-player">
                    {formatCompactNumber(playerStats.followers)} followers
                  </div>
                </div>

                <div className="mt-5">
                  <IsometricBoard board={playerBoard} accent="player" compact />
                </div>
              </Card>

              <div className="grid gap-4">
                <Card className="border-white/8 bg-white/[0.035] p-6">
                  <div className="text-xs uppercase tracking-[0.24em] text-white/45">You vs Rival</div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                    <CompactPersonaCard label="You" profile={playerProfile} stats={playerStats} accent="player" />
                    <CompactPersonaCard label="Rival" profile={rivalProfile} stats={rivalStats} accent="rival" />
                  </div>
                </Card>

                <GameLog
                  title="Month Log"
                  accent="player"
                  entries={
                    recentHistory.length
                      ? recentHistory.map((entry) => `Month ${entry.month}: ${entry.summary}`)
                      : ["Your rival is gaining.", "Someone asked for receipts.", "Trust is not the only metric."]
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactPersonaCard({
  label,
  profile,
  stats,
  accent,
}: {
  label: string;
  profile: GameProfile | null;
  stats: Stats;
  accent: "player" | "rival";
}) {
  return (
    <div
      className={cn(
        "rounded-[24px] border p-5",
        accent === "player" ? "border-player/15 bg-player/7" : "border-rival/15 bg-rival/7"
      )}
    >
      <div className="flex items-center gap-3">
        <ProfileAvatar profile={profile} accent={accent} size="sm" />
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.22em] text-white/45">{label}</div>
          <div className="truncate text-xl font-semibold text-white">{profile?.name ?? label}</div>
          <div className="text-base text-white/55">{profile?.personaType ?? "Loading..."}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniStat label="Followers" value={formatCompactNumber(stats.followers)} tone={accent} />
        <MiniStat label="Trust" value={getTrustTier(stats.trust)} tone="neutral" />
        <MiniStat label="Exposure" value={getExposureTier(stats.exposureRisk)} tone="rival" />
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "player" | "rival" | "neutral";
}) {
  const textTone =
    tone === "player" ? "text-player" : tone === "rival" ? "text-rival" : "text-white";

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-3.5 py-3.5">
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/42">{label}</div>
      <div className={cn("mt-2 text-lg font-semibold", textTone)}>{value}</div>
    </div>
  );
}

"use client";

import { Menu, X } from "lucide-react";
import { GameLog } from "@/components/game/game-log";
import { ProfileAvatar } from "@/components/game/profile-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getExposureTier, getTrustTier } from "@/lib/game/stat-tier";
import { cn, formatCompactNumber } from "@/lib/utils";
import type { GameHistoryEntry, GameProfile, Stats } from "@/lib/types";

interface LeftSidebarProps {
  playerProfile: GameProfile | null;
  playerStats: Stats;
  history: GameHistoryEntry[];
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

export function LeftSidebar({
  playerProfile,
  playerStats,
  history,
  sidebarOpen,
  onSidebarToggle,
}: LeftSidebarProps) {
  const recentLog = history.length
    ? history
        .slice(-3)
        .reverse()
        .map((entry) => `Month ${entry.month}: ${entry.verdict}`)
    : ["Pick your move.", "Run the month.", "Try not to get exposed."];

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-20 z-30 rounded-2xl border border-white/10 bg-[#081019]/95 p-3 text-white lg:hidden"
        onClick={onSidebarToggle}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 w-[280px] border-r border-white/8 bg-[#05070acc] px-4 pb-5 pt-20 backdrop-blur-xl transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:pt-6",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col gap-4 overflow-y-auto pr-1">
          <Card className="border-player/15 bg-player/7 p-4">
            <div className="flex items-center gap-3">
              <ProfileAvatar profile={playerProfile} accent="player" size="md" />
              <div className="min-w-0">
                <div className="truncate text-xl font-semibold tracking-[-0.03em] text-white">
                  {playerProfile?.name ?? "Your Persona"}
                </div>
                <div className="mt-1 text-sm text-white/58">{playerProfile?.personaType ?? "Loading..."}</div>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <StatRow label="Followers" value={formatCompactNumber(playerStats.followers)} tone="player" />
              <StatRow label="Trust" value={getTrustTier(playerStats.trust)} tone="neutral" />
              <StatRow label="Exposure" value={getExposureTier(playerStats.exposureRisk)} tone="rival" />
            </div>

            <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">This month</div>
              <div className="mt-2 text-base font-medium text-white">Choose 1 move.</div>
              <div className="mt-1 text-sm text-white/55">Fast game. Big consequences.</div>
            </div>
          </Card>

          <GameLog title="Status Feed" accent="player" entries={recentLog} />

          <Button
            type="button"
            variant="secondary"
            className="lg:hidden"
            onClick={onSidebarToggle}
          >
            Close Panel
          </Button>
        </div>
      </aside>
    </>
  );
}

function StatRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "player" | "rival" | "neutral";
}) {
  const dotClass =
    tone === "player" ? "bg-player" : tone === "rival" ? "bg-rival" : "bg-white/45";

  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-white/62">
        <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
        {label}
      </div>
      <div className="text-lg font-semibold text-white">{value}</div>
    </div>
  );
}

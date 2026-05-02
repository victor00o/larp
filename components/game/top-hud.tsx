"use client";

import { motion } from "framer-motion";
import { RefreshCcw, Save } from "lucide-react";
import { AnimatedNumber } from "@/components/game/animated-number";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, formatCompactNumber } from "@/lib/utils";
import type { GameProfile, Stats } from "@/lib/types";

interface TopHudProps {
  playerProfile: GameProfile | null;
  rivalProfile: GameProfile | null;
  playerStats: Stats;
  rivalStats: Stats;
  month: number;
  onSave: () => void;
  onRestart: () => void;
}

export function TopHud({
  playerProfile,
  rivalProfile,
  playerStats,
  rivalStats,
  month,
  onSave,
  onRestart,
}: TopHudProps) {
  const totalFollowers = Math.max(1, playerStats.followers + rivalStats.followers);
  const playerShare = (playerStats.followers / totalFollowers) * 100;

  return (
    <Card className="sticky top-4 z-20 border-white/8 bg-[#060911]/92 px-5 py-4 backdrop-blur-2xl lg:px-6">
      <div className="grid gap-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(360px,1fr)_160px_auto] xl:items-center">
          <div className="min-w-0">
            <div className="text-3xl font-semibold leading-none tracking-[-0.05em] text-white lg:text-4xl lg:whitespace-nowrap">
              Larp till you&apos;re Larped
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4 text-center">
            <div className="text-xs uppercase tracking-[0.22em] text-white/45">Month</div>
            <div className="mt-1 text-3xl font-semibold text-white">{month} / 12</div>
          </div>

          <div className="flex flex-wrap items-center gap-3 xl:justify-end">
            <Button variant="secondary" onClick={onSave} className="h-14 rounded-2xl px-5 text-lg">
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button
              variant="ghost"
              onClick={onRestart}
              className={cn("h-14 rounded-2xl border border-white/10 bg-white/5 px-5 text-lg")}
            >
              <RefreshCcw className="h-4 w-4" />
              Restart
            </Button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(240px,1fr)_minmax(280px,1.2fr)_minmax(240px,1fr)]">
          <HudStat label={playerProfile?.name ?? "You"} value={playerStats.followers} accent="player" />

          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-5">
            <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.22em] text-white/45">
              <span>Month {month} / 12</span>
              <span>Feed race</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/8">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-player to-emerald-300"
                animate={{ width: `${playerShare}%` }}
                transition={{ type: "spring", stiffness: 130, damping: 20 }}
              />
              <motion.div
                className="relative -mt-3 h-full rounded-full bg-gradient-to-r from-rival to-red-300"
                animate={{ width: `${100 - playerShare}%`, marginLeft: `${playerShare}%` }}
                transition={{ type: "spring", stiffness: 130, damping: 20 }}
              />
            </div>
          </div>

          <HudStat label={rivalProfile?.name ?? "Rival"} value={rivalStats.followers} accent="rival" align="right" />
        </div>
      </div>
    </Card>
  );
}

function HudStat({
  label,
  value,
  accent,
  align = "left",
}: {
  label: string;
  value: number;
  accent: "player" | "rival";
  align?: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-5 py-5",
        accent === "player" ? "border-player/15 bg-player/8" : "border-rival/15 bg-rival/8",
        align === "right" ? "text-right" : "text-left"
      )}
    >
      <div className="min-h-[2.5rem] text-xs uppercase leading-5 tracking-[0.22em] text-white/45">{label}</div>
      <div className="mt-2 text-4xl font-semibold text-white">
        <AnimatedNumber value={value} formatter={formatCompactNumber} />
      </div>
      <div className="mt-1 text-base text-white/55">followers</div>
    </div>
  );
}

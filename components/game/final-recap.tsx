"use client";

import { motion } from "framer-motion";
import { Copy, RotateCcw, Trophy } from "lucide-react";
import { StatsCard } from "@/components/game/stats-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { calculateCloutScore } from "@/lib/game/stat-calculation";
import type { FinalRecapData, GameProfile, Stats } from "@/lib/types";
import { formatCompactNumber, formatMoney } from "@/lib/utils";

interface FinalRecapProps {
  recap: FinalRecapData | null;
  playerProfile: GameProfile | null;
  rivalProfile: GameProfile | null;
  playerStats: Stats;
  rivalStats: Stats;
  onRestart: () => void;
  onCopy: () => void;
}

export function FinalRecap({
  recap,
  playerProfile,
  rivalProfile,
  playerStats,
  rivalStats,
  onRestart,
  onCopy,
}: FinalRecapProps) {
  const playerScore = calculateCloutScore(playerStats);
  const rivalScore = calculateCloutScore(rivalStats);
  const win = playerScore >= rivalScore;

  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Card className="overflow-hidden border-white/8 bg-white/[0.04] p-8">
          <div className="text-[11px] uppercase tracking-[0.28em] text-muted">Wrapped-Style Recap</div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
              {win ? "You won the year." : "The rival took it."}
            </div>
            <div className="rounded-full border border-player/20 bg-player/10 px-4 py-2 text-sm text-player">
              {recap?.title ?? "Self-Made-ish Legend"}
            </div>
          </div>
          <h2 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-white">
            {recap?.title ?? "The final brand form"}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/70">{recap?.synopsis}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatsCard label="Your Clout" value={playerScore} tone="player" />
            <StatsCard label="Rival Clout" value={rivalScore} tone="rival" />
            <StatsCard label="Followers" value={playerStats.followers} tone="player" format="followers" />
            <StatsCard label="Money" value={playerStats.money} tone="player" format="money" />
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <RecapBlock title="Biggest Growth Month" copy={recap?.biggestGrowthMonth ?? "Month 3: accidental momentum."} />
            <RecapBlock title="Biggest Scandal" copy={recap?.biggestScandal ?? "A suspiciously vague controversy."} />
            <RecapBlock title="Best Decision" copy={recap?.bestDecision ?? "Picking moments instead of panic."} />
            <RecapBlock title="Worst Decision" copy={recap?.worstDecision ?? "Trusting the comments section."} />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={onCopy}>
              <Copy className="h-4 w-4" />
              Copy Share Card
            </Button>
            <Button variant="secondary" onClick={onRestart}>
              <RotateCcw className="h-4 w-4" />
              Start Over
            </Button>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="border-player/15 bg-player/6 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-player/25 bg-player/10 text-player">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-muted">Player Final</div>
                <div className="text-lg font-semibold text-white">{playerProfile?.name}</div>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm text-white/80">
              <RecapStat label="Followers" value={formatCompactNumber(playerStats.followers)} />
              <RecapStat label="Money Earned" value={formatMoney(playerStats.money)} />
              <RecapStat label="Trust Remaining" value={`${playerStats.trust}`} />
              <RecapStat label="Exposure Risk" value={`${playerStats.exposureRisk}`} />
            </div>
          </Card>
          <Card className="border-rival/15 bg-rival/6 p-5">
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted">Rival Final</div>
            <div className="mt-2 text-lg font-semibold text-white">{rivalProfile?.name}</div>
            <div className="mt-5 space-y-3 text-sm text-white/80">
              <RecapStat label="Followers" value={formatCompactNumber(rivalStats.followers)} />
              <RecapStat label="Money" value={formatMoney(rivalStats.money)} />
              <RecapStat label="Trust" value={`${rivalStats.trust}`} />
              <RecapStat label="Exposure Risk" value={`${rivalStats.exposureRisk}`} />
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

function RecapBlock({ title, copy }: { title: string; copy: string }) {
  return (
    <Card className="border-white/8 bg-white/[0.04] p-4">
      <div className="text-[11px] uppercase tracking-[0.22em] text-muted">{title}</div>
      <div className="mt-3 text-sm leading-6 text-white/80">{copy}</div>
    </Card>
  );
}

function RecapStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-3">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

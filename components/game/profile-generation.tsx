"use client";

import { motion } from "framer-motion";
import { RefreshCcw } from "lucide-react";
import { ProfileAvatar } from "@/components/game/profile-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/game/stats-card";
import type { GameProfile } from "@/lib/types";

interface ProfileGenerationProps {
  playerProfile: GameProfile | null;
  rivalProfile: GameProfile | null;
  isLoading: boolean;
  onAccept: () => void;
  onRegenerate: () => void;
  onBack: () => void;
}

export function ProfileGeneration({
  playerProfile,
  rivalProfile,
  isLoading,
  onAccept,
  onRegenerate,
  onBack,
}: ProfileGenerationProps) {
  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <div className="mb-12">
        <div className="text-[11px] uppercase tracking-[0.28em] text-muted">Generated Profiles</div>
        <h2 className="mt-4 text-5xl font-semibold tracking-[-0.05em] text-white">Pick your matchup.</h2>
      </div>

      <div className="grid items-stretch gap-6 xl:grid-cols-2">
        <ProfileCard accent="player" title="You" profile={playerProfile} isLoading={isLoading} />
        <ProfileCard accent="rival" title="The Algorithm's Favourite" profile={rivalProfile} isLoading={isLoading} />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button size="lg" onClick={onAccept} disabled={!playerProfile || !rivalProfile || isLoading}>
          Accept Profiles
        </Button>
        <Button size="lg" variant="secondary" onClick={onRegenerate} disabled={isLoading}>
          <RefreshCcw className="h-4 w-4" />
          Regenerate
        </Button>
        <Button size="lg" variant="ghost" onClick={onBack} className="border border-white/10 bg-white/5">
          Back
        </Button>
      </div>
    </div>
  );
}

function ProfileCard({
  accent,
  title,
  profile,
  isLoading,
}: {
  accent: "player" | "rival";
  title: string;
  profile: GameProfile | null;
  isLoading: boolean;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="h-full">
      <Card
        className={
          accent === "player"
            ? "flex h-full flex-col border-player/20 bg-player/6 p-7 shadow-player"
            : "flex h-full flex-col border-rival/20 bg-rival/6 p-7 shadow-rival"
        }
      >
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex items-start gap-4">
            <ProfileAvatar profile={profile} accent={accent} size="lg" />
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-muted">{title}</div>
              <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
                {profile?.name ?? (isLoading ? "Generating..." : "Unavailable")}
              </h3>
              <p className="mt-2 text-base text-white/70">{profile?.personaType ?? "Persona type pending"}</p>
            </div>
          </div>
          <div className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left xl:max-w-[240px] xl:text-right">
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted">Hook</div>
            <div className="mt-2 text-sm leading-6 text-white/80">
              {profile?.startingHook ?? "Synthesizing hook..."}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="grid gap-4">
            <InfoBlock label="Bio" value={profile?.shortBio ?? "Assembling creator shell..."} />
            <InfoBlock label="Content Style" value={profile?.contentStyle ?? "Waiting on style notes..."} />
          </div>
          <div className="grid gap-4">
            <InfoBlock label="Weakness" value={profile?.weakness ?? "No weakness found. Suspicious."} />
            <InfoBlock label="Special Ability" value={profile?.specialAbility ?? "No special ability yet."} />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <StatsCard label="Followers" value={profile?.stats.followers ?? 0} format="followers" tone={accent} />
          <StatsCard label="Money" value={profile?.stats.money ?? 0} format="money" tone={accent} />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <MicroStat label="Trust" value={`${profile?.stats.trust ?? 0}`} />
          <MicroStat label="Exposure" value={`${profile?.stats.exposureRisk ?? 0}`} />
          <MicroStat label="Credibility" value={`${profile?.stats.credibility ?? 0}`} />
        </div>
      </Card>
    </motion.div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="h-full rounded-2xl border border-white/8 bg-white/[0.04] p-5">
      <div className="text-[11px] uppercase tracking-[0.22em] text-muted">{label}</div>
      <div className="mt-3 text-base leading-7 text-white/82">{value}</div>
    </div>
  );
}

function MicroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="h-full rounded-2xl border border-white/8 bg-white/[0.04] p-3">
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted">{label}</div>
      <div className="mt-2 text-lg font-medium text-white">{value}</div>
    </div>
  );
}

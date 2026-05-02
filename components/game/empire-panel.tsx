import { GameLog } from "@/components/game/game-log";
import { IsometricBoard } from "@/components/game/isometric-board";
import { ProfileAvatar } from "@/components/game/profile-avatar";
import { ProgressStat } from "@/components/game/progress-stat";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCompactNumber, formatMoney, cn } from "@/lib/utils";
import type { BoardTile, GameProfile, Stats } from "@/lib/types";

interface EmpirePanelProps {
  accent: "player" | "rival";
  title: string;
  profile: GameProfile | null;
  stats: Stats;
  board: BoardTile[];
  logs: string[];
}

export function EmpirePanel({ accent, title, profile, stats, board, logs }: EmpirePanelProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden border-white/10 bg-panel/95 p-5",
        accent === "player" ? "shadow-player" : "shadow-rival"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <ProfileAvatar profile={profile} accent={accent} size="md" />
          <div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-muted">{title}</div>
            <div className="mt-1 text-xl font-semibold text-white">{profile?.name ?? "Loading..."}</div>
            <p className="mt-1 text-sm text-muted">{profile?.personaType ?? "Generating persona"}</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Badge className={accent === "player" ? "border-player/20 bg-player/10 text-player" : "border-rival/20 bg-rival/10 text-rival"}>
            {formatCompactNumber(stats.followers)} followers
          </Badge>
          <Badge>{formatMoney(stats.money)}</Badge>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_220px]">
        <IsometricBoard board={board} accent={accent} />
        <div className="space-y-3">
          <ProgressStat label="Trust" value={stats.trust} accent={accent} />
          <ProgressStat label="Exposure Risk" value={stats.exposureRisk} accent={accent === "player" ? "rival" : "rival"} />
          <ProgressStat label="Burnout" value={stats.burnout} accent="neutral" />
          <ProgressStat label="Credibility" value={stats.credibility} accent={accent} />
          <ProgressStat label="Engagement" value={stats.engagement * 2} accent={accent} />
        </div>
      </div>

      <div className="mt-4">
        <GameLog title={`${title} Status Feed`} accent={accent} entries={logs} />
      </div>
    </Card>
  );
}

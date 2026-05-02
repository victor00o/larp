import { EmpirePanel } from "@/components/game/empire-panel";
import type { BoardTile, GameProfile, Stats } from "@/lib/types";

interface PlayerPanelProps {
  profile: GameProfile | null;
  stats: Stats;
  board: BoardTile[];
  logs: string[];
}

export function PlayerPanel(props: PlayerPanelProps) {
  return <EmpirePanel {...props} accent="player" title="Your Empire" />;
}

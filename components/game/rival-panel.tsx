import { EmpirePanel } from "@/components/game/empire-panel";
import type { BoardTile, GameProfile, Stats } from "@/lib/types";

interface RivalPanelProps {
  profile: GameProfile | null;
  stats: Stats;
  board: BoardTile[];
  logs: string[];
}

export function RivalPanel(props: RivalPanelProps) {
  return <EmpirePanel {...props} accent="rival" title="Algorithm Rival" />;
}

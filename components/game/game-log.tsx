import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GameLogProps {
  title: string;
  accent: "player" | "rival";
  entries: string[];
}

export function GameLog({ title, accent, entries }: GameLogProps) {
  return (
    <Card
      className={cn(
        "border-white/8 bg-black/20 p-4 shadow-none",
        accent === "player" && "border-player/20",
        accent === "rival" && "border-rival/20"
      )}
    >
      <div className="mb-3 text-[11px] uppercase tracking-[0.24em] text-muted">{title}</div>
      <div className="space-y-2 text-sm text-white/80">
        {entries.length ? (
          entries.map((entry, index) => (
            <div key={`${title}-${index}`} className="rounded-xl border border-white/6 bg-white/[0.03] px-3 py-2">
              {entry}
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-white/8 px-3 py-4 text-muted">
            Waiting for the next move.
          </div>
        )}
      </div>
    </Card>
  );
}

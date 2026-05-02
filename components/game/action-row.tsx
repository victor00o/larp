"use client";

import { motion } from "framer-motion";
import { IconBadge } from "@/components/game/icon-map";
import { cn, formatDelta, titleCase } from "@/lib/utils";
import type { GameAction } from "@/lib/types";

interface ActionRowProps {
  action: GameAction;
  selected: boolean;
  accent: "player" | "rival";
  disabled?: boolean;
  onClick?: () => void;
}

function formatCost(action: GameAction) {
  const [entry] = Object.entries(action.cost);
  if (!entry) return "No direct cost";
  const [key, value] = entry;
  return `${formatDelta(value ?? 0, key === "money" ? "money" : "number")} ${titleCase(key)}`;
}

export function ActionRow({ action, selected, accent, disabled, onClick }: ActionRowProps) {
  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { x: 4 }}
      whileTap={disabled ? undefined : { scale: 0.99 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group w-full rounded-2xl border border-white/8 bg-white/[0.025] p-4 text-left transition-all duration-200",
        selected &&
          accent === "player" &&
          "border-player/40 bg-player/10 shadow-[0_0_24px_rgba(0,208,132,0.14)]",
        selected &&
          accent === "rival" &&
          "border-rival/40 bg-rival/10 shadow-[0_0_24px_rgba(255,64,64,0.14)]",
        !selected && "hover:border-white/15 hover:bg-white/[0.05]",
        disabled && "cursor-not-allowed opacity-40"
      )}
    >
      <div className="flex items-start gap-3">
        <IconBadge
          name={action.icon}
          className={cn(
            "h-10 w-10 rounded-xl",
            selected && accent === "player" && "border-player/30 bg-player/12 text-player",
            selected && accent === "rival" && "border-rival/30 bg-rival/12 text-rival"
          )}
          iconClassName={selected ? (accent === "player" ? "text-player" : "text-rival") : ""}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-base font-medium text-white">{action.title}</div>
            </div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted">{formatCost(action)}</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

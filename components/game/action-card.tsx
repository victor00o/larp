"use client";

import { motion } from "framer-motion";
import { IconBadge } from "@/components/game/icon-map";
import { Card } from "@/components/ui/card";
import { cn, formatCompactNumber, formatMoney } from "@/lib/utils";
import type { GameAction } from "@/lib/types";

interface ActionCardProps {
  action: GameAction;
  selected: boolean;
  onClick: () => void;
}

export function ActionCard({ action, selected, onClick }: ActionCardProps) {
  const preview = buildPreview(action);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
      className="text-left"
    >
      <Card
        className={cn(
          "min-h-[340px] h-full overflow-hidden border-white/8 bg-white/[0.035] p-6 transition-all duration-200",
          selected ? "border-player/40 bg-player/10 shadow-player" : "hover:border-white/18 hover:bg-white/[0.05]"
        )}
      >
        <div className="flex items-start gap-4">
          <IconBadge
            name={action.icon}
            className={cn(
              "h-12 w-12 rounded-2xl",
              selected ? "border-player/30 bg-player/12 text-player" : ""
            )}
            iconClassName={selected ? "text-player" : ""}
          />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-2xl font-semibold tracking-[-0.04em] text-white">{action.title}</div>
                <p className="mt-2 overflow-hidden text-base leading-7 text-white/62 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                  {action.description}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.18em]",
                  selected ? "border-player/25 bg-player/10 text-player" : "border-white/10 bg-white/5 text-white/55"
                )}
              >
                {selected ? "Selected" : "Pick"}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {preview.map((item) => (
                <span
                  key={`${action.id}-${item}`}
                  className="rounded-full border border-white/8 bg-white/[0.04] px-3.5 py-2 text-sm text-white/78"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-5 text-base text-rival/85">Risk: {action.risk}</div>
          </div>
        </div>
      </Card>
    </motion.button>
  );
}

function buildPreview(action: GameAction) {
  const items: string[] = [];

  if ((action.statEffects.followers ?? 0) > 0) {
    items.push(`+${formatCompactNumber(action.statEffects.followers ?? 0)} followers`);
  }

  if ((action.statEffects.money ?? 0) > 0) {
    items.push(`+${formatMoney(action.statEffects.money ?? 0)}`);
  }

  if ((action.statEffects.trust ?? 0) > 0) {
    items.push(`+${action.statEffects.trust} trust`);
  }

  if ((action.statEffects.burnout ?? 0) < 0) {
    items.push(`${action.statEffects.burnout} burnout`);
  }

  if ((action.statEffects.exposureRisk ?? 0) > 0 && items.length < 3) {
    items.push(`+${action.statEffects.exposureRisk} exposure`);
  }

  if (!items.length) {
    items.push(action.boardTile);
  }

  return items.slice(0, 3);
}

"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/game/animated-number";
import { cn, formatCompactNumber, formatMoney, formatPercent } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: number;
  tone?: "player" | "rival" | "neutral";
  format?: "followers" | "money" | "percent" | "number";
  delta?: number;
}

export function StatsCard({ label, value, tone = "neutral", format = "number", delta }: StatsCardProps) {
  const formatter = (next: number) => {
    if (format === "followers") return formatCompactNumber(next);
    if (format === "money") return formatMoney(next);
    if (format === "percent") return formatPercent(next);
    return next.toLocaleString();
  };

  return (
    <motion.div layout whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}>
      <Card
        className={cn(
          "h-full min-w-0 border-white/8 bg-white/[0.03] p-4",
          tone === "player" && "shadow-player",
          tone === "rival" && "shadow-rival"
        )}
      >
        <div className="text-[11px] uppercase tracking-[0.24em] text-muted">{label}</div>
        <div className="mt-3 text-2xl font-semibold tracking-tight text-white">
          <AnimatedNumber value={value} formatter={formatter} />
        </div>
        {typeof delta === "number" ? (
          <div className={cn("mt-2 text-xs", delta >= 0 ? "text-player" : "text-rival")}>
            {delta >= 0 ? "+" : ""}
            {format === "money" ? formatMoney(delta) : delta.toFixed(1)}
          </div>
        ) : null}
      </Card>
    </motion.div>
  );
}

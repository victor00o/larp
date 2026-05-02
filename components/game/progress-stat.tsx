"use client";

import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressStatProps {
  label: string;
  value: number;
  accent?: "player" | "rival" | "neutral";
}

export function ProgressStat({ label, value, accent = "neutral" }: ProgressStatProps) {
  return (
    <motion.div layout className="space-y-2 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
      <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.2em] text-muted">
        <span>{label}</span>
        <span className={cn("text-white", accent === "player" && "text-player", accent === "rival" && "text-rival")}>
          {Math.round(value)}
        </span>
      </div>
      <Progress
        value={value}
        indicatorClassName={cn(
          accent === "player" && "bg-gradient-to-r from-player to-emerald-300",
          accent === "rival" && "bg-gradient-to-r from-rival to-red-300",
          accent === "neutral" && "bg-gradient-to-r from-slate-400 to-white"
        )}
      />
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { BoardTile } from "@/lib/types";

const grid = Array.from({ length: 5 }, (_, x) =>
  Array.from({ length: 5 }, (_, y) => ({ x, y }))
).flat();

function getPosition(x: number, y: number) {
  return {
    left: 180 + (x - y) * 54,
    top: 42 + (x + y) * 30,
  };
}

export function IsometricBoard({
  board,
  accent,
  compact = false,
}: {
  board: BoardTile[];
  accent: "player" | "rival";
  compact?: boolean;
}) {
  const visibleBoard = compact ? board.slice(0, 6) : board;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[26px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]",
        compact ? "h-[290px]" : "h-[380px]"
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:34px_34px] opacity-30" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

      {grid.map((cell) => {
        const position = getPosition(cell.x, cell.y);
        return (
          <div
            key={`${cell.x}-${cell.y}`}
            className="absolute h-20 w-20"
            style={{ left: position.left, top: position.top }}
          >
            <div className="h-full w-full rotate-45 rounded-[18px] border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(0,0,0,0.2))] shadow-[0_14px_24px_rgba(0,0,0,0.35)]" />
          </div>
        );
      })}

      {visibleBoard.map((tile, index) => {
        const position = getPosition(tile.x, tile.y);
        return (
          <motion.div
            key={tile.id}
            className={cn("absolute z-10", compact ? "h-20 w-20" : "h-24 w-24")}
            style={{
              left: compact ? position.left - 18 : position.left - 2,
              top: compact ? position.top - 18 : position.top - 12,
            }}
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.04 }}
            whileHover={{ y: -6 }}
          >
            <div
              className={cn(
                "absolute inset-x-4 top-9 h-10 rounded-full blur-xl",
                accent === "player" ? "bg-player/35" : "bg-rival/35"
              )}
            />
            <div
              className={cn(
                "absolute top-0 border shadow-[0_18px_30px_rgba(0,0,0,0.4)] backdrop-blur-md",
                compact ? "inset-x-2 rounded-[20px] px-2.5 py-2.5" : "inset-x-3 rounded-[22px] px-3 py-3",
                accent === "player"
                  ? "border-player/30 bg-[linear-gradient(180deg,rgba(0,208,132,0.14),rgba(13,17,23,0.95))]"
                  : "border-rival/30 bg-[linear-gradient(180deg,rgba(255,64,64,0.14),rgba(13,17,23,0.95))]"
              )}
            >
              <div className="text-[10px] uppercase tracking-[0.24em] text-muted">Lv {tile.level}</div>
              <div className={cn("mt-1 font-semibold leading-5 text-white", compact ? "text-xs" : "text-sm")}>
                {tile.label}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

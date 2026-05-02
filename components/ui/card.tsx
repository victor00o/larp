import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[22px] border border-white/8 bg-card/90 shadow-panel backdrop-blur-xl",
        className
      )}
      {...props}
    />
  );
}

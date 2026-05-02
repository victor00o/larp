"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ToastMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (toastId: string) => void;
}) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex w-full max-w-sm flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.button
            key={toast.id}
            onClick={() => onDismiss(toast.id)}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={cn(
              "rounded-2xl border px-4 py-3 text-left shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl",
              toast.tone === "success" && "border-player/30 bg-player/12",
              toast.tone === "warning" && "border-amber-400/30 bg-amber-400/10",
              toast.tone === "danger" && "border-rival/30 bg-rival/10",
              toast.tone === "neutral" && "border-white/10 bg-[#0b1018]/95"
            )}
          >
            <div className="text-sm font-semibold text-white">{toast.title}</div>
            <div className="mt-1 text-sm leading-6 text-white/75">{toast.body}</div>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

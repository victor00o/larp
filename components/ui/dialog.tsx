"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DialogProps extends PropsWithChildren {
  open: boolean;
  title: string;
  description?: string;
  footer?: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Dialog({ open, title, description, footer, onClose, className, children }: DialogProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={cn(
              "w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#070b12] p-6 shadow-[0_24px_120px_rgba(0,0,0,0.5)]",
              className
            )}
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 18, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 180, damping: 20 }}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-white">{title}</h3>
                {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{description}</p> : null}
              </div>
              {onClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/10 p-2 text-white/70 transition hover:border-white/20 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
            <div>{children}</div>
            {footer ? <div className="mt-6 flex flex-wrap justify-end gap-3">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";

export function LoadingOverlay({ visible, message }: { visible: boolean; message?: string }) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="rounded-[28px] border border-white/10 bg-[#060b11]/95 px-8 py-7 text-center shadow-[0_24px_90px_rgba(0,0,0,0.45)]"
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.98, y: 12 }}
          >
            <div className="mx-auto h-12 w-12 rounded-full border-2 border-player/20 border-t-player animate-spin" />
            <div className="mt-5 text-base font-medium text-white">{message ?? "The algorithm is deciding your fate..."}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

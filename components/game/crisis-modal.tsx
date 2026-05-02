"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CrisisState } from "@/lib/types";

interface CrisisModalProps {
  crisis: CrisisState | null;
  open: boolean;
  onClose: () => void;
}

export function CrisisModal({ crisis, open, onClose }: CrisisModalProps) {
  return (
    <Dialog
      open={open && !!crisis}
      title={crisis?.title ?? "Crisis"}
      description={crisis?.description ?? "The audience has entered a new mood."}
      footer={
        <Button onClick={onClose} variant={crisis?.type === "exposed" ? "danger" : "secondary"}>
          Understood
        </Button>
      }
    >
      <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4 text-sm leading-6 text-white/80">
        {crisis?.impact}
      </div>
    </Dialog>
  );
}

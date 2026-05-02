"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { EventResponse, GameEvent } from "@/lib/types";

interface RandomEventModalProps {
  event: GameEvent | null;
  open: boolean;
  onSelectResponse: (response: EventResponse) => void;
}

export function RandomEventModal({ event, open, onSelectResponse }: RandomEventModalProps) {
  return (
    <Dialog
      open={open && !!event}
      title={event?.title ?? "Random Event"}
      description={event?.description ?? "The timeline has opinions."}
    >
      <div className="grid gap-3">
        {event?.responses.map((response) => (
          <Card key={response.label} className="border-white/8 bg-white/[0.04] p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-base font-semibold text-white">{response.label}</div>
                <p className="mt-2 text-sm leading-6 text-white/70">{response.description}</p>
              </div>
              <Button variant="secondary" onClick={() => onSelectResponse(response)}>
                Choose
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Dialog>
  );
}

"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { IconBadge } from "@/components/game/icon-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PersonaCategory, PersonaOption } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PersonaSelectProps {
  category: PersonaCategory | null;
  personas: PersonaOption[];
  selectedPersonaId: string | null;
  onSelect: (personaId: string) => void;
  onBack: () => void;
}

export function PersonaSelect({
  category,
  personas,
  selectedPersonaId,
  onSelect,
  onBack,
}: PersonaSelectProps) {
  return (
    <div className="mx-auto max-w-7xl px-5 py-10">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-muted">
            {category?.name ?? "Sub-Personas"}
          </div>
          <h2 className="mt-4 text-5xl font-semibold tracking-[-0.05em] text-white">Choose the role.</h2>
        </div>
        <Button variant="ghost" onClick={onBack} className="border border-white/10 bg-white/5">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {personas.map((persona) => {
          const isSelected = selectedPersonaId === persona.id;
          return (
            <motion.button key={persona.id} type="button" whileHover={{ y: -4 }} onClick={() => onSelect(persona.id)}>
              <Card
                className={cn(
                  "h-full border-white/8 bg-white/[0.04] p-6 text-left transition-all duration-200",
                  isSelected && "border-player/35 bg-player/10 shadow-player"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <IconBadge
                      name={persona.icon}
                      className={cn("h-14 w-14 rounded-3xl", isSelected && "border-player/25 bg-player/10")}
                      iconClassName={isSelected ? "text-player" : ""}
                    />
                    <div>
                      <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">{persona.name}</h3>
                      <p className="mt-2 text-base text-muted">{persona.subtitle}</p>
                    </div>
                  </div>
                  <Badge>{persona.risk}/5</Badge>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  <Metric label="Growth" value={`${persona.growth}/5`} />
                  <Metric label="Trust" value={`${persona.trustPotential}/5`} />
                  <Metric label="Risk" value={`${persona.risk}/5`} />
                  <Metric label="Money" value={`${persona.monetization}/5`} />
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {persona.styleNotes.map((note) => (
                    <Badge key={note}>{note}</Badge>
                  ))}
                </div>
                <div className="mt-7 text-sm text-player">Select</div>
              </Card>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <div className="text-[10px] uppercase tracking-[0.22em] text-muted">{label}</div>
      <div className="mt-3 text-lg font-medium text-white">{value}</div>
    </div>
  );
}

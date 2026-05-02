"use client";

import { motion } from "framer-motion";
import { IconBadge } from "@/components/game/icon-map";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { PersonaCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PersonaCategorySelectProps {
  categories: PersonaCategory[];
  selectedCategoryId: string | null;
  onSelect: (categoryId: string) => void;
}

export function PersonaCategorySelect({
  categories,
  selectedCategoryId,
  onSelect,
}: PersonaCategorySelectProps) {
  return (
    <div className="mx-auto max-w-7xl px-5 py-12">
      <div className="mb-12">
        <div className="text-[11px] uppercase tracking-[0.28em] text-muted">Persona Categories</div>
        <h2 className="mt-4 text-5xl font-semibold tracking-[-0.05em] text-white">Pick your lane.</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {categories.map((category) => {
          const isSelected = selectedCategoryId === category.id;
          return (
            <motion.button key={category.id} type="button" whileHover={{ y: -4 }} onClick={() => onSelect(category.id)}>
              <Card
                className={cn(
                  "h-full border-white/8 bg-white/[0.04] p-7 text-left transition-all duration-200",
                  isSelected && "border-player/35 bg-player/10 shadow-player"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <IconBadge
                      name={category.icon}
                      className={cn("h-16 w-16 rounded-3xl", isSelected && "border-player/25 bg-player/10")}
                      iconClassName={isSelected ? "text-player" : ""}
                    />
                    <div>
                      <h3 className="text-3xl font-semibold tracking-[-0.04em] text-white">{category.name}</h3>
                      <p className="mt-3 max-w-xl text-base leading-7 text-white/68">{category.description}</p>
                    </div>
                  </div>
                  <Badge className={cn(isSelected ? "border-player/20 bg-player/10 text-player" : "")}>
                    Risk {category.riskLevel}
                  </Badge>
                </div>
                <div className="mt-8 flex flex-wrap gap-2">
                  {category.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </Card>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { ArrowRight, Crown } from "lucide-react";
import { IconBadge } from "@/components/game/icon-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PersonaCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LandingPageProps {
  categories: PersonaCategory[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
  onContinue?: () => void;
  canContinue: boolean;
}

export function LandingPage({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onContinue,
  canContinue,
}: LandingPageProps) {
  return (
    <div className="relative min-h-screen overflow-hidden px-5 py-8 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,208,132,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,64,64,0.12),transparent_30%),linear-gradient(180deg,#05070A_0%,#04060A_100%)]" />
      <div className="absolute inset-0 bg-hud-grid bg-[size:120px_120px] opacity-[0.12]" />
      <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col items-center justify-center gap-10 py-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <div className="mx-auto max-w-5xl text-center">
            <div className="mx-auto flex h-36 w-36 items-center justify-center">
              <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-player/20 bg-player/10 shadow-[0_0_60px_rgba(0,208,132,0.16)]">
                <motion.div
                  className="absolute inset-[-10px] rounded-full border border-player/20"
                  animate={{ scale: [1, 1.05, 1], opacity: [0.7, 0.25, 0.7] }}
                  transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute inset-[-22px] rounded-full border border-player/10"
                  animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.1, 0.45] }}
                  transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-player/30 bg-[#06110c]">
                  <Crown className="h-10 w-10 text-player" />
                </div>
              </div>
            </div>

            <div className="mt-5 text-[11px] uppercase tracking-[0.34em] text-muted">Game Menu</div>
            <h1 className="mt-5 text-5xl font-semibold tracking-[-0.08em] text-white sm:text-7xl lg:text-[6rem]">
              Larp till you&apos;re Larped
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base tracking-[0.01em] text-white/55 sm:text-lg">
              Build the persona. Feed the algorithm. Survive 12 months.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="w-full max-w-6xl"
        >
          <div className="mb-5 text-center">
            <div className="text-[11px] uppercase tracking-[0.32em] text-muted">Choose Your Persona</div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((category, index) => {
              const isSelected = selectedCategoryId === category.id;
              return (
                <motion.button
                  key={category.id}
                  type="button"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + index * 0.05 }}
                  whileHover={{ y: -6, scale: 1.01 }}
                  whileTap={{ scale: 0.995 }}
                  onClick={() => onSelectCategory(category.id)}
                  className="text-left"
                >
                  <Card
                    className={cn(
                      "h-full border-white/8 bg-white/[0.04] p-6 transition-all duration-200",
                      isSelected && "border-player/35 bg-player/10 shadow-player"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <IconBadge
                        name={category.icon}
                        className={cn(
                          "h-14 w-14 rounded-3xl",
                          isSelected && "border-player/25 bg-player/10"
                        )}
                        iconClassName={isSelected ? "text-player" : ""}
                      />
                      <Badge className={isSelected ? "border-player/20 bg-player/10 text-player" : ""}>
                        {category.riskLevel}
                      </Badge>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">{category.name}</h3>
                      <p className="mt-3 text-sm leading-6 text-white/65">{category.description}</p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {category.tags.map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>

                    <div className="mt-8 flex items-center justify-between">
                      <span className="text-sm text-white/45">Select</span>
                      <span className={isSelected ? "text-player" : "text-white/45"}>
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Card>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-center">
            {canContinue && onContinue ? (
              <Button size="lg" variant="secondary" onClick={onContinue} className="min-w-[180px] text-base">
                Continue Save
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <div className="h-12" />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

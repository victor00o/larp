"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LandingPage } from "@/components/game/landing-page";
import { PersonaSelect } from "@/components/game/persona-select";
import { ProfileGeneration } from "@/components/game/profile-generation";
import { MainDashboard } from "@/components/game/main-dashboard";
import { RandomEventModal } from "@/components/game/random-event-modal";
import { MonthSummaryModal } from "@/components/game/month-summary-modal";
import { CrisisModal } from "@/components/game/crisis-modal";
import { FinalRecap } from "@/components/game/final-recap";
import { LoadingOverlay } from "@/components/game/loading-overlay";
import { ToastStack } from "@/components/game/toast-stack";
import { useGameState } from "@/hooks/use-game-state";
import { getPersonasForCategory, personaCategories } from "@/lib/personas";

export function GameClient() {
  const game = useGameState();

  const selectedCategoryId = game.state.selectedCategoryId;
  const selectedCategory = personaCategories.find((category) => category.id === selectedCategoryId) ?? null;
  const activeCategoryPersonas = selectedCategoryId ? getPersonasForCategory(selectedCategoryId) : [];
  const activeCrisis = game.state.monthSummary ? null : game.state.crisisQueue[0] ?? null;

  return (
    <>
      <AnimatePresence mode="wait">
        {game.state.screen === "landing" || game.state.screen === "category" ? (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LandingPage
              categories={personaCategories}
              selectedCategoryId={game.state.selectedCategoryId}
              onSelectCategory={game.chooseCategory}
              onContinue={game.continueSavedGame}
              canContinue={game.canContinue}
            />
          </motion.div>
        ) : null}

        {game.state.screen === "persona" ? (
          <motion.div key="persona" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <PersonaSelect
              category={selectedCategory}
              personas={activeCategoryPersonas}
              selectedPersonaId={game.state.selectedPersonaId}
              onSelect={game.choosePersona}
              onBack={game.backToStart}
            />
          </motion.div>
        ) : null}

        {game.state.screen === "profile" ? (
          <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
            <ProfileGeneration
              playerProfile={game.state.playerProfile}
              rivalProfile={game.state.rivalProfile}
              isLoading={game.isLoading}
              onAccept={game.acceptProfiles}
              onRegenerate={game.regenerateProfiles}
              onBack={game.backToPersona}
            />
          </motion.div>
        ) : null}

        {game.state.screen === "dashboard" ? (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MainDashboard
              month={game.state.month}
              playerProfile={game.state.playerProfile}
              rivalProfile={game.state.rivalProfile}
              playerStats={game.state.playerStats}
              rivalStats={game.state.rivalStats}
              playerBoard={game.state.playerBoard}
              selectedActionIds={game.state.selectedActionIds}
              generatedActions={game.state.generatedActions}
              monthlyHeadline={game.state.monthlyHeadline}
              monthlyNarrative={game.state.monthlyNarrative}
              history={game.state.history}
              maxActions={game.maxActions}
              onToggleAction={game.toggleAction}
              onSave={game.saveProgress}
              onRestart={game.restartGame}
              onRunMonth={game.runMonth}
            />
          </motion.div>
        ) : null}

        {game.state.screen === "recap" ? (
          <motion.div key="recap" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <FinalRecap
              recap={game.state.finalRecap}
              playerProfile={game.state.playerProfile}
              rivalProfile={game.state.rivalProfile}
              playerStats={game.state.playerStats}
              rivalStats={game.state.rivalStats}
              onRestart={game.restartGame}
              onCopy={game.copyRecapToClipboard}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <RandomEventModal
        event={game.state.activeEvent}
        open={Boolean(game.state.activeEvent)}
        onSelectResponse={game.chooseEventResponse}
      />
      <MonthSummaryModal
        entry={game.state.monthSummary}
        open={Boolean(game.state.monthSummary)}
        onContinue={game.continueAfterSummary}
      />
      <CrisisModal crisis={activeCrisis} open={Boolean(activeCrisis)} onClose={game.dismissCrisis} />
      <LoadingOverlay visible={game.isLoading && game.state.screen !== "profile"} message={game.loadingMessage} />
      <ToastStack toasts={game.toasts} onDismiss={game.removeToast} />
    </>
  );
}

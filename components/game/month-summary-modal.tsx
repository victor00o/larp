"use client";

import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { GameHistoryEntry } from "@/lib/types";
import { cn, formatCompactNumber, formatMoney } from "@/lib/utils";

interface MonthSummaryModalProps {
  entry: GameHistoryEntry | null;
  open: boolean;
  onContinue: () => void;
}

export function MonthSummaryModal({ entry, open, onContinue }: MonthSummaryModalProps) {
  return (
    <Dialog
      open={open && !!entry}
      title={entry ? `Month ${entry.month} Summary` : "Month Summary"}
      description={entry?.summary ?? "Your numbers moved. Your dignity may not have."}
      footer={<Button onClick={onContinue}>Continue to Next Month</Button>}
    >
      {entry ? (
        <div className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <StatCompare
              label="Followers"
              beforeValue={entry.beforeStats.followers}
              afterValue={entry.afterStats.followers}
              before={formatCompactNumber(entry.beforeStats.followers)}
              after={formatCompactNumber(entry.afterStats.followers)}
            />
            <StatCompare
              label="Money"
              beforeValue={entry.beforeStats.money}
              afterValue={entry.afterStats.money}
              before={formatMoney(entry.beforeStats.money)}
              after={formatMoney(entry.afterStats.money)}
            />
            <StatCompare
              label="Trust"
              beforeValue={entry.beforeStats.trust}
              afterValue={entry.afterStats.trust}
              before={`${entry.beforeStats.trust}`}
              after={`${entry.afterStats.trust}`}
            />
            <StatCompare
              label="Exposure Risk"
              beforeValue={entry.beforeStats.exposureRisk}
              afterValue={entry.afterStats.exposureRisk}
              before={`${entry.beforeStats.exposureRisk}`}
              after={`${entry.afterStats.exposureRisk}`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <StatCompare
              label="Burnout"
              beforeValue={entry.beforeStats.burnout}
              afterValue={entry.afterStats.burnout}
              before={`${entry.beforeStats.burnout}`}
              after={`${entry.afterStats.burnout}`}
            />
            <StatCompare
              label="Credibility"
              beforeValue={entry.beforeStats.credibility}
              afterValue={entry.afterStats.credibility}
              before={`${entry.beforeStats.credibility}`}
              after={`${entry.afterStats.credibility}`}
            />
            <StatCompare
              label="Rival Followers"
              beforeValue={entry.rivalBeforeStats.followers}
              afterValue={entry.rivalAfterStats.followers}
              before={formatCompactNumber(entry.rivalBeforeStats.followers)}
              after={formatCompactNumber(entry.rivalAfterStats.followers)}
            />
            <StatCompare
              label="Rival Money"
              beforeValue={entry.rivalBeforeStats.money}
              afterValue={entry.rivalAfterStats.money}
              before={formatMoney(entry.rivalBeforeStats.money)}
              after={formatMoney(entry.rivalAfterStats.money)}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
          <SummaryBlock title="Your Moves" lines={entry.selectedActions} />
          <SummaryBlock title="Rival Moves" lines={entry.rivalActions} />
          <SummaryBlock title="Event Result" lines={[entry.eventTitle, entry.eventResponse]} />
          <SummaryBlock title="Verdict" lines={[entry.verdict]} />
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}

function SummaryBlock({ title, lines }: { title: string; lines: string[] }) {
  return (
    <Card className="border-white/8 bg-white/[0.04] p-4">
      <div className="text-[11px] uppercase tracking-[0.22em] text-muted">{title}</div>
      <div className="mt-3 space-y-2 text-sm text-white/80">
        {lines.map((line) => (
          <div key={line} className="rounded-xl border border-white/6 bg-black/20 px-3 py-2">
            {line}
          </div>
        ))}
      </div>
    </Card>
  );
}

function StatCompare({
  label,
  beforeValue,
  afterValue,
  before,
  after,
}: {
  label: string;
  beforeValue: number;
  afterValue: number;
  before: string;
  after: string;
}) {
  const tone =
    afterValue > beforeValue ? "up" : afterValue < beforeValue ? "down" : "flat";

  return (
    <Card className="border-white/8 bg-white/[0.04] p-4">
      <div className="text-[11px] uppercase tracking-[0.22em] text-muted">{label}</div>
      <div className="mt-3 flex items-center justify-between gap-3 text-sm">
        <div className="rounded-xl border border-white/6 bg-black/20 px-3 py-2 text-white/70">{before}</div>
        <div className="text-muted">→</div>
        <div
          className={cn(
            "rounded-xl px-3 py-2 text-white",
            tone === "up" && "border border-player/20 bg-player/10",
            tone === "down" && "border border-rival/20 bg-rival/10",
            tone === "flat" && "border border-white/8 bg-white/[0.05]"
          )}
        >
          {after}
        </div>
      </div>
    </Card>
  );
}

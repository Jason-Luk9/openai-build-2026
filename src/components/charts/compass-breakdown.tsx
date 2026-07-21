import { Info } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { VisaCompassFacts } from '@/lib/schemas';
import { formatNumber } from '@/lib/format';

export function CompassBreakdown({ facts }: { facts: VisaCompassFacts }) {
  const gapCriterion = facts.criteria.find(
    (criterion) => criterion.score < criterion.maximumScore,
  );
  const isFail = facts.outcome === 'likely-fail';
  return (
    <div className="mt-5 border-t border-border pt-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="font-mono text-[12.5px] font-medium text-muted-foreground">
            COMPASS criteria
          </p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Each criterion is scored out of{' '}
            <span className="tabular-nums">20 pts</span>.
          </p>
        </div>
        <p className="font-mono text-[13px] font-semibold text-foreground tabular-nums">
          {formatNumber(facts.totalScore)} / 80 pts
        </p>
      </div>
      <TooltipProvider>
        <div className="space-y-3">
          {facts.criteria.map((criterion) => {
            const width = `${(criterion.score / criterion.maximumScore) * 100}%`;
            const gap = isFail && criterion.score < criterion.maximumScore;
            return (
              <div key={criterion.id}>
                <div className="mb-1 flex items-baseline justify-between gap-3 text-[12.5px]">
                  <span className="inline-flex items-center gap-1 font-medium text-muted-foreground">
                    {criterion.id} · {criterion.label}
                    <Tooltip>
                      <TooltipTrigger
                        aria-label={`How ${criterion.label} is calculated`}
                        className="inline-flex cursor-pointer text-muted-foreground/70 hover:text-primary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        <Info aria-hidden="true" className="size-3" />
                      </TooltipTrigger>
                      <TooltipContent>{criterion.assessment}</TooltipContent>
                    </Tooltip>
                  </span>
                  <span className="shrink-0 font-mono font-semibold text-foreground tabular-nums">
                    {formatNumber(criterion.score)} /{' '}
                    {formatNumber(criterion.maximumScore)} pts
                  </span>
                </div>
                <div
                  aria-label={`${criterion.label}: ${criterion.score} of ${criterion.maximumScore} points`}
                  className="h-2 overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className={
                      gap
                        ? 'h-full rounded-full bg-warning'
                        : 'h-full rounded-full bg-primary'
                    }
                    style={{ width }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </TooltipProvider>
      <div className="mt-5">
        <div className="relative h-7 border-t border-border">
          <span
            className="absolute top-0 h-4 border-l-2 border-primary"
            style={{ left: `${(facts.passThreshold / 80) * 100}%` }}
          />
          <span
            className="absolute top-3 -translate-x-1/2 whitespace-nowrap font-mono text-[11px] font-semibold text-primary tabular-nums"
            style={{ left: `${(facts.passThreshold / 80) * 100}%` }}
          >
            Pass threshold · {formatNumber(facts.passThreshold)} pts
          </span>
          <span
            className="absolute top-0 h-4 border-l-2 border-foreground"
            style={{ left: `${(facts.totalScore / 80) * 100}%` }}
          />
        </div>
      </div>
      {isFail && gapCriterion ? (
        <aside className="mt-5 rounded-lg border border-warning/30 bg-warning-tint p-3 text-[13px] leading-5 text-warning">
          <p className="font-semibold">What closes the gap</p>
          <p className="mt-1">{gapCriterion.assessment}</p>
        </aside>
      ) : null}
      {facts.isSmallFirm ? (
        <aside className="mt-4 rounded-lg border border-border bg-muted p-3 text-[13px] leading-5 text-foreground">
          C3 and C4 use neutral scoring while your firm remains below the
          small-firm PMET threshold.
        </aside>
      ) : null}
    </div>
  );
}

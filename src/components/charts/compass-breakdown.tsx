import type { VisaCompassFacts } from '@/lib/schemas';
import { formatNumber } from '@/lib/format';

export function CompassBreakdown({ facts }: { facts: VisaCompassFacts }) {
  const gapCriterion = facts.criteria.find(
    (criterion) => criterion.score < criterion.maximumScore,
  );
  const isFail = facts.outcome === 'likely-fail';
  return (
    <div className="mt-5 border-t border-zinc-100 pt-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[12.5px] font-medium text-zinc-500">
            COMPASS criteria
          </p>
          <p className="mt-1 text-[13px] text-zinc-600">
            Each criterion is scored out of{' '}
            <span className="tabular-nums">20 pts</span>.
          </p>
        </div>
        <p className="text-[13px] font-semibold text-zinc-950 tabular-nums">
          {formatNumber(facts.totalScore)} / 80 pts
        </p>
      </div>
      <div className="space-y-3">
        {facts.criteria.map((criterion) => {
          const width = `${(criterion.score / criterion.maximumScore) * 100}%`;
          const gap = isFail && criterion.score < criterion.maximumScore;
          return (
            <div key={criterion.id}>
              <div className="mb-1 flex items-baseline justify-between gap-3 text-[12.5px]">
                <span className="font-medium text-zinc-700">
                  {criterion.id} · {criterion.label}
                </span>
                <span className="shrink-0 font-semibold text-zinc-950 tabular-nums">
                  {formatNumber(criterion.score)} /{' '}
                  {formatNumber(criterion.maximumScore)} pts
                </span>
              </div>
              <div
                aria-label={`${criterion.label}: ${criterion.score} of ${criterion.maximumScore} points`}
                className="h-2 overflow-hidden rounded-full bg-zinc-100"
              >
                <div
                  className={
                    gap
                      ? 'h-full rounded-full bg-amber-500'
                      : 'h-full rounded-full bg-zinc-700'
                  }
                  style={{ width }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5">
        <div className="relative h-7 border-t border-zinc-300">
          <span
            className="absolute top-0 h-4 border-l-2 border-teal-700"
            style={{ left: `${(facts.passThreshold / 80) * 100}%` }}
          />
          <span
            className="absolute top-3 -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold text-teal-700 tabular-nums"
            style={{ left: `${(facts.passThreshold / 80) * 100}%` }}
          >
            Pass threshold · {formatNumber(facts.passThreshold)} pts
          </span>
          <span
            className="absolute top-0 h-4 border-l-2 border-zinc-950"
            style={{ left: `${(facts.totalScore / 80) * 100}%` }}
          />
        </div>
      </div>
      {isFail && gapCriterion ? (
        <aside className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[13px] leading-5 text-amber-950">
          <p className="font-semibold">What closes the gap</p>
          <p className="mt-1">{gapCriterion.assessment}</p>
        </aside>
      ) : null}
      {facts.isSmallFirm ? (
        <aside className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-[13px] leading-5 text-zinc-700">
          C3 and C4 use neutral scoring while your firm remains below the
          small-firm PMET threshold.
        </aside>
      ) : null}
    </div>
  );
}

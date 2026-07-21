import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { NarrativeSection } from '@/lib/schemas';

type SectionCardProps = {
  icon: LucideIcon;
  title: string;
  agencies?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function SectionCard({
  icon: Icon,
  title,
  agencies,
  action,
  children,
  footer,
  className,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon
              aria-hidden="true"
              className="size-[18px]"
              strokeWidth={1.8}
            />
          </div>
          <div className="min-w-0">
            <h2 className="font-serif text-[18px] font-semibold tracking-[-0.005em] text-foreground">
              {title}
            </h2>
            {agencies ? (
              <div className="mt-1.5 flex flex-wrap gap-1.5">{agencies}</div>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      <div className="px-5 py-5">{children}</div>
      {footer}
    </section>
  );
}

export function NarrativeBlock({
  narrative,
}: {
  narrative: NarrativeSection | undefined;
}) {
  if (!narrative) {
    return (
      <div
        aria-label="AI narrative is being generated"
        aria-live="polite"
        className="mt-5 border-t border-border pt-4"
        role="status"
      >
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="size-2 animate-pulse rounded-full bg-primary motion-reduce:animate-none"
          />
          <p className="text-[12.5px] font-semibold text-primary">
            Generating grounded guidance...
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-5 space-y-3 border-t border-border pt-4 text-[13px] leading-6 text-foreground">
      <p>{narrative.summary}</p>
      {narrative.callout ? (
        <p className="rounded-md border-l-2 border-primary bg-primary/10 px-3 py-2 text-primary">
          {narrative.callout}
        </p>
      ) : null}
      {narrative.nextSteps.length ? (
        <ul className="list-disc space-y-1 pl-5">
          {narrative.nextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      ) : null}
      {narrative.uncertaintyFlags.length ? (
        <p className="font-mono text-xs text-warning">
          Uncertainty: {narrative.uncertaintyFlags.join(' ')}
        </p>
      ) : null}
    </div>
  );
}

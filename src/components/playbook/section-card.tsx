import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

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
        'overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <Icon
              aria-hidden="true"
              className="size-[18px]"
              strokeWidth={1.8}
            />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-[-0.01em] text-zinc-950">
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

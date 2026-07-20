import { Check, CircleMinus, TriangleAlert, X } from 'lucide-react';

import { cn } from '@/lib/utils';

export type Status = 'eligible' | 'flag' | 'blocker' | 'not-applicable';

const statusConfig = {
  eligible: {
    icon: Check,
    label: 'Eligible',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  flag: {
    icon: TriangleAlert,
    label: 'Flag',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  blocker: {
    icon: X,
    label: 'Blocker',
    className: 'border-red-200 bg-red-50 text-red-700',
  },
  'not-applicable': {
    icon: CircleMinus,
    label: 'N/A',
    className: 'border-zinc-200 bg-zinc-50 text-zinc-500',
  },
} as const;

type StatusChipProps = {
  status: Status;
  className?: string;
};

export function StatusChip({ status, className }: StatusChipProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium',
        config.className,
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
      {config.label}
    </span>
  );
}

import { Check, CircleMinus, TriangleAlert, X } from 'lucide-react';

import { cn } from '@/lib/utils';

export type Status = 'eligible' | 'flag' | 'blocker' | 'not-applicable';

const statusConfig = {
  eligible: {
    icon: Check,
    label: 'Eligible',
    className: 'border-success/30 bg-success-tint text-success',
  },
  flag: {
    icon: TriangleAlert,
    label: 'To review',
    className: 'border-warning/30 bg-warning-tint text-warning',
  },
  blocker: {
    icon: X,
    label: 'Blocker',
    className: 'border-destructive/30 bg-destructive/10 text-destructive',
  },
  'not-applicable': {
    icon: CircleMinus,
    label: 'N/A',
    className: 'border-border bg-muted text-muted-foreground',
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
        'inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-xs font-medium',
        config.className,
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
      {config.label}
    </span>
  );
}

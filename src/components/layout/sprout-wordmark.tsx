import Link from 'next/link';

import { cn } from '@/lib/utils';

export function SproutWordmark({ className }: { className?: string }) {
  return (
    <Link
      className={cn(
        'rounded-sm font-serif text-[19px] font-semibold tracking-[-0.02em] text-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary',
        className,
      )}
      href="/"
    >
      Sprout
    </Link>
  );
}

'use client';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const agencyNames = {
  MOM: 'Ministry of Manpower',
  ACRA: 'Accounting and Corporate Regulatory Authority',
  IRAS: 'Inland Revenue Authority of Singapore',
  MAS: 'Monetary Authority of Singapore',
} as const;

export type Agency = keyof typeof agencyNames;

type AgencyBadgeProps = {
  agency: Agency;
};

export function AgencyBadge({ agency }: AgencyBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge
            variant="outline"
            className="border-zinc-200 bg-white font-semibold tracking-[0.04em] text-zinc-600"
          >
            {agency}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{agencyNames[agency]}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

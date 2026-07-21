import { BadgeCheck } from 'lucide-react';

import { CompassBreakdown } from '@/components/charts/compass-breakdown';
import { AgencyBadge } from '@/components/playbook/agency-badge';
import { NarrativeBlock, SectionCard } from '@/components/playbook/section-card';
import { sourcesFromFacts } from '@/components/playbook/source-utils';
import { SourcesFooter } from '@/components/playbook/sources-footer';
import { StatusChip } from '@/components/playbook/status-chip';
import { formatNumber } from '@/lib/format';
import type { NarrativeSection, VisaCompassFacts } from '@/lib/schemas';

const statusMap = {
  pass: 'eligible',
  'likely-fail': 'blocker',
  'not-applicable': 'not-applicable',
} as const;
export function VisaPlanner({
  facts,
  narrative,
}: {
  facts: VisaCompassFacts;
  narrative?: NarrativeSection;
}) {
  const sourceFacts = [
    ...facts.regulatoryFacts,
    ...facts.criteria.flatMap((criterion) => criterion.regulatoryFacts),
  ];
  return (
    <SectionCard
      action={<StatusChip status={statusMap[facts.outcome]} />}
      agencies={<AgencyBadge agency="MOM" />}
      footer={<SourcesFooter sources={sourcesFromFacts(sourceFacts)} />}
      icon={BadgeCheck}
      title="Visa / COMPASS"
    >
      <p className="text-[14.5px] leading-6 text-foreground">
        Your Employment Pass COMPASS score is{' '}
        <span className="font-mono font-semibold text-foreground tabular-nums">
          {formatNumber(facts.totalScore)} / 80 pts
        </span>{' '}
        against the{' '}
        <span className="font-mono font-semibold text-foreground tabular-nums">
          {formatNumber(facts.passThreshold)}-pt
        </span>{' '}
        threshold.
      </p>
      <CompassBreakdown facts={facts} />
      <NarrativeBlock narrative={narrative} />
    </SectionCard>
  );
}

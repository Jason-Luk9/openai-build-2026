import { ClipboardCheck } from 'lucide-react';

import { AgencyBadge } from '@/components/playbook/agency-badge';
import { NarrativeBlock, SectionCard } from '@/components/playbook/section-card';
import { sourcesFromFacts } from '@/components/playbook/source-utils';
import { SourceMark, SourcesFooter } from '@/components/playbook/sources-footer';
import { StatusChip } from '@/components/playbook/status-chip';
import type { LicensesFacts, NarrativeSection } from '@/lib/schemas';

const statusMap = {
  required: 'flag',
  'review-needed': 'flag',
  'not-identified': 'not-applicable',
} as const;

export function LicenseTable({
  facts,
  narrative,
}: {
  facts: LicensesFacts;
  narrative?: NarrativeSection;
}) {
  const sourceFacts = facts.items.flatMap((item) => item.regulatoryFacts);
  const sources = sourcesFromFacts(sourceFacts);
  return (
    <SectionCard
      agencies={
        <>
          <AgencyBadge agency="MAS" />
          <AgencyBadge agency="SFA" />
        </>
      }
      footer={<SourcesFooter sources={sources} />}
      icon={ClipboardCheck}
      title="Licences"
    >
      <div className="divide-y divide-border">
        {facts.items.map((item) => (
          <div
            className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
            key={item.name}
          >
            <div>
              <h3 className="text-[14.5px] font-semibold text-foreground">
                {item.name}
              </h3>
              <ul className="mt-1 space-y-1 text-[13px] leading-5 text-muted-foreground">
                {item.regulatoryFacts.map((fact) => (
                  <li key={fact.id}>
                    {fact.label}
                    <SourceMark fact={fact} sources={sources} />: {String(fact.value)}
                  </li>
                ))}
              </ul>
            </div>
            <StatusChip
              className="self-start"
              status={statusMap[item.status]}
            />
          </div>
        ))}
      </div>
      <NarrativeBlock narrative={narrative} />
    </SectionCard>
  );
}

import { formatVerifiedDate } from '@/lib/format';
import type { RegulatoryFact, SourceReference } from '@/lib/schemas';

export type FooterSource = {
  label: string;
  url: string;
  lastVerified: string;
};

function uniqueSources(sources: FooterSource[]) {
  return sources.filter(
    (source, index) =>
      sources.findIndex((candidate) => candidate.url === source.url) === index,
  );
}

export function sourcesFromFacts(facts: RegulatoryFact[]): FooterSource[] {
  return uniqueSources(
    facts.map((fact) => ({
      label: fact.label,
      url: fact.source.url,
      lastVerified: formatVerifiedDate(fact.source.lastVerified),
    })),
  );
}

export function sourcesFromReferences(
  references: SourceReference[],
  factCatalog: RegulatoryFact[],
): FooterSource[] {
  return uniqueSources(
    references.map((reference) => {
      const fact = factCatalog.find(
        (candidate) => candidate.id === reference.factId,
      );
      return {
        label: fact?.label ?? reference.factId,
        url: reference.source.url,
        lastVerified: formatVerifiedDate(reference.source.lastVerified),
      };
    }),
  );
}

/**
 * 1-based position of a fact's source in a deduped `FooterSource[]` list, for
 * matching an inline citation mark to its numbered entry in `SourcesFooter`.
 */
export function sourceNumberFor(
  fact: Pick<RegulatoryFact, 'source'>,
  sources: FooterSource[],
): number {
  return sources.findIndex((source) => source.url === fact.source.url) + 1;
}

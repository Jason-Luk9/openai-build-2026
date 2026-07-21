import { ExternalLink } from 'lucide-react';

import type { FooterSource } from '@/components/playbook/source-utils';
import type { RegulatoryFact } from '@/lib/schemas';

type SourcesFooterProps = {
  sources: FooterSource[];
};

export function SourcesFooter({ sources }: SourcesFooterProps) {
  return (
    <footer className="border-t border-border px-5 py-4 font-mono text-[12.5px] leading-5 text-muted-foreground">
      <p className="mb-2.5 text-[11px] tracking-[0.08em] text-muted-foreground uppercase">
        Sources
      </p>
      <ol className="space-y-2.5">
        {sources.map((source, index) => (
          <li className="flex gap-2.5" key={source.url}>
            <span className="shrink-0 tabular-nums text-muted-foreground/70">
              {index + 1}.
            </span>
            <span>
              <a
                className="inline-flex items-center gap-0.5 underline decoration-border underline-offset-2 transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                href={source.url}
                rel="noreferrer"
                target="_blank"
              >
                {source.label}
                <ExternalLink aria-hidden="true" className="size-3" />
              </a>
              {' — '}
              <span className="font-semibold text-foreground">
                Last verified {source.lastVerified}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </footer>
  );
}

export function SourceMark({
  fact,
  sources,
}: {
  fact: Pick<RegulatoryFact, 'source'>;
  sources: FooterSource[];
}) {
  const index = sources.findIndex(
    (candidate) => candidate.url === fact.source.url,
  );
  const source = sources[index];
  if (!source) return null;
  return (
    <sup>
      <a
        aria-label={`Source ${index + 1}: ${source.label}`}
        className="ml-0.5 font-mono text-[10px] font-semibold text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        href={source.url}
        rel="noreferrer"
        target="_blank"
      >
        {index + 1}
      </a>
    </sup>
  );
}

import { ExternalLink } from 'lucide-react';

type Source = {
  label: string;
  url: string;
  lastVerified: string;
};

type SourcesFooterProps = {
  sources: Source[];
};

export function SourcesFooter({ sources }: SourcesFooterProps) {
  return (
    <footer className="border-t border-border px-5 py-3 font-mono text-[12.5px] leading-5 text-muted-foreground">
      <span>Sources: </span>
      {sources.map((source, index) => (
        <span key={source.url}>
          {index > 0 ? ' · ' : null}
          <a
            className="inline-flex items-center gap-0.5 underline decoration-border underline-offset-2 transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            href={source.url}
            rel="noreferrer"
            target="_blank"
          >
            {source.label}
            <ExternalLink aria-hidden="true" className="size-3" />
          </a>{' '}
          <span>· Last verified {source.lastVerified}</span>
        </span>
      ))}
    </footer>
  );
}

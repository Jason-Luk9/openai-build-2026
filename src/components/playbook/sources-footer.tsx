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
    <footer className="border-t border-zinc-100 px-5 py-3 text-[12.5px] leading-5 text-zinc-500">
      <span>Sources: </span>
      {sources.map((source, index) => (
        <span key={source.url}>
          {index > 0 ? ' · ' : null}
          <a
            className="inline-flex items-center gap-0.5 underline decoration-zinc-300 underline-offset-2 transition-colors hover:text-teal-700 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
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

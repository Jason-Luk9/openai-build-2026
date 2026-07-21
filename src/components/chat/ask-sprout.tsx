'use client';

import { DefaultChatTransport, type UIMessage } from 'ai';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Streamdown } from 'streamdown';

import { Button } from '@/components/ui/button';
import { buildSuggestedQuestions } from '@/lib/rules';
import type { Profile } from '@/lib/schemas';

type ToolResult = {
  kind?: string;
  status?: string;
  title?: string;
  summary?: string;
  details?: string[];
  sources?: Array<{ label: string; url: string; lastVerified: string }>;
};

function asToolResult(part: unknown): ToolResult | null {
  if (!part || typeof part !== 'object' || !('output' in part)) return null;
  const output = part.output;
  if (!output || typeof output !== 'object' || !('summary' in output))
    return null;
  return output as ToolResult;
}

function MessageParts({ message }: { message: UIMessage }) {
  return (
    <div className="space-y-3">
      {message.parts.map((part, index) => {
        const typedPart = part as { type?: string; text?: string };
        if (typedPart.type === 'text' && typedPart.text) {
          return (
            <Streamdown key={`${message.id}-${index}`}>
              {typedPart.text}
            </Streamdown>
          );
        }

        const result = asToolResult(part);
        if (!result) return null;
        return (
          <div
            className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-foreground"
            key={`${message.id}-${index}`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-xs font-semibold tracking-[0.08em] text-primary uppercase">
                Scenario result
              </p>
              {result.status ? (
                <span className="text-xs font-semibold text-primary">
                  {result.status}
                </span>
              ) : null}
            </div>
            {result.title ? (
              <p className="mt-1 font-semibold">{result.title}</p>
            ) : null}
            <p className="mt-1 text-sm leading-5">{result.summary}</p>
            {result.details?.length ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-foreground">
                {result.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            ) : null}
            {result.sources?.length ? (
              <div className="mt-3 border-t border-primary/30 pt-2 text-xs text-primary">
                Sources:{' '}
                {result.sources.map((source, sourceIndex) => (
                  <span key={source.url}>
                    {sourceIndex > 0 ? ' · ' : null}
                    <a
                      className="underline underline-offset-2"
                      href={source.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {source.label}
                    </a>{' '}
                    (verified {source.lastVerified})
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function AskSprout({ profile }: { profile: Profile }) {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: '/api/chat', body: { profile } }),
    [profile],
  );
  const suggestedQuestions = useMemo(
    () => buildSuggestedQuestions(profile),
    [profile],
  );
  const {
    messages,
    sendMessage,
    setMessages,
    status,
    error,
    clearError,
    stop,
  } = useChat({ transport });
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const busy = status === 'submitted' || status === 'streaming';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    await sendMessage({ text });
  }

  if (!open) {
    return (
      <div className="fixed right-5 bottom-5 z-50">
        <Button
          aria-controls="ask-sprout-dialog"
          aria-expanded={false}
          aria-label="Open Ask Sprout chat"
          className="size-14 rounded-full bg-foreground text-background shadow-lg shadow-foreground/20 hover:bg-foreground/90"
          onClick={() => setOpen(true)}
          size="icon-lg"
        >
          <MessageCircle aria-hidden="true" className="size-6" />
        </Button>
        {messages.length ? (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-background bg-warning text-[10px] font-bold text-warning-tint"
          >
            !
          </span>
        ) : null}
      </div>
    );
  }
  return (
    <section
      aria-labelledby="ask-sprout-title"
      className="fixed right-4 bottom-4 z-50 flex max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-foreground/10"
      id="ask-sprout-dialog"
      role="dialog"
    >
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border bg-primary/10 p-4">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <Sparkles aria-hidden="true" className="size-4" />
            <p className="font-mono text-xs font-semibold tracking-[0.08em] uppercase">
              Ask Sprout
            </p>
          </div>
          <h2
            className="mt-2 font-serif text-lg font-semibold text-foreground"
            id="ask-sprout-title"
          >
            Explore a grounded what-if
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-muted-foreground">
            Ask about salary, headcount, revenue, or your current industry
            licence flags. Answers use deterministic tools and cite their
            sources.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {messages.length ? (
            <Button
              aria-label="Clear chat"
              onClick={() => {
                clearError();
                setMessages([]);
              }}
            >
              Clear
            </Button>
          ) : null}
          <Button
            aria-label="Close Ask Sprout chat"
            aria-controls="ask-sprout-dialog"
            onClick={() => setOpen(false)}
            size="icon"
          >
            <X aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {!messages.length ? (
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question) => (
              <button
                className="cursor-pointer rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-left text-xs font-medium text-primary transition-colors hover:border-primary/50 hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                key={question}
                onClick={() => setInput(question)}
                type="button"
              >
                {question}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4 rounded-lg border border-border bg-muted p-3">
            {messages.map((message) => (
              <div
                className={
                  message.role === 'user'
                    ? 'ml-8 rounded-lg bg-foreground px-3 py-2 text-sm leading-5 text-background'
                    : 'mr-8 rounded-lg bg-card px-3 py-2 text-sm leading-5 text-foreground'
                }
                key={message.id}
              >
                <MessageParts message={message} />
              </div>
            ))}
            {busy ? (
              <p className="font-mono text-xs font-semibold text-primary" role="status">
                Checking sourced rules...
              </p>
            ) : null}
          </div>
        )}

        {error ? (
          <div
            className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-warning/30 bg-warning-tint px-3 py-2 text-xs text-warning"
            role="alert"
          >
            <span>
              Chat is unavailable right now. Your facts and PDF remain
              available.
            </span>
            <button
              className="cursor-pointer font-semibold underline"
              onClick={clearError}
              type="button"
            >
              Dismiss
            </button>
          </div>
        ) : null}
      </div>

      <form
        className="flex shrink-0 gap-2 border-t border-border bg-card p-4"
        onSubmit={submit}
      >
        <input
          aria-label="Ask a what-if question"
          className="min-w-0 flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-3 focus:ring-primary/15"
          disabled={busy}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask a what-if question..."
          value={input}
        />
        {busy ? (
          <Button onClick={() => void stop()} type="button" variant="outline">
            Stop
          </Button>
        ) : (
          <Button
            aria-label="Send question"
            disabled={!input.trim()}
            type="submit"
          >
            <Send aria-hidden="true" />
            Ask
          </Button>
        )}
      </form>
      <div className="flex px-4 py-2">
        <p className="text-xs text-muted-foreground">
          General information, not legal advice.
        </p>
      </div>
    </section>
  );
}

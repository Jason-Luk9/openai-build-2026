'use client';

import { DefaultChatTransport, type UIMessage } from 'ai';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { useChat } from '@ai-sdk/react';

import { Button } from '@/components/ui/button';
import type { Profile } from '@/lib/schemas';

const suggestedQuestions = [
  'What if we pay the applicant S$7,000 per month?',
  'What changes if we grow to 25 PMETs with 10 local PMETs?',
  'What if projected Singapore revenue reaches S$1.2 million?',
  'Which licences are flagged for this industry?',
];

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
          return <p key={`${message.id}-${index}`}>{typedPart.text}</p>;
        }

        const result = asToolResult(part);
        if (!result) return null;
        return (
          <div
            className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-teal-950"
            key={`${message.id}-${index}`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold tracking-[0.08em] text-teal-800 uppercase">
                Scenario result
              </p>
              {result.status ? (
                <span className="text-xs font-semibold text-teal-800">
                  {result.status}
                </span>
              ) : null}
            </div>
            {result.title ? (
              <p className="mt-1 font-semibold">{result.title}</p>
            ) : null}
            <p className="mt-1 text-sm leading-5">{result.summary}</p>
            {result.details?.length ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 text-teal-900">
                {result.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            ) : null}
            {result.sources?.length ? (
              <div className="mt-3 border-t border-teal-200 pt-2 text-xs text-teal-800">
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

export function AskSingapath({ profile }: { profile: Profile }) {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: '/api/chat', body: { profile } }),
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
          aria-controls="ask-singapath-dialog"
          aria-expanded={false}
          aria-label="Open Ask SingaPath chat"
          className="size-14 rounded-full bg-teal-700 text-white shadow-lg shadow-teal-950/20 hover:bg-teal-800 focus-visible:ring-teal-700/40"
          onClick={() => setOpen(true)}
          size="icon-lg"
        >
          <MessageCircle aria-hidden="true" className="size-6" />
        </Button>
        {messages.length ? (
          <span
            aria-hidden="true"
            className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-zinc-50 bg-amber-500 text-[10px] font-bold text-white"
          >
            !
          </span>
        ) : null}
      </div>
    );
  }
  return (
    <section
      aria-labelledby="ask-singapath-title"
      className="fixed right-4 bottom-4 z-50 flex max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-xl border border-teal-200 bg-white shadow-2xl shadow-zinc-950/20"
      id="ask-singapath-dialog"
      role="dialog"
    >
      <div className="flex shrink-0 items-start justify-between gap-4 border-b border-teal-100 bg-teal-50 p-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700">
            <Sparkles aria-hidden="true" className="size-4" />
            <p className="text-xs font-semibold tracking-[0.08em] uppercase">
              Ask SingaPath
            </p>
          </div>
          <h2
            className="mt-2 text-lg font-semibold text-zinc-950"
            id="ask-singapath-title"
          >
            Explore a grounded what-if
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-5 text-zinc-600">
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
              size="icon"
              variant="ghost"
            >
              <span className="text-xs font-semibold">Clear</span>
            </Button>
          ) : null}
          <Button
            aria-label="Close Ask SingaPath chat"
            aria-controls="ask-singapath-dialog"
            aria-expanded={true}
            onClick={() => setOpen(false)}
            size="icon"
            variant="ghost"
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
                className="rounded-full border border-teal-200 bg-teal-50 px-3 py-2 text-left text-xs font-medium text-teal-900 transition-colors hover:border-teal-400 hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                key={question}
                onClick={() => setInput(question)}
                type="button"
              >
                {question}
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            {messages.map((message) => (
              <div
                className={
                  message.role === 'user'
                    ? 'ml-8 rounded-lg bg-teal-700 px-3 py-2 text-sm leading-5 text-white'
                    : 'mr-8 rounded-lg bg-white px-3 py-2 text-sm leading-5 text-zinc-700 shadow-sm'
                }
                key={message.id}
              >
                <MessageParts message={message} />
              </div>
            ))}
            {busy ? (
              <p className="text-xs font-semibold text-teal-700" role="status">
                Checking sourced rules...
              </p>
            ) : null}
          </div>
        )}

        {error ? (
          <div
            className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
            role="alert"
          >
            <span>
              Chat is unavailable right now. Your facts and PDF remain
              available.
            </span>
            <button
              className="font-semibold underline"
              onClick={clearError}
              type="button"
            >
              Dismiss
            </button>
          </div>
        ) : null}
      </div>

      <form
        className="flex shrink-0 gap-2 border-t border-zinc-200 bg-white p-4"
        onSubmit={submit}
      >
        <input
          aria-label="Ask a what-if question"
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-zinc-400 focus:border-teal-700 focus:ring-3 focus:ring-teal-700/15"
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
        <p className="text-xs text-zinc-500">
          General information, not legal advice.
        </p>
      </div>
    </section>
  );
}

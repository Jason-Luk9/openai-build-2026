import {
  convertToModelMessages,
  stepCountIs,
  streamText,
  type UIMessage,
} from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { buildChatSystemPrompt, getNarrativeModels } from '@/lib/ai';
import { buildChatTools } from '@/lib/chat-tools';
import { ProfileSchema } from '@/lib/schemas';
import { buildPlaybookFacts } from '@/lib/rules';

export const runtime = 'edge';

const ChatRequestSchema = z
  .object({
    // AI SDK transport metadata is sent alongside the application payload.
    id: z.string().optional(),
    trigger: z.string().optional(),
    profile: ProfileSchema,
    messages: z
      .array(
        z
          .object({
            role: z.enum(['user', 'assistant', 'system']),
            parts: z.array(z.unknown()).optional(),
            content: z.string().optional(),
          })
          .passthrough()
          .refine(
            (message) =>
              message.parts !== undefined || message.content !== undefined,
            'Each message must contain parts or content.',
          ),
      )
      .min(1)
      .max(20),
  })
  .strict();

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: 'Profile and messages failed validation.',
        issues: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  const models = getNarrativeModels();
  const model = models[0]?.model;
  if (!model) {
    return NextResponse.json(
      { error: 'No server-side AI provider is configured.' },
      { status: 503 },
    );
  }

  const profile = parsed.data.profile;
  const facts = buildPlaybookFacts(profile);
  let messages;
  try {
    messages = await convertToModelMessages(
      parsed.data.messages as unknown as UIMessage[],
    );
  } catch {
    return NextResponse.json(
      { error: 'Messages could not be converted for the chat model.' },
      { status: 400 },
    );
  }

  try {
    const result = streamText({
      model,
      messages,
      system: buildChatSystemPrompt(profile, facts),
      tools: buildChatTools(profile),
      stopWhen: stepCountIs(3),
      maxRetries: 0,
    });

    return result.toUIMessageStreamResponse({
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Chat generation failed.' },
      { status: 502 },
    );
  }
}

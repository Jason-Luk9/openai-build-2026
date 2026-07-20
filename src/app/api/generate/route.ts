import { streamObject } from 'ai';
import { NextResponse } from 'next/server';

import {
  buildGroundingPrompt,
  getNarrativeModels,
} from '@/lib/ai';
import {
  GenerateRequestSchema,
  NarrativeSectionSchema,
  NarrativesSchema,
} from '@/lib/schemas';

export const runtime = 'edge';

const sectionKeys = [
  'entity',
  'visaCompass',
  'licenses',
  'taxIncentives',
  'banking',
  'timeline',
  'riskMatrix',
] as const;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const parsed = GenerateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Profile and facts failed validation.', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const models = getNarrativeModels();
  if (models.length === 0) {
    return NextResponse.json(
      { error: 'No server-side AI provider is configured.' },
      { status: 503 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let emitted = false;
      for (const { model } of models) {
        try {
          const result = streamObject({
            model,
            schema: NarrativesSchema,
            schemaName: 'GroundedNarratives',
            schemaDescription:
              'Seven narratives grounded only in the supplied facts, each with explicit uncertainty flags.',
            prompt: buildGroundingPrompt(parsed.data.profile, parsed.data.facts),
          });

          const emittedSections = new Set<string>();
          for await (const partial of result.partialObjectStream) {
            for (const key of sectionKeys) {
              const candidate = partial[key];
              const section = NarrativeSectionSchema.safeParse(candidate);
              if (!section.success) continue;

              const serialized = JSON.stringify({
                type: 'narrative',
                section: key,
                narrative: section.data,
              });
              if (emittedSections.has(serialized)) continue;
              emittedSections.add(serialized);
              emitted = true;
              controller.enqueue(encoder.encode(`${serialized}\n`));
            }
          }

          const complete = NarrativesSchema.parse(await result.object);
          controller.enqueue(
            encoder.encode(`${JSON.stringify({ type: 'complete', narratives: complete })}\n`),
          );
          controller.close();
          return;
        } catch {
          if (emitted) break;
        }
      }

      controller.enqueue(
        encoder.encode(
          `${JSON.stringify({
            type: 'error',
            message: 'Narrative generation failed validation or the provider was unavailable.',
          })}\n`,
        ),
      );
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

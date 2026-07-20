import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/chat/route';
import { mockProfiles } from '@/lib/mock-profiles';

describe('POST /api/chat', () => {
  it('rejects malformed JSON', async () => {
    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        body: '{',
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(400);
  });

  it('rejects invalid profile or message payloads', async () => {
    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ profile: {}, messages: [] }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(400);
  });

  it('returns provider-unavailable without configured server credentials', async () => {
    const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const groqModel = process.env.GROQ_MODEL;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    delete process.env.GROQ_API_KEY;
    delete process.env.GROQ_MODEL;

    const response = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          id: 'chat-id',
          trigger: 'submit-message',
          profile: mockProfiles.vietstack,
          messages: [
            {
              id: 'user-1',
              role: 'user',
              parts: [{ type: 'text', text: 'What if revenue grows?' }],
            },
          ],
        }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(503);

    if (googleKey === undefined)
      delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    else process.env.GOOGLE_GENERATIVE_AI_API_KEY = googleKey;
    if (groqKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = groqKey;
    if (groqModel === undefined) delete process.env.GROQ_MODEL;
    else process.env.GROQ_MODEL = groqModel;
  });
});

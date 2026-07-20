import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/generate/route';

describe('POST /api/generate', () => {
  it('rejects malformed JSON', async () => {
    const response = await POST(
      new Request('http://localhost/api/generate', {
        method: 'POST',
        body: '{',
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(400);
  });

  it('rejects input that does not contain a valid ProfileSchema profile', async () => {
    const response = await POST(
      new Request('http://localhost/api/generate', {
        method: 'POST',
        body: JSON.stringify({ profile: {}, facts: {} }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    expect(response.status).toBe(400);
  });
});


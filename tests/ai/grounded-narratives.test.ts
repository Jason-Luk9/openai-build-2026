import { describe, expect, it } from 'vitest';

import { buildGroundingPrompt, getNarrativeModels } from '@/lib/ai';
import { findNarrativeFixture } from '@/lib/fixtures';
import vietstack from '@/lib/mock-profiles/vietstack.json';
import { ProfileSchema, NarrativesSchema } from '@/lib/schemas';
import { buildPlaybookFacts } from '@/lib/rules';

describe('grounded narrative contracts', () => {
  it('uses the matching fixture for a bundled profile', () => {
    const profile = ProfileSchema.parse(vietstack);
    const fixture = findNarrativeFixture(profile);

    expect(NarrativesSchema.safeParse(fixture).success).toBe(true);
    expect(fixture.entity.summary).toContain('VC-backing');
  });

  it('uses an industry fixture for a non-demo profile', () => {
    const profile = ProfileSchema.parse({
      ...vietstack,
      projectedSingaporeRevenue: 0,
    });

    expect(findNarrativeFixture(profile).licenses.summary).toContain('SaaS');
  });

  it('builds a prompt with grounding and uncertainty constraints', () => {
    const profile = ProfileSchema.parse(vietstack);
    const prompt = buildGroundingPrompt(profile, buildPlaybookFacts(profile));

    expect(prompt).toContain('Do not introduce any number, fee, percentage');
    expect(prompt).toContain('legal, tax, immigration, licensing, banking');
    expect(prompt).toContain('uncertaintyFlags');
  });

  it('does not create a provider when no server key is configured', () => {
    const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const groqModel = process.env.GROQ_MODEL;
    delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    delete process.env.GROQ_API_KEY;
    delete process.env.GROQ_MODEL;

    expect(getNarrativeModels()).toHaveLength(0);

    if (googleKey === undefined) delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    else process.env.GOOGLE_GENERATIVE_AI_API_KEY = googleKey;
    if (groqKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = groqKey;
    if (groqModel === undefined) delete process.env.GROQ_MODEL;
    else process.env.GROQ_MODEL = groqModel;
  });
});

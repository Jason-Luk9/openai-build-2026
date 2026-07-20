import { createGoogle } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import type { LanguageModel } from 'ai';

import type { PlaybookFacts, Profile } from '@/lib/schemas';

const GEMINI_MODEL = 'gemini-2.5-flash';

export type NarrativeModel = {
  provider: 'google' | 'groq';
  model: LanguageModel;
};

export function getNarrativeModels(): NarrativeModel[] {
  const models: NarrativeModel[] = [];
  const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const groqModel = process.env.GROQ_MODEL;

  if (googleKey) {
    models.push({
      provider: 'google',
      model: createGoogle({ apiKey: googleKey })(GEMINI_MODEL),
    });
  }

  if (groqKey && groqModel) {
    models.push({
      provider: 'groq',
      model: createGroq({ apiKey: groqKey })(groqModel),
    });
  }

  return models;
}

export function buildGroundingPrompt(profile: Profile, facts: PlaybookFacts) {
  return `You write concise, founder-facing explanations for a Singapore market-entry playbook.

The supplied profile and computed facts are authoritative. Generate only the seven narrative sections requested by the output schema. Never invent, change, or imply a regulatory fact.

Grounding rules:
- Do not introduce any number, fee, percentage, date, duration, timeline, threshold, salary, cost, or quantity unless that exact value is contained in the supplied facts.
- Do not introduce a legal, tax, immigration, licensing, banking, or operational requirement that is not contained in the supplied facts.
- Do not turn an example, assumption, recommendation, or qualitative risk into a confirmed fact.
- Add an explicit uncertaintyFlags entry whenever information is missing, conditional, illustrative, ambiguous, or requires agency/provider confirmation. Use an empty array only when the supplied facts are definitive.
- Keep facts and narratives separate: the output must contain prose only and must not replace any fact-card value.

Profile:
${JSON.stringify(profile)}

Computed facts:
${JSON.stringify(facts)}
`;
}


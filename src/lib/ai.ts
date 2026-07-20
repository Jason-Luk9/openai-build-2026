import { createGoogle } from '@ai-sdk/google';
import { createGroq } from '@ai-sdk/groq';
import type { LanguageModel } from 'ai';

import type { PlaybookFacts, Profile } from '@/lib/schemas';

const GEMINI_MODEL = 'gemini-3-flash-preview';

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
- Keep each section concise: return no more than five nextSteps and five uncertaintyFlags.
- Keep facts and narratives separate: the output must contain prose only and must not replace any fact-card value.

Profile:
${JSON.stringify(profile)}

Computed facts:
${JSON.stringify(facts)}
`;
}

export function buildChatSystemPrompt(profile: Profile, facts: PlaybookFacts) {
  return `You are Ask SingaPath, a grounded assistant for a Singapore market-entry playbook.

The supplied profile and computed facts are authoritative. Use one of the supplied rules-engine tools for every supported what-if. Never invent or estimate a regulatory number, fee, threshold, deadline, licence, tax rule, immigration requirement, or eligibility result.

Supported questions:
- salary: use checkSalaryCompass; describe its result as a lower-bound check when the facts do not support an exact applicant-specific decision;
- headcount/local hiring: use checkHeadcountCompass; do not infer diversity or COMPASS points above the small-firm threshold without sourced workforce data;
- revenue/tax: use checkTaxRevenue; do not estimate tax payable without profit and chargeable-income inputs;
- current profile-industry licences: use lookupProfileLicences; refuse exact free-form activity classification.

For unsupported questions, refuse briefly, explain the limitation, and redirect to the relevant source or a supported scenario. Distinguish baseline facts from hypothetical inputs. Cite the source labels and verification dates returned by tools. End with the general-information, not-legal-advice reminder when discussing regulatory action.

Profile:
${JSON.stringify(profile)}

Baseline facts:
${JSON.stringify(facts)}
`;
}

import payflip from './payflip.json';
import vietstack from './vietstack.json';
import warungDigital from './warung-digital.json';
import { NarrativesSchema, type Narratives, type Profile } from '@/lib/schemas';
import { mockProfiles, type MockProfileId } from '@/lib/mock-profiles';

const fixtures = {
  'warung-digital': NarrativesSchema.parse(warungDigital),
  vietstack: NarrativesSchema.parse(vietstack),
  payflip: NarrativesSchema.parse(payflip),
} satisfies Record<MockProfileId, Narratives>;

export function getNarrativeFixture(id: MockProfileId): Narratives {
  return fixtures[id];
}

export function findNarrativeFixture(profile: Profile): Narratives {
  const match = (Object.keys(mockProfiles) as MockProfileId[]).find((id) =>
    deepEqual(mockProfiles[id], profile),
  );
  if (match) return getNarrativeFixture(match);

  const industryFallback: Partial<Record<Profile['industry'], MockProfileId>> = {
    fnb: 'warung-digital',
    saas: 'vietstack',
    fintech: 'payflip',
  };
  return getNarrativeFixture(industryFallback[profile.industry] ?? 'warung-digital');
}

function deepEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

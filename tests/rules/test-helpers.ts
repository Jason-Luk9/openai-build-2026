import type { Profile } from "@/lib/schemas";

export function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    homeCountry: "vietnam",
    industry: "saas",
    entityPurpose: "local-operations",
    foundersRelocating: 1,
    staffRelocating: 1,
    projectedSingaporeRevenue: 200000,
    entrePassEvidence: {
      hasVcBacking: false,
      hasIp: false,
      hasTrackRecord: false,
    },
    ...overrides,
  };
}

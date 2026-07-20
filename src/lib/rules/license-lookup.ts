import type { BundledKnowledge, LicensesFacts, Profile } from "@/lib/schemas";

export function lookupLicenses(
  profile: Profile,
  knowledge: BundledKnowledge,
): LicensesFacts {
  const items = knowledge.licenses.industries[profile.industry];

  return {
    items: items.map((item) => ({
      name: item.name,
      status: item.status,
      regulatoryFacts: item.facts,
    })),
  };
}

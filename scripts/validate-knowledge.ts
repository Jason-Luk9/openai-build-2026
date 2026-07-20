/**
 * Validates the bundled knowledge JSON against the Zod schemas in
 * `src/lib/schemas.ts` and logs every regulatory fact's provenance
 * (id, source URL, last-verified date).
 *
 * `bundledKnowledge` already `.parse()`s all six knowledge JSON files at
 * import time, so importing it is itself the validity check: it throws if
 * any file is malformed against its schema, or if any fact is missing a
 * source URL or last-verified date (both are required by `SourceSchema`).
 *
 * Phase 1 logs every bundled fact (a superset covering the full knowledge
 * corpus, useful independent of any specific profile). Phase 2 scopes down:
 * it computes `buildPlaybookFacts` for each of the 3 demo mock profiles
 * (Warung Digital, VietStack, PayFlip) and logs exactly which facts each
 * one actually cites, grouped by dashboard section — this is the
 * verification log the demo profiles ticket requires.
 */
import { buildPlaybookFacts } from '../src/lib/rules';
import { mockProfiles } from '../src/lib/mock-profiles';
import type { PlaybookFacts, RegulatoryFact } from '../src/lib/schemas';

type FactLogEntry = {
  domain: string;
  id: string;
  label: string;
  url: string;
  lastVerified: string;
};

function isRegulatoryFact(value: unknown): value is RegulatoryFact {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== 'string' || typeof record.label !== 'string') {
    return false;
  }
  if (typeof record.source !== 'object' || record.source === null) {
    return false;
  }
  const source = record.source as Record<string, unknown>;
  return (
    typeof source.url === 'string' && typeof source.lastVerified === 'string'
  );
}

function isSourceReference(
  value: unknown,
): value is { factId: string; source: { url: string; lastVerified: string } } {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  if (typeof record.factId !== 'string') return false;
  if (typeof record.source !== 'object' || record.source === null) return false;
  const source = record.source as Record<string, unknown>;
  return typeof source.url === 'string' && typeof source.lastVerified === 'string';
}

function collectFacts(
  node: unknown,
  domain: string,
  out: FactLogEntry[],
): void {
  if (Array.isArray(node)) {
    for (const item of node) collectFacts(item, domain, out);
    return;
  }
  if (typeof node !== 'object' || node === null) return;

  if (isRegulatoryFact(node)) {
    out.push({
      domain,
      id: node.id,
      label: node.label,
      url: node.source.url,
      lastVerified: node.source.lastVerified,
    });
    return;
  }

  for (const value of Object.values(node)) {
    collectFacts(value, domain, out);
  }
}

/**
 * Walks a computed PlaybookFacts section collecting every fact id it
 * cites — whether embedded as a full RegulatoryFact or referenced via a
 * `{ factId, source }` SourceReference — detected structurally against the
 * real schemas rather than by hand-picked field names, so this keeps
 * matching if either schema's shape changes.
 */
function isSourceReference(
  value: unknown,
): value is { factId: string; source: unknown } {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  return typeof record.factId === 'string' && 'source' in record;
}

function collectCitedFactIds(node: unknown, out: Set<string>): void {
  if (Array.isArray(node)) {
    for (const item of node) collectCitedFactIds(item, out);
    return;
  }
  if (typeof node !== 'object' || node === null) return;

  if (isRegulatoryFact(node)) {
    out.add(node.id);
    return;
  }
  if (isSourceReference(node)) {
    out.add(node.factId);
    return;
  }

  for (const value of Object.values(node)) {
    collectCitedFactIds(value, out);
  }
}

function logProfileFacts(
  profileId: string,
  facts: PlaybookFacts,
  factsById: Map<string, FactLogEntry>,
): string[] {
  const problems: string[] = [];

  console.log(`\n=== ${profileId} ===`);
  for (const [section, sectionFacts] of Object.entries(facts) as Array<
    [keyof PlaybookFacts, unknown]
  >) {
    const citedIds = new Set<string>();
    collectCitedFactIds(sectionFacts, citedIds);

    if (citedIds.size === 0) {
      problems.push(`${profileId}.${section} cites zero regulatory facts`);
      continue;
    }

    console.log(`  [${section}] ${citedIds.size} fact(s) cited`);
    for (const id of [...citedIds].sort()) {
      const entry = factsById.get(id);
      if (!entry) {
        problems.push(
          `${profileId}.${section} cites unknown fact id "${id}" (not present in bundledKnowledge)`,
        );
        continue;
      }
      console.log(`    - ${entry.id} — ${entry.label}`);
      console.log(
        `      source: ${entry.url} (verified ${entry.lastVerified})`,
      );
    }
  }

  return problems;
}

async function main(): Promise<void> {
  const { bundledKnowledge } = await import('../src/lib/schemas');

  const facts: FactLogEntry[] = [];
  for (const [domain, knowledge] of Object.entries(bundledKnowledge)) {
    collectFacts(knowledge, domain, facts);
  }
  facts.sort(
    (a, b) => a.domain.localeCompare(b.domain) || a.id.localeCompare(b.id),
  );

  const seenIds = new Map<string, string>();
  const duplicateIds: string[] = [];
  for (const fact of facts) {
    const previousDomain = seenIds.get(fact.id);
    if (previousDomain) {
      duplicateIds.push(`${fact.id} (${previousDomain} and ${fact.domain})`);
    } else {
      seenIds.set(fact.id, fact.domain);
    }
  }

  console.log(
    `Verification log — ${facts.length} regulatory facts across ${
      Object.keys(bundledKnowledge).length
    } knowledge domains\n`,
  );
  for (const fact of facts) {
    console.log(`[${fact.domain}] ${fact.id}`);
    console.log(`  label:        ${fact.label}`);
    console.log(`  source:       ${fact.url}`);
    console.log(`  lastVerified: ${fact.lastVerified}\n`);
  }

  if (duplicateIds.length > 0) {
    console.error(
      `FAIL: duplicate fact IDs found:\n  ${duplicateIds.join('\n  ')}`,
    );
    process.exitCode = 1;
    return;
  }

  const factsById = new Map(facts.map((fact) => [fact.id, fact]));
  const profileProblems: string[] = [];
  for (const [profileId, profile] of Object.entries(mockProfiles)) {
    const playbookFacts: PlaybookFacts = buildPlaybookFacts(profile);
    profileProblems.push(
      ...logProfileFacts(profileId, playbookFacts, factsById),
    );
  }

  if (profileProblems.length > 0) {
    console.error(
      `\nFAIL: mock profile fact citations failed verification:\n  ${profileProblems.join('\n  ')}`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `\nPASS: all ${facts.length} facts have a valid source URL and last-verified date, and every mock profile's cited facts trace back to bundledKnowledge.`,
  );
}

main().catch((error: unknown) => {
  console.error('FAIL: knowledge JSON failed schema validation.');
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

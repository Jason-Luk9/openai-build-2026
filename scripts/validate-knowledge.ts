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
 * This logs every bundled fact rather than scoping to the three demo
 * profiles (Warung Digital, VietStack, PayFlip) — those don't exist yet.
 * This is a superset that will keep covering their facts once the
 * mock-profiles ticket lands.
 */
import type { RegulatoryFact } from "../src/lib/schemas";

type FactLogEntry = {
  domain: string;
  id: string;
  label: string;
  url: string;
  lastVerified: string;
};

function isRegulatoryFact(value: unknown): value is RegulatoryFact {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || typeof record.label !== "string") {
    return false;
  }
  if (typeof record.source !== "object" || record.source === null) {
    return false;
  }
  const source = record.source as Record<string, unknown>;
  return typeof source.url === "string" && typeof source.lastVerified === "string";
}

function collectFacts(node: unknown, domain: string, out: FactLogEntry[]): void {
  if (Array.isArray(node)) {
    for (const item of node) collectFacts(item, domain, out);
    return;
  }
  if (typeof node !== "object" || node === null) return;

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

async function main(): Promise<void> {
  const { bundledKnowledge } = await import("../src/lib/schemas");

  const facts: FactLogEntry[] = [];
  for (const [domain, knowledge] of Object.entries(bundledKnowledge)) {
    collectFacts(knowledge, domain, facts);
  }
  facts.sort((a, b) => a.domain.localeCompare(b.domain) || a.id.localeCompare(b.id));

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
    console.error(`FAIL: duplicate fact IDs found:\n  ${duplicateIds.join("\n  ")}`);
    process.exitCode = 1;
    return;
  }

  console.log(`PASS: all ${facts.length} facts have a valid source URL and last-verified date.`);
}

main().catch((error: unknown) => {
  console.error("FAIL: knowledge JSON failed schema validation.");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

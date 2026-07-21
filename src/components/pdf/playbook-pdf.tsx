'use client';

import {
  Document,
  Font,
  Link,
  Page,
  PDFDownloadLink,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';
import { Download } from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { formatMoney, formatNumber, formatWeek, formatVerifiedDate } from '@/lib/format';
import type {
  Narratives,
  NarrativeSection,
  PlaybookFacts,
  Profile,
  RegulatoryFact,
  SourceReference,
} from '@/lib/schemas';

Font.register({
  family: 'Newsreader',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/newsreader/v26/cY9qfjOCX1hbuyalUrK49dLac06G1ZGsZBtoBCzBDXXD9JVF438wpojADA.ttf',
      fontWeight: 600,
    },
  ],
});
Font.register({
  family: 'Public Sans',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/publicsans/v21/ijwGs572Xtc6ZYQws9YVwllKVG8qX1oyOymuFpm5ww.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/publicsans/v21/ijwGs572Xtc6ZYQws9YVwllKVG8qX1oyOymuyJ65ww.ttf',
      fontWeight: 600,
    },
  ],
});
// Roboto Mono, not IBM Plex Mono (used on the web) — this IBM Plex Mono TTF's
// space glyph crashes @react-pdf/renderer's fontkit-based layout engine
// (RangeError parsing an empty glyph), so any real string containing a space
// fails to render. Roboto Mono is visually close and confirmed to render.
Font.register({
  family: 'Roboto Mono',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/robotomono/v31/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vqPQw.ttf',
      fontWeight: 400,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#faf9f5',
    color: '#1c1b19',
    fontFamily: 'Public Sans',
    fontSize: 9,
    paddingBottom: 42,
    paddingHorizontal: 36,
    paddingTop: 36,
  },
  header: { borderBottomColor: '#93362c', borderBottomWidth: 2, marginBottom: 18, paddingBottom: 10 },
  eyebrow: { color: '#93362c', fontFamily: 'Roboto Mono', fontSize: 8, letterSpacing: 1.2, marginBottom: 5, textTransform: 'uppercase' },
  title: { fontFamily: 'Newsreader', fontSize: 21, fontWeight: 600 },
  subtitle: { color: '#8a8880', fontSize: 9, marginTop: 5 },
  section: { backgroundColor: '#ffffff', borderColor: '#e2ddd2', borderRadius: 3, borderWidth: 1, marginBottom: 12, padding: 12 },
  sectionTitle: { color: '#1c1b19', fontFamily: 'Newsreader', fontSize: 14, fontWeight: 600, marginBottom: 8 },
  label: { color: '#8a8880', fontFamily: 'Roboto Mono', fontSize: 8, marginBottom: 2 },
  value: { color: '#1c1b19', fontSize: 9, lineHeight: 1.35 },
  paragraph: { color: '#3a3830', fontSize: 9, lineHeight: 1.4, marginBottom: 6 },
  list: { marginTop: 3 },
  listItem: { color: '#3a3830', fontSize: 9, lineHeight: 1.35, marginBottom: 4 },
  row: { borderBottomColor: '#f2f0ea', borderBottomWidth: 1, flexDirection: 'row', gap: 10, paddingVertical: 5 },
  rowLabel: { color: '#8a8880', flex: 1, fontSize: 8.5 },
  rowValue: { color: '#1c1b19', flex: 1, fontFamily: 'Roboto Mono', fontSize: 8.5, textAlign: 'right' },
  narrativeBlock: { marginTop: 9 },
  calloutBox: { backgroundColor: '#f3e7e3', borderLeftColor: '#93362c', borderLeftWidth: 2, marginBottom: 6, marginTop: 6, padding: 8 },
  calloutText: { color: '#93362c', fontSize: 9, lineHeight: 1.4 },
  uncertaintyText: { color: '#93641b', fontFamily: 'Roboto Mono', fontSize: 7.5, lineHeight: 1.3, marginTop: 4 },
  sourceBlock: { borderTopColor: '#f2f0ea', borderTopWidth: 1, marginTop: 9, paddingTop: 7 },
  source: { color: '#8a8880', fontFamily: 'Roboto Mono', fontSize: 7.5, lineHeight: 1.3, marginBottom: 3 },
  sourceLink: { color: '#93362c', textDecoration: 'underline' },
  footer: { bottom: 18, color: '#8a8880', fontFamily: 'Roboto Mono', fontSize: 7.5, left: 36, position: 'absolute', right: 36, textAlign: 'center' },
  disclaimer: { backgroundColor: '#f2f0ea', color: '#3a3830', fontSize: 8, lineHeight: 1.35, marginTop: 4, padding: 8 },
});

const sectionTitles = {
  entity: 'Entity',
  visaCompass: 'Visa / COMPASS',
  licenses: 'Licences',
  taxIncentives: 'Tax and incentives',
  banking: 'Banking',
  timeline: 'Timeline',
  riskMatrix: 'Risk matrix',
} as const;

function displayValue(value: string | number | boolean) {
  return typeof value === 'number' ? formatNumber(value) : String(value);
}

function FactRows({ facts }: { facts: RegulatoryFact[] }) {
  return (
    <View>
      {facts.map((fact) => (
        <View key={fact.id} style={styles.row} wrap={false}>
          <Text style={styles.rowLabel}>{fact.label}</Text>
          <Text style={styles.rowValue}>
            {displayValue(fact.value)}{fact.description ? ` - ${fact.description}` : ''}
          </Text>
        </View>
      ))}
    </View>
  );
}

function SourceList({ facts, references = [] }: { facts?: RegulatoryFact[]; references?: SourceReference[] }) {
  const sources = [...(facts ?? []).map((fact) => ({ label: fact.label, ...fact.source })), ...references.map((reference) => ({ label: reference.factId, ...reference.source }))].filter(
    (source, index, all) => all.findIndex((candidate) => candidate.url === source.url) === index,
  );

  if (!sources.length) return null;
  return (
    <View style={styles.sourceBlock}>
      <Text style={styles.label}>Sources and verification</Text>
      {sources.map((source) => (
        <Text key={source.url} style={styles.source}>
          {source.label} - Last verified {formatVerifiedDate(source.lastVerified)} - <Link src={source.url} style={styles.sourceLink}>{source.url}</Link>
        </Text>
      ))}
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <View style={styles.list}>
      {items.map((item) => <Text key={item} style={styles.listItem}>- {item}</Text>)}
    </View>
  );
}

function NarrativeBlock({ narrative }: { narrative?: NarrativeSection }) {
  if (!narrative) return null;
  return (
    <View style={styles.narrativeBlock}>
      <Text style={styles.paragraph}>{narrative.summary}</Text>
      {narrative.callout ? (
        <View style={styles.calloutBox}>
          <Text style={styles.calloutText}>{narrative.callout}</Text>
        </View>
      ) : null}
      {narrative.nextSteps.length ? <BulletList items={narrative.nextSteps} /> : null}
      {narrative.uncertaintyFlags.length ? (
        <Text style={styles.uncertaintyText}>Uncertainty: {narrative.uncertaintyFlags.join(' ')}</Text>
      ) : null}
    </View>
  );
}

function EntitySection({ profile, facts, narrative }: { profile: Profile; facts: PlaybookFacts; narrative?: NarrativeSection }) {
  return <View style={styles.section}>
    <Text style={styles.sectionTitle}>{sectionTitles.entity}</Text>
    <Text style={styles.paragraph}>{facts.entity.recommendation.summary}</Text>
    <Text style={styles.label}>Profile context</Text>
    <Text style={styles.value}>Industry: {profile.industry}; purpose: {profile.entityPurpose}; relocating founders/staff: {formatNumber(profile.foundersRelocating)} / {formatNumber(profile.staffRelocating)}.</Text>
    {facts.entity.alternatives.length ? <><Text style={{ ...styles.label, marginTop: 8 }}>Alternatives</Text><BulletList items={facts.entity.alternatives.map((item) => item.summary)} /></> : null}
    <FactRows facts={facts.entity.regulatoryFacts} />
    <NarrativeBlock narrative={narrative} />
    <SourceList facts={facts.entity.regulatoryFacts} />
  </View>;
}

function VisaSection({ facts, narrative }: { facts: PlaybookFacts; narrative?: NarrativeSection }) {
  const sourceFacts = [...facts.visaCompass.regulatoryFacts, ...facts.visaCompass.criteria.flatMap((criterion) => criterion.regulatoryFacts)];
  return <View style={styles.section}>
    <Text style={styles.sectionTitle}>{sectionTitles.visaCompass}</Text>
    <Text style={styles.paragraph}>COMPASS score: {formatNumber(facts.visaCompass.totalScore)} / {formatNumber(facts.visaCompass.passThreshold)} points; outcome: {facts.visaCompass.outcome}; small-firm rule: {facts.visaCompass.isSmallFirm ? 'applies' : 'does not apply'}.</Text>
    {facts.visaCompass.criteria.map((criterion) => <View key={criterion.id} style={styles.row} wrap={false}><Text style={styles.rowLabel}>{criterion.id} - {criterion.label}</Text><Text style={styles.rowValue}>{formatNumber(criterion.score)} / {formatNumber(criterion.maximumScore)} - {criterion.assessment}</Text></View>)}
    <NarrativeBlock narrative={narrative} />
    <SourceList facts={sourceFacts} />
  </View>;
}

function LicencesSection({ facts, narrative }: { facts: PlaybookFacts; narrative?: NarrativeSection }) {
  const sourceFacts = facts.licenses.items.flatMap((item) => item.regulatoryFacts);
  return <View style={styles.section}>
    <Text style={styles.sectionTitle}>{sectionTitles.licenses}</Text>
    {facts.licenses.items.map((item) => <View key={item.name} style={styles.row} wrap={false}><Text style={styles.rowLabel}>{item.name}</Text><Text style={styles.rowValue}>{item.status} - {item.regulatoryFacts.map((fact) => `${fact.label}: ${displayValue(fact.value)}`).join('; ')}</Text></View>)}
    <NarrativeBlock narrative={narrative} />
    <SourceList facts={sourceFacts} />
  </View>;
}

function TaxSection({ profile, facts, narrative }: { profile: Profile; facts: PlaybookFacts; narrative?: NarrativeSection }) {
  return <View style={styles.section}>
    <Text style={styles.sectionTitle}>{sectionTitles.taxIncentives}</Text>
    <Text style={styles.paragraph}>Projected Singapore revenue: {formatMoney(profile.projectedSingaporeRevenue)}.</Text>
    <FactRows facts={facts.taxIncentives.regulatoryFacts} />
    {facts.taxIncentives.opportunities.length ? <><Text style={{ ...styles.label, marginTop: 8 }}>Opportunities</Text><BulletList items={facts.taxIncentives.opportunities.map((item) => item.summary)} /></> : null}
    <NarrativeBlock narrative={narrative} />
    <SourceList facts={facts.taxIncentives.regulatoryFacts} />
  </View>;
}

function BankingSection({ facts, narrative }: { facts: PlaybookFacts; narrative?: NarrativeSection }) {
  return <View style={styles.section}>
    <Text style={styles.sectionTitle}>{sectionTitles.banking}</Text>
    <FactRows facts={facts.banking.requirements} />
    <Text style={{ ...styles.label, marginTop: 8 }}>Recommended next steps</Text>
    <BulletList items={facts.banking.recommendations.map((item) => item.summary)} />
    <NarrativeBlock narrative={narrative} />
    <SourceList facts={facts.banking.requirements} references={facts.banking.recommendations.flatMap((item) => item.sourceReferences)} />
  </View>;
}

function TimelineSection({ facts, narrative }: { facts: PlaybookFacts; narrative?: NarrativeSection }) {
  return <View style={styles.section}>
    <Text style={styles.sectionTitle}>{sectionTitles.timeline}</Text>
    {facts.timeline.steps.map((step) => <View key={`${step.week}-${step.action}`} style={styles.row} wrap={false}><Text style={styles.rowLabel}>{formatWeek(step.week)}</Text><Text style={styles.rowValue}>{step.action}</Text></View>)}
    <NarrativeBlock narrative={narrative} />
    <SourceList references={facts.timeline.steps.flatMap((step) => step.sourceReferences)} />
  </View>;
}

function RiskSection({ facts, narrative }: { facts: PlaybookFacts; narrative?: NarrativeSection }) {
  return <View style={styles.section}>
    <Text style={styles.sectionTitle}>{sectionTitles.riskMatrix}</Text>
    {facts.riskMatrix.risks.map((risk) => <View key={risk.title} style={styles.row} wrap={false}><Text style={styles.rowLabel}>{risk.title} - {risk.likelihood} likelihood / {risk.impact} impact</Text><Text style={styles.rowValue}>{risk.mitigation}</Text></View>)}
    <NarrativeBlock narrative={narrative} />
    <SourceList references={facts.riskMatrix.risks.flatMap((risk) => risk.sourceReferences)} />
  </View>;
}

export function PlaybookPdf({
  profile,
  facts,
  narratives,
}: {
  profile: Profile;
  facts: PlaybookFacts;
  narratives: Narratives;
}) {
  return <Document title="Sprout playbook" author="Sprout">
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.header} fixed>
        <Text style={styles.eyebrow}>Sprout playbook</Text>
        <Text style={styles.title}>Singapore market-entry facts</Text>
        <Text style={styles.subtitle}>A deterministic snapshot generated from your profile and Sprout&apos;s rules engine.</Text>
      </View>
      <EntitySection profile={profile} facts={facts} narrative={narratives.entity} />
      <VisaSection facts={facts} narrative={narratives.visaCompass} />
      <LicencesSection facts={facts} narrative={narratives.licenses} />
      <TaxSection profile={profile} facts={facts} narrative={narratives.taxIncentives} />
      <BankingSection facts={facts} narrative={narratives.banking} />
      <TimelineSection facts={facts} narrative={narratives.timeline} />
      <RiskSection facts={facts} narrative={narratives.riskMatrix} />
      <Text style={styles.disclaimer}>General information, not legal advice. Regulatory requirements, fees, and eligibility can change; confirm current requirements with the relevant Singapore agency before acting.</Text>
      <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => `Sprout - Facts-first playbook  |  Page ${pageNumber} of ${totalPages}`} />
    </Page>
  </Document>;
}

export function PlaybookPdfDownload({
  profile,
  facts,
  narratives,
}: {
  profile: Profile;
  facts: PlaybookFacts;
  narratives: Narratives;
}) {
  const fileName = `sprout-${profile.industry}-playbook.pdf`;
  return <PDFDownloadLink
    className={buttonVariants({ className: 'h-10 bg-foreground px-4 text-background hover:bg-foreground/90' })}
    document={<PlaybookPdf facts={facts} profile={profile} narratives={narratives} />}
    fileName={fileName}
  >
    {({ loading }) => <><Download aria-hidden="true" />{loading ? 'Preparing PDF...' : 'Download PDF'}</>}
  </PDFDownloadLink>;
}

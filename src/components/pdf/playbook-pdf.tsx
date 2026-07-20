'use client';

import {
  Document,
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
  PlaybookFacts,
  Profile,
  RegulatoryFact,
  SourceReference,
} from '@/lib/schemas';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fafafa',
    color: '#18181b',
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingBottom: 42,
    paddingHorizontal: 36,
    paddingTop: 36,
  },
  header: { borderBottomColor: '#0f766e', borderBottomWidth: 2, marginBottom: 18, paddingBottom: 10 },
  eyebrow: { color: '#0f766e', fontSize: 8, letterSpacing: 1.2, marginBottom: 5, textTransform: 'uppercase' },
  title: { fontSize: 20, fontWeight: 700 },
  subtitle: { color: '#52525b', fontSize: 9, marginTop: 5 },
  section: { backgroundColor: '#ffffff', borderColor: '#e4e4e7', borderRadius: 5, borderWidth: 1, marginBottom: 12, padding: 12 },
  sectionTitle: { color: '#18181b', fontSize: 13, fontWeight: 700, marginBottom: 8 },
  label: { color: '#52525b', fontSize: 8, marginBottom: 2 },
  value: { color: '#18181b', fontSize: 9, lineHeight: 1.35 },
  paragraph: { color: '#3f3f46', fontSize: 9, lineHeight: 1.4, marginBottom: 6 },
  list: { marginTop: 3 },
  listItem: { color: '#3f3f46', fontSize: 9, lineHeight: 1.35, marginBottom: 4 },
  row: { borderBottomColor: '#f4f4f5', borderBottomWidth: 1, flexDirection: 'row', gap: 10, paddingVertical: 5 },
  rowLabel: { color: '#52525b', flex: 1, fontSize: 8.5 },
  rowValue: { color: '#18181b', flex: 1, fontSize: 8.5, textAlign: 'right' },
  sourceBlock: { borderTopColor: '#f4f4f5', borderTopWidth: 1, marginTop: 9, paddingTop: 7 },
  source: { color: '#52525b', fontSize: 7.5, lineHeight: 1.3, marginBottom: 3 },
  sourceLink: { color: '#0f766e', textDecoration: 'underline' },
  footer: { bottom: 18, color: '#71717a', fontSize: 7.5, left: 36, position: 'absolute', right: 36, textAlign: 'center' },
  disclaimer: { backgroundColor: '#f4f4f5', color: '#52525b', fontSize: 8, lineHeight: 1.35, marginTop: 4, padding: 8 },
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

function EntitySection({ profile, facts }: { profile: Profile; facts: PlaybookFacts }) {
  return <View style={styles.section}>
    <Text style={styles.sectionTitle}>{sectionTitles.entity}</Text>
    <Text style={styles.paragraph}>{facts.entity.recommendation.summary}</Text>
    <Text style={styles.label}>Profile context</Text>
    <Text style={styles.value}>Industry: {profile.industry}; purpose: {profile.entityPurpose}; relocating founders/staff: {formatNumber(profile.foundersRelocating)} / {formatNumber(profile.staffRelocating)}.</Text>
    {facts.entity.alternatives.length ? <><Text style={{ ...styles.label, marginTop: 8 }}>Alternatives</Text><BulletList items={facts.entity.alternatives.map((item) => item.summary)} /></> : null}
    <FactRows facts={facts.entity.regulatoryFacts} />
    <SourceList facts={facts.entity.regulatoryFacts} />
  </View>;
}

function VisaSection({ facts }: { facts: PlaybookFacts }) {
  const sourceFacts = [...facts.visaCompass.regulatoryFacts, ...facts.visaCompass.criteria.flatMap((criterion) => criterion.regulatoryFacts)];
  return <View style={styles.section}>
    <Text style={styles.sectionTitle}>{sectionTitles.visaCompass}</Text>
    <Text style={styles.paragraph}>COMPASS score: {formatNumber(facts.visaCompass.totalScore)} / {formatNumber(facts.visaCompass.passThreshold)} points; outcome: {facts.visaCompass.outcome}; small-firm rule: {facts.visaCompass.isSmallFirm ? 'applies' : 'does not apply'}.</Text>
    {facts.visaCompass.criteria.map((criterion) => <View key={criterion.id} style={styles.row} wrap={false}><Text style={styles.rowLabel}>{criterion.id} - {criterion.label}</Text><Text style={styles.rowValue}>{formatNumber(criterion.score)} / {formatNumber(criterion.maximumScore)} - {criterion.assessment}</Text></View>)}
    <SourceList facts={sourceFacts} />
  </View>;
}

function LicencesSection({ facts }: { facts: PlaybookFacts }) {
  const sourceFacts = facts.licenses.items.flatMap((item) => item.regulatoryFacts);
  return <View style={styles.section}>
    <Text style={styles.sectionTitle}>{sectionTitles.licenses}</Text>
    {facts.licenses.items.map((item) => <View key={item.name} style={styles.row} wrap={false}><Text style={styles.rowLabel}>{item.name}</Text><Text style={styles.rowValue}>{item.status} - {item.regulatoryFacts.map((fact) => `${fact.label}: ${displayValue(fact.value)}`).join('; ')}</Text></View>)}
    <SourceList facts={sourceFacts} />
  </View>;
}

function TaxSection({ profile, facts }: { profile: Profile; facts: PlaybookFacts }) {
  return <View style={styles.section}>
    <Text style={styles.sectionTitle}>{sectionTitles.taxIncentives}</Text>
    <Text style={styles.paragraph}>Projected Singapore revenue: {formatMoney(profile.projectedSingaporeRevenue)}.</Text>
    <FactRows facts={facts.taxIncentives.regulatoryFacts} />
    {facts.taxIncentives.opportunities.length ? <><Text style={{ ...styles.label, marginTop: 8 }}>Opportunities</Text><BulletList items={facts.taxIncentives.opportunities.map((item) => item.summary)} /></> : null}
    <SourceList facts={facts.taxIncentives.regulatoryFacts} />
  </View>;
}

function BankingSection({ facts }: { facts: PlaybookFacts }) {
  return <View style={styles.section}>
    <Text style={styles.sectionTitle}>{sectionTitles.banking}</Text>
    <FactRows facts={facts.banking.requirements} />
    <Text style={{ ...styles.label, marginTop: 8 }}>Recommended next steps</Text>
    <BulletList items={facts.banking.recommendations.map((item) => item.summary)} />
    <SourceList facts={facts.banking.requirements} references={facts.banking.recommendations.flatMap((item) => item.sourceReferences)} />
  </View>;
}

function TimelineSection({ facts }: { facts: PlaybookFacts }) {
  return <View style={styles.section}>
    <Text style={styles.sectionTitle}>{sectionTitles.timeline}</Text>
    {facts.timeline.steps.map((step) => <View key={`${step.week}-${step.action}`} style={styles.row} wrap={false}><Text style={styles.rowLabel}>{formatWeek(step.week)}</Text><Text style={styles.rowValue}>{step.action}</Text></View>)}
    <SourceList references={facts.timeline.steps.flatMap((step) => step.sourceReferences)} />
  </View>;
}

function RiskSection({ facts }: { facts: PlaybookFacts }) {
  return <View style={styles.section}>
    <Text style={styles.sectionTitle}>{sectionTitles.riskMatrix}</Text>
    {facts.riskMatrix.risks.map((risk) => <View key={risk.title} style={styles.row} wrap={false}><Text style={styles.rowLabel}>{risk.title} - {risk.likelihood} likelihood / {risk.impact} impact</Text><Text style={styles.rowValue}>{risk.mitigation}</Text></View>)}
    <SourceList references={facts.riskMatrix.risks.flatMap((risk) => risk.sourceReferences)} />
  </View>;
}

export function PlaybookPdf({ profile, facts }: { profile: Profile; facts: PlaybookFacts }) {
  return <Document title="SingaPath playbook" author="SingaPath">
    <Page size="A4" style={styles.page} wrap>
      <View style={styles.header} fixed>
        <Text style={styles.eyebrow}>SingaPath playbook</Text>
        <Text style={styles.title}>Singapore market-entry facts</Text>
        <Text style={styles.subtitle}>A deterministic snapshot generated from your profile and SingaPath&apos;s rules engine.</Text>
      </View>
      <EntitySection profile={profile} facts={facts} />
      <VisaSection facts={facts} />
      <LicencesSection facts={facts} />
      <TaxSection profile={profile} facts={facts} />
      <BankingSection facts={facts} />
      <TimelineSection facts={facts} />
      <RiskSection facts={facts} />
      <Text style={styles.disclaimer}>General information, not legal advice. Regulatory requirements, fees, and eligibility can change; confirm current requirements with the relevant Singapore agency before acting.</Text>
      <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => `SingaPath - Facts-first playbook  |  Page ${pageNumber} of ${totalPages}`} />
    </Page>
  </Document>;
}

export function PlaybookPdfDownload({ profile, facts }: { profile: Profile; facts: PlaybookFacts }) {
  const fileName = `singapath-${profile.industry}-playbook.pdf`;
  return <PDFDownloadLink
    className={buttonVariants({ className: 'h-10 bg-teal-700 px-4 text-white hover:bg-teal-800 focus-visible:ring-teal-700/30' })}
    document={<PlaybookPdf facts={facts} profile={profile} />}
    fileName={fileName}
  >
    {({ loading }) => <><Download aria-hidden="true" />{loading ? 'Preparing PDF...' : 'Download PDF'}</>}
  </PDFDownloadLink>;
}

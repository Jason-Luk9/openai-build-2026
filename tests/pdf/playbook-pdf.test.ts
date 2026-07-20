import { renderToBuffer } from '@react-pdf/renderer';
import { describe, expect, it } from 'vitest';

import { PlaybookPdf } from '@/components/pdf/playbook-pdf';
import { mockProfiles } from '@/lib/mock-profiles';
import { buildPlaybookFacts } from '@/lib/rules';

describe('PlaybookPdf', () => {
  it.each(Object.entries(mockProfiles))(
    'renders the complete facts document for %s',
    async (_id, profile) => {
      const buffer = await renderToBuffer(
        PlaybookPdf({ profile, facts: buildPlaybookFacts(profile) }),
      );

      expect(buffer.byteLength).toBeGreaterThan(1_000);
    },
  );
});

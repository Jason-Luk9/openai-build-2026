import { renderToBuffer } from '@react-pdf/renderer';
import { describe, expect, it } from 'vitest';

import { PlaybookPdf } from '@/components/pdf/playbook-pdf';
import { getNarrativeFixture } from '@/lib/fixtures';
import { mockProfiles, type MockProfileId } from '@/lib/mock-profiles';
import { buildPlaybookFacts } from '@/lib/rules';

describe('PlaybookPdf', () => {
  it.each(Object.entries(mockProfiles))(
    'renders the complete facts document for %s',
    async (id, profile) => {
      const buffer = await renderToBuffer(
        PlaybookPdf({
          profile,
          facts: buildPlaybookFacts(profile),
          narratives: getNarrativeFixture(id as MockProfileId),
        }),
      );

      expect(buffer.byteLength).toBeGreaterThan(1_000);
    },
  );
});

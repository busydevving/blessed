import type { Metadata } from 'next';
import { Page, PageHead } from '@/components/ui';

export const metadata: Metadata = { title: 'privacy' };

export default function Legal() {
  return (
    <Page narrow>
      <PageHead eyebrow="legal" title="privacy" />
      <div className="prose"><p>placeholder privacy policy. TODO(legal): replace before launch. the front end stores a few preferences in your browser (sidebar state, terms acknowledgement, wallet connection). it does not collect personal data. on-chain activity is public.</p></div>
    </Page>
  );
}

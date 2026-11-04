import type { Metadata } from 'next';
import { Page, PageHead } from '@/components/ui';

export const metadata: Metadata = { title: 'terms' };

export default function Legal() {
  return (
    <Page narrow>
      <PageHead eyebrow="legal" title="terms" />
      <div className="prose"><p>placeholder terms of use. TODO(legal): replace with the real terms before launch. by using blessed you confirm you are not a sanctioned person, are not located in a restricted region (the united states, the united kingdom, canada), and accept that the protocol is provided as is, without warranty.</p></div>
    </Page>
  );
}

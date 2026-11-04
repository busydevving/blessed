import type { Metadata } from 'next';
import { Page, PageHead } from '@/components/ui';

export const metadata: Metadata = { title: 'risks' };

export default function Legal() {
  return (
    <Page narrow>
      <PageHead eyebrow="legal" title="risks" />
      <div className="prose"><p>trading digital assets carries a high risk of losing all the capital you commit. meme tokens are volatile and can go to zero. a token priced in a stock also carries that stock's risk, and the bridged or tokenized asset's own risk. smart contracts can have bugs. TODO(legal): review before launch.</p></div>
    </Page>
  );
}

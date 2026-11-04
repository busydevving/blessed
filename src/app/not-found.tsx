import Link from 'next/link';
import { Page } from '@/components/ui';

export default function NotFound() {
  return (
    <Page narrow>
      <div className="box empty"><p style={{ fontFamily: 'var(--display)', fontSize: 28, color: 'var(--text)' }}>not blessed.</p><p style={{ marginTop: 6 }}>this page doesn&apos;t exist.</p><p className="m" style={{ marginTop: 10, color: 'var(--ruby)' }}>0xdead…not 0xb1e55ed</p><Link href="/" className="btn primary" style={{ marginTop: 16 }}>back home</Link></div>
    </Page>
  );
}

import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { Hanken_Grotesk, Martian_Mono, Syne } from 'next/font/google';
import { cookieToInitialState } from 'wagmi';
import { wagmiConfig } from '@/lib/wagmi';
import { SITE } from '@/lib/constants';
import { Providers } from './providers';
import { Shell } from '@/components/Shell';
import './globals.css';

const display = Syne({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display' });
const sans = Hanken_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-sans' });
const mono = Martian_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'blessed 🙏 every meme, blessed by a stock', template: '%s · blessed 🙏' },
  description: 'launch a meme priced in a stock. born on hyperevm, listed on elysium in pools locked forever. 0.01 hype to launch.',
  openGraph: { title: 'blessed 🙏', description: 'every meme, blessed by a stock.', url: SITE.url, siteName: 'blessed', images: ['/og.png'] },
  twitter: { card: 'summary_large_image', site: SITE.xHandle, creator: SITE.xHandle, images: ['/og.png'] },
  icons: { icon: '/icon.svg', apple: '/apple-icon.png' },
};
export const viewport: Viewport = { themeColor: '#08080A' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialState = cookieToInitialState(wagmiConfig, (await headers()).get('cookie'));
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <Providers initialState={initialState}>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Page, PageHead } from '@/components/ui';

export const metadata: Metadata = { title: 'docs' };

const SECTIONS = [
  { id: 'lore', title: 'the lore', body: [
    'in greek mythology, elysium (also called the elysian fields, or the isles of the blessed) was a paradise at the western edge of the world, where those favored by the gods lived forever.',
    "that's where the name comes from. every meme on blessed is born on hyperevm, rises on the bonding curve, and when the curve completes, it ascends to elysium, where its liquidity is locked forever.",
    'every token carries the mark from birth: an address that starts with 0xb1e55ed.',
  ] },
  { id: 'pairs', title: 'pairs', body: [
    'a pair is a meme token priced in a quote asset: a stock (NVDA, TSLA, SPY…), a 3× share, or HYPE. when the quote moves, the meme moves with it.',
    'every token has a fixed supply of 1,000,000,000. 793,100,000 (79.31%) sells on a bonding curve on HyperEVM. nothing is minted later and there are no team tokens.',
    'when the curve sells out, the raise and the matching tokens seed two pools on Elysium (meme/quote and meme/HYPE). every other unsold token burns. the pools are locked forever: the launchpad can only add to them.',
  ] },
  { id: 'address', title: 'every address is blessed', body: [
    'every token is deployed at an address that starts with 0xb1e55ed, the same on HyperEVM and Elysium. the launchpad checks it. no prefix, no blessing.',
  ] },
  { id: 'fees', title: 'fees & rewards', body: [
    'the creator picks a trading fee between 0.25% and 5% at launch. it never changes.',
    '80% of every fee goes to the creator. 33% of that buys back and burns $BLESSED.',
    'creators can also turn on holder rewards: every 30 minutes, wallets holding at least 0.05% of supply are paid in the quote asset.',
    'launch protection: an anti-snipe fee of up to 90% at launch that falls to the trading fee within 10 minutes, and runs again when the pair lists.',
    'launching costs 0.01 HYPE. there is no listing fee.',
  ] },
  { id: 'treasury', title: 'treasury', body: [
    "the protocol's share of fees goes to the treasury, behind a 4-hour public timelock. it funds buyback & burn, liquidity on Elysium, new stock markets, new markets on blessed, and vaults.",
  ] },
  { id: 'safety', title: 'safety', body: [
    'every change to the contracts waits four hours in public before it takes effect. liquidity on Elysium is locked forever.',
    'trading digital assets carries a high risk of losing all the capital you commit. blessed is not offered in the united states, the united kingdom or canada.',
  ] },
];

export default function DocsPage() {
  return (
    <Page>
      <PageHead eyebrow="docs" title="scripture" lede="how blessed works, in plain words." />
      <div className="docs-layout">
        <nav className="docs-nav">{SECTIONS.map((s) => <a key={s.id} href={`#${s.id}`}>{s.title}</a>)}</nav>
        <div className="prose">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id}><h2>{s.title}</h2>{s.body.map((p, i) => <p key={i}>{p}</p>)}</section>
          ))}
        </div>
      </div>
    </Page>
  );
}

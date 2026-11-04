'use client';
import Link from 'next/link';
import { Page, PageHead, Skel } from '@/components/ui';
import { useQuotes } from '@/hooks/useData';
import { pct, usd } from '@/lib/format';
import type { QuoteKind } from '@/lib/types';

const GROUPS: [QuoteKind, string, string][] = [
  ['xstock', 'xStocks', 'Tokenized stocks, bridged from Hyperliquid.'],
  ['eqx', 'EQX', 'More stocks, bridged from Hyperliquid.'],
  ['leveraged', 'Leveraged', '3× shares backed by Hyperliquid perps. QQQ and the S&P 500 next.'],
  ['native', 'House of finance', "Hyperliquid's own assets."],
];

export default function OfferingsPage() {
  const { data, isLoading } = useQuotes();
  return (
    <Page>
      <PageHead eyebrow="offerings" title={<>What your meme can <span className="grad">answer to</span></>} lede="Every pair is priced in one of these. When it moves, the meme moves with it." />
      <div style={{ display: 'grid', gap: 16 }}>
        {GROUPS.map(([k, title, sub]) => (
          <div key={k} className="box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}><h2 className="title" style={{ margin: 0 }}>{title}</h2><span className="faint" style={{ fontSize: 13 }}>{sub}</span></div>
            <div className="table-wrap" style={{ marginTop: 12, border: 0, background: 'transparent' }}>
              {isLoading ? <Skel h={80} /> : (
                <table className="t"><thead><tr><th>asset</th><th>name</th><th>price</th><th>24h</th><th /></tr></thead>
                  <tbody>{(data ?? []).filter((q) => q.kind === k).map((q) => (
                    <tr key={q.symbol}><td className="m" style={{ color: 'var(--amber-2)' }}>{q.symbol}</td><td>{q.name}</td><td className="m">{usd(q.priceUsd)}</td><td className={`m ${q.change24h >= 0 ? 'up' : 'down'}`}>{pct(q.change24h)}</td>
                      <td style={{ textAlign: 'right' }}><Link className="btn ghost sm" href={`/launch?quote=${q.symbol}`}>Launch in {q.symbol}</Link></td></tr>
                  ))}</tbody></table>
              )}
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}

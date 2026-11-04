'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Page, PageHead, PairCard, Skel, Tok } from '@/components/ui';
import { usePairs, useQuotes } from '@/hooks/useData';
import type { PairSort } from '@/lib/api';
import { ago, pct, usd } from '@/lib/format';

const SORTS: [PairSort, string][] = [['trending', 'trending'], ['new', 'new'], ['mcap', 'market cap'], ['volume', 'volume'], ['listed', 'on elysium']];

export default function PairsPage() {
  const router = useRouter();
  const [sort, setSort] = useState<PairSort>('trending');
  const [quote, setQuote] = useState('');
  const [q, setQ] = useState('');
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const { data, isLoading } = usePairs({ sort, quote: quote || undefined, q: q || undefined });
  const { data: quotes } = useQuotes();

  return (
    <Page>
      <PageHead eyebrow="pairs" title="Every blessed meme" lede="Tokens on the curve on HyperEVM, and the ones that made it to Elysium."
        right={<div className="seg"><button className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')}>Grid</button><button className={view === 'table' ? 'on' : ''} onClick={() => setView('table')}>Table</button></div>} />
      <div className="toolbar">
        <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, ticker or 0xb1e55ed…" aria-label="Search pairs" />
        {SORTS.map(([k, l]) => <button key={k} className={`chip-btn${sort === k ? ' on' : ''}`} onClick={() => setSort(k)}>{l}</button>)}
        <select className="select" style={{ width: 'auto', height: 32, padding: '0 10px', fontSize: 12 }} value={quote} onChange={(e) => setQuote(e.target.value)} aria-label="Filter by quote">
          <option value="">all quotes</option>
          {(quotes ?? []).map((x) => <option key={x.symbol} value={x.symbol}>{x.symbol}</option>)}
        </select>
      </div>
      {isLoading ? (
        <div className="grid-pairs">{Array.from({ length: 8 }, (_, i) => <Skel key={i} h={170} />)}</div>
      ) : !data?.length ? (
        <div className="box empty">No pairs here yet.</div>
      ) : view === 'grid' ? (
        <div className="grid-pairs">{data.map((p) => <PairCard key={p.address} p={p} />)}</div>
      ) : (
        <div className="table-wrap">
          <table className="t">
            <thead><tr><th>pair</th><th>price</th><th>24h</th><th>market cap</th><th>volume 24h</th><th>holders</th><th>curve</th><th>age</th></tr></thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.address} className="click" onClick={() => router.push(`/pairs/${p.address}`)}>
                  <td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}><Tok p={p} /><span><b style={{ fontWeight: 600 }}>{p.name}</b><br /><span className="sym">${p.symbol}/{p.quote}</span></span></span></td>
                  <td className="m">{usd(p.priceUsd)}</td>
                  <td className={`m ${p.change24h >= 0 ? 'up' : 'down'}`}>{pct(p.change24h)}</td>
                  <td className="m">{usd(p.mcapUsd)}</td>
                  <td className="m">{usd(p.volume24hUsd)}</td>
                  <td className="m">{p.holders}</td>
                  <td className="m">{p.status === 'listed' ? 'elysium' : `${(p.curveProgress * 100).toFixed(0)}%`}</td>
                  <td className="m faint">{ago(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Page>
  );
}

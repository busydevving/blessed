'use client';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Page, PageHead } from '@/components/ui';
import { Icon } from '@/components/icons';
import { useApp } from '@/components/AppContext';
import { usePairs, useQuotes } from '@/hooks/useData';
import { useBlessedActions } from '@/hooks/useBlessedActions';
import { num } from '@/lib/format';
import { IS_DEMO } from '@/lib/api';
import type { Address } from '@/lib/types';

/** Swap on Elysium: any listed meme, quote asset or HYPE. TODO(backend): routing + quotes from the router. */
export default function SwapPage() {
  const { isConnected } = useAccount();
  const { openConnect, say } = useApp();
  const { swap } = useBlessedActions();
  const { data: pairs } = usePairs({ sort: 'listed' });
  const { data: quotes } = useQuotes();
  const tokens = [...(quotes ?? []).map((q) => ({ symbol: q.symbol, usd: q.priceUsd, address: q.address })), ...(pairs ?? []).map((p) => ({ symbol: p.symbol, usd: p.priceUsd, address: p.address }))];
  const [from, setFrom] = useState('HYPE');
  const [to, setTo] = useState('NVDA');
  const [amt, setAmt] = useState('');
  const [busy, setBusy] = useState(false);
  const f = tokens.find((t) => t.symbol === from), t = tokens.find((x) => x.symbol === to);
  const out = f && t ? ((Number(amt) || 0) * f.usd * 0.997) / t.usd : 0;
  const go = async () => {
    if (!isConnected) return openConnect();
    setBusy(true);
    try { await swap((f?.address ?? '0x0000000000000000000000000000000000000000') as Address, (t?.address ?? '0x0000000000000000000000000000000000000000') as Address, Number(amt), out * 0.99); say(`Swapped ${amt} ${from} → ${num(out)} ${to}`); setAmt(''); }
    catch (e) { say((e as Error).message.split('\n')[0]); } finally { setBusy(false); }
  };
  const Sel = ({ v, on }: { v: string; on: (s: string) => void }) => (
    <select className="tk" value={v} onChange={(e) => on(e.target.value)} aria-label="Token">{tokens.map((x) => <option key={x.symbol} value={x.symbol}>{x.symbol}</option>)}</select>
  );
  return (
    <Page narrow>
      <PageHead eyebrow="swap · elysium" title="Swap" lede="Trade listed memes, stocks and HYPE against the locked pools." />
      <div className="box">
        <div className="amount"><div className="top"><span>you pay</span><span>balance —</span></div>
          <div className="mid"><input inputMode="decimal" placeholder="0" value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^0-9.]/g, ''))} aria-label="Amount in" /><Sel v={from} on={setFrom} /></div></div>
        <button className="flip" aria-label="Flip" onClick={() => { setFrom(to); setTo(from); }}><Icon name="flip" width={16} height={16} /></button>
        <div className="amount"><div className="top"><span>you get (est.)</span><span /></div>
          <div className="mid"><input readOnly value={out ? num(out, 6) : ''} placeholder="0" aria-label="Amount out" /><Sel v={to} on={setTo} /></div></div>
        <div style={{ marginTop: 12 }}><div className="kv"><span>Route</span><span>{from} → {to} · Elysium</span></div><div className="kv"><span>Slippage</span><span>1%</span></div></div>
        <button className="btn primary block" style={{ marginTop: 14 }} disabled={busy || (isConnected && (!Number(amt) || from === to))} onClick={go}>{busy ? 'Confirm in wallet…' : isConnected ? 'Swap' : 'Connect wallet'}</button>
        {IS_DEMO && <p className="hint">Demo mode: prices are mock and the swap is simulated.</p>}
      </div>
    </Page>
  );
}

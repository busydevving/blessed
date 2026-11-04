'use client';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Curve, Page, PriceChart, Skel, Tok } from '@/components/ui';
import { Icon } from '@/components/icons';
import { useApp } from '@/components/AppContext';
import { useCandles, useHolders, usePair, useTrades } from '@/hooks/useData';
import { useBlessedActions } from '@/hooks/useBlessedActions';
import { ago, bpsToPct, num, pct, short, usd } from '@/lib/format';
import { IS_DEMO } from '@/lib/api';
import type { Address } from '@/lib/types';

export default function PairPage() {
  const { address } = useParams<{ address: string }>();
  const a = address as Address;
  const { data: p, isLoading } = usePair(a);
  const { data: candles } = useCandles(a);
  const { data: trades } = useTrades(a);
  const { data: holders } = useHolders(a);
  const [tab, setTab] = useState<'trades' | 'holders' | 'about'>('trades');
  const { say } = useApp();

  if (isLoading) return <Page><Skel h={60} w={320} /><div style={{ height: 16 }} /><Skel h={300} /></Page>;
  if (!p) return <Page><div className="box empty">No pair at {short(a, 10, 6)}. Every Blessed token starts with 0xb1e55ed.</div></Page>;

  return (
    <Page>
      <div className="pair-hero">
        <Tok p={p} size="lg" />
        <div style={{ flex: 1, minWidth: 220 }}>
          <h1>{p.name} <span className="sym" style={{ fontSize: 14 }}>${p.symbol}</span></h1>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="badge q">/{p.quote}</span>
            <span className={`badge${p.status === 'listed' ? ' ok' : ''}`}>{p.status === 'listed' ? 'listed on elysium' : 'on the curve · hyperevm'}</span>
            <button className="badge" onClick={() => { navigator.clipboard?.writeText(p.address).then(() => say('Address copied'), () => {}); }} title="Copy address">
              <span className="addr-chip">0x<b>b1e55ed</b>{p.address.slice(9, 13)}…{p.address.slice(-4)}</span>&nbsp;<Icon name="copy" width={11} height={11} />
            </button>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 28, fontWeight: 600 }}>{usd(p.priceUsd)}</div>
          <div className={`m ${p.change24h >= 0 ? 'up' : 'down'}`}>{pct(p.change24h)} · {num(p.priceInQuote)} {p.quote}</div>
        </div>
      </div>

      <div className="stats4">
        <div className="s"><small>market cap</small><b>{usd(p.mcapUsd)}</b></div>
        <div className="s"><small>volume 24h</small><b>{usd(p.volume24hUsd)}</b></div>
        <div className="s"><small>holders</small><b>{p.holders}</b></div>
        <div className="s"><small>fee · anti-snipe</small><b>{bpsToPct(p.feeBps)} · {bpsToPct(p.antiSnipeBps)}</b></div>
      </div>

      <div className="pair-layout">
        <div>
          <div className="box tight"><PriceChart candles={candles ?? []} /></div>
          {p.status === 'curve' && (
            <div className="box" style={{ marginTop: 12 }}>
              <div className="kv"><span>Bonding curve</span><span>{(p.curveProgress * 100).toFixed(2)}% of 793.1M sold</span></div>
              <Curve p={p} />
              <p className="hint">At 100% the raise seeds two locked pools on Elysium ({p.symbol}/{p.quote} and {p.symbol}/HYPE). Unsold tokens burn.</p>
            </div>
          )}
          <div className="tabs">
            {(['trades', 'holders', 'about'] as const).map((t) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}
          </div>
          {tab === 'trades' && (
            <div className="table-wrap"><table className="t">
              <thead><tr><th>side</th><th>usd</th><th>{p.symbol}</th><th>{p.quote}</th><th>trader</th><th>time</th></tr></thead>
              <tbody>{(trades ?? []).map((t) => (
                <tr key={t.tx}><td className={t.side === 'buy' ? 'up' : 'down'}>{t.side}</td><td className="m">{usd(t.usd)}</td><td className="m">{num(t.amountToken)}</td><td className="m">{num(t.amountQuote, 4)}</td><td className="m faint">{short(t.trader)}</td><td className="m faint">{ago(t.ts)}</td></tr>
              ))}</tbody>
            </table></div>
          )}
          {tab === 'holders' && (
            <div className="table-wrap"><table className="t">
              <thead><tr><th>#</th><th>holder</th><th>share</th><th>balance</th></tr></thead>
              <tbody>{(holders ?? []).map((h, i) => (
                <tr key={h.address + i}><td className="m faint">{i + 1}</td><td className="m">{short(h.address)} {h.label && <span className="badge">{h.label}</span>}</td><td className="m">{h.pct.toFixed(2)}%</td><td className="m">{num(h.balance)}</td></tr>
              ))}</tbody>
            </table></div>
          )}
          {tab === 'about' && (
            <div className="box">
              <p className="muted">{p.description}</p>
              <div style={{ marginTop: 12 }}>
                <div className="kv"><span>Creator</span><span>{short(p.creator)}</span></div>
                <div className="kv"><span>Created</span><span>{ago(p.createdAt)}</span></div>
                <div className="kv"><span>Holder rewards</span><span>{p.holderRewards ? `every 30 min, in ${p.quote}` : 'off'}</span></div>
                {p.socials.x && <div className="kv"><span>X</span><span><a href={p.socials.x} target="_blank" rel="noreferrer">{p.socials.x.replace('https://', '')}</a></span></div>}
              </div>
            </div>
          )}
        </div>
        <div className="sticky"><TradePanel symbol={p.symbol} quote={p.quote} address={p.address} priceInQuote={p.priceInQuote} feeBps={p.feeBps} /></div>
      </div>
    </Page>
  );
}

function TradePanel({ symbol, quote, address, priceInQuote, feeBps }: { symbol: string; quote: string; address: Address; priceInQuote: number; feeBps: number }) {
  const { isConnected } = useAccount();
  const { openConnect, say } = useApp();
  const { buy, sell } = useBlessedActions();
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amt, setAmt] = useState('');
  const [slip, setSlip] = useState(1);
  const [busy, setBusy] = useState(false);
  const n = Number(amt) || 0;
  // TODO(backend): replace this estimate with launchpad.quoteBuy / quoteSell reads.
  const out = side === 'buy' ? (n * (1 - feeBps / 10000)) / Math.max(priceInQuote, 1e-18) : n * priceInQuote * (1 - feeBps / 10000);
  const go = async () => {
    if (!isConnected) return openConnect();
    setBusy(true);
    try {
      const minOut = out * (1 - slip / 100);
      const tx = side === 'buy' ? await buy(address, n, minOut) : await sell(address, n, minOut);
      say(`${side === 'buy' ? 'Bought' : 'Sold'} $${symbol} · ${String(tx).slice(0, 10)}…`); setAmt('');
    } catch (e) { say((e as Error).message.split('\n')[0]); } finally { setBusy(false); }
  };
  return (
    <div className="box">
      <div className="seg full trade"><button className={side === 'buy' ? 'on' : ''} onClick={() => setSide('buy')}>Buy</button><button className={side === 'sell' ? 'on' : ''} onClick={() => setSide('sell')}>Sell</button></div>
      <div className="amount" style={{ marginTop: 12 }}>
        <div className="top"><span>you pay</span><span>balance —</span></div>
        <div className="mid"><input inputMode="decimal" placeholder="0" value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^0-9.]/g, ''))} aria-label="Amount" /><span className="tk">{side === 'buy' ? quote : symbol}</span></div>
        <div className="presets">{(side === 'buy' ? ['0.1', '0.5', '1', '5'] : ['25%', '50%', '75%', 'max']).map((v) => <button key={v} onClick={() => !v.endsWith('%') && v !== 'max' && setAmt(v)}>{v}</button>)}</div>
      </div>
      <div style={{ marginTop: 12 }}>
        <div className="kv"><span>You get (est.)</span><span>{num(out)} {side === 'buy' ? symbol : quote}</span></div>
        <div className="kv"><span>Fee</span><span>{bpsToPct(feeBps)}</span></div>
        <div className="kv"><span>Slippage</span><span>{[0.5, 1, 3].map((s) => <button key={s} className={`chip-btn${slip === s ? ' on' : ''}`} style={{ height: 22, marginLeft: 4 }} onClick={() => setSlip(s)}>{s}%</button>)}</span></div>
      </div>
      <button className={`btn block ${side}`} style={{ marginTop: 14 }} disabled={busy || (isConnected && !n)} onClick={go}>
        {busy ? 'Confirm in wallet…' : !isConnected ? 'Connect wallet' : side === 'buy' ? `Buy $${symbol}` : `Sell $${symbol}`}
      </button>
      {IS_DEMO && <p className="hint">Demo mode: trades are simulated.</p>}
    </div>
  );
}

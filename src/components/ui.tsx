'use client';
import Link from 'next/link';
import type { Candle, Pair } from '@/lib/types';
import { bpsToPct, pct, usd } from '@/lib/format';
import { Congregation } from './Congregation';
import { useApp } from './AppContext';

/** App pages: a faint congregation behind a scrolling column. */
export function Page({ children, narrow }: { children: React.ReactNode; narrow?: boolean }) {
  const { paused } = useApp();
  return (
    <>
      <Congregation paused={paused} className="page-sea" />
      <div className="scroll"><div className={`page${narrow ? ' narrow' : ''}`}>{children}</div></div>
    </>
  );
}

export function PageHead({ eyebrow, title, lede, right }: { eyebrow?: string; title: React.ReactNode; lede?: string; right?: React.ReactNode }) {
  return (
    <div className="page-head">
      <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{lede && <p>{lede}</p>}</div>
      {right}
    </div>
  );
}

export function Tok({ p, size }: { p: { symbol: string; image?: string }; size?: 'lg' }) {
  const violet = p.symbol.charCodeAt(0) % 2 === 1;
  return <span className={`tok${violet ? ' v' : ''}${size ? ` ${size}` : ''}`}>{p.image ? <img src={p.image} alt="" /> : p.symbol.slice(0, 1)}</span>;
}

export function Curve({ p }: { p: Pick<Pair, 'curveProgress' | 'status'> }) {
  return <div className={`curve${p.status === 'listed' ? ' done' : ''}`} title={`${(p.curveProgress * 100).toFixed(1)}% of the curve sold`}><i style={{ width: `${Math.min(100, p.curveProgress * 100)}%` }} /></div>;
}

export function PairCard({ p }: { p: Pair }) {
  return (
    <Link href={`/pairs/${p.address}`} className="pcard">
      <div className="pcard-top">
        <Tok p={p} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3>{p.name}</h3>
          <span className="sym">${p.symbol}</span> <span className="badge q">/{p.quote}</span>{' '}
          {p.status === 'listed' && <span className="badge ok">elysium</span>}
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <div className="kv"><span>Market cap</span><span>{usd(p.mcapUsd)}</span></div>
        <div className="kv"><span>24h</span><span className={p.change24h >= 0 ? 'up' : 'down'}>{pct(p.change24h)}</span></div>
        <div className="kv"><span>Fee</span><span>{bpsToPct(p.feeBps)}</span></div>
      </div>
      <Curve p={p} />
    </Link>
  );
}

export function Skel({ h = 18, w = '100%' }: { h?: number; w?: number | string }) {
  return <div className="sk" style={{ height: h, width: w }} />;
}

/** Minimal SVG price chart (line + area). TODO(backend): swap for TradingView / lightweight-charts if wanted. */
export function PriceChart({ candles }: { candles: Candle[] }) {
  if (!candles.length) return <div className="chart sk" />;
  const W = 800, H = 300, pad = 8;
  const lo = Math.min(...candles.map((c) => c.l)), hi = Math.max(...candles.map((c) => c.h));
  const x = (i: number) => pad + (i / (candles.length - 1)) * (W - pad * 2);
  const y = (v: number) => pad + (1 - (v - lo) / (hi - lo || 1)) * (H - pad * 2);
  const line = candles.map((c, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(c.c).toFixed(1)}`).join(' ');
  const up = candles[candles.length - 1].c >= candles[0].c;
  const col = up ? '#5BE3A6' : '#FF5C7A';
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Price chart">
      <defs><linearGradient id="pc" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={col} stopOpacity=".22" /><stop offset="1" stopColor={col} stopOpacity="0" /></linearGradient></defs>
      {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="rgba(255,255,255,.05)" />)}
      <path d={`${line} L${x(candles.length - 1)} ${H} L${x(0)} ${H}Z`} fill="url(#pc)" />
      <path d={line} fill="none" stroke={col} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

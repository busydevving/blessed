'use client';
import { useEffect, useRef, useState } from 'react';

export const HEADLINES: { lead: string; accent: string; tail?: string }[] = [
  { lead: 'every meme, blessed by a ', accent: 'stock' },
  { lead: 'price your meme in ', accent: 'NVDA' },
  { lead: 'what are we ', accent: 'blessing', tail: ' tonight?' },
  { lead: 'every address starts ', accent: '0xb1e55ed' },
  { lead: 'ascend to the isle of the ', accent: 'blessed' },
  { lead: 'liquidity locked ', accent: 'forever' },
  { lead: 'launch for a ', accent: 'tithe', tail: ' of 0.01 HYPE' },
];
type H = (typeof HEADLINES)[number];
const words = (h: H) => [
  ...h.lead.trim().split(' ').map((w) => ({ w, a: false })),
  { w: h.accent, a: true },
  ...(h.tail ? h.tail.trim().split(' ').map((w) => ({ w, a: false })) : []),
];

function Line({ h, out }: { h: H; out?: boolean }) {
  return (
    <span className="hl-line" data-out={out || undefined}>
      {words(h).map((x, i) => (
        <span key={i}>{i > 0 && ' '}<span className={`hl-word${x.a ? ' hl-accent' : ''}`} style={{ ['--i' as string]: i }}>{x.w}</span></span>
      ))}
    </span>
  );
}

/** Rotates every 4.8 s: the old line blurs out word by word as the next blurs in. */
export function Headline({ paused }: { paused: boolean }) {
  const [cur, setCur] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [turn, setTurn] = useState(0);
  const curRef = useRef(0);
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      const next = (curRef.current + 1) % HEADLINES.length;
      setPrev(curRef.current); curRef.current = next; setCur(next); setTurn((t) => t + 1);
    }, 4800);
    return () => window.clearInterval(id);
  }, [paused]);
  useEffect(() => {
    if (prev === null) return;
    const id = window.setTimeout(() => setPrev(null), 900);
    return () => window.clearTimeout(id);
  }, [prev, turn]);
  const h = HEADLINES[cur];
  return (
    <h1 className="hl">
      <span className="sr-only">{h.lead + h.accent + (h.tail ?? '')}</span>
      <span aria-hidden className="hl-stack">
        {prev !== null && <Line key={`o${turn}`} h={HEADLINES[prev]} out />}
        <Line key={`i${turn}`} h={h} />
      </span>
    </h1>
  );
}

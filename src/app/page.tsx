'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Congregation, type CongregationHandle } from '@/components/Congregation';
import { Headline } from '@/components/Headline';
import { Icon } from '@/components/icons';
import { useApp } from '@/components/AppContext';
import { useQuotes, useStats } from '@/hooks/useData';
import { FEE_MAX_BPS, FEE_MIN_BPS } from '@/lib/constants';
import { parseMeme } from '@/lib/format';

const CHIPS: { label: string; fill?: string; href?: string }[] = [
  { label: '/launch on NVDA', fill: 'Amen $AMEN' },
  { label: '/trending pairs', href: '/pairs' },
  { label: '/claim earnings', href: '/earnings' },
  { label: '/bridge to Elysium', href: '/bridge' },
];

function greeting() {
  const h = new Date().getHours();
  return h >= 5 && h < 12 ? 'Good morning' : h >= 12 && h < 18 ? 'Good afternoon' : 'Good evening';
}

/** The launch home: greeting, rotating headline, the launch card and chips, circled by the congregation. */
export default function Home() {
  const router = useRouter();
  const { paused } = useApp();
  const sea = useRef<CongregationHandle>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const greetRef = useRef<HTMLParagraphElement>(null);
  const cardRef = useRef<HTMLFormElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState('');
  const [quote, setQuote] = useState('NVDA');
  const [fee, setFee] = useState(100);
  const [shield, setShield] = useState(true);
  const [pop, setPop] = useState<'quote' | 'fee' | null>(null);
  const [hello, setHello] = useState('Welcome');
  const { data: quotes } = useQuotes();
  const { data: stats } = useStats();

  useEffect(() => setHello(greeting()), []);

  // Tell the congregation where the centre block sits (greeting → chips) so it circles it, never crosses it.
  useEffect(() => {
    const main = mainRef.current!;
    const measure = () => {
      const m = main.getBoundingClientRect();
      if (!m.width || !m.height) return;
      const g = greetRef.current!.getBoundingClientRect(), c = cardRef.current!.getBoundingClientRect(), k = chipsRef.current!.getBoundingClientRect();
      const left = Math.min(c.left, k.left), right = Math.max(c.right, k.right);
      sea.current?.setFocus(((left + right) / 2 - m.left) / m.width, ((g.top + k.bottom) / 2 - m.top) / m.height, (right - left) / 2 / m.width, (k.bottom - g.top) / 2 / m.height);
    };
    const ro = new ResizeObserver(measure);
    [main, greetRef.current!, cardRef.current!, chipsRef.current!].forEach((el) => ro.observe(el));
    measure();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target as HTMLElement).closest?.('input, textarea')) { e.preventDefault(); fieldRef.current?.focus(); }
    };
    const onDown = (e: globalThis.PointerEvent) => { if (!(e.target as HTMLElement).closest?.('[data-pop]')) setPop(null); };
    document.addEventListener('keydown', onKey); document.addEventListener('pointerdown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown); };
  }, []);

  const go = () => {
    const t = text.trim();
    if (!t) return fieldRef.current?.focus();
    const { name, symbol } = parseMeme(t);
    sea.current?.bless();
    const qs = new URLSearchParams({ name, symbol, quote, fee: String(fee), snipe: shield ? '1' : '0' });
    window.setTimeout(() => router.push(`/launch?${qs}`), 650);
  };
  const fill = (s: string) => { setText(s); sea.current?.nudge(); requestAnimationFrame(() => { const f = fieldRef.current; if (f) { f.focus(); f.setSelectionRange(s.length, s.length); } }); };
  const onMove = (e: PointerEvent) => {
    const r = mainRef.current!.getBoundingClientRect();
    if (e.pointerType === 'mouse' || e.buttons) sea.current?.setPointer((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
  };

  return (
    <div ref={mainRef} style={{ position: 'absolute', inset: 0 }} onPointerMove={onMove} onPointerLeave={() => sea.current?.clearPointer()}>
      <Congregation ref={sea} paused={paused} />
      <div className="vignette" aria-hidden />
      <div className="center">
        <p ref={greetRef} className="greet"><span className="greet-dot" />{hello}, anon{stats ? ` · ${stats.pairs} pairs blessed` : ''}</p>
        <Headline paused={paused} />
        <form ref={cardRef} className="card" onSubmit={(e) => { e.preventDefault(); go(); }}>
          <label htmlFor="launch-field" className="sr-only">Name your meme</label>
          <textarea id="launch-field" ref={fieldRef} className="field" rows={2} value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); go(); } else if (e.key.length === 1 || e.key === 'Backspace') sea.current?.nudge(); }}
            placeholder="Name your meme and its ticker… e.g. Amen $AMEN" />
          <div className="bar">
            <button type="button" className="tool" aria-label="Add an image on the launch page" title="Add an image" onClick={go}><Icon name="plus" /></button>
            <div style={{ position: 'relative' }} data-pop>
              <button type="button" className="sel" aria-haspopup="menu" aria-expanded={pop === 'quote'} onClick={() => setPop((p) => (p === 'quote' ? null : 'quote'))}>
                <span className="lbl">priced in</span><b>{quote}</b><Icon name="chevron" width={13} height={13} style={{ opacity: 0.6 }} />
              </button>
              {pop === 'quote' && (
                <div className="panel quotes-pop" role="menu">
                  <p className="panel-label">price your meme in</p>
                  {(quotes ?? []).map((q) => (
                    <button key={q.symbol} type="button" className="opt" role="menuitemradio" aria-checked={quote === q.symbol}
                      onClick={() => { setQuote(q.symbol); setPop(null); sea.current?.nudge(); }}>
                      <span><b>{q.symbol}</b><small>{q.name} · {q.kind}</small></span>
                      {quote === q.symbol && <span style={{ color: 'var(--amber)' }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{ position: 'relative' }} data-pop>
              <button type="button" className="sel" aria-expanded={pop === 'fee'} onClick={() => setPop((p) => (p === 'fee' ? null : 'fee'))}><span className="lbl">fee</span><b>{fee / 100}%</b></button>
              {pop === 'fee' && (
                <div className="panel fee-pop" role="dialog" aria-label="Trading fee">
                  <div className="fee-row"><b>{fee / 100}%</b><span>set once, forever</span></div>
                  <input type="range" min={FEE_MIN_BPS} max={FEE_MAX_BPS} step={25} value={fee} onChange={(e) => setFee(+e.target.value)} aria-label="Trading fee" />
                  <p style={{ marginTop: 8, fontSize: 12, color: 'var(--faint)' }}>80% of every fee goes to you.</p>
                </div>
              )}
            </div>
            <button type="button" className="tool" aria-pressed={shield} aria-label="Anti-snipe protection" title={shield ? 'Anti-snipe on' : 'Anti-snipe off'} onClick={() => setShield((s) => !s)}><Icon name="shield" /></button>
            <span className="hints"><span>↵ launch</span><span aria-hidden>·</span><span>⇧↵ new line</span></span>
            <button type="submit" className="send" data-ready={text.trim() ? '' : undefined} aria-label="Launch"><Icon name="arrow" width={16} height={16} /></button>
          </div>
        </form>
        <div ref={chipsRef} className="chips">
          {CHIPS.map((c) => (
            <button key={c.label} type="button" className="chip" onClick={() => (c.fill ? fill(c.fill) : router.push(c.href!))}>{c.label}</button>
          ))}
        </div>
      </div>
      <p className="foot">0.01 HYPE to launch · liquidity locked forever · every address starts <span style={{ color: 'var(--amber-2)' }}>0xb1e55ed</span><br />
        <span style={{ opacity: 0.7 }}>🙏 hands drawn from <a href="https://github.com/jdecked/twemoji" target="_blank" rel="noreferrer">Twemoji</a>, CC-BY 4.0</span></p>
    </div>
  );
}

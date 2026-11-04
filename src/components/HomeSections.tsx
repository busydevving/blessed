'use client';
import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useStats } from '@/hooks/useData';
import { num, usd } from '@/lib/format';
import { SITE } from '@/lib/constants';
import { Mark } from './icons';
import { useApp } from './AppContext';

/** Fades/blur-ins children when they scroll into view inside the home scroller. */
function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }: { as?: any; className?: string; delay?: number; children: ReactNode; [k: string]: any }) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setIn] = useState(false);
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIn(true); io.disconnect(); } }, { root: document.getElementById('scroller'), threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={`reveal${inView ? ' in' : ''} ${className}`} style={{ transitionDelay: `${delay}s` }} {...rest}>{children}</Tag>;
}

const STOCKS = ['NVDA', 'TSLA', 'AAPL', 'SPY', 'QQQ', 'MSTR', 'COIN', 'HOOD', 'META', 'HYPE'];
const USES: [string, string, string, number][] = [
  ['buyback & burn', 'buys back and burns $BLESSED.', '#FFB547', 30],
  ['liquidity', 'seeds new pools and deepens stock markets on elysium.', '#FF5C7A', 25],
  ['stocks on elysium', 'brings more tokenized stocks and their markets to elysium.', '#8B7CFF', 20],
  ['new markets', 'deploys the next markets on blessed.', '#5BE3A6', 15],
  ['vaults', 'builds the vaults product: shares backed by hyperliquid perps.', '#B4AAFF', 10],
];
const CMDS: [string, string, string][] = [
  ['one supply', '1,000,000,000', 'fixed at creation. nothing is minted after.'],
  ['no team tokens', '0', 'nobody gets an allocation, the creator included.'],
  ['the curve is the way', '793.1M', '79.31% of supply sells on the bonding curve on hyperevm.'],
  ['unsold tokens burn', 'burned', 'at listing the raise and its matching tokens seed the pools; everything else burns.'],
  ['liquidity is locked', 'forever', 'both pools on elysium. the launchpad can only add to them.'],
  ['the fee is set in stone', '0.25–5%', 'chosen once by the creator. it never changes.'],
  ['snipers are taxed', '≤ 90%', 'the launch fee falls to the trading fee within 10 minutes, and runs again at listing.'],
  ['holders are rewarded', '30 min', 'paid in the quote asset to wallets with ≥ 0.05% of supply.'],
  ['every change waits', '4 hours', 'every contract change sits in public for four hours first.'],
  ['every address is blessed', '0xb1e55ed', 'every token is created at an address with the blessed prefix.'],
];
const ROMAN = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
const FINAL_ADDR = '3c9a07f41d2e8b65a0c7f19d4e2a6b8c0';

function Ring() {
  let a0 = -90;
  const pt = (a: number, r: number) => [100 + Math.cos((a * Math.PI) / 180) * r, 100 + Math.sin((a * Math.PI) / 180) * r];
  const paths = USES.map(([t, , c, p]) => {
    const a1 = a0 + p * 3.6 - 1.6;
    const [x1, y1] = pt(a0, 86), [x2, y2] = pt(a1, 86), [x3, y3] = pt(a1, 68), [x4, y4] = pt(a0, 68);
    a0 += p * 3.6;
    return <path key={t} d={`M${x1} ${y1} A86 86 0 0 1 ${x2} ${y2} L${x3} ${y3} A68 68 0 0 0 ${x4} ${y4}Z`} fill={c} opacity={0.9} />;
  });
  return <svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="96" fill="none" stroke="rgba(255,255,255,.05)" />{paths}</svg>;
}

function Address() {
  const ref = useRef<HTMLDivElement>(null);
  const [mid, setMid] = useState(FINAL_ADDR);
  useEffect(() => {
    let id = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      let n = 0;
      id = window.setInterval(() => {
        n++;
        const keep = Math.floor((n / 24) * 33);
        setMid(FINAL_ADDR.slice(0, keep) + Array.from({ length: 33 - keep }, () => '0123456789abcdef'[(Math.random() * 16) | 0]).join(''));
        if (n >= 24) { window.clearInterval(id); setMid(FINAL_ADDR); }
      }, 50);
    }, { root: document.getElementById('scroller'), threshold: 0.5 });
    io.observe(ref.current!);
    return () => { io.disconnect(); window.clearInterval(id); };
  }, []);
  return (
    <div ref={ref}>
      <p className="addr-line"><span className="dim">0x</span><b>b1e55ed</b><span>{mid}</span></p>
    </div>
  );
}

/** Everything below the hero on the home page. */
export function HomeSections({ onLaunch }: { onLaunch: () => void }) {
  const { data: s } = useStats();
  const { paused } = useApp();
  const [chip, setChip] = useState(0);
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setChip((c) => c + 1), 1600);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <>
      <Reveal as="section" className="sec" aria-label="numbers">
        <div className="statrow">
          <div className="stat"><b>{s ? s.pairs : 0}</b><small>pairs blessed</small></div>
          <div className="stat"><b>{usd(s?.volumeAllUsd ?? 0)}</b><small>all-time volume</small></div>
          <div className="stat"><b>{usd(s?.volume24hUsd ?? 0)}</b><small>24h volume</small></div>
          <div className="stat"><b>{s ? s.listed : 0}</b><small>ascended to elysium</small></div>
          <div className="stat"><b>{usd(s?.creatorEarningsUsd ?? 0)}</b><small>earned by creators</small></div>
        </div>
        <div className="tithe">
          <span className="tithe-mark"><Mark size={40} /></span>
          <div><p className="eyebrow">$BLESSED</p><p className="tithe-line">every pair tithes. its fees buy $BLESSED back and burn it.{s ? <span className="keep" style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)', fontWeight: 400, letterSpacing: 0, marginTop: 6 }}>{num(s.blessedBurned)} burned so far</span> : null}</p></div>
          <Link className="btn-amber" href="/swap">buy $BLESSED</Link>
        </div>
      </Reveal>

      <section className="sec" id="how">
        <Reveal className="sec-head"><p className="eyebrow">how it works</p><h2>three steps to <span className="grad">grace.</span></h2><p>pick what your meme answers to, set your rules once, and let the curve carry it up.</p></Reveal>
        <div className="steps">
          <Reveal className="step"><span className="n">01</span><h3>choose your stock</h3><p>your token is priced in it, not in dollars. when the stock moves, your meme moves with it.</p>
            <div className="viz"><div className="vchips">{STOCKS.map((t, i) => <span key={t} className={i === chip % STOCKS.length ? 'on' : ''}>{t}</span>)}</div></div></Reveal>
          <Reveal className="step" delay={0.08}><span className="n">02</span><h3>launch the pair</h3><p>set the fee, the rewards and the launch protection. then the bonding curve takes over.</p>
            <div className="viz"><div className="vpair"><b>AMEN<span>/NVDA</span></b><span className="vpct">79.31%</span></div><div className="vcurve"><i /></div><div className="vrow"><span>fee 0.25–5%</span><span>anti-snipe ≤ 90%</span></div></div></Reveal>
          <Reveal className="step" delay={0.16}><span className="n">03</span><h3>ascend to elysium</h3><p>at the threshold, the raise seeds locked pools on elysium. nobody can pull them, ever.</p>
            <div className="viz"><div className="vpools"><div><small>pool a · locked</small><b>AMEN/NVDA</b></div><div><small>pool b · locked</small><b>AMEN/HYPE</b></div></div></div></Reveal>
        </div>
      </section>

      <section className="sec" id="address">
        <Reveal className="addr">
          <p className="eyebrow">signed at birth</p>
          <h2>every address is <span className="grad">blessed.</span></h2>
          <Address />
          <div className="decode"><span><b>b1</b>bl</span><span><b>e55</b>ess</span><span><b>ed</b>ed</span></div>
          <p className="addr-note">every token is minted at an address that starts with <code>b1e55ed</code>, the same on hyperevm and on elysium. the launchpad checks it before anything trades. no prefix, no blessing.</p>
        </Reveal>
      </section>

      <section className="sec" id="offerings">
        <Reveal className="sec-head"><p className="eyebrow">the offerings</p><h2>what your meme <span className="grad">answers to.</span></h2></Reveal>
        <div className="offer-grid">
          <Reveal className="offer big"><small>tokenized stocks</small><h3>xstocks</h3><p>real stocks, tokenized and bridged in from hyperliquid.</p><div className="vchips">{['NVDA', 'TSLA', 'AAPL', 'MSFT', 'META', 'GOOGL', 'AMZN', 'SPY', 'QQQ'].map((t) => <span key={t}>{t}</span>)}</div></Reveal>
          <Reveal className="offer"><small>more stocks</small><h3>eqx</h3><p>seven more stocks, bridged in from hyperliquid.</p><div className="vchips">{['MU', 'SKHY', 'COIN', 'HOOD'].map((t) => <span key={t}>{t}</span>)}</div></Reveal>
          <Reveal className="offer"><small>3× shares</small><h3>leveraged</h3><p>3× shares backed by hyperliquid perps: hype long, stocks long or short. qqq and the s&amp;p 500 next.</p><div className="vchips">{['HYPE3L', 'NVDA3L', 'NVDA3S'].map((t) => <span key={t}>{t}</span>)}</div></Reveal>
          <Reveal className="offer"><small>native</small><h3>house of finance</h3><p>hyperliquid&apos;s own assets, for memes that stay close to home.</p><div className="vchips">{['HYPE', 'USDH'].map((t) => <span key={t}>{t}</span>)}</div></Reveal>
        </div>
      </section>

      <section className="sec" id="creators">
        <Reveal className="sec-head"><p className="eyebrow">built for creators</p><h2>the faithful <span className="grad">get paid.</span></h2></Reveal>
        <Reveal className="numgrid">
          <div><b>80%</b><h4>of every fee, to you</h4><p>33% of the creator share buys back and burns $BLESSED.</p></div>
          <div><b>0.25–5%</b><h4>trading fee</h4><p>your call, chosen once at launch. it never changes.</p></div>
          <div><b>≤ 90%</b><h4>anti-snipe fee</h4><p>at launch and again at listing, falling within 10 minutes.</p></div>
          <div><b>0.01</b><h4>hype to launch</h4><p>no listing fee. ever.</p></div>
        </Reveal>
      </section>

      <section className="sec" id="treasury">
        <div className="plate">
          <Reveal className="ring"><Ring /><div className="ring-mid"><b>4h</b><small>timelock</small></div></Reveal>
          <div>
            <Reveal className="sec-head" style={{ marginBottom: 22 }}><p className="eyebrow">the collection plate</p><h2>where the <span className="grad">tithe</span> goes.</h2><p>the protocol&apos;s share of trading fees goes to the treasury, sits behind a four-hour public timelock, then goes back into the markets.</p></Reveal>
            <Reveal as="ul" className="uses">{USES.map(([t, d, c]) => <li key={t}><i style={{ background: c }} /><div><b>{t}</b><p>{d}</p></div></li>)}</Reveal>
          </div>
        </div>
      </section>

      <section className="sec" id="rules">
        <Reveal className="sec-head"><p className="eyebrow">on every pair</p><h2>the ten <span className="grad">commandments.</span></h2><p>the same rules for every token, written in the contracts. any holder can check each one.</p></Reveal>
        <ol className="cmds">
          {CMDS.map(([h, v, p], i) => (
            <Reveal as="li" key={h} delay={(i % 2) * 0.06}><span className="r">{ROMAN[i]}.</span><h4>{h}</h4><span className="val">{v}</span><p>{p}</p></Reveal>
          ))}
        </ol>
      </section>

      <section className="sec" id="scripture">
        <Reveal className="sec-head"><p className="eyebrow">scripture</p><h2>read the <span className="grad">docs.</span></h2></Reveal>
        <Reveal className="doclinks">
          <Link href="/docs#pairs"><b>pairs</b><span>curve, listing, locked pools</span></Link>
          <Link href="/docs#fees"><b>rewards</b><span>stakers, holders, burn, floor</span></Link>
          <Link href="/offerings"><b>offerings</b><span>stocks, 3× shares, hype</span></Link>
          <Link href="/docs#safety"><b>safety</b><span>timelock, locked liquidity</span></Link>
        </Reveal>
      </section>

      <Reveal as="section" className="final">
        <Mark size={64} />
        <h2>bless your first <span className="grad">meme.</span></h2>
        <p>0.01 hype. liquidity locked forever. every address starts <code>0xb1e55ed</code>.</p>
        <button className="btn-amber" type="button" onClick={onLaunch}>launch a token 🙏</button>
      </Reveal>

      <footer className="site-foot">
        <div className="foot-grid">
          <div><span className="foot-brand"><Mark size={22} />blessed<i>.</i></span><p>every meme, blessed by a stock.</p><p className="mono-s">{SITE.domain}</p></div>
          <div><h5>product</h5><Link href="/pairs">pairs</Link><Link href="/launch">launch</Link><Link href="/swap">swap</Link><Link href="/offerings">offerings</Link><Link href="/stats">stats</Link><Link href="/docs">docs</Link></div>
          <div><h5>legal</h5><Link href="/terms">terms</Link><Link href="/privacy">privacy</Link><Link href="/risks">risks</Link></div>
          <div><h5>community</h5><a href={SITE.x} target="_blank" rel="noreferrer">x · {SITE.xHandle}</a></div>
        </div>
        <div className="fine">
          <span>not offered in the united states, the united kingdom or canada. if you use it from there, you do so at your own risk.</span>
          <span>trading digital assets carries a high risk of losing all the capital you commit.</span>
          <span>🙏 hands from <a href="https://github.com/jdecked/twemoji" target="_blank" rel="noreferrer">twemoji</a>, cc-by 4.0.</span>
        </div>
      </footer>
    </>
  );
}

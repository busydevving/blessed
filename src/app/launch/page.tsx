'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { Page, PageHead, Tok } from '@/components/ui';
import { useApp } from '@/components/AppContext';
import { useQuotes } from '@/hooks/useData';
import { useBlessedActions } from '@/hooks/useBlessedActions';
import { ANTI_SNIPE_MAX_BPS, FEE_MAX_BPS, FEE_MIN_BPS, LAUNCH_COST_HYPE } from '@/lib/constants';
import { bpsToPct, short } from '@/lib/format';
import { IS_DEMO } from '@/lib/api';
import type { Address } from '@/lib/types';

export default function LaunchPage() {
  return <Suspense><LaunchForm /></Suspense>;
}

function LaunchForm() {
  const sp = useSearchParams();
  const { isConnected } = useAccount();
  const { openConnect, say } = useApp();
  const { launchToken } = useBlessedActions();
  const { data: quotes } = useQuotes();

  const [name, setName] = useState(sp.get('name') ?? '');
  const [symbol, setSymbol] = useState(sp.get('symbol') ?? '');
  const [description, setDescription] = useState('');
  const [quote, setQuote] = useState(sp.get('quote') ?? 'NVDA');
  const [feeBps, setFeeBps] = useState(Number(sp.get('fee') ?? 100));
  const [snipe, setSnipe] = useState(sp.get('snipe') === '0' ? 0 : 5000);
  const [holderRewards, setHolderRewards] = useState(true);
  const [initialBuy, setInitialBuy] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [x, setX] = useState(''); const [tg, setTg] = useState(''); const [web, setWeb] = useState('');
  const [step, setStep] = useState<string | null>(null);
  const [done, setDone] = useState<{ tx: string; token: Address } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const preview = useMemo(() => (image ? URL.createObjectURL(image) : undefined), [image]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const valid = name.trim().length > 0 && /^[A-Z0-9]{1,10}$/.test(symbol);
  const submit = async () => {
    if (!isConnected) return openConnect();
    setErr(null); setDone(null);
    try {
      const q = quotes?.find((x) => x.symbol === quote);
      const res = await launchToken({ name: name.trim(), symbol, description, imageFile: image, quote, feeBps, antiSnipeBps: snipe, holderRewards, initialBuyHype: Number(initialBuy) || 0, socials: { x, telegram: tg, website: web } }, q?.address, setStep);
      setDone(res); say(`$${symbol} is blessed 🙏`);
    } catch (e) {
      setErr((e as Error).message.split('\n')[0]);
    } finally { setStep(null); }
  };

  return (
    <Page>
      <PageHead eyebrow="launch" title={<>Bless a <span className="grad">meme</span></>} lede="Name it, price it in a stock, set the rules once. It lists on Elysium with liquidity locked forever." />
      <div className="two-col">
        <div className="box">
          <div className="row2">
            <div className="field-row"><label className="label" htmlFor="n">name</label><input id="n" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Amen" maxLength={32} /></div>
            <div className="field-row"><label className="label" htmlFor="s">ticker</label><input id="s" className="input" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))} placeholder="AMEN" /></div>
          </div>
          <div className="field-row"><label className="label" htmlFor="d">description</label><textarea id="d" className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is it, and why should anyone pray for it?" maxLength={280} /></div>
          <div className="field-row">
            <span className="label">image</span>
            <label className="drop">
              <input type="file" accept="image/*" hidden onChange={(e) => setImage(e.target.files?.[0] ?? null)} />
              {preview ? <img src={preview} alt="" /> : <span>Drop an image or click to choose · png, jpg, gif · square works best</span>}
            </label>
          </div>
          <div className="field-row">
            <span className="label">priced in</span>
            <div className="qgrid">
              {(quotes ?? []).map((q) => (
                <button key={q.symbol} type="button" className={`qopt${quote === q.symbol ? ' on' : ''}`} onClick={() => setQuote(q.symbol)}><b>{q.symbol}</b><small>{q.name}</small></button>
              ))}
            </div>
            <p className="hint">Your token is priced in this asset, not in dollars.</p>
          </div>
          <div className="field-row">
            <div className="range-head"><span className="label">trading fee</span><b>{bpsToPct(feeBps)}</b></div>
            <input className="range" type="range" min={FEE_MIN_BPS} max={FEE_MAX_BPS} step={25} value={feeBps} onChange={(e) => setFeeBps(+e.target.value)} />
            <p className="hint">Fixed forever at launch. 80% of every fee goes to you; 33% of that buys back and burns $BLESSED.</p>
          </div>
          <div className="field-row">
            <div className="range-head"><span className="label">anti-snipe fee at launch</span><b>{bpsToPct(snipe)}</b></div>
            <input className="range" type="range" min={0} max={ANTI_SNIPE_MAX_BPS} step={500} value={snipe} onChange={(e) => setSnipe(+e.target.value)} />
            <p className="hint">Falls to the trading fee within 10 minutes. Runs again when the pair lists.</p>
          </div>
          <div className="field-row"><label className="switch"><input type="checkbox" checked={holderRewards} onChange={(e) => setHolderRewards(e.target.checked)} />Pay holders every 30 minutes (wallets with ≥ 0.05% of supply)</label></div>
          <div className="row2">
            <div className="field-row"><label className="label" htmlFor="ib">first buy (HYPE, optional)</label><input id="ib" className="input" inputMode="decimal" value={initialBuy} onChange={(e) => setInitialBuy(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="0" /></div>
            <div className="field-row"><label className="label" htmlFor="x">x / twitter</label><input id="x" className="input" value={x} onChange={(e) => setX(e.target.value)} placeholder="https://x.com/…" /></div>
          </div>
          <div className="row2">
            <div className="field-row"><label className="label" htmlFor="tg">telegram</label><input id="tg" className="input" value={tg} onChange={(e) => setTg(e.target.value)} placeholder="https://t.me/…" /></div>
            <div className="field-row"><label className="label" htmlFor="w">website</label><input id="w" className="input" value={web} onChange={(e) => setWeb(e.target.value)} placeholder="https://…" /></div>
          </div>
        </div>

        <div className="sticky" style={{ display: 'grid', gap: 12 }}>
          <div className="box">
            <p className="label">preview</p>
            <div className="pcard-top">
              <Tok p={{ symbol: symbol || '?', image: preview }} size="lg" />
              <div><h3 style={{ fontSize: 18, fontWeight: 600 }}>{name || 'Your meme'}</h3><span className="sym">${symbol || 'TICKER'}</span> <span className="badge q">/{quote}</span></div>
            </div>
            <div style={{ marginTop: 14 }}>
              <div className="kv"><span>Address</span><span className="addr-chip">0x<b>b1e55ed</b>…</span></div>
              <div className="kv"><span>Supply</span><span>1,000,000,000</span></div>
              <div className="kv"><span>On the curve</span><span>79.31%</span></div>
              <div className="kv"><span>Trading fee</span><span>{bpsToPct(feeBps)}</span></div>
              <div className="kv"><span>Anti-snipe</span><span>{bpsToPct(snipe)}</span></div>
              <div className="kv"><span>Holder rewards</span><span>{holderRewards ? 'every 30 min' : 'off'}</span></div>
              <div className="kv"><span>Cost</span><span>{LAUNCH_COST_HYPE + (Number(initialBuy) || 0)} HYPE</span></div>
            </div>
            <button type="button" className="btn primary block" style={{ marginTop: 16 }} disabled={!!step || (isConnected && !valid)} onClick={submit}>
              {step ?? (isConnected ? '🙏 Launch' : 'Connect wallet to launch')}
            </button>
            {IS_DEMO && <p className="hint">Demo mode: no contracts configured, so the launch is simulated.</p>}
            {err && <p className="status-line err">{err}</p>}
            {done && (
              <p className="status-line ok">Blessed at <span className="m">{short(done.token, 10, 6)}</span>. <Link href={`/pairs/${done.token}`} style={{ textDecoration: 'underline' }}>Open the pair →</Link></p>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}

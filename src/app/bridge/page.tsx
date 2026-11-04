'use client';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Page, PageHead } from '@/components/ui';
import { Icon } from '@/components/icons';
import { useApp } from '@/components/AppContext';
import { useBlessedActions } from '@/hooks/useBlessedActions';
import { getBridgeQuote, IS_DEMO } from '@/lib/api';
import { num } from '@/lib/format';

type Net = 'hyperevm' | 'elysium';
const NAME: Record<Net, string> = { hyperevm: 'HyperEVM', elysium: 'Elysium' };

/** Move HYPE, quote assets or memes between HyperEVM and Elysium. Same token address on both sides. */
export default function BridgePage() {
  const { isConnected } = useAccount();
  const { openConnect, say } = useApp();
  const { bridge } = useBlessedActions();
  const [from, setFrom] = useState<Net>('hyperevm');
  const [token, setToken] = useState('HYPE');
  const [amt, setAmt] = useState('');
  const [quote, setQuote] = useState<{ receive: number; feeUsd: number; etaSec: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const to: Net = from === 'hyperevm' ? 'elysium' : 'hyperevm';
  useEffect(() => {
    const n = Number(amt);
    if (!n) { setQuote(null); return; }
    let live = true;
    const id = setTimeout(() => getBridgeQuote({ from, to, token, amount: n }).then((q) => live && setQuote(q)).catch(() => {}), 250);
    return () => { live = false; clearTimeout(id); };
  }, [amt, from, to, token]);
  const go = async () => {
    if (!isConnected) return openConnect();
    setBusy(true);
    try { await bridge('0x0000000000000000000000000000000000000000', Number(amt), from); say(`Bridging ${amt} ${token} to ${NAME[to]}`); setAmt(''); }
    catch (e) { say((e as Error).message.split('\n')[0]); } finally { setBusy(false); }
  };
  return (
    <Page narrow>
      <PageHead eyebrow="bridge" title="Cross to Elysium" lede="Every Blessed token has the same 0xb1e55ed address on both chains." />
      <div className="box">
        <div className="amount"><div className="top"><span>from {NAME[from]}</span><span>balance —</span></div>
          <div className="mid"><input inputMode="decimal" placeholder="0" value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^0-9.]/g, ''))} aria-label="Amount" />
            <select className="tk" value={token} onChange={(e) => setToken(e.target.value)} aria-label="Token">{['HYPE', 'USDH', 'NVDA', 'TSLA', 'SPY'].map((s) => <option key={s}>{s}</option>)}</select></div></div>
        <button className="flip" aria-label="Switch direction" onClick={() => setFrom(to)}><Icon name="flip" width={16} height={16} /></button>
        <div className="amount"><div className="top"><span>to {NAME[to]}</span><span /></div>
          <div className="mid"><input readOnly placeholder="0" value={quote ? num(quote.receive, 6) : ''} aria-label="You receive" /><span className="tk">{token}</span></div></div>
        <div style={{ marginTop: 12 }}>
          <div className="kv"><span>Bridge fee</span><span>{quote ? `$${quote.feeUsd.toFixed(2)}` : '—'}</span></div>
          <div className="kv"><span>Arrives in</span><span>{quote ? `~${Math.round(quote.etaSec / 60) || 1} min` : '—'}</span></div>
        </div>
        <button className="btn primary block" style={{ marginTop: 14 }} disabled={busy || (isConnected && !Number(amt))} onClick={go}>{busy ? 'Confirm in wallet…' : isConnected ? `Bridge to ${NAME[to]}` : 'Connect wallet'}</button>
        {IS_DEMO && <p className="hint">Demo mode: quotes are mock and the bridge is simulated.</p>}
      </div>
    </Page>
  );
}

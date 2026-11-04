'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Page, PageHead } from '@/components/ui';
import { useApp } from '@/components/AppContext';
import { useCreatorEarnings, useHolderRewards } from '@/hooks/useData';
import { useBlessedActions } from '@/hooks/useBlessedActions';
import { num, usd } from '@/lib/format';

export default function EarningsPage() {
  const { address, isConnected } = useAccount();
  const { openConnect, say } = useApp();
  const { claimCreatorFees, claimHolderRewards } = useBlessedActions();
  const { data: creator } = useCreatorEarnings(address);
  const { data: holder } = useHolderRewards(address);
  const [busy, setBusy] = useState<string | null>(null);
  const run = async (k: string, f: () => Promise<unknown>, msg: string) => { setBusy(k); try { await f(); say(msg); } catch (e) { say((e as Error).message.split('\n')[0]); } finally { setBusy(null); } };

  if (!isConnected) return (
    <Page narrow>
      <PageHead eyebrow="earnings" title="The faithful get paid" lede="Creators keep 80% of every fee. Holders with ≥ 0.05% of a pair are paid every 30 minutes." />
      <div className="box empty"><p>Connect a wallet to see what you've earned.</p><button className="btn primary" style={{ marginTop: 14 }} onClick={openConnect}>Connect wallet</button></div>
    </Page>
  );

  const cTotal = (creator ?? []).reduce((a, c) => a + c.unclaimedUsd, 0);
  const hTotal = (holder ?? []).reduce((a, c) => a + c.pendingUsd, 0);
  return (
    <Page>
      <PageHead eyebrow="earnings" title="The faithful get paid" lede="Claim creator fees and holder rewards, paid in each pair's quote asset." />
      <div className="statgrid" style={{ marginBottom: 16 }}>
        <div className="s"><small>creator fees to claim</small><b>{usd(cTotal)}</b></div>
        <div className="s"><small>holder rewards to claim</small><b>{usd(hTotal)}</b></div>
        <div className="s"><small>lifetime creator earnings</small><b>{usd((creator ?? []).reduce((a, c) => a + c.lifetimeUsd, 0))}</b></div>
        <div className="s"><small>your launches</small><b>{creator?.length ?? 0}</b></div>
      </div>
      <div className="two-col">
        <div className="box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h2 className="title" style={{ margin: 0 }}>Creator fees</h2>
            <button className="btn primary sm" disabled={!creator?.length || !!busy} onClick={() => run('c', () => claimCreatorFees(creator!.map((c) => c.pair)), 'Creator fees claimed')}>{busy === 'c' ? 'Claiming…' : 'Claim all'}</button></div>
          {creator?.length ? (
            <table className="t" style={{ marginTop: 10 }}><thead><tr><th>pair</th><th>unclaimed</th><th>usd</th><th>lifetime</th></tr></thead>
              <tbody>{creator.map((c) => <tr key={c.pair}><td><Link href={`/pairs/${c.pair}`}>${c.symbol}<span className="faint">/{c.quote}</span></Link></td><td className="m">{num(c.unclaimedQuote, 4)} {c.quote}</td><td className="m">{usd(c.unclaimedUsd)}</td><td className="m">{usd(c.lifetimeUsd)}</td></tr>)}</tbody></table>
          ) : <p className="empty">No launches yet. <Link href="/" style={{ textDecoration: 'underline' }}>Bless one</Link>.</p>}
        </div>
        <div className="box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><h2 className="title" style={{ margin: 0 }}>Holder rewards</h2>
            <button className="btn ghost sm" disabled={!holder?.length || !!busy} onClick={() => run('h', () => claimHolderRewards(holder!.map((h) => h.pair)), 'Holder rewards claimed')}>{busy === 'h' ? 'Claiming…' : 'Claim'}</button></div>
          {holder?.length ? holder.map((h) => <div key={h.pair} className="kv"><span>${h.symbol}/{h.quote}</span><span>{num(h.pendingQuote, 4)} {h.quote} · {usd(h.pendingUsd)}</span></div>) : <p className="empty">Nothing pending.</p>}
        </div>
      </div>
    </Page>
  );
}

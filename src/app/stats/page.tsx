'use client';
import { Page, PageHead, PairCard, Skel } from '@/components/ui';
import { usePairs, useStats } from '@/hooks/useData';
import { num, usd } from '@/lib/format';

export default function StatsPage() {
  const { data: s } = useStats();
  const { data: top } = usePairs({ sort: 'volume' });
  return (
    <Page>
      <PageHead eyebrow="stats" title="The congregation, in numbers" />
      {!s ? <Skel h={90} /> : (
        <div className="statgrid">
          <div className="s"><small>pairs blessed</small><b>{s.pairs}</b></div>
          <div className="s"><small>all-time volume</small><b>{usd(s.volumeAllUsd)}</b></div>
          <div className="s"><small>24h volume</small><b>{usd(s.volume24hUsd)}</b></div>
          <div className="s"><small>listed on elysium</small><b>{s.listed}</b></div>
          <div className="s"><small>earned by creators</small><b>{usd(s.creatorEarningsUsd)}</b></div>
          <div className="s"><small>$BLESSED burned</small><b>{num(s.blessedBurned)}</b></div>
          <div className="s"><small>treasury</small><b>{usd(s.treasuryUsd)}</b></div>
          <div className="s"><small>timelock</small><b>4 hours</b></div>
        </div>
      )}
      <h2 className="h1" style={{ fontSize: 22, margin: '32px 0 14px' }}>Most volume, 24h</h2>
      <div className="grid-pairs">{(top ?? []).slice(0, 8).map((p) => <PairCard key={p.address} p={p} />)}</div>
    </Page>
  );
}

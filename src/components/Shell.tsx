'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { NAV, SHORTCUTS, SITE } from '@/lib/constants';
import { usePairs } from '@/hooks/useData';
import { pct, short } from '@/lib/format';
import { Icon, Mark } from './icons';
import { useApp } from './AppContext';
import { ConnectModal } from './ConnectModal';
import { TermsGate } from './TermsGate';

type Mode = 'full' | 'rail' | 'phone';
type Pop = 'search' | 'shortcuts' | null;

/**
 * The app frame on every route: sidebar + top bar. Layout follows the app's own width (not the viewport):
 * ≥ 960 full sidebar (collapsible with Ctrl B, remembered), 600–959 icon rail, < 600 phone drawer.
 */
export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { paused, setPaused, openConnect, say } = useApp();
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [width, setWidth] = useState(1200);
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [pop, setPop] = useState<Pop>(null);
  const [query, setQuery] = useState('');
  const { data: trending } = usePairs({ sort: 'trending' });

  useEffect(() => { try { setCollapsed(localStorage.getItem('blessed-sidebar') === 'collapsed'); } catch {} }, []);
  useLayoutEffect(() => {
    const el = rootRef.current!;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el); setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const roomy = width >= 960;
  const mode: Mode = width < 600 ? 'phone' : !roomy || collapsed ? 'rail' : 'full';
  const roomyRef = useRef(roomy); roomyRef.current = roomy;
  useEffect(() => { if (mode !== 'phone') setDrawer(false); }, [mode]);
  useEffect(() => { setDrawer(false); setPop(null); }, [pathname]);
  useEffect(() => { if (pop === 'search') { setQuery(''); requestAnimationFrame(() => searchRef.current?.focus()); } }, [pop]);

  const toggleSidebar = useCallback(() => {
    setCollapsed((c) => { try { localStorage.setItem('blessed-sidebar', c ? 'open' : 'collapsed'); } catch {} return !c; });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && k === 'k') { e.preventDefault(); setPop((p) => (p === 'search' ? null : 'search')); }
      else if ((e.ctrlKey || e.metaKey) && k === 'b') { e.preventDefault(); if (roomyRef.current) toggleSidebar(); }
      else if ((e.ctrlKey || e.metaKey) && k === 'l') { e.preventDefault(); router.push('/'); requestAnimationFrame(() => document.getElementById('launch-field')?.focus()); }
      else if (e.key === 'Escape') { setPop(null); setDrawer(false); }
    };
    const onDown = (e: PointerEvent) => { if (!(e.target as HTMLElement).closest?.('[data-pop]')) setPop(null); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown); };
  }, [toggleSidebar, router]);

  const activeId = NAV.find((n) => (n.href === '/' ? pathname === '/' || pathname.startsWith('/launch') : pathname.startsWith(n.href)))?.id;
  const q = query.trim().toLowerCase();
  const results = (trending ?? []).filter((p) => !q || `${p.name} ${p.symbol} ${p.quote} ${p.address}`.toLowerCase().includes(q)).slice(0, 8);

  return (
    <div ref={rootRef} className="app" data-mode={mode} data-roomy={roomy || undefined}>
      <aside className="side" data-open={drawer || undefined} aria-label="Sidebar">
        <div className="side-head">
          <button type="button" className="brand" onClick={() => (mode === 'rail' && roomy ? toggleSidebar() : router.push('/'))} aria-label={mode === 'rail' && roomy ? 'Expand sidebar' : 'blessed home'}>
            <span className="brand-icon"><Mark className="brand-mark" /><Icon name="sidebar" className="brand-expand" /></span>
            <span className="side-text brand-name">blessed<i>.</i></span>
          </button>
          {roomy && (
            <button type="button" className="side-toggle side-text" onClick={toggleSidebar} aria-label="Collapse sidebar" title="Collapse sidebar (Ctrl B)">
              <Icon name="sidebar" width={18} height={18} />
            </button>
          )}
        </div>

        <nav className="side-nav" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.id} href={n.href} className="side-item as-link" aria-current={activeId === n.id ? 'page' : undefined} title={mode === 'rail' ? n.label : undefined}>
              <Icon name={n.id} className="side-icon" />
              <span className="side-text">{n.label}</span>
              {'kbd' in n && n.kbd && <kbd className="side-kbd side-text">{n.kbd}</kbd>}
              {'soon' in n && n.soon && <span className="soon side-text">soon</span>}
            </Link>
          ))}
        </nav>

        <div className="side-recent">
          <p className="side-label">trending</p>
          <ul className="side-list">
            {(trending ?? []).slice(0, 6).map((p) => (
              <li key={p.address}>
                <Link href={`/pairs/${p.address}`} className="side-saved"><b>/{p.quote}</b>${p.symbol}
                  <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 10 }} className={p.change24h >= 0 ? 'up' : 'down'}>{pct(p.change24h)}</span></Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="side-foot">
          <button type="button" className="side-item" onClick={() => setPaused(!paused)} aria-pressed={paused} title={mode === 'rail' ? (paused ? 'Wake the congregation' : 'Still the congregation') : undefined}>
            <Icon name={paused ? 'play' : 'pause'} className="side-icon" />
            <span className="side-text">{paused ? 'Wake the congregation' : 'Still the congregation'}</span>
          </button>
          <button type="button" className="side-item" data-pop onClick={() => setPop((p) => (p === 'shortcuts' ? null : 'shortcuts'))} aria-expanded={pop === 'shortcuts'}>
            <Icon name="help" className="side-icon" /><span className="side-text">Shortcuts</span>
          </button>
          {roomy && (
            <button type="button" className="side-item" onClick={toggleSidebar} aria-expanded={mode === 'full'}>
              <Icon name="sidebar" className="side-icon" /><span className="side-text">{collapsed ? 'Expand sidebar' : 'Collapse sidebar'}</span>
            </button>
          )}
          <button type="button" className="side-user" style={{ textAlign: 'left' }} onClick={() => (isConnected ? (disconnect(), say('Wallet disconnected')) : openConnect())}>
            <span className="avatar"><Mark size={18} /></span>
            <span className="side-text" style={{ minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: 14 }}>{isConnected && address ? short(address) : 'anon'}</span>
              <span style={{ display: 'block', fontSize: 12, color: 'var(--faint)' }}>{isConnected ? (chain?.name ?? 'Wrong network') + ' · disconnect' : 'wallet not connected'}</span>
            </span>
          </button>
        </div>
      </aside>
      {drawer && <button type="button" className="scrim" aria-label="Close menu" onClick={() => setDrawer(false)} />}
      {pop === 'shortcuts' && (
        <div className="panel shortcuts" role="dialog" aria-label="Shortcuts" data-pop>
          <p className="panel-label">shortcuts</p>
          <ul>{SHORTCUTS.map(([k, v]) => <li key={k}><span>{v}</span><kbd>{k}</kbd></li>)}</ul>
        </div>
      )}

      <main className="main" id="main">
        {children}
        <div className="top">
          <button type="button" className="icon-btn" onClick={() => setDrawer(true)} aria-label="Open menu"><Icon name="menu" width={18} height={18} /></button>
          <div style={{ position: 'relative', marginLeft: 'auto' }} data-pop>
            <button type="button" className="pill" onClick={() => setPop((p) => (p === 'search' ? null : 'search'))} aria-expanded={pop === 'search'}>
              <Icon name="search" width={16} height={16} /><span className="pill-text">Search pairs</span><kbd className="pill-kbd">Ctrl K</kbd>
            </button>
            {pop === 'search' && (
              <div className="panel search-pop" role="dialog" aria-label="Search pairs">
                <label className="search-box">
                  <Icon name="search" width={15} height={15} style={{ opacity: 0.5 }} />
                  <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, ticker or 0xb1e55ed…" aria-label="Search pairs" />
                </label>
                {results.length ? (
                  <>
                    <p className="panel-label">{q ? 'matches' : 'trending'}</p>
                    {results.map((p) => (
                      <Link key={p.address} href={`/pairs/${p.address}`} className="row-item" onClick={() => setPop(null)}>
                        <span className="t">${p.symbol}</span>{p.name}
                        <span className="q">/{p.quote} <span className={p.change24h >= 0 ? 'up' : 'dn'}>{pct(p.change24h)}</span></span>
                      </Link>
                    ))}
                  </>
                ) : <p className="none">No pairs match.</p>}
              </div>
            )}
          </div>
          {isConnected && address ? (
            <button type="button" className="connect on" onClick={() => { disconnect(); say('Wallet disconnected'); }} title="Disconnect"><i />{short(address)}</button>
          ) : (
            <button type="button" className="connect" onClick={openConnect}>Connect wallet</button>
          )}
        </div>
      </main>
      <ConnectModal />
      <TermsGate />
    </div>
  );
}

export { SITE };

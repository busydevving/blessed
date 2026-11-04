export function usd(n: number, digits = 2): string {
  if (!isFinite(n)) return '$0';
  const abs = Math.abs(n);
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  if (abs > 0 && abs < 0.01) return `$${n.toPrecision(2)}`;
  return `$${n.toFixed(digits)}`;
}

export function num(n: number, digits = 2): string {
  const abs = Math.abs(n);
  if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  if (abs > 0 && abs < 0.0001) return n.toExponential(2);
  return n.toLocaleString('en-US', { maximumFractionDigits: digits });
}

export function pct(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}

export function short(addr: string, head = 6, tail = 4): string {
  if (!addr) return '';
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

export function ago(ts: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function bpsToPct(bps: number): string {
  return `${(bps / 100).toFixed(bps % 100 === 0 ? 0 : 2)}%`;
}

/** "Amen $AMEN" → { name: 'Amen', symbol: 'AMEN' }. Falls back to an upper-cased first word for the ticker. */
export function parseMeme(text: string) {
  const m = text.match(/\$([A-Za-z0-9]{1,10})/);
  const symbol = (m?.[1] ?? text.trim().split(/\s+/)[0] ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
  const name = text.replace(/\$[A-Za-z0-9]+/, '').trim() || symbol;
  return { name, symbol };
}

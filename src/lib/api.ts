// ─────────────────────────────────────────────────────────────────────────────
// DATA LAYER: the single place the front end reads off-chain data from.
//
// TODO(backend): point NEXT_PUBLIC_API_URL at the indexer/API. Each function
// calls the endpoint in its comment and falls back to mock data when the env var
// is unset, so the UI keeps working during development. Keep the return types the
// same (see types.ts), or map the API's responses into them here.
// ─────────────────────────────────────────────────────────────────────────────
import type { Address, Candle, CreatorEarning, Holder, HolderReward, Pair, ProtocolStats, QuoteAsset, Trade } from './types';
import * as mock from './mock';

const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
export const IS_DEMO = !API;

async function get<T>(path: string, fallback: () => T): Promise<T> {
  if (!API) { await new Promise((r) => setTimeout(r, 150)); return fallback(); }
  const res = await fetch(`${API}${path}`, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export type PairSort = 'trending' | 'new' | 'mcap' | 'volume' | 'listed';

/** GET /pairs?sort=&quote=&q= */
export function getPairs(opts: { sort?: PairSort; quote?: string; q?: string } = {}): Promise<Pair[]> {
  const qs = new URLSearchParams(Object.entries(opts).filter(([, v]) => v) as [string, string][]).toString();
  return get(`/pairs${qs ? `?${qs}` : ''}`, () => {
    let list = [...mock.PAIRS];
    if (opts.quote) list = list.filter((p) => p.quote === opts.quote);
    if (opts.q) { const q = opts.q.toLowerCase(); list = list.filter((p) => p.name.toLowerCase().includes(q) || p.symbol.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)); }
    switch (opts.sort) {
      case 'new': list.sort((a, b) => b.createdAt - a.createdAt); break;
      case 'mcap': list.sort((a, b) => b.mcapUsd - a.mcapUsd); break;
      case 'volume': list.sort((a, b) => b.volume24hUsd - a.volume24hUsd); break;
      case 'listed': list = list.filter((p) => p.status === 'listed'); break;
      default: list.sort((a, b) => b.volume24hUsd * (1 + b.change24h / 100) - a.volume24hUsd * (1 + a.change24h / 100));
    }
    return list;
  });
}

/** GET /pairs/:address */
export function getPair(address: Address): Promise<Pair | null> {
  return get(`/pairs/${address}`, () => mock.PAIRS.find((p) => p.address.toLowerCase() === address.toLowerCase()) ?? null);
}

/** GET /pairs/:address/trades?limit= */
export function getTrades(address: Address, limit = 30): Promise<Trade[]> {
  return get(`/pairs/${address}/trades?limit=${limit}`, () => mock.mockTrades(address, limit));
}

/** GET /pairs/:address/holders */
export function getHolders(address: Address): Promise<Holder[]> {
  return get(`/pairs/${address}/holders`, () => mock.mockHolders(address));
}

/** GET /pairs/:address/candles?interval=15m */
export function getCandles(address: Address, interval = '15m'): Promise<Candle[]> {
  return get(`/pairs/${address}/candles?interval=${interval}`, () => mock.mockCandles(address));
}

/** GET /trades/latest — feeds the live tape on the landing page */
export function getLatestTrades(limit = 18): Promise<(Trade & { symbol: string; quote: string })[]> {
  return get(`/trades/latest?limit=${limit}`, () =>
    mock.PAIRS.slice(0, limit).map((p, i) => ({ ...mock.mockTrades(p.address, 1)[0], symbol: p.symbol, quote: p.quote, ts: Date.now() - i * 40_000 })));
}

/** GET /quotes — the stocks / assets a token can be priced in */
export function getQuotes(): Promise<QuoteAsset[]> {
  return get('/quotes', () => mock.QUOTES);
}

/** GET /stats */
export function getStats(): Promise<ProtocolStats> {
  return get('/stats', () => mock.STATS);
}

/** GET /earnings/:wallet/creator */
export function getCreatorEarnings(wallet: Address): Promise<CreatorEarning[]> {
  return get(`/earnings/${wallet}/creator`, () => mock.mockCreatorEarnings());
}

/** GET /earnings/:wallet/holder */
export function getHolderRewards(wallet: Address): Promise<HolderReward[]> {
  return get(`/earnings/${wallet}/holder`, () => mock.mockHolderRewards());
}

/**
 * POST /launch/metadata (multipart: image + json) → { uri }
 * Upload the token image and metadata (IPFS or CDN) before calling the launchpad.
 */
export async function uploadMetadata(data: { name: string; symbol: string; description: string; image?: File | null; socials: Record<string, string | undefined> }): Promise<{ uri: string; image?: string }> {
  if (!API) { await new Promise((r) => setTimeout(r, 500)); return { uri: 'ipfs://demo-metadata' }; }
  const fd = new FormData();
  if (data.image) fd.append('image', data.image);
  fd.append('json', JSON.stringify({ ...data, image: undefined }));
  const res = await fetch(`${API}/launch/metadata`, { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`metadata upload failed (${res.status})`);
  return res.json();
}

/**
 * POST /launch/vanity { creator } → { salt, predictedAddress }
 * Every token must deploy at 0xb1e55ed…, so the backend mines a CREATE2 salt
 * (or hands one out from a pre-mined pool) that the launchpad will accept.
 */
export async function reserveVanitySalt(creator: Address): Promise<{ salt: `0x${string}`; predictedAddress: Address }> {
  if (!API) {
    await new Promise((r) => setTimeout(r, 700));
    return { salt: `0x${'0'.repeat(63)}1`, predictedAddress: mock.blessedAddress(Date.now() % 100000) };
  }
  const res = await fetch(`${API}/launch/vanity`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ creator }) });
  if (!res.ok) throw new Error(`vanity salt failed (${res.status})`);
  return res.json();
}

/** GET /bridge/quote?from=&to=&token=&amount= */
export function getBridgeQuote(p: { from: 'hyperevm' | 'elysium'; to: 'hyperevm' | 'elysium'; token: string; amount: number }): Promise<{ receive: number; feeUsd: number; etaSec: number }> {
  return get(`/bridge/quote?${new URLSearchParams({ ...p, amount: String(p.amount) })}`, () => ({ receive: p.amount * 0.999, feeUsd: 0.12, etaSec: 90 }));
}

// DEMO DATA ONLY. Everything here is fake and exists so the UI renders before
// the backend is connected. api.ts falls back to it when NEXT_PUBLIC_API_URL is unset.
import type { Address, Candle, CreatorEarning, Holder, HolderReward, Pair, ProtocolStats, QuoteAsset, Trade } from './types';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
const HEX = '0123456789abcdef';
function hex(r: () => number, n: number) { let o = ''; for (let i = 0; i < n; i++) o += HEX[Math.floor(r() * 16)]; return o; }
export function blessedAddress(seed: number): Address { const r = rng(seed); return (`0xb1e55ed${hex(r, 33)}`) as Address; }
export function wallet(seed: number): Address { const r = rng(seed * 7 + 3); return (`0x${hex(r, 40)}`) as Address; }

export const QUOTES: QuoteAsset[] = [
  { symbol: 'NVDA', name: 'NVIDIA', kind: 'xstock', priceUsd: 186.4, change24h: 2.1 },
  { symbol: 'TSLA', name: 'Tesla', kind: 'xstock', priceUsd: 412.8, change24h: -1.4 },
  { symbol: 'AAPL', name: 'Apple', kind: 'xstock', priceUsd: 251.2, change24h: 0.6 },
  { symbol: 'MSFT', name: 'Microsoft', kind: 'xstock', priceUsd: 506.3, change24h: 0.3 },
  { symbol: 'META', name: 'Meta', kind: 'xstock', priceUsd: 721.5, change24h: 1.2 },
  { symbol: 'GOOGL', name: 'Alphabet', kind: 'xstock', priceUsd: 238.9, change24h: -0.2 },
  { symbol: 'AMZN', name: 'Amazon', kind: 'xstock', priceUsd: 229.4, change24h: 0.9 },
  { symbol: 'SPY', name: 'S&P 500 ETF', kind: 'xstock', priceUsd: 671.2, change24h: 0.4 },
  { symbol: 'QQQ', name: 'Nasdaq-100 ETF', kind: 'xstock', priceUsd: 603.7, change24h: 0.7 },
  { symbol: 'MSTR', name: 'Strategy', kind: 'xstock', priceUsd: 318.6, change24h: 3.8 },
  { symbol: 'MU', name: 'Micron', kind: 'eqx', priceUsd: 168.2, change24h: 1.9 },
  { symbol: 'SKHY', name: 'SK hynix', kind: 'eqx', priceUsd: 241.0, change24h: 2.6 },
  { symbol: 'COIN', name: 'Coinbase', kind: 'eqx', priceUsd: 332.1, change24h: -2.2 },
  { symbol: 'HOOD', name: 'Robinhood', kind: 'eqx', priceUsd: 128.4, change24h: 4.1 },
  { symbol: 'HYPE3L', name: 'HYPE 3× long', kind: 'leveraged', priceUsd: 14.2, change24h: 7.9 },
  { symbol: 'NVDA3L', name: 'NVDA 3× long', kind: 'leveraged', priceUsd: 22.6, change24h: 6.1 },
  { symbol: 'NVDA3S', name: 'NVDA 3× short', kind: 'leveraged', priceUsd: 8.4, change24h: -6.3 },
  { symbol: 'HYPE', name: 'Hyperliquid', kind: 'native', priceUsd: 41.3, change24h: 2.7 },
  { symbol: 'USDH', name: 'USDH', kind: 'native', priceUsd: 1, change24h: 0 },
];

const NAMES: [string, string, string][] = [
  ['Amen', 'AMEN', 'NVDA'], ['Holy Cow', 'MOO', 'TSLA'], ['Saint Pepe', 'SPEPE', 'SPY'],
  ['Hallelujah', 'HALLE', 'QQQ'], ['Blessed Doge', 'BDOGE', 'TSLA'], ['Pray4Gains', 'PRAY', 'NVDA'],
  ['Angel Cat', 'ANGEL', 'AAPL'], ['Divine Ape', 'DAPE', 'META'], ['Thy Bags', 'BAGS', 'MSTR'],
  ['Heavenly Hype', 'HVN', 'HYPE'], ['Glory Hole Diamond', 'GLORY', 'COIN'], ['Holy Water', 'H2O', 'HOOD'],
  ['Choir Boy', 'CHOIR', 'MU'], ['Sermon', 'SRMN', 'MSFT'], ['Tithe', 'TITHE', 'GOOGL'], ['Rapture', 'RAPT', 'NVDA3L'],
];

export const PAIRS: Pair[] = NAMES.map(([name, symbol, quote], i) => {
  const r = rng(i + 11);
  const q = QUOTES.find((x) => x.symbol === quote)!;
  const progress = i % 5 === 0 ? 1 : Math.min(0.98, r() * 0.95 + 0.03);
  const mcap = 4_000 + progress * 60_000 + (progress === 1 ? r() * 900_000 : 0);
  const priceUsd = mcap / 1_000_000_000;
  return {
    address: blessedAddress(i + 1),
    name, symbol,
    description: `${name} is a meme priced in ${quote}. When ${quote} moves, ${symbol} moves with it. 🙏`,
    creator: wallet(i + 100),
    quote,
    createdAt: Date.now() - Math.floor(r() * 9 * 24 * 3600 * 1000),
    priceInQuote: priceUsd / q.priceUsd,
    priceUsd,
    mcapUsd: mcap,
    volume24hUsd: mcap * (0.2 + r() * 1.4),
    change24h: (r() - 0.4) * 80,
    curveProgress: progress,
    status: progress >= 1 ? 'listed' : 'curve',
    feeBps: [25, 50, 100, 200, 300, 500][Math.floor(r() * 6)],
    antiSnipeBps: [0, 3000, 5000, 9000][Math.floor(r() * 4)],
    holderRewards: r() > 0.4,
    holders: Math.floor(20 + progress * 900 + r() * 200),
    socials: { x: `https://x.com/${symbol.toLowerCase()}`, telegram: undefined, website: undefined },
  };
});

export function mockTrades(pair: Address, n = 30): Trade[] {
  const p = PAIRS.find((x) => x.address === pair) ?? PAIRS[0];
  const r = rng(parseInt(pair.slice(10, 16), 16) || 1);
  return Array.from({ length: n }, (_, i) => {
    const usd = 5 + r() * 900;
    return {
      tx: `0x${hex(r, 64)}`,
      pair: p.address,
      side: r() > 0.42 ? 'buy' : 'sell',
      trader: wallet(Math.floor(r() * 1e6)),
      amountToken: usd / p.priceUsd,
      amountQuote: usd / (QUOTES.find((q) => q.symbol === p.quote)?.priceUsd ?? 1),
      usd,
      ts: Date.now() - i * (30_000 + r() * 400_000),
    } as Trade;
  });
}

export function mockHolders(pair: Address): Holder[] {
  const p = PAIRS.find((x) => x.address === pair) ?? PAIRS[0];
  const r = rng(parseInt(pair.slice(12, 18), 16) || 2);
  const list: Holder[] = [
    { address: p.address, balance: 0, pct: p.status === 'listed' ? 0 : (1 - p.curveProgress) * 79.31, label: p.status === 'listed' ? 'pool' : 'curve' },
  ];
  let left = 100 - list[0].pct;
  for (let i = 0; i < 14; i++) {
    const share = Math.min(left, (r() * 0.25 + 0.02) * left);
    left -= share;
    list.push({ address: wallet(i * 31 + 5), balance: share * 10_000_000, pct: share, label: i === 0 ? 'creator' : undefined });
  }
  list[0].balance = list[0].pct * 10_000_000;
  return list.sort((a, b) => b.pct - a.pct);
}

export function mockCandles(pair: Address, n = 96): Candle[] {
  const p = PAIRS.find((x) => x.address === pair) ?? PAIRS[0];
  const r = rng(parseInt(pair.slice(14, 20), 16) || 3);
  let c = p.priceUsd * 0.25;
  const out: Candle[] = [];
  const now = Date.now();
  for (let i = n; i > 0; i--) {
    const o = c;
    c = Math.max(1e-9, c * (1 + (r() - 0.44) * 0.12));
    out.push({ t: now - i * 15 * 60_000, o, h: Math.max(o, c) * (1 + r() * 0.04), l: Math.min(o, c) * (1 - r() * 0.04), c, v: r() * 2000 });
  }
  const k = p.priceUsd / c;
  return out.map((x) => ({ ...x, o: x.o * k, h: x.h * k, l: x.l * k, c: x.c * k }));
}

export const STATS: ProtocolStats = {
  pairs: PAIRS.length,
  volumeAllUsd: 4_821_330,
  volume24hUsd: PAIRS.reduce((a, p) => a + p.volume24hUsd, 0),
  listed: PAIRS.filter((p) => p.status === 'listed').length,
  creatorEarningsUsd: 61_204,
  blessedBurned: 12_400_000,
  treasuryUsd: 84_900,
};

export function mockCreatorEarnings(): CreatorEarning[] {
  return PAIRS.slice(0, 3).map((p, i) => ({
    pair: p.address, symbol: p.symbol, quote: p.quote,
    unclaimedQuote: (i + 1) * 0.37, unclaimedUsd: (i + 1) * 0.37 * (QUOTES.find((q) => q.symbol === p.quote)?.priceUsd ?? 1),
    lifetimeUsd: (i + 1) * 812.4,
  }));
}

export function mockHolderRewards(): HolderReward[] {
  return PAIRS.slice(3, 6).map((p, i) => ({
    pair: p.address, symbol: p.symbol, quote: p.quote,
    pendingQuote: (i + 1) * 0.05, pendingUsd: (i + 1) * 0.05 * (QUOTES.find((q) => q.symbol === p.quote)?.priceUsd ?? 1),
  }));
}

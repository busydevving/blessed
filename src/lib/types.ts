// Shared domain types. The backend/indexer should return these shapes
// (or api.ts should map its responses into them).

export type Address = `0x${string}`;

export type QuoteKind = 'xstock' | 'eqx' | 'leveraged' | 'native';

export interface QuoteAsset {
  symbol: string;          // e.g. "NVDA"
  name: string;            // e.g. "NVIDIA"
  kind: QuoteKind;
  address?: Address;       // token address on HyperEVM
  priceUsd: number;
  change24h: number;       // percent, e.g. 2.4 = +2.4%
}

export type PairStatus = 'curve' | 'listed';

export interface Pair {
  address: Address;        // always starts with 0xb1e55ed
  name: string;
  symbol: string;
  description: string;
  image?: string;          // URL (IPFS / CDN)
  creator: Address;
  quote: string;           // QuoteAsset.symbol
  createdAt: number;       // unix ms
  priceInQuote: number;    // price of 1 token denominated in the quote asset
  priceUsd: number;
  mcapUsd: number;
  volume24hUsd: number;
  change24h: number;
  curveProgress: number;   // 0..1, share of the 793.1M curve supply sold
  status: PairStatus;
  feeBps: number;          // 25..500
  antiSnipeBps: number;    // up to 9000
  holderRewards: boolean;
  holders: number;
  socials: { x?: string; telegram?: string; website?: string };
}

export interface Trade {
  tx: string;
  pair: Address;
  side: 'buy' | 'sell';
  trader: Address;
  amountToken: number;
  amountQuote: number;
  usd: number;
  ts: number;
}

export interface Holder {
  address: Address;
  balance: number;
  pct: number;             // 0..100
  label?: string;          // "curve", "creator", "pool"…
}

export interface Candle { t: number; o: number; h: number; l: number; c: number; v: number }

export interface ProtocolStats {
  pairs: number;
  volumeAllUsd: number;
  volume24hUsd: number;
  listed: number;
  creatorEarningsUsd: number;
  blessedBurned: number;
  treasuryUsd: number;
}

export interface CreatorEarning {
  pair: Address;
  symbol: string;
  quote: string;
  unclaimedQuote: number;
  unclaimedUsd: number;
  lifetimeUsd: number;
}

export interface HolderReward {
  pair: Address;
  symbol: string;
  quote: string;
  pendingQuote: number;
  pendingUsd: number;
}

export interface LaunchParams {
  name: string;
  symbol: string;
  description: string;
  imageFile?: File | null;
  quote: string;
  feeBps: number;
  antiSnipeBps: number;
  holderRewards: boolean;
  initialBuyHype: number;
  socials: { x?: string; telegram?: string; website?: string };
}

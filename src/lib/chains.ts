import { defineChain } from 'viem';

export const hyperEvm = defineChain({
  id: 999,
  name: 'HyperEVM',
  nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
  rpcUrls: { default: { http: [process.env.NEXT_PUBLIC_HYPEREVM_RPC || 'https://rpc.hyperliquid.xyz/evm'] } },
  blockExplorers: { default: { name: 'HyperEVMScan', url: 'https://hyperevmscan.io' } },
});

// TODO(backend): fill in Elysium's real chain id / RPC / explorer in .env
export const elysium = defineChain({
  id: Number(process.env.NEXT_PUBLIC_ELYSIUM_CHAIN_ID || 0) || 6699,
  name: 'Elysium',
  nativeCurrency: { name: 'HYPE', symbol: 'HYPE', decimals: 18 },
  rpcUrls: { default: { http: [process.env.NEXT_PUBLIC_ELYSIUM_RPC || 'https://rpc.elysium.invalid'] } },
  blockExplorers: { default: { name: 'Elysium Explorer', url: process.env.NEXT_PUBLIC_ELYSIUM_EXPLORER || 'https://explorer.elysium.invalid' } },
});

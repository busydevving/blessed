// ─────────────────────────────────────────────────────────────────────────────
// CONTRACTS: addresses and ABIs.
//
// TODO(backend): these ABIs are placeholders that show the shape the UI expects.
// Swap in the real ABIs (ideally exported straight from the contracts repo) and
// update the args in hooks/useBlessedActions.ts so they match.
// When an address is missing, that action runs in DEMO MODE (it fakes a tx).
// ─────────────────────────────────────────────────────────────────────────────
import type { Address } from './types';

const env = (v?: string) => (v && /^0x[0-9a-fA-F]{40}$/.test(v) ? (v as Address) : undefined);

export const ADDRESSES = {
  launchpad: env(process.env.NEXT_PUBLIC_LAUNCHPAD_ADDRESS),   // creates tokens, holds the bonding curves
  router: env(process.env.NEXT_PUBLIC_ROUTER_ADDRESS),         // swaps (curve + Elysium pools)
  bridge: env(process.env.NEXT_PUBLIC_BRIDGE_ADDRESS),         // HyperEVM <-> Elysium
  rewards: env(process.env.NEXT_PUBLIC_REWARDS_ADDRESS),       // creator fee + holder reward claims
  blessed: env(process.env.NEXT_PUBLIC_BLESSED_TOKEN_ADDRESS), // $BLESSED
};

export const launchpadAbi = [
  {
    type: 'function', name: 'createToken', stateMutability: 'payable',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'symbol', type: 'string' },
      { name: 'metadataURI', type: 'string' },
      { name: 'quote', type: 'address' },
      { name: 'feeBps', type: 'uint16' },
      { name: 'antiSnipeBps', type: 'uint16' },
      { name: 'holderRewards', type: 'bool' },
      { name: 'salt', type: 'bytes32' },
    ],
    outputs: [{ name: 'token', type: 'address' }],
  },
  {
    type: 'function', name: 'buy', stateMutability: 'payable',
    inputs: [{ name: 'token', type: 'address' }, { name: 'quoteIn', type: 'uint256' }, { name: 'minOut', type: 'uint256' }],
    outputs: [{ name: 'out', type: 'uint256' }],
  },
  {
    type: 'function', name: 'sell', stateMutability: 'nonpayable',
    inputs: [{ name: 'token', type: 'address' }, { name: 'amountIn', type: 'uint256' }, { name: 'minOut', type: 'uint256' }],
    outputs: [{ name: 'out', type: 'uint256' }],
  },
  {
    type: 'function', name: 'quoteBuy', stateMutability: 'view',
    inputs: [{ name: 'token', type: 'address' }, { name: 'quoteIn', type: 'uint256' }],
    outputs: [{ name: 'out', type: 'uint256' }],
  },
  {
    type: 'function', name: 'quoteSell', stateMutability: 'view',
    inputs: [{ name: 'token', type: 'address' }, { name: 'amountIn', type: 'uint256' }],
    outputs: [{ name: 'out', type: 'uint256' }],
  },
  {
    type: 'event', name: 'TokenCreated', anonymous: false,
    inputs: [{ name: 'token', type: 'address', indexed: true }, { name: 'creator', type: 'address', indexed: true }, { name: 'quote', type: 'address', indexed: false }],
  },
] as const;

export const routerAbi = [
  {
    type: 'function', name: 'swapExactIn', stateMutability: 'payable',
    inputs: [
      { name: 'tokenIn', type: 'address' }, { name: 'tokenOut', type: 'address' },
      { name: 'amountIn', type: 'uint256' }, { name: 'minOut', type: 'uint256' }, { name: 'to', type: 'address' },
    ],
    outputs: [{ name: 'out', type: 'uint256' }],
  },
] as const;

export const bridgeAbi = [
  {
    type: 'function', name: 'bridge', stateMutability: 'payable',
    inputs: [{ name: 'token', type: 'address' }, { name: 'amount', type: 'uint256' }, { name: 'dstChainId', type: 'uint256' }, { name: 'to', type: 'address' }],
    outputs: [],
  },
] as const;

export const rewardsAbi = [
  { type: 'function', name: 'claimCreatorFees', stateMutability: 'nonpayable', inputs: [{ name: 'tokens', type: 'address[]' }], outputs: [] },
  { type: 'function', name: 'claimHolderRewards', stateMutability: 'nonpayable', inputs: [{ name: 'tokens', type: 'address[]' }], outputs: [] },
] as const;

export const erc20Abi = [
  { type: 'function', name: 'approve', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'a', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'allowance', stateMutability: 'view', inputs: [{ name: 'o', type: 'address' }, { name: 's', type: 'address' }], outputs: [{ type: 'uint256' }] },
] as const;

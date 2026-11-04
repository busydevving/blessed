'use client';
// ─────────────────────────────────────────────────────────────────────────────
// WRITE ACTIONS: every on-chain action the UI can trigger.
// TODO(backend): check the args against the real contracts. Amount decimals are
// assumed to be 18 for the token and the quote; fix that if the quote assets differ.
// ─────────────────────────────────────────────────────────────────────────────
import { useCallback } from 'react';
import { useAccount, useChainId, useSwitchChain, useWriteContract } from 'wagmi';
import { parseEther, parseUnits, zeroAddress } from 'viem';
import { ADDRESSES, bridgeAbi, launchpadAbi, rewardsAbi, routerAbi } from '@/lib/contracts';
import { hyperEvm, elysium } from '@/lib/chains';
import { reserveVanitySalt, uploadMetadata } from '@/lib/api';
import { LAUNCH_COST_HYPE } from '@/lib/constants';
import type { Address, LaunchParams } from '@/lib/types';

const fakeTx = async (): Promise<`0x${string}`> => {
  await new Promise((r) => setTimeout(r, 1200));
  return `0x${Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')}`;
};

export function useBlessedActions() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();

  const ensureChain = useCallback(async (id: number) => {
    if (chainId !== id) await switchChainAsync({ chainId: id });
  }, [chainId, switchChainAsync]);

  /** Launch: upload metadata → reserve vanity salt → createToken */
  const launchToken = useCallback(async (p: LaunchParams, quoteAddress?: Address, onStep?: (s: string) => void) => {
    if (!address) throw new Error('Connect a wallet first');
    onStep?.('Uploading metadata');
    const meta = await uploadMetadata({ name: p.name, symbol: p.symbol, description: p.description, image: p.imageFile, socials: p.socials });
    onStep?.('Reserving your 0xb1e55ed address');
    const { salt, predictedAddress } = await reserveVanitySalt(address);
    onStep?.('Confirm in your wallet');
    if (!ADDRESSES.launchpad) { const tx = await fakeTx(); return { tx, token: predictedAddress }; }
    await ensureChain(hyperEvm.id);
    const tx = await writeContractAsync({
      address: ADDRESSES.launchpad, abi: launchpadAbi, functionName: 'createToken',
      args: [p.name, p.symbol, meta.uri, quoteAddress ?? zeroAddress, p.feeBps, p.antiSnipeBps, p.holderRewards, salt],
      value: parseEther(String(LAUNCH_COST_HYPE + (p.initialBuyHype || 0))),
    });
    return { tx, token: predictedAddress };
  }, [address, ensureChain, writeContractAsync]);

  /** Buy on the bonding curve, or through the router once the pair is listed */
  const buy = useCallback(async (token: Address, quoteIn: number, minOut: number) => {
    if (!ADDRESSES.launchpad) return fakeTx();
    await ensureChain(hyperEvm.id);
    // TODO(backend): if the quote is an ERC-20 (e.g. NVDA xStock) an approve is needed first
    return writeContractAsync({ address: ADDRESSES.launchpad, abi: launchpadAbi, functionName: 'buy',
      args: [token, parseUnits(String(quoteIn), 18), parseUnits(String(minOut), 18)] });
  }, [ensureChain, writeContractAsync]);

  const sell = useCallback(async (token: Address, amountIn: number, minOut: number) => {
    if (!ADDRESSES.launchpad) return fakeTx();
    await ensureChain(hyperEvm.id);
    return writeContractAsync({ address: ADDRESSES.launchpad, abi: launchpadAbi, functionName: 'sell',
      args: [token, parseUnits(String(amountIn), 18), parseUnits(String(minOut), 18)] });
  }, [ensureChain, writeContractAsync]);

  const swap = useCallback(async (tokenIn: Address, tokenOut: Address, amountIn: number, minOut: number) => {
    if (!ADDRESSES.router || !address) return fakeTx();
    await ensureChain(elysium.id);
    return writeContractAsync({ address: ADDRESSES.router, abi: routerAbi, functionName: 'swapExactIn',
      args: [tokenIn, tokenOut, parseUnits(String(amountIn), 18), parseUnits(String(minOut), 18), address] });
  }, [address, ensureChain, writeContractAsync]);

  const bridge = useCallback(async (token: Address, amount: number, from: 'hyperevm' | 'elysium') => {
    if (!ADDRESSES.bridge || !address) return fakeTx();
    const src = from === 'hyperevm' ? hyperEvm.id : elysium.id;
    const dst = from === 'hyperevm' ? elysium.id : hyperEvm.id;
    await ensureChain(src);
    return writeContractAsync({ address: ADDRESSES.bridge, abi: bridgeAbi, functionName: 'bridge',
      args: [token, parseUnits(String(amount), 18), BigInt(dst), address] });
  }, [address, ensureChain, writeContractAsync]);

  const claimCreatorFees = useCallback(async (tokens: Address[]) => {
    if (!ADDRESSES.rewards) return fakeTx();
    await ensureChain(hyperEvm.id);
    return writeContractAsync({ address: ADDRESSES.rewards, abi: rewardsAbi, functionName: 'claimCreatorFees', args: [tokens] });
  }, [ensureChain, writeContractAsync]);

  const claimHolderRewards = useCallback(async (tokens: Address[]) => {
    if (!ADDRESSES.rewards) return fakeTx();
    await ensureChain(hyperEvm.id);
    return writeContractAsync({ address: ADDRESSES.rewards, abi: rewardsAbi, functionName: 'claimHolderRewards', args: [tokens] });
  }, [ensureChain, writeContractAsync]);

  return { address, launchToken, buy, sell, swap, bridge, claimCreatorFees, claimHolderRewards };
}

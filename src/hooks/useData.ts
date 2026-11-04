'use client';
import { useQuery } from '@tanstack/react-query';
import * as api from '@/lib/api';
import type { Address } from '@/lib/types';

export const usePairs = (opts: Parameters<typeof api.getPairs>[0] = {}) =>
  useQuery({ queryKey: ['pairs', opts], queryFn: () => api.getPairs(opts), refetchInterval: 15_000 });
export const usePair = (a?: Address) =>
  useQuery({ queryKey: ['pair', a], queryFn: () => api.getPair(a!), enabled: !!a, refetchInterval: 10_000 });
export const useTrades = (a?: Address) =>
  useQuery({ queryKey: ['trades', a], queryFn: () => api.getTrades(a!), enabled: !!a, refetchInterval: 5_000 });
export const useHolders = (a?: Address) =>
  useQuery({ queryKey: ['holders', a], queryFn: () => api.getHolders(a!), enabled: !!a });
export const useCandles = (a?: Address, interval = '15m') =>
  useQuery({ queryKey: ['candles', a, interval], queryFn: () => api.getCandles(a!, interval), enabled: !!a, refetchInterval: 30_000 });
export const useLatestTrades = () =>
  useQuery({ queryKey: ['latestTrades'], queryFn: () => api.getLatestTrades(), refetchInterval: 8_000 });
export const useQuotes = () => useQuery({ queryKey: ['quotes'], queryFn: api.getQuotes, staleTime: 60_000 });
export const useStats = () => useQuery({ queryKey: ['stats'], queryFn: api.getStats, refetchInterval: 30_000 });
export const useCreatorEarnings = (w?: Address) =>
  useQuery({ queryKey: ['creatorEarnings', w], queryFn: () => api.getCreatorEarnings(w!), enabled: !!w });
export const useHolderRewards = (w?: Address) =>
  useQuery({ queryKey: ['holderRewards', w], queryFn: () => api.getHolderRewards(w!), enabled: !!w });

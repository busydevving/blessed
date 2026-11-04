export const TOTAL_SUPPLY = 1_000_000_000;
export const CURVE_SUPPLY = 793_100_000; // 79.31%
export const VANITY_PREFIX = 'b1e55ed';
export const LAUNCH_COST_HYPE = 0.01;
export const FEE_MIN_BPS = 25;    // 0.25%
export const FEE_MAX_BPS = 500;   // 5%
export const ANTI_SNIPE_MAX_BPS = 9000; // 90%
export const HOLDER_MIN_PCT = 0.05;
export const TIMELOCK_HOURS = 4;

export const SITE = { name: 'Blessed', domain: 'blessed.fun', url: 'https://blessed.fun', x: 'https://x.com/blesseddotfun', xHandle: '@blesseddotfun' };

export const NAV = [
  { id: 'launch', href: '/', label: 'Launch', kbd: 'Ctrl L' },
  { id: 'pairs', href: '/pairs', label: 'Pairs' },
  { id: 'offerings', href: '/offerings', label: 'Offerings' },
  { id: 'swap', href: '/swap', label: 'Swap' },
  { id: 'bridge', href: '/bridge', label: 'Bridge' },
  { id: 'earnings', href: '/earnings', label: 'Earnings' },
  { id: 'stats', href: '/stats', label: 'Stats' },
  { id: 'vaults', href: '/vaults', label: 'Vaults', soon: true },
  { id: 'docs', href: '/docs', label: 'Docs' },
] as const;

export const SHORTCUTS: [string, string][] = [
  ['Ctrl K', 'Search pairs'],
  ['Ctrl B', 'Collapse the sidebar'],
  ['Ctrl L', 'Launch a meme'],
  ['/', 'Jump to the launch card'],
  ['↵', 'Launch'],
  ['Esc', 'Close panels'],
];

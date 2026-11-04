# backend handoff

Every screen is built and wired to a data layer and to contract hooks. Nothing reads mock data directly, so connecting the backend means editing **three files**. Every integration point is marked `TODO(backend)`; run `grep -rn "TODO(backend)" src` to list them.

## 1. env (`.env.example`)

| var | what |
|---|---|
| `NEXT_PUBLIC_API_URL` | indexer / REST API base. Unset means mock data. |
| `NEXT_PUBLIC_WC_PROJECT_ID` | reserved for WalletConnect (not wired yet; see the note in `src/lib/wagmi.ts`) |
| `NEXT_PUBLIC_HYPEREVM_RPC` | HyperEVM RPC (chain 999) |
| `NEXT_PUBLIC_ELYSIUM_CHAIN_ID` / `_RPC` / `_EXPLORER` | **fill in**: the Elysium chain is a placeholder in `src/lib/chains.ts` |
| `NEXT_PUBLIC_LAUNCHPAD_ADDRESS` | createToken, buy, sell, quoteBuy, quoteSell |
| `NEXT_PUBLIC_ROUTER_ADDRESS` | swaps on Elysium |
| `NEXT_PUBLIC_BRIDGE_ADDRESS` | HyperEVM ⇄ Elysium |
| `NEXT_PUBLIC_REWARDS_ADDRESS` | creator fee and holder reward claims |
| `NEXT_PUBLIC_BLESSED_TOKEN_ADDRESS` | $BLESSED |

If a contract address is missing, that one action **fakes a tx**, so you can wire up and test them one at a time.

## 2. reads: `src/lib/api.ts`

Each function has its expected endpoint in a comment and returns the types in `src/lib/types.ts`. Either match those shapes in the API or map them inside these functions.

| function | endpoint | used by |
|---|---|---|
| `getPairs({sort, quote, q})` | `GET /pairs` | pairs, stats, sidebar trending, ⌘K search |
| `getPair(addr)` | `GET /pairs/:address` | pair page |
| `getTrades(addr)` | `GET /pairs/:address/trades` | pair page (polls 5 s) |
| `getHolders(addr)` | `GET /pairs/:address/holders` | pair page |
| `getCandles(addr, interval)` | `GET /pairs/:address/candles` | pair chart |
| `getLatestTrades()` | `GET /trades/latest` | spare (live tape) |
| `getQuotes()` | `GET /quotes` | launch, home picker, offerings, swap |
| `getStats()` | `GET /stats` | stats, home greeting |
| `getCreatorEarnings(w)` / `getHolderRewards(w)` | `GET /earnings/:wallet/(creator\|holder)` | earnings |
| `uploadMetadata()` | `POST /launch/metadata` → `{ uri }` | launch |
| `reserveVanitySalt(creator)` | `POST /launch/vanity` → `{ salt, predictedAddress }` | launch |
| `getBridgeQuote()` | `GET /bridge/quote` | bridge |

**The vanity address.** Every token must deploy at `0xb1e55ed…`. That is 7 hex chars, about 2²⁸ CREATE2 attempts on average, so the backend has to mine the salts. The best approach is a pre-mined pool that it hands out per creator. The front end asks `reserveVanitySalt` for one and passes it to `createToken`.

## 3. writes: `src/lib/contracts.ts` + `src/hooks/useBlessedActions.ts`

- `contracts.ts` holds addresses and **placeholder ABIs** that show the shape the UI expects. Replace them with the real ABIs.
- `useBlessedActions.ts` exposes `launchToken`, `buy`, `sell`, `swap`, `bridge`, `claimCreatorFees` and `claimHolderRewards`. Adjust the args to match the real functions. Notes:
  - amounts assume 18 decimals
  - ERC-20 quotes (xStocks) need an `approve` before `buy`, which is not wired yet
  - the pair page's "you get" is a local estimate. Swap it for `quoteBuy` / `quoteSell` reads (`useReadContract`).
- The chain is switched automatically: HyperEVM for launch, trade, claim and bridge out; Elysium for swaps.

## pages

`/` launch home · `/launch` full launch form (pre-filled from the home card) · `/pairs` · `/pairs/[address]` · `/swap` · `/bridge` · `/offerings` · `/earnings` · `/stats` · `/vaults` (soon) · `/docs` · `/terms` `/privacy` `/risks` (**placeholder legal copy, replace before launch**)

## before going live

1. Run `npm run build` once locally, then set `typescript.ignoreBuildErrors` and `eslint.ignoreDuringBuilds` in `next.config.mjs` back to **false**. The first version was written without a local install, so they are on as a safety net.
2. Fill in the Elysium chain, the contracts and the API URL.
3. Replace the legal copy.
4. Optional: the pair chart is a small SVG. Swap in lightweight-charts or TradingView if you want candles.

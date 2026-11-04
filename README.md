# blessed 🙏

every meme, blessed by a stock. a launchpad for meme tokens priced in stocks: born on hyperevm, listed on elysium in pools locked forever.

**web:** [blessed.fun](https://blessed.fun) · **x:** [@blesseddotfun](https://x.com/blesseddotfun)

## run it

```bash
npm install
cp .env.example .env.local   # leave it empty to run in demo mode
npm run dev                  # http://localhost:3000
```

## deploy (vercel)

Import this repo in Vercel. It uses the Next.js preset and needs no extra settings. Add the env vars from `.env.example` in the project's settings. If none are set, the site runs in **demo mode**: mock data and simulated transactions, so it is safe to preview.

## stack

Next.js 15 (app router) · React 19 · TypeScript · wagmi 2 + viem 2 · TanStack Query 5. No CSS framework: the whole design system is in `src/app/globals.css`.

Fonts: Syne (display), Hanken Grotesk (ui), Martian Mono (mono). They load through `next/font/google`.

## the look

- **The congregation** (`src/lib/sea/engine.ts`). Praying hands, coins, votive candles and halos are drawn as vector shapes on an offscreen canvas. Each frame is sampled into glyph cells: coverage ≥ 0.42 becomes a solid cell, ≥ 0.16 a mid glyph, ≥ 0.04 an edge glyph. The shapes circle the launch card counter-clockwise and never cross it. Typing pulls the ring in, pressing ↵ flares it out, and the pointer scares them off.
- **The shell** (`src/components/Shell.tsx`) follows the app's own width: a full sidebar at ≥ 960 px (Ctrl B collapses it and the choice is remembered), an icon rail at 600–959 px, and a drawer on phones.
- **The voice** is lowercase everywhere. Data keeps its case: tickers, addresses and numbers.
- 🙏 hand geometry comes from [Twemoji](https://github.com/jdecked/twemoji) (CC-BY 4.0) and is credited on the home page.

## for the backend dev

Read **[HANDOFF.md](./HANDOFF.md)**.

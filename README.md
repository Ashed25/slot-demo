# Golden Naga: Slot Game Demo

A 5-reel, 20-payline slot game themed around Southeast Asian mythology. It has wilds, scatters, free spins, a multiplier that grows during free spins, and a random **Naga Blessing** feature. It is built with **Phaser 4**, **TypeScript** and **Vite**.

## Features

- **5×3 reels, 20 paylines.** Paylines include straight lines, V shapes, zigzags and diagonals. Wins pay left to right from the first reel and need 3 or more matching symbols.
- **11 symbols:**
  - 5 themed high-pay symbols (Golden Naga, White Elephant, Royal Peacock, Ruby, Golden Bell)
  - 4 card-rank low-pay symbols (A, K, Q, J)
  - 2 specials, described below
- **Wild (Golden Lotus).** It substitutes for any paying symbol, including at the start of a line.
- **Scatter (Ancient Temple).** 3, 4 or 5 scatters anywhere award 8, 12 or 15 free spins. Landing scatters again during free spins **retriggers** more spins.
- **Free-spin multiplier.** It starts at ×1 and goes up by 1 after every winning free spin, so a long bonus round gets stronger as it goes.
- **Naga Blessing.** Each free spin has a 25% chance to turn a random symbol into a Wild.
- **Betting and balance.** You start with 10,000 credits and can bet 1, 2, 5, 10, 20 or 50 per spin. The game shows a live balance, the last win and status messages.
- **Visual feedback.** Winning symbols pulse, scatters animate, and feature banners announce free spins, retriggers and blessings.

## Tech stack

| | |
|---|---|
| Game engine | [Phaser 4](https://phaser.io) |
| Language | TypeScript |
| Build tool | Vite |

## Getting started

Requires a recent Node.js LTS (20.19+ or 22+).

```bash
npm install
npm run dev       # start the dev server, then open the printed URL
npm run build     # type-check and build to dist/
npm run preview   # serve the production build
```

## Project structure

```
src/
  main.ts              Phaser game setup (1000×700, scales to fit the window)
  scenes/SlotScene.ts  reels, spin animation, controls, free-spin flow
  game/
    config.ts          reels/rows, starting balance, bets, free-spin awards, blessing chance
    symbols.ts         symbol definitions
    paytable.ts        payout multipliers for 3/4/5 of a kind
    paylines.ts        the 20 payline patterns
    winEvaluator.ts    finds line wins (with wild substitution) and totals payouts
```

The game rules live in `src/game/` and are separate from the rendering code. So you can change the paytable, paylines, bet sizes or feature odds in one place without touching the scene.

## Paytable

Payouts are multiples of the bet, per winning line.

| Symbol | 3 | 4 | 5 |
|---|---|---|---|
| Golden Naga | 2× | 5× | 10× |
| White Elephant | 1.8× | 4× | 8× |
| Royal Peacock | 1.5× | 3.5× | 7× |
| Ruby | 1.2× | 3× | 6× |
| Golden Bell | 1× | 2.5× | 5× |
| A | 0.8× | 2× | 4× |
| K | 0.7× | 1.8× | 3.5× |
| Q | 0.6× | 1.5× | 3× |
| J | 0.5× | 1.2× | 2.5× |

## Note

This is a portfolio demo that uses play credits only. No real money is involved.

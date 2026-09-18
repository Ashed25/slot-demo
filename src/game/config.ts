export const GAME_WIDTH = 1000
export const GAME_HEIGHT = 700

export const SLOT_CONFIG = {
  reels: 5,
  rows: 3,
  startingBalance: 10000,
  defaultBet: 10,
  betOptions: [1, 2, 5, 10, 20, 50],

  nagaBlessingChance: 0.10,

  maxFreeSpinMultiplier: 4,

  maxStickyWilds: 3,

  // Bonus-only payout boost.
  // Normal spins use the paytable normally.
  // Free Spin base wins receive this multiplier
  // before the normal Free Spin multiplier (x1–x4).
  freeSpinPayoutMultiplier: 1.25,

  freeSpins: {
    threeScatters: 8,
    fourScatters: 10,
    fiveScatters: 12,
  },
}
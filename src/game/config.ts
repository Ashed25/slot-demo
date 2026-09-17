export const GAME_WIDTH = 1000
export const GAME_HEIGHT = 700

export const SLOT_CONFIG = {
  reels: 5,
  rows: 3,

  startingBalance: 10000,

  defaultBet: 10,

  betOptions: [1, 2, 5, 10, 20, 50],

  // Chance per Free Spin for Naga Blessing.
  nagaBlessingChance: 0.18,

  maxFreeSpinMultiplier: 6,

  maxStickyWilds: 3,

  freeSpins: {
    threeScatters: 10,
    fourScatters: 15,
    fiveScatters: 20,
  },
}
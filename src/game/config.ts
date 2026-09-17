export const GAME_WIDTH = 1000
export const GAME_HEIGHT = 700

export const SLOT_CONFIG = {
  reels: 5,
  rows: 3,

  startingBalance: 10000,

  defaultBet: 10,

  betOptions: [1, 2, 5, 10, 20, 50],

  // Prototype chance:
  // 0.25 = 25% chance per Free Spin.
  nagaBlessingChance: 0.25,

  freeSpins: {
    threeScatters: 8,
    fourScatters: 12,
    fiveScatters: 15,
  },
}
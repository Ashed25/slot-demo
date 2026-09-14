export interface SymbolPayout {
  3: number
  4: number
  5: number
}

export const PAYTABLE: Record<string, SymbolPayout> = {
  naga: {
    3: 2,
    4: 5,
    5: 10,
  },

  elephant: {
    3: 1.8,
    4: 4,
    5: 8,
  },

  peacock: {
    3: 1.5,
    4: 3.5,
    5: 7,
  },

  ruby: {
    3: 1.2,
    4: 3,
    5: 6,
  },

  bell: {
    3: 1,
    4: 2.5,
    5: 5,
  },

  a: {
    3: 0.8,
    4: 2,
    5: 4,
  },

  k: {
    3: 0.7,
    4: 1.8,
    5: 3.5,
  },

  q: {
    3: 0.6,
    4: 1.5,
    5: 3,
  },

  j: {
    3: 0.5,
    4: 1.2,
    5: 2.5,
  },
}
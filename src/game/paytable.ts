export interface SymbolPayout {
  3: number
  4: number
  5: number
}

export const PAYTABLE: Record<
  string,
  SymbolPayout
> = {
  naga: {
    3: 94,
    4: 282,
    5: 705,
  },

  elephant: {
    3: 71,
    4: 188,
    5: 470,
  },

  peacock: {
    3: 56,
    4: 141,
    5: 353,
  },

  ruby: {
    3: 47,
    4: 118,
    5: 282,
  },

  bell: {
    3: 38,
    4: 85,
    5: 188,
  },

  a: {
    3: 28,
    4: 56,
    5: 118,
  },

  k: {
    3: 24,
    4: 47,
    5: 94,
  },

  q: {
    3: 19,
    4: 38,
    5: 71,
  },

  j: {
    3: 14,
    4: 28,
    5: 56,
  },
}
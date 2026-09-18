export interface SymbolPayout {
  3: number
  4: number
  5: number
}

export const PAYTABLE: Record<string, SymbolPayout> = {
  naga: { 3: 47, 4: 141, 5: 353 },
  elephant: { 3: 36, 4: 94, 5: 235 },
  peacock: { 3: 28, 4: 71, 5: 177 },
  ruby: { 3: 24, 4: 59, 5: 141 },
  bell: { 3: 19, 4: 43, 5: 94 },
  a: { 3: 14, 4: 28, 5: 59 },
  k: { 3: 12, 4: 24, 5: 47 },
  q: { 3: 10, 4: 19, 5: 36 },
  j: { 3: 7, 4: 14, 5: 28 },
}
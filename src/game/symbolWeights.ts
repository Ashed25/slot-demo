import { SLOT_SYMBOLS } from './symbols'
import type { SlotSymbolDefinition } from './symbols'

// -------------------------
// NORMAL SPIN WEIGHTS
// -------------------------
//
// Total = 1000
//
// Scatter = 30 / 1000 = 3%
// Wild    = 25 / 1000 = 2.5%

export const NORMAL_SYMBOL_WEIGHTS: Record<
  string,
  number
> = {
  j: 170,
  q: 155,
  k: 145,
  a: 130,

  bell: 100,
  ruby: 80,
  peacock: 65,
  elephant: 55,
  naga: 45,

  wild: 25,
  scatter: 30,
}

// -------------------------
// FREE SPIN WEIGHTS
// -------------------------
//
// Total = 1000
//
// Scatter = 15 / 1000 = 1.5%
// Wild    = 15 / 1000 = 1.5%

export const FREE_SPIN_SYMBOL_WEIGHTS: Record<
  string,
  number
> = {
  j: 160,
  q: 155,
  k: 145,
  a: 130,
  
  bell: 100,
  ruby: 80,
  peacock: 65,
  elephant: 55,
  naga: 45,

  wild: 25,
  scatter: 40,
}

// -------------------------
// WEIGHTED RANDOM SYMBOL
// -------------------------

export function getWeightedRandomSymbol(
  isFreeSpin: boolean,
): SlotSymbolDefinition {
  const weights = isFreeSpin
    ? FREE_SPIN_SYMBOL_WEIGHTS
    : NORMAL_SYMBOL_WEIGHTS

  let totalWeight = 0

  for (const symbol of SLOT_SYMBOLS) {
    totalWeight +=
      weights[symbol.id] ?? 0
  }

  const roll =
    Math.random() * totalWeight

  let cumulativeWeight = 0

  for (const symbol of SLOT_SYMBOLS) {
    cumulativeWeight +=
      weights[symbol.id] ?? 0

    if (roll < cumulativeWeight) {
      return symbol
    }
  }

  // Safety fallback
  return SLOT_SYMBOLS[0]
}
import { PAYLINES } from './paylines'
import { PAYTABLE } from './paytable'

export interface WinningPosition {
  reel: number
  row: number
}

export interface LineWin {
  paylineIndex: number
  symbolId: string
  matchCount: number
  multiplier: number
  payout: number
  positions: WinningPosition[]
}

export interface WinEvaluation {
  totalWin: number
  lineWins: LineWin[]
}

export function evaluateWins(
  board: string[][],
  bet: number,
): WinEvaluation {
  const lineWins: LineWin[] = []

  PAYLINES.forEach((payline, paylineIndex) => {
    const lineSymbols = payline.map(
      (row, reel) => board[reel][row],
    )

    // Scatter never behaves like a normal payline symbol.
    if (lineSymbols[0] === 'scatter') {
      return
    }

    // Find the first normal symbol.
    // This allows paylines beginning with one or more Wilds.
    const targetSymbol = lineSymbols.find(
      (symbol) =>
        symbol !== 'wild' &&
        symbol !== 'scatter',
    )

    // A line made entirely of Wild/Scatter currently has
    // no normal-symbol payout rule.
    if (!targetSymbol) {
      return
    }

    const symbolPaytable = PAYTABLE[targetSymbol]

    if (!symbolPaytable) {
      return
    }

    let matchCount = 0
    const positions: WinningPosition[] = []

    for (let reel = 0; reel < lineSymbols.length; reel += 1) {
      const symbol = lineSymbols[reel]

      if (
        symbol === targetSymbol ||
        symbol === 'wild'
      ) {
        matchCount += 1

        positions.push({
          reel,
          row: payline[reel],
        })

        continue
      }

      break
    }

    if (matchCount < 3) {
      return
    }

    const validMatchCount = matchCount as 3 | 4 | 5

    const multiplier =
      symbolPaytable[validMatchCount]

    const payout = bet * multiplier

    lineWins.push({
      paylineIndex,
      symbolId: targetSymbol,
      matchCount,
      multiplier,
      payout,
      positions,
    })
  })

  const totalWin = lineWins.reduce(
    (total, lineWin) => total + lineWin.payout,
    0,
  )

  return {
    totalWin,
    lineWins,
  }
}
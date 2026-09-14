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
    const firstRow = payline[0]
    const firstSymbol = board[0][firstRow]

    // Wild and Scatter get special logic on Day 4.
    // If the first symbol has no normal paytable entry,
    // this line is ignored for now.
    const symbolPaytable = PAYTABLE[firstSymbol]

    if (!symbolPaytable) {
      return
    }

    let matchCount = 1

    const positions: WinningPosition[] = [
      {
        reel: 0,
        row: firstRow,
      },
    ]

    // Check reels 2–5 from left to right.
    for (let reel = 1; reel < payline.length; reel += 1) {
      const row = payline[reel]
      const symbol = board[reel][row]

      if (symbol === firstSymbol) {
        matchCount += 1

        positions.push({
          reel,
          row,
        })
      } else {
        break
      }
    }

    // Normal symbols only pay for 3, 4 or 5 matches.
    if (matchCount < 3) {
      return
    }

    const validMatchCount = matchCount as 3 | 4 | 5

    const multiplier =
      symbolPaytable[validMatchCount]

    const payout = bet * multiplier

    lineWins.push({
      paylineIndex,
      symbolId: firstSymbol,
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
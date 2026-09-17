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
  totalBet: number,
): WinEvaluation {
  const lineWins: LineWin[] = []

  // IMPORTANT:
  // The player's selected BET is now the
  // TOTAL wager across all paylines.
  const betPerLine =
    totalBet / PAYLINES.length

  PAYLINES.forEach(
    (payline, paylineIndex) => {
      const lineSymbols =
        payline.map(
          (row, reel) =>
            board[reel][row],
        )

      // Scatter cannot initiate
      // a normal line win.
      if (
        lineSymbols[0] ===
        'scatter'
      ) {
        return
      }

      // Find first normal symbol.
      // This allows:
      //
      // WILD WILD RUBY RUBY ...
      //
      // to use Ruby as the target.
      const targetSymbol =
        lineSymbols.find(
          (symbol) =>
            symbol !== 'wild' &&
            symbol !== 'scatter',
        )

      if (!targetSymbol) {
        return
      }

      const symbolPaytable =
        PAYTABLE[targetSymbol]

      if (!symbolPaytable) {
        return
      }

      let matchCount = 0

      const positions:
        WinningPosition[] = []

      for (
        let reel = 0;
        reel < lineSymbols.length;
        reel += 1
      ) {
        const symbol =
          lineSymbols[reel]

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

      const validMatchCount =
        matchCount as
          | 3
          | 4
          | 5

      const multiplier =
        symbolPaytable[
          validMatchCount
        ]

      const payout =
        Number(
          (
            betPerLine *
            multiplier
          ).toFixed(2),
        )

      lineWins.push({
        paylineIndex,
        symbolId:
          targetSymbol,
        matchCount,
        multiplier,
        payout,
        positions,
      })
    },
  )

  const totalWin =
    Number(
      lineWins
        .reduce(
          (
            total,
            lineWin,
          ) =>
            total +
            lineWin.payout,
          0,
        )
        .toFixed(2),
    )

  return {
    totalWin,
    lineWins,
  }
}
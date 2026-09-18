import { SLOT_SYMBOLS } from './symbols'
import {
  getWeightedRandomSymbol,
} from './symbolWeights'
import { SLOT_CONFIG } from './config'
import { evaluateWins } from './winEvaluator'

const SIMULATION_SPINS = 1_000_000
const BET = 10

type Board = string[][]

type Position = {
  reel: number
  row: number
}

type SimulationStats = {
  totalPaidSpins: number
  totalWagered: number

  normalWins: number
  normalWinAmount: number

  bonusTriggers: number
  bonusRetriggers: number

  totalFreeSpinsAwarded: number
  totalFreeSpinsPlayed: number

  totalBonusWin: number

  biggestWin: number

  multiplierUsage: Record<number, number>

  stickyWildEvents: number
  totalStickyWildsCreated: number
}

function generateBoard(
  isFreeSpin = false,
): Board {
  const board: Board = []

  for (
    let reel = 0;
    reel < SLOT_CONFIG.reels;
    reel += 1
  ) {
    board[reel] = []

    for (
      let row = 0;
      row < SLOT_CONFIG.rows;
      row += 1
    ) {
      board[reel][row] =
        getWeightedRandomSymbol(
          isFreeSpin,
        ).id
    }
  }

  return board
}

function countScatters(
  board: Board,
): number {
  let count = 0

  for (
    let reel = 0;
    reel < SLOT_CONFIG.reels;
    reel += 1
  ) {
    for (
      let row = 0;
      row < SLOT_CONFIG.rows;
      row += 1
    ) {
      if (
        board[reel][row] ===
        'scatter'
      ) {
        count += 1
      }
    }
  }

  return count
}

function getFreeSpinAward(
  scatterCount: number,
): number {
  if (
    scatterCount >= 5
  ) {
    return SLOT_CONFIG.freeSpins
      .fiveScatters
  }

  if (
    scatterCount === 4
  ) {
    return SLOT_CONFIG.freeSpins
      .fourScatters
  }

  if (
    scatterCount === 3
  ) {
    return SLOT_CONFIG.freeSpins
      .threeScatters
  }

  return 0
}

function getPositionKey(
  position: Position,
): string {
  return `${position.reel}-${position.row}`
}

function getRandomCandidate(
  board: Board,
  stickyWilds: Set<string>,
): Position | null {
  const candidates: Position[] = []

  for (
    let reel = 0;
    reel < SLOT_CONFIG.reels;
    reel += 1
  ) {
    for (
      let row = 0;
      row < SLOT_CONFIG.rows;
      row += 1
    ) {
      const key =
        getPositionKey({
          reel,
          row,
        })

      const symbol =
        board[reel][row]

      if (
        symbol !== 'wild' &&
        symbol !== 'scatter' &&
        !stickyWilds.has(key)
      ) {
        candidates.push({
          reel,
          row,
        })
      }
    }
  }

  if (
    candidates.length === 0
  ) {
    return null
  }

  return candidates[
    Math.floor(
      Math.random() *
        candidates.length,
    )
  ]
}

function createGuaranteedStickyWild(
  board: Board,
  stickyWilds: Set<string>,
): boolean {
  if (
    stickyWilds.size >=
    SLOT_CONFIG.maxStickyWilds
  ) {
    return false
  }

  const position =
    getRandomCandidate(
      board,
      stickyWilds,
    )

  if (!position) {
    return false
  }

  const key =
    getPositionKey(position)

  stickyWilds.add(key)

  board[position.reel][
    position.row
  ] = 'wild'

  return true
}

function applyNagaBlessing(
  board: Board,
  stickyWilds: Set<string>,
  guaranteed = false,
): boolean {
  if (
    stickyWilds.size >=
    SLOT_CONFIG.maxStickyWilds
  ) {
    return false
  }

  if (
    !guaranteed &&
    Math.random() >=
      SLOT_CONFIG.nagaBlessingChance
  ) {
    return false
  }

  const position =
    getRandomCandidate(
      board,
      stickyWilds,
    )

  if (!position) {
    return false
  }

  const key =
    getPositionKey(position)

  stickyWilds.add(key)

  board[position.reel][
    position.row
  ] = 'wild'

  return true
}

function applyExistingStickyWilds(
  board: Board,
  stickyWilds: Set<string>,
): void {
  for (
    const key of stickyWilds
  ) {
    const [
      reelText,
      rowText,
    ] = key.split('-')

    const reel =
      Number(reelText)

    const row =
      Number(rowText)

    board[reel][row] =
      'wild'
  }
}

function createStats(): SimulationStats {
  const multiplierUsage: Record<
    number,
    number
  > = {}

  for (
    let multiplier = 1;
    multiplier <=
    SLOT_CONFIG.maxFreeSpinMultiplier;
    multiplier += 1
  ) {
    multiplierUsage[multiplier] = 0
  }

  return {
    totalPaidSpins: 0,
    totalWagered: 0,

    normalWins: 0,
    normalWinAmount: 0,

    bonusTriggers: 0,
    bonusRetriggers: 0,

    totalFreeSpinsAwarded: 0,
    totalFreeSpinsPlayed: 0,

    totalBonusWin: 0,

    biggestWin: 0,

    multiplierUsage,

    stickyWildEvents: 0,
    totalStickyWildsCreated: 0,
  }
}

function recordBiggestWin(
  stats: SimulationStats,
  win: number,
): void {
  if (
    win > stats.biggestWin
  ) {
    stats.biggestWin = win
  }
}

function simulateBonus(
  stats: SimulationStats,
  startingFreeSpins: number,
  startingBoard: Board,
): number {
  let freeSpinsRemaining =
    startingFreeSpins

  let multiplier = 1

  let bonusWin = 0

  const stickyWilds =
    new Set<string>()

  // The actual game guarantees
  // the first Sticky Wild before
  // the Free Spins begin.
  if (
    createGuaranteedStickyWild(
      startingBoard,
      stickyWilds,
    )
  ) {
    stats.stickyWildEvents += 1
    stats.totalStickyWildsCreated += 1
  }

  while (
    freeSpinsRemaining > 0
  ) {
    freeSpinsRemaining -= 1

    stats.totalFreeSpinsPlayed += 1

    const board =
      generateBoard(true)

    // Existing Sticky Wilds survive
    // into the new Free Spin.
    applyExistingStickyWilds(
      board,
      stickyWilds,
    )

    // Naga Blessing happens after
    // the reel result is generated
    // and before evaluation.
    const blessingActivated =
      applyNagaBlessing(
        board,
        stickyWilds,
        false,
      )

    if (
      blessingActivated
    ) {
      stats.stickyWildEvents += 1
      stats.totalStickyWildsCreated += 1
    }

    // IMPORTANT:
    // Use the exact same evaluator
    // as the real game.
    const baseWin =
      evaluateWins(
        board,
        BET,
      ).totalWin

    let spinWin = 0

    if (
      baseWin > 0
    ) {
      // Free Spin payout:
      //
      // base win
      // × bonus-only 1.25 multiplier
      // × current Free Spin multiplier
      spinWin =
        Number(
          (
            baseWin *
            SLOT_CONFIG
              .freeSpinPayoutMultiplier *
            multiplier
          ).toFixed(2),
        )

      stats.multiplierUsage[
        multiplier
      ] += 1

      multiplier =
        Math.min(
          multiplier + 1,
          SLOT_CONFIG
            .maxFreeSpinMultiplier,
        )
    }

    bonusWin +=
      spinWin

    recordBiggestWin(
      stats,
      spinWin,
    )

    // Check for retrigger.
    const scatterCount =
      countScatters(board)

    const additionalFreeSpins =
      getFreeSpinAward(
        scatterCount,
      )

    if (
      additionalFreeSpins > 0
    ) {
      freeSpinsRemaining +=
        additionalFreeSpins

      stats.bonusRetriggers += 1

      stats.totalFreeSpinsAwarded +=
        additionalFreeSpins
    }
  }

  return Number(
    bonusWin.toFixed(2),
  )
}

function runSimulation(): void {
  const stats =
    createStats()

  for (
    let spin = 0;
    spin < SIMULATION_SPINS;
    spin += 1
  ) {
    stats.totalPaidSpins += 1
    stats.totalWagered += BET

    // ==========================
    // NORMAL SPIN
    // ==========================

    const board =
      generateBoard(false)

    const normalWin =
      evaluateWins(
        board,
        BET,
      ).totalWin

    if (
      normalWin > 0
    ) {
      stats.normalWins += 1

      stats.normalWinAmount +=
        normalWin

      recordBiggestWin(
        stats,
        normalWin,
      )
    }

    // ==========================
    // SCATTER / BONUS TRIGGER
    // ==========================

    const scatterCount =
      countScatters(board)

    const freeSpins =
      getFreeSpinAward(
        scatterCount,
      )

    if (
      freeSpins > 0
    ) {
      stats.bonusTriggers += 1

      stats.totalFreeSpinsAwarded +=
        freeSpins

      const bonusWin =
        simulateBonus(
          stats,
          freeSpins,
          board,
        )

      stats.totalBonusWin +=
        bonusWin
    }
  }

  const totalReturned =
    stats.normalWinAmount +
    stats.totalBonusWin

  const rtp =
    (
      totalReturned /
      stats.totalWagered
    ) * 100

  const hitRate =
    (
      stats.normalWins /
      stats.totalPaidSpins
    ) * 100

  const bonusFrequency =
    (
      stats.bonusTriggers /
      stats.totalPaidSpins
    ) * 100

  const averageBonusWin =
    stats.bonusTriggers > 0
      ? stats.totalBonusWin /
        stats.bonusTriggers
      : 0

  const averageFreeSpins =
    stats.bonusTriggers > 0
      ? stats.totalFreeSpinsPlayed /
        stats.bonusTriggers
      : 0

  const averageAwardedFreeSpins =
    stats.bonusTriggers > 0
      ? stats.totalFreeSpinsAwarded /
        stats.bonusTriggers
      : 0

  const bonusRtp =
    (
      stats.totalBonusWin /
      stats.totalWagered
    ) * 100

  console.log(
    '======================================',
  )

  console.log(
    '     GOLDEN NAGA — DAY 7 SIM',
  )

  console.log(
    '======================================',
  )

  console.log(
    `Paid spins:          ${stats.totalPaidSpins.toLocaleString()}`,
  )

  console.log(
    `Bet per spin:        ${BET}`,
  )

  console.log(
    `Total wagered:       ${stats.totalWagered.toFixed(2)}`,
  )

  console.log(
    `Normal win amount:   ${stats.normalWinAmount.toFixed(2)}`,
  )

  console.log(
    `Bonus win amount:    ${stats.totalBonusWin.toFixed(2)}`,
  )

  console.log(
    `Total returned:      ${totalReturned.toFixed(2)}`,
  )

  console.log(
    `RTP:                 ${rtp.toFixed(2)}%`,
  )

  console.log(
    `Normal hit rate:     ${hitRate.toFixed(2)}%`,
  )

  console.log(
    `Bonus triggers:      ${stats.bonusTriggers}`,
  )

  console.log(
    `Bonus frequency:     ${bonusFrequency.toFixed(2)}%`,
  )

  console.log(
    `Retriggers:          ${stats.bonusRetriggers}`,
  )

  console.log(
    `Free spins awarded:  ${stats.totalFreeSpinsAwarded}`,
  )

  console.log(
    `Free spins played:   ${stats.totalFreeSpinsPlayed}`,
  )

  console.log(
    `Avg awarded spins:   ${averageAwardedFreeSpins.toFixed(2)}`,
  )

  console.log(
    `Avg played spins:    ${averageFreeSpins.toFixed(2)}`,
  )

  console.log(
    `Average bonus win:   ${averageBonusWin.toFixed(2)}`,
  )

  console.log(
    `Bonus RTP:           ${bonusRtp.toFixed(2)}%`,
  )

  console.log(
    `Biggest win:         ${stats.biggestWin.toFixed(2)}`,
  )

  console.log(
    `Sticky Wild events:  ${stats.stickyWildEvents}`,
  )

  console.log(
    `Sticky Wilds made:   ${stats.totalStickyWildsCreated}`,
  )

  console.log(
    '--------------------------------------',
  )

  console.log(
    'Multiplier usage:',
  )

  for (
    let multiplier = 1;
    multiplier <=
    SLOT_CONFIG.maxFreeSpinMultiplier;
    multiplier += 1
  ) {
    console.log(
      `  ×${multiplier}:              ${stats.multiplierUsage[multiplier]}`,
    )
  }

  console.log(
    '======================================',
  )
}

runSimulation()
import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, SLOT_CONFIG } from '../game/config'
import { SLOT_SYMBOLS } from '../game/symbols'
import { evaluateWins } from '../game/winEvaluator'

export default class SlotScene extends Phaser.Scene {
  private balance = SLOT_CONFIG.startingBalance
  private bet = SLOT_CONFIG.defaultBet
  private win = 0

  private isSpinning = false

  private freeSpinsRemaining = 0
  private isFreeSpinMode = false

  // Visible slot symbols.
  // Structure: [reel][row]
  private symbolTexts: Phaser.GameObjects.Text[][] = []

  // Internal board result.
  // Structure: [reel][row]
  private currentBoard: string[][] = []

  constructor() {
    super('SlotScene')
  }

  create(): void {
    this.createBackground()
    this.createHeader()
    this.createSlotMachine()
    this.createControlPanel()
  }

  private createBackground(): void {
    this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x09090d,
    )
  }

  private createHeader(): void {
    this.add
      .text(GAME_WIDTH / 2, 50, 'GOLDEN NAGA', {
        fontFamily: 'Arial',
        fontSize: '46px',
        color: '#f5f5f5',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.add
      .text(GAME_WIDTH / 2, 95, 'Custom Slot Demo', {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5)
  }

  private createSlotMachine(): void {
    const reelWidth = 135
    const symbolHeight = 120

    const totalWidth = reelWidth * SLOT_CONFIG.reels
    const totalHeight = symbolHeight * SLOT_CONFIG.rows

    const startX = (GAME_WIDTH - totalWidth) / 2
    const startY = 150

    this.add
      .rectangle(
        GAME_WIDTH / 2,
        startY + totalHeight / 2,
        totalWidth + 30,
        totalHeight + 30,
        0x1a1a20,
      )
      .setStrokeStyle(4, 0x55555f)

    this.symbolTexts = []
    this.currentBoard = []

    for (let reel = 0; reel < SLOT_CONFIG.reels; reel += 1) {
      const reelTexts: Phaser.GameObjects.Text[] = []
      const reelData: string[] = []

      for (let row = 0; row < SLOT_CONFIG.rows; row += 1) {
        const x = startX + reel * reelWidth + reelWidth / 2
        const y = startY + row * symbolHeight + symbolHeight / 2

        const symbol = this.getRandomSymbol()

        reelData.push(symbol.id)

        this.add
          .rectangle(
            x,
            y,
            reelWidth - 8,
            symbolHeight - 8,
            0x292932,
          )
          .setStrokeStyle(2, 0x4c4c58)

        const symbolText = this.add
          .text(x, y, symbol.label, {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center',
          })
          .setOrigin(0.5)

        reelTexts.push(symbolText)
      }

      this.symbolTexts.push(reelTexts)
      this.currentBoard.push(reelData)
    }
  }

  private createControlPanel(): void {
    const panelY = 610

    const balanceText = this.add
      .text(110, panelY, `BALANCE\n${this.balance.toLocaleString()}`, {
        fontFamily: 'Arial',
        fontSize: '19px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5)

    const betText = this.add
      .text(330, panelY, `BET\n${this.bet}`, {
        fontFamily: 'Arial',
        fontSize: '19px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5)

    const winText = this.add
      .text(535, panelY, `WIN\n${this.win}`, {
        fontFamily: 'Arial',
        fontSize: '19px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5)

    const freeSpinText = this.add
      .text(675, panelY, 'FREE SPINS\n0', {
        fontFamily: 'Arial',
        fontSize: '17px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5)

    const statusText = this.add
      .text(GAME_WIDTH / 2, 675, 'READY', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#999999',
      })
      .setOrigin(0.5)

    const betOptions = SLOT_CONFIG.betOptions
    let betIndex = betOptions.indexOf(this.bet)

    const minusButton = this.add
      .rectangle(245, panelY, 50, 50, 0x34343d)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({
        useHandCursor: true,
      })

    this.add
      .text(245, panelY, '-', {
        fontFamily: 'Arial',
        fontSize: '30px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    const plusButton = this.add
      .rectangle(415, panelY, 50, 50, 0x34343d)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({
        useHandCursor: true,
      })

    this.add
      .text(415, panelY, '+', {
        fontFamily: 'Arial',
        fontSize: '28px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    minusButton.on('pointerdown', () => {
      if (this.isSpinning || this.isFreeSpinMode) {
        return
      }

      if (betIndex > 0) {
        betIndex -= 1
        this.bet = betOptions[betIndex]

        betText.setText(`BET\n${this.bet}`)
        statusText.setText(`BET CHANGED TO ${this.bet}`)
      }
    })

    plusButton.on('pointerdown', () => {
      if (this.isSpinning || this.isFreeSpinMode) {
        return
      }

      if (betIndex < betOptions.length - 1) {
        betIndex += 1
        this.bet = betOptions[betIndex]

        betText.setText(`BET\n${this.bet}`)
        statusText.setText(`BET CHANGED TO ${this.bet}`)
      }
    })

    minusButton.on('pointerover', () => {
      if (!this.isSpinning && !this.isFreeSpinMode) {
        minusButton.setFillStyle(0x50505c)
      }
    })

    minusButton.on('pointerout', () => {
      minusButton.setFillStyle(0x34343d)
    })

    plusButton.on('pointerover', () => {
      if (!this.isSpinning && !this.isFreeSpinMode) {
        plusButton.setFillStyle(0x50505c)
      }
    })

    plusButton.on('pointerout', () => {
      plusButton.setFillStyle(0x34343d)
    })

    const spinButton = this.add
      .rectangle(850, panelY, 140, 70, 0x34343d)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({
        useHandCursor: true,
      })

    this.add
      .text(850, panelY, 'SPIN', {
        fontFamily: 'Arial',
        fontSize: '26px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    spinButton.on('pointerover', () => {
      if (!this.isSpinning && !this.isFreeSpinMode) {
        spinButton.setFillStyle(0x50505c)
      }
    })

    spinButton.on('pointerout', () => {
      if (!this.isSpinning) {
        spinButton.setFillStyle(0x34343d)
      }
    })

    spinButton.on('pointerdown', () => {
      if (this.isSpinning || this.isFreeSpinMode) {
        return
      }

      if (this.balance < this.bet) {
        statusText.setText('NOT ENOUGH BALANCE')
        return
      }

      // Normal spins deduct the bet.
      this.balance -= this.bet
      this.win = 0

      balanceText.setText(
        `BALANCE\n${this.balance.toLocaleString()}`,
      )

      winText.setText('WIN\n0')

      this.clearWinHighlights()

      this.startSpin(
        spinButton,
        statusText,
        balanceText,
        winText,
        freeSpinText,
        false,
      )
    })
  }

  // -------------------------
  // RANDOM SYMBOL
  // -------------------------

  private getRandomSymbol() {
    const randomIndex = Phaser.Math.Between(
      0,
      SLOT_SYMBOLS.length - 1,
    )

    return SLOT_SYMBOLS[randomIndex]
  }

  // -------------------------
  // SCATTER SYSTEM
  // -------------------------

  private countScatters(): number {
    let scatterCount = 0

    for (const reel of this.currentBoard) {
      for (const symbol of reel) {
        if (symbol === 'scatter') {
          scatterCount += 1
        }
      }
    }

    return scatterCount
  }

  private calculateFreeSpinAward(
    scatterCount: number,
  ): number {
    if (scatterCount >= 5) {
      return SLOT_CONFIG.freeSpins.fiveScatters
    }

    if (scatterCount === 4) {
      return SLOT_CONFIG.freeSpins.fourScatters
    }

    if (scatterCount === 3) {
      return SLOT_CONFIG.freeSpins.threeScatters
    }

    return 0
  }

  // -------------------------
  // DEBUG BOARD
  // -------------------------

  private printBoardToConsole(): void {
    console.table(
      this.currentBoard.map((reel, reelIndex) => ({
        reel: reelIndex + 1,
        row1: reel[0],
        row2: reel[1],
        row3: reel[2],
      })),
    )
  }

  // -------------------------
  // DAY 3 TEST BOARD
  // -------------------------

  private loadTestWinBoard(): void {
    const testBoard = [
      ['ruby', 'a', 'k'],
      ['ruby', 'q', 'j'],
      ['ruby', 'bell', 'a'],
      ['ruby', 'naga', 'k'],
      ['j', 'peacock', 'q'],
    ]

    this.currentBoard = testBoard

    this.updateVisibleBoard()
  }
  
  private loadTestScatterBoard(): void {
  const testBoard = [
    ['scatter', 'a', 'k'],
    ['ruby', 'q', 'scatter'],
    ['bell', 'naga', 'j'],
    ['peacock', 'a', 'k'],
    ['q', 'scatter', 'ruby'],
  ]

  this.currentBoard = testBoard

  this.updateVisibleBoard()
}
  private loadTestWildBoard(): void {
  const testBoard = [
    ['ruby', 'a', 'k'],
    ['wild', 'q', 'j'],
    ['ruby', 'bell', 'a'],
    ['ruby', 'naga', 'k'],
    ['j', 'peacock', 'q'],
  ]

  this.currentBoard = testBoard

  this.updateVisibleBoard()
}

  private updateVisibleBoard(): void {
    for (let reel = 0; reel < SLOT_CONFIG.reels; reel += 1) {
      for (let row = 0; row < SLOT_CONFIG.rows; row += 1) {
        const symbolId =
          this.currentBoard[reel][row]

        const symbol = SLOT_SYMBOLS.find(
          (item) => item.id === symbolId,
        )

        if (!symbol) {
          continue
        }

        this.symbolTexts[reel][row].setText(
          symbol.label,
        )
      }
    }
  }

  // -------------------------
  // NORMAL / FREE SPIN ENGINE
  // -------------------------

  private startSpin(
    spinButton: Phaser.GameObjects.Rectangle,
    statusText: Phaser.GameObjects.Text,
    balanceText: Phaser.GameObjects.Text,
    winText: Phaser.GameObjects.Text,
    freeSpinText: Phaser.GameObjects.Text,
    isFreeSpin: boolean,
  ): void {
    this.isSpinning = true

    if (isFreeSpin) {
      statusText.setText('FREE SPIN...')
    } else {
      statusText.setText('SPINNING...')
    }

    spinButton.setFillStyle(0x202026)

    const spinTimers: Phaser.Time.TimerEvent[] = []

    for (let reel = 0; reel < SLOT_CONFIG.reels; reel += 1) {
      const timer = this.time.addEvent({
        delay: 80,
        loop: true,

        callback: () => {
          for (let row = 0; row < SLOT_CONFIG.rows; row += 1) {
            const symbol = this.getRandomSymbol()

            this.symbolTexts[reel][row].setText(
              symbol.label,
            )
          }
        },
      })

      spinTimers.push(timer)

      const stopDelay = 900 + reel * 300

      this.time.delayedCall(stopDelay, () => {
        spinTimers[reel].remove(false)

        for (let row = 0; row < SLOT_CONFIG.rows; row += 1) {
          const finalSymbol = this.getRandomSymbol()

          this.currentBoard[reel][row] =
            finalSymbol.id

          this.symbolTexts[reel][row].setText(
            finalSymbol.label,
          )
        }

        if (reel === SLOT_CONFIG.reels - 1) {
          this.finishSpin(
            spinButton,
            statusText,
            balanceText,
            winText,
            freeSpinText,
            isFreeSpin,
          )
        }
      })
    }
  }

  // -------------------------
  // FINISH ROUND
  // -------------------------

  private finishSpin(
    spinButton: Phaser.GameObjects.Rectangle,
    statusText: Phaser.GameObjects.Text,
    balanceText: Phaser.GameObjects.Text,
    winText: Phaser.GameObjects.Text,
    freeSpinText: Phaser.GameObjects.Text,
    isFreeSpin: boolean,
  ): void {
    const evaluation = evaluateWins(
      this.currentBoard,
      this.bet,
    )

    this.win = evaluation.totalWin
    this.balance += this.win

    balanceText.setText(
      `BALANCE\n${this.balance.toLocaleString()}`,
    )

    winText.setText(
      `WIN\n${this.win.toFixed(2)}`,
    )

    this.highlightWins(evaluation.lineWins)

    // Count Scatter symbols anywhere on the board.
    const scatterCount = this.countScatters()

    const awardedFreeSpins =
      this.calculateFreeSpinAward(scatterCount)

    // Free Spins can also retrigger additional Free Spins.
    if (awardedFreeSpins > 0) {
      this.freeSpinsRemaining +=
        awardedFreeSpins

      this.isFreeSpinMode = true

      freeSpinText.setText(
        `FREE SPINS\n${this.freeSpinsRemaining}`,
      )
    }

    this.isSpinning = false

    spinButton.setFillStyle(0x34343d)

    this.printBoardToConsole()

    console.log(
      'Win evaluation:',
      evaluation,
    )

    console.log(
      'Scatter count:',
      scatterCount,
    )

    console.log(
      'Free Spins awarded:',
      awardedFreeSpins,
    )

    // If Free Spins are available, continue automatically.
    if (
      this.isFreeSpinMode &&
      this.freeSpinsRemaining > 0
    ) {
      if (awardedFreeSpins > 0) {
        statusText.setText(
          `${scatterCount} SCATTERS — +${awardedFreeSpins} FREE SPINS!`,
        )
      } else if (this.win > 0) {
        statusText.setText(
          `FREE SPIN WIN ${this.win.toFixed(2)}`,
        )
      } else {
        statusText.setText('FREE SPIN COMPLETE')
      }

      this.time.delayedCall(1200, () => {
        this.startFreeSpin(
          spinButton,
          statusText,
          balanceText,
          winText,
          freeSpinText,
        )
      })

      return
    }

    // No more Free Spins.
    if (isFreeSpin) {
      this.isFreeSpinMode = false

      freeSpinText.setText('FREE SPINS\n0')

      if (this.win > 0) {
        statusText.setText(
          `FINAL FREE SPIN WIN ${this.win.toFixed(2)}`,
        )
      } else {
        statusText.setText(
          'FREE SPINS COMPLETE',
        )
      }

      this.time.delayedCall(1200, () => {
        statusText.setText('READY')
      })

      return
    }

    // Normal spin with no Free Spin trigger.
    if (this.win > 0) {
      statusText.setText(
        `WIN ${this.win.toFixed(2)} — ${evaluation.lineWins.length} LINE(S)`,
      )
    } else {
      statusText.setText('NO WIN')
    }

    this.time.delayedCall(1200, () => {
      statusText.setText('READY')
    })
  }

  // -------------------------
  // FREE SPINS
  // -------------------------

  private startFreeSpin(
    spinButton: Phaser.GameObjects.Rectangle,
    statusText: Phaser.GameObjects.Text,
    balanceText: Phaser.GameObjects.Text,
    winText: Phaser.GameObjects.Text,
    freeSpinText: Phaser.GameObjects.Text,
  ): void {
    if (this.freeSpinsRemaining <= 0) {
      this.isFreeSpinMode = false

      freeSpinText.setText('FREE SPINS\n0')
      statusText.setText('READY')

      return
    }

    // Consume one Free Spin.
    this.freeSpinsRemaining -= 1

    freeSpinText.setText(
      `FREE SPINS\n${this.freeSpinsRemaining}`,
    )

    this.win = 0

    winText.setText('WIN\n0')

    this.clearWinHighlights()

    // IMPORTANT:
    // No balance deduction happens here.
    this.startSpin(
      spinButton,
      statusText,
      balanceText,
      winText,
      freeSpinText,
      true,
    )
  }

  // -------------------------
  // WIN HIGHLIGHTING
  // -------------------------

  private clearWinHighlights(): void {
    for (const reel of this.symbolTexts) {
      for (const symbolText of reel) {
        symbolText.setColor('#ffffff')
        symbolText.setScale(1)
      }
    }
  }

  private highlightWins(
    lineWins: ReturnType<typeof evaluateWins>['lineWins'],
  ): void {
    const highlighted = new Set<string>()

    for (const lineWin of lineWins) {
      for (const position of lineWin.positions) {
        const key =
          `${position.reel}-${position.row}`

        if (highlighted.has(key)) {
          continue
        }

        highlighted.add(key)

        const symbolText =
          this.symbolTexts[position.reel][position.row]

        symbolText.setColor('#ffd54a')
        symbolText.setScale(1.12)
      }
    }
  }
}
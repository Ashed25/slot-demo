import Phaser from 'phaser'
import { GAME_HEIGHT, GAME_WIDTH, SLOT_CONFIG } from '../game/config'
import { SLOT_SYMBOLS } from '../game/symbols'

export default class SlotScene extends Phaser.Scene {
  private balance = SLOT_CONFIG.startingBalance
  private bet = SLOT_CONFIG.defaultBet
  private win = 0

  private isSpinning = false

  // Stores the visible symbol text objects.
  // Structure: [reel][row]
  private symbolTexts: Phaser.GameObjects.Text[][] = []
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
      .text(140, panelY, `BALANCE\n${this.balance.toLocaleString()}`, {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5)

    const betText = this.add
      .text(370, panelY, `BET\n${this.bet}`, {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5)

    const winText = this.add
      .text(570, panelY, `WIN\n${this.win}`, {
        fontFamily: 'Arial',
        fontSize: '20px',
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
      .rectangle(285, panelY, 55, 55, 0x34343d)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({
        useHandCursor: true,
      })

    this.add
      .text(285, panelY, '-', {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    const plusButton = this.add
      .rectangle(455, panelY, 55, 55, 0x34343d)
      .setStrokeStyle(2, 0xffffff)
      .setInteractive({
        useHandCursor: true,
      })

    this.add
      .text(455, panelY, '+', {
        fontFamily: 'Arial',
        fontSize: '30px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    minusButton.on('pointerdown', () => {
      if (this.isSpinning) {
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
      if (this.isSpinning) {
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
      minusButton.setFillStyle(0x50505c)
    })

    minusButton.on('pointerout', () => {
      minusButton.setFillStyle(0x34343d)
    })

    plusButton.on('pointerover', () => {
      plusButton.setFillStyle(0x50505c)
    })

    plusButton.on('pointerout', () => {
      plusButton.setFillStyle(0x34343d)
    })

    const spinButton = this.add
      .rectangle(820, panelY, 150, 70, 0x34343d)
      .setStrokeStyle(3, 0xffffff)
      .setInteractive({
        useHandCursor: true,
      })

    this.add
      .text(820, panelY, 'SPIN', {
        fontFamily: 'Arial',
        fontSize: '26px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    spinButton.on('pointerover', () => {
      if (!this.isSpinning) {
        spinButton.setFillStyle(0x50505c)
      }
    })

    spinButton.on('pointerout', () => {
      if (!this.isSpinning) {
        spinButton.setFillStyle(0x34343d)
      }
    })

    spinButton.on('pointerdown', () => {
      if (this.isSpinning) {
        return
      }

      this.startSpin(spinButton, statusText)
    })

    void balanceText
    void winText
  }

  private getRandomSymbol() {
    const randomIndex = Phaser.Math.Between(
      0,
      SLOT_SYMBOLS.length - 1,
    )

    return SLOT_SYMBOLS[randomIndex]
  }
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

  private startSpin(
    spinButton: Phaser.GameObjects.Rectangle,
    statusText: Phaser.GameObjects.Text,
  ): void {
    this.isSpinning = true

    statusText.setText('SPINNING...')
    spinButton.setFillStyle(0x202026)

    const spinTimers: Phaser.Time.TimerEvent[] = []

    for (let reel = 0; reel < SLOT_CONFIG.reels; reel += 1) {
      const timer = this.time.addEvent({
        delay: 80,
        loop: true,

        callback: () => {
          for (let row = 0; row < SLOT_CONFIG.rows; row += 1) {
            const symbol = this.getRandomSymbol()

            this.symbolTexts[reel][row].setText(symbol.label)
          }
        },
      })

      spinTimers.push(timer)

      const stopDelay = 900 + reel * 300

      this.time.delayedCall(stopDelay, () => {
        spinTimers[reel].remove(false)

        for (let row = 0; row < SLOT_CONFIG.rows; row += 1) {
          const finalSymbol = this.getRandomSymbol()

          this.currentBoard[reel][row] = finalSymbol.id

          this.symbolTexts[reel][row].setText(finalSymbol.label)
        }

        if (reel === SLOT_CONFIG.reels - 1) {
          this.finishSpin(spinButton, statusText)
        }
      })
    }
  }

  private finishSpin(
    spinButton: Phaser.GameObjects.Rectangle,
    statusText: Phaser.GameObjects.Text,
  ): void {
    this.isSpinning = false

    spinButton.setFillStyle(0x34343d)

    statusText.setText('SPIN COMPLETE')

    this.printBoardToConsole()
    
    this.time.delayedCall(600, () => {
      statusText.setText('READY')
    })
  }
}
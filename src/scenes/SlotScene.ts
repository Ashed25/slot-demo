import Phaser from 'phaser'

import {
  GAME_HEIGHT,
  GAME_WIDTH,
  SLOT_CONFIG,
} from '../game/config'

import { SLOT_SYMBOLS } from '../game/symbols'
import { evaluateWins } from '../game/winEvaluator'

export default class SlotScene extends Phaser.Scene {
  private balance = SLOT_CONFIG.startingBalance
  private bet = SLOT_CONFIG.defaultBet
  private win = 0

  private isSpinning = false

  // -------------------------
  // FREE SPIN STATE
  // -------------------------

  private freeSpinsRemaining = 0
  private isFreeSpinMode = false
  private freeSpinMultiplier = 1

  // Structure: [reel][row]
  private symbolTexts: Phaser.GameObjects.Text[][] = []

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

  // -------------------------
  // BACKGROUND
  // -------------------------

  private createBackground(): void {
    this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x09090d,
    )
  }

  // -------------------------
  // HEADER
  // -------------------------

  private createHeader(): void {
    this.add
      .text(
        GAME_WIDTH / 2,
        48,
        'GOLDEN NAGA',
        {
          fontFamily: 'Arial',
          fontSize: '46px',
          color: '#ffd54a',
          fontStyle: 'bold',
          stroke: '#5c3b00',
          strokeThickness: 4,
        },
      )
      .setOrigin(0.5)

    this.add
      .text(
        GAME_WIDTH / 2,
        95,
        'Custom Slot Demo',
        {
          fontFamily: 'Arial',
          fontSize: '18px',
          color: '#bbbbbb',
        },
      )
      .setOrigin(0.5)
  }

  // -------------------------
  // SLOT MACHINE
  // -------------------------

  private createSlotMachine(): void {
    const reelWidth = 135
    const symbolHeight = 120

    const totalWidth =
      reelWidth * SLOT_CONFIG.reels

    const totalHeight =
      symbolHeight * SLOT_CONFIG.rows

    const startX =
      (GAME_WIDTH - totalWidth) / 2

    const startY = 150

    this.add
      .rectangle(
        GAME_WIDTH / 2,
        startY + totalHeight / 2,
        totalWidth + 30,
        totalHeight + 30,
        0x17171d,
      )
      .setStrokeStyle(
        4,
        0xb68b32,
      )

    this.symbolTexts = []
    this.currentBoard = []

    for (
      let reel = 0;
      reel < SLOT_CONFIG.reels;
      reel += 1
    ) {
      const reelTexts:
        Phaser.GameObjects.Text[] = []

      const reelData: string[] = []

      for (
        let row = 0;
        row < SLOT_CONFIG.rows;
        row += 1
      ) {
        const x =
          startX +
          reel * reelWidth +
          reelWidth / 2

        const y =
          startY +
          row * symbolHeight +
          symbolHeight / 2

        const symbol =
          this.getRandomSymbol()

        reelData.push(
          symbol.id,
        )

        this.add
          .rectangle(
            x,
            y,
            reelWidth - 8,
            symbolHeight - 8,
            0x292932,
          )
          .setStrokeStyle(
            2,
            0x4c4c58,
          )

        const symbolText =
          this.add
            .text(
              x,
              y,
              symbol.label,
              {
                fontFamily: 'Arial',
                fontSize: '20px',
                color: '#ffffff',
                fontStyle: 'bold',
                align: 'center',
              },
            )
            .setOrigin(0.5)

        this.applySymbolStyle(
          symbolText,
          symbol.id,
        )

        reelTexts.push(
          symbolText,
        )
      }

      this.symbolTexts.push(
        reelTexts,
      )

      this.currentBoard.push(
        reelData,
      )
    }
  }

  // -------------------------
  // SYMBOL VISUAL STYLE
  // -------------------------

  private applySymbolStyle(
    symbolText: Phaser.GameObjects.Text,
    symbolId: string,
  ): void {
    symbolText
      .setAlpha(1)
      .setScale(1)
      .setStroke(
        '#000000',
        3,
      )

    switch (symbolId) {
      case 'scatter':
        symbolText
          .setColor('#ff9f43')
          .setStroke(
            '#6b2500',
            4,
          )
        break

      case 'wild':
        symbolText
          .setColor('#ffd54a')
          .setStroke(
            '#765400',
            4,
          )
        break

      case 'naga':
        symbolText
          .setColor('#6ee7b7')
          .setStroke(
            '#064e3b',
            4,
          )
        break

      case 'ruby':
        symbolText.setColor(
          '#ff6b81',
        )
        break

      case 'bell':
        symbolText.setColor(
          '#ffe082',
        )
        break

      default:
        symbolText.setColor(
          '#ffffff',
        )
        break
    }
  }

  // -------------------------
  // SYMBOL PULSE
  // -------------------------

  private pulseSymbol(
    symbolText: Phaser.GameObjects.Text,
    targetScale = 1.25,
    repeat = 2,
  ): void {
    this.tweens.killTweensOf(
      symbolText,
    )

    this.tweens.add({
      targets: symbolText,

      scaleX: targetScale,
      scaleY: targetScale,

      duration: 180,

      yoyo: true,

      repeat,

      ease: 'Sine.easeInOut',
    })
  }

  // -------------------------
  // FEATURE BANNER
  // -------------------------

  private showFeatureBanner(
    title: string,
    subtitle: string,
    duration = 1300,
  ): void {
    const container =
      this.add.container(
        GAME_WIDTH / 2,
        335,
      )

    container
      .setDepth(100)
      .setAlpha(0)
      .setScale(0.82)

    const panel =
      this.add
        .rectangle(
          0,
          0,
          620,
          145,
          0x08080b,
          0.94,
        )
        .setStrokeStyle(
          4,
          0xffc857,
        )

    const titleText =
      this.add
        .text(
          0,
          -25,
          title,
          {
            fontFamily: 'Arial',
            fontSize: '38px',
            fontStyle: 'bold',
            color: '#ffd54a',
            stroke: '#5e3c00',
            strokeThickness: 5,
            align: 'center',
          },
        )
        .setOrigin(0.5)

    const subtitleText =
      this.add
        .text(
          0,
          30,
          subtitle,
          {
            fontFamily: 'Arial',
            fontSize: '22px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center',
          },
        )
        .setOrigin(0.5)

    container.add([
      panel,
      titleText,
      subtitleText,
    ])

    this.tweens.add({
      targets: container,

      alpha: 1,
      scaleX: 1,
      scaleY: 1,

      duration: 180,

      ease: 'Back.Out',
    })

    this.time.delayedCall(
      duration,
      () => {
        this.tweens.add({
          targets:
            container,

          alpha: 0,

          scaleX: 0.9,
          scaleY: 0.9,

          duration: 200,

          onComplete: () => {
            container.destroy()
          },
        })
      },
    )
  }

  // -------------------------
  // CONTROL PANEL
  // -------------------------

  private createControlPanel(): void {
    const panelY = 610

    const balanceText =
      this.add
        .text(
          105,
          panelY,
          `BALANCE\n${this.balance.toLocaleString()}`,
          {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center',
          },
        )
        .setOrigin(0.5)

    const betText =
      this.add
        .text(
          320,
          panelY,
          `BET\n${this.bet}`,
          {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            align: 'center',
          },
        )
        .setOrigin(0.5)

    const winText =
      this.add
        .text(
          515,
          panelY,
          `WIN\n${this.win}`,
          {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffd54a',
            align: 'center',
            fontStyle: 'bold',
          },
        )
        .setOrigin(0.5)

    const freeSpinText =
      this.add
        .text(
          650,
          panelY,
          'FREE SPINS\n0',
          {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ff9f43',
            align: 'center',
            fontStyle: 'bold',
          },
        )
        .setOrigin(0.5)

    const multiplierText =
      this.add
        .text(
          770,
          panelY,
          'MULTIPLIER\n×1',
          {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffd54a',
            align: 'center',
            fontStyle: 'bold',
          },
        )
        .setOrigin(0.5)

    const statusText =
      this.add
        .text(
          GAME_WIDTH / 2,
          675,
          'READY',
          {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#bbbbbb',
            fontStyle: 'bold',
          },
        )
        .setOrigin(0.5)

    const betOptions =
      SLOT_CONFIG.betOptions

    let betIndex =
      betOptions.indexOf(
        this.bet,
      )

    // -------------------------
    // MINUS
    // -------------------------

    const minusButton =
      this.add
        .rectangle(
          240,
          panelY,
          45,
          50,
          0x34343d,
        )
        .setStrokeStyle(
          2,
          0xffffff,
        )
        .setInteractive({
          useHandCursor: true,
        })

    this.add
      .text(
        240,
        panelY,
        '-',
        {
          fontFamily: 'Arial',
          fontSize: '30px',
          color: '#ffffff',
        },
      )
      .setOrigin(0.5)

    // -------------------------
    // PLUS
    // -------------------------

    const plusButton =
      this.add
        .rectangle(
          400,
          panelY,
          45,
          50,
          0x34343d,
        )
        .setStrokeStyle(
          2,
          0xffffff,
        )
        .setInteractive({
          useHandCursor: true,
        })

    this.add
      .text(
        400,
        panelY,
        '+',
        {
          fontFamily: 'Arial',
          fontSize: '28px',
          color: '#ffffff',
        },
      )
      .setOrigin(0.5)

    minusButton.on(
      'pointerdown',
      () => {
        if (
          this.isSpinning ||
          this.isFreeSpinMode
        ) {
          return
        }

        if (betIndex > 0) {
          betIndex -= 1

          this.bet =
            betOptions[
              betIndex
            ]

          betText.setText(
            `BET\n${this.bet}`,
          )

          statusText.setText(
            `BET CHANGED TO ${this.bet}`,
          )
        }
      },
    )

    plusButton.on(
      'pointerdown',
      () => {
        if (
          this.isSpinning ||
          this.isFreeSpinMode
        ) {
          return
        }

        if (
          betIndex <
          betOptions.length - 1
        ) {
          betIndex += 1

          this.bet =
            betOptions[
              betIndex
            ]

          betText.setText(
            `BET\n${this.bet}`,
          )

          statusText.setText(
            `BET CHANGED TO ${this.bet}`,
          )
        }
      },
    )

    minusButton.on(
      'pointerover',
      () => {
        if (
          !this.isSpinning &&
          !this.isFreeSpinMode
        ) {
          minusButton
            .setFillStyle(
              0x50505c,
            )
        }
      },
    )

    minusButton.on(
      'pointerout',
      () => {
        minusButton
          .setFillStyle(
            0x34343d,
          )
      },
    )

    plusButton.on(
      'pointerover',
      () => {
        if (
          !this.isSpinning &&
          !this.isFreeSpinMode
        ) {
          plusButton
            .setFillStyle(
              0x50505c,
            )
        }
      },
    )

    plusButton.on(
      'pointerout',
      () => {
        plusButton
          .setFillStyle(
            0x34343d,
          )
      },
    )

    // -------------------------
    // SPIN
    // -------------------------

    const spinButton =
      this.add
        .rectangle(
          900,
          panelY,
          120,
          70,
          0x3b2d12,
        )
        .setStrokeStyle(
          3,
          0xffd54a,
        )
        .setInteractive({
          useHandCursor: true,
        })

    this.add
      .text(
        900,
        panelY,
        'SPIN',
        {
          fontFamily: 'Arial',
          fontSize: '24px',
          color: '#ffd54a',
          fontStyle: 'bold',
        },
      )
      .setOrigin(0.5)

    spinButton.on(
      'pointerover',
      () => {
        if (
          !this.isSpinning &&
          !this.isFreeSpinMode
        ) {
          spinButton
            .setFillStyle(
              0x60491c,
            )
        }
      },
    )

    spinButton.on(
      'pointerout',
      () => {
        if (
          !this.isSpinning
        ) {
          spinButton
            .setFillStyle(
              0x3b2d12,
            )
        }
      },
    )

    spinButton.on(
      'pointerdown',
      () => {
        if (
          this.isSpinning ||
          this.isFreeSpinMode
        ) {
          return
        }

        if (
          this.balance <
          this.bet
        ) {
          statusText.setText(
            'NOT ENOUGH BALANCE',
          )

          return
        }

        this.balance -=
          this.bet

        this.win = 0

        balanceText.setText(
          `BALANCE\n${this.balance.toLocaleString()}`,
        )

        winText.setText(
          'WIN\n0',
        )

        this.clearWinHighlights()

        this.startSpin(
          spinButton,
          statusText,
          balanceText,
          winText,
          freeSpinText,
          multiplierText,
          false,
        )
      },
    )
  }

  // -------------------------
  // RANDOM SYMBOL
  // -------------------------

  private getRandomSymbol() {
    const randomIndex =
      Phaser.Math.Between(
        0,
        SLOT_SYMBOLS.length - 1,
      )

    return SLOT_SYMBOLS[
      randomIndex
    ]
  }

  // -------------------------
  // SCATTERS
  // -------------------------

  private countScatters(): number {
    let scatterCount = 0

    for (
      const reel of
        this.currentBoard
    ) {
      for (
        const symbol of reel
      ) {
        if (
          symbol === 'scatter'
        ) {
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
      return (
        SLOT_CONFIG.freeSpins
          .fiveScatters
      )
    }

    if (scatterCount === 4) {
      return (
        SLOT_CONFIG.freeSpins
          .fourScatters
      )
    }

    if (scatterCount === 3) {
      return (
        SLOT_CONFIG.freeSpins
          .threeScatters
      )
    }

    return 0
  }

  // -------------------------
  // SCATTER ANIMATION
  // -------------------------

  private animateScatterSymbols(): void {
    for (
      let reel = 0;
      reel <
      SLOT_CONFIG.reels;
      reel += 1
    ) {
      for (
        let row = 0;
        row <
        SLOT_CONFIG.rows;
        row += 1
      ) {
        if (
          this.currentBoard[
            reel
          ][row] ===
          'scatter'
        ) {
          const text =
            this.symbolTexts[
              reel
            ][row]

          this.applySymbolStyle(
            text,
            'scatter',
          )

          this.pulseSymbol(
            text,
            1.4,
            3,
          )
        }
      }
    }
  }

  // -------------------------
  // NAGA BLESSING
  // -------------------------

  private applyNagaBlessing(
    forcedPosition?: {
      reel: number
      row: number
    },
  ): boolean {
    if (
      !forcedPosition &&
      Math.random() >=
        SLOT_CONFIG
          .nagaBlessingChance
    ) {
      return false
    }

    let selectedPosition =
      forcedPosition

    if (
      !selectedPosition
    ) {
      const candidates: {
        reel: number
        row: number
      }[] = []

      for (
        let reel = 0;
        reel <
        SLOT_CONFIG.reels;
        reel += 1
      ) {
        for (
          let row = 0;
          row <
          SLOT_CONFIG.rows;
          row += 1
        ) {
          const symbol =
            this.currentBoard[
              reel
            ][row]

          if (
            symbol !== 'wild' &&
            symbol !== 'scatter'
          ) {
            candidates.push({
              reel,
              row,
            })
          }
        }
      }

      if (
        candidates.length ===
        0
      ) {
        return false
      }

      selectedPosition =
        Phaser.Utils.Array
          .GetRandom(
            candidates,
          )
    }

    const currentSymbol =
      this.currentBoard[
        selectedPosition.reel
      ][
        selectedPosition.row
      ]

    if (
      currentSymbol === 'wild' ||
      currentSymbol === 'scatter'
    ) {
      return false
    }

    this.currentBoard[
      selectedPosition.reel
    ][
      selectedPosition.row
    ] = 'wild'

    const wild =
      SLOT_SYMBOLS.find(
        (symbol) =>
          symbol.id ===
          'wild',
      )

    const symbolText =
      this.symbolTexts[
        selectedPosition.reel
      ][
        selectedPosition.row
      ]

    if (wild) {
      symbolText.setText(
        wild.label,
      )

      this.applySymbolStyle(
        symbolText,
        'wild',
      )

      this.pulseSymbol(
        symbolText,
        1.45,
        3,
      )
    }

    console.log(
      'Naga Blessing activated:',
      selectedPosition,
    )

    return true
  }

  // -------------------------
  // DEBUG
  // -------------------------

  private printBoardToConsole(): void {
    console.table(
      this.currentBoard.map(
        (
          reel,
          reelIndex,
        ) => ({
          reel:
            reelIndex + 1,

          row1:
            reel[0],

          row2:
            reel[1],

          row3:
            reel[2],
        }),
      ),
    )
  }

  // -------------------------
  // TEST BOARDS
  // -------------------------

  private loadTestWinBoard(): void {
    this.currentBoard = [
      ['ruby', 'a', 'k'],
      ['ruby', 'q', 'j'],
      ['ruby', 'bell', 'a'],
      ['ruby', 'naga', 'k'],
      ['j', 'peacock', 'q'],
    ]

    this.updateVisibleBoard()
  }

  private loadTestScatterBoard(): void {
    this.currentBoard = [
      ['scatter', 'a', 'k'],
      ['ruby', 'q', 'scatter'],
      ['bell', 'naga', 'j'],
      ['peacock', 'a', 'k'],
      ['q', 'scatter', 'ruby'],
    ]

    this.updateVisibleBoard()
  }

  private loadTestWildBoard(): void {
    this.currentBoard = [
      ['ruby', 'a', 'k'],
      ['wild', 'q', 'j'],
      ['ruby', 'bell', 'a'],
      ['ruby', 'naga', 'k'],
      ['j', 'peacock', 'q'],
    ]

    this.updateVisibleBoard()
  }

  private loadTestBlessingBoard(): void {
    this.currentBoard = [
      ['ruby', 'a', 'k'],
      ['ruby', 'q', 'j'],
      ['a', 'bell', 'q'],
      ['ruby', 'naga', 'k'],
      ['j', 'peacock', 'a'],
    ]

    this.updateVisibleBoard()
  }

  // -------------------------
  // UPDATE BOARD
  // -------------------------

  private updateVisibleBoard(): void {
    for (
      let reel = 0;
      reel <
      SLOT_CONFIG.reels;
      reel += 1
    ) {
      for (
        let row = 0;
        row <
        SLOT_CONFIG.rows;
        row += 1
      ) {
        const symbolId =
          this.currentBoard[
            reel
          ][row]

        const symbol =
          SLOT_SYMBOLS.find(
            (item) =>
              item.id ===
              symbolId,
          )

        if (!symbol) {
          continue
        }

        const symbolText =
          this.symbolTexts[
            reel
          ][row]

        symbolText.setText(
          symbol.label,
        )

        this.applySymbolStyle(
          symbolText,
          symbol.id,
        )
      }
    }
  }

  // -------------------------
  // SPIN ENGINE
  // -------------------------

  private startSpin(
    spinButton:
      Phaser.GameObjects.Rectangle,

    statusText:
      Phaser.GameObjects.Text,

    balanceText:
      Phaser.GameObjects.Text,

    winText:
      Phaser.GameObjects.Text,

    freeSpinText:
      Phaser.GameObjects.Text,

    multiplierText:
      Phaser.GameObjects.Text,

    isFreeSpin: boolean,
  ): void {
    this.isSpinning = true

    if (isFreeSpin) {
      statusText.setText(
        `FREE SPIN ×${this.freeSpinMultiplier}`,
      )
    } else {
      statusText.setText(
        'SPINNING...',
      )
    }

    spinButton.setFillStyle(
      0x202026,
    )

    const spinTimers:
      Phaser.Time.TimerEvent[] =
        []

    for (
      let reel = 0;
      reel <
      SLOT_CONFIG.reels;
      reel += 1
    ) {
      const timer =
        this.time.addEvent({
          delay: 80,

          loop: true,

          callback: () => {
            for (
              let row = 0;
              row <
              SLOT_CONFIG.rows;
              row += 1
            ) {
              const symbol =
                this.getRandomSymbol()

              const text =
                this.symbolTexts[
                  reel
                ][row]

              text.setText(
                symbol.label,
              )

              this.applySymbolStyle(
                text,
                symbol.id,
              )
            }
          },
        })

      spinTimers.push(
        timer,
      )

      const stopDelay =
        900 +
        reel * 300

      this.time.delayedCall(
        stopDelay,
        () => {
          spinTimers[
            reel
          ].remove(false)

          for (
            let row = 0;
            row <
            SLOT_CONFIG.rows;
            row += 1
          ) {
            const finalSymbol =
              this.getRandomSymbol()

            this.currentBoard[
              reel
            ][row] =
              finalSymbol.id

            const text =
              this.symbolTexts[
                reel
              ][row]

            text.setText(
              finalSymbol.label,
            )

            this.applySymbolStyle(
              text,
              finalSymbol.id,
            )

            if (
              finalSymbol.id ===
                'scatter' ||
              finalSymbol.id ===
                'wild'
            ) {
              this.pulseSymbol(
                text,
                1.18,
                0,
              )
            }
          }

          if (
            reel ===
            SLOT_CONFIG.reels - 1
          ) {
            this.finishSpin(
              spinButton,
              statusText,
              balanceText,
              winText,
              freeSpinText,
              multiplierText,
              isFreeSpin,
            )
          }
        },
      )
    }
  }

  // -------------------------
  // FINISH ROUND
  // -------------------------

  private finishSpin(
    spinButton:
      Phaser.GameObjects.Rectangle,

    statusText:
      Phaser.GameObjects.Text,

    balanceText:
      Phaser.GameObjects.Text,

    winText:
      Phaser.GameObjects.Text,

    freeSpinText:
      Phaser.GameObjects.Text,

    multiplierText:
      Phaser.GameObjects.Text,

    isFreeSpin: boolean,
  ): void {
    const nagaBlessingActivated =
      isFreeSpin
        ? this.applyNagaBlessing()
        : false

    const evaluation =
      evaluateWins(
        this.currentBoard,
        this.bet,
      )

    const baseWin =
      evaluation.totalWin

    if (
      isFreeSpin &&
      baseWin > 0
    ) {
      this.win =
        baseWin *
        this.freeSpinMultiplier
    } else {
      this.win =
        baseWin
    }

    this.balance +=
      this.win

    // -------------------------
    // MULTIPLIER INCREASE
    // -------------------------

    if (
      isFreeSpin &&
      baseWin > 0
    ) {
      this.freeSpinMultiplier +=
        1

      multiplierText.setText(
        `MULTIPLIER\n×${this.freeSpinMultiplier}`,
      )

      multiplierText.setColor(
        '#ffd54a',
      )

      this.tweens.killTweensOf(
        multiplierText,
      )

      this.tweens.add({
        targets:
          multiplierText,

        scaleX: 1.4,
        scaleY: 1.4,

        duration: 220,

        yoyo: true,

        ease: 'Back.Out',
      })
    }

    balanceText.setText(
      `BALANCE\n${this.balance.toLocaleString()}`,
    )

    winText.setText(
      `WIN\n${this.win.toFixed(2)}`,
    )

    if (
      this.win > 0
    ) {
      this.tweens.killTweensOf(
        winText,
      )

      this.tweens.add({
        targets: winText,

        scaleX: 1.3,
        scaleY: 1.3,

        duration: 200,

        yoyo: true,

        repeat: 1,

        ease: 'Sine.easeInOut',
      })
    }

    this.highlightWins(
      evaluation.lineWins,
    )

    // -------------------------
    // SCATTERS
    // -------------------------

    const scatterCount =
      this.countScatters()

    const awardedFreeSpins =
      this.calculateFreeSpinAward(
        scatterCount,
      )

    if (
      awardedFreeSpins > 0
    ) {
      const alreadyInFeature =
        this.isFreeSpinMode

      this.freeSpinsRemaining +=
        awardedFreeSpins

      this.animateScatterSymbols()

      if (
        !alreadyInFeature
      ) {
        this.isFreeSpinMode =
          true

        this.freeSpinMultiplier =
          1

        multiplierText.setText(
          'MULTIPLIER\n×1',
        )

        this.showFeatureBanner(
          `${scatterCount} SCATTERS!`,
          `${awardedFreeSpins} FREE SPINS`,
          1450,
        )
      } else {
        this.showFeatureBanner(
          'FREE SPINS RETRIGGER!',
          `+${awardedFreeSpins} FREE SPINS`,
          1450,
        )
      }

      freeSpinText.setText(
        `FREE SPINS\n${this.freeSpinsRemaining}`,
      )

      this.tweens.killTweensOf(
        freeSpinText,
      )

      this.tweens.add({
        targets:
          freeSpinText,

        scaleX: 1.35,
        scaleY: 1.35,

        duration: 220,

        yoyo: true,

        repeat: 1,
      })
    } else if (
      nagaBlessingActivated
    ) {
      this.showFeatureBanner(
        'NAGA BLESSING!',
        this.win > 0
          ? `WILD TRANSFORM • WIN ${this.win.toFixed(2)}`
          : 'A SYMBOL BECOMES WILD',
        1250,
      )
    }

    this.isSpinning =
      false

    spinButton.setFillStyle(
      0x3b2d12,
    )

    // -------------------------
    // DEBUG
    // -------------------------

    this.printBoardToConsole()

    console.log(
      'Win evaluation:',
      evaluation,
    )

    console.log(
      'Base win:',
      baseWin,
    )

    console.log(
      'Final win:',
      this.win,
    )

    console.log(
      'Free Spin multiplier:',
      this.freeSpinMultiplier,
    )

    console.log(
      'Naga Blessing:',
      nagaBlessingActivated,
    )

    console.log(
      'Scatter count:',
      scatterCount,
    )

    console.log(
      'Free Spins awarded:',
      awardedFreeSpins,
    )

    // -------------------------
    // CONTINUE FREE SPINS
    // -------------------------

    if (
      this.isFreeSpinMode &&
      this.freeSpinsRemaining >
        0
    ) {
      if (
        awardedFreeSpins > 0
      ) {
        statusText.setText(
          `${scatterCount} SCATTERS — +${awardedFreeSpins} FREE SPINS!`,
        )
      } else if (
        nagaBlessingActivated &&
        this.win > 0
      ) {
        statusText.setText(
          `NAGA BLESSING! WIN ${this.win.toFixed(2)}`,
        )
      } else if (
        nagaBlessingActivated
      ) {
        statusText.setText(
          'NAGA BLESSING!',
        )
      } else if (
        this.win > 0
      ) {
        statusText.setText(
          `FREE SPIN WIN ${this.win.toFixed(2)}`,
        )
      } else {
        statusText.setText(
          'FREE SPIN COMPLETE',
        )
      }

      let nextSpinDelay =
        1200

      if (
        awardedFreeSpins > 0
      ) {
        nextSpinDelay =
          1700
      } else if (
        nagaBlessingActivated
      ) {
        nextSpinDelay =
          1500
      }

      this.time.delayedCall(
        nextSpinDelay,
        () => {
          this.startFreeSpin(
            spinButton,
            statusText,
            balanceText,
            winText,
            freeSpinText,
            multiplierText,
          )
        },
      )

      return
    }

    // -------------------------
    // FREE SPINS FINISHED
    // -------------------------

    if (isFreeSpin) {
      this.isFreeSpinMode =
        false

      this.freeSpinsRemaining =
        0

      this.freeSpinMultiplier =
        1

      freeSpinText.setText(
        'FREE SPINS\n0',
      )

      multiplierText.setText(
        'MULTIPLIER\n×1',
      )

      this.showFeatureBanner(
        'FREE SPINS COMPLETE',
        `FINAL BALANCE ${this.balance.toLocaleString()}`,
        1300,
      )

      if (
        this.win > 0
      ) {
        statusText.setText(
          `FINAL FREE SPIN WIN ${this.win.toFixed(2)}`,
        )
      } else {
        statusText.setText(
          'FREE SPINS COMPLETE',
        )
      }

      this.time.delayedCall(
        1500,
        () => {
          statusText.setText(
            'READY',
          )
        },
      )

      return
    }

    // -------------------------
    // NORMAL SPIN FINISHED
    // -------------------------

    if (
      this.win > 0
    ) {
      statusText.setText(
        `WIN ${this.win.toFixed(2)} — ${evaluation.lineWins.length} LINE(S)`,
      )
    } else {
      statusText.setText(
        'NO WIN',
      )
    }

    this.time.delayedCall(
      1200,
      () => {
        statusText.setText(
          'READY',
        )
      },
    )
  }

  // -------------------------
  // FREE SPIN
  // -------------------------

  private startFreeSpin(
    spinButton:
      Phaser.GameObjects.Rectangle,

    statusText:
      Phaser.GameObjects.Text,

    balanceText:
      Phaser.GameObjects.Text,

    winText:
      Phaser.GameObjects.Text,

    freeSpinText:
      Phaser.GameObjects.Text,

    multiplierText:
      Phaser.GameObjects.Text,
  ): void {
    if (
      this.freeSpinsRemaining <=
      0
    ) {
      this.isFreeSpinMode =
        false

      this.freeSpinMultiplier =
        1

      freeSpinText.setText(
        'FREE SPINS\n0',
      )

      multiplierText.setText(
        'MULTIPLIER\n×1',
      )

      statusText.setText(
        'READY',
      )

      return
    }

    this.freeSpinsRemaining -=
      1

    freeSpinText.setText(
      `FREE SPINS\n${this.freeSpinsRemaining}`,
    )

    this.win = 0

    winText.setText(
      'WIN\n0',
    )

    this.clearWinHighlights()

    this.startSpin(
      spinButton,
      statusText,
      balanceText,
      winText,
      freeSpinText,
      multiplierText,
      true,
    )
  }

  // -------------------------
  // WIN HIGHLIGHTING
  // -------------------------

  private clearWinHighlights(): void {
    for (
      let reel = 0;
      reel <
      this.symbolTexts.length;
      reel += 1
    ) {
      for (
        let row = 0;
        row <
        this.symbolTexts[reel]
          .length;
        row += 1
      ) {
        const text =
          this.symbolTexts[
            reel
          ][row]

        const symbol =
          this.currentBoard[
            reel
          ]?.[row]

        this.tweens.killTweensOf(
          text,
        )

        this.applySymbolStyle(
          text,
          symbol ?? '',
        )
      }
    }
  }

  private highlightWins(
    lineWins:
      ReturnType<
        typeof evaluateWins
      >['lineWins'],
  ): void {
    const highlighted =
      new Set<string>()

    for (
      const lineWin of
        lineWins
    ) {
      for (
        const position of
          lineWin.positions
      ) {
        const key =
          `${position.reel}-${position.row}`

        if (
          highlighted.has(
            key,
          )
        ) {
          continue
        }

        highlighted.add(
          key,
        )

        const symbolText =
          this.symbolTexts[
            position.reel
          ][
            position.row
          ]

        symbolText
          .setColor(
            '#fff176',
          )
          .setStroke(
            '#8a5b00',
            5,
          )

        this.pulseSymbol(
          symbolText,
          1.22,
          2,
        )
      }
    }
  }
}
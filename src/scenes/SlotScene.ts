import Phaser from 'phaser'

import {
  GAME_HEIGHT,
  GAME_WIDTH,
  SLOT_CONFIG,
} from '../game/config'

import {
  getWeightedRandomSymbol,
} from '../game/symbolWeights'

import {
  evaluateWins,
} from '../game/winEvaluator'

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
  private bonusTotalWin = 0

  // Player must press CONTINUE
  // before the bonus begins.
  private bonusAwaitingContinue = false

  // -------------------------
  // AUTO SPIN
  // -------------------------

  private autoSpinEnabled = false

  private autoSpinTimer?:
    Phaser.Time.TimerEvent

  private autoSpinButton?:
    Phaser.GameObjects.Rectangle

  private autoSpinLabel?:
    Phaser.GameObjects.Text

  // -------------------------
  // STICKY WILDS
  // -------------------------

  private stickyWildPositions =
    new Set<string>()

  // -------------------------
  // BOARD
  // -------------------------

  private symbolTexts:
    Phaser.GameObjects.Text[][] = []

  private currentBoard:
    string[][] = []

  constructor() {
    super('SlotScene')
  }

  create(): void {
    this.createBackground()
    this.createHeader()
    this.createSlotMachine()
    this.createControlPanel()
  }

  // =========================================================
  // BACKGROUND
  // =========================================================

  private createBackground(): void {
    this.add.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x09090d,
    )
  }

  // =========================================================
  // HEADER
  // =========================================================

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

  // =========================================================
  // SLOT MACHINE
  // =========================================================

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

      const reelData:
        string[] = []

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
          this.getRandomSymbol(false)

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
                fontFamily:
                  'Arial',

                fontSize:
                  '20px',

                color:
                  '#ffffff',

                fontStyle:
                  'bold',

                align:
                  'center',
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

  // =========================================================
  // RNG
  // =========================================================

  private getRandomSymbol(
    isFreeSpin: boolean,
  ) {
    return getWeightedRandomSymbol(
      isFreeSpin,
    )
  }

  // =========================================================
  // AUTO SPIN
  // =========================================================

  private stopScheduledAutoSpin(): void {
    if (
      this.autoSpinTimer
    ) {
      this.autoSpinTimer.remove(
        false,
      )

      this.autoSpinTimer =
        undefined
    }
  }

  private updateAutoSpinVisual(): void {
    if (
      !this.autoSpinButton ||
      !this.autoSpinLabel
    ) {
      return
    }

    if (
      this.autoSpinEnabled
    ) {
      this.autoSpinButton
        .setFillStyle(
          0x355c35,
        )

      this.autoSpinButton
        .setStrokeStyle(
          2,
          0x7dff7d,
        )

      this.autoSpinLabel
        .setText(
          'AUTO\nON',
        )
        .setColor(
          '#9dff9d',
        )
    } else {
      this.autoSpinButton
        .setFillStyle(
          0x34343d,
        )

      this.autoSpinButton
        .setStrokeStyle(
          2,
          0xffffff,
        )

      this.autoSpinLabel
        .setText(
          'AUTO\nOFF',
        )
        .setColor(
          '#ffffff',
        )
    }
  }

  private scheduleAutoSpin(
    startPaidSpin: () => void,
    delay = 700,
  ): void {
    this.stopScheduledAutoSpin()

    if (
      !this.autoSpinEnabled ||
      this.isSpinning ||
      this.isFreeSpinMode ||
      this.bonusAwaitingContinue
    ) {
      return
    }

    this.autoSpinTimer =
      this.time.delayedCall(
        delay,
        () => {
          this.autoSpinTimer =
            undefined

          if (
            !this.autoSpinEnabled ||
            this.isSpinning ||
            this.isFreeSpinMode ||
            this.bonusAwaitingContinue
          ) {
            return
          }

          startPaidSpin()
        },
      )
  }

  // =========================================================
  // STICKY WILD HELPERS
  // =========================================================

  private getPositionKey(
    reel: number,
    row: number,
  ): string {
    return `${reel}-${row}`
  }

  private isStickyWild(
    reel: number,
    row: number,
  ): boolean {
    return this.stickyWildPositions.has(
      this.getPositionKey(
        reel,
        row,
      ),
    )
  }

  private clearStickyWilds(): void {
    this.stickyWildPositions.clear()
  }

  private applyStickyWildStyle(
    symbolText:
      Phaser.GameObjects.Text,
  ): void {
    symbolText
      .setText(
        'STICKY\nWILD',
      )
      .setFontSize(16)
      .setColor('#ffd54a')
      .setStroke(
        '#8a5b00',
        5,
      )
      .setScale(1)
      .setAlpha(1)
  }

  // =========================================================
  // SYMBOL VISUALS
  // =========================================================

  private applySymbolStyle(
    symbolText:
      Phaser.GameObjects.Text,

    symbolId: string,
  ): void {
    symbolText
      .setFontSize(20)
      .setAlpha(1)
      .setScale(1)
      .setStroke(
        '#000000',
        3,
      )

    switch (
      symbolId
    ) {
      case 'scatter':
        symbolText
          .setColor(
            '#ff9f43',
          )
          .setStroke(
            '#6b2500',
            4,
          )
        break

      case 'wild':
        symbolText
          .setColor(
            '#ffd54a',
          )
          .setStroke(
            '#765400',
            4,
          )
        break

      case 'naga':
        symbolText
          .setColor(
            '#6ee7b7',
          )
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

  private pulseSymbol(
    symbolText:
      Phaser.GameObjects.Text,

    targetScale = 1.25,

    repeat = 2,
  ): void {
    this.tweens.killTweensOf(
      symbolText,
    )

    this.tweens.add({
      targets:
        symbolText,

      scaleX:
        targetScale,

      scaleY:
        targetScale,

      duration: 180,

      yoyo: true,

      repeat,

      ease:
        'Sine.easeInOut',
    })
  }

  // =========================================================
  // FEATURE BANNER
  // =========================================================

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
            fontFamily:
              'Arial',

            fontSize:
              '38px',

            fontStyle:
              'bold',

            color:
              '#ffd54a',

            stroke:
              '#5e3c00',

            strokeThickness:
              5,

            align:
              'center',
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
            fontFamily:
              'Arial',

            fontSize:
              '22px',

            color:
              '#ffffff',

            fontStyle:
              'bold',

            align:
              'center',
          },
        )
        .setOrigin(0.5)

    container.add([
      panel,
      titleText,
      subtitleText,
    ])

    this.tweens.add({
      targets:
        container,

      alpha: 1,

      scaleX: 1,

      scaleY: 1,

      duration: 180,

      ease:
        'Back.Out',
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

          onComplete:
            () => {
              container.destroy()
            },
        })
      },
    )
  }

  // =========================================================
  // BONUS CONTINUE SCREEN
  // =========================================================

  private showBonusContinueOverlay(
    freeSpins: number,
    onContinue: () => void,
  ): void {
    const overlay =
      this.add.container(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
      )

    overlay.setDepth(250)

    // Prevent clicks reaching the game.
    const blocker =
      this.add
        .rectangle(
          0,
          0,
          GAME_WIDTH,
          GAME_HEIGHT,
          0x000000,
          0.72,
        )
        .setInteractive()

    const panel =
      this.add
        .rectangle(
          0,
          0,
          600,
          300,
          0x111117,
          0.98,
        )
        .setStrokeStyle(
          5,
          0xffc857,
        )

    const title =
      this.add
        .text(
          0,
          -85,
          'BONUS TRIGGERED!',
          {
            fontFamily:
              'Arial',

            fontSize:
              '38px',

            fontStyle:
              'bold',

            color:
              '#ffd54a',

            stroke:
              '#5e3c00',

            strokeThickness:
              5,
          },
        )
        .setOrigin(0.5)

    const subtitle =
      this.add
        .text(
          0,
          -25,
          `${freeSpins} FREE SPINS`,
          {
            fontFamily:
              'Arial',

            fontSize:
              '27px',

            fontStyle:
              'bold',

            color:
              '#ffffff',
          },
        )
        .setOrigin(0.5)

    const info =
      this.add
        .text(
          0,
          20,
          'Naga Blessing awards a Sticky Wild',
          {
            fontFamily:
              'Arial',

            fontSize:
              '17px',

            color:
              '#bbbbbb',
          },
        )
        .setOrigin(0.5)

    const continueButton =
      this.add
        .rectangle(
          0,
          90,
          220,
          65,
          0x60491c,
        )
        .setStrokeStyle(
          3,
          0xffd54a,
        )
        .setInteractive({
          useHandCursor:
            true,
        })

    const continueText =
      this.add
        .text(
          0,
          90,
          'CONTINUE',
          {
            fontFamily:
              'Arial',

            fontSize:
              '24px',

            color:
              '#ffd54a',

            fontStyle:
              'bold',
          },
        )
        .setOrigin(0.5)

    overlay.add([
      blocker,
      panel,
      title,
      subtitle,
      info,
      continueButton,
      continueText,
    ])

    continueButton.on(
      'pointerover',
      () => {
        continueButton
          .setFillStyle(
            0x806325,
          )
      },
    )

    continueButton.on(
      'pointerout',
      () => {
        continueButton
          .setFillStyle(
            0x60491c,
          )
      },
    )

    continueButton.once(
      'pointerdown',
      () => {
        continueButton
          .disableInteractive()

        overlay.destroy()

        onContinue()
      },
    )
  }

  // =========================================================
  // CONTROL PANEL
  // =========================================================

  private createControlPanel(): void {
    const panelY = 610

    const balanceText =
      this.add
        .text(
          95,
          panelY,

          `BALANCE\n${this.balance.toLocaleString()}`,

          {
            fontFamily:
              'Arial',

            fontSize:
              '17px',

            color:
              '#ffffff',

            align:
              'center',
          },
        )
        .setOrigin(0.5)

    const betText =
      this.add
        .text(
          300,
          panelY,

          `BET\n${this.bet}`,

          {
            fontFamily:
              'Arial',

            fontSize:
              '17px',

            color:
              '#ffffff',

            align:
              'center',
          },
        )
        .setOrigin(0.5)

    const winText =
      this.add
        .text(
          495,
          panelY,

          `WIN\n${this.win}`,

          {
            fontFamily:
              'Arial',

            fontSize:
              '17px',

            color:
              '#ffd54a',

            align:
              'center',

            fontStyle:
              'bold',
          },
        )
        .setOrigin(0.5)

    const freeSpinText =
      this.add
        .text(
          620,
          panelY,

          'FREE SPINS\n0',

          {
            fontFamily:
              'Arial',

            fontSize:
              '15px',

            color:
              '#ff9f43',

            align:
              'center',

            fontStyle:
              'bold',
          },
        )
        .setOrigin(0.5)

    const multiplierText =
      this.add
        .text(
          735,
          panelY,

          'MULTIPLIER\n×1',

          {
            fontFamily:
              'Arial',

            fontSize:
              '15px',

            color:
              '#ffd54a',

            align:
              'center',

            fontStyle:
              'bold',
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
            fontFamily:
              'Arial',

            fontSize:
              '16px',

            color:
              '#bbbbbb',

            fontStyle:
              'bold',
          },
        )
        .setOrigin(0.5)

    // -------------------------
    // BET CONTROLS
    // -------------------------

    const betOptions =
      SLOT_CONFIG.betOptions

    let betIndex =
      betOptions.indexOf(
        this.bet,
      )

    const minusButton =
      this.add
        .rectangle(
          220,
          panelY,
          42,
          50,
          0x34343d,
        )
        .setStrokeStyle(
          2,
          0xffffff,
        )
        .setInteractive({
          useHandCursor:
            true,
        })

    this.add
      .text(
        220,
        panelY,
        '-',
        {
          fontFamily:
            'Arial',

          fontSize:
            '28px',

          color:
            '#ffffff',
        },
      )
      .setOrigin(0.5)

    const plusButton =
      this.add
        .rectangle(
          380,
          panelY,
          42,
          50,
          0x34343d,
        )
        .setStrokeStyle(
          2,
          0xffffff,
        )
        .setInteractive({
          useHandCursor:
            true,
        })

    this.add
      .text(
        380,
        panelY,
        '+',
        {
          fontFamily:
            'Arial',

          fontSize:
            '27px',

          color:
            '#ffffff',
        },
      )
      .setOrigin(0.5)

    // -------------------------
    // SPIN BUTTON
    // -------------------------

    const spinButton =
      this.add
        .rectangle(
          850,
          panelY,
          100,
          70,
          0x3b2d12,
        )
        .setStrokeStyle(
          3,
          0xffd54a,
        )
        .setInteractive({
          useHandCursor:
            true,
        })

    this.add
      .text(
        850,
        panelY,
        'SPIN',
        {
          fontFamily:
            'Arial',

          fontSize:
            '22px',

          color:
            '#ffd54a',

          fontStyle:
            'bold',
        },
      )
      .setOrigin(0.5)

    // -------------------------
    // AUTO SPIN BUTTON
    // -------------------------

    this.autoSpinButton =
      this.add
        .rectangle(
          950,
          panelY,
          78,
          70,
          0x34343d,
        )
        .setStrokeStyle(
          2,
          0xffffff,
        )
        .setInteractive({
          useHandCursor:
            true,
        })

    this.autoSpinLabel =
      this.add
        .text(
          950,
          panelY,
          'AUTO\nOFF',
          {
            fontFamily:
              'Arial',

            fontSize:
              '14px',

            color:
              '#ffffff',

            fontStyle:
              'bold',

            align:
              'center',
          },
        )
        .setOrigin(0.5)

    // =====================================================
    // NORMAL PAID SPIN FUNCTION
    // =====================================================

    const startPaidSpin =
      () => {
        if (
          this.isSpinning ||
          this.isFreeSpinMode ||
          this.bonusAwaitingContinue
        ) {
          return
        }

        this.stopScheduledAutoSpin()

        if (
          this.balance <
          this.bet
        ) {
          statusText.setText(
            'NOT ENOUGH BALANCE',
          )

          // Stop Auto Spin if balance
          // is no longer sufficient.
          this.autoSpinEnabled =
            false

          this.updateAutoSpinVisual()

          return
        }

        this.balance -=
          this.bet

        this.balance =
          Number(
            this.balance.toFixed(
              2,
            ),
          )

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
          startPaidSpin,
        )
      }

    // -------------------------
    // BET EVENTS
    // -------------------------

    minusButton.on(
      'pointerdown',
      () => {
        if (
          this.isSpinning ||
          this.isFreeSpinMode
        ) {
          return
        }

        if (
          betIndex > 0
        ) {
          betIndex -= 1

          this.bet =
            betOptions[
              betIndex
            ]

          betText.setText(
            `BET\n${this.bet}`,
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
        }
      },
    )

    // -------------------------
    // MANUAL SPIN
    // -------------------------

    spinButton.on(
      'pointerdown',
      () => {
        startPaidSpin()
      },
    )

    spinButton.on(
      'pointerover',
      () => {
        if (
          !this.isSpinning &&
          !this.isFreeSpinMode
        ) {
          spinButton.setFillStyle(
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
          spinButton.setFillStyle(
            0x3b2d12,
          )
        }
      },
    )

    // -------------------------
    // AUTO SPIN TOGGLE
    // -------------------------

    this.autoSpinButton.on(
      'pointerdown',
      () => {
        this.autoSpinEnabled =
          !this.autoSpinEnabled

        this.updateAutoSpinVisual()

        if (
          this.autoSpinEnabled
        ) {
          statusText.setText(
            'AUTO SPIN ON',
          )

          // If currently idle,
          // begin Auto Spin shortly.
          this.scheduleAutoSpin(
            startPaidSpin,
            500,
          )
        } else {
          this.stopScheduledAutoSpin()

          statusText.setText(
            'AUTO SPIN OFF',
          )
        }
      },
    )

    this.updateAutoSpinVisual()
  }

  // =========================================================
  // SCATTERS
  // =========================================================

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
    if (
      scatterCount >= 5
    ) {
      return (
        SLOT_CONFIG.freeSpins
          .fiveScatters
      )
    }

    if (
      scatterCount === 4
    ) {
      return (
        SLOT_CONFIG.freeSpins
          .fourScatters
      )
    }

    if (
      scatterCount === 3
    ) {
      return (
        SLOT_CONFIG.freeSpins
          .threeScatters
      )
    }

    return 0
  }

  private animateScatterSymbols(): void {
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

  // =========================================================
  // NAGA BLESSING
  // =========================================================

  private applyNagaBlessing(
    forcedPosition?: {
      reel: number
      row: number
    },

    guaranteed = false,
  ): boolean {
    if (
      this.stickyWildPositions.size >=
      SLOT_CONFIG.maxStickyWilds
    ) {
      return false
    }

    if (
      !forcedPosition &&
      !guaranteed &&
      Math.random() >=
        SLOT_CONFIG.nagaBlessingChance
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
            symbol !== 'scatter' &&
            !this.isStickyWild(
              reel,
              row,
            )
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

    const key =
      this.getPositionKey(
        selectedPosition.reel,
        selectedPosition.row,
      )

    this.stickyWildPositions.add(
      key,
    )

    this.currentBoard[
      selectedPosition.reel
    ][
      selectedPosition.row
    ] = 'wild'

    const symbolText =
      this.symbolTexts[
        selectedPosition.reel
      ][
        selectedPosition.row
      ]

    this.applyStickyWildStyle(
      symbolText,
    )

    this.pulseSymbol(
      symbolText,
      1.45,
      3,
    )

    return true
  }

  // =========================================================
  // DEBUG
  // =========================================================

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

  // =========================================================
  // SPIN ENGINE
  // =========================================================

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

    startPaidSpin:
      () => void,
  ): void {
    this.isSpinning =
      true

    if (
      isFreeSpin
    ) {
      statusText.setText(
        `FREE SPIN ×${this.freeSpinMultiplier}`,
      )
    } else {
      statusText.setText(
        this.autoSpinEnabled
          ? 'AUTO SPIN...'
          : 'SPINNING...',
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

          callback:
            () => {
              for (
                let row = 0;
                row <
                SLOT_CONFIG.rows;
                row += 1
              ) {
                if (
                  isFreeSpin &&
                  this.isStickyWild(
                    reel,
                    row,
                  )
                ) {
                  this.currentBoard[
                    reel
                  ][row] =
                    'wild'

                  this.applyStickyWildStyle(
                    this.symbolTexts[
                      reel
                    ][row],
                  )

                  continue
                }

                const symbol =
                  this.getRandomSymbol(
                    isFreeSpin,
                  )

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
            if (
              isFreeSpin &&
              this.isStickyWild(
                reel,
                row,
              )
            ) {
              this.currentBoard[
                reel
              ][row] =
                'wild'

              this.applyStickyWildStyle(
                this.symbolTexts[
                  reel
                ][row],
              )

              continue
            }

            const finalSymbol =
              this.getRandomSymbol(
                isFreeSpin,
              )

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
              startPaidSpin,
            )
          }
        },
      )
    }
  }

  // =========================================================
  // FINISH SPIN
  // =========================================================

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

    startPaidSpin:
      () => void,
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

    // -------------------------
    // PAYOUT
    // -------------------------

    if (
      isFreeSpin &&
      baseWin > 0
    ) {
      this.win =
        Number(
          (
            baseWin *
            this.freeSpinMultiplier
          ).toFixed(2),
        )
    } else {
      this.win =
        baseWin
    }

    if (
      isFreeSpin
    ) {
      this.bonusTotalWin =
        Number(
          (
            this.bonusTotalWin +
            this.win
          ).toFixed(2),
        )
    } else {
      this.balance =
        Number(
          (
            this.balance +
            this.win
          ).toFixed(2),
        )
    }

    // -------------------------
    // MULTIPLIER
    // -------------------------

    if (
      isFreeSpin &&
      baseWin > 0
    ) {
      const previousMultiplier =
        this.freeSpinMultiplier

      this.freeSpinMultiplier =
        Math.min(
          this.freeSpinMultiplier + 1,

          SLOT_CONFIG
            .maxFreeSpinMultiplier,
        )

      multiplierText.setText(
        `MULTIPLIER\n×${this.freeSpinMultiplier}`,
      )

      if (
        this.freeSpinMultiplier >
        previousMultiplier
      ) {
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

          ease:
            'Back.Out',
        })
      }
    }

    balanceText.setText(
      `BALANCE\n${this.balance.toLocaleString()}`,
    )

    if (
      isFreeSpin
    ) {
      winText.setText(
        `BONUS WIN\n${this.bonusTotalWin.toFixed(2)}`,
      )
    } else {
      winText.setText(
        `WIN\n${this.win.toFixed(2)}`,
      )
    }

    if (
      this.win > 0
    ) {
      this.tweens.killTweensOf(
        winText,
      )

      this.tweens.add({
        targets:
          winText,

        scaleX: 1.3,
        scaleY: 1.3,

        duration: 200,

        yoyo: true,

        repeat: 1,
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

      // =====================================================
      // NEW BONUS TRIGGER
      // =====================================================

      if (
        !alreadyInFeature
      ) {
        this.stopScheduledAutoSpin()

        this.clearStickyWilds()

        this.isFreeSpinMode =
          true

        this.bonusAwaitingContinue =
          true

        this.freeSpinMultiplier =
          1

        this.bonusTotalWin =
          0

        multiplierText.setText(
          'MULTIPLIER\n×1',
        )

        winText.setText(
          'BONUS WIN\n0.00',
        )

        statusText.setText(
          'BONUS TRIGGERED',
        )

        this.showFeatureBanner(
          `${scatterCount} SCATTERS!`,

          `${awardedFreeSpins} FREE SPINS`,

          1000,
        )

        // Show CONTINUE after
        // the Scatter celebration.
        this.time.delayedCall(
          950,
          () => {
            this.showBonusContinueOverlay(
              awardedFreeSpins,

              () => {
                this.bonusAwaitingContinue =
                  false

                statusText.setText(
                  'NAGA BLESSING...',
                )

                // Guaranteed first
                // Sticky Wild.
                const blessingCreated =
                  this.applyNagaBlessing(
                    undefined,
                    true,
                  )

                if (
                  blessingCreated
                ) {
                  this.showFeatureBanner(
                    'NAGA BLESSING!',

                    '1 STICKY WILD AWARDED',

                    1100,
                  )
                }

                // Free Spins only begin
                // AFTER user presses Continue.
                this.time.delayedCall(
                  blessingCreated
                    ? 1200
                    : 300,

                  () => {
                    this.startFreeSpin(
                      spinButton,
                      statusText,
                      balanceText,
                      winText,
                      freeSpinText,
                      multiplierText,
                      startPaidSpin,
                    )
                  },
                )
              },
            )
          },
        )
      }

      // =====================================================
      // RETRIGGER
      // =====================================================

      else {
        this.showFeatureBanner(
          'FREE SPINS RETRIGGER!',

          `+${awardedFreeSpins} FREE SPINS`,

          1450,
        )
      }

      freeSpinText.setText(
        `FREE SPINS\n${this.freeSpinsRemaining}`,
      )
    } else if (
      nagaBlessingActivated
    ) {
      this.showFeatureBanner(
        'NAGA BLESSING!',

        `STICKY WILD ${this.stickyWildPositions.size}/${SLOT_CONFIG.maxStickyWilds}`,

        1400,
      )
    }

    this.isSpinning =
      false

    spinButton.setFillStyle(
      0x3b2d12,
    )

    this.printBoardToConsole()

    // =====================================================
    // WAITING FOR CONTINUE
    // =====================================================

    if (
      this.bonusAwaitingContinue
    ) {
      return
    }

    // =====================================================
    // CONTINUE FREE SPINS
    // =====================================================

    if (
      this.isFreeSpinMode &&
      this.freeSpinsRemaining > 0
    ) {
      if (
        awardedFreeSpins > 0
      ) {
        statusText.setText(
          `+${awardedFreeSpins} FREE SPINS`,
        )
      } else if (
        nagaBlessingActivated
      ) {
        statusText.setText(
          `NAGA BLESSING — STICKY WILD ${this.stickyWildPositions.size}/${SLOT_CONFIG.maxStickyWilds}`,
        )
      } else if (
        this.win > 0
      ) {
        statusText.setText(
          `SPIN WIN ${this.win.toFixed(2)} • BONUS ${this.bonusTotalWin.toFixed(2)}`,
        )
      } else {
        statusText.setText(
          `BONUS WIN ${this.bonusTotalWin.toFixed(2)}`,
        )
      }

      let delay =
        1200

      if (
        awardedFreeSpins > 0
      ) {
        delay =
          1700
      } else if (
        nagaBlessingActivated
      ) {
        delay =
          1600
      }

      this.time.delayedCall(
        delay,
        () => {
          this.startFreeSpin(
            spinButton,
            statusText,
            balanceText,
            winText,
            freeSpinText,
            multiplierText,
            startPaidSpin,
          )
        },
      )

      return
    }

    // =====================================================
    // BONUS FINISHED
    // =====================================================

    if (
      isFreeSpin
    ) {
      this.isFreeSpinMode =
        false

      this.freeSpinsRemaining =
        0

      this.freeSpinMultiplier =
        1

      this.clearStickyWilds()

      freeSpinText.setText(
        'FREE SPINS\n0',
      )

      multiplierText.setText(
        'MULTIPLIER\n×1',
      )

      const completedBonusWin =
        this.bonusTotalWin

      winText.setText(
        `BONUS WIN\n${completedBonusWin.toFixed(2)}`,
      )

      statusText.setText(
        `BONUS WIN ${completedBonusWin.toFixed(2)}`,
      )

      this.showFeatureBanner(
        'BONUS WIN!',

        `${completedBonusWin.toFixed(2)} CREDITS`,

        1800,
      )

      // Credit balance only AFTER
      // showing total bonus win.
      this.time.delayedCall(
        1900,
        () => {
          this.balance =
            Number(
              (
                this.balance +
                completedBonusWin
              ).toFixed(2),
            )

          balanceText.setText(
            `BALANCE\n${this.balance.toLocaleString()}`,
          )

          this.showFeatureBanner(
            'BALANCE UPDATED',

            `+${completedBonusWin.toFixed(2)} CREDITS`,

            1000,
          )

          this.bonusTotalWin =
            0

          this.time.delayedCall(
            1100,
            () => {
              winText.setText(
                'WIN\n0',
              )

              statusText.setText(
                this.autoSpinEnabled
                  ? 'AUTO SPIN'
                  : 'READY',
              )

              // Resume Auto Spin
              // if it was enabled
              // before the bonus.
              this.scheduleAutoSpin(
                startPaidSpin,
                650,
              )
            },
          )
        },
      )

      return
    }

    // =====================================================
    // NORMAL SPIN COMPLETE
    // =====================================================

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
      1000,
      () => {
        statusText.setText(
          this.autoSpinEnabled
            ? 'AUTO SPIN'
            : 'READY',
        )

        this.scheduleAutoSpin(
          startPaidSpin,
          450,
        )
      },
    )
  }

  // =========================================================
  // FREE SPIN
  // =========================================================

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

    startPaidSpin:
      () => void,
  ): void {
    if (
      this.freeSpinsRemaining <= 0
    ) {
      return
    }

    this.freeSpinsRemaining -=
      1

    freeSpinText.setText(
      `FREE SPINS\n${this.freeSpinsRemaining}`,
    )

    this.win = 0

    winText.setText(
      `BONUS WIN\n${this.bonusTotalWin.toFixed(2)}`,
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
      startPaidSpin,
    )
  }

  // =========================================================
  // WIN HIGHLIGHTING
  // =========================================================

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
        this.symbolTexts[
          reel
        ].length;
        row += 1
      ) {
        const text =
          this.symbolTexts[
            reel
          ][row]

        this.tweens.killTweensOf(
          text,
        )

        if (
          this.isStickyWild(
            reel,
            row,
          )
        ) {
          this.applyStickyWildStyle(
            text,
          )

          continue
        }

        const symbol =
          this.currentBoard[
            reel
          ]?.[row]

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

        if (
          this.isStickyWild(
            position.reel,
            position.row,
          )
        ) {
          this.applyStickyWildStyle(
            symbolText,
          )

          this.pulseSymbol(
            symbolText,
            1.3,
            2,
          )

          continue
        }

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
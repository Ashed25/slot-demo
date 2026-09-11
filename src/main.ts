import Phaser from 'phaser'
import './style.css'

import { GAME_HEIGHT, GAME_WIDTH } from './game/config'
import SlotScene from './scenes/SlotScene'

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,

  width: GAME_WIDTH,
  height: GAME_HEIGHT,

  parent: 'app',

  backgroundColor: '#09090d',

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  scene: [SlotScene],
}

new Phaser.Game(gameConfig)
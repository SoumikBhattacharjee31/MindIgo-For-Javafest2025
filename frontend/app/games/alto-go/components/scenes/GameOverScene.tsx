import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class GameOverScene extends Scene {
  private score!: number;

  constructor() {
    super('GameOverScene');
  }

  init(data: { score: number }) {
    this.score = data.score;
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 100, 'Game Over', { fontSize: '64px', color: '#fff' }).setOrigin(0.5);
    this.add.text(width / 2, height / 2, `Score: ${Math.floor(this.score)}`, { fontSize: '32px', color: '#fff' }).setOrigin(0.5);

    const restartButton = this.add.text(width / 2, height / 2 + 100, 'Restart', { fontSize: '32px', color: '#fff' }).setOrigin(0.5).setInteractive();
    restartButton.on('pointerdown', () => {
      this.scene.start('TestScene');
    });
    
    const backButton = this.add.text(width / 2, height / 2 + 150, 'Back To Menu', { fontSize: '32px', color: '#fff' }).setOrigin(0.5).setInteractive();
    backButton.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });
  }
}

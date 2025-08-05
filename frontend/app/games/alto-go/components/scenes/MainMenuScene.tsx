import { Scene } from 'phaser';

export class MainMenuScene extends Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 100, 'Snowboarder Game', { fontSize: '64px', color: '#fff' }).setOrigin(0.5);

    const startButton = this.add.text(width / 2, height / 2, 'Start Game', { fontSize: '32px', color: '#fff' }).setOrigin(0.5).setInteractive();
    startButton.on('pointerdown', () => {
      this.scene.start('TestScene');
    });

    const highScoresButton = this.add.text(width / 2, height / 2 + 100, 'High Scores', { fontSize: '32px', color: '#fff' }).setOrigin(0.5).setInteractive();
    highScoresButton.on('pointerdown', () => {
      this.scene.start('HighScoresScene');
    });
    
    const exitButton = this.add.text(width / 2, height / 2 + 200, 'Exit', { fontSize: '32px', color: '#fff' }).setOrigin(0.5).setInteractive();
    exitButton.on('pointerdown', () => {
    //   this.scene.start('HighScoresScene');
    window.location.href="/games";
    });
  }
}

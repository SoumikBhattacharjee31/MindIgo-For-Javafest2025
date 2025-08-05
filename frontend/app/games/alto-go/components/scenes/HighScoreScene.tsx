import { Scene } from 'phaser';

export class HighScoresScene extends Scene {
  private dummyScores: number[];

  constructor() {
    super('HighScoresScene');
    this.dummyScores = [1000, 900, 800, 700, 600, 500, 400, 300];
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, 50, 'High Scores', { fontSize: '64px', color: '#fff' }).setOrigin(0.5);

    this.dummyScores.forEach((score, index) => {
      this.add.text(width / 2, 100 + index * 50, `${index + 1}. ${score}`, { fontSize: '32px', color: '#fff' }).setOrigin(0.5);
    });

    const backButton = this.add.text(width / 2, height - 50, 'Back', { fontSize: '32px', color: '#fff' }).setOrigin(0.5).setInteractive();
    backButton.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });
  }
}

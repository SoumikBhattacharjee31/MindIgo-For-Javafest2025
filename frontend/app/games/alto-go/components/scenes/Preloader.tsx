import { Scene } from "phaser";
import { musicService } from "../../services/musicService";

export class Preloader extends Scene {
  constructor() {
    super("Preloader");
  }

  init() {
    this.add.image(512, 384, "snowybg");
    this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);
    const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

    this.load.on("progress", (progress: number) => {
      bar.width = 4 + 460 * progress;
    });
  }

  preload() {
    // Load images
    this.load.image("snowybg", "/snowybg.png");
    this.load.image("snowboarder", "/snowboarder.png");
    this.load.image("bird", "/bird.png");
    this.load.image("stone", "/stone.png");
    this.load.image("coin", "/coin.png");
    this.load.image("speedIcon", "/speed.png");
    this.load.image("invulnerabilityIcon", "/star.png");
    this.load.image("magnetIcon", "/magnet.png");
    
    // Load UI elements
    this.load.image("musicOnButton", "/soundon.png");
    this.load.image("musicOffButton", "/soundoff.png");

    // Load audio files
    this.load.audio("backgroundMusic", ["/bgm.mp3", "/bgm.ogg"]);
    
    // Load sound effects (you'll need these files)
    this.load.audio("jumpSound", ["/jump.mp3", "/jump.ogg"]);
    this.load.audio("coinSound", ["/coin-collect.mp3", "/coin-collect.ogg"]);
    this.load.audio("trickSound", ["/trick.mp3", "/trick.ogg"]);
    this.load.audio("crashSound", ["/crash.mp3", "/crash.ogg"]);
    this.load.audio("powerupSound", ["/powerup.mp3", "/powerup.ogg"]);
    
    // Set the music service scene
    musicService.setScene(this);
  }

  create() {
    this.scene.start("MainMenuScene");
  }
};
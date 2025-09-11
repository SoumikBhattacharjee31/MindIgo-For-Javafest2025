import { Scene } from "phaser";
import { EventBus } from "../EventBus";

export class MainMenuScene extends Scene {
  private titleText!: Phaser.GameObjects.Text;
  private snowParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private backgroundMusic!: Phaser.Sound.BaseSound;
  private buttons: Phaser.GameObjects.Text[] = [];

  constructor() {
    super("MainMenuScene");
  }

  create() {
    const { width, height } = this.scale;

    // Create dynamic background
    this.createBackground();

    // Add animated title
    this.createAnimatedTitle();

    // Add subtitle
    this.createSubtitle();

    // Create menu buttons with modern styling
    this.createMenuButtons();

    // Add floating instructions
    this.createInstructions();

    // Setup background music
    this.setupBackgroundMusic();

    // Add entrance animations
    this.animateEntrance();

    EventBus.emit("current-scene-ready", this);
  }

  private createBackground() {
    const { width, height } = this.scale;

    // Gradient background
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x001133, 0x001133, 0x003366, 0x004488);
    graphics.fillRect(0, 0, width, height);

    // Add animated mountain silhouettes
    this.createMountainSilhouettes();

    // Add snow particles with error handling
    try {
      this.snowParticles = this.add.particles(0, 0, 'snowboarder', {
        x: { min: 0, max: width },
        y: -50,
        scale: { min: 0.003, max: 0.015 },
        alpha: { min: 0.2, max: 0.6 },
        lifespan: 12000,
        speedY: { min: 20, max: 60 },
        speedX: { min: -15, max: 15 },
        tint: 0xffffff,
        quantity: 1,
        frequency: 300
      });
    } catch (error) {
      console.warn('Could not create background particles:', error);
      // Continue without background particles
    }

    // Add twinkling stars
    this.createTwinklingStars();
  }

  private createMountainSilhouettes() {
    const { width, height } = this.scale;
    
    // Back mountains
    const backMountains = this.add.graphics();
    backMountains.fillStyle(0x001122, 0.6);
    backMountains.beginPath();
    backMountains.moveTo(0, height);
    
    for (let i = 0; i <= width; i += 50) {
      const mountainHeight = 150 + Math.sin(i * 0.01) * 50;
      backMountains.lineTo(i, height - mountainHeight);
    }
    
    backMountains.lineTo(width, height);
    backMountains.closePath();
    backMountains.fillPath();

    // Front mountains
    const frontMountains = this.add.graphics();
    frontMountains.fillStyle(0x002244, 0.8);
    frontMountains.beginPath();
    frontMountains.moveTo(0, height);
    
    for (let i = 0; i <= width; i += 40) {
      const mountainHeight = 100 + Math.sin(i * 0.015 + 1) * 40;
      frontMountains.lineTo(i, height - mountainHeight);
    }
    
    frontMountains.lineTo(width, height);
    frontMountains.closePath();
    frontMountains.fillPath();
  }

  private createTwinklingStars() {
    const { width, height } = this.scale;
    
    for (let i = 0; i < 30; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(50, width - 50),
        Phaser.Math.Between(50, height / 2),
        1,
        0xffffff,
        0.8
      );

      // Twinkling animation
      this.tweens.add({
        targets: star,
        alpha: 0.2,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000)
      });
    }
  }

  private createAnimatedTitle() {
    const { width, height } = this.scale;
    
    this.titleText = this.add.text(width / 2, height / 2 - 120, "SNOWBOARDER", {
      fontSize: "64px",
      color: "#ffffff",
      fontStyle: "bold",
      stroke: "#003366",
      strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0);

    // Add glow effect
    const glowTitle = this.add.text(width / 2, height / 2 - 120, "SNOWBOARDER", {
      fontSize: "64px",
      color: "#00ccff",
      fontStyle: "bold"
    }).setOrigin(0.5).setAlpha(0.3).setBlendMode(Phaser.BlendModes.ADD);

    // Pulsing glow animation
    this.tweens.add({
      targets: glowTitle,
      alpha: 0.1,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Floating animation
    this.tweens.add({
      targets: [this.titleText, glowTitle],
      y: height / 2 - 130,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createSubtitle() {
    const { width, height } = this.scale;
    
    const subtitle = this.add.text(width / 2, height / 2 - 60, "Extreme Mountain Adventure", {
      fontSize: "24px",
      color: "#cccccc",
      fontStyle: "italic"
    }).setOrigin(0.5).setAlpha(0);

    this.buttons.push(subtitle);
  }

  private createMenuButtons() {
    const { width, height } = this.scale;
    
    const buttonConfigs = [
      {
        text: "🏂 START GAME",
        y: height / 2 + 20,
        color: "#4CAF50",
        hoverColor: "#45a049",
        action: () => this.startGame()
      },
      {
        text: "🏆 HIGH SCORES",
        y: height / 2 + 90,
        color: "#FF9800",
        hoverColor: "#F57C00",
        action: () => this.showHighScores()
      },
      {
        text: "⚙️ SETTINGS",
        y: height / 2 + 160,
        color: "#607D8B",
        hoverColor: "#455A64",
        action: () => this.showSettings()
      },
      {
        text: "❌ EXIT",
        y: height / 2 + 230,
        color: "#F44336",
        hoverColor: "#D32F2F",
        action: () => this.exitGame()
      }
    ];

    buttonConfigs.forEach((config, index) => {
      const button = this.add.text(width / 2, config.y, config.text, {
        fontSize: "32px",
        color: "#ffffff",
        backgroundColor: config.color,
        padding: { x: 25, y: 12 },
        fontStyle: "bold"
      }).setOrigin(0.5).setAlpha(0).setInteractive();

      this.setupButtonEffects(button, config.color, config.hoverColor, config.action);
      this.buttons.push(button);
    });
  }

  private setupButtonEffects(
    button: Phaser.GameObjects.Text, 
    originalColor: string, 
    hoverColor: string, 
    action: () => void
  ) {
    // Hover effects
    button.on('pointerover', () => {
      button.setStyle({ backgroundColor: hoverColor });
      this.tweens.add({
        targets: button,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 150,
        ease: 'Power2'
      });
    });

    button.on('pointerout', () => {
      button.setStyle({ backgroundColor: originalColor });
      this.tweens.add({
        targets: button,
        scaleX: 1,
        scaleY: 1,
        duration: 150,
        ease: 'Power2'
      });
    });

    // Click effects
    button.on('pointerdown', () => {
      this.tweens.add({
        targets: button,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 100,
        yoyo: true,
        ease: 'Power2',
        onComplete: action
      });
    });
  }

  private createInstructions() {
    const { width, height } = this.scale;
    
    const instructions = this.add.text(width / 2, height - 100, 
      "SPACE/UP - Jump  •  LEFT/RIGHT - Tricks  •  DOWN - Spin", 
      {
        fontSize: "18px",
        color: "#888888",
        align: "center"
      }
    ).setOrigin(0.5).setAlpha(0);

    // Fade in and out animation
    this.tweens.add({
      targets: instructions,
      alpha: 0.4,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.buttons.push(instructions);
  }

  private setupBackgroundMusic() {
    if (!this.sound.get("backgroundMusic")) {
      this.backgroundMusic = this.sound.add("backgroundMusic", {
        loop: true,
        volume: 0.2
      });
    }
  }

  private animateEntrance() {
    // Title entrance
    this.tweens.add({
      targets: this.titleText,
      alpha: 1,
      y: this.titleText.y,
      duration: 1000,
      ease: 'Back.easeOut'
    });

    // Buttons entrance with stagger
    this.buttons.forEach((button, index) => {
      this.tweens.add({
        targets: button,
        alpha: index === 0 ? 0.7 : 1, // Subtitle is more subtle
        x: button.x,
        duration: 600,
        delay: 200 + index * 150,
        ease: 'Power2.easeOut'
      });
    });

    // Screen fade in
    this.cameras.main.fadeIn(800);
  }

  private startGame() {
    // Play transition sound effect (if available)
    this.cameras.main.fadeOut(500);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start("TestScene");
    });
  }

  private showHighScores() {
    this.cameras.main.fadeOut(300);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start("HighScoresScene");
    });
  }

  private showSettings() {
    // For now, just show a simple settings panel
    this.showSettingsModal();
  }

  private showSettingsModal() {
    const { width, height } = this.scale;
    
    // Create modal background
    const modalBg = this.add.rectangle(width / 2, height / 2, 400, 300, 0x000000, 0.8);
    const modalFrame = this.add.rectangle(width / 2, height / 2, 390, 290, 0x333333);
    modalFrame.setStrokeStyle(3, 0x00ccff);

    // Modal title
    const modalTitle = this.add.text(width / 2, height / 2 - 100, "Settings", {
      fontSize: "32px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5);

    // Music toggle (simulated)
    const musicToggle = this.add.text(width / 2, height / 2 - 30, "🔊 Music: ON", {
      fontSize: "24px",
      color: "#ffffff",
      backgroundColor: "#4CAF50",
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    let musicOn = true;
    musicToggle.on('pointerdown', () => {
      musicOn = !musicOn;
      musicToggle.setText(musicOn ? "🔊 Music: ON" : "🔇 Music: OFF");
      musicToggle.setStyle({ backgroundColor: musicOn ? "#4CAF50" : "#F44336" });
    });

    // Close button
    const closeButton = this.add.text(width / 2, height / 2 + 60, "Close", {
      fontSize: "24px",
      color: "#ffffff",
      backgroundColor: "#607D8B",
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    closeButton.on('pointerdown', () => {
      modalBg.destroy();
      modalFrame.destroy();
      modalTitle.destroy();
      musicToggle.destroy();
      closeButton.destroy();
    });
  }

  private exitGame() {
    // Create confirmation dialog
    const { width, height } = this.scale;
    
    const confirmBg = this.add.rectangle(width / 2, height / 2, 350, 200, 0x000000, 0.9);
    const confirmFrame = this.add.rectangle(width / 2, height / 2, 340, 190, 0x444444);
    confirmFrame.setStrokeStyle(2, 0xff4444);

    const confirmText = this.add.text(width / 2, height / 2 - 30, "Exit to main site?", {
      fontSize: "24px",
      color: "#ffffff"
    }).setOrigin(0.5);

    const yesButton = this.add.text(width / 2 - 60, height / 2 + 40, "Yes", {
      fontSize: "20px",
      color: "#ffffff",
      backgroundColor: "#F44336",
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    const noButton = this.add.text(width / 2 + 60, height / 2 + 40, "No", {
      fontSize: "20px",
      color: "#ffffff",
      backgroundColor: "#4CAF50",
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    yesButton.on('pointerdown', () => {
      window.location.href = "/games";
    });

    noButton.on('pointerdown', () => {
      confirmBg.destroy();
      confirmFrame.destroy();
      confirmText.destroy();
      yesButton.destroy();
      noButton.destroy();
    });
  }

  update() {
    // Add subtle camera movements for dynamic feel
    this.cameras.main.setScroll(
      Math.sin(this.time.now * 0.001) * 2,
      Math.cos(this.time.now * 0.0008) * 1
    );
  }
}
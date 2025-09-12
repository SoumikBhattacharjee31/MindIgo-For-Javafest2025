import { Scene } from "phaser";
import { EventBus } from "../EventBus";
import { userService, User } from "../../services/userService";
import { apiService } from "../../services/apiService";
import { musicService } from "../../services/musicService";

export class MainMenuScene extends Scene {
  private titleText!: Phaser.GameObjects.Text;
  private snowParticles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private backgroundMusic!: Phaser.Sound.BaseSound;
  private buttons: Phaser.GameObjects.Text[] = [];
  private userInfoText!: Phaser.GameObjects.Text;
  private currentUser: User | null = null;
  private personalBestText!: Phaser.GameObjects.Text;
  private connectionStatusText!: Phaser.GameObjects.Text;

  constructor() {
    super("MainMenuScene");
  }

  create() {
    const { width, height } = this.scale;

    // Initialize user
    this.initializeUser();

    // Create dynamic background
    this.createBackground();

    // Add animated title
    this.createAnimatedTitle();

    // Add subtitle
    this.createSubtitle();

    // Create user info display
    this.createUserInfo();

    // Create menu buttons with modern styling
    this.createMenuButtons();

    // Add floating instructions
    this.createInstructions();

    // Setup background music
    this.setupBackgroundMusic();

    // Add entrance animations
    this.animateEntrance();

    // Check connection and load user stats
    this.loadUserStats();

    EventBus.emit("current-scene-ready", this);
  }

  private initializeUser() {
    this.currentUser = userService.getCurrentUser();
    if (!this.currentUser) {
      this.currentUser = userService.initializeUser();
    }
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

    const glowTitle = this.add.text(width / 2, height / 2 - 120, "SNOWBOARDER", {
      fontSize: "64px",
      color: "#00ccff",
      fontStyle: "bold"
    }).setOrigin(0.5).setAlpha(0.3).setBlendMode(Phaser.BlendModes.ADD);

    this.tweens.add({
      targets: glowTitle,
      alpha: 0.1,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

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

  private createUserInfo() {
    const { width } = this.scale;
    
    // User name and info
    const userName = this.currentUser?.name || 'Guest Player';
    this.userInfoText = this.add.text(20, 20, `Welcome, ${userName}!`, {
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#004466",
      padding: { x: 10, y: 5 },
      fontStyle: "bold"
    }).setAlpha(0);

    // Personal best display (will be updated when loaded)
    this.personalBestText = this.add.text(20, 50, "Personal Best: Loading...", {
      fontSize: "14px",
      color: "#cccccc",
      backgroundColor: "#003344",
      padding: { x: 8, y: 4 }
    }).setAlpha(0);

    // Connection status
    this.connectionStatusText = this.add.text(width - 20, 20, "Offline", {
      fontSize: "14px",
      color: "#ff4444",
      backgroundColor: "#440000",
      padding: { x: 8, y: 4 }
    }).setOrigin(1, 0).setAlpha(0);

    // Account management button
    const accountButton = this.add.text(width - 20, 50, "Account", {
      fontSize: "16px",
      color: "#ffffff",
      backgroundColor: "#2196F3",
      padding: { x: 10, y: 5 }
    }).setOrigin(1, 0).setAlpha(0).setInteractive();

    this.setupButtonEffects(accountButton, "#2196F3", "#1976D2", () => this.showAccountMenu());

    this.buttons.push(this.userInfoText, this.personalBestText, this.connectionStatusText, accountButton);
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
        text: "🚪 EXIT",
        y: height / 2 + 230,
        color: "#F44336",
        hoverColor: "#D32F2F",
        action: () => { window.location.href = '/games'; }
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
    musicService.setScene(this);
    
    // Start background music if enabled
    if (musicService.getMusicEnabled()) {
      musicService.playBackgroundMusic('backgroundMusic');
    }
  }

  private toggleMusic() {
    const isEnabled = musicService.getMusicEnabled();
    musicService.setMusicEnabled(!isEnabled);
    
    // Update button texture
    // this.musicButton.setTexture(isEnabled ? "musicOffButton" : "musicOnButton");
  };

  private async loadUserStats() {
    try {
      // Check connection by trying to load personal best
      const response = await apiService.getPersonalBest();
      
      if (response.success) {
        this.connectionStatusText.setText("Online");
        this.connectionStatusText.setStyle({ color: "#00ff00", backgroundColor: "#004400" });
        
        if (response.data && response.data.score) {
          this.personalBestText.setText(`Personal Best: ${response.data.score.toLocaleString()}`);
        } else {
          this.personalBestText.setText("Personal Best: No scores yet");
        }
      } else {
        throw new Error('Backend not available');
      }
    } catch (error) {
      console.warn('Backend connection failed:', error);
      this.connectionStatusText.setText("Offline");
      this.connectionStatusText.setStyle({ color: "#ff4444", backgroundColor: "#440000" });
      
      // Load offline high score
      const offlineHighScore = localStorage.getItem('snowboarder_highscore');
      if (offlineHighScore && parseInt(offlineHighScore) > 0) {
        this.personalBestText.setText(`Personal Best: ${parseInt(offlineHighScore).toLocaleString()} (Offline)`);
      } else {
        this.personalBestText.setText("Personal Best: No scores yet");
      }
    }
  }

  private showAccountMenu() {
    const { width, height } = this.scale;
    
    const modalBg = this.add.rectangle(width / 2, height / 2, 350, 250, 0x000000, 0.8);
    const modalFrame = this.add.rectangle(width / 2, height / 2, 340, 240, 0x333333);
    modalFrame.setStrokeStyle(3, 0x00ccff);

    const modalTitle = this.add.text(width / 2, height / 2 - 80, "Account", {
      fontSize: "28px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5);

    const userEmail = this.currentUser?.email || 'guest@snowboarder.game';
    const userInfo = this.add.text(width / 2, height / 2 - 40, `Logged in as:\n${userEmail}`, {
      fontSize: "16px",
      color: "#cccccc",
      align: "center"
    }).setOrigin(0.5);

    const changeNameButton = this.add.text(width / 2, height / 2 + 10, "Change Name", {
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#4CAF50",
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    const logoutButton = this.add.text(width / 2, height / 2 + 50, "Logout", {
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#F44336",
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    const closeButton = this.add.text(width / 2, height / 2 + 90, "Close", {
      fontSize: "16px",
      color: "#ffffff",
      backgroundColor: "#607D8B",
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    const closeModal = () => {
      modalBg.destroy();
      modalFrame.destroy();
      modalTitle.destroy();
      userInfo.destroy();
      changeNameButton.destroy();
      logoutButton.destroy();
      closeButton.destroy();
    };

    changeNameButton.on('pointerdown', () => {
      closeModal();
      this.showChangeNameDialog();
    });

    logoutButton.on('pointerdown', () => {
      userService.logout();
      closeModal();
      this.scene.restart();
    });

    closeButton.on('pointerdown', closeModal);
  }

  private showChangeNameDialog() {
    const { width, height } = this.scale;
    
    const modalBg = this.add.rectangle(width / 2, height / 2, 400, 200, 0x000000, 0.8);
    const modalFrame = this.add.rectangle(width / 2, height / 2, 390, 190, 0x333333);
    modalFrame.setStrokeStyle(2, 0x00ccff);

    const modalTitle = this.add.text(width / 2, height / 2 - 60, "Change Name", {
      fontSize: "24px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5);

    // Create a simple input simulation (since Phaser doesn't have native inputs)
    const inputBg = this.add.rectangle(width / 2, height / 2 - 20, 300, 40, 0x444444);
    inputBg.setStrokeStyle(2, 0x666666);

    const inputText = this.add.text(width / 2, height / 2 - 20, this.currentUser?.name || '', {
      fontSize: "18px",
      color: "#ffffff"
    }).setOrigin(0.5);

    const saveButton = this.add.text(width / 2 - 50, height / 2 + 40, "Save", {
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#4CAF50",
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    const cancelButton = this.add.text(width / 2 + 50, height / 2 + 40, "Cancel", {
      fontSize: "18px",
      color: "#ffffff",
      backgroundColor: "#666666",
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();

    const closeModal = () => {
      modalBg.destroy();
      modalFrame.destroy();
      modalTitle.destroy();
      inputBg.destroy();
      inputText.destroy();
      saveButton.destroy();
      cancelButton.destroy();
    };

    saveButton.on('pointerdown', () => {
      // In a real implementation, you'd handle actual input
      // For demo purposes, we'll just show a success message
      closeModal();
      this.showNotification("Name change feature coming soon!");
    });

    cancelButton.on('pointerdown', closeModal);
  }

  private showNotification(message: string) {
    const { width } = this.scale;
    
    const notification = this.add.text(width / 2, 150, message, {
      fontSize: "16px",
      color: "#ffffff",
      backgroundColor: "#4CAF50",
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: notification,
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });

    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: notification,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => notification.destroy()
      });
    });
  }

  private animateEntrance() {
    this.tweens.add({
      targets: this.titleText,
      alpha: 1,
      y: this.titleText.y,
      duration: 1000,
      ease: 'Back.easeOut'
    });

    this.buttons.forEach((button, index) => {
      this.tweens.add({
        targets: button,
        alpha: index === 0 ? 0.7 : 1,
        x: button.x,
        duration: 600,
        delay: 200 + index * 150,
        ease: 'Power2.easeOut'
      });
    });

    this.cameras.main.fadeIn(800);
  }

  private startGame() {
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
    this.showSettingsModal();
  }

  private showSettingsModal() {
    const { width, height } = this.scale;
    
    const modalBg = this.add.rectangle(width / 2, height / 2, 400, 300, 0x000000, 0.8);
    const modalFrame = this.add.rectangle(width / 2, height / 2, 390, 290, 0x333333);
    modalFrame.setStrokeStyle(3, 0x00ccff);

    const modalTitle = this.add.text(width / 2, height / 2 - 100, "Settings", {
      fontSize: "32px",
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5);

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

  update() {
    this.cameras.main.setScroll(
      Math.sin(this.time.now * 0.001) * 2,
      Math.cos(this.time.now * 0.0008) * 1
    );
  }
}
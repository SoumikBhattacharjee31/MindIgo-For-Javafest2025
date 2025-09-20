import { Scene } from "phaser";
import { EventBus } from "@/app/dashboard/games/alto-go/components/EventBus";
import { apiService } from "@/app/dashboard/games/alto-go/services/apiService";
import { userService } from "@/app/dashboard/games/alto-go/services/userService";

export class GameOverScene extends Scene {
  private score!: number;
  private maxCombo!: number;
  private highScore!: number;
  private isNewRecord: boolean = false;
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private isSavingScore: boolean = false;
  private scoreSaved: boolean = false;

  constructor() {
    super("GameOverScene");
  }

  init(data: { score: number; maxCombo?: number }) {
    this.score = data?.score ?? 0;
    this.maxCombo = data.maxCombo || 0;
    this.isSavingScore = false;
    this.scoreSaved = false;
    // this.loadHighScore();
  }

  async create() {
    const { width, height } = this.scale;

    // Initialize user if not already done
    userService.initializeUser();

    await this.loadHighScore();

    // Add background gradient
    this.createBackground();

    // Add particle effects for celebration if new record
    if (this.isNewRecord) {
      this.createCelebrationParticles();
    }

    // Create animated title
    this.createGameOverTitle();

    // Create stats display
    this.createStatsDisplay();

    // Create buttons with hover effects
    this.createButtons();

    // Add entrance animations
    this.animateEntrance();

    // Save score to backend
    this.saveScoreToBackend();

    EventBus.emit("current-scene-ready", this);
  }

  private async loadHighScore() {
    try {
      // Try to get personal best from backend
      const response = await apiService.getPersonalBest();
      if (response.success && response.data) {
        this.highScore = response.data.score;
      } else {
        // Fallback to local storage or default
        this.highScore =
          parseInt(localStorage.getItem("snowboarder_highscore") || "0") || 0; // Add || 0 here
      }
    } catch (error) {
      console.error("Failed to load high score from backend:", error);
      // Fallback to local storage
      this.highScore = parseInt(
        localStorage.getItem("snowboarder_highscore") || "0"
      );
    }

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.isNewRecord = true;
      // Save to localStorage as backup
      localStorage.setItem("snowboarder_highscore", this.highScore.toString());
    }
  }

  private async saveScoreToBackend() {
    if (this.isSavingScore || this.scoreSaved) return;

    this.isSavingScore = true;

    try {
      const response = await apiService.saveScore({
        score: Math.floor(this.score),
      });

      if (response.success) {
        this.scoreSaved = true;
        console.log("Score saved successfully:", response.data);

        // Show success message
        this.showFloatingText(
          this.scale.width / 2,
          this.scale.height - 100,
          "Score Saved!",
          0x00ff00,
          1000
        );
      } else {
        throw new Error(response.message || "Failed to save score");
      }
    } catch (error) {
      console.error("Failed to save score to backend:", error);

      // Show error message but continue with game
      this.showFloatingText(
        this.scale.width / 2,
        this.scale.height - 100,
        "Score save failed - playing offline",
        0xff4444,
        2000
      );

      // Save locally as backup
      const localScores = JSON.parse(
        localStorage.getItem("snowboarder_offline_scores") || "[]"
      );
      localScores.push({
        score: Math.floor(this.score),
        timestamp: new Date().toISOString(),
        uploaded: false,
      });
      localStorage.setItem(
        "snowboarder_offline_scores",
        JSON.stringify(localScores)
      );
    } finally {
      this.isSavingScore = false;
    }
  }

  private createBackground() {
    const { width, height } = this.scale;

    // Create gradient background
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x001122, 0x001122, 0x004455, 0x004455);
    graphics.fillRect(0, 0, width, height);

    // Add animated snow particles with error handling
    try {
      const snowParticles = this.add.particles(0, 0, "snowboarder", {
        x: { min: 0, max: width },
        y: -50,
        scale: { min: 0.005, max: 0.02 },
        alpha: { min: 0.3, max: 0.8 },
        lifespan: 8000,
        speedY: { min: 30, max: 80 },
        speedX: { min: -20, max: 20 },
        tint: 0xffffff,
        quantity: 2,
        frequency: 200,
      });
    } catch (error) {
      console.warn("Could not create background snow particles:", error);
    }
  }

  private createCelebrationParticles() {
    const { width, height } = this.scale;

    // Golden confetti for new record
    this.particles = this.add.particles(width / 2, height / 2, "snowboarder", {
      scale: { min: 0.01, max: 0.03 },
      speed: { min: 100, max: 200 },
      alpha: { start: 1, end: 0 },
      lifespan: 2000,
      tint: [0xffd700, 0xffff00, 0xff8c00, 0xff1493],
      quantity: 5,
      frequency: 100,
      emitZone: {
        type: "edge",
        source: new Phaser.Geom.Circle(0, 0, 50),
        quantity: 20,
      },
    });

    // Stop particles after celebration
    this.time.delayedCall(3000, () => {
      this.particles.stop();
    });
  }

  private createGameOverTitle() {
    const { width, height } = this.scale;

    const titleText = this.isNewRecord ? "NEW RECORD!" : "Game Over";
    const titleColor = this.isNewRecord ? "#ffd700" : "#ffffff";

    const title = this.add
      .text(width / 2, height / 2 - 180, titleText, {
        fontSize: "72px",
        color: titleColor,
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Pulsing effect for new record
    if (this.isNewRecord) {
      this.tweens.add({
        targets: title,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    return title;
  }

  private createStatsDisplay() {
    const { width, height } = this.scale;

    // Score display
    const scoreLabel = this.add
      .text(width / 2, height / 2 - 80, "Final Score", {
        fontSize: "32px",
        color: "#cccccc",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const scoreValue = this.add
      .text(width / 2, height / 2 - 40, `${Math.floor(this.score)}`, {
        fontSize: "48px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Max combo display
    const comboLabel = this.add
      .text(width / 2 - 150, height / 2 + 20, "Max Combo", {
        fontSize: "24px",
        color: "#cccccc",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const comboValue = this.add
      .text(width / 2 - 150, height / 2 + 50, `x${this.maxCombo}`, {
        fontSize: "32px",
        color: "#ffff00",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // High score display
    const highScoreLabel = this.add
      .text(width / 2 + 150, height / 2 + 20, "High Score", {
        fontSize: "24px",
        color: "#cccccc",
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const highScoreValue = this.add
      .text(
        width / 2 + 150,
        height / 2 + 50,
        `${Math.floor(this.highScore || 0)}`,
        {
          fontSize: "32px",
          color: "#ffd700",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 2,
        }
      )
      .setOrigin(0.5)
      .setAlpha(0);

    return [
      scoreLabel,
      scoreValue,
      comboLabel,
      comboValue,
      highScoreLabel,
      highScoreValue,
    ];
  }

  private createButtons() {
    const { width, height } = this.scale;

    // Restart button
    const restartButton = this.add
      .text(width / 2, height / 2 + 120, "🔄 Play Again", {
        fontSize: "36px",
        color: "#ffffff",
        backgroundColor: "#4CAF50",
        padding: { x: 20, y: 10 },
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setInteractive();

    this.setupButtonHover(restartButton, "#45a049");
    restartButton.on("pointerdown", () => {
      this.cameras.main.fadeOut(300);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("TestScene");
      });
    });

    // Menu button
    const menuButton = this.add
      .text(width / 2, height / 2 + 180, "🏠 Main Menu", {
        fontSize: "36px",
        color: "#ffffff",
        backgroundColor: "#2196F3",
        padding: { x: 20, y: 10 },
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setInteractive();

    this.setupButtonHover(menuButton, "#1976D2");
    menuButton.on("pointerdown", () => {
      this.cameras.main.fadeOut(300);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("MainMenuScene");
      });
    });

    // High Scores button
    const highScoresButton = this.add
      .text(width / 2, height / 2 + 240, "🏆 High Scores", {
        fontSize: "32px",
        color: "#ffffff",
        backgroundColor: "#FF9800",
        padding: { x: 15, y: 8 },
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setInteractive();

    this.setupButtonHover(highScoresButton, "#F57C00");
    highScoresButton.on("pointerdown", () => {
      this.cameras.main.fadeOut(300);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("HighScoresScene");
      });
    });

    return [restartButton, menuButton, highScoresButton];
  }

  private setupButtonHover(
    button: Phaser.GameObjects.Text,
    hoverColor: string
  ) {
    const originalColor = button.style.backgroundColor;

    button.on("pointerover", () => {
      button.setStyle({ backgroundColor: hoverColor });
      this.tweens.add({
        targets: button,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: "Power2",
      });
    });

    button.on("pointerout", () => {
      button.setStyle({ backgroundColor: originalColor });
      this.tweens.add({
        targets: button,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: "Power2",
      });
    });

    button.on("pointerdown", () => {
      this.tweens.add({
        targets: button,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 50,
        yoyo: true,
        ease: "Power2",
      });
    });
  }

  private showFloatingText(
    x: number,
    y: number,
    text: string,
    color: number,
    duration: number = 1000
  ) {
    const floatingText = this.add
      .text(x, y, text, {
        fontSize: "16px",
        color: Phaser.Display.Color.IntegerToColor(color).rgba,
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({
      targets: floatingText,
      alpha: 1,
      y: y - 30,
      duration: 300,
      ease: "Power2",
    });

    this.tweens.add({
      targets: floatingText,
      alpha: 0,
      y: y - 60,
      duration: 300,
      delay: duration - 300,
      ease: "Power2",
      onComplete: () => floatingText.destroy(),
    });
  }

  private animateEntrance() {
    const { width, height } = this.scale;

    // Get all UI elements
    const title =
      this.children.getByName("title") ||
      this.children.list.find(
        (child) =>
          child instanceof Phaser.GameObjects.Text &&
          (child.text === "Game Over" || child.text === "NEW RECORD!")
      );

    const allElements = this.children.list.filter(
      (child) => child instanceof Phaser.GameObjects.Text && child.alpha === 0
    );

    // Animate title first
    this.tweens.add({
      targets: title,
      alpha: 1,
      y: title ? (title as Phaser.GameObjects.Text).y : height / 2 - 180,
      duration: 600,
      ease: "Back.easeOut",
    });

    // Animate other elements with stagger
    allElements.forEach((element, index) => {
      if (element !== title) {
        this.tweens.add({
          targets: element,
          alpha: 1,
          y: (element as Phaser.GameObjects.Text).y,
          duration: 400,
          delay: 200 + index * 100,
          ease: "Power2.easeOut",
        });
      }
    });

    // Screen flash for new record
    if (this.isNewRecord) {
      const flash = this.add.rectangle(
        width / 2,
        height / 2,
        width,
        height,
        0xffd700,
        0.3
      );
      this.tweens.add({
        targets: flash,
        alpha: 0,
        duration: 800,
        ease: "Power2.easeOut",
        onComplete: () => flash.destroy(),
      });
    }

    // Camera fade in
    this.cameras.main.fadeIn(500);
  }

  private calculateGrade(): string {
    if (this.score >= 10000) return "S+";
    if (this.score >= 8000) return "S";
    if (this.score >= 6000) return "A+";
    if (this.score >= 4000) return "A";
    if (this.score >= 3000) return "B+";
    if (this.score >= 2000) return "B";
    if (this.score >= 1000) return "C+";
    if (this.score >= 500) return "C";
    return "D";
  }
}

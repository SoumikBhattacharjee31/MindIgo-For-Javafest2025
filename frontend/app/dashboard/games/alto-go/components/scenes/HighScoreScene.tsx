import { Scene } from "phaser";
import { apiService, ScoreResponse } from "../../services/apiService";
import { userService } from "../../services/userService";

export class HighScoresScene extends Scene {
  private topScores: ScoreResponse[] = [];
  private personalScores: ScoreResponse[] = [];
  private isLoading: boolean = true;
  private currentView: 'global' | 'personal' = 'global';
  private loadingText!: Phaser.GameObjects.Text;
  private errorText!: Phaser.GameObjects.Text;
  private scoresContainer!: Phaser.GameObjects.Container;
  private toggleButton!: Phaser.GameObjects.Text;

  constructor() {
    super("HighScoresScene");
  }

  async create() {
    const { width, height } = this.scale;

    // Initialize user
    userService.initializeUser();

    // Create background
    this.createBackground();

    // Create title
    this.add.text(width / 2, 50, "High Scores", { 
      fontSize: "48px", 
      color: "#ffffff",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 3
    }).setOrigin(0.5);

    // Create loading text
    this.loadingText = this.add.text(width / 2, height / 2, "Loading scores...", {
      fontSize: "24px",
      color: "#cccccc"
    }).setOrigin(0.5);

    // Create error text (initially hidden)
    this.errorText = this.add.text(width / 2, height / 2, "", {
      fontSize: "20px",
      color: "#ff4444",
      align: "center",
      wordWrap: { width: width - 100 }
    }).setOrigin(0.5).setVisible(false);

    // Create container for scores
    this.scoresContainer = this.add.container(0, 0);

    // Create view toggle button
    this.createToggleButton();

    // Create back button
    this.createBackButton();

    // Load scores from backend
    await this.loadScores();
  }

  private createBackground() {
    const { width, height } = this.scale;
    
    // Create gradient background
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x001122, 0x001122, 0x004455, 0x004455);
    graphics.fillRect(0, 0, width, height);

    // Add some decorative elements
    for (let i = 0; i < 20; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(50, width - 50),
        Phaser.Math.Between(50, height / 2),
        1,
        0xffffff,
        0.6
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

  private createToggleButton() {
    const { width } = this.scale;
    
    this.toggleButton = this.add.text(width / 2, 120, "Show Personal Scores", {
      fontSize: "20px",
      color: "#ffffff",
      backgroundColor: "#2196F3",
      padding: { x: 15, y: 8 },
      fontStyle: "bold"
    }).setOrigin(0.5).setInteractive().setVisible(false);

    this.setupButtonHover(this.toggleButton, "#2196F3", "#1976D2");
    
    this.toggleButton.on('pointerdown', () => {
      this.currentView = this.currentView === 'global' ? 'personal' : 'global';
      this.updateScoresDisplay();
      this.updateToggleButton();
    });
  }

  private createBackButton() {
    const { width, height } = this.scale;
    
    const backButton = this.add.text(width / 2, height - 50, "Back to Menu", { 
      fontSize: "28px", 
      color: "#ffffff",
      backgroundColor: "#666666",
      padding: { x: 20, y: 10 },
      fontStyle: "bold"
    }).setOrigin(0.5).setInteractive();

    this.setupButtonHover(backButton, "#666666", "#555555");
    
    backButton.on("pointerdown", () => {
      this.scene.start("MainMenuScene");
    });
  }

  private setupButtonHover(button: Phaser.GameObjects.Text, originalColor: string, hoverColor: string) {
    button.on('pointerover', () => {
      button.setStyle({ backgroundColor: hoverColor });
      this.tweens.add({
        targets: button,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: 'Power2'
      });
    });

    button.on('pointerout', () => {
      button.setStyle({ backgroundColor: originalColor });
      this.tweens.add({
        targets: button,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Power2'
      });
    });
  }

  private async loadScores() {
    try {
      this.isLoading = true;
      this.loadingText.setVisible(true);

      // Load global top 10 scores
      const globalResponse = await apiService.getTop10Scores();
      if (globalResponse.success && globalResponse.data) {
        this.topScores = globalResponse.data;
      }

      // Try to load personal scores
      try {
        const personalResponse = await apiService.getMyScores();
        if (personalResponse.success && personalResponse.data) {
          this.personalScores = personalResponse.data.sort((a, b) => b.score - a.score).slice(0, 10);
        }
      } catch (personalError) {
        console.warn('Failed to load personal scores:', personalError);
        // Continue without personal scores
      }

      this.isLoading = false;
      this.loadingText.setVisible(false);
      this.toggleButton.setVisible(true);
      
      this.updateScoresDisplay();
      this.updateToggleButton();

    } catch (error) {
      console.error('Failed to load scores:', error);
      this.handleLoadingError(error);
    }
  }

  private handleLoadingError(error: any) {
    this.isLoading = false;
    this.loadingText.setVisible(false);
    
    // Show error message
    const errorMessage = error.message || 'Failed to load scores. Please check your connection.';
    this.errorText.setText(`Error: ${errorMessage}\n\nTrying offline scores...`);
    this.errorText.setVisible(true);

    // Try to load offline scores
    this.loadOfflineScores();

    // Hide error after 5 seconds
    this.time.delayedCall(5000, () => {
      this.errorText.setVisible(false);
    });
  }

  private loadOfflineScores() {
    try {
      const offlineScores = JSON.parse(localStorage.getItem('snowboarder_offline_scores') || '[]');
      const highScore = parseInt(localStorage.getItem('snowboarder_highscore') || '0');
      
      // Create dummy scores with offline data
      this.topScores = [];
      if (highScore > 0) {
        const user = userService.getCurrentUser();
        this.topScores.push({
          id: 1,
          playerId: user?.id || 'offline',
          playerName: user?.name || 'You',
          score: highScore,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      // Add some dummy scores for demonstration
      const dummyScores = [1000, 900, 800, 700, 600, 500, 400, 300];
      dummyScores.forEach((score, index) => {
        if (score < highScore) { // Only add dummy scores lower than player's high score
          this.topScores.push({
            id: index + 2,
            playerId: `dummy_${index}`,
            playerName: `Player ${index + 1}`,
            score: score,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      });

      this.topScores.sort((a, b) => b.score - a.score);
      this.updateScoresDisplay();

    } catch (error) {
      console.error('Failed to load offline scores:', error);
    }
  }

  private updateScoresDisplay() {
    // Clear existing scores
    this.scoresContainer.removeAll(true);

    const { width } = this.scale;
    const scores = this.currentView === 'global' ? this.topScores : this.personalScores;
    const currentUser = userService.getCurrentUser();

    if (scores.length === 0) {
      const noScoresText = this.add.text(width / 2, 200, 
        this.currentView === 'global' ? 'No global scores available' : 'No personal scores found', 
        {
          fontSize: "24px",
          color: "#cccccc"
        }
      ).setOrigin(0.5);
      this.scoresContainer.add(noScoresText);
      return;
    }

    // Display scores
    scores.forEach((scoreData, index) => {
      const yPos = 180 + index * 40;
      const isCurrentUser = scoreData.playerId === currentUser?.id;
      
      // Rank
      const rankText = this.add.text(50, yPos, `${index + 1}.`, {
        fontSize: "24px",
        color: index < 3 ? "#ffd700" : "#ffffff",
        fontStyle: "bold"
      });
      this.scoresContainer.add(rankText);

      // Player name
      const nameColor = isCurrentUser ? "#00ff00" : "#ffffff";
      const playerName = scoreData.playerName || `Player ${scoreData.playerId.slice(-6)}`;
      const nameText = this.add.text(100, yPos, playerName, {
        fontSize: "20px",
        color: nameColor,
        fontStyle: isCurrentUser ? "bold" : "normal"
      });
      this.scoresContainer.add(nameText);

      // Score
      const scoreText = this.add.text(width - 100, yPos, scoreData.score.toLocaleString(), {
        fontSize: "20px",
        color: index < 3 ? "#ffd700" : "#ffffff",
        fontStyle: "bold"
      }).setOrigin(1, 0);
      this.scoresContainer.add(scoreText);

      // Date (for personal scores)
      if (this.currentView === 'personal') {
        const date = new Date(scoreData.createdAt).toLocaleDateString();
        const dateText = this.add.text(width - 200, yPos, date, {
          fontSize: "16px",
          color: "#cccccc"
        }).setOrigin(1, 0);
        this.scoresContainer.add(dateText);
      }

      // Highlight current user's score
      if (isCurrentUser) {
        const highlight = this.add.rectangle(width / 2, yPos + 10, width - 60, 35, 0x004400, 0.3);
        this.scoresContainer.add(highlight);
        this.scoresContainer.sendToBack(highlight);
      }
    });
  }

  private updateToggleButton() {
    if (this.currentView === 'global') {
      this.toggleButton.setText('Show Personal Scores');
      this.toggleButton.setStyle({ backgroundColor: "#2196F3" });
    } else {
      this.toggleButton.setText('Show Global Scores');
      this.toggleButton.setStyle({ backgroundColor: "#FF9800" });
    }
  }

  update() {
    // Add subtle animations or effects if needed
  }
}
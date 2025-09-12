import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import { musicService } from "../../services/musicService";

export class TestScene extends Scene {
  private snowybg!: Phaser.GameObjects.TileSprite;
  private graphics!: Phaser.GameObjects.Graphics;
  private curve!: Phaser.Curves.Spline;
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private curvePoints!: Phaser.Math.Vector2[];
  private curveIndex: number = 0;
  private isJumping: boolean = false;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private collectibles!: Phaser.Physics.Arcade.Group;
  private particleEmitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
  private score: number = 0;
  private combo: number = 0;
  private maxCombo: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private speedText!: Phaser.GameObjects.Text;
  private baseVelocity: number = 120;
  private velocity: number = 120;
  private maxVelocity: number = 300;
  private acceleration: number = 0.5;
  private jumpPower: number = 450;
  private airTime: number = 0;
  private groundTime: number = 0;
  private isGrounded: boolean = true;
  private cameraTween!: Phaser.Tweens.Tween;
  // --- REMOVED: Local music state. The service will handle this now. ---
  // private backgroundMusic!: Phaser.Sound.BaseSound;
  // private isMusicPlaying: boolean = false;
  private musicButton!: Phaser.GameObjects.Image;
  private powerUps!: Phaser.Physics.Arcade.Group;
  private invulnerable: boolean = false;
  private doubleSpeed: boolean = false;
  private magnetActive: boolean = false;
  private powerUpTimers: { [key: string]: Phaser.Time.TimerEvent } = {};
  private trail!: Phaser.GameObjects.Graphics;
  private trailPoints: { x: number, y: number, alpha: number }[] = [];
  private screenShake: boolean = false;
  private isPerformingTrick: boolean = false;

  constructor() {
    super("TestScene");
  }

  create() {
    // --- Fix 1: Set the camera size ---
    musicService.setScene(this);
  
    // Continue background music from menu (it should already be playing)
    if (musicService.getMusicEnabled() && !musicService.isMusicPlaying()) {
      musicService.playBackgroundMusic('backgroundMusic');
    }

    this.cameras.main.setSize(this.scale.width, this.scale.height);

    this.resetGameState();
    const { width, height } = this.scale;

    // --- Add the border ---
    const border = this.add.graphics();
    // Style the border (4px thick, white)
    border.lineStyle(4, 0xffffff, 1);
    // Draw the rectangle based on the camera's dimensions
    border.strokeRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    // Pin the border to the screen so it doesn't scroll
    border.setScrollFactor(0);


    // Add parallax backgrounds
    this.createParallaxBackground();

    // Add groups
    this.obstacles = this.physics.add.group();
    this.collectibles = this.physics.add.group();
    this.powerUps = this.physics.add.group();

    // Create player with enhanced physics
    this.createPlayer();

    // Create enhanced snow curve
    this.createSnowCurve();

    // Add particle systems
    this.createParticleSystems();

    // Create trail system
    this.createTrailSystem();

    // Initialize enhanced controls
    this.setupControls();

    // Add dynamic obstacle and collectible spawning
    this.setupSpawning();

    // Add collision handlers
    this.setupCollisions();

    // Create enhanced UI
    this.createUI();

    // --- REMOVED: Redundant setup. The service handles music creation. ---
    // this.setupAudio();

    // Add camera effects
    this.setupCamera();

    EventBus.emit("current-scene-ready", this);
  }

  private resetGameState() {
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.velocity = this.baseVelocity;
    this.airTime = 0;
    this.groundTime = 0;
    this.isGrounded = true;
    this.isJumping = false;
    this.invulnerable = false;
    this.doubleSpeed = false;
    this.magnetActive = false;
    this.trailPoints = [];
    this.particleEmitters = [];
    this.powerUpTimers = {};
    this.isPerformingTrick = false;
  }

  private createParallaxBackground() {
    const { width, height } = this.scale;
    
    // Multiple background layers for depth
    this.snowybg = this.add
      .tileSprite(0, 0, width, height, "snowybg")
      .setScale(2)
      .setOrigin(0, 0)
      .setAlpha(0.8)
      .setScrollFactor(0); // Pin the background to the camera

    // Add distant mountains (if you have the asset)
    // this.add.tileSprite(0, 0, width, height, "mountains")
    //   .setScale(1.5)
    //   .setOrigin(0, 0)
    //   .setAlpha(0.3);
  }

  private createPlayer() {
    this.player = this.physics.add
      .sprite(150, 300, "snowboarder")
      .setScale(0.06)
      .setTint(0xffffff);
    
    this.player.setCollideWorldBounds(true);
    this.player.body.setAllowGravity(false);
    this.player.body.setImmovable(true); // Keep this for correct collisions

    // --- Make the player hitbox larger than the sprite ---
    const hitboxWidth = this.player.displayWidth * 6.2; // Increase hitbox width
    const hitboxHeight = this.player.displayHeight * 6.2; // Increase hitbox height
    this.player.body.setSize(hitboxWidth, hitboxHeight);

    // Re-center the larger hitbox on the player sprite
    const offsetX = (this.player.width - hitboxWidth) / 2;
    const offsetY = (this.player.height - hitboxHeight) / 2;
    this.player.body.setOffset(offsetX, offsetY);
  }

  private createSnowCurve() {
    this.graphics = this.add.graphics();
    this.generateInitialCurve();
  }

  private generateInitialCurve() {
    this.curvePoints = [];
    // Increase loop count from 12 to 20 to make the curve longer
    for (let i = 0; i < 20; i++) {
      // Start further to the left (from -800 instead of -400)
      const x = -800 + i * 180;
      const baseY = 300;
      const variation = Math.sin(i * 0.5) * 80;
      const y = baseY + variation + Phaser.Math.Between(-30, 30);
      this.curvePoints.push(new Phaser.Math.Vector2(x, y));
    }
    this.updateCurve();
  }

  private createParticleSystems() {
    // Snow trail particles
    const snowTrail = this.add.particles(0, 0, 'snowboarder', {
      scale: { start: 0.02, end: 0.001 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 300,
      speed: { min: 20, max: 40 },
      tint: 0xffffff,
      blendMode: 'ADD'
    });
    
    this.particleEmitters.push(snowTrail);
    snowTrail.startFollow(this.player, 0, 10);
  }

  private createTrailSystem() {
    this.trail = this.add.graphics();
  }

  private updateTrail() {
    // Add current position to trail
    this.trailPoints.push({
      x: this.player.x,
      y: this.player.y,
      alpha: 1
    });

    // Limit trail length and fade points
    if (this.trailPoints.length > 20) {
      this.trailPoints.shift();
    }

    // Update trail graphics
    this.trail.clear();
    if (this.trailPoints.length > 1) {
      this.trail.lineStyle(3, 0x00ffff, 0.5);
      this.trail.beginPath();
      
      for (let i = 0; i < this.trailPoints.length - 1; i++) {
        const point = this.trailPoints[i];
        const nextPoint = this.trailPoints[i + 1];
        const alpha = (i / this.trailPoints.length) * 0.5;
        
        this.trail.lineStyle(3 * alpha, 0x00ffff, alpha);
        this.trail.moveTo(point.x, point.y);
        this.trail.lineTo(nextPoint.x, nextPoint.y);
      }
      
      this.trail.strokePath();
    }
  }

  private setupControls() {
    if (this.input.keyboard) {
      // Jump controls
      this.input.keyboard.on("keydown-SPACE", this.jump, this);
      this.input.keyboard.on("keydown-UP", this.jump, this);
      this.input.keyboard.on("keydown-F", this.jump, this);
      
      // Trick controls
      this.input.keyboard.on("keydown-LEFT", () => this.performTrick("left"), this);
      this.input.keyboard.on("keydown-RIGHT", () => this.performTrick("right"), this);
      this.input.keyboard.on("keydown-DOWN", () => this.performTrick("spin"), this);
    }

    // Touch controls for mobile
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.y < this.scale.height / 2) {
        this.jump();
      }
    });
  }

  private setupSpawning() {
    // Dynamic obstacle spawning with increasing difficulty
    this.time.addEvent({
      delay: 2500,
      callback: this.addObstacle,
      callbackScope: this,
      loop: true,
    });

    // Collectible spawning
    this.time.addEvent({
      delay: 1800,
      callback: this.addCollectible,
      callbackScope: this,
      loop: true,
    });

    // Power-up spawning
    this.time.addEvent({
      delay: 8000,
      callback: this.addPowerUp,
      callbackScope: this,
      loop: true,
    });
  }

  private setupCollisions() {
    // Obstacle collision
    this.physics.add.overlap(
      this.player,
      this.obstacles,
      this.handleObstacleCollision,
      undefined,
      this
    );

    // Collectible collision
    this.physics.add.overlap(
      this.player,
      this.collectibles,
      this.handleCollectibleCollection,
      undefined,
      this
    );

    // Power-up collision
    this.physics.add.overlap(
      this.player,
      this.powerUps,
      this.handlePowerUpCollection,
      undefined,
      this
    );
  }

  private createUI() {
    const { width } = this.scale;
    
    // Enhanced score display
    this.scoreText = this.add.text(20, 20, "Score: 0", {
      fontSize: "28px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3,
      fontStyle: "bold"
    }).setScrollFactor(0); // Pin UI to screen

    // Combo counter
    this.comboText = this.add.text(20, 60, "", {
      fontSize: "24px",
      color: "#ffff00",
      stroke: "#000000",
      strokeThickness: 2,
      fontStyle: "bold"
    }).setScrollFactor(0); // Pin UI to screen

    // Speed indicator
    this.speedText = this.add.text(20, 100, "Speed: 120", {
      fontSize: "20px",
      color: "#00ff00",
      stroke: "#000000",
      strokeThickness: 2
    }).setScrollFactor(0); // Pin UI to screen

    // --- FIXED: Set initial button texture from the music service ---
    const initialTexture = musicService.getMusicEnabled() ? "musicOnButton" : "musicOffButton";
    this.musicButton = this.add.image(width - 50, 50, initialTexture)
      .setScale(0.1)
      .setInteractive()
      .on('pointerdown', this.toggleMusic, this)
      .setScrollFactor(0); // Pin UI to screen
  }

  // --- REMOVED: Redundant method. The service handles this. ---
  // private setupAudio() { ... }

  private setupCamera() {
    // Smooth camera following
    this.cameras.main.startFollow(this.player, true, 0.05, 0.05);
    this.cameras.main.setFollowOffset(-250, 0);
  }

  private addObstacle() {
    const obstacleTypes = ["bird", "stone"];
    const obstacleType = Phaser.Utils.Array.GetRandom(obstacleTypes);
    const curveY = this.getYForX(this.scale.width + 100);
    
    if (curveY === null) return;

    const x = this.scale.width + 100;
    let y = curveY;
    
    if (obstacleType === "bird") {
      y = Phaser.Math.Between(50, curveY - 80);
    } else {
      y = curveY - 15;
    }

    const obstacle = this.obstacles.create(x, y, obstacleType) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    obstacle.setScale(0.05);
    obstacle.setOrigin(0.5, 0.5);
    obstacle.body.setAllowGravity(false);
    
    // --- Make the obstacle hitbox larger than the sprite ---
    const hitboxMultiplier = 6.2; // A uniform, larger multiplier
    const hitboxWidth = obstacle.displayWidth * hitboxMultiplier;
    const hitboxHeight = obstacle.displayHeight * hitboxMultiplier;
    obstacle.body.setSize(hitboxWidth, hitboxHeight);

    // Re-center the larger hitbox
    const offsetX = (obstacle.width - hitboxWidth) / 2;
    const offsetY = (obstacle.height - hitboxHeight) / 2;
    obstacle.body.setOffset(offsetX, offsetY);


    obstacle.setVelocityX(-this.velocity);

    // Add obstacle glow effect
    if (obstacleType === "bird") {
      obstacle.setTint(0xff4444);
    }
  }

  private addCollectible() {
    const x = this.scale.width + 100;
    const curveY = this.getYForX(x);
    
    if (curveY === null) return;

    const y = Phaser.Math.Between(curveY - 120, curveY - 40);
    
    // Use a 'coin' sprite for the collectible
    const collectible = this.collectibles.create(x, y, "coin") as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    collectible.setScale(1.0); // Make the coin visible
    collectible.body.setAllowGravity(false);
    collectible.setVelocityX(-this.velocity);

    // Add floating animation
    this.tweens.add({
      targets: collectible,
      y: y - 20,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Add glow effect
    this.tweens.add({
      targets: collectible,
      alpha: 0.6,
      duration: 500,
      yoyo: true,
      repeat: -1
    });
  }

  private addPowerUp() {
    const powerUpTypes = ["invulnerability", "speed", "magnet"];
    const powerUpType = Phaser.Utils.Array.GetRandom(powerUpTypes);
    
    const x = this.scale.width + 100;
    const curveY = this.getYForX(x);
    
    if (curveY === null) return;

    const y = Phaser.Math.Between(curveY - 100, curveY - 30);
    
    let powerUpSpriteKey = '';
    switch (powerUpType) {
        case "invulnerability":
            powerUpSpriteKey = 'invulnerabilityIcon'; // Make sure 'invulnerabilityIcon' is loaded
            break;
        case "speed":
            powerUpSpriteKey = 'speedIcon'; // Make sure 'speedIcon' is loaded
            break;
        case "magnet":
            powerUpSpriteKey = 'magnetIcon'; // Make sure 'magnetIcon' is loaded
            break;
    }

    const powerUp = this.powerUps.create(x, y, powerUpSpriteKey) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    powerUp.setScale(1.0); // Increase the size of the power-up icons
    powerUp.setData("type", powerUpType);
    powerUp.body.setAllowGravity(false);
    powerUp.setVelocityX(-this.velocity);

    // Add pulsing effect, adjusting the scale for the new sprites
    this.tweens.add({
      targets: powerUp,
      scaleX: 1.2, // Adjust pulsing scale
      scaleY: 1.2, // Adjust pulsing scale
      duration: 800,
      yoyo: true,
      repeat: -1
    });
  }

  private handleObstacleCollision(player: any, obstacle: any) {
    if (this.invulnerable) {
      obstacle.destroy();
      this.addScore(50);
      this.showFloatingText(obstacle.x, obstacle.y, "+50!", 0xff0000);
      return;
    }

    musicService.playSFX('crashSound', { volume: 0.8 });

    this.shakeCamera();
    this.resetCombo();
    this.scene.start("GameOverScene", { 
      score: this.score,
      maxCombo: this.maxCombo 
    });
  }

  private handleCollectibleCollection(player: any, collectible: any) {

    musicService.playSFX('coinSound', { volume: 0.6 });

    const collectibleX = collectible.x;
    const collectibleY = collectible.y;

    collectible.destroy();
    this.addScore(100);
    this.addCombo();

    // Create a floating coin icon instead of text
    const floatingCoin = this.add.image(collectibleX, collectibleY, 'coin')
        .setScale(1.0)
        .setOrigin(0.5);

    this.tweens.add({
        targets: floatingCoin,
        y: collectibleY - 50,
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => floatingCoin.destroy()
    });
    
    // Speed boost from collectibles
    this.velocity = Math.min(this.velocity + 2, this.maxVelocity);
  }

  private handlePowerUpCollection(player: any, powerUp: any) {
    musicService.playSFX('powerupSound', { volume: 0.7 });
    const type = powerUp.getData("type");
    powerUp.destroy();
    
    this.activatePowerUp(type);
    this.showFloatingText(powerUp.x, powerUp.y, type.toUpperCase(), 0x00ffff);
  }

  private activatePowerUp(type: string) {
    // Clear existing timer if present
    if (this.powerUpTimers[type]) {
      this.powerUpTimers[type].remove();
    }

    switch (type) {
      case "invulnerability":
        this.invulnerable = true;
        this.player.setTint(0xff0000);
        this.powerUpTimers[type] = this.time.delayedCall(5000, () => {
          this.invulnerable = false;
          this.player.setTint(0xffffff);
        });
        break;
      
      case "speed":
        this.doubleSpeed = true;
        this.velocity *= 1.5;
        this.powerUpTimers[type] = this.time.delayedCall(4000, () => {
          this.doubleSpeed = false;
          this.velocity = Math.max(this.baseVelocity, this.velocity / 1.5);
        });
        break;
      
      case "magnet":
        this.magnetActive = true;
        this.powerUpTimers[type] = this.time.delayedCall(6000, () => {
          this.magnetActive = false;
        });
        break;
    }
  }

  private jump() {
    if (!this.isJumping && this.isGrounded) {
      musicService.playSFX('jumpSound', { volume: 0.4 });
      this.player.body.setAllowGravity(true);
      this.isJumping = true;
      this.isGrounded = false;
      this.player.setVelocityY(-this.jumpPower);
      this.player.body.setGravityY(400);
      this.airTime = 0;
      
      // Jump effect
      this.shakeCamera(0.02);
    }
  }

  private performTrick(direction: string) {
    if (!this.isJumping || this.isPerformingTrick) return;

    musicService.playSFX('trickSound', { volume: 0.5 });
    this.isPerformingTrick = true;
    let trickScore = 0;
    let trickName = "";

    switch (direction) {
      case "left":
        this.tweens.add({
          targets: this.player,
          angle: this.player.angle - 360,
          duration: 400,
          ease: 'Power2',
          onComplete: () => {
            this.isPerformingTrick = false;
          }
        });
        trickScore = 150;
        trickName = "SPIN LEFT!";
        break;
      
      case "right":
        this.tweens.add({
          targets: this.player,
          angle: this.player.angle + 360,
          duration: 400,
          ease: 'Power2',
          onComplete: () => {
            this.isPerformingTrick = false;
          }
        });
        trickScore = 150;
        trickName = "SPIN RIGHT!";
        break;
      
      case "spin":
        this.tweens.add({
          targets: this.player,
          angle: this.player.angle + 720,
          duration: 600,
          ease: 'Power2',
          onComplete: () => {
            this.isPerformingTrick = false;
          }
        });
        trickScore = 250;
        trickName = "DOUBLE SPIN!";
        break;
    }

    this.addScore(trickScore);
    this.addCombo();
    this.showFloatingText(this.player.x, this.player.y - 50, trickName, 0x00ff00);
  }

  private addScore(points: number) {
    const multiplier = Math.max(1, Math.floor(this.combo / 5) + 1);
    this.score += points * multiplier;
    this.scoreText.setText(`Score: ${Math.floor(this.score)}`);
  }

  private addCombo() {
    this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.comboText.setText(`Combo: x${this.combo}`);
    
    // Combo visual effect
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true
    });
  }

  private resetCombo() {
    this.combo = 0;
    this.comboText.setText("");
  }

  private showFloatingText(x: number, y: number, text: string, color: number) {
    const floatingText = this.add.text(x, y, text, {
      fontSize: "20px",
      color: Phaser.Display.Color.IntegerToColor(color).rgba,
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 2
    }).setOrigin(0.5);

    this.tweens.add({
      targets: floatingText,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => floatingText.destroy()
    });
  }

  private shakeCamera(intensity: number = 5) {
    this.cameras.main.shake(200, intensity);
  }

  private toggleMusic() {
    // 1. Get the current enabled state from the service.
    const isCurrentlyEnabled = musicService.getMusicEnabled();

    // 2. Set the new, opposite state for both music and SFX.
    const newEnabledState = !isCurrentlyEnabled;
    musicService.setMusicEnabled(newEnabledState);
    musicService.setSFXEnabled(newEnabledState); // Mute SFX as well

    // --- ADDED FIX ---
    // Manually restart the BGM when toggling sound back on.
    // This is because the service's setMusicEnabled(false) destroys the music instance,
    // and its setMusicEnabled(true) logic doesn't re-create it.
    if (newEnabledState) {
        musicService.playBackgroundMusic('backgroundMusic');
    }

    // 3. Update the button's texture to reflect the new state.
    const newTexture = newEnabledState ? "musicOnButton" : "musicOffButton";
    this.musicButton.setTexture(newTexture);
  }

  update(time: number, delta: number): void {
    const deltaVelocity = this.velocity * delta * 0.001;
    
    // Parallax background movement
    this.snowybg.tilePositionX += deltaVelocity * 0.3;
    
    // Move and update curve
    this.moveCurve(-deltaVelocity);

    // Update player position and physics
    this.updatePlayerPhysics();
    
    // Update visual effects
    this.updateTrail();
    this.updateParticles();
    
    // Update magnet effect
    if (this.magnetActive) {
      this.updateMagnetEffect();
    }

    // Update curve visuals
    this.fillBelowCurve();
    
    // Update score based on survival
    this.updateScore(delta);
    
    // Update speed display
    this.speedText.setText(`Speed: ${Math.floor(this.velocity)}`);
    
    // Gradually increase base speed
    if (this.velocity < this.maxVelocity) {
      this.velocity += this.acceleration * delta * 0.001;
    }
  }

  private updatePlayerPhysics() {
    const groundY = this.getYForX(this.player.x);
    if (groundY === null) return;

    if (this.isJumping) {
      this.airTime += 1;
      if (this.player.y >= groundY - 30 && this.airTime > 5) {
        if (this.isPerformingTrick) {
          this.shakeCamera();
          this.resetCombo();
          this.scene.start("GameOverScene", { 
            score: this.score,
            maxCombo: this.maxCombo 
          });
          return;
        }

        this.isJumping = false;
        this.isGrounded = true;
        this.player.body.setAllowGravity(false);
        this.player.setVelocityY(0);
        
        // Air time bonus
        if (this.airTime > 60) {
          const bonus = Math.floor(this.airTime / 10) * 10;
          this.addScore(bonus);
          this.showFloatingText(this.player.x, this.player.y, `Air Time +${bonus}!`, 0x00ffff);
        }
      }
    } else {
      this.player.y = groundY - 25;
      this.groundTime += 1;
    }

    // Update player rotation based on slope
    this.updatePlayerRotation();
  }

  private updatePlayerRotation() {
    const leftY = this.getYForX(this.player.x - 30);
    const rightY = this.getYForX(this.player.x + 30);
    
    if (leftY !== null && rightY !== null) {
      const slopeAngle = Phaser.Math.RadToDeg(Math.atan2(rightY - leftY, 60));
      let targetAngle = 0;
      
      if (slopeAngle >= -15 && slopeAngle <= 15) targetAngle = 0;
      else if (slopeAngle >= -45 && slopeAngle <= -15) targetAngle = -25;
      else if (slopeAngle < -45) targetAngle = -45;
      else if (slopeAngle >= 15 && slopeAngle <= 45) targetAngle = 25;
      else if (slopeAngle > 45) targetAngle = 45;
      
      // Smooth rotation
      const currentAngle = this.player.angle;
      const angleDiff = targetAngle - currentAngle;
      this.player.setAngle(currentAngle + angleDiff * 0.1);
    }
  }

  private updateParticles() {
    // Update particle emitters based on speed and conditions
    this.particleEmitters.forEach(emitter => {
        const speedFactor = this.velocity / this.baseVelocity;
        emitter.speed = { min: 20 * speedFactor, max: 40 * speedFactor };
    });
  }

  private updateMagnetEffect() {
    this.collectibles.children.entries.forEach((collectible: any) => {
      const distance = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        collectible.x, collectible.y
      );
      
      if (distance < 150) {
        this.physics.moveToObject(collectible, this.player, 200);
      }
    });
  }

  private updateScore(delta: number) {
    const speedBonus = Math.floor(this.velocity / 10);
    this.score += delta * 0.02 * speedBonus;
    this.scoreText.setText(`Score: ${Math.floor(this.score)}`);
  }

  private fillBelowCurve() {
    const { width, height } = this.scale;
    const points = this.curve.getSpacedPoints(300);

    this.graphics.fillStyle(0xffffff, 0.9);
    this.graphics.beginPath();
    this.graphics.moveTo(0, height);

    points.forEach((point) => {
      this.graphics.lineTo(point.x, point.y);
    });

    this.graphics.lineTo(width, height);
    this.graphics.closePath();
    this.graphics.fillPath();

    // Add gradient effect
    this.graphics.fillGradientStyle(0xffffff, 0xffffff, 0xe6f3ff, 0xe6f3ff, 1, 0.8, 0.6, 0.4);
    this.graphics.fillPath();
  }

  private getYForX(x: number): number | null {
    const precision = 200;
    let closestPoint = null;
    let closestDistance = Infinity;

    for (let i = 0; i <= precision; i++) {
      const t = i / precision;
      const point = this.curve.getPoint(t);
      const distance = Math.abs(point.x - x);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestPoint = point;
      }
    }

    return closestPoint ? closestPoint.y : null;
  }

  private moveCurve(deltaX: number) {
    this.curvePoints.forEach((point) => {
      point.x += deltaX;
    });

    // Add new curve points as needed
    while (this.curvePoints[0].x < -400) {
      this.curvePoints.shift();
      const lastPoint = this.curvePoints[this.curvePoints.length - 1];
      const newX = lastPoint.x + 180;
      const newY = 250 + Math.sin(newX * 0.01) * 80 + Phaser.Math.Between(-40, 40);
      this.curvePoints.push(new Phaser.Math.Vector2(newX, Math.max(150, Math.min(400, newY))));
    }

    this.updateCurve();
  }

  private updateCurve() {
    this.graphics.clear();
    this.graphics.lineStyle(3, 0xffffff, 1);
    this.curve = new Phaser.Curves.Spline(this.curvePoints);
    this.curve.draw(this.graphics, 128);
  }
}


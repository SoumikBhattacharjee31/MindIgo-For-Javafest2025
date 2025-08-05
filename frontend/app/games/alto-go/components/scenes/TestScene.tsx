import { EventBus } from "../EventBus";
import { Scene } from "phaser";

export class TestScene extends Scene {
  private snowybg!: Phaser.GameObjects.TileSprite;
  private graphics!: Phaser.GameObjects.Graphics;
  private curve!: Phaser.Curves.Spline;
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private curvePoints!: Phaser.Math.Vector2[];
  private curveIndex: number = 0;
  private isJumping: boolean = false;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private velocity: number = 100; // Base velocity for consistent movement

  constructor() {
    super("TestScene");
  }

  create() {
    this.score = 0;
    const { width, height } = this.scale;

    // Add snowy background
    this.snowybg = this.add
      .tileSprite(0, 0, width, height, "snowybg")
      .setScale(2)
      .setOrigin(0, 0);

    // Add obstacles group
    this.obstacles = this.physics.add.group();

    // Add player
    this.player = this.physics.add
      .sprite(100, 300, "snowboarder")
      .setScale(0.05);
    this.player.setCollideWorldBounds(true);
    this.player.body.setAllowGravity(false);

    // Add graphics for snow curve
    this.graphics = this.add.graphics();
    this.curvePoints = [
      new Phaser.Math.Vector2(-300, 200),
      new Phaser.Math.Vector2(-100, 250),
      new Phaser.Math.Vector2(100, 200),
      new Phaser.Math.Vector2(300, 300),
      new Phaser.Math.Vector2(500, 250),
      new Phaser.Math.Vector2(700, 300),
      new Phaser.Math.Vector2(900, 200),
      new Phaser.Math.Vector2(1100, 300),
      new Phaser.Math.Vector2(1300, 250),
      new Phaser.Math.Vector2(1500, 200),
    ];
    this.curve = new Phaser.Curves.Spline(this.curvePoints);
    this.graphics.lineStyle(2, 0xffffff, 1);
    this.curve.draw(this.graphics, 128);

    // Initialize player controls
    if (this.input.keyboard) {
      this.input.keyboard.on("keydown-F", this.jump, this);
    }

    // Add obstacle spawn event
    this.time.addEvent({
      delay: 2000,
      callback: this.addObstacle,
      callbackScope: this,
      loop: true,
    });

    // Add collision handler
    this.physics.add.collider(
      this.player,
      this.obstacles,
      this.handleCollision,
      undefined,
      this
    );

    // Add score text
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', color: '#fff' });

    // Emit scene ready event
    EventBus.emit("current-scene-ready", this);
  }

  addObstacle() {
    const obstacleType = Phaser.Math.Between(0, 1) === 0 ? "bird" : "stone";
    const temp = this.getYForX(this.scale.width + 50);
    const temp2 = temp == null ? -100 : temp;
    const x = this.scale.width + 50;
    const y =
      obstacleType === "bird"
        ? Phaser.Math.Between(50, temp2 - 50)
        : temp2 - 10;
    const obstacle = this.obstacles.create(
      x,
      y,
      obstacleType
    ) as Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    obstacle.setScale(0.04);
    obstacle.setOrigin(0.5, 0.5);
    obstacle.body.setAllowGravity(false);

    // Set a smaller hitbox for the obstacle
    const hitboxWidth = obstacle.displayWidth * 5;  // 50% of the sprite's width
    const hitboxHeight = obstacle.displayHeight * 8;  // 50% of the sprite's height
    obstacle.body.setSize(hitboxWidth, hitboxHeight);

    // Set velocity based on delta time
    obstacle.setVelocityX(-this.velocity);
  }

  handleCollision(player: any, obstacle: any) {
    this.scene.start("GameOverScene", { score: this.score });
  }

  update(time: number, delta: number): void {
    const deltaVelocity = this.velocity * delta * 0.001; // Adjust based on delta time
    this.snowybg.tilePositionX += 0.1;
    this.moveCurve(-deltaVelocity);

    const temp = this.getYForX(this.player.x);
    if (temp != null) {
      if (!this.isJumping) {
        this.player.y = temp - 25;
      } else if (this.player.y > temp - 15) {
        this.isJumping = false;
        this.player.body.setAllowGravity(false);
      }
    }

    const temp1 = this.getYForX(this.player.x - 20);
    const temp2 = this.getYForX(this.player.x + 20);
    if (temp1 != null && temp2 != null) {
      const angle2 = Phaser.Math.RadToDeg(Math.atan2(temp2 - temp1, 40));
      let angle = 0;
      if (angle2 >= -15 && angle2 <= 15) angle = 0;
      else if (angle2 >= -45 && angle2 <= -15) angle = -30;
      else if (angle2 < -45) angle = -60;
      else if (angle2 >= 15 && angle2 <= 45) angle = 30;
      else if (angle2 > 45) angle = 60;
      this.player.setAngle(angle / 2);
    }

    this.fillBelowCurve();
    this.updateScore(delta);
  }

  updateScore(delta: number) {
    this.score += delta * 0.01;
    this.scoreText.setText('Score: ' + Math.floor(this.score));
  }

  jump() {
    if (!this.isJumping) {
      this.player.y -= 20;
      this.player.body.setAllowGravity(true);
      this.isJumping = true;
      this.player.setVelocityY(-200);
      this.player.body.setGravityY(200);
    }
  }

  fillBelowCurve() {
    const { width, height } = this.scale;
    const points = this.curve.getSpacedPoints(500); // Increase the number of points for better accuracy

    this.graphics.fillStyle(0xffffff, 1);
    this.graphics.beginPath();
    this.graphics.moveTo(0, height);

    points.forEach((point) => {
      this.graphics.lineTo(point.x, point.y);
    });

    this.graphics.lineTo(width, height);
    this.graphics.closePath();
    this.graphics.fillPath();
  }

  changeScene() {
    // Switch to the MainMenu scene
    this.scene.start("MainMenu");
  }

  getYForX(x: number): number | null {
    const precision = 100; // Number of samples along the curve
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
    // Move each point of the curve by deltaX
    this.curvePoints.forEach((point) => {
      point.x += deltaX;
    });

    // Remove points that go off-screen and add new points to the end
    if (this.curvePoints[0].x < -300) {
      this.curvePoints.shift();
      const lastPoint = this.curvePoints[this.curvePoints.length - 1];
      const newX = lastPoint.x + 200; // distance between points
      const newY = Phaser.Math.Between(200, 300); // random y position
      this.curvePoints.push(new Phaser.Math.Vector2(newX, newY));
    }

    // Clear and redraw the curve
    this.graphics.clear();
    this.graphics.lineStyle(2, 0xffffff, 1);
    this.curve = new Phaser.Curves.Spline(this.curvePoints);
    this.curve.draw(this.graphics, 64);
  }
}

import * as Phaser from "phaser";

export default class RhythmScene extends Phaser.Scene {
  private music!: Phaser.Sound.BaseSound;
  private notes: Phaser.GameObjects.Image[] = [];
  private hitKeys = ["A", "S", "D", "F"];

  constructor() {
    super("RhythmScene");
  }

  preload() {
    this.load.audio("calm-music", "/calm-track.mp3");
    this.load.image("note", "/note.png");
  }

  create() {
    this.music = this.sound.add("calm-music", { volume: 0.6 });
    this.music.play();

    this.time.addEvent({
      delay: 2000,
      loop: true,
      callback: () => {
        const lane = Phaser.Math.Between(0, 3);
        const x = 200 + lane * 100;
        const note = this.add.image(x, -50, "note").setScale(0.5);
        this.notes.push(note);
      },
    });

    if (this.input.keyboard)
      this.input.keyboard.on("keydown", (event: KeyboardEvent) => {
        const lane = this.hitKeys.indexOf(event.key.toUpperCase());
        if (lane !== -1) {
          this.checkHit(lane);
        }
      });
  }

  update() {
    this.notes.forEach((note, index) => {
      note.y += 2;
      if (note.y > 600) {
        note.destroy();
        this.notes.splice(index, 1);
      }
    });
  }

  private checkHit(lane: number) {
    const x = 200 + lane * 100;
    const hitNote = this.notes.find(
      (n) => Math.abs(n.x - x) < 10 && Math.abs(n.y - 550) < 40
    );

    if (hitNote) {
      this.add.circle(hitNote.x, 550, 20, 0x88ccff, 0.6).setAlpha(0.5);
      hitNote.destroy();
      this.notes = this.notes.filter((n) => n !== hitNote);
    }
  }
}

"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Phaser from "phaser";

function parseOsuFile(content: string) {
  const lines = content.split("\n");
  let inHitObjects = false;
  const hitObjects: { time: number; lane: number; type?: string }[] = [];

  for (const line of lines) {
    if (line.trim() === "[HitObjects]") {
      inHitObjects = true;
      continue;
    }
    if (inHitObjects && line.trim()) {
      const parts = line.split(",");
      if (parts.length >= 3) {
        const x = parseInt(parts[0], 10);
        const time = parseInt(parts[2], 10) / 1000;
        const lane = Math.floor((x / 512) * 4);
        hitObjects.push({ time, lane });
      }
    }
  }
  return hitObjects;
}

function useRhythmStats() {
  const [stats, setStats] = useState({
    score: 0,
    combo: 0,
    accuracy: 100,
    judgement: "",
    maxCombo: 0,
    perfectHits: 0,
    greatHits: 0,
    goodHits: 0,
    misses: 0,
    gameEnded: false,
    currentTime: 0,
    totalTime: 0,
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setStats((prev) => ({ ...prev, ...detail }));
    };
    window.addEventListener("rhythm:stats", handler as EventListener);
    return () =>
      window.removeEventListener("rhythm:stats", handler as EventListener);
  }, []);
  return stats;
}

// Mock data generator for demo purposes
function generateMockBeatmap(bpm: number, duration: number) {
  const beat = 60 / bpm;
  const map: { time: number; lane: number; type?: string }[] = [];
  let t = 3;
  const endTime = duration - 5;

  while (t < endTime) {
    const pattern = Math.floor(t / (beat * 8)) % 8;

    switch (pattern) {
      case 0:
        map.push({ time: t, lane: 0 });
        map.push({ time: t + beat * 2, lane: 2 });
        break;
      case 1:
        for (let i = 0; i < 4; i++) {
          map.push({ time: t + beat * i, lane: i });
        }
        break;
      case 2:
        map.push({ time: t, lane: 0 });
        map.push({ time: t, lane: 2 });
        map.push({ time: t + beat * 2, lane: 1 });
        map.push({ time: t + beat * 2, lane: 3 });
        break;
      case 3:
        for (let i = 0; i < 4; i++) {
          map.push({ time: t + beat * 0.5 * i, lane: 1 });
        }
        break;
      case 4:
        map.push({ time: t, lane: 0 });
        map.push({ time: t + beat, lane: 3 });
        map.push({ time: t + beat * 2, lane: 1 });
        map.push({ time: t + beat * 3, lane: 2 });
        break;
      case 5:
        map.push({ time: t, lane: 2, type: "hold" });
        map.push({ time: t + beat * 1.5, lane: 2, type: "hold" });
        break;
      case 6:
        map.push({ time: t + beat * 0.5, lane: 0 });
        map.push({ time: t + beat * 1.5, lane: 2 });
        map.push({ time: t + beat * 2.5, lane: 1 });
        break;
      case 7:
        map.push({ time: t + beat * 2, lane: 3 });
        break;
    }
    t += beat * 4;
  }

  return map;
}

class EnhancedRhythmScene extends Phaser.Scene {
  music!: Phaser.Sound.BaseSound;
  spawnedIdx = 0;
  hitLineY = 540;
  spawnY = -120;
  bottomXs = [220, 330, 440, 550];
  topXs = [300, 365, 425, 490];
  travelTime = 2.2;
  leadTime = this.travelTime + 0.2;
  beatmap: { time: number; lane: number; type?: string }[] = [];
  notes: any[] = [];
  missedNotes: any[] = [];
  particles!: Phaser.GameObjects.Particles.ParticleEmitterManager;
  paused = false;
  hitKeys = ["A", "S", "D", "F"];
  gameEnded = false;

  score = 0;
  combo = 0;
  maxCombo = 0;
  hitCounts = { perfect: 0, great: 0, good: 0, miss: 0 };

  laneGlows: Phaser.GameObjects.Image[] = [];
  backgroundElements: Phaser.GameObjects.GameObject[] = [];
  gameStarted = false;

  constructor() {
    super("EnhancedRhythmScene");
  }

  preload() {
    // Create simple colored rectangles as placeholder assets
    this.load.image(
      "note",
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    );

    // Generate mock beatmap data
    this.beatmap = generateMockBeatmap(90, 120);
  }

  createTextures() {
    const noteSize = 32;
    const g = this.add.graphics();

    // Regular note
    g.fillStyle(0x60a5fa, 0.8);
    g.fillCircle(noteSize, noteSize, noteSize);
    g.fillStyle(0x93c5fd, 0.9);
    g.fillCircle(noteSize, noteSize, noteSize * 0.6);
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(noteSize, noteSize, noteSize * 0.3);
    g.generateTexture("enhancedNote", noteSize * 2, noteSize * 2);
    g.clear();

    // Missed note
    g.fillStyle(0xff6b6b, 0.8);
    g.fillCircle(noteSize, noteSize, noteSize);
    g.fillStyle(0xff8a8a, 0.7);
    g.fillCircle(noteSize, noteSize, noteSize * 0.6);
    g.generateTexture("missedNote", noteSize * 2, noteSize * 2);
    g.clear();

    // Spark effect
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture("spark", 8, 8);
    g.destroy();
  }

  create() {
    this.cameras.main.setBackgroundColor("#f0f8ff");
    this.createTextures();
    this.addBackground();
    this.drawRunway();
    this.setupParticles();
    this.setupControls();
    this.drawHUD();
    this.addInstructions();

    // Create mock audio using Web Audio API
    this.createMockAudio();
  }

  createMockAudio() {
    // Create a simple audio context for demo
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    // Create a simple oscillator-based track
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

    // Mock music object
    this.music = {
      isPlaying: false,
      totalDuration: 120,
      seek: 0,
      play: () => {
        this.music.isPlaying = true;
        this.gameStarted = true;
        oscillator.start();
        this.startGameTimer();
      },
      pause: () => {
        this.music.isPlaying = false;
      },
      resume: () => {
        this.music.isPlaying = true;
      },
      stop: () => {
        this.music.isPlaying = false;
        this.gameStarted = false;
      },
      once: (event: string, callback: () => void) => {
        if (event === "complete") {
          setTimeout(callback, 120000); // 2 minutes
        }
      },
    } as any;
  }

  startGameTimer() {
    const startTime = Date.now();
    const updateTimer = () => {
      if (!this.music.isPlaying) return;

      const elapsed = (Date.now() - startTime) / 1000;
      this.music.seek = elapsed;

      if (elapsed >= 120) {
        this.endGame();
        return;
      }

      requestAnimationFrame(updateTimer);
    };
    updateTimer();
  }

  addBackground() {
    const bg = this.add.rectangle(385, 360, 770, 720, 0xf0f8ff);

    // Add floating particles
    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, 770),
        Phaser.Math.Between(0, 720),
        Phaser.Math.Between(2, 6),
        0x93c5fd,
        Phaser.Math.FloatBetween(0.1, 0.3)
      );

      this.tweens.add({
        targets: particle,
        y: particle.y - Phaser.Math.Between(50, 100),
        alpha: { from: particle.alpha, to: 0 },
        duration: Phaser.Math.Between(3000, 6000),
        repeat: -1,
        yoyo: true,
        delay: Phaser.Math.Between(0, 2000),
      });
    }
  }

  drawRunway() {
    const g = this.add.graphics();

    for (let i = 0; i < 4; i++) {
      const top = this.topXs[i];
      const bot = this.bottomXs[i];

      // Lane background
      g.fillStyle(0xe1f5fe, 0.3);
      const poly = new Phaser.Geom.Polygon([
        top - 30,
        this.spawnY,
        top + 30,
        this.spawnY,
        bot + 50,
        this.hitLineY + 60,
        bot - 50,
        this.hitLineY + 60,
      ]);
      g.fillPoints(poly.points, true);

      // Lane glow effect
      const glow = this.add.image(bot, this.hitLineY, "enhancedNote");
      glow.setScale(1.5, 0.2).setAlpha(0.1);
      this.laneGlows[i] = glow;

      // Lane borders
      g.lineStyle(2, 0x93c5fd, 0.5);
      g.beginPath();
      g.moveTo(top - 30, this.spawnY);
      g.lineTo(bot - 50, this.hitLineY + 60);
      g.moveTo(top + 30, this.spawnY);
      g.lineTo(bot + 50, this.hitLineY + 60);
      g.strokePath();
    }
  }

  drawHUD() {
    // Hit line
    const hitLineGfx = this.add.graphics();
    hitLineGfx.lineStyle(3, 0x60a5fa, 0.8);
    hitLineGfx.beginPath();
    hitLineGfx.moveTo(150, this.hitLineY);
    hitLineGfx.lineTo(620, this.hitLineY);
    hitLineGfx.strokePath();

    // Hit markers for each lane
    for (let i = 0; i < 4; i++) {
      const marker = this.add.circle(
        this.bottomXs[i],
        this.hitLineY,
        20,
        0x93c5fd,
        0.3
      );
      marker.setStrokeStyle(2, 0x60a5fa, 0.6);

      const keyLabel = this.add
        .text(this.bottomXs[i], this.hitLineY + 40, this.hitKeys[i], {
          fontFamily: "Arial",
          fontSize: "16px",
          color: "#64748b",
        })
        .setOrigin(0.5);
    }
  }

  setupParticles() {
    this.particles = this.add.particles(0, 0, "spark", {
      speed: { min: 20, max: 60 },
      lifespan: 600,
      quantity: 0,
      alpha: { start: 1, end: 0 },
      scale: { start: 0.6, end: 0.1 },
    });
  }

  addInstructions() {
    const instructions = this.add
      .text(
        385,
        120,
        "♪ Calm Rhythm Demo ♪\nA S D F to play along\nP to pause • Click to start",
        {
          fontFamily: "Arial",
          fontSize: "18px",
          color: "#64748b",
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setAlpha(0.7);

    this.tweens.add({
      targets: instructions,
      y: instructions.y + 5,
      alpha: { from: 0.7, to: 0.4 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    });
  }

  setupControls() {
    this.input.keyboard?.on("keydown-P", () => this.togglePause());

    this.input.keyboard?.on("keydown", (ev: KeyboardEvent) => {
      if (this.gameEnded) return;
      const i = this.hitKeys.indexOf(ev.key.toUpperCase());
      if (i !== -1) {
        this.onHitKey(i);
        this.triggerLanePress(i);
      }
    });

    // Start game on click or key press
    this.input.once("pointerdown", () => this.startGame());
    this.input.keyboard?.once("keydown", () => this.startGame());
  }

  startGame() {
    if (this.gameStarted) return;
    this.music.play();
    this.gameStarted = true;
  }

  triggerLanePress(lane: number) {
    if (this.laneGlows[lane]) {
      this.laneGlows[lane].setAlpha(0.6);
      this.tweens.add({
        targets: this.laneGlows[lane],
        alpha: 0.1,
        duration: 150,
        ease: "power2.out",
      });
    }
  }

  update() {
    if (!this.music || !this.gameStarted || this.gameEnded) return;

    const audioTime = this.music.seek || 0;
    const totalTime = this.music.totalDuration || 120;

    this.updateTimeStats(audioTime, totalTime);

    // Spawn notes
    while (
      this.spawnedIdx < this.beatmap.length &&
      this.beatmap[this.spawnedIdx].time - this.leadTime <= audioTime
    ) {
      const bm = this.beatmap[this.spawnedIdx++];
      this.spawnNote(bm.time, bm.lane);
    }

    // Update notes
    const toRemove: any[] = [];
    for (const note of this.notes) {
      const t = Math.max(
        0,
        Math.min(1, (audioTime - note.spawnTime) / this.travelTime)
      );

      note.y = Phaser.Math.Linear(this.spawnY, this.hitLineY, t);
      note.x = Phaser.Math.Linear(
        this.topXs[note.lane],
        this.bottomXs[note.lane],
        t
      );

      const scale = Phaser.Math.Linear(0.5, 1.2, t);
      note.setScale(scale);

      if (t >= 1.1 && !note.hit) {
        this.convertToMissedNote(note);
        toRemove.push(note);
        this.judgeHit("Miss", 0);
      }
    }

    toRemove.forEach((n) => n.destroy());
    this.notes = this.notes.filter((n) => !toRemove.includes(n));

    // Check for game end
    if (audioTime >= totalTime - 1 && !this.gameEnded) {
      this.endGame();
    }
  }

  updateTimeStats(currentTime: number, totalTime: number) {
    const ev = new CustomEvent("rhythm:stats", {
      detail: {
        currentTime,
        totalTime,
        gameEnded: this.gameEnded,
      },
    });
    window.dispatchEvent(ev);
  }

  spawnNote(hitTime: number, lane: number) {
    const spawnTime = hitTime - this.travelTime;
    const note = this.add.image(this.topXs[lane], this.spawnY, "enhancedNote");

    Object.assign(note, { lane, hitTime, spawnTime, hit: false });
    this.notes.push(note);
  }

  convertToMissedNote(note: any) {
    const missedNote = this.add.image(
      this.bottomXs[note.lane],
      this.hitLineY + 80,
      "missedNote"
    );
    missedNote.setScale(0.6).setAlpha(0.5);
    this.missedNotes.push(missedNote);
  }

  onHitKey(lane: number) {
    if (!this.gameStarted || this.gameEnded) return;

    const now = this.music.seek || 0;
    let best: any = null;
    let bestDt = 999;

    for (const n of this.notes) {
      if (n.lane !== lane || n.hit) continue;
      const dt = Math.abs(n.hitTime - now);
      if (dt < bestDt) {
        bestDt = dt;
        best = n;
      }
    }

    if (!best) return;

    const windows = { perfect: 0.08, great: 0.15, good: 0.25 };
    let scoreAdd = 0;
    let label = "";

    if (bestDt <= windows.perfect) {
      scoreAdd = 1000;
      label = "Perfect";
      this.hitCounts.perfect++;
    } else if (bestDt <= windows.great) {
      scoreAdd = 650;
      label = "Great";
      this.hitCounts.great++;
    } else if (bestDt <= windows.good) {
      scoreAdd = 300;
      label = "Good";
      this.hitCounts.good++;
    } else {
      label = "Miss";
      this.hitCounts.miss++;
    }

    if (label !== "Miss") {
      best.hit = true;
      this.hitEffect(best.x, this.hitLineY, label);

      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);

      const comboBonus = Math.floor(this.combo / 10) * 50;
      scoreAdd += comboBonus;

      best.destroy();
      this.notes = this.notes.filter((n) => n !== best);
    } else {
      this.combo = 0;
    }

    this.score += scoreAdd;
    this.judgeHit(label, scoreAdd);
  }

  hitEffect(x: number, y: number, judgement: string) {
    this.particles.emitParticleAt(x, y, 8);

    const ringColor = judgement === "Perfect" ? 0x10b981 : 0x60a5fa;
    const ring = this.add.circle(x, y, 25, ringColor, 0.5);

    this.tweens.add({
      targets: ring,
      scale: { from: 0.5, to: 2 },
      alpha: 0,
      duration: 400,
      ease: "power2.out",
      onComplete: () => ring.destroy(),
    });
  }

  judgeHit(label: string, scoreAdd: number) {
    this.updateStats();

    const colors = {
      Perfect: "#10b981",
      Great: "#3b82f6",
      Good: "#f59e0b",
      Miss: "#ef4444",
    };

    const txt = this.add
      .text(385, this.hitLineY - 40, label, {
        fontFamily: "Arial",
        fontSize: "20px",
        color: colors[label as keyof typeof colors],
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: txt,
      y: txt.y - 30,
      alpha: 0,
      scale: { from: 1, to: 1.2 },
      duration: 600,
      ease: "power2.out",
      onComplete: () => txt.destroy(),
    });
  }

  updateStats() {
    const totalHits = Object.values(this.hitCounts).reduce((a, b) => a + b, 0);
    const accuracy =
      totalHits > 0
        ? Math.round(
            ((this.hitCounts.perfect +
              this.hitCounts.great +
              this.hitCounts.good) /
              totalHits) *
              100
          )
        : 100;

    const ev = new CustomEvent("rhythm:stats", {
      detail: {
        score: this.score,
        combo: this.combo,
        maxCombo: this.maxCombo,
        accuracy,
        perfectHits: this.hitCounts.perfect,
        greatHits: this.hitCounts.great,
        goodHits: this.hitCounts.good,
        misses: this.hitCounts.miss,
        gameEnded: this.gameEnded,
      },
    });
    window.dispatchEvent(ev);
  }

  togglePause() {
    if (!this.gameStarted || this.gameEnded) return;
    this.paused = !this.paused;

    if (this.paused) {
      this.music.pause();
      this.scene.pause();
    } else {
      this.music.resume();
      this.scene.resume();
    }
  }

  endGame() {
    this.gameEnded = true;
    this.music.stop();
    this.updateStats();

    const ev = new CustomEvent("rhythm:gameend", {
      detail: {
        finalScore: this.score,
        maxCombo: this.maxCombo,
        accuracy: this.calculateAccuracy(),
        perfectHits: this.hitCounts.perfect,
        greatHits: this.hitCounts.great,
        goodHits: this.hitCounts.good,
        misses: this.hitCounts.miss,
      },
    });
    window.dispatchEvent(ev);
  }

  calculateAccuracy() {
    const total = Object.values(this.hitCounts).reduce((a, b) => a + b, 0);
    if (total === 0) return 100;
    return Math.round(
      ((this.hitCounts.perfect + this.hitCounts.great + this.hitCounts.good) /
        total) *
        100
    );
  }

  restartGame() {
    this.gameEnded = false;
    this.gameStarted = false;
    this.spawnedIdx = 0;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.hitCounts = { perfect: 0, great: 0, good: 0, miss: 0 };

    this.notes.forEach((note) => note.destroy());
    this.notes = [];

    this.missedNotes.forEach((note) => note.destroy());
    this.missedNotes = [];

    this.updateStats();
    this.createMockAudio();
  }
}

export default function FixedRhythmGame() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [gameReady, setGameReady] = useState(false);
  const [gameInstance, setGameInstance] = useState<Phaser.Game | null>(null);
  const stats = useRhythmStats();

  useEffect(() => {
    if (!containerRef.current) return;

    const config: any = {
      type: Phaser.AUTO,
      width: 770,
      height: 720,
      parent: containerRef.current,
      backgroundColor: "#f0f8ff",
      scene: [EnhancedRhythmScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    const game = new Phaser.Game(config);
    setGameInstance(game);
    setGameReady(true);

    return () => {
      setGameReady(false);
      game.destroy(true);
    };
  }, []);

  const accuracy = useMemo(() => {
    const total =
      stats.perfectHits + stats.greatHits + stats.goodHits + stats.misses;
    if (total === 0) return 100;
    return Math.round(
      ((stats.perfectHits + stats.greatHits + stats.goodHits) / total) * 100
    );
  }, [stats]);

  const progress = useMemo(() => {
    if (stats.totalTime <= 0) return 0;
    return Math.min((stats.currentTime / stats.totalTime) * 100, 100);
  }, [stats.currentTime, stats.totalTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getComboColor = (combo: number) => {
    if (combo >= 50) return "text-purple-600";
    if (combo >= 25) return "text-indigo-600";
    if (combo >= 10) return "text-blue-600";
    return "text-slate-600";
  };

  const getAccuracyColor = (acc: number) => {
    if (acc >= 95) return "text-emerald-600";
    if (acc >= 85) return "text-green-600";
    if (acc >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const handlePlayAgain = () => {
    if (gameInstance) {
      const scene = gameInstance.scene.getScene(
        "EnhancedRhythmScene"
      ) as EnhancedRhythmScene;
      if (scene) {
        scene.restartGame();
      }
    }
  };

  const handleBackToMenu = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl md:text-5xl font-light text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-sky-500">
          Calm Rhythm
        </h1>
        <p className="text-center text-slate-600 mb-6">
          A soothing rhythm game demo. Press <strong>A / S / D / F</strong> on
          the beat.
        </p>
      </div>

      <div className="relative w-full max-w-4xl mx-auto">
        {/* Game Canvas */}
        <div
          ref={containerRef}
          className="w-full aspect-[770/720] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50"
        />

        {/* HUD Overlay */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6">
          {/* Top Stats */}
          <div className="flex justify-between items-start">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white/70 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg"
            >
              <div className="text-slate-600 text-sm font-medium">Score</div>
              <motion.div
                key={stats.score}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-2xl font-bold text-slate-800"
              >
                {stats.score.toLocaleString()}
              </motion.div>
            </motion.div>

            <div className="flex gap-3">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white/70 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg"
              >
                <div className="text-slate-600 text-sm font-medium">Combo</div>
                <motion.div
                  key={stats.combo}
                  initial={{ scale: stats.combo > 0 ? 1.2 : 1 }}
                  animate={{ scale: 1 }}
                  className={`text-2xl font-bold ${getComboColor(stats.combo)}`}
                >
                  {stats.combo}x
                </motion.div>
                {stats.maxCombo > 0 && (
                  <div className="text-xs text-slate-500">
                    Max: {stats.maxCombo}x
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="bg-white/70 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg"
              >
                <div className="text-slate-600 text-sm font-medium">
                  Accuracy
                </div>
                <div
                  className={`text-2xl font-bold ${getAccuracyColor(accuracy)}`}
                >
                  {accuracy}%
                </div>
                <div className="text-xs text-slate-500 grid grid-cols-2 gap-1 mt-1">
                  <span>P: {stats.perfectHits}</span>
                  <span>G: {stats.greatHits}</span>
                  <span>OK: {stats.goodHits}</span>
                  <span>X: {stats.misses}</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Judgment Display */}
          <AnimatePresence mode="wait">
            {stats.judgement && !stats.gameEnded && (
              <motion.div
                key={stats.judgement + stats.score}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.2, y: -20 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  duration: 0.6,
                }}
                className="self-center mb-12"
              >
                <div
                  className={`px-6 py-3 rounded-3xl backdrop-blur-md shadow-xl border-2 ${
                    stats.judgement === "Perfect"
                      ? "bg-emerald-100/80 border-emerald-300/50 text-emerald-700"
                      : stats.judgement === "Great"
                      ? "bg-blue-100/80 border-blue-300/50 text-blue-700"
                      : stats.judgement === "Good"
                      ? "bg-amber-100/80 border-amber-300/50 text-amber-700"
                      : "bg-red-100/80 border-red-300/50 text-red-700"
                  }`}
                >
                  <div className="text-2xl font-bold text-center">
                    {stats.judgement}
                  </div>
                  {stats.combo > 5 && stats.judgement !== "Miss" && (
                    <div className="text-sm text-center mt-1 font-medium">
                      {stats.combo}x Combo!
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Game End Overlay */}
        <AnimatePresence>
          {stats.gameEnded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-auto"
            >
              <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/50 max-w-md w-full mx-4"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">
                    Song Complete!
                  </h2>
                  <p className="text-slate-600 mb-6">Thanks for playing!</p>

                  <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.score.toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-600">Final Score</div>
                    </div>
                    <div>
                      <div
                        className={`text-2xl font-bold ${getAccuracyColor(
                          accuracy
                        )}`}
                      >
                        {accuracy}%
                      </div>
                      <div className="text-sm text-slate-600">Accuracy</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.maxCombo}x
                      </div>
                      <div className="text-sm text-slate-600">Max Combo</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">
                        {stats.perfectHits}
                      </div>
                      <div className="text-sm text-slate-600">Perfect Hits</div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handlePlayAgain}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Play Again
                    </button>
                    <button
                      onClick={handleBackToMenu}
                      className="flex-1 bg-gradient-to-r from-slate-500 to-slate-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Back to Menu
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="mt-4 bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/50">
          <div className="flex justify-between items-center mb-2 text-sm text-slate-600">
            <span>Progress</span>
            <span>
              {formatTime(stats.currentTime)} / {formatTime(stats.totalTime)}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 relative overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
              className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </motion.div>
          </div>

          {stats.misses > 0 && (
            <div className="mt-2 text-xs text-red-500 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span>{stats.misses} missed notes</span>
            </div>
          )}
        </div>

        {/* Performance Stats */}
        {stats.perfectHits + stats.greatHits + stats.goodHits + stats.misses >
          5 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/50"
          >
            <h3 className="text-lg font-semibold text-slate-700 mb-3">
              Performance
            </h3>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-xl font-bold text-emerald-600">
                  {stats.perfectHits}
                </div>
                <div className="text-xs text-slate-600">Perfect</div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-600">
                  {stats.greatHits}
                </div>
                <div className="text-xs text-slate-600">Great</div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-600">
                  {stats.goodHits}
                </div>
                <div className="text-xs text-slate-600">Good</div>
              </div>
              <div>
                <div className="text-xl font-bold text-red-600">
                  {stats.misses}
                </div>
                <div className="text-xs text-slate-600">Miss</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Controls */}
        <div className="mt-4 flex gap-3 justify-center">
          <button
            onClick={handleBackToMenu}
            className="bg-gradient-to-r from-slate-500 to-slate-600 text-white font-medium py-2 px-6 rounded-xl hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
          >
            Back to Menu
          </button>

          {stats.gameEnded && (
            <button
              onClick={handlePlayAgain}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium py-2 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"
            >
              Play Again
            </button>
          )}
        </div>

        {/* Loading Overlay */}
        <AnimatePresence>
          {!gameReady && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full mx-auto mb-4"
                />
                <div className="text-slate-600 font-medium">
                  Loading Game...
                </div>
                <div className="text-slate-500 text-sm mt-2">
                  Initializing rhythm engine
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="text-xs text-slate-400 mt-6">
        Demo Mode - Click or press any key to start
      </footer>
    </div>
  );
}

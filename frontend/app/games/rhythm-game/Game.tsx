"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Phaser from "phaser"

// Enhanced stats tracking
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
    misses: 0
  });
  
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setStats((prev) => ({ ...prev, ...detail }));
    };
    window.addEventListener("rhythm:stats", handler as EventListener);
    return () => window.removeEventListener("rhythm:stats", handler as EventListener);
  }, []);
  return stats;
}

// Enhanced Phaser Scene with better visuals and gameplay
class EnhancedPlayScene extends Phaser.Scene {
  music!: Phaser.Sound.BaseSound;
  spawnedIdx = 0;
  hitLineY = 540;
  spawnY = -120;
  bottomXs = [220, 330, 440, 550];
  topXs = [300, 365, 425, 490];
  travelTime = 2.2; // Slower for more relaxed timing
  leadTime = this.travelTime + 0.2;
  beatmap: { time: number; lane: number; type?: string }[] = [];
  notes: any[] = [];
  particles!: Phaser.GameObjects.Particles.ParticleEmitterManager;
  paused = false;
  hitKeys = ["A", "S", "D", "F"];
  
  // Game state
  score = 0;
  combo = 0;
  maxCombo = 0;
  hitCounts = { perfect: 0, great: 0, good: 0, miss: 0 };
  
  // Visual enhancements
  laneGlows: Phaser.GameObjects.Image[] = [];
  backgroundElements: Phaser.GameObjects.GameObject[] = [];
  
  // Audio analysis
  audioContext!: AudioContext;
  analyser!: AnalyserNode;
  dataArray!: Uint8Array;
  lastBeatTime = 0;
  beatThreshold = 128; // Lowered threshold for gentler music

  createEnhancedTextures() {
    // Note with inner glow
    const noteSize = 64;
    const g = this.add.graphics();
    
    // Outer glow
    for (let r = noteSize; r > 0; r -= 2) {
      const alpha = Phaser.Math.Percent(r, 0, noteSize) * 0.4;
      g.fillStyle(0x60a5fa, alpha);
      g.fillCircle(noteSize, noteSize, r);
    }
    
    // Core note
    g.fillStyle(0x93c5fd, 0.9);
    g.fillCircle(noteSize, noteSize, noteSize * 0.4);
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(noteSize, noteSize, noteSize * 0.2);
    
    g.generateTexture("enhancedNote", noteSize * 2, noteSize * 2);
    g.clear();

    // Hold note trail
    g.fillGradientStyle(0x60a5fa, 0x60a5fa, 0x60a5fa, 0x60a5fa, 0.8, 0.8, 0.2, 0.2);
    g.fillRect(0, 0, 24, 80);
    g.generateTexture("holdTrail", 24, 80);
    g.clear();

    // Spark effect
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 8, 8);
    g.generateTexture("spark", 16, 16);
    g.destroy();
  }

  preload() {
    this.load.audio("calmMusic", "/audio/calm.mp3");
  }

  create() {
    this.cameras.main.setBackgroundColor("#f0f8ff");

    this.createEnhancedTextures();
    this.addEnhancedBackground();
    this.drawEnhancedRunway();
    this.setupParticles();
    
    this.music = this.sound.add("calmMusic", { volume: 0.6 });
    
    // Setup audio analysis for real beat detection
    this.setupAudioAnalysis();
    
    // Generate a more relaxed beatmap as fallback
    this.beatmap = this.generateRelaxedBeatmap({ bpm: 75, bars: 24 });

    this.setupControls();
    this.drawEnhancedHUD();
    this.addFloatingInstructions();

    // Auto-start on interaction
    this.input.once("pointerdown", () => this.start());
    this.input.keyboard?.once("keydown", () => this.start());
  }

  setupAudioAnalysis() {
    try {
      // Try to setup audio analysis for real beat detection
      if (typeof AudioContext !== 'undefined') {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      }
    } catch (e) {
      console.log("Audio analysis not available, using procedural beats");
    }
  }

  generateRelaxedBeatmap({ bpm, bars }: { bpm: number; bars: number }) {
    const beat = 60 / bpm;
    const map: { time: number; lane: number; type?: string }[] = [];
    let t = 3; // Longer intro
    
    for (let bar = 0; bar < bars; bar++) {
      const pattern = bar % 6; // More varied patterns
      
      switch (pattern) {
        case 0: // Simple quarter notes
          map.push({ time: t, lane: 0 });
          map.push({ time: t + beat * 2, lane: 1 });
          break;
          
        case 1: // Gentle ascending
          map.push({ time: t, lane: 0 });
          map.push({ time: t + beat, lane: 1 });
          map.push({ time: t + beat * 2, lane: 2 });
          break;
          
        case 2: // Chord hits
          map.push({ time: t, lane: 1 });
          map.push({ time: t, lane: 2 });
          map.push({ time: t + beat * 3, lane: 0 });
          break;
          
        case 3: // Syncopated but gentle
          map.push({ time: t + beat * 0.5, lane: 3 });
          map.push({ time: t + beat * 2.5, lane: 1 });
          break;
          
        case 4: // Single hits with space
          map.push({ time: t + beat, lane: 2 });
          map.push({ time: t + beat * 3, lane: 0 });
          break;
          
        case 5: // Rest bar (breathing room)
          map.push({ time: t + beat * 2, lane: 1 });
          break;
      }
      t += beat * 4;
    }
    return map;
  }

  start() {
    if (this.music.isPlaying) return;
    this.music.play();
    
    // Fade in game elements
    this.tweens.add({
      targets: this.cameras.main,
      alpha: { from: 0.3, to: 1 },
      duration: 1000,
      ease: "power2.out"
    });
  }

  setupControls() {
    this.input.keyboard?.on("keydown-P", () => this.togglePause());
    
    this.input.keyboard?.on("keydown", (ev: KeyboardEvent) => {
      const i = this.hitKeys.indexOf(ev.key.toUpperCase());
      if (i !== -1) {
        this.onHitKey(i);
        this.triggerLanePress(i);
      }
    });
  }

  triggerLanePress(lane: number) {
    if (this.laneGlows[lane]) {
      this.laneGlows[lane].setAlpha(0.6);
      this.tweens.add({
        targets: this.laneGlows[lane],
        alpha: 0.1,
        duration: 150,
        ease: "power2.out"
      });
    }
  }

  setupParticles() {
    this.particles = this.add.particles(0, 0, "spark", {
      speed: { min: 20, max: 80 },
      lifespan: 800,
      quantity: 0,
      alpha: { start: 1, end: 0 },
      scale: { start: 0.8, end: 0.1 },
      blendMode: Phaser.BlendModes.ADD,
    });
  }

  addEnhancedBackground() {
    // Animated gradient background
    const bg = this.add.rectangle(385, 360, 770, 720, 0xf0f8ff);
    
    // Floating particles
    for (let i = 0; i < 30; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, 770),
        Phaser.Math.Between(0, 720),
        Phaser.Math.Between(2, 8),
        0x93c5fd,
        Phaser.Math.FloatBetween(0.1, 0.3)
      );
      
      this.tweens.add({
        targets: particle,
        y: particle.y - Phaser.Math.Between(50, 150),
        x: particle.x + Phaser.Math.Between(-30, 30),
        alpha: { from: particle.alpha, to: 0 },
        duration: Phaser.Math.Between(4000, 8000),
        repeat: -1,
        yoyo: true,
        delay: Phaser.Math.Between(0, 2000)
      });
    }

    // Subtle wave animation
    const wave = this.add.graphics();
    wave.lineStyle(2, 0x60a5fa, 0.2);
    for (let i = 0; i <= 770; i += 10) {
      const y = 600 + Math.sin(i * 0.02) * 20;
      if (i === 0) wave.moveTo(i, y);
      else wave.lineTo(i, y);
    }
    wave.strokePath();
    
    this.tweens.add({
      targets: wave,
      x: -20,
      duration: 3000,
      repeat: -1,
      ease: "none"
    });
  }

  drawEnhancedRunway() {
    const g = this.add.graphics();
    
    // Enhanced lane rendering with glow effects
    for (let i = 0; i < 4; i++) {
      const top = this.topXs[i];
      const bot = this.bottomXs[i];
      
      // Lane base
      g.fillStyle(0xe1f5fe, 0.4);
      const poly = new Phaser.Geom.Polygon([
        top - 42, this.spawnY,
        top + 42, this.spawnY,
        bot + 75, this.hitLineY + 90,
        bot - 75, this.hitLineY + 90,
      ]);
      g.fillPoints(poly.points, true);

      // Lane glow effect
      const glow = this.add.image(bot, this.hitLineY, "enhancedNote");
      glow.setScale(2, 0.3).setAlpha(0.1).setBlendMode(Phaser.BlendModes.ADD);
      this.laneGlows[i] = glow;

      // Enhanced dividers with gradient effect
      g.lineStyle(2, 0x93c5fd, 0.6);
      g.beginPath();
      g.moveTo(top - 42, this.spawnY);
      g.lineTo(bot - 75, this.hitLineY + 90);
      g.moveTo(top + 42, this.spawnY);
      g.lineTo(bot + 75, this.hitLineY + 90);
      g.strokePath();
    }

    // Enhanced vignette with depth
    const innerVignette = this.add.rectangle(385, 360, 600, 580, 0x1e40af, 0.05);
    const outerVignette = this.add.rectangle(385, 360, 770, 720, 0x000000, 0.08);
    outerVignette.setBlendMode(Phaser.BlendModes.MULTIPLY);
  }

  drawEnhancedHUD() {
    // Enhanced hit line with pulsing effect
    const hitLineGfx = this.add.graphics();
    hitLineGfx.lineStyle(3, 0x60a5fa, 0.8);
    hitLineGfx.beginPath();
    hitLineGfx.moveTo(150, this.hitLineY);
    hitLineGfx.lineTo(620, this.hitLineY);
    hitLineGfx.strokePath();

    // Pulsing hit line glow
    const hitGlow = this.add.rectangle(385, this.hitLineY, 470, 8, 0x60a5fa, 0.3);
    hitGlow.setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: hitGlow,
      alpha: { from: 0.3, to: 0.1 },
      scaleY: { from: 1, to: 2 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    // Lane markers at hit line
    for (let i = 0; i < 4; i++) {
      const marker = this.add.circle(this.bottomXs[i], this.hitLineY, 25, 0x93c5fd, 0.3);
      marker.setStrokeStyle(2, 0x60a5fa, 0.6);
      
      // Key labels
      const keyLabel = this.add.text(this.bottomXs[i], this.hitLineY + 50, this.hitKeys[i], {
        fontFamily: "ui-sans-serif",
        fontSize: "16px",
        color: "#64748b"
      }).setOrigin(0.5);
    }
  }



  addFloatingInstructions() {
    const instructions = this.add.text(385, 120, "♪ Feel the gentle rhythm ♪\nA S D F to play along\nP to pause • Relaxed timing", {
      fontFamily: "ui-sans-serif",
      fontSize: "18px",
      color: "#64748b",
      align: "center",
      lineSpacing: 8
    }).setOrigin(0.5).setAlpha(0.7);
    
    this.tweens.add({
      targets: instructions,
      y: instructions.y + 8,
      alpha: { from: 0.7, to: 0.4 },
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });
    
    // Add timing help text
    const timingHelp = this.add.text(385, 180, "Large timing windows - don't stress about perfect timing!", {
      fontFamily: "ui-sans-serif",
      fontSize: "14px",
      color: "#94a3b8",
      align: "center"
    }).setOrigin(0.5).setAlpha(0.6);
    
    this.tweens.add({
      targets: timingHelp,
      alpha: { from: 0.6, to: 0.2 },
      duration: 4000,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      delay: 1000
    });
  }

  update(time: number, delta: number) {
    if (!this.music || !this.music.isPlaying) return;

    const audioTime = (this.music as any).seek as number;

    // Enhanced note spawning
    while (
      this.spawnedIdx < this.beatmap.length &&
      this.beatmap[this.spawnedIdx].time - this.leadTime <= audioTime
    ) {
      const bm = this.beatmap[this.spawnedIdx++];
      this.spawnEnhancedNote(bm.time, bm.lane, bm.type);
    }

    // Enhanced note movement with easing
    const toRemove: any[] = [];
    for (const note of this.notes) {
      const t = Phaser.Math.Clamp((audioTime - note.spawnTime) / this.travelTime, 0, 1);
      
      // Smooth easing for movement
      const easedT = Phaser.Math.Easing.Cubic.Out(t);
      note.y = Phaser.Math.Linear(this.spawnY, this.hitLineY, easedT);
      note.x = Phaser.Math.Linear(this.topXs[note.lane], this.bottomXs[note.lane], easedT);
      
      // Dynamic scaling with slight bounce
      const scale = Phaser.Math.Linear(0.4, 1.3, t);
      note.setScale(scale + Math.sin(time * 0.01) * 0.05);
      
      // Rotation based on lane
      note.setRotation(Math.sin(time * 0.008 + note.lane) * 0.1);

      if (t >= 1.15 && !note.hit) {
        toRemove.push(note);
        this.enhancedJudge("Miss", 0);
        this.enhancedLanePulse(note.lane, 0xff6b6b);
      }
    }
    
    toRemove.forEach((n) => {
      if (n.trail) n.trail.destroy();
      n.destroy();
    });
    this.notes = this.notes.filter((n) => !toRemove.includes(n));
  }

  spawnEnhancedNote(hitTime: number, lane: number, type?: string) {
    const spawnTime = hitTime - this.travelTime;
    const note = this.add.image(this.topXs[lane], this.spawnY, "enhancedNote");
    note.setBlendMode(Phaser.BlendModes.NORMAL);
    
    // Add subtle glow animation
    this.tweens.add({
      targets: note,
      alpha: { from: 0.7, to: 1 },
      duration: 200,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    Object.assign(note, { lane, hitTime, spawnTime, hit: false, type });

    // Enhanced trail effect
    const trail = this.add.particles(note.x, note.y, "spark", {
      speed: { min: 10, max: 30 },
      lifespan: 400,
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.8, end: 0 },
      quantity: 2,
      frequency: 50,
      blendMode: Phaser.BlendModes.ADD,
    });

    (note as any).trail = trail;
    this.notes.push(note);
  }

  onHitKey(lane: number) {
    if (!this.music || !this.music.isPlaying) return;
    
    const now = (this.music as any).seek as number;
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

    // Much more forgiving timing windows
    const windows = { perfect: 0.08, great: 0.15, good: 0.25 }; // Nearly doubled!
    let scoreAdd = 0;
    let label = "";
    let multiplier = 1;
    
    if (bestDt <= windows.perfect) {
      scoreAdd = 1000;
      label = "Perfect";
      multiplier = 1.5;
      this.hitCounts.perfect++;
    } else if (bestDt <= windows.great) {
      scoreAdd = 650;
      label = "Great";
      multiplier = 1.2;
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
      this.enhancedHitEffect(best.x, this.hitLineY, label);
      this.enhancedLanePulse(lane, label === "Perfect" ? 0x34d399 : 0x60a5fa);
      
      // Enhanced combo system
      this.combo++;
      this.maxCombo = Math.max(this.maxCombo, this.combo);
      
      // More generous combo bonus
      const comboBonus = Math.floor(this.combo / 5) * 25; // Bonus every 5 hits
      scoreAdd = Math.floor(scoreAdd * multiplier) + comboBonus;
      
      if (best.trail) best.trail.destroy();
      best.destroy();
      this.notes = this.notes.filter((n) => n !== best);
    } else {
      this.combo = 0;
    }

    this.score += scoreAdd;
    this.enhancedJudge(label, scoreAdd);
  }

  enhancedJudge(label: string, scoreAdd: number) {
    const totalHits = Object.values(this.hitCounts).reduce((a, b) => a + b, 0);
    const accuracy = totalHits > 0 ? Math.round(((this.hitCounts.perfect + this.hitCounts.great + this.hitCounts.good) / totalHits) * 100) : 100;
    
    const ev = new CustomEvent("rhythm:stats", {
      detail: {
        judgement: label,
        score: this.score,
        combo: this.combo,
        maxCombo: this.maxCombo,
        accuracy,
        perfectHits: this.hitCounts.perfect,
        greatHits: this.hitCounts.great,
        goodHits: this.hitCounts.good,
        misses: this.hitCounts.miss
      }
    });
    window.dispatchEvent(ev);

    // Enhanced floating text
    const colors = {
      Perfect: "#10b981",
      Great: "#3b82f6", 
      Good: "#f59e0b",
      Miss: "#ef4444"
    };
    
    const txt = this.add.text(385, this.hitLineY - 40, label, {
      fontFamily: "ui-sans-serif",
      fontSize: "24px",
      color: colors[label as keyof typeof colors],
      fontStyle: label === "Perfect" ? "bold" : "normal"
    }).setOrigin(0.5);

    // Combo text
    if (this.combo > 5 && label !== "Miss") {
      const comboTxt = this.add.text(385, this.hitLineY - 70, `${this.combo}x COMBO!`, {
        fontFamily: "ui-sans-serif",
        fontSize: "16px",
        color: "#8b5cf6"
      }).setOrigin(0.5);
      
      this.tweens.add({
        targets: comboTxt,
        y: comboTxt.y - 25,
        alpha: 0,
        scale: 1.2,
        duration: 800,
        ease: "back.out",
        onComplete: () => comboTxt.destroy()
      });
    }

    this.tweens.add({
      targets: txt,
      y: txt.y - 35,
      alpha: 0,
      scale: { from: 1, to: 1.3 },
      duration: 700,
      ease: "back.out",
      onComplete: () => txt.destroy()
    });
  }

  enhancedHitEffect(x: number, y: number, judgement: string) {
    // Main explosion
    this.particles.emitParticleAt(x, y, 12);
    
    // Ring effect based on judgement quality
    const ringColor = judgement === "Perfect" ? 0x10b981 : 0x60a5fa;
    const ring = this.add.circle(x, y, 35, ringColor, 0.6);
    ring.setBlendMode(Phaser.BlendModes.ADD);
    
    this.tweens.add({
      targets: ring,
      scale: { from: 0.8, to: 2.5 },
      alpha: 0,
      duration: 500,
      ease: "power3.out",
      onComplete: () => ring.destroy()
    });

    // Perfect hit gets extra sparkles
    if (judgement === "Perfect") {
      for (let i = 0; i < 8; i++) {
        const spark = this.add.circle(
          x + Phaser.Math.Between(-20, 20),
          y + Phaser.Math.Between(-20, 20),
          3,
          0xffffff,
          0.8
        );
        spark.setBlendMode(Phaser.BlendModes.ADD);
        
        this.tweens.add({
          targets: spark,
          y: spark.y - Phaser.Math.Between(20, 40),
          alpha: 0,
          duration: Phaser.Math.Between(300, 600),
          ease: "power2.out",
          onComplete: () => spark.destroy()
        });
      }
    }
  }

  enhancedLanePulse(lane: number, color = 0x60a5fa) {
    const bottomX = this.bottomXs[lane];
    const topX = this.topXs[lane];
    
    const pulse = this.add.polygon(0, 0, [
      topX - 45, this.spawnY,
      topX + 45, this.spawnY,
      bottomX + 80, this.hitLineY + 100,
      bottomX - 80, this.hitLineY + 100,
    ], color, 0.4);
    
    pulse.setBlendMode(Phaser.BlendModes.ADD);
    
    this.tweens.add({
      targets: pulse,
      alpha: 0,
      scaleX: 1.1,
      duration: 350,
      ease: "power2.out",
      onComplete: () => pulse.destroy()
    });
  }

  togglePause() {
    if (!this.music) return;
    this.paused = !this.paused;
    
    if (this.paused) {
      this.music.pause();
      this.time.timeScale = 0;
      this.scene.pause();
    } else {
      this.music.resume();
      this.time.timeScale = 1;
      this.scene.resume();
    }
  }
}

// Enhanced React Component
export default function EnhancedRhythmGame() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [gameReady, setGameReady] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const stats = useRhythmStats();

  useEffect(() => {
    if (!containerRef.current) return;

    const config: any = {
      type: Phaser.AUTO,
      width: 770,
      height: 720,
      parent: containerRef.current,
      backgroundColor: "#f0f8ff",
      scene: [EnhancedPlayScene],
      physics: {
        default: "arcade",
        arcade: { debug: false }
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    const game = new Phaser.Game(config);
    setGameReady(true);

    return () => {
      setGameReady(false);
      game.destroy(true);
    };
  }, []);

  const accuracy = useMemo(() => {
    const total = stats.perfectHits + stats.greatHits + stats.goodHits + stats.misses;
    if (total === 0) return 100;
    return Math.round(((stats.perfectHits + stats.greatHits + stats.goodHits) / total) * 100);
  }, [stats]);

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

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Game Canvas */}
      <div ref={containerRef} className="w-full aspect-[770/720] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50" />

      {/* Enhanced HUD Overlay */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6">
        {/* Top Stats */}
        <div className="flex justify-between items-start">
          <motion.div 
            initial={{ x: -20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
            className="bg-white/60 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-white/30"
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
              className="bg-white/60 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-white/30"
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
                <div className="text-xs text-slate-500">Max: {stats.maxCombo}x</div>
              )}
            </motion.div>

            <motion.div 
              initial={{ x: 20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }}
              className="bg-white/60 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-white/30"
            >
              <div className="text-slate-600 text-sm font-medium">Accuracy</div>
              <div className={`text-2xl font-bold ${getAccuracyColor(accuracy)}`}>
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
          {stats.judgement && (
            <motion.div
              key={stats.judgement + stats.score}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.2, y: -20 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 20,
                duration: 0.6
              }}
              className="self-center mb-12"
            >
              <div className={`px-6 py-3 rounded-3xl backdrop-blur-md shadow-xl border-2 ${
                stats.judgement === "Perfect" ? "bg-emerald-100/80 border-emerald-300/50 text-emerald-700" :
                stats.judgement === "Great" ? "bg-blue-100/80 border-blue-300/50 text-blue-700" :
                stats.judgement === "Good" ? "bg-amber-100/80 border-amber-300/50 text-amber-700" :
                "bg-red-100/80 border-red-300/50 text-red-700"
              }`}>
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

        {/* Progress and Info */}
        <div className="flex justify-between items-end">
          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/50 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg text-sm text-slate-600"
          >
            <div className="flex gap-4">
              <span>♪ Calm Mode</span>
              <span>85 BPM</span>
              <span>Press P to pause</span>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            className="bg-white/50 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg text-right"
          >
            <div className="text-xs text-slate-600">Best Combo</div>
            <div className="text-lg font-semibold text-purple-600">{stats.maxCombo}x</div>
          </motion.div>
        </div>
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
              <div className="text-slate-600 font-medium">Loading rhythm game...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance Stats Panel */}
      {(stats.perfectHits + stats.greatHits + stats.goodHits + stats.misses) > 20 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/50"
        >
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Performance Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{stats.perfectHits}</div>
              <div className="text-sm text-slate-600">Perfect</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.greatHits}</div>
              <div className="text-sm text-slate-600">Great</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{stats.goodHits}</div>
              <div className="text-sm text-slate-600">Good</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.misses}</div>
              <div className="text-sm text-slate-600">Miss</div>
            </div>
          </div>
          
          {/* Accuracy Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Overall Accuracy</span>
              <span className={getAccuracyColor(accuracy)}>{accuracy}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${accuracy}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-2 rounded-full ${
                  accuracy >= 95 ? "bg-emerald-500" :
                  accuracy >= 85 ? "bg-green-500" :
                  accuracy >= 75 ? "bg-yellow-500" : "bg-red-500"
                }`}
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
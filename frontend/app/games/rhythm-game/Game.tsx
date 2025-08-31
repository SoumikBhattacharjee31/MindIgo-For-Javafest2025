"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Phaser from "phaser";

interface BeatmapMetadata {
  id: number;
  beatmapset_id: number;
  difficulty_rating: number;
  total_length: number;
  bpm: number;
  artist: string;
  title: string;
  version: string;
  creator: string;
  audioUrl?: string;
  beatmapUrl?: string;
}

interface HitObject {
  time: number;
  lane: number;
  type?: string;
  endTime?: number;
}

function parseOsuFile(content: string): { hitObjects: HitObject[], timingPoints: any[], metadata: any } {
  const lines = content.split('\n');
  let currentSection = '';
  const hitObjects: HitObject[] = [];
  const timingPoints: any[] = [];
  const metadata: any = {};

  for (const line of lines) {
    const trimmed = line.trim();
    
    // Section headers
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      currentSection = trimmed;
      continue;
    }

    if (currentSection === '[General]') {
      const [key, value] = line.split(':').map(s => s?.trim());
      if (key && value !== undefined) {
        metadata[key] = value;
      }
    }

    if (currentSection === '[TimingPoints]') {
      if (trimmed && !trimmed.startsWith('//')) {
        const parts = trimmed.split(',');
        if (parts.length >= 2) {
          timingPoints.push({
            time: parseFloat(parts[0]),
            beatLength: parseFloat(parts[1]),
            meter: parseInt(parts[2]) || 4,
            uninherited: parts[6] === '1'
          });
        }
      }
    }

    if (currentSection === '[HitObjects]') {
      if (trimmed && !trimmed.startsWith('//')) {
        const parts = trimmed.split(',');
        if (parts.length >= 4) {
          const x = parseInt(parts[0], 10);
          const y = parseInt(parts[1], 10);
          const time = parseInt(parts[2], 10);
          const type = parseInt(parts[3], 10);
          
          // Convert osu! coordinates (0-512) to 4 lanes
          // const lane = Math.floor((x / 512) * 4);
          // const clampedLane = Math.max(0, Math.min(3, lane));
          // Convert osu! coordinates (0-512) to 4 lanes with better distribution
          const lane = Math.floor((x / 128)); // osu! uses 512px width, divide by 128 for 4 lanes
          const clampedLane = Math.max(0, Math.min(3, lane));
          
          const hitObject: HitObject = {
            time: time / 1000, // Convert to seconds
            lane: clampedLane
          };

          // Check if it's a hold note (slider or spinner)
          if (type & 2) { // Slider
            hitObject.type = 'hold';
            if (parts.length >= 6) {
              const endTime = parseInt(parts[5], 10);
              hitObject.endTime = endTime / 1000;
            }
          } else if (type & 8) { // Spinner
            hitObject.type = 'spinner';
            if (parts.length >= 6) {
              hitObject.endTime = parseInt(parts[5], 10) / 1000;
            }
          }

          hitObjects.push(hitObject);
        }
      }
    }
  }

  return { hitObjects, timingPoints, metadata };
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
    loading: false,
    error: null as string | null
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

class OsuRhythmScene extends Phaser.Scene {
  music!: Phaser.Sound.BaseSound;
  spawnedIdx = 0;
  hitLineY = 540;
  spawnY = -120;
  bottomXs = [220, 330, 440, 550];
  topXs = [300, 365, 425, 490];
  travelTime = 2.2;
  leadTime = this.travelTime + 0.2;
  beatmap: HitObject[] = [];
  notes: any[] = [];
  missedNotes: any[] = [];
  particles!: Phaser.GameObjects.Particles.ParticleEmitterManager;
  paused = false;
  hitKeys = ["A", "S", "D", "F"];
  gameEnded = false;
  gameStarted = false;
  
  score = 0;
  combo = 0;
  maxCombo = 0;
  hitCounts = { perfect: 0, great: 0, good: 0, miss: 0 };
  
  laneGlows: Phaser.GameObjects.Image[] = [];
  beatmapMetadata: BeatmapMetadata | null = null;
  
  // Audio timing
  audioOffset = 0; // Offset to sync audio with gameplay

  audioUrl: string | null = null; // Store audio URL for preload
  audioLoadError: string | null = null; // Store audio validation error

  private lastUpdateTime = 0;
  private updateInterval = 16;

  private notePool: Phaser.GameObjects.Image[] = [];
  private poolSize = 50;

  private lastStatsUpdate = 0;
  private statsUpdateInterval = 100;

  private effectPool: Phaser.GameObjects.Circle[] = [];

  private pendingStatsUpdate: any = null;

  constructor() {
    super('OsuRhythmScene');
  }

  getPooledEffect(): Phaser.GameObjects.Circle | null {
    return this.effectPool.pop() || null;
  }

  recycleEffect(effect: Phaser.GameObjects.Circle) {
    if (this.effectPool.length < 20) {
      effect.setVisible(false);
      this.effectPool.push(effect);
    } else {
      effect.destroy();
    }
  }

  updateStatsThrottled() {
    const now = this.time.now;
    if (now - this.lastStatsUpdate < this.statsUpdateInterval) {
      return;
    }
    this.lastStatsUpdate = now;
    this.updateStats();
  }

  emitStatsUpdate(updates: any) {
    // Batch multiple updates into single event
    this.pendingStatsUpdate = { ...this.pendingStatsUpdate, ...updates };
    
    // Use requestAnimationFrame for batching
    requestAnimationFrame(() => {
      if (this.pendingStatsUpdate) {
        const ev = new CustomEvent("rhythm:stats", {
          detail: this.pendingStatsUpdate
        });
        window.dispatchEvent(ev);
        this.pendingStatsUpdate = null;
      }
    });
  }

  preload() {
  this.load.image('note', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
  
  const beatmapId = this.registry.get('beatmapId') || '131891';
  this.audioUrl = `/api/osu?beatmapId=${beatmapId}&action=audio`;
  
  this.load.once('complete', () => {
    this.emitLoadingState(false);
    // Don't try to load audio through Phaser, use HTML5 Audio instead
    this.setupHtml5Audio();
  });
}

  async init(data: { beatmapId?: string } = {}) {
    const beatmapId = data.beatmapId || '131891';
    // const beatmapId = data.beatmapId;
    if (!beatmapId) {
      throw new Error('No beatmap ID provided');
    }
    this.registry.set('beatmapId', beatmapId); // Store beatmapId for preload
    
    try {
      this.emitLoadingState(true);
      
      // Load beatmap metadata
      const metadataResponse = await fetch(`/api/osu?beatmapId=${beatmapId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!metadataResponse.ok) {
        throw new Error(`Failed to load beatmap metadata: ${metadataResponse.status} ${metadataResponse.statusText}`);
      }
      
      this.beatmapMetadata = await metadataResponse.json();
      
      // Load beatmap file
      const beatmapFileResponse = await fetch(`/api/osu?beatmapId=${beatmapId}&action=beatmap`, {
        method: 'GET',
        headers: { 'Accept': 'text/plain' }
      });
      
      if (!beatmapFileResponse.ok) {
        throw new Error(`Failed to load beatmap file: ${beatmapFileResponse.status} ${beatmapFileResponse.statusText}`);
      }
      
      const beatmapContent = await beatmapFileResponse.text();
      const { hitObjects, timingPoints, metadata } = parseOsuFile(beatmapContent);
      this.beatmap = hitObjects.sort((a, b) => a.time - b.time);
      
      // Calculate audio offset
      // if (timingPoints.length > 0) {
      //   const firstTiming = timingPoints.find(tp => tp.uninherited);
      //   if (firstTiming) {
      //     this.audioOffset = firstTiming.time / 1000;
      //   }
      // }
      // Calculate audio offset - use the first timing point time as offset
      if (timingPoints.length > 0) {
        const firstTiming = timingPoints.find(tp => tp.uninherited);
        if (firstTiming && firstTiming.time > 0) {
          this.audioOffset = -firstTiming.time / 1000; // Negative to delay notes
        }
      }
      
      // Adjust travel time based on BPM
      if (this.beatmapMetadata.bpm) {
        const beatDuration = 60 / this.beatmapMetadata.bpm;
        this.travelTime = Math.max(1.5, Math.min(3.0, beatDuration * 4));
        this.leadTime = this.travelTime + 0.2;
      }
      
      this.emitLoadingState(false);
      
    } catch (error) {
      console.error('Failed to load osu! beatmap:', error);
      this.audioLoadError = (error as Error).message;
      this.emitLoadingState(false, this.audioLoadError);
      this.beatmap = this.generateFallbackBeatmap();
      this.audioUrl = null; // Prevent audio loading issues
    }
  }

  generateFallbackBeatmap(): HitObject[] {
    const bpm = 120;
    const beat = 60 / bpm;
    const map: HitObject[] = [];
    let t = 3;
    // const endTime = 90;
    const endTime = 180; // Make fallback longer to match typical song length
    
    while (t < endTime) {
      const pattern = Math.floor(t / (beat * 8)) % 6;
      
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
          break;
        case 3:
          map.push({ time: t + beat, lane: 3 });
          map.push({ time: t + beat * 1.5, lane: 1 });
          break;
        case 4:
          map.push({ time: t, lane: 2, type: "hold", endTime: t + beat * 2 });
          break;
        case 5:
          map.push({ time: t + beat * 0.5, lane: 0 });
          map.push({ time: t + beat * 1.5, lane: 3 });
          break;
      }
      t += beat * 4;
    }
    
    return map;
  }

  setupHtml5Audio() {
    try {
      if (!this.audioUrl) {
        throw new Error('No audio URL available');
      }

      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.preload = 'auto';
      audio.volume = 0.7;
      
      // Better buffering
      audio.addEventListener('canplaythrough', () => {
        console.log('Audio ready to play');
      });
      
      // Set source after event listeners
      audio.src = this.audioUrl;

      this.music = {
        isPlaying: false,
        totalDuration: 0,
        seek: 0,
        _htmlAudio: audio,
        
        play: () => {
          audio.currentTime = 0;
          audio.play().catch(e => console.warn('Audio play failed:', e));
          this.music.isPlaying = true;
          this.gameStarted = true;
        },
        
        pause: () => {
          audio.pause();
          this.music.isPlaying = false;
        },
        
        resume: () => {
          audio.play().catch(e => console.warn('Audio resume failed:', e));
          this.music.isPlaying = true;
        },
        
        stop: () => {
          audio.pause();
          audio.currentTime = 0;
          this.music.isPlaying = false;
          this.gameStarted = false;
        }
      } as any;

      audio.addEventListener('loadedmetadata', () => {
        this.music.totalDuration = audio.duration;
      });

      // Throttle timeupdate events
      let lastTimeUpdate = 0;
      audio.addEventListener('timeupdate', () => {
        const now = Date.now();
        if (now - lastTimeUpdate > 50) { // Update every 50ms max
          this.music.seek = audio.currentTime;
          lastTimeUpdate = now;
        }
      });

    } catch (error) {
      console.warn('Failed to setup HTML5 audio:', error);
      this.setupMockAudio();
    }
  }

  setupMockAudio() {
    // Fallback mock audio for demo
    this.music = {
      isPlaying: false,
      totalDuration: 90,
      seek: 0,
      play: () => {
        this.music.isPlaying = true;
        this.gameStarted = true;
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
        if (event === 'complete') {
          setTimeout(callback, 90000);
        }
      }
    } as any;
  }

  emitLoadingState(loading: boolean, error: string | null = null) {
    const ev = new CustomEvent("rhythm:stats", {
      detail: { loading, error }
    });
    window.dispatchEvent(ev);
  }

  startGameTimer() {
    const startTime = Date.now();
    const updateTimer = () => {
      if (!this.music.isPlaying) return;
      
      const elapsed = (Date.now() - startTime) / 1000;
      this.music.seek = elapsed;
      
      const totalDuration = this.beatmapMetadata?.total_length || 90;
      if (elapsed >= totalDuration) {
        this.endGame();
        return;
      }
      
      requestAnimationFrame(updateTimer);
    };
    updateTimer();
  }

  createTextures() {
    const noteSize = 32;
    const g = this.add.graphics();
    
    // Enhanced note with gradient
    g.fillGradientStyle(0x60a5fa, 0x93c5fd, 0x3b82f6, 0x1d4ed8, 0.9);
    g.fillCircle(noteSize, noteSize, noteSize);
    g.fillStyle(0xffffff, 0.4);
    g.fillCircle(noteSize, noteSize, noteSize * 0.4);
    g.generateTexture("enhancedNote", noteSize * 2, noteSize * 2);
    g.clear();

    // Hold note
    g.fillGradientStyle(0x10b981, 0x059669, 0x047857, 0x065f46, 0.9);
    g.fillRoundedRect(0, 0, noteSize * 2, noteSize * 3, 8);
    g.fillStyle(0xffffff, 0.3);
    g.fillRoundedRect(4, 4, noteSize * 2 - 8, noteSize * 3 - 8, 4);
    g.generateTexture("holdNote", noteSize * 2, noteSize * 3);
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
    this.cameras.main.setBackgroundColor('#f0f8ff');
    this.createTextures();
    this.addBackground();
    this.drawRunway();
    this.setupParticles();
    this.setupControls();
    this.addInstructions();
  }

  addBackground() {
    const bg = this.add.rectangle(385, 360, 770, 720, 0xf0f8ff);
    
    // Dynamic background based on BPM
    const particleCount = this.beatmapMetadata?.bpm ? Math.min(30, Math.max(15, this.beatmapMetadata.bpm / 4)) : 20;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, 770),
        Phaser.Math.Between(0, 720),
        Phaser.Math.Between(2, 8),
        0x93c5fd,
        Phaser.Math.FloatBetween(0.1, 0.4)
      );
      
      const speed = this.beatmapMetadata?.bpm ? (this.beatmapMetadata.bpm / 120) * 3000 : 3000;
      
      this.tweens.add({
        targets: particle,
        y: particle.y - Phaser.Math.Between(50, 150),
        alpha: { from: particle.alpha, to: 0 },
        duration: Phaser.Math.Between(speed, speed * 2),
        repeat: -1,
        yoyo: true,
        delay: Phaser.Math.Between(0, 2000)
      });
    }
  }

  drawRunway() {
    const g = this.add.graphics();
    
    for (let i = 0; i < 4; i++) {
      const top = this.topXs[i];
      const bot = this.bottomXs[i];
      
      // Lane background with difficulty-based color
      const difficulty = this.beatmapMetadata?.difficulty_rating || 2;
      const intensity = Math.min(1, difficulty / 6);
      const laneColor = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(0xe1f5fe),
        Phaser.Display.Color.ValueToColor(0xfce7f3),
        100,
        intensity * 100
      );
      
      g.fillStyle(laneColor, 0.3);
      const poly = new Phaser.Geom.Polygon([
        top - 30, this.spawnY,
        top + 30, this.spawnY,
        bot + 50, this.hitLineY + 60,
        bot - 50, this.hitLineY + 60,
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

    // Hit line with pulsing effect
    const hitLineGfx = this.add.graphics();
    hitLineGfx.lineStyle(4, 0x60a5fa, 0.8);
    hitLineGfx.beginPath();
    hitLineGfx.moveTo(150, this.hitLineY);
    hitLineGfx.lineTo(620, this.hitLineY);
    hitLineGfx.strokePath();

    // Pulse the hit line to the beat
    if (this.beatmapMetadata?.bpm) {
      const beatDuration = (60 / this.beatmapMetadata.bpm) * 1000;
      this.tweens.add({
        targets: hitLineGfx,
        alpha: { from: 0.8, to: 0.4 },
        duration: beatDuration / 2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
    }

    // Hit markers for each lane
    for (let i = 0; i < 4; i++) {
      const marker = this.add.circle(this.bottomXs[i], this.hitLineY, 22, 0x93c5fd, 0.3);
      marker.setStrokeStyle(3, 0x60a5fa, 0.6);
      
      const keyLabel = this.add.text(this.bottomXs[i], this.hitLineY + 45, this.hitKeys[i], {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#475569",
        fontStyle: "bold"
      }).setOrigin(0.5);
    }
  }

  setupParticles() {
    this.particles = this.add.particles(0, 0, "spark", {
      speed: { min: 30, max: 80 },
      lifespan: 800,
      quantity: 0,
      alpha: { start: 1, end: 0 },
      scale: { start: 0.8, end: 0.1 },
      tint: [0x60a5fa, 0x93c5fd, 0x3b82f6, 0x1d4ed8]
    });
  }

  addInstructions() {
    const title = this.beatmapMetadata ? 
      `${this.beatmapMetadata.artist} - ${this.beatmapMetadata.title} [${this.beatmapMetadata.version}]` :
      "♪ Calm Rhythm Demo ♪";
    
    const subtitle = this.beatmapMetadata ?
      `Mapped by ${this.beatmapMetadata.creator} • ${this.beatmapMetadata.difficulty_rating.toFixed(1)}☆` :
      "A S D F to play along";

    const instructions = this.add.text(385, 100, title, {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#334155",
      align: "center",
      wordWrap: { width: 600 }
    }).setOrigin(0.5);

    const subtitleText = this.add.text(385, 130, subtitle, {
      fontFamily: "Arial", 
      fontSize: "14px",
      color: "#64748b",
      align: "center"
    }).setOrigin(0.5);

    const controlText = this.add.text(385, 160, "P to pause • Click to start", {
      fontFamily: "Arial",
      fontSize: "12px", 
      color: "#94a3b8",
      align: "center"
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: [instructions, subtitleText, controlText],
      alpha: { from: 0.9, to: 0.5 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
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
    this.input.once('pointerdown', () => this.startGame());
    this.input.keyboard?.once('keydown', () => this.startGame());
  }

  startGame() {
    if (this.gameStarted || !this.music) return;
    
    try {
      this.music.play();
      this.gameStarted = true;
    } catch (error) {
      console.warn('Failed to play osu! audio, using timer fallback:', error);
      this.gameStarted = true;
      this.startGameTimer();
    }
  }

  triggerLanePress(lane: number) {
    if (this.laneGlows[lane]) {
      this.laneGlows[lane].setAlpha(0.7);
      this.tweens.add({
        targets: this.laneGlows[lane],
        alpha: 0.1,
        scale: { from: 1.5, to: 2 },
        duration: 200,
        ease: "power2.out"
      });
    }
  }

  update() {
    const currentTime = this.time.now;
    if (currentTime - this.lastUpdateTime < this.updateInterval) {
      return; // Skip frame if not enough time has passed
    }
    this.lastUpdateTime = currentTime;

    if (!this.music || !this.gameStarted || this.gameEnded) return;

    // Get current audio time, accounting for offset
    const rawAudioTime = this.music.seek || 0;
    const audioTime = rawAudioTime + this.audioOffset;
    const totalTime = this.beatmapMetadata?.total_length || this.music.totalDuration || 90;

    this.updateTimeStats(rawAudioTime, totalTime);

    // Spawn notes
    while (
      this.spawnedIdx < this.beatmap.length &&
      this.beatmap[this.spawnedIdx].time - this.leadTime <= audioTime
    ) {
      const bm = this.beatmap[this.spawnedIdx++];
      this.spawnNote(bm.time, bm.lane, bm.type);
    }

    // Update notes
    const toRemove: any[] = [];
    for (const note of this.notes) {
      const noteProgress = Math.max(0, Math.min(1, (audioTime - note.spawnTime) / this.travelTime));
      
      note.y = Phaser.Math.Linear(this.spawnY, this.hitLineY, noteProgress);
      note.x = Phaser.Math.Linear(this.topXs[note.lane], this.bottomXs[note.lane], noteProgress);
      
      // Scale and alpha effects based on approach
      const scale = Phaser.Math.Linear(0.4, 1.3, noteProgress);
      const alpha = noteProgress < 0.8 ? 0.9 : Phaser.Math.Linear(0.9, 1, (noteProgress - 0.8) / 0.2);
      note.setScale(scale).setAlpha(alpha);

      // Miss window
      if (noteProgress >= 1.15 && !note.hit) {
        this.recycleNote(note);
        toRemove.push(note);
        this.judgeHit("Miss", 0);
      }
    }
    
    toRemove.forEach((n) => n.destroy());
    this.notes = this.notes.filter((n) => !toRemove.includes(n));

    // Check for game end
    if (rawAudioTime >= totalTime - 1 && !this.gameEnded) {
      this.endGame();
    }
  }

  recycleNote(note: any) {
    note.setVisible(false);
    note.setActive(false);
    if (this.notePool.length < this.poolSize) {
      this.notePool.push(note);
    } else {
      note.destroy();
    }
  }

  updateTimeStats(currentTime: number, totalTime: number) {
    const ev = new CustomEvent("rhythm:stats", {
      detail: {
        currentTime,
        totalTime,
        gameEnded: this.gameEnded
      }
    });
    window.dispatchEvent(ev);
  }

  spawnNote(hitTime: number, lane: number, type?: string) {
    const spawnTime = hitTime - this.travelTime;
    
    // Get note from pool or create new one
    let note = this.notePool.pop();
    if (!note) {
      const noteTexture = type === 'hold' ? 'holdNote' : 'enhancedNote';
      note = this.add.image(0, 0, noteTexture);
    }
    
    note.setPosition(this.topXs[lane], this.spawnY);
    note.setVisible(true);
    note.setActive(true);
    
    Object.assign(note, { lane, hitTime, spawnTime, hit: false, noteType: type });
    this.notes.push(note);
  }

  convertToMissedNote(note: any) {
    const missedNote = this.add.image(this.bottomXs[note.lane], this.hitLineY + 80, "missedNote");
    missedNote.setScale(0.6).setAlpha(0.5);
    
    this.tweens.add({
      targets: missedNote,
      y: missedNote.y + 50,
      alpha: 0,
      duration: 1000,
      ease: "power2.out",
      onComplete: () => missedNote.destroy()
    });
  }

  onHitKey(lane: number) {
    if (!this.gameStarted || this.gameEnded) return;
    
    const now = (this.music.seek || 0) + this.audioOffset;
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

    // Adjust timing windows based on difficulty
    const difficultyMultiplier = this.beatmapMetadata?.difficulty_rating ? 
      Math.max(0.7, Math.min(1.3, 1 - (this.beatmapMetadata.difficulty_rating - 3) * 0.1)) : 1;
    
    const windows = { 
      perfect: 0.08 * difficultyMultiplier, 
      great: 0.15 * difficultyMultiplier, 
      good: 0.25 * difficultyMultiplier 
    };
    
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
      
      // Combo bonus based on difficulty
      const baseComboBonus = Math.floor(this.combo / 10) * 50;
      const difficultyBonus = Math.floor((this.beatmapMetadata?.difficulty_rating || 1) * 10);
      scoreAdd += baseComboBonus + difficultyBonus;
      
      best.destroy();
      this.notes = this.notes.filter((n) => n !== best);
    } else {
      this.combo = 0;
    }

    this.score += scoreAdd;
    this.judgeHit(label, scoreAdd);
  }

  hitEffect(x: number, y: number, judgement: string) {
    // Reduce particle count
    const particleCount = judgement === "Perfect" ? 6 : 4; // Halved
    this.particles.emitParticleAt(x, y, particleCount);
    
    // Use object pooling for ring effects
    const ring = this.getPooledEffect() || this.add.circle(x, y, 30);
    ring.setPosition(x, y);
    ring.setScale(0.3);
    ring.setAlpha(0.6);
    
    const effectColor = {
      Perfect: 0x10b981,
      Great: 0x3b82f6,
      Good: 0xf59e0b,
      Miss: 0xef4444
    }[judgement] || 0x60a5fa;
    
    ring.setFillStyle(effectColor);
    
    this.tweens.add({
      targets: ring,
      scale: 2.5,
      alpha: 0,
      duration: 500,
      ease: "power2.out",
      onComplete: () => this.recycleEffect(ring)
    });

    // Remove screen flash for performance
    // Only keep for perfect hits if absolutely necessary
  }

  judgeHit(label: string, scoreAdd: number) {
    this.updateStatsThrottled();

    const colors = {
      Perfect: "#10b981",
      Great: "#3b82f6", 
      Good: "#f59e0b",
      Miss: "#ef4444"
    };
    
    const txt = this.add.text(385, this.hitLineY - 50, label, {
      fontFamily: "Arial",
      fontSize: "24px",
      color: colors[label as keyof typeof colors],
      fontStyle: "bold"
    }).setOrigin(0.5);

    // Score popup for non-miss hits
    if (label !== "Miss" && scoreAdd > 0) {
      const scoreTxt = this.add.text(385, this.hitLineY - 80, `+${scoreAdd}`, {
        fontFamily: "Arial",
        fontSize: "16px",
        color: colors[label as keyof typeof colors],
      }).setOrigin(0.5);

      this.tweens.add({
        targets: scoreTxt,
        y: scoreTxt.y - 30,
        alpha: 0,
        duration: 800,
        ease: "power2.out",
        onComplete: () => scoreTxt.destroy()
      });
    }

    this.tweens.add({
      targets: txt,
      y: txt.y - 40,
      alpha: 0,
      scale: { from: 1, to: 1.3 },
      duration: 700,
      ease: "power2.out",
      onComplete: () => txt.destroy()
    });
  }

  updateStats() {
    const totalHits = Object.values(this.hitCounts).reduce((a, b) => a + b, 0);
    const accuracy = totalHits > 0 ? 
      Math.round(((this.hitCounts.perfect + this.hitCounts.great + this.hitCounts.good) / totalHits) * 100) : 100;
    
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
        judgement: "" // Reset after update
      }
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
    if (this.music.stop) {
      this.music.stop();
    }
    this.updateStatsThrottled();
    
    const ev = new CustomEvent("rhythm:gameend", {
      detail: {
        finalScore: this.score,
        maxCombo: this.maxCombo,
        accuracy: this.calculateAccuracy(),
        perfectHits: this.hitCounts.perfect,
        greatHits: this.hitCounts.great,
        goodHits: this.hitCounts.good,
        misses: this.hitCounts.miss,
        beatmapInfo: this.beatmapMetadata
      }
    });
    window.dispatchEvent(ev);
  }

  calculateAccuracy() {
    const total = Object.values(this.hitCounts).reduce((a, b) => a + b, 0);
    if (total === 0) return 100;
    return Math.round(((this.hitCounts.perfect + this.hitCounts.great + this.hitCounts.good) / total) * 100);
  }

  restartGame() {
    this.gameEnded = false;
    this.gameStarted = false;
    this.spawnedIdx = 0;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.hitCounts = { perfect: 0, great: 0, good: 0, miss: 0 };
    
    this.notes.forEach(note => note.destroy());
    this.notes = [];
    
    this.missedNotes.forEach(note => note.destroy());
    this.missedNotes = [];
    
    this.updateStatsThrottled();
    
    // Restart audio
    if (this.music && this.music.stop) {
      this.music.stop();
    }
  }
}

export default function EnhancedOsuRhythmGame({ 
  beatmapId = "131891", 
  onBackToMenu 
}: { 
  beatmapId?: string;
  onBackToMenu?: () => void;
}) {
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
      scene: [OsuRhythmScene],
      physics: {
        default: false // Disable physics entirely
      },
      render: {
        antialias: false, // Disable antialiasing for performance
        pixelArt: false,
        roundPixels: true // Helps with performance
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      fps: {
        target: 60,
        forceSetTimeOut: true
      }
    };

    const game = new Phaser.Game(config);
    setGameInstance(game);
    
    // Initialize the scene with beatmap data
    game.events.once('ready', () => {
      const scene = game.scene.getScene('OsuRhythmScene') as OsuRhythmScene;
      scene.init({ beatmapId }).then(() => {
        setGameReady(true);
      });
    });

    return () => {
      setGameReady(false);
      game.destroy(true);
    };
  }, [beatmapId]);

  const accuracy = useMemo(() => {
    const total = stats.perfectHits + stats.greatHits + stats.goodHits + stats.misses;
    if (total === 0) return 100;
    return Math.round(((stats.perfectHits + stats.greatHits + stats.goodHits) / total) * 100);
  }, [stats]);

  const progress = useMemo(() => {
    if (stats.totalTime <= 0) return 0;
    return Math.min((stats.currentTime / stats.totalTime) * 100, 100);
  }, [stats.currentTime, stats.totalTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getComboColor = (combo: number) => {
    if (combo >= 100) return "text-purple-600";
    if (combo >= 50) return "text-indigo-600";
    if (combo >= 25) return "text-blue-600";
    if (combo >= 10) return "text-green-600";
    return "text-slate-600";
  };

  const getAccuracyColor = (acc: number) => {
    if (acc >= 98) return "text-emerald-600";
    if (acc >= 95) return "text-green-600";
    if (acc >= 90) return "text-yellow-600";
    if (acc >= 80) return "text-orange-600";
    return "text-red-600";
  };

  const handlePlayAgain = () => {
    if (gameInstance) {
      const scene = gameInstance.scene.getScene('OsuRhythmScene') as OsuRhythmScene;
      if (scene) {
        scene.restartGame();
      }
    }
  };

  const handleBackToMenu = () => {
    if (onBackToMenu) {
      onBackToMenu();
    } else {
      window.location.reload();
    }
  };

  const getRankColor = (accuracy: number, misses: number) => {
    if (accuracy === 100) return "text-yellow-500"; // SS
    if (accuracy >= 95 && misses === 0) return "text-orange-500"; // S
    if (accuracy >= 90) return "text-green-500"; // A
    if (accuracy >= 80) return "text-blue-500"; // B
    if (accuracy >= 70) return "text-purple-500"; // C
    return "text-red-500"; // D
  };

  const getRank = (accuracy: number, misses: number) => {
    if (accuracy === 100) return "SS";
    if (accuracy >= 95 && misses === 0) return "S";
    if (accuracy >= 90) return "A";
    if (accuracy >= 80) return "B"; 
    if (accuracy >= 70) return "C";
    return "D";
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl md:text-5xl font-light text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-sky-500">
          Calm Rhythm
        </h1>
        <p className="text-center text-slate-600 mb-6">
          Now playing real osu! beatmaps. Press <strong>A / S / D / F</strong> on the beat.
        </p>
      </div>

      <div className="relative w-full max-w-4xl mx-auto">
        {/* Game Canvas */}
        <div ref={containerRef} className="w-full aspect-[770/720] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50" />

        {/* HUD Overlay */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6">
          {/* Top Stats */}
          <div className="flex justify-between items-start">
            <motion.div 
              initial={{ x: -20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }}
              className="bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-white/30"
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
                className="bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-white/30"
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
                className="bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-white/30"
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
            {stats.judgement && !stats.gameEnded && (
              <motion.div
                key={stats.judgement + stats.score}
                initial={{ opacity: 0, scale: 0.7, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.3, y: -30 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 25,
                  duration: 0.5
                }}
                className="self-center mb-16"
              >
                <div className={`px-8 py-4 rounded-3xl backdrop-blur-md shadow-2xl border-2 ${
                  stats.judgement === "Perfect" ? "bg-emerald-100/90 border-emerald-300/60 text-emerald-700" :
                  stats.judgement === "Great" ? "bg-blue-100/90 border-blue-300/60 text-blue-700" :
                  stats.judgement === "Good" ? "bg-amber-100/90 border-amber-300/60 text-amber-700" :
                  "bg-red-100/90 border-red-300/60 text-red-700"
                }`}>
                  <div className="text-3xl font-bold text-center">
                    {stats.judgement}
                  </div>
                  {stats.combo > 10 && stats.judgement !== "Miss" && (
                    <div className="text-lg text-center mt-1 font-bold">
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center pointer-events-auto"
            >
              <motion.div
                initial={{ scale: 0.8, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 30 }}
                className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/50 max-w-lg w-full mx-4"
              >
                <div className="text-center">
                  <div className={`text-6xl font-bold mb-2 ${getRankColor(accuracy, stats.misses)}`}>
                    {getRank(accuracy, stats.misses)}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-1">Beatmap Complete!</h2>
                  <p className="text-slate-600 mb-6">Great performance!</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                    <div>
                      <div className="text-3xl font-bold text-blue-600">{stats.score.toLocaleString()}</div>
                      <div className="text-sm text-slate-600">Final Score</div>
                    </div>
                    <div>
                      <div className={`text-3xl font-bold ${getAccuracyColor(accuracy)}`}>{accuracy}%</div>
                      <div className="text-sm text-slate-600">Accuracy</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{stats.maxCombo}x</div>
                      <div className="text-sm text-slate-600">Max Combo</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">{stats.perfectHits}</div>
                      <div className="text-sm text-slate-600">Perfect</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-6 text-xs">
                    <div className="bg-emerald-50 p-2 rounded-lg">
                      <div className="font-bold text-emerald-600">{stats.perfectHits}</div>
                      <div className="text-emerald-700">Perfect</div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <div className="font-bold text-blue-600">{stats.greatHits}</div>
                      <div className="text-blue-700">Great</div>
                    </div>
                    <div className="bg-amber-50 p-2 rounded-lg">
                      <div className="font-bold text-amber-600">{stats.goodHits}</div>
                      <div className="text-amber-700">Good</div>
                    </div>
                    <div className="bg-red-50 p-2 rounded-lg">
                      <div className="font-bold text-red-600">{stats.misses}</div>
                      <div className="text-red-700">Miss</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handlePlayAgain}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Retry
                    </button>
                    <button
                      onClick={handleBackToMenu}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Back to Menu
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        <AnimatePresence>
          {(!gameReady || stats.loading) && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full mx-auto mb-4"
                />
                <div className="text-slate-700 font-semibold text-lg">Loading osu! Beatmap</div>
                <div className="text-slate-500 text-sm mt-2">
                  {stats.loading ? "Downloading audio and beatmap data..." : "Initializing rhythm engine..."}
                </div>
                {stats.error && (
                  <div className="text-red-600 text-sm mt-3 px-4 py-2 bg-red-50 rounded-lg">
                    Error: {stats.error}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar */}
        <div className="mt-4 bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/50">
          <div className="flex justify-between items-center mb-2 text-sm text-slate-600">
            <span>Progress</span>
            <span>{formatTime(stats.currentTime)} / {formatTime(stats.totalTime)}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 relative overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: "linear" }}
              className="h-3 rounded-full bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
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
        {(stats.perfectHits + stats.greatHits + stats.goodHits + stats.misses) > 10 && !stats.gameEnded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/50"
          >
            <h3 className="text-lg font-semibold text-slate-700 mb-3">Live Performance</h3>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <div className="text-xl font-bold text-emerald-600">{stats.perfectHits}</div>
                <div className="text-xs text-slate-600">Perfect</div>
                <div className="w-full bg-emerald-100 rounded-full h-1 mt-1">
                  <div 
                    className="bg-emerald-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${(stats.perfectHits / Math.max(1, stats.perfectHits + stats.greatHits + stats.goodHits + stats.misses)) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-blue-600">{stats.greatHits}</div>
                <div className="text-xs text-slate-600">Great</div>
                <div className="w-full bg-blue-100 rounded-full h-1 mt-1">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${(stats.greatHits / Math.max(1, stats.perfectHits + stats.greatHits + stats.goodHits + stats.misses)) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-600">{stats.goodHits}</div>
                <div className="text-xs text-slate-600">Good</div>
                <div className="w-full bg-amber-100 rounded-full h-1 mt-1">
                  <div 
                    className="bg-amber-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${(stats.goodHits / Math.max(1, stats.perfectHits + stats.greatHits + stats.goodHits + stats.misses)) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-red-600">{stats.misses}</div>
                <div className="text-xs text-slate-600">Miss</div>
                <div className="w-full bg-red-100 rounded-full h-1 mt-1">
                  <div 
                    className="bg-red-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${(stats.misses / Math.max(1, stats.perfectHits + stats.greatHits + stats.goodHits + stats.misses)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Controls */}
        <div className="mt-4 flex gap-3 justify-center">
          <button
            onClick={handleBackToMenu}
            className="bg-gradient-to-r from-slate-500 to-slate-600 text-white font-medium py-2 px-6 rounded-xl hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm pointer-events-auto"
          >
            Back to Menu
          </button>
          
          {stats.gameEnded && (
            <button
              onClick={handlePlayAgain}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium py-2 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm pointer-events-auto"
            >
              Play Again
            </button>
          )}
        </div>

        {/* Beatmap Info */}
        <div className="mt-4 bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/50">
          <div className="text-center">
            <div className="text-sm text-slate-500 mb-1">Currently Playing</div>
            <div className="font-bold text-slate-700">Beatmap ID: {beatmapId}</div>
            <div className="text-xs text-slate-500 mt-1">
              Real osu! beatmap with authentic timing and patterns
            </div>
          </div>
        </div>
      </div>

      <footer className="text-xs text-slate-400 mt-6 text-center">
        <div>osu! Integration Demo - Real beatmaps and audio</div>
        <div className="mt-1">Click or press any key to start • Headphones recommended 🎧</div>
      </footer>
    </div>
  );
}
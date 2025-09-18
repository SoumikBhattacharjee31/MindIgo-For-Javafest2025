import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Phaser from "phaser";
import { ArrowLeft, Play, Pause, Square, Volume2, VolumeX, Music } from "lucide-react";

// Song configurations
// NOTE: put your actual audio files in /public/songs/<id>.mp3 or .ogg
const SONG_LIBRARY = [
  { id: 'music1', title: 'MUSIC PIANOS', artist: 'NCPRIME', bpm: 90, duration: 120, difficulty: 'Easy', color: 'from-blue-400 to-cyan-500' },
  { id: 'music2', title: 'Background Music', artist: 'oOsongOo', bpm: 105, duration: 150, difficulty: 'Medium', color: 'from-green-400 to-emerald-500' },
  { id: 'music3', title: 'Violin Music', artist: 'freesound_community', bpm: 120, duration: 180, difficulty: 'Hard', color: 'from-purple-400 to-pink-500' },
  { id: 'music4', title: 'Gentle Rain', artist: 'XtremeFreddy', bpm: 75, duration: 90, difficulty: 'Easy', color: 'from-gray-400 to-slate-500' }
];

function useRhythmStats() {
  const [stats, setStats] = useState({ score: 0, combo: 0, accuracy: 100, judgement: "", maxCombo: 0, perfectHits: 0, greatHits: 0, goodHits: 0, misses: 0, gameEnded: false, currentTime: 0, totalTime: 0 });
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
        for (let i = 0; i < 4; i++) map.push({ time: t + beat * i, lane: i });
        break;
      case 2:
        map.push({ time: t, lane: 0 });
        map.push({ time: t, lane: 2 });
        map.push({ time: t + beat * 2, lane: 1 });
        map.push({ time: t + beat * 2, lane: 3 });
        break;
      case 3:
        for (let i = 0; i < 4; i++) map.push({ time: t + beat * 0.5 * i, lane: 1 });
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
  music!: Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound | any;
  spawnedIdx = 0;
  hitLineY = 450; // MODIFIED: Adjusted hit line Y-position for the new smaller height
  spawnY = -120;
  bottomXs = [220, 330, 440, 550];
  topXs = [290, 355, 415, 480];
  travelTime = 2.2;
  leadTime = this.travelTime + 0.2;
  beatmap: { time: number; lane: number; type?: string }[] = [];
  notes: any[] = [];
  particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  paused = false;
  hitKeys = ["A", "S", "D", "F"];
  gameEnded = false;
  gameStopped = false;
  score = 0;
  combo = 0;
  maxCombo = 0;
  hitCounts = { perfect: 0, great: 0, good: 0, miss: 0 };
  laneGlows: Phaser.GameObjects.Image[] = [];
  backgroundElements: Phaser.GameObjects.GameObject[] = [];
  gameStarted = false;
  currentSong: any = null;
  volume = 0.7;

  constructor() {
    super("EnhancedRhythmScene");
  }

  init(data: any) {
    this.currentSong = data.song || SONG_LIBRARY[0];
    this.volume = data.volume ?? 0.7;
    this.beatmap = generateMockBeatmap(this.currentSong.bpm, this.currentSong.duration);
  }

  preload() {
    this.load.image("note", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==");
    const audioPaths = [
      `/songs/${this.currentSong.id}.mp3`,
      `/songs/${this.currentSong.id}.ogg`,
    ];
    this.load.audio('track', audioPaths);
  }

  createTextures() {
    const noteSize = 32;
    const g = this.add.graphics();
    g.fillStyle(0x60a5fa, 0.8);
    g.fillCircle(noteSize, noteSize, noteSize);
    g.fillStyle(0x93c5fd, 0.9);
    g.fillCircle(noteSize, noteSize, noteSize * 0.6);
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(noteSize, noteSize, noteSize * 0.3);
    g.generateTexture("enhancedNote", noteSize * 2, noteSize * 2);
    g.clear();
    g.fillStyle(0xff6b6b, 0.8);
    g.fillCircle(noteSize, noteSize, noteSize);
    g.fillStyle(0xff8a8a, 0.7);
    g.fillCircle(noteSize, noteSize, noteSize * 0.6);
    g.generateTexture("missedNote", noteSize * 2, noteSize * 2);
    g.clear();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture("spark", 8, 8);
    g.destroy();
  }

  create() {
    this.cameras.main.setBackgroundColor("#f8fbff");
    this.createTextures();
    this.addBackground();
    this.drawRunway();
    this.setupParticles();
    this.setupControls();
    this.drawHUD();
    this.addInstructions();
    this.createAudioFromLoaded();

    window.addEventListener("rhythm:volume", (e: any) => {
      this.setVolume(e.detail.volume);
    });

    window.addEventListener("rhythm:control", (e: any) => {
      const { action } = e.detail;
      if (action === 'pause') this.togglePause();
      if (action === 'resume') this.togglePause();
      if (action === 'stop') this.stopGame();
      if (action === 'play' && !this.gameStarted) this.startGame();
    });
  }

  setVolume(volume: number) {
    this.volume = volume;
    if (this.music && this.music.setVolume) this.music.setVolume(volume);
  }

  createAudioFromLoaded() {
    try {
      if (this.sound && this.cache.audio.exists('track')) {
        this.music = this.sound.add('track', { volume: this.volume, loop: false });
        this.music.on('complete', this.endGame, this);
      } else {
        throw new Error("Audio track not found in cache.");
      }
    } catch (e) {
      console.warn('Phaser audio failed to load, game may not function correctly.', e);
      (this as any).music = {
        seek: 0,
        totalDuration: this.currentSong?.duration || 120,
        isPlaying: false,
        play: () => { console.warn("Mock audio play called."); (this as any).music.isPlaying = true; },
        pause: () => { (this as any).music.isPlaying = false; },
        resume: () => { (this as any).music.isPlaying = true; },
        stop: () => { (this as any).music.isPlaying = false; },
        setVolume: () => {},
        on: () => {},
      };
    }
  }

  addBackground() {
    // MODIFIED: Adjusted background rectangle to fit new 600px height
    const bg = this.add.rectangle(385, 300, 770, 600, 0xf8fbff);
    for (let i = 0; i < 18; i++) {
      // MODIFIED: Adjusted particle spawn range to fit new 600px height
      const particle = this.add.circle(Phaser.Math.Between(0, 770), Phaser.Math.Between(0, 600), Phaser.Math.Between(2, 6), 0x93c5fd, Phaser.Math.FloatBetween(0.08, 0.28));
      this.tweens.add({ targets: particle, y: particle.y - Phaser.Math.Between(40, 80), alpha: { from: particle.alpha, to: 0 }, duration: Phaser.Math.Between(3500, 6500), repeat: -1, yoyo: true, delay: Phaser.Math.Between(0, 2000) });
    }
  }

  drawRunway() {
    const g = this.add.graphics();
    for (let i = 0; i < 4; i++) {
      const top = this.topXs[i];
      const bot = this.bottomXs[i];
      g.fillStyle(0xeef6ff, 0.32);
      const poly = new Phaser.Geom.Polygon([top - 30, this.spawnY, top + 30, this.spawnY, bot + 50, this.hitLineY + 60, bot - 50, this.hitLineY + 60]);
      g.fillPoints(poly.points, true);
      const glow = this.add.image(bot, this.hitLineY, "enhancedNote");
      glow.setScale(1.5, 0.2).setAlpha(0.12);
      this.laneGlows[i] = glow;
      g.lineStyle(2, 0x93c5fd, 0.45);
      g.beginPath();
      g.moveTo(top - 30, this.spawnY);
      g.lineTo(bot - 50, this.hitLineY + 60);
      g.moveTo(top + 30, this.spawnY);
      g.lineTo(bot + 50, this.hitLineY + 60);
      g.strokePath();
    }
  }

  drawHUD() {
    const hitLineGfx = this.add.graphics();
    hitLineGfx.lineStyle(3, 0x60a5fa, 0.85);
    hitLineGfx.beginPath();
    hitLineGfx.moveTo(150, this.hitLineY);
    hitLineGfx.lineTo(620, this.hitLineY);
    hitLineGfx.strokePath();

    for (let i = 0; i < 4; i++) {
      const marker = this.add.circle(this.bottomXs[i], this.hitLineY, 20, 0x93c5fd, 0.28);
      marker.setStrokeStyle(2, 0x60a5fa, 0.6);
      this.add.text(this.bottomXs[i], this.hitLineY + 40, this.hitKeys[i], { fontFamily: "Arial", fontSize: "14px", color: "#64748b" }).setOrigin(0.5);
    }
  }

  setupParticles() { this.particles = this.add.particles(0, 0, "spark", { speed: { min: 20, max: 60 }, lifespan: 600, quantity: 0, alpha: { start: 1, end: 0 }, scale: { start: 0.6, end: 0.1 }, }); }

  addInstructions() {
    const songTitle = this.currentSong?.title || 'Demo Song';
    const instructions = this.add.text(385, 120, `♪ ${songTitle} ♪\nA S D F to play along\nP to pause • Click to start`, { fontFamily: "Arial", fontSize: "16px", color: "#64748b", align: "center" }).setOrigin(0.5).setAlpha(0.75);
    this.tweens.add({ targets: instructions, y: instructions.y + 6, alpha: { from: 0.75, to: 0.4 }, duration: 2000, yoyo: true, repeat: -1, ease: "sine.inOut" });
  }

  setupControls() {
    this.input.keyboard?.on("keydown-P", () => this.togglePause());
    this.input.keyboard?.on("keydown", (ev: KeyboardEvent) => {
      if (this.gameEnded || this.gameStopped) return;
      const i = this.hitKeys.indexOf(ev.key.toUpperCase());
      if (i !== -1) { this.onHitKey(i); this.triggerLanePress(i); }
    });
    this.input.once("pointerdown", () => this.startGame());
    this.input.keyboard?.once("keydown", () => this.startGame());
  }

  startGame() {
    if (this.gameStarted || this.gameStopped) return;
    if (this.music) {
      try {
        this.music.play();
        this.gameStarted = true;
      } catch (e) {
        console.error("Failed to play music:", e);
      }
    }
  }

  stopGame() {
    if (this.gameStopped) return;
    this.gameStopped = true;
    this.gameEnded = true;
    try { if (this.music && this.music.stop) this.music.stop(); } catch (e) {}
    const ev = new CustomEvent("rhythm:stopped", { detail: { finalScore: this.score, maxCombo: this.maxCombo, accuracy: this.calculateAccuracy(), perfectHits: this.hitCounts.perfect, greatHits: this.hitCounts.great, goodHits: this.hitCounts.good, misses: this.hitCounts.miss } });
    window.dispatchEvent(ev);
  }

  triggerLanePress(lane: number) {
    if (this.laneGlows[lane]) {
      this.laneGlows[lane].setAlpha(0.6);
      this.tweens.add({ targets: this.laneGlows[lane], alpha: 0.12, duration: 150, ease: "power2.out" });
    }
  }

  update() {
    if (!this.gameStarted || this.gameEnded || this.gameStopped || !this.music) return;

    const audioTime = this.music.seek;
    const totalTime = this.music.totalDuration;
    this.updateTimeStats(audioTime, totalTime);

    while (this.spawnedIdx < this.beatmap.length && this.beatmap[this.spawnedIdx].time - this.leadTime <= audioTime) {
      const bm = this.beatmap[this.spawnedIdx++];
      this.spawnNote(bm.time, bm.lane);
    }

    const toRemove: any[] = [];
    for (const note of this.notes) {
      const t = (audioTime - note.spawnTime) / this.travelTime;

      note.y = Phaser.Math.Linear(this.spawnY, this.hitLineY, t);
      note.x = Phaser.Math.Linear(this.topXs[note.lane], this.bottomXs[note.lane], t);
      
      if (t <= 1) {
          const scale = Phaser.Math.Linear(0.5, 1.2, t);
          note.setScale(scale);
      }

      if (t > 1.15 && !note.hit && !note.missed) {
        note.missed = true;
        note.setTexture("missedNote");
        this.hitCounts.miss++;
        this.combo = 0;
        this.judgeHit("Miss", 0);
      }

      if (note.y > this.cameras.main.height + 100) {
        toRemove.push(note);
      }
    }

    if (toRemove.length > 0) {
        toRemove.forEach((n) => n.destroy());
        this.notes = this.notes.filter((n) => !toRemove.includes(n));
    }

    if (audioTime >= totalTime - 0.1 && !this.gameEnded) this.endGame();
  }

  updateTimeStats(currentTime: number, totalTime: number) {
    const ev = new CustomEvent("rhythm:stats", { detail: { score: this.score, combo: this.combo, maxCombo: this.maxCombo, accuracy: this.calculateAccuracy(), perfectHits: this.hitCounts.perfect, greatHits: this.hitCounts.great, goodHits: this.hitCounts.good, misses: this.hitCounts.miss, currentTime, totalTime, gameEnded: this.gameEnded } });
    window.dispatchEvent(ev);
  }

  spawnNote(hitTime: number, lane: number) {
    const spawnTime = hitTime - this.travelTime;
    const note = this.add.image(this.topXs[lane], this.spawnY, "enhancedNote");
    Object.assign(note, { lane, hitTime, spawnTime, hit: false, missed: false });
    this.notes.push(note);
  }

  onHitKey(lane: number) {
    if (!this.gameStarted || this.gameEnded || this.gameStopped) return;
    const now = this.music.seek;
    let best: any = null;
    let bestDt = 999;
    
    for (const n of this.notes) { 
      if (n.lane !== lane || n.hit || n.missed) continue; 
      const dt = Math.abs(n.hitTime - now); 
      if (dt < bestDt) { bestDt = dt; best = n; } 
    }
    
    if (!best) return;
    
    const windows = { perfect: 0.08, great: 0.15, good: 0.25 };
    let scoreAdd = 0; let label = "";
    
    if (bestDt <= windows.perfect) { scoreAdd = 1000; label = "Perfect"; this.hitCounts.perfect++; }
    else if (bestDt <= windows.great) { scoreAdd = 650; label = "Great"; this.hitCounts.great++; }
    else if (bestDt <= windows.good) { scoreAdd = 300; label = "Good"; this.hitCounts.good++; }
    else { label = "Miss"; this.hitCounts.miss++; }

    if (label !== "Miss") {
      best.hit = true; 
      this.hitEffect(best.x, this.hitLineY, label);
      this.combo++; this.maxCombo = Math.max(this.maxCombo, this.combo);
      const comboBonus = Math.floor(this.combo / 10) * 50; scoreAdd += comboBonus;
      best.destroy(); 
      this.notes = this.notes.filter((n) => n !== best);
    } else { 
      best.missed = true;
      best.setTexture("missedNote");
      this.combo = 0; 
    }
    
    this.score += scoreAdd; 
    this.judgeHit(label, scoreAdd);
  }

  hitEffect(x: number, y: number, judgement: string) {
    this.particles.emitParticleAt(x, y, 8);
    const ringColor = judgement === "Perfect" ? 0x10b981 : 0x60a5fa;
    const ring = this.add.circle(x, y, 25, ringColor, 0.5);
    this.tweens.add({ targets: ring, scale: { from: 0.5, to: 2 }, alpha: 0, duration: 400, ease: "power2.out", onComplete: () => ring.destroy() });
  }

  judgeHit(label: string, scoreAdd: number) {
    this.updateStats();
    const colors = { Perfect: "#10b981", Great: "#3b82f6", Good: "#f59e0b", Miss: "#ef4444" };
    const txt = this.add.text(385, this.hitLineY - 40, label, { fontFamily: "Arial", fontSize: "20px", color: colors[label as keyof typeof colors] }).setOrigin(0.5);
    this.tweens.add({ targets: txt, y: txt.y - 30, alpha: 0, scale: { from: 1, to: 1.2 }, duration: 600, ease: "power2.out", onComplete: () => txt.destroy() });
  }

  updateStats() {
    const totalHits = Object.values(this.hitCounts).reduce((a, b) => a + b, 0);
    const accuracy = totalHits > 0 ? Math.round(((this.hitCounts.perfect + this.hitCounts.great + this.hitCounts.good) / totalHits) * 100) : 100;
    const ev = new CustomEvent("rhythm:stats", { detail: { score: this.score, combo: this.combo, maxCombo: this.maxCombo, accuracy, perfectHits: this.hitCounts.perfect, greatHits: this.hitCounts.great, goodHits: this.hitCounts.good, misses: this.hitCounts.miss, gameEnded: this.gameEnded } });
    window.dispatchEvent(ev);
  }

  togglePause() {
    if (!this.gameStarted || this.gameEnded || this.gameStopped) return;
    this.paused = !this.paused;
    if (this.paused) {
        if (this.music.pause) this.music.pause();
        this.scene.pause();
    } else {
        if (this.music.resume) this.music.resume();
        this.scene.resume();
    }
  }

  endGame() {
    if (this.gameEnded) return;
    this.gameEnded = true;
    this.updateStats();
    const ev = new CustomEvent("rhythm:gameend", { detail: { finalScore: this.score, maxCombo: this.maxCombo, accuracy: this.calculateAccuracy(), perfectHits: this.hitCounts.perfect, greatHits: this.hitCounts.great, goodHits: this.hitCounts.good, misses: this.hitCounts.miss } });
    window.dispatchEvent(ev);
  }

  calculateAccuracy() { const total = Object.values(this.hitCounts).reduce((a, b) => a + b, 0); if (total === 0) return 100; return Math.round(((this.hitCounts.perfect + this.hitCounts.great + this.hitCounts.good) / total) * 100); }

  restartGame() {
    this.gameEnded = false; this.gameStarted = false; this.gameStopped = false; this.spawnedIdx = 0; this.score = 0; this.combo = 0; this.maxCombo = 0; this.hitCounts = { perfect: 0, great: 0, good: 0, miss: 0 };
    this.notes.forEach((note) => note.destroy()); this.notes = [];
    this.updateStats();
    try { if (this.music && this.music.stop) this.music.stop(); } catch (e) {}
    this.createAudioFromLoaded(); // Re-create the sound object for playback
  }
}

function MainMenu({ onSongSelect, onBackToGames }: { onSongSelect: (song: any) => void, onBackToGames: () => void }) {
  const [selectedSong, setSelectedSong] = useState(SONG_LIBRARY[0]);
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <motion.h1 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-5xl font-light mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-sky-500">Calm Rhythm</motion.h1>
        <motion.p initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-slate-600 text-lg">Choose your song and find your rhythm</motion.p>
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/50 mb-6">
        <h2 className="text-2xl font-semibold text-slate-800 mb-6 flex items-center gap-3"><Music className="w-6 h-6 text-indigo-500"/> Song Library</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {SONG_LIBRARY.map((song) => (
            <motion.button key={song.id} onClick={() => setSelectedSong(song)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${selectedSong.id === song.id ? `border-indigo-400 bg-gradient-to-r ${song.color} text-white shadow-lg` : 'border-slate-200 bg-white/50 hover:border-indigo-300 hover:bg-white/70'}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className={`font-semibold text-lg ${selectedSong.id === song.id ? 'text-white' : 'text-slate-800'}`}>{song.title}</h3>
                  <p className={`text-sm ${selectedSong.id === song.id ? 'text-white/80' : 'text-slate-600'}`}>{song.artist}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${selectedSong.id === song.id ? 'bg-white/20 text-white' : song.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : song.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{song.difficulty}</div>
              </div>
              <div className={`flex gap-4 text-sm ${selectedSong.id === song.id ? 'text-white/80' : 'text-slate-600'}`}>
                <span>{song.bpm} BPM</span>
                <span>{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</span>
              </div>
            </motion.button>
          ))}
        </div>

        <motion.div key={selectedSong.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Now Playing Preview</h3>
          <div className={`text-2xl font-bold bg-gradient-to-r ${selectedSong.color} bg-clip-text text-transparent mb-2`}>{selectedSong.title}</div>
          <p className="text-slate-600 mb-4">{selectedSong.artist}</p>
          <div className="flex gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-400 rounded-full"></div><span>BPM: {selectedSong.bpm}</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-sky-400 rounded-full"></div><span>Duration: {Math.floor(selectedSong.duration / 60)}:{(selectedSong.duration % 60).toString().padStart(2, '0')}</span></div>
            <div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${selectedSong.difficulty === 'Easy' ? 'bg-green-400' : selectedSong.difficulty === 'Medium' ? 'bg-yellow-400' : 'bg-red-400'}`}></div><span>Difficulty: {selectedSong.difficulty}</span></div>
          </div>
        </motion.div>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex gap-4 justify-center">
        <button onClick={onBackToGames} className="flex items-center gap-3 bg-gradient-to-r from-slate-500 to-slate-600 text-white font-semibold py-3 px-8 rounded-xl hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"><ArrowLeft className="w-5 h-5"/> Back to Games</button>
        <button onClick={() => onSongSelect(selectedSong)} className={`flex items-center gap-3 bg-gradient-to-r ${selectedSong.color} text-white font-semibold py-3 px-8 rounded-xl hover:shadow-xl transition-all duration-200 transform hover:scale-105 shadow-lg`}><Play className="w-5 h-5"/> Start Playing</button>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 text-center"><p className="text-slate-500 text-sm">Use <kbd className="bg-slate-200 px-2 py-1 rounded text-slate-700 font-mono">A</kbd> <kbd className="bg-slate-200 px-2 py-1 rounded text-slate-700 font-mono mx-1">S</kbd> <kbd className="bg-slate-200 px-2 py-1 rounded text-slate-700 font-mono">D</kbd> <kbd className="bg-slate-200 px-2 py-1 rounded text-slate-700 font-mono mx-1">F</kbd> keys to play • <kbd className="bg-slate-200 px-2 py-1 rounded text-slate-700 font-mono">P</kbd> to pause</p></motion.div>
    </motion.div>
  );
}

function GameInterface({ selectedSong, onBackToMenu, onBackToGames }: { selectedSong: any, onBackToMenu: () => void, onBackToGames: () => void }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [gameReady, setGameReady] = useState(false);
  const [gameInstance, setGameInstance] = useState<Phaser.Game | null>(null);
  const [volume, setVolume] = useState(0.7);
  const [isPaused, setIsPaused] = useState(false);
  const [gameState, setGameState] = useState<'playing' | 'stopped' | 'ended'>('playing');
  const stats = useRhythmStats();

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 770,
      height: 600, // MODIFIED: Changed height from 720 to 600
      parent: container,
      backgroundColor: "#f8fbff",
      scene: [EnhancedRhythmScene],
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
    };

    const game = new Phaser.Game(config);
    setGameInstance(game);
    setGameReady(true);
    game.scene.start('EnhancedRhythmScene', { song: selectedSong, volume });

    const handleGameEnd = () => setGameState('ended');
    const handleGameStop = () => setGameState('stopped');
    window.addEventListener('rhythm:gameend', handleGameEnd);
    window.addEventListener('rhythm:stopped', handleGameStop);

    return () => {
      setGameReady(false);
      window.removeEventListener('rhythm:gameend', handleGameEnd);
      window.removeEventListener('rhythm:stopped', handleGameStop);
      game.destroy(true);
    };
  }, [selectedSong]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    const event = new CustomEvent('rhythm:volume', { detail: { volume: newVolume } });
    window.dispatchEvent(event);
  }, []);

  const handleGameControl = useCallback((action: string) => {
    if (action === 'pause') {
      const scene = gameInstance?.scene.getScene("EnhancedRhythmScene") as EnhancedRhythmScene;
      if (scene) {
          scene.togglePause();
          setIsPaused(current => !current);
      }
    }

    if (action === 'stop') {
      const ev = new CustomEvent('rhythm:control', { detail: { action: 'stop' } });
      window.dispatchEvent(ev);
    }
  }, [gameInstance]);

  const handlePlayAgain = useCallback(() => {
    if (gameInstance) {
      const scene = gameInstance.scene.getScene("EnhancedRhythmScene") as EnhancedRhythmScene;
      if (scene) {
        scene.restartGame();
        setGameState('playing');
        setIsPaused(false);
      }
    }
  }, [gameInstance]);

  const handleBackToMenu = () => {
    const ev = new CustomEvent('rhythm:control', { detail: { action: 'stop' } });
    window.dispatchEvent(ev);
    onBackToMenu();
  };

  const accuracy = useMemo(() => {
    const total = stats.perfectHits + stats.greatHits + stats.goodHits + stats.misses; if (total === 0) return 100; return Math.round(((stats.perfectHits + stats.greatHits + stats.goodHits) / total) * 100);
  }, [stats]);

  const progress = useMemo(() => { if (stats.totalTime <= 0) return 0; return Math.min((stats.currentTime / stats.totalTime) * 100, 100); }, [stats.currentTime, stats.totalTime]);
  const formatTime = (seconds: number) => { const mins = Math.floor(seconds / 60); const secs = Math.floor(seconds % 60); return `${mins}:${secs.toString().padStart(2, "0")}`; };
  const getComboColor = (combo: number) => combo >= 50 ? "text-purple-600" : combo >= 25 ? "text-indigo-600" : combo >= 10 ? "text-blue-600" : "text-slate-600";
  const getAccuracyColor = (acc: number) => acc >= 95 ? "text-emerald-600" : acc >= 85 ? "text-green-600" : acc >= 75 ? "text-yellow-600" : "text-red-600";

  return (
    <div className="w-full max-w-5xl mx-auto">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-6 flex items-center justify-between bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/50">
        <div className="flex items-center gap-4">
          <button onClick={handleBackToMenu} className="flex items-center gap-2 bg-gradient-to-r from-slate-500 to-slate-600 text-white font-medium py-2 px-4 rounded-xl hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"><ArrowLeft className="w-4 h-4"/> Menu</button>
          <button onClick={onBackToGames} className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-medium py-2 px-4 rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"><ArrowLeft className="w-4 h-4"/> Games</button>
        </div>

        <div className={`text-center px-4 py-2 rounded-xl bg-gradient-to-r ${selectedSong.color} text-white shadow-md`}>
          <div className="font-semibold">{selectedSong.title}</div>
          <div className="text-sm opacity-90">{selectedSong.artist}</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/50 rounded-xl px-3 py-2">
            {volume === 0 ? <VolumeX className="w-4 h-4 text-slate-600" /> : <Volume2 className="w-4 h-4 text-slate-600" />}
            <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => handleVolumeChange(parseFloat(e.target.value))} className="w-28 accent-indigo-500" />
            <span className="text-xs text-slate-600 w-8">{Math.round(volume * 100)}</span>
          </div>

          <div className="flex gap-2">
            {gameState === 'playing' && (
              <button onClick={() => handleGameControl('pause')} className="flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"><Pause className="w-4 h-4"/>{isPaused ? 'Resume' : 'Pause'}</button>
            )}
            <button onClick={() => handleGameControl('stop')} className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-sm"><Square className="w-4 h-4"/> Stop</button>
          </div>
        </div>
      </motion.div>

      <div className="relative max-h-[85vh]">
        {/* MODIFIED: Changed aspect ratio to match new 770x600 dimensions */}
        <div ref={containerRef} style={{ width: '100%', aspectRatio: '770/600' }} className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50" />

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6">
          <div className="flex justify-between items-start">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-white/70 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg">
              <div className="text-slate-600 text-sm font-medium">Score</div>
              <motion.div key={stats.score} initial={{ scale: 1.1 }} animate={{ scale: 1 }} className="text-2xl font-bold text-slate-800">{stats.score.toLocaleString()}</motion.div>
            </motion.div>

            <div className="flex gap-3">
              <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white/70 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg">
                <div className="text-slate-600 text-sm font-medium">Combo</div>
                <motion.div key={stats.combo} initial={{ scale: stats.combo > 0 ? 1.2 : 1 }} animate={{ scale: 1 }} className={`text-2xl font-bold ${getComboColor(stats.combo)}`}>{stats.combo}x</motion.div>
                {stats.maxCombo > 0 && (<div className="text-xs text-slate-500">Max: {stats.maxCombo}x</div>)}
              </motion.div>

              <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-white/70 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg">
                <div className="text-slate-600 text-sm font-medium">Accuracy</div>
                <div className={`text-2xl font-bold ${getAccuracyColor(accuracy)}`}>{accuracy}%</div>
                <div className="text-xs text-slate-500 grid grid-cols-2 gap-1 mt-1"><span>P: {stats.perfectHits}</span><span>G: {stats.greatHits}</span><span>OK: {stats.goodHits}</span><span>X: {stats.misses}</span></div>
              </motion.div>
            </div>
          </div>

          <AnimatePresence mode="wait">{stats.judgement && gameState === 'playing' && (
            <motion.div key={stats.judgement + stats.score} initial={{ opacity: 0, scale: 0.8, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 1.2, y: -20 }} transition={{ type: "spring", stiffness: 200, damping: 20, duration: 0.6 }} className="self-center mb-12">
              <div className={`px-6 py-3 rounded-3xl backdrop-blur-md shadow-xl border-2 ${stats.judgement === "Perfect" ? "bg-emerald-100/80 border-emerald-300/50 text-emerald-700" : stats.judgement === "Great" ? "bg-blue-100/80 border-blue-300/50 text-blue-700" : stats.judgement === "Good" ? "bg-amber-100/80 border-amber-300/50 text-amber-700" : "bg-red-100/80 border-red-300/50 text-red-700"}`}>
                <div className="text-2xl font-bold text-center">{stats.judgement}</div>
                {stats.combo > 5 && stats.judgement !== "Miss" && (<div className="text-sm text-center mt-1 font-medium">{stats.combo}x Combo!</div>)}
              </div>
            </motion.div>
          )}</AnimatePresence>
        </div>

        <AnimatePresence>{(gameState === 'ended' || gameState === 'stopped') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
            <motion.div initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, y: 20 }} className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/50 max-w-md w-full mx-4">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">{gameState === 'ended' ? 'Song Complete!' : 'Game Stopped'}</h2>
                <p className="text-slate-600 mb-6">{gameState === 'ended' ? 'Thanks for playing!' : 'Game session ended'}</p>

                <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                  <div><div className="text-2xl font-bold text-blue-600">{stats.score.toLocaleString()}</div><div className="text-sm text-slate-600">Final Score</div></div>
                  <div><div className={`text-2xl font-bold ${getAccuracyColor(accuracy)}`}>{accuracy}%</div><div className="text-sm text-slate-600">Accuracy</div></div>
                  <div><div className="text-2xl font-bold text-purple-600">{stats.maxCombo}x</div><div className="text-sm text-slate-600">Max Combo</div></div>
                  <div><div className="text-2xl font-bold text-emerald-600">{stats.perfectHits}</div><div className="text-sm text-slate-600">Perfect Hits</div></div>
                </div>

                <div className="flex gap-3"><button onClick={handlePlayAgain} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">Play Again</button><button onClick={handleBackToMenu} className="flex-1 bg-gradient-to-r from-slate-500 to-slate-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-slate-600 hover:to-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">Back to Menu</button></div>
              </div>
            </motion.div>
          </motion.div>
        )}</AnimatePresence>

        <AnimatePresence>{!gameReady && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl flex items-center justify-center">
            <div className="text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full mx-auto mb-4" />
              <div className="text-slate-600 font-medium">Loading Game...</div>
              <div className="text-slate-500 text-sm mt-2">Initializing {selectedSong.title}</div>
            </div>
          </motion.div>
        )}</AnimatePresence>
      </div>

      <div className="mt-4 bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/50">
        <div className="flex justify-between items-center mb-2 text-sm text-slate-600"><span>Progress</span><span>{formatTime(stats.currentTime)} / {formatTime(stats.totalTime)}</span></div>
        <div className="w-full bg-slate-200 rounded-full h-3 relative overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.1, ease: "linear" }} className={`h-3 rounded-full bg-gradient-to-r ${selectedSong.color} relative`}><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" /></motion.div></div>
        {stats.misses > 0 && (<div className="mt-2 text-xs text-red-500 flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /><span>{stats.misses} missed notes</span></div>)}
      </div>

      {stats.perfectHits + stats.greatHits + stats.goodHits + stats.misses > 5 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4 bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/50">
          <h3 className="text-lg font-semibold text-slate-700 mb-3">Performance</h3>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div><div className="text-xl font-bold text-emerald-600">{stats.perfectHits}</div><div className="text-xs text-slate-600">Perfect</div></div>
            <div><div className="text-xl font-bold text-blue-600">{stats.greatHits}</div><div className="text-xs text-slate-600">Great</div></div>
            <div><div className="text-xl font-bold text-amber-600">{stats.goodHits}</div><div className="text-xs text-slate-600">Good</div></div>
            <div><div className="text-xl font-bold text-red-600">{stats.misses}</div><div className="text-xs text-slate-600">Miss</div></div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function EnhancedRhythmGame() {
  const [currentView, setCurrentView] = useState<'menu' | 'game'>('menu');
  const [selectedSong, setSelectedSong] = useState<any>(null);

  const handleSongSelect = (song: any) => { setSelectedSong(song); setCurrentView('game'); };
  const handleBackToMenu = () => { setCurrentView('menu'); setSelectedSong(null); };
  const handleBackToGames = () => { window.location.href = '/dashboard/games'; };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {currentView === 'menu' ? (<MainMenu key="menu" onSongSelect={handleSongSelect} onBackToGames={handleBackToGames} />) : (<GameInterface key="game" selectedSong={selectedSong} onBackToMenu={handleBackToMenu} onBackToGames={handleBackToGames} />)}
      </AnimatePresence>
      <footer className="text-xs text-slate-400 mt-6">{currentView === 'menu' ? '🎵 Select a song to begin your rhythm journey' : '🎧 Headphones recommended for the best experience'}</footer>
    </div>
  );
}
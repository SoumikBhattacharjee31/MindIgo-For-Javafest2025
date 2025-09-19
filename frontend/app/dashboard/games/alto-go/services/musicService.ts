import { Scene } from "phaser";

class MusicService {
  private backgroundMusic: Phaser.Sound.BaseSound | null = null;
  private soundEffects: Map<string, Phaser.Sound.BaseSound> = new Map();
  private scene: Phaser.Scene | null = null;
  private isMusicEnabled: boolean = true;
  private isSFXEnabled: boolean = true;
  private musicVolume: number = 0.3;
  private sfxVolume: number = 0.7;

  constructor() {
    // Load settings from localStorage
    this.isMusicEnabled = localStorage.getItem("music_enabled") !== "false";
    this.isSFXEnabled = localStorage.getItem("sfx_enabled") !== "false";
    this.musicVolume = parseFloat(
      localStorage.getItem("music_volume") || "0.3"
    );
    this.sfxVolume = parseFloat(localStorage.getItem("sfx_volume") || "0.7");
  }

  setScene(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // Background Music Methods
  playBackgroundMusic(key: string = "backgroundMusic") {
    if (!this.scene || !this.isMusicEnabled) return;

    // Stop current music if playing
    this.stopBackgroundMusic();

    try {
      this.backgroundMusic = this.scene.sound.add(key, {
        loop: true,
        volume: this.musicVolume,
      });

      this.backgroundMusic.play();
    } catch (error) {
      console.warn("Failed to play background music:", error);
    }
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
      this.backgroundMusic.stop();
      this.backgroundMusic.destroy();
      this.backgroundMusic = null;
    }
  }

  pauseBackgroundMusic() {
    if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
      this.backgroundMusic.pause();
    }
  }

  resumeBackgroundMusic() {
    if (this.backgroundMusic && this.backgroundMusic.isPaused) {
      this.backgroundMusic.resume();
    }
  }

  // Sound Effects Methods
  playSFX(key: string, config?: Phaser.Types.Sound.SoundConfig) {
    if (!this.scene || !this.isSFXEnabled) return;

    try {
      const sound = this.scene.sound.add(key, {
        volume: this.sfxVolume,
        ...config,
      });
      sound.play();

      // Clean up after playing
      sound.once("complete", () => {
        sound.destroy();
      });

      return sound;
    } catch (error) {
      console.warn("Failed to play sound effect:", key, error);
    }
  }

  // Settings Methods
  setMusicEnabled(enabled: boolean) {
    this.isMusicEnabled = enabled;
    localStorage.setItem("music_enabled", enabled.toString());

    if (!enabled) {
      this.stopBackgroundMusic();
    } else if (this.backgroundMusic && !this.backgroundMusic.isPlaying) {
      this.playBackgroundMusic();
    }
  }

  setSFXEnabled(enabled: boolean) {
    this.isSFXEnabled = enabled;
    localStorage.setItem("sfx_enabled", enabled.toString());
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem("music_volume", this.musicVolume.toString());

    if (this.backgroundMusic) {
      // Corrected: Cast to 'any' to bypass the strict TypeScript type and set the volume.
      (this.backgroundMusic as any).volume = this.musicVolume;
    }
  }

  setSFXVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem("sfx_volume", this.sfxVolume.toString());
  }

  // Getters
  isMusicPlaying(): boolean {
    return this.backgroundMusic?.isPlaying || false;
  }

  getMusicEnabled(): boolean {
    return this.isMusicEnabled;
  }

  getSFXEnabled(): boolean {
    return this.isSFXEnabled;
  }

  getMusicVolume(): number {
    return this.musicVolume;
  }

  getSFXVolume(): number {
    return this.sfxVolume;
  }
}

export const musicService = new MusicService();

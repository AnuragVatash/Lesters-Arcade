'use client';

// Comprehensive Audio System for Lester's Arcade
// This file contains all audio utilities, sound effects, and music management

export interface AudioConfig {
  volume: number;
  muted: boolean;
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  voiceVolume: number;
}

export interface SoundEffect {
  name: string;
  url: string;
  volume?: number;
  loop?: boolean;
  preload?: boolean;
  category: 'sfx' | 'music' | 'voice' | 'ambient';
}

export interface AudioTrack {
  name: string;
  url: string;
  duration: number;
  loop: boolean;
  volume?: number;
  fadeIn?: number;
  fadeOut?: number;
  category: 'background' | 'menu' | 'game' | 'victory' | 'defeat';
}

// Sound Effects Database
export const soundEffects: Record<string, SoundEffect> = {
  // UI Sounds
  'button-click': {
    name: 'Button Click',
    url: '/sounds/ui/button-click.mp3',
    volume: 0.7,
    category: 'sfx'
  },
  'button-hover': {
    name: 'Button Hover',
    url: '/sounds/ui/button-hover.mp3',
    volume: 0.5,
    category: 'sfx'
  },
  'menu-open': {
    name: 'Menu Open',
    url: '/sounds/ui/menu-open.mp3',
    volume: 0.8,
    category: 'sfx'
  },
  'menu-close': {
    name: 'Menu Close',
    url: '/sounds/ui/menu-close.mp3',
    volume: 0.8,
    category: 'sfx'
  },
  'notification': {
    name: 'Notification',
    url: '/sounds/ui/notification.mp3',
    volume: 0.6,
    category: 'sfx'
  },
  'error': {
    name: 'Error',
    url: '/sounds/ui/error.mp3',
    volume: 0.8,
    category: 'sfx'
  },
  'success': {
    name: 'Success',
    url: '/sounds/ui/success.mp3',
    volume: 0.8,
    category: 'sfx'
  },

  // Game Sounds
  'game-start': {
    name: 'Game Start',
    url: '/sounds/game/game-start.mp3',
    volume: 0.9,
    category: 'sfx'
  },
  'game-end': {
    name: 'Game End',
    url: '/sounds/game/game-end.mp3',
    volume: 0.9,
    category: 'sfx'
  },
  'victory': {
    name: 'Victory',
    url: '/sounds/game/victory.mp3',
    volume: 1.0,
    category: 'sfx'
  },
  'defeat': {
    name: 'Defeat',
    url: '/sounds/game/defeat.mp3',
    volume: 1.0,
    category: 'sfx'
  },
  'level-up': {
    name: 'Level Up',
    url: '/sounds/game/level-up.mp3',
    volume: 0.8,
    category: 'sfx'
  },
  'power-up': {
    name: 'Power Up',
    url: '/sounds/game/power-up.mp3',
    volume: 0.8,
    category: 'sfx'
  },

  // Hacking Sounds
  'hack-start': {
    name: 'Hack Start',
    url: '/sounds/hacking/hack-start.mp3',
    volume: 0.9,
    category: 'sfx'
  },
  'hack-progress': {
    name: 'Hack Progress',
    url: '/sounds/hacking/hack-progress.mp3',
    volume: 0.7,
    category: 'sfx'
  },
  'hack-complete': {
    name: 'Hack Complete',
    url: '/sounds/hacking/hack-complete.mp3',
    volume: 0.9,
    category: 'sfx'
  },
  'hack-failed': {
    name: 'Hack Failed',
    url: '/sounds/hacking/hack-failed.mp3',
    volume: 0.9,
    category: 'sfx'
  },
  'typing': {
    name: 'Typing',
    url: '/sounds/hacking/typing.mp3',
    volume: 0.6,
    category: 'sfx'
  },
  'beep': {
    name: 'Beep',
    url: '/sounds/hacking/beep.mp3',
    volume: 0.5,
    category: 'sfx'
  },
  'scanning': {
    name: 'Scanning',
    url: '/sounds/hacking/scanning.mp3',
    volume: 0.7,
    loop: true,
    category: 'sfx'
  },
  'data-transfer': {
    name: 'Data Transfer',
    url: '/sounds/hacking/data-transfer.mp3',
    volume: 0.6,
    category: 'sfx'
  },

  // Fingerprint Game Sounds
  'fingerprint-select': {
    name: 'Fingerprint Select',
    url: '/sounds/fingerprint/select.mp3',
    volume: 0.7,
    category: 'sfx'
  },
  'fingerprint-correct': {
    name: 'Fingerprint Correct',
    url: '/sounds/fingerprint/correct.mp3',
    volume: 0.8,
    category: 'sfx'
  },
  'fingerprint-incorrect': {
    name: 'Fingerprint Incorrect',
    url: '/sounds/fingerprint/incorrect.mp3',
    volume: 0.8,
    category: 'sfx'
  },
  'fingerprint-scan': {
    name: 'Fingerprint Scan',
    url: '/sounds/fingerprint/scan.mp3',
    volume: 0.7,
    category: 'sfx'
  },

  // Number Finder Sounds
  'number-found': {
    name: 'Number Found',
    url: '/sounds/number-finder/found.mp3',
    volume: 0.8,
    category: 'sfx'
  },
  'number-correct': {
    name: 'Number Correct',
    url: '/sounds/number-finder/correct.mp3',
    volume: 0.8,
    category: 'sfx'
  },
  'number-incorrect': {
    name: 'Number Incorrect',
    url: '/sounds/number-finder/incorrect.mp3',
    volume: 0.8,
    category: 'sfx'
  },

  // Ambient Sounds
  'matrix-rain': {
    name: 'Matrix Rain',
    url: '/sounds/ambient/matrix-rain.mp3',
    volume: 0.3,
    loop: true,
    category: 'ambient'
  },
  'server-hum': {
    name: 'Server Hum',
    url: '/sounds/ambient/server-hum.mp3',
    volume: 0.2,
    loop: true,
    category: 'ambient'
  },
  'cyber-ambient': {
    name: 'Cyber Ambient',
    url: '/sounds/ambient/cyber-ambient.mp3',
    volume: 0.4,
    loop: true,
    category: 'ambient'
  }
};

// Music Tracks Database
export const musicTracks: Record<string, AudioTrack> = {
  'main-menu': {
    name: 'Main Menu Theme',
    url: '/sounds/music/main-menu.mp3',
    duration: 180,
    loop: true,
    fadeIn: 2000,
    category: 'menu'
  },
  'casino-theme': {
    name: 'Casino Hacking Theme',
    url: '/sounds/music/casino-theme.mp3',
    duration: 240,
    loop: true,
    fadeIn: 1500,
    category: 'game'
  },
  'cayo-theme': {
    name: 'Cayo Perico Theme',
    url: '/sounds/music/cayo-theme.mp3',
    duration: 200,
    loop: true,
    fadeIn: 1500,
    category: 'game'
  },
  'number-finder-theme': {
    name: 'Number Finder Theme',
    url: '/sounds/music/number-finder-theme.mp3',
    duration: 160,
    loop: true,
    fadeIn: 1500,
    category: 'game'
  },
  'victory-theme': {
    name: 'Victory Theme',
    url: '/sounds/music/victory-theme.mp3',
    duration: 30,
    loop: false,
    category: 'victory'
  },
  'defeat-theme': {
    name: 'Defeat Theme',
    url: '/sounds/music/defeat-theme.mp3',
    duration: 20,
    loop: false,
    category: 'defeat'
  },
  'background-ambient': {
    name: 'Background Ambient',
    url: '/sounds/music/background-ambient.mp3',
    duration: 300,
    loop: true,
    volume: 0.3,
    category: 'background'
  }
};

// Audio Manager Class
export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private music: Map<string, HTMLAudioElement> = new Map();
  private config: AudioConfig;
  private currentTrack: string | null = null;
  private listeners: Set<(config: AudioConfig) => void> = new Set();

  private constructor() {
    this.config = this.loadConfig();
    this.initializeAudioContext();
    this.preloadSounds();
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  // Initialize Web Audio API context
  private initializeAudioContext(): void {
    if (typeof window === 'undefined') return;

    try {
      type WindowWithWebkit = Window & typeof globalThis & {
        webkitAudioContext?: typeof AudioContext;
      };
      const W = window as WindowWithWebkit;
      const Ctor = W.AudioContext ?? W.webkitAudioContext;
      if (!Ctor) throw new Error('Web Audio API not supported');
      this.audioContext = new Ctor();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  // Load audio configuration from localStorage
  private loadConfig(): AudioConfig {
    if (typeof window === 'undefined') {
      return {
        volume: 1.0,
        muted: false,
        masterVolume: 1.0,
        sfxVolume: 0.8,
        musicVolume: 0.6,
        voiceVolume: 0.7
      };
    }

    const saved = localStorage.getItem('lester-arcade-audio-config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<AudioConfig>;
        return { ...this.getDefaultConfig(), ...parsed };
      } catch (error) {
        console.warn('Failed to parse audio config:', error);
      }
    }

    return this.getDefaultConfig();
  }

  // Get default audio configuration
  private getDefaultConfig(): AudioConfig {
    return {
      volume: 1.0,
      muted: false,
      masterVolume: 1.0,
      sfxVolume: 0.8,
      musicVolume: 0.6,
      voiceVolume: 0.7
    };
  }

  // Save audio configuration to localStorage
  private saveConfig(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('lester-arcade-audio-config', JSON.stringify(this.config));
  }

  // Preload all sound effects
  private preloadSounds(): void {
    Object.entries(soundEffects).forEach(([key, sound]) => {
      if (sound.preload !== false) {
        this.loadSound(key, sound);
      }
    });

    Object.entries(musicTracks).forEach(([key, track]) => {
      this.loadMusic(key, track);
    });
  }

  // Load a sound effect
  private loadSound(key: string, sound: SoundEffect): void {
    const audio = new Audio(sound.url);
    audio.volume = (sound.volume || 1.0) * this.config.sfxVolume * this.config.masterVolume;
    audio.preload = 'auto';
    this.sounds.set(key, audio);
  }

  // Load a music track
  private loadMusic(key: string, track: AudioTrack): void {
    const audio = new Audio(track.url);
    audio.volume = (track.volume || 1.0) * this.config.musicVolume * this.config.masterVolume;
    audio.loop = track.loop;
    audio.preload = 'auto';
    this.music.set(key, audio);
  }

  // Play a sound effect
  playSound(soundKey: string, options: Partial<{ volume: number; loop: boolean; delay: number }> = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      const sound = this.sounds.get(soundKey);
      if (!sound) {
        console.warn(`Sound "${soundKey}" not found`);
        reject(new Error(`Sound "${soundKey}" not found`));
        return;
      }

      if (this.config.muted) {
        resolve();
        return;
      }

      // Clone the audio element to allow overlapping sounds
      const audio = sound.cloneNode() as HTMLAudioElement;
      audio.volume = (options.volume || 1.0) * this.config.sfxVolume * this.config.masterVolume;
      audio.loop = options.loop || false;

      const playAudio = () => {
        audio.play()
          .then(() => {
            if (!options.loop) {
              audio.addEventListener('ended', () => resolve());
            } else {
              resolve();
            }
          })
          .catch(reject);
      };

      if (options.delay) {
        setTimeout(playAudio, options.delay);
      } else {
        playAudio();
      }
    });
  }

  // Play background music
  playMusic(trackKey: string, options: Partial<{ volume: number; fadeIn: number }> = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      // Stop current track
      this.stopMusic();

      const track = this.music.get(trackKey);
      if (!track) {
        console.warn(`Music track "${trackKey}" not found`);
        reject(new Error(`Music track "${trackKey}" not found`));
        return;
      }

      if (this.config.muted) {
        resolve();
        return;
      }

      this.currentTrack = trackKey;
      track.volume = (options.volume || 1.0) * this.config.musicVolume * this.config.masterVolume;
      track.currentTime = 0;

      const playTrack = () => {
        track.play()
          .then(() => {
            if (options.fadeIn) {
              this.fadeIn(track, options.fadeIn);
            }
            resolve();
          })
          .catch(reject);
      };

      playTrack();
    });
  }

  // Stop background music
  stopMusic(fadeOut: number = 0): Promise<void> {
    return new Promise((resolve) => {
      if (!this.currentTrack) {
        resolve();
        return;
      }

      const track = this.music.get(this.currentTrack);
      if (!track) {
        resolve();
        return;
      }

      if (fadeOut > 0) {
        this.fadeOut(track, fadeOut).then(() => {
          track.pause();
          track.currentTime = 0;
          this.currentTrack = null;
          resolve();
        });
      } else {
        track.pause();
        track.currentTime = 0;
        this.currentTrack = null;
        resolve();
      }
    });
  }

  // Fade in audio
  private fadeIn(audio: HTMLAudioElement, duration: number): void {
    const startVolume = 0;
    const targetVolume = audio.volume;
    const startTime = Date.now();

    audio.volume = startVolume;

    const fade = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      audio.volume = startVolume + (targetVolume - startVolume) * progress;

      if (progress < 1) {
        requestAnimationFrame(fade);
      }
    };

    fade();
  }

  // Fade out audio
  private fadeOut(audio: HTMLAudioElement, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const startVolume = audio.volume;
      const startTime = Date.now();

      const fade = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        audio.volume = startVolume * (1 - progress);

        if (progress < 1) {
          requestAnimationFrame(fade);
        } else {
          resolve();
        }
      };

      fade();
    });
  }

  // Set master volume
  setMasterVolume(volume: number): void {
    this.config.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
    this.saveConfig();
    this.notifyListeners();
  }

  // Set SFX volume
  setSFXVolume(volume: number): void {
    this.config.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateSFXVolumes();
    this.saveConfig();
    this.notifyListeners();
  }

  // Set music volume
  setMusicVolume(volume: number): void {
    this.config.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateMusicVolumes();
    this.saveConfig();
    this.notifyListeners();
  }

  // Set voice volume
  setVoiceVolume(volume: number): void {
    this.config.voiceVolume = Math.max(0, Math.min(1, volume));
    this.updateVoiceVolumes();
    this.saveConfig();
    this.notifyListeners();
  }

  // Mute/unmute all audio
  setMuted(muted: boolean): void {
    this.config.muted = muted;
    this.saveConfig();
    this.notifyListeners();
  }

  // Update all audio volumes
  private updateAllVolumes(): void {
    this.updateSFXVolumes();
    this.updateMusicVolumes();
    this.updateVoiceVolumes();
  }

  // Update SFX volumes
  private updateSFXVolumes(): void {
    this.sounds.forEach((audio, key) => {
      const sound = soundEffects[key];
      if (sound) {
        audio.volume = (sound.volume || 1.0) * this.config.sfxVolume * this.config.masterVolume;
      }
    });
  }

  // Update music volumes
  private updateMusicVolumes(): void {
    this.music.forEach((audio, key) => {
      const track = musicTracks[key];
      if (track) {
        audio.volume = (track.volume || 1.0) * this.config.musicVolume * this.config.masterVolume;
      }
    });
  }

  // Update voice volumes
  private updateVoiceVolumes(): void {
    // Voice sounds would be handled here if we had them
    // For now, this is a placeholder
  }

  // Get current configuration
  getConfig(): AudioConfig {
    return { ...this.config };
  }

  // Subscribe to configuration changes
  subscribe(listener: (config: AudioConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify listeners of configuration changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.config));
  }

  // Get available sound effects
  getAvailableSounds(): SoundEffect[] {
    return Object.values(soundEffects);
  }

  // Get available music tracks
  getAvailableMusic(): AudioTrack[] {
    return Object.values(musicTracks);
  }

  // Check if sound is loaded
  isSoundLoaded(soundKey: string): boolean {
    return this.sounds.has(soundKey);
  }

  // Check if music is loaded
  isMusicLoaded(trackKey: string): boolean {
    return this.music.has(trackKey);
  }

  // Get current playing track
  getCurrentTrack(): string | null {
    return this.currentTrack;
  }

  // Pause all audio
  pauseAll(): void {
    this.sounds.forEach(audio => audio.pause());
    this.music.forEach(audio => audio.pause());
  }

  // Resume all audio
  resumeAll(): void {
    if (this.currentTrack) {
      const track = this.music.get(this.currentTrack);
      if (track) {
        track.play().catch(console.warn);
      }
    }
  }

  // Stop all audio
  stopAll(): void {
    this.sounds.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.music.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.currentTrack = null;
  }

  // Create audio context if needed
  async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Generate audio visualization data
  generateVisualizationData(): Promise<Uint8Array> {
    return new Promise((resolve) => {
      if (!this.audioContext) {
        resolve(new Uint8Array(0));
        return;
      }

      const analyser = this.audioContext.createAnalyser();
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      analyser.getByteFrequencyData(dataArray);
      resolve(dataArray);
    });
  }

  // Create audio effect (reverb, echo, etc.)
  createAudioEffect(type: 'reverb' | 'echo' | 'distortion' | 'lowpass' | 'highpass'): AudioNode | null {
    if (!this.audioContext) return null;

    switch (type) {
      case 'reverb':
        const reverb = this.audioContext.createConvolver();
        // Reverb implementation would go here
        return reverb;
      
      case 'echo':
        const delay = this.audioContext.createDelay();
        delay.delayTime.value = 0.3;
        const feedback = this.audioContext.createGain();
        feedback.gain.value = 0.3;
        delay.connect(feedback);
        feedback.connect(delay);
        return delay;
      
      case 'distortion':
        const distortion = this.audioContext.createWaveShaper();
        const samples = 44100;
        const curve = new Float32Array(samples);
        for (let i = 0; i < samples; i++) {
          const x = (i * 2) / samples - 1;
          curve[i] = Math.tanh(x * 5);
        }
        distortion.curve = curve;
        return distortion;
      
      case 'lowpass':
        const lowpass = this.audioContext.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 1000;
        return lowpass;
      
      case 'highpass':
        const highpass = this.audioContext.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 1000;
        return highpass;
      
      default:
        return null;
    }
  }

  // Cleanup
  destroy(): void {
    this.stopAll();
    this.sounds.clear();
    this.music.clear();
    this.listeners.clear();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Export singleton instance
export const audioManager = AudioManager.getInstance();

// React Hook for audio management
export const useAudio = () => {
  const manager = AudioManager.getInstance();
  
  return {
    playSound: (soundKey: string, options?: Partial<{ volume: number; loop: boolean; delay: number }>) => 
      manager.playSound(soundKey, options),
    playMusic: (trackKey: string, options?: Partial<{ volume: number; fadeIn: number }>) => 
      manager.playMusic(trackKey, options),
    stopMusic: (fadeOut?: number) => manager.stopMusic(fadeOut),
    setMasterVolume: (volume: number) => manager.setMasterVolume(volume),
    setSFXVolume: (volume: number) => manager.setSFXVolume(volume),
    setMusicVolume: (volume: number) => manager.setMusicVolume(volume),
    setVoiceVolume: (volume: number) => manager.setVoiceVolume(volume),
    setMuted: (muted: boolean) => manager.setMuted(muted),
    getConfig: () => manager.getConfig(),
    subscribe: (listener: (config: AudioConfig) => void) => manager.subscribe(listener),
    getAvailableSounds: () => manager.getAvailableSounds(),
    getAvailableMusic: () => manager.getAvailableMusic(),
    isSoundLoaded: (soundKey: string) => manager.isSoundLoaded(soundKey),
    isMusicLoaded: (trackKey: string) => manager.isMusicLoaded(trackKey),
    getCurrentTrack: () => manager.getCurrentTrack(),
    pauseAll: () => manager.pauseAll(),
    resumeAll: () => manager.resumeAll(),
    stopAll: () => manager.stopAll(),
    resumeAudioContext: () => manager.resumeAudioContext(),
    generateVisualizationData: () => manager.generateVisualizationData(),
    createAudioEffect: (type: 'reverb' | 'echo' | 'distortion' | 'lowpass' | 'highpass') => 
      manager.createAudioEffect(type)
  };
};

// Utility functions
export const createSoundEffect = (name: string, url: string, config: Partial<SoundEffect> = {}): SoundEffect => {
  return {
    name,
    url,
    volume: 1.0,
    loop: false,
    preload: true,
    category: 'sfx',
    ...config
  };
};

export const createMusicTrack = (name: string, url: string, config: Partial<AudioTrack> = {}): AudioTrack => {
  return {
    name,
    url,
    duration: 0,
    loop: false,
    category: 'background',
    ...config
  };
};

export const generateTone = (frequency: number, duration: number, type: OscillatorType = 'sine'): Promise<void> => {
  return new Promise((resolve) => {
    type WindowWithWebkit = Window & typeof globalThis & {
      webkitAudioContext?: typeof AudioContext;
    };
    const W = window as WindowWithWebkit;
    const Ctor = W.AudioContext ?? W.webkitAudioContext;
    if (!Ctor) {
      resolve();
      return;
    }
    const audioContext = new Ctor();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
    
    oscillator.onended = () => resolve();
  });
};

export default AudioManager;

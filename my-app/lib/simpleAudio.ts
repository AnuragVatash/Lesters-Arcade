'use client';

// Simple Audio System that generates sounds using Web Audio API
// No external files required - all sounds are generated procedurally

export interface SimpleAudioConfig {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  voiceVolume: number;
  muted: boolean;
}

export type SoundType = 
  | 'startup' 
  | 'login' 
  | 'logout' 
  | 'click' 
  | 'back' 
  | 'pieceClick' 
  | 'pieceCorrect' 
  | 'pieceWrong' 
  | 'gameComplete' 
  | 'scanning'
  | 'error'
  | 'success'
  | 'notification'
  | 'hover';

export class SimpleAudioManager {
  private static instance: SimpleAudioManager;
  private audioContext: AudioContext | null = null;
  private config: SimpleAudioConfig;
  private listeners: Set<(config: SimpleAudioConfig) => void> = new Set();

  private constructor() {
    this.config = this.loadConfig();
    this.initializeAudioContext();
  }

  static getInstance(): SimpleAudioManager {
    if (!SimpleAudioManager.instance) {
      SimpleAudioManager.instance = new SimpleAudioManager();
    }
    return SimpleAudioManager.instance;
  }

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
      this.audioContext = null;
    }
  }

  private loadConfig(): SimpleAudioConfig {
    if (typeof window === 'undefined') {
      return this.getDefaultConfig();
    }

    const saved = localStorage.getItem('lester-arcade-audio-config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<SimpleAudioConfig>;
        return { ...this.getDefaultConfig(), ...parsed };
      } catch (error) {
        console.warn('Failed to parse audio config:', error);
      }
    }

    return this.getDefaultConfig();
  }

  private getDefaultConfig(): SimpleAudioConfig {
    return {
      masterVolume: 1.0,
      sfxVolume: 0.8,
      musicVolume: 0.6,
      voiceVolume: 0.7,
      muted: false
    };
  }

  private saveConfig(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('lester-arcade-audio-config', JSON.stringify(this.config));
  }

  // Generate different types of sounds
  async playSound(soundType: SoundType, volume: number = 1.0): Promise<void> {
    if (!this.audioContext || this.config.muted) return;

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      console.warn('Failed to resume audio context:', error);
      return;
    }

    const effectiveVolume = volume * this.config.sfxVolume * this.config.masterVolume;
    
    switch (soundType) {
      case 'startup':
        this.generateSweep(400, 800, 0.3, effectiveVolume);
        break;
      case 'login':
        this.generateChord([440, 554.37, 659.25], 0.2, effectiveVolume);
        break;
      case 'logout':
        this.generateSweep(800, 400, 0.2, effectiveVolume);
        break;
      case 'click':
        this.generateBeep(800, 0.1, effectiveVolume);
        break;
      case 'back':
        this.generateBeep(600, 0.1, effectiveVolume);
        break;
      case 'pieceClick':
        this.generateBeep(1200, 0.05, effectiveVolume);
        break;
      case 'pieceCorrect':
        this.generateChord([523.25, 659.25, 783.99], 0.3, effectiveVolume);
        break;
      case 'pieceWrong':
        this.generateBuzzer(200, 0.2, effectiveVolume);
        break;
      case 'gameComplete':
        this.generateVictoryFanfare(effectiveVolume);
        break;
      case 'scanning':
        this.generateScanningSound(effectiveVolume);
        break;
      case 'error':
        this.generateBuzzer(150, 0.3, effectiveVolume);
        break;
      case 'success':
        this.generateChord([523.25, 659.25, 783.99, 1046.5], 0.4, effectiveVolume);
        break;
      case 'notification':
        this.generateBeep(1000, 0.15, effectiveVolume);
        break;
      case 'hover':
        this.generateBeep(1500, 0.05, effectiveVolume * 0.5);
        break;
      default:
        this.generateBeep(800, 0.1, effectiveVolume);
    }
  }

  private generateBeep(frequency: number, duration: number, volume: number): void {
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Failed to generate beep:', error);
    }
  }

  private generateSweep(startFreq: number, endFreq: number, duration: number, volume: number): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  private generateChord(frequencies: number[], duration: number, volume: number): void {
    if (!this.audioContext) return;

    const masterGain = this.audioContext.createGain();
    masterGain.connect(this.audioContext.destination);

    frequencies.forEach((frequency, index) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(masterGain);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      const noteVolume = volume * 0.2 / frequencies.length;
      gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime);
      gainNode.gain.linearRampToValueAtTime(noteVolume, this.audioContext!.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + duration);

      oscillator.start(this.audioContext!.currentTime + index * 0.05);
      oscillator.stop(this.audioContext!.currentTime + duration);
    });
  }

  private generateBuzzer(frequency: number, duration: number, volume: number): void {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.2, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  private generateVictoryFanfare(volume: number): void {
    if (!this.audioContext) return;

    // Play a sequence of ascending notes
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
    
    notes.forEach((frequency, index) => {
      setTimeout(() => {
        this.generateBeep(frequency, 0.2, volume);
      }, index * 100);
    });

    // Add a final chord
    setTimeout(() => {
      this.generateChord([523.25, 659.25, 783.99, 1046.5], 0.5, volume);
    }, notes.length * 100);
  }

  private generateScanningSound(volume: number): void {
    if (!this.audioContext) return;

    // Create a pulsing scanning sound
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.generateSweep(800, 1200, 0.1, volume * 0.5);
      }, i * 150);
    }
  }

  // Configuration methods
  setMasterVolume(volume: number): void {
    this.config.masterVolume = Math.max(0, Math.min(1, volume));
    this.saveConfig();
    this.notifyListeners();
  }

  setSFXVolume(volume: number): void {
    this.config.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveConfig();
    this.notifyListeners();
  }

  setMusicVolume(volume: number): void {
    this.config.musicVolume = Math.max(0, Math.min(1, volume));
    this.saveConfig();
    this.notifyListeners();
  }

  setVoiceVolume(volume: number): void {
    this.config.voiceVolume = Math.max(0, Math.min(1, volume));
    this.saveConfig();
    this.notifyListeners();
  }

  setMuted(muted: boolean): void {
    this.config.muted = muted;
    this.saveConfig();
    this.notifyListeners();
  }

  getConfig(): SimpleAudioConfig {
    return { ...this.config };
  }

  subscribe(listener: (config: SimpleAudioConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.config));
  }

  async resumeAudioContext(): Promise<void> {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Cleanup
  destroy(): void {
    this.listeners.clear();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Export singleton instance
export const simpleAudioManager = SimpleAudioManager.getInstance();

// React Hook for simple audio
export const useSimpleAudio = () => {
  const manager = SimpleAudioManager.getInstance();
  
  return {
    playSound: (soundType: SoundType, volume?: number) => manager.playSound(soundType, volume),
    setMasterVolume: (volume: number) => manager.setMasterVolume(volume),
    setSFXVolume: (volume: number) => manager.setSFXVolume(volume),
    setMusicVolume: (volume: number) => manager.setMusicVolume(volume),
    setVoiceVolume: (volume: number) => manager.setVoiceVolume(volume),
    setMuted: (muted: boolean) => manager.setMuted(muted),
    getConfig: () => manager.getConfig(),
    subscribe: (listener: (config: SimpleAudioConfig) => void) => manager.subscribe(listener),
    resumeAudioContext: () => manager.resumeAudioContext()
  };
};

export default SimpleAudioManager;

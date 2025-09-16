'use client';

// Advanced Audio System for Lester's Arcade
// This file contains comprehensive audio management, effects, and spatial audio

export interface AudioClip {
  id: string;
  source: HTMLAudioElement;
  volume: number;
  pitch: number;
  loop: boolean;
  spatial: boolean;
  position?: Vector3D;
  maxDistance: number;
  rolloffFactor: number;
  dopplerFactor: number;
  category: AudioCategory;
  priority: AudioPriority;
  fadeInTime: number;
  fadeOutTime: number;
  crossfadeTime: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export enum AudioCategory {
  MUSIC = 'music',
  SFX = 'sfx',
  VOICE = 'voice',
  AMBIENT = 'ambient',
  UI = 'ui'
}

export enum AudioPriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3
}

export interface AudioEffect {
  name: string;
  type: 'reverb' | 'echo' | 'distortion' | 'filter' | 'compressor' | 'chorus' | 'flanger' | 'phaser';
  parameters: Map<string, number>;
  enabled: boolean;
  apply(audioContext: AudioContext, source: AudioBufferSourceNode): AudioNode;
}

export interface AudioMixer {
  name: string;
  volume: number;
  muted: boolean;
  effects: AudioEffect[];
  clips: AudioClip[];
  parent?: AudioMixer;
  children: AudioMixer[];
}

export interface SpatialAudioSettings {
  listenerPosition: Vector3D;
  listenerOrientation: Vector3D;
  listenerVelocity: Vector3D;
  speedOfSound: number;
  dopplerFactor: number;
  distanceModel: 'linear' | 'inverse' | 'exponential';
  rolloffFactor: number;
  maxDistance: number;
  refDistance: number;
}

export interface AudioPlaylist {
  id: string;
  name: string;
  tracks: AudioClip[];
  currentTrack: number;
  shuffle: boolean;
  repeat: 'none' | 'one' | 'all';
  crossfade: boolean;
  crossfadeTime: number;
  play(): void;
  pause(): void;
  stop(): void;
  next(): void;
  previous(): void;
  addTrack(clip: AudioClip): void;
  removeTrack(id: string): void;
  setTrack(index: number): void;
}

export interface AudioManager {
  context: AudioContext;
  masterVolume: number;
  masterMuted: boolean;
  mixers: Map<string, AudioMixer>;
  playlists: Map<string, AudioPlaylist>;
  spatialSettings: SpatialAudioSettings;
  effects: Map<string, AudioEffect>;
  clips: Map<string, AudioClip>;
  playing: Map<string, AudioClip>;
  paused: Map<string, AudioClip>;
  
  init(): Promise<void>;
  createClip(id: string, url: string, config?: Partial<AudioClip>): Promise<AudioClip>;
  createWebAudioClip(id: string, config?: Partial<AudioClip>): Promise<AudioClip>;
  play(id: string, config?: Partial<AudioClip>): Promise<void>;
  pause(id: string): void;
  stop(id: string): void;
  stopAll(): void;
  setVolume(id: string, volume: number): void;
  setPitch(id: string, pitch: number): void;
  setLoop(id: string, loop: boolean): void;
  fadeIn(id: string, duration: number): void;
  fadeOut(id: string, duration: number): void;
  crossfade(fromId: string, toId: string, duration: number): void;
  createMixer(name: string, parent?: string): AudioMixer;
  createPlaylist(id: string, name: string): AudioPlaylist;
  addEffect(effect: AudioEffect): void;
  removeEffect(name: string): void;
  setSpatialSettings(settings: Partial<SpatialAudioSettings>): void;
  updateSpatialAudio(listenerPosition: Vector3D, listenerOrientation: Vector3D): void;
  destroy(): void;
}

// Audio Manager Implementation
export class AudioManagerImpl implements AudioManager {
  context: AudioContext;
  masterVolume: number;
  masterMuted: boolean;
  mixers: Map<string, AudioMixer>;
  playlists: Map<string, AudioPlaylist>;
  spatialSettings: SpatialAudioSettings;
  effects: Map<string, AudioEffect>;
  clips: Map<string, AudioClip>;
  playing: Map<string, AudioClip>;
  paused: Map<string, AudioClip>;

  constructor() {
    this.context = null as unknown as AudioContext;
    this.masterVolume = 1;
    this.masterMuted = false;
    this.mixers = new Map();
    this.playlists = new Map();
    this.spatialSettings = {
      listenerPosition: { x: 0, y: 0, z: 0 },
      listenerOrientation: { x: 0, y: 0, z: 1 },
      listenerVelocity: { x: 0, y: 0, z: 0 },
      speedOfSound: 343.3,
      dopplerFactor: 1,
      distanceModel: 'exponential',
      rolloffFactor: 1,
      maxDistance: 100,
      refDistance: 1
    };
    this.effects = new Map();
    this.clips = new Map();
    this.playing = new Map();
    this.paused = new Map();
  }

  async init(): Promise<void> {
    try {
      const AudioContextCtor = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) {
        throw new Error('Web Audio API not supported');
      }
      this.context = new AudioContextCtor();
      
      // Resume context if suspended
      if (this.context.state === 'suspended') {
        await this.context.resume();
      }

      // Initialize default mixers
      this.createMixer('master');
      this.createMixer('music', 'master');
      this.createMixer('sfx', 'master');
      this.createMixer('voice', 'master');
      this.createMixer('ambient', 'master');
      this.createMixer('ui', 'master');

      // Initialize default effects
      this.initializeDefaultEffects();
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  private initializeDefaultEffects(): void {
    // Reverb effect
    this.addEffect({
      name: 'reverb',
      type: 'reverb',
      parameters: new Map([
        ['roomSize', 0.5],
        ['damping', 0.5],
        ['wet', 0.3],
        ['dry', 0.7]
      ]),
      enabled: false,
      apply: (audioContext: AudioContext, source: AudioBufferSourceNode) => {
        const convolver = audioContext.createConvolver();
        const gain = audioContext.createGain();
        gain.gain.value = 0.3;
        source.connect(convolver);
        convolver.connect(gain);
        return gain;
      }
    });

    // Echo effect
    this.addEffect({
      name: 'echo',
      type: 'echo',
      parameters: new Map([
        ['delay', 0.3],
        ['feedback', 0.2],
        ['wet', 0.3]
      ]),
      enabled: false,
      apply: (audioContext: AudioContext, source: AudioBufferSourceNode) => {
        const delay = audioContext.createDelay();
        const feedback = audioContext.createGain();
        const wet = audioContext.createGain();
        
        delay.delayTime.value = 0.3;
        feedback.gain.value = 0.2;
        wet.gain.value = 0.3;
        
        source.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(wet);
        source.connect(wet);
        
        return wet;
      }
    });

    // Distortion effect
    this.addEffect({
      name: 'distortion',
      type: 'distortion',
      parameters: new Map([
        ['amount', 0.5],
        ['oversample', 2]
      ]),
      enabled: false,
      apply: (audioContext: AudioContext, source: AudioBufferSourceNode) => {
        const distortion = audioContext.createWaveShaper();
        const amount = 0.5;
        const samples = 44100;
        const curve = new Float32Array(samples);
        
        for (let i = 0; i < samples; i++) {
          const x = (i * 2) / samples - 1;
          curve[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));
        }
        
        distortion.curve = curve;
        distortion.oversample = '4x';
        source.connect(distortion);
        return distortion;
      }
    });
  }

  async createClip(id: string, url: string, config: Partial<AudioClip> = {}): Promise<AudioClip> {
    try {
      const audio = new Audio(url);
      audio.crossOrigin = 'anonymous';
      
      const clip: AudioClip = {
        id,
        source: audio,
        volume: config.volume || 1,
        pitch: config.pitch || 1,
        loop: config.loop || false,
        spatial: config.spatial || false,
        position: config.position,
        maxDistance: config.maxDistance || 100,
        rolloffFactor: config.rolloffFactor || 1,
        dopplerFactor: config.dopplerFactor || 1,
        category: config.category || AudioCategory.SFX,
        priority: config.priority || AudioPriority.NORMAL,
        fadeInTime: config.fadeInTime || 0,
        fadeOutTime: config.fadeOutTime || 0,
        crossfadeTime: config.crossfadeTime || 0
      };

      this.clips.set(id, clip);
      return clip;
    } catch (error) {
      console.error(`Failed to create audio clip ${id}:`, error);
      throw error;
    }
  }

  // Create audio clips from online sources
  async createOnlineClip(id: string, config: Partial<AudioClip> = {}): Promise<AudioClip> {
    const onlineAudioSources = {
      'startup': 'https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/beep_short_1.wav',
      'login': 'https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/beep_short_2.wav',
      'logout': 'https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/beep_short_3.wav',
      'click': 'https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/beep_short_4.wav',
      'back': 'https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/beep_short_5.wav',
      'pieceClick': 'https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/beep_short_6.wav',
      'pieceCorrect': 'https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/beep_short_7.wav',
      'pieceWrong': 'https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/beep_short_8.wav',
      'gameComplete': 'https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/beep_short_9.wav',
      'scanning': 'https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/beep_short_10.wav'
    };

    const url = onlineAudioSources[id as keyof typeof onlineAudioSources];
    if (!url) {
      throw new Error(`No online audio source found for ${id}`);
    }

    return this.createClip(id, url, config);
  }

  // Create audio clips using Web Audio API for better compatibility
  async createWebAudioClip(id: string, config: Partial<AudioClip> = {}): Promise<AudioClip> {
    // Generate simple beep sounds using Web Audio API
    const generateBeep = (frequency: number, duration: number = 0.1): string => {
      const sampleRate = 44100;
      const length = sampleRate * duration;
      const buffer = new ArrayBuffer(44 + length * 2);
      const view = new DataView(buffer);
      
      // WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + length * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, length * 2, true);
      
      // Generate sine wave
      for (let i = 0; i < length; i++) {
        const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
        view.setInt16(44 + i * 2, sample * 32767, true);
      }
      
      const blob = new Blob([buffer], { type: 'audio/wav' });
      return URL.createObjectURL(blob);
    };

    const beepFrequencies = {
      'startup': 800,
      'login': 600,
      'logout': 400,
      'click': 1000,
      'back': 900,
      'pieceClick': 1200,
      'pieceCorrect': 1500,
      'pieceWrong': 300,
      'gameComplete': 2000,
      'scanning': 800
    };

    const frequency = beepFrequencies[id as keyof typeof beepFrequencies] || 800;
    const audioUrl = generateBeep(frequency, 0.2);
    
    return this.createClip(id, audioUrl, config);
  }

  async play(id: string, config: Partial<AudioClip> = {}): Promise<void> {
    const clip = this.clips.get(id);
    if (!clip) {
      console.warn(`Audio clip ${id} not found`);
      return;
    }

    // Apply config overrides
    Object.assign(clip, config);

    try {
      // Stop if already playing
      if (this.playing.has(id)) {
        this.stop(id);
      }

      // Resume if paused
      if (this.paused.has(id)) {
        clip.source.play();
        this.playing.set(id, clip);
        this.paused.delete(id);
        return;
      }

      // Set properties
      clip.source.volume = clip.volume * this.masterVolume;
      clip.source.loop = clip.loop;
      clip.source.currentTime = 0;

      // Apply spatial audio if enabled
      if (clip.spatial && clip.position) {
        this.applySpatialAudio(clip);
      }

      // Apply effects
      this.applyEffects(clip);

      // Play with fade in if specified
      if (clip.fadeInTime > 0) {
        clip.source.volume = 0;
        clip.source.play();
        this.fadeIn(id, clip.fadeInTime);
      } else {
        clip.source.play();
      }

      this.playing.set(id, clip);

      // Handle end event
      clip.source.onended = () => {
        this.playing.delete(id);
      };

    } catch (error) {
      console.error(`Failed to play audio clip ${id}:`, error);
    }
  }

  pause(id: string): void {
    const clip = this.playing.get(id);
    if (clip) {
      clip.source.pause();
      this.playing.delete(id);
      this.paused.set(id, clip);
    }
  }

  stop(id: string): void {
    const clip = this.playing.get(id) || this.paused.get(id);
    if (clip) {
      clip.source.pause();
      clip.source.currentTime = 0;
      this.playing.delete(id);
      this.paused.delete(id);
    }
  }

  stopAll(): void {
    this.playing.forEach((clip, id) => {
      this.stop(id);
    });
    this.paused.clear();
  }

  setVolume(id: string, volume: number): void {
    const clip = this.playing.get(id) || this.paused.get(id);
    if (clip) {
      clip.volume = Math.max(0, Math.min(1, volume));
      clip.source.volume = clip.volume * this.masterVolume;
    }
  }

  setPitch(id: string, pitch: number): void {
    const clip = this.playing.get(id) || this.paused.get(id);
    if (clip) {
      clip.pitch = Math.max(0.1, Math.min(4, pitch));
      // Note: Pitch change requires Web Audio API implementation
    }
  }

  setLoop(id: string, loop: boolean): void {
    const clip = this.playing.get(id) || this.paused.get(id);
    if (clip) {
      clip.loop = loop;
      clip.source.loop = loop;
    }
  }

  fadeIn(id: string, duration: number): void {
    const clip = this.playing.get(id);
    if (!clip) return;

    const startTime = this.context.currentTime;
    const endTime = startTime + duration;
    const startVolume = 0;
    const endVolume = clip.volume * this.masterVolume;

    const gainNode = this.context.createGain();
    gainNode.gain.setValueAtTime(startVolume, startTime);
    gainNode.gain.linearRampToValueAtTime(endVolume, endTime);

    // Connect through gain node
    // This would require Web Audio API implementation
  }

  fadeOut(id: string, duration: number): void {
    const clip = this.playing.get(id);
    if (!clip) return;

    const startTime = this.context.currentTime;
    const endTime = startTime + duration;
    const startVolume = clip.volume * this.masterVolume;
    const endVolume = 0;

    const gainNode = this.context.createGain();
    gainNode.gain.setValueAtTime(startVolume, startTime);
    gainNode.gain.linearRampToValueAtTime(endVolume, endTime);

    // Stop after fade out
    setTimeout(() => {
      this.stop(id);
    }, duration * 1000);
  }

  crossfade(fromId: string, toId: string, duration: number): void {
    this.fadeOut(fromId, duration);
    setTimeout(() => {
      this.play(toId);
    }, duration * 1000);
  }

  createMixer(name: string, parent?: string): AudioMixer {
    const mixer: AudioMixer = {
      name,
      volume: 1,
      muted: false,
      effects: [],
      clips: [],
      children: []
    };

    if (parent) {
      const parentMixer = this.mixers.get(parent);
      if (parentMixer) {
        mixer.parent = parentMixer;
        parentMixer.children.push(mixer);
      }
    }

    this.mixers.set(name, mixer);
    return mixer;
  }

  createPlaylist(id: string, name: string): AudioPlaylist {
    const playlist: AudioPlaylist = {
      id,
      name,
      tracks: [],
      currentTrack: 0,
      shuffle: false,
      repeat: 'none',
      crossfade: false,
      crossfadeTime: 0,
      play: () => {
        if (playlist.tracks.length > 0) {
          const track = playlist.tracks[playlist.currentTrack];
          this.play(track.id);
        }
      },
      pause: () => {
        if (playlist.tracks.length > 0) {
          const track = playlist.tracks[playlist.currentTrack];
          this.pause(track.id);
        }
      },
      stop: () => {
        if (playlist.tracks.length > 0) {
          const track = playlist.tracks[playlist.currentTrack];
          this.stop(track.id);
        }
      },
      next: () => {
        if (playlist.tracks.length > 0) {
          const currentTrack = playlist.tracks[playlist.currentTrack];
          this.stop(currentTrack.id);
          
          if (playlist.shuffle) {
            playlist.currentTrack = Math.floor(Math.random() * playlist.tracks.length);
          } else {
            playlist.currentTrack = (playlist.currentTrack + 1) % playlist.tracks.length;
          }
          
          const nextTrack = playlist.tracks[playlist.currentTrack];
          if (playlist.crossfade) {
            this.crossfade(currentTrack.id, nextTrack.id, playlist.crossfadeTime);
          } else {
            this.play(nextTrack.id);
          }
        }
      },
      previous: () => {
        if (playlist.tracks.length > 0) {
          const currentTrack = playlist.tracks[playlist.currentTrack];
          this.stop(currentTrack.id);
          
          playlist.currentTrack = playlist.currentTrack > 0 ? playlist.currentTrack - 1 : playlist.tracks.length - 1;
          
          const prevTrack = playlist.tracks[playlist.currentTrack];
          if (playlist.crossfade) {
            this.crossfade(currentTrack.id, prevTrack.id, playlist.crossfadeTime);
          } else {
            this.play(prevTrack.id);
          }
        }
      },
      addTrack: (clip: AudioClip) => {
        playlist.tracks.push(clip);
      },
      removeTrack: (id: string) => {
        playlist.tracks = playlist.tracks.filter(track => track.id !== id);
      },
      setTrack: (index: number) => {
        if (index >= 0 && index < playlist.tracks.length) {
          playlist.currentTrack = index;
        }
      }
    };

    this.playlists.set(id, playlist);
    return playlist;
  }

  addEffect(effect: AudioEffect): void {
    this.effects.set(effect.name, effect);
  }

  removeEffect(name: string): void {
    this.effects.delete(name);
  }

  setSpatialSettings(settings: Partial<SpatialAudioSettings>): void {
    Object.assign(this.spatialSettings, settings);
  }

  updateSpatialAudio(listenerPosition: Vector3D, listenerOrientation: Vector3D): void {
    this.spatialSettings.listenerPosition = listenerPosition;
    this.spatialSettings.listenerOrientation = listenerOrientation;

    // Update all spatial audio clips
    this.playing.forEach(clip => {
      if (clip.spatial && clip.position) {
        this.applySpatialAudio(clip);
      }
    });
  }

  private applySpatialAudio(clip: AudioClip): void {
    if (!clip.position) return;

    // Calculate distance
    const dx = clip.position.x - this.spatialSettings.listenerPosition.x;
    const dy = clip.position.y - this.spatialSettings.listenerPosition.y;
    const dz = clip.position.z - this.spatialSettings.listenerPosition.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Calculate volume based on distance
    let volume = 1;
    if (distance > this.spatialSettings.refDistance) {
      if (this.spatialSettings.distanceModel === 'linear') {
        volume = Math.max(0, 1 - (distance - this.spatialSettings.refDistance) / (this.spatialSettings.maxDistance - this.spatialSettings.refDistance));
      } else if (this.spatialSettings.distanceModel === 'inverse') {
        volume = this.spatialSettings.refDistance / (this.spatialSettings.refDistance + this.spatialSettings.rolloffFactor * (distance - this.spatialSettings.refDistance));
      } else { // exponential
        volume = Math.pow(this.spatialSettings.refDistance / distance, this.spatialSettings.rolloffFactor);
      }
    }

    // Apply distance-based volume
    clip.source.volume = clip.volume * this.masterVolume * volume;

    // Apply stereo panning based on horizontal position
    const stereoPan = Math.max(-1, Math.min(1, dx / this.spatialSettings.maxDistance));
    void stereoPan;
    // Note: Stereo panning requires Web Audio API implementation
  }

  private applyEffects(clip: AudioClip): void {
    // Apply effects based on clip category
    const mixer = this.mixers.get(clip.category);
    if (mixer) {
      mixer.effects.forEach(effect => {
        if (effect.enabled) {
          // Apply effect using Web Audio API
          // This would require full Web Audio API implementation
        }
      });
    }
  }

  destroy(): void {
    this.stopAll();
    this.clips.clear();
    this.mixers.clear();
    this.playlists.clear();
    this.effects.clear();
    
    if (this.context && this.context.state !== 'closed') {
      this.context.close();
    }
  }
}

// Audio Utility Functions
export class AudioUtils {
  static createTone(frequency: number, duration: number, type: OscillatorType = 'sine'): AudioClip {
    const AudioContextCtor = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      throw new Error('Web Audio API not supported');
    }
    const audioContext = new AudioContextCtor();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
    
    return {
      id: `tone_${frequency}_${Date.now()}`,
      source: null as unknown as HTMLAudioElement,
      volume: 1,
      pitch: 1,
      loop: false,
      spatial: false,
      maxDistance: 100,
      rolloffFactor: 1,
      dopplerFactor: 1,
      category: AudioCategory.SFX,
      priority: AudioPriority.NORMAL,
      fadeInTime: 0,
      fadeOutTime: 0,
      crossfadeTime: 0
    };
  }

  static createNoise(duration: number, color: 'white' | 'pink' | 'brown' = 'white'): AudioClip {
    const AudioContextCtor = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      throw new Error('Web Audio API not supported');
    }
    const audioContext = new AudioContextCtor();
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      let noise = Math.random() * 2 - 1;
      
      if (color === 'pink') {
        // Simple pink noise approximation
        noise *= Math.pow(i / bufferSize, 0.5);
      } else if (color === 'brown') {
        // Simple brown noise approximation
        noise *= Math.pow(i / bufferSize, 1);
      }
      
      data[i] = noise;
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.start();
    
    return {
      id: `noise_${color}_${Date.now()}`,
      source: null as unknown as HTMLAudioElement,
      volume: 1,
      pitch: 1,
      loop: false,
      spatial: false,
      maxDistance: 100,
      rolloffFactor: 1,
      dopplerFactor: 1,
      category: AudioCategory.SFX,
      priority: AudioPriority.NORMAL,
      fadeInTime: 0,
      fadeOutTime: 0,
      crossfadeTime: 0
    };
  }

  static createChord(frequencies: number[], duration: number, type: OscillatorType = 'sine'): AudioClip {
    const AudioContextCtor = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      throw new Error('Web Audio API not supported');
    }
    const audioContext = new AudioContextCtor();
    const gainNode = audioContext.createGain();
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    frequencies.forEach(frequency => {
      const oscillator = audioContext.createOscillator();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      oscillator.connect(gainNode);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    });
    
    gainNode.connect(audioContext.destination);
    
    return {
      id: `chord_${frequencies.join('_')}_${Date.now()}`,
      source: null as unknown as HTMLAudioElement,
      volume: 1,
      pitch: 1,
      loop: false,
      spatial: false,
      maxDistance: 100,
      rolloffFactor: 1,
      dopplerFactor: 1,
      category: AudioCategory.SFX,
      priority: AudioPriority.NORMAL,
      fadeInTime: 0,
      fadeOutTime: 0,
      crossfadeTime: 0
    };
  }

  static createSweep(startFreq: number, endFreq: number, duration: number, type: OscillatorType = 'sine'): AudioClip {
    const AudioContextCtor = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      throw new Error('Web Audio API not supported');
    }
    const audioContext = new AudioContextCtor();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFreq, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(endFreq, audioContext.currentTime + duration);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
    
    return {
      id: `sweep_${startFreq}_${endFreq}_${Date.now()}`,
      source: null as unknown as HTMLAudioElement,
      volume: 1,
      pitch: 1,
      loop: false,
      spatial: false,
      maxDistance: 100,
      rolloffFactor: 1,
      dopplerFactor: 1,
      category: AudioCategory.SFX,
      priority: AudioPriority.NORMAL,
      fadeInTime: 0,
      fadeOutTime: 0,
      crossfadeTime: 0
    };
  }
}

// Export the main AudioManager class
export const AudioManager = AudioManagerImpl;
export default AudioManagerImpl;

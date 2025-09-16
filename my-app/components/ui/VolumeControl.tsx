'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface VolumeControlProps {
  className?: string;
  onVolumeChange?: (volume: number) => void;
  onMuteToggle?: (muted: boolean) => void;
}

export default function VolumeControl({ 
  className, 
  onVolumeChange, 
  onMuteToggle 
}: VolumeControlProps) {
  const [masterVolume, setMasterVolume] = useState(1.0);
  const [sfxVolume, setSfxVolume] = useState(0.8);
  const [musicVolume, setMusicVolume] = useState(0.6);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load saved settings
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lester-arcade-audio-config');
      if (saved) {
        try {
          const config = JSON.parse(saved);
          setMasterVolume(config.masterVolume || 1.0);
          setSfxVolume(config.sfxVolume || 0.8);
          setMusicVolume(config.musicVolume || 0.6);
          setIsMuted(config.muted || false);
        } catch (error) {
          console.warn('Failed to load audio config:', error);
        }
      }
    }
  }, []);

  // Save settings
  const saveConfig = (config: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lester-arcade-audio-config', JSON.stringify(config));
    }
  };

  const handleMasterVolumeChange = (value: number) => {
    setMasterVolume(value);
    const config = { masterVolume: value, sfxVolume, musicVolume, muted: isMuted };
    saveConfig(config);
    onVolumeChange?.(value);
  };

  const handleSfxVolumeChange = (value: number) => {
    setSfxVolume(value);
    const config = { masterVolume, sfxVolume: value, musicVolume, muted: isMuted };
    saveConfig(config);
  };

  const handleMusicVolumeChange = (value: number) => {
    setMusicVolume(value);
    const config = { masterVolume, sfxVolume, musicVolume: value, muted: isMuted };
    saveConfig(config);
  };

  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    const config = { masterVolume, sfxVolume, musicVolume, muted: newMuted };
    saveConfig(config);
    onMuteToggle?.(newMuted);
  };

  const formatVolume = (volume: number) => Math.round(volume * 100);

  return (
    <div className={cn("relative", className)}>
      {/* Main Volume Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-1 px-2 py-1 text-xs font-mono font-medium transition-all duration-200 border rounded ${
          !isMuted 
            ? 'text-green-400 border-green-500/30 bg-green-900/20 hover:bg-green-900/30' 
            : 'text-red-400 border-red-500/30 bg-red-900/20 hover:bg-red-900/30'
        }`}
      >
        <span onClick={(e) => { e.stopPropagation(); handleMuteToggle(); }} className="cursor-pointer">
          {isMuted ? '🔇' : masterVolume > 0.5 ? '🔊' : masterVolume > 0 ? '🔉' : '🔈'}
        </span>
        <span>
          {isMuted ? 'AUDIO.off' : 'AUDIO.exe'}
        </span>
        <span className={cn(
          "text-xs transition-transform duration-200",
          isExpanded ? "rotate-180" : ""
        )}>
          ▼
        </span>
      </button>

      {/* Expanded Volume Panel */}
      {isExpanded && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-black/95 border border-green-500/30 rounded-lg p-4 shadow-2xl shadow-green-500/20 z-50">
          <div className="space-y-4">
            <div className="text-green-300 text-sm font-mono mb-3">AUDIO CONTROLS</div>
            
            {/* Master Volume */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-green-400 text-xs font-mono">MASTER</label>
                <span className="text-green-500 text-xs font-mono">{formatVolume(masterVolume)}%</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={masterVolume}
                  onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider-green"
                />
                <div 
                  className="absolute top-0 left-0 h-2 bg-green-500 rounded-lg pointer-events-none"
                  style={{ width: `${masterVolume * 100}%` }}
                />
              </div>
            </div>

            {/* SFX Volume */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-green-400 text-xs font-mono">SFX</label>
                <span className="text-green-500 text-xs font-mono">{formatVolume(sfxVolume)}%</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={sfxVolume}
                  onChange={(e) => handleSfxVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider-green"
                />
                <div 
                  className="absolute top-0 left-0 h-2 bg-green-500 rounded-lg pointer-events-none"
                  style={{ width: `${sfxVolume * 100}%` }}
                />
              </div>
            </div>

            {/* Music Volume */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-green-400 text-xs font-mono">MUSIC</label>
                <span className="text-green-500 text-xs font-mono">{formatVolume(musicVolume)}%</span>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={musicVolume}
                  onChange={(e) => handleMusicVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider-green"
                />
                <div 
                  className="absolute top-0 left-0 h-2 bg-green-500 rounded-lg pointer-events-none"
                  style={{ width: `${musicVolume * 100}%` }}
                />
              </div>
            </div>

            {/* Audio Test Buttons */}
            <div className="pt-2 border-t border-green-500/20">
              <div className="text-green-400 text-xs font-mono mb-2">TEST SOUNDS</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    // Play test beep
                    if (typeof window !== 'undefined' && !isMuted) {
                      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                      const oscillator = audioContext.createOscillator();
                      const gainNode = audioContext.createGain();
                      
                      oscillator.connect(gainNode);
                      gainNode.connect(audioContext.destination);
                      
                      oscillator.frequency.value = 800;
                      oscillator.type = 'sine';
                      
                      gainNode.gain.setValueAtTime(0.1 * masterVolume * sfxVolume, audioContext.currentTime);
                      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                      
                      oscillator.start(audioContext.currentTime);
                      oscillator.stop(audioContext.currentTime + 0.2);
                    }
                  }}
                  className="px-2 py-1 bg-green-900/30 hover:bg-green-800/50 rounded text-xs text-green-400 transition-colors"
                >
                  🔊 BEEP
                </button>
                <button
                  onClick={() => {
                    // Play test chord
                    if (typeof window !== 'undefined' && !isMuted) {
                      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                      const gainNode = audioContext.createGain();
                      gainNode.connect(audioContext.destination);
                      
                      [440, 554.37, 659.25].forEach(freq => {
                        const oscillator = audioContext.createOscillator();
                        oscillator.connect(gainNode);
                        oscillator.frequency.value = freq;
                        oscillator.type = 'sine';
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.5);
                      });
                      
                      gainNode.gain.setValueAtTime(0.05 * masterVolume * musicVolume, audioContext.currentTime);
                      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                    }
                  }}
                  className="px-2 py-1 bg-green-900/30 hover:bg-green-800/50 rounded text-xs text-green-400 transition-colors"
                >
                  🎵 CHORD
                </button>
              </div>
            </div>

            {/* Mute Button */}
            <button
              onClick={handleMuteToggle}
              className={cn(
                "w-full px-3 py-2 rounded text-sm font-mono transition-colors",
                isMuted 
                  ? "bg-red-900/30 border border-red-500/50 text-red-400 hover:bg-red-800/50"
                  : "bg-green-900/30 border border-green-500/50 text-green-400 hover:bg-green-800/50"
              )}
            >
              {isMuted ? '🔇 UNMUTE' : '🔇 MUTE ALL'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/themes';
import { useAudio } from '@/lib/audio';
import { animationManager } from '@/lib/animations';

interface SettingsPageProps {
  onClose: () => void;
}

interface SettingsConfig {
  // Audio Settings
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  voiceVolume: number;
  muted: boolean;
  
  // Visual Settings
  theme: string;
  animations: boolean;
  particles: boolean;
  matrixRain: boolean;
  glowEffects: boolean;
  
  // Game Settings
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  autoSave: boolean;
  showTutorials: boolean;
  keyboardShortcuts: boolean;
  
  // Performance Settings
  quality: 'low' | 'medium' | 'high' | 'ultra';
  fps: number;
  vsync: boolean;
  
  // Accessibility Settings
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

const defaultSettings: SettingsConfig = {
  masterVolume: 1.0,
  sfxVolume: 0.8,
  musicVolume: 0.6,
  voiceVolume: 0.7,
  muted: false,
  theme: 'matrix',
  animations: true,
  particles: true,
  matrixRain: true,
  glowEffects: true,
  difficulty: 'normal',
  autoSave: true,
  showTutorials: true,
  keyboardShortcuts: true,
  quality: 'high',
  fps: 60,
  vsync: true,
  highContrast: false,
  largeText: false,
  screenReader: false,
  colorBlindMode: 'none'
};

export default function SettingsPage({ onClose }: SettingsPageProps) {
  const [settings, setSettings] = useState<SettingsConfig>(defaultSettings);
  const [activeTab, setActiveTab] = useState<'audio' | 'visual' | 'game' | 'performance' | 'accessibility'>('audio');
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { currentTheme, availableThemes, setTheme } = useTheme();
  const { 
    setMasterVolume, 
    setSFXVolume, 
    setMusicVolume, 
    setVoiceVolume, 
    setMuted,
    getConfig: getAudioConfig 
  } = useAudio();

  // Load settings on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const saved = localStorage.getItem('lester-arcade-settings');
        if (saved) {
          const parsedSettings = JSON.parse(saved);
          setSettings({ ...defaultSettings, ...parsedSettings });
        }
      } catch (error) {
        console.warn('Failed to load settings:', error);
      }
      setIsLoading(false);
    };

    loadSettings();
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: SettingsConfig) => {
    try {
      localStorage.setItem('lester-arcade-settings', JSON.stringify(newSettings));
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  // Update setting
  const updateSetting = <K extends keyof SettingsConfig>(
    key: K, 
    value: SettingsConfig[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setHasChanges(true);
    
    // Apply changes immediately for certain settings
    applySettingChange(key, value);
  };

  // Apply setting change immediately
  const applySettingChange = <K extends keyof SettingsConfig>(
    key: K, 
    value: SettingsConfig[K]
  ) => {
    switch (key) {
      case 'masterVolume':
        setMasterVolume(value as number);
        break;
      case 'sfxVolume':
        setSFXVolume(value as number);
        break;
      case 'musicVolume':
        setMusicVolume(value as number);
        break;
      case 'voiceVolume':
        setVoiceVolume(value as number);
        break;
      case 'muted':
        setMuted(value as boolean);
        break;
      case 'theme':
        setTheme(value as string);
        break;
      case 'animations':
        if (!(value as boolean)) {
          animationManager.stopAllAnimations();
        }
        break;
    }
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  // Save and close
  const handleSave = () => {
    saveSettings(settings);
    onClose();
  };

  // Cancel changes
  const handleCancel = () => {
    setHasChanges(false);
    onClose();
  };

  // Tab configuration
  const tabs = [
    { id: 'audio', label: 'Audio', icon: '🔊' },
    { id: 'visual', label: 'Visual', icon: '🎨' },
    { id: 'game', label: 'Game', icon: '🎮' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' }
  ] as const;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center">
        <div className="text-green-400 font-mono text-xl animate-pulse">
          Loading Settings...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-green-500/30 rounded-lg shadow-2xl shadow-green-500/20 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-green-500/30">
          <h2 className="text-2xl font-mono font-bold text-green-400">
            [SYSTEM] SETTINGS
          </h2>
          <div className="flex items-center space-x-4">
            {hasChanges && (
              <span className="text-yellow-400 text-sm font-mono">
                [UNSAVED CHANGES]
              </span>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl font-mono"
            >
              [×]
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-64 bg-gray-800 border-r border-green-500/30 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-md font-mono text-sm transition-all duration-200',
                    activeTab === tab.id
                      ? 'bg-green-900/30 text-green-400 border border-green-500/50'
                      : 'text-gray-300 hover:text-green-400 hover:bg-green-900/20'
                  )}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'audio' && (
              <div className="space-y-6">
                <h3 className="text-xl font-mono font-bold text-green-400 mb-4">
                  [AUDIO] SOUND CONFIGURATION
                </h3>
                
                {/* Master Volume */}
                <div className="space-y-2">
                  <label className="block text-sm font-mono text-gray-300">
                    Master Volume: {Math.round(settings.masterVolume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.masterVolume}
                    onChange={(e) => updateSetting('masterVolume', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* SFX Volume */}
                <div className="space-y-2">
                  <label className="block text-sm font-mono text-gray-300">
                    SFX Volume: {Math.round(settings.sfxVolume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.sfxVolume}
                    onChange={(e) => updateSetting('sfxVolume', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Music Volume */}
                <div className="space-y-2">
                  <label className="block text-sm font-mono text-gray-300">
                    Music Volume: {Math.round(settings.musicVolume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.musicVolume}
                    onChange={(e) => updateSetting('musicVolume', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Voice Volume */}
                <div className="space-y-2">
                  <label className="block text-sm font-mono text-gray-300">
                    Voice Volume: {Math.round(settings.voiceVolume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.voiceVolume}
                    onChange={(e) => updateSetting('voiceVolume', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Mute Toggle */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="muted"
                    checked={settings.muted}
                    onChange={(e) => updateSetting('muted', e.target.checked)}
                    className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                  />
                  <label htmlFor="muted" className="text-sm font-mono text-gray-300">
                    Mute All Audio
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'visual' && (
              <div className="space-y-6">
                <h3 className="text-xl font-mono font-bold text-green-400 mb-4">
                  [VISUAL] APPEARANCE CONFIGURATION
                </h3>
                
                {/* Theme Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-mono text-gray-300">
                    Theme
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {availableThemes.map((theme) => (
                      <button
                        key={theme.name}
                        onClick={() => updateSetting('theme', theme.name)}
                        className={cn(
                          'p-3 rounded-md border text-left transition-all duration-200',
                          settings.theme === theme.name
                            ? 'border-green-500 bg-green-900/30 text-green-400'
                            : 'border-gray-600 text-gray-300 hover:border-green-500 hover:text-green-400'
                        )}
                      >
                        <div className="font-mono text-sm font-medium">
                          {theme.displayName}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {theme.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visual Effects */}
                <div className="space-y-4">
                  <h4 className="text-lg font-mono font-semibold text-green-400">
                    Visual Effects
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="animations"
                        checked={settings.animations}
                        onChange={(e) => updateSetting('animations', e.target.checked)}
                        className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                      />
                      <label htmlFor="animations" className="text-sm font-mono text-gray-300">
                        Enable Animations
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="particles"
                        checked={settings.particles}
                        onChange={(e) => updateSetting('particles', e.target.checked)}
                        className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                      />
                      <label htmlFor="particles" className="text-sm font-mono text-gray-300">
                        Particle Effects
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="matrixRain"
                        checked={settings.matrixRain}
                        onChange={(e) => updateSetting('matrixRain', e.target.checked)}
                        className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                      />
                      <label htmlFor="matrixRain" className="text-sm font-mono text-gray-300">
                        Matrix Rain Effect
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="glowEffects"
                        checked={settings.glowEffects}
                        onChange={(e) => updateSetting('glowEffects', e.target.checked)}
                        className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                      />
                      <label htmlFor="glowEffects" className="text-sm font-mono text-gray-300">
                        Glow Effects
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'game' && (
              <div className="space-y-6">
                <h3 className="text-xl font-mono font-bold text-green-400 mb-4">
                  [GAME] GAMEPLAY CONFIGURATION
                </h3>
                
                {/* Difficulty */}
                <div className="space-y-3">
                  <label className="block text-sm font-mono text-gray-300">
                    Difficulty Level
                  </label>
                  <select
                    value={settings.difficulty}
                    onChange={(e) => updateSetting('difficulty', e.target.value as SettingsConfig['difficulty'])}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-green-400 font-mono focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="normal">Normal</option>
                    <option value="hard">Hard</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                {/* Game Options */}
                <div className="space-y-4">
                  <h4 className="text-lg font-mono font-semibold text-green-400">
                    Game Options
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="autoSave"
                        checked={settings.autoSave}
                        onChange={(e) => updateSetting('autoSave', e.target.checked)}
                        className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                      />
                      <label htmlFor="autoSave" className="text-sm font-mono text-gray-300">
                        Auto Save Progress
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="showTutorials"
                        checked={settings.showTutorials}
                        onChange={(e) => updateSetting('showTutorials', e.target.checked)}
                        className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                      />
                      <label htmlFor="showTutorials" className="text-sm font-mono text-gray-300">
                        Show Tutorials
                      </label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="keyboardShortcuts"
                        checked={settings.keyboardShortcuts}
                        onChange={(e) => updateSetting('keyboardShortcuts', e.target.checked)}
                        className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                      />
                      <label htmlFor="keyboardShortcuts" className="text-sm font-mono text-gray-300">
                        Enable Keyboard Shortcuts
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                <h3 className="text-xl font-mono font-bold text-green-400 mb-4">
                  [PERFORMANCE] SYSTEM OPTIMIZATION
                </h3>
                
                {/* Quality Settings */}
                <div className="space-y-3">
                  <label className="block text-sm font-mono text-gray-300">
                    Graphics Quality
                  </label>
                  <select
                    value={settings.quality}
                    onChange={(e) => updateSetting('quality', e.target.value as SettingsConfig['quality'])}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-green-400 font-mono focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="ultra">Ultra</option>
                  </select>
                </div>

                {/* FPS Settings */}
                <div className="space-y-2">
                  <label className="block text-sm font-mono text-gray-300">
                    Target FPS: {settings.fps}
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="144"
                    step="1"
                    value={settings.fps}
                    onChange={(e) => updateSetting('fps', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* VSync */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="vsync"
                    checked={settings.vsync}
                    onChange={(e) => updateSetting('vsync', e.target.checked)}
                    className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                  />
                  <label htmlFor="vsync" className="text-sm font-mono text-gray-300">
                    Enable VSync
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'accessibility' && (
              <div className="space-y-6">
                <h3 className="text-xl font-mono font-bold text-green-400 mb-4">
                  [ACCESSIBILITY] USER ASSISTANCE
                </h3>
                
                {/* Accessibility Options */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="highContrast"
                      checked={settings.highContrast}
                      onChange={(e) => updateSetting('highContrast', e.target.checked)}
                      className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                    />
                    <label htmlFor="highContrast" className="text-sm font-mono text-gray-300">
                      High Contrast Mode
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="largeText"
                      checked={settings.largeText}
                      onChange={(e) => updateSetting('largeText', e.target.checked)}
                      className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                    />
                    <label htmlFor="largeText" className="text-sm font-mono text-gray-300">
                      Large Text
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="screenReader"
                      checked={settings.screenReader}
                      onChange={(e) => updateSetting('screenReader', e.target.checked)}
                      className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                    />
                    <label htmlFor="screenReader" className="text-sm font-mono text-gray-300">
                      Screen Reader Support
                    </label>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-mono text-gray-300">
                      Color Blind Mode
                    </label>
                    <select
                      value={settings.colorBlindMode}
                      onChange={(e) => updateSetting('colorBlindMode', e.target.value as SettingsConfig['colorBlindMode'])}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-green-400 font-mono focus:border-green-500 focus:ring-1 focus:ring-green-500"
                    >
                      <option value="none">None</option>
                      <option value="protanopia">Protanopia</option>
                      <option value="deuteranopia">Deuteranopia</option>
                      <option value="tritanopia">Tritanopia</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-green-500/30">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 text-sm font-mono text-gray-400 hover:text-white border border-gray-600 rounded-md hover:border-gray-500 transition-colors duration-200"
          >
            [RESET DEFAULTS]
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleCancel}
              className="px-6 py-2 text-sm font-mono text-gray-400 hover:text-white border border-gray-600 rounded-md hover:border-gray-500 transition-colors duration-200"
            >
              [CANCEL]
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 text-sm font-mono text-green-400 hover:text-white bg-green-900/30 border border-green-500/50 rounded-md hover:bg-green-800/40 hover:border-green-400 transition-colors duration-200"
            >
              [SAVE SETTINGS]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

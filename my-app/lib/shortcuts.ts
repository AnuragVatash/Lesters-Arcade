'use client';

// Comprehensive Keyboard Shortcuts System for Lester's Arcade
// This file contains all keyboard shortcuts, hotkeys, and key combination management

export interface Shortcut {
  id: string;
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  category: 'navigation' | 'game' | 'ui' | 'debug' | 'accessibility';
  action: () => void;
  enabled: boolean;
  global: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

export interface ShortcutGroup {
  name: string;
  description: string;
  shortcuts: Shortcut[];
}

export interface ShortcutConfig {
  enabled: boolean;
  showHints: boolean;
  hintDelay: number;
  globalShortcuts: boolean;
}

// Default shortcut configuration
const defaultConfig: ShortcutConfig = {
  enabled: true,
  showHints: true,
  hintDelay: 2000,
  globalShortcuts: true
};

// Keyboard Shortcuts Manager Class
export class ShortcutManager {
  private static instance: ShortcutManager;
  private shortcuts: Map<string, Shortcut> = new Map();
  private config: ShortcutConfig;
  private listeners: Set<(shortcut: Shortcut) => void> = new Set();
  private keyHistory: string[] = [];
  private hintTimeout: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = this.loadConfig();
    this.initializeDefaultShortcuts();
    this.setupEventListeners();
  }

  static getInstance(): ShortcutManager {
    if (!ShortcutManager.instance) {
      ShortcutManager.instance = new ShortcutManager();
    }
    return ShortcutManager.instance;
  }

  // Load configuration from localStorage
  private loadConfig(): ShortcutConfig {
    if (typeof window === 'undefined') return defaultConfig;

    try {
      const saved = localStorage.getItem('lester-arcade-shortcuts');
      if (saved) {
        return { ...defaultConfig, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load shortcut config:', error);
    }

    return defaultConfig;
  }

  // Save configuration to localStorage
  private saveConfig(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('lester-arcade-shortcuts', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save shortcut config:', error);
    }
  }

  // Initialize default shortcuts
  private initializeDefaultShortcuts(): void {
    // Navigation shortcuts
    this.addShortcut({
      id: 'nav-casino',
      key: '1',
      description: 'Switch to Casino Game',
      category: 'navigation',
      action: () => this.triggerNavigation('casino'),
      enabled: true,
      global: true
    });

    this.addShortcut({
      id: 'nav-cayo',
      key: '2',
      description: 'Switch to Cayo Game',
      category: 'navigation',
      action: () => this.triggerNavigation('cayo'),
      enabled: true,
      global: true
    });

    this.addShortcut({
      id: 'nav-number',
      key: '3',
      description: 'Switch to Number Finder',
      category: 'navigation',
      action: () => this.triggerNavigation('number'),
      enabled: true,
      global: true
    });

    this.addShortcut({
      id: 'nav-leaderboard',
      key: 'l',
      ctrlKey: true,
      description: 'Open Leaderboard',
      category: 'navigation',
      action: () => this.triggerNavigation('leaderboard'),
      enabled: true,
      global: true
    });

    this.addShortcut({
      id: 'nav-settings',
      key: 's',
      ctrlKey: true,
      description: 'Open Settings',
      category: 'navigation',
      action: () => this.triggerNavigation('settings'),
      enabled: true,
      global: true
    });

    // Game shortcuts
    this.addShortcut({
      id: 'game-start',
      key: 'Enter',
      description: 'Start Game',
      category: 'game',
      action: () => this.triggerGameAction('start'),
      enabled: true,
      global: false
    });

    this.addShortcut({
      id: 'game-submit',
      key: 'Enter',
      description: 'Submit Selection',
      category: 'game',
      action: () => this.triggerGameAction('submit'),
      enabled: true,
      global: false
    });

    this.addShortcut({
      id: 'game-reset',
      key: 'r',
      ctrlKey: true,
      description: 'Reset Game',
      category: 'game',
      action: () => this.triggerGameAction('reset'),
      enabled: true,
      global: false
    });

    this.addShortcut({
      id: 'game-pause',
      key: ' ',
      description: 'Pause/Resume Game',
      category: 'game',
      action: () => this.triggerGameAction('pause'),
      enabled: true,
      global: false
    });

    // UI shortcuts
    this.addShortcut({
      id: 'ui-fullscreen',
      key: 'f',
      ctrlKey: true,
      description: 'Toggle Fullscreen',
      category: 'ui',
      action: () => this.toggleFullscreen(),
      enabled: true,
      global: true
    });

    this.addShortcut({
      id: 'ui-zoom-in',
      key: '+',
      ctrlKey: true,
      description: 'Zoom In',
      category: 'ui',
      action: () => this.zoomIn(),
      enabled: true,
      global: true
    });

    this.addShortcut({
      id: 'ui-zoom-out',
      key: '-',
      ctrlKey: true,
      description: 'Zoom Out',
      category: 'ui',
      action: () => this.zoomOut(),
      enabled: true,
      global: true
    });

    this.addShortcut({
      id: 'ui-zoom-reset',
      key: '0',
      ctrlKey: true,
      description: 'Reset Zoom',
      category: 'ui',
      action: () => this.resetZoom(),
      enabled: true,
      global: true
    });

    // Debug shortcuts
    this.addShortcut({
      id: 'debug-console',
      key: 'F12',
      description: 'Open Developer Console',
      category: 'debug',
      action: () => this.openConsole(),
      enabled: true,
      global: true
    });

    this.addShortcut({
      id: 'debug-reload',
      key: 'r',
      ctrlKey: true,
      shiftKey: true,
      description: 'Hard Reload Page',
      category: 'debug',
      action: () => this.hardReload(),
      enabled: true,
      global: true
    });

    // Accessibility shortcuts
    this.addShortcut({
      id: 'access-high-contrast',
      key: 'h',
      ctrlKey: true,
      shiftKey: true,
      description: 'Toggle High Contrast',
      category: 'accessibility',
      action: () => this.toggleHighContrast(),
      enabled: true,
      global: true
    });

    this.addShortcut({
      id: 'access-large-text',
      key: 't',
      ctrlKey: true,
      shiftKey: true,
      description: 'Toggle Large Text',
      category: 'accessibility',
      action: () => this.toggleLargeText(),
      enabled: true,
      global: true
    });

    this.addShortcut({
      id: 'access-help',
      key: '?',
      description: 'Show Help',
      category: 'accessibility',
      action: () => this.showHelp(),
      enabled: true,
      global: true
    });
  }

  // Setup event listeners
  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  // Handle key down events
  private handleKeyDown(event: KeyboardEvent): void {
    if (!this.config.enabled) return;

    const shortcut = this.findShortcut(event);
    if (shortcut && shortcut.enabled) {
      if (shortcut.preventDefault) {
        event.preventDefault();
      }
      if (shortcut.stopPropagation) {
        event.stopPropagation();
      }

      shortcut.action();
      this.notifyListeners(shortcut);
      this.showHint(shortcut);
    }

    // Track key history for combo shortcuts
    this.keyHistory.push(event.key);
    if (this.keyHistory.length > 10) {
      this.keyHistory.shift();
    }
  }

  // Handle key up events
  private handleKeyUp(event: KeyboardEvent): void {
    // Clear key from history after a delay
    setTimeout(() => {
      const index = this.keyHistory.indexOf(event.key);
      if (index > -1) {
        this.keyHistory.splice(index, 1);
      }
    }, 100);
  }

  // Find matching shortcut
  private findShortcut(event: KeyboardEvent): Shortcut | undefined {
    for (const shortcut of this.shortcuts.values()) {
      if (shortcut.key.toLowerCase() === event.key.toLowerCase() &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.shiftKey === event.shiftKey &&
          !!shortcut.altKey === event.altKey &&
          !!shortcut.metaKey === event.metaKey) {
        return shortcut;
      }
    }
    return undefined;
  }

  // Add a shortcut
  addShortcut(shortcut: Shortcut): void {
    this.shortcuts.set(shortcut.id, shortcut);
  }

  // Remove a shortcut
  removeShortcut(id: string): boolean {
    return this.shortcuts.delete(id);
  }

  // Update a shortcut
  updateShortcut(id: string, updates: Partial<Shortcut>): boolean {
    const shortcut = this.shortcuts.get(id);
    if (!shortcut) return false;

    Object.assign(shortcut, updates);
    return true;
  }

  // Enable/disable a shortcut
  setShortcutEnabled(id: string, enabled: boolean): boolean {
    return this.updateShortcut(id, { enabled });
  }

  // Get all shortcuts
  getAllShortcuts(): Shortcut[] {
    return Array.from(this.shortcuts.values());
  }

  // Get shortcuts by category
  getShortcutsByCategory(category: Shortcut['category']): Shortcut[] {
    return this.getAllShortcuts().filter(shortcut => shortcut.category === category);
  }

  // Get enabled shortcuts
  getEnabledShortcuts(): Shortcut[] {
    return this.getAllShortcuts().filter(shortcut => shortcut.enabled);
  }

  // Get global shortcuts
  getGlobalShortcuts(): Shortcut[] {
    return this.getAllShortcuts().filter(shortcut => shortcut.global);
  }

  // Get shortcut by ID
  getShortcut(id: string): Shortcut | undefined {
    return this.shortcuts.get(id);
  }

  // Subscribe to shortcut events
  subscribe(listener: (shortcut: Shortcut) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify listeners
  private notifyListeners(shortcut: Shortcut): void {
    this.listeners.forEach(listener => listener(shortcut));
  }

  // Show shortcut hint
  private showHint(shortcut: Shortcut): void {
    if (!this.config.showHints) return;

    // Clear existing hint timeout
    if (this.hintTimeout) {
      clearTimeout(this.hintTimeout);
    }

    // Show hint
    this.displayHint(shortcut);

    // Auto-hide hint
    this.hintTimeout = setTimeout(() => {
      this.hideHint();
    }, this.config.hintDelay);
  }

  // Display hint
  private displayHint(shortcut: Shortcut): void {
    // Create hint element if it doesn't exist
    let hintElement = document.getElementById('shortcut-hint');
    if (!hintElement) {
      hintElement = document.createElement('div');
      hintElement.id = 'shortcut-hint';
      hintElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        color: #00FF41;
        padding: 10px 15px;
        border-radius: 5px;
        font-family: monospace;
        font-size: 14px;
        z-index: 10000;
        border: 1px solid #00FF41;
        box-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
      `;
      document.body.appendChild(hintElement);
    }

    // Update hint content
    const keys = [];
    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.shiftKey) keys.push('Shift');
    if (shortcut.altKey) keys.push('Alt');
    if (shortcut.metaKey) keys.push('Cmd');
    keys.push(shortcut.key.toUpperCase());

    hintElement.textContent = `${keys.join(' + ')}: ${shortcut.description}`;
    hintElement.style.display = 'block';
  }

  // Hide hint
  private hideHint(): void {
    const hintElement = document.getElementById('shortcut-hint');
    if (hintElement) {
      hintElement.style.display = 'none';
    }
  }

  // Configuration methods
  setConfig(config: Partial<ShortcutConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveConfig();
  }

  getConfig(): ShortcutConfig {
    return { ...this.config };
  }

  // Action methods
  private triggerNavigation(target: string): void {
    // This would trigger navigation events
    console.log(`Navigate to: ${target}`);
  }

  private triggerGameAction(action: string): void {
    // This would trigger game actions
    console.log(`Game action: ${action}`);
  }

  private toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  private zoomIn(): void {
    const currentZoom = parseFloat(document.documentElement.style.zoom || '1');
    document.documentElement.style.zoom = Math.min(currentZoom + 0.1, 2).toString();
  }

  private zoomOut(): void {
    const currentZoom = parseFloat(document.documentElement.style.zoom || '1');
    document.documentElement.style.zoom = Math.max(currentZoom - 0.1, 0.5).toString();
  }

  private resetZoom(): void {
    document.documentElement.style.zoom = '1';
  }

  private openConsole(): void {
    // This would open a custom console or focus the browser console
    console.log('Opening console...');
  }

  private hardReload(): void {
    window.location.reload();
  }

  private toggleHighContrast(): void {
    document.body.classList.toggle('high-contrast');
  }

  private toggleLargeText(): void {
    document.body.classList.toggle('large-text');
  }

  private showHelp(): void {
    // This would show a help modal
    console.log('Showing help...');
  }

  // Get shortcut groups for display
  getShortcutGroups(): ShortcutGroup[] {
    const groups: Record<string, ShortcutGroup> = {};

    this.getAllShortcuts().forEach(shortcut => {
      if (!groups[shortcut.category]) {
        groups[shortcut.category] = {
          name: this.getCategoryName(shortcut.category),
          description: this.getCategoryDescription(shortcut.category),
          shortcuts: []
        };
      }
      groups[shortcut.category].shortcuts.push(shortcut);
    });

    return Object.values(groups);
  }

  private getCategoryName(category: Shortcut['category']): string {
    switch (category) {
      case 'navigation': return 'Navigation';
      case 'game': return 'Game Controls';
      case 'ui': return 'User Interface';
      case 'debug': return 'Debug';
      case 'accessibility': return 'Accessibility';
      default: return 'Other';
    }
  }

  private getCategoryDescription(category: Shortcut['category']): string {
    switch (category) {
      case 'navigation': return 'Navigate between different sections of the application';
      case 'game': return 'Control game actions and interactions';
      case 'ui': return 'Manage user interface elements and display';
      case 'debug': return 'Debug and development tools';
      case 'accessibility': return 'Accessibility and assistance features';
      default: return 'Miscellaneous shortcuts';
    }
  }

  // Export shortcuts configuration
  exportShortcuts(): string {
    const data = {
      shortcuts: Object.fromEntries(this.shortcuts),
      config: this.config,
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  // Import shortcuts configuration
  importShortcuts(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.shortcuts) {
        this.shortcuts = new Map(Object.entries(parsed.shortcuts));
      }
      if (parsed.config) {
        this.config = { ...this.config, ...parsed.config };
      }
      
      this.saveConfig();
      return true;
    } catch (error) {
      console.error('Failed to import shortcuts:', error);
      return false;
    }
  }

  // Cleanup
  destroy(): void {
    if (this.hintTimeout) {
      clearTimeout(this.hintTimeout);
    }
    
    if (typeof window !== 'undefined') {
      document.removeEventListener('keydown', this.handleKeyDown.bind(this));
      document.removeEventListener('keyup', this.handleKeyUp.bind(this));
    }
    
    this.shortcuts.clear();
    this.listeners.clear();
  }
}

// Export singleton instance
export const shortcutManager = ShortcutManager.getInstance();

// React Hook for shortcuts
export const useShortcuts = () => {
  const manager = ShortcutManager.getInstance();
  
  return {
    addShortcut: (shortcut: Shortcut) => manager.addShortcut(shortcut),
    removeShortcut: (id: string) => manager.removeShortcut(id),
    updateShortcut: (id: string, updates: Partial<Shortcut>) => manager.updateShortcut(id, updates),
    setShortcutEnabled: (id: string, enabled: boolean) => manager.setShortcutEnabled(id, enabled),
    getAllShortcuts: () => manager.getAllShortcuts(),
    getShortcutsByCategory: (category: Shortcut['category']) => manager.getShortcutsByCategory(category),
    getEnabledShortcuts: () => manager.getEnabledShortcuts(),
    getGlobalShortcuts: () => manager.getGlobalShortcuts(),
    getShortcut: (id: string) => manager.getShortcut(id),
    subscribe: (listener: (shortcut: Shortcut) => void) => manager.subscribe(listener),
    setConfig: (config: Partial<ShortcutConfig>) => manager.setConfig(config),
    getConfig: () => manager.getConfig(),
    getShortcutGroups: () => manager.getShortcutGroups(),
    exportShortcuts: () => manager.exportShortcuts(),
    importShortcuts: (data: string) => manager.importShortcuts(data)
  };
};

// Utility functions
export const formatShortcutKey = (shortcut: Shortcut): string => {
  const keys = [];
  if (shortcut.ctrlKey) keys.push('Ctrl');
  if (shortcut.shiftKey) keys.push('Shift');
  if (shortcut.altKey) keys.push('Alt');
  if (shortcut.metaKey) keys.push('Cmd');
  keys.push(shortcut.key.toUpperCase());
  return keys.join(' + ');
};

export const createShortcut = (
  id: string,
  key: string,
  description: string,
  action: () => void,
  options: Partial<Shortcut> = {}
): Shortcut => {
  return {
    id,
    key,
    description,
    category: 'ui',
    action,
    enabled: true,
    global: false,
    preventDefault: true,
    stopPropagation: false,
    ...options
  };
};

export default ShortcutManager;

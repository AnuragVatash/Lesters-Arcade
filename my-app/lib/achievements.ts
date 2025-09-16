'use client';

// Comprehensive Achievement System for Lester's Arcade
// This file contains all achievement definitions, tracking, and management utilities

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'gameplay' | 'speed' | 'accuracy' | 'special' | 'collection' | 'social';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  requirements: AchievementRequirement[];
  rewards: AchievementReward[];
  hidden: boolean;
  secret: boolean;
}

export interface AchievementRequirement {
  type: 'time' | 'score' | 'accuracy' | 'streak' | 'count' | 'combo' | 'custom';
  target: number;
  current: number;
  description: string;
  gameType?: 'casino' | 'cayo' | 'number' | 'all';
}

export interface AchievementReward {
  type: 'points' | 'badge' | 'title' | 'unlock' | 'cosmetic';
  value: string | number;
  description: string;
}

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  maxProgress: number;
  completed: boolean;
  unlockedAt?: Date;
}

// Achievement Database
export const achievements: Record<string, Achievement> = {
  // Casino Game Achievements
  'casino-first-hack': {
    id: 'casino-first-hack',
    name: 'First Casino Hack',
    description: 'Complete your first casino fingerprint hack',
    icon: '🎰',
    category: 'gameplay',
    rarity: 'common',
    points: 10,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    requirements: [
      {
        type: 'count',
        target: 1,
        current: 0,
        description: 'Complete 1 casino hack',
        gameType: 'casino'
      }
    ],
    rewards: [
      {
        type: 'points',
        value: 10,
        description: '10 points'
      }
    ],
    hidden: false,
    secret: false
  },

  'casino-speed-demon': {
    id: 'casino-speed-demon',
    name: 'Speed Demon',
    description: 'Complete a casino hack in under 30 seconds',
    icon: '⚡',
    category: 'speed',
    rarity: 'uncommon',
    points: 25,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    requirements: [
      {
        type: 'time',
        target: 30000,
        current: 0,
        description: 'Complete casino hack in under 30 seconds',
        gameType: 'casino'
      }
    ],
    rewards: [
      {
        type: 'points',
        value: 25,
        description: '25 points'
      },
      {
        type: 'title',
        value: 'Speed Demon',
        description: 'Unlock "Speed Demon" title'
      }
    ],
    hidden: false,
    secret: false
  },

  'casino-perfect-score': {
    id: 'casino-perfect-score',
    name: 'Perfect Score',
    description: 'Complete 10 casino hacks without any mistakes',
    icon: '🎯',
    category: 'accuracy',
    rarity: 'rare',
    points: 50,
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    requirements: [
      {
        type: 'streak',
        target: 10,
        current: 0,
        description: 'Complete 10 casino hacks without mistakes',
        gameType: 'casino'
      }
    ],
    rewards: [
      {
        type: 'points',
        value: 50,
        description: '50 points'
      },
      {
        type: 'badge',
        value: 'perfect-casino',
        description: 'Perfect Casino Badge'
      }
    ],
    hidden: false,
    secret: false
  },

  'casino-master': {
    id: 'casino-master',
    name: 'Casino Master',
    description: 'Complete 100 casino hacks',
    icon: '👑',
    category: 'gameplay',
    rarity: 'epic',
    points: 100,
    unlocked: false,
    progress: 0,
    maxProgress: 100,
    requirements: [
      {
        type: 'count',
        target: 100,
        current: 0,
        description: 'Complete 100 casino hacks',
        gameType: 'casino'
      }
    ],
    rewards: [
      {
        type: 'points',
        value: 100,
        description: '100 points'
      },
      {
        type: 'title',
        value: 'Casino Master',
        description: 'Unlock "Casino Master" title'
      },
      {
        type: 'cosmetic',
        value: 'golden-fingerprint',
        description: 'Golden Fingerprint Cosmetic'
      }
    ],
    hidden: false,
    secret: false
  },

  // Cayo Game Achievements
  'cayo-first-breach': {
    id: 'cayo-first-breach',
    name: 'First Cayo Breach',
    description: 'Complete your first Cayo Perico breach',
    icon: '🏝️',
    category: 'gameplay',
    rarity: 'common',
    points: 10,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    requirements: [
      {
        type: 'count',
        target: 1,
        current: 0,
        description: 'Complete 1 Cayo breach',
        gameType: 'cayo'
      }
    ],
    rewards: [
      {
        type: 'points',
        value: 10,
        description: '10 points'
      }
    ],
    hidden: false,
    secret: false
  },

  'cayo-stealth-master': {
    id: 'cayo-stealth-master',
    name: 'Stealth Master',
    description: 'Complete 5 Cayo breaches without being detected',
    icon: '🥷',
    category: 'special',
    rarity: 'rare',
    points: 40,
    unlocked: false,
    progress: 0,
    maxProgress: 5,
    requirements: [
      {
        type: 'streak',
        target: 5,
        current: 0,
        description: 'Complete 5 Cayo breaches without detection',
        gameType: 'cayo'
      }
    ],
    rewards: [
      {
        type: 'points',
        value: 40,
        description: '40 points'
      },
      {
        type: 'title',
        value: 'Stealth Master',
        description: 'Unlock "Stealth Master" title'
      }
    ],
    hidden: false,
    secret: false
  },

  // Number Finder Achievements
  'number-finder-first': {
    id: 'number-finder-first',
    name: 'Number Finder',
    description: 'Complete your first number finder challenge',
    icon: '🔢',
    category: 'gameplay',
    rarity: 'common',
    points: 10,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    requirements: [
      {
        type: 'count',
        target: 1,
        current: 0,
        description: 'Complete 1 number finder challenge',
        gameType: 'number'
      }
    ],
    rewards: [
      {
        type: 'points',
        value: 10,
        description: '10 points'
      }
    ],
    hidden: false,
    secret: false
  },

  'number-finder-genius': {
    id: 'number-finder-genius',
    name: 'Number Genius',
    description: 'Find 50 numbers in a single session',
    icon: '🧠',
    category: 'collection',
    rarity: 'uncommon',
    points: 30,
    unlocked: false,
    progress: 0,
    maxProgress: 50,
    requirements: [
      {
        type: 'count',
        target: 50,
        current: 0,
        description: 'Find 50 numbers in one session',
        gameType: 'number'
      }
    ],
    rewards: [
      {
        type: 'points',
        value: 30,
        description: '30 points'
      },
      {
        type: 'title',
        value: 'Number Genius',
        description: 'Unlock "Number Genius" title'
      }
    ],
    hidden: false,
    secret: false
  },

  // Speed Achievements
  'lightning-fast': {
    id: 'lightning-fast',
    name: 'Lightning Fast',
    description: 'Complete any game in under 10 seconds',
    icon: '⚡',
    category: 'speed',
    rarity: 'rare',
    points: 60,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    requirements: [
      {
        type: 'time',
        target: 10000,
        current: 0,
        description: 'Complete any game in under 10 seconds',
        gameType: 'all'
      }
    ],
    rewards: [
      {
        type: 'points',
        value: 60,
        description: '60 points'
      },
      {
        type: 'title',
        value: 'Lightning Fast',
        description: 'Unlock "Lightning Fast" title'
      }
    ],
    hidden: false,
    secret: false
  },

  'speed-runner': {
    id: 'speed-runner',
    name: 'Speed Runner',
    description: 'Complete 20 games in under 30 seconds each',
    icon: '🏃',
    category: 'speed',
    rarity: 'epic',
    points: 80,
    unlocked: false,
    progress: 0,
    maxProgress: 20,
    requirements: [
      {
        type: 'count',
        target: 20,
        current: 0,
        description: 'Complete 20 games in under 30 seconds',
        gameType: 'all'
      }
    ],
    rewards: [
      {
        type: 'points',
        value: 80,
        description: '80 points'
      },
      {
        type: 'title',
        value: 'Speed Runner',
        description: 'Unlock "Speed Runner" title'
      }
    ],
    hidden: false,
    secret: false
  },

  // Accuracy Achievements
  'perfectionist': {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete 50 games with 100% accuracy',
    icon: '🎯',
    category: 'accuracy',
    rarity: 'epic',
    points: 100,
    unlocked: false,
    progress: 0,
    maxProgress: 50,
    requirements: [
      {
        type: 'count',
        target: 50,
        current: 0,
        description: 'Complete 50 games with 100% accuracy',
        gameType: 'all'
      }
    ],
    rewards: [
      {
        type: 'points',
        value: 100,
        description: '100 points'
      },
      {
        type: 'title',
        value: 'Perfectionist',
        description: 'Unlock "Perfectionist" title'
      }
    ],
    hidden: false,
    secret: false
  },

  // Special Achievements
  'hacker-legend': {
    id: 'hacker-legend',
    name: 'Hacker Legend',
    description: 'Unlock all other achievements',
    icon: '👑',
    category: 'special',
    rarity: 'legendary',
    points: 500,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    requirements: [
      {
        type: 'custom',
        target: 1,
        current: 0,
        description: 'Unlock all other achievements',
        gameType: 'all'
      }
    ],
    rewards: [
      {
        type: 'points',
        value: 500,
        description: '500 points'
      },
      {
        type: 'title',
        value: 'Hacker Legend',
        description: 'Unlock "Hacker Legend" title'
      },
      {
        type: 'cosmetic',
        value: 'legendary-crown',
        description: 'Legendary Crown Cosmetic'
      }
    ],
    hidden: false,
    secret: false
  },

  'secret-achievement': {
    id: 'secret-achievement',
    name: '???',
    description: '???',
    icon: '❓',
    category: 'special',
    rarity: 'legendary',
    points: 200,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    requirements: [
      {
        type: 'custom',
        target: 1,
        current: 0,
        description: '???',
        gameType: 'all'
      }
    ],
    rewards: [
      {
        type: 'points',
        value: 200,
        description: '200 points'
      }
    ],
    hidden: true,
    secret: true
  },

  // Collection Achievements
  'collector': {
    id: 'collector',
    name: 'Collector',
    description: 'Unlock 25 achievements',
    icon: '🏆',
    category: 'collection',
    rarity: 'rare',
    points: 75,
    unlocked: false,
    progress: 0,
    maxProgress: 25,
    requirements: [
      {
        type: 'count',
        target: 25,
        current: 0,
        description: 'Unlock 25 achievements',
        gameType: 'all'
      }
    ],
    rewards: [
      {
        type: 'points',
        value: 75,
        description: '75 points'
      },
      {
        type: 'title',
        value: 'Collector',
        description: 'Unlock "Collector" title'
      }
    ],
    hidden: false,
    secret: false
  },

  // Social Achievements
  'leaderboard-champion': {
    id: 'leaderboard-champion',
    name: 'Leaderboard Champion',
    description: 'Reach #1 on any leaderboard',
    icon: '🥇',
    category: 'social',
    rarity: 'epic',
    points: 150,
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    requirements: [
      {
        type: 'custom',
        target: 1,
        current: 0,
        description: 'Reach #1 on any leaderboard',
        gameType: 'all'
      }
    ],
    rewards: [
      {
        type: 'points',
        value: 150,
        description: '150 points'
      },
      {
        type: 'title',
        value: 'Champion',
        description: 'Unlock "Champion" title'
      }
    ],
    hidden: false,
    secret: false
  }
};

// Achievement Manager Class
export class AchievementManager {
  private static instance: AchievementManager;
  private achievements: Map<string, Achievement>;
  private progress: Map<string, AchievementProgress>;
  private listeners: Set<(achievement: Achievement) => void> = new Set();
  private stats: Map<string, number> = new Map();

  private constructor() {
    this.achievements = new Map(Object.entries(achievements));
    this.progress = new Map();
    this.loadProgress();
  }

  static getInstance(): AchievementManager {
    if (!AchievementManager.instance) {
      AchievementManager.instance = new AchievementManager();
    }
    return AchievementManager.instance;
  }

  // Load achievement progress from localStorage
  private loadProgress(): void {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem('lester-arcade-achievements');
      if (saved) {
        const data = JSON.parse(saved);
        this.progress = new Map(Object.entries(data.progress || {}));
        this.stats = new Map(Object.entries(data.stats || {}));
      }
    } catch (error) {
      console.warn('Failed to load achievement progress:', error);
    }
  }

  // Save achievement progress to localStorage
  private saveProgress(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = {
        progress: Object.fromEntries(this.progress),
        stats: Object.fromEntries(this.stats)
      };
      localStorage.setItem('lester-arcade-achievements', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save achievement progress:', error);
    }
  }

  // Get all achievements
  getAllAchievements(): Achievement[] {
    return Array.from(this.achievements.values());
  }

  // Get unlocked achievements
  getUnlockedAchievements(): Achievement[] {
    return this.getAllAchievements().filter(achievement => achievement.unlocked);
  }

  // Get locked achievements
  getLockedAchievements(): Achievement[] {
    return this.getAllAchievements().filter(achievement => !achievement.unlocked);
  }

  // Get achievements by category
  getAchievementsByCategory(category: Achievement['category']): Achievement[] {
    return this.getAllAchievements().filter(achievement => achievement.category === category);
  }

  // Get achievements by rarity
  getAchievementsByRarity(rarity: Achievement['rarity']): Achievement[] {
    return this.getAllAchievements().filter(achievement => achievement.rarity === rarity);
  }

  // Get achievement by ID
  getAchievement(id: string): Achievement | undefined {
    return this.achievements.get(id);
  }

  // Update game statistics
  updateStats(gameType: string, statType: string, value: number): void {
    const key = `${gameType}-${statType}`;
    const current = this.stats.get(key) || 0;
    this.stats.set(key, current + value);
    this.checkAchievements();
    this.saveProgress();
  }

  // Set game statistics
  setStats(gameType: string, statType: string, value: number): void {
    const key = `${gameType}-${statType}`;
    this.stats.set(key, value);
    this.checkAchievements();
    this.saveProgress();
  }

  // Get game statistics
  getStats(gameType: string, statType: string): number {
    const key = `${gameType}-${statType}`;
    return this.stats.get(key) || 0;
  }

  // Check if achievement requirements are met
  private checkAchievement(achievement: Achievement): boolean {
    return achievement.requirements.every(req => {
      switch (req.type) {
        case 'time':
          return this.getStats(req.gameType || 'all', 'best-time') <= req.target;
        case 'score':
          return this.getStats(req.gameType || 'all', 'best-score') >= req.target;
        case 'accuracy':
          return this.getStats(req.gameType || 'all', 'accuracy') >= req.target;
        case 'streak':
          return this.getStats(req.gameType || 'all', 'current-streak') >= req.target;
        case 'count':
          return this.getStats(req.gameType || 'all', 'total-completed') >= req.target;
        case 'combo':
          return this.getStats(req.gameType || 'all', 'max-combo') >= req.target;
        case 'custom':
          return this.checkCustomRequirement(achievement.id, req);
        default:
          return false;
      }
    });
  }

  // Check custom achievement requirements
  private checkCustomRequirement(achievementId: string, _requirement: AchievementRequirement): boolean {
    switch (achievementId) {
      case 'hacker-legend':
        return this.getUnlockedAchievements().length >= Object.keys(achievements).length - 1; // -1 for this achievement itself
      case 'secret-achievement':
        // Secret achievement - complete 1000 games total
        const totalGames = this.getStats('all', 'total-completed');
        return totalGames >= 1000;
      case 'leaderboard-champion':
        // This would need to be checked against actual leaderboard data
        return false; // Placeholder
      default:
        return false;
    }
  }

  // Check all achievements for completion
  private checkAchievements(): void {
    this.achievements.forEach((achievement, id) => {
      if (!achievement.unlocked && this.checkAchievement(achievement)) {
        this.unlockAchievement(id);
      }
    });
  }

  // Unlock an achievement
  private unlockAchievement(id: string): void {
    const achievement = this.achievements.get(id);
    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;
    achievement.unlockedAt = new Date();
    achievement.progress = achievement.maxProgress;

    // Update progress tracking
    this.progress.set(id, {
      achievementId: id,
      progress: achievement.maxProgress,
      maxProgress: achievement.maxProgress,
      completed: true,
      unlockedAt: achievement.unlockedAt
    });

    // Notify listeners
    this.listeners.forEach(listener => listener(achievement));

    this.saveProgress();
  }

  // Subscribe to achievement unlocks
  subscribe(listener: (achievement: Achievement) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Get total points earned
  getTotalPoints(): number {
    return this.getUnlockedAchievements().reduce((total, achievement) => total + achievement.points, 0);
  }

  // Get achievement progress
  getAchievementProgress(id: string): AchievementProgress | undefined {
    return this.progress.get(id);
  }

  // Get completion percentage
  getCompletionPercentage(): number {
    const total = this.achievements.size;
    const unlocked = this.getUnlockedAchievements().length;
    return total > 0 ? (unlocked / total) * 100 : 0;
  }

  // Get achievements by completion status
  getAchievementsByCompletion(completed: boolean): Achievement[] {
    return this.getAllAchievements().filter(achievement => achievement.unlocked === completed);
  }

  // Search achievements
  searchAchievements(query: string): Achievement[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getAllAchievements().filter(achievement => 
      achievement.name.toLowerCase().includes(lowercaseQuery) ||
      achievement.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Get recent achievements
  getRecentAchievements(limit: number = 5): Achievement[] {
    return this.getUnlockedAchievements()
      .filter(achievement => achievement.unlockedAt)
      .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
      .slice(0, limit);
  }

  // Reset all achievements
  resetAchievements(): void {
    this.achievements.forEach(achievement => {
      achievement.unlocked = false;
      achievement.unlockedAt = undefined;
      achievement.progress = 0;
    });
    this.progress.clear();
    this.stats.clear();
    this.saveProgress();
  }

  // Export achievements data
  exportAchievements(): string {
    const data = {
      achievements: Object.fromEntries(this.achievements),
      progress: Object.fromEntries(this.progress),
      stats: Object.fromEntries(this.stats),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  // Import achievements data
  importAchievements(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.achievements) {
        this.achievements = new Map(Object.entries(parsed.achievements));
      }
      if (parsed.progress) {
        this.progress = new Map(Object.entries(parsed.progress));
      }
      if (parsed.stats) {
        this.stats = new Map(Object.entries(parsed.stats));
      }
      
      this.saveProgress();
      return true;
    } catch (error) {
      console.error('Failed to import achievements:', error);
      return false;
    }
  }
}

// Export singleton instance
export const achievementManager = AchievementManager.getInstance();

// React Hook for achievements
export const useAchievements = () => {
  const manager = AchievementManager.getInstance();
  
  return {
    getAllAchievements: () => manager.getAllAchievements(),
    getUnlockedAchievements: () => manager.getUnlockedAchievements(),
    getLockedAchievements: () => manager.getLockedAchievements(),
    getAchievementsByCategory: (category: Achievement['category']) => manager.getAchievementsByCategory(category),
    getAchievementsByRarity: (rarity: Achievement['rarity']) => manager.getAchievementsByRarity(rarity),
    getAchievement: (id: string) => manager.getAchievement(id),
    updateStats: (gameType: string, statType: string, value: number) => manager.updateStats(gameType, statType, value),
    setStats: (gameType: string, statType: string, value: number) => manager.setStats(gameType, statType, value),
    getStats: (gameType: string, statType: string) => manager.getStats(gameType, statType),
    subscribe: (listener: (achievement: Achievement) => void) => manager.subscribe(listener),
    getTotalPoints: () => manager.getTotalPoints(),
    getAchievementProgress: (id: string) => manager.getAchievementProgress(id),
    getCompletionPercentage: () => manager.getCompletionPercentage(),
    getAchievementsByCompletion: (completed: boolean) => manager.getAchievementsByCompletion(completed),
    searchAchievements: (query: string) => manager.searchAchievements(query),
    getRecentAchievements: (limit?: number) => manager.getRecentAchievements(limit),
    resetAchievements: () => manager.resetAchievements(),
    exportAchievements: () => manager.exportAchievements(),
    importAchievements: (data: string) => manager.importAchievements(data)
  };
};

// Utility functions
export const getRarityColor = (rarity: Achievement['rarity']): string => {
  switch (rarity) {
    case 'common': return '#9CA3AF';
    case 'uncommon': return '#10B981';
    case 'rare': return '#3B82F6';
    case 'epic': return '#8B5CF6';
    case 'legendary': return '#F59E0B';
    default: return '#9CA3AF';
  }
};

export const getRarityName = (rarity: Achievement['rarity']): string => {
  switch (rarity) {
    case 'common': return 'Common';
    case 'uncommon': return 'Uncommon';
    case 'rare': return 'Rare';
    case 'epic': return 'Epic';
    case 'legendary': return 'Legendary';
    default: return 'Unknown';
  }
};

export const getCategoryName = (category: Achievement['category']): string => {
  switch (category) {
    case 'gameplay': return 'Gameplay';
    case 'speed': return 'Speed';
    case 'accuracy': return 'Accuracy';
    case 'special': return 'Special';
    case 'collection': return 'Collection';
    case 'social': return 'Social';
    default: return 'Unknown';
  }
};

export default AchievementManager;

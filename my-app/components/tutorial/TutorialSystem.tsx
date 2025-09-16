'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { animationManager } from '@/lib/animations';

// Comprehensive Tutorial System for Lester's Arcade
// This file contains interactive tutorials, guided tours, and help systems

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'hover' | 'type' | 'wait' | 'scroll';
  actionTarget?: string;
  actionValue?: string;
  delay?: number;
  skipable?: boolean;
  required?: boolean;
  animation?: 'fade' | 'slide' | 'zoom' | 'glow' | 'pulse';
  media?: {
    type: 'image' | 'video' | 'gif';
    url: string;
    alt?: string;
  };
  hints?: string[];
  validation?: (data: any) => boolean;
}

export interface Tutorial {
  id: string;
  name: string;
  description: string;
  category: 'getting-started' | 'advanced' | 'game-specific' | 'accessibility' | 'custom';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  steps: TutorialStep[];
  prerequisites?: string[];
  rewards?: {
    type: 'points' | 'badge' | 'unlock';
    value: string | number;
  }[];
  completed: boolean;
  progress: number;
  lastAccessed?: Date;
}

export interface TutorialProgress {
  tutorialId: string;
  currentStep: number;
  completedSteps: number[];
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number; // in seconds
  hintsUsed: number;
  skipsUsed: number;
}

// Tutorial Database
export const tutorials: Record<string, Tutorial> = {
  'getting-started': {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Learn the basics of Lester\'s Arcade',
    category: 'getting-started',
    difficulty: 'beginner',
    estimatedTime: 5,
    completed: false,
    progress: 0,
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Lester\'s Arcade',
        content: 'Welcome to Lester\'s Arcade! This tutorial will guide you through the basics of our hacking simulation games.',
        position: 'center',
        animation: 'fade',
        skipable: true
      },
      {
        id: 'navigation',
        title: 'Navigation',
        content: 'Use the navigation bar at the top to switch between different games and access the leaderboard.',
        target: 'nav',
        position: 'bottom',
        action: 'hover',
        actionTarget: 'nav',
        animation: 'glow'
      },
      {
        id: 'user-info',
        title: 'User Information',
        content: 'Your username and status are displayed in the top-left corner. Guest users have limited access to some features.',
        target: '.user-info',
        position: 'right',
        animation: 'pulse'
      },
      {
        id: 'game-selection',
        title: 'Game Selection',
        content: 'Click on any game button to start playing. Each game has its own unique hacking challenge.',
        target: '.game-nav',
        position: 'bottom',
        action: 'click',
        actionTarget: '.game-nav button:first-child',
        animation: 'glow'
      },
      {
        id: 'settings',
        title: 'Settings',
        content: 'Access settings and customization options by clicking the settings button or using Ctrl+S.',
        target: '.settings-btn',
        position: 'left',
        action: 'click',
        actionTarget: '.settings-btn',
        animation: 'pulse'
      }
    ],
    rewards: [
      {
        type: 'points',
        value: 50
      },
      {
        type: 'badge',
        value: 'tutorial-complete'
      }
    ]
  },

  'casino-tutorial': {
    id: 'casino-tutorial',
    name: 'Casino Fingerprint Hacking',
    description: 'Master the art of casino fingerprint hacking',
    category: 'game-specific',
    difficulty: 'beginner',
    estimatedTime: 10,
    completed: false,
    progress: 0,
    prerequisites: ['getting-started'],
    steps: [
      {
        id: 'casino-intro',
        title: 'Casino Hacking Challenge',
        content: 'In this game, you need to identify the correct fingerprint pieces to complete the hack. Look for the target fingerprint on the right.',
        position: 'center',
        animation: 'fade'
      },
      {
        id: 'fingerprint-pieces',
        title: 'Fingerprint Pieces',
        content: 'The left panel shows 8 fingerprint pieces. You need to select exactly 4 pieces that match the target fingerprint.',
        target: '.fingerprint-pieces',
        position: 'right',
        animation: 'glow'
      },
      {
        id: 'target-fingerprint',
        title: 'Target Fingerprint',
        content: 'The right panel shows the target fingerprint you need to recreate. Study it carefully before making your selections.',
        target: '.target-fingerprint',
        position: 'left',
        animation: 'pulse'
      },
      {
        id: 'selection-process',
        title: 'Making Selections',
        content: 'Click on fingerprint pieces to select them. Selected pieces will be highlighted. You can deselect by clicking again.',
        target: '.fingerprint-piece',
        position: 'top',
        action: 'click',
        actionTarget: '.fingerprint-piece:first-child',
        animation: 'glow'
      },
      {
        id: 'submit-selection',
        title: 'Submitting Your Selection',
        content: 'Once you have selected 4 pieces, press Enter or click the submit button to check your answer.',
        target: '.submit-btn',
        position: 'top',
        action: 'click',
        actionTarget: '.submit-btn',
        animation: 'pulse'
      },
      {
        id: 'scanning-process',
        title: 'Scanning Process',
        content: 'After submission, the system will scan your selection. If correct, you\'ll see a success message and your time will be recorded.',
        position: 'center',
        animation: 'fade'
      }
    ],
    rewards: [
      {
        type: 'points',
        value: 100
      },
      {
        type: 'unlock',
        value: 'casino-expert-mode'
      }
    ]
  },

  'cayo-tutorial': {
    id: 'cayo-tutorial',
    name: 'Cayo Perico Breach',
    description: 'Learn the Cayo Perico island breach techniques',
    category: 'game-specific',
    difficulty: 'intermediate',
    estimatedTime: 15,
    completed: false,
    progress: 0,
    prerequisites: ['getting-started'],
    steps: [
      {
        id: 'cayo-intro',
        title: 'Cayo Perico Island',
        content: 'Welcome to the Cayo Perico island breach. This is a more complex hacking challenge involving multiple security layers.',
        position: 'center',
        animation: 'fade'
      },
      {
        id: 'security-layers',
        title: 'Security Layers',
        content: 'The island has multiple security layers. You need to breach each layer in sequence to reach the main vault.',
        target: '.security-layers',
        position: 'bottom',
        animation: 'glow'
      },
      {
        id: 'timing-challenge',
        title: 'Timing Challenge',
        content: 'Each security layer has a timing window. You must complete the hack within the time limit to proceed.',
        target: '.timer',
        position: 'top',
        animation: 'pulse'
      },
      {
        id: 'pattern-recognition',
        title: 'Pattern Recognition',
        content: 'Look for patterns in the security codes. The correct sequence will unlock the next layer.',
        target: '.pattern-display',
        position: 'right',
        animation: 'glow'
      }
    ],
    rewards: [
      {
        type: 'points',
        value: 150
      },
      {
        type: 'badge',
        value: 'cayo-master'
      }
    ]
  },

  'number-finder-tutorial': {
    id: 'number-finder-tutorial',
    name: 'Number Finder Challenge',
    description: 'Master the number finding and sequence recognition',
    category: 'game-specific',
    difficulty: 'beginner',
    estimatedTime: 8,
    completed: false,
    progress: 0,
    prerequisites: ['getting-started'],
    steps: [
      {
        id: 'number-intro',
        title: 'Number Finder Challenge',
        content: 'In this challenge, you need to find specific numbers hidden in a complex pattern. Speed and accuracy are key.',
        position: 'center',
        animation: 'fade'
      },
      {
        id: 'number-grid',
        title: 'Number Grid',
        content: 'The grid contains many numbers. Your goal is to find the target numbers as quickly as possible.',
        target: '.number-grid',
        position: 'bottom',
        animation: 'glow'
      },
      {
        id: 'target-numbers',
        title: 'Target Numbers',
        content: 'The target numbers are displayed at the top. Click on matching numbers in the grid to select them.',
        target: '.target-numbers',
        position: 'top',
        animation: 'pulse'
      }
    ],
    rewards: [
      {
        type: 'points',
        value: 75
      }
    ]
  },

  'keyboard-shortcuts': {
    id: 'keyboard-shortcuts',
    name: 'Keyboard Shortcuts',
    description: 'Learn essential keyboard shortcuts for faster gameplay',
    category: 'advanced',
    difficulty: 'intermediate',
    estimatedTime: 5,
    completed: false,
    progress: 0,
    steps: [
      {
        id: 'shortcuts-intro',
        title: 'Keyboard Shortcuts',
        content: 'Keyboard shortcuts can significantly speed up your gameplay. Let\'s learn the most important ones.',
        position: 'center',
        animation: 'fade'
      },
      {
        id: 'game-shortcuts',
        title: 'Game Controls',
        content: 'Press Enter to start games and submit selections. Use Ctrl+R to reset the current game.',
        position: 'center',
        animation: 'slide'
      },
      {
        id: 'navigation-shortcuts',
        title: 'Navigation Shortcuts',
        content: 'Use number keys 1-3 to quickly switch between games. Press Ctrl+L for leaderboard, Ctrl+S for settings.',
        position: 'center',
        animation: 'slide'
      },
      {
        id: 'ui-shortcuts',
        title: 'UI Shortcuts',
        content: 'Press F for fullscreen, Ctrl+Plus/Minus for zoom, and ? for help.',
        position: 'center',
        animation: 'slide'
      }
    ],
    rewards: [
      {
        type: 'points',
        value: 25
      }
    ]
  },

  'accessibility-features': {
    id: 'accessibility-features',
    name: 'Accessibility Features',
    description: 'Learn about accessibility options and features',
    category: 'accessibility',
    difficulty: 'beginner',
    estimatedTime: 3,
    completed: false,
    progress: 0,
    steps: [
      {
        id: 'accessibility-intro',
        title: 'Accessibility Features',
        content: 'Lester\'s Arcade includes various accessibility features to ensure everyone can enjoy the games.',
        position: 'center',
        animation: 'fade'
      },
      {
        id: 'high-contrast',
        title: 'High Contrast Mode',
        content: 'Enable high contrast mode for better visibility. Press Ctrl+Shift+H to toggle.',
        position: 'center',
        animation: 'slide'
      },
      {
        id: 'large-text',
        title: 'Large Text Mode',
        content: 'Increase text size for better readability. Press Ctrl+Shift+T to toggle.',
        position: 'center',
        animation: 'slide'
      },
      {
        id: 'screen-reader',
        title: 'Screen Reader Support',
        content: 'The interface is designed to work with screen readers and other assistive technologies.',
        position: 'center',
        animation: 'slide'
      }
    ],
    rewards: [
      {
        type: 'points',
        value: 30
      }
    ]
  }
};

// Tutorial Manager Class
export class TutorialManager {
  private static instance: TutorialManager;
  private currentTutorial: string | null = null;
  private currentStep: number = 0;
  private progress: Map<string, TutorialProgress> = new Map();
  private listeners: Set<(tutorial: Tutorial, step: TutorialStep) => void> = new Set();
  private overlay: HTMLElement | null = null;
  private highlight: HTMLElement | null = null;

  private constructor() {
    this.loadProgress();
    this.createOverlay();
  }

  static getInstance(): TutorialManager {
    if (!TutorialManager.instance) {
      TutorialManager.instance = new TutorialManager();
    }
    return TutorialManager.instance;
  }

  // Load tutorial progress from localStorage
  private loadProgress(): void {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem('lester-arcade-tutorials');
      if (saved) {
        const data = JSON.parse(saved);
        this.progress = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('Failed to load tutorial progress:', error);
    }
  }

  // Save tutorial progress to localStorage
  private saveProgress(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = Object.fromEntries(this.progress);
      localStorage.setItem('lester-arcade-tutorials', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save tutorial progress:', error);
    }
  }

  // Create tutorial overlay
  private createOverlay(): void {
    if (typeof document === 'undefined') return;

    this.overlay = document.createElement('div');
    this.overlay.id = 'tutorial-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: none;
      pointer-events: none;
    `;
    document.body.appendChild(this.overlay);

    this.highlight = document.createElement('div');
    this.highlight.id = 'tutorial-highlight';
    this.highlight.style.cssText = `
      position: absolute;
      border: 2px solid #00FF41;
      background: rgba(0, 255, 65, 0.1);
      border-radius: 4px;
      pointer-events: none;
      z-index: 10001;
      display: none;
    `;
    this.overlay.appendChild(this.highlight);
  }

  // Start a tutorial
  startTutorial(tutorialId: string): boolean {
    const tutorial = tutorials[tutorialId];
    if (!tutorial) return false;

    this.currentTutorial = tutorialId;
    this.currentStep = 0;

    // Initialize progress if not exists
    if (!this.progress.has(tutorialId)) {
      this.progress.set(tutorialId, {
        tutorialId,
        currentStep: 0,
        completedSteps: [],
        startedAt: new Date(),
        timeSpent: 0,
        hintsUsed: 0,
        skipsUsed: 0
      });
    }

    this.showStep(tutorial.steps[0]);
    return true;
  }

  // Show a tutorial step
  private showStep(step: TutorialStep): void {
    if (!this.overlay || !this.highlight) return;

    this.overlay.style.display = 'block';
    this.overlay.style.pointerEvents = 'auto';

    // Highlight target element
    if (step.target) {
      const targetElement = document.querySelector(step.target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        this.highlight.style.display = 'block';
        this.highlight.style.left = `${rect.left - 4}px`;
        this.highlight.style.top = `${rect.top - 4}px`;
        this.highlight.style.width = `${rect.width + 8}px`;
        this.highlight.style.height = `${rect.height + 8}px`;

        // Add animation
        if (step.animation) {
          this.highlight.className = `animate-${step.animation}`;
        }
      }
    } else {
      this.highlight.style.display = 'none';
    }

    // Show step content
    this.showStepContent(step);

    // Execute action
    if (step.action) {
      this.executeAction(step);
    }

    // Notify listeners
    const tutorial = tutorials[this.currentTutorial!];
    this.listeners.forEach(listener => listener(tutorial, step));
  }

  // Show step content
  private showStepContent(step: TutorialStep): void {
    // This would show the actual tutorial step content
    // Implementation would depend on your UI framework
    console.log(`Tutorial Step: ${step.title} - ${step.content}`);
  }

  // Execute tutorial action
  private executeAction(step: TutorialStep): void {
    if (!step.actionTarget) return;

    const targetElement = document.querySelector(step.actionTarget);
    if (!targetElement) return;

    switch (step.action) {
      case 'click':
        (targetElement as HTMLElement).click();
        break;
      case 'hover':
        targetElement.dispatchEvent(new MouseEvent('mouseenter'));
        break;
      case 'type':
        if (step.actionValue) {
          (targetElement as HTMLInputElement).value = step.actionValue;
          targetElement.dispatchEvent(new Event('input'));
        }
        break;
      case 'scroll':
        targetElement.scrollIntoView({ behavior: 'smooth' });
        break;
    }
  }

  // Next step
  nextStep(): boolean {
    if (!this.currentTutorial) return false;

    const tutorial = tutorials[this.currentTutorial];
    const progress = this.progress.get(this.currentTutorial)!;

    // Mark current step as completed
    if (!progress.completedSteps.includes(this.currentStep)) {
      progress.completedSteps.push(this.currentStep);
    }

    // Move to next step
    this.currentStep++;
    progress.currentStep = this.currentStep;

    if (this.currentStep >= tutorial.steps.length) {
      // Tutorial completed
      this.completeTutorial();
      return false;
    }

    this.showStep(tutorial.steps[this.currentStep]);
    this.saveProgress();
    return true;
  }

  // Previous step
  previousStep(): boolean {
    if (!this.currentTutorial || this.currentStep <= 0) return false;

    this.currentStep--;
    const tutorial = tutorials[this.currentTutorial];
    this.showStep(tutorial.steps[this.currentStep]);
    return true;
  }

  // Skip current step
  skipStep(): boolean {
    if (!this.currentTutorial) return false;

    const tutorial = tutorials[this.currentTutorial];
    const step = tutorial.steps[this.currentStep];

    if (!step.skipable) return false;

    const progress = this.progress.get(this.currentTutorial)!;
    progress.skipsUsed = (progress.skipsUsed || 0) + 1;

    return this.nextStep();
  }

  // Complete tutorial
  private completeTutorial(): void {
    if (!this.currentTutorial) return;

    const tutorial = tutorials[this.currentTutorial];
    const progress = this.progress.get(this.currentTutorial)!;

    tutorial.completed = true;
    tutorial.progress = 100;
    progress.completedAt = new Date();
    progress.timeSpent = Date.now() - progress.startedAt.getTime();

    this.hideTutorial();
    this.saveProgress();

    // Award rewards
    if (tutorial.rewards) {
      tutorial.rewards.forEach(reward => {
        console.log(`Awarded: ${reward.type} - ${reward.value}`);
      });
    }
  }

  // Hide tutorial
  hideTutorial(): void {
    if (this.overlay) {
      this.overlay.style.display = 'none';
    }
    this.currentTutorial = null;
    this.currentStep = 0;
  }

  // Get all tutorials
  getAllTutorials(): Tutorial[] {
    return Object.values(tutorials);
  }

  // Get tutorial by ID
  getTutorial(id: string): Tutorial | undefined {
    return tutorials[id];
  }

  // Get tutorial progress
  getTutorialProgress(id: string): TutorialProgress | undefined {
    return this.progress.get(id);
  }

  // Get current tutorial
  getCurrentTutorial(): string | null {
    return this.currentTutorial;
  }

  // Get current step
  getCurrentStep(): number {
    return this.currentStep;
  }

  // Subscribe to tutorial events
  subscribe(listener: (tutorial: Tutorial, step: TutorialStep) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Reset tutorial progress
  resetTutorialProgress(id?: string): void {
    if (id) {
      this.progress.delete(id);
      const tutorial = tutorials[id];
      if (tutorial) {
        tutorial.completed = false;
        tutorial.progress = 0;
      }
    } else {
      this.progress.clear();
      Object.values(tutorials).forEach(tutorial => {
        tutorial.completed = false;
        tutorial.progress = 0;
      });
    }
    this.saveProgress();
  }

  // Cleanup
  destroy(): void {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.listeners.clear();
  }
}

// Export singleton instance
export const tutorialManager = TutorialManager.getInstance();

// React Hook for tutorials
export const useTutorials = () => {
  const manager = TutorialManager.getInstance();
  
  return {
    startTutorial: (tutorialId: string) => manager.startTutorial(tutorialId),
    nextStep: () => manager.nextStep(),
    previousStep: () => manager.previousStep(),
    skipStep: () => manager.skipStep(),
    hideTutorial: () => manager.hideTutorial(),
    getAllTutorials: () => manager.getAllTutorials(),
    getTutorial: (id: string) => manager.getTutorial(id),
    getTutorialProgress: (id: string) => manager.getTutorialProgress(id),
    getCurrentTutorial: () => manager.getCurrentTutorial(),
    getCurrentStep: () => manager.getCurrentStep(),
    subscribe: (listener: (tutorial: Tutorial, step: TutorialStep) => void) => manager.subscribe(listener),
    resetTutorialProgress: (id?: string) => manager.resetTutorialProgress(id)
  };
};

// Tutorial Component
export function TutorialSystem({ className }: { className?: string }) {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [currentTutorial, setCurrentTutorial] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const {
    getAllTutorials,
    getCurrentTutorial,
    getCurrentStep,
    startTutorial,
    nextStep,
    previousStep,
    skipStep,
    hideTutorial,
    subscribe
  } = useTutorials();

  useEffect(() => {
    setTutorials(getAllTutorials());
    setCurrentTutorial(getCurrentTutorial());
    setCurrentStep(getCurrentStep());

    const unsubscribe = subscribe((tutorial, step) => {
      setCurrentTutorial(tutorial.id);
      setCurrentStep(tutorial.steps.indexOf(step));
    });

    return unsubscribe;
  }, [getAllTutorials, getCurrentTutorial, getCurrentStep, subscribe]);

  const handleStartTutorial = (tutorialId: string) => {
    startTutorial(tutorialId);
  };

  const handleNextStep = () => {
    nextStep();
  };

  const handlePreviousStep = () => {
    previousStep();
  };

  const handleSkipStep = () => {
    skipStep();
  };

  const handleHideTutorial = () => {
    hideTutorial();
  };

  return (
    <div className={cn('space-y-6', className)}>
      <h2 className="text-2xl font-mono font-bold text-green-400 mb-6">
        [TUTORIAL] LEARNING CENTER
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map((tutorial) => (
          <div
            key={tutorial.id}
            className="bg-gray-900 border border-green-500/30 rounded-lg p-6 hover:border-green-500/50 transition-colors duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-mono font-semibold text-green-400">
                {tutorial.name}
              </h3>
              <span className={cn(
                'px-2 py-1 rounded text-xs font-mono',
                tutorial.completed
                  ? 'bg-green-900/30 text-green-400 border border-green-500/50'
                  : 'bg-gray-700 text-gray-300 border border-gray-600'
              )}>
                {tutorial.completed ? 'COMPLETED' : 'PENDING'}
              </span>
            </div>

            <p className="text-gray-300 text-sm mb-4">
              {tutorial.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Difficulty: {tutorial.difficulty}</span>
                <span>Time: {tutorial.estimatedTime}min</span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${tutorial.progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 text-center">
                {tutorial.progress}% Complete
              </div>
            </div>

            <button
              onClick={() => handleStartTutorial(tutorial.id)}
              className="w-full px-4 py-2 bg-green-900/30 border border-green-500/50 text-green-400 font-mono text-sm rounded hover:bg-green-800/40 hover:border-green-400 transition-colors duration-200"
            >
              {tutorial.completed ? 'REVIEW TUTORIAL' : 'START TUTORIAL'}
            </button>
          </div>
        ))}
      </div>

      {/* Tutorial Controls */}
      {currentTutorial && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-green-500/30 rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePreviousStep}
              className="px-3 py-1 bg-gray-700 border border-gray-600 text-gray-300 font-mono text-sm rounded hover:bg-gray-600 transition-colors duration-200"
            >
              PREV
            </button>
            
            <button
              onClick={handleNextStep}
              className="px-3 py-1 bg-green-900/30 border border-green-500/50 text-green-400 font-mono text-sm rounded hover:bg-green-800/40 transition-colors duration-200"
            >
              NEXT
            </button>
            
            <button
              onClick={handleSkipStep}
              className="px-3 py-1 bg-yellow-900/30 border border-yellow-500/50 text-yellow-400 font-mono text-sm rounded hover:bg-yellow-800/40 transition-colors duration-200"
            >
              SKIP
            </button>
            
            <button
              onClick={handleHideTutorial}
              className="px-3 py-1 bg-red-900/30 border border-red-500/50 text-red-400 font-mono text-sm rounded hover:bg-red-800/40 transition-colors duration-200"
            >
              EXIT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TutorialSystem;

'use client';

// Comprehensive Theme System for Lester's Arcade
// This file contains all theme definitions, color schemes, and theme management utilities

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  glow: string;
  shadow: string;
  gradient: {
    from: string;
    to: string;
    via?: string;
  };
}

export interface ThemeConfig {
  name: string;
  displayName: string;
  description: string;
  colors: ColorPalette;
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    glow: string;
  };
  animations: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      linear: string;
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
  effects: {
    blur: string;
    glow: string;
    matrix: string;
  };
}

// Matrix/Green Theme (Default)
export const matrixTheme: ThemeConfig = {
  name: 'matrix',
  displayName: 'Matrix Terminal',
  description: 'Classic green terminal aesthetic with matrix rain effects',
  colors: {
    primary: '#00FF41',
    secondary: '#00CC33',
    accent: '#00FF88',
    background: '#000000',
    surface: '#0A0A0A',
    text: '#00FF41',
    textSecondary: '#00CC33',
    border: '#00FF4133',
    success: '#00FF41',
    warning: '#FFAA00',
    error: '#FF0044',
    info: '#0088FF',
    glow: '#00FF41',
    shadow: '#00FF4120',
    gradient: {
      from: '#000000',
      via: '#001100',
      to: '#000000'
    }
  },
  fonts: {
    primary: 'Inter, system-ui, sans-serif',
    secondary: 'Roboto, system-ui, sans-serif',
    mono: 'JetBrains Mono, Consolas, Monaco, monospace'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem'
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 255, 65, 0.1)',
    md: '0 4px 6px rgba(0, 255, 65, 0.15)',
    lg: '0 10px 15px rgba(0, 255, 65, 0.2)',
    xl: '0 20px 25px rgba(0, 255, 65, 0.25)',
    glow: '0 0 20px rgba(0, 255, 65, 0.5)'
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out'
    }
  },
  effects: {
    blur: 'blur(8px)',
    glow: '0 0 20px rgba(0, 255, 65, 0.5)',
    matrix: 'matrix-rain'
  }
};

// Cyberpunk Theme
export const cyberpunkTheme: ThemeConfig = {
  name: 'cyberpunk',
  displayName: 'Cyberpunk Neon',
  description: 'Vibrant neon colors with cyberpunk aesthetics',
  colors: {
    primary: '#FF0080',
    secondary: '#00FFFF',
    accent: '#FFFF00',
    background: '#0A0A0F',
    surface: '#1A1A2E',
    text: '#FF0080',
    textSecondary: '#00FFFF',
    border: '#FF008033',
    success: '#00FF80',
    warning: '#FFFF00',
    error: '#FF0040',
    info: '#0080FF',
    glow: '#FF0080',
    shadow: '#FF008020',
    gradient: {
      from: '#0A0A0F',
      via: '#1A1A2E',
      to: '#16213E'
    }
  },
  fonts: {
    primary: 'Orbitron, system-ui, sans-serif',
    secondary: 'Exo 2, system-ui, sans-serif',
    mono: 'Fira Code, Consolas, Monaco, monospace'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem'
  },
  shadows: {
    sm: '0 1px 2px rgba(255, 0, 128, 0.1)',
    md: '0 4px 6px rgba(255, 0, 128, 0.15)',
    lg: '0 10px 15px rgba(255, 0, 128, 0.2)',
    xl: '0 20px 25px rgba(255, 0, 128, 0.25)',
    glow: '0 0 20px rgba(255, 0, 128, 0.5)'
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out'
    }
  },
  effects: {
    blur: 'blur(8px)',
    glow: '0 0 20px rgba(255, 0, 128, 0.5)',
    matrix: 'cyberpunk-rain'
  }
};

// Retro Theme
export const retroTheme: ThemeConfig = {
  name: 'retro',
  displayName: 'Retro Arcade',
  description: 'Classic 80s arcade machine aesthetic',
  colors: {
    primary: '#FF6B35',
    secondary: '#F7931E',
    accent: '#FFD23F',
    background: '#1A1A1A',
    surface: '#2D2D2D',
    text: '#FF6B35',
    textSecondary: '#F7931E',
    border: '#FF6B3533',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    glow: '#FF6B35',
    shadow: '#FF6B3520',
    gradient: {
      from: '#1A1A1A',
      via: '#2D2D2D',
      to: '#1A1A1A'
    }
  },
  fonts: {
    primary: 'Press Start 2P, monospace',
    secondary: 'Orbitron, monospace',
    mono: 'Courier New, monospace'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem'
  },
  shadows: {
    sm: '0 1px 2px rgba(255, 107, 53, 0.1)',
    md: '0 4px 6px rgba(255, 107, 53, 0.15)',
    lg: '0 10px 15px rgba(255, 107, 53, 0.2)',
    xl: '0 20px 25px rgba(255, 107, 53, 0.25)',
    glow: '0 0 20px rgba(255, 107, 53, 0.5)'
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out'
    }
  },
  effects: {
    blur: 'blur(8px)',
    glow: '0 0 20px rgba(255, 107, 53, 0.5)',
    matrix: 'retro-rain'
  }
};

// Monochrome Theme
export const monochromeTheme: ThemeConfig = {
  name: 'monochrome',
  displayName: 'Monochrome Terminal',
  description: 'Clean black and white terminal aesthetic',
  colors: {
    primary: '#FFFFFF',
    secondary: '#CCCCCC',
    accent: '#888888',
    background: '#000000',
    surface: '#111111',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    border: '#333333',
    success: '#00FF00',
    warning: '#FFFF00',
    error: '#FF0000',
    info: '#00FFFF',
    glow: '#FFFFFF',
    shadow: '#FFFFFF20',
    gradient: {
      from: '#000000',
      via: '#111111',
      to: '#000000'
    }
  },
  fonts: {
    primary: 'IBM Plex Mono, monospace',
    secondary: 'Source Code Pro, monospace',
    mono: 'JetBrains Mono, Consolas, Monaco, monospace'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem'
  },
  shadows: {
    sm: '0 1px 2px rgba(255, 255, 255, 0.1)',
    md: '0 4px 6px rgba(255, 255, 255, 0.15)',
    lg: '0 10px 15px rgba(255, 255, 255, 0.2)',
    xl: '0 20px 25px rgba(255, 255, 255, 0.25)',
    glow: '0 0 20px rgba(255, 255, 255, 0.5)'
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out'
    }
  },
  effects: {
    blur: 'blur(8px)',
    glow: '0 0 20px rgba(255, 255, 255, 0.5)',
    matrix: 'monochrome-rain'
  }
};

// Purple Hacker Theme
export const purpleHackerTheme: ThemeConfig = {
  name: 'purple-hacker',
  displayName: 'Purple Hacker',
  description: 'Deep purple and violet hacker aesthetic',
  colors: {
    primary: '#8B5CF6',
    secondary: '#A855F7',
    accent: '#C084FC',
    background: '#0F0B1A',
    surface: '#1A0B2E',
    text: '#8B5CF6',
    textSecondary: '#A855F7',
    border: '#8B5CF633',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    glow: '#8B5CF6',
    shadow: '#8B5CF620',
    gradient: {
      from: '#0F0B1A',
      via: '#1A0B2E',
      to: '#2D1B69'
    }
  },
  fonts: {
    primary: 'Space Grotesk, system-ui, sans-serif',
    secondary: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, Consolas, Monaco, monospace'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem'
  },
  shadows: {
    sm: '0 1px 2px rgba(139, 92, 246, 0.1)',
    md: '0 4px 6px rgba(139, 92, 246, 0.15)',
    lg: '0 10px 15px rgba(139, 92, 246, 0.2)',
    xl: '0 20px 25px rgba(139, 92, 246, 0.25)',
    glow: '0 0 20px rgba(139, 92, 246, 0.5)'
  },
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out'
    }
  },
  effects: {
    blur: 'blur(8px)',
    glow: '0 0 20px rgba(139, 92, 246, 0.5)',
    matrix: 'purple-rain'
  }
};

// All available themes
export const themes: Record<string, ThemeConfig> = {
  matrix: matrixTheme,
  cyberpunk: cyberpunkTheme,
  retro: retroTheme,
  monochrome: monochromeTheme,
  'purple-hacker': purpleHackerTheme
};

// Theme Manager Class
export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: ThemeConfig;
  private listeners: Set<(theme: ThemeConfig) => void> = new Set();

  private constructor() {
    this.currentTheme = this.loadTheme();
    this.applyTheme(this.currentTheme);
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  // Load theme from localStorage
  private loadTheme(): ThemeConfig {
    if (typeof window === 'undefined') return matrixTheme;
    
    const savedTheme = localStorage.getItem('lester-arcade-theme');
    if (savedTheme && themes[savedTheme]) {
      return themes[savedTheme];
    }
    return matrixTheme;
  }

  // Save theme to localStorage
  private saveTheme(themeName: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('lester-arcade-theme', themeName);
  }

  // Apply theme to document
  private applyTheme(theme: ThemeConfig): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.accent);
    root.style.setProperty('--color-background', theme.colors.background);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-text', theme.colors.text);
    root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
    root.style.setProperty('--color-border', theme.colors.border);
    root.style.setProperty('--color-success', theme.colors.success);
    root.style.setProperty('--color-warning', theme.colors.warning);
    root.style.setProperty('--color-error', theme.colors.error);
    root.style.setProperty('--color-info', theme.colors.info);
    root.style.setProperty('--color-glow', theme.colors.glow);
    root.style.setProperty('--color-shadow', theme.colors.shadow);
    
    // Apply gradient
    root.style.setProperty('--gradient-from', theme.colors.gradient.from);
    root.style.setProperty('--gradient-via', theme.colors.gradient.via || theme.colors.gradient.from);
    root.style.setProperty('--gradient-to', theme.colors.gradient.to);
    
    // Apply fonts
    root.style.setProperty('--font-primary', theme.fonts.primary);
    root.style.setProperty('--font-secondary', theme.fonts.secondary);
    root.style.setProperty('--font-mono', theme.fonts.mono);
    
    // Apply spacing
    root.style.setProperty('--spacing-xs', theme.spacing.xs);
    root.style.setProperty('--spacing-sm', theme.spacing.sm);
    root.style.setProperty('--spacing-md', theme.spacing.md);
    root.style.setProperty('--spacing-lg', theme.spacing.lg);
    root.style.setProperty('--spacing-xl', theme.spacing.xl);
    root.style.setProperty('--spacing-xxl', theme.spacing.xxl);
    
    // Apply border radius
    root.style.setProperty('--radius-sm', theme.borderRadius.sm);
    root.style.setProperty('--radius-md', theme.borderRadius.md);
    root.style.setProperty('--radius-lg', theme.borderRadius.lg);
    root.style.setProperty('--radius-xl', theme.borderRadius.xl);
    
    // Apply shadows
    root.style.setProperty('--shadow-sm', theme.shadows.sm);
    root.style.setProperty('--shadow-md', theme.shadows.md);
    root.style.setProperty('--shadow-lg', theme.shadows.lg);
    root.style.setProperty('--shadow-xl', theme.shadows.xl);
    root.style.setProperty('--shadow-glow', theme.shadows.glow);
    
    // Apply animations
    root.style.setProperty('--duration-fast', theme.animations.duration.fast);
    root.style.setProperty('--duration-normal', theme.animations.duration.normal);
    root.style.setProperty('--duration-slow', theme.animations.duration.slow);
    
    root.style.setProperty('--easing-linear', theme.animations.easing.linear);
    root.style.setProperty('--easing-ease', theme.animations.easing.ease);
    root.style.setProperty('--easing-ease-in', theme.animations.easing.easeIn);
    root.style.setProperty('--easing-ease-out', theme.animations.easing.easeOut);
    root.style.setProperty('--easing-ease-in-out', theme.animations.easing.easeInOut);
    
    // Apply effects
    root.style.setProperty('--blur', theme.effects.blur);
    root.style.setProperty('--glow', theme.effects.glow);
    root.style.setProperty('--matrix-effect', theme.effects.matrix);
    
    // Update document class for theme-specific styling
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme.name}`);
  }

  // Get current theme
  getCurrentTheme(): ThemeConfig {
    return this.currentTheme;
  }

  // Get all available themes
  getAvailableThemes(): ThemeConfig[] {
    return Object.values(themes);
  }

  // Set theme
  setTheme(themeName: string): boolean {
    if (!themes[themeName]) {
      console.warn(`Theme "${themeName}" not found`);
      return false;
    }

    this.currentTheme = themes[themeName];
    this.applyTheme(this.currentTheme);
    this.saveTheme(themeName);
    
    // Notify listeners
    this.listeners.forEach(listener => listener(this.currentTheme));
    
    return true;
  }

  // Subscribe to theme changes
  subscribe(listener: (theme: ThemeConfig) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Generate CSS for theme
  generateThemeCSS(theme: ThemeConfig): string {
    return `
      .theme-${theme.name} {
        --color-primary: ${theme.colors.primary};
        --color-secondary: ${theme.colors.secondary};
        --color-accent: ${theme.colors.accent};
        --color-background: ${theme.colors.background};
        --color-surface: ${theme.colors.surface};
        --color-text: ${theme.colors.text};
        --color-text-secondary: ${theme.colors.textSecondary};
        --color-border: ${theme.colors.border};
        --color-success: ${theme.colors.success};
        --color-warning: ${theme.colors.warning};
        --color-error: ${theme.colors.error};
        --color-info: ${theme.colors.info};
        --color-glow: ${theme.colors.glow};
        --color-shadow: ${theme.colors.shadow};
        
        --gradient-from: ${theme.colors.gradient.from};
        --gradient-via: ${theme.colors.gradient.via || theme.colors.gradient.from};
        --gradient-to: ${theme.colors.gradient.to};
        
        --font-primary: ${theme.fonts.primary};
        --font-secondary: ${theme.fonts.secondary};
        --font-mono: ${theme.fonts.mono};
        
        --spacing-xs: ${theme.spacing.xs};
        --spacing-sm: ${theme.spacing.sm};
        --spacing-md: ${theme.spacing.md};
        --spacing-lg: ${theme.spacing.lg};
        --spacing-xl: ${theme.spacing.xl};
        --spacing-xxl: ${theme.spacing.xxl};
        
        --radius-sm: ${theme.borderRadius.sm};
        --radius-md: ${theme.borderRadius.md};
        --radius-lg: ${theme.borderRadius.lg};
        --radius-xl: ${theme.borderRadius.xl};
        
        --shadow-sm: ${theme.shadows.sm};
        --shadow-md: ${theme.shadows.md};
        --shadow-lg: ${theme.shadows.lg};
        --shadow-xl: ${theme.shadows.xl};
        --shadow-glow: ${theme.shadows.glow};
        
        --duration-fast: ${theme.animations.duration.fast};
        --duration-normal: ${theme.animations.duration.normal};
        --duration-slow: ${theme.animations.duration.slow};
        
        --easing-linear: ${theme.animations.easing.linear};
        --easing-ease: ${theme.animations.easing.ease};
        --easing-ease-in: ${theme.animations.easing.easeIn};
        --easing-ease-out: ${theme.animations.easing.easeOut};
        --easing-ease-in-out: ${theme.animations.easing.easeInOut};
        
        --blur: ${theme.effects.blur};
        --glow: ${theme.effects.glow};
        --matrix-effect: ${theme.effects.matrix};
      }
    `;
  }

  // Generate all themes CSS
  generateAllThemesCSS(): string {
    return Object.values(themes)
      .map(theme => this.generateThemeCSS(theme))
      .join('\n');
  }

  // Create custom theme
  createCustomTheme(name: string, config: Partial<ThemeConfig>): ThemeConfig {
    const baseTheme = this.currentTheme;
    const customTheme: ThemeConfig = {
      name,
      displayName: config.displayName || name,
      description: config.description || `Custom theme: ${name}`,
      colors: { ...baseTheme.colors, ...config.colors },
      fonts: { ...baseTheme.fonts, ...config.fonts },
      spacing: { ...baseTheme.spacing, ...config.spacing },
      borderRadius: { ...baseTheme.borderRadius, ...config.borderRadius },
      shadows: { ...baseTheme.shadows, ...config.shadows },
      animations: { ...baseTheme.animations, ...config.animations },
      effects: { ...baseTheme.effects, ...config.effects }
    };

    themes[name] = customTheme;
    return customTheme;
  }

  // Reset to default theme
  resetToDefault(): void {
    this.setTheme('matrix');
  }

  // Get theme by name
  getTheme(name: string): ThemeConfig | undefined {
    return themes[name];
  }

  // Check if theme exists
  hasTheme(name: string): boolean {
    return name in themes;
  }

  // Get theme names
  getThemeNames(): string[] {
    return Object.keys(themes);
  }
}

// Export singleton instance
export const themeManager = ThemeManager.getInstance();

// React Hook for theme management
export const useTheme = () => {
  const manager = ThemeManager.getInstance();
  
  return {
    currentTheme: manager.getCurrentTheme(),
    availableThemes: manager.getAvailableThemes(),
    setTheme: (themeName: string) => manager.setTheme(themeName),
    subscribe: (listener: (theme: ThemeConfig) => void) => manager.subscribe(listener),
    resetToDefault: () => manager.resetToDefault(),
    getTheme: (name: string) => manager.getTheme(name),
    hasTheme: (name: string) => manager.hasTheme(name),
    getThemeNames: () => manager.getThemeNames(),
    createCustomTheme: (name: string, config: Partial<ThemeConfig>) => manager.createCustomTheme(name, config)
  };
};

// Utility functions
export const getThemeColor = (theme: ThemeConfig, colorKey: keyof ColorPalette): string => {
  const color = theme.colors[colorKey];
  if (typeof color === 'string') {
    return color;
  }
  // Handle gradient objects by returning a CSS gradient string
  if (color && typeof color === 'object' && 'from' in color && 'to' in color) {
    const gradient = color as { from: string; to: string; via?: string };
    if (gradient.via) {
      return `linear-gradient(135deg, ${gradient.from}, ${gradient.via}, ${gradient.to})`;
    }
    return `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`;
  }
  return '#000000'; // fallback color
};

export const createColorVariants = (baseColor: string): Record<string, string> => {
  // This would generate lighter/darker variants of a color
  // Implementation would depend on your color manipulation library
  return {
    '50': baseColor,
    '100': baseColor,
    '200': baseColor,
    '300': baseColor,
    '400': baseColor,
    '500': baseColor,
    '600': baseColor,
    '700': baseColor,
    '800': baseColor,
    '900': baseColor
  };
};

export const generateThemePreview = (theme: ThemeConfig): string => {
  return `
    <div class="theme-preview theme-${theme.name}">
      <div class="preview-header">
        <h3>${theme.displayName}</h3>
        <p>${theme.description}</p>
      </div>
      <div class="preview-colors">
        <div class="color-swatch" style="background-color: ${theme.colors.primary}"></div>
        <div class="color-swatch" style="background-color: ${theme.colors.secondary}"></div>
        <div class="color-swatch" style="background-color: ${theme.colors.accent}"></div>
        <div class="color-swatch" style="background-color: ${theme.colors.success}"></div>
        <div class="color-swatch" style="background-color: ${theme.colors.warning}"></div>
        <div class="color-swatch" style="background-color: ${theme.colors.error}"></div>
      </div>
    </div>
  `;
};

export default ThemeManager;

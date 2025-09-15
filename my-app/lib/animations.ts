'use client';

// Advanced Animation System for Lester's Arcade
// This file contains all animation utilities, presets, and effects

export interface AnimationConfig {
  duration: number;
  delay?: number;
  easing?: string;
  iterations?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  fillMode?: 'none' | 'forwards' | 'backwards' | 'both';
}

export interface Keyframe {
  [key: string]: string | number;
}

export interface ParticleConfig {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  gravity?: number;
  friction?: number;
}

export class AnimationManager {
  private static instance: AnimationManager;
  private animations: Map<string, Animation> = new Map();
  private particles: ParticleConfig[] = [];
  private animationId: number | null = null;

  static getInstance(): AnimationManager {
    if (!AnimationManager.instance) {
      AnimationManager.instance = new AnimationManager();
    }
    return AnimationManager.instance;
  }

  // Matrix Rain Effect
  createMatrixRain(canvas: HTMLCanvasElement): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
    const matrixArray = matrix.split("");
    const fontSize = 14;
    const columns = canvas.width / fontSize;

    const drops: number[] = [];
    for (let x = 0; x < columns; x++) {
      drops[x] = 1;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F4';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 35);
    this.animations.set('matrix-rain', { interval } as any);
  }

  // Glitch Effect
  createGlitchEffect(element: HTMLElement, intensity: number = 0.1): void {
    const originalText = element.textContent;
    const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const glitch = () => {
      if (Math.random() < intensity) {
        const glitchedText = originalText?.split('').map(char => 
          Math.random() < intensity ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : char
        ).join('');
        element.textContent = glitchedText;
        
        setTimeout(() => {
          element.textContent = originalText;
        }, 100);
      }
    };

    const interval = setInterval(glitch, 50);
    this.animations.set('glitch', { interval } as any);
  }

  // Particle System
  createParticleSystem(canvas: HTMLCanvasElement, config: Partial<ParticleConfig> = {}): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const defaultConfig: ParticleConfig = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 1,
      maxLife: 1,
      size: 2,
      color: '#0F4',
      alpha: 1,
      gravity: 0.1,
      friction: 0.98,
      ...config
    };

    const updateParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      this.particles.forEach((particle, index) => {
        // Update physics
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += particle.gravity || 0;
        particle.vx *= particle.friction || 1;
        particle.vy *= particle.friction || 1;
        
        // Update life
        particle.life -= 0.016;
        particle.alpha = particle.life / particle.maxLife;
        
        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Remove dead particles
        if (particle.life <= 0) {
          this.particles.splice(index, 1);
        }
      });
    };

    const animate = () => {
      updateParticles();
      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  // Add particle
  addParticle(config: Partial<ParticleConfig>): void {
    const defaultConfig: ParticleConfig = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 1,
      maxLife: 1,
      size: 2,
      color: '#0F4',
      alpha: 1,
      gravity: 0.1,
      friction: 0.98,
    };

    this.particles.push({ ...defaultConfig, ...config });
  }

  // Explosion effect
  createExplosion(x: number, y: number, particleCount: number = 20): void {
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = Math.random() * 5 + 2;
      
      this.addParticle({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 1,
        size: Math.random() * 3 + 1,
        color: `hsl(${Math.random() * 60 + 120}, 100%, 50%)`,
        alpha: 1,
        gravity: 0.05,
        friction: 0.95,
      });
    }
  }

  // Typewriter effect
  createTypewriterEffect(element: HTMLElement, text: string, speed: number = 50): Promise<void> {
    return new Promise((resolve) => {
      element.textContent = '';
      let index = 0;
      
      const type = () => {
        if (index < text.length) {
          element.textContent += text[index];
          index++;
          setTimeout(type, speed);
        } else {
          resolve();
        }
      };
      
      type();
    });
  }

  // Pulse effect
  createPulseEffect(element: HTMLElement, scale: number = 1.1, duration: number = 1000): void {
    const keyframes = [
      { transform: 'scale(1)', offset: 0 },
      { transform: `scale(${scale})`, offset: 0.5 },
      { transform: 'scale(1)', offset: 1 }
    ];

    const animation = element.animate(keyframes, {
      duration,
      iterations: Infinity,
      direction: 'alternate',
      easing: 'ease-in-out'
    });

    this.animations.set('pulse', animation);
  }

  // Shake effect
  createShakeEffect(element: HTMLElement, intensity: number = 10, duration: number = 500): void {
    const keyframes = [
      { transform: 'translateX(0)', offset: 0 },
      { transform: `translateX(-${intensity}px)`, offset: 0.1 },
      { transform: `translateX(${intensity}px)`, offset: 0.2 },
      { transform: `translateX(-${intensity}px)`, offset: 0.3 },
      { transform: `translateX(${intensity}px)`, offset: 0.4 },
      { transform: `translateX(-${intensity}px)`, offset: 0.5 },
      { transform: `translateX(${intensity}px)`, offset: 0.6 },
      { transform: `translateX(-${intensity}px)`, offset: 0.7 },
      { transform: `translateX(${intensity}px)`, offset: 0.8 },
      { transform: `translateX(-${intensity}px)`, offset: 0.9 },
      { transform: 'translateX(0)', offset: 1 }
    ];

    const animation = element.animate(keyframes, {
      duration,
      iterations: 1,
      easing: 'ease-in-out'
    });

    this.animations.set('shake', animation);
  }

  // Fade in effect
  createFadeInEffect(element: HTMLElement, duration: number = 1000): Promise<void> {
    return new Promise((resolve) => {
      element.style.opacity = '0';
      const animation = element.animate([
        { opacity: 0 },
        { opacity: 1 }
      ], {
        duration,
        iterations: 1,
        fill: 'forwards'
      });

      animation.onfinish = () => resolve();
      this.animations.set('fade-in', animation);
    });
  }

  // Slide in effect
  createSlideInEffect(element: HTMLElement, direction: 'left' | 'right' | 'up' | 'down' = 'left', duration: number = 1000): Promise<void> {
    return new Promise((resolve) => {
      const transforms = {
        left: ['translateX(-100%)', 'translateX(0)'],
        right: ['translateX(100%)', 'translateX(0)'],
        up: ['translateY(-100%)', 'translateY(0)'],
        down: ['translateY(100%)', 'translateY(0)']
      };

      const [from, to] = transforms[direction];
      element.style.transform = from;

      const animation = element.animate([
        { transform: from },
        { transform: to }
      ], {
        duration,
        iterations: 1,
        fill: 'forwards',
        easing: 'ease-out'
      });

      animation.onfinish = () => resolve();
      this.animations.set('slide-in', animation);
    });
  }

  // Rotate effect
  createRotateEffect(element: HTMLElement, degrees: number = 360, duration: number = 1000): void {
    const animation = element.animate([
      { transform: 'rotate(0deg)' },
      { transform: `rotate(${degrees}deg)` }
    ], {
      duration,
      iterations: 1,
      fill: 'forwards',
      easing: 'ease-in-out'
    });

    this.animations.set('rotate', animation);
  }

  // Bounce effect
  createBounceEffect(element: HTMLElement, height: number = 20, duration: number = 1000): void {
    const keyframes = [
      { transform: 'translateY(0)', offset: 0 },
      { transform: `translateY(-${height}px)`, offset: 0.3 },
      { transform: 'translateY(0)', offset: 0.6 },
      { transform: `translateY(-${height * 0.5}px)`, offset: 0.8 },
      { transform: 'translateY(0)', offset: 1 }
    ];

    const animation = element.animate(keyframes, {
      duration,
      iterations: 1,
      easing: 'ease-out'
    });

    this.animations.set('bounce', animation);
  }

  // Wobble effect
  createWobbleEffect(element: HTMLElement, intensity: number = 5, duration: number = 1000): void {
    const keyframes = [
      { transform: 'rotate(0deg)', offset: 0 },
      { transform: `rotate(${intensity}deg)`, offset: 0.15 },
      { transform: `rotate(-${intensity}deg)`, offset: 0.3 },
      { transform: `rotate(${intensity * 0.5}deg)`, offset: 0.45 },
      { transform: `rotate(-${intensity * 0.5}deg)`, offset: 0.6 },
      { transform: `rotate(${intensity * 0.25}deg)`, offset: 0.75 },
      { transform: `rotate(-${intensity * 0.25}deg)`, offset: 0.9 },
      { transform: 'rotate(0deg)', offset: 1 }
    ];

    const animation = element.animate(keyframes, {
      duration,
      iterations: 1,
      easing: 'ease-in-out'
    });

    this.animations.set('wobble', animation);
  }

  // Stop all animations
  stopAllAnimations(): void {
    this.animations.forEach(animation => {
      if ('cancel' in animation) {
        animation.cancel();
      } else if ('clearInterval' in animation) {
        clearInterval(animation.interval);
      }
    });
    this.animations.clear();

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // Stop specific animation
  stopAnimation(name: string): void {
    const animation = this.animations.get(name);
    if (animation) {
      if ('cancel' in animation) {
        animation.cancel();
      } else if ('clearInterval' in animation) {
        clearInterval(animation.interval);
      }
      this.animations.delete(name);
    }
  }

  // Get animation status
  isAnimationRunning(name: string): boolean {
    return this.animations.has(name);
  }

  // Cleanup
  destroy(): void {
    this.stopAllAnimations();
    this.particles = [];
  }
}

// Export singleton instance
export const animationManager = AnimationManager.getInstance();

// Utility functions
export const createKeyframes = (keyframes: Keyframe[]): Keyframe[] => keyframes;

export const createEasingFunction = (type: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'cubic-bezier' = 'ease', ...params: number[]): string => {
  switch (type) {
    case 'cubic-bezier':
      return `cubic-bezier(${params.join(', ')})`;
    default:
      return type;
  }
};

// Predefined animation presets
export const AnimationPresets = {
  // Fade animations
  fadeIn: (duration: number = 1000) => ({
    keyframes: [{ opacity: 0 }, { opacity: 1 }],
    options: { duration, fill: 'forwards' }
  }),
  
  fadeOut: (duration: number = 1000) => ({
    keyframes: [{ opacity: 1 }, { opacity: 0 }],
    options: { duration, fill: 'forwards' }
  }),

  // Slide animations
  slideInLeft: (duration: number = 1000) => ({
    keyframes: [{ transform: 'translateX(-100%)' }, { transform: 'translateX(0)' }],
    options: { duration, fill: 'forwards', easing: 'ease-out' }
  }),

  slideInRight: (duration: number = 1000) => ({
    keyframes: [{ transform: 'translateX(100%)' }, { transform: 'translateX(0)' }],
    options: { duration, fill: 'forwards', easing: 'ease-out' }
  }),

  slideInUp: (duration: number = 1000) => ({
    keyframes: [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }],
    options: { duration, fill: 'forwards', easing: 'ease-out' }
  }),

  slideInDown: (duration: number = 1000) => ({
    keyframes: [{ transform: 'translateY(-100%)' }, { transform: 'translateY(0)' }],
    options: { duration, fill: 'forwards', easing: 'ease-out' }
  }),

  // Scale animations
  scaleIn: (duration: number = 1000) => ({
    keyframes: [{ transform: 'scale(0)' }, { transform: 'scale(1)' }],
    options: { duration, fill: 'forwards', easing: 'ease-out' }
  }),

  scaleOut: (duration: number = 1000) => ({
    keyframes: [{ transform: 'scale(1)' }, { transform: 'scale(0)' }],
    options: { duration, fill: 'forwards', easing: 'ease-in' }
  }),

  // Rotation animations
  rotateIn: (duration: number = 1000) => ({
    keyframes: [{ transform: 'rotate(-180deg) scale(0)' }, { transform: 'rotate(0deg) scale(1)' }],
    options: { duration, fill: 'forwards', easing: 'ease-out' }
  }),

  // Bounce animations
  bounceIn: (duration: number = 1000) => ({
    keyframes: [
      { transform: 'scale(0)', offset: 0 },
      { transform: 'scale(1.1)', offset: 0.6 },
      { transform: 'scale(0.9)', offset: 0.8 },
      { transform: 'scale(1)', offset: 1 }
    ],
    options: { duration, fill: 'forwards', easing: 'ease-out' }
  }),

  // Elastic animations
  elasticIn: (duration: number = 1000) => ({
    keyframes: [
      { transform: 'scale(0)', offset: 0 },
      { transform: 'scale(1.2)', offset: 0.4 },
      { transform: 'scale(0.8)', offset: 0.6 },
      { transform: 'scale(1.05)', offset: 0.8 },
      { transform: 'scale(1)', offset: 1 }
    ],
    options: { duration, fill: 'forwards', easing: 'ease-out' }
  }),

  // Zoom animations
  zoomIn: (duration: number = 1000) => ({
    keyframes: [{ transform: 'scale(0.3)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }],
    options: { duration, fill: 'forwards', easing: 'ease-out' }
  }),

  zoomOut: (duration: number = 1000) => ({
    keyframes: [{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(0.3)', opacity: 0 }],
    options: { duration, fill: 'forwards', easing: 'ease-in' }
  }),

  // Flip animations
  flipInX: (duration: number = 1000) => ({
    keyframes: [
      { transform: 'perspective(400px) rotateX(90deg)', opacity: 0, offset: 0 },
      { transform: 'perspective(400px) rotateX(-20deg)', offset: 0.4 },
      { transform: 'perspective(400px) rotateX(10deg)', offset: 0.6 },
      { transform: 'perspective(400px) rotateX(-5deg)', offset: 0.8 },
      { transform: 'perspective(400px) rotateX(0deg)', opacity: 1, offset: 1 }
    ],
    options: { duration, fill: 'forwards', easing: 'ease-out' }
  }),

  flipInY: (duration: number = 1000) => ({
    keyframes: [
      { transform: 'perspective(400px) rotateY(90deg)', opacity: 0, offset: 0 },
      { transform: 'perspective(400px) rotateY(-20deg)', offset: 0.4 },
      { transform: 'perspective(400px) rotateY(10deg)', offset: 0.6 },
      { transform: 'perspective(400px) rotateY(-5deg)', offset: 0.8 },
      { transform: 'perspective(400px) rotateY(0deg)', opacity: 1, offset: 1 }
    ],
    options: { duration, fill: 'forwards', easing: 'ease-out' }
  }),

  // Light speed animations
  lightSpeedIn: (duration: number = 1000) => ({
    keyframes: [
      { transform: 'translateX(100%) skewX(-30deg)', opacity: 0, offset: 0 },
      { transform: 'translateX(-20%) skewX(20deg)', offset: 0.6 },
      { transform: 'translateX(0%) skewX(-5deg)', offset: 0.8 },
      { transform: 'translateX(0%) skewX(0deg)', opacity: 1, offset: 1 }
    ],
    options: { duration, fill: 'forwards', easing: 'ease-out' }
  }),

  // Roll animations
  rollIn: (duration: number = 1000) => ({
    keyframes: [
      { transform: 'translateX(-100%) rotate(-120deg)', opacity: 0, offset: 0 },
      { transform: 'translateX(0%) rotate(0deg)', opacity: 1, offset: 1 }
    ],
    options: { duration, fill: 'forwards', easing: 'ease-out' }
  }),

  rollOut: (duration: number = 1000) => ({
    keyframes: [
      { transform: 'translateX(0%) rotate(0deg)', opacity: 1, offset: 0 },
      { transform: 'translateX(100%) rotate(120deg)', opacity: 0, offset: 1 }
    ],
    options: { duration, fill: 'forwards', easing: 'ease-in' }
  })
};

// CSS Animation classes generator
export const generateCSSAnimations = (): string => {
  return `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    
    @keyframes slideInLeft {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }
    
    @keyframes slideInRight {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
    
    @keyframes slideInUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
    
    @keyframes slideInDown {
      from { transform: translateY(-100%); }
      to { transform: translateY(0); }
    }
    
    @keyframes scaleIn {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }
    
    @keyframes scaleOut {
      from { transform: scale(1); }
      to { transform: scale(0); }
    }
    
    @keyframes bounce {
      0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
      40%, 43% { transform: translateY(-30px); }
      70% { transform: translateY(-15px); }
      90% { transform: translateY(-4px); }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
      20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
    
    @keyframes wobble {
      0% { transform: translateX(0%); }
      15% { transform: translateX(-25%) rotate(-5deg); }
      30% { transform: translateX(20%) rotate(3deg); }
      45% { transform: translateX(-15%) rotate(-3deg); }
      60% { transform: translateX(10%) rotate(2deg); }
      75% { transform: translateX(-5%) rotate(-1deg); }
      100% { transform: translateX(0%); }
    }
    
    @keyframes glow {
      0%, 100% { box-shadow: 0 0 5px #0F4, 0 0 10px #0F4, 0 0 15px #0F4; }
      50% { box-shadow: 0 0 10px #0F4, 0 0 20px #0F4, 0 0 30px #0F4; }
    }
    
    @keyframes matrix-rain {
      0% { transform: translateY(-100vh); opacity: 1; }
      100% { transform: translateY(100vh); opacity: 0; }
    }
    
    @keyframes glitch {
      0%, 100% { transform: translate(0); }
      20% { transform: translate(-2px, 2px); }
      40% { transform: translate(-2px, -2px); }
      60% { transform: translate(2px, 2px); }
      80% { transform: translate(2px, -2px); }
    }
    
    .animate-fadeIn { animation: fadeIn 1s ease-in-out; }
    .animate-fadeOut { animation: fadeOut 1s ease-in-out; }
    .animate-slideInLeft { animation: slideInLeft 1s ease-out; }
    .animate-slideInRight { animation: slideInRight 1s ease-out; }
    .animate-slideInUp { animation: slideInUp 1s ease-out; }
    .animate-slideInDown { animation: slideInDown 1s ease-out; }
    .animate-scaleIn { animation: scaleIn 1s ease-out; }
    .animate-scaleOut { animation: scaleOut 1s ease-in; }
    .animate-bounce { animation: bounce 1s infinite; }
    .animate-pulse { animation: pulse 2s infinite; }
    .animate-shake { animation: shake 0.5s ease-in-out; }
    .animate-wobble { animation: wobble 1s ease-in-out; }
    .animate-glow { animation: glow 2s ease-in-out infinite; }
    .animate-matrix-rain { animation: matrix-rain 3s linear infinite; }
    .animate-glitch { animation: glitch 0.3s ease-in-out infinite; }
  `;
};

// React Hook for animations
export const useAnimation = () => {
  const manager = AnimationManager.getInstance();
  
  return {
    createMatrixRain: (canvas: HTMLCanvasElement) => manager.createMatrixRain(canvas),
    createGlitchEffect: (element: HTMLElement, intensity?: number) => manager.createGlitchEffect(element, intensity),
    createParticleSystem: (canvas: HTMLCanvasElement, config?: Partial<ParticleConfig>) => manager.createParticleSystem(canvas, config),
    addParticle: (config: Partial<ParticleConfig>) => manager.addParticle(config),
    createExplosion: (x: number, y: number, particleCount?: number) => manager.createExplosion(x, y, particleCount),
    createTypewriterEffect: (element: HTMLElement, text: string, speed?: number) => manager.createTypewriterEffect(element, text, speed),
    createPulseEffect: (element: HTMLElement, scale?: number, duration?: number) => manager.createPulseEffect(element, scale, duration),
    createShakeEffect: (element: HTMLElement, intensity?: number, duration?: number) => manager.createShakeEffect(element, intensity, duration),
    createFadeInEffect: (element: HTMLElement, duration?: number) => manager.createFadeInEffect(element, duration),
    createSlideInEffect: (element: HTMLElement, direction?: 'left' | 'right' | 'up' | 'down', duration?: number) => manager.createSlideInEffect(element, direction, duration),
    createRotateEffect: (element: HTMLElement, degrees?: number, duration?: number) => manager.createRotateEffect(element, degrees, duration),
    createBounceEffect: (element: HTMLElement, height?: number, duration?: number) => manager.createBounceEffect(element, height, duration),
    createWobbleEffect: (element: HTMLElement, intensity?: number, duration?: number) => manager.createWobbleEffect(element, intensity, duration),
    stopAllAnimations: () => manager.stopAllAnimations(),
    stopAnimation: (name: string) => manager.stopAnimation(name),
    isAnimationRunning: (name: string) => manager.isAnimationRunning(name),
    destroy: () => manager.destroy()
  };
};

export default AnimationManager;

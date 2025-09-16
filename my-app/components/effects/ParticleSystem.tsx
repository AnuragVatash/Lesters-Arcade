'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface Particle {
  id: string;
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
  rotation?: number;
  rotationSpeed?: number;
  scale?: number;
  scaleSpeed?: number;
}

export interface ParticleConfig {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  life?: number;
  size?: number;
  color?: string;
  gravity?: number;
  friction?: number;
  rotation?: number;
  rotationSpeed?: number;
  scale?: number;
  scaleSpeed?: number;
}

export interface ParticleSystemProps {
  width: number;
  height: number;
  particleCount?: number;
  spawnRate?: number;
  enabled?: boolean;
  className?: string;
  onParticleUpdate?: (particles: Particle[]) => void;
  mode?: 'default' | 'matrix';
}

function ParticleSystem({
  width,
  height,
  particleCount = 100,
  spawnRate = 0.1,
  enabled = true,
  className,
  onParticleUpdate,
  mode = 'default'
}: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const particlesRef = useRef<Particle[]>([]);
  const lastSpawnRef = useRef<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Generate random particle
  const createParticle = useCallback((config: Partial<ParticleConfig> = {}): Particle => {
    const id = Math.random().toString(36).substr(2, 9);
    
    if (mode === 'matrix') {
      // Matrix rain particles - vertical columns
      const columnWidth = 20;
      const columns = Math.floor(width / columnWidth);
      const column = Math.floor(Math.random() * columns);
      
      return {
        id,
        x: config.x ?? (column * columnWidth + Math.random() * columnWidth),
        y: config.y ?? -20,
        vx: config.vx ?? 0,
        vy: config.vy ?? (Math.random() * 2 + 3), // Falling down
        life: config.life ?? Math.random() * 150 + 100,
        maxLife: config.life ?? Math.random() * 150 + 100,
        size: config.size ?? Math.random() * 2 + 8, // Larger for text
        color: config.color ?? '#00FF41', // Classic Matrix green
        alpha: 1,
        gravity: config.gravity ?? 0,
        friction: config.friction ?? 1,
        rotation: config.rotation ?? 0,
        rotationSpeed: config.rotationSpeed ?? 0,
        scale: config.scale ?? 1,
        scaleSpeed: config.scaleSpeed ?? 0
      };
    } else {
      // Default particle behavior
      return {
        id,
        x: config.x ?? Math.random() * width,
        y: config.y ?? Math.random() * height,
        vx: config.vx ?? (Math.random() - 0.5) * 4,
        vy: config.vy ?? (Math.random() - 0.5) * 4,
        life: config.life ?? Math.random() * 100 + 50,
        maxLife: config.life ?? Math.random() * 100 + 50,
        size: config.size ?? Math.random() * 4 + 2,
        color: config.color ?? `hsl(${Math.random() * 60 + 120}, 100%, 70%)`,
        alpha: 1,
        gravity: config.gravity ?? 0.05,
        friction: config.friction ?? 0.98,
        rotation: config.rotation ?? Math.random() * Math.PI * 2,
        rotationSpeed: config.rotationSpeed ?? (Math.random() - 0.5) * 0.2,
        scale: config.scale ?? 1,
        scaleSpeed: config.scaleSpeed ?? (Math.random() - 0.5) * 0.02
      };
    }
  }, [width, height, mode]);

  // Update particle physics
  const updateParticle = useCallback((particle: Particle): Particle => {
    // Update position
    particle.x += particle.vx;
    particle.y += particle.vy;
    
    // Apply gravity
    if (particle.gravity) {
      particle.vy += particle.gravity;
    }
    
    // Apply friction
    if (particle.friction) {
      particle.vx *= particle.friction;
      particle.vy *= particle.friction;
    }
    
  // Update rotation
  if (particle.rotationSpeed && particle.rotation !== undefined) {
    particle.rotation += particle.rotationSpeed;
  }
  
  // Update scale
  if (particle.scaleSpeed && particle.scale !== undefined) {
    particle.scale += particle.scaleSpeed;
    particle.scale = Math.max(0.1, particle.scale);
  }
    
    // Update life
    particle.life -= 1;
    particle.alpha = particle.life / particle.maxLife;
    
    return particle;
  }, []);

  // Spawn particles
  const spawnParticles = useCallback(() => {
    if (!enabled) return;
    
    const now = Date.now();
    if (now - lastSpawnRef.current < 1000 / spawnRate) return;
    
    lastSpawnRef.current = now;
    
    // Spawn random particles
    for (let i = 0; i < Math.floor(particleCount * 0.1); i++) {
      const particle = createParticle();
      particlesRef.current.push(particle);
    }
  }, [enabled, spawnRate, particleCount, createParticle]);

  // Animation loop
  const animate = useCallback(() => {
    if (!enabled) {
      setIsAnimating(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      setIsAnimating(false);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsAnimating(false);
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Spawn new particles
    spawnParticles();

    // Update and draw particles
    const particles = particlesRef.current;
    const updatedParticles: Particle[] = [];

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      
      // Update particle
      const updatedParticle = updateParticle(particle);
      
      // Check if particle is still alive and in bounds
      if (updatedParticle.life > 0 && 
          updatedParticle.x >= -50 && 
          updatedParticle.x <= width + 50 && 
          updatedParticle.y >= -50 && 
          updatedParticle.y <= height + 50) {
        
        // Draw particle
        ctx.save();
        ctx.globalAlpha = updatedParticle.alpha;
        ctx.translate(updatedParticle.x, updatedParticle.y);
        if (updatedParticle.rotation !== undefined) {
          ctx.rotate(updatedParticle.rotation);
        }
        if (updatedParticle.scale !== undefined) {
          ctx.scale(updatedParticle.scale, updatedParticle.scale);
        }
        
        if (mode === 'matrix') {
          // Draw Matrix characters
          const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ';
          const char = characters[Math.floor(Math.random() * characters.length)];
          
          ctx.font = `${updatedParticle.size}px monospace`;
          ctx.fillStyle = updatedParticle.color;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Add glow effect
          ctx.shadowColor = updatedParticle.color;
          ctx.shadowBlur = 10;
          ctx.fillText(char, 0, 0);
          
          // Add extra glow
          ctx.shadowBlur = 20;
          ctx.globalAlpha = updatedParticle.alpha * 0.5;
          ctx.fillText(char, 0, 0);
        } else {
          // Draw particle shape (default)
          ctx.fillStyle = updatedParticle.color;
          ctx.beginPath();
          ctx.arc(0, 0, updatedParticle.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Add glow effect for better visibility
          ctx.shadowColor = updatedParticle.color;
          ctx.shadowBlur = 15;
          ctx.fill();
          
          // Add extra glow for Matrix theme
          ctx.shadowBlur = 25;
          ctx.globalAlpha = updatedParticle.alpha * 0.3;
          ctx.fill();
        }
        
        ctx.restore();
        
        updatedParticles.push(updatedParticle);
      }
    }

    particlesRef.current = updatedParticles;
    
    // Notify parent of particle updates
    if (onParticleUpdate) {
      onParticleUpdate(updatedParticles);
    }

    setIsAnimating(true);
    animationRef.current = requestAnimationFrame(animate);
  }, [enabled, width, height, spawnParticles, updateParticle, onParticleUpdate]);

  // Start animation
  useEffect(() => {
    if (!enabled) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setIsAnimating(false);
      return;
    }

    // Small delay to ensure canvas is ready
    const startAnimation = () => {
      try {
        animate();
      } catch (error) {
        console.warn('Animation start failed:', error);
      }
    };

    const timeoutId = setTimeout(startAnimation, 100);

    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, animate]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.width = width;
      canvas.height = height;
    } catch (error) {
      console.warn('Canvas resize failed:', error);
    }
  }, [width, height]);

  // Add particle manually
  const addParticle = useCallback((config: Partial<ParticleConfig>) => {
    const particle = createParticle(config);
    particlesRef.current.push(particle);
  }, [createParticle]);

  // Clear all particles
  const clearParticles = useCallback(() => {
    particlesRef.current = [];
  }, []);

  // Get particle count
  const getParticleCount = useCallback(() => {
    return particlesRef.current.length;
  }, []);

  // Expose methods via ref (if needed)
  useEffect(() => {
    if (canvasRef.current) {
      (canvasRef.current as any).addParticle = addParticle;
      (canvasRef.current as any).clearParticles = clearParticles;
      (canvasRef.current as any).getParticleCount = getParticleCount;
    }
  }, [addParticle, clearParticles, getParticleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{ width, height }}
    />
  );
}

// Specialized particle effects
export const createExplosion = (
  x: number, 
  y: number, 
  particleCount: number = 20,
  addParticle: (config: Partial<ParticleConfig>) => void
) => {
  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount;
    const speed = Math.random() * 5 + 2;
    
    addParticle({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: Math.random() * 50 + 30,
      size: Math.random() * 4 + 2,
      color: `hsl(${Math.random() * 60 + 120}, 100%, 50%)`,
      gravity: 0.1,
      friction: 0.95,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      scaleSpeed: -0.02
    });
  }
};

export const createTrail = (
  x: number,
  y: number,
  vx: number,
  vy: number,
  particleCount: number = 10,
  addParticle: (config: Partial<ParticleConfig>) => void
) => {
  for (let i = 0; i < particleCount; i++) {
    addParticle({
      x: x - vx * i * 0.5,
      y: y - vy * i * 0.5,
      vx: vx * 0.8,
      vy: vy * 0.8,
      life: 20 + i * 2,
      size: 2 - i * 0.1,
      color: `hsl(${120 + i * 10}, 100%, ${70 - i * 5}%)`,
      friction: 0.9,
      scaleSpeed: -0.01
    });
  }
};

export const createMatrixRain = (
  width: number,
  height: number,
  addParticle: (config: Partial<ParticleConfig>) => void
) => {
  const columns = Math.floor(width / 20);
  
  for (let i = 0; i < columns; i++) {
    if (Math.random() < 0.1) {
      addParticle({
        x: i * 20 + Math.random() * 20,
        y: -20,
        vx: 0,
        vy: Math.random() * 3 + 2,
        life: height / 2 + Math.random() * height / 2,
        size: Math.random() * 2 + 1,
        color: '#00FF41',
        friction: 1,
        scaleSpeed: 0
      });
    }
  }
};

export const createGlowEffect = (
  x: number,
  y: number,
  color: string = '#00FF41',
  addParticle: (config: Partial<ParticleConfig>) => void
) => {
  for (let i = 0; i < 15; i++) {
    const angle = (Math.PI * 2 * i) / 15;
    const radius = Math.random() * 30 + 10;
    
    addParticle({
      x: x + Math.cos(angle) * radius,
      y: y + Math.sin(angle) * radius,
      vx: Math.cos(angle) * 0.5,
      vy: Math.sin(angle) * 0.5,
      life: 60,
      size: Math.random() * 3 + 1,
      color,
      friction: 0.95,
      scaleSpeed: -0.01
    });
  }
};

export const createSparkle = (
  x: number,
  y: number,
  addParticle: (config: Partial<ParticleConfig>) => void
) => {
  for (let i = 0; i < 8; i++) {
    addParticle({
      x,
      y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      life: 30,
      size: Math.random() * 2 + 1,
      color: '#FFFF00',
      friction: 0.9,
      rotationSpeed: (Math.random() - 0.5) * 0.5,
      scaleSpeed: -0.03
    });
  }
};

// React Hook for particle system
export const useParticleSystem = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const addParticle = useCallback((config: Partial<ParticleConfig>) => {
    // This would be implemented based on your specific needs
    console.log('Adding particle:', config);
  }, []);
  
  const clearParticles = useCallback(() => {
    setParticles([]);
  }, []);
  
  const createExplosionEffect = useCallback((x: number, y: number, count?: number) => {
    createExplosion(x, y, count, addParticle);
  }, [addParticle]);
  
  const createTrailEffect = useCallback((x: number, y: number, vx: number, vy: number, count?: number) => {
    createTrail(x, y, vx, vy, count, addParticle);
  }, [addParticle]);
  
  const createMatrixRainEffect = useCallback((width: number, height: number) => {
    createMatrixRain(width, height, addParticle);
  }, [addParticle]);
  
  const createGlowEffectCallback = useCallback((x: number, y: number, color?: string) => {
    createGlowEffect(x, y, color, addParticle);
  }, [addParticle]);
  
  const createSparkleEffect = useCallback((x: number, y: number) => {
    createSparkle(x, y, addParticle);
  }, [addParticle]);
  
  return {
    particles,
    addParticle,
    clearParticles,
    createExplosionEffect,
    createTrailEffect,
    createMatrixRainEffect,
    createGlowEffect: createGlowEffectCallback,
    createSparkleEffect
  };
};

export default ParticleSystem;

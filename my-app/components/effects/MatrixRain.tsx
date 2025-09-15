'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Digital Matrix Rain Animation
// Ultra HD quality with Japanese katakana characters, glow effects, and depth

interface MatrixRainProps {
  width?: number;
  height?: number;
  speed?: number;
  density?: number;
  className?: string;
  enabled?: boolean;
}

// Japanese Katakana Characters for authentic Matrix effect
const katakanaChars = [
  'ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ',
  'サ', 'シ', 'ス', 'セ', 'ソ', 'タ', 'チ', 'ツ', 'テ', 'ト',
  'ナ', 'ニ', 'ヌ', 'ネ', 'ノ', 'ハ', 'ヒ', 'フ', 'ヘ', 'ホ',
  'マ', 'ミ', 'ム', 'メ', 'モ', 'ヤ', 'ユ', 'ヨ', 'ラ', 'リ',
  'ル', 'レ', 'ロ', 'ワ', 'ヲ', 'ン', 'ガ', 'ギ', 'グ', 'ゲ',
  'ゴ', 'ザ', 'ジ', 'ズ', 'ゼ', 'ゾ', 'ダ', 'ヂ', 'ヅ', 'デ',
  'ド', 'バ', 'ビ', 'ブ', 'ベ', 'ボ', 'パ', 'ピ', 'プ', 'ペ',
  'ポ', 'ッ', 'ャ', 'ュ', 'ョ', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ'
];

// Numbers for Matrix effect
const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

// Combined character set
const matrixChars = [...katakanaChars, ...numbers];

// Matrix Rain Stream Class
class MatrixStream {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  columnHeight: number;
  charSpacing: number;
  opacity: number;
  depth: number; // 0 = foreground, 1 = background
  glowIntensity: number;
  trailLength: number;
  charIndex: number;

  constructor(x: number, speed: number) {
    this.x = x;
    this.y = -Math.random() * 1000; // Start off-screen
    this.speed = speed + Math.random() * 2; // Varying speeds
    this.columnHeight = Math.floor(Math.random() * 20) + 15; // 15-34 characters
    this.charSpacing = 20; // Space between characters
    this.opacity = 1;
    this.depth = Math.random(); // Random depth for layered effect
    this.glowIntensity = Math.random() * 0.5 + 0.3; // Random glow intensity
    this.trailLength = Math.floor(Math.random() * 8) + 5; // 5-12 character trail
    this.charIndex = 0;
    
    // Generate random katakana and number characters
    this.chars = Array.from({ length: this.columnHeight }, () => 
      matrixChars[Math.floor(Math.random() * matrixChars.length)]
    );
  }

  update(): boolean {
    this.y += this.speed;
    
    // Cycle through characters for the head
    this.charIndex = (this.charIndex + 0.1) % this.chars.length;
    
    // Fade out as it falls
    if (this.y > 100) {
      this.opacity = Math.max(0, 1 - (this.y - 100) / 300);
    }
    
    return this.y < window.innerHeight + (this.columnHeight * this.charSpacing) + 100;
  }

  draw(ctx: CanvasRenderingContext2D, fontSize: number): void {
    if (this.opacity <= 0) return;

    ctx.save();
    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = 'center';
    
    // Calculate depth-based properties
    const depthOpacity = this.depth < 0.3 ? 1 : 0.3 + (1 - this.depth) * 0.7; // Foreground bright, background dim
    const depthSize = this.depth < 0.3 ? 1 : 0.7 + (1 - this.depth) * 0.3; // Foreground larger, background smaller
    const depthBlur = this.depth < 0.3 ? 0 : (1 - this.depth) * 8; // Foreground sharp, background blurred
    
    // Draw the column of characters
    for (let i = 0; i < this.columnHeight; i++) {
      const charY = this.y + (i * this.charSpacing);
      
      // Skip if character is off screen
      if (charY < -fontSize || charY > window.innerHeight + fontSize) continue;
      
      // Calculate opacity for this character (head is brightest, tail fades)
      const charOpacity = Math.max(0, 1 - (i / this.columnHeight) * 0.9);
      const finalOpacity = charOpacity * this.opacity * depthOpacity;
      
      if (finalOpacity <= 0) continue;
      
      ctx.globalAlpha = finalOpacity;
      
      // Get character (cycling for head, static for body)
      const char = i === 0 ? this.chars[Math.floor(this.charIndex)] : this.chars[i % this.chars.length];
      
      // Calculate color intensity based on position and depth
      const greenIntensity = 0.2 + (charOpacity * 0.8) * depthOpacity;
      const color = `rgba(0, 255, 65, ${greenIntensity})`;
      
      // Apply depth-based scaling
      const scale = depthSize;
      ctx.scale(scale, scale);
      
      // Apply glow effect
      if (this.depth < 0.5) { // Only foreground streams get glow
        ctx.shadowColor = '#00FF41';
        ctx.shadowBlur = this.glowIntensity * 15;
        ctx.fillStyle = color;
        ctx.fillText(char, this.x / scale, charY / scale);
        
        // Add trailing blur effect
        if (i < this.trailLength) {
          ctx.shadowBlur = this.glowIntensity * 8;
          ctx.globalAlpha = finalOpacity * 0.3;
          ctx.fillText(char, this.x / scale, charY / scale);
        }
      } else {
        // Background streams - no glow, just color
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.fillStyle = color;
        ctx.fillText(char, this.x / scale, charY / scale);
      }
      
      // Reset scale for next character
      ctx.scale(1 / scale, 1 / scale);
    }
    
    ctx.restore();
  }
}

export default function MatrixRain({
  width = typeof window !== 'undefined' ? window.innerWidth : 800,
  height = typeof window !== 'undefined' ? window.innerHeight : 600,
  speed = 2,
  density = 0.02,
  className,
  enabled = true
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const streamsRef = useRef<MatrixStream[]>([]);
  const lastTimeRef = useRef<number>(0);

  const createStream = useCallback((x: number) => {
    const streamSpeed = speed + Math.random() * 3; // Varying speeds
    return new MatrixStream(x, streamSpeed);
  }, [speed]);

  const updateStreams = useCallback(() => {
    const now = Date.now();
    const deltaTime = now - lastTimeRef.current;
    lastTimeRef.current = now;

    // Add new streams
    if (Math.random() < density) {
      const x = Math.random() * width;
      streamsRef.current.push(createStream(x));
    }

    // Update existing streams
    streamsRef.current = streamsRef.current.filter(stream => stream.update());
  }, [width, density, createStream]);

  const drawStreams = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with subtle fade effect for trailing
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    ctx.fillRect(0, 0, width, height);

    // Draw streams
    const fontSize = Math.min(width / 80, 18);
    streamsRef.current.forEach(stream => stream.draw(ctx, fontSize));
  }, [width, height]);

  const animate = useCallback(() => {
    if (!enabled) return;

    updateStreams();
    drawStreams();
    animationRef.current = requestAnimationFrame(animate);
  }, [enabled, updateStreams, drawStreams]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;
    
    // Set initial streams
    streamsRef.current = Array.from({ length: Math.floor(width * density) }, () => 
      createStream(Math.random() * width)
    );
  }, [width, height, density, createStream]);

  // Start animation
  useEffect(() => {
    if (enabled) {
      lastTimeRef.current = Date.now();
      animate();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, animate]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        canvasRef.current.width = newWidth;
        canvasRef.current.height = newHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

// Hook for matrix rain
export const useMatrixRain = () => {
  const [enabled, setEnabled] = React.useState(true);
  const [speed, setSpeed] = React.useState(2);
  const [density, setDensity] = React.useState(0.02);

  return {
    enabled,
    setEnabled,
    speed,
    setSpeed,
    density,
    setDensity
  };
};

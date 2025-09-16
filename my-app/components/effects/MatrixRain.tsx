"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

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

// (removed unused gtaWords)

// Japanese Katakana Characters for Matrix effect
const katakanaChars = [
  "ア",
  "イ",
  "ウ",
  "エ",
  "オ",
  "カ",
  "キ",
  "ク",
  "ケ",
  "コ",
  "サ",
  "シ",
  "ス",
  "セ",
  "ソ",
  "タ",
  "チ",
  "ツ",
  "テ",
  "ト",
  "ナ",
  "ニ",
  "ヌ",
  "ネ",
  "ノ",
  "ハ",
  "ヒ",
  "フ",
  "ヘ",
  "ホ",
  "マ",
  "ミ",
  "ム",
  "メ",
  "モ",
  "ヤ",
  "ユ",
  "ヨ",
  "ラ",
  "リ",
  "ル",
  "レ",
  "ロ",
  "ワ",
  "ヲ",
  "ン",
];

// Numbers for Matrix effect
const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

// GTA Easter Eggs - Special elements that occasionally appear
const gtaEasterEggs = [
  "💀",
  "🚗",
  "💰",
  "🔫",
  "💣",
  "🚁",
  "🚢",
  "✈️",
  "🏆",
  "⭐",
  "🔥",
  "💎",
  "🎯",
  "⚡",
  "🌟",
  "💥",
  "🎮",
  "🎲",
  "🎪",
  "🎭",
  "GTA",
  "VICE",
  "CITY",
  "LOS SANTOS",
  "LIBERTY",
  "NIKO",
  "MICHAEL",
  "FRANKLIN",
  "TREVOR",
];

// Combined character set
const matrixChars = [...katakanaChars, ...numbers];

// GTA Easter Egg Class - Special elements that appear in front
class GTAEasterEgg {
  x: number;
  y: number;
  speed: number;
  text: string;
  opacity: number;
  scale: number;
  rotation: number;
  color: string;
  lifetime: number;
  maxLifetime: number;

  constructor(x: number, speed: number) {
    this.x = x;
    this.y = -100;
    this.speed = speed;
    this.text = gtaEasterEggs[Math.floor(Math.random() * gtaEasterEggs.length)];
    this.opacity = 1;
    this.scale = 1;
    this.rotation = 0;
    this.lifetime = 0;
    this.maxLifetime = 3000 + Math.random() * 2000; // 3-5 seconds

    // Random colors for different easter eggs
    const colors = [
      "rgba(255, 215, 0, 1)", // Gold
      "rgba(255, 165, 0, 1)", // Orange
      "rgba(255, 0, 0, 1)", // Red
      "rgba(0, 255, 255, 1)", // Cyan
      "rgba(255, 0, 255, 1)", // Magenta
      "rgba(0, 255, 0, 1)", // Green
    ];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update(): boolean {
    this.y += this.speed;
    this.lifetime += 16; // Assuming 60fps

    // Fade out over time
    this.opacity = Math.max(0, 1 - this.lifetime / this.maxLifetime);

    // Gentle rotation
    this.rotation += 0.02;

    // Slight scale pulsing
    this.scale = 1 + Math.sin(this.lifetime * 0.01) * 0.1;

    return (
      this.lifetime < this.maxLifetime && this.y < window.innerHeight + 100
    );
  }

  draw(ctx: CanvasRenderingContext2D, fontSize: number): void {
    if (this.opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.font = `${fontSize * 1.5}px monospace`;
    ctx.textAlign = "center";
    ctx.fillStyle = this.color;

    // Add glow effect for easter eggs
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20;

    // Apply transformations
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.scale, this.scale);

    ctx.fillText(this.text, 0, 0);

    ctx.restore();
  }
}

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
  charIndex: number;

  constructor(x: number, speed: number) {
    this.x = x;
    this.y = -Math.random() * 1000; // Start off-screen
    this.speed = speed + Math.random() * 2; // Varying speeds
    this.columnHeight = Math.floor(Math.random() * 20) + 15; // 15-34 characters
    this.charSpacing = 20; // Space between characters
    this.opacity = 1;
    this.depth = Math.random(); // Random depth for layered effect
    this.charIndex = 0;

    // Generate random katakana and number characters
    this.chars = Array.from(
      { length: this.columnHeight },
      () => matrixChars[Math.floor(Math.random() * matrixChars.length)]
    );
  }

  update(): boolean {
    this.y += this.speed;

    // Move the highlighted character down the column (1 character per 0.5 seconds)
    this.charIndex = (this.charIndex + 0.1) % this.columnHeight;

    // Fade out as it falls
    if (this.y > 100) {
      this.opacity = Math.max(0, 1 - (this.y - 100) / 300);
    }

    return (
      this.y < window.innerHeight + this.columnHeight * this.charSpacing + 100
    );
  }

  draw(ctx: CanvasRenderingContext2D, fontSize: number): void {
    if (this.opacity <= 0) return;

    ctx.save();
    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = "center";

    // Calculate depth-based properties
    const depthOpacity = this.depth < 0.3 ? 1 : 0.3 + (1 - this.depth) * 0.7; // Foreground bright, background dim
    const depthSize = this.depth < 0.3 ? 1 : 0.7 + (1 - this.depth) * 0.3; // Foreground larger, background smaller

    // Draw the column of characters
    for (let i = 0; i < this.columnHeight; i++) {
      const charY = this.y + i * this.charSpacing;

      // Skip if character is off screen
      if (charY < -fontSize || charY > window.innerHeight + fontSize) continue;

      // Calculate opacity for this character (head is brightest, tail fades)
      const charOpacity = Math.max(0, 1 - (i / this.columnHeight) * 0.9);
      const finalOpacity = charOpacity * this.opacity * depthOpacity;

      if (finalOpacity <= 0) continue;

      ctx.globalAlpha = finalOpacity;

      // Get character
      const char = this.chars[i % this.chars.length];

      // Check if this character should be highlighted (bright)
      const isHighlighted = Math.floor(this.charIndex) === i;

      // Calculate color intensity - highlighted characters are bright, others are dim
      let greenIntensity;
      if (isHighlighted) {
        // Bright highlighted character
        greenIntensity = 1.0 * depthOpacity;
      } else {
        // Dim background characters
        greenIntensity = (0.1 + charOpacity * 0.3) * depthOpacity;
      }

      const color = `rgba(0, 255, 65, ${greenIntensity})`;

      // Apply depth-based scaling
      const scale = depthSize;
      ctx.scale(scale, scale);

      // No blur effects - crisp and readable
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.fillStyle = color;
      ctx.fillText(char, this.x / scale, charY / scale);

      // Reset scale for next character
      ctx.scale(1 / scale, 1 / scale);
    }

    ctx.restore();
  }
}

export default function MatrixRain({
  width = typeof window !== "undefined" ? window.innerWidth : 800,
  height = typeof window !== "undefined" ? window.innerHeight : 600,
  speed = 2,
  density = 0.02,
  className,
  enabled = true,
}: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const streamsRef = useRef<MatrixStream[]>([]);
  const easterEggsRef = useRef<GTAEasterEgg[]>([]);
  // (removed unused lastTimeRef)

  const createStream = useCallback(
    (x: number) => {
      const streamSpeed = speed + Math.random() * 3; // Varying speeds
      return new MatrixStream(x, streamSpeed);
    },
    [speed]
  );

  const createEasterEgg = useCallback(
    (x: number) => {
      const easterEggSpeed = speed * 0.5; // Slower than matrix streams
      return new GTAEasterEgg(x, easterEggSpeed);
    },
    [speed]
  );

  const updateStreams = useCallback(() => {
    // Add new streams
    if (Math.random() < density) {
      const x = Math.random() * width;
      streamsRef.current.push(createStream(x));
    }

    // Add new easter eggs (much less frequent)
    if (Math.random() < density * 0.1) {
      // 10% of normal density
      const x = Math.random() * width;
      easterEggsRef.current.push(createEasterEgg(x));
    }

    // Update existing streams
    streamsRef.current = streamsRef.current.filter((stream) => stream.update());

    // Update existing easter eggs
    easterEggsRef.current = easterEggsRef.current.filter((easterEgg) =>
      easterEgg.update()
    );
  }, [width, density, createStream, createEasterEgg]);

  const drawStreams = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas with subtle fade effect for trailing
    ctx.fillStyle = "rgba(0, 0, 0, 0.03)";
    ctx.fillRect(0, 0, width, height);

    // Draw matrix streams
    const fontSize = Math.min(width / 80, 18);
    streamsRef.current.forEach((stream) => stream.draw(ctx, fontSize));

    // Draw easter eggs in front
    easterEggsRef.current.forEach((easterEgg) => easterEgg.draw(ctx, fontSize));
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
    streamsRef.current = Array.from(
      { length: Math.floor(width * density) },
      () => createStream(Math.random() * width)
    );
  }, [width, height, density, createStream]);

  // Start animation
  useEffect(() => {
    if (enabled) {
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

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{ width: "100%", height: "100%" }}
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
    setDensity,
  };
};

'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Matrix Rain Effect with GTA Universe Names
// This component creates a matrix-style falling text effect with Japanese characters and GTA names

interface MatrixRainProps {
  width?: number;
  height?: number;
  speed?: number;
  density?: number;
  className?: string;
  enabled?: boolean;
}

// GTA Universe Names and Terms
const gtaNames = [
  // Protagonists
  'Niko Bellic', 'Michael De Santa', 'Franklin Clinton', 'Trevor Philips',
  'Tommy Vercetti', 'Carl Johnson', 'Claude Speed', 'Johnny Klebitz',
  'Luis Lopez', 'Huang Lee', 'Victor Vance', 'Tony Cipriani',
  'Salvatore Leone', 'Donald Love', 'Asuka Kasen', 'Kenji Kasen',
  'Kazuki Kasen', 'Toshiko Kasen', 'Yakuza', 'Triad',
  
  // Locations
  'Liberty City', 'Los Santos', 'San Fierro', 'Las Venturas',
  'Vice City', 'Alderney', 'Bohan', 'Dukes', 'Broker',
  'Algonquin', 'Chinatown', 'Little Italy', 'Hove Beach',
  'Vinewood', 'Grove Street', 'Ganton', 'East Los Santos',
  'Las Venturas Strip', 'The Strip', 'Downtown Los Santos',
  
  // Cars
  'Infernus', 'Banshee', 'Cheetah', 'Comet', 'Stinger',
  'Stinger GT', 'Turismo', 'Bullet', 'Super GT', 'ZR-350',
  'Elegy', 'Jester', 'Sultan', 'Euros', 'Flash', 'Uranus',
  'Sultan RS', 'Elegy RH8', 'Feltzer', 'Stratum', 'Windsor',
  'Monroe', 'Peyote', 'Manana', 'Hermes', 'Hustler',
  'Phoenix', 'Sabre', 'Sabre Turbo', 'Tampa', 'Virgo',
  
  // Organizations
  'Grove Street Families', 'Ballas', 'Vagos', 'Los Santos Vagos',
  'Varrios Los Aztecas', 'Marabunta Grande', 'San Fierro Rifa',
  'Da Nang Boys', 'Red Gecko Tong', 'Mountain Cloud Boys',
  'Leone Family', 'Forelli Family', 'Sindacco Family',
  'Pavarotti Family', 'Messina Family', 'Ancelotti Family',
  'Gambetti Family', 'Pegorino Family', 'Lupisella Family',
  
  // Weapons
  'AK-47', 'M4', 'Desert Eagle', 'Combat Shotgun', 'Sniper Rifle',
  'RPG', 'Grenade', 'Molotov Cocktail', 'Baseball Bat',
  'Chainsaw', 'Katana', 'Brass Knuckles', 'Tear Gas',
  
  // Misc Terms
  'Grove Street', 'Grove Street 4 Life', 'Grove Street Families',
  'Ballin', 'Gangsta', 'OG', 'Respect', 'Reputation',
  'Wanted Level', 'Police', 'FBI', 'SWAT', 'Army',
  'Hospital', 'Police Station', 'Pay N Spray', 'Ammu-Nation',
  'Burger Shot', 'Cluckin Bell', 'Pizza Stack', 'Rusty Brown',
  'Binco', 'Sub Urban', 'Zip', 'Victim', 'Didier Sachs',
  'Prolaps', 'Bargain Bin', 'Binco', 'Sub Urban', 'Zip'
];

// Japanese Characters (Hiragana, Katakana, and some Kanji)
const japaneseChars = [
  // Hiragana
  'あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ',
  'さ', 'し', 'す', 'せ', 'そ', 'た', 'ち', 'つ', 'て', 'と',
  'な', 'に', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'へ', 'ほ',
  'ま', 'み', 'む', 'め', 'も', 'や', 'ゆ', 'よ', 'ら', 'り',
  'る', 'れ', 'ろ', 'わ', 'を', 'ん',
  
  // Katakana
  'ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク', 'ケ', 'コ',
  'サ', 'シ', 'ス', 'セ', 'ソ', 'タ', 'チ', 'ツ', 'テ', 'ト',
  'ナ', 'ニ', 'ヌ', 'ネ', 'ノ', 'ハ', 'ヒ', 'フ', 'ヘ', 'ホ',
  'マ', 'ミ', 'ム', 'メ', 'モ', 'ヤ', 'ユ', 'ヨ', 'ラ', 'リ',
  'ル', 'レ', 'ロ', 'ワ', 'ヲ', 'ン',
  
  // Some Kanji
  '人', '大', '小', '中', '上', '下', '左', '右', '前', '後',
  '東', '西', '南', '北', '車', '道', '街', '市', '国', '家',
  '水', '火', '土', '金', '木', '月', '日', '年', '時', '分',
  '秒', '今', '昔', '新', '古', '高', '低', '長', '短', '広',
  '狭', '多', '少', '強', '弱', '早', '遅', '美', '醜', '善',
  '悪', '正', '邪', '真', '偽', '生', '死', '愛', '憎', '喜',
  '悲', '怒', '楽', '苦', '幸', '不幸', '成功', '失敗', '勝利',
  '敗北', '希望', '絶望', '夢', '現実', '過去', '未来', '現在'
];

// Matrix Rain Drop Class
class MatrixDrop {
  x: number;
  y: number;
  speed: number;
  chars: string[];
  columnHeight: number;
  charSpacing: number;
  opacity: number;
  isGTA: boolean;
  gtaName: string;

  constructor(x: number, speed: number, isGTA: boolean = false) {
    this.x = x;
    this.y = -50;
    this.speed = speed;
    this.isGTA = isGTA;
    this.columnHeight = Math.floor(Math.random() * 12) + 6; // 6-17 characters
    this.charSpacing = 18; // Space between characters
    this.opacity = 1;
    
    if (isGTA) {
      this.gtaName = gtaNames[Math.floor(Math.random() * gtaNames.length)];
      this.chars = this.gtaName.split('');
    } else {
      // Random letters and numbers
      const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      this.chars = Array.from({ length: this.columnHeight }, () => 
        randomChars[Math.floor(Math.random() * randomChars.length)]
      );
    }
  }

  update(): boolean {
    this.y += this.speed;
    
    // Fade out as it falls
    if (this.y > 100) {
      this.opacity = Math.max(0, 1 - (this.y - 100) / 200);
    }
    
    return this.y < window.innerHeight + (this.columnHeight * this.charSpacing);
  }

  draw(ctx: CanvasRenderingContext2D, fontSize: number): void {
    if (this.opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.font = `${fontSize}px monospace`;
    ctx.textAlign = 'center';
    
    // Draw the column of characters
    for (let i = 0; i < this.columnHeight; i++) {
      const charY = this.y + (i * this.charSpacing);
      
      // Skip if character is off screen
      if (charY < -fontSize || charY > window.innerHeight + fontSize) continue;
      
      // Calculate opacity for this character (head is brightest, tail fades)
      const charOpacity = Math.max(0, 1 - (i / this.columnHeight) * 0.8);
      const finalOpacity = charOpacity * this.opacity;
      
      if (finalOpacity <= 0) continue;
      
      ctx.globalAlpha = finalOpacity;
      
      if (this.isGTA) {
        // GTA names in bright green - no blur
        ctx.fillStyle = '#00FF41';
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        const char = this.chars[i % this.chars.length];
        ctx.fillText(char, this.x, charY);
      } else {
        // Random letters in different shades - no blur
        const greenIntensity = 0.3 + (charOpacity * 0.7);
        ctx.fillStyle = `rgba(0, 255, 65, ${greenIntensity})`;
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        const char = this.chars[i];
        ctx.fillText(char, this.x, charY);
      }
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
  const dropsRef = useRef<MatrixDrop[]>([]);
  const lastTimeRef = useRef<number>(0);

  const createDrop = useCallback((x: number) => {
    const isGTA = Math.random() < 0.3; // 30% chance for GTA names
    const dropSpeed = speed + Math.random() * 2;
    return new MatrixDrop(x, dropSpeed, isGTA);
  }, [speed]);

  const updateDrops = useCallback(() => {
    const now = Date.now();
    const deltaTime = now - lastTimeRef.current;
    lastTimeRef.current = now;

    // Add new drops
    if (Math.random() < density) {
      const x = Math.random() * width;
      dropsRef.current.push(createDrop(x));
    }

    // Update existing drops
    dropsRef.current = dropsRef.current.filter(drop => drop.update());
  }, [width, density, createDrop]);

  const drawDrops = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);

    // Draw drops
    const fontSize = Math.min(width / 100, 16);
    dropsRef.current.forEach(drop => drop.draw(ctx, fontSize));
  }, [width, height]);

  const animate = useCallback(() => {
    if (!enabled) return;

    updateDrops();
    drawDrops();
    animationRef.current = requestAnimationFrame(animate);
  }, [enabled, updateDrops, drawDrops]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;
    
    // Set initial drops
    dropsRef.current = Array.from({ length: Math.floor(width * density) }, () => 
      createDrop(Math.random() * width)
    );
  }, [width, height, density, createDrop]);

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

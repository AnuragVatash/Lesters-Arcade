"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface Block {
  id: number;
  position: number; // 0-100, where 50 is aligned with red line
  direction: number; // 1 or -1
  speed: number;
  gapPosition: number; // Where the gap is in the block (0-100)
  locked: boolean;
  isActive: boolean;
}

const TIMER_DURATION = 120; // 2 minutes
const BLOCK_HEIGHT = 200;
const GAP_SIZE = 40;
const ALIGNMENT_TOLERANCE = 15; // How close the gap needs to be to center

export default function DataCrack() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [attempts, setAttempts] = useState(0);
  const animationRef = useRef<number | undefined>(undefined);

  // Initialize blocks
  useEffect(() => {
    const initialBlocks: Block[] = Array.from({ length: 8 }, (_, index) => ({
      id: index,
      position: Math.random() * 100,
      direction: Math.random() > 0.5 ? 1 : -1,
      speed: 0.5 + (index * 0.3), // Each block gets progressively faster
      gapPosition: 20 + Math.random() * 60, // Random gap position
      locked: false,
      isActive: index === 0
    }));
    setBlocks(initialBlocks);
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => {
        if (block.locked) return block;
        
        let newPosition = block.position + (block.direction * block.speed);
        let newDirection = block.direction;
        
        // Bounce off boundaries
        if (newPosition <= 0) {
          newPosition = 0;
          newDirection = 1;
        } else if (newPosition >= 100) {
          newPosition = 100;
          newDirection = -1;
        }
        
        return {
          ...block,
          position: newPosition,
          direction: newDirection
        };
      })
    );
    
    if (gameStatus === 'playing') {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [gameStatus]);

  // Start animation
  useEffect(() => {
    if (gameStatus === 'playing') {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, gameStatus]);

  // Timer effect
  useEffect(() => {
    if (gameStatus !== 'playing') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameStatus('lost');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus]);

  // Check if gap is aligned with red line
  const isGapAligned = (block: Block): boolean => {
    const blockCenter = 50; // Red line is at 50%
    const gapStart = block.position + (block.gapPosition / 100) * 80 - 40; // Adjust for block positioning
    const gapEnd = gapStart + (GAP_SIZE / BLOCK_HEIGHT) * 100;
    
    return Math.abs(gapStart + (gapEnd - gapStart) / 2 - blockCenter) <= ALIGNMENT_TOLERANCE;
  };

  // Handle lock attempt
  const handleLock = useCallback(() => {
    if (gameStatus !== 'playing' || currentBlockIndex >= blocks.length) return;
    
    const currentBlock = blocks[currentBlockIndex];
    const aligned = isGapAligned(currentBlock);
    
    setAttempts(prev => prev + 1);
    
    if (aligned) {
      // Success - lock the block and move to next
      setBlocks(prevBlocks => 
        prevBlocks.map((block, index) => {
          if (index === currentBlockIndex) {
            return { ...block, locked: true, isActive: false };
          } else if (index === currentBlockIndex + 1) {
            return { ...block, isActive: true };
          }
          return block;
        })
      );
      
      if (currentBlockIndex === blocks.length - 1) {
        // All blocks completed
        setGameStatus('won');
      } else {
        setCurrentBlockIndex(prev => prev + 1);
      }
    } else {
      // Failed - reset previous block(s)
      const resetIndex = Math.max(0, currentBlockIndex - 1);
      
      setBlocks(prevBlocks => 
        prevBlocks.map((block, index) => {
          if (index >= resetIndex && index < currentBlockIndex) {
            return { 
              ...block, 
              locked: false, 
              isActive: false,
              position: Math.random() * 100,
              direction: Math.random() > 0.5 ? 1 : -1
            };
          } else if (index === resetIndex) {
            return { ...block, isActive: true };
          }
          return { ...block, isActive: false };
        })
      );
      
      setCurrentBlockIndex(resetIndex);
    }
  }, [gameStatus, currentBlockIndex, blocks]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && gameStatus === 'playing') {
        event.preventDefault();
        handleLock();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStatus, currentBlockIndex, blocks, handleLock]);

  const resetGame = () => {
    setTimeLeft(TIMER_DURATION);
    setGameStatus('playing');
    setCurrentBlockIndex(0);
    setAttempts(0);
    
    const resetBlocks: Block[] = Array.from({ length: 8 }, (_, index) => ({
      id: index,
      position: Math.random() * 100,
      direction: Math.random() > 0.5 ? 1 : -1,
      speed: 0.5 + (index * 0.3),
      gapPosition: 20 + Math.random() * 60,
      locked: false,
      isActive: index === 0
    }));
    setBlocks(resetBlocks);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold terminal-yellow">DATA CRACK</h1>
          <p className="text-sm opacity-75">Selling your secrets since 1996</p>
        </div>
        <div className="text-right">
          <div className={`timer-display ${timeLeft <= 10 ? 'timer-warning' : ''}`}>
            {formatTime(timeLeft)}
          </div>
          <Link href="/" className="hack-button inline-block mt-2">
            ← MENU
          </Link>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Blocks Display */}
        <div className="flex-1">
          <div className="relative bg-gray-900 border-2 border-green-400 p-4" style={{ height: '400px' }}>
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-full border-t border-green-400"
                  style={{ top: `${(i + 1) * 5}%` }}
                />
              ))}
            </div>

            {/* Red Line */}
            <div 
              className="absolute w-full h-1 bg-red-500 z-10"
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            />

            {/* Blocks */}
            <div className="flex justify-between items-start h-full relative z-20">
              {blocks.map((block, index) => (
                <div key={block.id} className="relative w-12 h-full">
                  {/* Block Number */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs">
                    {index + 1}
                  </div>
                  
                  {/* Moving Block Container */}
                  <div
                    className={`absolute w-full transition-colors duration-200 ${
                      block.locked ? 'opacity-50' : ''
                    }`}
                    style={{
                      height: `${BLOCK_HEIGHT}px`,
                      top: `${block.position}%`,
                      transform: 'translateY(-50%)'
                    }}
                  >
                    {/* Top part of block */}
                    <div
                      className={`w-full ${
                        block.isActive ? 'bg-yellow-400' : 'bg-white'
                      } ${block.locked ? 'bg-green-400' : ''}`}
                      style={{
                        height: `${block.gapPosition}%`
                      }}
                    />
                    
                    {/* Gap */}
                    <div
                      className="w-full bg-transparent"
                      style={{
                        height: `${(GAP_SIZE / BLOCK_HEIGHT) * 100}%`
                      }}
                    />
                    
                    {/* Bottom part of block */}
                    <div
                      className={`w-full ${
                        block.isActive ? 'bg-yellow-400' : 'bg-white'
                      } ${block.locked ? 'bg-green-400' : ''}`}
                      style={{
                        height: `${100 - block.gapPosition - (GAP_SIZE / BLOCK_HEIGHT) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lock Button */}
          <div className="mt-4 text-center">
            <button
              onClick={handleLock}
              disabled={gameStatus !== 'playing'}
              className="hack-button text-xl px-8 py-4"
            >
              LOCK (SPACEBAR)
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="w-full lg:w-80">
          <div className="terminal-border p-4">
            <h3 className="text-lg font-bold mb-4">INSTRUCTIONS:</h3>
            <ul className="text-sm space-y-2 opacity-75">
              <li>• Press LOCK when the gap aligns with the red line</li>
              <li>• Start with block 1, progress through all 8</li>
              <li>• Each block moves faster than the last</li>
              <li>• Missing resets previous blocks</li>
              <li>• Use SPACEBAR or click the button</li>
            </ul>
            
            <div className="mt-4">
              <h4 className="font-bold mb-2">STATUS:</h4>
              <div className="space-y-1 text-sm">
                <div>Current Block: {currentBlockIndex + 1}/8</div>
                <div>Attempts: {attempts}</div>
                <div>Locked: {blocks.filter(b => b.locked).length}/8</div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-bold mb-2">LEGEND:</h4>
              <div className="space-y-1 text-sm">
                <div className="terminal-yellow">Yellow = Active Block</div>
                <div>White = Inactive Block</div>
                <div className="text-green-400">Green = Locked Block</div>
                <div className="terminal-red">Red Line = Target</div>
              </div>
            </div>

            {gameStatus !== 'playing' && (
              <div className="mt-4">
                <button onClick={resetGame} className="hack-button w-full">
                  RESTART HACK
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {gameStatus === 'won' && (
        <div className="status-message status-success">
          ACCESS GRANTED<br />
          <span className="text-sm">All blocks aligned successfully!</span>
        </div>
      )}
      
      {gameStatus === 'lost' && (
        <div className="status-message status-failure">
          ACCESS DENIED<br />
          <span className="text-sm">Time expired!</span>
        </div>
      )}
    </div>
  );
} 
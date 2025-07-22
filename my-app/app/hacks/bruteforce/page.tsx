"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

const PASSWORDS = [
  'DEADLOCK', 'PASSWORD', 'UNLOCKED', 'DECIPHER', 'BACKDOOR', 
  'TERMINAL', 'OVERRIDE', 'SHUTDOWN', 'MAINFILE', 'KEYBOARD',
  'COMPUTER', 'HELPDESK', 'MONITOR', 'FIREWALL', 'DATABASE'
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const TIMER_DURATION = 60; // 60 seconds
const COLUMN_COUNT = 8;

interface Column {
  currentIndex: number;
  targetLetter: string;
  isSpinning: boolean;
  isStopped: boolean;
  isCorrect: boolean;
  speed: number;
}

export default function BruteForce() {
  const [password, setPassword] = useState('');
  const [columns, setColumns] = useState<Column[]>([]);
  const [currentColumn, setCurrentColumn] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [revealedPassword, setRevealedPassword] = useState('');
  const animationRefs = useRef<number[]>([]);

  // Initialize new password
  const initializeNewPassword = useCallback(() => {
    const newPassword = PASSWORDS[Math.floor(Math.random() * PASSWORDS.length)];
    setPassword(newPassword);
    
    const newColumns: Column[] = newPassword.split('').map((letter, index) => ({
      currentIndex: Math.floor(Math.random() * ALPHABET.length),
      targetLetter: letter,
      isSpinning: true,
      isStopped: false,
      isCorrect: false,
      speed: 50 + Math.random() * 30 // Varying speeds for each column
    }));
    
    setColumns(newColumns);
    setCurrentColumn(0);
    setRevealedPassword('');
    setTimeLeft(TIMER_DURATION);
    setGameStatus('playing');
  }, []);

  // Initialize first password
  useEffect(() => {
    initializeNewPassword();
  }, [initializeNewPassword]);

  // Animation loop for spinning columns
  const animateColumn = useCallback((columnIndex: number) => {
    if (columnIndex >= columns.length) return;
    
    const column = columns[columnIndex];
    if (!column.isSpinning || column.isStopped) return;

    const animate = () => {
      setColumns(prev => {
        const newColumns = [...prev];
        if (newColumns[columnIndex] && newColumns[columnIndex].isSpinning && !newColumns[columnIndex].isStopped) {
          newColumns[columnIndex] = {
            ...newColumns[columnIndex],
            currentIndex: (newColumns[columnIndex].currentIndex + 1) % ALPHABET.length
          };
        }
        return newColumns;
      });

      if (gameStatus === 'playing' && columns[columnIndex]?.isSpinning && !columns[columnIndex]?.isStopped) {
        animationRefs.current[columnIndex] = requestAnimationFrame(animate);
      }
    };

    animationRefs.current[columnIndex] = requestAnimationFrame(animate);
  }, [columns, gameStatus]);

  // Start animations for all spinning columns
  useEffect(() => {
    columns.forEach((column, index) => {
      if (column.isSpinning && !column.isStopped) {
        const interval = setInterval(() => {
          animateColumn(index);
        }, column.speed);

        return () => clearInterval(interval);
      }
    });

    return () => {
      animationRefs.current.forEach(ref => {
        if (ref) cancelAnimationFrame(ref);
      });
    };
  }, [columns, animateColumn]);

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

  // Handle stop button press
  const handleStop = () => {
    if (gameStatus !== 'playing' || currentColumn >= columns.length) return;

    setColumns(prev => {
      const newColumns = [...prev];
      const column = newColumns[currentColumn];
      
      // Stop the column
      column.isStopped = true;
      column.isSpinning = false;
      
      // Check if it's correct
      const currentLetter = ALPHABET[column.currentIndex];
      column.isCorrect = currentLetter === column.targetLetter;
      
      return newColumns;
    });

    // Update revealed password
    setRevealedPassword(prev => {
      const current = ALPHABET[columns[currentColumn]?.currentIndex || 0];
      return prev + current;
    });

    // Check if this was the last column
    if (currentColumn === columns.length - 1) {
      // Game finished - check if all correct
      setTimeout(() => {
        const allCorrect = columns.every((col, index) => {
          if (index < columns.length - 1) return col.isCorrect;
          // For the last column, check manually since state might not be updated yet
          const letter = ALPHABET[col.currentIndex];
          return letter === col.targetLetter;
        });

        if (allCorrect) {
          setGameStatus('won');
        } else {
          setGameStatus('lost');
        }
      }, 100);
    } else {
      // Move to next column
      setCurrentColumn(prev => prev + 1);
    }
  };

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && gameStatus === 'playing') {
        event.preventDefault();
        handleStop();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStatus, currentColumn, columns]);

  // Get current letter for a column
  const getCurrentLetter = (columnIndex: number) => {
    const column = columns[columnIndex];
    if (!column) return 'A';
    return ALPHABET[column.currentIndex];
  };

  // Check if column is the target (red highlight)
  const isTargetVisible = (columnIndex: number) => {
    const column = columns[columnIndex];
    if (!column) return false;
    return getCurrentLetter(columnIndex) === column.targetLetter;
  };

  const resetGame = () => {
    // Cancel all animations
    animationRefs.current.forEach(ref => {
      if (ref) cancelAnimationFrame(ref);
    });
    animationRefs.current = [];
    
    initializeNewPassword();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold terminal-yellow">BruteForce.exe</h1>
          <p className="text-sm opacity-75">Busting through the backdoor since 1998</p>
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

      {/* Password Display */}
      <div className="text-center mb-6">
        <div className="terminal-border p-4 inline-block">
          <h2 className="text-lg mb-2">PASSWORD RECOVERY:</h2>
          <div className="text-2xl font-bold tracking-wider">
            {revealedPassword.padEnd(COLUMN_COUNT, '_')}
          </div>
          <div className="text-sm opacity-75 mt-2">
            Column {currentColumn + 1} of {COLUMN_COUNT}
          </div>
        </div>
      </div>

      {/* Letter Columns */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex justify-center gap-4 mb-6">
          {columns.map((column, index) => (
            <div key={index} className="text-center">
              <div className="text-xs opacity-75 mb-2">COL {index + 1}</div>
              
              {/* Column display with spinning letters */}
              <div className="relative">
                <div className={`w-16 h-24 border-2 overflow-hidden relative ${
                  index === currentColumn ? 'border-yellow-400' : 'border-gray-600'
                } ${column.isStopped ? (column.isCorrect ? 'border-green-400' : 'border-red-400') : ''}`}>
                  
                  {/* Previous letter (partially visible) */}
                  <div className="absolute w-full h-8 -top-2 flex items-center justify-center text-lg opacity-30">
                    {ALPHABET[(column.currentIndex - 1 + ALPHABET.length) % ALPHABET.length]}
                  </div>
                  
                  {/* Current letter (main display) */}
                  <div className={`absolute w-full h-8 top-1/2 transform -translate-y-1/2 flex items-center justify-center text-2xl font-bold ${
                    isTargetVisible(index) ? 'terminal-red text-shadow-glow' : 'text-white'
                  } ${column.isStopped ? (column.isCorrect ? 'text-green-400' : 'text-red-400') : ''}`}>
                    {getCurrentLetter(index)}
                  </div>
                  
                  {/* Next letter (partially visible) */}
                  <div className="absolute w-full h-8 -bottom-2 flex items-center justify-center text-lg opacity-30">
                    {ALPHABET[(column.currentIndex + 1) % ALPHABET.length]}
                  </div>
                </div>
                
                {/* Status indicator */}
                <div className="mt-2 text-xs">
                  {column.isStopped ? (
                    column.isCorrect ? (
                      <span className="text-green-400">✓ LOCKED</span>
                    ) : (
                      <span className="text-red-400">✗ WRONG</span>
                    )
                  ) : index === currentColumn ? (
                    <span className="text-yellow-400">ACTIVE</span>
                  ) : (
                    <span className="opacity-50">WAITING</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stop Button */}
        <div className="text-center">
          <button
            onClick={handleStop}
            disabled={gameStatus !== 'playing' || currentColumn >= columns.length}
            className="hack-button text-2xl px-12 py-4"
          >
            STOP (SPACEBAR)
          </button>
          <div className="mt-2 text-sm opacity-75">
            Stop the active column when the red letter is visible
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-4xl mx-auto">
        <div className="terminal-border p-4">
          <h3 className="text-lg font-bold mb-4">INSTRUCTIONS:</h3>
          <ul className="text-sm space-y-2 opacity-75">
            <li>• Watch the letters spinning in each column</li>
            <li>• The target letter for each column appears in RED</li>
            <li>• Press STOP (or SPACEBAR) when the red letter is visible</li>
            <li>• You must stop columns in order from left to right</li>
            <li>• All 8 letters must be correct to unlock the password</li>
            <li>• Wrong letters will cause the hack to fail</li>
          </ul>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold mb-2">STATUS:</h4>
              <div className="space-y-1 text-sm">
                <div>Active Column: {currentColumn + 1}/{COLUMN_COUNT}</div>
                <div>Stopped: {columns.filter(c => c.isStopped).length}</div>
                <div>Correct: {columns.filter(c => c.isCorrect).length}</div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-2">LEGEND:</h4>
              <div className="space-y-1 text-sm">
                <div className="terminal-red">Red Letter = Target</div>
                <div className="text-yellow-400">Yellow Border = Active</div>
                <div className="text-green-400">Green = Correct</div>
                <div className="text-red-400">Red = Wrong</div>
              </div>
            </div>
          </div>

          {gameStatus !== 'playing' && (
            <div className="mt-4">
              <button onClick={resetGame} className="hack-button w-full">
                NEW PASSWORD
              </button>
              {gameStatus === 'lost' && (
                <div className="mt-2 text-center text-sm text-red-400">
                  Correct password was: <span className="font-bold">{password}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {gameStatus === 'won' && (
        <div className="status-message status-success">
          ACCESS GRANTED<br />
          <span className="text-sm">Password: {password}</span>
        </div>
      )}
      
      {gameStatus === 'lost' && (
        <div className="status-message status-failure">
          ACCESS DENIED<br />
          <span className="text-sm">Password cracking failed!</span>
        </div>
      )}
    </div>
  );
} 
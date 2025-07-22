"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FingerprintSlice {
  correctIndex: number;
  currentIndex: number;
  options: string[];
}

interface FingerprintPuzzle {
  id: number;
  name: string;
  targetPattern: string[];
  slices: FingerprintSlice[];
}

const SLICE_COUNT = 4;
const TIMER_DURATION = 60; // 60 seconds

// Fingerprint slice patterns (simplified representation)
const SLICE_PATTERNS = [
  ['═══', '≋≋≋', '◦◦◦', '───', '∙∙∙', '⋯⋯⋯', '▓▓▓', '░░░'],
  ['│││', '∥∥∥', '┊┊┊', '┋┋┋', '╏╏╏', '｜｜｜', '▓▓▓', '░░░'],
  ['╱╱╱', '╲╲╲', '∕∕∕', '∖∖∖', '⁄⁄⁄', '╱╲╱', '▓▓▓', '░░░'],
  ['◐◐◐', '◑◑◑', '◒◒◒', '◓◓◓', '○○○', '●●●', '▓▓▓', '░░░']
];

export default function FingerprintCloner() {
  const [currentPuzzle, setCurrentPuzzle] = useState<FingerprintPuzzle | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [focusedSlice, setFocusedSlice] = useState(0);
  const [feedback, setFeedback] = useState('');

  // Generate a new fingerprint puzzle
  const generatePuzzle = () => {
    const slices: FingerprintSlice[] = Array.from({ length: SLICE_COUNT }, (_, index) => {
      const correctIndex = Math.floor(Math.random() * SLICE_PATTERNS[index].length);
      const startIndex = Math.floor(Math.random() * SLICE_PATTERNS[index].length);
      
      return {
        correctIndex,
        currentIndex: startIndex,
        options: [...SLICE_PATTERNS[index]]
      };
    });

    const targetPattern = slices.map(slice => slice.options[slice.correctIndex]);

    const puzzle: FingerprintPuzzle = {
      id: Math.floor(Math.random() * 1000),
      name: `Security Terminal ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      targetPattern,
      slices
    };

    setCurrentPuzzle(puzzle);
    setFocusedSlice(0);
    setFeedback('');
    setTimeLeft(TIMER_DURATION);
    setGameStatus('playing');
  };

  // Initialize first puzzle
  useEffect(() => {
    generatePuzzle();
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameStatus !== 'playing') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameStatus('lost');
          setFeedback('Scanner timeout! Access denied.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus]);

  // Check for win condition whenever slices change
  useEffect(() => {
    if (!currentPuzzle) return;
    
    const isComplete = currentPuzzle.slices.every(slice => 
      slice.currentIndex === slice.correctIndex
    );
    
    if (isComplete && gameStatus === 'playing') {
      setGameStatus('won');
      setFeedback('Clone match! Fingerprint authenticated.');
    }
  }, [currentPuzzle, gameStatus]);

  // Cycle slice to next option
  const cycleSliceNext = (sliceIndex: number) => {
    if (!currentPuzzle || gameStatus !== 'playing') return;
    
    setCurrentPuzzle(prev => {
      if (!prev) return prev;
      
      const newPuzzle = { ...prev };
      newPuzzle.slices = [...prev.slices];
      newPuzzle.slices[sliceIndex] = { ...prev.slices[sliceIndex] };
      
      const slice = newPuzzle.slices[sliceIndex];
      slice.currentIndex = (slice.currentIndex + 1) % slice.options.length;
      
      return newPuzzle;
    });
  };

  // Cycle slice to previous option
  const cycleSlicePrev = (sliceIndex: number) => {
    if (!currentPuzzle || gameStatus !== 'playing') return;
    
    setCurrentPuzzle(prev => {
      if (!prev) return prev;
      
      const newPuzzle = { ...prev };
      newPuzzle.slices = [...prev.slices];
      newPuzzle.slices[sliceIndex] = { ...prev.slices[sliceIndex] };
      
      const slice = newPuzzle.slices[sliceIndex];
      slice.currentIndex = (slice.currentIndex - 1 + slice.options.length) % slice.options.length;
      
      return newPuzzle;
    });
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameStatus !== 'playing' || !currentPuzzle) return;
      
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          setFocusedSlice(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
          event.preventDefault();
          setFocusedSlice(prev => Math.min(SLICE_COUNT - 1, prev + 1));
          break;
        case 'ArrowLeft':
          event.preventDefault();
          cycleSlicePrev(focusedSlice);
          break;
        case 'ArrowRight':
          event.preventDefault();
          cycleSliceNext(focusedSlice);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStatus, focusedSlice, currentPuzzle]);

  // Check if slice is correct
  const isSliceCorrect = (sliceIndex: number) => {
    if (!currentPuzzle) return false;
    const slice = currentPuzzle.slices[sliceIndex];
    return slice.currentIndex === slice.correctIndex;
  };

  // Get current pattern for assembled fingerprint
  const getAssembledPattern = () => {
    if (!currentPuzzle) return [];
    return currentPuzzle.slices.map(slice => slice.options[slice.currentIndex]);
  };

  const resetGame = () => {
    generatePuzzle();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentPuzzle) return null;

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold terminal-blue">FINGERPRINT CLONER</h1>
          <p className="text-sm opacity-75">Biometric Reconstruction Device v5.3</p>
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

      {/* Target Info */}
      <div className="text-center mb-6">
        <div className="terminal-border p-4 inline-block">
          <h2 className="text-lg mb-2">CLONING TARGET:</h2>
          <div className="text-xl font-bold terminal-yellow">{currentPuzzle.name}</div>
          <div className="text-sm opacity-75 mt-1">
            Match fingerprint pattern to bypass scanner
          </div>
        </div>
      </div>

      {/* Main Scanner Interface */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Target Fingerprint */}
          <div className="terminal-border p-6">
            <h3 className="text-xl font-bold mb-4 text-center">TARGET PATTERN</h3>
            <div className="bg-gray-900 border border-blue-400 p-6">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🔍</div>
                <div className="text-sm opacity-75">SCAN REFERENCE</div>
              </div>
              
              {/* Target Pattern Display */}
              <div className="space-y-2 font-mono text-lg text-center">
                {currentPuzzle.targetPattern.map((pattern, index) => (
                  <div key={index} className="text-blue-400 tracking-widest">
                    {pattern}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Clone Assembly */}
          <div className="terminal-border p-6">
            <h3 className="text-xl font-bold mb-4 text-center">CLONE ASSEMBLY</h3>
            
            {/* Assembled Pattern */}
            <div className="bg-gray-900 border border-green-400 p-4 mb-6">
              <div className="text-center mb-2">
                <div className="text-sm opacity-75">ASSEMBLED CLONE</div>
              </div>
              <div className="space-y-2 font-mono text-lg text-center">
                {getAssembledPattern().map((pattern, index) => (
                  <div 
                    key={index} 
                    className={`tracking-widest ${
                      isSliceCorrect(index) ? 'text-green-400' : 'text-white'
                    } ${index === focusedSlice ? 'bg-yellow-400 bg-opacity-20' : ''}`}
                  >
                    {pattern}
                  </div>
                ))}
              </div>
            </div>

            {/* Slice Controls */}
            <div className="space-y-4">
              {currentPuzzle.slices.map((slice, index) => (
                <div 
                  key={index} 
                  className={`border-2 p-3 rounded ${
                    index === focusedSlice ? 'border-yellow-400' : 'border-gray-600'
                  } ${isSliceCorrect(index) ? 'border-green-400 bg-green-400 bg-opacity-10' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm opacity-75">
                      Slice {index + 1}:
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => cycleSlicePrev(index)}
                        disabled={gameStatus !== 'playing'}
                        className="hack-button px-2 py-1"
                        title="Previous pattern"
                      >
                        ←
                      </button>
                      
                      <div className={`font-mono text-lg px-4 py-1 border rounded min-w-20 text-center ${
                        isSliceCorrect(index) ? 'border-green-400 text-green-400' : 'border-gray-400'
                      }`}>
                        {slice.options[slice.currentIndex]}
                      </div>
                      
                      <button
                        onClick={() => cycleSliceNext(index)}
                        disabled={gameStatus !== 'playing'}
                        className="hack-button px-2 py-1"
                        title="Next pattern"
                      >
                        →
                      </button>
                    </div>
                    
                    {isSliceCorrect(index) && (
                      <div className="text-green-400 text-sm">✓</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="text-center mt-6">
            <div className={`text-lg font-bold p-4 border rounded ${
              feedback.includes('match') ? 'border-green-400 text-green-400' : 
              feedback.includes('denied') ? 'border-red-400 text-red-400' :
              'border-yellow-400 text-yellow-400'
            }`}>
              {feedback}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8">
          <div className="terminal-border p-4">
            <h3 className="text-lg font-bold mb-4">INSTRUCTIONS:</h3>
            <ul className="text-sm space-y-2 opacity-75">
              <li>• Match each slice of the clone to the target pattern</li>
              <li>• Use ← → buttons or arrow keys to cycle through patterns</li>
              <li>• Use ↑ ↓ arrows to navigate between slices</li>
              <li>• All slices must match exactly to complete the clone</li>
              <li>• Green highlighting indicates correct matches</li>
              <li>• Complete the clone before the scanner times out</li>
            </ul>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold mb-2">CLONING STATUS:</h4>
                <div className="space-y-1 text-sm">
                  <div>Focused Slice: {focusedSlice + 1}/{SLICE_COUNT}</div>
                  <div>Correct Slices: {currentPuzzle.slices.filter((_, i) => isSliceCorrect(i)).length}/{SLICE_COUNT}</div>
                  <div className={getAssembledPattern().join('') === currentPuzzle.targetPattern.join('') ? 'text-green-400' : 'text-yellow-400'}>
                    Status: {getAssembledPattern().join('') === currentPuzzle.targetPattern.join('') ? 'MATCHED' : 'INCOMPLETE'}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-2">CONTROLS:</h4>
                <div className="space-y-1 text-sm">
                  <div>↑↓ = Select slice</div>
                  <div>←→ = Change pattern</div>
                  <div>Click buttons to control</div>
                  <div className="text-yellow-400">Yellow = Focused</div>
                </div>
              </div>
            </div>

            {gameStatus !== 'playing' && (
              <div className="mt-4">
                <button onClick={resetGame} className="hack-button w-full">
                  NEW TARGET
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {gameStatus === 'won' && (
        <div className="status-message status-success">
          CLONE MATCH<br />
          <span className="text-sm">Fingerprint successfully replicated!</span>
        </div>
      )}
      
      {gameStatus === 'lost' && (
        <div className="status-message status-failure">
          SCANNER TIMEOUT<br />
          <span className="text-sm">Cloning process failed!</span>
        </div>
      )}
    </div>
  );
} 
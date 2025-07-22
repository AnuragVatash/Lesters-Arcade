"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface FingerprintPuzzle {
  id: number;
  name: string;
  correctFragments: number[];
  targetPattern: string;
}

// Sample fingerprint puzzles (in a real implementation, these would be actual fingerprint images)
const FINGERPRINT_PUZZLES: FingerprintPuzzle[] = [
  {
    id: 1,
    name: "Security Door Alpha",
    correctFragments: [1, 3, 5, 7],
    targetPattern: "whorl_pattern_1"
  },
  {
    id: 2,
    name: "Vault Access Beta",
    correctFragments: [2, 4, 6, 8],
    targetPattern: "loop_pattern_1"
  },
  {
    id: 3,
    name: "Executive Elevator",
    correctFragments: [1, 2, 7, 8],
    targetPattern: "arch_pattern_1"
  },
  {
    id: 4,
    name: "Safe Room Gamma",
    correctFragments: [3, 4, 5, 6],
    targetPattern: "composite_pattern_1"
  }
];

const TIMER_DURATION = 60; // 60 seconds
const MAX_ATTEMPTS = 3;

export default function FingerprintMatch() {
  const [currentPuzzle, setCurrentPuzzle] = useState<FingerprintPuzzle>(FINGERPRINT_PUZZLES[0]);
  const [selectedFragments, setSelectedFragments] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts] = useState(MAX_ATTEMPTS);
  const [feedback, setFeedback] = useState('');
  const [showSolution, setShowSolution] = useState(false);

  // Initialize new puzzle
  const initializeNewPuzzle = () => {
    const puzzle = FINGERPRINT_PUZZLES[Math.floor(Math.random() * FINGERPRINT_PUZZLES.length)];
    setCurrentPuzzle(puzzle);
    setSelectedFragments(new Set());
    setTimeLeft(TIMER_DURATION);
    setAttempts(0);
    setFeedback('');
    setShowSolution(false);
    setGameStatus('playing');
  };

  // Initialize first puzzle
  useEffect(() => {
    initializeNewPuzzle();
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameStatus !== 'playing') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameStatus('lost');
          setFeedback('Time expired! Scanner locked.');
          setShowSolution(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus]);

  // Handle fragment selection
  const toggleFragment = (fragmentIndex: number) => {
    if (gameStatus !== 'playing') return;
    
    setSelectedFragments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fragmentIndex)) {
        newSet.delete(fragmentIndex);
      } else {
        newSet.add(fragmentIndex);
      }
      return newSet;
    });
  };

  // Check if all correct fragments are selected and no incorrect ones
  const isSelectionCorrect = () => {
    const correctSet = new Set(currentPuzzle.correctFragments);
    const selectedArray = Array.from(selectedFragments);
    
    return selectedArray.length === correctSet.size &&
           selectedArray.every(fragment => correctSet.has(fragment));
  };

  // Handle scan submission
  const handleScan = () => {
    if (gameStatus !== 'playing' || selectedFragments.size === 0) return;
    
    setAttempts(prev => prev + 1);
    
    if (isSelectionCorrect()) {
      setGameStatus('won');
      setFeedback('Fingerprint matched! Access granted.');
    } else {
      const correctCount = Array.from(selectedFragments)
        .filter(fragment => currentPuzzle.correctFragments.includes(fragment)).length;
      
      if (attempts + 1 >= maxAttempts) {
        setGameStatus('lost');
        setFeedback(`Maximum attempts exceeded. Scanner locked.`);
        setShowSolution(true);
      } else {
        setFeedback(`Partial match: ${correctCount}/${currentPuzzle.correctFragments.length} fragments correct. ${maxAttempts - attempts - 1} attempts remaining.`);
      }
    }
  };

  // Generate fingerprint pattern display (simplified visual representation)
  const generateFingerprintPattern = (patternType: string) => {
    const patterns = {
      "whorl_pattern_1": "🌀🌀🌀\n🌀⭕🌀\n🌀🌀🌀",
      "loop_pattern_1": "〰️〰️〰️\n↪️↪️↪️\n〰️〰️〰️",
      "arch_pattern_1": "∩∩∩\n│││\n───",
      "composite_pattern_1": "🌀〰️∩\n⭕↪️│\n🌀〰️─"
    };
    return patterns[patternType as keyof typeof patterns] || "🔍🔍🔍\n🔍🔍🔍\n🔍🔍🔍";
  };

  // Generate fragment appearance
  const generateFragment = (index: number, isCorrect: boolean) => {
    if (showSolution && isCorrect) {
      return "✓";
    }
    // Simple visual differentiation for fragments
    const symbols = ["◐", "◑", "◒", "◓", "◰", "◱", "◲", "◳"];
    return symbols[index % symbols.length];
  };

  const resetGame = () => {
    initializeNewPuzzle();
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
          <h1 className="text-3xl font-bold terminal-blue">FINGERPRINT ID SCAN</h1>
          <p className="text-sm opacity-75">Biometric Access Control v4.1</p>
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

      {/* Puzzle Info */}
      <div className="text-center mb-6">
        <div className="terminal-border p-4 inline-block">
          <h2 className="text-lg mb-2">TARGET SCAN:</h2>
          <div className="text-xl font-bold terminal-yellow">{currentPuzzle.name}</div>
          <div className="text-sm opacity-75 mt-1">
            Attempts: {attempts}/{maxAttempts}
          </div>
        </div>
      </div>

      {/* Main Scanner Interface */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Target Fingerprint */}
          <div className="terminal-border p-6">
            <h3 className="text-xl font-bold mb-4 text-center">TARGET PATTERN</h3>
            <div className="bg-gray-900 border border-blue-400 p-6 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <div className="text-sm font-mono whitespace-pre-line leading-8">
                {generateFingerprintPattern(currentPuzzle.targetPattern)}
              </div>
              <div className="mt-4 text-xs opacity-75">
                Pattern ID: {currentPuzzle.targetPattern.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Fragment Selection */}
          <div className="terminal-border p-6">
            <h3 className="text-xl font-bold mb-4 text-center">FRAGMENT ANALYSIS</h3>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {Array.from({ length: 8 }, (_, index) => {
                const fragmentNumber = index + 1;
                const isSelected = selectedFragments.has(fragmentNumber);
                const isCorrect = currentPuzzle.correctFragments.includes(fragmentNumber);
                
                return (
                  <button
                    key={fragmentNumber}
                    onClick={() => toggleFragment(fragmentNumber)}
                    disabled={gameStatus !== 'playing'}
                    className={`
                      aspect-square p-4 border-2 text-2xl font-bold transition-all
                      ${isSelected ? 'border-green-400 bg-green-400 bg-opacity-20' : 'border-gray-500'}
                      ${gameStatus === 'playing' ? 'hover:border-yellow-400 cursor-pointer' : ''}
                      ${showSolution && isCorrect ? 'border-blue-400 bg-blue-400 bg-opacity-20' : ''}
                    `}
                  >
                    <div className="text-xs mb-1">#{fragmentNumber}</div>
                    <div>{generateFragment(index, isCorrect)}</div>
                  </button>
                );
              })}
            </div>

            {/* Scan Button */}
            <div className="text-center mb-4">
              <button
                onClick={handleScan}
                disabled={gameStatus !== 'playing' || selectedFragments.size === 0}
                className="hack-button text-xl px-8 py-3"
              >
                INITIATE SCAN
              </button>
            </div>

            {/* Selected Fragments Display */}
            <div className="text-center">
              <div className="text-sm mb-2">Selected Fragments:</div>
              <div className="text-lg">
                {selectedFragments.size > 0 
                  ? Array.from(selectedFragments).sort().join(', ')
                  : 'None selected'
                }
              </div>
              <div className="text-xs opacity-75 mt-1">
                Target requires {currentPuzzle.correctFragments.length} fragments
              </div>
            </div>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="text-center mt-6">
            <div className={`text-lg font-bold p-4 border rounded ${
              feedback.includes('granted') ? 'border-green-400 text-green-400' : 
              feedback.includes('locked') ? 'border-red-400 text-red-400' :
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
              <li>• Select the fingerprint fragments that match the target pattern</li>
              <li>• Each fragment shows a portion of the complete fingerprint</li>
              <li>• You need to identify exactly {currentPuzzle.correctFragments.length} correct fragments</li>
              <li>• Click fragments to select/deselect them</li>
              <li>• Press INITIATE SCAN to check your selection</li>
              <li>• You have {maxAttempts} attempts before the scanner locks</li>
            </ul>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold mb-2">SCANNER STATUS:</h4>
                <div className="space-y-1 text-sm">
                  <div>Fragments Selected: {selectedFragments.size}</div>
                  <div>Target Count: {currentPuzzle.correctFragments.length}</div>
                  <div>Attempts Used: {attempts}/{maxAttempts}</div>
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-2">LEGEND:</h4>
                <div className="space-y-1 text-sm">
                  <div className="text-green-400">Green = Selected</div>
                  <div className="text-gray-400">Gray = Available</div>
                  {showSolution && <div className="text-blue-400">Blue = Correct</div>}
                </div>
              </div>
            </div>

            {gameStatus !== 'playing' && (
              <div className="mt-4">
                <button onClick={resetGame} className="hack-button w-full">
                  NEW SCAN TARGET
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
          <span className="text-sm">Fingerprint authenticated!</span>
        </div>
      )}
      
      {gameStatus === 'lost' && (
        <div className="status-message status-failure">
          ACCESS DENIED<br />
          <span className="text-sm">Scanner lockout engaged!</span>
        </div>
      )}
    </div>
  );
} 
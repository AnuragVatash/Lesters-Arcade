"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CircuitPiece {
  type: 'straight' | 'curve_up' | 'curve_down' | 'empty';
  connected: boolean;
}

const GRID_COLS = 5;
const GRID_ROWS = 4;
const TIMER_DURATION = 45; // 45 seconds

export default function CircuitSlide() {
  const [columnOffsets, setColumnOffsets] = useState<number[]>([]);
  const [circuit, setCircuit] = useState<CircuitPiece[][]>([]);
  const [solutionOffsets, setSolutionOffsets] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [moves, setMoves] = useState(0);

  // Generate a new circuit puzzle
  const generateCircuit = () => {
    // Create the solution first - a continuous path from left to right
    const newCircuit: CircuitPiece[][] = Array(GRID_ROWS).fill(null).map(() => 
      Array(GRID_COLS).fill(null).map(() => ({ type: 'empty' as const, connected: false }))
    );

    // Create a simple horizontal path with some curves
    const pathRow = Math.floor(GRID_ROWS / 2); // Middle row
    
    // Fill in the path
    for (let col = 0; col < GRID_COLS; col++) {
      if (col === 0 || col === GRID_COLS - 1) {
        newCircuit[pathRow][col] = { type: 'straight', connected: false };
      } else {
        // Add some variety with curves
        const pieceType = Math.random() < 0.3 ? 
          (Math.random() < 0.5 ? 'curve_up' : 'curve_down') : 'straight';
        newCircuit[pathRow][col] = { type: pieceType, connected: false };
      }
    }

    // Add some random pieces in other positions
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (newCircuit[row][col].type === 'empty' && Math.random() < 0.4) {
          const types: CircuitPiece['type'][] = ['straight', 'curve_up', 'curve_down'];
          newCircuit[row][col] = { 
            type: types[Math.floor(Math.random() * types.length)], 
            connected: false 
          };
        }
      }
    }

    setCircuit(newCircuit);

    // Set solution (all offsets 0 for this simple version)
    const solution = Array(GRID_COLS).fill(0);
    setSolutionOffsets(solution);

    // Scramble by giving random offsets
    const scrambled = Array(GRID_COLS).fill(0).map(() => 
      Math.floor(Math.random() * GRID_ROWS)
    );
    setColumnOffsets(scrambled);
    setMoves(0);
  };

  // Initialize puzzle
  useEffect(() => {
    generateCircuit();
  }, []);

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

  // Check win condition when offsets change
  useEffect(() => {
    if (JSON.stringify(columnOffsets) === JSON.stringify(solutionOffsets)) {
      setGameStatus('won');
    }
  }, [columnOffsets, solutionOffsets]);

  // Move column up
  const moveColumnUp = (colIndex: number) => {
    if (gameStatus !== 'playing') return;
    
    setColumnOffsets(prev => {
      const newOffsets = [...prev];
      newOffsets[colIndex] = (newOffsets[colIndex] - 1 + GRID_ROWS) % GRID_ROWS;
      return newOffsets;
    });
    setMoves(prev => prev + 1);
  };

  // Move column down
  const moveColumnDown = (colIndex: number) => {
    if (gameStatus !== 'playing') return;
    
    setColumnOffsets(prev => {
      const newOffsets = [...prev];
      newOffsets[colIndex] = (newOffsets[colIndex] + 1) % GRID_ROWS;
      return newOffsets;
    });
    setMoves(prev => prev + 1);
  };

  // Get the piece at a specific visual position
  const getPieceAt = (visualRow: number, col: number): CircuitPiece => {
    const actualRow = (visualRow + columnOffsets[col]) % GRID_ROWS;
    return circuit[actualRow]?.[col] || { type: 'empty', connected: false };
  };

  // Get symbol for circuit piece
  const getPieceSymbol = (piece: CircuitPiece) => {
    switch (piece.type) {
      case 'straight': return '━';
      case 'curve_up': return '┗';
      case 'curve_down': return '┏';
      case 'empty': return ' ';
      default: return ' ';
    }
  };

  // Check if circuit is connected (simplified - just check if middle row has continuous pieces)
  const isCircuitConnected = () => {
    const middleRow = Math.floor(GRID_ROWS / 2);
    for (let col = 0; col < GRID_COLS; col++) {
      const piece = getPieceAt(middleRow, col);
      if (piece.type === 'empty') return false;
    }
    return true;
  };

  const resetGame = () => {
    setTimeLeft(TIMER_DURATION);
    setGameStatus('playing');
    generateCircuit();
  };

  const formatTime = (seconds: number) => {
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold terminal-yellow">CIRCUIT PANEL</h1>
          <p className="text-sm opacity-75">Electrical Pathway Aligner v2.8</p>
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

      {/* Status */}
      <div className="text-center mb-6">
        <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="terminal-border p-2">
            <div className="text-sm opacity-75">Moves</div>
            <div className="text-xl font-bold">{moves}</div>
          </div>
          <div className="terminal-border p-2">
            <div className="text-sm opacity-75">Circuit Status</div>
            <div className={`text-lg font-bold ${isCircuitConnected() ? 'text-green-400' : 'text-red-400'}`}>
              {isCircuitConnected() ? 'CONNECTED' : 'BROKEN'}
            </div>
          </div>
          <div className="terminal-border p-2">
            <div className="text-sm opacity-75">Alignment</div>
            <div className={`text-lg font-bold ${
              JSON.stringify(columnOffsets) === JSON.stringify(solutionOffsets) ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {columnOffsets.filter((offset, i) => offset === solutionOffsets[i]).length}/{GRID_COLS}
            </div>
          </div>
        </div>
      </div>

      {/* Circuit Board */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="text-center mb-4">
          <div className="terminal-border p-4 inline-block">
            <div className="text-lg font-bold mb-2">CIRCUIT BOARD</div>
            <div className="text-sm opacity-75">Align pathways to bypass security</div>
          </div>
        </div>

        {/* Up arrows */}
        <div className="flex justify-center mb-4">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 60px)` }}>
            {Array.from({ length: GRID_COLS }, (_, col) => (
              <button
                key={`up-${col}`}
                onClick={() => moveColumnUp(col)}
                disabled={gameStatus !== 'playing'}
                className="hack-button h-10 text-xl"
              >
                ↑
              </button>
            ))}
          </div>
        </div>

        {/* Circuit Grid */}
        <div className="flex justify-center mb-4">
          <div 
            className="hack-grid bg-gray-900 border-2 border-green-400"
            style={{ 
              gridTemplateColumns: `repeat(${GRID_COLS}, 60px)`,
              gridTemplateRows: `repeat(${GRID_ROWS}, 60px)`
            }}
          >
            {Array.from({ length: GRID_ROWS }, (_, row) => 
              Array.from({ length: GRID_COLS }, (_, col) => {
                const piece = getPieceAt(row, col);
                const isCorrect = columnOffsets[col] === solutionOffsets[col];
                
                return (
                  <div
                    key={`${row}-${col}`}
                    className={`hack-cell text-2xl ${
                      piece.type !== 'empty' ? 'text-yellow-400' : ''
                    } ${isCorrect ? 'border-green-400' : 'border-gray-600'}`}
                    style={{ 
                      width: '60px', 
                      height: '60px',
                      backgroundColor: piece.type !== 'empty' ? '#1a1a2e' : '#000000'
                    }}
                  >
                    {getPieceSymbol(piece)}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Down arrows */}
        <div className="flex justify-center">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 60px)` }}>
            {Array.from({ length: GRID_COLS }, (_, col) => (
              <button
                key={`down-${col}`}
                onClick={() => moveColumnDown(col)}
                disabled={gameStatus !== 'playing'}
                className="hack-button h-10 text-xl"
              >
                ↓
              </button>
            ))}
          </div>
        </div>

        {/* Column indicators */}
        <div className="flex justify-center mt-4">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 60px)` }}>
            {Array.from({ length: GRID_COLS }, (_, col) => (
              <div key={`col-${col}`} className="text-center">
                <div className="text-xs opacity-75">Col {col + 1}</div>
                <div className={`text-sm ${
                  columnOffsets[col] === solutionOffsets[col] ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  Offset: {columnOffsets[col]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-4xl mx-auto">
        <div className="terminal-border p-4">
          <h3 className="text-lg font-bold mb-4">INSTRUCTIONS:</h3>
          <ul className="text-sm space-y-2 opacity-75">
            <li>• Use ↑ and ↓ buttons to slide columns up and down</li>
            <li>• Align circuit pieces to form a continuous electrical path</li>
            <li>• Green borders indicate correctly aligned columns</li>
            <li>• Complete the circuit before time runs out</li>
            <li>• Fewer moves = better performance</li>
          </ul>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold mb-2">CIRCUIT SYMBOLS:</h4>
              <div className="space-y-1 text-sm">
                <div>━ = Straight wire</div>
                <div>┗ = Upward curve</div>
                <div>┏ = Downward curve</div>
                <div className="opacity-50">  = Empty space</div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-2">STATUS:</h4>
              <div className="space-y-1 text-sm">
                <div>Moves Made: {moves}</div>
                <div>Columns Aligned: {columnOffsets.filter((offset, i) => offset === solutionOffsets[i]).length}/{GRID_COLS}</div>
                <div className={isCircuitConnected() ? 'text-green-400' : 'text-red-400'}>
                  Circuit: {isCircuitConnected() ? 'COMPLETE' : 'INCOMPLETE'}
                </div>
              </div>
            </div>
          </div>

          {gameStatus !== 'playing' && (
            <div className="mt-4">
              <button onClick={resetGame} className="hack-button w-full">
                NEW CIRCUIT
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {gameStatus === 'won' && (
        <div className="status-message status-success">
          CIRCUIT COMPLETE<br />
          <span className="text-sm">Pathway aligned successfully!</span>
        </div>
      )}
      
      {gameStatus === 'lost' && (
        <div className="status-message status-failure">
          CIRCUIT ALIGNMENT FAILED<br />
          <span className="text-sm">Time expired!</span>
        </div>
      )}
    </div>
  );
} 
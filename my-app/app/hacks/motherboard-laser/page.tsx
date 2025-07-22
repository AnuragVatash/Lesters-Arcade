"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

type MirrorOrientation = 0 | 45 | 90 | 135; // degrees
type CellType = 'empty' | 'mirror' | 'laser' | 'target';
type Direction = 'up' | 'down' | 'left' | 'right';

interface Cell {
  type: CellType;
  orientation?: MirrorOrientation;
}

interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 8;
const TIMER_DURATION = 120; // 2 minutes

export default function MotherboardLaser() {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [laserPath, setLaserPath] = useState<Position[]>([]);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [laserStart, setLaserStart] = useState<Position>({ x: 0, y: 3 });
  const [targetPosition, setTargetPosition] = useState<Position>({ x: 7, y: 4 });

  // Initialize the grid
  useEffect(() => {
    const newGrid: Cell[][] = Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(null).map(() => ({ type: 'empty' }))
    );

    // Place laser source
    newGrid[laserStart.y][laserStart.x] = { type: 'laser' };
    
    // Place target
    newGrid[targetPosition.y][targetPosition.x] = { type: 'target' };

    // Place some mirrors randomly
    const mirrorPositions = [
      { x: 2, y: 2, orientation: 45 as MirrorOrientation },
      { x: 4, y: 1, orientation: 135 as MirrorOrientation },
      { x: 5, y: 4, orientation: 90 as MirrorOrientation },
      { x: 3, y: 6, orientation: 0 as MirrorOrientation },
      { x: 6, y: 2, orientation: 45 as MirrorOrientation },
    ];

    mirrorPositions.forEach(({ x, y, orientation }) => {
      if (newGrid[y] && newGrid[y][x]) {
        newGrid[y][x] = { type: 'mirror', orientation };
      }
    });

    setGrid(newGrid);
  }, [laserStart.x, laserStart.y, targetPosition.x, targetPosition.y]);

  // Calculate laser path
  const calculateLaserPath = useCallback(() => {
    const path: Position[] = [];
    let currentPos = { ...laserStart };
    let direction: Direction = 'right';
    let steps = 0;
    const maxSteps = GRID_SIZE * GRID_SIZE; // Prevent infinite loops

    path.push({ ...currentPos });

    while (steps < maxSteps) {
      // Move to next position
      switch (direction) {
        case 'up': currentPos.y -= 1; break;
        case 'down': currentPos.y += 1; break;
        case 'left': currentPos.x -= 1; break;
        case 'right': currentPos.x += 1; break;
      }

      // Check bounds
      if (currentPos.x < 0 || currentPos.x >= GRID_SIZE || 
          currentPos.y < 0 || currentPos.y >= GRID_SIZE) {
        break;
      }

      path.push({ ...currentPos });

      const cell = grid[currentPos.y]?.[currentPos.x];
      if (!cell) break;

      // Check if hit target
      if (cell.type === 'target') {
        setGameStatus('won');
        break;
      }

      // Check if hit mirror
      if (cell.type === 'mirror' && cell.orientation !== undefined) {
        direction = reflectDirection(direction, cell.orientation);
      }

      steps++;
    }

    setLaserPath(path);
  }, [grid, laserStart]);

  // Reflect laser direction based on mirror orientation
  const reflectDirection = (incoming: Direction, mirrorAngle: MirrorOrientation): Direction => {
    const directionMap = {
      'up': 0, 'right': 90, 'down': 180, 'left': 270
    };
    const reverseMap = { 0: 'up', 90: 'right', 180: 'down', 270: 'left' } as const;
    
    const incomingAngle = directionMap[incoming];
    
    // Mirror reflection logic based on angle
    let reflectedAngle: number;
    
    switch (mirrorAngle) {
      case 45:  // / mirror
        reflectedAngle = (180 - incomingAngle + 90) % 360;
        break;
      case 135: // \ mirror
        reflectedAngle = (180 - incomingAngle - 90 + 360) % 360;
        break;
      case 0:   // - mirror
        reflectedAngle = (360 - incomingAngle) % 360;
        break;
      case 90:  // | mirror
        reflectedAngle = (180 - incomingAngle + 180) % 360;
        break;
      default:
        reflectedAngle = incomingAngle;
    }
    
    return reverseMap[reflectedAngle as keyof typeof reverseMap] || incoming;
  };

  // Rotate mirror
  const rotateMirror = (x: number, y: number) => {
    if (gameStatus !== 'playing') return;
    
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => row.map(cell => ({ ...cell })));
      const cell = newGrid[y][x];
      
      if (cell.type === 'mirror') {
        const orientations: MirrorOrientation[] = [0, 45, 90, 135];
        const currentIndex = orientations.indexOf(cell.orientation || 0);
        cell.orientation = orientations[(currentIndex + 1) % orientations.length];
      }
      
      return newGrid;
    });
  };

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

  // Recalculate path when grid changes
  useEffect(() => {
    if (grid.length > 0) {
      calculateLaserPath();
    }
  }, [grid, calculateLaserPath]);

  const resetGame = () => {
    setTimeLeft(TIMER_DURATION);
    setGameStatus('playing');
    setLaserPath([]);
    // Re-initialize grid
    window.location.reload();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMirrorSymbol = (orientation: MirrorOrientation) => {
    switch (orientation) {
      case 0: return '—';
      case 45: return '/';
      case 90: return '|';
      case 135: return '\\';
      default: return '/';
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">MOTHERBOARD LASER</h1>
          <p className="text-sm opacity-75">Redirect the beam to the target</p>
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
        {/* Game Board */}
        <div className="flex-1">
          <div className="relative">
            {/* Grid */}
            <div 
              className="hack-grid"
              style={{ 
                gridTemplateColumns: `repeat(${GRID_SIZE}, 60px)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 60px)`
              }}
            >
              {grid.map((row, y) => 
                row.map((cell, x) => (
                  <div
                    key={`${x}-${y}`}
                    className={`hack-cell cursor-pointer ${
                      cell.type === 'target' ? 'target' : ''
                    } ${cell.type === 'laser' ? 'bg-blue-600' : ''}`}
                    onClick={() => rotateMirror(x, y)}
                    style={{ 
                      width: '60px', 
                      height: '60px',
                      fontSize: '24px'
                    }}
                  >
                    {cell.type === 'mirror' && getMirrorSymbol(cell.orientation || 0)}
                    {cell.type === 'laser' && '◆'}
                    {cell.type === 'target' && '⬟'}
                  </div>
                ))
              )}
            </div>

            {/* Laser Path SVG Overlay */}
            <svg
              className="absolute top-0 left-0 pointer-events-none"
              width={GRID_SIZE * 60}
              height={GRID_SIZE * 60}
              style={{ zIndex: 10 }}
            >
              {laserPath.length > 1 && (
                <polyline
                  points={laserPath.map(pos => 
                    `${pos.x * 60 + 30},${pos.y * 60 + 30}`
                  ).join(' ')}
                  stroke="#ff0000"
                  strokeWidth="3"
                  fill="none"
                  opacity="0.8"
                />
              )}
              {laserPath.map((pos, index) => (
                <circle
                  key={index}
                  cx={pos.x * 60 + 30}
                  cy={pos.y * 60 + 30}
                  r="2"
                  fill="#ff0000"
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Instructions */}
        <div className="w-full lg:w-80">
          <div className="terminal-border p-4">
            <h3 className="text-lg font-bold mb-4">INSTRUCTIONS:</h3>
            <ul className="text-sm space-y-2 opacity-75">
              <li>• Click mirrors to rotate them</li>
              <li>• Guide the red laser beam to the target</li>
              <li>• Mirrors: — | / \ (horizontal, vertical, diagonal)</li>
              <li>• Complete before time runs out</li>
            </ul>
            
            <div className="mt-4">
              <h4 className="font-bold mb-2">LEGEND:</h4>
              <div className="space-y-1 text-sm">
                <div>◆ = Laser Source</div>
                <div>⬟ = Target</div>
                <div className="terminal-red">— = Red Beam Path</div>
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
          <span className="text-sm">Laser redirected successfully!</span>
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
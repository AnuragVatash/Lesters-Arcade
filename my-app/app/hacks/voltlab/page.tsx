"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Connection {
  numberIndex: number;
  multiplierIndex: number;
}

interface DragState {
  isDragging: boolean;
  startIndex: number;
  startType: 'number' | 'multiplier';
}

const MULTIPLIERS = [1, 2, 10];
const TIMER_DURATION = 90; // 90 seconds

export default function VoltLab() {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [targetVoltage, setTargetVoltage] = useState(0);
  const [currentResult, setCurrentResult] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [dragState, setDragState] = useState<DragState>({ isDragging: false, startIndex: -1, startType: 'number' });
  const svgRef = useRef<SVGSVGElement>(null);
  const [connectionLines, setConnectionLines] = useState<Array<{ x1: number; y1: number; x2: number; y2: number; color: string }>>([]);

  // Generate a new puzzle
  const generatePuzzle = () => {
    // Generate 3-4 random base numbers
    const numCount = 3 + Math.floor(Math.random() * 2);
    const baseNumbers = Array.from({ length: numCount }, () => 1 + Math.floor(Math.random() * 9));
    
    // Calculate target by assigning random multipliers
    const solution = baseNumbers.map((num, index) => ({
      number: num,
      multiplier: MULTIPLIERS[index % MULTIPLIERS.length]
    }));
    
    const target = solution.reduce((sum, item) => sum + (item.number * item.multiplier), 0);
    
    setNumbers(baseNumbers);
    setTargetVoltage(target);
    setConnections([]);
    setCurrentResult(0);
    setConnectionLines([]);
  };

  // Initialize puzzle
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
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus]);

  // Calculate current result when connections change
  useEffect(() => {
    const result = connections.reduce((sum, conn) => {
      const number = numbers[conn.numberIndex];
      const multiplier = MULTIPLIERS[conn.multiplierIndex];
      return sum + (number * multiplier);
    }, 0);
    
    setCurrentResult(result);
    
    // Check win condition
    if (connections.length === numbers.length && result === targetVoltage) {
      setGameStatus('won');
    }
  }, [connections, numbers, targetVoltage]);

  // Update connection lines for visual display
  useEffect(() => {
    const lines = connections.map(conn => {
      const numberY = 100 + (conn.numberIndex * 80);
      const multiplierY = 100 + (conn.multiplierIndex * 80);
      
      return {
        x1: 150, // End of number box
        y1: numberY + 20, // Center of number box
        x2: 350, // Start of multiplier box
        y2: multiplierY + 20, // Center of multiplier box
        color: getConnectionColor(conn.multiplierIndex)
      };
    });
    
    setConnectionLines(lines);
  }, [connections]);

  const getConnectionColor = (multiplierIndex: number) => {
    const colors = ['#00ff00', '#ffff00', '#ff6600']; // Green, Yellow, Orange
    return colors[multiplierIndex] || '#00ff00';
  };

  const getMultiplierSymbol = (multiplier: number) => {
    switch (multiplier) {
      case 1: return '×1';
      case 2: return '×2';
      case 10: return '×10';
      default: return `×${multiplier}`;
    }
  };

  const getMultiplierIcon = (multiplier: number) => {
    switch (multiplier) {
      case 1: return '⚡';
      case 2: return '⚡⚡';
      case 10: return '🔋';
      default: return '⚡';
    }
  };

  // Handle connection creation via dropdown
  const handleConnectionChange = (numberIndex: number, multiplierIndex: number | null) => {
    setConnections(prev => {
      // Remove existing connection for this number
      const filtered = prev.filter(conn => conn.numberIndex !== numberIndex);
      
      // Add new connection if multiplier selected
      if (multiplierIndex !== null) {
        // Check if multiplier is already used
        const multiplierUsed = filtered.some(conn => conn.multiplierIndex === multiplierIndex);
        if (!multiplierUsed) {
          filtered.push({ numberIndex, multiplierIndex });
        }
      }
      
      return filtered;
    });
  };

  // Get connection for a number
  const getConnectionForNumber = (numberIndex: number): Connection | null => {
    return connections.find(conn => conn.numberIndex === numberIndex) || null;
  };

  // Get available multipliers for a number
  const getAvailableMultipliers = (numberIndex: number): number[] => {
    const currentConnection = getConnectionForNumber(numberIndex);
    const usedMultipliers = connections
      .filter(conn => conn.numberIndex !== numberIndex)
      .map(conn => conn.multiplierIndex);
    
    return MULTIPLIERS.map((_, index) => index)
      .filter(index => !usedMultipliers.includes(index) || 
        (currentConnection && currentConnection.multiplierIndex === index));
  };

  const resetGame = () => {
    setTimeLeft(TIMER_DURATION);
    setGameStatus('playing');
    generatePuzzle();
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
          <h1 className="text-3xl font-bold terminal-yellow">VOLTlab</h1>
          <p className="text-sm opacity-75">Electrical Circuit Analyzer v3.2</p>
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

      {/* Target Display */}
      <div className="text-center mb-6">
        <div className="terminal-border p-4 inline-block">
          <h2 className="text-lg mb-2">TARGET VOLTAGE:</h2>
          <div className="text-3xl font-bold terminal-yellow">{targetVoltage}V</div>
        </div>
      </div>

      {/* Current Result */}
      <div className="text-center mb-6">
        <div className="text-lg">
          CURRENT OUTPUT: <span className={`font-bold ${
            currentResult === targetVoltage && connections.length === numbers.length ? 'terminal-text' : 'text-white'
          }`}>{currentResult}V</span>
        </div>
      </div>

      {/* Circuit Board */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="relative bg-gray-900 border-2 border-green-400 p-6 min-h-96">
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={`v-${i}`} className="absolute h-full border-l border-green-400" style={{ left: `${i * 5}%` }} />
            ))}
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={`h-${i}`} className="absolute w-full border-t border-green-400" style={{ top: `${i * 6.67}%` }} />
            ))}
          </div>

          {/* Connection Lines SVG */}
          <svg 
            ref={svgRef}
            className="absolute inset-0 pointer-events-none"
            width="100%"
            height="100%"
          >
            {connectionLines.map((line, index) => (
              <line
                key={index}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                stroke={line.color}
                strokeWidth="3"
                opacity="0.8"
              />
            ))}
          </svg>

          {/* Left Side - Numbers */}
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-4">BASE VALUES:</h3>
            <div className="space-y-4">
              {numbers.map((number, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-20 h-12 bg-blue-900 border border-blue-400 flex items-center justify-center text-xl font-bold">
                    {number}
                  </div>
                  <div className="text-sm">→</div>
                  <select
                    value={getConnectionForNumber(index)?.multiplierIndex ?? ''}
                    onChange={(e) => handleConnectionChange(index, e.target.value === '' ? null : parseInt(e.target.value))}
                    className="bg-black border border-green-400 text-green-400 p-2 font-mono"
                    disabled={gameStatus !== 'playing'}
                  >
                    <option value="">SELECT MULTIPLIER</option>
                    {getAvailableMultipliers(index).map(multiplierIndex => (
                      <option key={multiplierIndex} value={multiplierIndex}>
                        {getMultiplierSymbol(MULTIPLIERS[multiplierIndex])} - {getMultiplierIcon(MULTIPLIERS[multiplierIndex])}
                      </option>
                    ))}
                  </select>
                  {getConnectionForNumber(index) && (
                    <div className="text-yellow-400">
                      = {number * MULTIPLIERS[getConnectionForNumber(index)!.multiplierIndex]}V
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Multipliers */}
          <div className="absolute top-6 right-6">
            <h3 className="text-lg font-bold mb-4">MULTIPLIER NODES:</h3>
            <div className="space-y-4">
              {MULTIPLIERS.map((multiplier, index) => {
                const isUsed = connections.some(conn => conn.multiplierIndex === index);
                return (
                  <div key={index} className={`flex items-center gap-2 p-2 border rounded ${
                    isUsed ? 'border-yellow-400 bg-yellow-900 bg-opacity-20' : 'border-gray-500'
                  }`}>
                    <div className="text-2xl">{getMultiplierIcon(multiplier)}</div>
                    <div className="font-bold">{getMultiplierSymbol(multiplier)}</div>
                    {isUsed && <div className="text-xs text-yellow-400">CONNECTED</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-4xl mx-auto">
        <div className="terminal-border p-4">
          <h3 className="text-lg font-bold mb-4">INSTRUCTIONS:</h3>
          <ul className="text-sm space-y-2 opacity-75">
            <li>• Connect each base value to a multiplier</li>
            <li>• Each multiplier can only be used once</li>
            <li>• Sum of all products must equal target voltage</li>
            <li>• Select multipliers from dropdown menus</li>
            <li>• All connections must be made to complete circuit</li>
          </ul>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold mb-2">MULTIPLIER NODES:</h4>
              <div className="space-y-1 text-sm">
                <div>⚡ = ×1 (Direct connection)</div>
                <div>⚡⚡ = ×2 (Double amplifier)</div>
                <div>🔋 = ×10 (Power cell)</div>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-2">STATUS:</h4>
              <div className="space-y-1 text-sm">
                <div>Connected: {connections.length}/{numbers.length}</div>
                <div>Output: {currentResult}V / {targetVoltage}V</div>
                <div className={currentResult === targetVoltage && connections.length === numbers.length ? 'text-green-400' : 'text-yellow-400'}>
                  {currentResult === targetVoltage && connections.length === numbers.length ? 'CIRCUIT COMPLETE' : 'INCOMPLETE CIRCUIT'}
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
          CIRCUIT ACTIVATED<br />
          <span className="text-sm">Voltage matched successfully!</span>
        </div>
      )}
      
      {gameStatus === 'lost' && (
        <div className="status-message status-failure">
          CIRCUIT OVERLOAD<br />
          <span className="text-sm">Time expired!</span>
        </div>
      )}
    </div>
  );
} 
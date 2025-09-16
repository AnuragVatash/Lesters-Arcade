'use client';

import { useState, useEffect } from 'react';

interface ScanningPopupProps {
  isVisible: boolean;
  onComplete: (isCorrect: boolean) => void;
  isCorrect: boolean;
}

export default function ScanningPopup({ isVisible, onComplete, isCorrect }: ScanningPopupProps) {
  const [dots, setDots] = useState(0);
  const [progress, setProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanText, setScanText] = useState('INITIALIZING SCAN PROTOCOL');
  const [terminalLines, setTerminalLines] = useState<string[]>([]);

  useEffect(() => {
    if (!isVisible) {
      setDots(0);
      setProgress(0);
      setScanComplete(false);
      setScanText('INITIALIZING SCAN PROTOCOL');
      setTerminalLines([]);
      return;
    }

    // Terminal lines for cyberpunk effect
    const terminalMessages = [
      '> CONNECTING TO SECURITY GRID...',
      '> BYPASSING FIREWALL...',
      '> ANALYZING FINGERPRINT DATA...',
      '> CROSS-REFERENCING DATABASE...',
      '> VERIFYING AUTHENTICATION...',
      '> SCAN COMPLETE'
    ];

    // Animated dots cycle
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev + 1) % 4); // 0, 1, 2, 3, then back to 0
    }, 500);

    // Terminal text updates
    const textInterval = setInterval(() => {
      setTerminalLines(prev => {
        const newLines = [...prev];
        if (newLines.length < terminalMessages.length) {
          newLines.push(terminalMessages[newLines.length]);
        }
        return newLines;
      });
    }, 400);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(textInterval);
          setScanComplete(true);
          setScanText('SCAN COMPLETE');
          setTimeout(() => onComplete(isCorrect), 1500); // Show result for 1.5 seconds
          return 100;
        }
        return prev + 2; // Increase by 2% every 50ms (takes 2.5 seconds total)
      });
    }, 50);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, [isVisible, isCorrect, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
      {/* Matrix-style background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-green-950/20 to-black opacity-50"></div>
      
      <div className="relative bg-black/95 border border-green-500/30 p-8 rounded-lg shadow-2xl shadow-green-500/20 max-w-lg w-full mx-4 backdrop-blur-sm">
        {/* Glitch overlay effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse" style={{ animationDelay: "1s" }}></div>
        
        <div className="text-center">
          {!scanComplete ? (
            <>
              {/* Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-green-400 mb-2 font-mono tracking-wider">
                  {scanText}
                  <span className="inline-block w-8 text-left text-green-300">
                    {'.'.repeat(dots)}
                  </span>
                </h3>
                <div className="text-green-500/50 font-mono text-xs">▄▄▄▄▄ SECURITY SCAN ▄▄▄▄▄</div>
              </div>

              {/* Terminal output */}
              <div className="mb-6 bg-black/50 border border-green-500/20 rounded p-4 h-32 overflow-hidden">
                <div className="text-left font-mono text-sm text-green-400 space-y-1">
                  {terminalLines.map((line, index) => (
                    <div key={index} className="animate-pulse" style={{ animationDelay: `${index * 0.1}s` }}>
                      {line}
                    </div>
                  ))}
                  {terminalLines.length < 6 && (
                    <div className="text-green-500/30 animate-pulse">
                      {'.'.repeat(dots * 2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-800 rounded-full h-3 border border-green-500/30">
                  <div 
                    className="bg-gradient-to-r from-green-600 to-green-400 h-3 rounded-full transition-all duration-100 ease-out relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                </div>
                <p className="text-green-400 font-mono text-sm mt-2">{Math.round(progress)}%</p>
              </div>
            </>
          ) : (
            /* Result display */
            <div className="mb-6">
              <div className="text-green-500/50 font-mono text-xs mb-4">▄▄▄▄▄ SCAN RESULT ▄▄▄▄▄</div>
              <h3 className={`text-4xl font-bold mb-4 font-mono tracking-wider ${
                isCorrect ? 'text-green-400' : 'text-red-400'
              }`}>
                {isCorrect ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
              </h3>
              <div className={`text-lg font-mono ${
                isCorrect ? 'text-green-300' : 'text-red-300'
              }`}>
                {isCorrect ? 'FINGERPRINT VERIFIED' : 'SECURITY BREACH DETECTED'}
              </div>
              {!isCorrect && (
                <p className="text-gray-300 text-sm mt-2 font-mono">INITIATING SYSTEM RESET...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



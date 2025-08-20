'use client';

import { useState, useEffect } from 'react';

interface UseOracleProps {
  gameStarted: boolean;
  onOracleActivated: () => void;
  isScanning?: boolean;
  activationSequence?: string;
}

export function useOracle({ gameStarted, onOracleActivated, isScanning = false, activationSequence = 'oracle' }: UseOracleProps) {
  const [oracleActive, setOracleActive] = useState(false);
  const [keySequence, setKeySequence] = useState('');

  // Reset oracle state
  const resetOracle = () => {
    setOracleActive(false);
    setKeySequence('');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only detect oracle during active gameplay (not during scanning)
      if (!gameStarted || isScanning) return;

      // Handle oracle cheat code detection
      if (e.key.length === 1) {
        // If activation sequence is a single character, trigger immediately
        if (activationSequence.length === 1) {
          if (e.key === activationSequence) {
            console.log('Single key oracle activated:', e.key);
            setOracleActive(true);
            onOracleActivated();
          }
        } else {
          // For multi-character sequences, use the old logic
          const maxLength = Math.max(6, activationSequence.length);
          const newSequence = (keySequence + e.key.toLowerCase()).slice(-maxLength);
          setKeySequence(newSequence);

          if (newSequence === activationSequence.toLowerCase()) {
            console.log('Multi-key oracle activated:', newSequence);
            setOracleActive(true);
            onOracleActivated();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, isScanning, keySequence, onOracleActivated, activationSequence]);

  return {
    oracleActive,
    resetOracle
  };
}




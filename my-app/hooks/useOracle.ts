'use client';

import { useState, useEffect } from 'react';

interface UseOracleProps {
  gameStarted: boolean;
  onOracleActivated: () => void;
  isScanning?: boolean;
}

export function useOracle({ gameStarted, onOracleActivated, isScanning = false }: UseOracleProps) {
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
        const newSequence = (keySequence + e.key.toLowerCase()).slice(-6); // Keep last 6 characters
        setKeySequence(newSequence);

        if (newSequence === 'oracle') {
          setOracleActive(true);
          onOracleActivated();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, isScanning, keySequence, onOracleActivated]);

  return {
    oracleActive,
    resetOracle
  };
}




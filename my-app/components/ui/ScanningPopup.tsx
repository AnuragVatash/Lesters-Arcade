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

  useEffect(() => {
    if (!isVisible) {
      setDots(0);
      setProgress(0);
      setScanComplete(false);
      return;
    }

    // Animated dots cycle
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev + 1) % 4); // 0, 1, 2, 3, then back to 0
    }, 500);

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setScanComplete(true);
          setTimeout(() => onComplete(isCorrect), 1000); // Show result for 1 second
          return 100;
        }
        return prev + 2; // Increase by 2% every 50ms (takes 2.5 seconds total)
      });
    }, 50);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
    };
  }, [isVisible, isCorrect, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-700">
        <div className="text-center">
          {!scanComplete ? (
            <>
              {/* Scanning text with animated dots */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Scanning
                  <span className="inline-block w-8 text-left">
                    {'.'.repeat(dots)}
                  </span>
                </h3>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-700 rounded-full h-4">
                  <div 
                    className="bg-blue-500 h-4 rounded-full transition-all duration-100 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-gray-400 text-sm mt-2">{Math.round(progress)}%</p>
              </div>
            </>
          ) : (
            /* Result display */
            <div className="mb-6">
              <h3 className={`text-4xl font-bold mb-4 ${
                isCorrect ? 'text-green-400' : 'text-red-400'
              }`}>
                {isCorrect ? 'CORRECT' : 'INCORRECT'}
              </h3>
              {!isCorrect && (
                <p className="text-gray-300 text-lg">Game will restart...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



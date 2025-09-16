'use client';

import { TimeComparison, formatTime, formatTimeDifference } from '@/lib/leaderboard';

interface TimeComparisonProps {
  comparison: TimeComparison;
  onClose: () => void;
}

export default function TimeComparisonDisplay({ comparison, onClose }: TimeComparisonProps) {
  const { oldTime, newTime, improvement, isFirstRecord } = comparison;
  const timeDiff = formatTimeDifference(improvement);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
      {/* Matrix-style background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-green-950/20 to-black opacity-50"></div>
      
      <div className="relative bg-black/95 border border-green-500/30 p-8 rounded-lg shadow-2xl shadow-green-500/20 max-w-lg w-full mx-4 backdrop-blur-sm">
        {/* Glitch overlay effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse" style={{ animationDelay: "1s" }}></div>
        
        <div className="text-center">
          <div className="text-green-500/50 font-mono text-xs mb-4">▄▄▄▄▄ LEADERBOARD UPDATE ▄▄▄▄▄</div>
          
          <h3 className="text-2xl font-bold text-green-400 mb-6 font-mono tracking-wider">
            {isFirstRecord ? 'NEW RECORD ESTABLISHED' : 'PERFORMANCE UPDATED'}
          </h3>
          
          <div className="space-y-4 bg-black/50 border border-green-500/20 rounded p-4">
            <div className="flex justify-between items-center">
              <span className="text-green-300 font-mono text-sm">PREVIOUS TIME:</span>
              <span className="text-white font-mono text-lg">
                {isFirstRecord ? 'N/A' : formatTime(oldTime!)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-green-300 font-mono text-sm">NEW TIME:</span>
              <span className="text-green-400 font-mono text-lg font-bold">
                {formatTime(newTime)}
              </span>
            </div>
            
            <div className="border-t border-green-500/30 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-green-300 font-mono text-sm">IMPROVEMENT:</span>
                <span className={`font-mono text-lg font-bold ${timeDiff.color}`}>
                  {timeDiff.text}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="mt-6 px-8 py-3 bg-green-900/50 border border-green-500/50 text-green-400 font-mono font-medium hover:bg-green-800/50 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20 active:scale-[0.98] transition-all duration-200 rounded"
          >
            [CONTINUE]
          </button>
        </div>
      </div>
    </div>
  );
}

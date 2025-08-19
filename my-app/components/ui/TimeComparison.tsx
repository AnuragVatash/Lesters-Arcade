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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-700">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-6">
            {isFirstRecord ? 'First Record Set!' : 'Time Updated!'}
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Previous Time:</span>
              <span className="text-white font-mono text-lg">
                {isFirstRecord ? '~' : formatTime(oldTime!)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">New Time:</span>
              <span className="text-white font-mono text-lg">
                {formatTime(newTime)}
              </span>
            </div>
            
            <div className="border-t border-gray-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Difference:</span>
                <span className={`font-mono text-lg ${timeDiff.color}`}>
                  {timeDiff.text}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

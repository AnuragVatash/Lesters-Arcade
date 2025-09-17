'use client';

import { useState, useEffect } from 'react';
import { getLeaderboard, formatTime, getUserBestTime, type GameType, type LeaderboardEntry } from '@/lib/leaderboard';
import { getCurrentUser } from '@/lib/auth';

interface LeaderboardPageProps {
  onBack: () => void;
}

export default function LeaderboardPage({ onBack }: LeaderboardPageProps) {
  const [selectedGame, setSelectedGame] = useState<GameType>('casino');
  const [currentPage, setCurrentPage] = useState(1);
  const [leaderboardData, setLeaderboardData] = useState<{
    entries: LeaderboardEntry[];
    totalPages: number;
    totalEntries: number;
  }>({ entries: [], totalPages: 0, totalEntries: 0 });
  const [userStats, setUserStats] = useState<{
    rank: number | null;
    time: number | null;
    hasPlayed: boolean;
  }>({ rank: null, time: null, hasPlayed: false });

  const ENTRIES_PER_PAGE = 50;
  const [currentUser] = useState(() => getCurrentUser()); // Get user once on mount

  useEffect(() => {
    const data = getLeaderboard(selectedGame, currentPage, ENTRIES_PER_PAGE);
    setLeaderboardData(data);
  }, [selectedGame, currentPage]);

  useEffect(() => {
    // Get user's stats for this game
    if (currentUser && !currentUser.isGuest) {
      const userTime = getUserBestTime(currentUser.username, selectedGame);
      
      if (userTime !== null) {
        // Get full leaderboard to find user's rank
        const fullLeaderboard = getLeaderboard(selectedGame, 1, 1000); // Get first 1000 entries
        const userRank = fullLeaderboard.entries.findIndex(entry => 
          entry.username === currentUser.username
        ) + 1;
        
        setUserStats({
          rank: userRank > 0 ? userRank : null,
          time: userTime,
          hasPlayed: true
        });
      } else {
        setUserStats({
          rank: null,
          time: null,
          hasPlayed: false
        });
      }
    } else {
      setUserStats({
        rank: null,
        time: null,
        hasPlayed: false
      });
    }
  }, [selectedGame, currentUser]); // Depend on selectedGame and currentUser

  const handleGameChange = (gameType: GameType) => {
    setSelectedGame(gameType);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const { totalPages } = leaderboardData;
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-2 text-gray-400 hover:text-white transition-colors duration-200"
        >
          ←
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 transition-colors duration-200 ${
            i === currentPage
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-2 text-gray-400 hover:text-white transition-colors duration-200"
        >
          →
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-1 mt-6 flex-wrap gap-2">
        {pages}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 relative overflow-hidden">
      {/* Matrix background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-green-950/20 to-black" aria-hidden="true"></div>
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
          {Array.from({ length: 400 }).map((_, i) => (
            <div
              key={i}
              className="border border-green-500/20 animate-pulse"
              style={{ animationDelay: `${i * 0.1}s`, animationDuration: '3s' }}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Glitch overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <button
            onClick={onBack}
            className="text-green-400 hover:text-green-300 transition-colors duration-200 text-sm sm:text-base font-mono border border-green-500/30 px-3 py-1 rounded bg-green-900/20 hover:bg-green-800/30"
          >
            [EXIT] ← MAIN_TERMINAL
          </button>
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-green-400 font-mono">[ACCESS_LOGS]</h1>
            <div className="text-xs text-green-500/70 font-mono mt-1">database@ghost-net.db</div>
          </div>
          <div className="w-16 sm:w-20"></div> {/* Spacer for centering */}
        </div>

        {/* Game Type Selector */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1 bg-black/90 border border-green-500/30 rounded-lg p-1 w-fit mx-auto backdrop-blur-sm">
            <button
              onClick={() => handleGameChange('casino')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-md font-mono font-medium transition-all duration-200 text-sm sm:text-base border ${
                selectedGame === 'casino'
                  ? 'bg-green-900/30 border-green-500/50 text-green-400 shadow-lg shadow-green-500/20'
                  : 'border-transparent text-green-300/70 hover:text-green-400 hover:bg-green-900/20'
              }`}
            >
              [CASINO] exploit.log
            </button>
            <button
              onClick={() => handleGameChange('cayo')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-md font-mono font-medium transition-all duration-200 text-sm sm:text-base border ${
                selectedGame === 'cayo'
                  ? 'bg-green-900/30 border-green-500/50 text-green-400 shadow-lg shadow-green-500/20'
                  : 'border-transparent text-green-300/70 hover:text-green-400 hover:bg-green-900/20'
              }`}
            >
              [CAYO] breach.log
            </button>
            <button
              onClick={() => handleGameChange('numberFinder')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-md font-mono font-medium transition-all duration-200 text-sm sm:text-base border ${
                selectedGame === 'numberFinder'
                  ? 'bg-green-900/30 border-green-500/50 text-green-400 shadow-lg shadow-green-500/20'
                  : 'border-transparent text-green-300/70 hover:text-green-400 hover:bg-green-900/20'
              }`}
            >
              [NUMBERFINDER] trace.log
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="text-center mb-6">
          <p className="text-green-400/70 text-sm sm:text-base font-mono">
            [DATABASE] {leaderboardData.entries.length} / {leaderboardData.totalEntries} records loaded
          </p>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-black/90 border border-green-500/30 rounded-lg overflow-hidden shadow-2xl shadow-green-500/20 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full" aria-label="Leaderboard table">
              <caption className="sr-only">Leaderboard records for selected game</caption>
              <thead>
                <tr className="bg-green-900/20 border-b border-green-500/30">
                  <th scope="col" className="text-left py-3 sm:py-4 px-3 sm:px-6 font-mono font-medium text-green-400 text-sm sm:text-base">[RANK]</th>
                  <th scope="col" className="text-left py-3 sm:py-4 px-3 sm:px-6 font-mono font-medium text-green-400 text-sm sm:text-base">[USER_ID]</th>
                  <th scope="col" className="text-left py-3 sm:py-4 px-3 sm:px-6 font-mono font-medium text-green-400 text-sm sm:text-base">[EXEC_TIME]</th>
                  <th scope="col" className="text-left py-3 sm:py-4 px-3 sm:px-6 font-mono font-medium text-green-400 text-sm sm:text-base hidden sm:table-cell">[TIMESTAMP]</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.entries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 sm:py-12 text-red-400/70 text-sm sm:text-base font-mono">
                      [ERROR] No records found for {
                        selectedGame === 'casino' ? 'CASINO_EXPLOIT' : 
                        selectedGame === 'cayo' ? 'CAYO_BREACH' : 
                        'NUMBERFINDER_TRACE'
                      } database
                    </td>
                  </tr>
                ) : (
                  leaderboardData.entries.map((entry, index) => {
                    const rank = (currentPage - 1) * ENTRIES_PER_PAGE + index + 1;
                    const date = new Date(entry.completedAt).toLocaleDateString();
                    const isCurrentUser = currentUser && !currentUser.isGuest && entry.username === currentUser.username;
                    
                    return (
                      <tr
                        key={`${entry.username}-${entry.completedAt}`}
                        className={`border-b border-green-500/20 transition-colors duration-200 ${
                          isCurrentUser 
                            ? 'bg-green-900/30 border-green-500/50 hover:bg-green-900/50' 
                            : 'hover:bg-green-900/10'
                        }`}
                      >
                        <td className="py-3 sm:py-4 px-3 sm:px-6">
                          <div className="flex items-center">
                            {rank <= 3 && (
                              <span className="mr-1 sm:mr-2 text-sm sm:text-base">
                                {rank === 1 && '🥇'}
                                {rank === 2 && '🥈'}
                                {rank === 3 && '🥉'}
                              </span>
                            )}
                            <span className="font-mono font-medium text-sm sm:text-base text-green-300">{rank}</span>
                          </div>
                        </td>
                        <td className={`py-3 sm:py-4 px-3 sm:px-6 font-mono font-medium text-sm sm:text-base truncate max-w-[120px] sm:max-w-none ${
                          isCurrentUser ? 'text-green-300 font-bold' : 'text-green-400/80'
                        }`}>
                          {entry.username}
                        </td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 font-mono text-sm sm:text-lg text-green-300">{formatTime(entry.time)}</td>
                        <td className="py-3 sm:py-4 px-3 sm:px-6 text-green-400/60 font-mono text-sm hidden sm:table-cell">{date}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <nav aria-label="Leaderboard pagination">
          {renderPagination()}
        </nav>

        {/* User Stats Footer */}
        {currentUser && (
          <div className="mt-8 bg-gray-800 rounded-lg border-2 border-blue-500 sticky bottom-4 z-10">
            <div className="px-4 py-3">
              <h3 className="text-lg font-bold text-white mb-3 text-center">Your Stats</h3>
              <div className="overflow-x-auto">
                <table className="w-full" aria-label="Current user stats">
                  <thead>
                    <tr className="bg-gray-700 border-b border-gray-600">
                      <th scope="col" className="text-left py-2 px-3 sm:px-6 font-medium text-gray-300 text-sm sm:text-base">Rank</th>
                      <th scope="col" className="text-left py-2 px-3 sm:px-6 font-medium text-gray-300 text-sm sm:text-base">Username</th>
                      <th scope="col" className="text-left py-2 px-3 sm:px-6 font-medium text-gray-300 text-sm sm:text-base">Time</th>
                      <th scope="col" className="text-left py-2 px-3 sm:px-6 font-medium text-gray-300 text-sm sm:text-base hidden sm:table-cell">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-800">
                      <td className="py-2 px-3 sm:px-6">
                        <div className="flex items-center">
                          {userStats.hasPlayed && userStats.rank && userStats.rank <= 3 && (
                            <span className="mr-1 sm:mr-2 text-sm sm:text-base">
                              {userStats.rank === 1 && '🥇'}
                              {userStats.rank === 2 && '🥈'}
                              {userStats.rank === 3 && '🥉'}
                            </span>
                          )}
                          <span className="font-medium text-sm sm:text-base text-blue-400">
                            {userStats.hasPlayed && userStats.rank ? `#${userStats.rank}` : '~'}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 px-3 sm:px-6 font-medium text-sm sm:text-base text-blue-400 truncate max-w-[120px] sm:max-w-none">
                        {currentUser.isGuest ? 'Guest User' : currentUser.username}
                      </td>
                      <td className="py-2 px-3 sm:px-6 font-mono text-sm sm:text-lg text-blue-400">
                        {userStats.hasPlayed && userStats.time ? formatTime(userStats.time) : '~'}
                      </td>
                      <td className="py-2 px-3 sm:px-6 text-sm hidden sm:table-cell">
                        {currentUser.isGuest ? (
                          <span className="text-yellow-400">Guest (No Ranking)</span>
                        ) : userStats.hasPlayed ? (
                          <span className="text-green-400">Played</span>
                        ) : (
                          <span className="text-gray-400">Not Played</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

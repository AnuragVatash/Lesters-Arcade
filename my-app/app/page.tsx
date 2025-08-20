'use client';

import { useState, useEffect } from 'react';
import CayoFingerprint from '@/components/games/cayoFingerprint/CayoFingerprint';
import CasinoFingerprint from '@/components/games/casinoFingerprint/CasinoFingerprint';
import NumberFinder from '@/components/games/numberFinder/numberFinder';
import Navbar from '@/components/ui/navbar';
import AuthPage from '@/components/auth/AuthPage';
import UserDisplay from '@/components/ui/UserDisplay';
import LeaderboardPage from '@/components/leaderboard/LeaderboardPage';
import { getCurrentUser, type User } from '@/lib/auth';
import { generateTestData, type GameType } from '@/lib/leaderboard';

type Game = 'casino' | 'cayo' | 'number';
type Page = 'games' | 'leaderboard';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [activeGame, setActiveGame] = useState<Game>('cayo');
  const [currentPage, setCurrentPage] = useState<Page>('games');

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const currentUser = getCurrentUser();
    setUser(currentUser);
    
    // Generate test data on first load (only if no data exists)
    const existingData = localStorage.getItem('__gta_hack_leaderboard__');
    if (!existingData) {
      generateTestData();
    }
    
    setIsLoading(false);
  }, []);

  const handleAuthenticated = (authenticatedUser: User) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('games');
  };

  const handleLeaderboardClick = (_gameType?: GameType) => {
    setCurrentPage('leaderboard');
  };

  const handleBackToGames = () => {
    setCurrentPage('games');
  };

  const renderGame = () => {
    if (!user) return null;
    
    switch (activeGame) {
      case 'casino':
        return <CasinoFingerprint user={user} />;
      case 'cayo':
        return <CayoFingerprint user={user} />;
      case 'number':
        return <NumberFinder user={user} />;
      default:
        return <CayoFingerprint user={user} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-green-950 to-black opacity-30"></div>
        <div className="relative z-10 text-green-400 font-mono text-xl">
          <div className="flex items-center space-x-2">
            <div className="animate-spin w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full"></div>
            <span className="animate-pulse">INITIALIZING SYSTEM...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthenticated={handleAuthenticated} />;
  }

  if (currentPage === 'leaderboard') {
    return <LeaderboardPage onBack={handleBackToGames} />;
  }

  return (
    <div className='bg-black min-h-screen relative overflow-hidden'>
      {/* Matrix-style background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-green-950/10 to-black"></div>
      <div className="absolute inset-0 opacity-5">
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
      
      <div className="relative z-10">
        <UserDisplay user={user} onLogout={handleLogout} />
        <Navbar 
          activeGame={activeGame} 
          onGameChange={setActiveGame}
          onLeaderboardClick={handleLeaderboardClick}
        />
        <div className='flex items-center justify-center min-h-[calc(100vh-128px)]'>
          {renderGame()}
        </div>
      </div>
    </div>
  );
}
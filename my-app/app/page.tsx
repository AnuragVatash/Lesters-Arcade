'use client';

import { useState, useEffect } from 'react';
import CayoFingerprint from '@/components/games/cayoFingerprint/CayoFingerprint';
import CasinoFingerprint from '@/components/games/casinoFingerprint/CasinoFingerprint';
import Navbar from '@/components/ui/navbar';
import AuthPage from '@/components/auth/AuthPage';
import UserDisplay from '@/components/ui/UserDisplay';
import LeaderboardPage from '@/components/leaderboard/LeaderboardPage';
import { getCurrentUser, type User } from '@/lib/auth';
import { generateTestData, type GameType } from '@/lib/leaderboard';

type Game = 'casino' | 'cayo';
type Page = 'games' | 'leaderboard';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [activeGame, setActiveGame] = useState<Game>('cayo');
  const [currentPage, setCurrentPage] = useState<Page>('games');
  const [selectedLeaderboardGame, setSelectedLeaderboardGame] = useState<GameType>('casino');
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

  const handleLeaderboardClick = (gameType?: GameType) => {
    if (gameType) {
      setSelectedLeaderboardGame(gameType);
    }
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
      default:
        return <CayoFingerprint user={user} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
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
    <div className='bg-black min-h-screen'>
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
  );
}
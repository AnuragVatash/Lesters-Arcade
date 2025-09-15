"use client";

import { useState, useEffect } from "react";
import CayoFingerprint from "@/components/games/cayoFingerprint/CayoFingerprint";
import CasinoFingerprint from "@/components/games/casinoFingerprint/CasinoFingerprint";
import NumberFinder from "@/components/games/numberFinder/numberFinder";
import Navbar from "@/components/ui/navbar";
import AuthPage from "@/components/auth/AuthPage";
import LeaderboardPage from "@/components/leaderboard/LeaderboardPage";
import SystemStatus from "@/components/ui/SystemStatus";
import { getCurrentUser, type User } from "@/lib/auth";
import { generateTestData, type GameType } from "@/lib/leaderboard";

type Game = "casino" | "cayo" | "number";
type Page = "games" | "leaderboard";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [activeGame, setActiveGame] = useState<Game>("cayo");
  const [currentPage, setCurrentPage] = useState<Page>("games");

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const currentUser = getCurrentUser();
    setUser(currentUser);

    // Generate test data on first load (only if no data exists)
    const existingData = localStorage.getItem("__gta_hack_leaderboard__");
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
    setCurrentPage("games");
  };

  const handleLeaderboardClick = (_gameType?: GameType) => {
    setCurrentPage("leaderboard");
  };

  const handleBackToGames = () => {
    setCurrentPage("games");
  };

  const renderGame = () => {
    if (!user) return null;

    switch (activeGame) {
      case "casino":
        return <CasinoFingerprint user={user} />;
      case "cayo":
        return <CayoFingerprint user={user} />;
      case "number":
        return <NumberFinder user={user} />;
      default:
        return <CayoFingerprint user={user} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-green-950 to-black opacity-30"></div>
        <div className="relative z-10 text-green-400 font-mono">
          <div className="text-center">
            <div className="text-2xl font-bold mb-4 tracking-wider">
              LESTER&apos;S ARCADE
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm opacity-70">
              <div className="animate-spin w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full"></div>
              <span className="animate-pulse">Loading systems...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthenticated={handleAuthenticated} />;
  }

  // Do not early return; render leaderboard as overlay instead

  return (
    <div className="bg-black min-h-screen relative overflow-hidden">
      {/* Matrix-style background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-green-950/10 to-black"></div>
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
          {Array.from({ length: 400 }).map((_, i) => (
            <div
              key={i}
              className="border border-green-500/20 animate-pulse"
              style={{ animationDelay: `${i * 0.1}s`, animationDuration: "3s" }}
            ></div>
          ))}
        </div>
      </div>

      {/* Glitch overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
        <div
          className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10">
        <Navbar
          activeGame={activeGame}
          onGameChange={setActiveGame}
          onLeaderboardClick={handleLeaderboardClick}
          user={user}
          onLogout={handleLogout}
        />
        <div className="flex items-center justify-center min-h-[calc(100vh-160px)]">
          {renderGame()}
        </div>
        {currentPage === "leaderboard" && (
          <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm overflow-auto">
            <LeaderboardPage onBack={handleBackToGames} />
          </div>
        )}
      </div>
      <SystemStatus />
    </div>
  );
}

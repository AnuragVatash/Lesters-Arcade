"use client";

import { useState, useEffect, useRef } from "react";
import CayoFingerprint from "@/components/games/cayoFingerprint/CayoFingerprint";
import CasinoFingerprint from "@/components/games/casinoFingerprint/CasinoFingerprint";
import NumberFinder from "@/components/games/numberFinder/numberFinder";
import Navbar from "@/components/ui/navbar";
import AuthPage from "@/components/auth/AuthPage";
import LeaderboardPage from "@/components/leaderboard/LeaderboardPage";
import SystemStatus from "@/components/ui/SystemStatus";
import ParticleSystem from "@/components/effects/ParticleSystem";
import VolumeControl from "@/components/ui/VolumeControl";
import { getCurrentUser, type User } from "@/lib/auth";
import { generateTestData, type GameType } from "@/lib/leaderboard";
import { useSimpleAudio } from "@/lib/simpleAudio";
// import { AnimationManager } from "@/lib/animations";
// import { InputManager } from "@/lib/inputSystem";

type Game = "casino" | "cayo" | "number";
type Page = "games" | "leaderboard";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [activeGame, setActiveGame] = useState<Game>("cayo");
  const [currentPage, setCurrentPage] = useState<Page>("games");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [showParticles, setShowParticles] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [particleMode, setParticleMode] = useState<'default' | 'matrix'>('matrix');
  
  // Audio system
  const audio = useSimpleAudio();
  
  // Refs for systems
  // const audioManagerRef = useRef<AudioManager | null>(null);
  // const animationManagerRef = useRef<AnimationManager | null>(null);
  // const inputManagerRef = useRef<InputManager | null>(null);
  const particleSystemRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let loadingTimer: NodeJS.Timeout;
    let failsafeTimer: NodeJS.Timeout;

    const initializeApp = async () => {
      console.log('Starting app initialization...');
      
      try {
        // Check if user is already authenticated
        try {
          const currentUser = getCurrentUser();
          setUser(currentUser);
          console.log('User loaded:', currentUser ? 'Authenticated' : 'Guest');
        } catch (authError) {
          console.warn('Auth check failed:', authError);
          setUser(null);
        }

        // Generate test data on first load (only if no data exists)
        try {
          if (typeof window !== 'undefined') {
            const existingData = localStorage.getItem("__gta_hack_leaderboard__");
            if (!existingData) {
              generateTestData();
              console.log('Test data generated');
            }
          }
        } catch (dataError) {
          console.warn('Test data generation failed:', dataError);
        }

        // Initialize audio system in background (non-blocking)
        audio.resumeAudioContext().catch(audioError => {
          console.warn('Audio initialization failed:', audioError);
        });

        console.log('App initialization completed successfully');

        // Clear failsafe timer since initialization completed successfully
        if (failsafeTimer) {
          clearTimeout(failsafeTimer);
        }

        // Complete loading after successful initialization
        loadingTimer = setTimeout(() => {
          setIsLoading(false);
          console.log('Loading completed successfully');
        }, 300);

      } catch (error) {
        console.error('App initialization failed:', error);
        // Only show warning if there was an actual error
        setLoadingTimeout(true);
        setIsLoading(false);
      }
    };

    // Absolute failsafe: Only trigger if initialization takes too long or fails
    failsafeTimer = setTimeout(() => {
      console.warn('Loading failsafe triggered - systems may not be fully initialized');
      setIsLoading(false);
      setLoadingTimeout(true);
    }, 10000); // Increased to 10 seconds to be more reasonable

    initializeApp();

    return () => {
      if (loadingTimer) clearTimeout(loadingTimer);
      if (failsafeTimer) clearTimeout(failsafeTimer);
    };
  }, []); // Remove audio dependency to prevent re-initialization

  const handleAuthenticated = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    
    // Play login sound
    if (audioEnabled) {
      audio.playSound('login');
    }

    // Add login animation (temporarily disabled)
    // if (animationManagerRef.current) {
    //   animationManagerRef.current.createFadeInEffect(document.body, 1000);
    // }
  };

  const handleLogout = () => {
    // Play logout sound
    if (audioEnabled) {
      audio.playSound('logout');
    }
    
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
            <div className="flex items-center justify-center space-x-2 text-sm opacity-70 mb-2">
              <div className="animate-spin w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full"></div>
              <span className="animate-pulse">Initializing systems...</span>
            </div>
            <div className="text-xs opacity-50">
              If this takes too long, try refreshing the page
            </div>
            <div className="w-32 h-1 bg-green-900/30 rounded-full mx-auto mt-4 overflow-hidden">
              <div className="h-full bg-green-400 rounded-full animate-pulse w-full"></div>
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
      {/* Enhanced Matrix-style background */}
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

             {/* Dynamic Particle System */}
             {showParticles && (
               <ParticleSystem
                 width={typeof window !== 'undefined' ? window.innerWidth : 800}
                 height={typeof window !== 'undefined' ? window.innerHeight : 600}
                 particleCount={particleMode === 'matrix' ? 80 : 150}
                 spawnRate={particleMode === 'matrix' ? 0.4 : 0.16}
                 enabled={true}
                 mode={particleMode}
                 className={particleMode === 'matrix' ? 'opacity-90' : 'opacity-60'}
               />
             )}

      {/* Enhanced Glitch overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
        <div
          className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse opacity-50"></div>
      </div>

      {/* System Controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={() => {
            if (showParticles) {
              // Toggle particle mode
              setParticleMode(prev => prev === 'matrix' ? 'default' : 'matrix');
            } else {
              // Turn on particles
              setShowParticles(true);
            }
            if (audioEnabled) {
              audio.playSound('click');
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowParticles(!showParticles);
            if (audioEnabled) {
              audio.playSound('click');
            }
          }}
          className={`px-2 py-1 text-xs font-mono font-medium transition-all duration-200 border rounded ${
            showParticles 
              ? 'text-green-400 border-green-500/30 bg-green-900/20 hover:bg-green-900/30' 
              : 'text-green-300/70 border-green-500/30 hover:text-green-400 hover:bg-green-900/20'
          }`}
          title="Left click: Toggle mode | Right click: Toggle on/off"
        >
          <span className="mr-1">
            {!showParticles ? '✨' : particleMode === 'matrix' ? '🌧️' : '🌟'}
          </span>
          {!showParticles ? 'EFFECTS.off' : particleMode === 'matrix' ? 'MATRIX.exe' : 'PARTICLES.exe'}
        </button>
        <VolumeControl 
          onVolumeChange={(volume) => audio.setMasterVolume(volume)}
          onMuteToggle={(muted) => {
            audio.setMuted(muted);
            setAudioEnabled(!muted);
          }}
        />
      </div>

      {/* Loading timeout warning */}
      {loadingTimeout && (
        <div className="absolute top-4 left-4 z-30 bg-yellow-900/90 border border-yellow-500/50 text-yellow-400 px-3 py-2 rounded-md text-sm font-mono max-w-sm">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <div>
              <div className="font-semibold">System Warning</div>
              <div className="text-xs opacity-80">Initialization took longer than expected</div>
              <div className="text-xs opacity-60">Audio or visual effects may be limited</div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10">
        <Navbar
          activeGame={activeGame}
          onGameChange={setActiveGame}
          onLeaderboardClick={handleLeaderboardClick}
          user={user}
          onLogout={handleLogout}
        />
        <div className="flex items-center justify-center h-[calc(100vh-120px)] overflow-hidden">
          {renderGame()}
        </div>
        {currentPage === "leaderboard" && (
          <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm overflow-auto">
            <LeaderboardPage onBack={handleBackToGames} />
          </div>
        )}
      </div>
      <SystemStatus />
      {/* Audio system is now integrated via VolumeControl */}
    </div>
  );
}

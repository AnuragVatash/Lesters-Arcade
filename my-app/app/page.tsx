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
import { generateTestData } from "@/lib/leaderboard";
import { useSimpleAudio } from "@/lib/simpleAudio";
// import { AnimationManager } from "@/lib/animations";
// import { InputManager } from "@/lib/inputSystem";

type Game = "casino" | "cayo" | "number";
type Page = "games" | "leaderboard";

// Debug handle type for attaching helpers on window during development
declare global {
  interface Window {
    __homeDebug__?: {
      setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
      setLoadingTimeout: React.Dispatch<React.SetStateAction<boolean>>;
      setUser: React.Dispatch<React.SetStateAction<User | null>>;
      snapshot: () => {
        isLoading: boolean;
        loadingTimeout: boolean;
        user: User | null;
        activeGame: Game;
        currentPage: Page;
      };
    };
  }
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [activeGame, setActiveGame] = useState<Game>("cayo");
  const [currentPage, setCurrentPage] = useState<Page>("games");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [showParticles, setShowParticles] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [particleMode, setParticleMode] = useState<"default" | "matrix">(
    "matrix"
  );
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Audio system
  const audio = useSimpleAudio();
  const audioRef = useRef(audio);
  // keep a stable ref to avoid exhaustive-deps warning while still using latest methods
  audioRef.current = audio;

  // Refs for systems
  // const audioManagerRef = useRef<AudioManager | null>(null);
  // const animationManagerRef = useRef<AnimationManager | null>(null);
  // const inputManagerRef = useRef<InputManager | null>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) {
      console.log("[Home] Initialization skipped: already initialized", {
        hasInitialized: hasInitializedRef.current,
      });
      return;
    }
    hasInitializedRef.current = true;
    let loadingTimer: ReturnType<typeof setTimeout> | undefined;
    // Absolute failsafe: Only trigger if initialization takes too long or fails
    const failsafeTimer = setTimeout(() => {
      console.warn(
        "Loading failsafe triggered - systems may not be fully initialized"
      );
      setIsLoading(false);
      setLoadingTimeout(true);
    }, 10000); // Increased to 10 seconds to be more reasonable
    console.log("[Home] Failsafe timer started (10s)");

    const initializeApp = async () => {
      console.log("Starting app initialization...");

      try {
        // Check if user is already authenticated
        try {
          console.log("[Home] Checking current user...");
          const currentUser = getCurrentUser();
          setUser(currentUser);
          console.log("User loaded:", currentUser ? "Authenticated" : "Guest");
        } catch (authError) {
          console.warn("Auth check failed:", authError);
          setUser(null);
        }

        // Generate test data on first load (only if no data exists)
        try {
          if (typeof window !== "undefined") {
            console.log("[Home] Checking localStorage for leaderboard data...");
            const existingData = localStorage.getItem(
              "__gta_hack_leaderboard__"
            );
            if (!existingData) {
              generateTestData();
              console.log("Test data generated");
            }
          }
        } catch (dataError) {
          console.warn("Test data generation failed:", dataError);
        }

        // Initialize audio system in background (non-blocking)
        console.log("[Home] Initializing audio context (non-blocking)...");
        audioRef.current.resumeAudioContext().then(() => {
          console.log("[Home] Audio context resumed or not needed");
        }).catch((audioError) => {
          console.warn("Audio initialization failed:", audioError);
        });

        console.log("App initialization completed successfully");

        // Clear failsafe timer since initialization completed successfully
        clearTimeout(failsafeTimer);
        console.log("[Home] Failsafe timer cleared");

        // Complete loading after successful initialization
        loadingTimer = setTimeout(() => {
          setIsLoading(false);
          console.log("Loading completed successfully");
        }, 300);
        console.log("[Home] Loading completion timer scheduled (300ms)");
      } catch (error) {
        console.error("App initialization failed:", error);
        // Only show warning if there was an actual error
        setLoadingTimeout(true);
        setIsLoading(false);
      }
    };

    initializeApp();

    return () => {
      if (loadingTimer) clearTimeout(loadingTimer);
      if (loadingTimer) console.log("[Home] Cleared loading completion timer");
      clearTimeout(failsafeTimer);
      console.log("[Home] Cleared failsafe timer (cleanup)");
    };
  }, []);

  // Debug: track loading state transitions
  useEffect(() => {
    console.log("[Home] isLoading state:", isLoading, {
      loadingTimeout,
      hasInitialized: hasInitializedRef.current,
    });
  }, [isLoading, loadingTimeout]);

  // Debug: expose simple toggles to window for manual testing
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.__homeDebug__ = {
      setIsLoading,
      setLoadingTimeout,
      setUser,
      snapshot: () => ({ isLoading, loadingTimeout, user, activeGame, currentPage }),
    };
    console.log("[Home] Debug handle available on window.__homeDebug__");
  }, [isLoading, loadingTimeout, user, activeGame, currentPage]);

  // Set window dimensions after hydration to prevent hydration mismatch
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Set initial dimensions after hydration
    updateDimensions();

    // Update dimensions on window resize
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Add keyboard support for skipping loading screen
  useEffect(() => {
    if (!isLoading) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsLoading(false);
        if (audioEnabled) {
          audio.playSound('click');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, audioEnabled, audio]);

  const handleAuthenticated = (authenticatedUser: User) => {
    setUser(authenticatedUser);

    // Play login sound
    if (audioEnabled) {
      audio.playSound("login");
    }

    // Add login animation (temporarily disabled)
    // if (animationManagerRef.current) {
    //   animationManagerRef.current.createFadeInEffect(document.body, 1000);
    // }
  };

  const handleLogout = () => {
    // Play logout sound
    if (audioEnabled) {
      audio.playSound("logout");
    }

    setUser(null);
    setCurrentPage("games");
  };

  const handleLeaderboardClick = () => {
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

  if (!user && !isLoading) {
    return <AuthPage onAuthenticated={handleAuthenticated} />;
  }

  // Do not early return; render leaderboard as overlay instead

  return (
    <div className="bg-black min-h-screen relative overflow-hidden">
      {/* Loading Overlay to prevent CLS */}
      {isLoading && (
        <div className="fixed inset-0 z-[10000] bg-black flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-green-950 to-black opacity-30"></div>
          <div className="relative z-10 text-green-400 font-mono">
            <div className="text-center">
              <div className="text-2xl font-bold mb-4 tracking-wider">LESTER&apos;S ARCADE</div>
              <div className="flex items-center justify-center space-x-2 text-sm opacity-70 mb-2">
                <div className="animate-spin w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full"></div>
                <span className="animate-pulse">Initializing systems...</span>
              </div>
              <div className="text-xs opacity-50 mb-4">Press ESC, ENTER, or SPACE to skip • If stuck, refresh the page</div>
              <div className="w-32 h-1 bg-green-900/30 rounded-full mx-auto mt-4 overflow-hidden mb-6">
                <div className="h-full bg-green-400 rounded-full animate-pulse w-full"></div>
              </div>
              <button
                onClick={() => {
                  setIsLoading(false);
                  if (audioEnabled) {
                    audio.playSound('click');
                  }
                }}
                className="px-4 py-2 bg-green-900/30 hover:bg-green-800/50 border border-green-500/50 rounded-md text-green-400 text-sm font-mono transition-all duration-200 hover:text-green-300 hover:border-green-400/50 active:bg-green-700/50"
              >
                [SKIP] Enter Arcade
              </button>
            </div>
          </div>
        </div>
      )}
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
          width={dimensions.width}
          height={dimensions.height}
          particleCount={particleMode === "matrix" ? 80 : 150}
          spawnRate={particleMode === "matrix" ? 0.4 : 0.16}
          enabled={true}
          mode={particleMode}
          className={particleMode === "matrix" ? "opacity-90" : "opacity-60"}
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
              setParticleMode((prev) =>
                prev === "matrix" ? "default" : "matrix"
              );
            } else {
              // Turn on particles
              setShowParticles(true);
            }
            if (audioEnabled) {
              audio.playSound("click");
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowParticles(!showParticles);
            if (audioEnabled) {
              audio.playSound("click");
            }
          }}
          className={`px-2 py-1 text-xs font-mono font-medium transition-all duration-200 border rounded ${
            showParticles
              ? "text-green-400 border-green-500/30 bg-green-900/20 hover:bg-green-900/30"
              : "text-green-300/70 border-green-500/30 hover:text-green-400 hover:bg-green-900/20"
          }`}
          title="Left click: Toggle mode | Right click: Toggle on/off"
        >
          <span className="mr-1">
            {!showParticles ? "✨" : particleMode === "matrix" ? "🌧️" : "🌟"}
          </span>
          {!showParticles
            ? "EFFECTS.off"
            : particleMode === "matrix"
            ? "MATRIX.exe"
            : "PARTICLES.exe"}
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
              <div className="text-xs opacity-80">
                Initialization took longer than expected
              </div>
              <div className="text-xs opacity-60">
                Audio or visual effects may be limited
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10">
        {user && (
          <Navbar
            activeGame={activeGame}
            onGameChange={setActiveGame}
            onLeaderboardClick={handleLeaderboardClick}
            user={user}
            onLogout={handleLogout}
          />
        )}
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

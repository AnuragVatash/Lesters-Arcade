"use client";
/* eslint-disable @next/next/no-img-element */
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

import { useCallback, useEffect, useRef, useState } from "react";
import { submitTime as submitLeaderboardTime } from "@/lib/leaderboard";
import TimeComparisonDisplay from "@/components/ui/TimeComparison";
import StartupOverlay from "@/components/ui/StartupOverlay";
import ScanningPopup from "@/components/ui/ScanningPopup";
import { useOracle } from "@/hooks/useOracle";
import ParticleSystem from "@/components/effects/ParticleSystem";

import { type User } from "@/lib/auth";

interface CayoFingerprintProps {
  user: User;
  skipCutscenes?: boolean;
}

export default function CayoFingerprint({ user, skipCutscenes = false }: CayoFingerprintProps) {
  // All 8 pieces now need to be matched correctly.
  const PRINT_DIR = "print1";

  const rows = Array.from({ length: 8 });

  // Dynamic asset paths
  const getAssetPath = (filename: string) =>
    `/cayoFingerprints/${PRINT_DIR}/${filename}`;
  // removed unused baseImages
  const CONNECTION_TIMEOUT_IMG = `/cayoFingerprints/connection_timeout.png`;
  const CLONE_TARGET_IMG = getAssetPath("clone_target.png");
  const DECIPHERED_IMG = `/cayoFingerprints/decyphered.png`;

  // Responsive scale system
  const [containerWidth, setContainerWidth] = useState(1280);
  const BASE = { w: 1200, h: 874 } as const;
  const aspectRatio = BASE.w / BASE.h;
  const containerHeight = containerWidth / aspectRatio;
  const SCALE = containerHeight / BASE.h;
  const scaled = (n: number) => Math.round(n * SCALE);

  useEffect(() => {
    const updateScale = () => {
      const viewportWidth = window.innerWidth;
      
      // Calculate max width based on viewport with padding
      const maxWidth = Math.min(viewportWidth - 64, 1280); // 64px for padding (32px each side)
      
      // Ensure minimum usable width
      const finalWidth = Math.max(maxWidth, 320);
      
      setContainerWidth(finalWidth);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Set window dimensions after hydration to prevent hydration mismatch
  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window === 'undefined') return;
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  // Panel dimensions at base resolution
  const DIM = {
    leftTop: { w: 438, h: 134 }, // Connection Timeout
    rightTop: { w: 718, h: 134 }, // Deciphered Signals
    leftBottom: { w: 438, h: 697 }, // Components (carousels)
    rightBottom: { w: 718, h: 697 }, // Clone Target
  } as const;

  // Consistent image order for all carousels (fp1, fp2, fp3, etc.)
  const [carouselImages, setCarouselImages] = useState<string[][]>([]);

  // Remove the automatic generation on component load

  const [selectedIndexes, setSelectedIndexes] = useState<number[]>(
    Array(8).fill(0)
  );
  const [initialIndexes, setInitialIndexes] = useState<number[]>(
    Array(8).fill(0)
  );
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const initializedRef = useRef<boolean[]>(Array(8).fill(false));
  const apiRefs = useRef<(CarouselApi | null)[]>(Array(8).fill(null));
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [timeComparison, setTimeComparison] = useState<{
    oldTime: number | null;
    newTime: number;
    improvement: number | null;
    isFirstRecord: boolean;
  } | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [focusedRow, setFocusedRow] = useState<number>(0);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<boolean>(false);
  const [showStartup, setShowStartup] = useState<boolean>(true);
  const [hackingProgress, setHackingProgress] = useState<number>(0);
  const [hackingText, setHackingText] = useState<string>(
    "INITIALIZING HACK PROTOCOL..."
  );
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Oracle hook for cheat code functionality
  const { oracleActive, resetOracle } = useOracle({
    gameStarted,
    isScanning,
    onOracleActivated: () => {
      // Auto-navigate all carousels to correct answers
      apiRefs.current.forEach((api, rowIdx) => {
        if (api) {
          api.scrollTo(rowIdx, true);
        }
      });
    },
  });

  // function shuffle<T>(arr: T[]): T[] {
  //   const a = [...arr];
  //   for (let i = a.length - 1; i > 0; i--) {
  //     const j = Math.floor(Math.random() * (i + 1));
  //     [a[i], a[j]] = [a[j], a[i]];
  //   }
  //   return a;
  // }

  // Remove automatic initialization - this will happen when Start is clicked

  const startGame = () => {
    // Reset initialization state for carousels to allow them to be re-scrambled
    initializedRef.current.fill(false);

    // Generate consistent order for all carousels
    const generateConsistentImages = () => {
      // Get the updated base images in consistent order (fp1, fp2, fp3, etc.)
      const printSetBaseImages = Array.from(
        { length: 8 },
        (_, i) => `/cayoFingerprints/${PRINT_DIR}/fp${i + 1}.png`
      );

      // Return the same consistent order for all rows
      return Array.from({ length: 8 }, () => [...printSetBaseImages]);
    };

    // Generate random starting positions (0-7) for each carousel
    const randomPositions = Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 8)
    );
    setInitialIndexes(randomPositions);
    setSelectedIndexes(randomPositions);

    // Generate and set the consistent images
    setCarouselImages(generateConsistentImages());
    setGameStarted(true);
    setGameStartTime(Date.now());
    setTimeComparison(null);
    setFocusedRow(0);
    resetOracle();
  };

  // Startup hacking sequence effect (mirrors numberFinder)
  useEffect(() => {
    if (!showStartup) return;

    // Fast path when skip is enabled: briefly show the overlay, then continue
    if (skipCutscenes) {
      setHackingText("INITIALIZING HACK PROTOCOL...");
      setHackingProgress(100);
      const t = setTimeout(() => {
        setShowStartup(false);
      }, 300);
      return () => clearTimeout(t);
    }

    const hackingSteps = [
      { text: "INITIALIZING HACK PROTOCOL...", duration: 800 },
      { text: "BYPASSING SECURITY FIREWALL...", duration: 1200 },
      { text: "DECRYPTING DATABASE ACCESS...", duration: 1000 },
      { text: "INJECTING MALICIOUS PAYLOAD...", duration: 900 },
      { text: "ESTABLISHING BACKDOOR CONNECTION...", duration: 1100 },
      { text: "HACK COMPLETE - ACCESS GRANTED", duration: 600 },
    ];

    let currentStep = 0;
    let currentProgress = 0;
    let progressInterval: NodeJS.Timeout | null = null;
    let stepTimeout: NodeJS.Timeout | null = null;
    let finalTimeout: NodeJS.Timeout | null = null;

    const updateProgress = () => {
      if (currentStep >= hackingSteps.length) {
        setHackingProgress(100);
        finalTimeout = setTimeout(() => {
          setShowStartup(false);
        }, 500);
        return;
      }

      const step = hackingSteps[currentStep];
      setHackingText(step.text);

      const stepIncrement = 100 / hackingSteps.length;
      progressInterval = setInterval(() => {
        currentProgress += 2;
        setHackingProgress(
          Math.min(currentProgress, (currentStep + 1) * stepIncrement)
        );

        if (currentProgress >= (currentStep + 1) * stepIncrement) {
          if (progressInterval) clearInterval(progressInterval);
          currentStep++;
          stepTimeout = setTimeout(updateProgress, 200);
        }
      }, step.duration / (stepIncrement / 2));
    };

    const startTimeout = setTimeout(updateProgress, 500);

    return () => {
      clearTimeout(startTimeout);
      if (progressInterval) clearInterval(progressInterval);
      if (stepTimeout) clearTimeout(stepTimeout);
      if (finalTimeout) clearTimeout(finalTimeout);
    };
  }, [showStartup, skipCutscenes]);

  // Global keyboard navigation
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted) return;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedRow((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedRow((prev) => Math.min(7, prev + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const api = apiRefs.current[focusedRow];
        if (api) api.scrollPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const api = apiRefs.current[focusedRow];
        if (api) api.scrollNext();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [gameStarted, focusedRow]);

  const handleRowClick = (rowIndex: number) => {
    if (gameStarted) {
      setFocusedRow(rowIndex);
    }
  };

  const handleSubmit = useCallback(() => {
    if (!gameStarted) return;

    const incorrectRows: number[] = [];
    for (let rowIdx = 0; rowIdx < 8; rowIdx++) {
      const currentPosition = selectedIndexes[rowIdx];
      const correctPosition = rowIdx;

      if (currentPosition !== correctPosition) {
        incorrectRows.push(rowIdx + 1);
      }
    }
    const allCorrect = incorrectRows.length === 0;

    // Start scanning animation
    setScanResult(allCorrect);
    setIsScanning(true);
  }, [gameStarted, selectedIndexes]);

  const handleScanComplete = (isCorrect: boolean) => {
    setIsScanning(false);

    if (isCorrect) {
      // Game completed successfully! Calculate time and submit to leaderboard
      if (gameStartTime) {
        const gameTime = Date.now() - gameStartTime;
        const comparison = submitLeaderboardTime(
          user.username,
          gameTime,
          "cayo",
          user.isGuest
        );
        setTimeComparison(comparison);
      }

      // Reset game
      setGameStarted(false);
      setGameStartTime(null);
    } else {
      // Incorrect - restart the entire game
      setGameStarted(false);
      setGameStartTime(null);
      setResultMessage(null);
      resetOracle();

      // Reset initialization state for carousels to allow them to be re-scrambled
      initializedRef.current.fill(false);

      // Generate new random positions for restart
      const newRandomPositions = Array.from({ length: 8 }, () =>
        Math.floor(Math.random() * 8)
      );
      setSelectedIndexes(newRandomPositions);
      setInitialIndexes(newRandomPositions);
    }
  };

  // Enter key support for submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Enter key for submit
      if (e.key === "Enter" && gameStarted && !isScanning) {
        e.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStarted, isScanning, handleSubmit]);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen w-full p-2 sm:p-4 gap-4 overflow-auto">
      {/* Matrix Rain Background */}
      <ParticleSystem
        width={dimensions.width}
        height={dimensions.height}
        particleCount={25}
        spawnRate={0.1}
        enabled={true}
        mode="matrix"
        className="absolute inset-0 opacity-30 pointer-events-none"
      />
      {/* Game status indicators */}
      {gameStarted && (
        <div className="flex gap-4 mb-2 font-mono">
          <div className="bg-blue-900/30 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-md text-lg font-medium shadow-lg shadow-blue-500/20">
            [BREACH] ACTIVE
          </div>
          {oracleActive && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-2 rounded-md text-lg font-medium shadow-lg shadow-red-500/20 animate-pulse">
              [EXPLOIT] RUNNING
            </div>
          )}
        </div>
      )}

      <div
        className="border-2 border-green-500/30 w-full max-w-[1280px] relative bg-black/50 shadow-2xl shadow-green-500/20 mx-auto"
        style={{ 
          width: containerWidth, 
          height: containerHeight,
          minHeight: '600px'
        }}
      >
        <StartupOverlay visible={showStartup} text={hackingText} progress={hackingProgress} />
        {!showStartup && !gameStarted && (
          <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-blue-400 font-mono text-lg animate-pulse">
                [SYSTEM] CAYO PERICO BREACH PROTOCOL
              </div>
              <button
                onClick={startGame}
                className="px-8 py-4 rounded-md bg-blue-900/30 border border-blue-500/50 text-blue-400 font-mono font-medium hover:bg-blue-800/40 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 active:scale-[0.98] transition-all duration-200"
              >
                [INITIALIZE] START BREACH
              </button>
            </div>
          </div>
        )}
        <div className="w-full h-full p-4 overflow-hidden">
          <div className="flex flex-row items-start justify-between gap-4 w-full h-full min-h-0">
            {/* Left column */}
            <div
              className="flex flex-col gap-3 h-full"
              style={{ width: scaled(DIM.leftTop.w) }}
            >
              {/* Connection timeout */}
              <div style={{ width: "100%", height: scaled(DIM.leftTop.h) }}>
                <img
                  src={CONNECTION_TIMEOUT_IMG}
                  alt="Connection Timeout"
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Carousels area */}
              <div
                className="flex flex-col gap-2 overflow-auto pr-2"
                style={{ width: "100%", height: scaled(DIM.leftBottom.h) }}
              >
                {rows.map((_, rowIndex) => (
                  <div
                    key={rowIndex}
                    className={`w-min h-min cursor-pointer transition-all duration-200 ${
                      focusedRow === rowIndex
                        ? "ring-2 ring-blue-400 rounded"
                        : ""
                    }`}
                    onClick={() => handleRowClick(rowIndex)}
                  >
                    <div
                      className="relative overflow-hidden"
                      style={{ width: scaled(DIM.leftTop.w) - 8 }}
                    >
                      <Carousel
                        className="w-full"
                        opts={{
                          align: "center",
                          loop: true,
                          containScroll: "trimSnaps",
                          dragFree: false,
                          skipSnaps: false,
                        }}
                        setApi={(api?: CarouselApi) => {
                          if (!api) return;
                          apiRefs.current[rowIndex] = api;
                          // Guard: initialize this row only once per game start
                          if (initializedRef.current[rowIndex]) return;
                          initializedRef.current[rowIndex] = true;

                          const update = () => {
                            setSelectedIndexes((prev) => {
                              const copy = [...prev];
                              copy[rowIndex] = api.selectedScrollSnap();
                              return copy;
                            });
                          };

                          api.on("select", update);

                          // Scroll to the random starting slide for this row on next frame then initialize selection once
                          const start = initialIndexes[rowIndex] ?? 0;
                          requestAnimationFrame(() => {
                            try {
                              // Use true for an instant scroll to prevent visible scrambling
                              api.scrollTo(start, true);
                            } catch {}
                            requestAnimationFrame(() => update());
                          });
                        }}
                      >
                        <CarouselContent className="ml-0">
                          {(carouselImages[rowIndex] || []).map((src, i) => {
                            return (
                              <CarouselItem
                                key={`${rowIndex}-${i}`}
                                className="basis-full flex-shrink-0"
                              >
                                <div className="flex justify-center w-full">
                                  <img
                                    src={src}
                                    alt="Fingerprint option"
                                    className="h-auto"
                                    style={{
                                      width: Math.max(
                                        360,
                                        scaled(DIM.leftBottom.w * 0.75 - 10)
                                      ),
                                      maxWidth: "600px",
                                    }}
                                  />
                                </div>
                              </CarouselItem>
                            );
                          })}
                        </CarouselContent>
                      </Carousel>
                    </div>
                  </div>
                ))}
                <div className="flex justify-center mt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={!gameStarted}
                    className="px-8 py-3 rounded bg-blue-900/30 border border-blue-500/50 text-blue-400 font-mono hover:bg-blue-800/40 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200"
                  >
                    [EXECUTE] BREACH
                  </button>
                </div>
              </div>
            </div>
            {/* Right column: deciphered above clone target */}
            <div
              className="flex flex-col items-center justify-start gap-4"
              style={{
                width: scaled(DIM.rightTop.w),
                height: scaled(DIM.rightTop.h + DIM.rightBottom.h),
              }}
            >
              <div style={{ width: "100%", height: scaled(DIM.rightTop.h) }}>
                <img
                  src={DECIPHERED_IMG}
                  alt="Deciphered"
                  className="w-full h-full object-contain"
                />
              </div>
              <div style={{ width: "100%", height: scaled(DIM.rightBottom.h) }}>
                <img
                  src={CLONE_TARGET_IMG}
                  alt="Clone Target"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
        {resultMessage && (
          <div className="pointer-events-none absolute inset-x-0 top-2 z-30 flex justify-center">
            <div
              className={`px-6 py-3 rounded-md font-mono font-medium border shadow-lg ${
                resultMessage.startsWith("Correct")
                  ? "bg-green-900/90 border-green-500/50 text-green-400 shadow-green-500/20"
                  : "bg-red-900/90 border-red-500/50 text-red-400 shadow-red-500/20"
              }`}
            >
              {resultMessage.startsWith("Correct") ? "[SUCCESS] " : "[FAILED] "}
              {resultMessage}
            </div>
          </div>
        )}

        {timeComparison && (
          <TimeComparisonDisplay
            comparison={timeComparison}
            onClose={() => setTimeComparison(null)}
          />
        )}

        <ScanningPopup
          isVisible={isScanning}
          onComplete={handleScanComplete}
          isCorrect={scanResult}
          skipAnimation={skipCutscenes}
        />
      </div>
    </div>
  );
}

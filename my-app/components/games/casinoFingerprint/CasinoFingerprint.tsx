
'use client';

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { type User } from '@/lib/auth';
import { submitTime as submitLeaderboardTime } from '@/lib/leaderboard';
import TimeComparisonDisplay from '@/components/ui/TimeComparison';
import ScanningPopup from '@/components/ui/ScanningPopup';
import { useOracle } from '@/hooks/useOracle';
import ParticleSystem from '@/components/effects/ParticleSystem';
// import { AudioManager } from '@/lib/audioSystem';
// import { AnimationManager } from '@/lib/animations';

type Piece = {
  setId: number; // which print set
  index: number; // 1..8 piece number
};

const PRINT_SETS = [
  { dir: 'print1', ext: 'png', correctPieces: [1, 2, 3, 4] },
  { dir: 'print2', ext: 'png', correctPieces: [1, 2, 3, 4] },
  // Add when ready:
  // { dir: 'print3', ext: 'png', correctPieces: [1, 2, 3, 4] },
  // { dir: 'print4', ext: 'png', correctPieces: [1, 2, 3, 4] },
] as const;

// Currently only print1 and print2 have pieces
const AVAILABLE_SET_IDS = [0, 1];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface CasinoFingerprintProps {
  user: User;
}

export default function CasinoFingerprint({ user }: CasinoFingerprintProps) {
  // Responsive scale based on container width
  const [containerWidth, setContainerWidth] = useState(1280);
  const SCALE = containerWidth / 1920;
  const scaled = (n: number) => Math.round(n * SCALE);
  
  // Audio and animation refs (temporarily disabled)
  // const audioManagerRef = useRef<AudioManager | null>(null);
  // const animationManagerRef = useRef<AnimationManager | null>(null);

  useEffect(() => {
    const updateScale = () => {
      const maxWidth = Math.min(window.innerWidth - 32, 1280); // 32px for padding
      setContainerWidth(maxWidth);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Initialize audio and animation systems (temporarily disabled)
  // useEffect(() => {
  //   const initializeSystems = async () => {
  //     try {
  //       // Initialize animation manager (always works)
  //       animationManagerRef.current = AnimationManager.getInstance();
  //       
  //       // Initialize audio manager (temporarily disabled)
  //       // try {
  //       //   audioManagerRef.current = new AudioManager();
  //       //   await audioManagerRef.current.init();
  //       //   
  //       //   // Preload game sounds using Web Audio API
  //       //   await audioManagerRef.current.createWebAudioClip('pieceClick', { volume: 0.4 });
  //       //   await audioManagerRef.current.createWebAudioClip('pieceCorrect', { volume: 0.6 });
  //       //   await audioManagerRef.current.createWebAudioClip('pieceWrong', { volume: 0.5 });
  //       //   await audioManagerRef.current.createWebAudioClip('gameComplete', { volume: 0.7 });
  //       //   await audioManagerRef.current.createWebAudioClip('scanning', { volume: 0.4 });
  //       // } catch (audioError) {
  //       //   console.warn('Audio system not available:', audioError);
  //       // }
  //     } catch (error) {
  //       console.warn('Failed to initialize systems:', error);
  //     }
  //   };

  //   initializeSystems();
  // }, []);

  // Dimensions from dimensions.txt (1920 base)
  const DIMENSIONS = {
    outerBox: { w: 1251, h: 992 },
    timer: { w: 471, h: 101 },
    componentsBox: { w: 471, h: 780 },
    targetBox: { w: 692, h: 683 },
    decipheredSignals: { w: 689, h: 200 },
    statusBar: { w: 1920, h: 56 },
  } as const;

  // Each fingerprint piece is 126x126 at 1920 width; scale to our 1280 width
  const TILE_SIZE = scaled(126); // 84px when SCALE = 2/3
  // Reduce grid gap to 25% of prior spacing so tiles fit comfortably
  // const GRID_GAP = 0; // vertical gap handled by per-tile marginBottom - commented out as unused
  const GRID_COLUMN_GAP = 12; // explicit 12px horizontal gap between columns

  const [isLocked, setIsLocked] = useState(true);
  const [gridPieces, setGridPieces] = useState<Piece[]>([]);
  const [fingerprintOrder, setFingerprintOrder] = useState([0,1,2,3,4,5,6,7]);
  const [selectedSetIds, setSelectedSetIds] = useState<number[]>([]);
  // targetSetId not used in the current right panel rendering, but retained for future logic
  const [targetSetId, setTargetSetId] = useState<number | null>(null);
  const [selectedTileIndexes, setSelectedTileIndexes] = useState<Set<number>>(new Set());
  const [currentRound, setCurrentRound] = useState(0);
  const ROUNDS_TOTAL = 1;
  const MAX_SELECTIONS = 4;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [fallbackTargetSetId, setFallbackTargetSetId] = useState<number | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [timeComparison, setTimeComparison] = useState<{ oldTime: number | null; newTime: number; improvement: number | null; isFirstRecord: boolean } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<boolean>(false);
  const [showStartup, setShowStartup] = useState<boolean>(true);
  const [hackingProgress, setHackingProgress] = useState<number>(0);
  const [hackingText, setHackingText] = useState<string>('INITIALIZING HACK PROTOCOL...');

  // Oracle hook for cheat code functionality
  const { oracleActive, resetOracle } = useOracle({
    gameStarted: !isLocked,
    isScanning,
    onOracleActivated: () => {
      // Auto-select the correct pieces based on the target set
      if (targetSetId !== null) {
        const correctPieces = getCorrectPieces(targetSetId);
        const correctIndices = new Set<number>();
        gridPieces.forEach((piece, index) => {
          if (piece.setId === targetSetId && correctPieces.includes(piece.index as 1 | 2 | 3 | 4)) {
            correctIndices.add(index);
          }
        });
        setSelectedTileIndexes(correctIndices);
      }
    }
  });

  useEffect(() => {
    // Show a random full fingerprint before start
    setFallbackTargetSetId(shuffle(AVAILABLE_SET_IDS)[0]);
  }, []);

  // Startup hacking sequence effect (same flow as numberFinder)
  useEffect(() => {
    if (!showStartup) return;

    const hackingSteps = [
      { text: 'INITIALIZING HACK PROTOCOL...', duration: 800 },
      { text: 'BYPASSING SECURITY FIREWALL...', duration: 1200 },
      { text: 'DECRYPTING DATABASE ACCESS...', duration: 1000 },
      { text: 'INJECTING MALICIOUS PAYLOAD...', duration: 900 },
      { text: 'ESTABLISHING BACKDOOR CONNECTION...', duration: 1100 },
      { text: 'HACK COMPLETE - ACCESS GRANTED', duration: 600 }
    ];

    let currentStep = 0;
    let currentProgress = 0;

    const updateProgress = () => {
      if (currentStep >= hackingSteps.length) {
        setHackingProgress(100);
        setTimeout(() => {
          setShowStartup(false);
        }, 500);
        return;
      }

      const step = hackingSteps[currentStep];
      setHackingText(step.text);

      const stepIncrement = 100 / hackingSteps.length;
      const progressInterval = setInterval(() => {
        currentProgress += 2;
        setHackingProgress(Math.min(currentProgress, (currentStep + 1) * stepIncrement));

        if (currentProgress >= (currentStep + 1) * stepIncrement) {
          clearInterval(progressInterval);
          currentStep++;
          setTimeout(updateProgress, 200);
        }
      }, step.duration / (stepIncrement / 2));
    };

    const startTimeout = setTimeout(updateProgress, 500);

    return () => {
      clearTimeout(startTimeout);
    };
  }, [showStartup]);

  const buildRoundGrid = (target: number) => {
    // Use ONLY the target set's pieces: 1..8
    const pieces = [1,2,3,4,5,6,7,8].map((i) => ({ setId: target, index: i }));
    return shuffle(pieces);
  };

  const startGame = () => {
    // Randomize fingerprint order when starting the game
    const shuffledOrder = shuffle(fingerprintOrder);
    setFingerprintOrder(shuffledOrder);
    
    const targetSet = shuffle(AVAILABLE_SET_IDS)[0];
    const mixed = buildRoundGrid(targetSet);
    setGridPieces(mixed);
    setSelectedSetIds([targetSet]);
    setTargetSetId(targetSet);
    setSelectedTileIndexes(new Set());
    setCurrentRound(0);
    setResultMessage(null);
    setIsSubmitting(false);
    setIsLocked(false);
    setGameStartTime(Date.now()); // Start timing
    setTimeComparison(null);
    resetOracle();
  };

  // Get the correct pieces for the current target set
  const getCorrectPieces = (setId: number | null) => {
    if (setId === null) return [1, 2, 3, 4]; // fallback
    return PRINT_SETS[setId]?.correctPieces || [1, 2, 3, 4];
  };

  // Create a stable validation function
  const validateSelection = useCallback((tileIndexes: Set<number>, pieces: Piece[], target: number | null) => {
    if (target === null || target === undefined || tileIndexes.size !== 4) {
      console.log('Validation failed: target or size check', { target, size: tileIndexes.size });
      return false;
    }
    
    const required = new Set(getCorrectPieces(target));
    const selectedPieceIndices = new Set<number>();
    
    console.log('Validation debug:', { 
      target, 
      required: Array.from(required), 
      selectedTileIndexes: Array.from(tileIndexes),
      pieces: pieces.map((p, i) => ({ index: i, setId: p.setId, pieceIndex: p.index }))
    });
    
    // Check that all selected pieces belong to the target set and are from the correct pieces
    const allCorrect = Array.from(tileIndexes).every((tileIdx) => {
      const piece = pieces[tileIdx];
      console.log('Checking piece:', { tileIdx, piece, target, requiredHasPiece: required.has(piece?.index) });
      
      if (!piece || piece.setId !== target || !required.has(piece.index)) {
        console.log('Piece failed validation:', { piece, target, required: Array.from(required) });
        return false;
      }
      selectedPieceIndices.add(piece.index);
      return true;
    });
    
    // Ensure we have exactly the required pieces (no duplicates, no missing)
    const hasExactPieces = selectedPieceIndices.size === 4 && 
      [...required].every(index => selectedPieceIndices.has(index));
    
    console.log('Validation result:', { 
      allCorrect, 
      hasExactPieces, 
      selectedPieceIndices: Array.from(selectedPieceIndices),
      final: allCorrect && hasExactPieces 
    });
    
    return allCorrect && hasExactPieces;
  }, []); // Remove targetSetId dependency as it's not actually used in the function

  const handleFingerprintClick = (index: number) => {
    if (isLocked || isSubmitting) return;

    // Play click sound (non-blocking) - temporarily disabled
    // if (audioManagerRef.current) {
    //   audioManagerRef.current.play('pieceClick').catch(() => {});
    // }

    // Add click animation - temporarily disabled
    // if (animationManagerRef.current) {
    //   const element = document.querySelector(`[data-piece-index="${index}"]`);
    //   if (element) {
    //     animationManagerRef.current.createBounceEffect(element as HTMLElement, 20, 200);
    //   }
    // }
    
    const next = new Set(selectedTileIndexes);
    if (next.has(index)) {
      next.delete(index);
    } else {
      // Enforce a maximum of 4 selected fingerprints
      if (next.size >= MAX_SELECTIONS) {
        return;
      }
      next.add(index);
    }
    setSelectedTileIndexes(next);
  };

  const submitSelection = useCallback(() => {
    if (isLocked || isSubmitting) return;
    if (selectedTileIndexes.size !== MAX_SELECTIONS) {
      setResultMessage('Select exactly 4 fingerprints.');
      // Auto-clear the message after 3 seconds
      setTimeout(() => setResultMessage(null), 3000);
      return;
    }
    
    // Play scanning sound (non-blocking) - temporarily disabled
    // if (audioManagerRef.current) {
    //   audioManagerRef.current.play('scanning').catch(() => {});
    // }

    // Add scanning animation - temporarily disabled
    // if (animationManagerRef.current) {
    //   const submitButton = document.querySelector('[data-submit-button]');
    //   if (submitButton) {
    //     animationManagerRef.current.createBounceEffect(submitButton as HTMLElement, 20, 500);
    //   }
    // }
    
    setIsSubmitting(true);
    
    // Validate the selection
    const isCorrectSelection = validateSelection(selectedTileIndexes, gridPieces, targetSetId);

    // Since there's only one round, always start scanning animation
    setScanResult(isCorrectSelection);
    setIsScanning(true);
  }, [isLocked, isSubmitting, selectedTileIndexes, validateSelection, gridPieces, targetSetId]); // Remove currentRound as it's not used in the function

  const handleScanComplete = (isCorrect: boolean) => {
    setIsScanning(false);
    
    if (isCorrect) {
      // Play success sound (non-blocking) - temporarily disabled
      // if (audioManagerRef.current) {
      //   audioManagerRef.current.play('gameComplete').catch(() => {});
      // }

      // Add success animation - temporarily disabled
      // if (animationManagerRef.current) {
      //   animationManagerRef.current.createGlitchEffect(document.body, 0.1);
      // }
      
      // Game completed successfully! Calculate time and submit to leaderboard
      if (gameStartTime) {
        const gameTime = Date.now() - gameStartTime;
        const comparison = submitLeaderboardTime(user.username, gameTime, 'casino', user.isGuest);
        setTimeComparison(comparison);
      }
      
      // Reset game
      setIsLocked(true);
      setGridPieces([]);
      setTargetSetId(null);
      setSelectedTileIndexes(new Set());
      setIsSubmitting(false);
      setCurrentRound(0);
      setGameStartTime(null);
      setResultMessage(null);
    } else {
      // Play error sound (non-blocking) - temporarily disabled
      // if (audioManagerRef.current) {
      //   audioManagerRef.current.play('pieceWrong').catch(() => {});
      // }

      // Add error animation - temporarily disabled
      // if (animationManagerRef.current) {
      //   animationManagerRef.current.createWobbleEffect(document.body, 5, 500);
      // }
      
      // Incorrect - restart the entire game
      setIsLocked(true);
      setGridPieces([]);
      setTargetSetId(null);
      setSelectedTileIndexes(new Set());
      setIsSubmitting(false);
      setCurrentRound(0);
      setGameStartTime(null);
      setResultMessage(null);
      resetOracle();
    }
  };

  // Removed round progression logic since we only have 1 round

  // Fallback content (before start) shows print1 tiles in a shuffled order
  const fallbackPieces: Piece[] = useMemo(
    () => fingerprintOrder.map((n) => ({ setId: 0, index: n + 1 })),
    [fingerprintOrder]
  );

  const piecesToRender = gridPieces.length ? gridPieces : fallbackPieces;

  const tileSrc = (p: Piece) => {
    const set = PRINT_SETS[p.setId];
    return `/casinoFingerprints/${set.dir}/casinofp${p.index}.${set.ext}`;
  };

  const activeTargetSetId = targetSetId ?? fallbackTargetSetId;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        submitSelection();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [submitSelection]);

  return (
    <div className='relative flex flex-col items-center justify-center h-full p-2 sm:p-4 gap-4 overflow-hidden'>
      {/* Matrix Rain Background */}
      <ParticleSystem
        width={typeof window !== 'undefined' ? window.innerWidth : 800}
        height={typeof window !== 'undefined' ? window.innerHeight : 600}
        particleCount={25}
        spawnRate={0.1}
        enabled={true}
        mode="matrix"
        className="absolute inset-0 opacity-30 pointer-events-none"
      />
      {/* Game status indicators - moved outside */}
      {!isLocked && (
        <div className="flex gap-4 mb-2 font-mono">
          <div className="bg-green-900/30 border border-green-500/50 text-green-400 px-4 py-2 rounded-md text-lg font-medium shadow-lg shadow-green-500/20">
            [SESSION] {currentRound + 1} / {ROUNDS_TOTAL}
          </div>
          <div className={cn(
            "px-4 py-2 rounded-md text-lg font-medium border shadow-lg",
            selectedTileIndexes.size === MAX_SELECTIONS 
              ? "bg-green-900/30 border-green-500/50 text-green-400 shadow-green-500/20" 
              : "bg-gray-900/30 border-gray-500/50 text-gray-400 shadow-gray-500/20"
          )}>
            [TARGET] {selectedTileIndexes.size} / {MAX_SELECTIONS}
          </div>
          {/* Oracle active indicator */}
          {oracleActive && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-2 rounded-md text-lg font-medium shadow-lg shadow-red-500/20 animate-pulse">
              [EXPLOIT] ACTIVE
            </div>
          )}
        </div>
      )}

      <div className='relative bg-black text-white w-full max-w-[1280px] mx-auto border-2 border-green-500/30 shadow-2xl shadow-green-500/20 rounded-lg overflow-hidden' style={{ width: containerWidth, height: containerWidth * 9/16 }}>
        {showStartup && (
          <div className="absolute inset-0 z-30 bg-black/95 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="mb-8">
                <div className="text-green-400 font-mono text-2xl mb-2 animate-pulse">[SYSTEM] BREACH IN PROGRESS</div>
                <div className="text-green-300 font-mono text-sm mb-6">{hackingText}</div>
                <div className="w-full bg-gray-800 rounded-full h-3 mb-4 border border-green-500/50">
                  <div className="bg-gradient-to-r from-green-600 to-green-400 h-3 rounded-full transition-all duration-300 relative overflow-hidden" style={{ width: `${hackingProgress}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                </div>
                <div className="text-green-400 font-mono text-lg">{Math.round(hackingProgress)}%</div>
              </div>
              <div className="text-green-500/50 font-mono text-xs">▄▄▄▄▄ TERMINAL ACCESS ▄▄▄▄▄</div>
            </div>
          </div>
        )}
        <img
          className='ml-auto'
          src={'/casinoFingerprints/status_bar.png'}
          alt='status bar'
          style={{ width: '100%', height: scaled(DIMENSIONS.statusBar.h) }}
        />
        <div className='absolute w-fit h-fit flex flex-row flex-nowrap bg-black/80 border border-green-500/30 rounded px-3 py-1 font-mono text-green-400 text-sm'>
          <span>[CTRL]</span>
          <img className='ml-1 mr-1 w-6 h-6' src={'/casinoFingerprints/tab_button.png'} alt='tab button' />
          <span>EXECUTE SCAN PROTOCOL</span>
        </div>
        {/* Constrain the inner game area to the scaled outer box width/height */}
        <div className="mx-auto" style={{ width: scaled(DIMENSIONS.outerBox.w), height: scaled(DIMENSIONS.outerBox.h) }}>
          <div className="flex flex-row items-start justify-between h-full">
            {/* Left column: timer + components */}
            <div className='flex flex-col items-center gap-2' style={{ width: scaled(DIMENSIONS.componentsBox.w) }}>
              <img className='w-full' src={'/casinoFingerprints/timer.png'} alt='timer' style={{ height: scaled(DIMENSIONS.timer.h) }} />
            <div className="relative w-full" style={{ height: scaled(DIMENSIONS.componentsBox.h) }}>
              <img
                src={'/casinoFingerprints/fp_temp.png'}
                alt="Fingerprint Component Background"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0" style={{ padding: scaled(16) }}>
                <div
                  className="grid w-full h-full bg-transparent content-start justify-center"
                  style={{ gridTemplateColumns: `repeat(2, ${TILE_SIZE}px)`, columnGap: GRID_COLUMN_GAP, rowGap: 0, marginTop: 30 }}
                >
                  {piecesToRender.map((piece, index) => (
                    <div
                      key={`${piece.setId}-${piece.index}-${index}`}
                      className={cn(
                        'group relative cursor-pointer overflow-visible',
                        selectedTileIndexes.has(index) ? 'bg-white' : 'bg-neutral-800'
                      )}
                      style={{ width: TILE_SIZE, height: TILE_SIZE, marginBottom: 12 }}
                      onClick={() => handleFingerprintClick(index)}
                      data-piece-index={index}
                    >
                      <img
                        src={tileSrc(piece)}
                        alt={`Fingerprint ${piece.index} (set ${piece.setId + 1})`}
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
                        <img
                          src={'/casinoFingerprints/fp_outline_transparent.png'}
                          alt="Fingerprint Hover Outline"
                          className="w-full h-full object-contain origin-center scale-[1.2] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>

            {/* Right column: target box and deciphered signals box stacked */}
            <div className='flex flex-col items-center justify-start gap-4' style={{ width: scaled(DIMENSIONS.targetBox.w) }}>
              <div className='relative' style={{ width: '461px', height: '455px' }}>
                <img
                  src={'/casinoFingerprints/clone_target.png'}
                  alt='Target Box'
                  className='w-full h-[full] object-contain '
                />
                {activeTargetSetId !== null && (
                  <img
                    src={`/casinoFingerprints/${PRINT_SETS[activeTargetSetId].dir}/fpFull.png`}
                    alt='Target Fingerprint'
                    className='absolute inset-0 w-[88.2%] h-[80%] object-contain pointer-events-none mt-10.25'
                  />)
                }
              </div>
              <img
                src={'/casinoFingerprints/deciphered_signals_box.png'}
                alt='Deciphered Signals Box'
                style={{ width: '100%', height: 'auto' }}
              />
            </div>
          </div>
        </div>

        {!showStartup && isLocked && (
          <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-green-400 font-mono text-lg animate-pulse">
                [SYSTEM] AWAITING AUTHORIZATION
              </div>
              <button
                onClick={startGame}
                className="px-8 py-4 rounded-md bg-green-900/30 border border-green-500/50 text-green-400 font-mono font-medium hover:bg-green-800/40 hover:border-green-400 hover:shadow-lg hover:shadow-green-500/20 active:scale-[0.98] transition-all duration-200"
              >
                [INITIALIZE] START EXPLOIT
              </button>
            </div>
          </div>
        )}
      </div>
      {resultMessage && (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-30 flex justify-center">
          <div className={cn(
            'px-6 py-3 rounded-md font-mono font-medium border shadow-lg',
            resultMessage.includes('Correct') || resultMessage.includes('Success') 
              ? 'bg-green-900/90 border-green-500/50 text-green-400 shadow-green-500/20' 
              : 'bg-red-900/90 border-red-500/50 text-red-400 shadow-red-500/20'
          )}>
            {resultMessage.includes('Select exactly') 
              ? '[ERROR] INVALID TARGET COUNT - SELECT 4 NODES' 
              : resultMessage.includes('Incorrect') 
              ? '[FAILED] EXPLOIT DETECTED - SYSTEM RESET INITIATED'
              : resultMessage
            }
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
      />
    </div>
  );
}
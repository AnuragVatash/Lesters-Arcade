
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type Piece = {
  setId: number; // which print set
  index: number; // 1..8 piece number
};

const PRINT_SETS = [
  { dir: 'print1', ext: 'png' },
  { dir: 'print2', ext: 'png' },
  // Add when ready:
  // { dir: 'print3', ext: 'png' },
  // { dir: 'print4', ext: 'png' },
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

export default function CasinoFingerprint() {
  // Base scale from 1920x1080 to our 1280x720 canvas
  const SCALE = 1280 / 1920;
  const scaled = (n: number) => Math.round(n * SCALE);

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
  const GRID_GAP = 0; // vertical gap handled by per-tile marginBottom
  const GRID_COLUMN_GAP = 12; // explicit 12px horizontal gap between columns

  const [isLocked, setIsLocked] = useState(true);
  const [gridPieces, setGridPieces] = useState<Piece[]>([]);
  const [fingerprintOrder, setFingerprintOrder] = useState([0,1,2,3,4,5,6,7]);
  const [selectedSetIds, setSelectedSetIds] = useState<number[]>([]);
  // targetSetId not used in the current right panel rendering, but retained for future logic
  const [targetSetId, setTargetSetId] = useState<number | null>(null);
  const [selectedTileIndexes, setSelectedTileIndexes] = useState<Set<number>>(new Set());
  const [currentRound, setCurrentRound] = useState(0);
  const ROUNDS_TOTAL = 2;
  const MAX_SELECTIONS = 4;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  useEffect(() => {
    const shuffledOrder = shuffle(fingerprintOrder);
    setFingerprintOrder(shuffledOrder);
  }, []);

  const buildRoundGrid = (target: number) => {
    // Use ONLY the target set's pieces: 1..8
    const pieces = [1,2,3,4,5,6,7,8].map((i) => ({ setId: target, index: i }));
    return shuffle(pieces);
  };

  const startGame = () => {
    const [a, b] = shuffle(AVAILABLE_SET_IDS).slice(0, 2);
    const mixed = buildRoundGrid(a);
    setGridPieces(mixed);
    setSelectedSetIds([a, b]);
    setTargetSetId(a);
    setSelectedTileIndexes(new Set());
    setCurrentRound(0);
    setResultMessage(null);
    setIsSubmitting(false);
    setIsLocked(false);
  };

  const handleFingerprintClick = (index: number) => {
    if (isLocked || isSubmitting) return;
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

  const submitSelection = () => {
    if (isLocked || isSubmitting) return;
    if (selectedTileIndexes.size !== MAX_SELECTIONS) {
      setResultMessage('Select exactly 4 fingerprints.');
      return;
    }
    setIsSubmitting(true);
    // Evaluate: all selected must belong to targetSetId and be indices 1..4
    const required = new Set([1,2,3,4]);
    const allCorrect = Array.from(selectedTileIndexes).every((tileIdx) => {
      const piece = gridPieces[tileIdx];
      return piece && piece.setId === targetSetId && required.has(piece.index);
    });

    setResultMessage(allCorrect ? 'Correct!' : 'Incorrect');

    // Advance after a short delay
    setTimeout(() => {
      const [a, b] = selectedSetIds;
      if (currentRound + 1 >= ROUNDS_TOTAL - 0) {
        // If we were on the last round (1-based total of 2 rounds -> indices 0 and 1), reset
        if (currentRound >= ROUNDS_TOTAL - 1) {
          setIsLocked(true);
          setGridPieces([]);
          setTargetSetId(null);
          setSelectedTileIndexes(new Set());
          setResultMessage(null);
          setIsSubmitting(false);
          setCurrentRound(0);
          return;
        }
      }

      // Move to round 2 with the other set as target
      const nextRound = currentRound + 1;
      const nextTarget = targetSetId === a ? b : a;
      const nextGrid = buildRoundGrid(nextTarget!);
      setGridPieces(nextGrid);
      setTargetSetId(nextTarget!);
      setSelectedTileIndexes(new Set());
      setCurrentRound(nextRound);
      setResultMessage(null);
      setIsSubmitting(false);
    }, 1200);
  };

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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        submitSelection();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [submitSelection, isLocked, isSubmitting, selectedTileIndexes, gridPieces, targetSetId, currentRound, selectedSetIds]);

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='relative bg-black text-white w-[1280px] h-[720px] mx-auto'>
        <img
          className='ml-auto'
          src={'/casinoFingerprints/status_bar.png'}
          alt='status bar'
          style={{ width: '100%', height: scaled(DIMENSIONS.statusBar.h) }}
        />
        <div className='absolute  w-fit h-fit flex flex-row flex-nowrap bg-black/50'>
          <h3>Press</h3>
          <img className='ml-1 mr-1 w-6 h-6' src={'/casinoFingerprints/tab_button.png'} alt='tab button' />
          <h3>to check if the match is correct</h3>
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
                {targetSetId !== null && (
                  <img
                    src={`/casinoFingerprints/${PRINT_SETS[targetSetId].dir}/fpFull.png`}
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

        {isLocked && (
          <div className="absolute inset-0 z-20 bg-gray-900/70 backdrop-blur-[1px] flex items-center justify-center">
            <button
              onClick={startGame}
              className="px-6 py-3 rounded-md bg-white text-black font-medium hover:bg-neutral-100 active:scale-[0.99] transition"
            >
              Start
            </button>
          </div>
        )}
      </div>
      {resultMessage && (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-30 flex justify-center">
          <div className={cn(
            'px-4 py-2 rounded-md text-sm font-medium',
            resultMessage === 'Correct!' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
          )}>
            {resultMessage}
          </div>
        </div>
      )}
    </div>
  );
}
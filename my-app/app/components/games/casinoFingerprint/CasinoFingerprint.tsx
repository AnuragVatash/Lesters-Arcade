
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
  const [isLocked, setIsLocked] = useState(true);
  const [gridPieces, setGridPieces] = useState<Piece[]>([]);
  const [fingerprintOrder, setFingerprintOrder] = useState([0,1,2,3,4,5,6,7]);
  const [selectedSetIds, setSelectedSetIds] = useState<number[]>([]);
  const [targetSetId, setTargetSetId] = useState<number | null>(null);
  const [selectedTileIndexes, setSelectedTileIndexes] = useState<Set<number>>(new Set());

  useEffect(() => {
    const shuffledOrder = shuffle(fingerprintOrder);
    setFingerprintOrder(shuffledOrder);
  }, []);

  const startGame = () => {
    // pick 2 distinct print sets
    const [a, b] = shuffle(AVAILABLE_SET_IDS).slice(0, 2);
    // pick 4 random unique pieces from each (1..8)
    const idxs = shuffle([1,2,3,4,5,6,7,8]);
    const aPieces = idxs.slice(0, 4).map((i) => ({ setId: a, index: i }));
    const bPieces = shuffle([1,2,3,4,5,6,7,8]).slice(0, 4).map((i) => ({ setId: b, index: i }));
    // mix and shuffle them
    const mixed = shuffle([...aPieces, ...bPieces]);
    setGridPieces(mixed);
    setSelectedSetIds([a, b]);
    setTargetSetId(a);
    setIsLocked(false);
  };

  const handleFingerprintClick = (index: number) => {
    if (isLocked) return;
    const next = new Set(selectedTileIndexes);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedTileIndexes(next);
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

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='relative bg-black text-white w-[1280px] h-[720px] mx-auto'>
        <img className='ml-auto' src={'/casinoFingerprints/status_bar.png'} alt='status bar' />
        <div className="flex flex-row">
          <div className='w-1/2 flex items-center justify-center gap-8 flex-col'>
            <img className='w-[90%]' src={'/casinoFingerprints/timer.png'} alt='timer' />

            <div className="relative w-full px-8">
              <img src={'/casinoFingerprints/fp_temp.png'} alt="Fingerprint Component Background" className="w-full" />
              <div className="ml-[36px] absolute top-0 left-0 w-[89%] h-[80%] p-12">
                <div className="grid grid-cols-2 gap-3 w-full h-[102.5%] mt-8 ml-7 bg-transparent">
                  {piecesToRender.map((piece, index) => (
                    <div
                      key={`${piece.setId}-${piece.index}-${index}`}
                      className={cn(
                        'group relative cursor-pointer w-[160px] h-[160px] overflow-visible',
                        selectedTileIndexes.has(index) ? 'bg-white' : 'bg-neutral-800'
                      )}
                      onClick={() => handleFingerprintClick(index)}
                    >
                      <img
                        src={tileSrc(piece)}
                        alt={`Fingerprint ${piece.index} (set ${piece.setId + 1})`}
                        className="w-full h-full object-contain"
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

          <div className='w-1/2 flex items-center justify-center gap-2'>
            <div className="relative w-[90%]">
              <img src={'/casinoFingerprints/fp_temp.png'} alt='Target Background' className='w-full' />
              {targetSetId !== null && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <img
                    src={`/casinoFingerprints/${PRINT_SETS[targetSetId].dir}/fpFull.${PRINT_SETS[targetSetId].ext}`}
                    alt='Target Fingerprint'
                    className='w-[70%] h-auto object-contain'
                  />
                </div>
              )}
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
    </div>
  );
}
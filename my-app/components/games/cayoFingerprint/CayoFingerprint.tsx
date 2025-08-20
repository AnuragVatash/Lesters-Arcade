'use client';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
	type CarouselApi,
} from "@/components/ui/carousel"

import { useEffect, useRef, useState } from 'react';
import { submitTime as submitLeaderboardTime, type User } from '@/lib/leaderboard';
import TimeComparisonDisplay from '@/components/ui/TimeComparison';
import ScanningPopup from '@/components/ui/ScanningPopup';
import { useOracle } from '@/hooks/useOracle';

interface CayoFingerprintProps {
	user: User;
}

export default function CayoFingerprint({ user }: CayoFingerprintProps) {
	// Print set configuration
	const PRINT_SETS = [
		{ dir: 'print1', correctPieces: [1, 2, 3, 4] }, // First 4 pieces are correct for print1
		// { dir: 'print2', correctPieces: [5, 6, 7, 8] }, // Last 4 pieces would be correct for print2 (when available)
	] as const;

	const AVAILABLE_PRINT_SETS = [0]; // Only print1 available for now, add 1 when print2 is ready

	// Current print set state
	const [currentPrintSet, setCurrentPrintSet] = useState<number>(0);
	
	const rows = Array.from({ length: 8 });

	// Dynamic asset paths based on current print set
	const getAssetPath = (filename: string) => `/cayoFingerprints/${PRINT_SETS[currentPrintSet].dir}/${filename}`;
	const baseImages = Array.from({ length: 8 }, (_, i) => getAssetPath(`fp${i + 1}.png`));
	const CONNECTION_TIMEOUT_IMG = getAssetPath('connection_timeout.png');
	const CLONE_TARGET_IMG = getAssetPath('clone_target.png');
	const DECIPHERED_IMG = getAssetPath('decyphered.png');

	// Responsive scale system
	const [containerWidth, setContainerWidth] = useState(1280);
	const BASE = { w: 1200, h: 874 } as const;
	const aspectRatio = BASE.w / BASE.h;
	const containerHeight = containerWidth / aspectRatio;
	const SCALE = containerHeight / BASE.h;
	const scaled = (n: number) => Math.round(n * SCALE);

	useEffect(() => {
		const updateScale = () => {
			const maxWidth = Math.min(window.innerWidth - 32, 1280); // 32px for padding
			setContainerWidth(maxWidth);
		};

		updateScale();
		window.addEventListener('resize', updateScale);
		return () => window.removeEventListener('resize', updateScale);
	}, []);

	// Panel dimensions at base resolution
	const DIM = {
		leftTop: { w: 438, h: 134 }, // Connection Timeout
		rightTop: { w: 718, h: 134 }, // Deciphered Signals
		leftBottom: { w: 438, h: 697 }, // Components (carousels)
		rightBottom: { w: 718, h: 697 }, // Clone Target
	} as const;

	// Generate random order for each row, ensuring no duplicates within each row
	const [randomRowImages, setRandomRowImages] = useState<string[][]>([]);

	// Remove the automatic generation on component load

	const [selectedIndexes, setSelectedIndexes] = useState<number[]>(Array(8).fill(0));
	const [initialIndexes, setInitialIndexes] = useState<number[]>(Array(8).fill(0));
	const [resultMessage, setResultMessage] = useState<string | null>(null);
	const initializedRef = useRef<boolean[]>(Array(8).fill(false));
	const apiRefs = useRef<(CarouselApi | null)[]>(Array(8).fill(null));
	const [gameStartTime, setGameStartTime] = useState<number | null>(null);
	const [timeComparison, setTimeComparison] = useState<any>(null);
	const [gameStarted, setGameStarted] = useState(false);
	const [focusedRow, setFocusedRow] = useState<number>(0);
	const [isScanning, setIsScanning] = useState(false);
	const [scanResult, setScanResult] = useState<boolean>(false);

	// Oracle hook for cheat code functionality
	const { oracleActive, resetOracle } = useOracle({
		gameStarted,
		isScanning,
		onOracleActivated: () => {
			// Auto-navigate all carousels to correct answers based on current print set
			setTimeout(() => {
				const correctPieces = PRINT_SETS[currentPrintSet].correctPieces;
				
				for (let rowIdx = 0; rowIdx < 8; rowIdx++) {
					const api = apiRefs.current[rowIdx];
					const imgs = randomRowImages[rowIdx] || [];
					const expected = `fp${rowIdx + 1}.png`;
					const shouldBeSelected = correctPieces.includes(rowIdx + 1);
					
					if (shouldBeSelected) {
						// Find the index of the correct answer and navigate to it
						const correctIndex = imgs.findIndex(src => 
							typeof src === 'string' && src.endsWith(expected)
						);
						
						if (api && correctIndex !== -1) {
							api.scrollTo(correctIndex);
						}
					} else {
						// Find any index that is NOT the expected answer and navigate to it
						const wrongIndex = imgs.findIndex(src => 
							typeof src === 'string' && !src.endsWith(expected)
						);
						
						if (api && wrongIndex !== -1) {
							api.scrollTo(wrongIndex);
						}
					}
				}
			}, 100);
		}
	});

	function shuffle<T>(arr: T[]): T[] {
		const a = [...arr];
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

	// Remove automatic initialization - this will happen when Start is clicked

	const startGame = () => {
		// Randomly select a print set
		const selectedPrintSet = shuffle(AVAILABLE_PRINT_SETS)[0];
		setCurrentPrintSet(selectedPrintSet);
		
		// Generate random images when starting the game
		const generateRandomImages = () => {
			// Randomly select 3 rows out of 8 to start with correct answer visible
			const easyRows = shuffle(Array.from({ length: 8 }, (_, i) => i)).slice(0, 3);
			
			// Get the updated base images for the selected print set
			const printSetBaseImages = Array.from({ length: 8 }, (_, i) => 
				`/cayoFingerprints/${PRINT_SETS[selectedPrintSet].dir}/fp${i + 1}.png`
			);
			
			return Array.from({ length: 8 }, (_, rowIndex) => {
				const correctAnswer = `fp${rowIndex + 1}.png`;
				// Get the correct answer image
				const correctImage = printSetBaseImages.find(img => img.endsWith(correctAnswer));
				// Get other images in order (not randomized)
				const otherImages = printSetBaseImages.filter(img => !img.endsWith(correctAnswer));
				
				// Create array with correct answer and other images in order
				const imagesForRow = [correctImage, ...otherImages];
				
				// If this is one of the "easy" rows, put correct answer first
				// Otherwise, shuffle so correct answer isn't immediately visible
				if (easyRows.includes(rowIndex)) {
					return imagesForRow; // Correct answer is first
				} else {
					return shuffle(imagesForRow); // Correct answer is somewhere random
				}
			});
		};
		
		// Randomize starting positions for each carousel
		const starts = shuffle(Array.from({ length: 8 }, (_, i) => i));
		setInitialIndexes(starts);
		setSelectedIndexes(starts);
		
		// Generate and set the random images
		setRandomRowImages(generateRandomImages());
		
		setGameStarted(true);
		setGameStartTime(Date.now());
		setTimeComparison(null);
		setFocusedRow(0);
		resetOracle();
	};

	// Global keyboard navigation
	useEffect(() => {
		const handleGlobalKeyDown = (e: KeyboardEvent) => {
			if (!gameStarted) return;
			
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				setFocusedRow(prev => Math.max(0, prev - 1));
			} else if (e.key === 'ArrowDown') {
				e.preventDefault();
				setFocusedRow(prev => Math.min(7, prev + 1));
			} else if (e.key === 'ArrowLeft') {
				e.preventDefault();
				const api = apiRefs.current[focusedRow];
				if (api) api.scrollPrev();
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				const api = apiRefs.current[focusedRow];
				if (api) api.scrollNext();
			}
		};

		window.addEventListener('keydown', handleGlobalKeyDown);
		return () => window.removeEventListener('keydown', handleGlobalKeyDown);
	}, [gameStarted, focusedRow]);

	const handleRowClick = (rowIndex: number) => {
		if (gameStarted) {
			setFocusedRow(rowIndex);
		}
	};

	const handleSubmit = () => {
		if (!gameStarted) return;
		
		const incorrectRows: number[] = [];
		const correctPieces = PRINT_SETS[currentPrintSet].correctPieces;
		
		for (let rowIdx = 0; rowIdx < 8; rowIdx++) {
			const api = apiRefs.current[rowIdx];
			const currentIdx = api ? api.selectedScrollSnap() : (selectedIndexes[rowIdx] ?? 0);
			const imgs = randomRowImages[rowIdx] || [];
			const expected = `fp${rowIdx + 1}.png`;
			const currentSrc = imgs[currentIdx];
			
			// Check if this row's piece (rowIdx + 1) should be selected based on the current print set
			const shouldBeSelected = correctPieces.includes(rowIdx + 1);
			const isSelected = typeof currentSrc === 'string' && currentSrc.endsWith(expected);
			
			// Row is correct if: (should be selected AND is selected) OR (should NOT be selected AND is NOT selected)
			const ok = shouldBeSelected ? isSelected : !isSelected;

			if (!ok) incorrectRows.push(rowIdx + 1);
		}
		const allCorrect = incorrectRows.length === 0;
		
		// Start scanning animation
		setScanResult(allCorrect);
		setIsScanning(true);
	};

	const handleScanComplete = (isCorrect: boolean) => {
		setIsScanning(false);
		
		if (isCorrect) {
			// Game completed successfully! Calculate time and submit to leaderboard
			if (gameStartTime) {
				const gameTime = Date.now() - gameStartTime;
				const comparison = submitLeaderboardTime(user.username, gameTime, 'cayo', user.isGuest);
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
			// Reset all carousels to initial positions
			setSelectedIndexes(Array(8).fill(0));
			const starts = shuffle(Array.from({ length: 8 }, (_, i) => i));
			setInitialIndexes(starts);
		}
	};

	// Enter key support for submit
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Handle Enter key for submit
			if (e.key === 'Enter' && gameStarted && !isScanning) {
				e.preventDefault();
				handleSubmit();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [gameStarted, isScanning]);

	return (
		<div className='flex flex-col items-center justify-center min-h-screen p-2 sm:p-4 gap-4'>
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

			<div className='border-2 border-green-500/30 w-full max-w-[1280px] relative bg-black/50 shadow-2xl shadow-green-500/20' style={{ width: containerWidth, height: containerHeight }}>
			{!gameStarted && (
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
			<div className="w-full h-full p-4">
				<div className="flex flex-row items-start justify-between gap-4 w-full h-full">
					{/* Left column */}
					<div className="flex flex-col gap-3 h-full" style={{ width: scaled(DIM.leftTop.w) }}>
						{/* Connection timeout */}
						<div style={{ width: '100%', height: scaled(DIM.leftTop.h) }}>
							<img src={CONNECTION_TIMEOUT_IMG} alt="Connection Timeout" className="w-full h-full object-contain" />
						</div>
						{/* Carousels area */}
						<div className="flex flex-col gap-2 overflow-auto pr-2" style={{ width: '100%', height: scaled(DIM.leftBottom.h) }}>
							{rows.map((_, rowIndex) => (
								<div 
									key={rowIndex} 
									className={`w-min h-min cursor-pointer transition-all duration-200 ${
										focusedRow === rowIndex ? 'ring-2 ring-blue-400 rounded' : ''
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
												align: 'center', 
												loop: true, 
												containScroll: 'trimSnaps',
												dragFree: false,
												skipSnaps: false
											}}
											setApi={(api?: CarouselApi) => {
												if (!api) return;
												apiRefs.current[rowIndex] = api;
												// Guard: initialize this row only once
												if (initializedRef.current[rowIndex]) return;
												initializedRef.current[rowIndex] = true;
												
												const update = () => {
													setSelectedIndexes((prev) => {
														const copy = [...prev];
														copy[rowIndex] = api.selectedScrollSnap();
														return copy;
													});
												};

												api.on('select', update);
												
												// Scroll to the random starting slide for this row on next frame then initialize selection once
												const start = initialIndexes[rowIndex] ?? 0;
												requestAnimationFrame(() => {
													try { api.scrollTo(start); } catch {}
													requestAnimationFrame(() => update());
												});
											}}
										>
											<CarouselContent className="ml-0">
												{(randomRowImages[rowIndex] || []).map((src, i) => {
													const currentSelectedIndex = selectedIndexes[rowIndex] ?? 0;
													const isSelected = i === currentSelectedIndex;
													
													return (
														<CarouselItem key={`${rowIndex}-${i}`} className="basis-full flex-shrink-0">
															<div className="flex justify-center w-full">
																<img 
																	src={src} 
																	className="h-auto"
																	style={{ 
																		width: Math.max(360, scaled(DIM.leftBottom.w * 0.75 - 10)),
																		maxWidth: '600px'
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
					<div className="flex flex-col items-center justify-start gap-4"
						style={{ width: scaled(DIM.rightTop.w), height: scaled(DIM.rightTop.h + DIM.rightBottom.h) }}
					>
						<div style={{ width: '100%', height: scaled(DIM.rightTop.h) }}>
							<img src={DECIPHERED_IMG} alt="Deciphered" className="w-full h-full object-contain" />
						</div>
						<div style={{ width: '100%', height: scaled(DIM.rightBottom.h) }}>
							<img src={CLONE_TARGET_IMG} alt="Clone Target" className="w-full h-full object-contain" />
						</div>
					</div>
				</div>
			</div>
			{resultMessage && (
				<div className="pointer-events-none absolute inset-x-0 top-2 z-30 flex justify-center">
					<div className={`px-6 py-3 rounded-md font-mono font-medium border shadow-lg ${
						resultMessage.startsWith('Correct') 
							? 'bg-green-900/90 border-green-500/50 text-green-400 shadow-green-500/20' 
							: 'bg-red-900/90 border-red-500/50 text-red-400 shadow-red-500/20'
					}`}>
						{resultMessage.startsWith('Correct') ? '[SUCCESS] ' : '[FAILED] '}
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
			/>
			</div>
		</div>
	);
}
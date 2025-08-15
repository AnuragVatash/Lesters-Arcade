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

export default function CayoFingerprint() {
	const baseImages = Array.from({ length: 8 }, (_, i) => `/cayoFingerprints/print1/fp${i + 1}.png`);
	const rows = Array.from({ length: 8 });

	// Real asset paths
	const CONNECTION_TIMEOUT_IMG = '/cayoFingerprints/print1/connection_timeout.png';
	const CLONE_TARGET_IMG = '/cayoFingerprints/print1/clone_target.png';
	const DECIPHERED_IMG = '/cayoFingerprints/print1/decyphered.png';

	// Scale system based on full image 1200x874 → fit our 1280x720 canvas by height
	const BASE = { w: 1200, h: 874 } as const;
	const CANVAS = { w: 1280, h: 720 } as const;
	const SCALE = CANVAS.h / BASE.h; // preserve aspect
	const scaled = (n: number) => Math.round(n * SCALE);

	// Panel dimensions at base resolution
	const DIM = {
		leftTop: { w: 438, h: 134 }, // Connection Timeout
		rightTop: { w: 718, h: 134 }, // Deciphered Signals
		leftBottom: { w: 438, h: 697 }, // Components (carousels)
		rightBottom: { w: 718, h: 697 }, // Clone Target
	} as const;

	// For this mode, each row contains the images in fixed order (1..8)
	const fixedRowImages = Array.from({ length: 8 }, () => baseImages);

	const [selectedIndexes, setSelectedIndexes] = useState<number[]>(Array(8).fill(0));
	const [initialIndexes, setInitialIndexes] = useState<number[]>(Array(8).fill(0));
	const [resultMessage, setResultMessage] = useState<string | null>(null);
	const initializedRef = useRef<boolean[]>(Array(8).fill(false));
	const apiRefs = useRef<(CarouselApi | null)[]>(Array(8).fill(null));

	function shuffle<T>(arr: T[]): T[] {
		const a = [...arr];
		for (let i = a.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[a[i], a[j]] = [a[j], a[i]];
		}
		return a;
	}

	useEffect(() => {
		// Generate a permutation of starting slides (0..7) so rows don't repeat the same start
		const starts = shuffle(Array.from({ length: 8 }, (_, i) => i));
		setInitialIndexes(starts);
		setSelectedIndexes(starts);
	}, []);

	const handleSubmit = () => {
		const incorrectRows: number[] = [];
		for (let rowIdx = 0; rowIdx < 8; rowIdx++) {
			const api = apiRefs.current[rowIdx];
			const currentIdx = api ? api.selectedScrollSnap() : (selectedIndexes[rowIdx] ?? 0);
			const imgs = fixedRowImages[rowIdx];
			const expected = `fp${rowIdx + 1}.png`;
			const currentSrc = imgs[currentIdx];
			const ok = typeof currentSrc === 'string' && currentSrc.endsWith(expected);
			if (!ok) incorrectRows.push(rowIdx + 1);
		}
		const allCorrect = incorrectRows.length === 0;
		setResultMessage(allCorrect ? 'Correct!' : `Incorrect (rows: ${incorrectRows.join(', ')})`);
		setTimeout(() => setResultMessage(null), 2000);
	};

	return (
		<div className='border-2 border-[#215337] w-[1280px] h-[720px] relative'>
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
								<div key={rowIndex} className="w-min h-min">
									<Carousel
										className="inline-block"
										style={{ width: scaled(DIM.leftTop.w) - 8 }}
										opts={{ align: 'start', loop: true }}
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
											{fixedRowImages[rowIndex].map((src, i) => (
												<CarouselItem key={`${rowIndex}-${i}`} className="basis-auto">
													<img src={src} className="w-70 h-auto" />
												</CarouselItem>
											))}
										</CarouselContent>
										<CarouselPrevious className="left-2 text-[#215337] size-10" />
										<CarouselNext className="right-2 text-[#215337] size-10" />
									</Carousel>
								</div>
							))}
							<div>
								<button
									onClick={handleSubmit}
									className="mt-2 px-4 py-2 rounded bg-white text-black border border-[#215337] hover:bg-neutral-100"
								>
									Submit
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
					<div className={`px-4 py-2 rounded-md text-sm font-medium ${resultMessage.startsWith('Correct') ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
						{resultMessage}
					</div>
				</div>
			)}
		</div>
	);
}
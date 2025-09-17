'use client';

import React from 'react';

interface StartupOverlayProps {
	visible: boolean;
	text: string;
	progress: number; // 0..100
	title?: string; // defaults to "[SYSTEM] BREACH IN PROGRESS"
}

export default function StartupOverlay({ visible, text, progress, title = '[SYSTEM] BREACH IN PROGRESS' }: StartupOverlayProps) {
	if (!visible) return null;

	return (
		<div className="absolute inset-0 z-30 bg-black/95 backdrop-blur-sm flex items-center justify-center" role="status" aria-live="polite">
			<div className="text-center max-w-md">
				<div className="mb-8">
					<div className="text-green-400 font-mono text-2xl mb-2 animate-pulse">
						{title}
					</div>
					<div className="text-green-300 font-mono text-sm mb-6">
						{text}
					</div>
					<div className="w-full bg-gray-800 rounded-full h-3 mb-4 border border-green-500/50" aria-label="progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
						<div
							className="bg-gradient-to-r from-green-600 to-green-400 h-3 rounded-full transition-all duration-300 relative overflow-hidden"
							style={{ width: `${progress}%` }}
						>
							<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
						</div>
					</div>
					<div className="text-green-400 font-mono text-lg">
						{Math.round(progress)}%
					</div>
				</div>
				<div className="text-green-500/50 font-mono text-xs">
					▄▄▄▄▄ TERMINAL ACCESS ▄▄▄▄▄
				</div>
			</div>
		</div>
	);
}



"use client";

import { useEffect, useState } from "react";
import { AudioManager } from "@/lib/audioSystem";

export default function AudioTest() {
  const [audioManager, setAudioManager] = useState<AudioManager | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    const initAudio = async () => {
      try {
        const manager = new AudioManager();
        await manager.init();
        setAudioManager(manager);
        setIsInitialized(true);
        setTestResults((prev) => [...prev, "✅ Audio system initialized"]);
      } catch (error) {
        setTestResults((prev) => [
          ...prev,
          `❌ Audio initialization failed: ${error}`,
        ]);
      }
    };

    initAudio();
  }, []);

  const testSound = async (soundId: string) => {
    if (!audioManager) return;

    try {
      await audioManager.createWebAudioClip(soundId, { volume: 0.5 });
      await audioManager.play(soundId);
      setTestResults((prev) => [...prev, `🔊 Played ${soundId}`]);
    } catch (error) {
      setTestResults((prev) => [
        ...prev,
        `❌ Failed to play ${soundId}: ${error}`,
      ]);
    }
  };

  if (!isInitialized) {
    return (
      <div className="fixed bottom-4 right-4 bg-black/90 border border-green-500/30 p-4 rounded-lg text-green-400 font-mono text-sm">
        <div>🎵 Initializing Audio System...</div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 border border-green-500/30 p-4 rounded-lg text-green-400 font-mono text-sm max-w-sm">
      <div className="mb-2 text-green-300">🎵 Audio Test Panel</div>

      <div className="space-y-1 mb-3">
        <button
          onClick={() => testSound("startup")}
          className="block w-full text-left px-2 py-1 bg-green-900/30 hover:bg-green-800/50 rounded text-xs"
        >
          🔊 Startup Sound
        </button>
        <button
          onClick={() => testSound("click")}
          className="block w-full text-left px-2 py-1 bg-green-900/30 hover:bg-green-800/50 rounded text-xs"
        >
          🔊 Click Sound
        </button>
        <button
          onClick={() => testSound("pieceClick")}
          className="block w-full text-left px-2 py-1 bg-green-900/30 hover:bg-green-800/50 rounded text-xs"
        >
          🔊 Piece Click
        </button>
        <button
          onClick={() => testSound("gameComplete")}
          className="block w-full text-left px-2 py-1 bg-green-900/30 hover:bg-green-800/50 rounded text-xs"
        >
          🔊 Game Complete
        </button>
      </div>

      <div className="text-xs text-green-500/70 max-h-20 overflow-y-auto">
        {testResults.map((result, index) => (
          <div key={index} className="mb-1">
            {result}
          </div>
        ))}
      </div>
    </div>
  );
}

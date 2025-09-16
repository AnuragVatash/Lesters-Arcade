'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { type GameType } from '@/lib/leaderboard';
import { type User, logoutUser } from '@/lib/auth';
import { useSimpleAudio } from '@/lib/simpleAudio';

type Game = 'casino' | 'cayo' | 'number';

interface NavbarProps {
  activeGame: Game;
  onGameChange: (game: Game) => void;
  onLeaderboardClick: (gameType?: GameType) => void;
  user: User;
  onLogout: () => void;
}

// Helper function to map Game type to GameType
const mapGameToGameType = (game: Game): GameType => {
  switch (game) {
    case 'casino':
      return 'casino';
    case 'cayo':
      return 'cayo';
    case 'number':
      return 'numberFinder';
    default:
      return 'casino';
  }
};

export default function Navbar({ activeGame, onGameChange, onLeaderboardClick, user, onLogout }: NavbarProps) {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const audio = useSimpleAudio();

  const navItems = [
    { id: 'casino' as Game, label: 'CASINO_EXPLOIT.exe' },
    { id: 'cayo' as Game, label: 'CAYO_BREACH.exe' },
    { id: 'number' as Game, label: 'NUMBER_FINDER.exe' },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLeaderboardOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLeaderboardItemClick = (gameType?: Game) => {
    audio.playSound('click');
    setIsLeaderboardOpen(false);
    setIsMobileMenuOpen(false);
    onLeaderboardClick(gameType ? mapGameToGameType(gameType) : undefined);
  };

  const handleGameChange = (game: Game) => {
    audio.playSound('click');
    setIsMobileMenuOpen(false);
    onGameChange(game);
  };

  const handleLogout = () => {
    audio.playSound('logout');
    logoutUser();
    onLogout();
  };

  return (
    <nav className="w-full bg-black/90 border-b border-green-500/30 backdrop-blur-sm relative z-[2000]">
      <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 via-transparent to-green-900/20"></div>
      <div className="max-w-7xl mx-auto px-3 relative z-10">
        <div className="flex items-center justify-between py-2">
          {/* Far Left - User info only */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${user.isGuest ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            <span className="text-green-400 font-mono font-medium text-xs sm:text-sm truncate">
              {user.isGuest ? 'GUEST_USER' : user.username.toUpperCase()}
            </span>
            {user.isGuest && (
              <span className="text-xs text-yellow-400 bg-yellow-900/30 px-1.5 py-0.5 rounded border border-yellow-500/30 hidden sm:inline font-mono">
                [RESTRICTED]
              </span>
            )}
          </div>

          {/* Center - Game Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleGameChange(item.id)}
                className={cn(
                  'px-2 py-1 text-xs font-mono font-medium transition-all duration-200',
                  'border-b hover:text-green-400 hover:bg-green-900/20',
                  activeGame === item.id
                    ? 'text-green-400 border-green-500 bg-green-900/30'
                    : 'text-green-300/70 border-transparent'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Far Right - Leaderboard and Logout */}
          <div className="flex items-center space-x-2">
            {/* Mobile Menu Button */}
            <div className="md:hidden" ref={mobileMenuRef}>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-green-300/70 hover:text-green-400 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>

            {/* Desktop Leaderboard Dropdown */}
            <div className="hidden md:block relative" ref={dropdownRef}>
              <button
                onClick={() => setIsLeaderboardOpen(!isLeaderboardOpen)}
                className="px-2 py-1 text-xs font-mono font-medium text-green-300/70 hover:text-green-400 hover:bg-green-900/20 transition-all duration-200 flex items-center space-x-1 border border-green-500/30 rounded"
              >
                <span>LOGS.db</span>
                <svg
                  className={`w-3 h-3 transition-transform duration-200 ${
                    isLeaderboardOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isLeaderboardOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-black/95 border border-green-500/30 rounded-md shadow-xl shadow-green-500/20 z-[3000] backdrop-blur-sm">
                  <div className="py-1">
                    <button
                      onClick={() => handleLeaderboardItemClick('casino')}
                      className="block w-full text-left px-3 py-1.5 text-xs font-mono text-green-300/70 hover:text-green-400 hover:bg-green-900/20 transition-all duration-200"
                    >
                      [CASINO] exploit_records.log
                    </button>
                    <button
                      onClick={() => handleLeaderboardItemClick('cayo')}
                      className="block w-full text-left px-3 py-1.5 text-xs font-mono text-green-300/70 hover:text-green-400 hover:bg-green-900/20 transition-all duration-200"
                    >
                      [CAYO] breach_records.log
                    </button>
                    <button
                      onClick={() => handleLeaderboardItemClick('number')}
                      className="block w-full text-left px-3 py-1.5 text-xs font-mono text-green-300/70 hover:text-green-400 hover:bg-green-900/20 transition-all duration-200"
                    >
                      [NUMBERFINDER] trace_records.log
                    </button>
                    <div className="border-t border-green-500/30 my-1"></div>
                    <button
                      onClick={() => handleLeaderboardItemClick()}
                      className="block w-full text-left px-3 py-1.5 text-xs font-mono text-green-300/70 hover:text-green-400 hover:bg-green-900/20 transition-all duration-200"
                    >
                      [ALL] access_database.db
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-green-300/70 hover:text-green-400 text-xs font-mono transition-colors duration-200 px-2 py-1 border border-green-500/30 rounded hover:bg-green-900/20"
            >
              [LOGOUT]
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-green-500/20 py-2">
            <div className="space-y-1">
              <div className="px-3 py-1">
                <p className="text-xs text-green-400 mb-1 font-mono">[GAME_SELECTION]</p>
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleGameChange(item.id)}
                    className={cn(
                      'block w-full text-left px-2 py-1 text-xs font-mono font-medium transition-colors duration-200 rounded',
                      activeGame === item.id
                        ? 'text-green-400 bg-green-900/30'
                        : 'text-green-300/70 hover:text-green-400 hover:bg-green-900/20'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="border-t border-green-500/20 my-1"></div>
              <div className="px-3 py-1">
                <p className="text-xs text-green-400 mb-1 font-mono">[LEADERBOARD]</p>
                <button
                  onClick={() => handleLeaderboardItemClick('casino')}
                  className="block w-full text-left px-2 py-1 text-xs text-green-300/70 hover:text-green-400 hover:bg-green-900/20 rounded transition-colors duration-200 font-mono"
                >
                  [CASINO] exploit_records.log
                </button>
                <button
                  onClick={() => handleLeaderboardItemClick('cayo')}
                  className="block w-full text-left px-2 py-1 text-xs text-green-300/70 hover:text-green-400 hover:bg-green-900/20 rounded transition-colors duration-200 font-mono"
                >
                  [CAYO] breach_records.log
                </button>
                <button
                  onClick={() => handleLeaderboardItemClick('number')}
                  className="block w-full text-left px-2 py-1 text-xs text-green-300/70 hover:text-green-400 hover:bg-green-900/20 rounded transition-colors duration-200 font-mono"
                >
                  [NUMBERFINDER] trace_records.log
                </button>
                <button
                  onClick={() => handleLeaderboardItemClick()}
                  className="block w-full text-left px-2 py-1 text-xs text-green-300/70 hover:text-green-400 hover:bg-green-900/20 rounded transition-colors duration-200 font-mono"
                >
                  [ALL] access_database.db
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
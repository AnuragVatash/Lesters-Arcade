'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

type Game = 'casino' | 'cayo';

interface NavbarProps {
  activeGame: Game;
  onGameChange: (game: Game) => void;
  onLeaderboardClick: (gameType?: Game) => void;
}

export default function Navbar({ activeGame, onGameChange, onLeaderboardClick }: NavbarProps) {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'casino' as Game, label: 'Casino Hack' },
    { id: 'cayo' as Game, label: 'Cayo Perico Hack' },
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
    setIsLeaderboardOpen(false);
    setIsMobileMenuOpen(false);
    onLeaderboardClick(gameType);
  };

  const handleGameChange = (game: Game) => {
    setIsMobileMenuOpen(false);
    onGameChange(game);
  };

  return (
    <nav className="w-full bg-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleGameChange(item.id)}
                className={cn(
                  'px-4 lg:px-6 py-4 text-sm font-medium transition-colors duration-200',
                  'border-b-2 hover:text-white hover:bg-gray-800',
                  activeGame === item.id
                    ? 'text-white border-blue-500 bg-gray-800'
                    : 'text-gray-300 border-transparent'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden" ref={mobileMenuRef}>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>

          {/* Desktop Leaderboard Dropdown */}
          <div className="hidden md:block relative" ref={dropdownRef}>
            <button
              onClick={() => setIsLeaderboardOpen(!isLeaderboardOpen)}
              className="px-4 lg:px-6 py-4 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-1"
            >
              <span>Leaderboard</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
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
              <div className="absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-50">
                <div className="py-1">
                  <button
                    onClick={() => handleLeaderboardItemClick('casino')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
                  >
                    Casino Hack
                  </button>
                  <button
                    onClick={() => handleLeaderboardItemClick('cayo')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
                  >
                    Cayo Perico Hack
                  </button>
                  <div className="border-t border-gray-700 my-1"></div>
                  <button
                    onClick={() => handleLeaderboardItemClick()}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors duration-200"
                  >
                    View All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700 py-2">
            <div className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleGameChange(item.id)}
                  className={cn(
                    'block w-full text-left px-4 py-3 text-sm font-medium transition-colors duration-200',
                    activeGame === item.id
                      ? 'text-white bg-gray-800'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  )}
                >
                  {item.label}
                </button>
              ))}
              <div className="border-t border-gray-700 my-2"></div>
              <div className="px-4 py-2">
                <p className="text-xs text-gray-400 mb-2">Leaderboard</p>
                <button
                  onClick={() => handleLeaderboardItemClick('casino')}
                  className="block w-full text-left px-2 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors duration-200"
                >
                  Casino Hack
                </button>
                <button
                  onClick={() => handleLeaderboardItemClick('cayo')}
                  className="block w-full text-left px-2 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors duration-200"
                >
                  Cayo Perico Hack
                </button>
                <button
                  onClick={() => handleLeaderboardItemClick()}
                  className="block w-full text-left px-2 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors duration-200"
                >
                  View All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

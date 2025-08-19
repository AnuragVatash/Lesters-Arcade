'use client';

import { User, logoutUser } from '@/lib/auth';

interface UserDisplayProps {
  user: User;
  onLogout: () => void;
}

export default function UserDisplay({ user, onLogout }: UserDisplayProps) {
  const handleLogout = () => {
    logoutUser();
    onLogout();
  };

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${user.isGuest ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
            <span className="text-white font-medium text-sm sm:text-base truncate">
              {user.isGuest ? 'Guest User' : user.username}
            </span>
          </div>
          {user.isGuest && (
            <span className="text-xs text-yellow-400 bg-yellow-900 px-2 py-1 rounded hidden sm:inline">
              No Leaderboard Access
            </span>
          )}
        </div>
        
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-white text-sm transition-colors duration-200 ml-2"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

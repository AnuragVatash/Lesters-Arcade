'use client';

import { useState } from 'react';
import { registerUser, loginUser, createGuestUser, type User } from '@/lib/auth';
import { cn } from '@/lib/utils';

interface AuthPageProps {
  onAuthenticated: (user: User) => void;
}

export default function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [mode, setMode] = useState<'initial' | 'login' | 'register'>('initial');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      if (mode === 'register') {
        const result = registerUser(username, password);
        setMessage(result.message);
        
        if (result.success) {
          // Auto-login after successful registration
          setTimeout(() => {
            const loginResult = loginUser(username, password);
            if (loginResult.success && loginResult.user) {
              onAuthenticated(loginResult.user);
            }
          }, 1000);
        }
      } else if (mode === 'login') {
        const result = loginUser(username, password);
        setMessage(result.message);
        
        if (result.success && result.user) {
          onAuthenticated(result.user);
        }
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = () => {
    const guestUser = createGuestUser();
    onAuthenticated(guestUser);
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setMessage('');
  };

  const goBack = () => {
    setMode('initial');
    resetForm();
  };

  if (mode === 'initial') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-gray-900 p-6 sm:p-8 rounded-lg shadow-xl max-w-md w-full">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">GTA Hack Clone</h1>
            <p className="text-sm sm:text-base text-gray-400">Welcome! Please choose an option to continue.</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setMode('login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
            >
              Yes, I have an account
            </button>
            
            <button
              onClick={() => setMode('register')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
            >
              No, create new account
            </button>
            
            <button
              onClick={handleGuestAccess}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
            >
              Continue as Guest
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Note: Guest users cannot access leaderboards
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="bg-gray-900 p-6 sm:p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {mode === 'login' ? 'Login' : 'Create Account'}
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            {mode === 'login' 
              ? 'Enter your credentials to continue' 
              : 'Create a new account to get started'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your username"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>

          {message && (
            <div className={cn(
              'p-3 rounded-md text-sm',
              message.includes('successful') || message.includes('created')
                ? 'bg-green-900 text-green-200 border border-green-700'
                : 'bg-red-900 text-red-200 border border-red-700'
            )}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
          >
            {isLoading ? 'Processing...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 flex flex-col space-y-2">
          <button
            onClick={goBack}
            className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
            disabled={isLoading}
          >
            ← Back to options
          </button>
          
          <button
            onClick={handleGuestAccess}
            className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
            disabled={isLoading}
          >
            Continue as Guest instead
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Supports all characters including special characters (@, -, etc.)
          </p>
        </div>
      </div>
    </div>
  );
}

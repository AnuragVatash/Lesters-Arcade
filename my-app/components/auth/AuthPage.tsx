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
      <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
        {/* Matrix background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-green-950/20 to-black"></div>
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 50 }).map((_, i) => (
            <div 
              key={i}
              className="absolute text-green-500 text-xs font-mono animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`
              }}
            >
              {Math.random().toString(36).substring(2, 8)}
            </div>
          ))}
        </div>
        
        <div className="bg-black/90 border border-green-500/30 p-6 sm:p-8 rounded-lg shadow-2xl shadow-green-500/20 max-w-md w-full backdrop-blur-sm relative z-10">
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="text-green-400 font-mono text-lg">{'>'}</div>
              <h1 className="text-2xl sm:text-3xl font-bold text-green-400 font-mono mx-2">GHOST_NET</h1>
              <div className="text-green-400 font-mono text-lg animate-pulse">{'_'}</div>
            </div>
            <p className="text-sm sm:text-base text-green-300/70 font-mono">UNAUTHORIZED ACCESS DETECTED. AUTHENTICATION REQUIRED.</p>
            <div className="mt-2 text-xs text-green-500/50 font-mono">system@ghost-net:~$</div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setMode('login')}
              className="w-full bg-green-900/30 border border-green-500/50 hover:bg-green-800/40 hover:border-green-400 text-green-300 font-mono font-medium py-3 px-4 rounded-md transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20"
            >
              [LOGIN] Existing credentials
            </button>
            
            <button
              onClick={() => setMode('register')}
              className="w-full bg-blue-900/30 border border-blue-500/50 hover:bg-blue-800/40 hover:border-blue-400 text-blue-300 font-mono font-medium py-3 px-4 rounded-md transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
            >
              [REGISTER] New user account
            </button>
            
            <button
              onClick={handleGuestAccess}
              className="w-full bg-red-900/30 border border-red-500/50 hover:bg-red-800/40 hover:border-red-400 text-red-300 font-mono font-medium py-3 px-4 rounded-md transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20"
            >
              [ANONYMOUS] Guest access
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-red-400/70 font-mono">
              [WARNING] Anonymous users excluded from access logs
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Matrix background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-green-950/20 to-black"></div>
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 50 }).map((_, i) => (
          <div 
            key={i}
            className="absolute text-green-500 text-xs font-mono animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          >
            {Math.random().toString(36).substring(2, 8)}
          </div>
        ))}
      </div>
      
      <div className="bg-black/90 border border-green-500/30 p-6 sm:p-8 rounded-lg shadow-2xl shadow-green-500/20 max-w-md w-full backdrop-blur-sm relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-green-400 font-mono text-lg">{'>'}</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-green-400 font-mono mx-2">
              {mode === 'login' ? '[AUTH_LOGIN]' : '[USER_REGISTER]'}
            </h1>
            <div className="text-green-400 font-mono text-lg animate-pulse">{'_'}</div>
          </div>
          <p className="text-sm sm:text-base text-green-300/70 font-mono">
            {mode === 'login' 
              ? 'ENTER CREDENTIALS FOR SYSTEM ACCESS' 
              : 'INITIALIZE NEW USER PROFILE'
            }
          </p>
          <div className="mt-2 text-xs text-green-500/50 font-mono">auth@ghost-net:~$</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-mono font-medium text-green-400 mb-2">
              [USER_ID]
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-black/80 border border-green-500/50 rounded-md text-green-300 placeholder-green-500/50 font-mono focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200"
              placeholder="enter_username"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-mono font-medium text-green-400 mb-2">
              [PASSWORD]
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-black/80 border border-green-500/50 rounded-md text-green-300 placeholder-green-500/50 font-mono focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-200"
              placeholder="enter_password"
              required
              disabled={isLoading}
            />
          </div>

          {message && (
            <div className={cn(
              'p-3 rounded-md text-sm font-mono border',
              message.includes('successful') || message.includes('created')
                ? 'bg-green-900/30 text-green-300 border-green-500/50'
                : 'bg-red-900/30 text-red-300 border-red-500/50'
            )}>
              {message.includes('successful') ? '[SUCCESS] ' : message.includes('created') ? '[CREATED] ' : '[ERROR] '}
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-900/30 border border-green-500/50 hover:bg-green-800/40 hover:border-green-400 disabled:bg-gray-900/30 disabled:border-gray-500/30 disabled:cursor-not-allowed text-green-300 font-mono font-medium py-3 px-4 rounded-md transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20"
          >
            {isLoading ? '[PROCESSING...]' : mode === 'login' ? '[AUTHENTICATE]' : '[REGISTER_USER]'}
          </button>
        </form>

        <div className="mt-6 flex flex-col space-y-2">
          <button
            onClick={goBack}
            className="text-green-400/70 hover:text-green-300 text-sm font-mono transition-colors duration-200"
            disabled={isLoading}
          >
            [BACK] ← main_menu
          </button>
          
          <button
            onClick={handleGuestAccess}
            className="text-red-400/70 hover:text-red-300 text-sm font-mono transition-colors duration-200"
            disabled={isLoading}
          >
            [ANONYMOUS] guest_access
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-green-500/50 font-mono">
            [INFO] Supports alphanumeric + special chars (@, -, etc.)
          </p>
        </div>
      </div>
    </div>
  );
}

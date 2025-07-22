"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

const WORDS = [
  'MONEY', 'POWER', 'SPEED', 'STEAL', 'CRIME', 'HEIST', 'VAULT', 'ALARM',
  'GUARD', 'CHASE', 'BRAKE', 'FRAME', 'DRIVE', 'SCENE', 'PHONE', 'CODES',
  'RADIO', 'AGENT', 'BADGE', 'LASER', 'DRONE', 'BLOCK', 'CRACK', 'STORM',
  'BLADE', 'GHOST', 'SNAKE', 'TIGER', 'FROST', 'CHAIN', 'SPARK', 'FLAME'
];

const TIMER_DURATION = 30; // 30 seconds per word

export default function AnagramPassword() {
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [attempts, setAttempts] = useState(0);
  const [solvedWords, setSolvedWords] = useState(0);
  const [feedback, setFeedback] = useState('');

  // Initialize a new word
  const initializeNewWord = () => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(word);
    
    // Scramble the letters
    const letters = word.split('');
    const scrambled = [...letters];
    
    // Fisher-Yates shuffle
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }
    
    // Ensure it's actually scrambled (not same as original)
    if (scrambled.join('') === word) {
      // Simple swap if identical
      [scrambled[0], scrambled[1]] = [scrambled[1], scrambled[0]];
    }
    
    setScrambledLetters(scrambled);
    setUserInput('');
    setTimeLeft(TIMER_DURATION);
    setFeedback('');
  };

  // Initialize first word
  useEffect(() => {
    initializeNewWord();
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameStatus !== 'playing') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameStatus('lost');
          setFeedback(`Time's up! The word was: ${currentWord}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus, currentWord]);

  // Handle input change
  const handleInputChange = (value: string) => {
    if (gameStatus !== 'playing') return;
    
    const upperValue = value.toUpperCase().slice(0, 5); // Limit to 5 chars
    setUserInput(upperValue);
    
    // Auto-check if 5 letters entered
    if (upperValue.length === 5) {
      checkAnswer(upperValue);
    }
  };

  // Check the answer
  const checkAnswer = (answer: string = userInput) => {
    if (gameStatus !== 'playing') return;
    
    setAttempts(prev => prev + 1);
    
    if (answer.trim().toUpperCase() === currentWord) {
      // Correct!
      setGameStatus('won');
      setSolvedWords(prev => prev + 1);
      setFeedback('ACCESS GRANTED!');
      
      // Auto-start next word after delay
      setTimeout(() => {
        setGameStatus('playing');
        initializeNewWord();
      }, 2000);
    } else {
      // Incorrect
      setFeedback('INCORRECT - TRY AGAIN');
      setTimeout(() => setFeedback(''), 1500);
    }
  };

  // Handle manual submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.length > 0) {
      checkAnswer();
    }
  };

  // Reset game
  const resetGame = () => {
    setGameStatus('playing');
    setAttempts(0);
    setSolvedWords(0);
    initializeNewWord();
  };

  // Handle letter click (for touch/click interface)
  const handleLetterClick = (letter: string, index: number) => {
    if (gameStatus !== 'playing' || userInput.length >= 5) return;
    
    setUserInput(prev => prev + letter);
    
    // Visual feedback - temporarily hide the clicked letter
    setScrambledLetters(prev => 
      prev.map((l, i) => i === index ? '' : l)
    );
    
    // Restore letter after short delay
    setTimeout(() => {
      setScrambledLetters(prev => 
        prev.map((l, i) => i === index ? letter : l)
      );
    }, 200);
  };

  const formatTime = (seconds: number) => {
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">PASSWORD DECODER</h1>
          <p className="text-sm opacity-75">Unscramble the access code</p>
        </div>
        <div className="text-right">
          <div className={`timer-display ${timeLeft <= 5 ? 'timer-warning' : ''}`}>
            {formatTime(timeLeft)}
          </div>
          <Link href="/" className="hack-button inline-block mt-2">
            ← MENU
          </Link>
        </div>
      </div>

      {/* Game Area */}
      <div className="max-w-4xl mx-auto">
        {/* Status */}
        <div className="text-center mb-6">
          <div className="text-lg mb-2">
            WORDS DECODED: <span className="terminal-yellow">{solvedWords}</span>
          </div>
          <div className="text-sm opacity-75">
            ATTEMPTS: {attempts}
          </div>
        </div>

        {/* Scrambled Letters Display */}
        <div className="text-center mb-8">
          <h2 className="text-lg mb-4">SCRAMBLED LETTERS:</h2>
          <div className="flex justify-center gap-4 mb-6">
            {scrambledLetters.map((letter, index) => (
              <button
                key={index}
                onClick={() => handleLetterClick(letter, index)}
                className={`w-16 h-16 text-2xl font-bold border-2 border-green-400 
                  bg-gray-900 hover:bg-green-400 hover:text-black transition-colors
                  ${letter === '' ? 'opacity-30' : ''}`}
                disabled={gameStatus !== 'playing' || letter === ''}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Input Section */}
        <div className="text-center mb-6">
          <h3 className="text-lg mb-4">ENTER PASSWORD:</h3>
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex justify-center mb-4">
              <input
                type="text"
                value={userInput}
                onChange={(e) => handleInputChange(e.target.value)}
                className="bg-black border-2 border-green-400 text-green-400 text-center text-2xl 
                  font-mono p-3 w-64 focus:outline-none focus:border-yellow-400"
                placeholder="_ _ _ _ _"
                maxLength={5}
                disabled={gameStatus !== 'playing'}
                autoFocus
              />
            </div>
            
            <div className="flex justify-center gap-4">
              <button
                type="submit"
                disabled={gameStatus !== 'playing' || userInput.length === 0}
                className="hack-button px-6 py-2"
              >
                SUBMIT
              </button>
              <button
                type="button"
                onClick={() => setUserInput('')}
                disabled={gameStatus !== 'playing'}
                className="hack-button px-6 py-2"
              >
                CLEAR
              </button>
            </div>
          </form>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className="text-center mb-6">
            <div className={`text-xl font-bold ${
              feedback.includes('GRANTED') ? 'terminal-text' : 'terminal-red'
            }`}>
              {feedback}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="max-w-2xl mx-auto">
          <div className="terminal-border p-4">
            <h3 className="text-lg font-bold mb-4">INSTRUCTIONS:</h3>
            <ul className="text-sm space-y-2 opacity-75">
              <li>• Unscramble the 5 letters to form a valid word</li>
              <li>• Type the word or click letters to build it</li>
              <li>• You have 30 seconds per word</li>
              <li>• Successfully decoded words will generate new puzzles</li>
              <li>• Common words related to crime, money, and action</li>
            </ul>
            
            <div className="mt-4">
              <h4 className="font-bold mb-2">CONTROLS:</h4>
              <div className="space-y-1 text-sm opacity-75">
                <div>• Type directly into the input field</div>
                <div>• Click scrambled letters to add them</div>
                <div>• ENTER or SUBMIT to check answer</div>
                <div>• CLEAR to reset input</div>
              </div>
            </div>

            {gameStatus === 'lost' && (
              <div className="mt-4">
                <button onClick={resetGame} className="hack-button w-full">
                  NEW PUZZLE
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {gameStatus === 'won' && solvedWords === 1 && (
        <div className="status-message status-success">
          ACCESS GRANTED<br />
          <span className="text-sm">Password decoded! Next word loading...</span>
        </div>
      )}
      
      {gameStatus === 'lost' && (
        <div className="status-message status-failure">
          ACCESS DENIED<br />
          <span className="text-sm">Decoder timeout!</span>
        </div>
      )}
    </div>
  );
} 
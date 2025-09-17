'use client';

export type GameType = 'casino' | 'cayo' | 'numberFinder';

export interface LeaderboardEntry {
  username: string;
  time: number; // time in milliseconds
  gameType: GameType;
  completedAt: string;
  isGuest: boolean;
}

export interface TimeComparison {
  oldTime: number | null;
  newTime: number;
  improvement: number | null; // positive = improvement, negative = worse
  isFirstRecord: boolean;
}

const LEADERBOARD_KEY = '__gta_hack_leaderboard__';

// Get all leaderboard entries
export function getAllLeaderboardEntries(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const entries = localStorage.getItem(LEADERBOARD_KEY);
    return entries ? JSON.parse(entries) : [];
  } catch {
    return [];
  }
}

// Save leaderboard entries
function saveLeaderboardEntries(entries: LeaderboardEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn('Failed to save leaderboard entries to localStorage:', error);
  }
}

// Get user's best time for a specific game
export function getUserBestTime(username: string, gameType: GameType): number | null {
  const entries = getAllLeaderboardEntries();
  const userEntries = entries.filter(entry => 
    entry.username === username && 
    entry.gameType === gameType &&
    !entry.isGuest
  );
  
  if (userEntries.length === 0) return null;
  
  return Math.min(...userEntries.map(entry => entry.time));
}

// Submit a new time (only saves if it's better than previous record or first time)
export function submitTime(
  username: string, 
  time: number, 
  gameType: GameType, 
  isGuest: boolean = false
): TimeComparison {
  // Don't save guest times to leaderboard, but still return comparison
  const oldTime = isGuest ? null : getUserBestTime(username, gameType);
  const isFirstRecord = oldTime === null;
  
  let improvement: number | null = null;
  if (!isFirstRecord && oldTime !== null) {
    improvement = oldTime - time; // positive = improvement (less time)
  }

  // Only save to leaderboard if: not guest AND (first record OR better time)
  if (!isGuest && (isFirstRecord || (oldTime !== null && time < oldTime))) {
    const entries = getAllLeaderboardEntries();
    
    const newEntry: LeaderboardEntry = {
      username,
      time,
      gameType,
      completedAt: new Date().toISOString(),
      isGuest
    };
    
    entries.push(newEntry);
    saveLeaderboardEntries(entries);
  }

  return {
    oldTime,
    newTime: time,
    improvement,
    isFirstRecord
  };
}

// Get leaderboard for a specific game type with pagination
export function getLeaderboard(
  gameType: GameType, 
  page: number = 1, 
  limit: number = 50
): { entries: LeaderboardEntry[]; totalPages: number; totalEntries: number } {
  const allEntries = getAllLeaderboardEntries();
  
  // Filter by game type and exclude guests, then get best time per user
  const gameEntries = allEntries.filter(entry => 
    entry.gameType === gameType && !entry.isGuest
  );
  
  // Group by username and get best time for each user
  const userBestTimes = new Map<string, LeaderboardEntry>();
  
  gameEntries.forEach(entry => {
    const existing = userBestTimes.get(entry.username);
    if (!existing || entry.time < existing.time) {
      userBestTimes.set(entry.username, entry);
    }
  });
  
  // Convert to array and sort by time (ascending)
  const sortedEntries = Array.from(userBestTimes.values())
    .sort((a, b) => a.time - b.time);
  
  const totalEntries = sortedEntries.length;
  const totalPages = Math.ceil(totalEntries / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedEntries = sortedEntries.slice(startIndex, endIndex);
  
  return {
    entries: paginatedEntries,
    totalPages,
    totalEntries
  };
}

// Generate test data
export function generateTestData(): void {
  const gameTypes: GameType[] = ['casino', 'cayo', 'numberFinder'];
  const testUsernames = [
    'speedhacker', 'quickfingers', 'masterthief', 'hackergod', 'nightcrawler',
    'cyberpunk', 'digitalninja', 'codecracker', 'bytebuster', 'systembreaker',
    'ghosthacker', 'matrixrunner', 'codemaster', 'hackzilla', 'datapirate',
    'cryptokid', 'binarybeast', 'hacksmith', 'techlord', 'digitaldemon',
    'cyberwizard', 'hackerninja', 'codewarrior', 'bytehunter', 'scriptmaster',
    'networker', 'serverslayer', 'hackingpro', 'digitalguru', 'codegenius',
    'cyberhawk', 'hackingace', 'binarymaster', 'techphantom', 'codestorm',
    'hackersage', 'digitalhero', 'cyberstrike', 'codeblaze', 'hackingking',
    'binarybot', 'techmage', 'hackinglegend', 'codephoenix', 'cybershadow',
    'hackerfox', 'digitalwolf', 'codestrike', 'hackingdragon', 'binaryfire'
  ];
  
  const entries: LeaderboardEntry[] = [];
  
  testUsernames.forEach(username => {
    gameTypes.forEach(gameType => {
      // Generate 1-3 attempts per user per game
      const attempts = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < attempts; i++) {
        const baseTime = gameType === 'casino' ? 15000 : gameType === 'cayo' ? 25000 : 12000; // 15s for casino, 25s for cayo, 12s for numberFinder
        const randomVariation = Math.random() * 30000; // 0-30s variation
        const time = Math.floor(baseTime + randomVariation);
        
        const daysAgo = Math.floor(Math.random() * 30);
        const completedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
        
        entries.push({
          username,
          time,
          gameType,
          completedAt,
          isGuest: false
        });
      }
    });
  });
  
  saveLeaderboardEntries(entries);
}

// Format time for display (MM:SS.mmm)
export function formatTime(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  const ms = milliseconds % 1000;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

// Format time difference for display
export function formatTimeDifference(improvement: number | null): { text: string; color: string } {
  if (improvement === null) {
    return { text: '~', color: 'text-white' };
  }
  
  if (improvement > 0) {
    // Improvement (less time taken)
    return { 
      text: `+${formatTime(improvement)}`, 
      color: 'text-green-400' 
    };
  } else {
    // Worse time (more time taken)
    return { 
      text: `-${formatTime(Math.abs(improvement))}`, 
      color: 'text-red-400' 
    };
  }
}

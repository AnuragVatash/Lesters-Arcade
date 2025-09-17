'use client';

export interface User {
  username: string;
  password: string;
  isGuest: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Private user database - only accessible to developers
// In a real app, this would be in a secure backend database
const USERS_KEY = '__gta_hack_users_db__';
const CURRENT_USER_KEY = '__gta_hack_current_user__';

// Get all users (developer access only)
export function getAllUsers(): User[] {
  if (typeof window === 'undefined') return [];
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
}

// Save users to storage (developer access only)
function saveUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.warn('Failed to save users to localStorage:', error);
  }
}

// Register a new user
export function registerUser(username: string, password: string): { success: boolean; message: string } {
  if (!username.trim() || !password.trim()) {
    return { success: false, message: 'Username and password are required' };
  }

  const users = getAllUsers();
  
  // Check if username already exists (case sensitive)
  if (users.some(user => user.username === username)) {
    return { success: false, message: 'Username already exists. Sign in or pick a different username.' };
  }

  const newUser: User = {
    username,
    password,
    isGuest: false,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);
  
  return { success: true, message: 'Account created successfully' };
}

// Login user
export function loginUser(username: string, password: string): { success: boolean; message: string; user?: User } {
  if (!username.trim() || !password.trim()) {
    return { success: false, message: 'Username and password are required' };
  }

  const users = getAllUsers();
  
  // Find user with exact case-sensitive match
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return { success: false, message: 'Password or Username is incorrect' };
  }

  // Save current user session
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.warn('Failed to save user session to localStorage:', error);
    }
  }

  return { success: true, message: 'Login successful', user };
}

// Create guest user
export function createGuestUser(): User {
  const guestUser: User = {
    username: 'guest',
    password: '',
    isGuest: true,
    createdAt: new Date().toISOString()
  };

  // Save current user session
  if (typeof window !== 'undefined') {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(guestUser));
  }

  return guestUser;
}

// Get current user session
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

// Logout user
export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch (error) {
    console.warn('Failed to clear user session from localStorage:', error);
  }
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

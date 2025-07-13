import { Timestamp } from 'firebase/firestore';

// Core dictionary types
export interface Definition {
  id: string;
  text: string;
  category?: string;
  examples?: string[];
  context?: string;
}

export interface Example {
  id: string;
  sentence: string;
  translation?: string;
  context?: string;
  difficulty?: number;
}

export interface DictionaryEntry {
  id: string;
  word: string;
  language: 'ro' | 'en' | 'es' | 'fr' | 'it' | 'de';
  definitions: Definition[];
  pronunciation: {
    ipa?: string;
    audioUrl?: string;
    phonetic?: string;
  };
  etymology?: string;
  partOfSpeech: string[];
  examples: Example[];
  synonyms: string[];
  antonyms: string[];
  relatedWords: string[];
  difficulty: number; // 1-10 scale
  frequency: number; // 1-10 scale
  votes: {
    upvotes: number;
    downvotes: number;
    userVotes?: Record<string, 'up' | 'down'>;
  };
  metadata: {
    created: Timestamp;
    updated: Timestamp;
    createdBy: string;
    verified: boolean;
    aiGenerated?: boolean;
    sources?: string[];
  };
}

// User-related types
export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  notifications: boolean;
  autoPlayAudio: boolean;
}

export interface SearchHistoryEntry {
  id: string;
  word: string;
  timestamp: Timestamp;
  language: string;
  resultsCount: number;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'moderator' | 'admin';
  profile: {
    avatar?: string;
    bio?: string;
    preferences: UserPreferences;
  };
  statistics: {
    wordsSearched: number;
    contributionsCount: number;
    achievementPoints: number;
    streakDays: number;
    lastActiveDate: Timestamp;
  };
  favorites: string[]; // word IDs
  searchHistory: SearchHistoryEntry[];
  achievements: string[]; // achievement IDs
  created: Timestamp;
  lastActive: Timestamp;
}

// Contribution types
export interface UserContribution {
  id: string;
  userId: string;
  userDisplayName: string;
  wordId: string;
  word: string;
  type: 'definition' | 'example' | 'correction' | 'pronunciation' | 'etymology';
  content: {
    original?: any;
    proposed: any;
    reason?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  votes: {
    upvotes: number;
    downvotes: number;
    userVotes?: Record<string, 'up' | 'down'>;
  };
  moderatorNote?: string;
  created: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
}

// Search and API types
export interface SearchFilters {
  language?: string;
  partOfSpeech?: string[];
  difficulty?: [number, number];
  verified?: boolean;
  hasAudio?: boolean;
}

export interface SearchRequest {
  query: string;
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'alphabetical' | 'frequency' | 'recent';
}

export interface SearchResult {
  entries: DictionaryEntry[];
  totalCount: number;
  suggestions?: string[];
  searchTime: number;
  filters: SearchFilters;
}

// Admin types
export interface AdminStats {
  totalWords: number;
  totalUsers: number;
  totalContributions: number;
  pendingContributions: number;
  dailySearches: number;
  weeklyActiveUsers: number;
  averageRating: number;
  topSearchedWords: Array<{ word: string; count: number }>;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

// Achievement types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'search' | 'contribution' | 'social' | 'learning';
  requirements: {
    type: string;
    threshold: number;
    timeframe?: string;
  };
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Gamification types
export interface UserProgress {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalXP: number;
  streakDays: number;
  badges: string[];
  achievements: Achievement[];
}

// Content moderation types
export interface ModerationAction {
  id: string;
  type: 'approve' | 'reject' | 'edit' | 'flag' | 'ban';
  targetType: 'contribution' | 'user' | 'comment';
  targetId: string;
  moderatorId: string;
  reason: string;
  automated: boolean;
  timestamp: Timestamp;
}

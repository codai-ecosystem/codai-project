import { Timestamp } from 'firebase/firestore';

// Dictionary Types
export interface Definition {
  id: string;
  text: string;
  partOfSpeech: string;
  language: 'ro' | 'en' | 'es' | 'fr' | 'it' | 'de';
  examples: string[];
  votes: number;
}

export interface Example {
  id: string;
  text: string;
  translation?: string;
  source?: string;
  votes: number;
}

export interface DictionaryEntry {
  id: string;
  word: string;
  language: 'ro' | 'en' | 'es' | 'fr' | 'it' | 'de';
  definitions: Definition[];
  pronunciation: {
    ipa: string;
    audioUrl?: string;
  };
  etymology: string;
  partOfSpeech: string[];
  examples: Example[];
  synonyms: string[];
  antonyms: string[];
  relatedWords: string[];
  difficulty: number;
  frequency: number;
  votes: {
    upvotes: number;
    downvotes: number;
  };
  metadata: {
    created: Timestamp;
    updated: Timestamp;
    createdBy: string;
    verified: boolean;
  };
}

// User Types
export interface UserPreferences {
  language: 'ro' | 'en' | 'es' | 'fr' | 'it' | 'de';
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  audioAutoplay: boolean;
  difficultyLevel: number;
}

export interface SearchHistoryEntry {
  id: string;
  word: string;
  timestamp: Timestamp;
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
  };
  favorites: string[]; // word IDs
  searchHistory: SearchHistoryEntry[];
  created: Timestamp;
  lastActive: Timestamp;
}

// Contribution Types
export interface UserContribution {
  id: string;
  userId: string;
  wordId: string;
  type: 'definition' | 'example' | 'correction' | 'pronunciation';
  content: any;
  status: 'pending' | 'approved' | 'rejected';
  votes: number;
  created: Timestamp;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
}

// Admin Types
export interface AdminStats {
  totalWords: number;
  totalUsers: number;
  pendingContributions: number;
  dailySearches: number;
  monthlyGrowth: number;
}

// Search Types
export interface SearchFilters {
  language?: 'ro' | 'en' | 'es' | 'fr' | 'it' | 'de';
  partOfSpeech?: string[];
  difficulty?: number[];
  onlyVerified?: boolean;
}

export interface SearchResult {
  entry: DictionaryEntry;
  relevance: number;
  matchType: 'exact' | 'partial' | 'phonetic' | 'semantic';
}

// Authentication Types
export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
}

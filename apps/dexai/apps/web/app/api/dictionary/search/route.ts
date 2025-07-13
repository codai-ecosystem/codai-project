import { NextRequest, NextResponse } from 'next/server';
import {
    POPULAR_SUGGESTIONS,
    ROMANIAN_DICTIONARY,
    type RomanianDictionaryEntry
} from '../../../../data/romanian-dictionary';

/**
 * DEXAI Dictionary Search API
 * Real Romanian Dictionary with DEX entries
 * Enhanced search with fuzzy matching and diacritics support
 */

const SEARCH_MESSAGES = {
  EMPTY_SEARCH: 'Vă rugăm să introduceți un termen de căutare.',
  NO_RESULTS: 'Nu s-au găsit rezultate pentru căutarea dumneavoastră.',
  MULTIPLE_RESULTS: 'rezultate găsite',
  SINGLE_RESULT: 'rezultat găsit'
};

// Romanian diacritics normalization for better search
const DIACRITICS_MAP: Record<string, string> = {
  'ă': 'a', 'â': 'a', 'î': 'i', 'ș': 's', 'ț': 't',
  'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ț': 'T'
};

function normalizeDiacritics(text: string): string {
  return text.replace(/[ăâîșțĂÂÎȘȚ]/g, (char) => DIACRITICS_MAP[char] || char);
}

function fuzzySearch(query: string): RomanianDictionaryEntry[] {
  const normalizedQuery = normalizeDiacritics(query.toLowerCase());
  
  return ROMANIAN_DICTIONARY.filter(entry => {
    // Exact word match (highest priority)
    if (entry.word.toLowerCase() === query.toLowerCase()) return true;
    
    // Normalized match
    if (normalizeDiacritics(entry.word.toLowerCase()).includes(normalizedQuery)) return true;
    
    // Definition match
    if (entry.definitions.some(def => 
      normalizeDiacritics(def.text.toLowerCase()).includes(normalizedQuery)
    )) return true;
    
    // Synonym match
    if (entry.synonyms.some(syn => 
      normalizeDiacritics(syn.toLowerCase()).includes(normalizedQuery)
    )) return true;
    
    return false;
  }).sort((a, b) => {
    // Sort by relevance: exact match first, then by frequency
    if (a.word.toLowerCase() === query.toLowerCase()) return -1;
    if (b.word.toLowerCase() === query.toLowerCase()) return 1;
    return b.frequency - a.frequency;
  });
}

function getSuggestions(query: string): string[] {
  if (!query || query.length < 2) return POPULAR_SUGGESTIONS.slice(0, 6);
  
  const normalizedQuery = normalizeDiacritics(query.toLowerCase());
  
  // Find words that start with the query
  const suggestions = ROMANIAN_DICTIONARY
    .filter(entry => 
      normalizeDiacritics(entry.word.toLowerCase()).startsWith(normalizedQuery)
    )
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 4)
    .map(entry => entry.word);
  
  // Add popular suggestions if we have fewer than 6
  const remaining = POPULAR_SUGGESTIONS.filter(word => 
    !suggestions.includes(word) && 
    normalizeDiacritics(word.toLowerCase()).includes(normalizedQuery)
  ).slice(0, 6 - suggestions.length);
  
  return [...suggestions, ...remaining];
}

function transformToApiFormat(entry: RomanianDictionaryEntry) {
  return {
    id: entry.id,
    word: entry.word,
    definitions: entry.definitions.map(def => ({
      id: def.id,
      text: def.text,
      category: def.category,
      register: def.register
    })),
    translations: entry.translations,
    pronunciation: entry.pronunciation,
    etymology: entry.etymology,
    partOfSpeech: entry.partOfSpeech,
    synonyms: entry.synonyms,
    antonyms: entry.antonyms,
    examples: entry.examples.map(ex => ({
      id: ex.id,
      sentence: ex.sentence,
      context: ex.context,
      translation: ex.translation
    })),
    difficulty: entry.difficulty,
    frequency: entry.frequency,
    category: entry.category,
    votes: entry.votes,
    metadata: entry.metadata
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase().trim();
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const language = searchParams.get('language') || 'en';
  const category = searchParams.get('category');
  const difficulty = searchParams.get('difficulty');
  
  // Handle empty query
  if (!query) {
    return NextResponse.json({
      entries: [],
      totalCount: 0,
      searchTime: 0,
      error: SEARCH_MESSAGES.EMPTY_SEARCH,
      pagination: {
        page: 1,
        limit: 20,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
    });
  }

  // Simulate search delay for realism
  const startTime = Date.now();
  
  // Perform fuzzy search
  let matchingWords = fuzzySearch(query);
  
  // Apply filters
  if (category) {
    matchingWords = matchingWords.filter(word => 
      word.category.toLowerCase().includes(category.toLowerCase())
    );
  }
  
  if (difficulty) {
    const difficultyLevel = parseInt(difficulty);
    if (!isNaN(difficultyLevel)) {
      matchingWords = matchingWords.filter(word => word.difficulty === difficultyLevel);
    }
  }

  const searchTime = Date.now() - startTime;

  // Handle no results
  if (matchingWords.length === 0) {
    return NextResponse.json({
      entries: [],
      totalCount: 0,
      searchTime,
      error: SEARCH_MESSAGES.NO_RESULTS,
      suggestions: getSuggestions(query),
      pagination: {
        page: 1,
        limit: 20,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false,
      },
    });
  }

  // Pagination
  const totalCount = matchingWords.length;
  const totalPages = Math.ceil(totalCount / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedWords = matchingWords.slice(startIndex, endIndex);

  // Transform to API format
  const entries = paginatedWords.map(transformToApiFormat);

  return NextResponse.json({
    entries,
    totalCount,
    searchTime,
    message: totalCount === 1 ? 
      `1 ${SEARCH_MESSAGES.SINGLE_RESULT}` : 
      `${totalCount} ${SEARCH_MESSAGES.MULTIPLE_RESULTS}`,
    filters: {
      categories: [...new Set(ROMANIAN_DICTIONARY.map(w => w.category))],
      difficulties: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      partsOfSpeech: [...new Set(ROMANIAN_DICTIONARY.flatMap(w => w.partOfSpeech))],
      languages: ['en', 'es', 'fr', 'de', 'it', 'pt']
    },
    pagination: {
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    }
  });
}

export async function POST() {
  return NextResponse.json({ 
    error: 'Method not allowed. Use GET for dictionary search.' 
  }, { status: 405 });
}

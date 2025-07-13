import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  Timestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';
import type { 
  DictionaryEntry, 
  SearchRequest, 
  SearchResult, 
  Definition, 
  Example 
} from './types';

export class DictionaryService {
  private static readonly COLLECTION = 'dictionary';
  private static readonly CACHE_DURATION = 1000 * 60 * 5; // 5 minutes
  private static cache = new Map<string, { data: DictionaryEntry[], timestamp: number }>();

  static async searchWord(searchRequest: SearchRequest): Promise<SearchResult> {
    const startTime = Date.now();
    const { query: searchQuery, filters, limit: searchLimit = 20, offset = 0 } = searchRequest;
    
    try {
      // First check cache
      const cacheKey = JSON.stringify(searchRequest);
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        return {
          entries: cached.data,
          totalCount: cached.data.length,
          searchTime: Date.now() - startTime,
          filters: filters || {}
        };
      }

      // Search in Firestore
      let firestoreQuery = query(
        collection(db, this.COLLECTION),
        where('word', '>=', searchQuery.toLowerCase()),
        where('word', '<=', searchQuery.toLowerCase() + '\uf8ff'),
        orderBy('word'),
        firestoreLimit(searchLimit)
      );

      // Apply filters
      if (filters?.language) {
        firestoreQuery = query(firestoreQuery, where('language', '==', filters.language));
      }
      if (filters?.verified !== undefined) {
        firestoreQuery = query(firestoreQuery, where('metadata.verified', '==', filters.verified));
      }

      const snapshot = await getDocs(firestoreQuery);
      let entries: DictionaryEntry[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DictionaryEntry));

      // If no results found, try to generate with AI
      if (entries.length === 0 && searchQuery.trim()) {
        const aiEntry = await this.generateWithAI(searchQuery.trim());
        if (aiEntry) {
          entries = [aiEntry];
        }
      }

      // Apply additional filtering (post-Firestore)
      if (filters?.partOfSpeech?.length) {
        entries = entries.filter(entry => 
          entry.partOfSpeech.some(pos => filters.partOfSpeech!.includes(pos))
        );
      }

      if (filters?.difficulty) {
        const [minDiff, maxDiff] = filters.difficulty;
        entries = entries.filter(entry => 
          entry.difficulty >= minDiff && entry.difficulty <= maxDiff
        );
      }

      if (filters?.hasAudio) {
        entries = entries.filter(entry => !!entry.pronunciation.audioUrl);
      }

      // Cache results
      this.cache.set(cacheKey, { data: entries, timestamp: Date.now() });

      // Log search for analytics
      await this.logSearch(searchQuery, entries.length);

      return {
        entries,
        totalCount: entries.length,
        searchTime: Date.now() - startTime,
        filters: filters || {}
      };

    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to search dictionary');
    }
  }

  static async getWordById(id: string): Promise<DictionaryEntry | null> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as DictionaryEntry;
      }
      return null;
    } catch (error) {
      console.error('Error fetching word:', error);
      return null;
    }
  }

  static async generateWithAI(word: string): Promise<DictionaryEntry | null> {
    try {
      // Call Azure OpenAI API
      const response = await fetch('/api/ai/generate-definition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word, language: 'ro' }),
      });

      if (!response.ok) {
        throw new Error('AI generation failed');
      }

      const aiData = await response.json();

      // Create dictionary entry
      const entry: DictionaryEntry = {
        id: crypto.randomUUID(),
        word: word.toLowerCase(),
        language: 'ro',
        definitions: aiData.definitions?.map((def: any, index: number) => ({
          id: `def-${index}`,
          text: def.text || def,
          category: def.category,
          examples: def.examples || []
        })) || [{
          id: 'def-0',
          text: aiData.definition || `Definiție pentru "${word}"`,
          examples: []
        }],
        pronunciation: {
          ipa: aiData.pronunciation?.ipa,
          phonetic: aiData.pronunciation?.phonetic || `[${word}]`,
          audioUrl: undefined // Will be generated separately
        },
        etymology: aiData.etymology || '',
        partOfSpeech: aiData.partOfSpeech || ['substantiv'],
        examples: aiData.examples?.map((ex: any, index: number) => ({
          id: `ex-${index}`,
          sentence: ex.sentence || ex,
          translation: ex.translation,
          context: ex.context
        })) || [],
        synonyms: aiData.synonyms || [],
        antonyms: aiData.antonyms || [],
        relatedWords: aiData.relatedWords || [],
        difficulty: aiData.difficulty || 5,
        frequency: aiData.frequency || 5,
        votes: { upvotes: 0, downvotes: 0 },
        metadata: {
          created: Timestamp.now(),
          updated: Timestamp.now(),
          createdBy: 'ai-system',
          verified: false,
          aiGenerated: true
        }
      };

      // Save to Firestore
      await setDoc(doc(db, this.COLLECTION, entry.id), entry);

      return entry;
    } catch (error) {
      console.error('AI generation error:', error);
      return null;
    }
  }

  static async addToFavorites(userId: string, wordId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      favorites: arrayUnion(wordId),
      lastActive: Timestamp.now()
    }, { merge: true });
  }

  static async removeFromFavorites(userId: string, wordId: string): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      favorites: arrayRemove(wordId),
      lastActive: Timestamp.now()
    }, { merge: true });
  }

  static async voteOnWord(
    wordId: string, 
    userId: string, 
    vote: 'up' | 'down'
  ): Promise<void> {
    const wordRef = doc(db, this.COLLECTION, wordId);
    const wordDoc = await getDoc(wordRef);
    
    if (!wordDoc.exists()) {
      throw new Error('Word not found');
    }

    const currentData = wordDoc.data() as DictionaryEntry;
    const currentUserVotes = currentData.votes.userVotes || {};
    const previousVote = currentUserVotes[userId];

    // Update vote counts
    let upvoteIncrement = 0;
    let downvoteIncrement = 0;

    if (previousVote === 'up' && vote === 'down') {
      upvoteIncrement = -1;
      downvoteIncrement = 1;
    } else if (previousVote === 'down' && vote === 'up') {
      upvoteIncrement = 1;
      downvoteIncrement = -1;
    } else if (!previousVote) {
      if (vote === 'up') upvoteIncrement = 1;
      else downvoteIncrement = 1;
    }

    // Update the document
    await setDoc(wordRef, {
      votes: {
        upvotes: increment(upvoteIncrement),
        downvotes: increment(downvoteIncrement),
        userVotes: {
          ...currentUserVotes,
          [userId]: vote
        }
      }
    }, { merge: true });
  }

  static async logSearch(query: string, resultsCount: number): Promise<void> {
    try {
      const logEntry = {
        query: query.toLowerCase(),
        resultsCount,
        timestamp: Timestamp.now(),
        language: 'ro' // Default for now
      };

      await setDoc(doc(collection(db, 'search_logs')), logEntry);
    } catch (error) {
      console.error('Error logging search:', error);
      // Don't throw - logging failures shouldn't break search
    }
  }

  static async getPopularWords(limit: number = 10): Promise<DictionaryEntry[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        orderBy('votes.upvotes', 'desc'),
        orderBy('frequency', 'desc'),
        firestoreLimit(limit)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DictionaryEntry));
    } catch (error) {
      console.error('Error fetching popular words:', error);
      return [];
    }
  }

  static async getRecentWords(limit: number = 10): Promise<DictionaryEntry[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        orderBy('metadata.created', 'desc'),
        firestoreLimit(limit)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as DictionaryEntry));
    } catch (error) {
      console.error('Error fetching recent words:', error);
      return [];
    }
  }
}

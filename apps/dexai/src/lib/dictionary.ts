import { OpenAI } from 'openai';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import type { DictionaryEntry, SearchResult, SearchFilters } from './types';

export class DictionaryService {
  private static openai = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/gpt-4/`,
    defaultQuery: { 'api-version': '2024-02-15-preview' },
    defaultHeaders: {
      'api-key': process.env.AZURE_OPENAI_API_KEY,
    },
  });

  static async searchWord(
    word: string, 
    filters?: SearchFilters
  ): Promise<SearchResult[]> {
    try {
      // Search in Firestore first
      const q = query(
        collection(db, 'dictionary'),
        where('word', '>=', word.toLowerCase()),
        where('word', '<=', word.toLowerCase() + '\uf8ff'),
        limit(10)
      );
      
      const snapshot = await getDocs(q);
      const results: SearchResult[] = [];
      
      snapshot.docs.forEach(doc => {
        const entry = { id: doc.id, ...doc.data() } as DictionaryEntry;
        
        // Apply filters if provided
        if (filters) {
          if (filters.language && entry.language !== filters.language) return;
          if (filters.onlyVerified && !entry.metadata.verified) return;
          if (filters.partOfSpeech && !filters.partOfSpeech.some(pos => entry.partOfSpeech.includes(pos))) return;
          if (filters.difficulty && !filters.difficulty.includes(entry.difficulty)) return;
        }
        
        // Calculate relevance score
        const relevance = this.calculateRelevance(word, entry.word);
        const matchType = this.getMatchType(word, entry.word);
        
        results.push({ entry, relevance, matchType });
      });
      
      // Sort by relevance
      results.sort((a, b) => b.relevance - a.relevance);
      
      // If no results found, try to generate with AI
      if (results.length === 0) {
        const aiResults = await this.generateWithAI(word);
        return aiResults.map(entry => ({
          entry,
          relevance: 1.0,
          matchType: 'exact' as const
        }));
      }
      
      return results;
    } catch (error) {
      console.error('Error searching word:', error);
      throw new Error('Search failed');
    }
  }

  static async generateWithAI(word: string): Promise<DictionaryEntry[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: `You are a Romanian language expert and lexicographer. Generate comprehensive dictionary entries for Romanian words. Return valid JSON with the following structure:
          {
            "word": "string",
            "definitions": [{"id": "string", "text": "string", "partOfSpeech": "string", "language": "ro", "examples": ["string"], "votes": 0}],
            "pronunciation": {"ipa": "string"},
            "etymology": "string",
            "partOfSpeech": ["string"],
            "examples": [{"id": "string", "text": "string", "translation": "string", "votes": 0}],
            "synonyms": ["string"],
            "antonyms": ["string"],
            "relatedWords": ["string"],
            "difficulty": 1-5,
            "frequency": 1-10
          }`
        }, {
          role: "user",
          content: `Generate a comprehensive dictionary entry for the Romanian word "${word}". Include multiple definitions if applicable, IPA pronunciation, etymology, examples with translations, synonyms, antonyms, and related words. Rate difficulty (1-5) and frequency (1-10).`
        }],
        temperature: 0.3,
        max_tokens: 1500
      });
      
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content generated');
      }
      
      const aiData = JSON.parse(content);
      
      // Create entry with proper structure
      const entry: DictionaryEntry = {
        id: crypto.randomUUID(),
        word: word.toLowerCase(),
        language: 'ro',
        definitions: aiData.definitions.map((def: any) => ({
          ...def,
          id: def.id || crypto.randomUUID()
        })),
        pronunciation: aiData.pronunciation,
        etymology: aiData.etymology || '',
        partOfSpeech: Array.isArray(aiData.partOfSpeech) ? aiData.partOfSpeech : [aiData.partOfSpeech],
        examples: aiData.examples.map((ex: any) => ({
          ...ex,
          id: ex.id || crypto.randomUUID()
        })),
        synonyms: aiData.synonyms || [],
        antonyms: aiData.antonyms || [],
        relatedWords: aiData.relatedWords || [],
        difficulty: aiData.difficulty || 1,
        frequency: aiData.frequency || 1,
        votes: { upvotes: 0, downvotes: 0 },
        metadata: {
          created: Timestamp.now(),
          updated: Timestamp.now(),
          createdBy: 'ai-system',
          verified: false
        }
      };
      
      // Store in Firestore for future use
      await setDoc(doc(db, 'dictionary', entry.id), entry);
      
      return [entry];
    } catch (error) {
      console.error('Error generating with AI:', error);
      throw new Error('AI generation failed');
    }
  }

  static async getWordById(id: string): Promise<DictionaryEntry | null> {
    try {
      const docRef = doc(db, 'dictionary', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as DictionaryEntry;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting word by ID:', error);
      return null;
    }
  }

  static async addToFavorites(userId: string, wordId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const favorites = userData.favorites || [];
        
        if (!favorites.includes(wordId)) {
          favorites.push(wordId);
          await updateDoc(userRef, { favorites });
        }
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw new Error('Failed to add to favorites');
    }
  }

  static async removeFromFavorites(userId: string, wordId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const favorites = userData.favorites || [];
        const updatedFavorites = favorites.filter((id: string) => id !== wordId);
        
        await updateDoc(userRef, { favorites: updatedFavorites });
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw new Error('Failed to remove from favorites');
    }
  }

  static async voteWord(wordId: string, vote: 'up' | 'down'): Promise<void> {
    try {
      const wordRef = doc(db, 'dictionary', wordId);
      const updateField = vote === 'up' ? 'votes.upvotes' : 'votes.downvotes';
      
      await updateDoc(wordRef, {
        [updateField]: increment(1)
      });
    } catch (error) {
      console.error('Error voting on word:', error);
      throw new Error('Failed to vote');
    }
  }

  static async getRandomWords(count: number = 5): Promise<DictionaryEntry[]> {
    try {
      // Simple implementation - in production, you'd want a more sophisticated random selection
      const q = query(
        collection(db, 'dictionary'),
        where('metadata.verified', '==', true),
        limit(count * 2) // Get more than needed and shuffle
      );
      
      const snapshot = await getDocs(q);
      const words = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DictionaryEntry));
      
      // Shuffle array and return requested count
      const shuffled = words.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    } catch (error) {
      console.error('Error getting random words:', error);
      return [];
    }
  }

  private static calculateRelevance(searchTerm: string, word: string): number {
    const search = searchTerm.toLowerCase();
    const target = word.toLowerCase();
    
    if (search === target) return 1.0;
    if (target.startsWith(search)) return 0.9;
    if (target.includes(search)) return 0.7;
    
    // Simple Levenshtein distance-based relevance
    const distance = this.levenshteinDistance(search, target);
    const maxLength = Math.max(search.length, target.length);
    return Math.max(0, 1 - (distance / maxLength));
  }

  private static getMatchType(searchTerm: string, word: string): 'exact' | 'partial' | 'phonetic' | 'semantic' {
    const search = searchTerm.toLowerCase();
    const target = word.toLowerCase();
    
    if (search === target) return 'exact';
    if (target.includes(search) || search.includes(target)) return 'partial';
    
    // Simplified phonetic matching
    if (this.soundsLike(search, target)) return 'phonetic';
    
    return 'semantic';
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i += 1) {
      matrix[0][i] = i;
    }
    
    for (let j = 0; j <= str2.length; j += 1) {
      matrix[j][0] = j;
    }
    
    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private static soundsLike(str1: string, str2: string): boolean {
    // Simple phonetic similarity check for Romanian
    // This is a basic implementation - could be enhanced with proper phonetic algorithms
    const normalize = (str: string) => str.replace(/[ăâîșț]/g, (char) => {
      switch (char) {
        case 'ă': return 'a';
        case 'â': return 'a';
        case 'î': return 'i';
        case 'ș': return 's';
        case 'ț': return 't';
        default: return char;
      }
    });
    
    const norm1 = normalize(str1);
    const norm2 = normalize(str2);
    
    return this.levenshteinDistance(norm1, norm2) <= 2;
  }
}

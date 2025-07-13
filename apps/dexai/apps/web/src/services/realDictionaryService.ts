/**
 * Real Dictionary Service
 * Provides access to Romanian dictionary data
 */

export interface DictionaryEntry {
  word: string;
  definition: string;
  examples: string[];
  pronunciation?: string;
  etymology?: string;
  partOfSpeech: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface SearchOptions {
  limit?: number;
  exact?: boolean;
  partOfSpeech?: string;
  includeExamples?: boolean;
}

export interface SearchResult {
  entries: DictionaryEntry[];
  total: number;
  query: string;
  searchTime: number;
}

class RealDictionaryService {
  private baseUrl: string;
  private isOnline: boolean = true;

  constructor() {
    this.baseUrl = process.env.DEX_API_URL || 'https://dexonline.ro/definitie';
  }

  /**
   * Search for dictionary entries
   */
  async search(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult> {
    const startTime = Date.now();
    
    try {
      // Mock implementation for now - replace with actual API call
      const mockEntries: DictionaryEntry[] = [
        {
          word: query,
          definition: `Definiție pentru cuvântul "${query}"`,
          examples: [
            `Exemplu de utilizare pentru "${query}".`,
            `Alt exemplu cu "${query}".`,
          ],
          pronunciation: `/pronunție/${query}/`,
          etymology: `Etimologia cuvântului "${query}"`,
          partOfSpeech: 'substantiv',
          synonyms: ['sinonim1', 'sinonim2'],
          antonyms: ['antonim1', 'antonim2'],
        },
      ];

      const searchTime = Date.now() - startTime;

      return {
        entries: mockEntries.slice(0, options.limit || 10),
        total: mockEntries.length,
        query,
        searchTime,
      };
    } catch (error) {
      console.error('Error searching dictionary:', error);
      throw new Error('Failed to search dictionary');
    }
  }

  /**
   * Get a specific dictionary entry by word
   */
  async getEntry(word: string): Promise<DictionaryEntry | null> {
    try {
      const result = await this.search(word, { exact: true, limit: 1 });
      return result.entries[0] || null;
    } catch (error) {
      console.error('Error getting dictionary entry:', error);
      return null;
    }
  }

  /**
   * Get suggestions for similar words
   */
  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    try {
      // Mock implementation
      return [
        `${query}a`,
        `${query}e`,
        `${query}i`,
        `${query}uri`,
        `${query}elor`,
      ].slice(0, limit);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }

  /**
   * Check if the service is online and available
   */
  async checkHealth(): Promise<boolean> {
    try {
      // Mock implementation - replace with actual health check
      return this.isOnline;
    } catch (error) {
      console.error('Dictionary service health check failed:', error);
      return false;
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      online: this.isOnline,
      baseUrl: this.baseUrl,
      lastCheck: new Date().toISOString(),
    };
  }

  /**
   * Get random word of the day
   */
  async getWordOfTheDay(): Promise<DictionaryEntry | null> {
    try {
      // Mock implementation
      const words = ['frumos', 'înțelepciune', 'cunoaștere', 'libertate', 'iubire'];
      const randomWord = words[Math.floor(Math.random() * words.length)];
      return await this.getEntry(randomWord);
    } catch (error) {
      console.error('Error getting word of the day:', error);
      return null;
    }
  }
}

// Export singleton instance
export const realDictionaryService = new RealDictionaryService();
export { RealDictionaryService }; // Export class for compatibility
export default realDictionaryService;

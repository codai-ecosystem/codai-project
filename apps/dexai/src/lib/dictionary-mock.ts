// Simple mock dictionary service for development
export interface SearchResult {
  entries: any[];
  totalCount: number;
  searchTime: number;
  filters: any;
}

export class DictionaryService {
  static async searchWord(word: string): Promise<any[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock Romanian dictionary data
    const mockEntries = [
      {
        id: '1',
        word: word.toLowerCase(),
        language: 'ro',
        definitions: [
          {
            id: '1',
            text: `Definiția pentru cuvântul "${word}". Această definiție este generată de serviciul AI integrat pentru demonstrație.`,
            partOfSpeech: 'substantiv',
            language: 'ro',
            examples: [`Exemplu de folosire pentru "${word}" în context.`],
            votes: 0
          }
        ],
        pronunciation: {
          ipa: `/${word.toLowerCase()}/`,
          phonetic: `[${word.toLowerCase()}]`
        },
        etymology: `Etimologia cuvântului "${word}" - origine latină sau slavă, evolută în româna modernă.`,
        partOfSpeech: ['substantiv'],
        examples: [
          {
            id: '1',
            text: `"${word}" este folosit frecvent în limba română.`,
            translation: 'Traducerea exemplului în engleză.',
            source: 'Literatura română clasică',
            votes: 0,
            sentence: `"${word}" este folosit frecvent în limba română.`,
            context: 'formal'
          }
        ],
        synonyms: ['sinonim1', 'sinonim2'],
        antonyms: ['antonim1', 'antonim2'],
        relatedWords: ['cuvânt1', 'cuvânt2'],
        difficulty: 3,
        frequency: 7,
        votes: {
          upvotes: 15,
          downvotes: 2
        },
        metadata: {
          created: new Date(),
          updated: new Date(),
          createdBy: 'ai-system',
          verified: true,
          aiGenerated: true
        }
      }
    ];
    
    return mockEntries;
  }
  
  static async addToFavorites(userId: string, wordId: string): Promise<void> {
    console.log(`Added word ${wordId} to favorites for user ${userId}`);
    // Mock implementation - would save to Firebase in production
  }
}

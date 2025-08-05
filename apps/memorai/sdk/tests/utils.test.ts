import {
  formatMemoryContent,
  extractKeywords,
  validateMemoryInput,
  getMemoryStatistics,
  calculateMemorySimilarity,
  findSimilarMemories
} from '../src/utils';
import { Memory } from '../src/types';

describe('SDK Utils', () => {
  describe('formatMemoryContent', () => {
    it('should return full content if under max length', () => {
      const memory = {
        id: '1',
        content: 'Short content',
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user1'
      } as Memory;

      const result = formatMemoryContent(memory, 100);
      expect(result).toBe('Short content');
    });

    it('should truncate content if over max length', () => {
      const memory = {
        id: '1',
        content: 'This is a very long content that should be truncated',
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user1'
      } as Memory;

      const result = formatMemoryContent(memory, 20);
      expect(result).toBe('This is a very long...');
    });

    it('should handle empty content', () => {
      const memory = {
        id: '1',
        content: '',
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user1'
      } as Memory;

      const result = formatMemoryContent(memory);
      expect(result).toBe('');
    });
  });

  describe('extractKeywords', () => {
    it('should extract keywords from content', () => {
      const content = 'This is a test content with important keywords and information';
      const keywords = extractKeywords(content, 5);

      expect(keywords).toBeInstanceOf(Array);
      expect(keywords.length).toBeLessThanOrEqual(5);
      expect(keywords).not.toContain('is');
      expect(keywords).not.toContain('a');
      expect(keywords).not.toContain('and');
    });

    it('should handle empty content', () => {
      const keywords = extractKeywords('', 5);
      expect(keywords).toEqual([]);
    });

    it('should filter out short words', () => {
      const content = 'a an the is it by of on at';
      const keywords = extractKeywords(content, 10);
      expect(keywords).toEqual([]);
    });
  });

  describe('validateMemoryInput', () => {
    it('should validate correct input', () => {
      const input = {
        content: 'Valid content',
        title: 'Valid title',
        category: 'work',
        tags: ['tag1', 'tag2']
      };

      const result = validateMemoryInput(input);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject empty content', () => {
      const input = {
        content: '   ',  // Whitespace only content
        title: 'Title'
      };

      const result = validateMemoryInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Content cannot be empty');
    });

    it('should reject missing content', () => {
      const input = {
        title: 'Title'
      };

      const result = validateMemoryInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Content is required and must be a string');
    });

    it('should reject content that is too long', () => {
      const input = {
        content: 'a'.repeat(10001)
      };

      const result = validateMemoryInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Content cannot exceed 10,000 characters');
    });

    it('should reject invalid tags', () => {
      const input = {
        content: 'Valid content',
        tags: ['valid', 123, 'a'.repeat(51)]
      };

      const result = validateMemoryInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Tag at index 1 must be a string');
      expect(result.errors).toContain('Tag at index 2 cannot exceed 50 characters');
    });

    it('should reject too many tags', () => {
      const input = {
        content: 'Valid content',
        tags: Array(21).fill('tag')
      };

      const result = validateMemoryInput(input);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Cannot have more than 20 tags');
    });
  });

  describe('getMemoryStatistics', () => {
    it('should calculate statistics correctly', () => {
      const memories: Memory[] = [
        {
          id: '1',
          content: 'Content 1',
          category: 'work',
          tags: ['tag1', 'tag2'],
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date(),
          userId: 'user1'
        },
        {
          id: '2',
          content: 'Content 2 is longer',
          category: 'personal',
          tags: ['tag1', 'tag3'],
          createdAt: new Date('2023-01-02'),
          updatedAt: new Date(),
          userId: 'user1'
        }
      ];

      const stats = getMemoryStatistics(memories);

      expect(stats.total).toBe(2);
      expect(stats.categories).toEqual({ work: 1, personal: 1 });
      expect(stats.tags).toEqual({ tag1: 2, tag2: 1, tag3: 1 });
      expect(stats.averageContentLength).toBe((9 + 19) / 2);
      expect(stats.totalContentLength).toBe(28);
      expect(stats.oldestMemory?.id).toBe('1');
      expect(stats.newestMemory?.id).toBe('2');
    });

    it('should handle empty array', () => {
      const stats = getMemoryStatistics([]);

      expect(stats.total).toBe(0);
      expect(stats.categories).toEqual({});
      expect(stats.tags).toEqual({});
      expect(stats.averageContentLength).toBe(0);
      expect(stats.totalContentLength).toBe(0);
      expect(stats.oldestMemory).toBeNull();
      expect(stats.newestMemory).toBeNull();
    });
  });

  describe('calculateMemorySimilarity', () => {
    it('should calculate similarity correctly', () => {
      const memory1: Memory = {
        id: '1',
        content: 'This is about machine learning and AI',
        category: 'tech',
        tags: ['ai', 'ml', 'tech'],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user1'
      };

      const memory2: Memory = {
        id: '2',
        content: 'Machine learning is fascinating and AI is powerful',
        category: 'tech',
        tags: ['ai', 'ml', 'research'],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user1'
      };

      const similarity = calculateMemorySimilarity(memory1, memory2);

      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    it('should return 0 for completely different memories', () => {
      const memory1: Memory = {
        id: '1',
        content: 'Cooking recipes for dinner',
        category: 'cooking',
        tags: ['food', 'recipes'],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user1'
      };

      const memory2: Memory = {
        id: '2',
        content: 'Space exploration and astronomy',
        category: 'science',
        tags: ['space', 'astronomy'],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user1'
      };

      const similarity = calculateMemorySimilarity(memory1, memory2);

      expect(similarity).toBe(0);
    });
  });

  describe('findSimilarMemories', () => {
    it('should find similar memories', () => {
      const targetMemory: Memory = {
        id: '1',
        content: 'JavaScript programming',
        category: 'programming',
        tags: ['js', 'coding'],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user1'
      };

      const allMemories: Memory[] = [
        targetMemory,
        {
          id: '2',
          content: 'Python programming',
          category: 'programming',
          tags: ['python', 'coding'],
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user1'
        },
        {
          id: '3',
          content: 'Cooking recipes',
          category: 'cooking',
          tags: ['food'],
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'user1'
        }
      ];

      const similar = findSimilarMemories(targetMemory, allMemories, 0.1, 5);

      expect(similar.length).toBe(1);
      expect(similar[0].id).toBe('2');
    });

    it('should exclude target memory from results', () => {
      const targetMemory: Memory = {
        id: '1',
        content: 'Test content',
        category: 'test',
        tags: ['test'],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: 'user1'
      };

      const similar = findSimilarMemories(targetMemory, [targetMemory], 0, 5);

      expect(similar.length).toBe(0);
    });
  });
});

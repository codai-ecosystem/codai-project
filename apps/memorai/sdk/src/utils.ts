import { Memory, SearchResult, AnalyticsData } from './types';

/**
 * Utility functions for working with MemorAI data
 */

/**
 * Format memory content for display
 */
export const formatMemoryContent = (memory: Memory, maxLength: number = 100): string => {
  if (!memory.content) return '';

  const content = memory.content.trim();
  if (content.length <= maxLength) return content;

  return content.substring(0, maxLength).trim() + '...';
};

/**
 * Extract keywords from memory content
 */
export const extractKeywords = (content: string, maxKeywords: number = 10): string[] => {
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !STOP_WORDS.includes(word));

  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word);
};

/**
 * Calculate relevance score for search results
 */
export const calculateRelevanceScore = (
  result: SearchResult,
  query: string
): Memory[] => {
  const queryWords = query.toLowerCase().split(/\s+/);

  return result.memories.map(memory => {
    const content = memory.content.toLowerCase();
    const title = memory.title?.toLowerCase() || '';

    let score = 0;

    // Exact matches in title get highest score
    queryWords.forEach(word => {
      if (title.includes(word)) score += 10;
      if (content.includes(word)) score += 5;
    });

    // Tag matches
    memory.tags.forEach(tag => {
      if (queryWords.some(word => tag.toLowerCase().includes(word))) {
        score += 3;
      }
    });

    return { ...memory, relevanceScore: score };
  }).sort((a: any, b: any) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
};

/**
 * Group memories by category
 */
export const groupMemoriesByCategory = (memories: Memory[]): Record<string, Memory[]> => {
  return memories.reduce((groups, memory) => {
    const category = memory.category || 'Uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(memory);
    return groups;
  }, {} as Record<string, Memory[]>);
};

/**
 * Group memories by tags
 */
export const groupMemoriesByTag = (memories: Memory[]): Record<string, Memory[]> => {
  const groups: Record<string, Memory[]> = {};

  memories.forEach(memory => {
    memory.tags.forEach(tag => {
      if (!groups[tag]) {
        groups[tag] = [];
      }
      groups[tag].push(memory);
    });
  });

  return groups;
};

/**
 * Filter memories by date range
 */
export const filterMemoriesByDateRange = (
  memories: Memory[],
  startDate: Date,
  endDate: Date
): Memory[] => {
  return memories.filter(memory => {
    const createdAt = new Date(memory.createdAt);
    return createdAt >= startDate && createdAt <= endDate;
  });
};

/**
 * Get memory statistics
 */
export const getMemoryStatistics = (memories: Memory[]) => {
  const stats = {
    total: memories.length,
    categories: {} as Record<string, number>,
    tags: {} as Record<string, number>,
    averageContentLength: 0,
    totalContentLength: 0,
    oldestMemory: null as Memory | null,
    newestMemory: null as Memory | null
  };

  let totalLength = 0;
  let oldest: Memory | null = null;
  let newest: Memory | null = null;

  memories.forEach(memory => {
    // Categories
    const category = memory.category || 'Uncategorized';
    stats.categories[category] = (stats.categories[category] || 0) + 1;

    // Tags
    memory.tags.forEach(tag => {
      stats.tags[tag] = (stats.tags[tag] || 0) + 1;
    });

    // Content length
    totalLength += memory.content.length;

    // Date tracking
    const createdAt = new Date(memory.createdAt);
    if (!oldest || createdAt < new Date(oldest.createdAt)) {
      oldest = memory;
    }
    if (!newest || createdAt > new Date(newest.createdAt)) {
      newest = memory;
    }
  });

  stats.totalContentLength = totalLength;
  stats.averageContentLength = memories.length > 0 ? totalLength / memories.length : 0;
  stats.oldestMemory = oldest;
  stats.newestMemory = newest;

  return stats;
};

/**
 * Validate memory input
 */
export const validateMemoryInput = (input: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!input) {
    errors.push('Memory input is required');
    return { valid: false, errors };
  }

  if (!input.content || typeof input.content !== 'string') {
    errors.push('Content is required and must be a string');
  } else if (input.content.trim().length === 0) {
    errors.push('Content cannot be empty');
  } else if (input.content.length > 10000) {
    errors.push('Content cannot exceed 10,000 characters');
  }

  if (input.title && typeof input.title !== 'string') {
    errors.push('Title must be a string');
  } else if (input.title && input.title.length > 200) {
    errors.push('Title cannot exceed 200 characters');
  }

  if (input.category && typeof input.category !== 'string') {
    errors.push('Category must be a string');
  }

  if (input.tags) {
    if (!Array.isArray(input.tags)) {
      errors.push('Tags must be an array');
    } else {
      input.tags.forEach((tag: any, index: number) => {
        if (typeof tag !== 'string') {
          errors.push(`Tag at index ${index} must be a string`);
        } else if (tag.length > 50) {
          errors.push(`Tag at index ${index} cannot exceed 50 characters`);
        }
      });

      if (input.tags.length > 20) {
        errors.push('Cannot have more than 20 tags');
      }
    }
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Format analytics data for display
 */
export const formatAnalyticsData = (analytics: AnalyticsData) => {
  return {
    summary: {
      totalMemories: analytics.totalMemories.toLocaleString(),
      totalCategories: Object.keys(analytics.categoryCounts).length,
      totalTags: Object.keys(analytics.tagCounts).length,
      avgResponseTime: `${analytics.performanceMetrics.avgResponseTime.toFixed(2)}ms`,
      cacheHitRate: `${(analytics.performanceMetrics.cacheHitRate * 100).toFixed(1)}%`,
      errorRate: `${(analytics.performanceMetrics.errorRate * 100).toFixed(2)}%`
    },
    topCategories: Object.entries(analytics.categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([category, count]) => ({ category, count })),
    topTags: Object.entries(analytics.tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([tag, count]) => ({ tag, count })),
    recentActivity: analytics.recentActivity.map(activity => ({
      ...activity,
      date: new Date(activity.date).toLocaleDateString()
    }))
  };
};

/**
 * Generate search suggestions based on memory content
 */
export const generateSearchSuggestions = (memories: Memory[], query: string, limit: number = 5): string[] => {
  const queryLower = query.toLowerCase();
  const suggestions = new Set<string>();

  memories.forEach(memory => {
    // Extract sentences containing query terms
    const sentences = memory.content.split(/[.!?]+/);
    sentences.forEach(sentence => {
      const sentenceLower = sentence.toLowerCase();
      if (sentenceLower.includes(queryLower) && sentence.trim().length > query.length) {
        // Extract meaningful phrases
        const words = sentence.trim().split(/\s+/);
        for (let i = 0; i < words.length - 1; i++) {
          const phrase = words.slice(i, i + 3).join(' ').replace(/[^\w\s]/g, '').trim();
          if (phrase.toLowerCase().includes(queryLower) && phrase.length > query.length) {
            suggestions.add(phrase);
          }
        }
      }
    });

    // Add relevant tags
    memory.tags.forEach(tag => {
      if (tag.toLowerCase().includes(queryLower)) {
        suggestions.add(tag);
      }
    });
  });

  return Array.from(suggestions).slice(0, limit);
};

/**
 * Calculate similarity between two memories
 */
export const calculateMemorySimilarity = (memory1: Memory, memory2: Memory): number => {
  let similarity = 0;

  // Category match
  if (memory1.category === memory2.category) {
    similarity += 0.3;
  }

  // Tag overlap
  const tags1 = new Set(memory1.tags);
  const tags2 = new Set(memory2.tags);
  const commonTags = new Set([...tags1].filter(tag => tags2.has(tag)));
  const tagSimilarity = commonTags.size / Math.max(tags1.size, tags2.size);
  similarity += tagSimilarity * 0.4;

  // Content similarity (simple word overlap)
  const words1 = new Set(memory1.content.toLowerCase().split(/\s+/));
  const words2 = new Set(memory2.content.toLowerCase().split(/\s+/));
  const commonWords = new Set([...words1].filter(word => words2.has(word)));
  const contentSimilarity = commonWords.size / Math.max(words1.size, words2.size);
  similarity += contentSimilarity * 0.3;

  return Math.min(similarity, 1);
};

/**
 * Find similar memories
 */
export const findSimilarMemories = (
  targetMemory: Memory,
  allMemories: Memory[],
  threshold: number = 0.3,
  limit: number = 5
): Memory[] => {
  return allMemories
    .filter(memory => memory.id !== targetMemory.id)
    .map(memory => ({
      ...memory,
      similarity: calculateMemorySimilarity(targetMemory, memory)
    }))
    .filter((memory: any) => memory.similarity >= threshold)
    .sort((a: any, b: any) => b.similarity - a.similarity)
    .slice(0, limit);
};

/**
 * Debounce function for search input
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
};

/**
 * Throttle function for API calls
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Common English stop words
 */
const STOP_WORDS = [
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they', 'have',
  'had', 'what', 'said', 'each', 'which', 'she', 'do', 'how', 'their',
  'if', 'up', 'out', 'many', 'then', 'them', 'these', 'so', 'some',
  'her', 'would', 'make', 'like', 'into', 'him', 'time', 'two', 'more',
  'go', 'no', 'way', 'could', 'my', 'than', 'first', 'been', 'call',
  'who', 'oil', 'sit', 'now', 'find', 'down', 'day', 'did', 'get',
  'come', 'made', 'may', 'part'
];

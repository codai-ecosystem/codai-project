interface SearchFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  tags?: string[];
  author?: string;
  verified?: boolean;
  sortBy?: 'price' | 'rating' | 'downloads' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface SearchResult {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  downloads: number;
  category: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    verified: boolean;
  };
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  verified: boolean;
  qualityScore: number;
}

interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  filters: {
    categories: Array<{ name: string; count: number }>;
    priceRanges: Array<{ label: string; min: number; max: number; count: number }>;
    tags: Array<{ name: string; count: number }>;
  };
}

interface RecommendationContext {
  userId?: string;
  currentAgent?: string;
  userInterests?: string[];
  purchaseHistory?: string[];
  viewHistory?: string[];
}

export class MarketplaceSearchService {
  private readonly CATEGORIES = [
    'Productivity',
    'Development',
    'Design',
    'Marketing',
    'Analytics',
    'Communication',
    'Finance',
    'Education',
    'Entertainment',
    'Utilities',
  ];

  private readonly PRICE_RANGES = [
    { label: 'Free', min: 0, max: 0 },
    { label: 'Under $10', min: 0.01, max: 10 },
    { label: '$10 - $50', min: 10, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: 'Over $100', min: 100, max: Infinity },
  ];

  /**
   * Search for agents in the marketplace
   */
  async searchAgents(query: string, filters: SearchFilters = {}): Promise<SearchResponse> {
    try {
      // Build search parameters
      const searchParams = this.buildSearchQuery(query, filters);

      // TODO: Replace with actual database query
      const mockResults = await this.mockAgentSearch(query, filters);

      // Apply sorting
      const sortedResults = this.sortResults(mockResults, filters.sortBy, filters.sortOrder);

      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const startIndex = (page - 1) * limit;
      const paginatedResults = sortedResults.slice(startIndex, startIndex + limit);

      // Generate filter aggregations
      const filterAggregations = this.generateFilterAggregations(mockResults);

      return {
        results: paginatedResults,
        totalCount: sortedResults.length,
        currentPage: page,
        totalPages: Math.ceil(sortedResults.length / limit),
        filters: filterAggregations,
      };
    } catch (error) {
      console.error('Search failed:', error);
      return {
        results: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
        filters: {
          categories: [],
          priceRanges: [],
          tags: [],
        },
      };
    }
  }

  /**
   * Get personalized recommendations for a user
   */
  async getRecommendations(context: RecommendationContext, limit: number = 10): Promise<SearchResult[]> {
    try {
      // TODO: Implement ML-based recommendation system
      // For now, use rule-based recommendations

      let recommendations: SearchResult[] = [];

      // 1. Similar to purchase history
      if (context.purchaseHistory && context.purchaseHistory.length > 0) {
        const similarAgents = await this.findSimilarAgents(context.purchaseHistory);
        recommendations.push(...similarAgents.slice(0, 4));
      }

      // 2. Popular in user's interests
      if (context.userInterests && context.userInterests.length > 0) {
        const interestBasedAgents = await this.findByCategories(context.userInterests);
        recommendations.push(...interestBasedAgents.slice(0, 3));
      }

      // 3. Trending agents
      const trendingAgents = await this.getTrendingAgents();
      recommendations.push(...trendingAgents.slice(0, 3));

      // Remove duplicates and limit results
      const uniqueRecommendations = this.removeDuplicateAgents(recommendations);
      return uniqueRecommendations.slice(0, limit);
    } catch (error) {
      console.error('Recommendations failed:', error);
      return [];
    }
  }

  /**
   * Get featured agents for the homepage
   */
  async getFeaturedAgents(): Promise<SearchResult[]> {
    try {
      // TODO: Replace with actual database query
      const mockFeatured = await this.mockAgentSearch('', {
        sortBy: 'rating',
        sortOrder: 'desc',
        limit: 6,
        verified: true,
      });

      return mockFeatured;
    } catch (error) {
      console.error('Featured agents fetch failed:', error);
      return [];
    }
  }

  /**
   * Get trending agents based on recent downloads and ratings
   */
  async getTrendingAgents(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<SearchResult[]> {
    try {
      // TODO: Implement trending algorithm based on:
      // - Download velocity
      // - Rating velocity
      // - View velocity
      // - Social shares

      // Mock trending calculation
      const allAgents = await this.mockAgentSearch('');
      return allAgents
        .sort((a, b) => (b.downloads * b.rating) - (a.downloads * a.rating))
        .slice(0, 10);
    } catch (error) {
      console.error('Trending agents fetch failed:', error);
      return [];
    }
  }

  /**
   * Get agents by category
   */
  async getAgentsByCategory(category: string, filters: SearchFilters = {}): Promise<SearchResponse> {
    return this.searchAgents('', { ...filters, category });
  }

  /**
   * Get agent suggestions for autocomplete
   */
  async getSearchSuggestions(query: string): Promise<Array<{
    type: 'agent' | 'category' | 'tag' | 'author';
    value: string;
    label: string;
    count?: number;
  }>> {
    try {
      const suggestions: Array<{
        type: 'agent' | 'category' | 'tag' | 'author';
        value: string;
        label: string;
        count?: number;
      }> = [];

      // Agent name suggestions
      const agents = await this.mockAgentSearch(query, { limit: 5 });
      agents.forEach(agent => {
        suggestions.push({
          type: 'agent',
          value: agent.name,
          label: agent.name,
        });
      });

      // Category suggestions
      const matchingCategories = this.CATEGORIES.filter(cat =>
        cat.toLowerCase().includes(query.toLowerCase())
      );
      matchingCategories.forEach(category => {
        suggestions.push({
          type: 'category',
          value: category,
          label: `Category: ${category}`,
        });
      });

      // Tag suggestions (mock)
      const mockTags = ['ai', 'automation', 'productivity', 'design', 'analytics'];
      const matchingTags = mockTags.filter(tag =>
        tag.toLowerCase().includes(query.toLowerCase())
      );
      matchingTags.forEach(tag => {
        suggestions.push({
          type: 'tag',
          value: tag,
          label: `Tag: ${tag}`,
        });
      });

      return suggestions.slice(0, 10);
    } catch (error) {
      console.error('Search suggestions failed:', error);
      return [];
    }
  }

  private buildSearchQuery(query: string, filters: SearchFilters): string {
    // TODO: Implement proper search query building for database
    // This would typically construct SQL or ElasticSearch queries
    return query;
  }

  private async mockAgentSearch(query: string, filters: SearchFilters = {}): Promise<SearchResult[]> {
    // Mock data for development - replace with actual database queries
    const mockAgents: SearchResult[] = [
      {
        id: '1',
        name: 'AI Content Generator',
        description: 'Generate high-quality content for blogs, social media, and marketing materials using advanced AI.',
        price: 29.99,
        rating: 4.8,
        downloads: 1542,
        category: 'Marketing',
        tags: ['ai', 'content', 'marketing', 'automation'],
        author: { id: 'author1', name: 'John Doe', verified: true },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T15:30:00Z',
        verified: true,
        qualityScore: 95,
      },
      {
        id: '2',
        name: 'Code Review Assistant',
        description: 'Automated code review and suggestions for better code quality and security.',
        price: 49.99,
        rating: 4.6,
        downloads: 892,
        category: 'Development',
        tags: ['code', 'review', 'security', 'quality'],
        author: { id: 'author2', name: 'Jane Smith', verified: true },
        createdAt: '2024-01-10T08:00:00Z',
        updatedAt: '2024-01-18T12:00:00Z',
        verified: true,
        qualityScore: 88,
      },
      {
        id: '3',
        name: 'Data Visualization Pro',
        description: 'Create stunning charts, graphs, and dashboards from your data with AI assistance.',
        price: 39.99,
        rating: 4.7,
        downloads: 1205,
        category: 'Analytics',
        tags: ['data', 'visualization', 'charts', 'dashboard'],
        author: { id: 'author3', name: 'Mike Johnson', verified: false },
        createdAt: '2024-01-12T14:00:00Z',
        updatedAt: '2024-01-22T09:15:00Z',
        verified: false,
        qualityScore: 82,
      },
      {
        id: '4',
        name: 'Design System Builder',
        description: 'Build consistent design systems and component libraries for your applications.',
        price: 79.99,
        rating: 4.9,
        downloads: 624,
        category: 'Design',
        tags: ['design', 'system', 'components', 'ui'],
        author: { id: 'author4', name: 'Sarah Wilson', verified: true },
        createdAt: '2024-01-08T16:00:00Z',
        updatedAt: '2024-01-25T11:45:00Z',
        verified: true,
        qualityScore: 96,
      },
      {
        id: '5',
        name: 'Email Automation Suite',
        description: 'Automate your email marketing campaigns with AI-powered personalization.',
        price: 59.99,
        rating: 4.5,
        downloads: 743,
        category: 'Marketing',
        tags: ['email', 'automation', 'marketing', 'personalization'],
        author: { id: 'author5', name: 'David Brown', verified: true },
        createdAt: '2024-01-05T12:30:00Z',
        updatedAt: '2024-01-19T14:20:00Z',
        verified: true,
        qualityScore: 85,
      },
    ];

    // Apply filters
    let filtered = mockAgents;

    if (query) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm) ||
        agent.description.toLowerCase().includes(searchTerm) ||
        agent.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        agent.category.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.category) {
      filtered = filtered.filter(agent => agent.category === filters.category);
    }

    if (filters.priceRange) {
      filtered = filtered.filter(agent =>
        agent.price >= filters.priceRange!.min &&
        agent.price <= filters.priceRange!.max
      );
    }

    if (filters.rating) {
      filtered = filtered.filter(agent => agent.rating >= filters.rating!);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(agent =>
        filters.tags!.some(tag => agent.tags.includes(tag))
      );
    }

    if (filters.verified !== undefined) {
      filtered = filtered.filter(agent => agent.verified === filters.verified);
    }

    return filtered;
  }

  private sortResults(results: SearchResult[], sortBy?: string, sortOrder?: string): SearchResult[] {
    if (!sortBy) return results;

    const order = sortOrder === 'asc' ? 1 : -1;

    return [...results].sort((a, b) => {
      let aVal: any, bVal: any;

      switch (sortBy) {
        case 'price':
          aVal = a.price;
          bVal = b.price;
          break;
        case 'rating':
          aVal = a.rating;
          bVal = b.rating;
          break;
        case 'downloads':
          aVal = a.downloads;
          bVal = b.downloads;
          break;
        case 'created':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case 'updated':
          aVal = new Date(a.updatedAt).getTime();
          bVal = new Date(b.updatedAt).getTime();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return -1 * order;
      if (aVal > bVal) return 1 * order;
      return 0;
    });
  }

  private generateFilterAggregations(results: SearchResult[]): SearchResponse['filters'] {
    const categories = new Map<string, number>();
    const tags = new Map<string, number>();

    results.forEach(agent => {
      // Count categories
      const categoryCount = categories.get(agent.category) || 0;
      categories.set(agent.category, categoryCount + 1);

      // Count tags
      agent.tags.forEach(tag => {
        const tagCount = tags.get(tag) || 0;
        tags.set(tag, tagCount + 1);
      });
    });

    // Count price ranges
    const priceRanges = this.PRICE_RANGES.map(range => {
      const count = results.filter(agent =>
        agent.price >= range.min &&
        (range.max === Infinity ? true : agent.price <= range.max)
      ).length;
      return { ...range, count };
    });

    return {
      categories: Array.from(categories.entries()).map(([name, count]) => ({ name, count })),
      priceRanges,
      tags: Array.from(tags.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20), // Top 20 tags
    };
  }

  private async findSimilarAgents(agentIds: string[]): Promise<SearchResult[]> {
    // TODO: Implement similarity algorithm based on:
    // - Tags similarity
    // - Category similarity
    // - User behavior patterns
    // - Content analysis

    return this.mockAgentSearch('', { limit: 10 });
  }

  private async findByCategories(categories: string[]): Promise<SearchResult[]> {
    const allResults: SearchResult[] = [];

    for (const category of categories) {
      const categoryResults = await this.mockAgentSearch('', { category, limit: 5 });
      allResults.push(...categoryResults);
    }

    return this.removeDuplicateAgents(allResults);
  }

  private removeDuplicateAgents(agents: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    return agents.filter(agent => {
      if (seen.has(agent.id)) {
        return false;
      }
      seen.add(agent.id);
      return true;
    });
  }
}

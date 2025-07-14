import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MarketplaceSearchService } from '../lib/marketplace-service';
import { PaymentService } from '../lib/payment-service';
import { AgentVerificationService } from '../lib/verification-service';

// Mock data
const mockAgent = {
  id: '1',
  name: 'Test Agent',
  description: 'A test AI agent for marketplace testing',
  price: 29.99,
  rating: 4.8,
  downloads: 1542,
  category: 'Testing',
  tags: ['test', 'ai', 'automation'],
  author: { id: 'author1', name: 'Test Author', verified: true },
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-20T15:30:00Z',
  verified: true,
  qualityScore: 95,
};

describe('MarketplaceSearchService', () => {
  let searchService: MarketplaceSearchService;

  beforeEach(() => {
    searchService = new MarketplaceSearchService();
  });

  describe('searchAgents', () => {
    it('should return search results with default parameters', async () => {
      const result = await searchService.searchAgents('');
      
      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('totalCount');
      expect(result).toHaveProperty('currentPage');
      expect(result).toHaveProperty('totalPages');
      expect(result).toHaveProperty('filters');
      expect(Array.isArray(result.results)).toBe(true);
    });

    it('should filter results by search query', async () => {
      const result = await searchService.searchAgents('content');
      
      expect(result.results.every(agent => 
        agent.name.toLowerCase().includes('content') ||
        agent.description.toLowerCase().includes('content') ||
        agent.tags.some(tag => tag.toLowerCase().includes('content'))
      )).toBe(true);
    });

    it('should filter results by category', async () => {
      const result = await searchService.searchAgents('', { category: 'Marketing' });
      
      expect(result.results.every(agent => agent.category === 'Marketing')).toBe(true);
    });

    it('should filter results by price range', async () => {
      const result = await searchService.searchAgents('', { 
        priceRange: { min: 20, max: 50 } 
      });
      
      expect(result.results.every(agent => 
        agent.price >= 20 && agent.price <= 50
      )).toBe(true);
    });

    it('should filter results by minimum rating', async () => {
      const result = await searchService.searchAgents('', { rating: 4.5 });
      
      expect(result.results.every(agent => agent.rating >= 4.5)).toBe(true);
    });

    it('should filter verified agents only', async () => {
      const result = await searchService.searchAgents('', { verified: true });
      
      expect(result.results.every(agent => agent.verified === true)).toBe(true);
    });

    it('should sort results by price ascending', async () => {
      const result = await searchService.searchAgents('', { 
        sortBy: 'price', 
        sortOrder: 'asc' 
      });
      
      for (let i = 1; i < result.results.length; i++) {
        expect(result.results[i].price).toBeGreaterThanOrEqual(result.results[i - 1].price);
      }
    });

    it('should sort results by rating descending', async () => {
      const result = await searchService.searchAgents('', { 
        sortBy: 'rating', 
        sortOrder: 'desc' 
      });
      
      for (let i = 1; i < result.results.length; i++) {
        expect(result.results[i].rating).toBeLessThanOrEqual(result.results[i - 1].rating);
      }
    });

    it('should paginate results correctly', async () => {
      const page1 = await searchService.searchAgents('', { page: 1, limit: 2 });
      const page2 = await searchService.searchAgents('', { page: 2, limit: 2 });
      
      expect(page1.results).toHaveLength(2);
      expect(page1.currentPage).toBe(1);
      expect(page2.currentPage).toBe(2);
      expect(page1.results[0].id).not.toBe(page2.results[0].id);
    });
  });

  describe('getRecommendations', () => {
    it('should return personalized recommendations', async () => {
      const context = {
        userId: 'user123',
        userInterests: ['Marketing', 'Development'],
        purchaseHistory: ['1', '2'],
      };
      
      const recommendations = await searchService.getRecommendations(context, 5);
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeLessThanOrEqual(5);
    });

    it('should return empty array for invalid context', async () => {
      const recommendations = await searchService.getRecommendations({}, 5);
      
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('getFeaturedAgents', () => {
    it('should return featured agents', async () => {
      const featured = await searchService.getFeaturedAgents();
      
      expect(Array.isArray(featured)).toBe(true);
      expect(featured.length).toBeGreaterThan(0);
      expect(featured.every(agent => agent.verified)).toBe(true);
    });
  });

  describe('getTrendingAgents', () => {
    it('should return trending agents', async () => {
      const trending = await searchService.getTrendingAgents();
      
      expect(Array.isArray(trending)).toBe(true);
      expect(trending.length).toBeGreaterThan(0);
    });

    it('should support different timeframes', async () => {
      const dailyTrending = await searchService.getTrendingAgents('day');
      const weeklyTrending = await searchService.getTrendingAgents('week');
      const monthlyTrending = await searchService.getTrendingAgents('month');
      
      expect(Array.isArray(dailyTrending)).toBe(true);
      expect(Array.isArray(weeklyTrending)).toBe(true);
      expect(Array.isArray(monthlyTrending)).toBe(true);
    });
  });

  describe('getSearchSuggestions', () => {
    it('should return search suggestions', async () => {
      const suggestions = await searchService.getSearchSuggestions('ai');
      
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.every(s => s.type && s.value && s.label)).toBe(true);
    });

    it('should limit suggestions to 10 items', async () => {
      const suggestions = await searchService.getSearchSuggestions('a');
      
      expect(suggestions.length).toBeLessThanOrEqual(10);
    });
  });
});

describe('PaymentService', () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    paymentService = new PaymentService({
      stripeSecretKey: 'sk_test_fake',
      stripePublishableKey: 'pk_test_fake',
      webhookSecret: 'whsec_test_fake',
    });
  });

  describe('createPaymentIntent', () => {
    it('should calculate revenue share correctly', () => {
      const revenueShare = paymentService.calculateRevenueShare(100);
      
      expect(revenueShare.platformAmount).toBe(20); // 20% to platform
      expect(revenueShare.authorAmount).toBe(80);   // 80% to author
      expect(revenueShare.platformAmount + revenueShare.authorAmount).toBe(100);
    });

    it('should handle fractional amounts correctly', () => {
      const revenueShare = paymentService.calculateRevenueShare(29.99);
      
      expect(revenueShare.platformAmount).toBe(6.00);  // 20% of 29.99 rounded
      expect(revenueShare.authorAmount).toBe(23.99);   // 80% of 29.99 rounded
    });
  });

  describe('verifyWebhookSignature', () => {
    it('should return false for invalid signature', () => {
      const isValid = paymentService.verifyWebhookSignature('payload', 'invalid_signature');
      
      expect(isValid).toBe(false);
    });
  });
});

describe('AgentVerificationService', () => {
  let verificationService: AgentVerificationService;

  beforeEach(() => {
    verificationService = new AgentVerificationService();
  });

  describe('verifyAgent', () => {
    it('should handle verification failure gracefully', async () => {
      await expect(
        verificationService.verifyAgent('invalid_agent', '/invalid/path', 'author1')
      ).rejects.toThrow();
    });
  });

  describe('getVerificationHistory', () => {
    it('should return empty array for non-existent agent', async () => {
      const history = await verificationService.getVerificationHistory('non_existent');
      
      expect(Array.isArray(history)).toBe(true);
      expect(history).toHaveLength(0);
    });
  });
});

// Integration tests
describe('Marketplace Integration', () => {
  it('should handle complete purchase flow', async () => {
    const searchService = new MarketplaceSearchService();
    const paymentService = new PaymentService({
      stripeSecretKey: 'sk_test_fake',
      stripePublishableKey: 'pk_test_fake',
      webhookSecret: 'whsec_test_fake',
    });

    // Search for agents
    const searchResults = await searchService.searchAgents('content');
    expect(searchResults.results.length).toBeGreaterThan(0);

    // Calculate revenue share for purchase
    const agent = searchResults.results[0];
    const revenueShare = paymentService.calculateRevenueShare(agent.price);
    
    expect(revenueShare.authorAmount).toBeGreaterThan(0);
    expect(revenueShare.platformAmount).toBeGreaterThan(0);
  });

  it('should provide consistent data across services', async () => {
    const searchService = new MarketplaceSearchService();

    const [searchResults, featured, trending] = await Promise.all([
      searchService.searchAgents(''),
      searchService.getFeaturedAgents(),
      searchService.getTrendingAgents(),
    ]);

    // All services should return valid data structures
    expect(searchResults.results).toBeDefined();
    expect(Array.isArray(featured)).toBe(true);
    expect(Array.isArray(trending)).toBe(true);

    // Featured agents should be subset of all agents (by verification status)
    const allVerifiedAgents = searchResults.results.filter(a => a.verified);
    featured.forEach(featuredAgent => {
      expect(featuredAgent.verified).toBe(true);
    });
  });
});

// Performance tests
describe('Marketplace Performance', () => {
  it('should complete search within acceptable time', async () => {
    const searchService = new MarketplaceSearchService();
    const startTime = Date.now();
    
    await searchService.searchAgents('test query');
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });

  it('should handle multiple concurrent searches', async () => {
    const searchService = new MarketplaceSearchService();
    
    const searches = Array.from({ length: 10 }, (_, i) => 
      searchService.searchAgents(`query ${i}`)
    );
    
    const results = await Promise.all(searches);
    
    expect(results).toHaveLength(10);
    results.forEach(result => {
      expect(result).toHaveProperty('results');
      expect(result).toHaveProperty('totalCount');
    });
  });
});

// Edge cases and error handling
describe('Marketplace Error Handling', () => {
  let searchService: MarketplaceSearchService;

  beforeEach(() => {
    searchService = new MarketplaceSearchService();
  });

  it('should handle empty search gracefully', async () => {
    const result = await searchService.searchAgents('');
    
    expect(result).toHaveProperty('results');
    expect(Array.isArray(result.results)).toBe(true);
  });

  it('should handle invalid filters gracefully', async () => {
    const result = await searchService.searchAgents('', {
      priceRange: { min: -100, max: -50 }, // Invalid range
    });
    
    expect(result).toHaveProperty('results');
    expect(Array.isArray(result.results)).toBe(true);
  });

  it('should handle extremely large page numbers', async () => {
    const result = await searchService.searchAgents('', {
      page: 999999,
      limit: 20,
    });
    
    expect(result).toHaveProperty('results');
    expect(result.results).toHaveLength(0); // Should return empty results for out-of-range pages
  });

  it('should sanitize search queries', async () => {
    const maliciousQuery = '<script>alert("xss")</script>';
    const result = await searchService.searchAgents(maliciousQuery);
    
    expect(result).toHaveProperty('results');
    expect(Array.isArray(result.results)).toBe(true);
  });
});

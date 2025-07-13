/**
 * MarketAI Service - The Codai Marketplace for AI Tools, Agents & Services
 * Central hub for buying/selling AI agents, automations, workflows, templates and services
 */

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  category: 'agents' | 'templates' | 'integrations' | 'plugins' | 'datasets' | 'workflows' | 'services';
  subcategory: string;
  type: 'free' | 'paid' | 'subscription' | 'usage_based';
  price: {
    amount: number;
    currency: 'USD' | 'EUR' | 'KODEX' | 'RON';
    billingPeriod?: 'one_time' | 'monthly' | 'yearly' | 'per_use';
  };
  sellerId: string; // Changed from seller to sellerId
  media: {
    images: string[];
    videos?: string[];
    demo?: string;
    screenshots: string[];
  };
  metadata: {
    version: string;
    compatibility: string[];
    requirements: string[];
    fileSize?: number;
    lastUpdated: Date;
    downloads: number;
    likes: number;
    tags: string[];
    moderationReason?: string;
    flagged?: boolean;
    flagReason?: string;
    flaggedBy?: string;
    flaggedAt?: Date;
  };
  features: string[];
  documentation: {
    readme: string;
    installation: string;
    usage: string;
    examples: string[];
    apiReference?: string;
  };
  reviews: MarketplaceReview[];
  status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'archived';
  aiGenerated: boolean;
  verificationLevel: 'basic' | 'verified' | 'premium' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
}

interface MarketplaceReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number; // 1-5
  title: string;
  content: string;
  pros: string[];
  cons: string[];
  verified: boolean;
  helpful: number;
  createdAt: Date;
  response?: {
    from: 'seller' | 'admin';
    content: string;
    createdAt: Date;
  };
}

interface Purchase {
  id: string;
  itemId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  paymentMethod: 'stripe' | 'kodex' | 'crypto';
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
  transactionHash?: string;
  license: {
    type: 'personal' | 'commercial' | 'enterprise';
    expiresAt?: Date;
    seats?: number;
    transferable: boolean;
  };
  downloadInfo?: {
    downloadCount: number;
    maxDownloads: number;
    downloadLinks: string[];
    expiresAt: Date;
  };
  createdAt: Date;
  completedAt?: Date;
}

interface SellerProfile {
  id: string;
  userId: string;
  businessName?: string;
  displayName: string;
  bio: string;
  avatar: string;
  banner?: string;
  location: string;
  website?: string;
  socialLinks: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    discord?: string;
  };
  verified: boolean;
  verificationLevel: 'basic' | 'verified' | 'premium' | 'enterprise';
  stats: {
    totalSales: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
    totalItems: number;
    joinedAt: Date;
    lastActive: Date;
  };
  paymentInfo: {
    stripeAccountId?: string;
    walletAddress?: string;
    taxId?: string;
    payoutMethod: 'stripe' | 'crypto' | 'bank_transfer';
  };
  preferences: {
    currency: string;
    autoApprove: boolean;
    notifications: {
      sales: boolean;
      reviews: boolean;
      updates: boolean;
    };
  };
}

interface MarketplaceMetrics {
  overview: {
    totalItems: number;
    totalSellers: number;
    totalBuyers: number;
    totalRevenue: number;
    monthlyActiveUsers: number;
  };
  categories: Record<string, {
    count: number;
    revenue: number;
    avgPrice: number;
    topSellers: string[];
  }>;
  trending: {
    mostDownloaded: MarketplaceItem[];
    topRated: MarketplaceItem[];
    recentlyAdded: MarketplaceItem[];
    fastestGrowing: MarketplaceItem[];
  };
  analytics: {
    conversionRate: number;
    averageOrderValue: number;
    refundRate: number;
    userRetention: number;
  };
}

interface AIRecommendation {
  itemId: string;
  reason: string;
  confidence: number;
  category: 'similar_purchases' | 'trending' | 'personalized' | 'collaborative';
}

function generateMarketId(): string {
  return 'market_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

export class MarketAIService {
  private static instance: MarketAIService;
  private items: Map<string, MarketplaceItem> = new Map();
  private purchases: Map<string, Purchase> = new Map();
  private sellers: Map<string, SellerProfile> = new Map();
  private userPreferences: Map<string, any> = new Map();

  static getInstance(): MarketAIService {
    if (!MarketAIService.instance) {
      MarketAIService.instance = new MarketAIService();
    }
    return MarketAIService.instance;
  }

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Create sample sellers
    const sampleSellers: Partial<SellerProfile>[] = [
      {
        id: 'seller-001',
        userId: 'user-001',
        displayName: 'AI Agent Studio',
        bio: 'Professional AI agent development team specializing in trading and automation bots',
        location: 'Bucharest, Romania',
        verified: true,
        verificationLevel: 'enterprise'
      },
      {
        id: 'seller-002',
        userId: 'user-002',
        displayName: 'CodeCraft Solutions',
        bio: 'Templates and integrations for modern development workflows',
        location: 'Cluj-Napoca, Romania',
        verified: true,
        verificationLevel: 'premium'
      },
      {
        id: 'seller-003',
        userId: 'user-003',
        displayName: 'DataFlow Designs',
        bio: 'Specialized in AI datasets and analytics workflows',
        location: 'Timișoara, Romania',
        verified: false,
        verificationLevel: 'basic'
      }
    ];

    sampleSellers.forEach(sellerData => {
      const seller = this.createCompleteSeller(sellerData);
      this.sellers.set(seller.id, seller);
    });

    // Create sample marketplace items
    const sampleItems: Partial<MarketplaceItem>[] = [
      {
        id: 'item-001',
        title: 'Advanced Trading Bot Agent',
        description: 'Sophisticated AI trading agent with machine learning algorithms for cryptocurrency and stock trading',
        category: 'agents',
        subcategory: 'trading',
        type: 'paid',
        price: { amount: 299, currency: 'USD', billingPeriod: 'one_time' },
        sellerId: 'seller-001',
        features: [
          'Real-time market analysis',
          'Risk management algorithms',
          'Portfolio optimization',
          'Backtesting capabilities',
          'Multiple exchange support'
        ],
        metadata: {
          version: '2.1.0',
          compatibility: ['bancai.ro', 'x.codai.ro'],
          requirements: ['Node.js 18+', 'Redis', 'PostgreSQL'],
          lastUpdated: new Date(),
          downloads: 1247,
          likes: 342,
          tags: ['trading', 'ai', 'cryptocurrency', 'automation', 'premium']
        }
      },
      {
        id: 'item-002',
        title: 'Legal Document Generator',
        description: 'AI-powered legal document templates for contracts, NDAs, and compliance documents',
        category: 'agents',
        subcategory: 'legal',
        type: 'subscription',
        price: { amount: 49, currency: 'USD', billingPeriod: 'monthly' },
        sellerId: 'seller-002',
        features: [
          'Contract generation',
          'Multi-jurisdiction support',
          'Compliance checking',
          'Document review',
          'Legal risk assessment'
        ],
        metadata: {
          version: '1.5.2',
          compatibility: ['legalizai.ro'],
          requirements: ['API access'],
          lastUpdated: new Date(),
          downloads: 856,
          likes: 203,
          tags: ['legal', 'contracts', 'compliance', 'documents', 'ai-generated']
        }
      },
      {
        id: 'item-003',
        title: 'Next.js + AI Starter Template',
        description: 'Complete full-stack template with AI integration, authentication, and deployment ready',
        category: 'templates',
        subcategory: 'web_development',
        type: 'paid',
        price: { amount: 89, currency: 'USD', billingPeriod: 'one_time' },
        sellerId: 'seller-002',
        features: [
          'Next.js 15 setup',
          'TypeScript configuration',
          'AI API integration',
          'Authentication system',
          'Database setup',
          'Deployment scripts'
        ],
        metadata: {
          version: '3.0.1',
          compatibility: ['Vercel', 'Railway', 'Digital Ocean'],
          requirements: ['Node.js 18+', 'Git'],
          lastUpdated: new Date(),
          downloads: 2341,
          likes: 567,
          tags: ['nextjs', 'typescript', 'template', 'ai', 'fullstack']
        }
      },
      {
        id: 'item-004',
        title: 'Romanian Language Dataset',
        description: 'Comprehensive Romanian language dataset for AI training and fine-tuning',
        category: 'datasets',
        subcategory: 'language',
        type: 'paid',
        price: { amount: 150, currency: 'EUR', billingPeriod: 'one_time' },
        sellerId: 'seller-003',
        features: [
          '10M+ sentences',
          'Multiple domains',
          'Cleaned and annotated',
          'CSV and JSON formats',
          'Commercial license'
        ],
        metadata: {
          version: '2.0.0',
          compatibility: ['TensorFlow', 'PyTorch', 'Hugging Face'],
          requirements: ['10GB storage'],
          fileSize: 8500000000, // 8.5GB
          lastUpdated: new Date(),
          downloads: 127,
          likes: 89,
          tags: ['romanian', 'language', 'nlp', 'dataset', 'training']
        }
      },
      {
        id: 'item-005',
        title: 'Customer Support AI Workflow',
        description: 'Complete customer support automation workflow with ticket routing and response generation',
        category: 'workflows',
        subcategory: 'customer_service',
        type: 'free',
        price: { amount: 0, currency: 'USD', billingPeriod: 'one_time' },
        sellerId: 'seller-001',
        features: [
          'Automatic ticket classification',
          'Response generation',
          'Sentiment analysis',
          'Escalation rules',
          'Analytics dashboard'
        ],
        metadata: {
          version: '1.2.0',
          compatibility: ['ajutai.ro', 'Zendesk', 'Intercom'],
          requirements: ['API access'],
          lastUpdated: new Date(),
          downloads: 3456,
          likes: 892,
          tags: ['customer-service', 'automation', 'free', 'workflow', 'support']
        }
      }
    ];

    sampleItems.forEach(itemData => {
      const item = this.createCompleteItem(itemData);
      this.items.set(item.id, item);
    });

    // Create sample purchases
    const samplePurchases: Partial<Purchase>[] = [
      {
        id: 'purchase-001',
        itemId: 'item-001',
        buyerId: 'user-101',
        sellerId: 'seller-001',
        amount: 299,
        currency: 'USD',
        paymentMethod: 'stripe',
        status: 'completed',
        license: { type: 'personal', transferable: false }
      },
      {
        id: 'purchase-002',
        itemId: 'item-003',
        buyerId: 'user-102',
        sellerId: 'seller-002',
        amount: 89,
        currency: 'USD',
        paymentMethod: 'kodex',
        status: 'completed',
        license: { type: 'commercial', transferable: true }
      }
    ];

    samplePurchases.forEach(purchaseData => {
      const purchase = this.createCompletePurchase(purchaseData);
      this.purchases.set(purchase.id, purchase);
    });
  }

  private createCompleteSeller(sellerData: Partial<SellerProfile>): SellerProfile {
    const now = new Date();

    return {
      id: sellerData.id || generateMarketId(),
      userId: sellerData.userId || 'unknown',
      displayName: sellerData.displayName || 'Anonymous Seller',
      bio: sellerData.bio || '',
      avatar: '/avatars/seller-default.jpg',
      location: sellerData.location || 'Unknown',
      verified: sellerData.verified || false,
      verificationLevel: sellerData.verificationLevel || 'basic',
      stats: {
        totalSales: Math.floor(Math.random() * 100),
        totalRevenue: Math.floor(Math.random() * 10000),
        averageRating: 4.0 + Math.random(),
        totalReviews: Math.floor(Math.random() * 50),
        totalItems: Math.floor(Math.random() * 20) + 1,
        joinedAt: new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        lastActive: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      },
      paymentInfo: {
        payoutMethod: 'stripe'
      },
      preferences: {
        currency: 'USD',
        autoApprove: false,
        notifications: {
          sales: true,
          reviews: true,
          updates: true
        }
      },
      socialLinks: {}
    };
  }

  private createCompleteItem(itemData: Partial<MarketplaceItem>): MarketplaceItem {
    const now = new Date();
    const seller = Array.from(this.sellers.values()).find(s => s.id === itemData.sellerId);

    return {
      id: itemData.id || generateMarketId(),
      title: itemData.title || 'Untitled Item',
      description: itemData.description || '',
      category: itemData.category || 'services',
      subcategory: itemData.subcategory || 'general',
      type: itemData.type || 'free',
      price: itemData.price || { amount: 0, currency: 'USD', billingPeriod: 'one_time' },
      sellerId: itemData.sellerId!,
      media: {
        images: ['/marketplace/default-item.jpg'],
        screenshots: ['/marketplace/screenshot-1.jpg']
      },
      metadata: {
        version: '1.0.0',
        compatibility: [],
        requirements: [],
        lastUpdated: now,
        downloads: 0,
        likes: 0,
        tags: [],
        ...itemData.metadata
      },
      features: itemData.features || [],
      documentation: {
        readme: '# ' + (itemData.title || 'Item'),
        installation: 'Installation instructions...',
        usage: 'Usage instructions...',
        examples: ['Example 1', 'Example 2']
      },
      reviews: this.generateMockReviews(),
      status: 'approved',
      aiGenerated: Math.random() > 0.7,
      verificationLevel: seller?.verificationLevel || 'verified',
      createdAt: new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      updatedAt: now
    };
  }

  private createCompletePurchase(purchaseData: Partial<Purchase>): Purchase {
    const now = new Date();

    return {
      id: purchaseData.id || generateMarketId(),
      itemId: purchaseData.itemId || '',
      buyerId: purchaseData.buyerId || '',
      sellerId: purchaseData.sellerId || '',
      amount: purchaseData.amount || 0,
      currency: purchaseData.currency || 'USD',
      paymentMethod: purchaseData.paymentMethod || 'stripe',
      status: purchaseData.status || 'pending',
      license: purchaseData.license || { type: 'personal', transferable: false },
      createdAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      completedAt: purchaseData.status === 'completed' ?
        new Date(now.getTime() - Math.random() * 20 * 24 * 60 * 60 * 1000) : undefined
    };
  }

  private generateMockReviews(): MarketplaceReview[] {
    const reviewCount = Math.floor(Math.random() * 10);
    const reviews: MarketplaceReview[] = [];

    for (let i = 0; i < reviewCount; i++) {
      reviews.push({
        id: generateMarketId(),
        userId: `user-${100 + i}`,
        userName: `User ${100 + i}`,
        userAvatar: `/avatars/user-${100 + i}.jpg`,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars mostly
        title: ['Great product!', 'Very useful', 'Excellent quality', 'Highly recommended'][Math.floor(Math.random() * 4)],
        content: 'This item exceeded my expectations. Great documentation and easy to integrate.',
        pros: ['Easy to use', 'Good documentation', 'Fast support'],
        cons: ['Could use more examples'],
        verified: Math.random() > 0.3,
        helpful: Math.floor(Math.random() * 20),
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
      });
    }

    return reviews;
  }

  // Marketplace Item Management
  async createItem(itemData: {
    title: string;
    description: string;
    category: MarketplaceItem['category'];
    subcategory: string;
    type: MarketplaceItem['type'];
    price: MarketplaceItem['price'];
    features: string[];
    tags: string[];
    compatibility: string[];
    requirements: string[];
    sellerId: string;
  }): Promise<MarketplaceItem> {
    const item = this.createCompleteItem({
      ...itemData,
      sellerId: itemData.sellerId!,
      status: 'draft',
      metadata: {
        version: '1.0.0',
        compatibility: itemData.compatibility,
        requirements: itemData.requirements,
        lastUpdated: new Date(),
        downloads: 0,
        likes: 0,
        tags: itemData.tags
      }
    });

    this.items.set(item.id, item);
    return item;
  }

  async updateItem(itemId: string, updates: Partial<MarketplaceItem>): Promise<MarketplaceItem | null> {
    const item = this.items.get(itemId);
    if (!item) return null;

    const updatedItem = {
      ...item,
      ...updates,
      updatedAt: new Date(),
      metadata: { ...item.metadata, ...updates.metadata }
    };

    this.items.set(itemId, updatedItem);
    return updatedItem;
  }

  async publishItem(itemId: string): Promise<boolean> {
    const item = this.items.get(itemId);
    if (!item || item.status !== 'draft') return false;

    item.status = 'pending_review';
    item.updatedAt = new Date();
    this.items.set(itemId, item);

    // Simulate review process
    setTimeout(() => {
      item.status = 'approved';
      this.items.set(itemId, item);
    }, 5000);

    return true;
  }

  async searchItems(query: {
    category?: MarketplaceItem['category'];
    subcategory?: string;
    type?: MarketplaceItem['type'];
    priceRange?: { min: number; max: number };
    tags?: string[];
    verified?: boolean;
    sortBy?: 'popular' | 'recent' | 'price_low' | 'price_high' | 'rating';
    limit?: number;
    offset?: number;
  }): Promise<{
    items: MarketplaceItem[];
    total: number;
    facets: {
      categories: Record<string, number>;
      types: Record<string, number>;
    };
  }> {
    let items = Array.from(this.items.values()).filter(item => item.status === 'approved');

    // Apply filters
    if (query.category) {
      items = items.filter(item => item.category === query.category);
    }

    if (query.subcategory) {
      items = items.filter(item => item.subcategory === query.subcategory);
    }

    if (query.type) {
      items = items.filter(item => item.type === query.type);
    }

    if (query.priceRange) {
      items = items.filter(item =>
        item.price.amount >= query.priceRange!.min &&
        item.price.amount <= query.priceRange!.max
      );
    }

    if (query.tags && query.tags.length > 0) {
      items = items.filter(item =>
        query.tags!.some(tag => item.metadata.tags.includes(tag))
      );
    }

    if (query.verified) {
      items = items.filter(item => {
        const seller = this.sellers.get(item.sellerId);
        return seller?.verified;
      });
    }

    // Calculate facets
    const facets = {
      categories: items.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      types: items.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };

    // Apply sorting
    switch (query.sortBy) {
      case 'popular':
        items.sort((a, b) => b.metadata.downloads - a.metadata.downloads);
        break;
      case 'recent':
        items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'price_low':
        items.sort((a, b) => a.price.amount - b.price.amount);
        break;
      case 'price_high':
        items.sort((a, b) => b.price.amount - a.price.amount);
        break;
      case 'rating':
        items.sort((a, b) => {
          const sellerA = this.sellers.get(a.sellerId);
          const sellerB = this.sellers.get(b.sellerId);
          return (sellerB?.stats.averageRating || 0) - (sellerA?.stats.averageRating || 0);
        });
        break;
      default:
        items.sort((a, b) => b.metadata.downloads - a.metadata.downloads);
    }

    const total = items.length;
    const offset = query.offset || 0;
    const limit = query.limit || 20;

    items = items.slice(offset, offset + limit);

    return { items, total, facets };
  }

  async getItemDetails(itemId: string): Promise<MarketplaceItem | null> {
    const item = this.items.get(itemId);
    if (!item) return null;

    // Increment view count (mock)
    item.metadata.downloads = item.metadata.downloads || 0;

    return item;
  }

  // Purchase Management
  async purchaseItem(
    itemId: string,
    buyerId: string,
    paymentMethod: Purchase['paymentMethod'],
    licenseType: Purchase['license']['type'] = 'personal'
  ): Promise<Purchase> {
    const item = this.items.get(itemId);
    if (!item) throw new Error('Item not found');

    const purchase = this.createCompletePurchase({
      itemId,
      buyerId,
      sellerId: item.sellerId,
      amount: item.price.amount,
      currency: item.price.currency,
      paymentMethod,
      status: 'pending',
      license: { type: licenseType, transferable: licenseType !== 'personal' }
    });

    this.purchases.set(purchase.id, purchase);

    // Simulate payment processing
    setTimeout(() => {
      purchase.status = 'completed';
      purchase.completedAt = new Date();

      // Update item stats
      item.metadata.downloads++;

      // Update seller stats
      const seller = this.sellers.get(item.sellerId);
      if (seller) {
        seller.stats.totalSales++;
        seller.stats.totalRevenue += purchase.amount;
      }

      this.purchases.set(purchase.id, purchase);
      this.items.set(itemId, item);
    }, 3000);

    return purchase;
  }

  async getPurchaseHistory(userId: string): Promise<Purchase[]> {
    return Array.from(this.purchases.values())
      .filter(purchase => purchase.buyerId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getSalesHistory(sellerId: string): Promise<Purchase[]> {
    return Array.from(this.purchases.values())
      .filter(purchase => purchase.sellerId === sellerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Review Management
  async addReview(
    itemId: string,
    userId: string,
    reviewData: {
      rating: number;
      title: string;
      content: string;
      pros: string[];
      cons: string[];
    }
  ): Promise<MarketplaceReview> {
    const item = this.items.get(itemId);
    if (!item) throw new Error('Item not found');

    // Check if user purchased the item
    const hasPurchased = Array.from(this.purchases.values()).some(
      p => p.itemId === itemId && p.buyerId === userId && p.status === 'completed'
    );

    const review: MarketplaceReview = {
      id: generateMarketId(),
      userId,
      userName: `User ${userId.slice(-4)}`,
      userAvatar: `/avatars/${userId}.jpg`,
      rating: Math.max(1, Math.min(5, reviewData.rating)),
      title: reviewData.title,
      content: reviewData.content,
      pros: reviewData.pros,
      cons: reviewData.cons,
      verified: hasPurchased,
      helpful: 0,
      createdAt: new Date()
    };

    item.reviews.push(review);
    this.items.set(itemId, item);

    // Update seller rating
    const seller = this.sellers.get(item.sellerId);
    if (seller) {
      const allReviews = Array.from(this.items.values())
        .filter(i => i.sellerId === seller.id)
        .flatMap(i => i.reviews);

      seller.stats.averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      seller.stats.totalReviews = allReviews.length;
      this.sellers.set(seller.id, seller);
    }

    return review;
  }

  // AI Recommendations
  async getRecommendations(
    userId: string,
    context?: {
      currentItem?: string;
      category?: string;
      budget?: number;
    }
  ): Promise<AIRecommendation[]> {
    // Simulate AI recommendation engine
    await new Promise(resolve => setTimeout(resolve, 500));

    const userPurchases = await this.getPurchaseHistory(userId);
    const userPrefs = this.userPreferences.get(userId) || {};

    const recommendations: AIRecommendation[] = [];
    const items = Array.from(this.items.values()).filter(item => item.status === 'approved');

    // Collaborative filtering - users who bought similar items
    if (userPurchases.length > 0) {
      const similarItems = items
        .filter(item => !userPurchases.some(p => p.itemId === item.id))
        .filter(item => userPurchases.some(p => {
          const purchasedItem = this.items.get(p.itemId);
          return purchasedItem && purchasedItem.category === item.category;
        }))
        .slice(0, 3);

      similarItems.forEach(item => {
        recommendations.push({
          itemId: item.id,
          reason: `Popular among users who bought similar ${item.category} items`,
          confidence: 0.75,
          category: 'collaborative'
        });
      });
    }

    // Trending items
    const trending = items
      .sort((a, b) => b.metadata.downloads - a.metadata.downloads)
      .slice(0, 2);

    trending.forEach(item => {
      if (!recommendations.some(r => r.itemId === item.id)) {
        recommendations.push({
          itemId: item.id,
          reason: `Trending in ${item.category}`,
          confidence: 0.6,
          category: 'trending'
        });
      }
    });

    // Category-based recommendations
    if (context?.category) {
      const categoryItems = items
        .filter(item => item.category === context.category)
        .filter(item => !recommendations.some(r => r.itemId === item.id))
        .sort((a, b) => {
          const sellerA = this.sellers.get(a.sellerId);
          const sellerB = this.sellers.get(b.sellerId);
          return (sellerB?.stats.averageRating || 0) - (sellerA?.stats.averageRating || 0);
        })
        .slice(0, 2);

      categoryItems.forEach(item => {
        recommendations.push({
          itemId: item.id,
          reason: `Highly rated ${context.category} item`,
          confidence: 0.8,
          category: 'personalized'
        });
      });
    }

    return recommendations.slice(0, 6);
  }

  // Seller Management
  async createSellerProfile(profileData: {
    userId: string;
    displayName: string;
    bio: string;
    location: string;
    website?: string;
    socialLinks?: SellerProfile['socialLinks'];
  }): Promise<SellerProfile> {
    const seller = this.createCompleteSeller(profileData);
    this.sellers.set(seller.id, seller);
    return seller;
  }

  async updateSellerProfile(sellerId: string, updates: Partial<SellerProfile>): Promise<SellerProfile | null> {
    const seller = this.sellers.get(sellerId);
    if (!seller) return null;

    const updatedSeller = { ...seller, ...updates };
    this.sellers.set(sellerId, updatedSeller);
    return updatedSeller;
  }

  async getSellerProfile(sellerId: string): Promise<SellerProfile | null> {
    return this.sellers.get(sellerId) || null;
  }

  async getSellerItems(sellerId: string): Promise<MarketplaceItem[]> {
    return Array.from(this.items.values())
      .filter(item => item.sellerId === sellerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Analytics and Metrics
  async getMarketplaceMetrics(): Promise<MarketplaceMetrics> {
    const items = Array.from(this.items.values());
    const purchases = Array.from(this.purchases.values());
    const sellers = Array.from(this.sellers.values());

    const now = new Date();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentPurchases = purchases.filter(p => p.createdAt > lastMonth);

    // Category analysis
    const categories: Record<string, any> = {};
    items.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = {
          count: 0,
          revenue: 0,
          avgPrice: 0,
          topSellers: []
        };
      }
      categories[item.category].count++;
    });

    purchases.forEach(purchase => {
      const item = this.items.get(purchase.itemId);
      if (item && purchase.status === 'completed') {
        categories[item.category].revenue += purchase.amount;
      }
    });

    Object.keys(categories).forEach(cat => {
      const catItems = items.filter(i => i.category === cat);
      categories[cat].avgPrice = catItems.reduce((sum, item) => sum + item.price.amount, 0) / catItems.length;
    });

    return {
      overview: {
        totalItems: items.length,
        totalSellers: sellers.length,
        totalBuyers: new Set(purchases.map(p => p.buyerId)).size,
        totalRevenue: purchases
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0),
        monthlyActiveUsers: new Set([
          ...recentPurchases.map(p => p.buyerId),
          ...recentPurchases.map(p => p.sellerId)
        ]).size
      },
      categories,
      trending: {
        mostDownloaded: items
          .sort((a, b) => b.metadata.downloads - a.metadata.downloads)
          .slice(0, 5),
        topRated: items
          .filter(item => item.reviews.length > 0)
          .sort((a, b) => {
            const avgA = a.reviews.reduce((sum, r) => sum + r.rating, 0) / a.reviews.length;
            const avgB = b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length;
            return avgB - avgA;
          })
          .slice(0, 5),
        recentlyAdded: items
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5),
        fastestGrowing: items
          .filter(item => item.metadata.downloads > 10)
          .sort((a, b) => {
            // Mock growth calculation
            const growthA = a.metadata.downloads / Math.max(1, (now.getTime() - a.createdAt.getTime()) / (24 * 60 * 60 * 1000));
            const growthB = b.metadata.downloads / Math.max(1, (now.getTime() - b.createdAt.getTime()) / (24 * 60 * 60 * 1000));
            return growthB - growthA;
          })
          .slice(0, 5)
      },
      analytics: {
        conversionRate: 12.5, // Mock percentage
        averageOrderValue: purchases
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0) / Math.max(1, purchases.filter(p => p.status === 'completed').length),
        refundRate: purchases.filter(p => p.status === 'refunded').length / Math.max(1, purchases.length) * 100,
        userRetention: 68.5 // Mock percentage
      }
    };
  }

  // Admin functions
  async moderateItem(itemId: string, action: 'approve' | 'reject', reason?: string): Promise<boolean> {
    const item = this.items.get(itemId);
    if (!item) return false;

    item.status = action === 'approve' ? 'approved' : 'rejected';
    item.updatedAt = new Date();

    if (reason) {
      item.metadata = { ...item.metadata, moderationReason: reason };
    }

    this.items.set(itemId, item);
    return true;
  }

  async flagItem(itemId: string, reason: string, reporterId: string): Promise<boolean> {
    const item = this.items.get(itemId);
    if (!item) return false;

    // In a real implementation, this would create a moderation queue entry
    item.metadata = {
      ...item.metadata,
      flagged: true,
      flagReason: reason,
      flaggedBy: reporterId,
      flaggedAt: new Date()
    };

    this.items.set(itemId, item);
    return true;
  }

  // Public API methods
  async getFeaturedItems(): Promise<MarketplaceItem[]> {
    return Array.from(this.items.values())
      .filter(item => {
        const seller = this.sellers.get(item.sellerId);
        return item.status === 'approved' && seller?.verified;
      })
      .sort((a, b) => b.metadata.downloads - a.metadata.downloads)
      .slice(0, 8);
  }

  async getCategories(): Promise<Array<{
    name: string;
    count: number;
    subcategories: Array<{ name: string; count: number }>;
  }>> {
    const items = Array.from(this.items.values()).filter(item => item.status === 'approved');
    const categoryMap = new Map<string, Map<string, number>>();

    items.forEach(item => {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, new Map());
      }
      const subcategories = categoryMap.get(item.category)!;
      subcategories.set(item.subcategory, (subcategories.get(item.subcategory) || 0) + 1);
    });

    return Array.from(categoryMap.entries()).map(([category, subcategoryMap]) => ({
      name: category,
      count: Array.from(subcategoryMap.values()).reduce((sum, count) => sum + count, 0),
      subcategories: Array.from(subcategoryMap.entries()).map(([name, count]) => ({ name, count }))
    }));
  }
}

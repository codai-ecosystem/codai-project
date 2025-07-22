/**
 * CumparAI Service - AI Shopping Platform
 * 
 * Purpose: cumparai.ro - AI Shopping Platform
 * 
 * Core Features:
 * - AI-powered product recommendations
 * - Smart price comparison and monitoring
 * - Intelligent shopping assistant and chatbot
 * - Personalized deal discovery and alerts
 * - Advanced product search and filtering
 * - Social shopping and reviews integration
 * - Automated purchase optimization
 * - Inventory tracking and management
 */

import { EventEmitter } from 'events';

// Core Interfaces
export interface CumparAIConfig {
  apiKey: string;
  environment: 'development' | 'staging' | 'production';
  paymentGateway: string;
  aiProvider: 'openai' | 'anthropic' | 'local';
  priceComparisonAPIs: string[];
  shippingProviders: string[];
  defaultCurrency: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  images: ProductImage[];
  pricing: ProductPricing;
  specifications: ProductSpecification[];
  availability: ProductAvailability;
  reviews: ProductReview[];
  aiMetadata: ProductAIMetadata;
  seoMetadata: SEOMetadata;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string;
  type: 'thumbnail' | 'main' | 'gallery' | '360_view' | 'ar_model';
  order: number;
  size: { width: number; height: number };
}

export interface ProductPricing {
  basePrice: number;
  currency: string;
  discountPrice?: number;
  discountPercentage?: number;
  priceHistory: PriceHistoryEntry[];
  competitorPrices: CompetitorPrice[];
  promotionalOffers: PromotionalOffer[];
  bulkDiscounts: BulkDiscount[];
  dynamicPricing: DynamicPricing;
}

export interface PriceHistoryEntry {
  price: number;
  date: Date;
  source: string;
  reason?: string;
}

export interface CompetitorPrice {
  competitor: string;
  price: number;
  url: string;
  lastChecked: Date;
  availability: boolean;
  shippingCost?: number;
}

export interface PromotionalOffer {
  id: string;
  type: 'percentage' | 'fixed_amount' | 'buy_x_get_y' | 'free_shipping';
  value: number;
  conditions: OfferCondition[];
  startDate: Date;
  endDate: Date;
  usageCount: number;
  maxUsage?: number;
  isActive: boolean;
}

export interface OfferCondition {
  type: 'minimum_purchase' | 'category' | 'brand' | 'quantity' | 'first_time_buyer';
  value: any;
  operator: 'equals' | 'greater_than' | 'less_than' | 'in' | 'not_in';
}

export interface BulkDiscount {
  quantity: number;
  discountPercentage: number;
  discountAmount: number;
}

export interface DynamicPricing {
  isEnabled: boolean;
  factors: PricingFactor[];
  currentMultiplier: number;
  lastUpdate: Date;
}

export interface PricingFactor {
  type: 'demand' | 'inventory' | 'season' | 'competitor' | 'ai_prediction';
  weight: number;
  value: number;
  impact: number;
}

export interface ProductSpecification {
  name: string;
  value: string;
  unit?: string;
  category: 'technical' | 'physical' | 'performance' | 'warranty' | 'other';
  isSearchable: boolean;
  isComparable: boolean;
}

export interface ProductAvailability {
  inStock: boolean;
  quantity: number;
  restockDate?: Date;
  warehouses: WarehouseStock[];
  shippingInfo: ShippingInfo;
  deliveryEstimate: DeliveryEstimate;
}

export interface WarehouseStock {
  warehouseId: string;
  location: string;
  quantity: number;
  reserved: number;
  available: number;
}

export interface ShippingInfo {
  freeShippingThreshold?: number;
  shippingCost: number;
  expressShipping: {
    available: boolean;
    cost: number;
    deliveryTime: string;
  };
  internationalShipping: {
    available: boolean;
    regions: string[];
    baseCost: number;
  };
}

export interface DeliveryEstimate {
  standard: { min: number; max: number; unit: 'hours' | 'days' };
  express: { min: number; max: number; unit: 'hours' | 'days' };
  nextDay: { available: boolean; cutoffTime: string };
}

export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  rating: number; // 1-5 stars
  title: string;
  content: string;
  images: string[];
  verifiedPurchase: boolean;
  helpfulVotes: number;
  totalVotes: number;
  aiSentiment: ReviewSentiment;
  createdAt: Date;
  updatedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface ReviewSentiment {
  overall: 'positive' | 'neutral' | 'negative';
  score: number; // -1 to 1
  aspects: AspectSentiment[];
  keywords: string[];
  confidence: number;
}

export interface AspectSentiment {
  aspect: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  mentions: number;
}

export interface ProductAIMetadata {
  recommendationScore: number;
  popularity: number;
  trendingScore: number;
  qualityScore: number;
  valueForMoney: number;
  similarProducts: string[];
  complementaryProducts: string[];
  categoryRanking: number;
  aiTags: string[];
  searchKeywords: string[];
  lastAIAnalysis: Date;
}

export interface SEOMetadata {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  schema: any;
  canonicalUrl: string;
}

export interface ShoppingCart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  taxes: number;
  shipping: number;
  discounts: number;
  total: number;
  currency: string;
  appliedCoupons: string[];
  shippingAddress?: Address;
  billingAddress?: Address;
  paymentMethod?: PaymentMethod;
  aiRecommendations: CartRecommendation[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discountApplied?: number;
  addedAt: Date;
  lastModified: Date;
}

export interface CartRecommendation {
  type: 'upsell' | 'cross_sell' | 'better_deal' | 'bundle' | 'complete_set';
  productId: string;
  reason: string;
  potentialSavings?: number;
  confidence: number;
  priority: number;
}

export interface Address {
  id: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'crypto';
  provider: string;
  details: any;
  isDefault: boolean;
  expiresAt?: Date;
  addedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  items: OrderItem[];
  pricing: OrderPricing;
  addresses: { shipping: Address; billing: Address };
  paymentInfo: OrderPayment;
  shipping: OrderShipping;
  timeline: OrderTimeline[];
  aiInsights: OrderAIInsights;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productName: string;
  variantId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
}

export interface OrderPricing {
  subtotal: number;
  taxes: number;
  shipping: number;
  discounts: number;
  total: number;
  currency: string;
  appliedCoupons: string[];
}

export interface OrderPayment {
  method: PaymentMethod;
  transactionId: string;
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
  amount: number;
  currency: string;
  processedAt?: Date;
}

export interface OrderShipping {
  provider: string;
  service: string;
  trackingNumber?: string;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  cost: number;
  status: 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
}

export interface OrderTimeline {
  status: string;
  timestamp: Date;
  description: string;
  location?: string;
}

export interface OrderAIInsights {
  deliveryRisk: 'low' | 'medium' | 'high';
  customerSatisfactionPrediction: number;
  upsellOpportunities: string[];
  nextOrderPrediction: Date;
  churnRisk: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferences: UserPreferences;
  shoppingHistory: UserShoppingHistory;
  wishlist: WishlistItem[];
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  loyaltyProgram: LoyaltyProgram;
  aiProfile: UserAIProfile;
  createdAt: Date;
  lastActivity: Date;
}

export interface UserPreferences {
  categories: string[];
  brands: string[];
  priceRange: { min: number; max: number };
  currency: string;
  language: string;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  priceAlerts: boolean;
  stockAlerts: boolean;
  promotions: boolean;
  orderUpdates: boolean;
}

export interface PrivacySettings {
  shareDataForRecommendations: boolean;
  shareDataForAnalytics: boolean;
  allowPersonalizedAds: boolean;
  shareWithPartners: boolean;
}

export interface UserShoppingHistory {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  favoriteCategories: string[];
  frequentBrands: string[];
  seasonalPatterns: SeasonalPattern[];
  lastOrderDate: Date;
}

export interface SeasonalPattern {
  season: string;
  categories: string[];
  averageSpending: number;
  frequency: number;
}

export interface WishlistItem {
  id: string;
  productId: string;
  addedAt: Date;
  priceWhenAdded: number;
  notifyOnPriceDrop: boolean;
  notifyOnStock: boolean;
}

export interface LoyaltyProgram {
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  totalPointsEarned: number;
  totalPointsRedeemed: number;
  nextTierRequirement: number;
  benefits: string[];
  expiringPoints: ExpiringPoints[];
}

export interface ExpiringPoints {
  points: number;
  expiryDate: Date;
}

export interface UserAIProfile {
  recommendationPreferences: string[];
  behaviorPatterns: BehaviorPattern[];
  predictedInterests: PredictedInterest[];
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  lifetimeValue: number;
  churnRisk: number;
  lastAnalysis: Date;
}

export interface BehaviorPattern {
  type: 'browsing' | 'purchasing' | 'searching' | 'comparing';
  pattern: string;
  frequency: number;
  confidence: number;
  lastObserved: Date;
}

export interface PredictedInterest {
  category: string;
  interest: number; // 0-1 scale
  confidence: number;
  reasoning: string[];
  lastUpdated: Date;
}

export interface SearchQuery {
  query: string;
  filters: SearchFilter[];
  sort: SearchSort;
  page: number;
  limit: number;
  facets: string[];
  userId?: string;
}

export interface SearchFilter {
  field: string;
  operator: 'equals' | 'contains' | 'range' | 'in' | 'not_in';
  value: any;
}

export interface SearchSort {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SearchResult {
  products: Product[];
  total: number;
  facets: SearchFacet[];
  recommendations: ProductRecommendation[];
  aiInsights: SearchAIInsights;
  query: SearchQuery;
  executionTime: number;
}

export interface SearchFacet {
  field: string;
  name: string;
  values: FacetValue[];
}

export interface FacetValue {
  value: string;
  count: number;
  selected: boolean;
}

export interface ProductRecommendation {
  productId: string;
  type: 'trending' | 'similar' | 'complementary' | 'popular' | 'ai_picked';
  reason: string;
  score: number;
  confidence: number;
}

export interface SearchAIInsights {
  intent: 'browse' | 'research' | 'purchase' | 'compare';
  urgency: 'low' | 'medium' | 'high';
  priceConsciousness: number;
  qualityFocus: number;
  suggestions: string[];
  alternativeQueries: string[];
}

export interface PriceAlert {
  id: string;
  userId: string;
  productId: string;
  targetPrice: number;
  currentPrice: number;
  isActive: boolean;
  notificationSent: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  type: 'flash_sale' | 'daily_deal' | 'seasonal' | 'clearance' | 'bundle';
  products: string[];
  discount: {
    type: 'percentage' | 'fixed_amount';
    value: number;
  };
  conditions: DealCondition[];
  startDate: Date;
  endDate: Date;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
  priority: number;
}

export interface DealCondition {
  type: 'minimum_purchase' | 'category' | 'brand' | 'new_customer' | 'loyalty_tier';
  value: any;
  operator: 'equals' | 'greater_than' | 'in';
}

/**
 * CumparAI Service - AI Shopping Platform
 */
export class CumparAIService extends EventEmitter {
  private config: CumparAIConfig;
  private products: Map<string, Product> = new Map();
  private users: Map<string, User> = new Map();
  private carts: Map<string, ShoppingCart> = new Map();
  private orders: Map<string, Order> = new Map();
  private priceAlerts: Map<string, PriceAlert> = new Map();
  private deals: Map<string, Deal> = new Map();

  constructor(config: CumparAIConfig) {
    super();
    this.config = config;
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    await this.loadSampleData();
    this.startBackgroundProcesses();
    this.emit('service:initialized');
  }

  private async loadSampleData(): Promise<void> {
    // Sample Products
    const sampleProducts = [
      {
        id: 'prod-001',
        name: 'iPhone 15 Pro',
        description: 'Latest Apple iPhone with advanced AI capabilities and professional camera system.',
        category: 'Electronics',
        subcategory: 'Smartphones',
        brand: 'Apple',
        images: [
          {
            id: 'img-001',
            url: '/products/iphone-15-pro.jpg',
            altText: 'iPhone 15 Pro in Natural Titanium',
            type: 'main' as const,
            order: 1,
            size: { width: 800, height: 800 }
          }
        ],
        pricing: {
          basePrice: 999.99,
          currency: 'USD',
          discountPrice: 949.99,
          discountPercentage: 5,
          priceHistory: [
            {
              price: 999.99,
              date: new Date('2024-09-15'),
              source: 'Apple Store',
              reason: 'Launch price'
            }
          ],
          competitorPrices: [
            {
              competitor: 'Amazon',
              price: 949.99,
              url: 'https://amazon.com/iphone-15-pro',
              lastChecked: new Date(),
              availability: true,
              shippingCost: 0
            }
          ],
          promotionalOffers: [
            {
              id: 'promo-001',
              type: 'percentage' as const,
              value: 5,
              conditions: [],
              startDate: new Date('2024-12-01'),
              endDate: new Date('2024-12-31'),
              usageCount: 0,
              isActive: true
            }
          ],
          bulkDiscounts: [],
          dynamicPricing: {
            isEnabled: true,
            factors: [
              {
                type: 'demand' as const,
                weight: 0.3,
                value: 0.8,
                impact: 0.05
              }
            ],
            currentMultiplier: 1.0,
            lastUpdate: new Date()
          }
        },
        specifications: [
          {
            name: 'Display Size',
            value: '6.1',
            unit: 'inches',
            category: 'technical' as const,
            isSearchable: true,
            isComparable: true
          },
          {
            name: 'Storage',
            value: '128GB',
            category: 'technical' as const,
            isSearchable: true,
            isComparable: true
          }
        ],
        availability: {
          inStock: true,
          quantity: 50,
          warehouses: [
            {
              warehouseId: 'wh-001',
              location: 'New York',
              quantity: 50,
              reserved: 5,
              available: 45
            }
          ],
          shippingInfo: {
            freeShippingThreshold: 50,
            shippingCost: 0,
            expressShipping: {
              available: true,
              cost: 25,
              deliveryTime: '1-2 days'
            },
            internationalShipping: {
              available: true,
              regions: ['EU', 'Canada'],
              baseCost: 30
            }
          },
          deliveryEstimate: {
            standard: { min: 3, max: 5, unit: 'days' as const },
            express: { min: 1, max: 2, unit: 'days' as const },
            nextDay: { available: true, cutoffTime: '2:00 PM' }
          }
        },
        reviews: [
          {
            id: 'rev-001',
            userId: 'user-001',
            userName: 'John D.',
            rating: 5,
            title: 'Excellent phone!',
            content: 'The AI features are incredible and the camera quality is outstanding.',
            images: [],
            verifiedPurchase: true,
            helpfulVotes: 15,
            totalVotes: 18,
            aiSentiment: {
              overall: 'positive' as const,
              score: 0.9,
              aspects: [
                {
                  aspect: 'camera',
                  sentiment: 'positive' as const,
                  score: 0.95,
                  mentions: 1
                }
              ],
              keywords: ['excellent', 'incredible', 'outstanding'],
              confidence: 0.92
            },
            createdAt: new Date('2024-10-15'),
            updatedAt: new Date('2024-10-15'),
            status: 'approved' as const
          }
        ],
        aiMetadata: {
          recommendationScore: 0.95,
          popularity: 0.9,
          trendingScore: 0.85,
          qualityScore: 0.95,
          valueForMoney: 0.8,
          similarProducts: ['prod-002', 'prod-003'],
          complementaryProducts: ['prod-004', 'prod-005'],
          categoryRanking: 1,
          aiTags: ['premium', 'ai-enabled', 'professional', 'latest'],
          searchKeywords: ['iphone', 'apple', 'smartphone', 'pro', 'ai'],
          lastAIAnalysis: new Date()
        },
        seoMetadata: {
          slug: 'iphone-15-pro',
          metaTitle: 'iPhone 15 Pro - Advanced AI Smartphone | CumparAI',
          metaDescription: 'Buy the latest iPhone 15 Pro with AI capabilities. Best prices, fast shipping, and expert reviews.',
          keywords: ['iPhone 15 Pro', 'Apple smartphone', 'AI phone', 'buy iPhone'],
          schema: {},
          canonicalUrl: 'https://cumparai.ro/products/iphone-15-pro'
        },
        createdAt: new Date('2024-09-15'),
        updatedAt: new Date(),
        status: 'active' as const
      }
    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });

    // Sample Users
    const sampleUsers = [
      {
        id: 'user-001',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        preferences: {
          categories: ['Electronics', 'Books'],
          brands: ['Apple', 'Samsung'],
          priceRange: { min: 0, max: 2000 },
          currency: 'USD',
          language: 'en',
          notifications: {
            email: true,
            sms: false,
            push: true,
            priceAlerts: true,
            stockAlerts: true,
            promotions: false,
            orderUpdates: true
          },
          privacy: {
            shareDataForRecommendations: true,
            shareDataForAnalytics: false,
            allowPersonalizedAds: true,
            shareWithPartners: false
          }
        },
        shoppingHistory: {
          totalOrders: 12,
          totalSpent: 3500.00,
          averageOrderValue: 291.67,
          favoriteCategories: ['Electronics', 'Home'],
          frequentBrands: ['Apple', 'Nike'],
          seasonalPatterns: [
            {
              season: 'Holiday',
              categories: ['Electronics', 'Gifts'],
              averageSpending: 800,
              frequency: 2
            }
          ],
          lastOrderDate: new Date('2024-11-15')
        },
        wishlist: [
          {
            id: 'wish-001',
            productId: 'prod-002',
            addedAt: new Date('2024-11-01'),
            priceWhenAdded: 1299.99,
            notifyOnPriceDrop: true,
            notifyOnStock: false
          }
        ],
        addresses: [],
        paymentMethods: [],
        loyaltyProgram: {
          tier: 'gold' as const,
          points: 2500,
          totalPointsEarned: 5000,
          totalPointsRedeemed: 2500,
          nextTierRequirement: 5000,
          benefits: ['Free shipping', '5% back on purchases', 'Early access to sales'],
          expiringPoints: [
            {
              points: 500,
              expiryDate: new Date('2025-03-01')
            }
          ]
        },
        aiProfile: {
          recommendationPreferences: ['latest_tech', 'premium_quality'],
          behaviorPatterns: [
            {
              type: 'browsing' as const,
              pattern: 'evening_browser',
              frequency: 5,
              confidence: 0.8,
              lastObserved: new Date()
            }
          ],
          predictedInterests: [
            {
              category: 'Smart Home',
              interest: 0.7,
              confidence: 0.8,
              reasoning: ['Recent electronics purchases', 'Browsing smart devices'],
              lastUpdated: new Date()
            }
          ],
          riskProfile: 'moderate' as const,
          lifetimeValue: 5000,
          churnRisk: 0.2,
          lastAnalysis: new Date()
        },
        createdAt: new Date('2024-01-15'),
        lastActivity: new Date()
      }
    ];

    sampleUsers.forEach(user => {
      this.users.set(user.id, user);
    });

    // Sample Deals
    const sampleDeals = [
      {
        id: 'deal-001',
        title: 'Holiday Electronics Sale',
        description: 'Save up to 30% on selected electronics',
        type: 'seasonal' as const,
        products: ['prod-001'],
        discount: {
          type: 'percentage' as const,
          value: 30
        },
        conditions: [
          {
            type: 'minimum_purchase' as const,
            value: 500,
            operator: 'greater_than' as const
          }
        ],
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-31'),
        currentUses: 0,
        isActive: true,
        priority: 1
      }
    ];

    sampleDeals.forEach(deal => {
      this.deals.set(deal.id, deal);
    });
  }

  private startBackgroundProcesses(): void {
    // Update competitor prices every hour
    setInterval(() => {
      this.updateCompetitorPrices();
    }, 3600000);

    // Check price alerts every 30 minutes
    setInterval(() => {
      this.checkPriceAlerts();
    }, 1800000);

    // Update AI recommendations every 6 hours
    setInterval(() => {
      this.updateAIRecommendations();
    }, 21600000);

    // Process dynamic pricing every 15 minutes
    setInterval(() => {
      this.processDynamicPricing();
    }, 900000);
  }

  // Product Management
  async getProduct(productId: string): Promise<Product | null> {
    return this.products.get(productId) || null;
  }

  async searchProducts(query: SearchQuery): Promise<SearchResult> {
    const startTime = Date.now();
    let products = Array.from(this.products.values());

    // Apply filters
    if (query.filters) {
      for (const filter of query.filters) {
        products = this.applyFilter(products, filter);
      }
    }

    // Apply text search
    if (query.query) {
      products = this.searchByText(products, query.query);
    }

    // Apply sorting
    products = this.sortProducts(products, query.sort);

    // Calculate total before pagination
    const total = products.length;

    // Apply pagination
    const start = (query.page - 1) * query.limit;
    const paginatedProducts = products.slice(start, start + query.limit);

    // Generate facets
    const facets = this.generateFacets(Array.from(this.products.values()), query.facets);

    // Generate AI insights
    const aiInsights = await this.generateSearchInsights(query, paginatedProducts);

    // Generate recommendations
    const recommendations = await this.generateSearchRecommendations(query, paginatedProducts);

    const executionTime = Date.now() - startTime;

    this.emit('search:executed', { query, total, executionTime });

    return {
      products: paginatedProducts,
      total,
      facets,
      recommendations,
      aiInsights,
      query,
      executionTime
    };
  }

  private applyFilter(products: Product[], filter: SearchFilter): Product[] {
    return products.filter(product => {
      const value = this.getProductFieldValue(product, filter.field);

      switch (filter.operator) {
        case 'equals':
          return value === filter.value;
        case 'contains':
          return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
        case 'range':
          return value >= filter.value.min && value <= filter.value.max;
        case 'in':
          return Array.isArray(filter.value) && filter.value.includes(value);
        case 'not_in':
          return Array.isArray(filter.value) && !filter.value.includes(value);
        default:
          return true;
      }
    });
  }

  private getProductFieldValue(product: Product, field: string): any {
    switch (field) {
      case 'category': return product.category;
      case 'brand': return product.brand;
      case 'price': return product.pricing.basePrice;
      case 'rating': {
        const avgRating = product.reviews.length > 0
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
          : 0;
        return avgRating;
      }
      default: return null;
    }
  }

  private searchByText(products: Product[], query: string): Product[] {
    const searchTerms = query.toLowerCase().split(' ');

    return products.filter(product => {
      const searchableText = [
        product.name,
        product.description,
        product.brand,
        product.category,
        ...product.aiMetadata.searchKeywords,
        ...product.aiMetadata.aiTags
      ].join(' ').toLowerCase();

      return searchTerms.some(term => searchableText.includes(term));
    }).sort((a, b) => {
      // Calculate relevance score
      const scoreA = this.calculateRelevanceScore(a, searchTerms);
      const scoreB = this.calculateRelevanceScore(b, searchTerms);
      return scoreB - scoreA;
    });
  }

  private calculateRelevanceScore(product: Product, searchTerms: string[]): number {
    let score = 0;
    const text = [product.name, product.description, product.brand].join(' ').toLowerCase();

    for (const term of searchTerms) {
      if (product.name.toLowerCase().includes(term)) score += 10;
      if (product.brand.toLowerCase().includes(term)) score += 5;
      if (text.includes(term)) score += 1;
    }

    // Boost by AI metadata
    score += product.aiMetadata.recommendationScore * 2;
    score += product.aiMetadata.popularity * 1;

    return score;
  }

  private sortProducts(products: Product[], sort: SearchSort): Product[] {
    return products.sort((a, b) => {
      let valueA: any, valueB: any;

      switch (sort.field) {
        case 'price':
          valueA = a.pricing.basePrice;
          valueB = b.pricing.basePrice;
          break;
        case 'rating':
          valueA = a.reviews.length > 0
            ? a.reviews.reduce((sum, r) => sum + r.rating, 0) / a.reviews.length
            : 0;
          valueB = b.reviews.length > 0
            ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length
            : 0;
          break;
        case 'popularity':
          valueA = a.aiMetadata.popularity;
          valueB = b.aiMetadata.popularity;
          break;
        case 'created':
          valueA = a.createdAt.getTime();
          valueB = b.createdAt.getTime();
          break;
        default:
          return 0;
      }

      if (sort.direction === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });
  }

  private generateFacets(products: Product[], requestedFacets: string[]): SearchFacet[] {
    const facets: SearchFacet[] = [];

    for (const facetField of requestedFacets) {
      const facet: SearchFacet = {
        field: facetField,
        name: this.getFacetDisplayName(facetField),
        values: []
      };

      const valueMap = new Map<string, number>();

      for (const product of products) {
        const value = this.getProductFieldValue(product, facetField);
        if (value !== null && value !== undefined) {
          const valueStr = String(value);
          valueMap.set(valueStr, (valueMap.get(valueStr) || 0) + 1);
        }
      }

      facet.values = Array.from(valueMap.entries())
        .map(([value, count]) => ({ value, count, selected: false }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Limit to top 10

      facets.push(facet);
    }

    return facets;
  }

  private getFacetDisplayName(field: string): string {
    const displayNames: Record<string, string> = {
      'category': 'Category',
      'brand': 'Brand',
      'price': 'Price Range',
      'rating': 'Customer Rating'
    };
    return displayNames[field] || field;
  }

  private async generateSearchInsights(query: SearchQuery, products: Product[]): Promise<SearchAIInsights> {
    // AI analysis of search intent and user behavior
    const intent = this.analyzeSearchIntent(query.query);
    const urgency = this.analyzeUrgency(query.query, query.filters);
    const priceConsciousness = this.analyzePriceConsciousness(query.filters);

    return {
      intent,
      urgency,
      priceConsciousness,
      qualityFocus: 0.7, // Placeholder
      suggestions: [
        'Consider checking our featured deals',
        'Free shipping available on orders over $50',
        'Extended warranty options available'
      ],
      alternativeQueries: [
        query.query + ' on sale',
        query.query + ' best price',
        'alternatives to ' + query.query
      ]
    };
  }

  private analyzeSearchIntent(query: string): SearchAIInsights['intent'] {
    const buyKeywords = ['buy', 'purchase', 'order', 'get'];
    const compareKeywords = ['vs', 'compare', 'difference', 'better'];
    const researchKeywords = ['review', 'specs', 'features', 'info'];

    const lowerQuery = query.toLowerCase();

    if (buyKeywords.some(keyword => lowerQuery.includes(keyword))) return 'purchase';
    if (compareKeywords.some(keyword => lowerQuery.includes(keyword))) return 'compare';
    if (researchKeywords.some(keyword => lowerQuery.includes(keyword))) return 'research';

    return 'browse';
  }

  private analyzeUrgency(query: string, filters: SearchFilter[]): SearchAIInsights['urgency'] {
    const urgentKeywords = ['urgent', 'asap', 'immediate', 'today', 'now'];
    const lowerQuery = query.toLowerCase();

    if (urgentKeywords.some(keyword => lowerQuery.includes(keyword))) return 'high';

    // Check if filtering by express shipping
    const hasExpressFilter = filters.some(f =>
      f.field === 'shipping' && String(f.value).includes('express')
    );

    if (hasExpressFilter) return 'medium';

    return 'low';
  }

  private analyzePriceConsciousness(filters: SearchFilter[]): number {
    const priceFilters = filters.filter(f => f.field === 'price');
    if (priceFilters.length === 0) return 0.5; // Neutral

    // If filtering by lower prices, higher price consciousness
    const hasLowPriceFilter = priceFilters.some(f =>
      f.operator === 'range' && f.value.max < 100
    );

    return hasLowPriceFilter ? 0.8 : 0.3;
  }

  private async generateSearchRecommendations(query: SearchQuery, products: Product[]): Promise<ProductRecommendation[]> {
    const recommendations: ProductRecommendation[] = [];

    // Get trending products in same category
    if (products.length > 0) {
      const category = products[0].category;
      const trendingInCategory = Array.from(this.products.values())
        .filter(p => p.category === category)
        .sort((a, b) => b.aiMetadata.trendingScore - a.aiMetadata.trendingScore)
        .slice(0, 3);

      for (const product of trendingInCategory) {
        recommendations.push({
          productId: product.id,
          type: 'trending',
          reason: `Trending in ${category}`,
          score: product.aiMetadata.trendingScore,
          confidence: 0.8
        });
      }
    }

    return recommendations;
  }

  // Shopping Cart Management
  async createCart(userId: string): Promise<ShoppingCart> {
    const cart: ShoppingCart = {
      id: `cart-${Date.now()}`,
      userId,
      items: [],
      subtotal: 0,
      taxes: 0,
      shipping: 0,
      discounts: 0,
      total: 0,
      currency: this.config.defaultCurrency,
      appliedCoupons: [],
      aiRecommendations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    this.carts.set(cart.id, cart);
    this.emit('cart:created', { cart });
    return cart;
  }

  async addToCart(cartId: string, productId: string, quantity: number = 1): Promise<ShoppingCart | null> {
    const cart = this.carts.get(cartId);
    const product = this.products.get(productId);

    if (!cart || !product) return null;

    // Check if item already exists
    const existingItem = cart.items.find(item => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.totalPrice = existingItem.quantity * existingItem.unitPrice;
      existingItem.lastModified = new Date();
    } else {
      const cartItem: CartItem = {
        id: `item-${Date.now()}`,
        productId,
        quantity,
        unitPrice: product.pricing.discountPrice || product.pricing.basePrice,
        totalPrice: (product.pricing.discountPrice || product.pricing.basePrice) * quantity,
        addedAt: new Date(),
        lastModified: new Date()
      };
      cart.items.push(cartItem);
    }

    // Recalculate totals
    await this.recalculateCart(cart);

    // Generate AI recommendations
    cart.aiRecommendations = await this.generateCartRecommendations(cart);

    this.emit('cart:item_added', { cart, productId, quantity });
    return cart;
  }

  private async recalculateCart(cart: ShoppingCart): Promise<void> {
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    cart.taxes = cart.subtotal * 0.08; // 8% tax rate
    cart.shipping = cart.subtotal > 50 ? 0 : 10; // Free shipping over $50
    cart.total = cart.subtotal + cart.taxes + cart.shipping - cart.discounts;
    cart.updatedAt = new Date();
  }

  private async generateCartRecommendations(cart: ShoppingCart): Promise<CartRecommendation[]> {
    const recommendations: CartRecommendation[] = [];

    for (const item of cart.items) {
      const product = this.products.get(item.productId);
      if (!product) continue;

      // Add complementary products
      for (const complementaryId of product.aiMetadata.complementaryProducts) {
        const complementary = this.products.get(complementaryId);
        if (complementary && !cart.items.some(i => i.productId === complementaryId)) {
          recommendations.push({
            type: 'cross_sell',
            productId: complementaryId,
            reason: `Pairs well with ${product.name}`,
            confidence: 0.7,
            priority: 1
          });
        }
      }
    }

    return recommendations.slice(0, 5); // Limit to 5 recommendations
  }

  async getCart(cartId: string): Promise<ShoppingCart | null> {
    return this.carts.get(cartId) || null;
  }

  // Price Monitoring
  async createPriceAlert(userId: string, productId: string, targetPrice: number): Promise<PriceAlert> {
    const product = this.products.get(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    const priceAlert: PriceAlert = {
      id: `alert-${Date.now()}`,
      userId,
      productId,
      targetPrice,
      currentPrice: product.pricing.basePrice,
      isActive: true,
      notificationSent: false,
      createdAt: new Date()
    };

    this.priceAlerts.set(priceAlert.id, priceAlert);
    this.emit('price_alert:created', { priceAlert });
    return priceAlert;
  }

  private async checkPriceAlerts(): Promise<void> {
    for (const alert of this.priceAlerts.values()) {
      if (!alert.isActive || alert.notificationSent) continue;

      const product = this.products.get(alert.productId);
      if (!product) continue;

      const currentPrice = product.pricing.discountPrice || product.pricing.basePrice;
      alert.currentPrice = currentPrice;

      if (currentPrice <= alert.targetPrice) {
        await this.triggerPriceAlert(alert);
        alert.notificationSent = true;
        alert.triggeredAt = new Date();
        this.emit('price_alert:triggered', { alert, product });
      }
    }
  }

  private async triggerPriceAlert(alert: PriceAlert): Promise<void> {
    // Send notification to user
    const user = this.users.get(alert.userId);
    if (user && user.preferences.notifications.priceAlerts) {
      // Implementation would send actual notification
      console.log(`Price alert triggered for user ${alert.userId}: Product ${alert.productId} is now ${alert.currentPrice}`);
    }
  }

  // Background Processes
  private async updateCompetitorPrices(): Promise<void> {
    for (const product of this.products.values()) {
      for (const competitorPrice of product.pricing.competitorPrices) {
        // Simulate price updates (in production, would call real APIs)
        const volatility = (Math.random() - 0.5) * 0.1; // ±5% change
        competitorPrice.price *= (1 + volatility);
        competitorPrice.lastChecked = new Date();
      }
    }
    this.emit('competitor_prices:updated');
  }

  private async updateAIRecommendations(): Promise<void> {
    for (const product of this.products.values()) {
      // Update AI metadata scores
      product.aiMetadata.recommendationScore = Math.max(0, Math.min(1,
        product.aiMetadata.recommendationScore + (Math.random() - 0.5) * 0.1
      ));
      product.aiMetadata.trendingScore = Math.max(0, Math.min(1,
        product.aiMetadata.trendingScore + (Math.random() - 0.5) * 0.1
      ));
      product.aiMetadata.lastAIAnalysis = new Date();
    }
    this.emit('ai_recommendations:updated');
  }

  private async processDynamicPricing(): Promise<void> {
    for (const product of this.products.values()) {
      if (!product.pricing.dynamicPricing.isEnabled) continue;

      let multiplier = 1.0;

      for (const factor of product.pricing.dynamicPricing.factors) {
        multiplier += factor.impact * factor.weight;
      }

      product.pricing.dynamicPricing.currentMultiplier = Math.max(0.8, Math.min(1.2, multiplier));
      product.pricing.dynamicPricing.lastUpdate = new Date();

      // Apply dynamic pricing (could adjust basePrice here)
    }
    this.emit('dynamic_pricing:updated');
  }

  // Analytics and Insights
  async getShoppingAnalytics(userId?: string): Promise<any> {
    const products = Array.from(this.products.values());
    const users = userId ? [this.users.get(userId)].filter(Boolean) : Array.from(this.users.values());
    const orders = Array.from(this.orders.values());

    return {
      products: {
        total: products.length,
        categories: [...new Set(products.map(p => p.category))].length,
        averagePrice: products.reduce((sum, p) => sum + p.pricing.basePrice, 0) / products.length,
        inStock: products.filter(p => p.availability.inStock).length
      },
      users: {
        total: users.length,
        activeInLastMonth: users.filter(u =>
          u && u.lastActivity && (Date.now() - u.lastActivity.getTime()) < (30 * 24 * 60 * 60 * 1000)
        ).length
      },
      orders: {
        total: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + o.pricing.total, 0),
        averageOrderValue: orders.length > 0
          ? orders.reduce((sum, o) => sum + o.pricing.total, 0) / orders.length
          : 0
      },
      lastUpdated: new Date()
    };
  }

  // Service Health
  async getServiceHealth(): Promise<any> {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      products: this.products.size,
      users: this.users.size,
      carts: this.carts.size,
      orders: this.orders.size,
      priceAlerts: this.priceAlerts.size,
      deals: this.deals.size,
      lastUpdate: new Date()
    };
  }

  async getRealTimeData(): Promise<any> {
    const activeCarts = Array.from(this.carts.values())
      .filter(cart => cart.items.length > 0).length;

    const todayOrders = Array.from(this.orders.values())
      .filter(order =>
        order.createdAt.toDateString() === new Date().toDateString()
      ).length;

    const activeDeals = Array.from(this.deals.values())
      .filter(deal => deal.isActive).length;

    return {
      activeCarts,
      todayOrders,
      activeDeals,
      totalProducts: this.products.size,
      totalUsers: this.users.size,
      lastUpdate: new Date()
    };
  }
}

export default CumparAIService;

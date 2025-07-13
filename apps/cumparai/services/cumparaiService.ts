// CumparAI Service - AI Shopping & Comparison Platform Service Layer

// CumparAI-specific types for shopping platform
export interface SearchFilter {
  query?: string
  categories?: string[]
  priceRange?: { min: number; max: number }
  brands?: string[]
  rating?: number
  inStock?: boolean
  freeShipping?: boolean
  discount?: boolean
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'popularity' | 'newest'
}

export interface ShoppingInsight {
  id: string
  type: 'price_drop' | 'better_deal' | 'stock_alert' | 'trend_alert' | 'recommendation'
  title: string
  description: string
  productId?: string
  actionUrl?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  timestamp: Date
  isRead: boolean
}

// Mock data for development
const mockInsights: ShoppingInsight[] = [
  {
    id: 'insight-001',
    type: 'price_drop',
    title: 'Price Drop Alert!',
    description: 'Samsung Galaxy S24 Ultra dropped by 300 RON',
    productId: 'prod-001',
    actionUrl: '/products/prod-001',
    priority: 'high',
    timestamp: new Date(),
    isRead: false
  },
  {
    id: 'insight-002',
    type: 'recommendation',
    title: 'Perfect Match Found',
    description: 'Based on your browsing history, this product might interest you',
    productId: 'prod-001',
    actionUrl: '/products/prod-001',
    priority: 'medium',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    isRead: false
  },
  {
    id: 'insight-003',
    type: 'trend_alert',
    title: 'Market Trend Alert',
    description: 'Electronics prices are expected to drop by 5% in the next week',
    priority: 'low',
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    isRead: true
  }
]

export class CumparAIService {
  private static instance: CumparAIService

  static getInstance(): CumparAIService {
    if (!CumparAIService.instance) {
      CumparAIService.instance = new CumparAIService()
    }
    return CumparAIService.instance
  }

  private constructor() { }

  // Shopping Insights
  async getShoppingInsights(userId: string): Promise<ShoppingInsight[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400))
    return mockInsights
  }

  // Get Products
  async getProducts(options?: { sortBy?: string; sortOrder?: string }): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 500))

    // Mock product data
    const mockProducts = [
      {
        id: 'prod-001',
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Latest flagship smartphone with AI camera',
        price: 4999,
        currency: 'RON',
        brand: 'Samsung',
        imageUrl: '/products/samsung-s24.jpg',
        rating: 4.8,
        reviewCount: 1247,
        inStock: true,
        aiScore: 9.2
      },
      {
        id: 'prod-002',
        name: 'iPhone 15 Pro',
        description: 'Latest Apple flagship with titanium design',
        price: 5499,
        currency: 'RON',
        brand: 'Apple',
        imageUrl: '/products/iphone-15.jpg',
        rating: 4.7,
        reviewCount: 987,
        inStock: true,
        aiScore: 8.9
      }
    ]

    return mockProducts
  }

  // Search Products
  async searchProducts(filters: SearchFilter): Promise<any[]> {
    return this.getProducts()
  }

  // Get Personalized Recommendations
  async getPersonalizedRecommendations(userId: string): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 400))

    return [
      {
        id: 'rec-001',
        title: 'Perfect for Content Creators',
        description: 'Based on your photography interest',
        products: await this.getProducts(),
        confidence: 0.89
      }
    ]
  }

  // Get Active Deals
  async getActiveDeals(): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 400))

    return [
      {
        id: 'deal-001',
        title: 'Samsung Galaxy S24 Ultra - 300 RON OFF',
        description: 'Limited time offer on flagship smartphone',
        originalPrice: 5299,
        salePrice: 4999,
        discount: 300,
        discountPercentage: 5.7,
        merchant: 'eMAG',
        endDate: new Date('2024-02-15')
      }
    ]
  }

  // Get User Cart
  async getUserCart(userId: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 300))

    return {
      id: `cart-${userId}`,
      userId,
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      currency: 'RON'
    }
  }

  // Get User Wishlist
  async getUserWishlist(userId: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 300))

    return {
      id: `wishlist-${userId}`,
      userId,
      name: 'My Wishlist',
      items: [],
      isPublic: false
    }
  }
}

export const cumparaiService = CumparAIService.getInstance()

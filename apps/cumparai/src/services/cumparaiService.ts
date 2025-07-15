// CUMPARAI Service - AI Shopping & Comparison Platform
// Core business logic for shopping comparison and AI-driven recommendations

interface Product {
  id: string
  name: string
  price: number
  category: string
  rating: number
  description: string
  imageUrl: string
}

interface ComparisonResult {
  products: Product[]
  bestValue: Product
  recommendations: Product[]
  insights: string[]
}

interface ShoppingPreferences {
  budget: number
  categories: string[]
  priorities: ('price' | 'quality' | 'rating' | 'brand')[]
}

export class CumparaiService {
  private products: Product[] = []

  constructor() {
    this.products = this.generateMockProducts()
  }

  // Core CRUD operations
  async getAll(): Promise<Product[]> {
    return this.products
  }

  async getById(id: string): Promise<Product | null> {
    return this.products.find(p => p.id === id) || null
  }

  async create(product: Omit<Product, 'id'>): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: `product_${Date.now()}_${Math.random().toString(36).substring(7)}`
    }
    this.products.push(newProduct)
    return newProduct
  }

  async update(id: string, updates: Partial<Product>): Promise<Product | null> {
    const index = this.products.findIndex(p => p.id === id)
    if (index === -1) return null

    this.products[index] = { ...this.products[index], ...updates }
    return this.products[index]
  }

  async delete(id: string): Promise<boolean> {
    const index = this.products.findIndex(p => p.id === id)
    if (index === -1) return false

    this.products.splice(index, 1)
    return true
  }

  // AI-powered comparison features
  async compareProducts(productIds: string[]): Promise<ComparisonResult> {
    const products = this.products.filter(p => productIds.indexOf(p.id) !== -1)
    const bestValue = this.findBestValue(products)
    const recommendations = this.getProductRecommendations(products)
    const insights = this.generateInsights(products)

    return {
      products,
      bestValue,
      recommendations,
      insights
    }
  }

  async searchProducts(query: string, preferences?: ShoppingPreferences): Promise<Product[]> {
    let results = this.products.filter(p =>
      p.name.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
      p.description.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
      p.category.toLowerCase().indexOf(query.toLowerCase()) !== -1
    )

    if (preferences) {
      results = this.applyPreferences(results, preferences)
    }

    return results
  }

  async getRecommendations(userId?: string): Promise<Product[]> {
    // AI-based recommendations (simplified)
    const topRated = this.products
      .filter(p => p.rating >= 4.0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)

    return topRated
  }

  async trackUserInteraction(userId: string, productId: string, action: string): Promise<void> {
    // Track user behavior for AI learning
    console.log(`User ${userId} performed ${action} on product ${productId}`)
  }

  // Business logic methods
  private findBestValue(products: Product[]): Product {
    return products.reduce((best, current) => {
      const bestValueScore = best.rating / best.price
      const currentValueScore = current.rating / current.price
      return currentValueScore > bestValueScore ? current : best
    })
  }

  private getProductRecommendations(products: Product[]): Product[] {
    const categories = products.map(p => p.category).filter((c, i, arr) => arr.indexOf(c) === i) // unique categories
    return this.products
      .filter(p => categories.indexOf(p.category) !== -1 && products.indexOf(p) === -1)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3)
  }

  private generateInsights(products: Product[]): string[] {
    const insights: string[] = []

    const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length
    const avgRating = products.reduce((sum, p) => sum + p.rating, 0) / products.length

    insights.push(`Average price: $${avgPrice.toFixed(2)}`)
    insights.push(`Average rating: ${avgRating.toFixed(1)}/5.0`)

    const priceSorted = [...products].sort((a, b) => a.price - b.price)
    const cheapest = priceSorted[0]
    const mostExpensive = priceSorted[priceSorted.length - 1]

    insights.push(`Price range: $${cheapest.price} - $${mostExpensive.price}`)

    if (avgRating > 4.0) {
      insights.push('High quality products with excellent ratings')
    }

    return insights
  }

  private applyPreferences(products: Product[], preferences: ShoppingPreferences): Product[] {
    let filtered = products.filter(p => p.price <= preferences.budget)

    if (preferences.categories.length > 0) {
      filtered = filtered.filter(p => preferences.categories.indexOf(p.category) !== -1)
    }

    // Sort by preferences priority
    const primaryPriority = preferences.priorities[0] || 'rating'
    filtered.sort((a, b) => {
      switch (primaryPriority) {
        case 'price':
          return a.price - b.price
        case 'rating':
          return b.rating - a.rating
        case 'quality':
          return b.rating - a.rating
        default:
          return 0
      }
    })

    return filtered
  }

  private generateMockProducts(): Product[] {
    return [
      {
        id: 'prod_1',
        name: 'Smartphone Pro Max',
        price: 999,
        category: 'Electronics',
        rating: 4.5,
        description: 'Latest flagship smartphone with advanced AI features',
        imageUrl: '/images/smartphone.jpg'
      },
      {
        id: 'prod_2',
        name: 'Wireless Headphones',
        price: 299,
        category: 'Electronics',
        rating: 4.2,
        description: 'Premium noise-canceling wireless headphones',
        imageUrl: '/images/headphones.jpg'
      },
      {
        id: 'prod_3',
        name: 'Smart Watch',
        price: 399,
        category: 'Electronics',
        rating: 4.0,
        description: 'Advanced fitness tracking and health monitoring',
        imageUrl: '/images/smartwatch.jpg'
      },
      {
        id: 'prod_4',
        name: 'Gaming Laptop',
        price: 1599,
        category: 'Computers',
        rating: 4.7,
        description: 'High-performance gaming laptop with RTX graphics',
        imageUrl: '/images/laptop.jpg'
      },
      {
        id: 'prod_5',
        name: 'Coffee Machine',
        price: 199,
        category: 'Home',
        rating: 4.3,
        description: 'Automatic espresso machine with milk frother',
        imageUrl: '/images/coffee.jpg'
      }
    ]
  }

  // Analytics and reporting
  async getAnalytics(): Promise<{
    totalProducts: number
    avgPrice: number
    avgRating: number
    topCategories: string[]
  }> {
    const totalProducts = this.products.length
    const avgPrice = this.products.reduce((sum, p) => sum + p.price, 0) / totalProducts
    const avgRating = this.products.reduce((sum, p) => sum + p.rating, 0) / totalProducts

    const categoryCounts = this.products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topCategories = Object.keys(categoryCounts)
      .map(category => ({ category, count: categoryCounts[category] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.category)

    return {
      totalProducts,
      avgPrice: Number(avgPrice.toFixed(2)),
      avgRating: Number(avgRating.toFixed(1)),
      topCategories
    }
  }

  // Validation and utilities
  validateProduct(product: Partial<Product>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!product.name || product.name.trim().length === 0) {
      errors.push('Product name is required')
    }

    if (!product.price || product.price <= 0) {
      errors.push('Product price must be greater than 0')
    }

    if (!product.category || product.category.trim().length === 0) {
      errors.push('Product category is required')
    }

    if (product.rating !== undefined && (product.rating < 0 || product.rating > 5)) {
      errors.push('Product rating must be between 0 and 5')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

import type { CodaiConfig } from '../types';
import { HttpUtils, ErrorUtils, ValidationUtils } from '../utils';

// Marketplace interfaces for marcai.ro integration
export interface Product {
  id: string;
  sellerId: string;
  categoryId: string;
  name: string;
  description: string;
  shortDescription?: string;
  images: string[];
  videos?: string[];
  price: {
    amount: number;
    currency: string;
    originalPrice?: number;
    discount?: {
      percentage: number;
      validUntil?: Date;
    };
  };
  inventory: {
    quantity: number;
    sku?: string;
    trackQuantity: boolean;
    allowBackorders: boolean;
    lowStockThreshold?: number;
  };
  shipping: {
    weight?: number;
    dimensions?: {
      length: number;
      width: number;
      height: number;
      unit: 'cm' | 'in';
    };
    freeShipping: boolean;
    shippingCost?: number;
    estimatedDelivery?: string;
  };
  attributes: Record<string, any>;
  tags: string[];
  status: 'draft' | 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
  ratings: {
    average: number;
    count: number;
    distribution: Record<string, number>;
  };
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  children?: Category[];
  image?: string;
  attributes: Array<{
    name: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
    required: boolean;
    options?: string[];
  }>;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  sellerId: string;
  items: OrderItem[];
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
    currency: string;
  };
  shipping: {
    address: Address;
    method: string;
    trackingNumber?: string;
    estimatedDelivery?: Date;
    actualDelivery?: Date;
  };
  billing: {
    address: Address;
    paymentMethod: string;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partial_refund';
    paymentId?: string;
  };
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  notes?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  sku?: string;
  quantity: number;
  price: number;
  totalPrice: number;
  attributes?: Record<string, any>;
}

export interface Address {
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
  isDefault?: boolean;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
    currency: string;
  };
  couponCode?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  selectedAttributes?: Record<string, any>;
  addedAt: Date;
}

export interface Seller {
  id: string;
  userId: string;
  businessName: string;
  businessType: 'individual' | 'business' | 'corporation';
  description?: string;
  logo?: string;
  banner?: string;
  address: Address;
  contact: {
    email: string;
    phone?: string;
    website?: string;
    socialMedia?: Record<string, string>;
  };
  verification: {
    status: 'pending' | 'verified' | 'rejected';
    documentsSubmitted: boolean;
    verifiedAt?: Date;
  };
  ratings: {
    average: number;
    count: number;
    distribution: Record<string, number>;
  };
  policies: {
    returnPolicy?: string;
    shippingPolicy?: string;
    privacyPolicy?: string;
  };
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  orderId: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  helpful: number;
  verified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageCount: number;
  userLimit?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Marketplace service for CODAI ecosystem (marcai.ro integration)
export class MarketplaceService {
  private config: CodaiConfig;
  private httpClient: any;

  constructor(config: CodaiConfig) {
    this.config = config;
    this.httpClient = HttpUtils.createHttpClient(
      config.endpoints?.marketplace || 'https://marcai.ro/api'
    );
  }

  // Product Management
  /**
   * Create new product
   */
  async createProduct(
    productData: Omit<Product, 'id' | 'ratings' | 'createdAt' | 'updatedAt'>
  ): Promise<Product> {
    try {
      ValidationUtils.validateRequired(productData, [
        'sellerId', 'categoryId', 'name', 'description', 'price'
      ]);

      const response = await this.httpClient.post('/products', productData);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to create product',
        'PRODUCT_CREATE_FAILED',
        error
      );
    }
  }

  /**
   * Get product by ID
   */
  async getProduct(productId: string): Promise<Product> {
    try {
      const response = await this.httpClient.get(`/products/${productId}`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get product',
        'PRODUCT_GET_FAILED',
        error
      );
    }
  }

  /**
   * Search products
   */
  async searchProducts(options: {
    query?: string;
    categoryId?: string;
    sellerId?: string;
    priceRange?: { min: number; max: number };
    rating?: number;
    tags?: string[];
    sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
    limit?: number;
    offset?: number;
  }): Promise<{
    products: Product[];
    totalCount: number;
    hasMore: boolean;
    facets: Record<string, any>;
  }> {
    try {
      const response = await this.httpClient.post('/products/search', options);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to search products',
        'PRODUCT_SEARCH_FAILED',
        error
      );
    }
  }

  /**
   * Update product
   */
  async updateProduct(
    productId: string,
    updates: Partial<Product>
  ): Promise<Product> {
    try {
      const response = await this.httpClient.patch(`/products/${productId}`, updates);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to update product',
        'PRODUCT_UPDATE_FAILED',
        error
      );
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(productId: string): Promise<void> {
    try {
      await this.httpClient.delete(`/products/${productId}`);
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to delete product',
        'PRODUCT_DELETE_FAILED',
        error
      );
    }
  }

  // Category Management
  /**
   * Get categories tree
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await this.httpClient.get('/categories');
      return response.data.categories;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get categories',
        'CATEGORY_GET_FAILED',
        error
      );
    }
  }

  /**
   * Create category
   */
  async createCategory(
    categoryData: Omit<Category, 'id' | 'children' | 'createdAt' | 'updatedAt'>
  ): Promise<Category> {
    try {
      ValidationUtils.validateRequired(categoryData, ['name']);

      const response = await this.httpClient.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to create category',
        'CATEGORY_CREATE_FAILED',
        error
      );
    }
  }

  // Cart Management
  /**
   * Get or create cart
   */
  async getCart(userId: string): Promise<Cart> {
    try {
      const response = await this.httpClient.get(`/users/${userId}/cart`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get cart',
        'CART_GET_FAILED',
        error
      );
    }
  }

  /**
   * Add item to cart
   */
  async addToCart(
    userId: string,
    item: Omit<CartItem, 'id' | 'addedAt'>
  ): Promise<Cart> {
    try {
      ValidationUtils.validateRequired(item, ['productId', 'quantity']);

      const response = await this.httpClient.post(`/users/${userId}/cart/items`, item);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to add item to cart',
        'CART_ADD_FAILED',
        error
      );
    }
  }

  /**
   * Update cart item
   */
  async updateCartItem(
    userId: string,
    itemId: string,
    updates: Partial<Pick<CartItem, 'quantity' | 'selectedAttributes'>>
  ): Promise<Cart> {
    try {
      const response = await this.httpClient.patch(
        `/users/${userId}/cart/items/${itemId}`,
        updates
      );
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to update cart item',
        'CART_UPDATE_FAILED',
        error
      );
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(userId: string, itemId: string): Promise<Cart> {
    try {
      const response = await this.httpClient.delete(`/users/${userId}/cart/items/${itemId}`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to remove item from cart',
        'CART_REMOVE_FAILED',
        error
      );
    }
  }

  /**
   * Apply coupon
   */
  async applyCoupon(userId: string, couponCode: string): Promise<Cart> {
    try {
      const response = await this.httpClient.post(`/users/${userId}/cart/coupon`, {
        couponCode
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to apply coupon',
        'COUPON_APPLY_FAILED',
        error
      );
    }
  }

  // Order Management
  /**
   * Create order
   */
  async createOrder(
    orderData: Omit<Order, 'id' | 'orderNumber' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<Order> {
    try {
      ValidationUtils.validateRequired(orderData, [
        'buyerId', 'sellerId', 'items', 'shipping', 'billing'
      ]);

      const response = await this.httpClient.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to create order',
        'ORDER_CREATE_FAILED',
        error
      );
    }
  }

  /**
   * Get order
   */
  async getOrder(orderId: string): Promise<Order> {
    try {
      const response = await this.httpClient.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get order',
        'ORDER_GET_FAILED',
        error
      );
    }
  }

  /**
   * List user orders
   */
  async listOrders(
    userId: string,
    options?: {
      status?: Order['status'];
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    orders: Order[];
    totalCount: number;
    hasMore: boolean;
  }> {
    try {
      const params = new URLSearchParams();
      if (options?.status) params.append('status', options.status);
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());

      const response = await this.httpClient.get(
        `/users/${userId}/orders?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to list orders',
        'ORDER_LIST_FAILED',
        error
      );
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    status: Order['status'],
    notes?: string
  ): Promise<Order> {
    try {
      const response = await this.httpClient.patch(`/orders/${orderId}/status`, {
        status,
        notes
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to update order status',
        'ORDER_STATUS_UPDATE_FAILED',
        error
      );
    }
  }

  // Seller Management
  /**
   * Register seller
   */
  async registerSeller(
    sellerData: Omit<Seller, 'id' | 'ratings' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<Seller> {
    try {
      ValidationUtils.validateRequired(sellerData, [
        'userId', 'businessName', 'businessType', 'address', 'contact'
      ]);

      const response = await this.httpClient.post('/sellers', sellerData);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to register seller',
        'SELLER_REGISTER_FAILED',
        error
      );
    }
  }

  /**
   * Get seller profile
   */
  async getSeller(sellerId: string): Promise<Seller> {
    try {
      const response = await this.httpClient.get(`/sellers/${sellerId}`);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get seller',
        'SELLER_GET_FAILED',
        error
      );
    }
  }

  // Review Management
  /**
   * Create review
   */
  async createReview(
    reviewData: Omit<Review, 'id' | 'helpful' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<Review> {
    try {
      ValidationUtils.validateRequired(reviewData, [
        'productId', 'userId', 'orderId', 'rating'
      ]);

      if (reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const response = await this.httpClient.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to create review',
        'REVIEW_CREATE_FAILED',
        error
      );
    }
  }

  /**
   * Get product reviews
   */
  async getProductReviews(
    productId: string,
    options?: {
      rating?: number;
      verified?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    reviews: Review[];
    totalCount: number;
    hasMore: boolean;
    summary: {
      averageRating: number;
      totalReviews: number;
      distribution: Record<string, number>;
    };
  }> {
    try {
      const params = new URLSearchParams();
      if (options?.rating) params.append('rating', options.rating.toString());
      if (options?.verified !== undefined) params.append('verified', options.verified.toString());
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());

      const response = await this.httpClient.get(
        `/products/${productId}/reviews?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get product reviews',
        'REVIEW_GET_FAILED',
        error
      );
    }
  }

  // Analytics
  /**
   * Get marketplace analytics
   */
  async getAnalytics(
    type: 'sales' | 'products' | 'customers' | 'revenue',
    timeRange: { start: Date; end: Date },
    sellerId?: string
  ): Promise<{
    data: any[];
    summary: Record<string, number>;
    trends: Record<string, number>;
  }> {
    try {
      const response = await this.httpClient.post('/analytics', {
        type,
        timeRange,
        sellerId
      });
      return response.data;
    } catch (error) {
      throw ErrorUtils.createError(
        'Failed to get analytics',
        'ANALYTICS_GET_FAILED',
        error
      );
    }
  }
}

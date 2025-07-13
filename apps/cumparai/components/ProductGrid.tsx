'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag,
  Heart,
  Star,
  Filter,
  Grid,
  List,
  Search,
  Sparkles
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  hasVariants: boolean;
  lowestPrice: number;
  store: {
    name: string;
    isVerified: boolean;
  };
  category: {
    name: string;
  };
  _count: {
    reviews: number;
    wishlistItems: number;
  };
}

interface ProductGridProps {
  initialProducts?: Product[];
  categoryId?: string;
  searchQuery?: string;
  userId?: string;
}

export default function ProductGrid({
  initialProducts = [],
  categoryId,
  searchQuery,
  userId
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    sortBy: 'newest',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [categoryId, searchQuery, filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryId) params.append('categoryId', categoryId);
      if (searchQuery) params.append('search', searchQuery);
      if (userId) params.append('userId', userId);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!userId) {
      alert('Please log in to add items to cart');
      return;
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_to_cart',
          data: { userId, productId, quantity }
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Product added to cart!');
      } else {
        alert(data.details || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart');
    }
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 group">
      {/* Product Image */}
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <Image
            src={product.images[0] || '/placeholder-product.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
          {product.store.isVerified && (
            <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              Verified
            </div>
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
            <Link href={`/products/${product.id}`} className="hover:text-blue-600">
              {product.name}
            </Link>
          </h3>
          <button className="text-gray-400 hover:text-red-500 ml-2">
            <Heart className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-2">{product.store.name}</p>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                  }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-1">
            ({product._count.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              ${product.hasVariants ? product.lowestPrice : product.price}
            </span>
            {product.hasVariants && (
              <span className="text-sm text-gray-500">from</span>
            )}
          </div>
          <span className="text-xs text-gray-500">{product.category.name}</span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => addToCart(product.id)}
          disabled={!product.inStock}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${product.inStock
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          <ShoppingBag className="h-4 w-4 inline mr-2" />
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );

  const ProductListItem = ({ product }: { product: Product }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-4">
      <div className="flex space-x-4">
        {/* Product Image */}
        <Link href={`/products/${product.id}`}>
          <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={product.images[0] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
        </Link>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                <Link href={`/products/${product.id}`} className="hover:text-blue-600">
                  {product.name}
                </Link>
              </h3>
              <p className="text-sm text-gray-600 mb-2">{product.store.name}</p>

              {/* Rating */}
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-1">
                  ({product._count.reviews})
                </span>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">
                {product.description}
              </p>
            </div>

            <div className="flex flex-col items-end space-y-2">
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">
                  ${product.hasVariants ? product.lowestPrice : product.price}
                </span>
                {product.hasVariants && (
                  <span className="text-sm text-gray-500 block">from</span>
                )}
              </div>

              <button
                onClick={() => addToCart(product.id)}
                disabled={!product.inStock}
                className={`py-2 px-4 rounded-md font-medium transition-colors ${product.inStock
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                <ShoppingBag className="h-4 w-4 inline mr-2" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {searchQuery ? `Search results for "${searchQuery}"` : 'Products'}
          </h1>
          <p className="text-gray-600 mt-1">
            {products.length} product{products.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Price
              </label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="$0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Price
              </label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="$999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="newest">Newest</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="rating">Rating</option>
                <option value="sales">Best Selling</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters({ ...filters, sortOrder: e.target.value as 'asc' | 'desc' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Products Grid/List */}
      {!loading && (
        <>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {products.map((product) => (
                viewMode === 'grid'
                  ? <ProductCard key={product.id} product={product} />
                  : <ProductListItem key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

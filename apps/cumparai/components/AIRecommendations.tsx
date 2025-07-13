'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, TrendingUp, Heart, Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  rating: number;
  store: {
    name: string;
    isVerified: boolean;
  };
  category: {
    name: string;
  };
  type?: string;
  score?: number;
}

interface RecommendationsProps {
  userId?: string;
  context?: 'home' | 'product' | 'cart' | 'search';
  title?: string;
  className?: string;
}

export default function AIRecommendations({
  userId,
  context = 'home',
  title,
  className = ''
}: RecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchRecommendations();
    } else {
      setLoading(false);
    }
  }, [userId, context]);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`/api/recommendations?userId=${userId}&context=${context}`);
      const data = await response.json();

      if (data.success) {
        setRecommendations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'trending':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      case 'similar':
        return <Heart className="h-4 w-4 text-pink-500" />;
      case 'complementary':
        return <Star className="h-4 w-4 text-purple-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-blue-500" />;
    }
  };

  const getRecommendationLabel = (type: string) => {
    switch (type) {
      case 'trending':
        return 'Trending';
      case 'similar':
        return 'Similar';
      case 'complementary':
        return 'Complement';
      default:
        return 'AI Pick';
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!recommendations.length) {
    return null;
  }

  const defaultTitle = context === 'home'
    ? 'Recommended for You'
    : context === 'product'
      ? 'You Might Also Like'
      : context === 'cart'
        ? 'Complete Your Order'
        : 'Based on Your Search';

  return (
    <div className={className}>
      <div className="flex items-center space-x-2 mb-6">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">
          {title || defaultTitle}
        </h2>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
          AI Powered
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 group"
          >
            {/* Product Image */}
            <Link href={`/products/${product.id}`}>
              <div className="relative aspect-square overflow-hidden rounded-t-lg">
                <Image
                  src={product.images[0] || '/placeholder-product.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />

                {/* Recommendation Badge */}
                <div className="absolute top-2 left-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                  {getRecommendationIcon(product.type || 'ai')}
                  <span className="text-xs font-medium text-gray-700">
                    {getRecommendationLabel(product.type || 'ai')}
                  </span>
                </div>

                {/* Store Verification */}
                {product.store.isVerified && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Verified
                  </div>
                )}

                {/* AI Score */}
                {product.score && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs font-medium px-2 py-1 rounded-full">
                    {Math.round(product.score * 100)}% match
                  </div>
                )}
              </div>
            </Link>

            {/* Product Details */}
            <div className="p-3">
              <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
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
                      className={`h-3 w-3 ${i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                        }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600 ml-1">
                  {product.rating.toFixed(1)}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500">{product.category.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View More Link */}
      {recommendations.length >= 4 && (
        <div className="text-center mt-6">
          <Link
            href="/products"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View More Products →
          </Link>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  CreditCard,
  Shield,
  Truck
} from 'lucide-react';

interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  totalPrice: number;
  isAvailable: boolean;
  product: {
    id: string;
    name: string;
    images: string[];
    store: {
      name: string;
    };
  };
  variant?: {
    id: string;
    name: string;
    options: Record<string, any>;
  };
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

interface ShoppingCartProps {
  userId?: string;
}

export default function ShoppingCart({ userId }: ShoppingCartProps) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchCart();
    }
  }, [userId]);

  const fetchCart = async () => {
    try {
      const response = await fetch(`/api/cart?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setCart(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    setUpdating(cartItemId);

    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, quantity })
      });

      const data = await response.json();
      if (data.success) {
        // Refresh cart
        await fetchCart();
      } else {
        alert(data.details || 'Failed to update cart');
      }
    } catch (error) {
      console.error('Failed to update cart:', error);
      alert('Failed to update cart');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = (cartItemId: string) => {
    updateQuantity(cartItemId, 0);
  };

  const proceedToCheckout = async () => {
    if (!cart || cart.items.length === 0) return;

    // For demo purposes, we'll just show an alert
    // In a real app, this would redirect to checkout
    alert('Proceeding to checkout... (Demo)');
  };

  if (!userId) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Please log in</h3>
          <p className="text-gray-600">You need to be logged in to view your cart</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-6">Start shopping to add items to your cart</p>
          <Link
            href="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const unavailableItems = cart.items.filter(item => !item.isAvailable);
  const availableItems = cart.items.filter(item => item.isAvailable);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {/* Unavailable Items Warning */}
          {unavailableItems.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex">
                <Shield className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Some items are no longer available
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    {unavailableItems.length} item(s) in your cart are out of stock or no longer available.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className={`bg-white border border-gray-200 rounded-lg p-4 ${!item.isAvailable ? 'opacity-60' : ''
                  }`}
              >
                <div className="flex space-x-4">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={item.product.images[0] || '/placeholder-product.jpg'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          <Link
                            href={`/products/${item.product.id}`}
                            className="hover:text-blue-600"
                          >
                            {item.product.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {item.product.store.name}
                        </p>
                        {item.variant && (
                          <p className="text-sm text-gray-600">
                            {item.variant.name}
                          </p>
                        )}
                        {!item.isAvailable && (
                          <p className="text-sm text-red-600 font-medium mt-1">
                            Out of stock
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          ${item.totalPrice.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={updating === item.id || item.quantity <= 1}
                          className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="h-4 w-4" />
                        </button>

                        <span className="px-3 py-1 border border-gray-300 rounded-md min-w-[3rem] text-center">
                          {updating === item.id ? '...' : item.quantity}
                        </span>

                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updating === item.id || !item.isAvailable}
                          className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updating === item.id}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-sm">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Shopping */}
          <div className="mt-6">
            <Link
              href="/products"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Items ({cart.itemCount})</span>
                <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {cart.subtotal > 50 ? 'FREE' : '$9.99'}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">
                  ${(cart.subtotal * 0.08).toFixed(2)}
                </span>
              </div>

              <hr className="border-gray-300" />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>
                  ${(
                    cart.subtotal +
                    (cart.subtotal > 50 ? 0 : 9.99) +
                    (cart.subtotal * 0.08)
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Free Shipping Message */}
            {cart.subtotal < 50 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center">
                  <Truck className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-800">
                    Add ${(50 - cart.subtotal).toFixed(2)} more for free shipping!
                  </span>
                </div>
              </div>
            )}

            {/* Checkout Button */}
            <button
              onClick={proceedToCheckout}
              disabled={availableItems.length === 0}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <CreditCard className="h-4 w-4 inline mr-2" />
              {availableItems.length === 0 ? 'No Available Items' : 'Proceed to Checkout'}
            </button>

            {/* Security Notice */}
            <div className="flex items-center justify-center mt-4 text-sm text-gray-600">
              <Shield className="h-4 w-4 mr-1" />
              <span>Secure checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

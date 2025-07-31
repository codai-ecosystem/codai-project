/**
 * Subscription Management Component
 *
 * This component demonstrates how to use the Stripe integration
 * with the Firebase Extension and additional webhook handling.
 *
 * Note: This is a simplified version for demonstration purposes.
 * Full implementation would require proper Stripe product setup.
 */

'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { StripeService } from '@/lib/stripe';

interface SubscriptionManagerProps {
  className?: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

interface Subscription {
  id: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  items: {
    id: string;
    price: {
      id: string;
      unit_amount: number;
      currency: string;
    };
    quantity: number;
  }[];
}

export function SubscriptionManager({ className }: SubscriptionManagerProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      loadData();
    }
  }, [user, authLoading]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // For now, use mock data
      // In production, this would call StripeService.getProducts()
      setProducts([
        {
          id: 'prod_demo',
          name: 'Premium Plan',
          description: 'Access to premium features',
          active: true,
        },
      ]);
      setSubscriptions([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (priceId: string) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use StripeService to create checkout session
      const result = await StripeService.createCheckoutSession(priceId, {
        mode: 'subscription',
        successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: window.location.href,
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create subscription'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await StripeService.createPortalSession();
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to open subscription portal'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading authentication...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          Authentication Required
        </h2>
        <p className="text-gray-600">
          Please log in to manage your subscriptions.
        </p>
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-4xl p-6 ${className || ''}`}>
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Subscription Management
        </h1>
        <p className="text-gray-600">
          Manage your subscription and billing information.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Available Plans */}
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">
              Available Plans
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map(product => (
                <div
                  key={product.id}
                  className="rounded-lg border border-gray-200 p-6"
                >
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="mb-4 text-gray-600">{product.description}</p>
                  )}
                  <button
                    onClick={() => handleSubscribe('price_demo_subscription')}
                    disabled={isLoading}
                    className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {isLoading ? 'Processing...' : 'Subscribe'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Current Subscriptions */}
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">
              Current Subscriptions
            </h2>
            {subscriptions.length === 0 ? (
              <div className="rounded-lg bg-gray-50 p-8 text-center">
                <p className="text-gray-600">No active subscriptions found.</p>
                <button
                  onClick={handleManageSubscription}
                  disabled={isLoading}
                  className="mt-4 rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isLoading ? 'Loading...' : 'Manage Subscriptions'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {subscriptions.map(subscription => (
                  <div
                    key={subscription.id}
                    className="rounded-lg border border-gray-200 p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Subscription {subscription.id}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          Status:{' '}
                          <span className="capitalize">
                            {subscription.status}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={handleManageSubscription}
                        disabled={isLoading}
                        className="rounded-md bg-gray-600 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-700 disabled:bg-gray-400"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

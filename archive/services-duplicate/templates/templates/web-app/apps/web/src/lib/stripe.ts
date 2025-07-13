import { loadStripe, Stripe } from '@stripe/stripe-js';
import { DocumentData } from 'firebase/firestore';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';

import { getEnv } from './env';
import { auth } from './firebase';
import {
  getStripeFirebaseService,
  StripeFirebaseService,
} from './stripe-legacy';

// Client-side Stripe instance
let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const env = getEnv();
    if (!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      console.warn(
        'Stripe publishable key not found. Stripe functionality will be disabled.'
      );
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// Type definitions for Stripe entities (matching Firebase Extension structure)
export interface Product extends DocumentData {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  images?: string[];
  metadata?: Record<string, string | number | boolean>;
  prices?: Price[];
}

export interface Price extends DocumentData {
  id: string;
  product_id: string;
  active: boolean;
  currency: string;
  unit_amount: number;
  type: 'one_time' | 'recurring';
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year';
    interval_count: number;
  };
  metadata?: Record<string, string | number | boolean>;
}

export interface SubscriptionItem {
  id: string;
  price: Price;
  quantity: number;
}

export interface Subscription extends DocumentData {
  id: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  items: SubscriptionItem[];
  metadata?: Record<string, string | number | boolean>;
}

export interface Payment extends DocumentData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  metadata?: Record<string, string | number | boolean>;
}

// Enhanced Stripe service using direct Firestore integration
export class StripeService {
  private static getFirebaseService(): StripeFirebaseService {
    return getStripeFirebaseService();
  }

  /**
   * Get all active products with their prices
   */
  static async getProducts(): Promise<Product[]> {
    try {
      const service = this.getFirebaseService();
      const products = await service.getProducts();
      return products as Product[];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  /**
   * Get prices for products
   */
  static async getPrices(productId?: string): Promise<Price[]> {
    try {
      const products = await this.getProducts();
      const allPrices: Price[] = [];

      for (const product of products) {
        if (product.prices && (!productId || product.id === productId)) {
          allPrices.push(...(product.prices as Price[]));
        }
      }

      return allPrices;
    } catch (error) {
      console.error('Error fetching prices:', error);
      throw new Error('Failed to fetch prices');
    }
  }

  /**
   * Create a checkout session for subscription or one-time payment
   */
  static async createCheckoutSession(
    priceId: string,
    options: {
      mode?: 'subscription' | 'payment';
      successUrl?: string;
      cancelUrl?: string;
      allowPromotionCodes?: boolean;
      trialPeriodDays?: number;
      metadata?: Record<string, string>;
    } = {}
  ): Promise<{ url: string }> {
    if (!auth?.currentUser) {
      throw new Error('User must be authenticated to create checkout session');
    }

    try {
      const service = this.getFirebaseService();
      const sessionOptions = {
        price: priceId,
        success_url:
          options.successUrl ||
          `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: options.cancelUrl || window.location.href,
        allow_promotion_codes: options.allowPromotionCodes || false,
        mode: options.mode || 'subscription',
        ...(options.trialPeriodDays && {
          trial_period_days: options.trialPeriodDays,
        }),
        ...(options.metadata && { metadata: options.metadata }),
      };

      const result = await service.createCheckoutSession(
        auth.currentUser,
        sessionOptions
      );

      if (!result.url) {
        throw new Error('No checkout URL returned');
      }

      return { url: result.url };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Create a customer portal session for managing subscriptions
   */
  static async createPortalSession(
    returnUrl?: string
  ): Promise<{ url: string }> {
    if (!auth?.currentUser) {
      throw new Error('User must be authenticated to create portal session');
    }

    try {
      const service = this.getFirebaseService();
      const result = await service.createPortalSession(
        auth.currentUser,
        returnUrl || window.location.origin
      );

      if (!result.url) {
        throw new Error('No portal URL returned');
      }

      return { url: result.url };
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw new Error('Failed to create portal session');
    }
  }

  /**
   * Get current user's subscriptions
   */
  static async getUserSubscriptions(): Promise<Subscription[]> {
    if (!auth?.currentUser) {
      return [];
    }

    try {
      const service = this.getFirebaseService();
      const subscriptions = await service.getSubscriptions(auth.currentUser);
      return subscriptions as Subscription[];
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      throw new Error('Failed to fetch subscriptions');
    }
  }

  /**
   * Get current user's payment methods
   */
  static async getUserPaymentMethods(): Promise<DocumentData[]> {
    if (!auth?.currentUser) {
      return [];
    }

    try {
      const service = this.getFirebaseService();
      return await service.getPaymentMethods(auth.currentUser);
    } catch (error) {
      console.error('Error fetching user payment methods:', error);
      throw new Error('Failed to fetch payment methods');
    }
  }

  /**
   * Subscribe to real-time subscription updates
   */
  static onSubscriptionsChange(
    callback: (subscriptions: Subscription[]) => void
  ): () => void {
    if (!auth?.currentUser) {
      callback([]);
      return () => {};
    }

    try {
      const service = this.getFirebaseService();
      return service.subscribeToSubscriptions(
        auth.currentUser,
        subscriptions => {
          callback(subscriptions as Subscription[]);
        }
      );
    } catch (error) {
      console.error('Error listening to subscription changes:', error);
      callback([]);
      return () => {};
    }
  }
}

// React hooks for Stripe functionality using direct Firestore integration
export function useStripeProducts() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    StripeService.getProducts()
      .then(setProducts)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}

export function useStripePrices(productId?: string) {
  const [prices, setPrices] = React.useState<Price[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    StripeService.getPrices(productId)
      .then(setPrices)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [productId]);

  return { prices, loading, error };
}

export function useUserSubscriptions() {
  const [user] = useAuthState(auth!);
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = StripeService.onSubscriptionsChange(subs => {
      setSubscriptions(subs);
      setLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, [user]);

  return { subscriptions, loading, error };
}

// Helper to check if Stripe is enabled
export const isStripeEnabled = (): boolean => {
  const env = getEnv();
  return !!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
};

// Export legacy Firebase service for compatibility
export {
  getStripeFirebaseService,
  StripeFirebaseService,
} from './stripe-legacy';

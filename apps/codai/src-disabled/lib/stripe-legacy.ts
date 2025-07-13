import { User } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  DocumentData,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from 'firebase/firestore';

import { db as firestore } from './firebase';

// Firebase Extension integration for Stripe Payments (Legacy)
export class StripeFirebaseService {
  private customersCollectionName = 'customers';
  private productsCollectionName = 'products';

  /**
   * Create a Stripe Checkout Session via Firebase Extension
   */
  async createCheckoutSession(
    user: User,
    options: {
      price?: string;
      prices?: string[];
      success_url: string;
      cancel_url: string;
      mode?: 'payment' | 'subscription' | 'setup';
      allow_promotion_codes?: boolean;
      trial_period_days?: number;
    }
  ): Promise<{ sessionId: string; url?: string }> {
    if (!user) throw new Error('User must be authenticated');
    if (!firestore) throw new Error('Firestore not initialized');

    const customerRef = doc(firestore, this.customersCollectionName, user.uid);
    const checkoutSessionsRef = collection(customerRef, 'checkout_sessions');

    const sessionData = {
      ...options,
      mode: options.mode || 'subscription',
      created: Timestamp.now(),
    };

    // Remove undefined values
    Object.keys(sessionData).forEach(key => {
      if (sessionData[key as keyof typeof sessionData] === undefined) {
        delete sessionData[key as keyof typeof sessionData];
      }
    });

    const docRef = await addDoc(checkoutSessionsRef, sessionData);

    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(docRef, snap => {
        const data = snap.data();
        if (data?.['error']) {
          unsubscribe();
          reject(new Error(data['error'].message));
        }
        if (data?.['url']) {
          unsubscribe();
          resolve({
            sessionId: snap.id,
            url: data['url'],
          });
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        unsubscribe();
        reject(new Error('Checkout session creation timeout'));
      }, 30000);
    });
  }

  /**
   * Create a Customer Portal Session via Firebase Extension
   */
  async createPortalSession(
    user: User,
    returnUrl: string
  ): Promise<{ url: string }> {
    if (!user) throw new Error('User must be authenticated');
    if (!firestore) throw new Error('Firestore not initialized');

    const customerRef = doc(firestore, this.customersCollectionName, user.uid);
    const portalSessionsRef = collection(customerRef, 'portal_sessions');

    const sessionData = {
      return_url: returnUrl,
      created: Timestamp.now(),
    };

    const docRef = await addDoc(portalSessionsRef, sessionData);

    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(docRef, snap => {
        const data = snap.data();
        if (data?.['error']) {
          unsubscribe();
          reject(new Error(data['error'].message));
        }
        if (data?.['url']) {
          unsubscribe();
          resolve({ url: data['url'] });
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        unsubscribe();
        reject(new Error('Portal session creation timeout'));
      }, 30000);
    });
  }

  /**
   * Get customer's subscriptions
   */
  async getSubscriptions(user: User): Promise<DocumentData[]> {
    if (!user) throw new Error('User must be authenticated');
    if (!firestore) throw new Error('Firestore not initialized');

    const customerRef = doc(firestore, this.customersCollectionName, user.uid);
    const subscriptionsRef = collection(customerRef, 'subscriptions');

    const q = query(
      subscriptionsRef,
      where('status', 'in', ['active', 'trialing'])
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  /**
   * Get all products from Firebase Extension
   */
  async getProducts(): Promise<DocumentData[]> {
    if (!firestore) throw new Error('Firestore not initialized');

    const productsRef = collection(firestore, this.productsCollectionName);
    const q = query(productsRef, where('active', '==', true));
    const snapshot = await getDocs(q);

    const products = [];
    for (const productDoc of snapshot.docs) {
      const productData: DocumentData = {
        id: productDoc.id,
        ...productDoc.data(),
      };

      // Get prices for this product
      const pricesRef = collection(productDoc.ref, 'prices');
      const pricesQuery = query(
        pricesRef,
        where('active', '==', true),
        orderBy('unit_amount')
      );
      const pricesSnapshot = await getDocs(pricesQuery);

      productData['prices'] = pricesSnapshot.docs.map(priceDoc => ({
        id: priceDoc.id,
        ...priceDoc.data(),
      }));

      products.push(productData);
    }

    return products;
  }

  /**
   * Get customer's payment methods
   */
  async getPaymentMethods(user: User): Promise<DocumentData[]> {
    if (!user) throw new Error('User must be authenticated');
    if (!firestore) throw new Error('Firestore not initialized');

    const customerRef = doc(firestore, this.customersCollectionName, user.uid);
    const paymentMethodsRef = collection(customerRef, 'payment_methods');

    const snapshot = await getDocs(paymentMethodsRef);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  /**
   * Listen to subscription changes
   */
  subscribeToSubscriptions(
    user: User,
    callback: (subscriptions: DocumentData[]) => void
  ): () => void {
    if (!user) throw new Error('User must be authenticated');
    if (!firestore) throw new Error('Firestore not initialized');

    const customerRef = doc(firestore, this.customersCollectionName, user.uid);
    const subscriptionsRef = collection(customerRef, 'subscriptions');

    return onSnapshot(subscriptionsRef, snapshot => {
      const subscriptions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(subscriptions);
    });
  }
}

// Singleton instance
let stripeFirebaseService: StripeFirebaseService | null = null;

export const getStripeFirebaseService = (): StripeFirebaseService => {
  if (!stripeFirebaseService) {
    stripeFirebaseService = new StripeFirebaseService();
  }
  return stripeFirebaseService;
};

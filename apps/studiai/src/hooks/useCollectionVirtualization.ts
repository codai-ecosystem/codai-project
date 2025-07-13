import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
} from 'firebase/firestore';
import type {
  DocumentData,
  Firestore,
  QueryConstraint,
  QueryDocumentSnapshot,
  WhereFilterOp,
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';

import { db } from '@/lib/firebase';

import { useAuth } from './useAuth';

interface UseCollectionVirtualizationProps {
  collectionPath: string;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  pageSize?: number;
  filters?: Array<{ field: string; operator: WhereFilterOp; value: unknown }>;
  enabled?: boolean;
  userSpecific?: boolean;
}

interface UseCollectionVirtualizationReturn {
  items: DocumentData[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useCollectionVirtualization({
  collectionPath,
  orderByField = 'createdAt',
  orderDirection = 'desc',
  pageSize = 10,
  filters = [],
  enabled = true,
  userSpecific = false,
}: UseCollectionVirtualizationProps): UseCollectionVirtualizationReturn {
  const { user } = useAuth();
  const [items, setItems] = useState<DocumentData[]>([]);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Build query constraints
  const constraints = useMemo(() => {
    const queryConstraints: QueryConstraint[] = [
      orderBy(orderByField, orderDirection),
      limit(pageSize),
    ];

    // Add user filter if needed
    if (userSpecific === true && user != null) {
      queryConstraints.push(where('userId', '==', user.id));
    } // Add custom filters
    for (const filter of filters) {
      queryConstraints.push(where(filter.field, filter.operator, filter.value));
    }

    return queryConstraints;
  }, [orderByField, orderDirection, pageSize, userSpecific, user, filters]);

  // Load initial data
  useEffect(() => {
    if (!enabled || !db) return;

    const loadInitialData = async () => {
      setLoading(true);
      setError(null);

      try {
        const collectionRef = collection(db as Firestore, collectionPath);
        const q = query(collectionRef, ...constraints);

        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(docs);
        const lastDocument =
          querySnapshot.docs.length > 0
            ? (querySnapshot.docs[querySnapshot.docs.length - 1] ?? null)
            : null;
        setLastDoc(lastDocument);
        setHasMore(querySnapshot.docs.length === pageSize);
        setLoading(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    };

    loadInitialData();
  }, [collectionPath, enabled, constraints, pageSize]);

  // Function to load more items
  const loadMore = async () => {
    if (!hasMore || loading || !db || !lastDoc) return;

    setLoading(true);

    try {
      const collectionRef = collection(db, collectionPath);
      const q = query(collectionRef, ...constraints, startAfter(lastDoc));

      const querySnapshot = await getDocs(q);
      const newDocs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(prev => [...prev, ...newDocs]);
      const newLastDoc =
        querySnapshot.docs.length > 0
          ? (querySnapshot.docs[querySnapshot.docs.length - 1] ?? lastDoc)
          : lastDoc;
      setLastDoc(newLastDoc);
      setHasMore(querySnapshot.docs.length === pageSize);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err : new Error('Error loading more items')
      );
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh data
  const refresh = async () => {
    if (!enabled || !db) return;

    setLoading(true);
    setError(null);

    try {
      const collectionRef = collection(db, collectionPath);
      const q = query(collectionRef, ...constraints);

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(docs);
      const refreshLastDoc =
        querySnapshot.docs.length > 0
          ? (querySnapshot.docs[querySnapshot.docs.length - 1] ?? null)
          : null;
      setLastDoc(refreshLastDoc);
      setHasMore(querySnapshot.docs.length === pageSize);
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error('Error refreshing data'));
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
  } as const;
}

export default useCollectionVirtualization;

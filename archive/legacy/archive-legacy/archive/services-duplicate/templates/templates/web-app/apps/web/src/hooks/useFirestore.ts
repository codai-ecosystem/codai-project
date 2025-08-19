import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import type {
  CollectionReference,
  DocumentData,
  Firestore,
  OrderByDirection,
  QueryConstraint,
  Unsubscribe,
  WhereFilterOp,
  WithFieldValue,
} from 'firebase/firestore';
import { useCallback, useState } from 'react';

import { db } from '@/lib/firebase';

import { useAuth } from './useAuth';

/**
 * Hook for interacting with Firestore collections
 * @param collectionPath - Path to the collection
 * @returns Object with methods for interacting with the collection
 */
export function useFirestore<T extends DocumentData = DocumentData>(
  collectionPath: string
): {
  getDocument: (id: string) => Promise<T | null>;
  getDocuments: (constraints?: QueryConstraint[]) => Promise<T[]>;
  addDocument: (data: WithFieldValue<DocumentData>) => Promise<string | null>;
  setDocument: (
    id: string,
    data: WithFieldValue<DocumentData>
  ) => Promise<boolean>;
  updateDocument: (
    id: string,
    data: WithFieldValue<DocumentData>
  ) => Promise<boolean>;
  deleteDocument: (id: string) => Promise<boolean>;
  subscribeToDocument: (
    id: string,
    callback: (data: T | null) => void
  ) => Unsubscribe;
  subscribeToQuery: (
    constraints: QueryConstraint[],
    callback: (data: T[]) => void
  ) => Unsubscribe;
  queryBuilders: {
    where: (
      field: string,
      operator: WhereFilterOp,
      value: unknown
    ) => QueryConstraint;
    orderBy: (field: string, direction?: OrderByDirection) => QueryConstraint;
    limit: (limitCount: number) => QueryConstraint;
    userConstraint: QueryConstraint | null;
  };
  collectionRef: CollectionReference<DocumentData>;
  loading: boolean;
  error: Error | null;
} {
  const { user } = useAuth();
  const collectionRef = collection(db as Firestore, collectionPath);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Get a document from the collection
   * @param id - Document ID
   */
  const getDocument = useCallback(
    async (id: string): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const docRef = doc(db as Firestore, collectionPath, id);
        const docSnap = await getDoc(docRef);

        setLoading(false);
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as unknown as T;
        }
        return null;
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
        return null;
      }
    },
    [collectionPath]
  );

  /**
   * Get documents from the collection with optional query constraints
   * @param constraints - Firestore query constraints
   */
  const getDocuments = useCallback(
    async (constraints: QueryConstraint[] = []): Promise<T[]> => {
      setLoading(true);
      setError(null);

      try {
        const q = query(collectionRef, ...constraints);
        const querySnapshot = await getDocs(q);

        const documents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setLoading(false);
        return documents as unknown as T[];
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
        return [];
      }
    },
    [collectionRef]
  );

  /**
   * Add a new document to the collection
   * @param data - Document data
   */
  const addDocument = useCallback(
    async (data: WithFieldValue<DocumentData>): Promise<string | null> => {
      setLoading(true);
      setError(null);
      try {
        // Add user ID to document data if user is authenticated
        const documentData = user
          ? { ...data, userId: user.id, createdAt: new Date() }
          : data;
        const docRef = await addDoc(collectionRef, documentData);

        setLoading(false);
        return docRef.id;
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
        return null;
      }
    },
    [collectionRef, user]
  );

  /**
   * Set a document in the collection with a specific ID
   * @param id - Document ID
   * @param data - Document data
   */
  const setDocument = useCallback(
    async (
      id: string,
      data: WithFieldValue<DocumentData>
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        // Add user ID to document data if user is authenticated
        const documentData = user
          ? { ...data, userId: user.id, updatedAt: new Date() }
          : data;
        const docRef = doc(db as Firestore, collectionPath, id);
        await setDoc(docRef, documentData);

        setLoading(false);
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
        return false;
      }
    },
    [collectionPath, user]
  );

  /**
   * Update a document in the collection
   * @param id - Document ID
   * @param data - Document data to update
   */
  const updateDocument = useCallback(
    async (
      id: string,
      data: WithFieldValue<DocumentData>
    ): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        // Add updatedAt timestamp
        const documentData = { ...data, updatedAt: new Date() };
        const docRef = doc(db as Firestore, collectionPath, id);
        await updateDoc(docRef, documentData);

        setLoading(false);
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
        return false;
      }
    },
    [collectionPath]
  );

  /**
   * Delete a document from the collection
   * @param id - Document ID
   */
  const deleteDocument = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const docRef = doc(db as Firestore, collectionPath, id);
        await deleteDoc(docRef);

        setLoading(false);
        return true;
      } catch (err: unknown) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
        return false;
      }
    },
    [collectionPath]
  );

  /**
   * Subscribe to a document in the collection
   * @param id - Document ID
   * @param callback - Function to call when document changes
   * @returns Unsubscribe function
   */
  const subscribeToDocument = useCallback(
    (id: string, callback: (doc: T | null) => void) => {
      const docRef = doc(db as Firestore, collectionPath, id);

      const unsubscribe = onSnapshot(
        docRef,
        doc => {
          if (doc.exists()) {
            callback({ id: doc.id, ...doc.data() } as unknown as T);
          } else {
            callback(null);
          }
        },
        err => {
          setError(err instanceof Error ? err : new Error(String(err)));
          callback(null);
        }
      );

      return unsubscribe;
    },
    [collectionPath]
  );

  /**
   * Subscribe to a query in the collection
   * @param constraints - Firestore query constraints
   * @param callback - Function to call when documents change
   * @returns Unsubscribe function
   */
  const subscribeToQuery = useCallback(
    (constraints: QueryConstraint[] = [], callback: (docs: T[]) => void) => {
      const q = query(collectionRef, ...constraints);

      const unsubscribe = onSnapshot(
        q,
        querySnapshot => {
          const documents = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          callback(documents as unknown as T[]);
        },
        err => {
          setError(err instanceof Error ? err : new Error(String(err)));
          callback([]);
        }
      );

      return unsubscribe;
    },
    [collectionRef]
  );

  /**
   * Helper function for creating common query constraints
   */ const queryBuilders = {
    where: (field: string, operator: WhereFilterOp, value: unknown) =>
      where(field, operator, value),
    orderBy: (field: string, direction: OrderByDirection = 'asc') =>
      orderBy(field, direction),
    limit: (limitCount: number) => limit(limitCount),
    userConstraint: user ? where('userId', '==', user.id) : null,
  };

  return {
    getDocument,
    getDocuments,
    addDocument,
    setDocument,
    updateDocument,
    deleteDocument,
    subscribeToDocument,
    subscribeToQuery,
    queryBuilders,
    collectionRef,
    loading,
    error,
  };
}

export default useFirestore;

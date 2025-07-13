import { writeBatch, runTransaction } from 'firebase/firestore';
import type {
  DocumentReference,
  TransactionOptions,
  Firestore,
  Transaction,
  WriteBatch,
} from 'firebase/firestore';
import { useState, useCallback } from 'react';

import { db } from '@/lib/firebase';

interface FirestoreTransactionReturn {
  runTransaction: <T>(
    updateFunction: (transaction: Transaction) => Promise<T>,
    options?: TransactionOptions
  ) => Promise<T | null>;
  runBatch: (batchFunction: (batch: WriteBatch) => void) => Promise<boolean>;
  createBatchHelper: () => {
    set: <T>(docRef: DocumentReference<T>, data: T) => WriteBatch;
    update: <T>(docRef: DocumentReference<T>, data: Partial<T>) => WriteBatch;
    delete: <T>(docRef: DocumentReference<T>) => WriteBatch;
    commit: () => Promise<boolean>;
  };
  loading: boolean;
  error: Error | null;
}

/**
 * Hook for interacting with Firestore transactions and batches
 * @returns Object with methods for transactions and batches
 */
export function useFirestoreTransaction(): FirestoreTransactionReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Run a transaction that can read and write data atomically
   * @param updateFunction - Function that takes a transaction and returns a Promise
   * @param options - Transaction options
   */ const runTransactionOperation = useCallback(
    async <T>(
      updateFunction: (transaction: Transaction) => Promise<T>,
      options?: TransactionOptions
    ): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await runTransaction(
          db as Firestore,
          updateFunction,
          options
        );

        setLoading(false);
        return result;
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err : new Error('Unknown transaction error')
        );
        setLoading(false);
        return null;
      }
    },
    []
  );

  /**
   * Run a batch write operation
   * @param batchFunction - Function that takes a batch object and populates it with operations
   */ const runBatchOperation = useCallback(
    async (batchFunction: (batch: WriteBatch) => void): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        // Create a new batch
        const batch = writeBatch(db as Firestore);

        // Let the caller add operations to the batch
        batchFunction(batch);

        // Commit the batch
        await batch.commit();

        setLoading(false);
        return true;
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err
            : new Error('Unknown batch operation error')
        );
        setLoading(false);
        return false;
      }
    },
    []
  );

  /**
   * Create a batch helper with common operations
   */
  const createBatchHelper = useCallback(() => {
    const batch = writeBatch(db as Firestore);

    return {
      /**
       * Add a set operation to the batch
       */
      set: <T>(docRef: DocumentReference<T>, data: T) => {
        batch.set(docRef, data);
        return batch;
      },
      /**
       * Add an update operation to the batch
       */
      update: <T>(docRef: DocumentReference<T>, data: Partial<T>) => {
        batch.update(docRef, data);
        return batch;
      },
      /**
       * Add a delete operation to the batch
       */
      delete: <T>(docRef: DocumentReference<T>) => {
        batch.delete(docRef);
        return batch;
      },
      /**
       * Commit all operations in the batch
       */
      commit: async (): Promise<boolean> => {
        try {
          await batch.commit();
          return true;
        } catch (err: unknown) {
          setError(
            err instanceof Error ? err : new Error('Unknown batch commit error')
          );
          return false;
        }
      },
    };
  }, []);

  return {
    runTransaction: runTransactionOperation,
    runBatch: runBatchOperation,
    createBatchHelper,
    loading,
    error,
  };
}

export default useFirestoreTransaction;

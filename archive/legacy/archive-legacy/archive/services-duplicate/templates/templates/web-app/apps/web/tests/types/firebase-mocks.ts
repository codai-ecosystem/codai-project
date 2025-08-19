/**
 * Firebase Mock Type Definitions
 * Provides strict TypeScript types for Firebase mocks in tests
 */

// Mock document reference
export interface MockDocumentReference {
  id: string;
  path: string;
  parent?: MockCollectionReference;
}

// Mock collection reference
export interface MockCollectionReference {
  id: string;
  path: string;
  parent?: MockDocumentReference;
}

// Mock document snapshot
export interface MockDocumentSnapshot<T = Record<string, unknown>> {
  id: string;
  exists: () => boolean;
  data: () => T | undefined;
  ref: MockDocumentReference;
}

// Mock query snapshot
export interface MockQuerySnapshot<T = Record<string, unknown>> {
  docs: MockDocumentSnapshot<T>[];
  empty: boolean;
  size: number;
  forEach: (callback: (doc: MockDocumentSnapshot<T>) => void) => void;
}

// Mock query constraint
export interface MockQueryConstraint {
  type:
    | 'where'
    | 'orderBy'
    | 'limit'
    | 'startAt'
    | 'startAfter'
    | 'endAt'
    | 'endBefore';
  field?: string;
  op?: string;
  value?: unknown;
  direction?: 'asc' | 'desc';
  count?: number;
}

// Mock query
export interface MockQuery {
  ref: MockCollectionReference;
  constraints: MockQueryConstraint[];
}

// Firebase mock function types
export type MockFirebaseFunction<T> = T extends (...args: unknown[]) => unknown
  ? jest.MockedFunction<T>
  : jest.MockedFunction<(...args: unknown[]) => unknown>;

// Mock implementations type map
export interface FirebaseMockImplementations {
  collection: MockFirebaseFunction<
    typeof import('firebase/firestore').collection
  >;
  doc: MockFirebaseFunction<typeof import('firebase/firestore').doc>;
  getDoc: MockFirebaseFunction<typeof import('firebase/firestore').getDoc>;
  getDocs: MockFirebaseFunction<typeof import('firebase/firestore').getDocs>;
  addDoc: MockFirebaseFunction<typeof import('firebase/firestore').addDoc>;
  setDoc: MockFirebaseFunction<typeof import('firebase/firestore').setDoc>;
  updateDoc: MockFirebaseFunction<
    typeof import('firebase/firestore').updateDoc
  >;
  deleteDoc: MockFirebaseFunction<
    typeof import('firebase/firestore').deleteDoc
  >;
  query: MockFirebaseFunction<typeof import('firebase/firestore').query>;
  where: MockFirebaseFunction<typeof import('firebase/firestore').where>;
  orderBy: MockFirebaseFunction<typeof import('firebase/firestore').orderBy>;
  limit: MockFirebaseFunction<typeof import('firebase/firestore').limit>;
  onSnapshot: MockFirebaseFunction<
    typeof import('firebase/firestore').onSnapshot
  >;
}

// Mock factory functions
export const createMockDocumentReference = (
  id: string,
  collectionPath: string
): MockDocumentReference => ({
  id,
  path: `${collectionPath}/${id}`,
});

export const createMockCollectionReference = (
  path: string
): MockCollectionReference => ({
  id: path.split('/').pop() || '',
  path,
});

export const createMockDocumentSnapshot = <T = Record<string, unknown>>(
  id: string,
  data: T | undefined,
  exists = true
): MockDocumentSnapshot<T> => ({
  id,
  exists: () => exists,
  data: () => data,
  ref: createMockDocumentReference(id, 'test-collection'),
});

export const createMockQuerySnapshot = <T = Record<string, unknown>>(
  docs: MockDocumentSnapshot<T>[]
): MockQuerySnapshot<T> => ({
  docs,
  empty: docs.length === 0,
  size: docs.length,
  forEach: callback => docs.forEach(callback),
});

export const createMockQueryConstraint = (
  type: MockQueryConstraint['type'],
  options: Partial<MockQueryConstraint> = {}
): MockQueryConstraint => ({
  type,
  ...options,
});

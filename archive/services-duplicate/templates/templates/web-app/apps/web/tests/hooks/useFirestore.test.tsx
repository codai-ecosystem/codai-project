/**
 * Test suite for useFirestore hook
 *
 * Tests CRUD operations, subscriptions, query builders,
 * error handling, loading states, and user authentication integration.
 * Uses real Firebase connection with test data.
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import type { User } from 'firebase/auth';
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
  type CollectionReference,
  type DocumentReference,
  type Query,
  type QueryFieldFilterConstraint,
  type QueryLimitConstraint,
  type QueryOrderByConstraint,
} from 'firebase/firestore';

import { useAuth } from '@/hooks/useAuth';
import { useFirestore } from '@/hooks/useFirestore';

// Mock useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Type definitions for test data
interface TestDocument {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

// Mock implementations
const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockSetDoc = setDoc as jest.MockedFunction<typeof setDoc>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockDeleteDoc = deleteDoc as jest.MockedFunction<typeof deleteDoc>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockWhere = where as jest.MockedFunction<typeof where>;
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
const mockLimit = limit as jest.MockedFunction<typeof limit>;
const mockOnSnapshot = onSnapshot as jest.MockedFunction<typeof onSnapshot>;

// Get the mocked useAuth function
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('useFirestore Hook', () => {
  const testCollection = 'test-collection';
  const mockUser = {
    uid: 'user123',
    email: 'test@example.com',
    displayName: 'Test User',
    emailVerified: true,
    isAnonymous: false,
    phoneNumber: null,
    photoURL: null,
    providerId: 'firebase',
    metadata: {
      creationTime: '2023-01-01T00:00:00.000Z',
      lastSignInTime: '2023-01-01T00:00:00.000Z',
    },
    providerData: [],
    refreshToken: 'mock-refresh-token',
    tenantId: null,
    delete: jest.fn(),
    getIdToken: jest.fn(),
    getIdTokenResult: jest.fn(),
    reload: jest.fn(),
    toJSON: jest.fn(),
  } as User;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks - return a proper UseAuthReturn object
    mockUseAuth.mockReturnValue({
      user: {
        id: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        emailVerified: true,
        createdAt: new Date('2023-01-01'),
        lastLoginAt: new Date('2023-01-01'),
        preferences: {
          theme: 'system',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            marketing: false,
          },
        },
      },
      isLoading: false,
      isAuthenticated: true,
      error: null,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
      updateProfile: jest.fn(),
      updatePreferences: jest.fn(),
      sendPasswordReset: jest.fn(),
      sendEmailVerification: jest.fn(),
      // Phone authentication methods
      createRecaptchaVerifier: jest.fn(),
      sendPhoneVerification: jest.fn(),
      verifyPhoneCode: jest.fn(),
    });

    mockCollection.mockReturnValue({
      path: testCollection,
    } as unknown as CollectionReference);
    mockDoc.mockReturnValue({
      id: 'doc-id',
      path: `${testCollection}/doc-id`,
    } as unknown as DocumentReference);

    // Setup mockSetDoc
    mockSetDoc.mockResolvedValue(undefined);
    mockWhere.mockImplementation(
      (field, op, value) =>
        ({
          type: 'where',
          field,
          op,
          value,
        }) as unknown as QueryFieldFilterConstraint
    );
    mockOrderBy.mockImplementation(
      (field, direction) =>
        ({
          type: 'orderBy',
          field,
          direction,
        }) as unknown as QueryOrderByConstraint
    );
    mockLimit.mockImplementation(
      count => ({ type: 'limit', count }) as unknown as QueryLimitConstraint
    );
    mockQuery.mockImplementation(
      (ref, ...constraints) => ({ ref, constraints }) as unknown as Query
    );
  });

  describe('getDocument', () => {
    it('should fetch a document successfully', async () => {
      const testData = {
        title: 'Test Doc',
        content: 'Test Content',
        createdAt: new Date(),
      };
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => testData,
        id: 'doc-1',
      } as Partial<Awaited<ReturnType<typeof getDoc>>> as Awaited<
        ReturnType<typeof getDoc>
      >);

      const { result } = renderHook(() =>
        useFirestore<TestDocument>(testCollection)
      );

      let document: TestDocument | null = null;
      await act(async () => {
        document = await result.current.getDocument('doc-1');
      });

      expect(document).toEqual({ id: 'doc-1', ...testData });
      expect(mockGetDoc).toHaveBeenCalledTimes(1);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should return null for non-existent document', async () => {
      mockGetDoc.mockResolvedValue({
        exists: () => false,
        data: () => undefined,
      } as Partial<Awaited<ReturnType<typeof getDoc>>> as Awaited<
        ReturnType<typeof getDoc>
      >);

      const { result } = renderHook(() =>
        useFirestore<TestDocument>(testCollection)
      );

      let document: TestDocument | null = null;
      await act(async () => {
        document = await result.current.getDocument('non-existent');
      });

      expect(document).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      const errorMessage = 'Firestore error';
      mockGetDoc.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() =>
        useFirestore<TestDocument>(testCollection)
      );

      let document: TestDocument | null = null;
      await act(async () => {
        document = await result.current.getDocument('error-doc');
      });

      expect(document).toBeNull();
      expect(result.current.error?.message).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('getDocuments', () => {
    it('should fetch multiple documents', async () => {
      const testDocs = [
        {
          id: 'doc-1',
          title: 'Doc 1',
          content: 'Content 1',
          createdAt: new Date(),
        },
        {
          id: 'doc-2',
          title: 'Doc 2',
          content: 'Content 2',
          createdAt: new Date(),
        },
      ];

      mockGetDocs.mockResolvedValue({
        docs: testDocs.map(doc => ({
          id: doc.id,
          data: () => ({
            title: doc.title,
            content: doc.content,
            createdAt: doc.createdAt,
          }),
        })),
      } as Partial<Awaited<ReturnType<typeof getDocs>>> as Awaited<
        ReturnType<typeof getDocs>
      >);

      const { result } = renderHook(() =>
        useFirestore<TestDocument>(testCollection)
      );

      let documents: TestDocument[] = [];
      await act(async () => {
        documents = await result.current.getDocuments();
      });

      expect(documents).toHaveLength(2);
      expect(documents[0]).toEqual(testDocs[0]);
      expect(documents[1]).toEqual(testDocs[1]);
    });

    it('should handle query constraints', async () => {
      mockGetDocs.mockResolvedValue({
        docs: [],
      } as Partial<Awaited<ReturnType<typeof getDocs>>> as Awaited<
        ReturnType<typeof getDocs>
      >);

      const { result } = renderHook(() =>
        useFirestore<TestDocument>(testCollection)
      );
      const constraint = result.current.queryBuilders.where(
        'title',
        '==',
        'Test'
      );

      await act(async () => {
        await result.current.getDocuments([constraint]);
      });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: 'where',
          field: 'title',
          op: '==',
          value: 'Test',
        })
      );
    });
  });

  describe('addDocument', () => {
    it('should add a document successfully', async () => {
      const newDoc = {
        title: 'New Doc',
        content: 'New Content',
        createdAt: new Date(),
      };
      const mockDocRef = { id: 'new-doc-id' };
      mockAddDoc.mockResolvedValue(
        mockDocRef as Partial<DocumentReference> as DocumentReference
      );

      const { result } = renderHook(() =>
        useFirestore<TestDocument>(testCollection)
      );

      let docId: string | null = null;
      await act(async () => {
        docId = await result.current.addDocument(newDoc);
      });

      expect(docId).toBe('new-doc-id');
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...newDoc,
          userId: mockUser.uid,
          createdAt: expect.any(Date),
        })
      );
    });

    it('should handle add document errors', async () => {
      const newDoc = {
        title: 'Error Doc',
        content: 'Error Content',
        createdAt: new Date(),
      };
      mockAddDoc.mockRejectedValue(new Error('Add failed'));

      const { result } = renderHook(() =>
        useFirestore<TestDocument>(testCollection)
      );

      let docId: string | null = null;
      await act(async () => {
        docId = await result.current.addDocument(newDoc);
      });

      expect(docId).toBeNull();
      expect(result.current.error?.message).toBe('Add failed');
    });
  });

  describe('setDocument', () => {
    it('should set a document with specific ID', async () => {
      const docData = {
        title: 'Set Doc',
        content: 'Set Content',
        createdAt: new Date(),
      };
      mockSetDoc.mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useFirestore<TestDocument>(testCollection)
      );

      let success: boolean = false;
      await act(async () => {
        success = await result.current.setDocument('custom-id', docData);
      });

      expect(success).toBe(true);
      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...docData,
          userId: mockUser.uid,
          updatedAt: expect.any(Date),
        })
      );
    });
  });

  describe('updateDocument', () => {
    it('should update a document successfully', async () => {
      const updateData = { title: 'Updated Title' };
      mockUpdateDoc.mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useFirestore<TestDocument>(testCollection)
      );

      let success: boolean = false;
      await act(async () => {
        success = await result.current.updateDocument('doc-id', updateData);
      });

      expect(success).toBe(true);
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          ...updateData,
          updatedAt: expect.any(Date),
        })
      );
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document successfully', async () => {
      mockDeleteDoc.mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useFirestore<TestDocument>(testCollection)
      );

      let success: boolean = false;
      await act(async () => {
        success = await result.current.deleteDocument('doc-id');
      });

      expect(success).toBe(true);
      expect(mockDeleteDoc).toHaveBeenCalledWith(expect.anything());
    });
  });

  describe('subscribeToDocument', () => {
    it('should subscribe to document changes', () => {
      const callback = jest.fn();
      const unsubscribe = jest.fn();
      mockOnSnapshot.mockReturnValue(unsubscribe);

      const { result } = renderHook(() =>
        useFirestore<TestDocument>(testCollection)
      );

      act(() => {
        const unsubscribeFn = result.current.subscribeToDocument(
          'doc-id',
          callback
        );
        expect(typeof unsubscribeFn).toBe('function');
      });

      expect(mockOnSnapshot).toHaveBeenCalledTimes(1);
    });
  });

  describe('subscribeToQuery', () => {
    it('should subscribe to query changes', () => {
      const callback = jest.fn();
      const unsubscribe = jest.fn();
      mockOnSnapshot.mockImplementation(
        (_query, successCallback, _errorCallback) => {
          // Simulate a query snapshot
          const mockSnapshot = {
            docs: [
              {
                id: 'doc-1',
                data: () => ({
                  title: 'Test',
                  content: 'Content',
                  createdAt: new Date(),
                }),
              },
            ],
          };
          // Type assertion to bypass TypeScript checking for this test
          (successCallback as (snapshot: unknown) => void)(mockSnapshot);
          return unsubscribe;
        }
      );

      const { result } = renderHook(() =>
        useFirestore<TestDocument>(testCollection)
      );

      act(() => {
        const constraint = result.current.queryBuilders.where(
          'title',
          '==',
          'Test'
        );
        const unsubscribeFn = result.current.subscribeToQuery(
          [constraint],
          callback
        );
        expect(typeof unsubscribeFn).toBe('function');
      });

      expect(callback).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 'doc-1',
          title: 'Test',
          content: 'Content',
        }),
      ]);
    });
  });

  describe('queryBuilders', () => {
    it('should provide query builder utilities', () => {
      const { result } = renderHook(() =>
        useFirestore<TestDocument>(testCollection)
      );

      expect(result.current.queryBuilders).toHaveProperty('where');
      expect(result.current.queryBuilders).toHaveProperty('orderBy');
      expect(result.current.queryBuilders).toHaveProperty('limit');
      expect(result.current.queryBuilders).toHaveProperty('userConstraint');

      // Test where builder
      const whereConstraint = result.current.queryBuilders.where(
        'title',
        '==',
        'Test'
      );
      expect(whereConstraint).toEqual({
        type: 'where',
        field: 'title',
        op: '==',
        value: 'Test',
      });

      // Test orderBy builder
      const orderByConstraint = result.current.queryBuilders.orderBy(
        'createdAt',
        'desc'
      );
      expect(orderByConstraint).toEqual({
        type: 'orderBy',
        field: 'createdAt',
        direction: 'desc',
      });

      // Test limit builder
      const limitConstraint = result.current.queryBuilders.limit(10);
      expect(limitConstraint).toEqual({
        type: 'limit',
        count: 10,
      });
    });

    it('should include user constraint when user is authenticated', () => {
      const { result } = renderHook(() =>
        useFirestore<TestDocument>(testCollection)
      );

      expect(result.current.queryBuilders.userConstraint).toEqual({
        type: 'where',
        field: 'userId',
        op: '==',
        value: mockUser.uid,
      });
    });
    it('should not include user constraint when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signInWithGoogle: jest.fn(),
        signOut: jest.fn(),
        updateProfile: jest.fn(),
        updatePreferences: jest.fn(),
        sendPasswordReset: jest.fn(),
        sendEmailVerification: jest.fn(),
        createRecaptchaVerifier: jest.fn(),
        sendPhoneVerification: jest.fn(),
        verifyPhoneCode: jest.fn(),
      });

      const { result } = renderHook(() =>
        useFirestore<TestDocument>(testCollection)
      );

      expect(result.current.queryBuilders.userConstraint).toBeNull();
    });
  });

  describe('loading states', () => {
    it('should handle loading states correctly', async () => {
      let resolveGetDoc: (value: unknown) => void;
      const getDocPromise = new Promise(resolve => {
        resolveGetDoc = resolve;
      });
      mockGetDoc.mockReturnValue(
        getDocPromise as Promise<Awaited<ReturnType<typeof getDoc>>>
      );

      const { result } = renderHook(() =>
        useFirestore<TestDocument>(testCollection)
      );

      expect(result.current.loading).toBe(false);

      act(() => {
        result.current.getDocument('doc-id');
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolveGetDoc({
          exists: () => true,
          data: () => ({ title: 'Test' }),
          id: 'doc-id',
        });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });
});

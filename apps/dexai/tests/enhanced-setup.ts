import '@testing-library/jest-dom';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
        replace: jest.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/dictionary',
}));

// Mock Firebase
jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(),
    getApps: jest.fn(() => []),
}));

jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    connectFirestoreEmulator: jest.fn(),
    collection: jest.fn(),
    doc: jest.fn(),
    getDocs: jest.fn(),
    setDoc: jest.fn(),
    deleteDoc: jest.fn(),
}));

// Global test setup
beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
});

/**
 * Test Fixtures for METU Template
 * Centralized test data and mock objects
 */

import type { User } from '@/types/auth';

// User fixtures
export const userFixtures = {
  adminUser: {
    id: 'admin-user-id',
    email: 'admin@metu.template',
    displayName: 'Admin User',
    photoURL: 'https://via.placeholder.com/150',
    emailVerified: true,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    lastLoginAt: new Date(),
    preferences: {
      theme: 'light' as const,
      language: 'en' as const,
      notifications: {
        email: true,
        push: true,
        marketing: false,
      },
    },
  } as User,
  regularUser: {
    id: 'regular-user-id',
    email: 'user@metu.template',
    displayName: 'Regular User',
    emailVerified: true,
    createdAt: new Date('2024-01-15T00:00:00.000Z'),
    lastLoginAt: new Date(),
    preferences: {
      theme: 'dark' as const,
      language: 'en' as const,
      notifications: {
        email: false,
        push: true,
        marketing: false,
      },
    },
  } as User,
  unverifiedUser: {
    id: 'unverified-user-id',
    email: 'unverified@metu.template',
    displayName: 'Unverified User',
    emailVerified: false,
    createdAt: new Date(),
    lastLoginAt: new Date(),
    preferences: {
      theme: 'system' as const,
      language: 'en' as const,
      notifications: {
        email: false,
        push: false,
        marketing: false,
      },
    },
  } as User,
};

// API response fixtures
export const apiFixtures = {
  authSuccess: {
    success: true,
    data: {
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
      user: userFixtures.regularUser,
      expiresIn: 3600,
    },
    message: 'Authentication successful',
  },

  authError: {
    success: false,
    data: null,
    error: {
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password',
      details: {},
    },
  },

  validationError: {
    success: false,
    data: null,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: {
        email: ['Email is required'],
        password: ['Password must be at least 8 characters'],
      },
    },
  },

  serverError: {
    success: false,
    data: null,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      details: {},
    },
  },
};

// Form data fixtures
export const formFixtures = {
  validLoginForm: {
    email: 'user@metu.template',
    password: 'SecurePassword123!',
    rememberMe: false,
  },

  invalidLoginForm: {
    email: 'invalid-email',
    password: '123',
    rememberMe: false,
  },

  validRegisterForm: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@metu.template',
    password: 'SecurePassword123!',
    confirmPassword: 'SecurePassword123!',
    acceptTerms: true,
  },

  validProfileForm: {
    firstName: 'Updated',
    lastName: 'Name',
    bio: 'Updated bio information',
    location: 'New Location',
    website: 'https://updated-website.com',
    company: 'Updated Company',
    jobTitle: 'Updated Job Title',
  },
};

// Component props fixtures
export const componentFixtures = {
  buttonProps: {
    primary: {
      variant: 'primary' as const,
      size: 'md' as const,
      children: 'Primary Button',
      onClick: () => {},
    },
    secondary: {
      variant: 'secondary' as const,
      size: 'lg' as const,
      children: 'Secondary Button',
      disabled: false,
    },
    loading: {
      variant: 'primary' as const,
      size: 'md' as const,
      children: 'Loading Button',
      isLoading: true,
    },
  },

  inputProps: {
    text: {
      type: 'text' as const,
      placeholder: 'Enter text',
      value: '',
      onChange: () => {},
    },
    email: {
      type: 'email' as const,
      placeholder: 'Enter email',
      value: 'test@example.com',
      required: true,
    },
    password: {
      type: 'password' as const,
      placeholder: 'Enter password',
      value: '',
      required: true,
    },
  },

  modalProps: {
    open: {
      isOpen: true,
      onClose: () => {},
      title: 'Test Modal',
      children: 'Modal content goes here',
    },
    closed: {
      isOpen: false,
      onClose: () => {},
      title: 'Test Modal',
      children: 'Modal content goes here',
    },
  },
};

// Navigation fixtures
export const navigationFixtures = {
  publicRoutes: [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
    { path: '/login', label: 'Login' },
    { path: '/register', label: 'Register' },
  ],

  authenticatedRoutes: [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/profile', label: 'Profile' },
    { path: '/settings', label: 'Settings' },
  ],

  adminRoutes: [
    { path: '/admin', label: 'Admin Panel' },
    { path: '/admin/users', label: 'User Management' },
    { path: '/admin/settings', label: 'System Settings' },
    { path: '/admin/analytics', label: 'Analytics' },
  ],
};

// Database fixtures
export const databaseFixtures = {
  users: [
    userFixtures.adminUser,
    userFixtures.regularUser,
    userFixtures.unverifiedUser,
  ],

  posts: [
    {
      id: 'post-1',
      title: 'First Test Post',
      content: 'This is the content of the first test post.',
      authorId: userFixtures.regularUser.id,
      published: true,
      createdAt: '2024-01-20T10:00:00.000Z',
      updatedAt: '2024-01-20T10:00:00.000Z',
      tags: ['test', 'first'],
      views: 100,
      likes: 10,
    },
    {
      id: 'post-2',
      title: 'Second Test Post',
      content: 'This is the content of the second test post.',
      authorId: userFixtures.adminUser.id,
      published: true,
      createdAt: '2024-01-21T10:00:00.000Z',
      updatedAt: '2024-01-21T10:00:00.000Z',
      tags: ['test', 'second'],
      views: 150,
      likes: 25,
    },
  ],

  notifications: [
    {
      id: 'notification-1',
      type: 'info',
      title: 'Welcome!',
      message: 'Welcome to METU Template',
      userId: userFixtures.regularUser.id,
      read: false,
      createdAt: '2024-01-20T10:00:00.000Z',
    },
    {
      id: 'notification-2',
      type: 'success',
      title: 'Profile Updated',
      message: 'Your profile has been successfully updated',
      userId: userFixtures.regularUser.id,
      read: true,
      createdAt: '2024-01-19T10:00:00.000Z',
    },
  ],
};

// Performance benchmarks
export const performanceFixtures = {
  benchmarks: {
    pageLoad: {
      target: 2000, // 2 seconds
      warning: 1500, // 1.5 seconds
      good: 1000, // 1 second
    },
    firstContentfulPaint: {
      target: 1200,
      warning: 900,
      good: 600,
    },
    largestContentfulPaint: {
      target: 2500,
      warning: 2000,
      good: 1500,
    },
    cumulativeLayoutShift: {
      target: 0.25,
      warning: 0.15,
      good: 0.1,
    },
    timeToInteractive: {
      target: 3000,
      warning: 2500,
      good: 2000,
    },
  },
};

// Export helper functions
export const createMockUser = (overrides = {}) => ({
  ...userFixtures.regularUser,
  ...overrides,
});

export const createMockApiResponse = (data: unknown, success = true) => ({
  success,
  data: success ? data : null,
  error: success ? null : data,
  timestamp: new Date().toISOString(),
});

export const createMockFormData = (type: string, overrides = {}) => {
  const formData = {
    login: formFixtures.validLoginForm,
    register: formFixtures.validRegisterForm,
    profile: formFixtures.validProfileForm,
  };

  return {
    ...formData[type as keyof typeof formData],
    ...overrides,
  };
};

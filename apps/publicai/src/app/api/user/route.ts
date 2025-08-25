/**
 * User API Route for PublicAI - Migrated to @codai/api-utils
 */

import { NextRequest } from "next/server";
import { createUserEndpoint, MockUser } from '@codai/api-utils/user';

// Mock users for PublicAI
const MOCK_USERS: MockUser[] = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@publicai.app',
    role: 'user',
    preferences: {
      theme: 'light',
      apiAccess: 'public',
      notifications: false
    },
    permissions: ['publicai:read'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Create the endpoint using @codai/api-utils
const userEndpoint = createUserEndpoint(
  {
    service: 'PublicAI',
    version: '2.0.0',
    requireAuth: false, // Public API
    defaultPreferences: {
      theme: 'light',
      apiAccess: 'public',
      notifications: false
    },
    onSuccess: async (user, request) => {
      console.log(`[PublicAI] User operation successful for: ${user.email}`);
    },
    onFailure: async (error, request) => {
      console.error('[PublicAI] User operation failed:', error);
    }
  },
  MOCK_USERS
);

// Export the handlers
export const GET = userEndpoint.GET;
export const PUT = userEndpoint.PUT;
export const DELETE = userEndpoint.DELETE;

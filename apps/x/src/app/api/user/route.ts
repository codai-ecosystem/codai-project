/**
 * User API Route for X - Migrated to @codai/api-utils
 */

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPrismaUserEndpoint } from '@codai/api-utils/user';

// Create the endpoint using @codai/api-utils
const userEndpoint = createPrismaUserEndpoint({
  service: 'X',
  version: '2.0.0',
  requireAuth: true,
  prisma,
  getServerSession,
  authOptions,
  defaultPreferences: {
    theme: 'dark',
    timeline: 'algorithmic',
    notifications: true,
    privacy: 'public'
  },
  onSuccess: async (user, request) => {
    console.log(`[X] User operation successful for: ${user.email}`);
  },
  onFailure: async (error, request) => {
    console.error('[X] User operation failed:', error);
  }
});

// Export the handlers
export const GET = userEndpoint.GET;
export const PUT = userEndpoint.PUT;
export const DELETE = userEndpoint.DELETE;

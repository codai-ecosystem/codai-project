import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { authenticate } from '../../src/lib/auth-middleware';
import { createTestFirebaseToken, createTestUser, deleteTestUser, type TestUser } from '../test-utils';

describe('Authentication Middleware (Real Services)', () => {
  let testUser: TestUser | null = null;
  let validToken: string;

  beforeEach(async () => {
    console.log('Starting new test with real services');
    testUser = await createTestUser();
    validToken = createTestFirebaseToken(testUser.uid);
  });

  afterEach(async () => {
    if (testUser) {
      await deleteTestUser(testUser.uid);
      testUser = null;
    }
  });

  describe('Missing Authorization Header', () => {
    it('should return 401 when no authorization header is provided', async () => {
      const mockRequest = {
        headers: {},
        log: {
          error: vi.fn(),
        },
      };

      const mockReply = {
        code: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      };

      await authenticate(mockRequest as never, mockReply as never);

      expect(mockReply.code).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Authorization required' });
    });

    it('should return 401 when authorization header does not start with Bearer', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Basic token123',
        },
        log: {
          error: vi.fn(),
        },
      };

      const mockReply = {
        code: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      };

      await authenticate(mockRequest as never, mockReply as never);

      expect(mockReply.code).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Authorization required' });
    });
  });

  describe('Invalid Token Format', () => {
    it('should return 401 when token is missing after Bearer', async () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer ',
        },
        log: {
          error: vi.fn(),
        },
      };

      const mockReply = {
        code: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      };

      await authenticate(mockRequest as never, mockReply as never);

      expect(mockReply.code).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Token missing' });
    });
  });

  describe('JWT Verification with Real Data', () => {
    it('should successfully authenticate with valid real token', async () => {
      const mockRequest = {
        headers: {
          authorization: `Bearer ${validToken}`,
        },
        log: {
          error: vi.fn(),
        },
      };

      const mockReply = {
        code: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      };

      await authenticate(mockRequest as never, mockReply as never);

      // Should not call reply methods if authentication succeeds
      expect(mockReply.code).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();

      // Should have set user property  
      expect(mockRequest).toHaveProperty('user');
      expect((mockRequest as { user?: { uid: string; }; }).user?.uid).toBe(testUser!.uid);
    });

    it('should return 401 when JWT verification fails with invalid token', async () => {
      const invalidToken = 'invalid.token.here';

      const mockRequest = {
        headers: {
          authorization: `Bearer ${invalidToken}`,
        },
        log: {
          error: vi.fn(),
        },
      };

      const mockReply = {
        code: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      };

      await authenticate(mockRequest as never, mockReply as never);

      expect(mockReply.code).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid token' });
    });
  });
});

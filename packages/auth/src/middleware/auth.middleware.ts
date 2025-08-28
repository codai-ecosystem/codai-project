import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../auth.service';
import { AuthRequest, AuthMiddlewareOptions } from '../auth.types';
import { authConfig } from '../auth.config';

export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  const authService = new AuthService(authConfig);

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const authRequest = request as unknown as AuthRequest;

    try {
      // Extract token from header
      const token = extractBearerToken(request.headers.authorization);

      if (!token) {
        if (options.requireAuth !== false) {
          return reply.status(401).send({
            success: false,
            error: 'Authorization token required',
            code: 'MISSING_TOKEN'
          });
        }
        return; // Allow unauthenticated access
      }

      // Verify token and get user (simplified for demo)
      // In real implementation, this would use the full auth service
      const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

      if (!decoded || !decoded.userId) {
        return reply.status(401).send({
          success: false,
          error: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      }

      // Mock user for demonstration
      const mockUser = {
        id: decoded.userId,
        email: decoded.email || 'test@codai.com',
        roles: decoded.roles || [{ id: 'user', name: 'user', description: 'Standard user', permissions: [] }],
        permissions: decoded.permissions || [],
        isEmailVerified: decoded.isEmailVerified || true,
        isMfaEnabled: decoded.isMfaEnabled || false,
        tokenVersion: 1,
        passwordHash: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Attach user to request
      authRequest.user = mockUser;

      // Check email verification if required
      if (options.requireEmailVerification && !mockUser.isEmailVerified) {
        return reply.status(403).send({
          success: false,
          error: 'Email verification required',
          code: 'EMAIL_NOT_VERIFIED'
        });
      }

      // Check MFA if required
      if (options.requireMfa && !mockUser.isMfaEnabled) {
        return reply.status(403).send({
          success: false,
          error: 'Multi-factor authentication required',
          code: 'MFA_REQUIRED'
        });
      }

      // Check permissions if specified
      if (options.requiredPermissions?.length) {
        const hasPermissions = options.requiredPermissions.every(perm =>
          mockUser.permissions.includes(perm)
        );

        if (!hasPermissions) {
          return reply.status(403).send({
            success: false,
            error: 'Insufficient permissions',
            code: 'INSUFFICIENT_PERMISSIONS'
          });
        }
      }

      // Check roles if specified
      if (options.requiredRoles?.length) {
        const hasRoles = options.requiredRoles.some(role =>
          mockUser.roles.some(userRole => userRole.name === role)
        );

        if (!hasRoles) {
          return reply.status(403).send({
            success: false,
            error: 'Insufficient role privileges',
            code: 'INSUFFICIENT_ROLES'
          });
        }
      }

    } catch (error) {
      return reply.status(401).send({
        success: false,
        error: 'Authentication failed',
        code: 'AUTH_FAILED'
      });
    }
  };
}

function extractBearerToken(authorization?: string): string | null {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }
  return authorization.substring(7);
}
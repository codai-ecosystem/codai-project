// LogAI Authentication Middleware for Next.js
import { NextRequest, NextResponse } from 'next/server';
import { logai, type AuthUser } from '@/lib/codai-client';

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthUser;
}

export interface AuthMiddlewareOptions {
  requireAuth?: boolean;
  allowedRoles?: string[];
  redirectTo?: string;
}

export async function withAuth(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<NextResponse | { user: AuthUser }> {
  const {
    requireAuth = true,
    allowedRoles = [],
    redirectTo = '/auth/signin'
  } = options;

  try {
    // Extract token from Authorization header or cookies
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || 
                  request.cookies.get('bancai-auth-token')?.value;

    if (!token) {
      if (requireAuth) {
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }
      return NextResponse.next();
    }

    // Validate token with LogAI service
    const authResult = await logai.authenticate(token);

    if (!authResult.success || !authResult.data) {
      // Clear invalid token
      const response = NextResponse.redirect(new URL(redirectTo, request.url));
      response.cookies.delete('bancai-auth-token');
      return response;
    }

    const user = authResult.data;

    // Check role permissions
    if (allowedRoles.length > 0) {
      const hasRequiredRole = allowedRoles.some(role => 
        user.roles.includes(role)
      );

      if (!hasRequiredRole) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    return { user };
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (requireAuth) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    
    return NextResponse.next();
  }
}

// Session management utilities
export class SessionManager {
  private static readonly TOKEN_COOKIE = 'bancai-auth-token';
  private static readonly REFRESH_COOKIE = 'bancai-refresh-token';
  private static readonly USER_COOKIE = 'bancai-user';

  static setSession(
    response: NextResponse,
    tokens: { token: string; refreshToken: string },
    user: AuthUser
  ): void {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };

    response.cookies.set(this.TOKEN_COOKIE, tokens.token, {
      ...cookieOptions,
      maxAge: 60 * 60, // 1 hour
    });

    response.cookies.set(this.REFRESH_COOKIE, tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    response.cookies.set(this.USER_COOKIE, JSON.stringify(user), {
      ...cookieOptions,
      httpOnly: false, // Allow client-side access for user info
      maxAge: 60 * 60, // 1 hour
    });
  }

  static clearSession(response: NextResponse): void {
    response.cookies.delete(this.TOKEN_COOKIE);
    response.cookies.delete(this.REFRESH_COOKIE);
    response.cookies.delete(this.USER_COOKIE);
  }

  static async refreshSession(request: NextRequest): Promise<{
    success: boolean;
    tokens?: { token: string; refreshToken: string };
    user?: AuthUser;
  }> {
    const refreshToken = request.cookies.get(this.REFRESH_COOKIE)?.value;

    if (!refreshToken) {
      return { success: false };
    }

    try {
      const refreshResult = await logai.refreshToken(refreshToken);

      if (!refreshResult.success || !refreshResult.data) {
        return { success: false };
      }

      // Get updated user info
      const userResult = await logai.getCurrentUser(refreshResult.data.token);

      if (!userResult.success || !userResult.data) {
        return { success: false };
      }

      return {
        success: true,
        tokens: refreshResult.data,
        user: userResult.data,
      };
    } catch (error) {
      console.error('Session refresh error:', error);
      return { success: false };
    }
  }
}

// Protected route wrapper for API routes
export function withAuthApi<T = any>(
  handler: (req: AuthenticatedRequest, user: AuthUser) => Promise<NextResponse<T>>,
  options: AuthMiddlewareOptions = {}
) {
  return async (req: AuthenticatedRequest): Promise<NextResponse> => {
    const authResult = await withAuth(req, options);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Add user to request object
    req.user = authResult.user;

    return handler(req, authResult.user);
  };
}

// Role-based access control
export const RequireRole = {
  ADMIN: ['admin'],
  USER: ['user', 'admin'],
  PREMIUM: ['premium', 'admin'],
  FINANCIAL_ADVISOR: ['financial_advisor', 'admin'],
} as const;

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard', '/profile', '/settings'];

// Define auth routes that should redirect if user is already authenticated
const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password'];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // For Firebase client-side auth, we primarily rely on client-side redirects
  // However, we can still add some basic protection for obvious cases

  // Check if there's a Zustand auth store in localStorage (from previous session)
  // This is a basic check and not foolproof since middleware runs server-side
  const authStorage = request.cookies.get('auth-storage')?.value;
  let isAuthenticated = false;

  if (authStorage !== undefined) {
    try {
      const parsed: unknown = JSON.parse(decodeURIComponent(authStorage));
      isAuthenticated =
        typeof parsed === 'object' &&
        parsed !== null &&
        'state' in parsed &&
        typeof parsed.state === 'object' &&
        parsed.state !== null &&
        'isAuthenticated' in parsed.state &&
        parsed.state.isAuthenticated === true;
    } catch {
      // Invalid storage format
      isAuthenticated = false;
    }
  }

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // For protected routes, we'll let the client-side auth handle redirects
  // but we can add a query parameter to help with loading states
  if (isProtectedRoute && !isAuthenticated) {
    const response = NextResponse.next();
    response.headers.set('x-auth-required', 'true');
    return response;
  }

  // For auth routes with authenticated users, redirect to dashboard
  if (isAuthRoute && isAuthenticated) {
    const redirectUrl =
      request.nextUrl.searchParams.get('from') ?? '/dashboard';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Allow all other routes to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

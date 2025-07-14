import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Simple middleware for protected routes
  const { pathname } = request.nextUrl;

  // Check if it's a protected route
  const isProtectedRoute = pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api/secure") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/profile");

  if (isProtectedRoute) {
    // Check for auth token in cookies or headers
    const token = request.cookies.get('next-auth.session-token') ||
      request.headers.get('authorization');

    if (!token) {
      // Redirect to login for protected routes
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/:path*",
    "/settings/:path*",
    "/profile/:path*"
  ]
};

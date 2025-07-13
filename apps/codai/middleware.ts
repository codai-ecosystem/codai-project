import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add custom middleware logic here if needed
  // For now, just pass through all requests
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

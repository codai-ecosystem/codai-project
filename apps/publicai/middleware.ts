import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Simple middleware without auth for now
  // Can add authentication logic later when next-auth is properly configured
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/:path*",
    "/settings/:path*",
    "/profile/:path*"
  ]
}

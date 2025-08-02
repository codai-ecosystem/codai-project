import { NextRequest, NextResponse } from 'next/server'

// Phase 1 Implementation - Simplified middleware
export default function middleware(request: NextRequest) {
  // For Phase 1, allow all requests to pass through
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}

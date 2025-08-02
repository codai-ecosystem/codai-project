import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple middleware without external dependencies - to be enhanced with shared-ui later
export function middleware(request: NextRequest) {
  // Allow all requests for now - auth can be added later
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}

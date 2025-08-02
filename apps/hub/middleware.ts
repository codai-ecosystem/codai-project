// import { createAuthMiddleware } from '@codai/shared-ui'

// Temporarily disabled middleware due to workspace dependency issue
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function middleware(request: NextRequest) {
  // Simple passthrough middleware for now
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}

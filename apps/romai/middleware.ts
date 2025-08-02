import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // For now, allow all requests - will implement proper auth later
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}

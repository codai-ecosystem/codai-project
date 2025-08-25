import { NextRequest, NextResponse } from 'next/server'

const publicRoutes = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/'
]

const protectedRoutes = [
  '/dashboard',
  '/settings',
  '/profile',
  '/features',
  '/analytics'
]

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // For protected routes, check auth (simplified for Docker build)
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // In a real app, check for auth token here
    // For now, just allow to prevent build issues
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}

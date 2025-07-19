import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if user is accessing protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/memories') ||
    request.nextUrl.pathname.startsWith('/api/')) {

    // Check for authentication token
    const token = request.cookies.get('codai_auth_token')?.value

    if (!token) {
      // Redirect to centralized login
      const loginUrl = new URL('http://localhost:4800/login')
      loginUrl.searchParams.set('redirect', request.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/memories/:path*',
    '/api/:path*'
  ]
}

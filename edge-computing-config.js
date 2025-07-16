// Edge Computing Configuration
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const country = request.geo?.country || 'US';
  
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  response.headers.set('X-Edge-Region', country);
  
  return response;
}

export const config = {
  matcher: ['/api/:path*', '/app/:path*'],
  runtime: 'edge'
};

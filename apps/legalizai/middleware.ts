import { createAuthMiddleware } from '@codai/shared-ui'

export default createAuthMiddleware({
  loginUrl: '/login',
  dashboardUrl: '/dashboard',
  publicRoutes: [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password'
  ],
  protectedRoutes: [
    '/dashboard',
    '/settings',
    '/profile',
    '/documents', '/cases', '/compliance'
  ]
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}

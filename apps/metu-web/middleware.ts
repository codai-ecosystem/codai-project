// Middleware temporarily disabled for standalone deployment
// import { createAuthMiddleware } from '@codai/shared-ui'

// export default createAuthMiddleware({
//   loginUrl: '/login',
//   dashboardUrl: '/dashboard',
//   publicRoutes: [
//     '/login',
//     '/signup',
//     '/forgot-password',
//     '/reset-password'
//   ],
//   protectedRoutes: [
//     '/dashboard',
//     '/settings',
//     '/profile',
//     '/features', '/analytics'
//   ]
// })

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}

import { AuthConfig } from '../hooks/useAuth'

export interface AppRouteConfig {
    auth: AuthConfig
    routes: {
        public: string[]      // Routes accessible without authentication
        protected: string[]   // Routes requiring authentication
        admin?: string[]      // Routes requiring admin role
    }
}

export const createDefaultRouteConfig = (appName: string): AppRouteConfig => ({
    auth: {
        landingPage: '/',
        homePage: '/home',
        dashboardPage: '/dashboard',
        loginRedirect: '/dashboard',
        logoutRedirect: '/'
    },
    routes: {
        public: ['/', '/login', '/signup', '/forgot-password', '/terms', '/privacy'],
        protected: ['/dashboard', '/home', '/profile', '/settings'],
        admin: ['/admin']
    }
})

export const isPublicRoute = (pathname: string, config: AppRouteConfig): boolean => {
    return config.routes.public.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    )
}

export const isProtectedRoute = (pathname: string, config: AppRouteConfig): boolean => {
    return config.routes.protected.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    )
}

export const isAdminRoute = (pathname: string, config: AppRouteConfig): boolean => {
    return config.routes.admin?.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    ) || false
}

export const getRouteType = (pathname: string, config: AppRouteConfig): 'public' | 'protected' | 'admin' | 'unknown' => {
    if (isAdminRoute(pathname, config)) return 'admin'
    if (isProtectedRoute(pathname, config)) return 'protected'
    if (isPublicRoute(pathname, config)) return 'public'
    return 'unknown'
}

export const shouldRedirectToAuth = (pathname: string, isAuthenticated: boolean, config: AppRouteConfig): boolean => {
    const routeType = getRouteType(pathname, config)
    return (routeType === 'protected' || routeType === 'admin') && !isAuthenticated
}

export const shouldRedirectToDashboard = (pathname: string, isAuthenticated: boolean, config: AppRouteConfig): boolean => {
    return isAuthenticated && pathname === config.auth.landingPage
}

export const getRedirectPath = (
    pathname: string,
    isAuthenticated: boolean,
    userRole: string | undefined,
    config: AppRouteConfig
): string | null => {
    // If user is authenticated and on landing page, redirect to dashboard
    if (shouldRedirectToDashboard(pathname, isAuthenticated, config)) {
        return config.auth.dashboardPage
    }

    // If user is not authenticated and on protected route, redirect to landing
    if (shouldRedirectToAuth(pathname, isAuthenticated, config)) {
        return config.auth.landingPage
    }

    // If user is not admin and on admin route, redirect to dashboard
    if (isAdminRoute(pathname, config) && isAuthenticated && userRole !== 'admin') {
        return config.auth.dashboardPage
    }

    return null
}

export class RouteGuard {
    private config: AppRouteConfig

    constructor(config: AppRouteConfig) {
        this.config = config
    }

    canAccess(pathname: string, isAuthenticated: boolean, userRole?: string): boolean {
        const routeType = getRouteType(pathname, this.config)

        switch (routeType) {
            case 'public':
                return true
            case 'protected':
                return isAuthenticated
            case 'admin':
                return isAuthenticated && userRole === 'admin'
            default:
                return true // Allow unknown routes by default
        }
    }

    getRequiredRedirect(pathname: string, isAuthenticated: boolean, userRole?: string): string | null {
        return getRedirectPath(pathname, isAuthenticated, userRole, this.config)
    }
}

export default RouteGuard

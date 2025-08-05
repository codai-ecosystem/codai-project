// Core Components
export { Button, buttonVariants } from './components/ui/Button'
export { Input } from './components/ui/Input'
export { Header } from './components/layout/Header'
export { Footer } from './components/layout/Footer'
export { Layout } from './components/layout/Layout'
export { default as AppLayout } from './components/layout/AppLayout'
export { DashboardLayout } from './components/layout/DashboardLayout'
export { LandingLayout } from './components/layout/LandingLayout'
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './components/ui/Card'
export { default as MetricCard } from './components/ui/MetricCard'
export { default as FeatureCard } from './components/ui/FeatureCard'
export { LoadingSpinner } from './components/ui/LoadingSpinner'
export { ErrorBoundary } from './components/ui/ErrorBoundary'

// Animation Components - Week 2 Phase 2 Advanced Animations
// Temporarily disabled due to TypeScript compilation issues during testing validation
/*
export {
    AnimatedContainer,
    PageTransition,
    Skeleton,
    LoadingSpinner as AnimatedLoadingSpinner,
    LoadingDots,
    AnimatedModal,
    AnimatedButton,
    AnimatedCard,
    ScrollAnimation,
    StaggerContainer,
    AnimatedProgress,
    AnimatedNotification
} from './animations/animation-components'

// Gesture System - Week 2 Phase 2 Advanced Interactions
export {
    useSwipeGesture,
    useDragGesture,
    useLongPress,
    SwipeableCard,
    DraggableElement,
    LongPressButton
} from './animations/gesture-system'

// Animation System Core - Week 2 Phase 2 Core System
export {
    useAnimation,
    useReducedMotion,
    useIntersectionObserver,
    SpringAnimation,
    AnimationPerformanceMonitor,
    createStaggerAnimation,
    AnimationQueue
} from './animations/core-animation-system'
*/

// Advanced Gesture System - Day 7 Mobile Touch Optimization
// Temporarily disabled due to SSR compilation issues during testing validation
// export * from './gestures'

// Authentication Components
export { default as AuthLayout } from './components/auth/AuthLayout'
export { default as LoginForm } from './components/auth/LoginForm'
export { default as SignupForm } from './components/auth/SignupForm'

// Page Components
export { default as LandingPage } from './components/pages/LandingPage'
export { LandingPage as LandingPageComponent } from './components/pages/LandingPage'
export { DashboardPage } from './components/pages/DashboardPage'
export { HomePage } from './components/pages/HomePage'

// Routing Components
export { ProtectedRoute } from './components/routing/ProtectedRoute'
export { GuestRoute } from './components/routing/GuestRoute'
export { AppRouting } from './components/routing/AppRouting'

// Layout Components - New AppShell
export { AppShell } from './components/layout/AppShell'

// Authentication Context
export { AuthProvider, useAuth, withAuth, useGuestRoute } from './contexts/AuthProvider'
export type { User, AuthContextType, RegisterData } from './contexts/AuthProvider'

// Middleware
export { createAuthMiddleware } from './middleware/auth'
export { createSecurityHeaders, applySecurityHeaders, securityMiddleware } from './middleware/security-headers'
export type { SecurityHeadersConfig } from './middleware/security-headers'

// I18n Components - Enhanced Phase 2
export { I18nProvider, useTranslation } from './components/i18n/I18nProvider'

// Configuration - Phase 2 Addition
export { appConfigs } from './config/appConfigs'
export type { AppConfig } from './config/appConfigs'

// Hooks
export { default as useAuthLegacy } from './hooks/useAuth'
export type { AuthUser, AuthConfig } from './hooks/useAuth'

// Utilities
export { cn, formatFileSize, debounce, throttle, generateId, capitalize, slugify, copyToClipboard, isValidEmail, isValidUrl, formatDate, formatRelativeTime, getInitials, truncate, randomColor } from './lib/utils'
export { default as RouteGuard, createDefaultRouteConfig } from './utils/routing'
export type { AppRouteConfig } from './utils/routing'

// Types
export type { ButtonProps } from './components/ui/Button'
export type { HeaderProps } from './components/layout/Header'
export type { FooterProps, FooterLink, FooterSection } from './components/layout/Footer'
export type { LayoutProps } from './components/layout/Layout'
export type { DashboardLayoutProps } from './components/layout/DashboardLayout'
export type { LandingLayoutProps } from './components/layout/LandingLayout'
export type { LoadingSpinnerProps } from './components/ui/LoadingSpinner'
export type { ErrorBoundaryProps } from './components/ui/ErrorBoundary'
export type { HomePageProps } from './components/pages/HomePage'

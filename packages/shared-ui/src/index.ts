// ===== DESIGN SYSTEM FOUNDATION - Phase 1 Implementation =====
// Design Tokens & Configuration
export { designTokens, colors, typography, spacing, shadows, borderRadius, animation, zIndex } from './config/design-tokens'
export type { DesignTokens, AppName } from './config/design-tokens'
export { appConfigs } from './config/appConfigs'
export type { AppConfig } from './config/appConfigs'

// Theme System
export { ThemeProvider, useTheme, ThemeSelector } from './contexts/ThemeProvider'
export type { Theme, ThemeConfig } from './contexts/ThemeProvider'

// ===== ENHANCED UI COMPONENTS - Phase 1 Implementation =====
// Core UI Components
export { Button, buttonVariants } from './components/ui/Button'
export { Input, InputField, PasswordInput, inputVariants } from './components/ui/Input'
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, cardVariants, MetricCard, FeatureCard } from './components/ui/Card'
export { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalClose, ConfirmationModal } from './components/ui/Modal'
export { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownLabel, DropdownSeparator, DropdownMenuComposition, UserMenu } from './components/ui/Dropdown'
export { Toast, ToastAction, ToastClose, ToastTitle, ToastDescription, ToastViewport, ToastProvider, ToastIcons, toastVariants, useToast, useToastHelpers, createToastHelpers, IconToast } from './components/ui/Toast'
export { Badge, StatusBadge, NotificationBadge, PriorityBadge, CategoryBadge, BadgeGroup, badgeVariants } from './components/ui/Badge'
export { Avatar, AvatarImage, AvatarFallback, UserAvatar, AvatarGroup, StatusIndicator, AvatarWithStatus, avatarVariants, avatarImageVariants, avatarFallbackVariants } from './components/ui/Avatar'
export { Progress, CircularProgress, MultiProgress, StepProgress, AnimatedProgress, progressVariants, progressBarVariants } from './components/ui/Progress'
export { Skeleton, TextSkeleton, AvatarSkeleton, CardSkeleton, TableSkeleton, ButtonSkeleton, SkeletonGroup, skeletonVariants } from './components/ui/Skeleton'
export { LoadingSpinner } from './components/ui/LoadingSpinner'
export { ErrorBoundary } from './components/ui/ErrorBoundary'

// Form Components (Priority 1 - Phase 1 Continuation)
export { Textarea, TextareaField, AutoResizeTextarea, textareaVariants } from './components/ui/Textarea'
export { Select, SelectField, MultiSelect, selectVariants, selectContentVariants } from './components/ui/Select'
export { Checkbox, CheckboxGroup, CheckboxField, checkboxVariants } from './components/ui/Checkbox'
export { Radio, RadioGroup, RadioField, RadioCard, radioVariants } from './components/ui/Radio'
export { Switch, SwitchField, SwitchCard, SwitchGroup, switchVariants, switchThumbVariants } from './components/ui/Switch'
export { Slider, RangeSlider, SliderField, sliderVariants, sliderTrackVariants, sliderRangeVariants, sliderThumbVariants } from './components/ui/Slider'
export { Label, FieldLabel, SectionLabel, BadgeLabel, IconLabel, FormGroupLabel, FloatingLabel, labelVariants } from './components/ui/Label'

// Navigation Components (Priority 2 - Phase 1 Continuation)
export { Tabs, ControlledTabs, LazyTabs, AnimatedTabs, tabsListVariants, tabsTriggerVariants, tabsContentVariants } from './components/ui/Tabs'
export { Accordion, ControlledAccordion, FAQAccordion, NestedAccordion, accordionItemVariants, accordionTriggerVariants, accordionContentVariants } from './components/ui/Accordion'
export { Separator, SectionSeparator, BreadcrumbSeparator, MenuSeparator, SpaceSeparator, DecorativeSeparator, separatorVariants } from './components/ui/Separator'
export { ScrollArea, HorizontalScrollArea, ScrollAreaWithHeader, VirtualScrollArea, ScrollAreaWithShadows, scrollAreaVariants } from './components/ui/ScrollArea'
export { Breadcrumb, SimpleBreadcrumb, RouteBreadcrumb, FilePathBreadcrumb, StructuredBreadcrumb, breadcrumbVariants } from './components/ui/Breadcrumb'

// Interactive Components (Priority 3 - Phase 1 Continuation)
export { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel, ConfirmationDialog, SuccessDialog, ErrorDialog, InfoDialog, alertDialogContentVariants } from './components/ui/AlertDialog'
export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose, SidebarSheet, BottomSheet, NotificationSheet, sheetContentVariants } from './components/ui/Sheet'
export { HoverCard, HoverCardTrigger, HoverCardContent, UserHoverCard, LinkPreviewHoverCard, hoverCardContentVariants } from './components/ui/HoverCard'
export { Popover, PopoverTrigger, PopoverContent, MenuPopover, FormPopover, popoverContentVariants } from './components/ui/Popover'
export { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandShortcut, CommandPalette, SearchCommand, commandVariants, commandInputVariants, commandItemVariants } from './components/ui/Command'
export type { CommandItemData as CommandItemType, CommandPaletteProps } from './components/ui/Command'
export { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent, TooltipArrow, InfoTooltip, ErrorTooltip, SuccessTooltip, WarningTooltip, tooltipContentVariants, tooltipArrowVariants } from './components/ui/Tooltip'

// Data Display Components (Priority 4 - Phase 1 Implementation)
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption, DataTable, SimpleTable, tableVariants, tableHeaderVariants, tableRowVariants, tableCellVariants } from './components/ui/Table'
export { Calendar, CalendarDay, CalendarButton, DateRangePicker, MiniCalendar, calendarVariants, calendarHeaderVariants, calendarButtonVariants, calendarDayVariants } from './components/ui/Calendar'
export { DatePicker, DatePickerTrigger, DatePickerInput, DateTimePicker, FormDatePicker, datePickerVariants, datePickerTriggerVariants, datePickerDropdownVariants, formatDate as formatDatePicker, parseDate } from './components/ui/DatePicker'
export { TimePicker, TimeUnit, FormTimePicker, timePickerVariants, timePickerTriggerVariants, timePickerDropdownVariants, timeUnitVariants, timeUnitButtonVariants, timeUnitInputVariants, formatTime, parseTime } from './components/ui/TimePicker'

// Advanced Components (Priority 5 - Phase 1 Implementation)
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, ConfirmDialog, AlertDialog as DialogAlertDialog } from './components/ui/Dialog'
export { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose, SidebarDrawer, BottomDrawer, FullScreenDrawer } from './components/ui/Drawer'
export { Combobox, MultiCombobox, AsyncCombobox } from './components/ui/Combobox'
export { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, NavigationMenuIndicator, NavigationMenuViewport, HorizontalNavigationMenu, VerticalNavigationMenu, MegaMenu } from './components/ui/NavigationMenu'
export { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarLabel, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubTrigger, MenubarSubContent, ApplicationMenubar, SimpleMenubar } from './components/ui/Menubar'

// Enhanced Layout System
export { AppHeader } from './components/layout/AppHeader'
export { AppSidebar } from './components/layout/AppSidebar'
export { AppFooter } from './components/layout/AppFooter'
export { default as AppLayout } from './components/layout/AppLayout'

// Legacy Layout Components (for backward compatibility)
export { Header } from './components/layout/Header'
export { Footer } from './components/layout/Footer'
export { Layout } from './components/layout/Layout'
export { DashboardLayout } from './components/layout/DashboardLayout'
export { LandingLayout } from './components/layout/LandingLayout'
export { AppShell } from './components/layout/AppShell'

// ===== APPLICATION FEATURES =====
// Authentication Components
export { default as AuthLayout } from './components/auth/AuthLayout'
export { default as LoginForm } from './components/auth/LoginForm'
export { default as SignupForm } from './components/auth/SignupForm'
export { AuthProvider, useAuth, withAuth, useGuestRoute } from './contexts/AuthProvider'
export type { User, AuthContextType, RegisterData } from './contexts/AuthProvider'

// Page Components
export { default as LandingPage } from './components/pages/LandingPage'
export { LandingPage as LandingPageComponent } from './components/pages/LandingPage'
export { DashboardPage } from './components/pages/DashboardPage'
export { HomePage } from './components/pages/HomePage'

// Routing Components
export { ProtectedRoute } from './components/routing/ProtectedRoute'
export { GuestRoute } from './components/routing/GuestRoute'
export { AppRouting } from './components/routing/AppRouting'

// Internationalization (I18n) - Enhanced Phase 1 System
export { I18nProvider } from './components/i18n/I18nProvider'
export {
    TranslationProvider,
    useTranslation as useTranslationEnhanced,
    LanguageSelector,
    validateTranslationKeys
} from './components/i18n/TranslationProvider'
export type { Locale, TranslationContextType } from './components/i18n/TranslationProvider'

// Enhanced theme system
export { EnhancedThemeProvider } from './components/theme/EnhancedThemeProvider'
export { useTheme as useEnhancedTheme } from './components/theme/EnhancedThemeProvider'
export { ThemeSelector as EnhancedThemeSelector } from './components/theme/EnhancedThemeProvider'
export { AppSelector } from './components/theme/EnhancedThemeProvider'
export { AppThemeWrapper } from './components/theme/EnhancedThemeProvider'

// Theme configuration and utilities
export { appThemes } from './config/enhanced-app-themes'
export { generateAppCSSVariables } from './config/enhanced-app-themes'
export { generateAppTailwindClasses } from './config/enhanced-app-themes'
export type { AppName as EnhancedAppName, AppThemeConfig, ThemeMode } from './config/enhanced-app-themes'

// Testing configuration and utilities (Node.js only)
// Conditionally export test config to avoid browser compilation issues
export const testConfig = typeof window === 'undefined' ? require('./config/test-config').default : undefined
export const APP_TEST_CONFIGS = typeof window === 'undefined' ? require('./config/test-config').APP_TEST_CONFIGS : undefined
export const ACCESSIBILITY_CONFIG = typeof window === 'undefined' ? require('./config/test-config').ACCESSIBILITY_CONFIG : undefined
export const PERFORMANCE_THRESHOLDS = typeof window === 'undefined' ? require('./config/test-config').PERFORMANCE_THRESHOLDS : undefined
export const SECURITY_CONFIG = typeof window === 'undefined' ? require('./config/test-config').SECURITY_CONFIG : undefined
export const test = typeof window === 'undefined' ? require('./utils/test-utils').test : undefined
export const expect = typeof window === 'undefined' ? require('./utils/test-utils').expect : undefined
export const AppTestUtils = typeof window === 'undefined' ? require('./utils/test-utils').AppTestUtils : undefined
export const ComponentTestUtils = typeof window === 'undefined' ? require('./utils/test-utils').ComponentTestUtils : undefined
export const setupTestApp = typeof window === 'undefined' ? require('./utils/test-utils').setupTestApp : undefined
export const takeAccessibilitySnapshot = typeof window === 'undefined' ? require('./utils/test-utils').takeAccessibilitySnapshot : undefined
export const validateCrossAppCommunication = typeof window === 'undefined' ? require('./utils/test-utils').validateCrossAppCommunication : undefined

// Translation Resources
export { commonTranslations as enCommonTranslations } from './translations/en/common'
export { roCommonTranslations } from './translations/ro/common'

// ===== UTILITIES & MIDDLEWARE =====
// Health Utilities
export { createHealthEndpoint, FeatureStatus, ServiceStatus, CommonFeatures, CommonCapabilities } from './utils/health'
export type { HealthConfig, HealthResponse } from './utils/health'

// Middleware
export { createAuthMiddleware } from './middleware/auth'
export { createSecurityHeaders, applySecurityHeaders, securityMiddleware } from './middleware/security-headers'
export type { SecurityHeadersConfig } from './middleware/security-headers'

// Custom Hooks
export { default as useAuthLegacy } from './hooks/useAuth'
export type { AuthUser, AuthConfig } from './hooks/useAuth'

// Utility Functions
export {
    cn,
    formatFileSize,
    debounce,
    throttle,
    generateId,
    capitalize,
    slugify,
    copyToClipboard,
    isValidEmail,
    isValidUrl,
    formatDate,
    formatRelativeTime,
    getInitials,
    truncate,
    randomColor
} from './lib/utils'

export { default as RouteGuard, createDefaultRouteConfig } from './utils/routing'
export type { AppRouteConfig } from './utils/routing'

// ===== TYPE DEFINITIONS =====
// Component Props Types
export type { ButtonProps } from './components/ui/Button'
export type { HeaderProps } from './components/layout/Header'
export type { FooterProps, FooterLink, FooterSection } from './components/layout/Footer'
export type { LayoutProps } from './components/layout/Layout'
export type { DashboardLayoutProps } from './components/layout/DashboardLayout'
export type { LandingLayoutProps } from './components/layout/LandingLayout'
export type { LoadingSpinnerProps } from './components/ui/LoadingSpinner'
export type { ErrorBoundaryProps } from './components/ui/ErrorBoundary'
export type { HomePageProps } from './components/pages/HomePage'

// ===== FUTURE EXTENSIONS - Phase 2+ =====
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

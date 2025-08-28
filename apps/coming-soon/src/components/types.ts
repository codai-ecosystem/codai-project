/**
 * Component Types and Interfaces
 * Comprehensive type definitions for all components in the CODAI scrollytelling experience
 */

import { ReactNode, HTMLAttributes, RefObject } from 'react'

// =============================================================================
// Base Component Types
// =============================================================================

export interface BaseComponentProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode
  className?: string
  testId?: string
}

export interface AnimatedComponentProps extends BaseComponentProps {
  animationPreset?: AnimationPreset
  animationDelay?: number
  animationDuration?: number
  reduceMotion?: boolean
}

// =============================================================================
// Animation Types
// =============================================================================

export type AnimationPreset = 
  | 'fadeIn'
  | 'slideUp' 
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scaleUp'
  | 'scaleDown'
  | 'rotateIn'
  | 'morphIn'
  | 'parallax'
  | 'reveal'

export type MotionPreference = 'enabled' | 'disabled' | 'respect-system'
export type AnimationState = 'idle' | 'enter' | 'exit' | 'active'
export type ScrollDirection = 'up' | 'down'
export type ComponentVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost'
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  | 'typewriter'
  | 'particle'
  | 'wave'
  | 'spiral'
  | 'constellation'

export interface AnimationConfig {
  preset: AnimationPreset
  duration: number
  delay?: number
  ease?: string
  trigger?: ScrollTriggerConfig
  responsive?: boolean
}

export interface ScrollTriggerConfig {
  trigger: string | Element
  start?: string
  end?: string
  scrub?: boolean | number
  pin?: boolean
  markers?: boolean
  refreshPriority?: number
  onEnter?: () => void
  onLeave?: () => void
  onEnterBack?: () => void
  onLeaveBack?: () => void
}

// =============================================================================
// Chapter Types
// =============================================================================

export type ChapterTheme = 
  | 'intro'
  | 'foundation'
  | 'revolution'
  | 'infrastructure' 
  | 'developers'
  | 'finance'
  | 'blockchain'
  | 'society'
  | 'creativity'
  | 'lifestyle'
  | 'constellation'
  | 'future'

export interface ChapterProps extends AnimatedComponentProps {
  theme: ChapterTheme
  title: string
  subtitle?: string
  description?: string
  projects?: ProjectData[]
  chapterNumber: number
  totalChapters: number
  isActive?: boolean
  onEnter?: () => void
  onLeave?: () => void
}

export interface ProjectData {
  id: string
  name: string
  description: string
  category: string
  tier: 'core' | 'premium' | 'enterprise' | 'experimental' | 'community'
  icon?: string
  color?: string
  url?: string
  status: 'active' | 'development' | 'concept' | 'deprecated'
  features?: string[]
  tags?: string[]
}

// =============================================================================
// Layout Types
// =============================================================================

export interface LayoutProps extends BaseComponentProps {
  theme?: 'light' | 'dark' | 'auto'
  language?: 'en' | 'ro'
  reduceMotion?: boolean
  showDebug?: boolean
}

export interface NavigationProps extends BaseComponentProps {
  chapters: ChapterTheme[]
  currentChapter?: number
  onChapterChange?: (chapter: number) => void
  isVisible?: boolean
  position?: 'fixed' | 'absolute' | 'sticky'
}

export interface ProgressIndicatorProps extends BaseComponentProps {
  progress: number
  total: number
  showPercentage?: boolean
  orientation?: 'horizontal' | 'vertical'
  variant?: 'line' | 'circle' | 'dots'
}

// =============================================================================
// Scroll Component Types  
// =============================================================================

export interface ScrollContainerProps extends Omit<BaseComponentProps, 'content' | 'onScroll'> {
  enableSmoothScroll?: boolean
  scrollSpeed?: number
  touchMultiplier?: number
  firefoxMultiplier?: number
  lerp?: number
  orientation?: 'vertical' | 'horizontal'
  gestureOrientation?: 'vertical' | 'horizontal' | 'both'
  wrapper?: HTMLElement
  contentElement?: HTMLElement
  wheelEventsTarget?: HTMLElement | Window
  eventsTarget?: HTMLElement | Window
  smoothWheel?: boolean
  normalizeWheel?: boolean
  tabIndex?: number
  onScrollUpdate?: (scroll: ScrollData) => void
}

export interface ScrollTriggerProps extends AnimatedComponentProps {
  trigger: RefObject<HTMLElement> | string
  start?: string
  end?: string
  scrub?: boolean | number
  pin?: boolean
  pinSpacing?: boolean
  markers?: boolean
  refreshPriority?: number
  onUpdate?: (self: any) => void
  onEnter?: (self: any) => void
  onLeave?: (self: any) => void
  onEnterBack?: (self: any) => void
  onLeaveBack?: (self: any) => void
  onRefresh?: (self: any) => void
  onToggle?: (self: any) => void
}

export interface ScrollData {
  scroll: number
  limit: number
  velocity: number
  direction: number
  progress: number
}

// =============================================================================
// Interaction Types
// =============================================================================

export interface InteractiveElementProps extends Omit<AnimatedComponentProps, 'onFocus'> {
  variant?: 'button' | 'link' | 'card' | 'toggle'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  state?: 'default' | 'hover' | 'active' | 'focus' | 'disabled'
  onClick?: (event: React.MouseEvent) => void
  onHover?: (isHovering: boolean) => void
  onFocusChange?: (isFocused: boolean) => void
  ripple?: boolean
  magnetic?: boolean
  followCursor?: boolean
  disabled?: boolean
}

export interface CursorProps extends BaseComponentProps {
  variant?: 'default' | 'pointer' | 'text' | 'grab' | 'grabbing' | 'custom'
  size?: number
  color?: string
  mixBlendMode?: string
  followSpeed?: number
  showOnTouch?: boolean
  customContent?: ReactNode
}

export interface MagneticProps extends BaseComponentProps {
  strength?: number
  ease?: number
  tolerance?: number
  scale?: number
  debug?: boolean
}

// =============================================================================
// UI Component Types
// =============================================================================

export interface ButtonProps extends Omit<InteractiveElementProps, 'variant' | 'size'> {
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'link'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

export interface CardProps extends AnimatedComponentProps {
  variant?: 'elevated' | 'outlined' | 'filled' | 'glass'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  header?: ReactNode
  footer?: ReactNode
  image?: string
  imageAlt?: string
  clickable?: boolean
  onCardClick?: () => void
}

export interface TextProps extends BaseComponentProps {
  variant?: 'display' | 'headline' | 'title' | 'body' | 'label' | 'caption'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'black'
  align?: 'left' | 'center' | 'right' | 'justify'
  color?: string
  gradient?: boolean
  truncate?: boolean
  as?: keyof JSX.IntrinsicElements
}

// =============================================================================
// Theme and Styling Types
// =============================================================================

export interface ThemeContextValue {
  theme: 'light' | 'dark'
  chapterTheme: ChapterTheme
  setTheme: (theme: 'light' | 'dark') => void
  setChapterTheme: (theme: ChapterTheme) => void
  toggleTheme: () => void
}

export interface LanguageContextValue {
  language: 'en' | 'ro'
  setLanguage: (lang: 'en' | 'ro') => void
  toggleLanguage: () => void
  t: (key: string, options?: any) => string
}

export interface MotionContextValue {
  reduceMotion: boolean
  setReduceMotion: (reduce: boolean) => void
  toggleReduceMotion: () => void
}

// =============================================================================
// Utility Types
// =============================================================================

export interface Breakpoints {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  '2xl': number
}

export interface MediaQuery {
  matches: boolean
  media: string
}

export interface ViewportData {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLandscape: boolean
  isPortrait: boolean
}

export interface ScrollPosition {
  x: number
  y: number
  progress: number
  direction: 'up' | 'down' | 'left' | 'right' | null
}

// =============================================================================
// Performance Types
// =============================================================================

export interface PerformanceConfig {
  enableGPUAcceleration?: boolean
  enableWillChange?: boolean
  enableTransform3D?: boolean
  debounceScroll?: number
  throttleResize?: number
  lazyLoadOffset?: number
  preloadImages?: boolean
  optimizeAnimations?: boolean
}

export interface LazyLoadProps {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
  placeholder?: ReactNode
  fallback?: ReactNode
  onIntersect?: () => void
  onVisible?: () => void
}

// =============================================================================
// Accessibility Types
// =============================================================================

export interface A11yProps {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-controls'?: string
  'aria-hidden'?: boolean
  'aria-live'?: 'off' | 'polite' | 'assertive'
  'aria-atomic'?: boolean
  role?: string
  tabIndex?: number
}

export interface ReducedMotionConfig {
  respectSystemPreferences: boolean
  fallbackAnimations: boolean
  disableParallax: boolean
  reduceComplexAnimations: boolean
  enableInstantTransitions: boolean
}

// =============================================================================
// Export all types for convenient importing
// =============================================================================

export type {
  // Re-export React types
  ReactNode,
  HTMLAttributes,
  RefObject
}
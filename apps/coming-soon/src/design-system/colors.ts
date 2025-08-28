/**
 * CODAI Design System - Color Tokens
 * 
 * Centralized color system following 2025 design trends:
 * - Consistent dark theme with selective light mode support
 * - AI/Tech focused color palette with professional gradients
 * - Accessibility-compliant contrast ratios (WCAG 2.1 AA)
 * - Semantic color mapping for different use cases
 */

// Primary Color Palette - AI/Tech Theme
export const colors = {
  // Core Brand Colors
  primary: {
    50: '#eff6ff',   // Very light blue
    100: '#dbeafe',  // Light blue
    200: '#bfdbfe',  // Lighter blue
    300: '#93c5fd',  // Light blue
    400: '#60a5fa',  // Medium blue
    500: '#3b82f6',  // Primary blue
    600: '#2563eb',  // Darker blue
    700: '#1d4ed8',  // Dark blue
    800: '#1e40af',  // Very dark blue
    900: '#1e3a8a',  // Darkest blue
    950: '#172554',  // Almost black blue
  },

  // Secondary/Accent Colors
  secondary: {
    50: '#faf5ff',   // Very light purple
    100: '#f3e8ff',  // Light purple
    200: '#e9d5ff',  // Lighter purple
    300: '#d8b4fe',  // Light purple
    400: '#c084fc',  // Medium purple
    500: '#a855f7',  // Primary purple
    600: '#9333ea',  // Darker purple
    700: '#7c3aed',  // Dark purple
    800: '#6b21a8',  // Very dark purple
    900: '#581c87',  // Darkest purple
    950: '#3b0764',  // Almost black purple
  },

  // Accent Color - Cyan/Teal
  accent: {
    50: '#ecfeff',   // Very light cyan
    100: '#cffafe',  // Light cyan
    200: '#a5f3fc',  // Lighter cyan
    300: '#67e8f9',  // Light cyan
    400: '#22d3ee',  // Medium cyan
    500: '#06b6d4',  // Primary cyan
    600: '#0891b2',  // Darker cyan
    700: '#0e7490',  // Dark cyan
    800: '#155e75',  // Very dark cyan
    900: '#164e63',  // Darkest cyan
    950: '#083344',  // Almost black cyan
  },

  // Grayscale - Neutral Colors
  gray: {
    50: '#f9fafb',   // Almost white
    100: '#f3f4f6',  // Very light gray
    200: '#e5e7eb',  // Light gray
    300: '#d1d5db',  // Lighter gray
    400: '#9ca3af',  // Medium light gray
    500: '#6b7280',  // Medium gray
    600: '#4b5563',  // Medium dark gray
    700: '#374151',  // Dark gray
    800: '#1f2937',  // Very dark gray
    900: '#111827',  // Almost black
    950: '#030712',  // Pure black
  },

  // Status Colors
  success: {
    50: '#f0fdf4',   // Very light green
    100: '#dcfce7',  // Light green
    500: '#22c55e',  // Primary green
    600: '#16a34a',  // Darker green
    900: '#14532d',  // Dark green
  },

  warning: {
    50: '#fffbeb',   // Very light yellow
    100: '#fef3c7',  // Light yellow
    500: '#f59e0b',  // Primary yellow
    600: '#d97706',  // Darker yellow
    900: '#78350f',  // Dark yellow
  },

  error: {
    50: '#fef2f2',   // Very light red
    100: '#fee2e2',  // Light red
    500: '#ef4444',  // Primary red
    600: '#dc2626',  // Darker red
    900: '#7f1d1d',  // Dark red
  },

  // Special AI/Tech Colors
  neon: {
    blue: '#00d4ff',    // Electric blue
    purple: '#8b5cf6',  // Neon purple
    pink: '#f472b6',    // Neon pink
    green: '#00ff88',   // Neon green
    orange: '#ff6b35',  // Neon orange
  },

  // Background Colors
  background: {
    primary: '#000000',    // Pure black
    secondary: '#0a0a0a',  // Almost black
    tertiary: '#1a1a1a',  // Very dark gray
    card: '#1f1f1f',      // Card background
    overlay: 'rgba(0, 0, 0, 0.8)', // Modal overlay
  },

  // Text Colors
  text: {
    primary: '#ffffff',     // Pure white
    secondary: '#e4e4e7',   // Light gray
    tertiary: '#a1a1aa',    // Medium gray
    muted: '#71717a',       // Muted gray
    disabled: '#52525b',    // Disabled gray
  },

  // Border Colors
  border: {
    primary: '#27272a',     // Dark border
    secondary: '#3f3f46',   // Medium border
    accent: '#6366f1',      // Accent border
    focus: '#8b5cf6',       // Focus border
  },
} as const;

// Semantic Color Mapping
export const semanticColors = {
  // Backgrounds
  background: {
    page: colors.background.primary,
    section: colors.background.secondary,
    card: colors.background.card,
    overlay: colors.background.overlay,
  },

  // Text
  text: {
    heading: colors.text.primary,
    body: colors.text.secondary,
    caption: colors.text.tertiary,
    muted: colors.text.muted,
    disabled: colors.text.disabled,
  },

  // Interactive Elements
  interactive: {
    primary: colors.primary[500],
    primaryHover: colors.primary[600],
    secondary: colors.secondary[500],
    secondaryHover: colors.secondary[600],
    accent: colors.accent[500],
    accentHover: colors.accent[600],
  },

  // Status
  status: {
    success: colors.success[500],
    warning: colors.warning[500],
    error: colors.error[500],
  },

  // Borders
  border: {
    default: colors.border.primary,
    hover: colors.border.secondary,
    focus: colors.border.focus,
  },
} as const;

// Gradient Definitions
export const gradients = {
  // Primary Gradients
  primary: {
    main: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.primary[800]} 100%)`,
    soft: `linear-gradient(135deg, ${colors.primary[500]}20 0%, ${colors.primary[700]}20 100%)`,
    radial: `radial-gradient(circle at 50% 50%, ${colors.primary[600]} 0%, ${colors.primary[900]} 70%)`,
  },

  // AI-Tech Gradients
  ai: {
    main: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.secondary[500]} 50%, ${colors.accent[500]} 100%)`,
    neon: `linear-gradient(135deg, ${colors.neon.blue} 0%, ${colors.neon.purple} 50%, ${colors.neon.pink} 100%)`,
    subtle: `linear-gradient(135deg, ${colors.primary[600]}40 0%, ${colors.secondary[600]}40 100%)`,
  },

  // Background Gradients
  background: {
    page: `linear-gradient(180deg, ${colors.background.primary} 0%, ${colors.background.secondary} 100%)`,
    section: `linear-gradient(135deg, ${colors.background.secondary} 0%, ${colors.background.tertiary} 100%)`,
    card: `linear-gradient(145deg, ${colors.background.card} 0%, ${colors.gray[900]} 100%)`,
  },

  // Interactive Gradients
  button: {
    primary: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
    secondary: `linear-gradient(135deg, ${colors.secondary[500]} 0%, ${colors.secondary[600]} 100%)`,
    accent: `linear-gradient(135deg, ${colors.accent[500]} 0%, ${colors.accent[600]} 100%)`,
  },

  // Text Gradients
  text: {
    primary: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.accent[400]} 100%)`,
    secondary: `linear-gradient(135deg, ${colors.secondary[400]} 0%, ${colors.neon.purple} 100%)`,
    hero: `linear-gradient(135deg, ${colors.text.primary} 0%, ${colors.primary[300]} 50%, ${colors.accent[300]} 100%)`,
  },
} as const;

// Shadow Definitions
export const shadows = {
  // Card Shadows
  card: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.8)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.8), 0 2px 4px -1px rgba(0, 0, 0, 0.6)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.8), 0 4px 6px -2px rgba(0, 0, 0, 0.6)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 10px 10px -5px rgba(0, 0, 0, 0.6)',
  },

  // Glow Effects
  glow: {
    sm: `0 0 10px ${colors.primary[500]}40`,
    md: `0 0 20px ${colors.primary[500]}60`,
    lg: `0 0 30px ${colors.primary[500]}80`,
    neon: `0 0 20px ${colors.neon.blue}60, 0 0 40px ${colors.neon.purple}40`,
  },

  // Interactive Shadows
  button: {
    default: '0 2px 4px 0 rgba(0, 0, 0, 0.6)',
    hover: `0 4px 8px 0 rgba(0, 0, 0, 0.8), 0 0 16px ${colors.primary[500]}40`,
    active: '0 1px 2px 0 rgba(0, 0, 0, 0.8)',
  },

  // Focus Shadows
  focus: `0 0 0 3px ${colors.primary[500]}60`,
} as const;

// Export color utilities
export const colorUtils = {
  // Convert hex to rgba
  hexToRgba: (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  // Get contrast color
  getContrastColor: (backgroundColor: string): string => {
    // Simple contrast logic - extend as needed
    const darkColors = ['#000000', '#0a0a0a', '#1a1a1a', '#1f1f1f'];
    return darkColors.includes(backgroundColor) ? colors.text.primary : colors.background.primary;
  },
} as const;

export type ColorPalette = typeof colors;
export type SemanticColors = typeof semanticColors;
export type Gradients = typeof gradients;
export type Shadows = typeof shadows;
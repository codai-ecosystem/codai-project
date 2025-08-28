/**
 * CODAI Design System - Typography Scale & Hierarchy
 * 
 * Modern typography system following 2025 design trends:
 * - Mobile-first responsive scale
 * - Optimized for readability and accessibility (WCAG 2.1 AA)
 * - AI/Tech aesthetic with clean, professional fonts
 * - Semantic typography mapping for consistent usage
 */

// Font Families
export const fontFamilies = {
  // Primary font family - Modern sans-serif
  sans: [
    'Inter Variable',
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI Variable',
    'Segoe UI',
    'system-ui',
    'sans-serif'
  ],

  // Display font for headlines - Modern geometric
  display: [
    'Manrope Variable',
    'Manrope',
    'Inter Variable',
    'Inter',
    'system-ui',
    'sans-serif'
  ],

  // Monospace for code
  mono: [
    'JetBrains Mono Variable',
    'JetBrains Mono',
    'SF Mono',
    'Monaco',
    'Inconsolata',
    'Roboto Mono',
    'monospace'
  ],

  // Brand font for special elements
  brand: [
    'Space Grotesk Variable',
    'Space Grotesk',
    'Manrope Variable',
    'Manrope',
    'system-ui',
    'sans-serif'
  ],
} as const;

// Font Weights
export const fontWeights = {
  thin: '100',
  extraLight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
  black: '900',
} as const;

// Font Sizes - Mobile First Responsive Scale
export const fontSizes = {
  // Base sizes (mobile)
  xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],      // 12px
  sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.025em' }],   // 14px
  base: ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],            // 16px
  lg: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '0' }],         // 18px
  xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '0' }],          // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.025em' }],    // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],  // 36px
  '5xl': ['3rem', { lineHeight: '3rem', letterSpacing: '-0.025em' }],       // 48px
  '6xl': ['3.75rem', { lineHeight: '3.75rem', letterSpacing: '-0.025em' }], // 60px
  '7xl': ['4.5rem', { lineHeight: '4.5rem', letterSpacing: '-0.05em' }],    // 72px
  '8xl': ['6rem', { lineHeight: '6rem', letterSpacing: '-0.05em' }],        // 96px
  '9xl': ['8rem', { lineHeight: '8rem', letterSpacing: '-0.05em' }],        // 128px
} as const;

// Responsive Font Sizes - Desktop scaling
export const responsiveFontSizes = {
  // Hero text - scales dramatically on larger screens
  hero: {
    mobile: fontSizes['4xl'][0],      // 36px
    tablet: fontSizes['6xl'][0],      // 60px
    desktop: fontSizes['8xl'][0],     // 96px
    xl: fontSizes['9xl'][0],          // 128px
  },

  // Main headings
  h1: {
    mobile: fontSizes['3xl'][0],      // 30px
    tablet: fontSizes['4xl'][0],      // 36px
    desktop: fontSizes['5xl'][0],     // 48px
    xl: fontSizes['6xl'][0],          // 60px
  },

  h2: {
    mobile: fontSizes['2xl'][0],      // 24px
    tablet: fontSizes['3xl'][0],      // 30px
    desktop: fontSizes['4xl'][0],     // 36px
    xl: fontSizes['5xl'][0],          // 48px
  },

  h3: {
    mobile: fontSizes.xl[0],          // 20px
    tablet: fontSizes['2xl'][0],      // 24px
    desktop: fontSizes['3xl'][0],     // 30px
    xl: fontSizes['4xl'][0],          // 36px
  },

  h4: {
    mobile: fontSizes.lg[0],          // 18px
    tablet: fontSizes.xl[0],          // 20px
    desktop: fontSizes['2xl'][0],     // 24px
    xl: fontSizes['3xl'][0],          // 30px
  },

  h5: {
    mobile: fontSizes.base[0],        // 16px
    tablet: fontSizes.lg[0],          // 18px
    desktop: fontSizes.xl[0],         // 20px
    xl: fontSizes['2xl'][0],          // 24px
  },

  h6: {
    mobile: fontSizes.sm[0],          // 14px
    tablet: fontSizes.base[0],        // 16px
    desktop: fontSizes.lg[0],         // 18px
    xl: fontSizes.xl[0],              // 20px
  },
} as const;

// Line Heights
export const lineHeights = {
  none: '1',
  tight: '1.1',
  snug: '1.25',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
} as const;

// Letter Spacing
export const letterSpacings = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const;

// Typography Styles - Semantic Classes
export const typographyStyles = {
  // Hero Text
  hero: {
    fontFamily: fontFamilies.display.join(', '),
    fontSize: responsiveFontSizes.hero.mobile,
    fontWeight: fontWeights.extraBold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.tighter,
  },

  // Headings
  h1: {
    fontFamily: fontFamilies.display.join(', '),
    fontSize: responsiveFontSizes.h1.mobile,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.tight,
  },

  h2: {
    fontFamily: fontFamilies.display.join(', '),
    fontSize: responsiveFontSizes.h2.mobile,
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacings.tight,
  },

  h3: {
    fontFamily: fontFamilies.display.join(', '),
    fontSize: responsiveFontSizes.h3.mobile,
    fontWeight: fontWeights.semiBold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacings.normal,
  },

  h4: {
    fontFamily: fontFamilies.sans.join(', '),
    fontSize: responsiveFontSizes.h4.mobile,
    fontWeight: fontWeights.semiBold,
    lineHeight: lineHeights.snug,
    letterSpacing: letterSpacings.normal,
  },

  h5: {
    fontFamily: fontFamilies.sans.join(', '),
    fontSize: responsiveFontSizes.h5.mobile,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },

  h6: {
    fontFamily: fontFamilies.sans.join(', '),
    fontSize: responsiveFontSizes.h6.mobile,
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.wide,
  },

  // Body Text
  body: {
    large: {
      fontFamily: fontFamilies.sans.join(', '),
      fontSize: fontSizes.lg[0],
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.relaxed,
      letterSpacing: letterSpacings.normal,
    },
    
    base: {
      fontFamily: fontFamilies.sans.join(', '),
      fontSize: fontSizes.base[0],
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.relaxed,
      letterSpacing: letterSpacings.normal,
    },

    small: {
      fontFamily: fontFamilies.sans.join(', '),
      fontSize: fontSizes.sm[0],
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacings.wide,
    },
  },

  // Special Text Styles
  lead: {
    fontFamily: fontFamilies.sans.join(', '),
    fontSize: fontSizes.xl[0],
    fontWeight: fontWeights.normal,
    lineHeight: lineHeights.relaxed,
    letterSpacing: letterSpacings.normal,
  },

  caption: {
    fontFamily: fontFamilies.sans.join(', '),
    fontSize: fontSizes.sm[0],
    fontWeight: fontWeights.medium,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.wide,
    textTransform: 'uppercase' as const,
  },

  overline: {
    fontFamily: fontFamilies.sans.join(', '),
    fontSize: fontSizes.xs[0],
    fontWeight: fontWeights.semiBold,
    lineHeight: lineHeights.normal,
    letterSpacing: letterSpacings.widest,
    textTransform: 'uppercase' as const,
  },

  // Interactive Elements
  button: {
    large: {
      fontFamily: fontFamilies.sans.join(', '),
      fontSize: fontSizes.lg[0],
      fontWeight: fontWeights.semiBold,
      lineHeight: lineHeights.none,
      letterSpacing: letterSpacings.wide,
    },

    base: {
      fontFamily: fontFamilies.sans.join(', '),
      fontSize: fontSizes.base[0],
      fontWeight: fontWeights.semiBold,
      lineHeight: lineHeights.none,
      letterSpacing: letterSpacings.wide,
    },

    small: {
      fontFamily: fontFamilies.sans.join(', '),
      fontSize: fontSizes.sm[0],
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.none,
      letterSpacing: letterSpacings.wide,
    },
  },

  // Code
  code: {
    inline: {
      fontFamily: fontFamilies.mono.join(', '),
      fontSize: '0.875em', // Relative to parent
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.none,
      letterSpacing: letterSpacings.normal,
    },

    block: {
      fontFamily: fontFamilies.mono.join(', '),
      fontSize: fontSizes.sm[0],
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.relaxed,
      letterSpacing: letterSpacings.normal,
    },
  },

  // Brand Text
  brand: {
    fontFamily: fontFamilies.brand.join(', '),
    fontSize: fontSizes['2xl'][0],
    fontWeight: fontWeights.bold,
    lineHeight: lineHeights.tight,
    letterSpacing: letterSpacings.tight,
  },
} as const;

// Responsive Typography Utilities
export const responsiveTypography = {
  // Generate responsive CSS classes
  generateResponsiveClass: (styleKey: keyof typeof responsiveFontSizes) => ({
    fontSize: responsiveFontSizes[styleKey].mobile,
    '@media (min-width: 768px)': {
      fontSize: responsiveFontSizes[styleKey].tablet,
    },
    '@media (min-width: 1024px)': {
      fontSize: responsiveFontSizes[styleKey].desktop,
    },
    '@media (min-width: 1536px)': {
      fontSize: responsiveFontSizes[styleKey].xl,
    },
  }),

  // Clamp function for fluid typography
  generateFluidSize: (minSize: string, maxSize: string, minVw = '20rem', maxVw = '96rem') => 
    `clamp(${minSize}, ${minSize} + (${maxSize} - ${minSize}) * ((100vw - ${minVw}) / (${maxVw} - ${minVw})), ${maxSize})`,
} as const;

// Typography Presets for Common Use Cases
export const typographyPresets = {
  // Hero section
  heroTitle: {
    ...typographyStyles.hero,
    background: 'linear-gradient(135deg, #ffffff 0%, #60a5fa 50%, #06b6d4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  heroSubtitle: {
    ...typographyStyles.lead,
    color: '#e4e4e7',
    fontWeight: fontWeights.normal,
  },

  // Section headings
  sectionTitle: {
    ...typographyStyles.h2,
    background: 'linear-gradient(135deg, #ffffff 0%, #a855f7 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },

  sectionSubtitle: {
    ...typographyStyles.body.large,
    color: '#a1a1aa',
  },

  // Card content
  cardTitle: {
    ...typographyStyles.h4,
    color: '#ffffff',
  },

  cardDescription: {
    ...typographyStyles.body.base,
    color: '#e4e4e7',
  },

  // Buttons
  primaryButton: {
    ...typographyStyles.button.base,
    color: '#ffffff',
    textTransform: 'uppercase' as const,
  },

  secondaryButton: {
    ...typographyStyles.button.base,
    color: '#e4e4e7',
  },

  // Navigation
  navItem: {
    ...typographyStyles.body.base,
    fontWeight: fontWeights.medium,
    color: '#e4e4e7',
    letterSpacing: letterSpacings.wide,
  },

  // Footer
  footerHeading: {
    ...typographyStyles.h6,
    color: '#ffffff',
    textTransform: 'uppercase' as const,
  },

  footerText: {
    ...typographyStyles.body.small,
    color: '#a1a1aa',
  },
} as const;

// Typography Utilities
export const typographyUtils = {
  // Text truncation
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },

  // Line clamping
  clampLines: (lines: number) => ({
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  }),

  // Text selection styles
  selection: {
    '::selection': {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
    },
    '::-moz-selection': {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
    },
  },
} as const;

// Export types
export type FontFamilies = typeof fontFamilies;
export type FontWeights = typeof fontWeights;
export type FontSizes = typeof fontSizes;
export type TypographyStyles = typeof typographyStyles;
export type TypographyPresets = typeof typographyPresets;
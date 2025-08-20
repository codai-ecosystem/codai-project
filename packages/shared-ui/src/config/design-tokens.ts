/**
 * Design Tokens for CODAI Ecosystem
 * Using OKLCH color space for perceptual uniformity
 * Following 4px base spacing scale and mobile-first approach
 */

// OKLCH Color Tokens
export const colors = {
    // Base grays using OKLCH for better perceptual uniformity
    gray: {
        50: 'oklch(98% 0.005 240)',
        100: 'oklch(96% 0.01 240)',
        200: 'oklch(93% 0.015 240)',
        300: 'oklch(88% 0.02 240)',
        400: 'oklch(74% 0.025 240)',
        500: 'oklch(60% 0.03 240)',
        600: 'oklch(52% 0.035 240)',
        700: 'oklch(42% 0.04 240)',
        800: 'oklch(27% 0.045 240)',
        900: 'oklch(18% 0.05 240)',
        950: 'oklch(9% 0.055 240)',
    },

    // App-specific primary colors
    apps: {
        codai: {
            50: 'oklch(95% 0.05 250)',
            100: 'oklch(91% 0.08 250)',
            200: 'oklch(84% 0.12 250)',
            300: 'oklch(75% 0.15 250)',
            400: 'oklch(65% 0.18 250)',
            500: 'oklch(55% 0.2 250)', // Primary blue
            600: 'oklch(48% 0.18 250)',
            700: 'oklch(40% 0.15 250)',
            800: 'oklch(32% 0.12 250)',
            900: 'oklch(24% 0.08 250)',
            950: 'oklch(16% 0.05 250)',
        },
        memorai: {
            50: 'oklch(95% 0.05 180)',
            100: 'oklch(91% 0.08 180)',
            200: 'oklch(84% 0.12 180)',
            300: 'oklch(75% 0.15 180)',
            400: 'oklch(65% 0.18 180)',
            500: 'oklch(55% 0.2 180)', // Primary teal
            600: 'oklch(48% 0.18 180)',
            700: 'oklch(40% 0.15 180)',
            800: 'oklch(32% 0.12 180)',
            900: 'oklch(24% 0.08 180)',
            950: 'oklch(16% 0.05 180)',
        },
        bancai: {
            50: 'oklch(95% 0.05 140)',
            100: 'oklch(91% 0.08 140)',
            200: 'oklch(84% 0.12 140)',
            300: 'oklch(75% 0.15 140)',
            400: 'oklch(65% 0.18 140)',
            500: 'oklch(55% 0.2 140)', // Primary green
            600: 'oklch(48% 0.18 140)',
            700: 'oklch(40% 0.15 140)',
            800: 'oklch(32% 0.12 140)',
            900: 'oklch(24% 0.08 140)',
            950: 'oklch(16% 0.05 140)',
        },
        sociai: {
            50: 'oklch(95% 0.05 300)',
            100: 'oklch(91% 0.08 300)',
            200: 'oklch(84% 0.12 300)',
            300: 'oklch(75% 0.15 300)',
            400: 'oklch(65% 0.18 300)',
            500: 'oklch(55% 0.2 300)', // Primary purple
            600: 'oklch(48% 0.18 300)',
            700: 'oklch(40% 0.15 300)',
            800: 'oklch(32% 0.12 300)',
            900: 'oklch(24% 0.08 300)',
            950: 'oklch(16% 0.05 300)',
        },
        cumparai: {
            50: 'oklch(95% 0.05 40)',
            100: 'oklch(91% 0.08 40)',
            200: 'oklch(84% 0.12 40)',
            300: 'oklch(75% 0.15 40)',
            400: 'oklch(65% 0.18 40)',
            500: 'oklch(55% 0.2 40)', // Primary orange
            600: 'oklch(48% 0.18 40)',
            700: 'oklch(40% 0.15 40)',
            800: 'oklch(32% 0.12 40)',
            900: 'oklch(24% 0.08 40)',
            950: 'oklch(16% 0.05 40)',
        },
        ajutai: {
            50: 'oklch(95% 0.05 200)',
            100: 'oklch(91% 0.08 200)',
            200: 'oklch(84% 0.12 200)',
            300: 'oklch(75% 0.15 200)',
            400: 'oklch(65% 0.18 200)',
            500: 'oklch(55% 0.2 200)', // Primary cyan
            600: 'oklch(48% 0.18 200)',
            700: 'oklch(40% 0.15 200)',
            800: 'oklch(32% 0.12 200)',
            900: 'oklch(24% 0.08 200)',
            950: 'oklch(16% 0.05 200)',
        },
        romai: {
            50: 'oklch(95% 0.05 310)',
            100: 'oklch(91% 0.08 310)',
            200: 'oklch(84% 0.12 310)',
            300: 'oklch(75% 0.15 310)',
            400: 'oklch(65% 0.18 310)',
            500: 'oklch(55% 0.2 310)', // Primary purple
            600: 'oklch(48% 0.18 310)',
            700: 'oklch(40% 0.15 310)',
            800: 'oklch(32% 0.12 310)',
            900: 'oklch(24% 0.08 310)',
            950: 'oklch(16% 0.05 310)',
        },
        controlai: {
            50: 'oklch(95% 0.05 280)',
            100: 'oklch(91% 0.08 280)',
            200: 'oklch(84% 0.12 280)',
            300: 'oklch(75% 0.15 280)',
            400: 'oklch(65% 0.18 280)',
            500: 'oklch(55% 0.2 280)', // Primary indigo
            600: 'oklch(48% 0.18 280)',
            700: 'oklch(40% 0.15 280)',
            800: 'oklch(32% 0.12 280)',
            900: 'oklch(24% 0.08 280)',
            950: 'oklch(16% 0.05 280)',
        },
        studiai: {
            50: 'oklch(95% 0.05 60)',
            100: 'oklch(91% 0.08 60)',
            200: 'oklch(84% 0.12 60)',
            300: 'oklch(75% 0.15 60)',
            400: 'oklch(65% 0.18 60)',
            500: 'oklch(55% 0.2 60)', // Primary yellow-green
            600: 'oklch(48% 0.18 60)',
            700: 'oklch(40% 0.15 60)',
            800: 'oklch(32% 0.12 60)',
            900: 'oklch(24% 0.08 60)',
            950: 'oklch(16% 0.05 60)',
        },
        donai: {
            50: 'oklch(95% 0.05 160)',
            100: 'oklch(91% 0.08 160)',
            200: 'oklch(84% 0.12 160)',
            300: 'oklch(75% 0.15 160)',
            400: 'oklch(65% 0.18 160)',
            500: 'oklch(55% 0.2 160)', // Primary emerald
            600: 'oklch(48% 0.18 160)',
            700: 'oklch(40% 0.15 160)',
            800: 'oklch(32% 0.12 160)',
            900: 'oklch(24% 0.08 160)',
            950: 'oklch(16% 0.05 160)',
        },
    },

    // Semantic colors
    semantic: {
        success: {
            50: 'oklch(95% 0.05 140)',
            500: 'oklch(55% 0.2 140)',
            600: 'oklch(48% 0.18 140)',
        },
        warning: {
            50: 'oklch(95% 0.05 70)',
            500: 'oklch(70% 0.18 70)',
            600: 'oklch(60% 0.16 70)',
        },
        error: {
            50: 'oklch(95% 0.05 20)',
            500: 'oklch(55% 0.2 20)',
            600: 'oklch(48% 0.18 20)',
        },
        info: {
            50: 'oklch(95% 0.05 250)',
            500: 'oklch(55% 0.2 250)',
            600: 'oklch(48% 0.18 250)',
        },
    },
} as const

// Typography tokens
export const typography = {
    fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
    },
    fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
    },
    fontWeight: {
        thin: '100',
        extralight: '200',
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
    },
} as const

// Spacing tokens (4px base scale)
export const spacing = {
    px: '1px',
    0: '0px',
    0.5: '2px',  // 0.5 * 4px
    1: '4px',    // 1 * 4px
    1.5: '6px',  // 1.5 * 4px
    2: '8px',    // 2 * 4px
    2.5: '10px', // 2.5 * 4px
    3: '12px',   // 3 * 4px
    3.5: '14px', // 3.5 * 4px
    4: '16px',   // 4 * 4px
    5: '20px',   // 5 * 4px
    6: '24px',   // 6 * 4px
    7: '28px',   // 7 * 4px
    8: '32px',   // 8 * 4px
    9: '36px',   // 9 * 4px
    10: '40px',  // 10 * 4px
    11: '44px',  // 11 * 4px
    12: '48px',  // 12 * 4px
    14: '56px',  // 14 * 4px
    16: '64px',  // 16 * 4px
    20: '80px',  // 20 * 4px
    24: '96px',  // 24 * 4px
    28: '112px', // 28 * 4px
    32: '128px', // 32 * 4px
    36: '144px', // 36 * 4px
    40: '160px', // 40 * 4px
    44: '176px', // 44 * 4px
    48: '192px', // 48 * 4px
    52: '208px', // 52 * 4px
    56: '224px', // 56 * 4px
    60: '240px', // 60 * 4px
    64: '256px', // 64 * 4px
    72: '288px', // 72 * 4px
    80: '320px', // 80 * 4px
    96: '384px', // 96 * 4px
} as const

// Breakpoints (mobile-first)
export const breakpoints = {
    xs: '320px',   // Extra small devices
    sm: '640px',   // Small devices
    md: '768px',   // Medium devices
    lg: '1024px',  // Large devices
    xl: '1280px',  // Extra large devices
    '2xl': '1536px', // 2X large devices
} as const

// Shadows
export const shadows = {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
} as const

// Border radius
export const borderRadius = {
    none: '0px',
    sm: '2px',
    md: '4px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '24px',
    full: '9999px',
} as const

// Animation durations
export const animation = {
    duration: {
        75: '75ms',
        100: '100ms',
        150: '150ms',
        200: '200ms',
        300: '300ms',
        500: '500ms',
        700: '700ms',
        1000: '1000ms',
    },
    easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        linear: 'linear',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
} as const

// Z-index scale
export const zIndex = {
    auto: 'auto',
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    modal: '1000',
    popover: '1010',
    tooltip: '1020',
    notification: '1030',
} as const

// Export all tokens
export const designTokens = {
    colors,
    typography,
    spacing,
    breakpoints,
    shadows,
    borderRadius,
    animation,
    zIndex,
} as const

export type DesignTokens = typeof designTokens
export type AppName = keyof typeof colors.apps

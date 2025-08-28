/** @type {import('tailwindcss').Config} */

// Import our design system tokens
const designSystem = {
  colors: {
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

    // Background Colors
    background: {
      primary: '#000000',    // Pure black
      secondary: '#0a0a0a',  // Almost black
      tertiary: '#1a1a1a',   // Very dark gray
      card: '#1f1f1f',      // Card background
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
  },

  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px - Touch target minimum
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
    36: '9rem',       // 144px
    40: '10rem',      // 160px
    44: '11rem',      // 176px
    48: '12rem',      // 192px
    52: '13rem',      // 208px
    56: '14rem',      // 224px
    60: '15rem',      // 240px
    64: '16rem',      // 256px
    72: '18rem',      // 288px
    80: '20rem',      // 320px
    96: '24rem',      // 384px
  },

  fontFamily: {
    // Modern font stack
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

    // Display font for headlines
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

    // Brand font
    brand: [
      'Space Grotesk Variable',
      'Space Grotesk',
      'Manrope Variable',
      'Manrope',
      'system-ui',
      'sans-serif'
    ],
  },

  borderRadius: {
    none: '0',
    sm: '0.125rem',     // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',     // 6px
    lg: '0.5rem',       // 8px
    xl: '0.75rem',      // 12px
    '2xl': '1rem',      // 16px
    '3xl': '1.5rem',    // 24px
    full: '9999px',
  },
};

module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/design-system/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        // Override with our design system
        colors: designSystem.colors,
        spacing: designSystem.spacing,
        fontFamily: designSystem.fontFamily,
        borderRadius: designSystem.borderRadius,
        
        extend: {
            // Performance-optimized animations
            animation: {
                'fade-in': 'fadeIn 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                'fade-in-up': 'fadeInUp 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)',
                'fade-in-down': 'fadeInDown 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)',
                'fade-in-left': 'fadeInLeft 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)',
                'fade-in-right': 'fadeInRight 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)',
                'scale-in': 'scaleIn 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)',
                'slide-in-up': 'slideInUp 0.5s cubic-bezier(0.4, 0.0, 0.6, 1)',
                'glow': 'glow 2s cubic-bezier(0.4, 0.0, 0.2, 1) infinite alternate',
                'float': 'float 3s cubic-bezier(0.4, 0.0, 0.2, 1) infinite',
                'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0.0, 0.2, 1) infinite',
                'spin-slow': 'spin 2s linear infinite',
            },

            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(2rem)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeInDown: {
                    '0%': { opacity: '0', transform: 'translateY(-2rem)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeInLeft: {
                    '0%': { opacity: '0', transform: 'translateX(-2rem)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                fadeInRight: {
                    '0%': { opacity: '0', transform: 'translateX(2rem)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.8)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                slideInUp: {
                    '0%': { transform: 'translateY(100%)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-0.5rem)' },
                },
                glow: {
                    'from': { 'box-shadow': '0 0 10px rgba(59, 130, 246, 0.5)' },
                    'to': { 'box-shadow': '0 0 20px rgba(59, 130, 246, 0.8), 0 0 30px rgba(139, 92, 246, 0.5)' },
                },
            },

            // Box shadows with glow effects
            boxShadow: {
                'glow-sm': '0 0 10px rgba(59, 130, 246, 0.4)',
                'glow-md': '0 0 20px rgba(59, 130, 246, 0.6)',
                'glow-lg': '0 0 30px rgba(59, 130, 246, 0.8)',
                'glow-neon': '0 0 20px rgba(0, 212, 255, 0.6), 0 0 40px rgba(139, 92, 246, 0.4)',
            },

            // Backdrop blur
            backdropBlur: {
                xs: '2px',
            },

            // Z-index scale
            zIndex: {
                'hide': -1,
                'auto': 'auto',
                'base': 0,
                'docked': 10,
                'dropdown': 1000,
                'sticky': 1100,
                'banner': 1200,
                'overlay': 1300,
                'modal': 1400,
                'popover': 1500,
                'skip-link': 1600,
                'toast': 1700,
                'tooltip': 1800,
            },

            // Typography
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        color: theme('colors.text.secondary'),
                        maxWidth: 'none',
                        lineHeight: '1.625',
                        
                        // Headings
                        'h1, h2, h3, h4, h5, h6': {
                            color: theme('colors.text.primary'),
                            fontWeight: '700',
                            lineHeight: '1.1',
                        },

                        // Links
                        a: {
                            color: theme('colors.primary.400'),
                            textDecoration: 'none',
                            '&:hover': {
                                color: theme('colors.primary.300'),
                            },
                        },

                        // Code
                        code: {
                            color: theme('colors.accent.400'),
                            backgroundColor: theme('colors.gray.800'),
                            padding: '0.125rem 0.25rem',
                            borderRadius: '0.25rem',
                            fontSize: '0.875em',
                            fontWeight: '500',
                        },
                        'code::before': {
                            content: '""',
                        },
                        'code::after': {
                            content: '""',
                        },

                        // Pre-formatted text
                        pre: {
                            backgroundColor: theme('colors.gray.900'),
                            color: theme('colors.text.secondary'),
                            borderRadius: '0.5rem',
                            border: `1px solid ${theme('colors.border.primary')}`,
                        },

                        // Horizontal rules
                        hr: {
                            borderColor: theme('colors.border.primary'),
                            marginTop: '2em',
                            marginBottom: '2em',
                        },

                        // Blockquotes
                        blockquote: {
                            borderLeftColor: theme('colors.primary.500'),
                            color: theme('colors.text.secondary'),
                            backgroundColor: theme('colors.gray.800'),
                            padding: '1rem',
                            borderRadius: '0.5rem',
                        },
                    },
                },
            }),
        },
    },
    plugins: [
        // Add any additional plugins here
        // require('@tailwindcss/typography'),
    ],
}
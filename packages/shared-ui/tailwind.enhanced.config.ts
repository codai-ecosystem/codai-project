/**
 * Enhanced Tailwind Configuration for CODAI Ecosystem
 * Includes design tokens, app-specific colors, and responsive system
 */

import type { Config } from 'tailwindcss'
import { colors, typography, spacing, shadows, borderRadius, animation } from './src/config/design-tokens'

const config: Config = {
    darkMode: ['class'],
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    prefix: '',
    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: '1rem',
                sm: '1.5rem',
                lg: '2rem',
                xl: '2.5rem',
                '2xl': '3rem',
            },
            screens: {
                'xs': '320px',
                'sm': '640px',
                'md': '768px',
                'lg': '1024px',
                'xl': '1280px',
                '2xl': '1536px',
            },
        },
        extend: {
            // Design tokens integration
            colors: {
                // Base colors using CSS variables for theme switching
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },

                // App-specific colors using CSS variables
                'app-primary': {
                    50: 'var(--app-primary-50)',
                    100: 'var(--app-primary-100)',
                    200: 'var(--app-primary-200)',
                    300: 'var(--app-primary-300)',
                    400: 'var(--app-primary-400)',
                    500: 'var(--app-primary-500)',
                    600: 'var(--app-primary-600)',
                    700: 'var(--app-primary-700)',
                    800: 'var(--app-primary-800)',
                    900: 'var(--app-primary-900)',
                    950: 'var(--app-primary-950)',
                    DEFAULT: 'var(--app-primary)',
                },

                // Static app colors for direct usage
                ...colors.apps,

                // Semantic colors
                success: {
                    50: colors.semantic.success[50],
                    500: colors.semantic.success[500],
                    600: colors.semantic.success[600],
                    DEFAULT: colors.semantic.success[500],
                },
                warning: {
                    50: colors.semantic.warning[50],
                    500: colors.semantic.warning[500],
                    600: colors.semantic.warning[600],
                    DEFAULT: colors.semantic.warning[500],
                },
                error: {
                    50: colors.semantic.error[50],
                    500: colors.semantic.error[500],
                    600: colors.semantic.error[600],
                    DEFAULT: colors.semantic.error[500],
                },
                info: {
                    50: colors.semantic.info[50],
                    500: colors.semantic.info[500],
                    600: colors.semantic.info[600],
                    DEFAULT: colors.semantic.info[500],
                },

                // Gray scale using OKLCH
                gray: colors.gray,
            },

            // Typography
            fontFamily: typography.fontFamily,
            fontSize: typography.fontSize,
            fontWeight: typography.fontWeight,

            // Spacing (4px base scale)
            spacing: spacing,

            // Border radius
            borderRadius: borderRadius,

            // Box shadows
            boxShadow: shadows,

            // Animation
            animation: {
                ...animation,
                // Custom animations
                'fade-in': 'fade-in 0.3s ease-out',
                'fade-out': 'fade-out 0.3s ease-out',
                'slide-in-up': 'slide-in-up 0.3s ease-out',
                'slide-in-down': 'slide-in-down 0.3s ease-out',
                'slide-in-left': 'slide-in-left 0.3s ease-out',
                'slide-in-right': 'slide-in-right 0.3s ease-out',
                'scale-in': 'scale-in 0.2s ease-out',
                'scale-out': 'scale-out 0.2s ease-out',
                'bounce-gentle': 'bounce-gentle 2s infinite',
                'pulse-gentle': 'pulse-gentle 2s infinite',
                'shimmer': 'shimmer 2s infinite',
                'gradient-shift': 'gradient-shift 3s ease-in-out infinite',
            },

            // Keyframes for custom animations
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'fade-out': {
                    '0%': { opacity: '1' },
                    '100%': { opacity: '0' },
                },
                'slide-in-up': {
                    '0%': { transform: 'translateY(16px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'slide-in-down': {
                    '0%': { transform: 'translateY(-16px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                'slide-in-left': {
                    '0%': { transform: 'translateX(-16px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                'slide-in-right': {
                    '0%': { transform: 'translateX(16px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                'scale-in': {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'scale-out': {
                    '0%': { transform: 'scale(1)', opacity: '1' },
                    '100%': { transform: 'scale(0.95)', opacity: '0' },
                },
                'bounce-gentle': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-4px)' },
                },
                'pulse-gentle': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.8' },
                },
                'shimmer': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                'gradient-shift': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
            },

            // Backdrop blur
            backdropBlur: {
                xs: '2px',
                sm: '4px',
                md: '8px',
                lg: '12px',
                xl: '16px',
                '2xl': '24px',
                '3xl': '32px',
            },

            // Aspect ratios
            aspectRatio: {
                '4/3': '4 / 3',
                '3/2': '3 / 2',
                '2/3': '2 / 3',
                '9/16': '9 / 16',
                '16/9': '16 / 9',
                '21/9': '21 / 9',
            },

            // Z-index scale
            zIndex: {
                '1': '1',
                '2': '2',
                '3': '3',
                '4': '4',
                '5': '5',
                '60': '60',
                '70': '70',
                '80': '80',
                '90': '90',
                '100': '100',
                'modal': '1000',
                'popover': '1010',
                'tooltip': '1020',
                'notification': '1030',
            },

            // Container queries
            containers: {
                'xs': '20rem',
                'sm': '24rem',
                'md': '28rem',
                'lg': '32rem',
                'xl': '36rem',
                '2xl': '42rem',
                '3xl': '48rem',
                '4xl': '56rem',
                '5xl': '64rem',
                '6xl': '72rem',
                '7xl': '80rem',
            },

            // Screen sizes for responsive design
            screens: {
                'xs': '320px',
                'sm': '640px',
                'md': '768px',
                'lg': '1024px',
                'xl': '1280px',
                '2xl': '1536px',
                '3xl': '1920px',

                // Max-width breakpoints
                'max-xs': { 'max': '319px' },
                'max-sm': { 'max': '639px' },
                'max-md': { 'max': '767px' },
                'max-lg': { 'max': '1023px' },
                'max-xl': { 'max': '1279px' },
                'max-2xl': { 'max': '1535px' },

                // Height-based breakpoints
                'h-sm': { 'raw': '(min-height: 640px)' },
                'h-md': { 'raw': '(min-height: 768px)' },
                'h-lg': { 'raw': '(min-height: 1024px)' },

                // Orientation breakpoints
                'landscape': { 'raw': '(orientation: landscape)' },
                'portrait': { 'raw': '(orientation: portrait)' },

                // Reduced motion
                'reduce-motion': { 'raw': '(prefers-reduced-motion: reduce)' },
                'motion': { 'raw': '(prefers-reduced-motion: no-preference)' },
            },

            // Line heights
            lineHeight: {
                '3': '.75rem',
                '4': '1rem',
                '5': '1.25rem',
                '6': '1.5rem',
                '7': '1.75rem',
                '8': '2rem',
                '9': '2.25rem',
                '10': '2.5rem',
            },

            // Letter spacing
            letterSpacing: {
                'tighter': '-0.05em',
                'tight': '-0.025em',
                'normal': '0em',
                'wide': '0.025em',
                'wider': '0.05em',
                'widest': '0.1em',
            },
        },
    },
    plugins: [
        // Custom utilities
        function ({ addUtilities, theme }) {
            const newUtilities = {
                // Glass morphism
                '.glass': {
                    'backdrop-filter': 'blur(16px) saturate(180%)',
                    'background-color': 'rgba(255, 255, 255, 0.1)',
                    'border': '1px solid rgba(255, 255, 255, 0.2)',
                },
                '.glass-dark': {
                    'backdrop-filter': 'blur(16px) saturate(180%)',
                    'background-color': 'rgba(0, 0, 0, 0.1)',
                    'border': '1px solid rgba(255, 255, 255, 0.1)',
                },

                // Scrollbar styling
                '.scrollbar-thin': {
                    'scrollbar-width': 'thin',
                    'scrollbar-color': 'rgb(156 163 175) rgb(243 244 246)',
                },
                '.scrollbar-thin::-webkit-scrollbar': {
                    'width': '8px',
                },
                '.scrollbar-thin::-webkit-scrollbar-track': {
                    'background': 'rgb(243 244 246)',
                    'border-radius': '4px',
                },
                '.scrollbar-thin::-webkit-scrollbar-thumb': {
                    'background': 'rgb(156 163 175)',
                    'border-radius': '4px',
                },
                '.scrollbar-thin::-webkit-scrollbar-thumb:hover': {
                    'background': 'rgb(107 114 128)',
                },

                // Safe area utilities for mobile
                '.safe-top': {
                    'padding-top': 'env(safe-area-inset-top)',
                },
                '.safe-bottom': {
                    'padding-bottom': 'env(safe-area-inset-bottom)',
                },
                '.safe-left': {
                    'padding-left': 'env(safe-area-inset-left)',
                },
                '.safe-right': {
                    'padding-right': 'env(safe-area-inset-right)',
                },

                // Gradient animations
                '.gradient-animate': {
                    'background-size': '200% 200%',
                    'animation': 'gradient-shift 3s ease-in-out infinite',
                },

                // Text gradients
                '.text-gradient': {
                    'background': 'linear-gradient(45deg, var(--app-primary-500), var(--app-primary-700))',
                    'background-clip': 'text',
                    '-webkit-background-clip': 'text',
                    '-webkit-text-fill-color': 'transparent',
                },

                // Focus visible improvements
                '.focus-ring': {
                    '&:focus-visible': {
                        'outline': '2px solid var(--ring)',
                        'outline-offset': '2px',
                    },
                },
            }

            addUtilities(newUtilities)
        },

        // Plugin for container queries
        require('@tailwindcss/container-queries'),
    ],
} satisfies Config

export default config

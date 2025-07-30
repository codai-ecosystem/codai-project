import type { Config } from 'tailwindcss'

/**
 * CODAI Ecosystem Master Tailwind Configuration
 * 
 * This configuration provides:
 * - Complete design system with consistent colors and spacing
 * - Dynamic brand color support for all 42 apps
 * - Glassmorphism design tokens
 * - Comprehensive animation library
 * - CSS custom properties for runtime theming
 * - Typography and component tokens
 */

// Brand color palettes for all CODAI apps
export const brandColorPalettes = {
    // Core CODAI brand
    codai: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
        950: '#082f49',
    },
    // AI/Memory apps
    memorai: {
        50: '#fdf4ff',
        100: '#fae8ff',
        200: '#f5d0fe',
        300: '#f0abfc',
        400: '#e879f9',
        500: '#d946ef',
        600: '#c026d3',
        700: '#a21caf',
        800: '#86198f',
        900: '#701a75',
        950: '#4a044e',
    },
    // Banking/Finance apps
    bancai: {
        50: '#ecfdf5',
        100: '#d1fae5',
        200: '#a7f3d0',
        300: '#6ee7b7',
        400: '#34d399',
        500: '#10b981',
        600: '#059669',
        700: '#047857',
        800: '#065f46',
        900: '#064e3b',
        950: '#022c22',
    },
    stocai: {
        50: '#fff7ed',
        100: '#ffedd5',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#f97316',
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12',
        950: '#431407',
    },
    // Talent/HR apps
    talentai: {
        50: '#fff1f2',
        100: '#ffe4e6',
        200: '#fecdd3',
        300: '#fda4af',
        400: '#fb7185',
        500: '#f43f5e',
        600: '#e11d48',
        700: '#be123c',
        800: '#9f1239',
        900: '#881337',
        950: '#4c0519',
    },
    // Creative/Design apps
    prezentai: {
        50: '#fdf2f8',
        100: '#fce7f3',
        200: '#fbcfe8',
        300: '#f9a8d4',
        400: '#f472b6',
        500: '#ec4899',
        600: '#db2777',
        700: '#be185d',
        800: '#9d174d',
        900: '#831843',
        950: '#500724',
    },
    // Default/neutral for apps without specific brand
    default: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
        950: '#020617',
    },
}

// Base semantic color tokens
export const semanticColors = {
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
    // Status colors
    success: {
        DEFAULT: 'hsl(var(--success))',
        foreground: 'hsl(var(--success-foreground))',
        light: 'hsl(var(--success-light))',
        dark: 'hsl(var(--success-dark))',
    },
    warning: {
        DEFAULT: 'hsl(var(--warning))',
        foreground: 'hsl(var(--warning-foreground))',
        light: 'hsl(var(--warning-light))',
        dark: 'hsl(var(--warning-dark))',
    },
    error: {
        DEFAULT: 'hsl(var(--error))',
        foreground: 'hsl(var(--error-foreground))',
        light: 'hsl(var(--error-light))',
        dark: 'hsl(var(--error-dark))',
    },
    info: {
        DEFAULT: 'hsl(var(--info))',
        foreground: 'hsl(var(--info-foreground))',
        light: 'hsl(var(--info-light))',
        dark: 'hsl(var(--info-dark))',
    },
    // Glassmorphism colors
    glass: {
        light: 'rgba(255, 255, 255, 0.1)',
        medium: 'rgba(255, 255, 255, 0.15)',
        heavy: 'rgba(255, 255, 255, 0.25)',
        dark: 'rgba(0, 0, 0, 0.1)',
        'dark-medium': 'rgba(0, 0, 0, 0.15)',
        'dark-heavy': 'rgba(0, 0, 0, 0.25)',
    },
}

// Animation keyframes
export const keyframes = {
    // Accordion animations
    'accordion-down': {
        from: { height: '0' },
        to: { height: 'var(--radix-accordion-content-height)' },
    },
    'accordion-up': {
        from: { height: 'var(--radix-accordion-content-height)' },
        to: { height: '0' },
    },
    // Fade animations
    'fade-in': {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
    },
    'fade-out': {
        '0%': { opacity: '1' },
        '100%': { opacity: '0' },
    },
    'fade-in-up': {
        '0%': { opacity: '0', transform: 'translateY(10px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
    },
    'fade-in-down': {
        '0%': { opacity: '0', transform: 'translateY(-10px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
    },
    // Slide animations
    'slide-in-up': {
        '0%': { transform: 'translateY(100%)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    'slide-in-down': {
        '0%': { transform: 'translateY(-100%)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
    },
    'slide-in-left': {
        '0%': { transform: 'translateX(-100%)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' },
    },
    'slide-in-right': {
        '0%': { transform: 'translateX(100%)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' },
    },
    'slide-out-up': {
        '0%': { transform: 'translateY(0)', opacity: '1' },
        '100%': { transform: 'translateY(-100%)', opacity: '0' },
    },
    'slide-out-down': {
        '0%': { transform: 'translateY(0)', opacity: '1' },
        '100%': { transform: 'translateY(100%)', opacity: '0' },
    },
    // Scale animations
    'scale-in': {
        '0%': { transform: 'scale(0.9)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
    },
    'scale-out': {
        '0%': { transform: 'scale(1)', opacity: '1' },
        '100%': { transform: 'scale(0.9)', opacity: '0' },
    },
    'zoom-in': {
        '0%': { transform: 'scale(0.8) rotate3d(0, 0, 1, 10deg)', opacity: '0' },
        '100%': { transform: 'scale(1) rotate3d(0, 0, 1, 0deg)', opacity: '1' },
    },
    // Bounce animations
    'bounce-in': {
        '0%': { transform: 'scale(0.3)', opacity: '0' },
        '50%': { transform: 'scale(1.05)' },
        '70%': { transform: 'scale(0.9)' },
        '100%': { transform: 'scale(1)', opacity: '1' },
    },
    // Pulse animations
    'pulse-subtle': {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.8' },
    },
    'pulse-glow': {
        '0%, 100%': { opacity: '1', transform: 'scale(1)' },
        '50%': { opacity: '0.8', transform: 'scale(1.02)' },
    },
    // Glow animations
    glow: {
        '0%': { boxShadow: '0 0 20px hsl(var(--primary))' },
        '100%': { boxShadow: '0 0 40px hsl(var(--primary)), 0 0 60px hsl(var(--primary))' },
    },
    'glow-soft': {
        '0%': { boxShadow: '0 0 5px hsl(var(--primary) / 0.3)' },
        '100%': { boxShadow: '0 0 20px hsl(var(--primary) / 0.6), 0 0 30px hsl(var(--primary) / 0.4)' },
    },
    // Rotation animations
    'spin-slow': {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' },
    },
    'spin-reverse': {
        from: { transform: 'rotate(360deg)' },
        to: { transform: 'rotate(0deg)' },
    },
    // Flip animations
    'flip-x': {
        '0%': { transform: 'rotateX(0)' },
        '100%': { transform: 'rotateX(180deg)' },
    },
    'flip-y': {
        '0%': { transform: 'rotateY(0)' },
        '100%': { transform: 'rotateY(180deg)' },
    },
    // Shake animation
    shake: {
        '0%, 100%': { transform: 'translateX(0)' },
        '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
        '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
    },
    // Wobble animation
    wobble: {
        '0%': { transform: 'translateX(0%)' },
        '15%': { transform: 'translateX(-25%) rotate(-5deg)' },
        '30%': { transform: 'translateX(20%) rotate(3deg)' },
        '45%': { transform: 'translateX(-15%) rotate(-3deg)' },
        '60%': { transform: 'translateX(10%) rotate(2deg)' },
        '75%': { transform: 'translateX(-5%) rotate(-1deg)' },
        '100%': { transform: 'translateX(0%)' },
    },
    // Loading animations
    'loading-dots': {
        '0%, 80%, 100%': { transform: 'scale(0)' },
        '40%': { transform: 'scale(1)' },
    },
    'loading-pulse': {
        '0%': { transform: 'scale(1)', opacity: '1' },
        '50%': { transform: 'scale(1.1)', opacity: '0.7' },
        '100%': { transform: 'scale(1)', opacity: '1' },
    },
}

// Animation definitions
export const animations = {
    // Accordion
    'accordion-down': 'accordion-down 0.2s ease-out',
    'accordion-up': 'accordion-up 0.2s ease-out',

    // Fade
    'fade-in': 'fade-in 0.3s ease-out',
    'fade-out': 'fade-out 0.3s ease-out',
    'fade-in-up': 'fade-in-up 0.4s ease-out',
    'fade-in-down': 'fade-in-down 0.4s ease-out',

    // Slide
    'slide-in-up': 'slide-in-up 0.3s ease-out',
    'slide-in-down': 'slide-in-down 0.3s ease-out',
    'slide-in-left': 'slide-in-left 0.3s ease-out',
    'slide-in-right': 'slide-in-right 0.3s ease-out',
    'slide-out-up': 'slide-out-up 0.3s ease-out',
    'slide-out-down': 'slide-out-down 0.3s ease-out',

    // Scale
    'scale-in': 'scale-in 0.2s ease-out',
    'scale-out': 'scale-out 0.2s ease-out',
    'zoom-in': 'zoom-in 0.5s ease-out',

    // Bounce
    'bounce-in': 'bounce-in 0.6s ease-out',

    // Pulse
    'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    'pulse-glow': 'pulse-glow 1.5s ease-in-out infinite',

    // Glow
    glow: 'glow 2s ease-in-out infinite alternate',
    'glow-soft': 'glow-soft 3s ease-in-out infinite alternate',

    // Spin
    'spin-slow': 'spin-slow 3s linear infinite',
    'spin-reverse': 'spin-reverse 2s linear infinite',

    // Flip
    'flip-x': 'flip-x 0.6s ease-in-out',
    'flip-y': 'flip-y 0.6s ease-in-out',

    // Interactive
    shake: 'shake 0.5s ease-in-out',
    wobble: 'wobble 1s ease-in-out',

    // Loading
    'loading-dots': 'loading-dots 1.4s ease-in-out infinite',
    'loading-pulse': 'loading-pulse 1.5s ease-in-out infinite',
}

/**
 * Creates a Tailwind configuration for a CODAI app
 * @param appName - The name of the app (e.g., 'codai', 'memorai', 'bancai')
 * @param brandColors - Optional custom brand colors
 * @param customConfig - Additional configuration to merge
 */
export function createCodaiTailwindConfig(
    appName: string = 'default',
    brandColors?: Record<string, string>,
    customConfig?: Partial<Config>
): Config {
    // Get brand colors for this app
    const appBrandColors = brandColorPalettes[appName as keyof typeof brandColorPalettes] || brandColorPalettes.default

    const baseConfig: Config = {
        darkMode: 'class',
        content: [
            './src/**/*.{js,ts,jsx,tsx,mdx}',
            './app/**/*.{js,ts,jsx,tsx,mdx}',
            './pages/**/*.{js,ts,jsx,tsx,mdx}',
            './components/**/*.{js,ts,jsx,tsx,mdx}',
            './lib/**/*.{js,ts,jsx,tsx,mdx}',
            './utils/**/*.{js,ts,jsx,tsx,mdx}',
            // Include shared-ui components
            '../../packages/shared-ui/src/**/*.{js,ts,jsx,tsx}',
            '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
        ],
        prefix: '',
        theme: {
            container: {
                center: true,
                padding: '2rem',
                screens: {
                    'sm': '640px',
                    'md': '768px',
                    'lg': '1024px',
                    'xl': '1280px',
                    '2xl': '1400px',
                },
            },
            extend: {
                colors: {
                    ...semanticColors,
                    // App-specific brand colors
                    brand: appBrandColors,
                    // Legacy support for old naming
                    [appName]: appBrandColors,
                    // Custom colors if provided
                    ...(brandColors && { custom: brandColors }),
                },
                borderRadius: {
                    'lg': 'var(--radius)',
                    'md': 'calc(var(--radius) - 2px)',
                    'sm': 'calc(var(--radius) - 4px)',
                    'xl': 'calc(var(--radius) + 4px)',
                    '2xl': 'calc(var(--radius) + 8px)',
                    '3xl': 'calc(var(--radius) + 12px)',
                },
                fontFamily: {
                    sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
                    mono: ['var(--font-mono)', 'JetBrains Mono', 'Consolas', 'monospace'],
                    heading: ['var(--font-heading)', 'Inter', 'system-ui', 'sans-serif'],
                },
                fontSize: {
                    'xs': ['0.75rem', { lineHeight: '1rem' }],
                    'sm': ['0.875rem', { lineHeight: '1.25rem' }],
                    'base': ['1rem', { lineHeight: '1.5rem' }],
                    'lg': ['1.125rem', { lineHeight: '1.75rem' }],
                    'xl': ['1.25rem', { lineHeight: '1.75rem' }],
                    '2xl': ['1.5rem', { lineHeight: '2rem' }],
                    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
                    '5xl': ['3rem', { lineHeight: '1' }],
                    '6xl': ['3.75rem', { lineHeight: '1' }],
                    '7xl': ['4.5rem', { lineHeight: '1' }],
                    '8xl': ['6rem', { lineHeight: '1' }],
                    '9xl': ['8rem', { lineHeight: '1' }],
                },
                spacing: {
                    '18': '4.5rem',
                    '88': '22rem',
                    '128': '32rem',
                    '144': '36rem',
                },
                backdropBlur: {
                    'xs': '2px',
                    '4xl': '72px',
                },
                backgroundImage: {
                    'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                    'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                    'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                    'glass-gradient-dark': 'linear-gradient(135deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.05))',
                },
                boxShadow: {
                    'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                    'glass-lg': '0 25px 50px -12px rgba(31, 38, 135, 0.5)',
                    'glow': '0 0 20px hsl(var(--primary) / 0.5)',
                    'glow-lg': '0 0 40px hsl(var(--primary) / 0.6)',
                    'inner-glow': 'inset 0 0 10px hsl(var(--primary) / 0.3)',
                },
                keyframes,
                animation: animations,
                scale: {
                    '98': '0.98',
                    '102': '1.02',
                },
                opacity: {
                    '15': '0.15',
                },
                zIndex: {
                    '60': '60',
                    '70': '70',
                    '80': '80',
                    '90': '90',
                    '100': '100',
                },
            },
        },
        plugins: [
            require('@tailwindcss/typography'),
            require('@tailwindcss/forms'),
            require('@tailwindcss/aspect-ratio'),
            require('tailwindcss-animate'),
        ],
    }

    // Merge with custom configuration
    if (customConfig) {
        return {
            ...baseConfig,
            ...customConfig,
            theme: {
                ...baseConfig.theme,
                ...customConfig.theme,
                extend: {
                    ...baseConfig.theme?.extend,
                    ...customConfig.theme?.extend,
                },
            },
        }
    }

    return baseConfig
}

// Default export - Master configuration
const config = createCodaiTailwindConfig()
export default config

/**
 * @fileoverview Tailwind Mobile Configuration Enhancer  
 * @description Enhances Tailwind configurations with mobile-first responsive design
 */

const fs = require('fs');

function enhanceTailwindConfig(tailwindPath) {
    if (!fs.existsSync(tailwindPath)) {
        console.warn(`Tailwind config not found at ${tailwindPath}, creating new one`);
        createTailwindConfig(tailwindPath);
        return;
    }

    const content = fs.readFileSync(tailwindPath, 'utf8');
    const enhanced = enhanceExistingConfig(content);
    fs.writeFileSync(tailwindPath, enhanced);
}

function createTailwindConfig(tailwindPath) {
    const config = `/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        screens: {
            'xs': '320px',
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1536px',
        },
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
                '88': '22rem',
                '128': '32rem',
            },
            fontFamily: {
                sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-geist-mono)', 'monospace'],
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
            },
            minHeight: {
                'touch': '44px',
                'screen-mobile': '100vh',
                'screen-mobile-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
            },
            minWidth: {
                'touch': '44px',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'slide-left': 'slideLeft 0.3s ease-out',
                'slide-right': 'slideRight 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'bounce-gentle': 'bounceGentle 0.6s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideLeft: {
                    '0%': { transform: 'translateX(10px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                slideRight: {
                    '0%': { transform: 'translateX(-10px)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                bounceGentle: {
                    '0%, 20%, 53%, 80%, 100%': { transform: 'translateY(0)' },
                    '40%, 43%': { transform: 'translateY(-5px)' },
                    '70%': { transform: 'translateY(-3px)' },
                    '90%': { transform: 'translateY(-2px)' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            touchAction: {
                'manipulation': 'manipulation',
                'pan-x': 'pan-x',
                'pan-y': 'pan-y',
                'pinch-zoom': 'pinch-zoom',
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        function({ addUtilities }) {
            addUtilities({
                '.touch-target': {
                    'min-height': '44px',
                    'min-width': '44px',
                    'padding': '0.5rem',
                },
                '.touch-action-manipulation': {
                    'touch-action': 'manipulation',
                },
                '.touch-action-pan-x': {
                    'touch-action': 'pan-x',
                },
                '.touch-action-pan-y': {
                    'touch-action': 'pan-y',
                },
                '.scroll-smooth-mobile': {
                    '-webkit-overflow-scrolling': 'touch',
                    'scroll-behavior': 'smooth',
                },
                '.safe-area-inset-top': {
                    'padding-top': 'env(safe-area-inset-top)',
                },
                '.safe-area-inset-bottom': {
                    'padding-bottom': 'env(safe-area-inset-bottom)',
                },
                '.safe-area-inset-left': {
                    'padding-left': 'env(safe-area-inset-left)',
                },
                '.safe-area-inset-right': {
                    'padding-right': 'env(safe-area-inset-right)',
                },
            });
        },
    ],
};`;

    fs.writeFileSync(tailwindPath, config);
}

function enhanceExistingConfig(content) {
    // Parse existing config and enhance it
    let enhanced = content;

    // Add xs breakpoint if not exists
    if (!enhanced.includes("'xs'")) {
        enhanced = enhanced.replace(
            /screens:\s*{/,
            `screens: {
            'xs': '320px',`
        );
    }

    // Add touch-related utilities
    if (!enhanced.includes('touch-target')) {
        const utilityFunction = `
        function({ addUtilities }) {
            addUtilities({
                '.touch-target': {
                    'min-height': '44px',
                    'min-width': '44px',
                    'padding': '0.5rem',
                },
                '.touch-action-manipulation': {
                    'touch-action': 'manipulation',
                },
                '.scroll-smooth-mobile': {
                    '-webkit-overflow-scrolling': 'touch',
                    'scroll-behavior': 'smooth',
                },
                '.safe-area-inset-top': {
                    'padding-top': 'env(safe-area-inset-top)',
                },
                '.safe-area-inset-bottom': {
                    'padding-bottom': 'env(safe-area-inset-bottom)',
                },
            });
        },`;

        if (enhanced.includes('plugins: [')) {
            enhanced = enhanced.replace(
                'plugins: [',
                `plugins: [${utilityFunction}`
            );
        } else {
            enhanced = enhanced.replace(
                /}\s*$/,
                `,
    plugins: [${utilityFunction}
    ],
}`
            );
        }
    }

    // Add mobile-specific animations
    if (!enhanced.includes('slide-up')) {
        const animations = `
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'bounce-gentle': 'bounceGentle 0.6s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },`;

        enhanced = enhanced.replace(
            /extend:\s*{/,
            `extend: {${animations}`
        );
    }

    return enhanced;
}

module.exports = enhanceTailwindConfig;
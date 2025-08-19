import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'codai-primary': '#6366f1',
                'codai-secondary': '#8b5cf6',
                'codai-accent': '#06b6d4',
                'codai-success': '#10b981',
                'codai-warning': '#f59e0b',
                'codai-error': '#ef4444',
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-in-out',
                'slide-in': 'slideIn 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}

export default config

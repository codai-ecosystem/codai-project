import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'codai': {
          'primary': '#2563eb',
          'secondary': '#7c3aed',
          'accent': '#06b6d4',
          'success': '#10b981',
          'warning': '#f59e0b',
          'error': '#ef4444',
        },
        'donation': {
          'verified': '#10b981',
          'pending': '#f59e0b',
          'failed': '#ef4444',
        },
        'blockchain': {
          'confirmed': '#059669',
          'pending': '#d97706',
          'failed': '#dc2626',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'donation-hero': 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
        'blockchain-gradient': 'linear-gradient(45deg, #059669, #10b981)',
      },
      animation: {
        'donation-pulse': 'donationPulse 2s ease-in-out infinite',
        'gradient': 'gradient 3s ease infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'count-up': 'countUp 2s ease-out forwards',
        'success-pulse': 'successPulse 0.6s ease-in-out',
      },
      keyframes: {
        donationPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        gradient: {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
        shimmer: {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' },
        },
        countUp: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        successPulse: {
          '0%': { transform: 'scale(1)', 'background-color': '#2563eb' },
          '50%': { transform: 'scale(1.1)', 'background-color': '#10b981' },
          '100%': { transform: 'scale(1)', 'background-color': '#059669' },
        },
      },
      boxShadow: {
        'donation': '0 10px 40px rgba(37, 99, 235, 0.1)',
        'blockchain': '0 8px 32px rgba(16, 185, 129, 0.2)',
        'vote': '0 10px 25px rgba(124, 58, 237, 0.3)',
      },
      backdropBlur: {
        'donation': '12px',
      }
    },
  },
  plugins: [],
}

export default config

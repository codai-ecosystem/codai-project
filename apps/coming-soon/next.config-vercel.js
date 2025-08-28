const nextConfig = {
    // Enable experimental features for better performance
    experimental: {
        optimizePackageImports: ['framer-motion', 'lucide-react'],
    },

    // Optimize fonts and images
    optimizeFonts: true,

    // Enable SWC minification for better performance
    swcMinify: true,

    // Strict mode for better error handling
    reactStrictMode: true,

    // Image optimization for Vercel
    images: {
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        domains: ['codai.ro', 'assets.codai.ro'],
    },

    // Headers for security and performance
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
        ];
    },

    // Redirects for SEO
    async redirects() {
        return [
            {
                source: '/home',
                destination: '/',
                permanent: true,
            },
            {
                source: '/coming-soon',
                destination: '/',
                permanent: true,
            },
        ];
    },

    // Environment variables
    env: {
        CUSTOM_KEY: process.env.NODE_ENV,
        NEXT_PUBLIC_SITE_URL: 'https://codai.ro',
    },

    // Vercel-specific optimizations
    poweredByHeader: false,
    compress: true,

    // Output for Vercel deployment
    output: 'standalone',
};

module.exports = nextConfig;
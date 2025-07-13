/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    eslint: {
        ignoreDuringBuilds: true
    },
    typescript: {
        ignoreBuildErrors: true
    },
    images: {
        domains: ['localhost'],
    },
    env: {
        APP_NAME: 'CURTAI',
        APP_DESCRIPTION: 'AI-Powered Soulmate Discovery Platform',
        APP_PORT: '4015',
    },
}

module.exports = nextConfig;

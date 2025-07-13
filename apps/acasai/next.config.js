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
        APP_NAME: 'ACASAI',
        APP_DESCRIPTION: 'AI Home & Living Platform',
        APP_PORT: '4018',
    },
}

module.exports = nextConfig;

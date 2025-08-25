/**
 * @fileoverview Next.js I18n Configuration
 * @description Next.js internationalization configuration for controlai-dashboard
 */

const { SUPPORTED_LOCALES, DEFAULT_LOCALE } = require('./i18n/shared-config');

/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: Object.keys(SUPPORTED_LOCALES),
    defaultLocale: DEFAULT_LOCALE,
    localeDetection: true,
    domains: [
      // Add domain-based locale routing if needed
      // {
      //   domain: 'example.com',
      //   defaultLocale: 'en',
      // },
      // {
      //   domain: 'example.es',
      //   defaultLocale: 'es',
      // },
    ],
  },
  
  // Webpack configuration for i18n
  webpack: (config, { dev, isServer }) => {
    // Add any custom webpack configuration for i18n here
    return config;
  },

  // Additional configuration for i18n
  experimental: {
    // Enable experimental features if needed
  },

  // Headers for i18n
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Accept-Language',
            value: Object.keys(SUPPORTED_LOCALES).join(', '),
          },
        ],
      },
    ];
  },

  // Redirects for i18n
  async redirects() {
    return [
      // Add locale-based redirects if needed
    ];
  },

  // Rewrites for i18n
  async rewrites() {
    return [
      // Add locale-based rewrites if needed
    ];
  },
};

module.exports = nextConfig;
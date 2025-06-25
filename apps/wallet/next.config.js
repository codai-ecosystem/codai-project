/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['wallet.bancai.ro'],
  },
};

module.exports = nextConfig;

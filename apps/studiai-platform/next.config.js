/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true,
  },
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  env: {
    AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
    AZURE_OPENAI_KEY: process.env.AZURE_OPENAI_KEY,
    AZURE_OPENAI_API_VERSION: process.env.AZURE_OPENAI_API_VERSION,
    AZURE_AI_FOUNDRY_ENDPOINT: process.env.AZURE_AI_FOUNDRY_ENDPOINT,
    AZURE_AI_FOUNDRY_KEY: process.env.AZURE_AI_FOUNDRY_KEY,
  }
}

module.exports = nextConfig

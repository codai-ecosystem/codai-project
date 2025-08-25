import { createHealthEndpoint } from '@codai/api-utils/health'

// Export the health endpoint using @codai/api-utils
export const GET = createHealthEndpoint({
  serviceName: 'Dashboard Service',
  version: '1.0.0',
  checks: {
    external: [
      {
        name: 'nextjs',
        check: () => Promise.resolve({ status: 'healthy', message: 'Next.js 15 framework ready' })
      }
    ]
  }
})

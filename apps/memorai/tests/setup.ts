// Generated Vitest setup for memorai app
// Consolidates common test setup patterns using @codai/testing-utils

import '@codai/testing-utils/setups/vitest/base.setup'
import '@codai/testing-utils/setups/vitest/nextjs.setup'
import '@codai/testing-utils/setups/vitest/nextauth.setup'
import '@codai/testing-utils/setups/vitest/lucide.setup'

// App-specific customizations
// MemorAI environment variables
process.env.NEXTAUTH_URL = 'http://localhost:4006'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.CODAI_CLIENT_ID = 'test-client-id'
process.env.CODAI_CLIENT_SECRET = 'test-client-secret'
process.env.CODAI_AUTH_URL = 'https://auth.codai.ro'
process.env.CODAI_ID_URL = 'https://id.codai.ro'

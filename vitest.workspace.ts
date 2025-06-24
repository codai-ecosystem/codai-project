import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  // Root tests
  'vitest.config.ts',
  // All apps
  'apps/*/vitest.config.ts',
  // All services
  'services/*/vitest.config.ts',
  // All packages
  'packages/*/vitest.config.ts'
])
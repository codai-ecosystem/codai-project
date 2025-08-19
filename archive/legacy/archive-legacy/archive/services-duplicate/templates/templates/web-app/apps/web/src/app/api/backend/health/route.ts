import { createBackendProxy } from '@/lib/backend-proxy';

// Proxy health check endpoint to the backend
export const { GET, POST } = createBackendProxy('/api/health');

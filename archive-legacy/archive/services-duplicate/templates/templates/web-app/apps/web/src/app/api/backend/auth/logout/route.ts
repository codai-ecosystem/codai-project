import { createBackendProxy } from '@/lib/backend-proxy';

// Proxy auth logout endpoint to the backend
export const { POST } = createBackendProxy('/api/auth/logout');

import { createBackendProxy } from '@/lib/backend-proxy';

// Proxy auth login endpoint to the backend
export const { POST } = createBackendProxy('/api/auth/login');

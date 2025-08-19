import { createBackendProxy } from '@/lib/backend-proxy';

// Proxy auth register endpoint to the backend
export const { POST } = createBackendProxy('/api/auth/register');

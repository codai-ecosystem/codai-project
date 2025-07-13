import { createBackendProxy } from '@/lib/backend-proxy';

// Proxy users endpoint to the backend
export const { GET, PATCH, DELETE } = createBackendProxy('/api/users/me');

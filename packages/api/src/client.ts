import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import { createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';
import { getServiceUrl } from '@codai/core';
import type { AppRouter } from './types';

// Create the tRPC client for React
export const trpc = createTRPCReact<AppRouter>();

// Configuration for tRPC client
export const getTRPCConfig = (serviceUrl?: string) => ({
    links: [
        httpBatchLink({
            url: serviceUrl || getServiceUrl('aide', '/api/trpc'),
            headers() {
                if (typeof window !== 'undefined') {
                    const token = localStorage.getItem('codai_auth_token');
                    return token ? { authorization: `Bearer ${token}` } : {};
                }
                return {};
            },
        }),
    ],
    transformer: superjson,
});

// Create vanilla client for server-side usage
export const createApiClient = (serviceUrl: string) => {
    return createTRPCProxyClient<AppRouter>({
        transformer: superjson,
        links: [
            httpBatchLink({
                url: `${serviceUrl}/api/trpc`,
            }),
        ],
    });
};

// Cross-service communication helper
export class ServiceCommunicator {
    private clients: Map<string, ReturnType<typeof createApiClient>> = new Map();

    constructor() {
        // Initialize clients for each service
        this.clients.set('aide', createApiClient(getServiceUrl('aide')));
        this.clients.set('memorai', createApiClient(getServiceUrl('memorai')));
        this.clients.set('logai', createApiClient(getServiceUrl('logai')));
        this.clients.set('bancai', createApiClient(getServiceUrl('bancai')));
        this.clients.set('fabricai', createApiClient(getServiceUrl('fabricai')));
    }

    getClient(serviceName: string) {
        return this.clients.get(serviceName);
    }

    async callService<T>(
        serviceName: string,
        procedure: string,
        input?: any
    ): Promise<T> {
        const client = this.getClient(serviceName);
        if (!client) {
            throw new Error(`Service ${serviceName} not found`);
        }

        // This is a simplified example - actual implementation would depend on the specific procedures
        // @ts-ignore - This is a dynamic call that depends on the actual router structure
        return client[procedure](input);
    }
}

// Global service communicator instance
export const serviceCommunicator = new ServiceCommunicator();

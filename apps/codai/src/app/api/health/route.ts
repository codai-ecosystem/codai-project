import { createSimpleHealthEndpoint } from '@codai/api-utils';

// CODAI Development Environment specific health configuration
const GET = createSimpleHealthEndpoint('CODAI Development Environment', '1.0.0');

// Use the same function for HEAD requests
const HEAD = GET;

export { GET, HEAD };
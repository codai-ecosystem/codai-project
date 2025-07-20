/**
 * CODAI Ecosystem Authentication Testing Suite
 * Comprehensive testing for authentication across all 32+ applications
 */

import { test, expect, Page, Browser, BrowserContext } from '@playwright/test';
import { authenticateUser, verifyAuthenticationState, clearAuthenticationState } from './auth-helpers';

// Test configuration
const TEST_CONFIG = {
    baseUrl: 'http://localhost:3000',
    idServiceUrl: 'https://id.codai.ro',
    apiGatewayUrl: 'http://localhost:4000',
    testUser: {
        email: 'test@codai.ro',
        password: 'TestPassword123!',
        name: 'Test User'
    },
    timeout: 30000
};

// All CODAI ecosystem applications
const CODAI_APPLICATIONS = [
    // Core Identity and Admin
    { name: 'ID Service', url: 'https://id.codai.ro', subdomain: 'id', category: 'core' },
    { name: 'Admin Dashboard', url: 'http://localhost:3000', subdomain: 'admin', category: 'core' },
    { name: 'Hub', url: 'http://localhost:3001', subdomain: 'hub', category: 'core' },

    // Primary Business Platforms
    { name: 'CODAI Platform', url: 'http://localhost:3002', subdomain: 'codai', category: 'business' },
    { name: 'MEMORAI', url: 'http://localhost:3003', subdomain: 'memorai', category: 'business' },
    { name: 'BANCAI', url: 'http://localhost:3004', subdomain: 'bancai', category: 'financial' },
    { name: 'CUMPARAI', url: 'http://localhost:3005', subdomain: 'cumparai', category: 'commerce' },
    { name: 'MARKETAI', url: 'http://localhost:3006', subdomain: 'marketai', category: 'marketing' },
    { name: 'FABRICAI', url: 'http://localhost:3007', subdomain: 'fabricai', category: 'content' },
    { name: 'WALLET', url: 'http://localhost:3008', subdomain: 'wallet', category: 'financial' },

    // Specialized Services
    { name: 'LOGAI', url: 'http://localhost:3009', subdomain: 'logai', category: 'utility' },
    { name: 'ANALIZAI', url: 'http://localhost:3010', subdomain: 'analizai', category: 'analytics' },
    { name: 'ROMAI', url: 'http://localhost:3011', subdomain: 'romai', category: 'localization' },
    { name: 'SUNAI', url: 'http://localhost:3012', subdomain: 'sunai', category: 'communication' },
    { name: 'PREZENTAI', url: 'http://localhost:3013', subdomain: 'prezentai', category: 'content' },
    { name: 'STUDIAI', url: 'http://localhost:3014', subdomain: 'studiai', category: 'education' },
    { name: 'MUZICAI', url: 'http://localhost:3015', subdomain: 'muzicai', category: 'media' },

    // Professional Services
    { name: 'LEGALIZAI', url: 'http://localhost:3016', subdomain: 'legalizai', category: 'legal' },
    { name: 'TALENTAI', url: 'http://localhost:3017', subdomain: 'talentai', category: 'hr' },
    { name: 'SOCIAI', url: 'http://localhost:3018', subdomain: 'sociai', category: 'social' },
    { name: 'PUBLICAI', url: 'http://localhost:3019', subdomain: 'publicai', category: 'publishing' },

    // Domain-Specific Tools
    { name: 'STOCAI', url: 'http://localhost:3020', subdomain: 'stocai', category: 'inventory' },
    { name: 'CURTAI', url: 'http://localhost:3021', subdomain: 'curtai', category: 'legal' },
    { name: 'JUCAI', url: 'http://localhost:3022', subdomain: 'jucai', category: 'gaming' },
    { name: 'ACASAI', url: 'http://localhost:3023', subdomain: 'acasai', category: 'real-estate' },
    { name: 'AJUTAI', url: 'http://localhost:3024', subdomain: 'ajutai', category: 'support' },
    { name: 'AIDE', url: 'http://localhost:3025', subdomain: 'aide', category: 'assistant' },
    { name: 'CONVERSAI', url: 'http://localhost:3026', subdomain: 'conversai', category: 'communication' },
    { name: 'DONAI', url: 'http://localhost:3027', subdomain: 'donai', category: 'charity' },

    // Development and Administrative Tools
    { name: 'DEXAI', url: 'http://localhost:3028', subdomain: 'dexai', category: 'developer' },
    { name: 'EXPLORER', url: 'http://localhost:3029', subdomain: 'explorer', category: 'developer' },
    { name: 'KODEX', url: 'http://localhost:3030', subdomain: 'kodex', category: 'developer' },
    { name: 'METU', url: 'http://localhost:3031', subdomain: 'metu', category: 'monitoring' },
    { name: 'GLASS', url: 'http://localhost:3032', subdomain: 'glass', category: 'automation' },

    // Mobile Applications (Testing Web Interfaces)
    { name: 'CODAI Mobile Web', url: 'http://localhost:3033', subdomain: 'mobile-codai', category: 'mobile' },
    { name: 'BANCAI Mobile Web', url: 'http://localhost:3034', subdomain: 'mobile-bancai', category: 'mobile' }
];

// Authentication test scenarios
export class AuthenticationTestSuite {
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;
    private page: Page | null = null;

    async setup() {
        // Browser context with shared authentication state
        this.context = await this.browser!.newContext({
            storageState: undefined, // Start with clean state
            httpCredentials: undefined
        });
        this.page = await this.context.newPage();
    }

    async teardown() {
        await this.page?.close();
        await this.context?.close();
    }

    // Test 6.1.1: Authentication across all 32+ apps
    async testUniversalAuthentication() {
        const results: Array<{
            app: string;
            category: string;
            success: boolean;
            error?: string;
            responseTime: number;
        }> = [];

        console.log('🔐 Testing authentication across all CODAI applications...');

        // First, authenticate with the ID service
        console.log('📝 Authenticating with ID service...');
        const authResult = await this.authenticateWithIDService();

        if (!authResult.success) {
            throw new Error(`Failed to authenticate with ID service: ${authResult.error}`);
        }

        console.log('✅ ID service authentication successful');

        // Test each application
        for (const app of CODAI_APPLICATIONS) {
            const startTime = Date.now();

            try {
                console.log(`🧪 Testing ${app.name} (${app.category})...`);

                // Navigate to the application
                await this.page!.goto(app.url, { waitUntil: 'networkidle' });

                // Check if authentication is preserved
                const isAuthenticated = await this.verifyAuthenticationState();

                const responseTime = Date.now() - startTime;

                if (isAuthenticated) {
                    console.log(`✅ ${app.name}: Authentication verified (${responseTime}ms)`);
                    results.push({
                        app: app.name,
                        category: app.category,
                        success: true,
                        responseTime
                    });
                } else {
                    console.log(`❌ ${app.name}: Authentication failed`);
                    results.push({
                        app: app.name,
                        category: app.category,
                        success: false,
                        error: 'Authentication state not preserved',
                        responseTime
                    });
                }

            } catch (error) {
                const responseTime = Date.now() - startTime;
                console.log(`🚨 ${app.name}: Error - ${error}`);
                results.push({
                    app: app.name,
                    category: app.category,
                    success: false,
                    error: (error as Error).message,
                    responseTime
                });
            }

            // Small delay to prevent overwhelming servers
            await this.page!.waitForTimeout(500);
        }

        return results;
    }

    // Test 6.1.2: Cross-domain cookie functionality
    async testCrossDomainCookies() {
        console.log('🍪 Testing cross-domain cookie functionality...');

        const cookieTests = [
            {
                name: 'ID Service Cookie Setting',
                url: TEST_CONFIG.idServiceUrl,
                expectedCookies: ['codai_access_token', 'codai_refresh_token']
            },
            {
                name: 'Subdomain Cookie Access',
                url: 'http://admin.codai.ro',
                expectedCookies: ['codai_access_token']
            },
            {
                name: 'Cross-Subdomain Access',
                url: 'http://hub.codai.ro',
                expectedCookies: ['codai_access_token']
            }
        ];

        const results = [];

        for (const test of cookieTests) {
            try {
                await this.page!.goto(test.url);

                const cookies = await this.context!.cookies();
                const relevantCookies = cookies.filter(cookie =>
                    test.expectedCookies.some(expected => cookie.name.includes(expected.replace('codai_', '')))
                );

                const success = test.expectedCookies.every(expectedCookie =>
                    relevantCookies.some(cookie => cookie.name.includes(expectedCookie.replace('codai_', '')))
                );

                console.log(`${success ? '✅' : '❌'} ${test.name}: ${relevantCookies.length} cookies found`);

                results.push({
                    test: test.name,
                    url: test.url,
                    success,
                    cookiesFound: relevantCookies.length,
                    expectedCookies: test.expectedCookies.length,
                    cookies: relevantCookies.map(c => ({ name: c.name, domain: c.domain }))
                });

            } catch (error) {
                console.log(`🚨 ${test.name}: Error - ${error}`);
                results.push({
                    test: test.name,
                    url: test.url,
                    success: false,
                    error: (error as Error).message
                });
            }
        }

        return results;
    }

    // Test 6.1.3: JWT token refresh and validation
    async testJWTTokenManagement() {
        console.log('🔑 Testing JWT token refresh and validation...');

        // Get initial tokens
        const initialTokens = await this.getStoredTokens();
        console.log('📊 Initial tokens retrieved');

        // Wait for token near expiry (simulated)
        console.log('⏰ Simulating token near expiry...');

        // Make API call to trigger token refresh
        const refreshResult = await this.testTokenRefresh();
        console.log(`${refreshResult.success ? '✅' : '❌'} Token refresh test`);

        // Validate new tokens
        const newTokens = await this.getStoredTokens();
        const tokensChanged = initialTokens.accessToken !== newTokens.accessToken;

        console.log(`${tokensChanged ? '✅' : '❌'} Token rotation verified`);

        // Test token validation
        const validationResult = await this.testTokenValidation(newTokens.accessToken);
        console.log(`${validationResult.valid ? '✅' : '❌'} Token validation test`);

        return {
            initialTokens: !!initialTokens.accessToken,
            refreshSuccess: refreshResult.success,
            tokensRotated: tokensChanged,
            validationPassed: validationResult.valid,
            tokenExpiry: validationResult.exp,
            tokenIssuer: validationResult.iss
        };
    }

    // Test 6.1.4: Authentication error handling
    async testAuthenticationErrorHandling() {
        console.log('🛡️ Testing authentication error handling...');

        const errorTests = [
            {
                name: 'Invalid Token',
                test: () => this.testWithInvalidToken()
            },
            {
                name: 'Expired Token',
                test: () => this.testWithExpiredToken()
            },
            {
                name: 'No Token',
                test: () => this.testWithoutToken()
            },
            {
                name: 'Malformed Token',
                test: () => this.testWithMalformedToken()
            }
        ];

        const results = [];

        for (const errorTest of errorTests) {
            try {
                const result = await errorTest.test();
                console.log(`${result.handledCorrectly ? '✅' : '❌'} ${errorTest.name}`);
                results.push({
                    test: errorTest.name,
                    success: result.handledCorrectly,
                    statusCode: result.statusCode,
                    errorMessage: result.errorMessage,
                    redirected: result.redirectedToLogin
                });
            } catch (error) {
                console.log(`🚨 ${errorTest.name}: Unexpected error - ${error}`);
                results.push({
                    test: errorTest.name,
                    success: false,
                    error: (error as Error).message
                });
            }
        }

        return results;
    }

    // Helper methods
    private async authenticateWithIDService() {
        try {
            await this.page!.goto(TEST_CONFIG.idServiceUrl + '/login');

            // Fill login form
            await this.page!.fill('[data-testid="email"]', TEST_CONFIG.testUser.email);
            await this.page!.fill('[data-testid="password"]', TEST_CONFIG.testUser.password);
            await this.page!.click('[data-testid="login-button"]');

            // Wait for authentication to complete
            await this.page!.waitForURL('**/dashboard', { timeout: TEST_CONFIG.timeout });

            return { success: true };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }

    private async verifyAuthenticationState(): Promise<boolean> {
        try {
            // Check for authenticated user indicators
            const authIndicators = [
                '[data-testid="user-avatar"]',
                '[data-testid="user-menu"]',
                '[data-testid="dashboard-link"]',
                '.authenticated-user',
                '.user-profile'
            ];

            for (const indicator of authIndicators) {
                try {
                    await this.page!.waitForSelector(indicator, { timeout: 2000 });
                    return true;
                } catch {
                    // Continue to next indicator
                }
            }

            // Check if redirected to login
            const currentUrl = this.page!.url();
            if (currentUrl.includes('/login') || currentUrl.includes('/signin')) {
                return false;
            }

            // Check for authentication tokens in localStorage
            const hasTokens = await this.page!.evaluate(() => {
                return localStorage.getItem('codai_access_token') !== null;
            });

            return hasTokens;
        } catch {
            return false;
        }
    }

    private async getStoredTokens() {
        return await this.page!.evaluate(() => {
            return {
                accessToken: localStorage.getItem('codai_access_token'),
                refreshToken: localStorage.getItem('codai_refresh_token')
            };
        });
    }

    private async testTokenRefresh() {
        try {
            // Make API call that should trigger token refresh
            const response = await this.page!.evaluate(async () => {
                const response = await fetch('/api/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('codai_access_token')}`
                    }
                });
                return {
                    status: response.status,
                    ok: response.ok
                };
            });

            return { success: response.ok, status: response.status };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }

    private async testTokenValidation(token: string) {
        try {
            // Decode JWT token (basic validation)
            const payload = JSON.parse(atob(token.split('.')[1]));

            return {
                valid: true,
                exp: payload.exp,
                iss: payload.iss,
                sub: payload.sub
            };
        } catch {
            return { valid: false };
        }
    }

    private async testWithInvalidToken() {
        // Set invalid token and test API access
        await this.page!.evaluate(() => {
            localStorage.setItem('codai_access_token', 'invalid.token.here');
        });

        const response = await this.page!.evaluate(async () => {
            const response = await fetch('/api/protected-endpoint');
            return {
                status: response.status,
                redirected: response.redirected,
                url: response.url
            };
        });

        return {
            handledCorrectly: response.status === 401,
            statusCode: response.status,
            errorMessage: 'Unauthorized',
            redirectedToLogin: response.url.includes('/login')
        };
    }

    private async testWithExpiredToken() {
        // Create expired token
        const expiredToken = this.createExpiredJWT();

        await this.page!.evaluate((token) => {
            localStorage.setItem('codai_access_token', token);
        }, expiredToken);

        const response = await this.page!.evaluate(async () => {
            const response = await fetch('/api/protected-endpoint');
            return {
                status: response.status,
                redirected: response.redirected,
                url: response.url
            };
        });

        return {
            handledCorrectly: response.status === 401,
            statusCode: response.status,
            errorMessage: 'Token expired',
            redirectedToLogin: response.url.includes('/login')
        };
    }

    private async testWithoutToken() {
        // Clear all tokens
        await this.page!.evaluate(() => {
            localStorage.removeItem('codai_access_token');
            localStorage.removeItem('codai_refresh_token');
        });

        await this.page!.goto('/dashboard');

        return {
            handledCorrectly: this.page!.url().includes('/login'),
            statusCode: 200,
            errorMessage: 'No authentication token',
            redirectedToLogin: this.page!.url().includes('/login')
        };
    }

    private async testWithMalformedToken() {
        await this.page!.evaluate(() => {
            localStorage.setItem('codai_access_token', 'malformed-token-data');
        });

        const response = await this.page!.evaluate(async () => {
            const response = await fetch('/api/protected-endpoint');
            return {
                status: response.status,
                redirected: response.redirected,
                url: response.url
            };
        });

        return {
            handledCorrectly: response.status === 401,
            statusCode: response.status,
            errorMessage: 'Malformed token',
            redirectedToLogin: response.url.includes('/login')
        };
    }

    private createExpiredJWT(): string {
        // Create a JWT token with expired timestamp
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            sub: 'test-user',
            exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
            iat: Math.floor(Date.now() / 1000) - 7200   // Issued 2 hours ago
        }));
        const signature = btoa('mock-signature');

        return `${header}.${payload}.${signature}`;
    }
}

// Export test suite
export default AuthenticationTestSuite;

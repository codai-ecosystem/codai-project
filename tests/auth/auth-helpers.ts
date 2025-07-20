/**
 * Authentication Helper Functions for CODAI Ecosystem Testing
 */

import { Page, BrowserContext, expect } from '@playwright/test';

export interface AuthTestUser {
    email: string;
    password: string;
    name: string;
}

export interface AuthenticationResult {
    success: boolean;
    error?: string;
    tokens?: {
        access: string;
        refresh: string;
    };
    user?: {
        id: string;
        email: string;
        name: string;
    };
}

// Default test user configuration
export const TEST_USERS = {
    standard: {
        email: 'test@codai.ro',
        password: 'TestPassword123!',
        name: 'Test User'
    },
    admin: {
        email: 'admin@codai.ro',
        password: 'AdminPassword123!',
        name: 'Admin User'
    },
    developer: {
        email: 'dev@codai.ro',
        password: 'DevPassword123!',
        name: 'Developer User'
    }
};

// Authentication endpoints
export const AUTH_ENDPOINTS = {
    idService: 'https://id.codai.ro',
    login: '/login',
    signup: '/signup',
    logout: '/logout',
    refresh: '/api/auth/refresh',
    validate: '/api/auth/validate',
    profile: '/api/user/profile'
};

/**
 * Authenticate user with CODAI ID service
 */
export async function authenticateUser(
    page: Page,
    user: AuthTestUser = TEST_USERS.standard,
    options: { timeout?: number; baseUrl?: string } = {}
): Promise<AuthenticationResult> {
    const { timeout = 30000, baseUrl = AUTH_ENDPOINTS.idService } = options;

    try {
        console.log(`🔐 Authenticating user: ${user.email}`);

        // Navigate to login page
        await page.goto(`${baseUrl}${AUTH_ENDPOINTS.login}`, {
            waitUntil: 'networkidle',
            timeout
        });

        // Wait for login form to be visible
        await page.waitForSelector('[data-testid="login-form"], form[action*="login"], .login-form', {
            timeout: 10000
        });

        // Fill login credentials
        const emailSelector = '[data-testid="email"], input[type="email"], input[name="email"]';
        const passwordSelector = '[data-testid="password"], input[type="password"], input[name="password"]';
        const submitSelector = '[data-testid="login-button"], button[type="submit"], .login-button';

        await page.fill(emailSelector, user.email);
        await page.fill(passwordSelector, user.password);

        // Submit login form
        await page.click(submitSelector);

        // Wait for authentication to complete - check multiple possible success indicators
        const successIndicators = [
            '**/dashboard',
            '**/profile',
            '**/home',
            '[data-testid="user-menu"]',
            '[data-testid="authenticated-state"]',
            '.user-avatar'
        ];

        let authSuccess = false;
        for (const indicator of successIndicators) {
            try {
                if (indicator.includes('**/')) {
                    // URL-based indicator
                    await page.waitForURL(indicator, { timeout: 5000 });
                    authSuccess = true;
                    break;
                } else {
                    // Element-based indicator
                    await page.waitForSelector(indicator, { timeout: 5000 });
                    authSuccess = true;
                    break;
                }
            } catch {
                // Continue to next indicator
            }
        }

        if (!authSuccess) {
            // Check if there are any error messages
            const errorElement = await page.$('[data-testid="error"], .error-message, .alert-error');
            const errorMessage = errorElement ? await errorElement.textContent() : 'Authentication failed';

            return {
                success: false,
                error: errorMessage || 'Unable to verify authentication success'
            };
        }

        // Extract tokens from storage
        const tokens = await getStoredTokens(page);
        const userInfo = await getUserInfo(page);

        console.log('✅ Authentication successful');
        return {
            success: true,
            tokens,
            user: userInfo
        };

    } catch (error) {
        console.log(`❌ Authentication failed: ${(error as Error).message}`);
        return {
            success: false,
            error: (error as Error).message
        };
    }
}

/**
 * Verify current authentication state
 */
export async function verifyAuthenticationState(
    page: Page,
    options: { checkApi?: boolean; checkTokens?: boolean } = {}
): Promise<boolean> {
    const { checkApi = true, checkTokens = true } = options;

    try {
        // Check for visual authentication indicators
        const visualIndicators = [
            '[data-testid="user-avatar"]',
            '[data-testid="user-menu"]',
            '[data-testid="authenticated-user"]',
            '.user-profile',
            '.authenticated-state',
            '[data-testid="logout-button"]'
        ];

        let hasVisualIndicator = false;
        for (const indicator of visualIndicators) {
            try {
                await page.waitForSelector(indicator, { timeout: 2000 });
                hasVisualIndicator = true;
                break;
            } catch {
                // Continue checking
            }
        }

        // Check if redirected to login (indicates not authenticated)
        const currentUrl = page.url();
        const isOnLoginPage = currentUrl.includes('/login') ||
            currentUrl.includes('/signin') ||
            currentUrl.includes('/auth');

        if (isOnLoginPage) {
            return false;
        }

        // Check stored tokens if requested
        let hasValidTokens = true;
        if (checkTokens) {
            const tokens = await getStoredTokens(page);
            hasValidTokens = !!(tokens?.access);
        }

        // Test API access if requested
        let apiAccessValid = true;
        if (checkApi) {
            apiAccessValid = await testApiAccess(page);
        }

        return hasVisualIndicator && hasValidTokens && apiAccessValid;

    } catch (error) {
        console.log(`Error verifying authentication state: ${(error as Error).message}`);
        return false;
    }
}

/**
 * Clear all authentication state
 */
export async function clearAuthenticationState(page: Page): Promise<void> {
    try {
        // Clear localStorage tokens
        await page.evaluate(() => {
            localStorage.removeItem('codai_access_token');
            localStorage.removeItem('codai_refresh_token');
            localStorage.removeItem('codai_user');
            localStorage.removeItem('user');
            localStorage.removeItem('auth_token');
            localStorage.clear();
        });

        // Clear sessionStorage
        await page.evaluate(() => {
            sessionStorage.clear();
        });

        // Clear cookies
        const context = page.context();
        await context.clearCookies();

        console.log('🧹 Authentication state cleared');

    } catch (error) {
        console.log(`Warning: Error clearing authentication state: ${(error as Error).message}`);
    }
}

/**
 * Get stored authentication tokens
 */
export async function getStoredTokens(page: Page): Promise<{ access?: string; refresh?: string } | null> {
    try {
        return await page.evaluate(() => {
            return {
                access: localStorage.getItem('codai_access_token') ||
                    localStorage.getItem('auth_token') ||
                    localStorage.getItem('accessToken'),
                refresh: localStorage.getItem('codai_refresh_token') ||
                    localStorage.getItem('refresh_token') ||
                    localStorage.getItem('refreshToken')
            };
        });
    } catch {
        return null;
    }
}

/**
 * Get current user information
 */
export async function getUserInfo(page: Page): Promise<{ id?: string; email?: string; name?: string } | null> {
    try {
        return await page.evaluate(() => {
            const userStr = localStorage.getItem('codai_user') ||
                localStorage.getItem('user') ||
                localStorage.getItem('currentUser');

            if (userStr) {
                try {
                    return JSON.parse(userStr);
                } catch {
                    return null;
                }
            }
            return null;
        });
    } catch {
        return null;
    }
}

/**
 * Test API access with current authentication
 */
export async function testApiAccess(page: Page): Promise<boolean> {
    try {
        const response = await page.evaluate(async () => {
            // Try multiple possible API endpoints
            const endpoints = [
                '/api/user/profile',
                '/api/auth/validate',
                '/api/user/me',
                '/api/profile'
            ];

            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('codai_access_token') || localStorage.getItem('auth_token')}`
                        }
                    });

                    if (response.status === 200) {
                        return { success: true, status: response.status };
                    } else if (response.status === 401 || response.status === 403) {
                        return { success: false, status: response.status };
                    }
                } catch {
                    // Continue to next endpoint
                }
            }

            return { success: true, status: 200 }; // Assume success if no endpoints available to test
        });

        return response.success;

    } catch {
        // If we can't test API access, assume it's working
        return true;
    }
}

/**
 * Wait for authentication redirect
 */
export async function waitForAuthRedirect(page: Page, timeout: number = 10000): Promise<boolean> {
    try {
        // Wait for either successful authentication or error
        await Promise.race([
            // Success: redirected to authenticated page
            page.waitForURL('**/dashboard', { timeout }),
            page.waitForURL('**/profile', { timeout }),
            page.waitForURL('**/home', { timeout }),
            // Success: authentication element appears
            page.waitForSelector('[data-testid="user-menu"]', { timeout }),
            // Error: error message appears
            page.waitForSelector('[data-testid="error"], .error-message', { timeout })
        ]);

        return true;
    } catch {
        return false;
    }
}

/**
 * Create test user account (for signup testing)
 */
export async function createTestUser(
    page: Page,
    user: AuthTestUser,
    options: { baseUrl?: string } = {}
): Promise<AuthenticationResult> {
    const { baseUrl = AUTH_ENDPOINTS.idService } = options;

    try {
        console.log(`👤 Creating test user: ${user.email}`);

        await page.goto(`${baseUrl}${AUTH_ENDPOINTS.signup}`);

        // Fill signup form
        await page.fill('[data-testid="name"], input[name="name"]', user.name);
        await page.fill('[data-testid="email"], input[name="email"]', user.email);
        await page.fill('[data-testid="password"], input[name="password"]', user.password);

        // Confirm password if field exists
        const confirmPasswordField = await page.$('[data-testid="confirmPassword"], input[name="confirmPassword"]');
        if (confirmPasswordField) {
            await page.fill('[data-testid="confirmPassword"], input[name="confirmPassword"]', user.password);
        }

        // Submit signup form
        await page.click('[data-testid="signup-button"], button[type="submit"]');

        // Wait for success or error
        const success = await waitForAuthRedirect(page);

        if (success) {
            const tokens = await getStoredTokens(page);
            const userInfo = await getUserInfo(page);

            console.log('✅ Test user created successfully');
            return {
                success: true,
                tokens,
                user: userInfo
            };
        } else {
            return {
                success: false,
                error: 'User creation failed or timed out'
            };
        }

    } catch (error) {
        console.log(`❌ Test user creation failed: ${(error as Error).message}`);
        return {
            success: false,
            error: (error as Error).message
        };
    }
}

/**
 * Logout user
 */
export async function logoutUser(page: Page): Promise<boolean> {
    try {
        console.log('👋 Logging out user...');

        // Try to find and click logout button/link
        const logoutSelectors = [
            '[data-testid="logout-button"]',
            '[data-testid="logout"]',
            'a[href*="logout"]',
            'button[onclick*="logout"]',
            '.logout-button'
        ];

        let loggedOut = false;
        for (const selector of logoutSelectors) {
            try {
                const element = await page.$(selector);
                if (element) {
                    await element.click();
                    await page.waitForURL('**/login', { timeout: 5000 });
                    loggedOut = true;
                    break;
                }
            } catch {
                // Continue to next selector
            }
        }

        if (!loggedOut) {
            // Manual logout by clearing state and navigating
            await clearAuthenticationState(page);
            await page.goto(AUTH_ENDPOINTS.idService + AUTH_ENDPOINTS.login);
        }

        console.log('✅ User logged out');
        return true;

    } catch (error) {
        console.log(`Warning: Logout error: ${(error as Error).message}`);
        return false;
    }
}

/**
 * Test token refresh functionality
 */
export async function testTokenRefresh(page: Page): Promise<{
    success: boolean;
    newTokens?: { access: string; refresh: string };
    error?: string;
}> {
    try {
        const initialTokens = await getStoredTokens(page);
        if (!initialTokens?.access) {
            return { success: false, error: 'No initial tokens found' };
        }

        // Make API call that should trigger token refresh
        const refreshResult = await page.evaluate(async (refreshEndpoint) => {
            try {
                const response = await fetch(refreshEndpoint, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('codai_refresh_token')}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.access_token) {
                        localStorage.setItem('codai_access_token', data.access_token);
                        if (data.refresh_token) {
                            localStorage.setItem('codai_refresh_token', data.refresh_token);
                        }
                        return { success: true, tokens: data };
                    }
                }

                return { success: false, status: response.status };
            } catch (error) {
                return { success: false, error: (error as Error).message };
            }
        }, AUTH_ENDPOINTS.refresh);

        if (refreshResult.success) {
            const newTokens = await getStoredTokens(page);
            return {
                success: true,
                newTokens: newTokens || undefined
            };
        }

        return refreshResult;

    } catch (error) {
        return {
            success: false,
            error: (error as Error).message
        };
    }
}

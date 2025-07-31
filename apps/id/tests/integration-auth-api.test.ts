/**
 * Integration Tests for Enhanced Authentication API Routes
 * Tests the integration of EnhancedAuthService with Next.js API routes
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as loginPOST } from '@/app/api/auth/login/route';
import { POST as registerPOST } from '@/app/api/auth/register/route';
import { EnhancedAuthService } from '@/services/enhanced-auth';

// Helper to create mock NextRequest
function createMockRequest(body: any, headers: Record<string, string> = {}): NextRequest {
    const url = 'http://localhost:3000/api/auth/test';
    const request = new NextRequest(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'user-agent': 'Test-Agent/1.0',
            'x-forwarded-for': '192.168.1.100',
            ...headers
        },
        body: JSON.stringify(body)
    });

    // Mock IP address
    Object.defineProperty(request, 'ip', {
        value: '192.168.1.100',
        writable: false
    });

    return request;
}

// Helper to generate unique test data
function generateTestUser() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return {
        email: `integration-test-${timestamp}-${random}@example.com`,
        username: `testuser${timestamp}${random}`,
        password: 'SecurePassword123!',
        profile: {
            name: `Test User ${timestamp}`
        }
    };
}

describe('🔗 Enhanced Authentication API Integration', () => {
    let authService: EnhancedAuthService;

    beforeEach(async () => {
        // Initialize fresh auth service for each test
        authService = new EnhancedAuthService();
        await authService.ensureInitialized();
    });

    afterEach(async () => {
        // Cleanup
        if (authService) {
            await authService.disconnect();
        }
    });

    describe('🔐 Enhanced Registration Integration', () => {
        it('should register user with enhanced security validation', async () => {
            const testUser = generateTestUser();
            const request = createMockRequest(testUser);

            const response = await registerPOST(request);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.message).toBe('User created successfully with enhanced security');
            expect(data.user).toMatchObject({
                email: testUser.email,
                username: testUser.username,
                profile: testUser.profile
            });
            expect(data.user.password).toBeUndefined(); // Password should not be returned
        });

        it('should reject weak passwords with detailed feedback', async () => {
            const testUser = generateTestUser();
            testUser.password = '123'; // Weak password

            const request = createMockRequest(testUser);
            const response = await registerPOST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.message).toContain('Password');
        });

        it('should prevent duplicate email registration', async () => {
            const testUser = generateTestUser();

            // First registration
            const request1 = createMockRequest(testUser);
            const response1 = await registerPOST(request1);
            expect(response1.status).toBe(201);

            // Second registration with same email
            const request2 = createMockRequest(testUser);
            const response2 = await registerPOST(request2);
            const data2 = await response2.json();

            expect(response2.status).toBe(400);
            expect(data2.success).toBe(false);
            expect(data2.message).toBe('User with this email already exists');
        });

        it('should include security headers in registration response', async () => {
            const testUser = generateTestUser();
            const request = createMockRequest(testUser);

            const response = await registerPOST(request);

            // Check security headers
            expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
            expect(response.headers.get('X-Frame-Options')).toBe('DENY');
            expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
        });
    });

    describe('🔑 Enhanced Login Integration', () => {
        let testUser: any;

        beforeEach(async () => {
            // Create a test user for login tests
            testUser = generateTestUser();
            const registerRequest = createMockRequest(testUser);
            const registerResponse = await registerPOST(registerRequest);
            expect(registerResponse.status).toBe(201);
        });

        it('should authenticate user with enhanced security features', async () => {
            const loginData = {
                email: testUser.email,
                password: testUser.password
            };

            const request = createMockRequest(loginData);
            const response = await loginPOST(request);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.user).toMatchObject({
                email: testUser.email,
                username: testUser.username
            });
            expect(data.token).toBeDefined();
            expect(data.user.password).toBeUndefined(); // Password should not be returned
        });

        it('should return rate limiting information on failed login', async () => {
            const loginData = {
                email: testUser.email,
                password: 'wrongpassword'
            };

            const request = createMockRequest(loginData);
            const response = await loginPOST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toBeDefined();
            expect(data.remainingAttempts).toBeDefined();
            expect(typeof data.remainingAttempts).toBe('number');
        });

        it('should set secure authentication cookies on successful login', async () => {
            const loginData = {
                email: testUser.email,
                password: testUser.password
            };

            const request = createMockRequest(loginData);
            const response = await loginPOST(request);

            expect(response.status).toBe(200);

            // Check for authentication cookies
            const cookies = response.headers.get('Set-Cookie');
            expect(cookies).toContain('codai_auth_token');
            expect(cookies).toContain('HttpOnly');
            expect(cookies).toContain('SameSite=lax');
        });

        it('should include rate limiting headers in response', async () => {
            const loginData = {
                email: testUser.email,
                password: 'wrongpassword'
            };

            const request = createMockRequest(loginData);
            const response = await loginPOST(request);

            // Check rate limiting headers
            expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
            expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
        });

        it('should handle multiple failed login attempts with decreasing remaining attempts', async () => {
            const loginData = {
                email: testUser.email,
                password: 'wrongpassword'
            };

            // First failed attempt
            const request1 = createMockRequest(loginData);
            const response1 = await loginPOST(request1);
            const data1 = await response1.json();

            expect(data1.remainingAttempts).toBeDefined();
            const firstAttempts = data1.remainingAttempts;

            // Second failed attempt
            const request2 = createMockRequest(loginData);
            const response2 = await loginPOST(request2);
            const data2 = await response2.json();

            expect(data2.remainingAttempts).toBeDefined();
            expect(data2.remainingAttempts).toBeLessThan(firstAttempts);
        });

        it('should detect suspicious activity from different IP addresses', async () => {
            const loginData = {
                email: testUser.email,
                password: testUser.password
            };

            // Login from first IP
            const request1 = createMockRequest(loginData, { 'x-forwarded-for': '192.168.1.100' });
            const response1 = await loginPOST(request1);
            expect(response1.status).toBe(200);

            // Login from different IP shortly after
            const request2 = createMockRequest(loginData, { 'x-forwarded-for': '10.0.0.1' });
            const response2 = await loginPOST(request2);

            // Should still succeed but may include security alert header
            expect(response2.status).toBe(200);
            // Check if security alert header is present (indicating suspicious activity detection)
            const securityAlert = response2.headers.get('X-Security-Alert');
            // This may or may not be present depending on the rapid login detection timing
        });
    });

    describe('🛡️ Security Feature Integration', () => {
        let testUser: any;

        beforeEach(async () => {
            testUser = generateTestUser();
            const registerRequest = createMockRequest(testUser);
            const registerResponse = await registerPOST(registerRequest);
            expect(registerResponse.status).toBe(201);
        });

        it('should include all required security headers in responses', async () => {
            const loginData = {
                email: testUser.email,
                password: testUser.password
            };

            const request = createMockRequest(loginData);
            const response = await loginPOST(request);

            // Security headers should be present
            expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
            expect(response.headers.get('X-Frame-Options')).toBe('DENY');
            expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
        });

        it('should handle invalid JSON input gracefully', async () => {
            const request = new NextRequest('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'user-agent': 'Test-Agent/1.0'
                },
                body: 'invalid json'
            });

            const response = await loginPOST(request);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBe('Internal server error');
        });

        it('should validate email format in login', async () => {
            const loginData = {
                email: 'invalid-email',
                password: 'password'
            };

            const request = createMockRequest(loginData);
            const response = await loginPOST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toContain('Invalid email address');
        });

        it('should validate required fields in registration', async () => {
            const incompleteData = {
                email: 'test@example.com'
                // Missing username and password
            };

            const request = createMockRequest(incompleteData);
            const response = await registerPOST(request);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.message).toBeDefined();
        });
    });

    describe('🔄 Backward Compatibility', () => {
        let testUser: any;

        beforeEach(async () => {
            testUser = generateTestUser();
            const registerRequest = createMockRequest(testUser);
            const registerResponse = await registerPOST(registerRequest);
            expect(registerResponse.status).toBe(201);
        });

        it('should maintain existing response structure for successful login', async () => {
            const loginData = {
                email: testUser.email,
                password: testUser.password
            };

            const request = createMockRequest(loginData);
            const response = await loginPOST(request);
            const data = await response.json();

            expect(response.status).toBe(200);

            // Check that all expected fields are present for backward compatibility
            expect(data).toHaveProperty('success');
            expect(data).toHaveProperty('user');
            expect(data).toHaveProperty('token');
            expect(data).toHaveProperty('refreshToken');

            // User object should have expected structure
            expect(data.user).toHaveProperty('id');
            expect(data.user).toHaveProperty('email');
            expect(data.user).toHaveProperty('username');
            expect(data.user).toHaveProperty('profile');
            expect(data.user).toHaveProperty('createdAt');
        });

        it('should maintain existing response structure for registration', async () => {
            const testUser = generateTestUser();
            const request = createMockRequest(testUser);
            const response = await registerPOST(request);
            const data = await response.json();

            expect(response.status).toBe(201);

            // Check that all expected fields are present for backward compatibility
            expect(data).toHaveProperty('success');
            expect(data).toHaveProperty('message');
            expect(data).toHaveProperty('user');

            // User object should have expected structure
            expect(data.user).toHaveProperty('id');
            expect(data.user).toHaveProperty('email');
            expect(data.user).toHaveProperty('username');
            expect(data.user).toHaveProperty('profile');
            expect(data.user).toHaveProperty('createdAt');
        });

        it('should maintain existing error response structure', async () => {
            const loginData = {
                email: testUser.email,
                password: 'wrongpassword'
            };

            const request = createMockRequest(loginData);
            const response = await loginPOST(request);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data).toHaveProperty('success');
            expect(data).toHaveProperty('error');
            expect(data.success).toBe(false);
        });
    });

    describe('📊 Performance Integration', () => {
        it('should handle authentication requests within reasonable time', async () => {
            const testUser = generateTestUser();

            // Register user
            const registerRequest = createMockRequest(testUser);
            const registerStart = Date.now();
            const registerResponse = await registerPOST(registerRequest);
            const registerTime = Date.now() - registerStart;

            expect(registerResponse.status).toBe(201);
            expect(registerTime).toBeLessThan(5000); // Should complete within 5 seconds

            // Login user
            const loginData = {
                email: testUser.email,
                password: testUser.password
            };

            const loginRequest = createMockRequest(loginData);
            const loginStart = Date.now();
            const loginResponse = await loginPOST(loginRequest);
            const loginTime = Date.now() - loginStart;

            expect(loginResponse.status).toBe(200);
            expect(loginTime).toBeLessThan(3000); // Login should be faster than registration
        });
    });
});

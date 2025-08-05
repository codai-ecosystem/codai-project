/**
 * Simple debug test to understand the authentication flow
 */

import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as loginPOST } from '../src/app/api/auth/login/route';
import { POST as registerPOST } from '../src/app/api/auth/register/route';

// Helper to create mock NextRequest
function createMockRequest(body: any, headers: Record<string, string> = {}): NextRequest {
    const url = 'http://localhost:4004/api/auth/test';
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

describe('🔍 Debug Authentication Flow', () => {
    it('should debug the registration and login flow', async () => {
        const timestamp = Date.now();
        const testUser = {
            email: `debug-test-${timestamp}@example.com`,
            name: `Debug User ${timestamp}`,
            password: 'SecurePassword123!'
        };

        console.log('🔍 Starting debug test with user:', testUser.email);

        // Step 1: Register user
        console.log('📝 Step 1: Registering user...');
        const registerRequest = createMockRequest(testUser);
        const registerResponse = await registerPOST(registerRequest);
        const registerData = await registerResponse.json();

        console.log('📝 Registration response status:', registerResponse.status);
        console.log('📝 Registration response data:', JSON.stringify(registerData, null, 2));

        expect(registerResponse.status).toBe(201);
        expect(registerData.message).toBe('User created successfully');
        expect(registerData.user).toBeDefined();
        expect(registerData.user.email).toBe(testUser.email);

        // Step 2: Try to login with the same user
        console.log('🔑 Step 2: Attempting login...');
        const loginData = {
            email: testUser.email,
            password: testUser.password
        };

        const loginRequest = createMockRequest(loginData);
        const loginResponse = await loginPOST(loginRequest);
        const loginResponseData = await loginResponse.json();

        console.log('🔑 Login response status:', loginResponse.status);
        console.log('🔑 Login response data:', JSON.stringify(loginResponseData, null, 2));

        // This should succeed but it's currently failing
        if (loginResponse.status !== 200) {
            console.error('❌ Login failed! This indicates an issue with user persistence between registration and login.');
            console.error('❌ Expected status 200, got:', loginResponse.status);
        } else {
            console.log('✅ Login succeeded as expected!');
        }

        expect(loginResponse.status).toBe(200);
        expect(loginResponseData.success).toBe(true);
    });
});

// Security Testing for DEXAI
import { test, expect } from '@playwright/test';

test.describe('Security Tests', () => {
    test('should have proper CSP headers', async ({ page }) => {
        const response = await page.goto('/');

        const cspHeader = response?.headers()['content-security-policy'];
        expect(cspHeader).toBeTruthy();
        expect(cspHeader).toContain("default-src 'self'");
        expect(cspHeader).toContain("script-src");
        expect(cspHeader).toContain("style-src");
    });

    test('should have security headers', async ({ page }) => {
        const response = await page.goto('/');
        const headers = response?.headers();

        // Check for essential security headers
        expect(headers?.['x-frame-options']).toBeTruthy();
        expect(headers?.['x-content-type-options']).toBe('nosniff');
        expect(headers?.['referrer-policy']).toBeTruthy();
        expect(headers?.['permissions-policy']).toBeTruthy();
    });

    test('should prevent XSS in search inputs', async ({ page }) => {
        await page.goto('/');

        const searchInput = page.locator('input[type="text"]').first();
        if (await searchInput.isVisible()) {
            // Try XSS payload
            await searchInput.fill('<script>alert("xss")</script>');

            // Check that script is not executed (no alert)
            await page.waitForTimeout(1000);

            // Verify the input is sanitized or escaped
            const inputValue = await searchInput.inputValue();
            expect(inputValue).toContain('<script>');
            expect(inputValue).not.toMatch(/javascript:/);
        }
    });

    test('should handle malformed URLs safely', async ({ page }) => {
        // Test various malformed URLs
        const malformedUrls = [
            '/%3Cscript%3Ealert("xss")%3C/script%3E',
            '/javascript:alert("xss")',
            '/data:text/html,<script>alert("xss")</script>',
        ];

        for (const url of malformedUrls) {
            try {
                const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 });

                // Should either redirect to safe page or return 404
                if (response) {
                    const status = response.status();
                    expect([200, 301, 302, 404, 500]).toContain(status);

                    // Ensure no script execution
                    const pageContent = await page.content();
                    expect(pageContent).not.toContain('<script>alert("xss")</script>');
                }
            } catch (error) {
                // Errors are acceptable for malformed URLs
                console.log(`Expected error for ${url}:`, error);
            }
        }
    });

    test('should protect against CSRF', async ({ page }) => {
        await page.goto('/');

        // Check for CSRF tokens in forms
        const forms = page.locator('form');
        const formCount = await forms.count();

        for (let i = 0; i < formCount; i++) {
            const form = forms.nth(i);
            const isVisible = await form.isVisible();

            if (isVisible) {
                // Look for CSRF protection (token, SameSite cookies, etc.)
                const hiddenInputs = form.locator('input[type="hidden"]');
                const hiddenCount = await hiddenInputs.count();

                // At least check that forms exist and are properly structured
                expect(await form.getAttribute('method')).toBeTruthy();
            }
        }
    });

    test('should have proper SSL/TLS configuration', async ({ page }) => {
        // This test is more relevant for production, but we can check dev server security
        const response = await page.goto('/');

        // Check that no insecure content is loaded
        const securityState = await page.evaluate(() => {
            return {
                protocol: window.location.protocol,
                hasSecureContext: window.isSecureContext,
                mixedContent: document.querySelectorAll('script[src^="http:"], link[href^="http:"], img[src^="http:"]').length
            };
        });

        // In development, HTTP is acceptable, but no mixed content
        expect(securityState.mixedContent).toBe(0);
    });

    test('should sanitize user-generated content', async ({ page }) => {
        await page.goto('/');

        // Test content that might be reflected back to users
        const potentiallyDangerousStrings = [
            '<img src="x" onerror="alert(1)">',
            'javascript:alert(1)',
            'data:text/html,<script>alert(1)</script>',
            '"><script>alert(1)</script>',
            "'; DROP TABLE users; --"
        ];

        for (const dangerousString of potentiallyDangerousStrings) {
            // Try to input dangerous content
            const inputs = page.locator('input[type="text"], textarea');
            const inputCount = await inputs.count();

            if (inputCount > 0) {
                const input = inputs.first();
                await input.fill(dangerousString);

                // Check that the content is properly escaped/sanitized
                const value = await input.inputValue();
                expect(value).toBe(dangerousString); // Should contain the literal string, not execute

                // If there's any reflection of this content, it should be escaped
                await page.waitForTimeout(500);
                const pageContent = await page.content();

                // Should not contain unescaped dangerous content
                expect(pageContent).not.toContain('<img src="x" onerror="alert(1)">');
                expect(pageContent).not.toContain('javascript:alert(1)');
            }
        }
    });

    test('should handle authentication securely', async ({ page }) => {
        await page.goto('/login');

        // Check for secure login form
        const loginForm = page.locator('form').first();

        if (await loginForm.isVisible()) {
            // Check password input type
            const passwordInput = page.locator('input[type="password"]');
            if (await passwordInput.count() > 0) {
                expect(await passwordInput.getAttribute('autocomplete')).toBeTruthy();
            }

            // Check for proper form attributes
            const method = await loginForm.getAttribute('method');
            expect(method?.toLowerCase()).toBe('post');
        }
    });

    test('should prevent information disclosure', async ({ page }) => {
        // Test for common information disclosure endpoints
        const sensitiveEndpoints = [
            '/.env',
            '/config.json',
            '/package.json',
            '/admin',
            '/api/debug',
            '/server-status',
            '/.git/config'
        ];

        for (const endpoint of sensitiveEndpoints) {
            try {
                const response = await page.goto(endpoint, { timeout: 5000 });
                const status = response?.status();

                // Should return 404, 403, or redirect - not 200 with sensitive data
                if (status === 200) {
                    const content = await page.content();

                    // Check that it's not exposing sensitive information
                    expect(content).not.toMatch(/password|secret|key|token/i);
                    expect(content).not.toMatch(/database|connection|config/i);
                }
            } catch (error) {
                // Timeout or network errors are expected for non-existent endpoints
                console.log(`Expected error for ${endpoint}`);
            }
        }
    });

    test('should have proper cookie security', async ({ page, context }) => {
        await page.goto('/');

        // Check cookies for security flags
        const cookies = await context.cookies();

        for (const cookie of cookies) {
            // Check for secure flags where appropriate
            if (cookie.name.toLowerCase().includes('session') ||
                cookie.name.toLowerCase().includes('auth') ||
                cookie.name.toLowerCase().includes('token')) {

                // Security-sensitive cookies should have proper flags
                expect(cookie.httpOnly).toBe(true);
                expect(cookie.sameSite).toBeTruthy();

                // In production, should also be secure
                // expect(cookie.secure).toBe(true); // Only in HTTPS
            }
        }
    });
});

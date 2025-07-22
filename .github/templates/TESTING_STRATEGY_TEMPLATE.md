# 🧪 TESTING STRATEGY TEMPLATE

**Component**: [COMPONENT_NAME]  
**Testing Type**: [Unit | Integration | E2E | Performance | Security]  
**Framework**: [Jest | Vitest | Playwright | Cypress | Other]  
**Coverage Target**: [X]%  
**Last Updated**: [Date]  
**Test Environment**: [Local | CI/CD | Staging | Production-like]

---

## 🎯 Testing Overview

[Brief description of the testing strategy and objectives]

### Testing Scope:
- ✅ [Feature/Component 1]
- ✅ [Feature/Component 2]
- ✅ [Feature/Component 3]

### Quality Gates:
- [ ] [X]% code coverage
- [ ] [Y]% test pass rate
- [ ] Zero critical vulnerabilities
- [ ] Performance benchmarks met

---

## 🔧 Testing Setup

### Prerequisites:
```bash
# Install testing dependencies
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  vitest \
  @vitest/ui \
  jsdom
```

### Configuration Files:

#### Vitest Configuration:
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
      ],
      thresholds: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80
        }
      }
    }
  }
});
```

#### Jest Configuration (Alternative):
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
};
```

#### Test Setup:
```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock console methods in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.API_URL = 'http://localhost:3001';
```

---

## 🧪 Unit Testing

### Component Testing Example:
```typescript
// src/components/Button/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies correct CSS classes', () => {
    render(<Button variant="primary" size="large">Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveClass('btn', 'btn-primary', 'btn-large');
  });

  it('renders as disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Button</Button>);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
```

### Hook Testing Example:
```typescript
// src/hooks/useCounter/useCounter.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCounter } from './useCounter';

describe('useCounter Hook', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('initializes with custom initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it('increments count', () => {
    const { result } = renderHook(() => useCounter());
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });

  it('decrements count', () => {
    const { result } = renderHook(() => useCounter(5));
    
    act(() => {
      result.current.decrement();
    });
    
    expect(result.current.count).toBe(4);
  });

  it('resets count to initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    
    act(() => {
      result.current.increment();
      result.current.increment();
      result.current.reset();
    });
    
    expect(result.current.count).toBe(10);
  });
});
```

### Utility Function Testing:
```typescript
// src/utils/validation/validation.test.ts
import { describe, it, expect } from 'vitest';
import { validateEmail, validatePassword, sanitizeInput } from './validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('validates correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ];
      
      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('rejects invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user..name@example.com'
      ];
      
      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      const strongPasswords = [
        'StrongP@ssw0rd!',
        'MySecure123$',
        'C0mplex_P@ss'
      ];
      
      strongPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(true);
      });
    });

    it('rejects weak passwords', () => {
      const weakPasswords = [
        'password',
        '123456',
        'short',
        'NoNumbersOrSpecialChars'
      ];
      
      weakPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(false);
      });
    });
  });
});
```

---

## 🔗 Integration Testing

### API Integration Tests:
```typescript
// src/api/users/users.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../app';
import { setupTestDB, teardownTestDB } from '../../test/db-setup';

describe('Users API Integration', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  describe('POST /api/users', () => {
    it('creates a new user with valid data', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body).toEqual({
        id: expect.any(String),
        name: userData.name,
        email: userData.email,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });

      expect(response.body.password).toBeUndefined();
    });

    it('returns validation errors for invalid data', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: '123'
      };

      const response = await request(app)
        .post('/api/users')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toEqual([
        { field: 'name', message: 'Name is required' },
        { field: 'email', message: 'Invalid email format' },
        { field: 'password', message: 'Password must be at least 8 characters' }
      ]);
    });
  });

  describe('GET /api/users/:id', () => {
    it('returns user data for valid ID', async () => {
      // Create test user
      const createResponse = await request(app)
        .post('/api/users')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'TestPass123!'
        });

      const userId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/users/${userId}`)
        .expect(200);

      expect(response.body).toEqual({
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });
    });

    it('returns 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/non-existent-id')
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });
  });
});
```

### Database Integration Tests:
```typescript
// src/repositories/UserRepository.integration.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UserRepository } from './UserRepository';
import { User } from '../entities/User';
import { getTestConnection, cleanupTestDB } from '../../test/db-helpers';

describe('UserRepository Integration', () => {
  let userRepository: UserRepository;
  let connection: any;

  beforeEach(async () => {
    connection = await getTestConnection();
    userRepository = new UserRepository(connection);
  });

  afterEach(async () => {
    await cleanupTestDB(connection);
    await connection.close();
  });

  it('creates and retrieves a user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedpassword'
    };

    const createdUser = await userRepository.create(userData);
    expect(createdUser.id).toBeDefined();
    expect(createdUser.name).toBe(userData.name);

    const retrievedUser = await userRepository.findById(createdUser.id);
    expect(retrievedUser).toEqual(createdUser);
  });

  it('finds users by email', async () => {
    await userRepository.create({
      name: 'User 1',
      email: 'user1@example.com',
      password: 'password1'
    });

    const user = await userRepository.findByEmail('user1@example.com');
    expect(user).toBeDefined();
    expect(user!.email).toBe('user1@example.com');
  });

  it('updates user data', async () => {
    const user = await userRepository.create({
      name: 'Original Name',
      email: 'original@example.com',
      password: 'password'
    });

    const updatedUser = await userRepository.update(user.id, {
      name: 'Updated Name'
    });

    expect(updatedUser.name).toBe('Updated Name');
    expect(updatedUser.email).toBe('original@example.com');
  });

  it('deletes users', async () => {
    const user = await userRepository.create({
      name: 'To Delete',
      email: 'delete@example.com',
      password: 'password'
    });

    await userRepository.delete(user.id);

    const deletedUser = await userRepository.findById(user.id);
    expect(deletedUser).toBeNull();
  });
});
```

---

## 🌍 End-to-End Testing

### Playwright E2E Tests:
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('user can sign up, log in, and log out', async ({ page }) => {
    // Navigation to signup
    await page.goto('/signup');
    await expect(page).toHaveTitle(/Sign Up/);

    // Fill signup form
    await page.fill('[data-testid="name-input"]', 'John Doe');
    await page.fill('[data-testid="email-input"]', 'john@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePass123!');

    // Submit signup
    await page.click('[data-testid="signup-button"]');

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome, John Doe');

    // Log out
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Verify redirect to home
    await expect(page).toHaveURL('/');

    // Log in again
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'john@example.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.click('[data-testid="login-button"]');

    // Verify successful login
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-name"]')).toContainText('John Doe');
  });

  test('displays validation errors for invalid signup data', async ({ page }) => {
    await page.goto('/signup');

    // Submit empty form
    await page.click('[data-testid="signup-button"]');

    // Check validation errors
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();

    // Fill invalid email
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.blur('[data-testid="email-input"]');
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Invalid email format');

    // Fill weak password
    await page.fill('[data-testid="password-input"]', '123');
    await page.blur('[data-testid="password-input"]');
    await expect(page.locator('[data-testid="password-error"]')).toContainText('Password must be at least 8 characters');
  });
});
```

### User Journey Tests:
```typescript
// tests/e2e/user-journey.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('user creates account, manages profile, and performs key actions', async ({ page }) => {
    // Step 1: Account Creation
    await page.goto('/signup');
    await page.fill('[data-testid="name-input"]', 'Test User');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPass123!');
    await page.fill('[data-testid="confirm-password-input"]', 'TestPass123!');
    await page.click('[data-testid="signup-button"]');

    // Step 2: Onboarding Flow
    await expect(page.locator('[data-testid="onboarding-welcome"]')).toBeVisible();
    await page.click('[data-testid="continue-button"]');

    // Complete profile setup
    await page.fill('[data-testid="company-input"]', 'Test Company');
    await page.selectOption('[data-testid="role-select"]', 'Developer');
    await page.click('[data-testid="save-profile-button"]');

    // Step 3: Dashboard Navigation
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="dashboard-stats"]')).toBeVisible();

    // Step 4: Create First Project
    await page.click('[data-testid="create-project-button"]');
    await page.fill('[data-testid="project-name-input"]', 'My Test Project');
    await page.fill('[data-testid="project-description-input"]', 'A test project for E2E testing');
    await page.click('[data-testid="create-button"]');

    // Verify project creation
    await expect(page.locator('[data-testid="project-title"]')).toContainText('My Test Project');

    // Step 5: Project Management
    await page.click('[data-testid="add-task-button"]');
    await page.fill('[data-testid="task-title-input"]', 'First Task');
    await page.click('[data-testid="save-task-button"]');

    await expect(page.locator('[data-testid="task-list"]')).toContainText('First Task');

    // Step 6: Settings Management
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="settings-link"]');

    await expect(page).toHaveURL('/settings');

    // Update profile
    await page.fill('[data-testid="display-name-input"]', 'Updated Test User');
    await page.click('[data-testid="save-settings-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});
```

---

## ⚡ Performance Testing

### Load Testing with Artillery:
```yaml
# performance/load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 5
      name: Warm up
    - duration: 120
      arrivalRate: 20
      name: Ramp up load
    - duration: 300
      arrivalRate: 50
      name: Sustained load
  processor: './performance/custom-functions.js'

scenarios:
  - name: 'API Performance Test'
    weight: 100
    flow:
      - post:
          url: '/api/auth/login'
          json:
            email: 'test@example.com'
            password: 'password123'
          capture:
            - json: '$.token'
              as: 'authToken'
      - get:
          url: '/api/users/profile'
          headers:
            Authorization: 'Bearer {{ authToken }}'
      - get:
          url: '/api/projects'
          headers:
            Authorization: 'Bearer {{ authToken }}'
      - post:
          url: '/api/projects'
          headers:
            Authorization: 'Bearer {{ authToken }}'
          json:
            name: 'Load Test Project {{ $randomString() }}'
            description: 'Created during load testing'
```

### Performance Test Results Analysis:
```javascript
// performance/analyze-results.js
const fs = require('fs');

function analyzeResults(reportPath) {
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  
  const metrics = {
    totalRequests: report.aggregate.counters['http.requests'],
    successfulRequests: report.aggregate.counters['http.responses'],
    failedRequests: report.aggregate.counters['http.request_rate'],
    averageResponseTime: report.aggregate.summaries['http.response_time'].mean,
    p95ResponseTime: report.aggregate.summaries['http.response_time'].p95,
    p99ResponseTime: report.aggregate.summaries['http.response_time'].p99,
    errorRate: (report.aggregate.counters['errors.ECONNREFUSED'] || 0) / report.aggregate.counters['http.requests'] * 100
  };

  console.log('Performance Test Results:');
  console.log(`Total Requests: ${metrics.totalRequests}`);
  console.log(`Success Rate: ${(metrics.successfulRequests / metrics.totalRequests * 100).toFixed(2)}%`);
  console.log(`Average Response Time: ${metrics.averageResponseTime.toFixed(2)}ms`);
  console.log(`95th Percentile: ${metrics.p95ResponseTime.toFixed(2)}ms`);
  console.log(`99th Percentile: ${metrics.p99ResponseTime.toFixed(2)}ms`);
  console.log(`Error Rate: ${metrics.errorRate.toFixed(2)}%`);

  // Performance assertions
  if (metrics.averageResponseTime > 500) {
    console.error('❌ Average response time exceeds 500ms threshold');
    process.exit(1);
  }

  if (metrics.p95ResponseTime > 1000) {
    console.error('❌ 95th percentile response time exceeds 1000ms threshold');
    process.exit(1);
  }

  if (metrics.errorRate > 1) {
    console.error('❌ Error rate exceeds 1% threshold');
    process.exit(1);
  }

  console.log('✅ All performance thresholds met');
}

analyzeResults('./performance/report.json');
```

### Browser Performance Testing:
```typescript
// tests/performance/page-performance.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Page Performance', () => {
  test('homepage loads within performance budgets', async ({ page }) => {
    // Start performance monitoring
    await page.goto('/');

    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics = {
            fcp: 0, // First Contentful Paint
            lcp: 0, // Largest Contentful Paint
            fid: 0, // First Input Delay
            cls: 0  // Cumulative Layout Shift
          };

          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              metrics.fcp = entry.startTime;
            }
          });

          // Get LCP
          new PerformanceObserver((lcpList) => {
            const lcpEntries = lcpList.getEntries();
            if (lcpEntries.length) {
              metrics.lcp = lcpEntries[lcpEntries.length - 1].startTime;
            }
            resolve(metrics);
          }).observe({ entryTypes: ['largest-contentful-paint'] });
        }).observe({ entryTypes: ['paint'] });
      });
    });

    const metrics = await performanceMetrics;

    // Performance assertions
    expect(metrics.fcp).toBeLessThan(2000); // FCP < 2s
    expect(metrics.lcp).toBeLessThan(4000); // LCP < 4s

    // Check bundle size
    const responsePromise = page.waitForResponse(resp => 
      resp.url().includes('.js') && resp.status() === 200
    );
    
    await page.goto('/');
    const response = await responsePromise;
    const contentLength = response.headers()['content-length'];
    
    if (contentLength) {
      const bundleSize = parseInt(contentLength);
      expect(bundleSize).toBeLessThan(500000); // < 500KB
    }
  });
});
```

---

## 🔒 Security Testing

### Security Test Suite:
```typescript
// tests/security/auth-security.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Security', () => {
  test('prevents brute force attacks', async ({ page, context }) => {
    await page.goto('/login');

    // Attempt multiple failed logins
    for (let i = 0; i < 5; i++) {
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'wrongpassword');
      await page.click('[data-testid="login-button"]');
      
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    }

    // Verify account lockout
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'correctpassword');
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('Account temporarily locked');
  });

  test('validates JWT token security', async ({ page, request }) => {
    // Login to get token
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'test@example.com',
        password: 'password123'
      }
    });

    const { token } = await loginResponse.json();

    // Test with valid token
    const validResponse = await request.get('/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    expect(validResponse.status()).toBe(200);

    // Test with invalid token
    const invalidResponse = await request.get('/api/users/profile', {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    expect(invalidResponse.status()).toBe(401);

    // Test with expired token (mock)
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
    
    const expiredResponse = await request.get('/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${expiredToken}`
      }
    });
    expect(expiredResponse.status()).toBe(401);
  });
});
```

### XSS Prevention Tests:
```typescript
// tests/security/xss-prevention.spec.ts
import { test, expect } from '@playwright/test';

test.describe('XSS Prevention', () => {
  test('sanitizes user input to prevent XSS attacks', async ({ page }) => {
    await page.goto('/profile');

    // Attempt to inject script via profile name
    const xssPayload = '<script>alert("XSS")</script>';
    
    await page.fill('[data-testid="name-input"]', xssPayload);
    await page.click('[data-testid="save-button"]');

    // Verify script is not executed
    const nameDisplay = await page.locator('[data-testid="name-display"]').textContent();
    expect(nameDisplay).toBe(xssPayload); // Should be displayed as text, not executed

    // Verify no alert was triggered
    page.on('dialog', () => {
      throw new Error('XSS alert should not be triggered');
    });
  });

  test('escapes HTML in user-generated content', async ({ page }) => {
    await page.goto('/comments');

    const htmlPayload = '<img src="x" onerror="alert(\'XSS\')">';
    
    await page.fill('[data-testid="comment-input"]', htmlPayload);
    await page.click('[data-testid="post-comment-button"]');

    // Verify HTML is escaped in display
    const commentContent = await page.locator('[data-testid="comment-content"]').innerHTML();
    expect(commentContent).toContain('&lt;img');
    expect(commentContent).not.toContain('<img');
  });
});
```

---

## 📊 Test Reporting

### Custom Test Reporter:
```typescript
// src/test/custom-reporter.ts
import { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';

class CustomTestReporter implements Reporter {
  private startTime: number = 0;
  private results: any[] = [];

  onBegin() {
    this.startTime = Date.now();
    console.log('🧪 Starting test execution...');
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const testResult = {
      title: test.title,
      file: path.relative(process.cwd(), test.location.file),
      duration: result.duration,
      status: result.status,
      error: result.error?.message,
      retry: result.retry
    };

    this.results.push(testResult);

    const statusIcon = result.status === 'passed' ? '✅' : 
                      result.status === 'failed' ? '❌' : 
                      result.status === 'skipped' ? '⏭️' : '❓';
    
    console.log(`${statusIcon} ${test.title} (${result.duration}ms)`);
  }

  onEnd() {
    const duration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;

    console.log('\n📊 Test Summary:');
    console.log(`   Total: ${this.results.length}`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ⏱️  Duration: ${duration}ms`);

    // Generate JSON report
    const report = {
      summary: {
        total: this.results.length,
        passed,
        failed,
        skipped,
        duration,
        timestamp: new Date().toISOString()
      },
      tests: this.results
    };

    fs.writeFileSync('test-results.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Test report saved to test-results.json');
  }
}

export default CustomTestReporter;
```

### Coverage Reporter Integration:
```typescript
// vitest.config.ts (updated with coverage)
export default defineConfig({
  test: {
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
      ],
      thresholds: {
        global: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80
        }
      },
      watermarks: {
        statements: [50, 80],
        functions: [50, 80],
        branches: [50, 80],
        lines: [50, 80]
      }
    }
  }
});
```

---

## 🚀 Continuous Integration

### GitHub Actions Workflow:
```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Start application
        run: |
          npm run build
          npm run start &
          sleep 10
      
      - name: Run E2E tests
        run: npx playwright test
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-results
          path: test-results/
```

---

## 🎯 Test Best Practices

### Test Organization:
```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── Button.stories.tsx
│   └── ...
├── hooks/
│   ├── useCounter/
│   │   ├── useCounter.ts
│   │   └── useCounter.test.ts
│   └── ...
├── utils/
│   ├── validation/
│   │   ├── validation.ts
│   │   └── validation.test.ts
│   └── ...
└── test/
    ├── setup.ts
    ├── helpers/
    ├── mocks/
    └── fixtures/

tests/
├── e2e/
│   ├── auth.spec.ts
│   ├── user-journey.spec.ts
│   └── ...
├── integration/
│   ├── api/
│   └── database/
└── performance/
    ├── load-test.yml
    └── page-performance.spec.ts
```

### Testing Guidelines:
1. **Test Naming**: Use descriptive test names that explain the expected behavior
2. **Test Structure**: Follow AAA pattern (Arrange, Act, Assert)
3. **Test Isolation**: Each test should be independent and not rely on other tests
4. **Mock External Dependencies**: Mock external APIs, databases, and third-party services
5. **Test Data Management**: Use factories or fixtures for consistent test data
6. **Assertion Quality**: Use specific assertions that clearly indicate what went wrong
7. **Test Coverage**: Aim for meaningful coverage, not just high percentages
8. **Performance Testing**: Include performance tests for critical user paths

---

## 📋 Testing Checklist

### Pre-Test Setup:
- [ ] Test environment configured
- [ ] Dependencies installed
- [ ] Database seeded with test data
- [ ] Mock services configured
- [ ] Environment variables set

### Test Execution:
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Performance tests within thresholds
- [ ] Security tests passing
- [ ] Coverage targets met

### Post-Test Analysis:
- [ ] Test results reviewed
- [ ] Coverage report generated
- [ ] Performance metrics analyzed
- [ ] Failed tests investigated
- [ ] Test artifacts archived

---

**Status**: 📋 TEMPLATE - Ready for Implementation  
**Template Version**: 1.0.0  
**Created**: July 22, 2025  
**Testing Frameworks**: Jest, Vitest, Playwright, Artillery  
**Next Review**: [Schedule review date]

*This template provides comprehensive testing strategy guidance for CODAI ecosystem components. Customize test cases and configurations based on your specific requirements.*

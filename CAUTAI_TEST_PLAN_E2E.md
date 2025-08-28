# Cautai: E2E Testing & Performance Strategies

## End-to-End Testing Strategy

### Cross-Platform E2E Test Suite

**Test Environment Matrix:**
- **Browsers**: Chromium, Firefox, WebKit
- **Operating Systems**: Ubuntu, Windows, macOS  
- **Node Versions**: 18, 20, 21
- **Screen Sizes**: Mobile (375px), Tablet (768px), Desktop (1920px)

```typescript
// tests/e2e/search-workflow.spec.ts
import { test, expect, devices } from '@playwright/test';

test.describe('Complete Search Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete basic search journey', async ({ page }) => {
    // Landing page interaction
    await expect(page.locator('h1')).toContainText('Cautai');
    
    // Search input
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('TypeScript programming language');
    
    // Search execution
    await page.click('[data-testid="search-button"]');
    
    // Results verification
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="result-item"]')).toHaveCount.greaterThan(0);
    
    // First result should be relevant
    const firstResult = page.locator('[data-testid="result-item"]').first();
    await expect(firstResult).toContainText('TypeScript', { ignoreCase: true });
    
    // Citation links should be valid
    const citationLink = firstResult.locator('[data-testid="citation-link"]');
    await expect(citationLink).toHaveAttribute('href', /^https?:\/\//);
    
    // Performance assertion
    const searchTime = await page.locator('[data-testid="search-time"]').textContent();
    const timeMs = parseInt(searchTime?.replace(/[^0-9]/g, '') || '0');
    expect(timeMs).toBeLessThan(500); // Sub-500ms response
  });

  test('should handle internationalization', async ({ page }) => {
    // Start in English
    await expect(page.locator('[data-testid="search-placeholder"]'))
      .toHaveAttribute('placeholder', /Search/i);
    
    // Switch to Romanian
    await page.click('[data-testid="language-toggle"]');
    await page.click('[data-testid="language-ro"]');
    
    // Verify Romanian interface
    await expect(page.locator('[data-testid="search-placeholder"]'))
      .toHaveAttribute('placeholder', /Caută/i);
    
    // Perform Romanian search
    await page.fill('[data-testid="search-input"]', 'programare în TypeScript');
    await page.click('[data-testid="search-button"]');
    
    // Verify Romanian results handling
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="results-count"]'))
      .toContainText('rezultate'); // Romanian for "results"
  });

  test('should work in no-AI basic mode', async ({ page, context }) => {
    // Simulate no API keys environment
    await context.addInitScript(() => {
      window.localStorage.setItem('cautai-mode', 'no-ai-basic');
    });
    
    await page.reload();
    
    // Verify basic mode indicator
    await expect(page.locator('[data-testid="mode-indicator"]'))
      .toContainText('Basic Mode');
    
    // Perform search
    await page.fill('[data-testid="search-input"]', 'JavaScript frameworks');
    await page.click('[data-testid="search-button"]');
    
    // Results should still work
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // No AI enhancement features visible
    await expect(page.locator('[data-testid="ai-summary"]')).toBeHidden();
    await expect(page.locator('[data-testid="compose-answer"]')).toBeHidden();
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Simulate network error
    await page.route('**/api/v1/search', route => route.abort('failed'));
    
    await page.fill('[data-testid="search-input"]', 'test query');
    await page.click('[data-testid="search-button"]');
    
    // Error state should be shown
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    
    // Retry functionality
    await page.unroute('**/api/v1/search');
    await page.click('[data-testid="retry-button"]');
    
    // Should recover and show results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });
});

test.describe('VS Code Extension Integration', () => {
  test('should install and configure MCP server', async ({ page }) => {
    // This would require VS Code extension testing setup
    // Mock VS Code environment for testing
    
    await page.goto('/docs/vscode-setup');
    
    // Download .vscode/mcp.json configuration
    const downloadPromise = page.waitForDownload();
    await page.click('[data-testid="download-mcp-config"]');
    const download = await downloadPromise;
    
    // Verify configuration file content
    const configContent = await download.createReadStream();
    const config = JSON.parse(await streamToString(configContent));
    
    expect(config).toMatchObject({
      name: 'cautai',
      transport: expect.objectContaining({
        stdio: expect.objectContaining({
          command: 'npx',
          args: ['cautai', '--mcp-stdio']
        })
      }),
      capabilities: expect.objectContaining({
        tools: true,
        resources: true
      })
    });
  });
});
```

### Performance Testing with Artillery

```yaml
# tests/performance/load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: 'Warm up'
    - duration: 120
      arrivalRate: 50
      name: 'Ramp up load'
    - duration: 300
      arrivalRate: 100
      name: 'Sustained load'
  variables:
    searchQueries:
      - 'TypeScript programming'
      - 'React hooks tutorial'
      - 'Node.js performance'
      - 'Python web frameworks'
      - 'Docker containers'

scenarios:
  - name: 'Search API Load Test'
    weight: 80
    flow:
      - post:
          url: '/api/v1/search'
          headers:
            x-api-key: '{{ $randomString() }}'
            content-type: 'application/json'
          json:
            query: '{{ searchQueries[$randomNumber(0, 4)] }}'
            sources: ['web']
            depth: 5
          expect:
            - statusCode: 200
            - hasProperty: 'results'
            - responseTime: 500  # Max 500ms response time

  - name: 'MCP Protocol Load Test'
    weight: 20
    flow:
      - post:
          url: '/mcp'
          headers:
            content-type: 'application/json'
          json:
            jsonrpc: '2.0'
            method: 'tools/call'
            id: '{{ $randomNumber(1, 10000) }}'
            params:
              name: 'search_web'
              arguments:
                query: '{{ searchQueries[$randomNumber(0, 4)] }}'
          expect:
            - statusCode: 200
            - hasProperty: 'result'
            - responseTime: 300  # Faster for MCP
```

### Accessibility Testing Strategy

```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';

test.describe('Accessibility Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
  });

  test('should pass WCAG 2.1 AA standards on homepage', async ({ page }) => {
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    });
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab'); // Search input
    await expect(page.locator('[data-testid="search-input"]')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Search button
    await expect(page.locator('[data-testid="search-button"]')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Language toggle
    await expect(page.locator('[data-testid="language-toggle"]')).toBeFocused();
    
    // Enter key should trigger search
    await page.keyboard.press('Shift+Tab'); // Back to search input
    await page.keyboard.type('accessibility test');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('should provide proper ARIA labels', async ({ page }) => {
    // Search input should have proper labeling
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toHaveAttribute('aria-label', /search/i);
    
    // Results should have proper landmarks
    await page.fill('[data-testid="search-input"]', 'test');
    await page.click('[data-testid="search-button"]');
    
    const resultsRegion = page.locator('[data-testid="search-results"]');
    await expect(resultsRegion).toHaveAttribute('role', 'region');
    await expect(resultsRegion).toHaveAttribute('aria-label', /search results/i);
    
    // Each result should be properly labeled
    const firstResult = page.locator('[data-testid="result-item"]').first();
    await expect(firstResult).toHaveAttribute('role', 'article');
  });

  test('should handle screen reader announcements', async ({ page }) => {
    // Mock screen reader for testing
    let announcements: string[] = [];
    
    await page.addInitScript(() => {
      const originalSetAttribute = Element.prototype.setAttribute;
      Element.prototype.setAttribute = function(name, value) {
        if (name === 'aria-live' && value === 'polite') {
          // Capture aria-live announcements
          window.__announcements = window.__announcements || [];
          window.__announcements.push(this.textContent);
        }
        return originalSetAttribute.call(this, name, value);
      };
    });
    
    await page.fill('[data-testid="search-input"]', 'screen reader test');
    await page.click('[data-testid="search-button"]');
    
    // Check for search status announcements
    announcements = await page.evaluate(() => window.__announcements || []);
    expect(announcements).toContain('Search completed. 5 results found.');
  });
});
```

### Lighthouse CI Integration

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/en',
        'http://localhost:3000/ro',
        'http://localhost:3000/docs',
        'http://localhost:3000/dashboard'
      ],
      startServerCommand: 'pnpm build && pnpm start',
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.90 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.90 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'categories:pwa': ['error', { minScore: 0.80 }]
      }
    },
    upload: {
      target: 'lhci',
      serverBaseUrl: process.env.LHCI_SERVER_BASE_URL,
      token: process.env.LHCI_TOKEN
    }
  }
};
```

## Test Data Management

### Test Fixture Management

```typescript
// test/fixtures/index.ts
export class TestFixtures {
  private static instance: TestFixtures;
  
  static getInstance(): TestFixtures {
    if (!TestFixtures.instance) {
      TestFixtures.instance = new TestFixtures();
    }
    return TestFixtures.instance;
  }

  async loadGoldenFile(testName: string): Promise<any> {
    const path = `tests/fixtures/golden/${testName}.json`;
    const content = await fs.readFile(path, 'utf-8');
    return JSON.parse(content);
  }

  async saveGoldenFile(testName: string, data: any): Promise<void> {
    const path = `tests/fixtures/golden/${testName}.json`;
    await fs.ensureDir(dirname(path));
    await fs.writeFile(path, JSON.stringify(data, null, 2));
  }

  generateMockApiKey(): string {
    return `test-key-${randomBytes(16).toString('hex')}`;
  }

  generateMockSearchResults(query: string, count: number = 5): SearchResult[] {
    return Array(count).fill(null).map((_, i) => ({
      title: `${query} - Result ${i + 1}`,
      url: `https://example.com/result-${i + 1}`,
      snippet: `This is a test result for ${query}...`,
      score: 0.9 - (i * 0.1),
      metadata: {
        wordCount: 450 + i * 50,
        language: 'en',
        contentType: 'text/html'
      },
      citation: {
        url: `https://example.com/result-${i + 1}`,
        title: `${query} - Result ${i + 1}`,
        timestamp: new Date().toISOString(),
        contentHash: `sha256:${randomBytes(32).toString('hex')}`,
        accessible: true
      }
    }));
  }
}
```

## CI/CD Test Automation

### GitHub Actions Test Pipeline

```yaml
# .github/workflows/test-complete.yml
name: Complete Test Suite

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

env:
  NODE_ENV: test
  CAUTAI_TEST_MODE: true
  CI: true

jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      packages: ${{ steps.changes.outputs.packages }}
      apps: ${{ steps.changes.outputs.apps }}
      config: ${{ steps.changes.outputs.config }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v2
        id: changes
        with:
          filters: |
            packages:
              - 'packages/**'
            apps:
              - 'apps/**'
            config:
              - '*.config.*'
              - '.github/workflows/**'

  unit-tests:
    needs: changes
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [18, 20, 21]
        include:
          - os: ubuntu-latest
            node: 20
            coverage: true

    steps:
      - uses: actions/checkout@v4
        
      - uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
          cache: 'pnpm'
          
      - run: pnpm install --frozen-lockfile
      
      - run: pnpm build:packages
        
      - name: Run unit tests
        run: pnpm test:unit --reporter=verbose
        env:
          VITEST_COVERAGE: ${{ matrix.coverage }}
          
      - name: Upload coverage
        if: matrix.coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: true

  integration-tests:
    needs: [changes, unit-tests]
    runs-on: ubuntu-latest
    services:
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
          
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      
      - name: Start test database
        run: |
          docker run -d \
            --name test-db \
            -e POSTGRES_PASSWORD=test \
            -e POSTGRES_DB=cautai_test \
            -p 5432:5432 \
            postgres:15-alpine
            
      - name: Wait for services
        run: |
          timeout 60 bash -c 'until docker exec test-db pg_isready; do sleep 1; done'
          
      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/cautai_test
          REDIS_URL: redis://localhost:6379
          
      - name: Cleanup
        if: always()
        run: docker rm -f test-db

  e2e-tests:
    needs: [changes, integration-tests]
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
          
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      
      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps
        
      - name: Start application
        run: |
          pnpm start:test &
          timeout 60 bash -c 'until curl -f http://localhost:3000; do sleep 1; done'
          
      - name: Run E2E tests
        run: pnpm test:e2e
        
      - name: Upload E2E report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  lighthouse:
    needs: e2e-tests
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
          
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      
      - name: Run Lighthouse CI
        run: pnpm lighthouse:ci
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

  security-scan:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
          
      - run: pnpm install --frozen-lockfile
      
      - name: Run security audit
        run: pnpm audit --audit-level high
        
      - name: Run OWASP ZAP baseline scan
        uses: zaproxy/action-baseline@v0.7.0
        with:
          target: 'http://localhost:3000'
          rules_file_name: '.zap/rules.tsv'
```

This completes the comprehensive testing strategy for the Cautai project. The modular approach ensures maintainability while providing extensive coverage across all components and quality gates.

---

*Part 3 of CAUTAI_TEST_PLAN.md - Generated: August 28, 2025*
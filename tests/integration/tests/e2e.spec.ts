import { test, expect } from '@playwright/test';
import {
    IntegrationAuthHelper,
    E2ETestHelper,
    TEST_CONFIG
} from '../integration-helpers';

/**
 * CODAI Ecosystem End-to-End Integration Testing
 * Comprehensive testing of complete user workflows across multiple applications
 */

test.describe('End-to-End Integration Testing', () => {
    let authHelper: IntegrationAuthHelper;
    let e2eHelper: E2ETestHelper;

    test.beforeEach(async ({ page }) => {
        authHelper = new IntegrationAuthHelper();
        e2eHelper = new E2ETestHelper(page);
    });

    test.describe('Complete User Workflows', () => {
        test('Complete Development Workflow: Create → Code → Analyze → Deploy', async ({ page }) => {
            test.setTimeout(300000); // 5 minutes

            // Step 1: Authentication via ID service
            await e2eHelper.navigateToApp('id');
            await e2eHelper.performLogin('developer', 'devpass');

            // Step 2: Create new project in CODAI
            await e2eHelper.navigateToApp('codai');
            await page.click('[data-testid="new-project"]');
            await page.fill('[data-testid="project-name"]', 'E2E Integration Project');
            await page.fill('[data-testid="project-description"]', 'Testing complete development workflow');
            await page.selectOption('[data-testid="project-type"]', 'web-app');
            await page.click('[data-testid="create-project"]');
            await expect(page.locator('[data-testid="project-created"]')).toBeVisible();

            // Step 3: Add project details to MEMORAI
            await e2eHelper.navigateToApp('memorai');
            await page.click('[data-testid="add-memory"]');
            await page.fill('[data-testid="memory-title"]', 'E2E Project Requirements');
            await page.fill('[data-testid="memory-content"]', 'Project: E2E Integration Project\nType: Web Application\nFeatures: Authentication, Dashboard, API Integration');
            await page.selectOption('[data-testid="memory-type"]', 'project');
            await page.click('[data-testid="save-memory"]');
            await expect(page.locator('[data-testid="memory-saved"]')).toBeVisible();

            // Step 4: Generate AI insights in HUB
            await e2eHelper.navigateToApp('hub');
            await page.click('[data-testid="generate-insights"]');
            await page.waitForSelector('[data-testid="insights-generated"]', { timeout: 30000 });
            const insightsText = await page.locator('[data-testid="insights-content"]').textContent();
            expect(insightsText).toContain('E2E Integration Project');

            // Step 5: Analyze project metrics in ANALIZAI
            await e2eHelper.navigateToApp('analizai');
            await page.click('[data-testid="analyze-project"]');
            await page.selectOption('[data-testid="analysis-type"]', 'project-metrics');
            await page.click('[data-testid="start-analysis"]');
            await page.waitForSelector('[data-testid="analysis-complete"]', { timeout: 45000 });

            // Step 6: Check project status in admin panel
            await e2eHelper.navigateToApp('admin');
            await page.click('[data-testid="projects-tab"]');
            await expect(page.locator('[data-testid="project-list"]')).toContainText('E2E Integration Project');

            // Step 7: Verify workflow completion in LOGAI
            await e2eHelper.navigateToApp('logai');
            await page.fill('[data-testid="search-logs"]', 'E2E Integration Project');
            await page.click('[data-testid="search-button"]');
            await expect(page.locator('[data-testid="log-results"]')).toContainText('project created');
            await expect(page.locator('[data-testid="log-results"]')).toContainText('memory saved');
            await expect(page.locator('[data-testid="log-results"]')).toContainText('analysis complete');
        });

        test('Complete Business Workflow: Market Research → Product Creation → Financial Management', async ({ page }) => {
            test.setTimeout(240000); // 4 minutes

            // Step 1: Authentication
            await e2eHelper.navigateToApp('id');
            await e2eHelper.performLogin('business', 'bizpass');

            // Step 2: Conduct market research in MARKETAI
            await e2eHelper.navigateToApp('marketai');
            await page.click('[data-testid="new-research"]');
            await page.fill('[data-testid="research-query"]', 'AI productivity tools market trends');
            await page.selectOption('[data-testid="market-segment"]', 'B2B-SaaS');
            await page.click('[data-testid="start-research"]');
            await page.waitForSelector('[data-testid="research-complete"]', { timeout: 60000 });

            // Step 3: Create products based on research in FABRICAI
            await e2eHelper.navigateToApp('fabricai');
            await page.click('[data-testid="create-from-research"]');
            await page.fill('[data-testid="product-name"]', 'AI Productivity Suite');
            await page.fill('[data-testid="product-description"]', 'Comprehensive AI tools for business productivity');
            await page.selectOption('[data-testid="pricing-model"]', 'subscription');
            await page.click('[data-testid="create-product"]');
            await expect(page.locator('[data-testid="product-created"]')).toBeVisible();

            // Step 4: Set up financial tracking in BANCAI
            await e2eHelper.navigateToApp('bancai');
            await page.click('[data-testid="new-account"]');
            await page.fill('[data-testid="account-name"]', 'AI Productivity Suite Revenue');
            await page.selectOption('[data-testid="account-type"]', 'revenue');
            await page.click('[data-testid="create-account"]');
            await expect(page.locator('[data-testid="account-created"]')).toBeVisible();

            // Step 5: Create initial transaction
            await page.click('[data-testid="new-transaction"]');
            await page.fill('[data-testid="transaction-amount"]', '10000');
            await page.selectOption('[data-testid="transaction-type"]', 'initial-investment');
            await page.fill('[data-testid="transaction-description"]', 'Initial investment for AI Productivity Suite');
            await page.click('[data-testid="create-transaction"]');
            await expect(page.locator('[data-testid="transaction-created"]')).toBeVisible();

            // Step 6: Set up digital wallet in WALLET
            await e2eHelper.navigateToApp('wallet');
            await page.click('[data-testid="connect-account"]');
            await page.selectOption('[data-testid="account-source"]', 'bancai');
            await page.click('[data-testid="sync-balance"]');
            await expect(page.locator('[data-testid="balance-synced"]')).toBeVisible();

            const balance = await page.locator('[data-testid="current-balance"]').textContent();
            expect(balance).toContain('10000');

            // Step 7: Set up e-commerce in CUMPARAI
            await e2eHelper.navigateToApp('cumparai');
            await page.click('[data-testid="list-product"]');
            await page.fill('[data-testid="listing-title"]', 'AI Productivity Suite - Professional License');
            await page.fill('[data-testid="listing-price"]', '99.99');
            await page.selectOption('[data-testid="payment-method"]', 'wallet');
            await page.click('[data-testid="create-listing"]');
            await expect(page.locator('[data-testid="listing-created"]')).toBeVisible();

            // Step 8: Verify complete workflow in HUB dashboard
            await e2eHelper.navigateToApp('hub');
            await expect(page.locator('[data-testid="recent-activities"]')).toContainText('AI Productivity Suite');
            await expect(page.locator('[data-testid="financial-summary"]')).toContainText('$10,000');
            await expect(page.locator('[data-testid="products-count"]')).toContainText('1');
        });

        test('Complete Learning Workflow: Research → Study → Present → Analyze', async ({ page }) => {
            test.setTimeout(180000); // 3 minutes

            // Step 1: Authentication
            await e2eHelper.navigateToApp('id');
            await e2eHelper.performLogin('student', 'studpass');

            // Step 2: Research topic with ROMAI (Romanian Intelligence)
            await e2eHelper.navigateToApp('romai');
            await page.click('[data-testid="new-research"]');
            await page.fill('[data-testid="research-topic"]', 'Istoria dezvoltării AI în România');
            await page.selectOption('[data-testid="research-type"]', 'academic');
            await page.click('[data-testid="start-research"]');
            await page.waitForSelector('[data-testid="research-results"]', { timeout: 45000 });

            // Step 3: Create study materials in STUDIAI
            await e2eHelper.navigateToApp('studiai');
            await page.click('[data-testid="create-study-set"]');
            await page.fill('[data-testid="study-title"]', 'AI Development in Romania');
            await page.fill('[data-testid="study-description"]', 'Historical overview of AI development in Romanian context');
            await page.click('[data-testid="import-from-romai"]');
            await page.click('[data-testid="create-study-set-button"]');
            await expect(page.locator('[data-testid="study-set-created"]')).toBeVisible();

            // Step 4: Create presentation in PREZENTAI
            await e2eHelper.navigateToApp('prezentai');
            await page.click('[data-testid="new-presentation"]');
            await page.fill('[data-testid="presentation-title"]', 'AI in Romania: Historical Perspective');
            await page.selectOption('[data-testid="template"]', 'academic');
            await page.click('[data-testid="import-study-data"]');
            await page.click('[data-testid="create-presentation"]');
            await page.waitForSelector('[data-testid="presentation-ready"]', { timeout: 30000 });

            // Step 5: Generate music for presentation in MUZICAI
            await e2eHelper.navigateToApp('muzicai');
            await page.click('[data-testid="create-soundtrack"]');
            await page.fill('[data-testid="soundtrack-title"]', 'Academic Presentation Background');
            await page.selectOption('[data-testid="mood"]', 'professional');
            await page.selectOption('[data-testid="duration"]', '5-minutes');
            await page.click('[data-testid="generate-music"]');
            await page.waitForSelector('[data-testid="music-generated"]', { timeout: 60000 });

            // Step 6: Analyze presentation effectiveness in ANALIZAI
            await e2eHelper.navigateToApp('analizai');
            await page.click('[data-testid="analyze-presentation"]');
            await page.selectOption('[data-testid="analysis-type"]', 'content-effectiveness');
            await page.click('[data-testid="start-presentation-analysis"]');
            await page.waitForSelector('[data-testid="analysis-complete"]', { timeout: 30000 });

            // Step 7: Store learning outcomes in MEMORAI
            await e2eHelper.navigateToApp('memorai');
            await page.click('[data-testid="add-memory"]');
            await page.fill('[data-testid="memory-title"]', 'Learning Session: AI in Romania');
            await page.fill('[data-testid="memory-content"]', 'Completed research, study materials, and presentation on Romanian AI development');
            await page.selectOption('[data-testid="memory-type"]', 'learning');
            await page.click('[data-testid="save-memory"]');
            await expect(page.locator('[data-testid="memory-saved"]')).toBeVisible();

            // Step 8: Verify learning workflow completion in HUB
            await e2eHelper.navigateToApp('hub');
            await expect(page.locator('[data-testid="learning-activities"]')).toContainText('AI in Romania');
            await expect(page.locator('[data-testid="completed-studies"]')).toContainText('1');
            await expect(page.locator('[data-testid="presentations-created"]')).toContainText('1');
        });

        test('Cross-App Authentication Persistence', async ({ page }) => {
            // Test that authentication persists across all applications
            await e2eHelper.navigateToApp('id');
            await e2eHelper.performLogin('testuser', 'testpass');

            const appsToTest = ['hub', 'codai', 'memorai', 'admin', 'bancai', 'fabricai', 'analizai'];

            for (const app of appsToTest) {
                await e2eHelper.navigateToApp(app);
                // Should not see login form - should be already authenticated
                await expect(page.locator('[data-testid="login-form"]')).not.toBeVisible();
                await expect(page.locator('[data-testid="user-info"]')).toBeVisible();

                // Verify user information is consistent
                const userInfo = await page.locator('[data-testid="user-info"]').textContent();
                expect(userInfo).toContain('testuser');
            }
        });

        test('Multi-Tab Synchronization', async ({ context }) => {
            // Test data synchronization across multiple tabs
            const page1 = await context.newPage();
            const page2 = await context.newPage();

            // Authenticate in first tab
            const e2eHelper1 = new E2ETestHelper(page1);
            await e2eHelper1.navigateToApp('id');
            await e2eHelper1.performLogin('syncuser', 'syncpass');

            // Create memory in MEMORAI in first tab
            await e2eHelper1.navigateToApp('memorai');
            await page1.click('[data-testid="add-memory"]');
            await page1.fill('[data-testid="memory-title"]', 'Multi-tab sync test');
            await page1.fill('[data-testid="memory-content"]', 'Testing real-time synchronization across tabs');
            await page1.click('[data-testid="save-memory"]');
            await expect(page1.locator('[data-testid="memory-saved"]')).toBeVisible();

            // Switch to second tab and check if memory appears
            const e2eHelper2 = new E2ETestHelper(page2);
            await e2eHelper2.navigateToApp('memorai');
            await page2.reload(); // Refresh to get latest data
            await expect(page2.locator('[data-testid="memory-list"]')).toContainText('Multi-tab sync test');

            // Verify in HUB dashboard in second tab
            await e2eHelper2.navigateToApp('hub');
            await expect(page2.locator('[data-testid="recent-activities"]')).toContainText('Multi-tab sync test');
        });
    });

    test.describe('Performance and User Experience', () => {
        test('Page Load Performance Across Apps', async ({ page }) => {
            const performanceResults = [];
            const appsToTest = ['hub', 'codai', 'memorai', 'bancai', 'fabricai'];

            // Authenticate once
            await e2eHelper.navigateToApp('id');
            await e2eHelper.performLogin('perfuser', 'perfpass');

            for (const app of appsToTest) {
                const startTime = Date.now();
                await e2eHelper.navigateToApp(app);
                await page.waitForLoadState('networkidle');
                const loadTime = Date.now() - startTime;

                const performance = await e2eHelper.measurePagePerformance();

                performanceResults.push({
                    app,
                    loadTime,
                    performance
                });

                // Assert performance thresholds
                expect(loadTime).toBeLessThan(5000); // 5 seconds max load time
                expect(performance.domContentLoaded).toBeLessThan(2000); // 2 seconds DOMContentLoaded
            }

            console.log('Performance Results:', performanceResults);
        });

        test('Mobile Responsiveness Across Apps', async ({ page }) => {
            // Test mobile viewport
            await page.setViewportSize({ width: 375, height: 812 }); // iPhone X size

            await e2eHelper.navigateToApp('id');
            await e2eHelper.performLogin('mobileuser', 'mobilepass');

            const appsToTest = ['hub', 'codai', 'memorai', 'bancai'];

            for (const app of appsToTest) {
                await e2eHelper.navigateToApp(app);

                // Check for mobile navigation menu
                await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();

                // Check responsive layout
                const container = page.locator('[data-testid="app-container"]');
                const containerBox = await container.boundingBox();
                expect(containerBox?.width).toBeLessThanOrEqual(375);

                // Test touch interactions
                await page.locator('[data-testid="mobile-menu-button"]').tap();
                await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
            }
        });

        test('Accessibility Compliance', async ({ page }) => {
            await e2eHelper.navigateToApp('id');
            await e2eHelper.performLogin('a11yuser', 'a11ypass');

            const appsToTest = ['hub', 'codai', 'memorai', 'admin'];

            for (const app of appsToTest) {
                await e2eHelper.navigateToApp(app);

                // Check for proper ARIA labels
                const buttons = page.locator('button');
                const buttonCount = await buttons.count();

                for (let i = 0; i < buttonCount; i++) {
                    const button = buttons.nth(i);
                    const ariaLabel = await button.getAttribute('aria-label');
                    const textContent = await button.textContent();

                    // Button should have either aria-label or text content
                    expect(ariaLabel || textContent?.trim()).toBeTruthy();
                }

                // Check for proper heading hierarchy
                const headings = page.locator('h1, h2, h3, h4, h5, h6');
                const headingCount = await headings.count();
                expect(headingCount).toBeGreaterThan(0); // Should have at least one heading

                // Check for alt text on images
                const images = page.locator('img');
                const imageCount = await images.count();

                for (let i = 0; i < imageCount; i++) {
                    const img = images.nth(i);
                    const altText = await img.getAttribute('alt');
                    expect(altText).toBeTruthy(); // All images should have alt text
                }
            }
        });

        test('Error Handling and Recovery', async ({ page }) => {
            await e2eHelper.navigateToApp('id');
            await e2eHelper.performLogin('erroruser', 'errorpass');

            // Test network error handling
            await page.route('**/api/**', route => {
                if (Math.random() > 0.7) { // 30% chance of network error
                    route.abort();
                } else {
                    route.continue();
                }
            });

            await e2eHelper.navigateToApp('codai');

            // Try to create a project - should handle potential network errors gracefully
            await page.click('[data-testid="new-project"]');
            await page.fill('[data-testid="project-name"]', 'Error Handling Test');
            await page.click('[data-testid="create-project"]');

            // Should either succeed or show appropriate error message
            await page.waitForSelector(
                '[data-testid="project-created"], [data-testid="error-message"]',
                { timeout: 15000 }
            );

            const errorMessage = page.locator('[data-testid="error-message"]');
            const successMessage = page.locator('[data-testid="project-created"]');

            const errorVisible = await errorMessage.isVisible();
            const successVisible = await successMessage.isVisible();

            expect(errorVisible || successVisible).toBeTruthy();

            // If error occurred, should have retry functionality
            if (errorVisible) {
                await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
            }
        });
    });

    test.describe('Data Consistency and Integrity', () => {
        test('Cross-Service Data Consistency', async ({ page }) => {
            await e2eHelper.navigateToApp('id');
            await e2eHelper.performLogin('datauser', 'datapass');

            const projectName = 'Data Consistency Test Project';
            const timestamp = Date.now().toString();

            // Create project in CODAI
            await e2eHelper.navigateToApp('codai');
            await page.click('[data-testid="new-project"]');
            await page.fill('[data-testid="project-name"]', projectName);
            await page.fill('[data-testid="project-description"]', `Test project created at ${timestamp}`);
            await page.click('[data-testid="create-project"]');
            await expect(page.locator('[data-testid="project-created"]')).toBeVisible();

            // Wait for synchronization (give services time to sync)
            await page.waitForTimeout(2000);

            // Check if project appears in MEMORAI
            await e2eHelper.navigateToApp('memorai');
            await page.fill('[data-testid="search-input"]', projectName);
            await page.click('[data-testid="search-button"]');
            await expect(page.locator('[data-testid="search-results"]')).toContainText(projectName);

            // Check if project appears in HUB dashboard
            await e2eHelper.navigateToApp('hub');
            await expect(page.locator('[data-testid="recent-projects"]')).toContainText(projectName);

            // Check if project is logged in LOGAI
            await e2eHelper.navigateToApp('logai');
            await page.fill('[data-testid="search-logs"]', projectName);
            await page.click('[data-testid="search-button"]');
            await expect(page.locator('[data-testid="log-results"]')).toContainText(projectName);

            // Check if project shows in admin panel
            await e2eHelper.navigateToApp('admin');
            await page.click('[data-testid="projects-tab"]');
            await expect(page.locator('[data-testid="project-list"]')).toContainText(projectName);
        });

        test('Real-Time Data Synchronization', async ({ context }) => {
            const page1 = await context.newPage();
            const page2 = await context.newPage();

            const e2eHelper1 = new E2ETestHelper(page1);
            const e2eHelper2 = new E2ETestHelper(page2);

            // Authenticate both tabs
            await e2eHelper1.navigateToApp('id');
            await e2eHelper1.performLogin('sync1', 'syncpass');

            await e2eHelper2.navigateToApp('id');
            await e2eHelper2.performLogin('sync2', 'syncpass');

            // Navigate both to HUB
            await e2eHelper1.navigateToApp('hub');
            await e2eHelper2.navigateToApp('hub');

            // Create a project in one tab
            await e2eHelper1.navigateToApp('codai');
            await page1.click('[data-testid="new-project"]');
            await page1.fill('[data-testid="project-name"]', 'Real-Time Sync Test');
            await page1.click('[data-testid="create-project"]');
            await expect(page1.locator('[data-testid="project-created"]')).toBeVisible();

            // Check if it appears in the other tab's HUB (should auto-refresh)
            await e2eHelper2.navigateToApp('hub');
            await page2.waitForTimeout(3000); // Wait for real-time update
            await expect(page2.locator('[data-testid="recent-activities"]')).toContainText('Real-Time Sync Test');
        });
    });

    test.afterEach(async ({ page }) => {
        // Clean up any test data or state
        await page.close();
    });
});

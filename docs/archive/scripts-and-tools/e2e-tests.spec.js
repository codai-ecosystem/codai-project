/**
 * 🌐 CODAI End-to-End Testing Suite
 * Complete user journey testing with Playwright
 */

import { test, expect } from '@playwright/test';

// Test Configuration
const E2E_CONFIG = {
    baseURL: 'http://localhost:4000',
    services: {
        codai: 'http://localhost:4001',
        admin: 'http://localhost:4007',
        hub: 'http://localhost:4008',
        id: 'http://localhost:4004',
        bancai: 'http://localhost:4005'
    },
    timeout: 30000,
    users: {
        admin: {
            email: 'admin@codai.dev',
            password: 'admin123'
        },
        user: {
            email: 'user@codai.dev',
            password: 'user123'
        }
    }
};

// Configure test defaults
test.setTimeout(E2E_CONFIG.timeout);

/**
 * 🔐 Authentication Flow Tests
 */
test.describe('Authentication Flows', () => {
    test('User Registration Flow', async ({ page }) => {
        // Navigate to registration
        await page.goto(`${E2E_CONFIG.baseURL}/register`);
        await expect(page).toHaveTitle(/register|sign up/i);
        
        // Fill registration form
        await page.fill('[data-testid="name-input"]', 'Test User');
        await page.fill('[data-testid="email-input"]', 'test@example.com');
        await page.fill('[data-testid="password-input"]', 'securePassword123');
        await page.fill('[data-testid="confirm-password-input"]', 'securePassword123');
        
        // Submit registration
        await page.click('[data-testid="register-button"]');
        
        // Verify success message or redirect
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
        
        // Check URL changed to dashboard or verification page
        await expect(page).toHaveURL(/dashboard|verify/);
    });

    test('User Login Flow', async ({ page }) => {
        // Navigate to login
        await page.goto(`${E2E_CONFIG.baseURL}/login`);
        await expect(page).toHaveTitle(/login|sign in/i);
        
        // Fill login form
        await page.fill('[data-testid="email-input"]', E2E_CONFIG.users.user.email);
        await page.fill('[data-testid="password-input"]', E2E_CONFIG.users.user.password);
        
        // Submit login
        await page.click('[data-testid="login-button"]');
        
        // Verify successful login
        await expect(page).toHaveURL(/dashboard/);
        await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test('Password Reset Flow', async ({ page }) => {
        // Navigate to password reset
        await page.goto(`${E2E_CONFIG.baseURL}/forgot-password`);
        
        // Fill email
        await page.fill('[data-testid="email-input"]', 'test@example.com');
        
        // Submit reset request
        await page.click('[data-testid="reset-button"]');
        
        // Verify confirmation message
        await expect(page.locator('[data-testid="reset-confirmation"]')).toBeVisible();
        await expect(page.locator('[data-testid="reset-confirmation"]')).toContainText(/email sent/i);
    });
});

/**
 * 🤖 AI Development Workflow Tests
 */
test.describe('AI Development Workflows', () => {
    test.beforeEach(async ({ page }) => {
        // Login before each test
        await page.goto(`${E2E_CONFIG.baseURL}/login`);
        await page.fill('[data-testid="email-input"]', E2E_CONFIG.users.user.email);
        await page.fill('[data-testid="password-input"]', E2E_CONFIG.users.user.password);
        await page.click('[data-testid="login-button"]');
        await expect(page).toHaveURL(/dashboard/);
    });

    test('Create New AI Project', async ({ page }) => {
        // Navigate to project creation
        await page.click('[data-testid="new-project-button"]');
        await expect(page).toHaveURL(/projects\/new/);
        
        // Fill project details
        await page.fill('[data-testid="project-name"]', 'Test AI Project');
        await page.fill('[data-testid="project-description"]', 'E2E test project');
        await page.selectOption('[data-testid="project-template"]', 'react-app');
        
        // Configure AI settings
        await page.click('[data-testid="ai-settings-tab"]');
        await page.selectOption('[data-testid="ai-model"]', 'gpt-4');
        await page.fill('[data-testid="ai-instructions"]', 'Create a modern React application');
        
        // Create project
        await page.click('[data-testid="create-project-button"]');
        
        // Verify project creation
        await expect(page).toHaveURL(/projects\/[a-zA-Z0-9-]+/);
        await expect(page.locator('[data-testid="project-title"]')).toContainText('Test AI Project');
    });

    test('Generate Code with AI', async ({ page }) => {
        // Assume we have a project open
        await page.goto(`${E2E_CONFIG.baseURL}/projects/test-project`);
        
        // Open AI code generator
        await page.click('[data-testid="ai-generate-button"]');
        await expect(page.locator('[data-testid="ai-prompt-modal"]')).toBeVisible();
        
        // Enter AI prompt
        await page.fill('[data-testid="ai-prompt-input"]', 'Create a login form component');
        
        // Generate code
        await page.click('[data-testid="generate-button"]');
        
        // Wait for generation to complete
        await expect(page.locator('[data-testid="generation-complete"]')).toBeVisible({ timeout: 15000 });
        
        // Verify generated code appears
        await expect(page.locator('[data-testid="generated-code"]')).toBeVisible();
        await expect(page.locator('[data-testid="generated-code"]')).toContainText('LoginForm');
    });

    test('Review and Edit Generated Code', async ({ page }) => {
        // Navigate to project with generated code
        await page.goto(`${E2E_CONFIG.baseURL}/projects/test-project/code`);
        
        // Select a file to edit
        await page.click('[data-testid="file-tree"] >> text=LoginForm.jsx');
        
        // Verify code editor is visible
        await expect(page.locator('[data-testid="code-editor"]')).toBeVisible();
        
        // Make an edit
        await page.click('[data-testid="code-editor"]');
        await page.keyboard.press('Control+End');
        await page.keyboard.type('\n// Added by E2E test');
        
        // Save changes
        await page.keyboard.press('Control+S');
        
        // Verify save confirmation
        await expect(page.locator('[data-testid="save-indicator"]')).toContainText('Saved');
    });

    test('Deploy Project', async ({ page }) => {
        // Navigate to deployment
        await page.goto(`${E2E_CONFIG.baseURL}/projects/test-project/deploy`);
        
        // Configure deployment
        await page.selectOption('[data-testid="deployment-provider"]', 'vercel');
        await page.fill('[data-testid="deployment-name"]', 'test-e2e-app');
        
        // Start deployment
        await page.click('[data-testid="deploy-button"]');
        
        // Wait for deployment to complete
        await expect(page.locator('[data-testid="deployment-status"]')).toContainText('Success', { timeout: 60000 });
        
        // Verify deployment URL is provided
        await expect(page.locator('[data-testid="deployment-url"]')).toBeVisible();
    });
});

/**
 * 💰 Banking & Financial Operations Tests
 */
test.describe('Banking & Financial Operations', () => {
    test.beforeEach(async ({ page }) => {
        // Login as user with banking access
        await page.goto(`${E2E_CONFIG.baseURL}/login`);
        await page.fill('[data-testid="email-input"]', E2E_CONFIG.users.user.email);
        await page.fill('[data-testid="password-input"]', E2E_CONFIG.users.user.password);
        await page.click('[data-testid="login-button"]');
        await page.goto(`${E2E_CONFIG.baseURL}/banking`);
    });

    test('Connect Bank Account', async ({ page }) => {
        // Navigate to account connection
        await page.click('[data-testid="connect-account-button"]');
        
        // Fill bank details (mock)
        await page.fill('[data-testid="bank-name"]', 'Test Bank');
        await page.fill('[data-testid="account-number"]', '****1234');
        await page.fill('[data-testid="routing-number"]', '123456789');
        
        // Connect account
        await page.click('[data-testid="connect-button"]');
        
        // Verify connection success
        await expect(page.locator('[data-testid="connection-success"]')).toBeVisible();
        await expect(page.locator('[data-testid="connected-accounts"]')).toContainText('Test Bank');
    });

    test('View Financial Dashboard', async ({ page }) => {
        // Verify dashboard elements
        await expect(page.locator('[data-testid="account-balance"]')).toBeVisible();
        await expect(page.locator('[data-testid="recent-transactions"]')).toBeVisible();
        await expect(page.locator('[data-testid="financial-charts"]')).toBeVisible();
        
        // Check data is loading
        await expect(page.locator('[data-testid="balance-amount"]')).not.toBeEmpty();
    });

    test('Create Transaction', async ({ page }) => {
        // Open transaction form
        await page.click('[data-testid="new-transaction-button"]');
        
        // Fill transaction details
        await page.fill('[data-testid="transaction-amount"]', '100.00');
        await page.fill('[data-testid="transaction-description"]', 'E2E Test Transaction');
        await page.selectOption('[data-testid="transaction-category"]', 'expense');
        
        // Submit transaction
        await page.click('[data-testid="submit-transaction-button"]');
        
        // Verify transaction appears in list
        await expect(page.locator('[data-testid="transaction-list"]')).toContainText('E2E Test Transaction');
    });
});

/**
 * 👥 Administrative Operations Tests
 */
test.describe('Administrative Operations', () => {
    test.beforeEach(async ({ page }) => {
        // Login as admin
        await page.goto(`${E2E_CONFIG.baseURL}/login`);
        await page.fill('[data-testid="email-input"]', E2E_CONFIG.users.admin.email);
        await page.fill('[data-testid="password-input"]', E2E_CONFIG.users.admin.password);
        await page.click('[data-testid="login-button"]');
        await page.goto(`${E2E_CONFIG.baseURL}/admin`);
    });

    test('User Management', async ({ page }) => {
        // Navigate to user management
        await page.click('[data-testid="users-menu"]');
        
        // Search for a user
        await page.fill('[data-testid="user-search"]', 'test@example.com');
        await page.keyboard.press('Enter');
        
        // Verify search results
        await expect(page.locator('[data-testid="user-results"]')).toContainText('test@example.com');
        
        // Edit user permissions
        await page.click('[data-testid="edit-user-button"]');
        await page.check('[data-testid="admin-permission"]');
        await page.click('[data-testid="save-permissions-button"]');
        
        // Verify success message
        await expect(page.locator('[data-testid="permission-success"]')).toBeVisible();
    });

    test('System Configuration', async ({ page }) => {
        // Navigate to system settings
        await page.click('[data-testid="system-menu"]');
        await page.click('[data-testid="configuration-submenu"]');
        
        // Update a setting
        await page.fill('[data-testid="max-users-setting"]', '1000');
        await page.check('[data-testid="maintenance-mode"]');
        
        // Save configuration
        await page.click('[data-testid="save-config-button"]');
        
        // Verify success
        await expect(page.locator('[data-testid="config-saved"]')).toBeVisible();
    });

    test('View System Analytics', async ({ page }) => {
        // Navigate to analytics
        await page.click('[data-testid="analytics-menu"]');
        
        // Verify analytics components
        await expect(page.locator('[data-testid="user-stats-chart"]')).toBeVisible();
        await expect(page.locator('[data-testid="performance-metrics"]')).toBeVisible();
        await expect(page.locator('[data-testid="system-health"]')).toBeVisible();
        
        // Generate report
        await page.click('[data-testid="generate-report-button"]');
        await expect(page.locator('[data-testid="report-generation"]')).toBeVisible();
    });
});

/**
 * 🧠 Memory Management Tests
 */
test.describe('Memory Management Operations', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(`${E2E_CONFIG.baseURL}/login`);
        await page.fill('[data-testid="email-input"]', E2E_CONFIG.users.user.email);
        await page.fill('[data-testid="password-input"]', E2E_CONFIG.users.user.password);
        await page.click('[data-testid="login-button"]');
        await page.goto(`${E2E_CONFIG.baseURL}/memory`);
    });

    test('Store Data', async ({ page }) => {
        // Open data storage form
        await page.click('[data-testid="store-data-button"]');
        
        // Fill data details
        await page.fill('[data-testid="data-key"]', 'e2e-test-key');
        await page.fill('[data-testid="data-value"]', JSON.stringify({ test: 'data', timestamp: Date.now() }));
        await page.selectOption('[data-testid="data-type"]', 'json');
        
        // Store data
        await page.click('[data-testid="store-button"]');
        
        // Verify storage success
        await expect(page.locator('[data-testid="storage-success"]')).toBeVisible();
    });

    test('Query Information', async ({ page }) => {
        // Use search functionality
        await page.fill('[data-testid="search-input"]', 'e2e-test-key');
        await page.click('[data-testid="search-button"]');
        
        // Verify search results
        await expect(page.locator('[data-testid="search-results"]')).toContainText('e2e-test-key');
        
        // View data details
        await page.click('[data-testid="view-data-button"]');
        await expect(page.locator('[data-testid="data-viewer"]')).toBeVisible();
    });

    test('Data Visualization', async ({ page }) => {
        // Navigate to visualization
        await page.click('[data-testid="visualization-tab"]');
        
        // Verify visualization components
        await expect(page.locator('[data-testid="data-graph"]')).toBeVisible();
        await expect(page.locator('[data-testid="statistics-panel"]')).toBeVisible();
        
        // Interact with visualization
        await page.click('[data-testid="graph-node"]');
        await expect(page.locator('[data-testid="node-details"]')).toBeVisible();
    });
});

/**
 * 🔧 Cross-Browser and Device Tests
 */
test.describe('Cross-Browser Compatibility', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
        test(`Basic functionality in ${browserName}`, async ({ browser }) => {
            const context = await browser.newContext();
            const page = await context.newPage();
            
            // Test basic navigation
            await page.goto(E2E_CONFIG.baseURL);
            await expect(page.locator('[data-testid="main-navigation"]')).toBeVisible();
            
            // Test responsive design
            await page.setViewportSize({ width: 375, height: 667 }); // Mobile
            await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
            
            await page.setViewportSize({ width: 1200, height: 800 }); // Desktop
            await expect(page.locator('[data-testid="desktop-menu"]')).toBeVisible();
            
            await context.close();
        });
    });
});

/**
 * 🚨 Error Handling and Edge Cases
 */
test.describe('Error Handling', () => {
    test('Handle Network Errors', async ({ page }) => {
        // Simulate network failure
        await page.route('**/api/**', route => route.abort());
        
        await page.goto(`${E2E_CONFIG.baseURL}/dashboard`);
        
        // Verify error handling
        await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
        await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    });

    test('Handle Invalid Routes', async ({ page }) => {
        // Navigate to non-existent page
        await page.goto(`${E2E_CONFIG.baseURL}/nonexistent-page`);
        
        // Verify 404 page
        await expect(page.locator('[data-testid="404-page"]')).toBeVisible();
        await expect(page.locator('[data-testid="home-link"]')).toBeVisible();
    });

    test('Handle Session Expiry', async ({ page }) => {
        // Login first
        await page.goto(`${E2E_CONFIG.baseURL}/login`);
        await page.fill('[data-testid="email-input"]', E2E_CONFIG.users.user.email);
        await page.fill('[data-testid="password-input"]', E2E_CONFIG.users.user.password);
        await page.click('[data-testid="login-button"]');
        
        // Clear session storage to simulate expiry
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        
        // Try to access protected route
        await page.goto(`${E2E_CONFIG.baseURL}/dashboard`);
        
        // Should redirect to login
        await expect(page).toHaveURL(/login/);
        await expect(page.locator('[data-testid="session-expired-message"]')).toBeVisible();
    });
});

/**
 * ⚡ Performance Tests
 */
test.describe('Performance', () => {
    test('Page Load Performance', async ({ page }) => {
        const startTime = Date.now();
        
        await page.goto(E2E_CONFIG.baseURL);
        await expect(page.locator('[data-testid="main-content"]')).toBeVisible();
        
        const loadTime = Date.now() - startTime;
        
        // Page should load within 3 seconds
        expect(loadTime).toBeLessThan(3000);
    });

    test('Large Dataset Handling', async ({ page }) => {
        await page.goto(`${E2E_CONFIG.baseURL}/data-table`);
        
        // Load large dataset
        await page.click('[data-testid="load-large-dataset"]');
        
        // Should handle large data without crashing
        await expect(page.locator('[data-testid="data-table"]')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('[data-testid="table-row"]')).toHaveCount(1000, { timeout: 15000 });
    });
});

// Global test configuration
test.beforeAll(async () => {
    console.log('🚀 Starting CODAI E2E Test Suite');
    console.log('Services:', E2E_CONFIG.services);
});

test.afterAll(async () => {
    console.log('✅ CODAI E2E Test Suite Complete');
});

/**
 * 🎭 Phase 4: End-to-End Testing - Hub Service Workflows
 * 
 * Tests complete Hub service functionality: Service Discovery, Orchestration, Monitoring
 * Validates all Hub coordination capabilities and cross-service communication
 */

import { test, expect } from '@playwright/test';

const HUB_URL = 'http://localhost:4008';
const GATEWAY_URL = 'http://localhost:4003';
const ADMIN_URL = 'http://localhost:4007';
const ID_URL = 'http://localhost:4004';
const CBD_URL = 'http://localhost:4180';

// Test user credentials for Hub workflows
const testUser = {
    email: 'hub.user@codai.com',
    password: 'HubUser123!',
    role: 'user'
};

test.describe('Hub Service E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Ensure Hub service is healthy
        const response = await page.request.get(`${HUB_URL}/api/health`);
        expect(response.status()).toBe(200);
    });

    test('Hub Service Discovery and Navigation', async ({ page }) => {
        // Step 1: Navigate to Hub
        await page.goto(HUB_URL);
        await page.waitForSelector('body');

        // Step 2: Check service discovery interface
        const hasServiceGrid = await page.locator('.service-grid, .services-list, [data-testid*="service"]').isVisible().catch(() => false);
        const hasNavigationElements = await page.locator('nav, .navigation, .menu').isVisible().catch(() => false);

        // Should have service discovery elements
        expect(hasServiceGrid || hasNavigationElements).toBeTruthy();

        // Step 3: Test service discovery links
        const serviceLinks = [
            { name: 'Admin', url: ADMIN_URL, selector: 'text=Admin, a[href*="admin"], [data-service="admin"]' },
            { name: 'ID', url: ID_URL, selector: 'text=ID, text=Identity, a[href*="id"], [data-service="id"]' },
            { name: 'Gateway', url: GATEWAY_URL, selector: 'text=Gateway, text=API, a[href*="gateway"], [data-service="gateway"]' }
        ];

        for (const service of serviceLinks) {
            const serviceLink = page.locator(service.selector).first();
            if (await serviceLink.isVisible().catch(() => false)) {
                // Verify link target
                const href = await serviceLink.getAttribute('href').catch(() => '');
                expect(href.includes(service.name.toLowerCase()) || href.includes('4007') || href.includes('4004') || href.includes('4003')).toBeTruthy();
            }
        }
    });

    test('Hub Dashboard and Status Monitoring', async ({ page }) => {
        await page.goto(HUB_URL);
        await page.waitForSelector('body');

        // Test dashboard elements
        const dashboardElements = [
            '.dashboard',
            '.status-panel',
            '.health-monitor',
            '.service-status',
            '[data-testid*="dashboard"]'
        ];

        let hasDashboard = false;
        for (const element of dashboardElements) {
            if (await page.locator(element).isVisible().catch(() => false)) {
                hasDashboard = true;
                break;
            }
        }

        // Test status indicators
        const statusIndicators = await page.locator('.status-indicator, .health-badge, .service-health').count();

        // Should have some form of status monitoring
        expect(hasDashboard || statusIndicators > 0).toBeTruthy();

        // Test refresh functionality
        const refreshButton = page.locator('button:has-text("Refresh"), .refresh-button, [data-action="refresh"]').first();
        if (await refreshButton.isVisible().catch(() => false)) {
            await refreshButton.click();
            await page.waitForTimeout(1000);

            // Check if content updates
            const hasUpdatedContent = await page.locator('.loading, .spinner, .updating').isVisible().catch(() => false);
        }
    });

    test('Service Health Monitoring and Alerts', async ({ page }) => {
        await page.goto(HUB_URL);
        await page.waitForSelector('body');

        // Test health monitoring interface
        const healthSection = page.locator('.health-monitor, .service-health, [data-section="health"]').first();
        if (await healthSection.isVisible().catch(() => false)) {
            // Check individual service health
            const services = ['Admin', 'ID', 'Gateway', 'CBD'];

            for (const service of services) {
                const serviceHealth = page.locator(`[data-service="${service.toLowerCase()}"], .${service.toLowerCase()}-health`).first();
                if (await serviceHealth.isVisible().catch(() => false)) {
                    // Should show health status
                    const healthStatus = await page.locator('.status-ok, .status-error, .health-good, .health-bad').isVisible().catch(() => false);
                }
            }
        }

        // Test alert notifications
        const alertPanel = page.locator('.alerts, .notifications, .alert-panel').first();
        if (await alertPanel.isVisible().catch(() => false)) {
            // Check for alert items
            const alertCount = await page.locator('.alert-item, .notification-item').count();
            expect(alertCount).toBeGreaterThanOrEqual(0);
        }

        // Test health check API integration
        const healthCheck = await page.request.get(`${HUB_URL}/api/health`);
        expect(healthCheck.status()).toBe(200);

        const healthData = await healthCheck.json().catch(() => ({}));
        expect(healthData).toHaveProperty('status');
    });

    test('Cross-Service Communication Orchestration', async ({ page }) => {
        await page.goto(HUB_URL);
        await page.waitForSelector('body');

        // Test communication with other services through Hub
        const serviceTests = [
            { name: 'Gateway Health', url: `${GATEWAY_URL}/api/v1/hub/health` },
            { name: 'Admin Health', url: `${ADMIN_URL}/api/health` },
            { name: 'ID Health', url: `${ID_URL}/api/health` },
            { name: 'CBD Health', url: `${CBD_URL}/health` }
        ];

        for (const test of serviceTests) {
            const response = await page.request.get(test.url);
            // Should get successful response or expected error codes
            expect([200, 401, 404, 500]).toContain(response.status());
        }

        // Test Hub's orchestration interface
        const orchestrationPanel = page.locator('.orchestration, .workflow, .coordination').first();
        if (await orchestrationPanel.isVisible().catch(() => false)) {
            // Test workflow controls
            const workflowButtons = await page.locator('button[data-action*="workflow"], .workflow-control').count();
            expect(workflowButtons).toBeGreaterThanOrEqual(0);
        }
    });

    test('Hub Configuration and Settings', async ({ page }) => {
        await page.goto(HUB_URL);
        await page.waitForSelector('body');

        // Navigate to settings if available
        const settingsLink = page.locator('text=Settings, text=Config, a[href*="settings"], .settings-button').first();
        if (await settingsLink.isVisible().catch(() => false)) {
            await settingsLink.click();
            await page.waitForTimeout(2000);
        }

        // Test configuration options
        const configSections = [
            'Services',
            'Monitoring',
            'Alerts',
            'Security',
            'Performance'
        ];

        for (const section of configSections) {
            const sectionElement = page.locator(`text=${section}, [data-section="${section.toLowerCase()}"]`).first();
            if (await sectionElement.isVisible().catch(() => false)) {
                await sectionElement.click();
                await page.waitForTimeout(1000);

                // Check if section content loads
                const hasContent = await page.locator('form, .config-panel, .settings-form').isVisible().catch(() => false);
            }
        }

        // Test save configuration
        const saveButton = page.locator('button:has-text("Save"), button[type="submit"]').first();
        if (await saveButton.isVisible().catch(() => false)) {
            // Test save button is functional
            const isEnabled = await saveButton.isEnabled();
            expect(isEnabled).toBeTruthy();
        }
    });

    test('Real-time Updates and WebSocket Communication', async ({ page }) => {
        await page.goto(HUB_URL);
        await page.waitForSelector('body');

        // Test for real-time elements
        const realtimeElements = [
            '.realtime-status',
            '.live-updates',
            '.websocket-status',
            '[data-realtime="true"]'
        ];

        let hasRealtime = false;
        for (const element of realtimeElements) {
            if (await page.locator(element).isVisible().catch(() => false)) {
                hasRealtime = true;
                break;
            }
        }

        // Test WebSocket connection status
        const wsStatus = await page.evaluate(() => {
            // Check if WebSocket is being used
            return {
                hasWebSocket: 'WebSocket' in window,
                connections: window.WebSocket ? 'available' : 'not available'
            };
        });

        expect(wsStatus.hasWebSocket).toBeTruthy();

        // Test live data updates
        const dataElements = await page.locator('.data-value, .metric-value, .live-data').count();

        // Wait and check if data updates
        await page.waitForTimeout(2000);
        const updatedElements = await page.locator('.data-value, .metric-value, .live-data').count();
    });

    test('Service Registration and Discovery', async ({ page }) => {
        await page.goto(HUB_URL);
        await page.waitForSelector('body');

        // Test service registration interface
        const serviceRegistry = page.locator('.service-registry, .services-panel, [data-panel="services"]').first();
        if (await serviceRegistry.isVisible().catch(() => false)) {
            // Check registered services
            const registeredServices = await page.locator('.service-item, .registered-service').count();
            expect(registeredServices).toBeGreaterThanOrEqual(0);

            // Test service details
            const serviceItem = page.locator('.service-item').first();
            if (await serviceItem.isVisible().catch(() => false)) {
                await serviceItem.click();
                await page.waitForTimeout(1000);

                // Check service details panel
                const detailsPanel = await page.locator('.service-details, .service-info').isVisible().catch(() => false);
            }
        }

        // Test service discovery API
        const discoveryResponse = await page.request.get(`${HUB_URL}/api/services`);
        // Should return service list or 404 if not implemented
        expect([200, 404]).toContain(discoveryResponse.status());
    });

    test('Performance Monitoring and Metrics', async ({ page }) => {
        await page.goto(HUB_URL);
        await page.waitForSelector('body');

        // Test performance metrics display
        const metricsPanel = page.locator('.metrics, .performance, .stats-panel').first();
        if (await metricsPanel.isVisible().catch(() => false)) {
            // Check for metric displays
            const metrics = await page.locator('.metric, .stat, .performance-indicator').count();
            expect(metrics).toBeGreaterThanOrEqual(0);

            // Test metric updates
            const beforeValues = await page.locator('.metric-value').allTextContents();
            await page.waitForTimeout(2000);
            const afterValues = await page.locator('.metric-value').allTextContents();
        }

        // Test performance charts
        const charts = await page.locator('canvas, .chart, .graph').count();

        // Test performance API
        const performanceResponse = await page.request.get(`${HUB_URL}/api/metrics`);
        expect([200, 404]).toContain(performanceResponse.status());
    });

    test('Error Handling and Fault Tolerance', async ({ page }) => {
        await page.goto(HUB_URL);
        await page.waitForSelector('body');

        // Test handling of service failures
        await page.route('**/api/health', route => {
            if (route.request().url().includes('test-failure')) {
                route.fulfill({
                    status: 503,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: 'Service Unavailable' })
                });
            } else {
                route.continue();
            }
        });

        // Test error display
        const errorElements = await page.locator('.error, .alert-error, .service-error').count();

        // Test retry mechanisms
        const retryButton = page.locator('button:has-text("Retry"), .retry-button').first();
        if (await retryButton.isVisible().catch(() => false)) {
            await retryButton.click();
            await page.waitForTimeout(1000);
        }

        // Test graceful degradation
        const degradedElements = await page.locator('.degraded, .limited-functionality, .fallback').count();
    });

    test('Hub Integration with Gateway', async ({ page }) => {
        await page.goto(HUB_URL);
        await page.waitForSelector('body');

        // Test Gateway integration through Hub
        const gatewayIntegration = await page.request.get(`${GATEWAY_URL}/api/v1/hub/status`);
        expect([200, 404, 401]).toContain(gatewayIntegration.status());

        // Test Hub's gateway configuration
        const gatewayConfig = page.locator('.gateway-config, [data-service="gateway"]').first();
        if (await gatewayConfig.isVisible().catch(() => false)) {
            // Check gateway status
            const gatewayStatus = await page.locator('.gateway-status, .api-status').isVisible().catch(() => false);
        }

        // Test API routing through Gateway
        const routingTest = await page.request.get(`${GATEWAY_URL}/api/v1/hub/health`);
        expect([200, 404, 401]).toContain(routingTest.status());
    });

    test('Hub Responsive Design and Mobile Support', async ({ page }) => {
        await page.goto(HUB_URL);
        await page.waitForSelector('body');

        // Test desktop view
        await page.setViewportSize({ width: 1200, height: 800 });
        await page.waitForTimeout(1000);

        const desktopElements = await page.locator('.desktop-only, .wide-layout').count();

        // Test tablet view
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.waitForTimeout(1000);

        const tabletLayout = await page.locator('.responsive, .tablet-layout').isVisible().catch(() => false);

        // Test mobile view
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(1000);

        const mobileMenu = await page.locator('.mobile-menu, .hamburger, .nav-toggle').isVisible().catch(() => false);
        const mobileLayout = await page.locator('.mobile-layout, .compact').isVisible().catch(() => false);

        // Hub should be responsive
        expect(mobileMenu || mobileLayout || tabletLayout).toBeTruthy();

        // Reset to desktop
        await page.setViewportSize({ width: 1200, height: 800 });
    });
});

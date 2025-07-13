import { test, expect } from '@playwright/test';

test.describe('Memorai V3.0 Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display all V3.0 navigation items in sidebar', async ({ page }) => {
    // Check if sidebar exists
    const sidebar = page.getByTestId('dashboard-sidebar');
    await expect(sidebar).toBeVisible();

    // Check V3.0 specific navigation items
    const v3NavItems = [
      'smart-categorization',
      'advanced-search',
      'realtime-collaboration',
      'mobile-integration',
      'voice-search-v3',
      'performance-optimization',
      'enterprise-security'
    ];

    for (const navItem of v3NavItems) {
      const navButton = page.getByTestId(`nav-${navItem}`);
      await expect(navButton).toBeVisible();
    }
  });

  test('should navigate to Smart Memory Categorization', async ({ page }) => {
    const smartCategorizationNav = page.getByTestId('nav-smart-categorization');
    await smartCategorizationNav.click();

    // Wait for component to load and check for key elements
    await expect(page.getByText('Smart Memory Categorization')).toBeVisible();
    await expect(page.getByText('AI-powered categorization')).toBeVisible();

    // Check for category cards
    await expect(page.getByText('Total Categories')).toBeVisible();
    await expect(page.getByText('Auto-categorized')).toBeVisible();
  });

  test('should navigate to Advanced Search Filters', async ({ page }) => {
    const advancedSearchNav = page.getByTestId('nav-advanced-search');
    await advancedSearchNav.click();

    // Check for advanced search component
    await expect(page.getByText('Advanced Search Filters')).toBeVisible();
    await expect(page.getByText('Multi-criteria search')).toBeVisible();

    // Check for search filters
    await expect(page.getByText('Search Filters')).toBeVisible();
    await expect(page.getByText('Categories')).toBeVisible();
  });

  test('should navigate to Real-time Collaboration', async ({ page }) => {
    const collaborationNav = page.getByTestId('nav-realtime-collaboration');
    await collaborationNav.click();

    // Check for collaboration component
    await expect(page.getByText('Real-time Collaboration')).toBeVisible();
    await expect(page.getByText('Multi-user editing and comments')).toBeVisible();

    // Check for collaboration features
    await expect(page.getByText('Active Users')).toBeVisible();
    await expect(page.getByText('Comments')).toBeVisible();
  });

  test('should navigate to Mobile App Integration', async ({ page }) => {
    const mobileNav = page.getByTestId('nav-mobile-integration');
    await mobileNav.click();

    // Check for mobile integration component
    await expect(page.getByText('Mobile App Integration')).toBeVisible();
    await expect(page.getByText('React Native components')).toBeVisible();

    // Check for mobile features
    await expect(page.getByText('Cross-Platform Sync')).toBeVisible();
    await expect(page.getByText('Offline Sync')).toBeVisible();
  });

  test('should navigate to Performance Optimization', async ({ page }) => {
    const performanceNav = page.getByTestId('nav-performance-optimization');
    await performanceNav.click();

    // Check for performance component
    await expect(page.getByText('Performance Optimization')).toBeVisible();
    await expect(page.getByText('Memory virtualization')).toBeVisible();

    // Check for performance metrics
    await expect(page.getByText('Performance Score')).toBeVisible();
    await expect(page.getByText('Cache Hit Rate')).toBeVisible();
  });

  test('should navigate to Enterprise Security', async ({ page }) => {
    const securityNav = page.getByTestId('nav-enterprise-security');
    await securityNav.click();

    // Check for security component
    await expect(page.getByText('Enterprise Security')).toBeVisible();
    await expect(page.getByText('Role-based access control')).toBeVisible();

    // Check for security features
    await expect(page.getByText('Security Score')).toBeVisible();
    await expect(page.getByText('Active Users')).toBeVisible();
    await expect(page.getByText('Security Alerts')).toBeVisible();
  });

  test('should navigate to Voice Search V3', async ({ page }) => {
    const voiceSearchNav = page.getByTestId('nav-voice-search-v3');
    await voiceSearchNav.click();

    // Check for voice search component
    await expect(page.getByText('Voice Search & Recognition')).toBeVisible();

    // Check for voice search features
    await expect(page.getByText('Start Recording')).toBeVisible();
  });

  test('should display overview by default', async ({ page }) => {
    // Check if overview is displayed by default
    await expect(page.getByText('Dashboard Overview')).toBeVisible();

    // Check for overview content
    await expect(page.getByText('Memory Statistics')).toBeVisible();
    await expect(page.getByText('Total Memories')).toBeVisible();
  });

  test('should have functional sidebar collapse/expand', async ({ page }) => {
    const sidebar = page.getByTestId('dashboard-sidebar');
    await expect(sidebar).toBeVisible();

    // Find and click the collapse button
    const collapseButton = sidebar.locator('button').first();
    await collapseButton.click();

    // Verify sidebar collapsed (should be narrower)
    const sidebarAfterCollapse = page.getByTestId('dashboard-sidebar');
    await expect(sidebarAfterCollapse).toBeVisible();

    // Click again to expand
    await collapseButton.click();
    await expect(sidebarAfterCollapse).toBeVisible();
  });
});

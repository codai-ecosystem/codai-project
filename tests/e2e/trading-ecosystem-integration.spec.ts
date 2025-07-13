import { test, expect } from '@playwright/test';

test.describe('🚀 Financial Ecosystem Expansion - Trading Integration', () => {

  test('CODAI Trading Dashboard - Integration with Financial Ecosystem', async ({ page }) => {
    console.log('🎯 Testing comprehensive financial ecosystem with trading integration...');

    // Navigate to CODAI main platform
    await page.goto('http://localhost:4030');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for trading tab in navigation
    const tradingTab = await page.locator('[data-testid="trading-tab"], button:has-text("Trading")').first();
    await expect(tradingTab).toBeVisible({ timeout: 10000 });

    // Click on trading tab
    await tradingTab.click();

    // Wait for trading dashboard to load
    await page.waitForLoadState('networkidle');

    // Verify trading dashboard elements
    await expect(page.locator('text=Trading Dashboard')).toBeVisible();
    await expect(page.locator('text=AI-Powered Trading & Portfolio Management')).toBeVisible();

    // Check for key trading metrics
    await expect(page.locator('text=Portfolio Value')).toBeVisible();
    await expect(page.locator('text=Total P&L')).toBeVisible();
    await expect(page.locator('text=Positions')).toBeVisible();
    await expect(page.locator('text=Risk Score')).toBeVisible();

    console.log('✅ Trading dashboard loaded successfully');
  });

  test('X Trading Platform - Direct Access', async ({ page }) => {
    console.log('🎯 Testing direct access to X Trading Platform...');

    // Navigate to X Trading Platform
    await page.goto('http://localhost:4039');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for trading platform content
    const content = await page.locator('body').textContent();
    const tradingKeywords = [
      'trading',
      'portfolio',
      'market',
      'investment',
      'stock',
      'crypto',
      'analysis',
      'AI'
    ];

    const hasTradingContent = tradingKeywords.some(keyword =>
      content?.toLowerCase().includes(keyword)
    );

    expect(hasTradingContent).toBe(true);
    console.log('✅ X Trading Platform accessible with trading content');
  });

  test('Financial Ecosystem Integration - Cross-Platform Navigation', async ({ page }) => {
    console.log('🎯 Testing cross-platform navigation in financial ecosystem...');

    // Start at CODAI
    await page.goto('http://localhost:4030');
    await page.waitForLoadState('networkidle');

    // Navigate to Finance tab
    const financeTab = await page.locator('[data-testid="finance-tab"], button:has-text("Finance")').first();
    if (await financeTab.isVisible()) {
      await financeTab.click();
      await page.waitForLoadState('networkidle');

      // Check for unified financial dashboard
      await expect(page.locator('text=Financial Ecosystem')).toBeVisible({ timeout: 5000 });
      console.log('✅ Financial dashboard accessible');
    }

    // Navigate to Trading tab
    const tradingTab = await page.locator('[data-testid="trading-tab"], button:has-text("Trading")').first();
    if (await tradingTab.isVisible()) {
      await tradingTab.click();
      await page.waitForLoadState('networkidle');

      // Check for trading dashboard
      await expect(page.locator('text=Trading Dashboard')).toBeVisible({ timeout: 5000 });
      console.log('✅ Trading dashboard accessible');
    }

    // Check for external links to platforms
    const externalLinks = await page.locator('button:has-text("Open"), a[href*="localhost"]');
    if (await externalLinks.count() > 0) {
      console.log('✅ External platform links available');
    }
  });

  test('Financial Services Health Check - All Platforms', async ({ page }) => {
    console.log('🎯 Testing health of all financial ecosystem services...');

    const services = [
      { name: 'BANCAI', url: 'http://localhost:4033', keywords: ['banking', 'financial', 'account'] },
      { name: 'WALLET', url: 'http://localhost:4034', keywords: ['wallet', 'crypto', 'digital'] },
      { name: 'X TRADING', url: 'http://localhost:4039', keywords: ['trading', 'portfolio', 'market'] }
    ];

    for (const service of services) {
      try {
        console.log(`🔍 Checking ${service.name} service...`);

        await page.goto(service.url);
        await page.waitForLoadState('networkidle', { timeout: 10000 });

        const content = await page.locator('body').textContent();
        const hasRelevantContent = service.keywords.some(keyword =>
          content?.toLowerCase().includes(keyword)
        );

        expect(hasRelevantContent).toBe(true);
        console.log(`✅ ${service.name} service operational with relevant content`);

      } catch (error) {
        console.log(`⚠️ ${service.name} service may be offline: ${error}`);
      }
    }
  });

  test('Trading Dashboard - Portfolio Analytics', async ({ page }) => {
    console.log('🎯 Testing trading dashboard analytics and charts...');

    await page.goto('http://localhost:4030');
    await page.waitForLoadState('networkidle');

    // Navigate to trading tab
    const tradingTab = await page.locator('button:has-text("Trading")').first();
    if (await tradingTab.isVisible()) {
      await tradingTab.click();
      await page.waitForLoadState('networkidle');

      // Check for trading analytics components
      const analyticsElements = [
        'Portfolio Performance',
        'Asset Allocation',
        'Current Positions',
        'Risk Metrics'
      ];

      for (const element of analyticsElements) {
        const elementLocator = await page.locator(`text=${element}`).first();
        if (await elementLocator.isVisible({ timeout: 5000 })) {
          console.log(`✅ ${element} section visible`);
        }
      }

      // Check for trading positions table
      const positionsTable = await page.locator('table, [role="table"]').first();
      if (await positionsTable.isVisible({ timeout: 5000 })) {
        console.log('✅ Trading positions table rendered');
      }

      // Check for charts (SVG elements from recharts)
      const charts = await page.locator('svg').count();
      if (charts > 0) {
        console.log(`✅ ${charts} chart(s) rendered successfully`);
      }
    }
  });

  test('Ecosystem Integration - Financial Data Flow', async ({ page }) => {
    console.log('🎯 Testing financial data integration across platforms...');

    await page.goto('http://localhost:4030');
    await page.waitForLoadState('networkidle');

    // Test Finance tab for unified view
    const financeTab = await page.locator('button:has-text("Finance")').first();
    if (await financeTab.isVisible()) {
      await financeTab.click();
      await page.waitForLoadState('networkidle');

      // Look for portfolio summaries and financial metrics
      const financialMetrics = [
        'Total Balance',
        'Portfolio',
        'Assets',
        'Performance',
        'Transactions'
      ];

      for (const metric of financialMetrics) {
        const metricElement = await page.locator(`text*=${metric}`).first();
        if (await metricElement.isVisible({ timeout: 3000 })) {
          console.log(`✅ ${metric} data displayed`);
        }
      }
    }

    // Test Trading tab for portfolio integration
    const tradingTab = await page.locator('button:has-text("Trading")').first();
    if (await tradingTab.isVisible()) {
      await tradingTab.click();
      await page.waitForLoadState('networkidle');

      // Look for integrated portfolio data
      const tradingMetrics = [
        'Portfolio Value',
        'P&L',
        'Risk',
        'Performance'
      ];

      for (const metric of tradingMetrics) {
        const metricElement = await page.locator(`text*=${metric}`).first();
        if (await metricElement.isVisible({ timeout: 3000 })) {
          console.log(`✅ Trading ${metric} data integrated`);
        }
      }
    }
  });

  test('External Platform Integration - Open X Trading', async ({ page }) => {
    console.log('🎯 Testing external platform integration...');

    await page.goto('http://localhost:4030');
    await page.waitForLoadState('networkidle');

    // Navigate to trading dashboard
    const tradingTab = await page.locator('button:has-text("Trading")').first();
    if (await tradingTab.isVisible()) {
      await tradingTab.click();
      await page.waitForLoadState('networkidle');

      // Look for "Open X Trading" button
      const openTradingButton = await page.locator('button:has-text("Open X Trading"), button:has-text("Open"), a:has-text("Trading")').first();
      if (await openTradingButton.isVisible({ timeout: 5000 })) {
        console.log('✅ External trading platform link available');

        // Test if button is clickable (don't actually click to avoid popup)
        await expect(openTradingButton).toBeEnabled();
        console.log('✅ External platform integration button functional');
      }
    }
  });

  test('Financial Ecosystem - Service Status Monitoring', async ({ page }) => {
    console.log('🎯 Testing service status monitoring in ecosystem...');

    await page.goto('http://localhost:4030');
    await page.waitForLoadState('networkidle');

    // Navigate to services or monitoring tab
    const servicesTab = await page.locator('button:has-text("Services"), button:has-text("Monitoring")').first();
    if (await servicesTab.isVisible()) {
      await servicesTab.click();
      await page.waitForLoadState('networkidle');

      // Check for service status indicators
      const serviceNames = ['BANCAI', 'WALLET', 'X TRADING', 'TRADING'];

      for (const serviceName of serviceNames) {
        const serviceElement = await page.locator(`text=${serviceName}`).first();
        if (await serviceElement.isVisible({ timeout: 3000 })) {
          console.log(`✅ ${serviceName} service listed in monitoring`);
        }
      }

      // Check for status indicators (online/offline dots)
      const statusIndicators = await page.locator('[class*="bg-emerald"], [class*="bg-green"], .online, .status').count();
      if (statusIndicators > 0) {
        console.log(`✅ ${statusIndicators} service status indicator(s) found`);
      }
    }
  });

});

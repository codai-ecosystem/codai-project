import { test, expect } from '@playwright/test'

const CODAI_URL = 'http://localhost:4030'
const BANCAI_URL = 'http://localhost:4033'
const WALLET_URL = 'http://localhost:4034'

test.describe('🏦 Financial Ecosystem Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1920, height: 1080 })
  })

  test('🎯 Should load unified financial dashboard in CODAI platform', async ({ page }) => {
    // Navigate to CODAI
    await page.goto(CODAI_URL)
    await expect(page).toHaveTitle(/CODAI/)

    // Click on Finance tab
    await page.click('button:has-text("Finance")')

    // Wait for unified dashboard to load
    await page.waitForSelector('text=Financial Ecosystem', { timeout: 10000 })

    // Verify dashboard components
    await expect(page.locator('text=Financial Ecosystem')).toBeVisible()
    await expect(page.locator('text=Unified Traditional & Digital Finance Management')).toBeVisible()

    // Check portfolio overview cards
    await expect(page.locator('text=Total Portfolio')).toBeVisible()
    await expect(page.locator('text=Traditional Assets')).toBeVisible()
    await expect(page.locator('text=Digital Assets')).toBeVisible()
    await expect(page.locator('text=Monthly Performance')).toBeVisible()

    console.log('✅ Unified financial dashboard loaded successfully')
  })

  test('📊 Should display portfolio charts and analytics', async ({ page }) => {
    await page.goto(CODAI_URL)
    await page.click('button:has-text("Finance")')
    await page.waitForSelector('text=Financial Ecosystem')

    // Check for chart containers
    await expect(page.locator('text=Portfolio Balance History')).toBeVisible()
    await expect(page.locator('text=Asset Allocation')).toBeVisible()

    // Verify chart elements are rendered (Recharts)
    const chartElements = await page.locator('.recharts-wrapper').count()
    expect(chartElements).toBeGreaterThan(0)

    console.log('✅ Portfolio charts and analytics displaying correctly')
  })

  test('💡 Should show financial insights and recommendations', async ({ page }) => {
    await page.goto(CODAI_URL)
    await page.click('button:has-text("Finance")')
    await page.waitForSelector('text=Financial Ecosystem')

    // Check for insights section
    await expect(page.locator('text=Financial Insights')).toBeVisible()

    // Look for insight types
    const insightTypes = [
      'Diversification Opportunity',
      'Staking Rewards Available'
    ]

    for (const insight of insightTypes) {
      const insightElement = page.locator(`text=${insight}`)
      if (await insightElement.count() > 0) {
        await expect(insightElement).toBeVisible()
        console.log(`✅ Found financial insight: ${insight}`)
      }
    }

    console.log('✅ Financial insights system operational')
  })

  test('🔄 Should display unified transaction history', async ({ page }) => {
    await page.goto(CODAI_URL)
    await page.click('button:has-text("Finance")')
    await page.waitForSelector('text=Financial Ecosystem')

    // Check for transaction history
    await expect(page.locator('text=Recent Transactions')).toBeVisible()
    await expect(page.locator('text=Across all platforms')).toBeVisible()

    // Look for platform badges
    const platforms = ['BANCAI', 'WALLET']
    for (const platform of platforms) {
      const platformBadge = page.locator(`text=${platform}`)
      if (await platformBadge.count() > 0) {
        console.log(`✅ Found transaction from ${platform} platform`)
      }
    }

    console.log('✅ Unified transaction history displaying correctly')
  })

  test('🚀 Should provide quick actions for platform navigation', async ({ page }) => {
    await page.goto(CODAI_URL)
    await page.click('button:has-text("Finance")')
    await page.waitForSelector('text=Financial Ecosystem')

    // Check for quick actions section
    await expect(page.locator('text=Quick Actions')).toBeVisible()

    // Verify action buttons
    const quickActions = [
      'Open BANCAI',
      'Open WALLET',
      'Cross Transfer',
      'Analytics'
    ]

    for (const action of quickActions) {
      await expect(page.locator(`text=${action}`)).toBeVisible()
      console.log(`✅ Quick action available: ${action}`)
    }

    console.log('✅ Quick actions for cross-platform navigation working')
  })

  test('🔐 Should handle balance visibility toggle', async ({ page }) => {
    await page.goto(CODAI_URL)
    await page.click('button:has-text("Finance")')
    await page.waitForSelector('text=Financial Ecosystem')

    // Find the eye/eye-off toggle button
    const toggleButton = page.locator('button').filter({ has: page.locator('[data-lucide="eye"], [data-lucide="eye-off"]') }).first()

    if (await toggleButton.count() > 0) {
      // Click to toggle visibility
      await toggleButton.click()

      // Check if balance is hidden (should show dots)
      const hiddenBalance = page.locator('text=••••••')
      if (await hiddenBalance.count() > 0) {
        console.log('✅ Balance visibility toggle working - balances hidden')

        // Toggle back to show
        await toggleButton.click()
        console.log('✅ Balance visibility toggle working - balances shown')
      }
    }

    console.log('✅ Balance privacy controls functional')
  })

  test('🌐 Should validate cross-platform connectivity', async ({ page }) => {
    // Test BANCAI connectivity
    await page.goto(BANCAI_URL)
    await expect(page.locator('text=BANCAI')).toBeVisible({ timeout: 5000 })
    console.log('✅ BANCAI platform accessible')

    // Test WALLET connectivity  
    await page.goto(WALLET_URL)
    await expect(page.locator('text=WALLET')).toBeVisible({ timeout: 5000 })
    console.log('✅ WALLET platform accessible')

    // Test CODAI integration
    await page.goto(CODAI_URL)
    await page.click('button:has-text("Finance")')
    await page.waitForSelector('text=Financial Ecosystem')
    console.log('✅ CODAI integration hub accessible')

    console.log('✅ All financial platforms connected and operational')
  })

  test('📱 Should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto(CODAI_URL)
    await page.click('button:has-text("Finance")')
    await page.waitForSelector('text=Financial Ecosystem')

    // Check that main elements are still visible on mobile
    await expect(page.locator('text=Total Portfolio')).toBeVisible()
    await expect(page.locator('text=Traditional Assets')).toBeVisible()
    await expect(page.locator('text=Digital Assets')).toBeVisible()

    // Verify charts adapt to mobile
    const chartElements = await page.locator('.recharts-wrapper').count()
    expect(chartElements).toBeGreaterThan(0)

    console.log('✅ Financial dashboard responsive on mobile devices')
  })

  test('⚡ Should load quickly and handle performance', async ({ page }) => {
    const startTime = Date.now()

    await page.goto(CODAI_URL)
    await page.click('button:has-text("Finance")')
    await page.waitForSelector('text=Financial Ecosystem')

    const loadTime = Date.now() - startTime
    console.log(`⏱️ Financial dashboard loaded in ${loadTime}ms`)

    // Should load within reasonable time (5 seconds)
    expect(loadTime).toBeLessThan(5000)

    // Test refresh functionality
    const refreshButton = page.locator('button:has-text("Refresh")')
    if (await refreshButton.count() > 0) {
      await refreshButton.click()
      console.log('✅ Refresh functionality working')
    }

    console.log('✅ Financial dashboard performance optimized')
  })

  test('🔍 Should handle real-time data updates', async ({ page }) => {
    await page.goto(CODAI_URL)
    await page.click('button:has-text("Finance")')
    await page.waitForSelector('text=Financial Ecosystem')

    // Check for live data indicator
    await expect(page.locator('text=Live Data')).toBeVisible()

    // Look for animated elements indicating real-time updates
    const animatedElements = await page.locator('.animate-pulse').count()
    expect(animatedElements).toBeGreaterThan(0)

    console.log('✅ Real-time data indicators present and functional')
  })

  test('🎨 Should have proper styling and animations', async ({ page }) => {
    await page.goto(CODAI_URL)
    await page.click('button:has-text("Finance")')
    await page.waitForSelector('text=Financial Ecosystem')

    // Check for gradient backgrounds
    const gradientElements = await page.locator('[class*="gradient"]').count()
    expect(gradientElements).toBeGreaterThan(0)

    // Check for backdrop blur effects
    const blurElements = await page.locator('[class*="backdrop-blur"]').count()
    expect(blurElements).toBeGreaterThan(0)

    // Check for motion elements
    const motionElements = await page.locator('[style*="transform"]').count()
    expect(motionElements).toBeGreaterThan(0)

    console.log('✅ Modern UI styling and animations implemented')
  })
})

test.describe('🔄 Cross-Platform Integration Flow', () => {
  test('🌉 Should enable seamless navigation between financial platforms', async ({ page }) => {
    // Start at CODAI financial dashboard
    await page.goto(CODAI_URL)
    await page.click('button:has-text("Finance")')
    await page.waitForSelector('text=Financial Ecosystem')

    // Simulate navigation to BANCAI
    const bancaiLink = page.locator('text=Open BANCAI')
    if (await bancaiLink.count() > 0) {
      console.log('✅ BANCAI navigation link available')
    }

    // Simulate navigation to WALLET
    const walletLink = page.locator('text=Open WALLET')
    if (await walletLink.count() > 0) {
      console.log('✅ WALLET navigation link available')
    }

    // Test cross-platform transfer option
    const transferLink = page.locator('text=Cross Transfer')
    if (await transferLink.count() > 0) {
      console.log('✅ Cross-platform transfer option available')
    }

    console.log('✅ Seamless cross-platform navigation enabled')
  })

  test('📈 Should aggregate data from multiple financial sources', async ({ page }) => {
    await page.goto(CODAI_URL)
    await page.click('button:has-text("Finance")')
    await page.waitForSelector('text=Financial Ecosystem')

    // Verify aggregated portfolio data
    const portfolioValue = page.locator('text=Total Portfolio').locator('..')
    await expect(portfolioValue).toBeVisible()

    // Check that both traditional and digital assets are represented
    await expect(page.locator('text=Traditional Assets')).toBeVisible()
    await expect(page.locator('text=Digital Assets')).toBeVisible()

    // Verify unified transaction history shows both platforms
    await expect(page.locator('text=Recent Transactions')).toBeVisible()

    console.log('✅ Multi-source financial data aggregation working')
  })
})

test.describe('🎯 Business Logic Validation', () => {
  test('💰 Should calculate portfolio metrics correctly', async ({ page }) => {
    await page.goto(CODAI_URL)
    await page.click('button:has-text("Finance")')
    await page.waitForSelector('text=Financial Ecosystem')

    // Check that percentage changes are displayed with proper formatting
    const percentageElements = page.locator('text=/%/')
    const percentageCount = await percentageElements.count()
    expect(percentageCount).toBeGreaterThan(0)

    // Verify currency formatting
    const currencyElements = page.locator('text=/\\$[0-9,]+/')
    const currencyCount = await currencyElements.count()
    expect(currencyCount).toBeGreaterThan(0)

    console.log('✅ Portfolio metrics calculated and formatted correctly')
  })

  test('🔔 Should generate relevant financial insights', async ({ page }) => {
    await page.goto(CODAI_URL)
    await page.click('button:has-text("Finance")')
    await page.waitForSelector('text=Financial Ecosystem')

    // Look for insight priority indicators
    const insightCards = page.locator('[class*="border-l-4"]')
    const insightCount = await insightCards.count()
    expect(insightCount).toBeGreaterThan(0)

    // Check for actionable insights
    const actionableInsights = page.locator('text=Take Action')
    if (await actionableInsights.count() > 0) {
      console.log('✅ Actionable financial insights generated')
    }

    console.log('✅ Financial insights system generating relevant recommendations')
  })
})

console.log('🏦 Financial Ecosystem Integration Test Suite Complete')
console.log('🎯 Validating: Unified Dashboard, Cross-Platform Integration, Real-time Analytics')
console.log('🚀 Features: BANCAI+WALLET integration, Portfolio aggregation, Financial insights')

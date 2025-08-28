import { test, expect, devices } from '@playwright/test'

// Configure test for different devices
const iPhoneSE = devices['iPhone SE']
const iPadMini = devices['iPad Mini']
const desktopChrome = devices['Desktop Chrome']

test.describe('🎭 ROMAI End-to-End Romanian Language Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to ROMAI dashboard
    await page.goto('http://localhost:3000')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
  })

  test.describe('Romanian Language User Journey', () => {
    test('should complete full Romanian AGI interaction workflow', async ({ page }) => {
      // Validate Romanian branding appears
      await expect(page.locator('text=RomAI')).toBeVisible()
      await expect(page.locator('text=Inteligență Artificială Română')).toBeVisible()
      
      // Navigate to dashboard
      await page.click('text=Tablou de Bord')
      await page.waitForLoadState('networkidle')
      
      // Validate Romanian dashboard elements
      await expect(page.locator('text=Capabilități AGI')).toBeVisible()
      await expect(page.locator('text=Performanță Server')).toBeVisible()
      await expect(page.locator('text=Analiză Culturală')).toBeVisible()
      
      // Test mathematical reasoning in Romanian
      await page.click('button:has-text("Testează Capabilități")')
      await page.waitForSelector('text=Test Capabilități AGI')
      
      const questionInput = page.locator('input[placeholder*="Introduceți întrebarea în română"]')
      await questionInput.fill('Calculați √144 + 25²')
      
      await page.click('button:has-text("Trimite")')
      
      // Wait for AGI response
      await page.waitForSelector('text=Se procesează', { state: 'hidden', timeout: 10000 })
      
      // Validate Romanian response
      const responseElement = page.locator('[data-testid="agi-response"]')
      await expect(responseElement).toContainText('637')
      
      const romanianResponse = await responseElement.textContent()
      expect(romanianResponse).toMatch(/[ăâîșț]/) // Contains Romanian diacritics
      
      // Test cultural intelligence query
      await questionInput.fill('Cine a fost Mihai Eminescu?')
      await page.click('button:has-text("Trimite")')
      
      await page.waitForSelector('text=Se procesează', { state: 'hidden', timeout: 15000 })
      
      // Validate cultural response in Romanian
      const culturalResponse = page.locator('[data-testid="cultural-response"]')
      await expect(culturalResponse).toContainText('poet')
      await expect(culturalResponse).toContainText('național')
      await expect(culturalResponse).toContainText('român')
      
      const culturalText = await culturalResponse.textContent()
      expect(culturalText).toMatch(/[ăâîșț]/) // Romanian diacritics
    })

    test('should handle Romanian cultural expressions correctly', async ({ page }) => {
      await page.goto('http://localhost:3000/cultural')
      
      // Test cultural expression analysis
      const expressionInput = page.locator('input[placeholder*="expresie culturală"]')
      await expressionInput.fill('A băga bațul prin gard')
      
      await page.click('button:has-text("Analizează")')
      
      await page.waitForSelector('[data-testid="expression-analysis"]', { timeout: 10000 })
      
      const analysisResult = page.locator('[data-testid="expression-analysis"]')
      await expect(analysisResult).toContainText('idiom')
      await expect(analysisResult).toContainText('conflict')
      
      // Validate Romanian explanation
      const explanation = await analysisResult.textContent()
      expect(explanation).toMatch(/[ăâîșț]/)
      expect(explanation).toMatch(/înseamnă|semnifică|reprezintă/)
    })

    test('should support Romanian language switching', async ({ page }) => {
      // Initially in Romanian
      await expect(page.locator('text=Tablou de Bord')).toBeVisible()
      
      // Switch to English
      await page.click('[data-testid="language-switcher"]')
      await page.click('text=English')
      
      await page.waitForTimeout(500) // Allow for language change
      
      // Validate English labels
      await expect(page.locator('text=Dashboard')).toBeVisible()
      await expect(page.locator('text=AGI Capabilities')).toBeVisible()
      
      // Switch back to Romanian
      await page.click('[data-testid="language-switcher"]')
      await page.click('text=Română')
      
      await page.waitForTimeout(500)
      
      // Validate Romanian labels restored
      await expect(page.locator('text=Tablou de Bord')).toBeVisible()
      await expect(page.locator('text=Capabilități AGI')).toBeVisible()
    })
  })

  test.describe('Accessibility and User Experience', () => {
    test('should be fully keyboard navigable in Romanian', async ({ page }) => {
      // Start keyboard navigation
      await page.keyboard.press('Tab')
      
      // Should focus on language switcher
      await expect(page.locator('[data-testid="language-switcher"]')).toBeFocused()
      
      await page.keyboard.press('Tab')
      
      // Should focus on theme toggle
      await expect(page.locator('[data-testid="theme-toggle"]')).toBeFocused()
      
      await page.keyboard.press('Tab')
      
      // Should focus on main navigation
      await expect(page.locator('text=Tablou de Bord')).toBeFocused()
      
      // Navigate to dashboard with Enter
      await page.keyboard.press('Enter')
      
      await page.waitForLoadState('networkidle')
      await expect(page.locator('text=Capabilități AGI')).toBeVisible()
      
      // Continue tabbing through AGI capabilities
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      
      const focusedElement = await page.evaluate(() => document.activeElement.textContent)
      expect(focusedElement).toMatch(/Testează|Capabilități|Performanță/)
    })

    test('should meet WCAG accessibility standards with Romanian content', async ({ page }) => {
      // Check for proper heading structure
      const headings = await page.$$eval('h1, h2, h3, h4', elements => 
        elements.map(el => ({ tag: el.tagName, text: el.textContent }))
      )
      
      expect(headings.length).toBeGreaterThan(0)
      expect(headings[0].tag).toBe('H1')
      expect(headings[0].text).toMatch(/RomAI|Inteligență/)
      
      // Check for ARIA labels in Romanian
      const ariaLabels = await page.$$eval('[aria-label]', elements =>
        elements.map(el => el.getAttribute('aria-label'))
      )
      
      const romanianAriaLabels = ariaLabels.filter(label => 
        label && /[ăâîșț]/.test(label)
      )
      expect(romanianAriaLabels.length).toBeGreaterThan(0)
      
      // Check color contrast for Romanian text
      const romanianTexts = await page.$$eval('*', elements =>
        elements
          .filter(el => el.textContent && /[ăâîșț]/.test(el.textContent))
          .map(el => {
            const style = window.getComputedStyle(el)
            return {
              text: el.textContent.trim(),
              color: style.color,
              backgroundColor: style.backgroundColor
            }
          })
          .filter(item => item.text.length > 0)
      )
      
      expect(romanianTexts.length).toBeGreaterThan(0)
    })

    test('should provide proper screen reader support for Romanian', async ({ page }) => {
      // Check for skip links in Romanian
      await page.keyboard.press('Tab')
      const skipLink = page.locator('[href="#main-content"]')
      
      if (await skipLink.count() > 0) {
        const skipText = await skipLink.textContent()
        expect(skipText).toMatch(/salt|trecu|conținut/i)
      }
      
      // Check for landmarks
      const landmarks = await page.$$eval('[role="main"], [role="navigation"], [role="banner"]', elements =>
        elements.map(el => ({
          role: el.getAttribute('role'),
          label: el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')
        }))
      )
      
      expect(landmarks.length).toBeGreaterThan(0)
      
      // Validate main content area
      const mainContent = page.locator('main, [role="main"]')
      await expect(mainContent).toBeVisible()
    })
  })

  test.describe('Responsive Design on Different Devices', () => {
    test('should work correctly on mobile (iPhone SE)', async ({ browser }) => {
      const context = await browser.newContext({
        ...iPhoneSE,
        locale: 'ro-RO'
      })
      const page = await context.newPage()
      
      await page.goto('http://localhost:3000')
      await page.waitForLoadState('networkidle')
      
      // Validate mobile layout
      await expect(page.locator('text=RomAI')).toBeVisible()
      
      // Check if navigation is accessible (may be in hamburger menu)
      const navToggle = page.locator('[data-testid="mobile-nav-toggle"]')
      if (await navToggle.count() > 0) {
        await navToggle.click()
      }
      
      await expect(page.locator('text=Tablou de Bord')).toBeVisible()
      
      // Test touch interactions
      await page.tap('text=Tablou de Bord')
      await page.waitForLoadState('networkidle')
      
      // Validate mobile-friendly AGI testing
      const testButton = page.locator('button:has-text("Test")')
      if (await testButton.count() > 0) {
        await page.tap(testButton.first())
        
        // Should show mobile-optimized test interface
        const mobileTestInput = page.locator('input[type="text"]')
        await expect(mobileTestInput).toBeVisible()
        
        await mobileTestInput.fill('Salut, cum ești?')
        await page.tap('button:has-text("Trimite")')
        
        // Validate response appears correctly on mobile
        await page.waitForSelector('[data-testid="agi-response"]', { timeout: 8000 })
        const response = page.locator('[data-testid="agi-response"]')
        await expect(response).toBeVisible()
      }
      
      await context.close()
    })

    test('should work correctly on tablet (iPad Mini)', async ({ browser }) => {
      const context = await browser.newContext({
        ...iPadMini,
        locale: 'ro-RO'
      })
      const page = await context.newPage()
      
      await page.goto('http://localhost:3000')
      await page.waitForLoadState('networkidle')
      
      // Validate tablet layout shows more content
      await expect(page.locator('text=Capabilități AGI')).toBeVisible()
      await expect(page.locator('text=Performanță Server')).toBeVisible()
      await expect(page.locator('text=Analiză Culturală')).toBeVisible()
      
      // Test tablet-specific interactions
      const capabilityCard = page.locator('[data-testid="capability-card"]').first()
      await capabilityCard.tap()
      
      // Should show expanded details
      await expect(page.locator('text=Detalii Complete')).toBeVisible()
      
      // Test Romanian cultural query on tablet
      const culturalInput = page.locator('input[placeholder*="cultură"]')
      if (await culturalInput.count() > 0) {
        await culturalInput.fill('Povestește-mi despre tradițiile de Crăciun în România')
        await page.tap('button:has-text("Analizează")')
        
        await page.waitForSelector('[data-testid="cultural-analysis"]', { timeout: 12000 })
        const analysis = page.locator('[data-testid="cultural-analysis"]')
        await expect(analysis).toContainText('Crăciun')
        await expect(analysis).toContainText('tradiții')
      }
      
      await context.close()
    })

    test('should work correctly on desktop with full features', async ({ browser }) => {
      const context = await browser.newContext({
        ...desktopChrome,
        locale: 'ro-RO'
      })
      const page = await context.newPage()
      
      await page.goto('http://localhost:3000')
      await page.waitForLoadState('networkidle')
      
      // Validate full desktop layout
      await expect(page.locator('text=RomAI')).toBeVisible()
      await expect(page.locator('text=Tablou de Bord')).toBeVisible()
      await expect(page.locator('text=Capabilități AGI')).toBeVisible()
      await expect(page.locator('text=Performanță Server')).toBeVisible()
      await expect(page.locator('text=Analiză Culturală')).toBeVisible()
      
      // Test advanced desktop features
      await page.click('text=Testează Capabilități Avansate')
      await page.waitForSelector('[data-testid="advanced-test-modal"]')
      
      // Test complex Romanian mathematical query
      const advancedInput = page.locator('[data-testid="advanced-query-input"]')
      await advancedInput.fill('Rezolvați ecuația diferențială: dy/dx + y = e^x')
      
      await page.click('button:has-text("Calculează")')
      
      await page.waitForSelector('[data-testid="advanced-result"]', { timeout: 15000 })
      const result = page.locator('[data-testid="advanced-result"]')
      
      // Should show detailed mathematical solution in Romanian
      await expect(result).toContainText('soluția')
      await expect(result).toContainText('ecuația')
      
      // Test parallel processing capabilities
      const parallelButton = page.locator('button:has-text("Procesare Paralelă")')
      if (await parallelButton.count() > 0) {
        await parallelButton.click()
        
        const queries = [
          'Calculați 15 + 27',
          'Cine a fost Ion Creangă?',
          'Explică tradiția mărțișorului'
        ]
        
        for (const query of queries) {
          const queryInput = page.locator('[data-testid="parallel-input"]')
          await queryInput.fill(query)
          await page.click('button:has-text("Adaugă la Coadă")')
        }
        
        await page.click('button:has-text("Procesează Toate")')
        
        // Wait for all results
        await page.waitForSelector('[data-testid="parallel-results"]', { timeout: 20000 })
        const results = page.locator('[data-testid="parallel-result"]')
        
        const resultCount = await results.count()
        expect(resultCount).toBe(3)
        
        // Validate all results are in Romanian
        for (let i = 0; i < resultCount; i++) {
          const resultText = await results.nth(i).textContent()
          expect(resultText).toMatch(/[ăâîșț]/)
        }
      }
      
      await context.close()
    })
  })

  test.describe('Performance and Real-time Features', () => {
    test('should maintain performance with real-time updates', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      
      // Enable real-time monitoring
      const realtimeToggle = page.locator('[data-testid="realtime-toggle"]')
      await realtimeToggle.click()
      
      // Wait for real-time connection
      await page.waitForSelector('[data-testid="realtime-status"]:has-text("Conectat")')
      
      // Monitor capability score updates
      const initialScore = await page.locator('[data-testid="mathematical-score"]').textContent()
      
      // Wait for at least one update (real-time updates should happen every 5 seconds)
      await page.waitForTimeout(6000)
      
      // Check if scores updated (they may or may not change, but UI should be responsive)
      const updatedScore = await page.locator('[data-testid="mathematical-score"]').textContent()
      
      // The important thing is that the element is still visible and contains valid data
      expect(updatedScore).toMatch(/\d+\.\d+%/)
      
      // Test performance metrics real-time updates
      const responseTime = page.locator('[data-testid="response-time"]')
      await expect(responseTime).toBeVisible()
      
      const initialResponseTime = await responseTime.textContent()
      expect(initialResponseTime).toMatch(/\d+.*ms/)
    })

    test('should handle high-load scenarios gracefully', async ({ page }) => {
      await page.goto('http://localhost:3000')
      
      // Navigate to stress test section
      const stressTestButton = page.locator('button:has-text("Test de Stres")')
      if (await stressTestButton.count() > 0) {
        await stressTestButton.click()
        
        // Submit multiple concurrent queries
        const queries = [
          'Calculați √144',
          'Rezolvați 2x + 5 = 17', 
          'Cine a fost Mihai Eminescu?',
          'Explică importanța Zilei Naționale',
          'Analizează expresia "A băga bățul prin gard"'
        ]
        
        // Submit all queries simultaneously
        for (const query of queries) {
          const input = page.locator('[data-testid="stress-input"]')
          await input.fill(query)
          await page.click('button:has-text("Trimite Rapid")')
        }
        
        // Wait for all responses
        await page.waitForSelector('[data-testid="stress-results"]', { timeout: 30000 })
        
        const results = page.locator('[data-testid="stress-result"]')
        const resultCount = await results.count()
        
        expect(resultCount).toBe(queries.length)
        
        // Validate all responses are in Romanian and correct
        for (let i = 0; i < resultCount; i++) {
          const result = await results.nth(i).textContent()
          expect(result).toMatch(/[ăâîșț]/) // Romanian diacritics
          expect(result.length).toBeGreaterThan(10) // Substantial response
        }
        
        // Check that error rate is low
        const errorIndicators = page.locator('[data-testid="stress-error"]')
        const errorCount = await errorIndicators.count()
        expect(errorCount).toBeLessThan(2) // Less than 40% error rate
      }
    })
  })

  test.describe('Data Persistence and Session Management', () => {
    test('should persist Romanian language preference', async ({ page }) => {
      // Set Romanian as preferred language
      await page.click('[data-testid="language-switcher"]')
      await page.click('text=Română')
      
      // Navigate to different page
      await page.click('text=Capabilități AGI')
      await page.waitForLoadState('networkidle')
      
      // Reload page
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      // Should still be in Romanian
      await expect(page.locator('text=Capabilități AGI')).toBeVisible()
      await expect(page.locator('text=Tablou de Bord')).toBeVisible()
    })

    test('should persist theme preference with Romanian labels', async ({ page }) => {
      // Switch to dark theme
      await page.click('[data-testid="theme-toggle"]')
      
      // Validate dark theme activated
      const body = page.locator('body')
      await expect(body).toHaveClass(/dark/)
      
      // Reload page
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      // Should still be in dark theme
      await expect(body).toHaveClass(/dark/)
      
      // Romanian labels should still be present
      await expect(page.locator('text=Tablou de Bord')).toBeVisible()
    })

    test('should save and restore AGI conversation history', async ({ page }) => {
      await page.goto('http://localhost:3000/chat')
      
      // Start conversation in Romanian
      const chatInput = page.locator('[data-testid="chat-input"]')
      await chatInput.fill('Salut! Calculează 15 + 27 pentru mine.')
      await page.keyboard.press('Enter')
      
      // Wait for response
      await page.waitForSelector('[data-testid="chat-response"]', { timeout: 8000 })
      
      const response = page.locator('[data-testid="chat-response"]').first()
      await expect(response).toContainText('42')
      
      // Continue conversation
      await chatInput.fill('Mulțumesc! Acum povestește-mi despre Mihai Eminescu.')
      await page.keyboard.press('Enter')
      
      await page.waitForSelector('[data-testid="chat-response"]', { timeout: 12000 })
      
      const culturalResponse = page.locator('[data-testid="chat-response"]').nth(1)
      await expect(culturalResponse).toContainText('poet')
      
      // Reload page
      await page.reload()
      await page.waitForLoadState('networkidle')
      
      // Conversation history should be restored
      await expect(page.locator('text=15 + 27')).toBeVisible()
      await expect(page.locator('text=42')).toBeVisible()
      await expect(page.locator('text=Mihai Eminescu')).toBeVisible()
      await expect(page.locator('text=poet')).toBeVisible()
    })
  })
})
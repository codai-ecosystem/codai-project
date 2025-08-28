/**
 * E2E Tests for ROMAI AGI Conversation Interface
 * Complete user workflow testing for Romanian cultural intelligence
 */

import { test, expect } from '@playwright/test'

test.describe('ROMAI AGI Conversation E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the conversation page
    await page.goto('/')

    // Wait for the page to load completely
    await expect(page.getByText('RomAI')).toBeVisible()
  })

  test.describe('Basic Conversation Flow', () => {
    test('complete Romanian conversation workflow', async ({ page }) => {
      // Check initial page state
      await expect(page.getByRole('heading', { name: /romai/i })).toBeVisible()
      await expect(page.getByPlaceholder(/scrie mesajul/i)).toBeVisible()

      // Start conversation with Romanian greeting
      const chatInput = page.getByPlaceholder(/scrie mesajul/i)
      const sendButton = page.getByRole('button', { name: /trimite/i })

      await chatInput.fill('Bună ziua! Cum vă simțiți astăzi?')
      await sendButton.click()

      // Verify user message appears
      await expect(page.getByTestId('user-message')).toContainText('Bună ziua! Cum vă simțiți astăzi?')

      // Wait for AGI response
      await expect(page.getByTestId('agi-message')).toBeVisible({ timeout: 10000 })
      await expect(page.getByTestId('agi-message')).toContainText(/bună ziua/i)

      // Verify cultural intelligence indicators
      await expect(page.getByTestId('cultural-analysis')).toBeVisible()
      await expect(page.getByText(/formality: formal/i)).toBeVisible()
      await expect(page.getByTestId('confidence-score')).toBeVisible()

      // Continue conversation with a reasoning question
      await chatInput.fill('Dacă toate rozele sunt flori și aceasta este o roză, ce putem concluziona?')
      await sendButton.click()

      // Verify reasoning response
      await expect(page.getByTestId('reasoning-steps')).toBeVisible({ timeout: 15000 })
      await expect(page.getByText(/aceasta este o floare/i)).toBeVisible()

      // Verify reasoning chain is displayed
      const reasoningSteps = page.getByTestId('reasoning-steps')
      await expect(reasoningSteps.getByText(/premisă majoră/i)).toBeVisible()
      await expect(reasoningSteps.getByText(/premisă minoră/i)).toBeVisible()
      await expect(reasoningSteps.getByText(/concluzie/i)).toBeVisible()
    })

    test('handles cultural knowledge questions', async ({ page }) => {
      const culturalQuestions = [
        {
          question: 'Ce sărbătorim pe 1 decembrie în România?',
          expectedKeywords: ['ziua națională', 'marea unire']
        },
        {
          question: 'Cine a scris "Luceafărul"?',
          expectedKeywords: ['mihai eminescu', 'poet']
        },
        {
          question: 'Ce ingrediente are mămăliga?',
          expectedKeywords: ['mălai', 'apă', 'sare']
        }
      ]

      const chatInput = page.getByPlaceholder(/scrie mesajul/i)
      const sendButton = page.getByRole('button', { name: /trimite/i })

      for (const q of culturalQuestions) {
        await chatInput.fill(q.question)
        await sendButton.click()

        // Wait for response
        const responseLocator = page.getByTestId('agi-message').last()
        await expect(responseLocator).toBeVisible({ timeout: 10000 })

        // Check for expected keywords
        for (const keyword of q.expectedKeywords) {
          await expect(responseLocator).toContainText(new RegExp(keyword, 'i'))
        }

        // Verify cultural accuracy indicator
        await expect(page.getByTestId('cultural-accuracy')).toBeVisible()
        await expect(page.getByTestId('cultural-accuracy')).toContainText(/%/)

        // Small delay between questions
        await page.waitForTimeout(1000)
      }
    })

    test('processes mathematical questions in Romanian', async ({ page }) => {
      const mathQuestions = [
        {
          question: 'Calculează rădăcina pătrată din 144.',
          expectedAnswer: '12'
        },
        {
          question: 'Rezolvă ecuația: 2x + 6 = 14',
          expectedAnswer: '4'
        },
        {
          question: 'Câte grade are suma unghiurilor unui triunghi?',
          expectedAnswer: '180'
        }
      ]

      const chatInput = page.getByPlaceholder(/scrie mesajul/i)
      const sendButton = page.getByRole('button', { name: /trimite/i })

      for (const q of mathQuestions) {
        await chatInput.fill(q.question)
        await sendButton.click()

        // Wait for mathematical reasoning response
        const responseLocator = page.getByTestId('agi-message').last()
        await expect(responseLocator).toBeVisible({ timeout: 10000 })
        await expect(responseLocator).toContainText(q.expectedAnswer)

        // Verify solution steps are shown
        await expect(page.getByTestId('solution-steps')).toBeVisible()
        await expect(page.getByTestId('mathematical-confidence')).toBeVisible()
      }
    })
  })

  test.describe('Language and Dialect Features', () => {
    test('handles regional Romanian dialects', async ({ page }) => {
      const dialectTests = [
        {
          input: 'Servus! Cum o mai duci prin Ardeal?',
          expectedRegion: 'transylvania',
          expectedFeatures: ['servus', 'hungarian influence']
        },
        {
          input: 'Bună dimineața! Ce mai faceți în Moldova?',
          expectedRegion: 'moldova',
          expectedFeatures: ['dimineața', 'eastern variant']
        }
      ]

      const chatInput = page.getByPlaceholder(/scrie mesajul/i)
      const sendButton = page.getByRole('button', { name: /trimite/i })

      for (const test of dialectTests) {
        await chatInput.fill(test.input)
        await sendButton.click()

        // Wait for response with dialect analysis
        await expect(page.getByTestId('dialect-analysis')).toBeVisible({ timeout: 10000 })

        // Check region detection
        await expect(page.getByText(new RegExp(test.expectedRegion, 'i'))).toBeVisible()

        // Check dialect features
        for (const feature of test.expectedFeatures) {
          await expect(page.getByText(new RegExp(feature, 'i'))).toBeVisible()
        }
      }
    })

    test('detects and analyzes formality levels', async ({ page }) => {
      const formalityTests = [
        {
          input: 'Vă rog să îmi explicați conceptul de inteligență artificială.',
          expectedFormality: 'formal',
          expectedMarkers: ['vă rog', 'îmi explicați']
        },
        {
          input: 'Poți să îmi explici ce e aia AI?',
          expectedFormality: 'informal',
          expectedMarkers: ['poți', 'ce e aia']
        }
      ]

      const chatInput = page.getByPlaceholder(/scrie mesajul/i)
      const sendButton = page.getByRole('button', { name: /trimite/i })

      for (const test of formalityTests) {
        await chatInput.fill(test.input)
        await sendButton.click()

        // Wait for formality analysis
        await expect(page.getByTestId('formality-analysis')).toBeVisible({ timeout: 8000 })
        await expect(page.getByText(new RegExp(test.expectedFormality, 'i'))).toBeVisible()

        // Check formality markers
        for (const marker of test.expectedMarkers) {
          await expect(page.getByText(new RegExp(marker, 'i'))).toBeVisible()
        }
      }
    })
  })

  test.describe('User Interface and Interactions', () => {
    test('responsive design works across different screen sizes', async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await expect(page.getByRole('button', { name: /meniu/i })).toBeVisible()
      await expect(page.getByPlaceholder(/scrie mesajul/i)).toBeVisible()

      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })
      await expect(page.locator('.conversation-sidebar')).toBeVisible()
      await expect(page.getByPlaceholder(/scrie mesajul/i)).toBeVisible()

      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 })
      await expect(page.locator('.conversation-main')).toBeVisible()
      await expect(page.locator('.conversation-sidebar')).toBeVisible()
      await expect(page.getByPlaceholder(/scrie mesajul/i)).toBeVisible()
    })

    test('dark mode toggle functionality', async ({ page }) => {
      // Check initial light mode
      await expect(page.locator('body')).not.toHaveClass(/dark/)

      // Toggle to dark mode
      await page.getByRole('button', { name: /mod întunecat/i }).click()
      await expect(page.locator('body')).toHaveClass(/dark/)

      // Verify dark mode styling
      await expect(page.locator('.conversation-container')).toHaveClass(/dark:bg-gray-900/)

      // Toggle back to light mode
      await page.getByRole('button', { name: /mod luminos/i }).click()
      await expect(page.locator('body')).not.toHaveClass(/dark/)
    })

    test('language switching between Romanian and English', async ({ page }) => {
      // Initially should be in Romanian
      await expect(page.getByText('Trimite')).toBeVisible()
      await expect(page.getByPlaceholder(/scrie mesajul/i)).toBeVisible()

      // Switch to English
      await page.getByRole('button', { name: /en/i }).click()
      await expect(page.getByText('Send')).toBeVisible()
      await expect(page.getByPlaceholder(/type your message/i)).toBeVisible()

      // Switch back to Romanian
      await page.getByRole('button', { name: /ro/i }).click()
      await expect(page.getByText('Trimite')).toBeVisible()
      await expect(page.getByPlaceholder(/scrie mesajul/i)).toBeVisible()
    })

    test('keyboard shortcuts and accessibility', async ({ page }) => {
      const chatInput = page.getByPlaceholder(/scrie mesajul/i)

      // Focus input with Tab
      await page.keyboard.press('Tab')
      await expect(chatInput).toBeFocused()

      // Type message and send with Enter
      await chatInput.fill('Test keyboard navigation')
      await page.keyboard.press('Enter')

      // Verify message was sent
      await expect(page.getByTestId('user-message')).toContainText('Test keyboard navigation')

      // Test Escape key clears input
      await chatInput.fill('Text to be cleared')
      await page.keyboard.press('Escape')
      await expect(chatInput).toHaveValue('')

      // Test Ctrl+/ opens help dialog
      await page.keyboard.press('Control+/')
      await expect(page.getByRole('dialog', { name: /help/i })).toBeVisible()
    })
  })

  test.describe('Error Handling and Edge Cases', () => {
    test('handles network connectivity issues', async ({ page, context }) => {
      // Start typing a message
      const chatInput = page.getByPlaceholder(/scrie mesajul/i)
      await chatInput.fill('Test message during network issue')

      // Simulate network disconnection
      await context.setOffline(true)

      // Try to send message
      await page.getByRole('button', { name: /trimite/i }).click()

      // Should show connection error
      await expect(page.getByText(/conexiune întreruptă/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /încearcă din nou/i })).toBeVisible()

      // Restore connection
      await context.setOffline(false)

      // Retry should work
      await page.getByRole('button', { name: /încearcă din nou/i }).click()
      await expect(page.getByTestId('user-message')).toContainText('Test message during network issue')
    })

    test('handles very long messages', async ({ page }) => {
      const longMessage = 'Acesta este un mesaj foarte lung care testează capacitatea sistemului de a procesa texte extinse în limba română. '.repeat(50)

      const chatInput = page.getByPlaceholder(/scrie mesajul/i)
      await chatInput.fill(longMessage)

      // Should show character count warning
      await expect(page.getByText(/mesaj lung/i)).toBeVisible()

      await page.getByRole('button', { name: /trimite/i }).click()

      // Should still process the message
      await expect(page.getByTestId('user-message')).toContainText(longMessage.substring(0, 100))
      await expect(page.getByTestId('agi-message')).toBeVisible({ timeout: 15000 })
    })

    test('handles empty and whitespace-only messages', async ({ page }) => {
      const sendButton = page.getByRole('button', { name: /trimite/i })

      // Send button should be disabled with empty input
      expect(await sendButton.isDisabled()).toBe(true)

      // Fill with whitespace only
      const chatInput = page.getByPlaceholder(/scrie mesajul/i)
      await chatInput.fill('   \n\t   ')

      // Should still be disabled
      expect(await sendButton.isDisabled()).toBe(true)

      // Add actual content
      await chatInput.fill('Mesaj valid')
      expect(await sendButton.isDisabled()).toBe(false)
    })

    test('gracefully handles AGI service unavailable', async ({ page }) => {
      // Mock AGI service failure by intercepting requests
      await page.route('**/api/v1/**', route => {
        route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Service temporarily unavailable',
            error_code: 'SERVICE_UNAVAILABLE'
          })
        })
      })

      const chatInput = page.getByPlaceholder(/scrie mesajul/i)
      await chatInput.fill('Test service unavailable')
      await page.getByRole('button', { name: /trimite/i }).click()

      // Should show service error message
      await expect(page.getByText(/serviciul este temporar indisponibil/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /încearcă din nou/i })).toBeVisible()

      // Verify retry button functionality
      await page.unroute('**/api/v1/**') // Remove mock
      await page.getByRole('button', { name: /încearcă din nou/i }).click()

      // Should work after retry
      await expect(page.getByTestId('agi-message')).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Performance and Load Testing', () => {
    test('maintains responsiveness with rapid message sending', async ({ page }) => {
      const chatInput = page.getByPlaceholder(/scrie mesajul/i)
      const sendButton = page.getByRole('button', { name: /trimite/i })

      // Send multiple messages rapidly
      const messages = [
        'Primul mesaj rapid',
        'Al doilea mesaj rapid',
        'Al treilea mesaj rapid',
        'Al patrulea mesaj rapid',
        'Al cincilea mesaj rapid'
      ]

      for (const message of messages) {
        await chatInput.fill(message)
        await sendButton.click()

        // Verify each message appears
        await expect(page.getByTestId('user-message').last()).toContainText(message)

        // Small delay to prevent overwhelming the system
        await page.waitForTimeout(500)
      }

      // All AGI responses should eventually appear
      await expect(page.getByTestId('agi-message')).toHaveCount(messages.length, { timeout: 30000 })
    })

    test('conversation history loads efficiently', async ({ page }) => {
      // Send several messages to create history
      const chatInput = page.getByPlaceholder(/scrie mesajul/i)
      const sendButton = page.getByRole('button', { name: /trimite/i })

      for (let i = 1; i <= 10; i++) {
        await chatInput.fill(`Mesajul istoric ${i}`)
        await sendButton.click()
        await expect(page.getByTestId('user-message').last()).toContainText(`Mesajul istoric ${i}`)
        await page.waitForTimeout(1000) // Wait for response
      }

      // Reload page to test history loading
      await page.reload()

      // History should load quickly
      await expect(page.getByTestId('user-message').first()).toBeVisible({ timeout: 5000 })

      // Should display all previous messages
      const messageCount = await page.getByTestId('user-message').count()
      expect(messageCount).toBe(10)
    })
  })

  test.describe('Accessibility Features', () => {
    test('screen reader compatibility', async ({ page }) => {
      // Check ARIA labels and roles
      await expect(page.getByRole('main')).toHaveAttribute('aria-label', 'Chat conversation')
      await expect(page.getByRole('textbox')).toHaveAttribute('aria-label', 'Type your message')
      await expect(page.getByRole('button', { name: /trimite/i })).toHaveAttribute('aria-label', 'Send message')

      // Check live region for announcements
      await expect(page.getByRole('status')).toHaveAttribute('aria-live', 'polite')

      // Send a message and verify announcement
      const chatInput = page.getByPlaceholder(/scrie mesajul/i)
      await chatInput.fill('Test accessibility message')
      await page.getByRole('button', { name: /trimite/i }).click()

      // Live region should announce new message
      await expect(page.getByRole('status')).toContainText(/mesaj nou de la romai/i)
    })

    test('high contrast mode support', async ({ page }) => {
      // Enable high contrast mode
      await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'dark' })

      // Verify high contrast elements are visible
      await expect(page.locator('.conversation-container')).toHaveCSS('border', /.+/)
      await expect(page.getByRole('button', { name: /trimite/i })).toHaveCSS('border', /.+/)

      // Text should have sufficient contrast
      const textElement = page.getByText('RomAI')
      const color = await textElement.evaluate(el => getComputedStyle(el).color)
      const backgroundColor = await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor)

      // Basic contrast check (simplified)
      expect(color).not.toBe(backgroundColor)
    })

    test('keyboard-only navigation', async ({ page }) => {
      // Navigate entire interface using only keyboard
      let currentFocus = null

      // Tab through interactive elements
      await page.keyboard.press('Tab') // Chat input
      currentFocus = await page.evaluate(() => document.activeElement?.tagName)
      expect(currentFocus).toBe('TEXTAREA')

      await page.keyboard.press('Tab') // Send button
      currentFocus = await page.evaluate(() => document.activeElement?.tagName)
      expect(currentFocus).toBe('BUTTON')

      await page.keyboard.press('Tab') // Settings button
      currentFocus = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
      expect(currentFocus).toContain('setări')

      // Should be able to activate elements with Enter/Space
      await page.keyboard.press('Enter')
      await expect(page.getByRole('dialog')).toBeVisible() // Settings dialog opened
    })
  })
})
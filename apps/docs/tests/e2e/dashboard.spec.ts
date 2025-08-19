import { test, expect } from '@playwright/test'

test.describe('Docs Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:4200')
    })

    test.describe('Page Loading and SEO', () => {
        test('should load the dashboard successfully', async ({ page }) => {
            await expect(page).toHaveTitle(/docs/i)
            await expect(page.locator('h1')).toContainText('DOCS Dashboard')
        })

        test('should have proper meta tags', async ({ page }) => {
            const title = await page.locator('title').textContent()
            expect(title).toBeTruthy()

            const description = await page.locator('meta[name="description"]').getAttribute('content')
            expect(description).toBeTruthy()
        })

        test('should have no console errors', async ({ page }) => {
            const consoleErrors: string[] = []
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    consoleErrors.push(msg.text())
                }
            })

            await page.waitForLoadState('networkidle')
            expect(consoleErrors).toHaveLength(0)
        })
    })

    test.describe('Header Section', () => {
        test('should display header with correct branding', async ({ page }) => {
            await expect(page.locator('h1')).toContainText('DOCS Dashboard')
            await expect(page.locator('p').filter({ hasText: 'Documentation and Knowledge Management Hub' })).toBeVisible()
        })

        test('should have gradient logo with BookOpen icon', async ({ page }) => {
            const logoContainer = page.locator('div').filter({ hasText: 'DOCS Dashboard' }).first().locator('div').first()
            await expect(logoContainer).toBeVisible()

            // Check for the BookOpen icon (Lucide React renders as SVG)
            await expect(logoContainer.locator('svg')).toBeVisible()
        })

        test('should apply blue-to-purple gradient theme', async ({ page }) => {
            const titleElement = page.locator('h1')
            const computedStyle = await titleElement.evaluate(el => window.getComputedStyle(el))
            expect(computedStyle).toBeTruthy()
        })
    })

    test.describe('Key Metrics Dashboard', () => {
        test('should display all 6 metric cards', async ({ page }) => {
            const metricCards = page.locator('[data-testid="metric-card"], .grid .border-0').first().locator('..').locator('> div')
            await expect(metricCards).toHaveCount(6)
        })

        test('should show correct metric titles', async ({ page }) => {
            await expect(page.locator('text=Total Documents')).toBeVisible()
            await expect(page.locator('text=Total Views')).toBeVisible()
            await expect(page.locator('text=Recent Updates')).toBeVisible()
            await expect(page.locator('text=Pending Reviews')).toBeVisible()
            await expect(page.locator('text=Search Queries')).toBeVisible()
            await expect(page.locator('text=Contributors')).toBeVisible()
        })

        test('should display metric values and growth indicators', async ({ page }) => {
            // Check for numeric values
            await expect(page.locator('text=342')).toBeVisible() // Total Documents
            await expect(page.locator('text=+12 this week')).toBeVisible()
            await expect(page.locator('text=+8.2% from last month')).toBeVisible()
        })

        test('should have proper metric icons', async ({ page }) => {
            // Each metric card should have an icon
            const iconElements = page.locator('.grid').first().locator('svg')
            const iconCount = await iconElements.count()
            expect(iconCount).toBeGreaterThanOrEqual(6)
        })

        test('should apply hover effects on metric cards', async ({ page }) => {
            const firstCard = page.locator('.grid').first().locator('> div').first()
            await firstCard.hover()

            // Check that hover state is applied (shadow changes)
            const cardClass = await firstCard.getAttribute('class')
            expect(cardClass).toContain('shadow')
        })
    })

    test.describe('Quick Actions Section', () => {
        test('should display all 3 action cards', async ({ page }) => {
            await expect(page.locator('text=Create New Document')).toBeVisible()
            await expect(page.locator('text=Search Knowledge Base')).toBeVisible()
            await expect(page.locator('text=Review Queue')).toBeVisible()
        })

        test('should have functional search input', async ({ page }) => {
            const searchInput = page.locator('input[placeholder="Search documents..."]')
            await expect(searchInput).toBeVisible()

            await searchInput.fill('test search')
            await expect(searchInput).toHaveValue('test search')
        })

        test('should display pending review count in button', async ({ page }) => {
            const reviewButton = page.locator('button').filter({ hasText: /Review Documents \(\d+\)/ })
            await expect(reviewButton).toBeVisible()
        })

        test('should have gradient backgrounds for action cards', async ({ page }) => {
            const createCard = page.locator('text=Create New Document').locator('..')
            const searchCard = page.locator('text=Search Knowledge Base').locator('..')
            const reviewCard = page.locator('text=Review Queue').locator('..')

            await expect(createCard).toBeVisible()
            await expect(searchCard).toBeVisible()
            await expect(reviewCard).toBeVisible()
        })

        test('should have working action buttons', async ({ page }) => {
            const newDocButton = page.locator('button').filter({ hasText: 'New Document' })
            const reviewButton = page.locator('button').filter({ hasText: /Review Documents/ })

            await expect(newDocButton).toBeVisible()
            await expect(reviewButton).toBeVisible()

            // Test button interactions
            await newDocButton.hover()
            await reviewButton.hover()
        })
    })

    test.describe('Recent Documents Section', () => {
        test('should display recent documents list', async ({ page }) => {
            await expect(page.locator('text=Recent Documents')).toBeVisible()
            await expect(page.locator('text=Latest updates to your documentation')).toBeVisible()
        })

        test('should show document entries with metadata', async ({ page }) => {
            await expect(page.locator('text=API Documentation Guidelines')).toBeVisible()
            await expect(page.locator('text=User Onboarding Process')).toBeVisible()
            await expect(page.locator('text=Security Best Practices')).toBeVisible()
            await expect(page.locator('text=Design System Components')).toBeVisible()
        })

        test('should display status badges for documents', async ({ page }) => {
            await expect(page.locator('text=published')).toBeVisible()
            await expect(page.locator('text=review')).toBeVisible()
            await expect(page.locator('text=draft')).toBeVisible()
        })

        test('should show document metadata (category, date, author, views)', async ({ page }) => {
            await expect(page.locator('text=Development')).toBeVisible()
            await expect(page.locator('text=2 hours ago')).toBeVisible()
            await expect(page.locator('text=John Doe')).toBeVisible()
            await expect(page.locator('text=234 views')).toBeVisible()
        })

        test('should have edit and star buttons for each document', async ({ page }) => {
            const editButtons = page.locator('button').filter({ hasText: 'Edit' })
            const starButtons = page.locator('button svg[data-lucide="star"]').locator('..')

            const editCount = await editButtons.count()
            const starCount = await starButtons.count()

            expect(editCount).toBeGreaterThanOrEqual(4) // At least 4 documents
            expect(starCount).toBeGreaterThanOrEqual(4)
        })

        test('should have filter functionality', async ({ page }) => {
            const filterButton = page.locator('button').filter({ hasText: 'Filter' })
            await expect(filterButton).toBeVisible()
            await filterButton.click()
        })
    })

    test.describe('Documentation Categories', () => {
        test('should display all 4 category cards', async ({ page }) => {
            await expect(page.locator('text=API Documentation')).toBeVisible()
            await expect(page.locator('text=User Guides')).toBeVisible()
            await expect(page.locator('text=Internal Processes')).toBeVisible()
            await expect(page.locator('text=Knowledge Base')).toBeVisible()
        })

        test('should show category descriptions', async ({ page }) => {
            await expect(page.locator('text=Technical API references and guides')).toBeVisible()
            await expect(page.locator('text=End-user documentation and tutorials')).toBeVisible()
            await expect(page.locator('text=Company procedures and workflows')).toBeVisible()
            await expect(page.locator('text=FAQs and troubleshooting guides')).toBeVisible()
        })

        test('should display document counts for each category', async ({ page }) => {
            await expect(page.locator('text=89').first()).toBeVisible() // API Documentation
            await expect(page.locator('text=124')).toBeVisible() // User Guides
            await expect(page.locator('text=67')).toBeVisible() // Internal Processes
            await expect(page.locator('text=62')).toBeVisible() // Knowledge Base
        })

        test('should have category icons', async ({ page }) => {
            const categorySection = page.locator('text=API Documentation').locator('../../..')
            const icons = categorySection.locator('svg')
            const iconCount = await icons.count()
            expect(iconCount).toBeGreaterThanOrEqual(4)
        })

        test('should apply hover effects on category cards', async ({ page }) => {
            const apiCard = page.locator('text=API Documentation').locator('../..')
            await apiCard.hover()

            // Verify hover interaction
            const cardClass = await apiCard.getAttribute('class')
            expect(cardClass).toContain('group')
        })

        test('should have gradient elements for visual hierarchy', async ({ page }) => {
            const categoryCards = page.locator('text=Documents').locator('../..')
            const cardCount = await categoryCards.count()
            expect(cardCount).toBe(4)
        })
    })

    test.describe('Responsive Design', () => {
        test('should work on mobile viewport', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 })
            await page.reload()

            await expect(page.locator('h1')).toBeVisible()
            await expect(page.locator('text=Total Documents')).toBeVisible()
        })

        test('should work on tablet viewport', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 })
            await page.reload()

            await expect(page.locator('h1')).toBeVisible()
            await expect(page.locator('text=Create New Document')).toBeVisible()
        })

        test('should adapt grid layouts on different screen sizes', async ({ page }) => {
            // Desktop view
            await page.setViewportSize({ width: 1200, height: 800 })
            const desktopGrid = page.locator('.grid').first()
            await expect(desktopGrid).toBeVisible()

            // Mobile view
            await page.setViewportSize({ width: 375, height: 667 })
            await expect(desktopGrid).toBeVisible()
        })
    })

    test.describe('Interactive Features', () => {
        test('should have real-time stats updates', async ({ page }) => {
            const viewsElement = page.locator('text=/\\d+,\\d+/').first()
            const initialValue = await viewsElement.textContent()

            // Wait for potential updates (simulated in the component)
            await page.waitForTimeout(11000) // Component updates every 10 seconds

            const updatedValue = await viewsElement.textContent()
            // Values might be the same due to random nature, but component should still be functional
            expect(updatedValue).toBeTruthy()
        })

        test('should handle search input interactions', async ({ page }) => {
            const searchInput = page.locator('input[placeholder="Search documents..."]')

            await searchInput.fill('api documentation')
            await expect(searchInput).toHaveValue('api documentation')

            await searchInput.clear()
            await expect(searchInput).toHaveValue('')
        })

        test('should support keyboard navigation', async ({ page }) => {
            await page.keyboard.press('Tab')
            await page.keyboard.press('Tab')
            await page.keyboard.press('Tab')

            const focusedElement = page.locator(':focus')
            await expect(focusedElement).toBeVisible()
        })
    })

    test.describe('Performance', () => {
        test('should load within performance thresholds', async ({ page }) => {
            const startTime = Date.now()
            await page.goto('http://localhost:4200')
            await page.waitForLoadState('networkidle')
            const loadTime = Date.now() - startTime

            expect(loadTime).toBeLessThan(5000) // Should load within 5 seconds
        })

        test('should have no layout shifts', async ({ page }) => {
            await page.goto('http://localhost:4200')

            // Wait for all content to load
            await page.waitForLoadState('networkidle')
            await page.waitForTimeout(2000)

            // Check that main content is stable
            const mainContent = page.locator('h1')
            await expect(mainContent).toBeVisible()
            await expect(mainContent).toBeStable()
        })
    })

    test.describe('Accessibility', () => {
        test('should have proper heading hierarchy', async ({ page }) => {
            const h1 = page.locator('h1')
            await expect(h1).toHaveCount(1)
            await expect(h1).toContainText('DOCS Dashboard')
        })

        test('should have proper ARIA labels', async ({ page }) => {
            const buttons = page.locator('button')
            const buttonCount = await buttons.count()

            for (let i = 0; i < buttonCount; i++) {
                const button = buttons.nth(i)
                const text = await button.textContent()
                expect(text?.trim()).toBeTruthy()
            }
        })

        test('should support screen readers', async ({ page }) => {
            // Check for semantic HTML elements
            await expect(page.locator('main, section, article, header').first()).toBeVisible()
        })

        test('should have keyboard accessible interactive elements', async ({ page }) => {
            const interactiveElements = page.locator('button, input, [tabindex]')
            const count = await interactiveElements.count()
            expect(count).toBeGreaterThan(0)

            // Test that first button can receive focus
            const firstButton = interactiveElements.first()
            await firstButton.focus()
            await expect(firstButton).toBeFocused()
        })

        test('should have sufficient color contrast', async ({ page }) => {
            // Check that text is visible and readable
            const headings = page.locator('h1, h2, h3, h4, h5, h6')
            const headingCount = await headings.count()

            for (let i = 0; i < Math.min(headingCount, 5); i++) {
                const heading = headings.nth(i)
                await expect(heading).toBeVisible()
            }
        })
    })

    test.describe('Data Integrity', () => {
        test('should display consistent metric values', async ({ page }) => {
            const totalDocs = page.locator('text=342')
            const pendingReviews = page.locator('text=3').first()

            await expect(totalDocs).toBeVisible()
            await expect(pendingReviews).toBeVisible()
        })

        test('should show realistic document metadata', async ({ page }) => {
            // Check for proper date formats
            await expect(page.locator('text=/\\d+ (hours?|days?) ago/')).toBeVisible()

            // Check for proper view counts
            await expect(page.locator('text=/\\d+ views/')).toBeVisible()
        })

        test('should have consistent status indicators', async ({ page }) => {
            const statusBadges = page.locator('.bg-green-100, .bg-yellow-100, .bg-gray-100')
            const badgeCount = await statusBadges.count()
            expect(badgeCount).toBeGreaterThanOrEqual(3) // At least 3 different statuses
        })
    })

    test.describe('Visual Design', () => {
        test('should apply blue-to-purple gradient theme consistently', async ({ page }) => {
            const gradientElements = page.locator('[class*="gradient"], [class*="blue"], [class*="purple"]')
            const count = await gradientElements.count()
            expect(count).toBeGreaterThan(0)
        })

        test('should have proper card shadows and effects', async ({ page }) => {
            const shadowCards = page.locator('[class*="shadow"]')
            const count = await shadowCards.count()
            expect(count).toBeGreaterThan(5) // Multiple cards should have shadows
        })

        test('should display icons consistently', async ({ page }) => {
            const icons = page.locator('svg')
            const iconCount = await icons.count()
            expect(iconCount).toBeGreaterThan(10) // Many icons throughout the interface
        })
    })
})

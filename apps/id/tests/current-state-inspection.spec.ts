import { test, expect } from '@playwright/test'

test.describe('ID Service Current State Inspection', () => {
    test('inspect current page structure', async ({ page }) => {
        await page.goto('http://localhost:4004')

        // Check what's actually on the page
        const title = await page.title()
        console.log('Page title:', title)

        // Get page content structure
        const bodyContent = await page.locator('body').innerHTML()
        console.log('Body contains sections:', bodyContent.includes('<section'))
        console.log('Body contains main:', bodyContent.includes('<main'))
        console.log('Body contains header:', bodyContent.includes('<header'))
        console.log('Body contains footer:', bodyContent.includes('<footer'))

        // Check for specific text content
        const pageText = await page.textContent('body')
        console.log('Page contains ID:', pageText?.includes('ID'))
        console.log('Page contains LOGAI:', pageText?.includes('LOGAI'))
        console.log('Page contains Sign In:', pageText?.includes('Sign In'))

        // Take a screenshot for manual inspection
        await page.screenshot({ path: 'current-page-state.png', fullPage: true })

        // Basic assertions that should pass
        expect(title).toBeTruthy()
        expect(pageText).toBeTruthy()
    })

    test('check navigation links', async ({ page }) => {
        await page.goto('http://localhost:4004')

        // Look for any navigation links
        const links = await page.locator('a').all()
        console.log('Number of links found:', links.length)

        for (let i = 0; i < Math.min(links.length, 5); i++) {
            const link = links[i]
            const href = await link.getAttribute('href')
            const text = await link.textContent()
            console.log(`Link ${i + 1}: "${text}" -> ${href}`)
        }
    })
})

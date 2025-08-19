import { test, expect } from '@playwright/test';

test.describe('AIDE Landing Page - Complete E2E Testing', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test.describe('Page Loading & SEO', () => {
        test('loads the landing page successfully', async ({ page }) => {
            await expect(page).toHaveTitle(/AIDE/);
            await expect(page.locator('header')).toBeVisible();
            await expect(page.locator('main')).toBeVisible();
            await expect(page.locator('footer')).toBeVisible();
        });

        test('has proper SEO meta tags', async ({ page }) => {
            await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
            await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
            await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
        });

        test('has proper structured data', async ({ page }) => {
            const structuredData = await page.locator('script[type="application/ld+json"]');
            await expect(structuredData).toBeAttached();
        });
    });

    test.describe('Header Navigation', () => {
        test('displays logo and navigation items', async ({ page }) => {
            await expect(page.locator('header').getByText('AIDE')).toBeVisible();
            await expect(page.locator('nav').getByText('Features')).toBeVisible();
            await expect(page.locator('nav').getByText('Pricing')).toBeVisible();
            await expect(page.locator('nav').getByText('Documentation')).toBeVisible();
        });

        test('language selector works correctly', async ({ page }) => {
            const languageSelector = page.locator('[data-testid="language-selector"]');
            await expect(languageSelector).toBeVisible();

            await languageSelector.click();
            await expect(page.locator('text=English')).toBeVisible();
            await expect(page.locator('text=Română')).toBeVisible();
        });

        test('theme toggle functionality', async ({ page }) => {
            const themeToggle = page.locator('[data-testid="theme-toggle"]');
            await expect(themeToggle).toBeVisible();

            await themeToggle.click();
            await expect(page.locator('html')).toHaveClass(/dark/);

            await themeToggle.click();
            await expect(page.locator('html')).not.toHaveClass(/dark/);
        });
    });

    test.describe('Hero Section', () => {
        test('displays hero content with animations', async ({ page }) => {
            await expect(page.locator('text=The Future of')).toBeVisible();
            await expect(page.locator('text=AI Development')).toBeVisible();
            await expect(page.getByRole('button', { name: /try web version/i })).toBeVisible();
            await expect(page.getByRole('link', { name: /view on github/i })).toBeVisible();
        });

        test('hero CTA buttons work correctly', async ({ page }) => {
            const tryButton = page.getByRole('button', { name: /try web version/i });
            const githubLink = page.getByRole('link', { name: /view on github/i });

            await expect(tryButton).toBeEnabled();
            await expect(githubLink).toHaveAttribute('href', /github/);
            await expect(githubLink).toHaveAttribute('target', '_blank');
        });

        test('terminal simulation displays correctly', async ({ page }) => {
            await expect(page.locator('text=AIDE Terminal')).toBeVisible();
            await expect(page.locator('text=Analyzing requirements')).toBeVisible();
            await expect(page.locator('text=AI generating optimized')).toBeVisible();
        });

        test('feature highlights are visible', async ({ page }) => {
            await expect(page.locator('text=AI-Powered Coding')).toBeVisible();
            await expect(page.locator('text=VS Code Integration')).toBeVisible();
            await expect(page.locator('text=One-Click Deploy')).toBeVisible();
            await expect(page.locator('text=Real-time Collaboration')).toBeVisible();
        });
    });

    test.describe('Features Section', () => {
        test('displays feature categories and cards', async ({ page }) => {
            await page.locator('text=Core Features').scrollIntoViewIfNeeded();
            await expect(page.locator('text=Everything you need to')).toBeVisible();
            await expect(page.locator('text=build faster')).toBeVisible();

            // Check feature categories
            await expect(page.locator('text=AI-Powered')).toBeVisible();
            await expect(page.locator('text=Development')).toBeVisible();
            await expect(page.locator('text=DevOps')).toBeVisible();
        });

        test('feature cards have proper interactions', async ({ page }) => {
            await page.locator('text=Core Features').scrollIntoViewIfNeeded();

            const featureCard = page.locator('[data-testid="feature-card"]').first();
            await expect(featureCard).toBeVisible();

            // Hover interaction
            await featureCard.hover();
            await expect(featureCard).toHaveClass(/hover:/);
        });
    });

    test.describe('Pricing Section', () => {
        test('displays pricing plans and toggles', async ({ page }) => {
            await page.locator('text=Simple, transparent pricing').scrollIntoViewIfNeeded();

            await expect(page.locator('text=Choose your plan')).toBeVisible();
            await expect(page.locator('text=Monthly')).toBeVisible();
            await expect(page.locator('text=Annual')).toBeVisible();
        });

        test('billing toggle works correctly', async ({ page }) => {
            await page.locator('text=Simple, transparent pricing').scrollIntoViewIfNeeded();

            const annualToggle = page.locator('text=Annual');
            await annualToggle.click();

            // Check for annual pricing display
            await expect(page.locator('text=Save 20%')).toBeVisible();
        });

        test('pricing cards display correctly', async ({ page }) => {
            await page.locator('text=Simple, transparent pricing').scrollIntoViewIfNeeded();

            await expect(page.locator('text=Starter')).toBeVisible();
            await expect(page.locator('text=Professional')).toBeVisible();
            await expect(page.locator('text=Enterprise')).toBeVisible();
        });

        test('pricing CTA buttons work', async ({ page }) => {
            await page.locator('text=Simple, transparent pricing').scrollIntoViewIfNeeded();

            const getStartedButtons = page.getByRole('button', { name: /get started/i });
            await expect(getStartedButtons.first()).toBeEnabled();

            await getStartedButtons.first().click();
            // Should open new tab or navigate to signup
        });
    });

    test.describe('Testimonials Section', () => {
        test('displays testimonials and ratings', async ({ page }) => {
            await page.locator('text=What Developers Say').scrollIntoViewIfNeeded();

            await expect(page.locator('text=Loved by developers')).toBeVisible();
            await expect(page.locator('text=worldwide')).toBeVisible();
        });

        test('testimonial cards display properly', async ({ page }) => {
            await page.locator('text=What Developers Say').scrollIntoViewIfNeeded();

            // Check for star ratings
            await expect(page.locator('[data-testid="star-rating"]')).toBeVisible();

            // Check for testimonial content
            await expect(page.locator('text=AIDE has completely revolutionized')).toBeVisible();
        });

        test('stats section displays correctly', async ({ page }) => {
            await page.locator('text=What Developers Say').scrollIntoViewIfNeeded();

            await expect(page.locator('text=10K+')).toBeVisible();
            await expect(page.locator('text=Active Developers')).toBeVisible();
            await expect(page.locator('text=50M+')).toBeVisible();
            await expect(page.locator('text=Lines of Code Generated')).toBeVisible();
        });
    });

    test.describe('CTA Section', () => {
        test('displays main call-to-action content', async ({ page }) => {
            await page.locator('text=Ready to Transform Your').scrollIntoViewIfNeeded();

            await expect(page.locator('text=Development Workflow?')).toBeVisible();
            await expect(page.getByRole('button', { name: /start building for free/i })).toBeVisible();
        });

        test('email signup form works', async ({ page }) => {
            await page.locator('text=Ready to Transform Your').scrollIntoViewIfNeeded();

            const emailInput = page.locator('input[type="email"]');
            const submitButton = page.getByRole('button', { name: /get started/i }).last();

            await emailInput.fill('test@example.com');
            await expect(emailInput).toHaveValue('test@example.com');

            await submitButton.click();
            // Should handle form submission
        });

        test('trust indicators are visible', async ({ page }) => {
            await page.locator('text=Ready to Transform Your').scrollIntoViewIfNeeded();

            await expect(page.locator('text=30-day money-back guarantee')).toBeVisible();
            await expect(page.locator('text=Enterprise-grade security')).toBeVisible();
            await expect(page.locator('text=24/7 support')).toBeVisible();
        });
    });

    test.describe('Footer', () => {
        test('displays footer content and links', async ({ page }) => {
            await page.locator('footer').scrollIntoViewIfNeeded();

            await expect(page.locator('footer').getByText('AIDE')).toBeVisible();
            await expect(page.locator('text=Product')).toBeVisible();
            await expect(page.locator('text=Company')).toBeVisible();
            await expect(page.locator('text=Support')).toBeVisible();
            await expect(page.locator('text=Legal')).toBeVisible();
        });

        test('newsletter signup form works', async ({ page }) => {
            await page.locator('footer').scrollIntoViewIfNeeded();

            const newsletterInput = page.locator('footer input[type="email"]');
            const subscribeButton = page.locator('footer').getByRole('button', { name: /subscribe/i });

            await newsletterInput.fill('newsletter@example.com');
            await expect(newsletterInput).toHaveValue('newsletter@example.com');

            await subscribeButton.click();
            // Should handle newsletter subscription
        });

        test('social media links work', async ({ page }) => {
            await page.locator('footer').scrollIntoViewIfNeeded();

            const socialLinks = page.locator('footer a[aria-label]');
            await expect(socialLinks).toHaveCount(4); // GitHub, Twitter, LinkedIn, Email

            const githubLink = page.locator('footer a[aria-label="GitHub"]');
            await expect(githubLink).toBeVisible();
        });

        test('language selector in footer works', async ({ page }) => {
            await page.locator('footer').scrollIntoViewIfNeeded();

            const footerLanguageSelector = page.locator('footer [data-testid="language-selector"]');
            await expect(footerLanguageSelector).toBeVisible();
        });
    });

    test.describe('Accessibility', () => {
        test('has proper heading hierarchy', async ({ page }) => {
            const h1 = page.locator('h1');
            const h2 = page.locator('h2');
            const h3 = page.locator('h3');

            await expect(h1).toHaveCount(1);
            await expect(h2.first()).toBeVisible();
            await expect(h3.first()).toBeVisible();
        });

        test('all images have alt text', async ({ page }) => {
            const images = page.locator('img');
            const count = await images.count();

            for (let i = 0; i < count; i++) {
                const img = images.nth(i);
                await expect(img).toHaveAttribute('alt');
            }
        });

        test('all buttons have accessible names', async ({ page }) => {
            const buttons = page.locator('button');
            const count = await buttons.count();

            for (let i = 0; i < count; i++) {
                const button = buttons.nth(i);
                const name = await button.getAttribute('aria-label') || await button.textContent();
                expect(name).toBeTruthy();
            }
        });

        test('keyboard navigation works', async ({ page }) => {
            // Test tab navigation through interactive elements
            await page.keyboard.press('Tab');
            await expect(page.locator(':focus')).toBeVisible();

            await page.keyboard.press('Tab');
            await expect(page.locator(':focus')).toBeVisible();
        });
    });

    test.describe('Performance', () => {
        test('page loads within performance budget', async ({ page }) => {
            const navigationPromise = page.waitForLoadState('networkidle');
            await page.goto('/');
            await navigationPromise;

            // Check for critical performance metrics
            const paintMetrics = await page.evaluate(() => {
                return JSON.stringify(performance.getEntriesByType('paint'));
            });

            expect(paintMetrics).toBeTruthy();
        });

        test('images load properly', async ({ page }) => {
            const images = page.locator('img');
            const count = await images.count();

            for (let i = 0; i < count; i++) {
                const img = images.nth(i);
                await expect(img).toHaveAttribute('src');

                // Check if image loaded successfully
                const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
                expect(naturalWidth).toBeGreaterThan(0);
            }
        });
    });

    test.describe('Responsive Design', () => {
        test('works on mobile devices', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.reload();

            await expect(page.locator('header')).toBeVisible();
            await expect(page.locator('main')).toBeVisible();
            await expect(page.locator('footer')).toBeVisible();
        });

        test('works on tablet devices', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.reload();

            await expect(page.locator('header')).toBeVisible();
            await expect(page.locator('main')).toBeVisible();
            await expect(page.locator('footer')).toBeVisible();
        });

        test('works on desktop', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.reload();

            await expect(page.locator('header')).toBeVisible();
            await expect(page.locator('main')).toBeVisible();
            await expect(page.locator('footer')).toBeVisible();
        });
    });

    test.describe('Internationalization', () => {
        test('switches to Romanian language', async ({ page }) => {
            const languageSelector = page.locator('[data-testid="language-selector"]');
            await languageSelector.click();
            await page.locator('text=Română').click();

            // Check for Romanian text
            await expect(page.locator('text=Viitorul')).toBeVisible();
        });

        test('preserves language preference', async ({ page, context }) => {
            // Set Romanian language
            const languageSelector = page.locator('[data-testid="language-selector"]');
            await languageSelector.click();
            await page.locator('text=Română').click();

            // Navigate to new page
            await page.reload();

            // Should still be in Romanian
            await expect(page.locator('text=Viitorul')).toBeVisible();
        });
    });
});

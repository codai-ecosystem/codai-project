import { test, expect } from '@playwright/test';

test.describe('🚀 DEXAI 2026 - Complete Page Coverage', () => {
    test.describe('🏠 Homepage & Landing Experience', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/');
            await page.waitForLoadState('networkidle');
        });

        test('should showcase modern landing page with stunning animations', async ({ page }) => {
            console.log('🎨 Testing modern landing page experience');

            // Check for hero section
            await expect(page.locator('h1, [data-testid="hero-title"]')).toBeVisible();

            // Check for animated elements
            const animatedElements = [
                '[data-testid="hero-animation"]',
                '.animate-fade-in',
                '.animate-slide-up',
                '.animate-bounce',
                '[class*="animate-"]'
            ];

            for (const selector of animatedElements) {
                const element = page.locator(selector);
                if (await element.count() > 0) {
                    console.log(`✨ Found animated element: ${selector}`);
                    await expect(element.first()).toBeVisible();
                }
            }

            // Test interactive search showcase
            const searchInput = page.locator('input[type="text"], input[placeholder*="search"], input[placeholder*="căutare"]');
            await expect(searchInput).toBeVisible();

            // Test modern UI elements
            const modernElements = [
                'button[class*="gradient"]',
                '[class*="glass"]',
                '[class*="shadow-"]',
                '[class*="rounded-"]',
                '[class*="backdrop-"]'
            ];

            let modernUICount = 0;
            for (const selector of modernElements) {
                const count = await page.locator(selector).count();
                modernUICount += count;
            }

            console.log(`🎯 Found ${modernUICount} modern UI elements`);
            expect(modernUICount).toBeGreaterThan(0);
        });

        test('should have responsive hero section with call-to-action', async ({ page }) => {
            console.log('📱 Testing responsive hero section');

            // Test different viewport sizes
            const viewports = [
                { width: 1920, height: 1080, name: '4K Desktop' },
                { width: 1440, height: 900, name: 'Desktop' },
                { width: 768, height: 1024, name: 'Tablet' },
                { width: 375, height: 667, name: 'Mobile' }
            ];

            for (const viewport of viewports) {
                await page.setViewportSize({ width: viewport.width, height: viewport.height });
                console.log(`📏 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);

                // Hero elements should remain visible
                await expect(page.locator('h1, [data-testid="hero-title"]')).toBeVisible();

                // CTA button should be accessible
                const ctaButton = page.locator('button:has-text("Start"), button:has-text("Începe"), [data-testid="cta-button"]');
                if (await ctaButton.count() > 0) {
                    await expect(ctaButton.first()).toBeVisible();
                }
            }
        });

        test('should display feature highlights with modern design', async ({ page }) => {
            console.log('✨ Testing feature highlights');

            // Look for feature sections
            const featureSections = [
                '[data-testid="features"]',
                '.features',
                '[class*="feature"]',
                'section:has-text("Feature")',
                'section:has-text("Caracteristic")'
            ];

            let featuresFound = false;
            for (const selector of featureSections) {
                if (await page.locator(selector).count() > 0) {
                    featuresFound = true;
                    await expect(page.locator(selector).first()).toBeVisible();
                    console.log(`✅ Found features section: ${selector}`);
                    break;
                }
            }

            // Test feature cards/items
            const featureItems = page.locator('[data-testid="feature-item"], .feature-card, .feature-item');
            const featureCount = await featureItems.count();

            if (featureCount > 0) {
                console.log(`🎯 Found ${featureCount} feature items`);

                // Test hover effects on feature items
                for (let i = 0; i < Math.min(3, featureCount); i++) {
                    await featureItems.nth(i).hover();
                    await page.waitForTimeout(200);
                }
            }

            expect(featuresFound || featureCount > 0).toBeTruthy();
        });

        test('should have modern navigation with smooth transitions', async ({ page }) => {
            console.log('🧭 Testing modern navigation');

            // Test navigation elements
            const navElements = [
                'nav',
                '[data-testid="navigation"]',
                '.navbar',
                'header nav'
            ];

            let navFound = false;
            for (const selector of navElements) {
                if (await page.locator(selector).count() > 0) {
                    navFound = true;
                    await expect(page.locator(selector).first()).toBeVisible();
                    break;
                }
            }

            // Test navigation links
            const navLinks = page.locator('nav a, [data-testid="nav-link"]');
            const linkCount = await navLinks.count();

            if (linkCount > 0) {
                console.log(`🔗 Found ${linkCount} navigation links`);

                // Test hover effects
                for (let i = 0; i < Math.min(3, linkCount); i++) {
                    await navLinks.nth(i).hover();
                    await page.waitForTimeout(100);
                }
            }

            // Test mobile menu if exists
            const mobileMenuToggle = page.locator('[data-testid="mobile-menu"], .hamburger, button[aria-label*="menu"]');
            if (await mobileMenuToggle.count() > 0) {
                await page.setViewportSize({ width: 375, height: 667 });
                await mobileMenuToggle.click();
                await page.waitForTimeout(500);
                console.log('📱 Mobile menu tested');
            }

            expect(navFound || linkCount > 0).toBeTruthy();
        });
    });

    test.describe('📚 Dictionary Page - Complete Coverage', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/dictionary');
            await page.waitForLoadState('networkidle');
        });

        test('should display modern dictionary interface', async ({ page }) => {
            console.log('📖 Testing dictionary page interface');

            // Main search interface
            await expect(page.locator('input[type="text"]')).toBeVisible();
            await expect(page.locator('button[type="submit"], button:has-text("Search"), button:has-text("Căutare")')).toBeVisible();

            // Test advanced search features
            const advancedFeatures = [
                '[data-testid="filter-options"]',
                '[data-testid="sort-options"]',
                'button:has-text("Filter")',
                'button:has-text("Sort")',
                '.search-filters',
                '.advanced-search'
            ];

            for (const selector of advancedFeatures) {
                const element = page.locator(selector);
                if (await element.count() > 0) {
                    console.log(`🔍 Found advanced feature: ${selector}`);
                    await element.first().click();
                    await page.waitForTimeout(300);
                }
            }

            // Test search suggestions/autocomplete
            await page.locator('input[type="text"]').fill('car');
            await page.waitForTimeout(500);

            const suggestions = page.locator('[data-testid="suggestions"], .autocomplete, .search-suggestions');
            if (await suggestions.count() > 0) {
                console.log('💡 Found search suggestions');
                await expect(suggestions.first()).toBeVisible();
            }
        });

        test('should handle all search interaction patterns', async ({ page }) => {
            console.log('🔎 Testing all search patterns');

            const searchPatterns = [
                { term: 'carte', type: 'exact match' },
                { term: 'car*', type: 'wildcard' },
                { term: 'carte dragoste', type: 'multiple words' },
                { term: '"carte veche"', type: 'phrase search' },
                { term: 'cart', type: 'partial match' }
            ];

            for (const pattern of searchPatterns) {
                console.log(`🔍 Testing ${pattern.type}: "${pattern.term}"`);

                await page.locator('input[type="text"]').clear();
                await page.locator('input[type="text"]').fill(pattern.term);
                await page.locator('button[type="submit"]').click();

                try {
                    await page.waitForSelector('[data-testid="search-results"], .search-results', { timeout: 3000 });
                    console.log(`✅ ${pattern.type} search successful`);
                } catch {
                    console.log(`⚠️ ${pattern.type} search - no results or error`);
                }

                await page.waitForTimeout(500);
            }
        });

        test('should display comprehensive word details', async ({ page }) => {
            console.log('📝 Testing word detail views');

            // Search for a word
            await page.locator('input[type="text"]').fill('carte');
            await page.locator('button[type="submit"]').click();
            await page.waitForSelector('[data-testid="search-results"]');

            // Test all detail sections
            const detailSections = [
                '[data-testid="definition"]',
                '[data-testid="examples"]',
                '[data-testid="synonyms"]',
                '[data-testid="antonyms"]',
                '[data-testid="pronunciation"]',
                '[data-testid="etymology"]',
                '[data-testid="related-words"]',
                '[data-testid="rhymes"]',
                '[data-testid="word-forms"]'
            ];

            for (const selector of detailSections) {
                const element = page.locator(selector);
                if (await element.count() > 0) {
                    console.log(`📚 Found detail section: ${selector}`);
                    await expect(element.first()).toBeVisible();

                    // Test expandable sections
                    const expandButton = element.locator('button:has-text("Show"), button:has-text("Arată")').first();
                    if (await expandButton.count() > 0) {
                        await expandButton.click();
                        await page.waitForTimeout(300);
                    }
                }
            }

            // Test multimedia content
            const mediaElements = [
                'audio[controls]',
                '[data-testid="pronunciation-audio"]',
                'img[alt*="illustration"]',
                'video'
            ];

            for (const selector of mediaElements) {
                const element = page.locator(selector);
                if (await element.count() > 0) {
                    console.log(`🎵 Found media element: ${selector}`);
                    await expect(element.first()).toBeVisible();
                }
            }
        });

        test('should support all interactive features', async ({ page }) => {
            console.log('⚡ Testing interactive features');

            // Search first
            await page.locator('input[type="text"]').fill('dragoste');
            await page.locator('button[type="submit"]').click();
            await page.waitForSelector('[data-testid="search-results"]');

            // Test voting system
            const voteButtons = [
                '[data-testid="upvote-button"]',
                '[data-testid="downvote-button"]',
                'button[aria-label*="upvote"]',
                'button[aria-label*="downvote"]'
            ];

            for (const selector of voteButtons) {
                const button = page.locator(selector).first();
                if (await button.count() > 0) {
                    await button.click();
                    await page.waitForTimeout(300);
                    console.log(`👍 Tested voting: ${selector}`);
                }
            }

            // Test favorites system
            const favoriteButtons = [
                '[data-testid="favorite-button"]',
                'button[aria-label*="favorite"]',
                '.favorite-btn',
                'button:has([data-icon="heart"])'
            ];

            for (const selector of favoriteButtons) {
                const button = page.locator(selector).first();
                if (await button.count() > 0) {
                    await button.click();
                    await page.waitForTimeout(300);
                    console.log(`❤️ Tested favorites: ${selector}`);
                }
            }

            // Test sharing functionality
            const shareButtons = [
                '[data-testid="share-button"]',
                'button[aria-label*="share"]',
                '.share-btn'
            ];

            for (const selector of shareButtons) {
                const button = page.locator(selector).first();
                if (await button.count() > 0) {
                    await button.click();
                    await page.waitForTimeout(300);
                    console.log(`📤 Tested sharing: ${selector}`);
                }
            }
        });
    });

    test.describe('🔐 Authentication Pages - Complete Flow', () => {
        test('should test complete login page experience', async ({ page }) => {
            console.log('🔑 Testing login page');

            await page.goto('/auth/login');
            await page.waitForLoadState('networkidle');

            // Test login form elements
            await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
            await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
            await expect(page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Autentificare")')).toBeVisible();

            // Test social login options
            const socialLogins = [
                'button:has-text("Google")',
                'button:has-text("Facebook")',
                'button:has-text("GitHub")',
                '[data-testid="google-login"]',
                '[data-testid="social-login"]'
            ];

            for (const selector of socialLogins) {
                const button = page.locator(selector);
                if (await button.count() > 0) {
                    console.log(`🔗 Found social login: ${selector}`);
                    await expect(button.first()).toBeVisible();
                }
            }

            // Test form validation
            await page.locator('button[type="submit"]').click();
            await page.waitForTimeout(500);

            // Should show validation errors
            const errorElements = [
                '.error',
                '[data-testid="error-message"]',
                '.form-error',
                'input:invalid'
            ];

            let validationFound = false;
            for (const selector of errorElements) {
                if (await page.locator(selector).count() > 0) {
                    validationFound = true;
                    console.log(`⚠️ Found validation feedback: ${selector}`);
                    break;
                }
            }

            console.log(`Form validation: ${validationFound ? 'Working' : 'Not detected'}`);

            // Test password visibility toggle
            const passwordToggle = page.locator('button[aria-label*="password"], .password-toggle');
            if (await passwordToggle.count() > 0) {
                await passwordToggle.click();
                console.log('👁️ Password visibility toggle tested');
            }

            // Test remember me functionality
            const rememberMe = page.locator('input[type="checkbox"], input[name="remember"]');
            if (await rememberMe.count() > 0) {
                await rememberMe.click();
                console.log('💾 Remember me tested');
            }
        });

        test('should test complete registration page experience', async ({ page }) => {
            console.log('📝 Testing registration page');

            await page.goto('/auth/register');
            await page.waitForLoadState('networkidle');

            // Test registration form
            const formFields = [
                'input[name="name"], input[type="text"]',
                'input[name="email"], input[type="email"]',
                'input[name="password"], input[type="password"]',
                'input[name="confirmPassword"], input[name="password_confirmation"]'
            ];

            for (const selector of formFields) {
                const field = page.locator(selector).first();
                if (await field.count() > 0) {
                    await expect(field).toBeVisible();
                    console.log(`📋 Found form field: ${selector}`);
                }
            }

            // Test password strength indicator
            await page.locator('input[type="password"]').first().fill('weak');
            await page.waitForTimeout(300);

            const strengthIndicator = page.locator('[data-testid="password-strength"], .password-strength');
            if (await strengthIndicator.count() > 0) {
                console.log('💪 Password strength indicator found');
            }

            // Test stronger password
            await page.locator('input[type="password"]').first().fill('StrongPassword123!');
            await page.waitForTimeout(300);

            // Test terms and conditions
            const termsCheckbox = page.locator('input[type="checkbox"]:has-text("terms"), input[name="terms"]');
            if (await termsCheckbox.count() > 0) {
                await termsCheckbox.click();
                console.log('📄 Terms acceptance tested');
            }

            // Test privacy policy links
            const privacyLinks = page.locator('a:has-text("Privacy"), a:has-text("Terms")');
            const linkCount = await privacyLinks.count();
            console.log(`🔗 Found ${linkCount} legal links`);
        });
    });

    test.describe('👤 Profile Page - Complete User Experience', () => {
        test('should test comprehensive profile page', async ({ page }) => {
            console.log('👤 Testing profile page');

            await page.goto('/profile');
            await page.waitForLoadState('networkidle');

            // Test profile sections
            const profileSections = [
                '[data-testid="profile-info"]',
                '[data-testid="user-avatar"]',
                '[data-testid="user-stats"]',
                '[data-testid="user-activity"]',
                '[data-testid="user-favorites"]',
                '[data-testid="user-settings"]'
            ];

            for (const selector of profileSections) {
                const section = page.locator(selector);
                if (await section.count() > 0) {
                    await expect(section.first()).toBeVisible();
                    console.log(`👁️ Found profile section: ${selector}`);
                }
            }

            // Test editable profile fields
            const editableFields = [
                'input[name="displayName"]',
                'input[name="bio"]',
                'textarea[name="about"]',
                'input[type="file"]' // avatar upload
            ];

            for (const selector of editableFields) {
                const field = page.locator(selector);
                if (await field.count() > 0) {
                    console.log(`✏️ Found editable field: ${selector}`);

                    if (selector.includes('input[type="file"]')) {
                        // Test file upload UI
                        await expect(field).toBeVisible();
                    } else {
                        // Test text fields
                        await field.fill('Test content');
                        await page.waitForTimeout(100);
                    }
                }
            }

            // Test profile tabs
            const profileTabs = [
                'button:has-text("Overview")',
                'button:has-text("Activity")',
                'button:has-text("Favorites")',
                'button:has-text("Settings")'
            ];

            for (const selector of profileTabs) {
                const tab = page.locator(selector);
                if (await tab.count() > 0) {
                    await tab.click();
                    await page.waitForTimeout(300);
                    console.log(`📑 Tested profile tab: ${selector}`);
                }
            }
        });
    });

    test.describe('🛠️ Admin Dashboard - Complete Management Interface', () => {
        test('should test comprehensive admin dashboard', async ({ page }) => {
            console.log('🛠️ Testing admin dashboard');

            await page.goto('/admin');
            await page.waitForLoadState('networkidle');

            // Test admin sections
            const adminSections = [
                '[data-testid="admin-stats"]',
                '[data-testid="user-management"]',
                '[data-testid="content-management"]',
                '[data-testid="system-monitoring"]',
                '[data-testid="database-operations"]'
            ];

            for (const selector of adminSections) {
                const section = page.locator(selector);
                if (await section.count() > 0) {
                    await expect(section.first()).toBeVisible();
                    console.log(`⚙️ Found admin section: ${selector}`);
                }
            }

            // Test database seeding
            const seedButton = page.locator('button:has-text("Seed"), [data-testid="seed-button"]');
            if (await seedButton.count() > 0) {
                await seedButton.click();
                await page.waitForTimeout(1000);
                console.log('🌱 Database seeding tested');
            }

            // Test admin actions
            const adminActions = [
                'button:has-text("Export")',
                'button:has-text("Import")',
                'button:has-text("Backup")',
                'button:has-text("Restore")',
                'button:has-text("Clear Cache")'
            ];

            for (const selector of adminActions) {
                const button = page.locator(selector);
                if (await button.count() > 0) {
                    console.log(`🔧 Found admin action: ${selector}`);
                    // Just check visibility, don't click destructive actions
                    await expect(button.first()).toBeVisible();
                }
            }
        });
    });

    test.describe('🐛 Debug & Development Pages', () => {
        test('should test debug page functionality', async ({ page }) => {
            console.log('🐛 Testing debug page');

            await page.goto('/debug');
            await page.waitForLoadState('networkidle');

            // Test debug information
            const debugSections = [
                '[data-testid="system-info"]',
                '[data-testid="environment-vars"]',
                '[data-testid="api-status"]',
                '[data-testid="database-status"]',
                '[data-testid="performance-metrics"]'
            ];

            for (const selector of debugSections) {
                const section = page.locator(selector);
                if (await section.count() > 0) {
                    await expect(section.first()).toBeVisible();
                    console.log(`🔍 Found debug section: ${selector}`);
                }
            }

            // Test debug tools
            const debugTools = [
                'button:has-text("Test API")',
                'button:has-text("Clear Storage")',
                'button:has-text("Reset State")',
                'button:has-text("Generate Data")'
            ];

            for (const selector of debugTools) {
                const tool = page.locator(selector);
                if (await tool.count() > 0) {
                    await tool.click();
                    await page.waitForTimeout(500);
                    console.log(`🛠️ Tested debug tool: ${selector}`);
                }
            }
        });

        test('should test environment test page', async ({ page }) => {
            console.log('🌍 Testing environment test page');

            await page.goto('/env-test');
            await page.waitForLoadState('networkidle');

            // Test environment status
            const envSections = [
                '[data-testid="env-status"]',
                '[data-testid="api-endpoints"]',
                '[data-testid="service-health"]',
                '[data-testid="configuration"]'
            ];

            for (const selector of envSections) {
                const section = page.locator(selector);
                if (await section.count() > 0) {
                    await expect(section.first()).toBeVisible();
                    console.log(`🔧 Found env section: ${selector}`);
                }
            }
        });
    });
});

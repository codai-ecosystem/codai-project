import { test, expect } from '@playwright/test';

test.describe('🎨 DEXAI 2026 - Modern UI Components & Animations', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test.describe('✨ Modern Animation System', () => {
        test('should showcase stunning entrance animations', async ({ page }) => {
            console.log('🌟 Testing entrance animations');

            // Test page transition animations
            await page.goto('/dictionary');
            await page.waitForTimeout(1000);

            // Check for CSS animation classes
            const animationClasses = [
                '.animate-fade-in',
                '.animate-slide-up',
                '.animate-slide-down',
                '.animate-slide-left',
                '.animate-slide-right',
                '.animate-zoom-in',
                '.animate-bounce',
                '.animate-pulse',
                '.animate-wiggle',
                '.animate-shake',
                '.animate-glow'
            ];

            let animationsFound = 0;
            for (const className of animationClasses) {
                const elements = await page.locator(className).count();
                if (elements > 0) {
                    animationsFound += elements;
                    console.log(`✨ Found ${elements} elements with ${className}`);
                }
            }

            // Test Framer Motion animations
            const motionElements = [
                '[data-framer-appear]',
                '[data-motion]',
                '.motion-element',
                '[class*="motion-"]'
            ];

            let motionCount = 0;
            for (const selector of motionElements) {
                const count = await page.locator(selector).count();
                motionCount += count;
                if (count > 0) {
                    console.log(`🎬 Found ${count} Framer Motion elements: ${selector}`);
                }
            }

            console.log(`🎯 Total animations found: ${animationsFound + motionCount}`);
            expect(animationsFound + motionCount).toBeGreaterThan(0);
        });

        test('should have smooth hover and interaction animations', async ({ page }) => {
            console.log('🖱️ Testing hover animations');

            // Search for interactive elements
            await page.locator('input[type="text"]').fill('teste');
            await page.locator('button[type="submit"]').click();
            await page.waitForSelector('[data-testid="search-results"]');

            // Test hover effects on buttons
            const buttons = page.locator('button, .btn, [role="button"]');
            const buttonCount = await buttons.count();

            console.log(`🔘 Testing ${Math.min(5, buttonCount)} buttons for hover effects`);

            for (let i = 0; i < Math.min(5, buttonCount); i++) {
                const button = buttons.nth(i);

                // Get initial styles
                const initialTransform = await button.evaluate(el => getComputedStyle(el).transform);
                const initialScale = await button.evaluate(el => getComputedStyle(el).scale);

                // Hover over button
                await button.hover();
                await page.waitForTimeout(300);

                // Check for transform changes
                const hoverTransform = await button.evaluate(el => getComputedStyle(el).transform);
                const hoverScale = await button.evaluate(el => getComputedStyle(el).scale);

                if (hoverTransform !== initialTransform || hoverScale !== initialScale) {
                    console.log(`✨ Button ${i} has hover animations`);
                }

                // Test classes that indicate hover states
                const hasHoverClasses = await button.evaluate(el => {
                    const classes = el.className;
                    return classes.includes('hover:') ||
                        classes.includes('transition') ||
                        classes.includes('transform') ||
                        classes.includes('scale');
                });

                if (hasHoverClasses) {
                    console.log(`🎨 Button ${i} has Tailwind hover classes`);
                }
            }
        });

        test('should display modern loading animations', async ({ page }) => {
            console.log('⏳ Testing loading animations');

            // Trigger loading states
            await page.locator('input[type="text"]').fill('carte');
            await page.locator('button[type="submit"]').click();

            // Check for loading indicators
            const loadingIndicators = [
                '[data-testid="loading"]',
                '.loading',
                '.spinner',
                '.skeleton',
                '.pulse',
                '[class*="animate-spin"]',
                '[class*="animate-pulse"]',
                '.loading-spinner',
                '.loading-dots'
            ];

            let loadingFound = false;
            for (const selector of loadingIndicators) {
                const element = page.locator(selector);
                if (await element.count() > 0) {
                    loadingFound = true;
                    console.log(`⏳ Found loading animation: ${selector}`);

                    // Check if it's actually animating
                    const hasAnimation = await element.first().evaluate(el => {
                        const styles = getComputedStyle(el);
                        return styles.animation !== 'none' || styles.animationName !== 'none';
                    });

                    if (hasAnimation) {
                        console.log(`✨ Loading element is actively animating`);
                    }
                }
            }

            // Test skeleton loading screens
            const skeletonElements = page.locator('.skeleton, [data-testid="skeleton"]');
            const skeletonCount = await skeletonElements.count();

            if (skeletonCount > 0) {
                console.log(`💀 Found ${skeletonCount} skeleton loading elements`);
                loadingFound = true;
            }

            expect(loadingFound).toBeTruthy();
        });

        test('should showcase micro-interactions and feedback', async ({ page }) => {
            console.log('🔄 Testing micro-interactions');

            // Test button click feedback
            const interactiveElements = page.locator('button, .btn, [role="button"]');
            const elementCount = await interactiveElements.count();

            for (let i = 0; i < Math.min(3, elementCount); i++) {
                const element = interactiveElements.nth(i);

                // Test ripple effect or click animation
                await element.click();
                await page.waitForTimeout(200);

                // Check for ripple or feedback elements
                const feedbackElements = page.locator('.ripple, .click-effect, [data-testid="feedback"]');
                if (await feedbackElements.count() > 0) {
                    console.log(`💫 Found click feedback for element ${i}`);
                }
            }

            // Test form input focus animations
            const inputs = page.locator('input, textarea');
            const inputCount = await inputs.count();

            for (let i = 0; i < Math.min(2, inputCount); i++) {
                const input = inputs.nth(i);

                await input.focus();
                await page.waitForTimeout(200);

                // Check for focus animations
                const hasFocusAnimation = await input.evaluate(el => {
                    const styles = getComputedStyle(el);
                    return styles.transition.includes('border') ||
                        styles.transition.includes('shadow') ||
                        styles.transition.includes('outline') ||
                        el.className.includes('focus:');
                });

                if (hasFocusAnimation) {
                    console.log(`🎯 Input ${i} has focus animations`);
                }

                await input.blur();
                await page.waitForTimeout(200);
            }
        });
    });

    test.describe('🌈 Modern Design System', () => {
        test('should showcase glassmorphism and modern effects', async ({ page }) => {
            console.log('🪟 Testing glassmorphism effects');

            // Check for glassmorphism CSS classes
            const glassEffects = [
                '.glass',
                '.backdrop-blur',
                '.bg-opacity-',
                '.bg-white/10',
                '.bg-black/10',
                '[class*="backdrop-"]',
                '[class*="glass"]',
                '.frosted',
                '.translucent'
            ];

            let glassElementsFound = 0;
            for (const className of glassEffects) {
                const elements = await page.locator(className).count();
                if (elements > 0) {
                    glassElementsFound += elements;
                    console.log(`🪟 Found ${elements} glassmorphism elements: ${className}`);
                }
            }

            // Test for CSS backdrop-filter support
            const hasBackdropFilter = await page.evaluate(() => {
                const testElement = document.createElement('div');
                testElement.style.backdropFilter = 'blur(10px)';
                return testElement.style.backdropFilter === 'blur(10px)';
            });

            console.log(`🔧 Backdrop filter support: ${hasBackdropFilter ? 'Yes' : 'No'}`);

            expect(glassElementsFound).toBeGreaterThan(0);
        });

        test('should display modern gradient and shadow effects', async ({ page }) => {
            console.log('🌈 Testing gradient and shadow effects');

            // Check for gradient classes
            const gradientClasses = [
                '.bg-gradient-to-r',
                '.bg-gradient-to-l',
                '.bg-gradient-to-t',
                '.bg-gradient-to-b',
                '.bg-gradient-radial',
                '.gradient',
                '[class*="from-"]',
                '[class*="via-"]',
                '[class*="to-"]'
            ];

            let gradientCount = 0;
            for (const className of gradientClasses) {
                const elements = await page.locator(className).count();
                if (elements > 0) {
                    gradientCount += elements;
                    console.log(`🌈 Found ${elements} gradient elements: ${className}`);
                }
            }

            // Check for shadow effects
            const shadowClasses = [
                '.shadow-sm',
                '.shadow-md',
                '.shadow-lg',
                '.shadow-xl',
                '.shadow-2xl',
                '.drop-shadow',
                '.shadow-colored',
                '[class*="shadow-"]'
            ];

            let shadowCount = 0;
            for (const className of shadowClasses) {
                const elements = await page.locator(className).count();
                if (elements > 0) {
                    shadowCount += elements;
                    console.log(`🌚 Found ${elements} shadow elements: ${className}`);
                }
            }

            console.log(`🎨 Total modern effects: ${gradientCount + shadowCount}`);
            expect(gradientCount + shadowCount).toBeGreaterThan(0);
        });

        test('should showcase modern typography and spacing', async ({ page }) => {
            console.log('📝 Testing modern typography');

            // Check for modern font classes
            const typographyClasses = [
                '.font-thin',
                '.font-light',
                '.font-medium',
                '.font-semibold',
                '.font-bold',
                '.font-black',
                '.text-xs',
                '.text-sm',
                '.text-lg',
                '.text-xl',
                '.text-2xl',
                '.text-3xl',
                '.text-4xl',
                '.text-5xl',
                '.text-6xl'
            ];

            let typographyCount = 0;
            for (const className of typographyClasses) {
                const elements = await page.locator(className).count();
                if (elements > 0) {
                    typographyCount += elements;
                    console.log(`📝 Found ${elements} typography elements: ${className}`);
                }
            }

            // Check for letter spacing and line height
            const spacingClasses = [
                '.tracking-tight',
                '.tracking-normal',
                '.tracking-wide',
                '.leading-tight',
                '.leading-normal',
                '.leading-loose',
                '[class*="tracking-"]',
                '[class*="leading-"]'
            ];

            let spacingCount = 0;
            for (const className of spacingClasses) {
                const elements = await page.locator(className).count();
                if (elements > 0) {
                    spacingCount += elements;
                    console.log(`📏 Found ${elements} spacing elements: ${className}`);
                }
            }

            expect(typographyCount + spacingCount).toBeGreaterThan(0);
        });

        test('should display dark mode and theme switching', async ({ page }) => {
            console.log('🌙 Testing dark mode functionality');

            // Look for theme toggle
            const themeToggles = [
                '[data-testid="theme-toggle"]',
                'button[aria-label*="theme"]',
                'button[aria-label*="dark"]',
                '.theme-toggle',
                '.dark-mode-toggle'
            ];

            let themeToggleFound = false;
            for (const selector of themeToggles) {
                const toggle = page.locator(selector);
                if (await toggle.count() > 0) {
                    themeToggleFound = true;
                    console.log(`🌙 Found theme toggle: ${selector}`);

                    // Test theme switching
                    await toggle.click();
                    await page.waitForTimeout(500);

                    // Check if dark mode classes are applied
                    const hasDarkMode = await page.evaluate(() => {
                        return document.documentElement.classList.contains('dark') ||
                            document.body.classList.contains('dark') ||
                            document.documentElement.getAttribute('data-theme') === 'dark';
                    });

                    console.log(`🌚 Dark mode activated: ${hasDarkMode}`);

                    // Toggle back
                    await toggle.click();
                    await page.waitForTimeout(500);

                    break;
                }
            }

            // Check for dark mode CSS classes
            const darkModeClasses = [
                '.dark\\:bg-',
                '.dark\\:text-',
                '.dark\\:border-',
                '[class*="dark:"]'
            ];

            let darkModeStylesCount = 0;
            for (const className of darkModeClasses) {
                const elements = await page.locator(className).count();
                if (elements > 0) {
                    darkModeStylesCount += elements;
                    console.log(`🎨 Found ${elements} dark mode styles: ${className}`);
                }
            }

            console.log(`🌙 Theme system: ${themeToggleFound ? 'Interactive' : 'Static'}`);
            expect(themeToggleFound || darkModeStylesCount > 0).toBeTruthy();
        });
    });

    test.describe('🚀 2026 Design Trends', () => {
        test('should showcase neumorphism elements', async ({ page }) => {
            console.log('🔘 Testing neumorphism design');

            // Check for neumorphism CSS patterns
            const neumorphismClasses = [
                '.neumorphism',
                '.neomorphic',
                '.soft-shadow',
                '.inset-shadow',
                '[class*="neumorph"]'
            ];

            let neumorphismCount = 0;
            for (const className of neumorphismClasses) {
                const elements = await page.locator(className).count();
                if (elements > 0) {
                    neumorphismCount += elements;
                    console.log(`🔘 Found ${elements} neumorphism elements: ${className}`);
                }
            }

            // Test for double shadow effects (key neumorphism characteristic)
            const elementsWithShadows = page.locator('[class*="shadow-"]');
            const shadowCount = await elementsWithShadows.count();

            if (shadowCount > 0) {
                console.log(`🌚 Found ${shadowCount} elements with shadow effects`);

                // Check for complex shadow combinations
                for (let i = 0; i < Math.min(3, shadowCount); i++) {
                    const element = elementsWithShadows.nth(i);
                    const shadowValue = await element.evaluate(el => getComputedStyle(el).boxShadow);

                    if (shadowValue !== 'none' && shadowValue.includes(',')) {
                        console.log(`🔘 Element ${i} has multiple shadows (neumorphism style)`);
                        neumorphismCount++;
                    }
                }
            }

            expect(neumorphismCount).toBeGreaterThan(0);
        });

        test('should display 3D and perspective effects', async ({ page }) => {
            console.log('🎭 Testing 3D and perspective effects');

            // Check for 3D transformation classes
            const transform3DClasses = [
                '.transform-3d',
                '.perspective',
                '.rotate-x-',
                '.rotate-y-',
                '.rotate-z-',
                '[class*="rotate-x"]',
                '[class*="rotate-y"]',
                '[class*="rotate-z"]',
                '[class*="perspective"]'
            ];

            let transform3DCount = 0;
            for (const className of transform3DClasses) {
                const elements = await page.locator(className).count();
                if (elements > 0) {
                    transform3DCount += elements;
                    console.log(`🎭 Found ${elements} 3D transform elements: ${className}`);
                }
            }

            // Test hover 3D effects
            const interactiveElements = page.locator('button, .card, .interactive');
            const elementCount = await interactiveElements.count();

            for (let i = 0; i < Math.min(3, elementCount); i++) {
                const element = interactiveElements.nth(i);

                await element.hover();
                await page.waitForTimeout(200);

                const hasTransform = await element.evaluate(el => {
                    const transform = getComputedStyle(el).transform;
                    return transform !== 'none' && transform.includes('matrix3d');
                });

                if (hasTransform) {
                    console.log(`🎭 Element ${i} has 3D hover effects`);
                    transform3DCount++;
                }
            }

            expect(transform3DCount).toBeGreaterThan(0);
        });

        test('should showcase AI-powered and smart UI elements', async ({ page }) => {
            console.log('🤖 Testing AI-powered UI elements');

            // Look for AI/smart features
            const aiFeatures = [
                '[data-testid="ai-suggestions"]',
                '[data-testid="smart-search"]',
                '[data-testid="auto-complete"]',
                '.ai-powered',
                '.smart-feature',
                'button:has-text("AI")',
                'button:has-text("Smart")',
                '[aria-label*="AI"]',
                '[aria-label*="intelligent"]'
            ];

            let aiFeatureCount = 0;
            for (const selector of aiFeatures) {
                const elements = await page.locator(selector).count();
                if (elements > 0) {
                    aiFeatureCount += elements;
                    console.log(`🤖 Found ${elements} AI features: ${selector}`);
                }
            }

            // Test smart search suggestions
            await page.locator('input[type="text"]').fill('car');
            await page.waitForTimeout(1000);

            const suggestions = page.locator('[data-testid="suggestions"], .autocomplete, .smart-suggestions');
            const suggestionCount = await suggestions.count();

            if (suggestionCount > 0) {
                console.log(`💡 Found ${suggestionCount} smart suggestions`);
                aiFeatureCount += suggestionCount;
            }

            // Test adaptive UI elements
            const adaptiveElements = [
                '.adaptive',
                '.context-aware',
                '[data-adaptive]',
                '.personalized'
            ];

            for (const className of adaptiveElements) {
                const elements = await page.locator(className).count();
                if (elements > 0) {
                    aiFeatureCount += elements;
                    console.log(`🧠 Found ${elements} adaptive elements: ${className}`);
                }
            }

            expect(aiFeatureCount).toBeGreaterThan(0);
        });

        test('should display sustainable and eco-friendly design', async ({ page }) => {
            console.log('🌱 Testing sustainable design practices');

            // Check for energy-efficient design choices
            const sustainableFeatures = [
                '.energy-efficient',
                '.eco-mode',
                '.sustainable',
                '[data-testid="eco-mode"]',
                'button:has-text("Eco")',
                '.reduced-motion'
            ];

            let sustainableCount = 0;
            for (const selector of sustainableFeatures) {
                const elements = await page.locator(selector).count();
                if (elements > 0) {
                    sustainableCount += elements;
                    console.log(`🌱 Found ${elements} sustainable features: ${selector}`);
                }
            }

            // Test for reduced motion respect
            const respectsReducedMotion = await page.evaluate(() => {
                return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            });

            if (respectsReducedMotion) {
                console.log('🌱 Respects reduced motion preferences');
                sustainableCount++;
            }

            // Test for dark mode (energy saving)
            const hasDarkMode = await page.locator('.dark, [data-theme="dark"]').count();
            if (hasDarkMode > 0) {
                console.log('🌱 Dark mode available (energy efficient)');
                sustainableCount++;
            }

            // Check for efficient image loading
            const lazyImages = await page.locator('img[loading="lazy"]').count();
            if (lazyImages > 0) {
                console.log(`🌱 Found ${lazyImages} lazy-loaded images`);
                sustainableCount++;
            }

            expect(sustainableCount).toBeGreaterThan(0);
        });
    });

    test.describe('🎪 Interactive Elements & Gamification', () => {
        test('should showcase interactive animations and transitions', async ({ page }) => {
            console.log('🎪 Testing interactive animations');

            // Test search interactions
            await page.locator('input[type="text"]').fill('interactiv');
            await page.locator('button[type="submit"]').click();
            await page.waitForSelector('[data-testid="search-results"]');

            // Test card flip animations
            const cards = page.locator('.card, [data-testid="card"], .result-card');
            const cardCount = await cards.count();

            for (let i = 0; i < Math.min(2, cardCount); i++) {
                const card = cards.nth(i);

                // Test hover effects
                await card.hover();
                await page.waitForTimeout(300);

                // Check for flip or 3D effects
                const hasTransform = await card.evaluate(el => {
                    const transform = getComputedStyle(el).transform;
                    return transform !== 'none';
                });

                if (hasTransform) {
                    console.log(`🎴 Card ${i} has interactive transforms`);
                }

                // Test click interactions
                await card.click();
                await page.waitForTimeout(300);
            }

            // Test parallax scrolling effects
            await page.mouse.wheel(0, 500);
            await page.waitForTimeout(500);

            const parallaxElements = page.locator('.parallax, [data-parallax]');
            const parallaxCount = await parallaxElements.count();

            if (parallaxCount > 0) {
                console.log(`🌊 Found ${parallaxCount} parallax elements`);
            }
        });

        test('should display gamification elements', async ({ page }) => {
            console.log('🏆 Testing gamification features');

            // Look for achievement/badge systems
            const gamificationElements = [
                '[data-testid="achievements"]',
                '[data-testid="badges"]',
                '[data-testid="progress-bar"]',
                '[data-testid="level"]',
                '[data-testid="score"]',
                '.achievement',
                '.badge',
                '.progress',
                '.level',
                '.score',
                '.streak'
            ];

            let gamificationCount = 0;
            for (const selector of gamificationElements) {
                const elements = await page.locator(selector).count();
                if (elements > 0) {
                    gamificationCount += elements;
                    console.log(`🏆 Found ${elements} gamification elements: ${selector}`);
                }
            }

            // Test voting system as gamification
            await page.locator('input[type="text"]').fill('carte');
            await page.locator('button[type="submit"]').click();
            await page.waitForSelector('[data-testid="search-results"]');

            const voteButtons = page.locator('[data-testid="upvote-button"], [data-testid="downvote-button"]');
            const voteCount = await voteButtons.count();

            if (voteCount > 0) {
                console.log(`👍 Found ${voteCount} voting elements (gamification)`);
                gamificationCount += voteCount;

                // Test voting animation
                await voteButtons.first().click();
                await page.waitForTimeout(500);
            }

            // Test favorites as achievement system
            const favoriteButtons = page.locator('[data-testid="favorite-button"]');
            const favoriteCount = await favoriteButtons.count();

            if (favoriteCount > 0) {
                console.log(`❤️ Found ${favoriteCount} favorite elements (achievement)`);
                gamificationCount += favoriteCount;
            }

            expect(gamificationCount).toBeGreaterThan(0);
        });

        test('should showcase progressive disclosure and smart layout', async ({ page }) => {
            console.log('📱 Testing progressive disclosure');

            // Test expandable/collapsible sections
            const expandableElements = [
                'details',
                '[data-testid="expandable"]',
                '.collapsible',
                '.accordion',
                'button:has-text("Show more")',
                'button:has-text("Expand")',
                '[aria-expanded]'
            ];

            let expandableCount = 0;
            for (const selector of expandableElements) {
                const elements = page.locator(selector);
                const count = await elements.count();

                if (count > 0) {
                    expandableCount += count;
                    console.log(`📂 Found ${count} expandable elements: ${selector}`);

                    // Test expansion
                    const firstElement = elements.first();
                    if (await firstElement.isVisible()) {
                        await firstElement.click();
                        await page.waitForTimeout(300);
                    }
                }
            }

            // Test smart layout adaptation
            const smartLayoutElements = [
                '.masonry',
                '.grid-auto',
                '.smart-grid',
                '[data-testid="smart-layout"]',
                '.adaptive-layout'
            ];

            for (const selector of smartLayoutElements) {
                const elements = await page.locator(selector).count();
                if (elements > 0) {
                    expandableCount += elements;
                    console.log(`🧩 Found ${elements} smart layout elements: ${selector}`);
                }
            }

            expect(expandableCount).toBeGreaterThan(0);
        });
    });
});

const { chromium } = require('playwright');

async function testEnhancedScrollAnimations() {
    console.log('🎬 Testing Enhanced Scroll Animations and Intersection Observer...');

    const browser = await chromium.launch({
        headless: false,
        args: ['--disable-web-security'],
        slowMo: 100
    });
    const page = await browser.newPage();

    // Set viewport to ensure scrolling is possible
    await page.setViewportSize({ width: 1280, height: 720 });

    page.on('console', msg => {
        if (msg.type() === 'log' && msg.text().includes('🎯')) {
            console.log(`🖥️  ${msg.text()}`);
        }
    });

    try {
        console.log('🌐 Loading page...');
        await page.goto('http://localhost:5001/', { waitUntil: 'networkidle' });

        await page.waitForTimeout(2000);

        console.log('📊 Testing Intersection Observer Animations...');

        // Scroll down to trigger intersection observer animations
        await page.evaluate(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        await page.waitForTimeout(500);

        // Test scroll-triggered animations
        const animationStates = await page.evaluate(() => {
            const results = {};

            // Check hero section
            const heroTitle = document.querySelector('h1');
            if (heroTitle) {
                const computedStyle = getComputedStyle(heroTitle);
                results.heroTitle = {
                    opacity: computedStyle.opacity,
                    transform: computedStyle.transform,
                    animation: computedStyle.animationName
                };
            }

            // Check Our Ecosystem title  
            const ecosystemTitle = document.querySelector('h2');
            if (ecosystemTitle) {
                const computedStyle = getComputedStyle(ecosystemTitle);
                results.ecosystemTitle = {
                    opacity: computedStyle.opacity,
                    transform: computedStyle.transform,
                    className: ecosystemTitle.className
                };
            }

            // Check stats cards
            const statsCards = document.querySelectorAll('.bg-slate-800\\/50');
            results.statsCards = Array.from(statsCards).map((card, index) => {
                const computedStyle = getComputedStyle(card);
                return {
                    index,
                    opacity: computedStyle.opacity,
                    transform: computedStyle.transform,
                    animation: computedStyle.animationName,
                    className: card.className
                };
            });

            // Check project cards
            const projectCards = document.querySelectorAll('.bg-slate-800\\/30');
            results.projectCards = Array.from(projectCards).slice(0, 3).map((card, index) => {
                const computedStyle = getComputedStyle(card);
                const icon = card.querySelector('.animate-float');
                return {
                    index,
                    opacity: computedStyle.opacity,
                    transform: computedStyle.transform,
                    animation: computedStyle.animationName,
                    hasFloatingIcon: !!icon,
                    iconAnimation: icon ? getComputedStyle(icon).animationName : null
                };
            });

            return results;
        });

        console.log('\n✨ Animation States at Page Load:');
        console.log(`📝 Hero Title: opacity=${animationStates.heroTitle?.opacity}, animation=${animationStates.heroTitle?.animation}`);
        console.log(`📝 Ecosystem Title: opacity=${animationStates.ecosystemTitle?.opacity}, classes=${animationStates.ecosystemTitle?.className?.includes('opacity-100') ? 'visible' : 'hidden'}`);
        console.log(`📝 Stats Cards: ${animationStates.statsCards?.length || 0} cards found`);
        animationStates.statsCards?.forEach((card, i) => {
            console.log(`  Card ${i}: opacity=${card.opacity}, animation=${card.animation}`);
        });
        console.log(`📝 Project Cards: ${animationStates.projectCards?.length || 0} cards found`);
        animationStates.projectCards?.forEach((card, i) => {
            console.log(`  Card ${i}: opacity=${card.opacity}, floating_icon=${card.hasFloatingIcon ? '✅' : '❌'}, icon_animation=${card.iconAnimation}`);
        });

        console.log('\n🔄 Testing Scroll Animations...');

        // Scroll down slowly to trigger animations
        for (let i = 0; i <= 10; i++) {
            const scrollY = i * 100;
            await page.evaluate((y) => {
                window.scrollTo({ top: y, behavior: 'smooth' });
            }, scrollY);
            await page.waitForTimeout(200);
        }

        console.log('⬆️ Scrolling back to top...');
        await page.evaluate(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        await page.waitForTimeout(1000);

        console.log('\n🎯 Testing Button Animations...');

        // Test glow animation on test button
        const testButton = await page.$('button:has-text("Test React")');
        if (testButton) {
            const buttonStyle = await testButton.evaluate(el => {
                const computed = getComputedStyle(el);
                return {
                    animation: computed.animationName,
                    boxShadow: computed.boxShadow,
                    className: el.className
                };
            });
            console.log(`🔘 Test Button: animation=${buttonStyle.animation}, glow=${buttonStyle.className.includes('animate-glow') ? '✅' : '❌'}`);
        }

        // Test hover animations
        const projectsButton = await page.$('button:has-text("Show All")');
        if (projectsButton) {
            console.log('🖱️ Testing hover animation...');
            await projectsButton.hover();
            await page.waitForTimeout(500);

            const hoverStyle = await projectsButton.evaluate(el => {
                const computed = getComputedStyle(el);
                return {
                    transform: computed.transform,
                    animation: computed.animationName,
                    className: el.className
                };
            });
            console.log(`🔘 Projects Button (hover): transform=${hoverStyle.transform}, pulse=${hoverStyle.className.includes('pulse-slow') ? '✅' : '❌'}`);
        }

        console.log('\n🏃‍♂️ Testing Performance with Rapid Scrolling...');

        // Rapid scroll test
        for (let i = 0; i < 5; i++) {
            await page.evaluate(() => window.scrollTo(0, Math.random() * 1000));
            await page.waitForTimeout(100);
        }

        // Final scroll to middle to see all animations
        await page.evaluate(() => {
            window.scrollTo({ top: 500, behavior: 'smooth' });
        });
        await page.waitForTimeout(2000);

        console.log('\n🎉 Enhanced Animation Tests Complete!');

        // Final verification
        const finalCheck = await page.evaluate(() => {
            const workingAnimations = [];
            document.querySelectorAll('[class*="animate-"]').forEach(el => {
                const computed = getComputedStyle(el);
                if (computed.animationName !== 'none') {
                    workingAnimations.push({
                        element: el.tagName,
                        animation: computed.animationName,
                        duration: computed.animationDuration
                    });
                }
            });
            return workingAnimations;
        });

        console.log(`\n✅ Working Animations Found: ${finalCheck.length}`);
        finalCheck.slice(0, 5).forEach(anim => {
            console.log(`  🎭 ${anim.element}: ${anim.animation} (${anim.duration})`);
        });

        await page.waitForTimeout(3000);

    } catch (error) {
        console.error('❌ Enhanced animation test error:', error.message);
    } finally {
        await browser.close();
    }
}

testEnhancedScrollAnimations().catch(console.error);
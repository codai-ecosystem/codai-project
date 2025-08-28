const { chromium } = require('playwright');

async function testScrollAnimations() {
    console.log('🎬 Testing Scroll Animations and Timing...');

    const browser = await chromium.launch({
        headless: false,
        args: ['--disable-web-security']
    });
    const page = await browser.newPage();

    // Listen to console logs
    page.on('console', msg => {
        console.log(`🖥️  Console [${msg.type()}]: ${msg.text()}`);
    });

    try {
        console.log('🌐 Loading page...');
        await page.goto('http://localhost:5001/', { waitUntil: 'domcontentloaded' });

        await page.waitForTimeout(2000);

        console.log('🎯 Testing CSS Animation Classes...');

        // Check if Tailwind animation classes are available
        const animationClassesTest = await page.evaluate(() => {
            const testElement = document.createElement('div');
            document.body.appendChild(testElement);

            const animationClasses = [
                'animate-fade-in',
                'animate-fade-in-up',
                'animate-slide-in-up',
                'animate-bounce-slow',
                'animate-pulse-slow',
                'animate-float',
                'animate-glow',
                'animate-shimmer',
                'animate-gradient-xy'
            ];

            const results = {};

            animationClasses.forEach(className => {
                testElement.className = className;
                const computedStyle = getComputedStyle(testElement);
                const animationName = computedStyle.animationName;
                const animationDuration = computedStyle.animationDuration;
                const animationTimingFunction = computedStyle.animationTimingFunction;

                results[className] = {
                    hasAnimation: animationName !== 'none',
                    duration: animationDuration,
                    timingFunction: animationTimingFunction,
                    animationName: animationName
                };
            });

            document.body.removeChild(testElement);
            return results;
        });

        console.log('\n📊 Animation Classes Test Results:');
        Object.entries(animationClassesTest).forEach(([className, result]) => {
            const status = result.hasAnimation ? '✅' : '❌';
            console.log(`  ${status} ${className}:`);
            console.log(`    Animation: ${result.animationName}`);
            console.log(`    Duration: ${result.duration}`);
            console.log(`    Timing: ${result.timingFunction}`);
        });

        console.log('\n🖱️ Testing Scroll Behavior...');

        // Test scroll behavior
        const scrollTest = await page.evaluate(() => {
            const results = {
                initialScrollY: window.scrollY,
                pageHeight: document.body.scrollHeight,
                viewportHeight: window.innerHeight,
                canScroll: document.body.scrollHeight > window.innerHeight
            };

            // Try to scroll
            window.scrollTo(0, 500);
            results.afterScrollY = window.scrollY;

            // Scroll back to top
            window.scrollTo(0, 0);

            return results;
        });

        console.log(`📏 Page Height: ${scrollTest.pageHeight}px`);
        console.log(`📱 Viewport Height: ${scrollTest.viewportHeight}px`);
        console.log(`📜 Can Scroll: ${scrollTest.canScroll ? 'Yes' : 'No'}`);
        console.log(`⬆️ Initial Scroll: ${scrollTest.initialScrollY}px`);
        console.log(`⬇️ After Scroll: ${scrollTest.afterScrollY}px`);

        // Test intersection observer if scroll is possible
        if (scrollTest.canScroll) {
            console.log('\n🔍 Testing Intersection Observer...');

            await page.evaluate(() => {
                return new Promise(resolve => {
                    let observedElements = 0;

                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            observedElements++;
                            console.log(`🎯 Intersection detected: ${entry.target.tagName} - ${entry.isIntersecting ? 'visible' : 'hidden'}`);
                        });

                        if (observedElements >= 3) {
                            observer.disconnect();
                            resolve(observedElements);
                        }
                    }, {
                        threshold: [0, 0.5, 1]
                    });

                    // Observe some elements
                    const elementsToObserve = document.querySelectorAll('h1, h2, .bg-slate-800\\/30, .bg-slate-800\\/50');
                    elementsToObserve.forEach(el => observer.observe(el));

                    // Simulate scroll after a delay
                    setTimeout(() => {
                        window.scrollTo(0, 300);
                        setTimeout(() => {
                            window.scrollTo(0, 600);
                            setTimeout(() => {
                                window.scrollTo(0, 0);
                                setTimeout(() => resolve(observedElements), 1000);
                            }, 500);
                        }, 500);
                    }, 500);
                });
            });
        }

        // Test CSS timing functions
        console.log('\n⏱️ Testing CSS Timing Functions...');

        const timingTest = await page.evaluate(() => {
            const testElement = document.createElement('div');
            testElement.style.position = 'fixed';
            testElement.style.top = '50px';
            testElement.style.left = '50px';
            testElement.style.width = '100px';
            testElement.style.height = '100px';
            testElement.style.backgroundColor = 'red';
            testElement.style.transition = 'transform 1s ease-in-out';
            document.body.appendChild(testElement);

            // Test different timing functions
            const timingFunctions = [
                'ease',
                'ease-in',
                'ease-out',
                'ease-in-out',
                'cubic-bezier(0.4, 0, 0.2, 1)',
                'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            ];

            const results = {};

            timingFunctions.forEach(timing => {
                testElement.style.transitionTimingFunction = timing;
                const computedStyle = getComputedStyle(testElement);
                results[timing] = computedStyle.transitionTimingFunction;
            });

            document.body.removeChild(testElement);
            return results;
        });

        console.log('📈 CSS Timing Functions Available:');
        Object.entries(timingTest).forEach(([timing, computed]) => {
            console.log(`  ✅ ${timing}: ${computed}`);
        });

        // Final animation test with visible feedback
        console.log('\n🎭 Testing Live Animation...');

        await page.evaluate(() => {
            const animatedElement = document.createElement('div');
            animatedElement.innerHTML = '🎯 Animation Test Element';
            animatedElement.className = 'animate-bounce-slow text-white text-2xl font-bold fixed top-10 right-10 z-50 bg-blue-600 p-4 rounded-lg';
            document.body.appendChild(animatedElement);

            setTimeout(() => {
                animatedElement.className = 'animate-fade-in-up text-white text-2xl font-bold fixed top-10 right-10 z-50 bg-green-600 p-4 rounded-lg';
            }, 2000);

            setTimeout(() => {
                animatedElement.className = 'animate-pulse-slow text-white text-2xl font-bold fixed top-10 right-10 z-50 bg-purple-600 p-4 rounded-lg';
            }, 4000);

            setTimeout(() => {
                document.body.removeChild(animatedElement);
            }, 6000);
        });

        console.log('⏳ Watching animations for 7 seconds...');
        await page.waitForTimeout(7000);

        console.log('\n🎉 Animation Tests Complete!');

    } catch (error) {
        console.error('❌ Animation test error:', error.message);
    } finally {
        await browser.close();
    }
}

testScrollAnimations().catch(console.error);
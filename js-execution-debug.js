const { chromium } = require('playwright');

async function jsExecutionDebug() {
    console.log('🔍 JavaScript Execution Debug...');

    const browser = await chromium.launch({ headless: false, devtools: true });
    const page = await browser.newPage();

    let jsErrors = [];

    // Collect all JavaScript errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`❌ JS Error: ${msg.text()}`);
            jsErrors.push(msg.text());
        }
    });

    page.on('pageerror', error => {
        console.log(`❌ Page Error: ${error.name}: ${error.message}`);
        jsErrors.push(`${error.name}: ${error.message}`);
    });

    try {
        console.log('🌐 Loading page...');
        await page.goto('http://localhost:5001');

        console.log('⏳ Waiting for JavaScript execution...');
        await page.waitForTimeout(8000);

        // Check if main JavaScript is executing
        const jsState = await page.evaluate(() => {
            try {
                return {
                    hasWindow: typeof window !== 'undefined',
                    hasDocument: typeof document !== 'undefined',
                    hasConsole: typeof console !== 'undefined',
                    reactExists: typeof React !== 'undefined',
                    nextExists: typeof window.__NEXT_DATA__ !== 'undefined',
                    scriptsCount: document.scripts.length,
                    mainElement: !!document.querySelector('main'),
                    bodyInnerHTML: document.body.innerHTML.length,
                    jsExecuting: true
                };
            } catch (e) {
                return { error: e.message, jsExecuting: false };
            }
        });

        console.log('\n🔍 JavaScript Execution State:');
        Object.entries(jsState).forEach(([key, value]) => {
            console.log(`  ${typeof value === 'boolean' && value ? '✅' : typeof value === 'boolean' ? '❌' : '📊'} ${key}: ${value}`);
        });

        // Check if we can manually trigger React
        console.log('\n⚛️  Testing manual React initialization...');
        const reactTest = await page.evaluate(() => {
            try {
                // Check if React is in window
                if (window.React) {
                    return 'React found in window';
                }

                // Check in script modules
                const scripts = Array.from(document.scripts);
                const reactScripts = scripts.filter(s =>
                    s.textContent && s.textContent.includes('React')
                );

                return {
                    totalScripts: scripts.length,
                    reactScripts: reactScripts.length,
                    scriptSources: scripts.map(s => s.src || 'inline').slice(0, 5)
                };
            } catch (e) {
                return { error: e.message };
            }
        });

        console.log('React test result:', reactTest);

        // Try to detect hydration errors
        console.log('\n🔍 Checking for hydration mismatches...');
        const hydrationIssues = await page.evaluate(() => {
            try {
                const main = document.querySelector('main');
                if (!main) return 'No main element';

                // Check for common hydration warning signs
                const warnings = [];

                // Check if content is static only
                const hasInteractiveElements = main.querySelectorAll('button, [onClick]').length;
                if (hasInteractiveElements === 0) {
                    warnings.push('No interactive elements found');
                }

                // Check for mismatched content
                const textContent = main.textContent || '';
                if (textContent.includes('CODAI')) {
                    warnings.push('Content present but not interactive');
                }

                return {
                    warnings,
                    contentLength: textContent.length,
                    hasButtons: hasInteractiveElements,
                    hasMain: true
                };
            } catch (e) {
                return { error: e.message };
            }
        });

        console.log('Hydration check:', hydrationIssues);

        console.log('\n📝 JavaScript Errors Summary:');
        if (jsErrors.length === 0) {
            console.log('  ✅ No JavaScript errors detected');
        } else {
            jsErrors.forEach(error => {
                console.log(`  ❌ ${error}`);
            });
        }

        // Try to get Next.js build info
        console.log('\n🔍 Next.js Build Info:');
        const nextInfo = await page.evaluate(() => {
            try {
                return {
                    buildId: window.__NEXT_DATA__?.buildId,
                    page: window.__NEXT_DATA__?.page,
                    query: window.__NEXT_DATA__?.query,
                    runtimeConfig: window.__NEXT_DATA__?.runtimeConfig,
                    appGip: window.__NEXT_DATA__?.appGip
                };
            } catch (e) {
                return { error: e.message };
            }
        });

        console.log('Next.js info:', nextInfo);

        await page.waitForTimeout(5000);

    } catch (error) {
        console.error('❌ JS Execution debug error:', error.message);
    } finally {
        await browser.close();
    }
}

jsExecutionDebug().catch(console.error);
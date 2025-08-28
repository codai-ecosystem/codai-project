const { chromium } = require('playwright');

async function detailedLocalDebug() {
    console.log('🔍 Detailed Local Debug of Coming Soon App...');

    const browser = await chromium.launch({ headless: false, devtools: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Listen for console messages
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        console.log(`🖥️  Console [${type.toUpperCase()}]: ${text}`);
    });

    // Listen for page errors
    page.on('pageerror', error => {
        console.log(`❌ Page Error: ${error.message}`);
    });

    // Listen for request failures
    page.on('requestfailed', request => {
        console.log(`🌐 Request Failed: ${request.url()} - ${request.failure()?.errorText}`);
    });

    try {
        console.log('🌐 Navigating to http://localhost:5001');
        await page.goto('http://localhost:5001', { waitUntil: 'networkidle' });

        // Wait longer for React to load
        console.log('⏳ Waiting for React to fully load...');
        await page.waitForTimeout(8000);

        // Check for React hydration
        const isReactLoaded = await page.evaluate(() => {
            return window.React !== undefined || document.querySelector('[data-reactroot]') !== null;
        });
        console.log(`⚛️  React Loaded: ${isReactLoaded ? '✅ YES' : '❌ NO'}`);

        // Check for Next.js
        const isNextLoaded = await page.evaluate(() => {
            return window.__NEXT_DATA__ !== undefined;
        });
        console.log(`🔄 Next.js Loaded: ${isNextLoaded ? '✅ YES' : '❌ NO'}`);

        // Get page title
        const title = await page.title();
        console.log(`📄 Page Title: ${title}`);

        // Check DOM structure in detail
        console.log('🏗️  Checking DOM structure...');

        // Main sections check
        const main = await page.$('main');
        console.log(`📄 Main tag: ${main ? '✅ FOUND' : '❌ MISSING'}`);

        // Hero section
        const hero = await page.$('[class*="hero"]');
        console.log(`🎯 Hero container: ${hero ? '✅ FOUND' : '❌ MISSING'}`);

        // Project sections specifically
        const projectsContainer = await page.$('[class*="project"]');
        console.log(`📂 Projects container: ${projectsContainer ? '✅ FOUND' : '❌ MISSING'}`);

        // Enhanced project sections
        const enhancedProjects = await page.evaluate(() => {
            const elements = document.querySelectorAll('*');
            let found = false;
            elements.forEach(el => {
                if (el.textContent && el.textContent.includes('Our Ecosystem')) {
                    found = true;
                }
            });
            return found;
        });
        console.log(`🌟 Enhanced Project Section Text: ${enhancedProjects ? '✅ FOUND' : '❌ MISSING'}`);

        // Check for specific project text
        const projectText = await page.evaluate(() => {
            return document.body.innerText;
        });

        console.log(`📝 Body contains "Ecosystem": ${projectText.includes('Ecosystem') ? '✅ YES' : '❌ NO'}`);
        console.log(`📝 Body contains "Projects": ${projectText.includes('Projects') ? '✅ YES' : '❌ NO'}`);
        console.log(`📝 Body contains "CODAI": ${projectText.includes('CODAI') ? '✅ YES' : '❌ NO'}`);

        // Check React component mounting
        const componentCheck = await page.evaluate(() => {
            const scripts = Array.from(document.scripts);
            const hasReactComponents = scripts.some(script =>
                script.textContent && script.textContent.includes('EnhancedProjectSections')
            );
            return hasReactComponents;
        });
        console.log(`⚛️  React Components in DOM: ${componentCheck ? '✅ FOUND' : '❌ MISSING'}`);

        // Network activity
        const requests = [];
        page.on('request', request => {
            requests.push({ url: request.url(), resourceType: request.resourceType() });
        });

        await page.reload();
        await page.waitForTimeout(3000);

        console.log(`🌐 Total Requests: ${requests.length}`);
        const jsRequests = requests.filter(r => r.resourceType === 'script');
        const cssRequests = requests.filter(r => r.resourceType === 'stylesheet');
        console.log(`📜 JavaScript files loaded: ${jsRequests.length}`);
        console.log(`🎨 CSS files loaded: ${cssRequests.length}`);

        // Take full screenshot
        await page.screenshot({ path: 'detailed-debug-full.png', fullPage: true });
        console.log('📸 Full screenshot saved as detailed-debug-full.png');

        // Wait for user to inspect
        console.log('🔍 Page is ready for inspection. Browser will stay open for 30 seconds...');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('❌ Detailed debug error:', error.message);
    } finally {
        await browser.close();
    }
}

detailedLocalDebug().catch(console.error);
const { chromium } = require('playwright');

async function networkDebug() {
    console.log('🌐 Network Debug - Checking JavaScript Loading...');

    const browser = await chromium.launch({ headless: false, devtools: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const requests = [];
    const responses = [];

    // Track all requests
    page.on('request', request => {
        requests.push({
            url: request.url(),
            method: request.method(),
            resourceType: request.resourceType()
        });
    });

    // Track all responses
    page.on('response', response => {
        responses.push({
            url: response.url(),
            status: response.status(),
            statusText: response.statusText()
        });
    });

    // Track console messages
    page.on('console', msg => {
        console.log(`🖥️  Console [${msg.type()}]: ${msg.text()}`);
    });

    // Track errors
    page.on('pageerror', error => {
        console.log(`❌ Page Error: ${error.message}`);
        console.log(`Stack: ${error.stack}`);
    });

    try {
        console.log('🌐 Loading page...');
        await page.goto('http://localhost:5001');

        console.log('⏳ Waiting for page to fully load...');
        await page.waitForTimeout(5000);

        console.log('\n📊 Request Summary:');
        console.log(`Total requests: ${requests.length}`);

        const byType = requests.reduce((acc, req) => {
            acc[req.resourceType] = (acc[req.resourceType] || 0) + 1;
            return acc;
        }, {});

        Object.entries(byType).forEach(([type, count]) => {
            console.log(`  ${type}: ${count}`);
        });

        console.log('\n🔍 Failed requests:');
        const failed = responses.filter(res => res.status >= 400);
        failed.forEach(res => {
            console.log(`  ❌ ${res.status} ${res.url}`);
        });

        console.log('\n📜 JavaScript files:');
        const jsRequests = requests.filter(req => req.resourceType === 'script');
        jsRequests.forEach(req => {
            const response = responses.find(res => res.url === req.url);
            const status = response ? response.status : 'pending';
            console.log(`  ${status === 200 ? '✅' : '❌'} ${req.url} (${status})`);
        });

        console.log('\n🎨 CSS files:');
        const cssRequests = requests.filter(req => req.resourceType === 'stylesheet');
        cssRequests.forEach(req => {
            const response = responses.find(res => res.url === req.url);
            const status = response ? response.status : 'pending';
            console.log(`  ${status === 200 ? '✅' : '❌'} ${req.url} (${status})`);
        });

        // Check if React and Next.js are loaded
        const clientStatus = await page.evaluate(() => {
            return {
                react: typeof window.React !== 'undefined',
                reactDOM: typeof window.ReactDOM !== 'undefined',
                nextData: typeof window.__NEXT_DATA__ !== 'undefined',
                nextRouter: typeof window.next !== 'undefined'
            };
        });

        console.log('\n⚛️  Client Libraries Status:');
        Object.entries(clientStatus).forEach(([lib, loaded]) => {
            console.log(`  ${loaded ? '✅' : '❌'} ${lib}`);
        });

        // Try to identify why React isn't hydrating
        const hydrationCheck = await page.evaluate(() => {
            const main = document.querySelector('main');
            return {
                mainExists: !!main,
                hasDataReactRoot: !!document.querySelector('[data-reactroot]'),
                hasReactFiber: !!main?._reactInternalFiber || !!main?._reactInternalInstance,
                scriptTags: Array.from(document.scripts).map(s => ({
                    src: s.src,
                    hasContent: s.textContent.length > 0
                }))
            };
        });

        console.log('\n🔍 Hydration Check:');
        console.log(`  Main exists: ${hydrationCheck.mainExists ? '✅' : '❌'}`);
        console.log(`  React root: ${hydrationCheck.hasDataReactRoot ? '✅' : '❌'}`);
        console.log(`  React fiber: ${hydrationCheck.hasReactFiber ? '✅' : '❌'}`);
        console.log(`  Script tags: ${hydrationCheck.scriptTags.length}`);

        // Check if there are any chunks that failed to load
        const chunkStatus = await page.evaluate(() => {
            return Array.from(document.scripts)
                .filter(script => script.src && script.src.includes('chunk'))
                .map(script => ({
                    src: script.src,
                    loaded: script.readyState || 'unknown'
                }));
        });

        console.log('\n📦 Chunk Loading:');
        chunkStatus.forEach(chunk => {
            console.log(`  ${chunk.loaded === 'complete' ? '✅' : '❌'} ${chunk.src}`);
        });

        await page.waitForTimeout(10000);

    } catch (error) {
        console.error('❌ Network debug error:', error.message);
    } finally {
        await browser.close();
    }
}

networkDebug().catch(console.error);
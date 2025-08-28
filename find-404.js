const { chromium } = require('playwright');

async function find404Error() {
    console.log('🔍 Finding 404 Error Source...');

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const failedRequests = [];
    const allRequests = [];

    // Track all requests and failures
    page.on('request', request => {
        allRequests.push({
            url: request.url(),
            method: request.method(),
            resourceType: request.resourceType()
        });
    });

    page.on('response', response => {
        if (response.status() >= 400) {
            failedRequests.push({
                url: response.url(),
                status: response.status(),
                statusText: response.statusText()
            });
        }
    });

    page.on('requestfailed', request => {
        failedRequests.push({
            url: request.url(),
            error: request.failure()?.errorText,
            resourceType: request.resourceType()
        });
    });

    try {
        await page.goto('http://localhost:5001');
        await page.waitForTimeout(5000);

        console.log('\n❌ Failed Requests:');
        failedRequests.forEach(req => {
            console.log(`  Status: ${req.status || 'Failed'}`);
            console.log(`  URL: ${req.url}`);
            console.log(`  Error: ${req.statusText || req.error || 'Unknown'}`);
            console.log('  ---');
        });

        if (failedRequests.length === 0) {
            console.log('  ✅ No failed requests detected');

            // Let's check for other issues
            console.log('\n🔍 All requests:');
            allRequests.forEach((req, i) => {
                console.log(`  ${i + 1}. ${req.resourceType} - ${req.url}`);
            });
        }

    } catch (error) {
        console.error('❌ 404 debug error:', error.message);
    } finally {
        await browser.close();
    }
}

find404Error().catch(console.error);
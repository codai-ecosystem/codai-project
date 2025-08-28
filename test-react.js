const { chromium } = require('playwright');

async function testReactPage() {
    console.log('🧪 Testing React on /test page...');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    page.on('console', msg => {
        console.log(`🖥️  Console [${msg.type()}]: ${msg.text()}`);
    });

    page.on('pageerror', error => {
        console.log(`❌ Page Error: ${error.message}`);
    });

    try {
        console.log('🌐 Loading test page...');
        await page.goto('http://localhost:5001/test');

        await page.waitForTimeout(3000);

        // Check if React is working
        const reactCheck = await page.evaluate(() => {
            return {
                hasReact: typeof window.React !== 'undefined',
                hasNextData: typeof window.__NEXT_DATA__ !== 'undefined',
                buttonExists: !!document.querySelector('button'),
                pageTitle: document.title,
                bodyText: document.body.textContent
            };
        });

        console.log('\n🧪 Test Page React Status:');
        Object.entries(reactCheck).forEach(([key, value]) => {
            console.log(`  ${typeof value === 'boolean' && value ? '✅' : typeof value === 'boolean' ? '❌' : '📊'} ${key}: ${value}`);
        });

        // Try clicking the button
        if (reactCheck.buttonExists) {
            console.log('\n🖱️ Testing button interaction...');

            // Handle the alert dialog
            page.on('dialog', async dialog => {
                console.log(`🔔 Alert: ${dialog.message()}`);
                await dialog.accept();
            });

            await page.click('button');
            console.log('✅ Button clicked successfully');
        }

        await page.waitForTimeout(5000);

    } catch (error) {
        console.error('❌ Test page error:', error.message);
    } finally {
        await browser.close();
    }
}

testReactPage().catch(console.error);
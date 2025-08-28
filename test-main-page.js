const { chromium } = require('playwright');

async function testMainPage() {
    console.log('🧪 Testing React on main page (/) ...');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    page.on('console', msg => {
        console.log(`🖥️  Console [${msg.type()}]: ${msg.text()}`);
    });

    page.on('pageerror', error => {
        console.log(`❌ Page Error: ${error.message}`);
    });

    try {
        console.log('🌐 Loading main page...');
        await page.goto('http://localhost:5001/');

        await page.waitForTimeout(5000);

        // Check if React is working
        const reactCheck = await page.evaluate(() => {
            return {
                hasReact: typeof window.React !== 'undefined',
                hasNextData: typeof window.__NEXT_DATA__ !== 'undefined',
                buttonExists: !!document.querySelector('button'),
                pageTitle: document.title,
                bodyText: document.body.textContent?.substring(0, 200) + '...',
                hasMainTag: !!document.querySelector('main'),
                projectsVisible: document.body.textContent?.includes('Our Projects') || false
            };
        });

        console.log('\n🧪 Main Page React Status:');
        Object.entries(reactCheck).forEach(([key, value]) => {
            console.log(`  ${typeof value === 'boolean' && value ? '✅' : typeof value === 'boolean' ? '❌' : '📊'} ${key}: ${value}`);
        });

        // Try clicking the main button if it exists
        if (reactCheck.buttonExists) {
            console.log('\n🖱️ Testing main page button interaction...');

            page.on('dialog', async dialog => {
                console.log(`🔔 Alert: ${dialog.message()}`);
                await dialog.accept();
            });

            await page.click('button');
            console.log('✅ Button clicked successfully');
        }

        await page.waitForTimeout(5000);

    } catch (error) {
        console.error('❌ Main page test error:', error.message);
    } finally {
        await browser.close();
    }
}

testMainPage().catch(console.error);
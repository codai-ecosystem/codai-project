const { chromium } = require('playwright');

async function debugProduction() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Log console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('❌ Console Error:', msg.text());
        }
    });

    // Log network errors
    page.on('response', response => {
        if (response.status() >= 400) {
            console.log('🌐 Network Error:', response.url(), response.status());
        }
    });

    try {
        console.log('🔍 Navigating to production site...');
        await page.goto('https://codai-coming-soon-4r7rikmxw-codai-ro.vercel.app', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        console.log('✅ Page loaded successfully');

        // Check for main sections
        console.log('\n📋 Checking main sections:');

        const heroSection = await page.locator('section:has-text("CODAI")').count();
        console.log(`🎯 Hero section: ${heroSection > 0 ? '✅ Found' : '❌ Missing'}`);

        const projectSections = await page.locator('[data-testid="project-section"], .project-section').count();
        console.log(`📦 Project sections: ${projectSections > 0 ? `✅ Found ${projectSections}` : '❌ Missing'}`);

        const footerSection = await page.locator('footer').count();
        console.log(`👣 Footer section: ${footerSection > 0 ? '✅ Found' : '❌ Missing'}`);

        // Check for animations
        console.log('\n🎬 Checking animations:');
        const animatedElements = await page.locator('[class*="animate"], [class*="scroll-animate"]').count();
        console.log(`✨ Animated elements: ${animatedElements > 0 ? `✅ Found ${animatedElements}` : '❌ Missing'}`);

        // Get page title and check for basic content
        const title = await page.title();
        console.log(`📄 Page title: "${title}"`);

        const bodyText = await page.locator('body').textContent();
        const hasCODAI = bodyText.includes('CODAI');
        const hasComingSoon = bodyText.toLowerCase().includes('coming soon');

        console.log(`🏷️ Contains "CODAI": ${hasCODAI ? '✅ Yes' : '❌ No'}`);
        console.log(`⏰ Contains "Coming Soon": ${hasComingSoon ? '✅ Yes' : '❌ No'}`);

        // Take a screenshot
        await page.screenshot({
            path: 'production-debug-screenshot.png',
            fullPage: true
        });
        console.log('📸 Screenshot saved as production-debug-screenshot.png');

        // Wait a bit to see the page
        console.log('\n⏳ Waiting 5 seconds to observe animations...');
        await page.waitForTimeout(5000);

    } catch (error) {
        console.error('💥 Error during debug:', error.message);
    } finally {
        await browser.close();
    }
}

debugProduction();
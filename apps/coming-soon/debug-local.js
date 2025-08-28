const { chromium } = require('playwright');

async function debugLocal() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // Log console errors
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('❌ Console Error:', msg.text());
        }
        if (msg.type() === 'warning') {
            console.log('⚠️ Console Warning:', msg.text());
        }
    });

    // Log network errors
    page.on('response', response => {
        if (response.status() >= 400) {
            console.log('🌐 Network Error:', response.url(), response.status());
        }
    });

    try {
        console.log('🔍 Navigating to local development server...');
        await page.goto('http://localhost:5001', {
            waitUntil: 'networkidle',
            timeout: 30000
        });

        console.log('✅ Page loaded successfully');

        // Check for main sections
        console.log('\n📋 Checking main sections:');

        const heroSection = await page.locator('section:has-text("CODAI"), [data-testid="hero-section"], .hero-section').count();
        console.log(`🎯 Hero section: ${heroSection > 0 ? '✅ Found' : '❌ Missing'}`);

        const projectSections = await page.locator('[data-testid="project-section"], .project-section, [class*="project"]').count();
        console.log(`📦 Project sections: ${projectSections > 0 ? `✅ Found ${projectSections}` : '❌ Missing'}`);

        const footerSection = await page.locator('footer').count();
        console.log(`👣 Footer section: ${footerSection > 0 ? '✅ Found' : '❌ Missing'}`);

        // Check for animations
        console.log('\n🎬 Checking animations:');
        const animatedElements = await page.locator('[class*="animate"], [class*="scroll-animate"], [class*="motion"], [data-animate]').count();
        console.log(`✨ Animated elements: ${animatedElements > 0 ? `✅ Found ${animatedElements}` : '❌ Missing'}`);

        // Check for specific CODAI content
        console.log('\n🏷️ Content verification:');
        const bodyText = await page.locator('body').textContent();
        const hasCODAI = bodyText.includes('CODAI');
        const hasComingSoon = bodyText.toLowerCase().includes('coming soon');
        const hasProjects = bodyText.toLowerCase().includes('project');
        const hasEcosystem = bodyText.toLowerCase().includes('ecosystem');

        console.log(`🏷️ Contains "CODAI": ${hasCODAI ? '✅ Yes' : '❌ No'}`);
        console.log(`⏰ Contains "Coming Soon": ${hasComingSoon ? '✅ Yes' : '❌ No'}`);
        console.log(`📦 Contains "Project": ${hasProjects ? '✅ Yes' : '❌ No'}`);
        console.log(`🌐 Contains "Ecosystem": ${hasEcosystem ? '✅ Yes' : '❌ No'}`);

        // Get page title
        const title = await page.title();
        console.log(`📄 Page title: "${title}"`);

        // Check for specific services
        console.log('\n🔧 Service verification:');
        const services = ['MemorAI', 'BancAI', 'StocAI', 'MarketAI', 'TalentAI', 'LegalAI', 'AdminAI', 'StudiAI'];
        for (const service of services) {
            const hasService = bodyText.includes(service);
            console.log(`🔹 ${service}: ${hasService ? '✅ Found' : '❌ Missing'}`);
        }

        // Take screenshot
        await page.screenshot({
            path: 'local-dev-screenshot.png',
            fullPage: true
        });
        console.log('\n📸 Screenshot saved as local-dev-screenshot.png');

        // Wait to observe animations
        console.log('\n⏳ Waiting 5 seconds to observe animations...');
        await page.waitForTimeout(5000);

        // Scroll to test scroll animations
        console.log('📜 Testing scroll animations...');
        await page.evaluate(() => {
            window.scrollTo(0, window.innerHeight);
        });
        await page.waitForTimeout(2000);

        await page.evaluate(() => {
            window.scrollTo(0, window.innerHeight * 2);
        });
        await page.waitForTimeout(2000);

        await page.evaluate(() => {
            window.scrollTo(0, 0);
        });

        console.log('✅ Local development testing complete!');

    } catch (error) {
        console.error('💥 Error during local debug:', error.message);
    } finally {
        await browser.close();
    }
}

debugLocal();
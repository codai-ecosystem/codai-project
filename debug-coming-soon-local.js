const { chromium } = require('playwright');

async function debugLocalComingSoon() {
    console.log('🔍 Debugging Coming Soon App Locally...');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // Navigate to local development server
        console.log('🌐 Navigating to http://localhost:5001');
        await page.goto('http://localhost:5001', { waitUntil: 'networkidle' });

        // Wait for page to load
        await page.waitForTimeout(3000);

        // Check page title
        const title = await page.title();
        console.log(`📄 Page Title: ${title}`);

        // Check for main sections
        console.log('🔍 Checking for main sections...');

        // Hero section
        const heroSection = await page.$('h1, [class*="hero"], .hero');
        console.log(`🎯 Hero Section: ${heroSection ? '✅ FOUND' : '❌ MISSING'}`);

        // Projects section
        const projectsSection = await page.$('[class*="project"], .project, h2:has-text("Project"), h3:has-text("Project")');
        console.log(`📂 Projects Section: ${projectsSection ? '✅ FOUND' : '❌ MISSING'}`);

        // Navigation
        const navigation = await page.$('nav, [class*="nav"], .nav');
        console.log(`🧭 Navigation: ${navigation ? '✅ FOUND' : '❌ MISSING'}`);

        // Footer
        const footer = await page.$('footer, [class*="footer"], .footer');
        console.log(`📋 Footer: ${footer ? '✅ FOUND' : '❌ MISSING'}`);

        // Check for animations
        console.log('🎭 Checking for animations...');
        const animatedElements = await page.$$('[class*="animate"], [class*="motion"], [data-animation]');
        console.log(`✨ Animated Elements: ${animatedElements.length > 0 ? `✅ FOUND (${animatedElements.length})` : '❌ MISSING'}`);

        // Check for images
        const images = await page.$$('img');
        console.log(`🖼️ Images: ${images.length > 0 ? `✅ FOUND (${images.length})` : '❌ MISSING'}`);

        // Get all text content
        const bodyText = await page.textContent('body');
        console.log(`📝 Page has content: ${bodyText && bodyText.trim().length > 100 ? '✅ YES' : '❌ NO'}`);

        // Check for specific CODAI content
        const codaiContent = bodyText && bodyText.toLowerCase().includes('codai');
        console.log(`🤖 CODAI Content: ${codaiContent ? '✅ FOUND' : '❌ MISSING'}`);

        // Take screenshot
        await page.screenshot({ path: 'coming-soon-local-debug.png', fullPage: true });
        console.log('📸 Screenshot saved as coming-soon-local-debug.png');

        console.log('\n✅ Local debugging complete!');

    } catch (error) {
        console.error('❌ Error during local debugging:', error.message);
    } finally {
        await browser.close();
    }
}

debugLocalComingSoon().catch(console.error);
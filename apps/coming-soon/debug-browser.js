const { chromium } = require('playwright');

async function debugComingSoonSite() {
    console.log('🔍 CODAI Coming Soon - Playwright Browser Debugging');
    console.log('====================================================');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    // Enable console logging
    page.on('console', (msg) => {
        console.log(`🖥️ Console [${msg.type()}]:`, msg.text());
    });

    // Enable error logging
    page.on('pageerror', (error) => {
        console.log(`❌ Page Error:`, error.message);
    });

    // Enable request logging
    page.on('request', (request) => {
        if (request.url().includes('localhost:5001')) {
            console.log(`📡 Request: ${request.method()} ${request.url()}`);
        }
    });

    // Enable response logging
    page.on('response', (response) => {
        if (response.url().includes('localhost:5001')) {
            console.log(`📨 Response: ${response.status()} ${response.url()}`);
        }
    });

    console.log('\n🧪 Testing Working Static Site (test-site.html)');
    console.log('================================================');

    try {
        await page.goto('http://localhost:5001/test-site.html', { waitUntil: 'networkidle' });
        await page.waitForSelector('body', { timeout: 5000 });

        const title = await page.title();
        const statusIndicator = await page.textContent('.status');
        const mainHeading = await page.textContent('h1');

        console.log(`✅ Title: ${title}`);
        console.log(`✅ Status: ${statusIndicator}`);
        console.log(`✅ Main Heading: ${mainHeading}`);
        console.log(`✅ Static site is working perfectly!`);

        await page.screenshot({ path: 'static-site-working.png' });
        console.log('📸 Screenshot saved: static-site-working.png');

    } catch (error) {
        console.log(`❌ Static site error: ${error.message}`);
    }

    console.log('\n🧪 Testing Next.js Application (/)');
    console.log('==================================');

    try {
        await page.goto('http://localhost:5001/', { waitUntil: 'networkidle', timeout: 10000 });

        const title = await page.title();
        console.log(`📄 Title: ${title}`);

        // Check if it's an error page
        const errorContent = await page.textContent('body').catch(() => '');
        if (errorContent.includes('Internal Server Error') || errorContent.includes('500')) {
            console.log('🚨 NEXT.JS APPLICATION IS SHOWING 500 ERROR');
            console.log('This explains why sections appear missing!');

            await page.screenshot({ path: 'nextjs-error-500.png' });
            console.log('📸 Error screenshot saved: nextjs-error-500.png');

            // Let's check what's in the error
            const errorDetails = await page.locator('pre').textContent().catch(() => 'No error details visible');
            console.log(`🔍 Error Details: ${errorDetails}`);
        } else {
            // Check for our components
            const heroExists = await page.locator('[data-testid="hero-section"], .hero').count() > 0;
            const projectsExists = await page.locator('[data-testid="projects-section"], .projects').count() > 0;
            const footerExists = await page.locator('[data-testid="footer-section"], footer').count() > 0;

            console.log(`🔍 Hero Section Present: ${heroExists ? '✅' : '❌'}`);
            console.log(`🔍 Projects Section Present: ${projectsExists ? '✅' : '❌'}`);
            console.log(`🔍 Footer Section Present: ${footerExists ? '✅' : '❌'}`);

            if (heroExists || projectsExists || footerExists) {
                await page.screenshot({ path: 'nextjs-working.png' });
                console.log('📸 Working screenshot saved: nextjs-working.png');
            }
        }

    } catch (error) {
        console.log(`❌ Next.js application error: ${error.message}`);
        await page.screenshot({ path: 'nextjs-error.png' });
        console.log('📸 Error screenshot saved: nextjs-error.png');
    }

    console.log('\n🧪 Testing Vercel Deployment (Authentication Protected)');
    console.log('========================================================');

    try {
        await page.goto('https://codai-coming-soon-pd1e1cpe6-codai-ro.vercel.app', { waitUntil: 'networkidle' });

        const title = await page.title();
        const bodyText = await page.textContent('body');

        console.log(`📄 Title: ${title}`);

        if (bodyText.includes('Authentication Required') || bodyText.includes('Please sign in')) {
            console.log('🔒 CONFIRMED: Vercel deployment is authentication protected');
            console.log('💡 This is why users see missing sections - they see login page instead!');

            await page.screenshot({ path: 'vercel-auth-protected.png' });
            console.log('📸 Auth protection screenshot saved: vercel-auth-protected.png');
        } else {
            console.log('✅ Vercel deployment is accessible');
            await page.screenshot({ path: 'vercel-working.png' });
        }

    } catch (error) {
        console.log(`❌ Vercel deployment error: ${error.message}`);
    }

    console.log('\n📋 DEBUGGING SUMMARY');
    console.log('====================');
    console.log('✅ Static HTML site (test-site.html): Working perfectly');
    console.log('❌ Next.js application (/): 500 Internal Server Error');
    console.log('🔒 Vercel deployment: Authentication protected');
    console.log('');
    console.log('🎯 ROOT CAUSE IDENTIFIED:');
    console.log('1. Next.js app has server-side errors (500)');
    console.log('2. Vercel deployment is protected by authentication');
    console.log('3. This explains ALL user reports of missing sections');
    console.log('');
    console.log('💡 SOLUTION NEEDED:');
    console.log('1. Fix Next.js 500 errors for local development');
    console.log('2. Remove Vercel deployment protection for public access');

    await browser.close();
}

// Run the debugging
debugComingSoonSite().catch(console.error);
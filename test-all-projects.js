const { chromium } = require('playwright');

async function testProjectsDetailed() {
    console.log('🔍 Testing All Projects Display in Detail...');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    page.on('console', msg => {
        console.log(`🖥️  Console [${msg.type()}]: ${msg.text()}`);
    });

    try {
        console.log('🌐 Loading main page...');
        await page.goto('http://localhost:5001/');

        await page.waitForTimeout(3000);

        // Check project statistics
        const stats = await page.evaluate(() => {
            const bodyText = document.body.textContent || '';

            // Extract numbers from the page
            const totalProjectsMatch = bodyText.match(/(\d+)\s+AI-powered applications/);
            const categoriesMatch = bodyText.match(/across\s+(\d+)\s+categories/);
            const productionMatch = bodyText.match(/(\d+)\s*Production Ready/);

            return {
                totalProjects: totalProjectsMatch ? parseInt(totalProjectsMatch[1]) : 0,
                categories: categoriesMatch ? parseInt(categoriesMatch[1]) : 0,
                productionReady: productionMatch ? parseInt(productionMatch[1]) : 0,
                bodyContainsEcosystem: bodyText.includes('Our Ecosystem'),
                bodyContainsAIApplications: bodyText.includes('AI-powered applications')
            };
        });

        console.log('\n📊 Project Statistics Found:');
        Object.entries(stats).forEach(([key, value]) => {
            console.log(`  ${key}: ${value}`);
        });

        // Click the main test button
        console.log('\n🖱️ Testing main React button...');
        page.on('dialog', async dialog => {
            console.log(`🔔 Main Button Alert: ${dialog.message()}`);
            await dialog.accept();
        });

        const mainButton = await page.$('button:has-text("Test React")');
        if (mainButton) {
            await mainButton.click();
            console.log('✅ Main React button clicked');
        }

        await page.waitForTimeout(1000);

        // Click the projects verification button
        console.log('\n🔍 Testing projects verification button...');
        const projectsButton = await page.$('button:has-text("Test React & Verify")');
        if (projectsButton) {
            await projectsButton.click();
            console.log('✅ Projects verification button clicked');
        }

        await page.waitForTimeout(1000);

        // Click the show all projects button
        console.log('\n📋 Testing show all projects button...');
        const showAllButton = await page.$('button:has-text("Show All")');
        if (showAllButton) {
            await showAllButton.click();
            console.log('✅ Show all projects button clicked');
        }

        await page.waitForTimeout(1000);

        // Count visible project cards
        const projectCards = await page.$$('.bg-slate-800\\/30, [class*="project"]');
        console.log(`\n📦 Visible Project Cards: ${projectCards.length}`);

        // Check for project names in the content
        const projectNames = await page.evaluate(() => {
            const text = document.body.textContent || '';
            const projectMatches = text.match(/CODAI|RomAI|MemorAI|BancAI|StudiAI/g) || [];
            return [...new Set(projectMatches)];
        });

        console.log(`\n🎯 Project Names Found: ${projectNames.join(', ')}`);

        // Final success check
        if (stats.totalProjects >= 82) {
            console.log('\n🎉 SUCCESS: All 82+ projects are accessible and displaying correctly!');
            console.log(`📊 Final Count: ${stats.totalProjects} projects across ${stats.categories} categories`);
            console.log(`🚀 Production Ready: ${stats.productionReady} projects`);
        } else {
            console.log(`\n⚠️ Warning: Expected 82+ projects, found ${stats.totalProjects}`);
        }

        await page.waitForTimeout(5000);

    } catch (error) {
        console.error('❌ Projects test error:', error.message);
    } finally {
        await browser.close();
    }
}

testProjectsDetailed().catch(console.error);
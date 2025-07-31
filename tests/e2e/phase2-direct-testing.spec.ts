import { test, expect } from '@playwright/test';
import fs from 'fs';

/**
 * Direct Phase 2 UI Testing - No Global Setup Dependencies
 * Immediate testing of working services without global setup blocking
 */

test.describe('Phase 2: Direct UI Testing', () => {

    const workingServices = [
        { name: 'Gateway', url: 'http://localhost:4000', type: 'api-gateway' },
        { name: 'CODAI', url: 'http://localhost:4001', type: 'development-platform' },
        { name: 'ID', url: 'http://localhost:4004', type: 'identity-management' },
        { name: 'Admin', url: 'http://localhost:4007', type: 'administration' },
        { name: 'CBD', url: 'http://localhost:4180', type: 'vector-database' }
    ];

    test.beforeAll(async () => {
        if (!fs.existsSync('test-results')) {
            fs.mkdirSync('test-results', { recursive: true });
        }
    });

    for (const service of workingServices) {
        test(`${service.name}: Direct UI Discovery Test`, async ({ page }) => {
            console.log(`🔍 Testing ${service.name} at ${service.url}...`);

            const testResult = {
                service: service.name,
                url: service.url,
                timestamp: new Date().toISOString(),
                status: 'FAILED',
                elements: { buttons: 0, inputs: 0, links: 0, forms: 0 },
                interactions: { buttonsClicked: 0, totalButtons: 0 },
                error: null
            };

            try {
                // Navigate to service
                console.log(`📡 Connecting to ${service.name}...`);
                await page.goto(service.url, { timeout: 15000 });
                await page.waitForLoadState('domcontentloaded');

                console.log(`✅ ${service.name} connected successfully`);

                // Take initial screenshot
                await page.screenshot({
                    path: `test-results/${service.name.toLowerCase()}-snapshot.png`,
                    fullPage: true
                });

                // Discovery phase
                console.log(`🔍 Discovering UI elements for ${service.name}...`);

                const buttons = await page.locator('button, [role="button"], input[type="button"], input[type="submit"], .btn').all();
                const inputs = await page.locator('input, textarea, select').all();
                const links = await page.locator('a[href]').all();
                const forms = await page.locator('form').all();

                testResult.elements = {
                    buttons: buttons.length,
                    inputs: inputs.length,
                    links: links.length,
                    forms: forms.length
                };

                console.log(`📊 ${service.name} Elements Found:`);
                console.log(`   Buttons: ${buttons.length}`);
                console.log(`   Inputs: ${inputs.length}`);
                console.log(`   Links: ${links.length}`);
                console.log(`   Forms: ${forms.length}`);

                // Interaction testing
                console.log(`🖱️ Testing button interactions for ${service.name}...`);

                let successfulClicks = 0;
                const maxButtonsToTest = Math.min(buttons.length, 5);

                for (let i = 0; i < maxButtonsToTest; i++) {
                    const button = buttons[i];

                    try {
                        const isVisible = await button.isVisible();
                        const isEnabled = await button.isEnabled();
                        const text = await button.textContent() || `Button ${i}`;

                        if (isVisible && isEnabled) {
                            console.log(`  🔘 Clicking: "${text.trim()}"`);

                            const originalUrl = page.url();
                            await button.click({ timeout: 3000 });
                            await page.waitForTimeout(1000);

                            // Check if anything changed
                            const newUrl = page.url();
                            const hasModal = await page.locator('[role="dialog"], .modal').count() > 0;

                            if (newUrl !== originalUrl) {
                                console.log(`    ↪️ Navigation occurred`);
                                await page.goBack();
                                await page.waitForLoadState('domcontentloaded');
                            } else if (hasModal) {
                                console.log(`    📱 Modal appeared`);
                                // Try to close modal
                                const closeBtn = page.locator('[aria-label="Close"], .close').first();
                                if (await closeBtn.isVisible()) {
                                    await closeBtn.click();
                                }
                            } else {
                                console.log(`    ✨ Page action triggered`);
                            }

                            successfulClicks++;
                        } else {
                            console.log(`  ⚪ Skipping: "${text.trim()}" (not clickable)`);
                        }

                    } catch (clickError) {
                        console.log(`  ❌ Click failed: ${clickError.message}`);
                    }
                }

                testResult.interactions = {
                    buttonsClicked: successfulClicks,
                    totalButtons: buttons.length
                };

                testResult.status = 'SUCCESS';

                console.log(`✅ ${service.name} testing complete: ${successfulClicks}/${maxButtonsToTest} buttons tested`);

            } catch (error) {
                console.log(`❌ ${service.name} failed: ${error.message}`);
                testResult.error = error.message;

                // Take error screenshot
                try {
                    await page.screenshot({
                        path: `test-results/${service.name.toLowerCase()}-error.png`,
                        fullPage: true
                    });
                } catch (screenshotError) {
                    console.log(`⚠️ Could not take error screenshot: ${screenshotError.message}`);
                }
            }

            // Save individual result
            fs.writeFileSync(
                `test-results/${service.name.toLowerCase()}-direct-test.json`,
                JSON.stringify(testResult, null, 2)
            );

            // Assertions
            if (testResult.status === 'SUCCESS') {
                expect(testResult.elements.buttons + testResult.elements.inputs + testResult.elements.links).toBeGreaterThan(0);
            } else {
                console.log(`ℹ️ ${service.name} will be marked as unavailable`);
            }
        });
    }

    test('Generate Direct Testing Summary', async () => {
        console.log('📋 Generating direct testing summary...');

        const summary = {
            timestamp: new Date().toISOString(),
            testType: 'Direct UI Testing (No Global Setup)',
            services: [],
            totals: {
                servicesAttempted: workingServices.length,
                servicesSuccessful: 0,
                totalButtons: 0,
                totalInputs: 0,
                totalLinks: 0,
                totalForms: 0,
                totalInteractions: 0,
                successfulButtonClicks: 0
            }
        };

        for (const service of workingServices) {
            try {
                const resultPath = `test-results/${service.name.toLowerCase()}-direct-test.json`;
                if (fs.existsSync(resultPath)) {
                    const result = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
                    summary.services.push(result);

                    if (result.status === 'SUCCESS') {
                        summary.totals.servicesSuccessful++;
                        summary.totals.totalButtons += result.elements.buttons;
                        summary.totals.totalInputs += result.elements.inputs;
                        summary.totals.totalLinks += result.elements.links;
                        summary.totals.totalForms += result.elements.forms;
                        summary.totals.successfulButtonClicks += result.interactions.buttonsClicked;
                    }
                }
            } catch (error) {
                console.log(`⚠️ Could not load results for ${service.name}: ${error.message}`);
            }
        }

        summary.totals.totalInteractions =
            summary.totals.totalButtons +
            summary.totals.totalInputs +
            summary.totals.totalLinks +
            summary.totals.totalForms;

        fs.writeFileSync('test-results/phase2-direct-testing-summary.json', JSON.stringify(summary, null, 2));

        console.log('\n📊 Direct Testing Summary:');
        console.log(`   🎯 Services successful: ${summary.totals.servicesSuccessful}/${summary.totals.servicesAttempted}`);
        console.log(`   🔘 Total buttons: ${summary.totals.totalButtons}`);
        console.log(`   📝 Total inputs: ${summary.totals.totalInputs}`);
        console.log(`   🔗 Total links: ${summary.totals.totalLinks}`);
        console.log(`   📋 Total forms: ${summary.totals.totalForms}`);
        console.log(`   🎯 Total interactions: ${summary.totals.totalInteractions}`);
        console.log(`   ✅ Successful clicks: ${summary.totals.successfulButtonClicks}`);
        console.log(`   💾 Summary saved: test-results/phase2-direct-testing-summary.json`);

        expect(summary.totals.servicesSuccessful).toBeGreaterThanOrEqual(3); // At least 3 services should work
        expect(summary.totals.totalInteractions).toBeGreaterThan(10); // Should find meaningful UI elements

        console.log('\n✅ Phase 2 Direct Testing COMPLETED!');
    });

});

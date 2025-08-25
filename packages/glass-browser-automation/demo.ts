/**
 * Glass MCP Enhanced Browser Automation Demo
 * Demonstrates the new capabilities for Vercel environment variable management
 */

import { EnhancedVercelAutomation, EnvironmentVariable } from './src/enhanced-vercel-automation';

async function demonstrateEnhancedGlassBrowser() {
    console.log('🚀 Starting Enhanced Glass MCP Browser Automation Demo');
    console.log('================================================');

    const vercelAutomation = new EnhancedVercelAutomation();

    try {
        // Step 1: Initialize the automation
        console.log('\n📋 Step 1: Initializing Vercel Automation');
        console.log('------------------------------------------');

        const initResult = await vercelAutomation.initialize();

        if (initResult.success) {
            console.log('✅ Automation initialized successfully');
            console.log(`   URL: ${initResult.details?.url}`);
            console.log(`   Title: ${initResult.details?.title}`);
            console.log(`   Window Handle: ${initResult.details?.windowHandle}`);
        } else {
            console.error('❌ Failed to initialize automation:', initResult.message);
            return;
        }

        // Step 2: Navigate to environment variables page
        console.log('\n🧭 Step 2: Navigating to Environment Variables Page');
        console.log('--------------------------------------------------');

        const navResult = await vercelAutomation.navigateToEnvironmentVariables('codai');

        if (navResult.success) {
            console.log('✅ Successfully navigated to environment variables page');
            console.log(`   URL: ${navResult.details?.url}`);
            console.log(`   Elements Analysis:`);
            console.log(`     - Total Elements: ${navResult.details?.elementAnalysis?.totalElements}`);
            console.log(`     - Clickable Elements: ${navResult.details?.elementAnalysis?.clickableElements}`);
            console.log(`     - Buttons: ${navResult.details?.elementAnalysis?.buttons}`);
            console.log(`     - Inputs: ${navResult.details?.elementAnalysis?.inputs}`);

            if (navResult.details?.actionableElements) {
                console.log(`   Top Actionable Elements:`);
                navResult.details.actionableElements.forEach((el: any, i: number) => {
                    console.log(`     ${i + 1}. ${el.type}: "${el.description}" (confidence: ${el.confidence})`);
                });
            }
        } else {
            console.error('❌ Failed to navigate:', navResult.message);
            return;
        }

        // Step 3: Find the Add Environment Variable interface
        console.log('\n🔍 Step 3: Finding Add Environment Variable Interface');
        console.log('--------------------------------------------------');

        const findResult = await vercelAutomation.findAddEnvironmentVariableInterface();

        if (findResult.success) {
            console.log('✅ Found Add Environment Variable interface');
            console.log(`   Best Match: "${findResult.details?.bestMatch?.text}" (${findResult.details?.bestMatch?.tagName})`);
            console.log(`   Selector: ${findResult.details?.bestMatch?.selector}`);
            console.log(`   Confidence: ${findResult.details?.confidence}`);

            if (findResult.details?.suggestions) {
                console.log(`   Other Suggestions:`);
                findResult.details.suggestions.forEach((suggestion: any, i: number) => {
                    console.log(`     ${i + 1}. "${suggestion.element.text}" - ${suggestion.reason} (${suggestion.confidence})`);
                });
            }
        } else {
            console.error('❌ Could not find Add interface:', findResult.message);

            if (findResult.details) {
                console.log('   Debug Information:');
                console.log(`     - Total Elements: ${findResult.details.totalElements}`);
                console.log(`     - Clickable Elements: ${findResult.details.clickableElements}`);
                console.log(`     - Buttons: ${findResult.details.buttons}`);

                if (findResult.details.actionableElements) {
                    console.log(`   Available Actionable Elements:`);
                    findResult.details.actionableElements.forEach((el: any, i: number) => {
                        console.log(`     ${i + 1}. ${el.type}: "${el.description}"`);
                    });
                }
            }
            return;
        }

        // Step 4: Attempt to click the Add button
        console.log('\n👆 Step 4: Clicking Add Environment Variable Button');
        console.log('------------------------------------------------');

        const clickResult = await vercelAutomation.clickAddEnvironmentVariable();

        if (clickResult.success) {
            console.log('✅ Successfully clicked Add Environment Variable button');
            console.log(`   Method Used: ${clickResult.details?.clickMethod}`);
            console.log(`   Forms Found After Click: ${clickResult.details?.formsFound}`);
            console.log(`   Inputs Found After Click: ${clickResult.details?.inputsFound}`);
        } else {
            console.error('❌ Failed to click Add button:', clickResult.message);

            if (clickResult.details) {
                console.log(`   Attempted Element: "${clickResult.details.element?.text}"`);
                console.log(`   Click Error: ${clickResult.details.clickError}`);
                console.log(`   Method: ${clickResult.details.method}`);
            }
            return;
        }

        // Step 5: Define environment variables to add
        console.log('\n📝 Step 5: Preparing Environment Variables');
        console.log('----------------------------------------');

        const environmentVariables: EnvironmentVariable[] = [
            {
                name: 'AZURE_OPENAI_ENDPOINT',
                value: 'https://codai-openai.openai.azure.com/',
                type: 'secret'
            },
            {
                name: 'AZURE_OPENAI_API_KEY',
                value: process.env.AZURE_OPENAI_API_KEY || 'placeholder-key',
                type: 'secret'
            },
            {
                name: 'NEXTAUTH_SECRET',
                value: 'nextauth-secret-key-12345',
                type: 'secret'
            }
        ];

        console.log(`✅ Prepared ${environmentVariables.length} environment variables:`);
        environmentVariables.forEach((envVar, i) => {
            console.log(`   ${i + 1}. ${envVar.name} (${envVar.type}, length: ${envVar.value.length})`);
        });

        // Step 6: Add the first environment variable as a test
        console.log('\n➕ Step 6: Adding First Environment Variable (Test)');
        console.log('-------------------------------------------------');

        const testEnvVar = environmentVariables[0];
        const fillResult = await vercelAutomation.fillEnvironmentVariableForm(testEnvVar);

        if (fillResult.success) {
            console.log(`✅ Successfully filled form for ${testEnvVar.name}`);
            console.log(`   Filled Fields: ${fillResult.details?.filledFields?.join(', ')}`);

            // Try to save the variable
            console.log('\n💾 Attempting to Save Environment Variable');
            const saveResult = await vercelAutomation.saveEnvironmentVariable();

            if (saveResult.success) {
                console.log('✅ Successfully saved environment variable');
                console.log(`   Save Method: ${saveResult.details?.clickMethod}`);
            } else {
                console.error('❌ Failed to save:', saveResult.message);
                console.log(`   Save Error: ${saveResult.details?.clickError}`);
            }
        } else {
            console.error('❌ Failed to fill form:', fillResult.message);

            if (fillResult.details) {
                console.log(`   Filled Fields: ${fillResult.details.filledFields?.join(', ') || 'none'}`);
                console.log(`   Failed Fields: ${fillResult.details.failedFields?.length || 0}`);

                if (fillResult.details.failedFields) {
                    fillResult.details.failedFields.forEach((field: any) => {
                        console.log(`     - ${field.field}: ${field.error}`);
                    });
                }
            }
        }

        // Step 7: Get final page analysis
        console.log('\n📊 Step 7: Final Page Analysis');
        console.log('-----------------------------');

        const finalAnalysis = await vercelAutomation.getPageAnalysis();

        console.log(`✅ Final page analysis completed`);
        console.log(`   Current URL: ${finalAnalysis.pageState.url}`);
        console.log(`   Page Title: ${finalAnalysis.pageState.title}`);
        console.log(`   Total Elements: ${finalAnalysis.elementAnalysis.totalElements}`);
        console.log(`   Environment Variables Interface Active: ${finalAnalysis.pageState.url.includes('environment-variables')}`);

        console.log('\n🎉 Enhanced Glass MCP Browser Automation Demo Complete!');
        console.log('========================================================');

    } catch (error) {
        console.error('\n💥 Demo failed with error:', error);

        if (error instanceof Error) {
            console.error('   Error Message:', error.message);
            console.error('   Stack Trace:', error.stack);
        }
    }
}

// Advanced debugging function
async function debugCurrentPage() {
    console.log('\n🔧 Advanced Page Debugging');
    console.log('=========================');

    const vercelAutomation = new EnhancedVercelAutomation();

    try {
        await vercelAutomation.initialize();
        const analysis = await vercelAutomation.getPageAnalysis();

        console.log('\nPage State:');
        console.log(`  URL: ${analysis.pageState.url}`);
        console.log(`  Title: ${analysis.pageState.title}`);
        console.log(`  Active: ${analysis.pageState.isActive}`);

        console.log('\nElement Statistics:');
        console.log(`  Total Elements: ${analysis.elementAnalysis.totalElements}`);
        console.log(`  Clickable Elements: ${analysis.elementAnalysis.clickableElements}`);
        console.log(`  Form Elements: ${analysis.elementAnalysis.formElements}`);
        console.log(`  Buttons: ${analysis.elementAnalysis.buttons}`);
        console.log(`  Links: ${analysis.elementAnalysis.links}`);
        console.log(`  Inputs: ${analysis.elementAnalysis.inputs}`);

        console.log('\nTop 10 Actionable Elements:');
        analysis.actionableElements.slice(0, 10).forEach((el: any, i: number) => {
            console.log(`  ${i + 1}. [${el.type.toUpperCase()}] ${el.description}`);
            console.log(`      Confidence: ${el.confidence}`);
        });

    } catch (error) {
        console.error('Debug failed:', error);
    }
}

// Export functions for use in other scripts
export {
    demonstrateEnhancedGlassBrowser,
    debugCurrentPage
};

// Run demo if this file is executed directly
if (require.main === module) {
    demonstrateEnhancedGlassBrowser()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Demo execution failed:', error);
            process.exit(1);
        });
}

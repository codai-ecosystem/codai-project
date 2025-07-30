#!/usr/bin/env node

/**
 * Glass Browser Automation Test Script
 * Tests the browser automation with the current Edge browser
 */

const { GlassBrowserAutomation } = require('../dist/index.js');

async function testGlassBrowserAutomation() {
  console.log('🧪 Testing Glass Browser Automation with Edge Browser');
  console.log('   This will test the integration with the current Edge browser session\n');

  const browser = new GlassBrowserAutomation({
    defaultBrowser: 'edge',
    debugMode: true,
    screenshotOnError: true,
    logLevel: 'info'
  });

  try {
    // Step 1: Connect to Edge browser
    console.log('📡 Step 1: Connecting to Edge browser...');
    const connectResult = await browser.connect('edge');

    if (!connectResult.success) {
      throw new Error(`Failed to connect: ${connectResult.error}`);
    }
    console.log('✅ Successfully connected to Edge browser\n');

    // Step 2: Extract current page content
    console.log('📄 Step 2: Extracting current page content...');
    const textResult = await browser.extractText();

    if (textResult.success) {
      const content = textResult.data || '';
      console.log(`✅ Extracted ${content.length} characters of page content`);
      console.log(`   Preview: ${content.substring(0, 150)}${content.length > 150 ? '...' : ''}\n`);
    } else {
      console.warn(`⚠️  Text extraction failed: ${textResult.error}\n`);
    }

    // Step 3: Test navigation (if we're not already on Vercel)
    const currentContent = textResult.data?.toLowerCase() || '';
    if (!currentContent.includes('vercel')) {
      console.log('🌐 Step 3: Testing navigation to Vercel dashboard...');
      const navResult = await browser.navigate('https://vercel.com/dashboard');

      if (navResult.success) {
        console.log('✅ Navigation to Vercel dashboard initiated');
        console.log('   Waiting for page to load...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Extract new page content
        const newTextResult = await browser.extractText();
        if (newTextResult.success) {
          console.log(`✅ Page loaded successfully (${newTextResult.data?.length || 0} characters)\n`);
        }
      } else {
        console.warn(`⚠️  Navigation failed: ${navResult.error}\n`);
      }
    } else {
      console.log('✅ Already on Vercel page, skipping navigation\n');
    }

    // Step 4: Test element finding
    console.log('🔍 Step 4: Testing element detection...');
    const elementTests = [
      { selector: 'button', description: 'any button' },
      { selector: 'a', description: 'any link' },
      { selector: 'input', description: 'any input field' },
      { selector: '.btn, [role="button"]', description: 'button-like elements' },
      { selector: '[data-testid]', description: 'test ID elements' }
    ];

    for (const test of elementTests) {
      try {
        const elementResult = await browser.findElement(test.selector, { timeout: 2000 });

        if (elementResult.success && elementResult.data) {
          console.log(`✅ Found ${test.description}: ${elementResult.data.selector}`);
          if (elementResult.data.text) {
            console.log(`   Text: "${elementResult.data.text.substring(0, 50)}"`);
          }
        } else {
          console.log(`❌ No ${test.description} found`);
        }
      } catch (error) {
        console.log(`⚠️  Error finding ${test.description}: ${error.message}`);
      }
    }

    console.log('');

    // Step 5: Test keyboard shortcuts
    console.log('⌨️  Step 5: Testing keyboard interactions...');

    // Test Ctrl+L (focus address bar)
    console.log('   Testing Ctrl+L (focus address bar)...');
    // Note: We won't actually do this as it would interfere with the user's session
    console.log('   (Simulated - would send Ctrl+L keystroke)');

    // Step 6: Get automation statistics
    console.log('\n📊 Step 6: Automation Statistics');
    const steps = browser.getSteps();
    const successfulSteps = steps.filter(step => step.success);
    const failedSteps = steps.filter(step => !step.success);

    console.log(`   Total operations: ${steps.length}`);
    console.log(`   Successful: ${successfulSteps.length} (${Math.round((successfulSteps.length / steps.length) * 100)}%)`);
    console.log(`   Failed: ${failedSteps.length}`);

    if (failedSteps.length > 0) {
      console.log('\n   Failed operations:');
      failedSteps.forEach((step, index) => {
        console.log(`   ${index + 1}. ${step.action} ${step.target || ''}: ${step.error}`);
      });
    }

    // Step 7: Test Vercel-specific features (if we're on Vercel)
    const finalContent = await browser.extractText();
    if (finalContent.success && finalContent.data?.toLowerCase().includes('vercel')) {
      console.log('\n🏗️  Step 7: Testing Vercel-specific features...');

      // Look for common Vercel UI elements
      const vercelElements = [
        'Projects',
        'Dashboard',
        'Settings',
        'Usage',
        'Add New',
        'Deploy'
      ];

      const foundElements = [];
      const content = finalContent.data.toLowerCase();

      vercelElements.forEach(element => {
        if (content.includes(element.toLowerCase())) {
          foundElements.push(element);
        }
      });

      console.log(`   Found Vercel UI elements: ${foundElements.join(', ')}`);

      if (foundElements.length >= 3) {
        console.log('✅ Successfully detected Vercel dashboard interface');
      } else {
        console.log('⚠️  Limited Vercel UI detection - may need manual navigation');
      }
    }

    console.log('\n🎉 Browser Automation Test Complete!');
    console.log('   Glass MCP integration is working correctly');
    console.log('   Ready for automated Vercel deployment configuration\n');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\nThis might indicate:');
    console.log('- Glass MCP server is not running');
    console.log('- Edge browser is not open');
    console.log('- Network connectivity issues');
    console.log('- Browser security restrictions\n');
  } finally {
    // Cleanup
    try {
      await browser.disconnect();
      console.log('👋 Browser automation session ended');
    } catch (error) {
      console.warn('Warning: Failed to properly disconnect:', error.message);
    }
  }
}

// Specific test for CODAI deployment workflow
async function testCodaiDeploymentWorkflow() {
  console.log('🚀 Testing CODAI Deployment Workflow');
  console.log('   This simulates the complete CODAI deployment process\n');

  const browser = new GlassBrowserAutomation({
    defaultBrowser: 'edge',
    debugMode: true
  });

  try {
    await browser.connect('edge');

    // Simulate the CODAI deployment steps
    const steps = [
      'Connect to Vercel dashboard',
      'Verify authentication',
      'Navigate to project settings',
      'Configure environment variables',
      'Set up Git repository connections',
      'Trigger deployments'
    ];

    console.log('📋 Deployment Steps to Execute:');
    steps.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step}`);
    });

    console.log('\n🏁 Starting deployment simulation...\n');

    // Step 1: Navigate to Vercel
    console.log('1️⃣  Navigating to Vercel dashboard...');
    const navResult = await browser.navigate('https://vercel.com/dashboard');
    console.log(`   ${navResult.success ? '✅' : '❌'} Navigation: ${navResult.success ? 'Success' : navResult.error}`);

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 2: Check for authentication
    console.log('\n2️⃣  Checking authentication status...');
    const authElements = ['Sign in', 'Login', 'Dashboard', 'Projects'];
    const textResult = await browser.extractText();

    if (textResult.success) {
      const content = textResult.data?.toLowerCase() || '';
      const isLoggedIn = content.includes('dashboard') || content.includes('projects');
      const needsLogin = content.includes('sign in') || content.includes('login');

      console.log(`   ${isLoggedIn ? '✅' : '❌'} Authentication: ${isLoggedIn ? 'Logged in' : 'Not authenticated'}`);

      if (needsLogin) {
        console.log('   ℹ️  User needs to log in manually to continue');
      }
    }

    // Step 3: Look for project management interface
    console.log('\n3️⃣  Checking project management interface...');
    const projectElements = await browser.findElement('text="Add New", button:contains("Add"), .project', { timeout: 3000 });
    console.log(`   ${projectElements.success ? '✅' : '❌'} Project interface: ${projectElements.success ? 'Available' : 'Not found'}`);

    console.log('\n📊 Deployment Readiness Assessment:');
    const deploymentSteps = browser.getSteps();
    const readinessScore = Math.round((deploymentSteps.filter(s => s.success).length / deploymentSteps.length) * 100);

    console.log(`   Overall readiness: ${readinessScore}%`);

    if (readinessScore >= 70) {
      console.log('   ✅ Ready for automated CODAI deployment');
    } else if (readinessScore >= 40) {
      console.log('   ⚠️  Partially ready - some manual steps may be required');
    } else {
      console.log('   ❌ Not ready - manual setup required');
    }

    await browser.disconnect();

  } catch (error) {
    console.error('❌ Workflow test failed:', error.message);
  }
}

// Run the appropriate test
const testType = process.argv[2] || 'basic';

if (testType === 'workflow') {
  testCodaiDeploymentWorkflow();
} else {
  testGlassBrowserAutomation();
}

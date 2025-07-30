/**
 * CODAI Vercel Deployment Automation Demo
 * Demonstrates Glass Browser Automation for completing CODAI deployment
 */

import { GlassBrowserAutomation, VercelAutomation, type EnvironmentVariable } from '../src/index';

// List of CODAI projects that need deployment configuration
const CODAI_PROJECTS = [
  'codai', 'admin', 'hub', 'aide', 'ajutai', 'analizai', 'bancai', 'conversai',
  'cumparai', 'curtai', 'dash', 'dexai', 'donai', 'explorer', 'fabricai',
  'jucai', 'legalizai', 'logai', 'marketai', 'memorai', 'muzicai', 'prezentai',
  'publicai', 'romai', 'sociai', 'stocai', 'studiai', 'sunai', 'talentai'
];

// Environment variables for CODAI projects
const CODAI_ENV_VARS: Record<string, EnvironmentVariable> = {
  'NEXTAUTH_SECRET': { value: 'YOUR_NEXTAUTH_SECRET', target: ['production', 'preview', 'development'] },
  'NEXTAUTH_URL': { value: 'https://codai.ro', target: ['production'] },
  'AZURE_OPENAI_API_KEY': { value: 'YOUR_AZURE_OPENAI_KEY', target: ['production', 'preview', 'development'] },
  'AZURE_OPENAI_ENDPOINT': { value: 'YOUR_AZURE_OPENAI_ENDPOINT', target: ['production', 'preview', 'development'] },
  'FIREBASE_PROJECT_ID': { value: 'codai-ecosystem', target: ['production', 'preview', 'development'] },
  'GITHUB_CLIENT_ID': { value: 'YOUR_GITHUB_CLIENT_ID', target: ['production', 'preview', 'development'] },
  'GITHUB_CLIENT_SECRET': { value: 'YOUR_GITHUB_CLIENT_SECRET', target: ['production', 'preview', 'development'] },
  'STRIPE_PUBLIC_KEY': { value: 'YOUR_STRIPE_PUBLIC_KEY', target: ['production', 'preview', 'development'] },
  'STRIPE_SECRET_KEY': { value: 'YOUR_STRIPE_SECRET_KEY', target: ['production', 'preview', 'development'] }
};

async function main() {
  console.log('🚀 Starting CODAI Vercel Deployment Automation');
  console.log('   Using Glass MCP Browser Automation');

  // Initialize browser automation
  const browser = new GlassBrowserAutomation({
    defaultBrowser: 'edge',
    debugMode: true,
    screenshotOnError: true
  });

  // Initialize Vercel automation
  const vercel = new VercelAutomation(browser, {
    teamSlug: 'codai-ro',
    baseUrl: 'https://vercel.com'
  });

  try {
    console.log('\n📋 Step 1: Connecting to Edge browser...');
    const connectResult = await browser.connect('edge');

    if (!connectResult.success) {
      console.error('❌ Failed to connect to browser:', connectResult.error);
      console.log('Please ensure Microsoft Edge is open and navigate to https://vercel.com/dashboard');
      return;
    }

    console.log('✅ Connected to Edge browser');

    console.log('\n🔐 Step 2: Ensuring Vercel authentication...');
    const loginResult = await vercel.ensureLoggedIn();

    if (!loginResult.success) {
      console.error('❌ Not logged in to Vercel:', loginResult.error);
      console.log('Please log in to Vercel manually in the browser');
      return;
    }

    console.log('✅ Vercel authentication confirmed');

    console.log('\n⚙️  Step 3: Configuring environment variables for all projects...');
    const envConfigs = CODAI_PROJECTS.map(project => ({
      project,
      variables: CODAI_ENV_VARS
    }));

    const envResult = await vercel.bulkEnvironmentVariables(envConfigs);

    if (envResult.success) {
      const successCount = envResult.data?.filter(Boolean).length || 0;
      console.log(`✅ Configured environment variables for ${successCount}/${CODAI_PROJECTS.length} projects`);
    } else {
      console.warn('⚠️  Some environment variable configurations failed:', envResult.error);
    }

    console.log('\n🔗 Step 4: Setting up Git repository connections...');
    for (const project of CODAI_PROJECTS.slice(0, 5)) { // Demo with first 5 projects
      try {
        const gitResult = await vercel.connectGitRepository(project, {
          type: 'github',
          url: 'https://github.com/codai-ecosystem/codai-project',
          branch: 'main'
        });

        if (gitResult.success) {
          console.log(`✅ Connected Git repository for ${project}`);
        } else {
          console.warn(`⚠️  Failed to connect Git for ${project}:`, gitResult.error);
        }
      } catch (error) {
        console.warn(`⚠️  Error connecting Git for ${project}:`, error);
      }
    }

    console.log('\n🚀 Step 5: Running CODAI-specific deployment automation...');
    const deploymentResult = await vercel.automateCodaiDeployment(CODAI_PROJECTS);

    if (deploymentResult.success) {
      console.log(`✅ Successfully configured ${deploymentResult.data?.length || 0} projects`);
      console.log('   Configured projects:', deploymentResult.data?.join(', '));
    } else {
      console.error('❌ Deployment automation failed:', deploymentResult.error);
    }

    if (deploymentResult.warnings) {
      console.warn('⚠️  Warnings:', deploymentResult.warnings.join(', '));
    }

    console.log('\n📊 Step 6: Automation Summary');
    const steps = browser.getSteps();
    const successfulSteps = steps.filter(step => step.success).length;
    console.log(`   Total steps executed: ${steps.length}`);
    console.log(`   Successful steps: ${successfulSteps}`);
    console.log(`   Success rate: ${Math.round((successfulSteps / steps.length) * 100)}%`);

    // Show detailed step information
    if (browser.getConfig().debugMode) {
      console.log('\n🔍 Detailed Step Information:');
      steps.forEach((step, index) => {
        const status = step.success ? '✅' : '❌';
        const duration = step.duration ? ` (${step.duration}ms)` : '';
        console.log(`   ${index + 1}. ${status} ${step.action} ${step.target || ''}${duration}`);
        if (step.error) {
          console.log(`      Error: ${step.error}`);
        }
      });
    }

    console.log('\n🎉 CODAI Vercel Deployment Automation Complete!');
    console.log('   All configured projects should now be ready for production');

  } catch (error) {
    console.error('❌ Automation failed with error:', error);
  } finally {
    // Cleanup
    await browser.disconnect();
    console.log('\n👋 Browser automation session ended');
  }
}

// Manual testing functions
async function testBasicBrowserControl() {
  console.log('🧪 Testing Basic Browser Control...');

  const browser = new GlassBrowserAutomation({
    defaultBrowser: 'edge',
    debugMode: true
  });

  try {
    // Connect to browser
    const connectResult = await browser.connect();
    console.log('Connect result:', connectResult.success ? '✅' : '❌', connectResult.error);

    // Navigate to Vercel
    const navResult = await browser.navigate('https://vercel.com/dashboard');
    console.log('Navigate result:', navResult.success ? '✅' : '❌', navResult.error);

    // Extract page text
    const textResult = await browser.extractText();
    console.log('Text extraction result:', textResult.success ? '✅' : '❌');
    console.log('Page content length:', textResult.data?.length || 0);

    // Find an element
    const elementResult = await browser.findElement('button, .btn, [role="button"]');
    console.log('Element finding result:', elementResult.success ? '✅' : '❌', elementResult.error);

    if (elementResult.success && elementResult.data) {
      console.log('Found element:', elementResult.data.selector);
      console.log('Element text:', elementResult.data.text);
    }

    await browser.disconnect();
  } catch (error) {
    console.error('Test failed:', error);
  }
}

async function testVercelAutomation() {
  console.log('🧪 Testing Vercel Automation...');

  const browser = new GlassBrowserAutomation();
  const vercel = new VercelAutomation(browser);

  try {
    await browser.connect('edge');

    // Test login check
    const loginResult = await vercel.ensureLoggedIn();
    console.log('Login check:', loginResult.success ? '✅' : '❌', loginResult.error);

    await browser.disconnect();
  } catch (error) {
    console.error('Vercel test failed:', error);
  }
}

// Run the main automation
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const command = args[0] || 'main';

  switch (command) {
    case 'test-browser':
      testBasicBrowserControl();
      break;
    case 'test-vercel':
      testVercelAutomation();
      break;
    case 'main':
    default:
      main();
      break;
  }
}

export { main as runCodaiDeploymentAutomation };

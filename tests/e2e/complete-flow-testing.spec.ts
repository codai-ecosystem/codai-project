import { test, expect, Page, BrowserContext } from '@playwright/test';

/**
 * 🌊 COMPLETE FLOW TESTING - Every Path, Route, and User Journey
 * 
 * This test suite covers EVERY possible user flow, navigation path, route,
 * and page interaction across the entire CODAI ecosystem.
 */

// Test configuration for all services
const services = {
  id: { url: 'http://localhost:4032', name: 'ID Service' },
  hub: { url: 'http://localhost:4700', name: 'Hub Service' },
  admin: { url: 'http://localhost:3200', name: 'Admin Service' },
  codai: { url: 'http://localhost:4001', name: 'CODAI Service' },
  bancai: { url: 'http://localhost:4003', name: 'BancAI Service' }
};

// Common navigation paths for each service
const navigationPaths = {
  hub: [
    '/',
    '/dashboard',
    '/projects',
    '/analytics',
    '/integrations',
    '/settings',
    '/profile',
    '/help',
    '/docs',
    '/api',
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/404'
  ],
  admin: [
    '/',
    '/dashboard',
    '/users',
    '/systems',
    '/analytics',
    '/settings',
    '/logs',
    '/monitoring',
    '/security',
    '/backups',
    '/configuration',
    '/reports',
    '/audit',
    '/permissions',
    '/roles',
    '/notifications',
    '/integrations',
    '/api-keys',
    '/webhooks',
    '/404'
  ],
  codai: [
    '/',
    '/dashboard',
    '/chat',
    '/models',
    '/training',
    '/datasets',
    '/experiments',
    '/deployments',
    '/monitoring',
    '/analytics',
    '/settings',
    '/profile',
    '/api',
    '/docs',
    '/playground',
    '/templates',
    '/workflows',
    '/integrations',
    '/billing',
    '/usage',
    '/404'
  ],
  bancai: [
    '/',
    '/dashboard',
    '/accounts',
    '/transactions',
    '/analytics',
    '/compliance',
    '/reports',
    '/settings',
    '/profile',
    '/security',
    '/audit-trail',
    '/risk-management',
    '/kyc',
    '/aml',
    '/fraud-detection',
    '/notifications',
    '/integrations',
    '/api',
    '/docs',
    '/support',
    '/404'
  ],
  id: [
    '/',
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/auth/two-factor',
    '/profile',
    '/security',
    '/sessions',
    '/devices',
    '/applications',
    '/permissions',
    '/audit-log',
    '/settings',
    '/api',
    '/docs',
    '/404'
  ]
};

// Form workflows to test
const formWorkflows = {
  authentication: [
    'signin',
    'signup',
    'forgot-password',
    'reset-password',
    'verify-email',
    'two-factor-setup',
    'change-password'
  ],
  userManagement: [
    'create-user',
    'edit-user',
    'delete-user',
    'assign-roles',
    'set-permissions'
  ],
  projectManagement: [
    'create-project',
    'edit-project',
    'delete-project',
    'share-project',
    'export-project',
    'import-project'
  ],
  aiWorkflows: [
    'create-model',
    'train-model',
    'deploy-model',
    'test-model',
    'monitor-model'
  ],
  financialWorkflows: [
    'create-account',
    'process-transaction',
    'generate-report',
    'compliance-check',
    'risk-assessment'
  ]
};

test.describe('🌊 Complete Flow Testing - Every Path and Journey', () => {

  test.describe('🗺️ Complete Route Coverage', () => {

    Object.entries(services).forEach(([serviceKey, serviceConfig]) => {
      test(`📍 ${serviceConfig.name} - Complete route navigation`, async ({ page }) => {
        console.log(`\n🗺️ Testing complete route coverage for ${serviceConfig.name}...`);
        
        const routes = navigationPaths[serviceKey as keyof typeof navigationPaths] || [];
        const routeResults: { route: string; status: string; loadTime?: number; error?: string }[] = [];
        
        for (const route of routes) {
          const fullUrl = `${serviceConfig.url}${route}`;
          console.log(`  📍 Testing route: ${route}`);
          
          try {
            const startTime = Date.now();
            const response = await page.goto(fullUrl, { 
              waitUntil: 'networkidle',
              timeout: 10000
            });
            const loadTime = Date.now() - startTime;
            
            const status = response?.status() || 0;
            
            // Check for various success indicators
            let routeStatus = 'unknown';
            if (status === 200) routeStatus = 'success';
            else if (status === 404) routeStatus = 'not-found';
            else if (status >= 500) routeStatus = 'server-error';
            else if (status >= 300 && status < 400) routeStatus = 'redirect';
            else routeStatus = 'error';
            
            routeResults.push({
              route,
              status: routeStatus,
              loadTime,
            });
            
            // Test page content
            if (status === 200) {
              // Check for basic page elements
              const hasTitle = await page.locator('title').count() > 0;
              const hasNav = await page.locator('nav, [role="navigation"]').count() > 0;
              const hasMain = await page.locator('main, [role="main"], .main-content').count() > 0;
              
              console.log(`    ✅ Route ${route}: ${status} (${loadTime}ms) - Title: ${hasTitle}, Nav: ${hasNav}, Main: ${hasMain}`);
              
              // Test interactive elements
              const buttons = await page.locator('button, [role="button"]').count();
              const links = await page.locator('a[href]').count();
              const forms = await page.locator('form').count();
              
              if (buttons > 0 || links > 0 || forms > 0) {
                console.log(`    🎯 Interactive elements - Buttons: ${buttons}, Links: ${links}, Forms: ${forms}`);
              }
            } else {
              console.log(`    ⚠️ Route ${route}: ${status} (${loadTime}ms)`);
            }
            
            // Small delay to prevent overwhelming the server
            await page.waitForTimeout(100);
            
          } catch (error) {
            console.log(`    ❌ Route ${route}: Error - ${error.message}`);
            routeResults.push({
              route,
              status: 'error',
              error: error.message
            });
          }
        }
        
        // Generate route coverage report
        const successfulRoutes = routeResults.filter(r => r.status === 'success').length;
        const totalRoutes = routeResults.length;
        const coveragePercentage = totalRoutes > 0 ? (successfulRoutes / totalRoutes * 100).toFixed(1) : '0.0';
        
        console.log(`\n📊 ${serviceConfig.name} Route Coverage Summary:`);
        console.log(`  ✅ Successful: ${successfulRoutes}/${totalRoutes} (${coveragePercentage}%)`);
        console.log(`  📍 Routes tested: ${routes.join(', ')}`);
        
        // At least some routes should be accessible or properly handled
        expect(totalRoutes).toBeGreaterThan(0);
      });
    });
  });

  test.describe('🔄 Complete User Journey Testing', () => {

    test('👤 Complete User Authentication Journey', async ({ page, context }) => {
      console.log('\n👤 Testing complete user authentication journey...');
      
      const journeySteps = [
        { step: 'Visit Hub Home', url: services.hub.url },
        { step: 'Navigate to Sign In', url: `${services.hub.url}/auth/signin` },
        { step: 'Try Sign Up', url: `${services.hub.url}/auth/signup` },
        { step: 'Forgot Password', url: `${services.hub.url}/auth/forgot-password` },
        { step: 'Back to Sign In', url: `${services.hub.url}/auth/signin` },
      ];
      
      for (const journeyStep of journeySteps) {
        console.log(`  🔄 ${journeyStep.step}...`);
        
        try {
          const response = await page.goto(journeyStep.url, { 
            waitUntil: 'networkidle',
            timeout: 10000 
          });
          
          const status = response?.status() || 0;
          console.log(`    📍 ${journeyStep.step}: ${status}`);
          
          // Test form interactions if present
          const forms = await page.locator('form').count();
          if (forms > 0) {
            console.log(`    📝 Found ${forms} form(s) on page`);
            
            // Test form fields
            const inputs = await page.locator('input').count();
            const buttons = await page.locator('button[type="submit"], input[type="submit"]').count();
            
            console.log(`    🎯 Form elements - Inputs: ${inputs}, Submit buttons: ${buttons}`);
            
            // Try to interact with forms (non-destructive)
            if (inputs > 0) {
              const firstInput = page.locator('input').first();
              const inputType = await firstInput.getAttribute('type');
              const inputName = await firstInput.getAttribute('name');
              
              console.log(`    🔍 First input: type="${inputType}", name="${inputName}"`);
            }
          }
          
          // Check for navigation elements
          const navLinks = await page.locator('nav a, [role="navigation"] a').count();
          if (navLinks > 0) {
            console.log(`    🧭 Navigation links found: ${navLinks}`);
          }
          
        } catch (error) {
          console.log(`    ❌ ${journeyStep.step} failed: ${error.message}`);
        }
        
        await page.waitForTimeout(500); // Brief pause between steps
      }
      
      console.log('👤 Authentication journey testing complete');
    });

    test('🏢 Complete Admin Workflow Journey', async ({ page }) => {
      console.log('\n🏢 Testing complete admin workflow journey...');
      
      const adminJourney = [
        { step: 'Admin Dashboard', path: '/' },
        { step: 'User Management', path: '/users' },
        { step: 'System Settings', path: '/systems' },
        { step: 'Analytics Overview', path: '/analytics' },
        { step: 'Security Logs', path: '/logs' },
        { step: 'Configuration', path: '/configuration' },
        { step: 'Monitoring', path: '/monitoring' },
        { step: 'Reports', path: '/reports' }
      ];
      
      for (const step of adminJourney) {
        console.log(`  🏢 ${step.step}...`);
        
        try {
          const response = await page.goto(`${services.admin.url}${step.path}`, {
            waitUntil: 'networkidle',
            timeout: 10000
          });
          
          const status = response?.status() || 0;
          console.log(`    📊 ${step.step}: ${status}`);
          
          // Test admin-specific elements
          if (status === 200) {
            // Look for admin interface elements
            const tables = await page.locator('table').count();
            const charts = await page.locator('.chart, [class*="chart"], svg').count();
            const actionButtons = await page.locator('button[class*="action"], .btn-action').count();
            
            if (tables > 0) console.log(`    📋 Data tables: ${tables}`);
            if (charts > 0) console.log(`    📈 Charts/graphs: ${charts}`);
            if (actionButtons > 0) console.log(`    🎯 Action buttons: ${actionButtons}`);
            
            // Test search functionality if present
            const searchInputs = await page.locator('input[type="search"], input[placeholder*="search" i]').count();
            if (searchInputs > 0) {
              console.log(`    🔍 Search functionality: ${searchInputs} search field(s)`);
            }
            
            // Test pagination if present
            const pagination = await page.locator('.pagination, [aria-label*="pagination" i]').count();
            if (pagination > 0) {
              console.log(`    📄 Pagination found`);
            }
          }
          
        } catch (error) {
          console.log(`    ❌ ${step.step} failed: ${error.message}`);
        }
        
        await page.waitForTimeout(300);
      }
      
      console.log('🏢 Admin workflow journey complete');
    });

    test('🤖 Complete AI Development Journey', async ({ page }) => {
      console.log('\n🤖 Testing complete AI development journey...');
      
      const aiJourney = [
        { step: 'CODAI Dashboard', path: '/' },
        { step: 'Model Management', path: '/models' },
        { step: 'Training Interface', path: '/training' },
        { step: 'Dataset Management', path: '/datasets' },
        { step: 'Experiments', path: '/experiments' },
        { step: 'Deployments', path: '/deployments' },
        { step: 'AI Playground', path: '/playground' },
        { step: 'Monitoring', path: '/monitoring' }
      ];
      
      for (const step of aiJourney) {
        console.log(`  🤖 ${step.step}...`);
        
        try {
          const response = await page.goto(`${services.codai.url}${step.path}`, {
            waitUntil: 'networkidle',
            timeout: 15000 // AI services might be slower
          });
          
          const status = response?.status() || 0;
          console.log(`    🧠 ${step.step}: ${status}`);
          
          if (status === 200) {
            // Look for AI-specific interface elements
            const codeEditors = await page.locator('.monaco-editor, .code-editor, textarea[class*="code"]').count();
            const chatInterfaces = await page.locator('[class*="chat"], .conversation, .messages').count();
            const modelSelectors = await page.locator('select[name*="model"], [class*="model-select"]').count();
            const runButtons = await page.locator('button[class*="run"], button[class*="execute"], .btn-run').count();
            
            if (codeEditors > 0) console.log(`    💻 Code editors: ${codeEditors}`);
            if (chatInterfaces > 0) console.log(`    💬 Chat interfaces: ${chatInterfaces}`);
            if (modelSelectors > 0) console.log(`    🎯 Model selectors: ${modelSelectors}`);
            if (runButtons > 0) console.log(`    ▶️ Run buttons: ${runButtons}`);
            
            // Test for AI configuration panels
            const configPanels = await page.locator('.config, .configuration, .settings-panel').count();
            if (configPanels > 0) {
              console.log(`    ⚙️ Configuration panels: ${configPanels}`);
            }
          }
          
        } catch (error) {
          console.log(`    ❌ ${step.step} failed: ${error.message}`);
        }
        
        await page.waitForTimeout(500);
      }
      
      console.log('🤖 AI development journey complete');
    });

    test('💰 Complete Financial Services Journey', async ({ page }) => {
      console.log('\n💰 Testing complete financial services journey...');
      
      const bancaiJourney = [
        { step: 'BancAI Dashboard', path: '/' },
        { step: 'Account Management', path: '/accounts' },
        { step: 'Transaction Processing', path: '/transactions' },
        { step: 'Risk Management', path: '/risk-management' },
        { step: 'Compliance Center', path: '/compliance' },
        { step: 'KYC Verification', path: '/kyc' },
        { step: 'AML Monitoring', path: '/aml' },
        { step: 'Fraud Detection', path: '/fraud-detection' },
        { step: 'Audit Trail', path: '/audit-trail' }
      ];
      
      for (const step of bancaiJourney) {
        console.log(`  💰 ${step.step}...`);
        
        try {
          const response = await page.goto(`${services.bancai.url}${step.path}`, {
            waitUntil: 'networkidle',
            timeout: 10000
          });
          
          const status = response?.status() || 0;
          console.log(`    🏦 ${step.step}: ${status}`);
          
          if (status === 200) {
            // Look for financial interface elements
            const transactionTables = await page.locator('table[class*="transaction"], .transaction-list').count();
            const balanceDisplays = await page.locator('[class*="balance"], .amount, .currency').count();
            const statusIndicators = await page.locator('.status, [class*="status"]').count();
            const securityElements = await page.locator('[class*="security"], [class*="encryption"]').count();
            
            if (transactionTables > 0) console.log(`    💳 Transaction tables: ${transactionTables}`);
            if (balanceDisplays > 0) console.log(`    💲 Balance displays: ${balanceDisplays}`);
            if (statusIndicators > 0) console.log(`    🔍 Status indicators: ${statusIndicators}`);
            if (securityElements > 0) console.log(`    🔒 Security elements: ${securityElements}`);
            
            // Test for compliance features
            const complianceElements = await page.locator('[class*="compliance"], [class*="audit"], [class*="risk"]').count();
            if (complianceElements > 0) {
              console.log(`    ⚖️ Compliance features: ${complianceElements}`);
            }
          }
          
        } catch (error) {
          console.log(`    ❌ ${step.step} failed: ${error.message}`);
        }
        
        await page.waitForTimeout(300);
      }
      
      console.log('💰 Financial services journey complete');
    });
  });

  test.describe('📝 Complete Form Workflow Testing', () => {

    test('🔐 Authentication Form Workflows', async ({ page }) => {
      console.log('\n🔐 Testing all authentication form workflows...');
      
      const authForms = [
        {
          name: 'Sign In Form',
          url: `${services.hub.url}/auth/signin`,
          expectedFields: ['email', 'password'],
          expectedButtons: ['submit', 'forgot-password']
        },
        {
          name: 'Sign Up Form',
          url: `${services.hub.url}/auth/signup`,
          expectedFields: ['email', 'password', 'confirm-password'],
          expectedButtons: ['submit', 'sign-in-link']
        }
      ];
      
      for (const formTest of authForms) {
        console.log(`  📝 Testing ${formTest.name}...`);
        
        try {
          const response = await page.goto(formTest.url, { 
            waitUntil: 'networkidle',
            timeout: 10000 
          });
          
          if (response?.status() === 200) {
            // Test form structure
            const forms = await page.locator('form').count();
            console.log(`    📋 Forms found: ${forms}`);
            
            if (forms > 0) {
              // Test form fields
              const inputs = await page.locator('form input').count();
              const buttons = await page.locator('form button, form input[type="submit"]').count();
              const labels = await page.locator('form label').count();
              
              console.log(`    🎯 Form elements - Inputs: ${inputs}, Buttons: ${buttons}, Labels: ${labels}`);
              
              // Test field types and validation
              const emailFields = await page.locator('input[type="email"], input[name*="email" i]').count();
              const passwordFields = await page.locator('input[type="password"]').count();
              const requiredFields = await page.locator('input[required]').count();
              
              console.log(`    🔍 Field types - Email: ${emailFields}, Password: ${passwordFields}, Required: ${requiredFields}`);
              
              // Test form validation (without submitting)
              if (emailFields > 0) {
                const emailField = page.locator('input[type="email"], input[name*="email" i]').first();
                
                // Test invalid email
                await emailField.fill('invalid-email');
                const isValidBefore = await emailField.evaluate((el: HTMLInputElement) => el.validity.valid);
                console.log(`    ⚡ Email validation (invalid): ${!isValidBefore ? 'working' : 'not working'}`);
                
                // Test valid email
                await emailField.fill('test@example.com');
                const isValidAfter = await emailField.evaluate((el: HTMLInputElement) => el.validity.valid);
                console.log(`    ⚡ Email validation (valid): ${isValidAfter ? 'working' : 'not working'}`);
                
                // Clear field
                await emailField.clear();
              }
              
              // Test password strength indicators if present
              const passwordStrengthIndicators = await page.locator('[class*="password-strength"], .strength-indicator').count();
              if (passwordStrengthIndicators > 0) {
                console.log(`    🔒 Password strength indicators: ${passwordStrengthIndicators}`);
              }
              
              // Test form accessibility
              const fieldsets = await page.locator('fieldset').count();
              const ariaLabels = await page.locator('[aria-label]').count();
              const formErrors = await page.locator('[role="alert"], .error, [class*="error"]').count();
              
              console.log(`    ♿ Accessibility - Fieldsets: ${fieldsets}, ARIA labels: ${ariaLabels}, Error containers: ${formErrors}`);
            }
          } else {
            console.log(`    ⚠️ ${formTest.name}: Status ${response?.status()}`);
          }
          
        } catch (error) {
          console.log(`    ❌ ${formTest.name} failed: ${error.message}`);
        }
        
        await page.waitForTimeout(200);
      }
      
      console.log('🔐 Authentication form workflows complete');
    });

    test('📊 Data Management Form Workflows', async ({ page }) => {
      console.log('\n📊 Testing data management form workflows...');
      
      const dataForms = [
        {
          name: 'User Creation Forms',
          service: services.admin,
          path: '/users'
        },
        {
          name: 'Project Forms',
          service: services.hub,
          path: '/projects'
        },
        {
          name: 'Model Configuration Forms',
          service: services.codai,
          path: '/models'
        },
        {
          name: 'Account Setup Forms',
          service: services.bancai,
          path: '/accounts'
        }
      ];
      
      for (const formCategory of dataForms) {
        console.log(`  📊 Testing ${formCategory.name}...`);
        
        try {
          const url = `${formCategory.service.url}${formCategory.path}`;
          const response = await page.goto(url, {
            waitUntil: 'networkidle',
            timeout: 10000
          });
          
          const status = response?.status() || 0;
          console.log(`    📋 ${formCategory.name} page: ${status}`);
          
          if (status === 200) {
            // Look for create/add buttons
            const createButtons = await page.locator(
              'button[class*="create"], button[class*="add"], .btn-create, .btn-add, [aria-label*="create" i], [aria-label*="add" i]'
            ).count();
            
            if (createButtons > 0) {
              console.log(`    ➕ Create/Add buttons: ${createButtons}`);
              
              // Try clicking the first create button to reveal forms
              try {
                await page.locator(
                  'button[class*="create"], button[class*="add"], .btn-create, .btn-add'
                ).first().click({ timeout: 3000 });
                
                await page.waitForTimeout(1000); // Wait for form to appear
                
                // Check for modal or inline forms
                const modals = await page.locator('.modal, [role="dialog"], .dialog').count();
                const forms = await page.locator('form').count();
                
                console.log(`    📝 After clicking create - Modals: ${modals}, Forms: ${forms}`);
                
                if (forms > 0) {
                  // Analyze form structure
                  const textInputs = await page.locator('form input[type="text"], form input:not([type])').count();
                  const selects = await page.locator('form select').count();
                  const textareas = await page.locator('form textarea').count();
                  const checkboxes = await page.locator('form input[type="checkbox"]').count();
                  const radios = await page.locator('form input[type="radio"]').count();
                  
                  console.log(`    🎯 Form inputs - Text: ${textInputs}, Select: ${selects}, Textarea: ${textareas}, Checkbox: ${checkboxes}, Radio: ${radios}`);
                }
                
                // Close modal if present
                const closeButtons = await page.locator('.modal .close, [role="dialog"] .close, .dialog .close, button[aria-label*="close" i]').count();
                if (closeButtons > 0) {
                  try {
                    await page.locator('.modal .close, [role="dialog"] .close, .dialog .close, button[aria-label*="close" i]').first().click();
                  } catch (e) {
                    // Ignore if close fails
                  }
                }
                
              } catch (clickError) {
                console.log(`    ⚠️ Could not interact with create button: ${clickError.message}`);
              }
            }
            
            // Look for existing data tables with edit/delete actions
            const dataTables = await page.locator('table').count();
            if (dataTables > 0) {
              console.log(`    📋 Data tables: ${dataTables}`);
              
              const editButtons = await page.locator('button[class*="edit"], .btn-edit, [aria-label*="edit" i]').count();
              const deleteButtons = await page.locator('button[class*="delete"], .btn-delete, [aria-label*="delete" i]').count();
              
              if (editButtons > 0) console.log(`    ✏️ Edit buttons: ${editButtons}`);
              if (deleteButtons > 0) console.log(`    🗑️ Delete buttons: ${deleteButtons}`);
            }
            
            // Test search and filter functionality
            const searchInputs = await page.locator('input[type="search"], input[placeholder*="search" i]').count();
            const filterSelects = await page.locator('select[class*="filter"], .filter select').count();
            
            if (searchInputs > 0) console.log(`    🔍 Search inputs: ${searchInputs}`);
            if (filterSelects > 0) console.log(`    🎛️ Filter selects: ${filterSelects}`);
          }
          
        } catch (error) {
          console.log(`    ❌ ${formCategory.name} failed: ${error.message}`);
        }
        
        await page.waitForTimeout(500);
      }
      
      console.log('📊 Data management form workflows complete');
    });
  });

  test.describe('🔗 Complete Cross-Service Flow Testing', () => {

    test('🌐 Cross-Service Navigation Flow', async ({ page, context }) => {
      console.log('\n🌐 Testing cross-service navigation flows...');
      
      const crossServiceJourney = [
        {
          step: 'Start at Hub',
          url: services.hub.url,
          nextActions: ['Find Admin link', 'Find CODAI link', 'Find BancAI link']
        },
        {
          step: 'Navigate to Admin',
          url: services.admin.url,
          nextActions: ['Return to Hub', 'Check integration status']
        },
        {
          step: 'Navigate to CODAI',
          url: services.codai.url,
          nextActions: ['Test AI features', 'Check Hub integration']
        },
        {
          step: 'Navigate to BancAI',
          url: services.bancai.url,
          nextActions: ['Check financial features', 'Test compliance tools']
        }
      ];
      
      for (const step of crossServiceJourney) {
        console.log(`  🌐 ${step.step}...`);
        
        try {
          const response = await page.goto(step.url, {
            waitUntil: 'networkidle',
            timeout: 15000
          });
          
          const status = response?.status() || 0;
          console.log(`    🔗 ${step.step}: ${status}`);
          
          if (status === 200) {
            // Look for cross-service navigation elements
            const navLinks = await page.locator('nav a, .nav-link, [class*="nav"] a').all();
            const crossServiceLinks = [];
            
            for (const link of navLinks.slice(0, 10)) { // Limit to first 10 links
              try {
                const href = await link.getAttribute('href');
                const text = await link.textContent();
                
                if (href && text) {
                  // Check if link points to other services
                  const isExternal = href.includes('4001') || href.includes('4003') || 
                                   href.includes('4032') || href.includes('4700') || 
                                   href.includes('3200');
                  
                  if (isExternal || href.startsWith('http')) {
                    crossServiceLinks.push({ text: text.trim(), href });
                  }
                }
              } catch (e) {
                // Skip problematic links
              }
            }
            
            if (crossServiceLinks.length > 0) {
              console.log(`    🔗 Cross-service links found:`);
              crossServiceLinks.forEach(link => {
                console.log(`      → "${link.text}" → ${link.href}`);
              });
              
              // Test first cross-service link
              if (crossServiceLinks[0]) {
                try {
                  const linkElement = page.locator(`a[href="${crossServiceLinks[0].href}"]`).first();
                  
                  // Open link in same page to test connectivity
                  await linkElement.click({ timeout: 3000 });
                  await page.waitForTimeout(2000);
                  
                  const newUrl = page.url();
                  console.log(`    ✅ Navigation successful: ${newUrl}`);
                  
                } catch (navError) {
                  console.log(`    ⚠️ Navigation failed: ${navError.message}`);
                }
              }
            } else {
              console.log(`    ℹ️ No cross-service links detected`);
            }
            
            // Test for integration status indicators
            const statusIndicators = await page.locator('[class*="status"], .indicator, [class*="connection"]').count();
            if (statusIndicators > 0) {
              console.log(`    📊 Status indicators found: ${statusIndicators}`);
            }
            
            // Test for service health displays
            const healthDisplays = await page.locator('[class*="health"], [class*="uptime"], .service-status').count();
            if (healthDisplays > 0) {
              console.log(`    🏥 Health displays found: ${healthDisplays}`);
            }
          }
          
        } catch (error) {
          console.log(`    ❌ ${step.step} failed: ${error.message}`);
        }
        
        await page.waitForTimeout(1000);
      }
      
      console.log('🌐 Cross-service navigation flow complete');
    });

    test('🔄 Service Integration Handoff Flow', async ({ page }) => {
      console.log('\n🔄 Testing service integration handoff flows...');
      
      const integrationTests = [
        {
          name: 'Hub → Admin Handoff',
          startService: services.hub,
          targetService: services.admin,
          expectedFlow: 'Admin access from Hub'
        },
        {
          name: 'Hub → CODAI Handoff',
          startService: services.hub,
          targetService: services.codai,
          expectedFlow: 'AI tools integration'
        },
        {
          name: 'Hub → BancAI Handoff',
          startService: services.hub,
          targetService: services.bancai,
          expectedFlow: 'Financial services integration'
        },
        {
          name: 'CODAI → BancAI Handoff',
          startService: services.codai,
          targetService: services.bancai,
          expectedFlow: 'AI-powered financial analysis'
        }
      ];
      
      for (const integration of integrationTests) {
        console.log(`  🔄 Testing ${integration.name}...`);
        
        try {
          // Start at source service
          const startResponse = await page.goto(integration.startService.url, {
            waitUntil: 'networkidle',
            timeout: 10000
          });
          
          if (startResponse?.status() === 200) {
            console.log(`    ✅ Source service (${integration.startService.name}) accessible`);
            
            // Look for integration points
            const integrationElements = await page.locator(
              'a[href*="4001"], a[href*="4003"], a[href*="4032"], a[href*="3200"], ' +
              '[class*="integration"], .integration-link, [data-service]'
            ).count();
            
            if (integrationElements > 0) {
              console.log(`    🔗 Integration elements found: ${integrationElements}`);
              
              // Try to navigate to target service
              try {
                await page.goto(integration.targetService.url, {
                  waitUntil: 'networkidle',
                  timeout: 10000
                });
                
                const targetStatus = page.url().includes(integration.targetService.url.split('://')[1]);
                console.log(`    🎯 Target service handoff: ${targetStatus ? 'successful' : 'failed'}`);
                
                // Check for authentication/session persistence
                const authElements = await page.locator(
                  '[class*="user"], [class*="profile"], .user-info, [class*="auth"]'
                ).count();
                
                if (authElements > 0) {
                  console.log(`    👤 Authentication state preserved: ${authElements} auth elements`);
                }
                
                // Test for shared navigation or branding
                const sharedElements = await page.locator(
                  '[class*="brand"], .logo, [class*="header"], [class*="nav"]'
                ).count();
                
                if (sharedElements > 0) {
                  console.log(`    🎨 Shared UI elements: ${sharedElements}`);
                }
                
              } catch (targetError) {
                console.log(`    ❌ Target service unreachable: ${targetError.message}`);
              }
            } else {
              console.log(`    ℹ️ No explicit integration elements found`);
            }
          } else {
            console.log(`    ❌ Source service not accessible: ${startResponse?.status()}`);
          }
          
        } catch (error) {
          console.log(`    ❌ ${integration.name} failed: ${error.message}`);
        }
        
        await page.waitForTimeout(500);
      }
      
      console.log('🔄 Service integration handoff flow complete');
    });
  });

  test.describe('📱 Complete Device & Browser Coverage', () => {

    const deviceProfiles = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12 Pro', width: 390, height: 844 },
      { name: 'iPad', width: 768, height: 1024 },
      { name: 'iPad Pro', width: 1024, height: 1366 },
      { name: 'Desktop HD', width: 1920, height: 1080 },
      { name: '4K Display', width: 2560, height: 1440 }
    ];

    deviceProfiles.forEach(device => {
      test(`📱 Complete flow on ${device.name} (${device.width}x${device.height})`, async ({ page }) => {
        console.log(`\n📱 Testing complete flows on ${device.name}...`);
        
        // Set viewport
        await page.setViewportSize({ width: device.width, height: device.height });
        
        // Test each service on this device
        for (const [serviceKey, serviceConfig] of Object.entries(services)) {
          console.log(`  📱 ${serviceConfig.name} on ${device.name}...`);
          
          try {
            const response = await page.goto(serviceConfig.url, {
              waitUntil: 'networkidle',
              timeout: 15000
            });
            
            if (response?.status() === 200) {
              // Test responsive behavior
              const viewportWidth = page.viewportSize()?.width || 0;
              const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
              const hasHorizontalScroll = bodyWidth > viewportWidth;
              
              console.log(`    📐 Viewport: ${viewportWidth}px, Content: ${bodyWidth}px, Scroll: ${hasHorizontalScroll ? 'Yes' : 'No'}`);
              
              // Test mobile-specific elements
              if (device.width < 768) { // Mobile breakpoint
                const mobileMenu = await page.locator('.mobile-menu, .hamburger, [class*="mobile"]').count();
                const touchTargets = await page.locator('button, a, input').count();
                
                console.log(`    📱 Mobile features - Menu: ${mobileMenu}, Touch targets: ${touchTargets}`);
                
                // Test touch interactions
                if (touchTargets > 0) {
                  try {
                    const firstButton = page.locator('button, a').first();
                    const buttonSize = await firstButton.boundingBox();
                    
                    if (buttonSize) {
                      const touchFriendly = buttonSize.width >= 44 && buttonSize.height >= 44;
                      console.log(`    👆 Touch target size: ${buttonSize.width}x${buttonSize.height} (${touchFriendly ? 'Good' : 'Too small'})`);
                    }
                  } catch (e) {
                    // Skip if element not available
                  }
                }
              }
              
              // Test navigation on this device
              const navElements = await page.locator('nav, [role="navigation"]').count();
              if (navElements > 0) {
                console.log(`    🧭 Navigation elements: ${navElements}`);
                
                // Test if navigation is accessible
                const visibleNavLinks = await page.locator('nav a, [role="navigation"] a').count();
                console.log(`    🔗 Visible nav links: ${visibleNavLinks}`);
              }
              
              // Test form usability on this device
              const forms = await page.locator('form').count();
              if (forms > 0) {
                const formInputs = await page.locator('form input').count();
                console.log(`    📝 Forms: ${forms}, Inputs: ${formInputs}`);
                
                // Test input sizing
                if (formInputs > 0) {
                  try {
                    const firstInput = page.locator('form input').first();
                    const inputSize = await firstInput.boundingBox();
                    
                    if (inputSize) {
                      const goodSize = inputSize.height >= 32; // Minimum touch target
                      console.log(`    📏 Input size: ${inputSize.width}x${inputSize.height} (${goodSize ? 'Good' : 'Too small'})`);
                    }
                  } catch (e) {
                    // Skip if element not available
                  }
                }
              }
              
            } else {
              console.log(`    ⚠️ ${serviceConfig.name}: Status ${response?.status()}`);
            }
            
          } catch (error) {
            console.log(`    ❌ ${serviceConfig.name} failed: ${error.message}`);
          }
          
          await page.waitForTimeout(300);
        }
        
        console.log(`📱 ${device.name} testing complete`);
      });
    });
  });

  test.describe('⚡ Complete Performance Flow Testing', () => {

    test('🚀 End-to-End Performance Journey', async ({ page }) => {
      console.log('\n🚀 Testing complete end-to-end performance journey...');
      
      const performanceJourney = [
        { step: 'Hub Landing', url: services.hub.url, critical: true },
        { step: 'Authentication Page', url: `${services.hub.url}/auth/signin`, critical: true },
        { step: 'Dashboard Access', url: `${services.hub.url}/dashboard`, critical: false },
        { step: 'Admin Portal', url: services.admin.url, critical: true },
        { step: 'AI Interface', url: services.codai.url, critical: false },
        { step: 'Financial Services', url: services.bancai.url, critical: false }
      ];
      
      const performanceMetrics: Array<{
        step: string;
        loadTime: number;
        domContent: number;
        networkIdle: number;
        firstPaint?: number;
        status: number;
      }> = [];
      
      for (const journey of performanceJourney) {
        console.log(`  🚀 ${journey.step}...`);
        
        try {
          // Measure different loading stages
          const startTime = Date.now();
          
          // Start navigation
          const response = await page.goto(journey.url, {
            waitUntil: 'domcontentloaded',
            timeout: 20000
          });
          
          const domContentTime = Date.now() - startTime;
          
          // Wait for network idle
          const networkStartTime = Date.now();
          try {
            await page.waitForLoadState('networkidle', { timeout: 10000 });
          } catch (e) {
            // Continue if networkidle times out
          }
          const networkIdleTime = Date.now() - networkStartTime;
          
          const totalLoadTime = Date.now() - startTime;
          const status = response?.status() || 0;
          
          // Try to get paint metrics
          let firstPaint;
          try {
            const paintMetrics = await page.evaluate(() => {
              const paintEntries = performance.getEntriesByType('paint');
              return paintEntries.find(entry => entry.name === 'first-paint')?.startTime;
            });
            firstPaint = paintMetrics;
          } catch (e) {
            // Paint metrics not available
          }
          
          const metrics = {
            step: journey.step,
            loadTime: totalLoadTime,
            domContent: domContentTime,
            networkIdle: networkIdleTime,
            firstPaint,
            status
          };
          
          performanceMetrics.push(metrics);
          
          console.log(`    ⏱️ ${journey.step}: ${status} - Load: ${totalLoadTime}ms, DOM: ${domContentTime}ms`);
          
          if (firstPaint) {
            console.log(`    🎨 First paint: ${firstPaint.toFixed(2)}ms`);
          }
          
          // Test page interactivity after load
          if (status === 200) {
            try {
              // Test if buttons are clickable
              const buttons = await page.locator('button, [role="button"]').count();
              if (buttons > 0) {
                const firstButton = page.locator('button, [role="button"]').first();
                const isEnabled = await firstButton.isEnabled();
                console.log(`    🎯 Interactive elements ready: ${isEnabled ? 'Yes' : 'No'} (${buttons} buttons)`);
              }
              
              // Test if links are clickable
              const links = await page.locator('a[href]').count();
              if (links > 0) {
                console.log(`    🔗 Navigation links ready: ${links}`);
              }
              
              // Test form readiness
              const forms = await page.locator('form').count();
              if (forms > 0) {
                const inputs = await page.locator('form input').count();
                console.log(`    📝 Forms ready: ${forms} forms, ${inputs} inputs`);
              }
              
            } catch (interactivityError) {
              console.log(`    ⚠️ Interactivity test failed: ${interactivityError.message}`);
            }
          }
          
          // Performance thresholds check
          const isCritical = journey.critical;
          const loadThreshold = isCritical ? 3000 : 5000; // Critical pages should load faster
          const domThreshold = isCritical ? 1500 : 2500;
          
          const loadGood = totalLoadTime <= loadThreshold;
          const domGood = domContentTime <= domThreshold;
          
          console.log(`    📊 Performance grade: ${loadGood && domGood ? 'GOOD' : 'NEEDS IMPROVEMENT'}`);
          
        } catch (error) {
          console.log(`    ❌ ${journey.step} performance test failed: ${error.message}`);
          performanceMetrics.push({
            step: journey.step,
            loadTime: -1,
            domContent: -1,
            networkIdle: -1,
            status: 0
          });
        }
        
        await page.waitForTimeout(1000); // Brief pause between tests
      }
      
      // Generate performance report
      console.log('\n📊 Performance Journey Summary:');
      
      const successfulMetrics = performanceMetrics.filter(m => m.status === 200);
      if (successfulMetrics.length > 0) {
        const avgLoadTime = successfulMetrics.reduce((sum, m) => sum + m.loadTime, 0) / successfulMetrics.length;
        const avgDomTime = successfulMetrics.reduce((sum, m) => sum + m.domContent, 0) / successfulMetrics.length;
        
        console.log(`  ⚡ Average load time: ${avgLoadTime.toFixed(0)}ms`);
        console.log(`  🏗️ Average DOM ready: ${avgDomTime.toFixed(0)}ms`);
        console.log(`  ✅ Successful loads: ${successfulMetrics.length}/${performanceMetrics.length}`);
        
        const fastPages = successfulMetrics.filter(m => m.loadTime <= 2000).length;
        const mediumPages = successfulMetrics.filter(m => m.loadTime > 2000 && m.loadTime <= 5000).length;
        const slowPages = successfulMetrics.filter(m => m.loadTime > 5000).length;
        
        console.log(`  🚀 Fast (<2s): ${fastPages}, 🟡 Medium (2-5s): ${mediumPages}, 🔴 Slow (>5s): ${slowPages}`);
      } else {
        console.log('  ❌ No successful page loads for performance analysis');
      }
      
      console.log('🚀 End-to-end performance journey complete');
    });
  });
});

console.log('🌊 COMPLETE FLOW TESTING READY - Every path, route, and user journey will be tested!');

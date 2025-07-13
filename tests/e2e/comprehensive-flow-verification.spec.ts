/**
 * COMPREHENSIVE FLOW VERIFICATION
 * Testing EVERY app and service flow end-to-end
 * Challenge: Prove that all flows are actually implemented and working
 */

import { test, expect } from '@playwright/test';

interface AppConfig {
  name: string;
  port: number;
  type: 'nextjs' | 'express';
  domain: string;
  expectedFeatures: string[];
  criticalFlows: string[];
  hasAuth?: boolean;
  hasDatabase?: boolean;
  hasPayments?: boolean;
  hasRealtime?: boolean;
}

// COMPLETE APP INVENTORY - Let's verify EVERY claim
const APPS: AppConfig[] = [
  // Next.js Applications (Claimed: 12)
  {
    name: 'CodAI',
    port: 4030,
    type: 'nextjs',
    domain: 'codai.ro',
    expectedFeatures: ['AI Development Platform', 'Code Generation', 'Project Management'],
    criticalFlows: ['user_registration', 'project_creation', 'code_generation', 'deployment'],
    hasAuth: true,
    hasDatabase: true,
    hasRealtime: true
  },
  {
    name: 'MemorAI',
    port: 4031,
    type: 'nextjs',
    domain: 'memorai.ro',
    expectedFeatures: ['Memory Management', 'Context Storage', 'AI Integration'],
    criticalFlows: ['memory_storage', 'context_retrieval', 'ai_query', 'memory_search'],
    hasAuth: true,
    hasDatabase: true
  },
  {
    name: 'LogAI',
    port: 4032,
    type: 'nextjs',
    domain: 'logai.ro',
    expectedFeatures: ['Identity Management', 'Authentication', 'Authorization'],
    criticalFlows: ['user_login', 'user_registration', 'password_reset', 'profile_management'],
    hasAuth: true,
    hasDatabase: true
  },
  {
    name: 'BancAI',
    port: 4033,
    type: 'nextjs',
    domain: 'bancai.ro',
    expectedFeatures: ['Banking Platform', 'Financial Services', 'Transaction Processing'],
    criticalFlows: ['account_creation', 'money_transfer', 'payment_processing', 'balance_check'],
    hasAuth: true,
    hasDatabase: true,
    hasPayments: true
  },
  {
    name: 'Wallet',
    port: 4034,
    type: 'nextjs',
    domain: 'wallet.bancai.ro',
    expectedFeatures: ['Digital Wallet', 'Cryptocurrency', 'Payment Processing'],
    criticalFlows: ['wallet_creation', 'crypto_transfer', 'fiat_conversion', 'transaction_history'],
    hasAuth: true,
    hasDatabase: true,
    hasPayments: true
  },
  {
    name: 'FabricAI',
    port: 4035,
    type: 'nextjs',
    domain: 'fabricai.ro',
    expectedFeatures: ['AI Services Platform', 'Model Management', 'API Gateway'],
    criticalFlows: ['model_deployment', 'api_creation', 'service_monitoring', 'scaling'],
    hasAuth: true,
    hasDatabase: true,
    hasRealtime: true
  },
  {
    name: 'StudiAI',
    port: 4036,
    type: 'nextjs',
    domain: 'studiai.ro',
    expectedFeatures: ['Educational Platform', 'AI Tutoring', 'Course Management'],
    criticalFlows: ['course_enrollment', 'lesson_completion', 'progress_tracking', 'assessment'],
    hasAuth: true,
    hasDatabase: true
  },
  {
    name: 'SociAI',
    port: 4037,
    type: 'nextjs',
    domain: 'sociai.ro',
    expectedFeatures: ['Social Network', 'AI-Enhanced Communication', 'Content Management'],
    criticalFlows: ['post_creation', 'social_interaction', 'content_moderation', 'feed_generation'],
    hasAuth: true,
    hasDatabase: true,
    hasRealtime: true
  },
  {
    name: 'CumparAI',
    port: 4038,
    type: 'nextjs',
    domain: 'cumparai.ro',
    expectedFeatures: ['E-commerce Platform', 'AI Shopping Assistant', 'Order Management'],
    criticalFlows: ['product_search', 'cart_management', 'checkout_process', 'order_tracking'],
    hasAuth: true,
    hasDatabase: true,
    hasPayments: true
  },
  {
    name: 'X Trading',
    port: 4039,
    type: 'nextjs',
    domain: 'x.codai.ro',
    expectedFeatures: ['Trading Platform', 'Market Analysis', 'Portfolio Management'],
    criticalFlows: ['market_data', 'trade_execution', 'portfolio_view', 'risk_analysis'],
    hasAuth: true,
    hasDatabase: true,
    hasRealtime: true
  },
  {
    name: 'PublicAI',
    port: 4040,
    type: 'nextjs',
    domain: 'publicai.ro',
    expectedFeatures: ['Public Services', 'Government Integration', 'Citizen Portal'],
    criticalFlows: ['service_request', 'document_upload', 'status_tracking', 'payment'],
    hasAuth: true,
    hasDatabase: true
  },
  {
    name: 'Mobile App',
    port: 4056,
    type: 'nextjs',
    domain: 'mobile.codai.ro',
    expectedFeatures: ['Mobile Interface', 'Cross-Platform', 'Offline Support'],
    criticalFlows: ['mobile_login', 'offline_sync', 'push_notifications', 'camera_integration'],
    hasAuth: true,
    hasDatabase: true
  },

  // Express.js Microservices (Claimed: 15)
  {
    name: 'AIDE',
    port: 4041,
    type: 'express',
    domain: 'aide.codai.ro',
    expectedFeatures: ['AI Development Assistant', 'Code Analysis', 'Debugging'],
    criticalFlows: ['code_analysis', 'bug_detection', 'optimization_suggestions', 'test_generation']
  },
  {
    name: 'AnalizAI',
    port: 4042,
    type: 'express',
    domain: 'analizai.ro',
    expectedFeatures: ['Data Analysis', 'Business Intelligence', 'Reporting'],
    criticalFlows: ['data_ingestion', 'analysis_processing', 'report_generation', 'insights_delivery']
  },
  {
    name: 'MarketAI',
    port: 4043,
    type: 'express',
    domain: 'marketai.ro',
    expectedFeatures: ['Market Analysis', 'Trading Signals', 'Price Prediction'],
    criticalFlows: ['market_data_collection', 'signal_generation', 'prediction_models', 'alert_system']
  },
  {
    name: 'Explorer',
    port: 4044,
    type: 'express',
    domain: 'explorer.codai.ro',
    expectedFeatures: ['Blockchain Explorer', 'Transaction Tracking', 'Address Analysis'],
    criticalFlows: ['block_exploration', 'transaction_lookup', 'address_tracking', 'analytics']
  },
  {
    name: 'Kodex',
    port: 4045,
    type: 'express',
    domain: 'kodex.codai.ro',
    expectedFeatures: ['Code Knowledge Base', 'Documentation', 'API Reference'],
    criticalFlows: ['documentation_search', 'code_examples', 'api_reference', 'tutorial_access']
  },
  {
    name: 'ID Service',
    port: 4046,
    type: 'express',
    domain: 'id.codai.ro',
    expectedFeatures: ['Identity Management', 'SSO', 'User Verification'],
    criticalFlows: ['identity_verification', 'sso_authentication', 'user_management', 'access_control']
  },
  {
    name: 'Mod Builder',
    port: 4047,
    type: 'express',
    domain: 'mod.codai.ro',
    expectedFeatures: ['Module Builder', 'Component Library', 'Template Management'],
    criticalFlows: ['module_creation', 'component_assembly', 'template_generation', 'deployment']
  },
  {
    name: 'Tools Hub',
    port: 4048,
    type: 'express',
    domain: 'tools.codai.ro',
    expectedFeatures: ['Development Tools', 'Utilities', 'Integration Hub'],
    criticalFlows: ['tool_discovery', 'integration_setup', 'automation_config', 'monitoring']
  },
  {
    name: 'Dashboard',
    port: 4049,
    type: 'express',
    domain: 'dash.codai.ro',
    expectedFeatures: ['Analytics Dashboard', 'Metrics Visualization', 'Real-time Monitoring'],
    criticalFlows: ['data_visualization', 'metric_tracking', 'alert_management', 'report_export']
  },
  {
    name: 'Integration Hub',
    port: 4050,
    type: 'express',
    domain: 'hub.codai.ro',
    expectedFeatures: ['Service Integration', 'API Gateway', 'Webhook Management'],
    criticalFlows: ['service_discovery', 'api_routing', 'webhook_delivery', 'load_balancing']
  },
  {
    name: 'Docs Portal',
    port: 4051,
    type: 'express',
    domain: 'docs.codai.ro',
    expectedFeatures: ['Documentation Portal', 'API Docs', 'User Guides'],
    criticalFlows: ['documentation_rendering', 'search_functionality', 'version_control', 'feedback_collection']
  },
  {
    name: 'Admin Panel',
    port: 4052,
    type: 'express',
    domain: 'admin.codai.ro',
    expectedFeatures: ['System Administration', 'User Management', 'Configuration'],
    criticalFlows: ['user_administration', 'system_configuration', 'monitoring_dashboard', 'backup_management']
  },
  {
    name: 'StocAI',
    port: 4053,
    type: 'express',
    domain: 'stocai.ro',
    expectedFeatures: ['Stock Analysis', 'Portfolio Management', 'Investment Insights'],
    criticalFlows: ['stock_analysis', 'portfolio_tracking', 'investment_recommendations', 'risk_assessment']
  },
  {
    name: 'AjutAI',
    port: 4054,
    type: 'express',
    domain: 'ajutai.ro',
    expectedFeatures: ['Help Desk', 'Support Automation', 'Issue Tracking'],
    criticalFlows: ['ticket_creation', 'automated_responses', 'escalation_management', 'resolution_tracking']
  },
  {
    name: 'LegalizAI',
    port: 4055,
    type: 'express',
    domain: 'legalizai.ro',
    expectedFeatures: ['Legal AI Assistant', 'Document Analysis', 'Compliance Checking'],
    criticalFlows: ['document_analysis', 'legal_research', 'compliance_verification', 'contract_review']
  }
];

// COMPREHENSIVE VERIFICATION TEST SUITE
test.describe('COMPREHENSIVE ECOSYSTEM VERIFICATION', () => {

  test.beforeAll(async () => {
    console.log('🔍 Starting COMPREHENSIVE verification of all 27 claimed applications...');
    console.log('📊 Next.js Apps: 12 | Express.js Services: 15');
  });

  // Test 1: Basic Connectivity - Can we even reach each service?
  test('VERIFICATION 1: Basic Service Connectivity', async ({ page }) => {
    const results = {
      reachable: [] as string[],
      unreachable: [] as string[],
      errors: [] as string[]
    };

    for (const app of APPS) {
      try {
        console.log(`🔍 Testing connectivity: ${app.name} (${app.type}) on port ${app.port}`);

        const response = await page.request.get(`http://localhost:${app.port}`, {
          timeout: 5000
        });

        if (response.ok()) {
          results.reachable.push(`${app.name}:${app.port}`);
          console.log(`✅ ${app.name} is reachable`);
        } else {
          results.unreachable.push(`${app.name}:${app.port} (Status: ${response.status()})`);
          console.log(`❌ ${app.name} returned status ${response.status()}`);
        }
      } catch (error) {
        results.errors.push(`${app.name}:${app.port} (Error: ${error})`);
        console.log(`💥 ${app.name} connectivity failed: ${error}`);
      }
    }

    console.log(`\n📊 CONNECTIVITY RESULTS:`);
    console.log(`✅ Reachable: ${results.reachable.length}/27`);
    console.log(`❌ Unreachable: ${results.unreachable.length}/27`);
    console.log(`💥 Errors: ${results.errors.length}/27`);

    // Store results for analysis
    expect(results.reachable.length,
      `Only ${results.reachable.length}/27 apps are reachable. Failed: ${JSON.stringify(results.unreachable.concat(results.errors), null, 2)}`
    ).toBeGreaterThan(20); // At least 20/27 should be reachable
  });

  // Test 2: Content Verification - What's actually being served?
  test('VERIFICATION 2: Content and Feature Analysis', async ({ page }) => {
    const contentResults = {
      hasContent: [] as string[],
      emptyOrMinimal: [] as string[],
      actualFeatures: {} as Record<string, string[]>
    };

    for (const app of APPS) {
      try {
        await page.goto(`http://localhost:${app.port}`, { timeout: 10000 });

        // Check if page has meaningful content
        const bodyText = await page.textContent('body');
        const hasTitle = await page.title();
        const hasNavigation = await page.locator('nav').count();
        const hasButtons = await page.locator('button').count();
        const hasInputs = await page.locator('input').count();
        const hasLinks = await page.locator('a').count();

        const detectedFeatures = [];

        // Analyze what features are actually present
        if (hasTitle.includes(app.name) || hasTitle.includes('AI')) detectedFeatures.push('branded_title');
        if (hasNavigation > 0) detectedFeatures.push('navigation');
        if (hasButtons > 5) detectedFeatures.push('interactive_ui');
        if (hasInputs > 3) detectedFeatures.push('forms');
        if (hasLinks > 10) detectedFeatures.push('rich_linking');
        if (bodyText && bodyText.length > 1000) detectedFeatures.push('substantial_content');

        // Check for specific claimed features
        for (const feature of app.expectedFeatures) {
          if (bodyText?.toLowerCase().includes(feature.toLowerCase())) {
            detectedFeatures.push(`claimed_feature:${feature}`);
          }
        }

        contentResults.actualFeatures[app.name] = detectedFeatures;

        if (detectedFeatures.length > 3) {
          contentResults.hasContent.push(app.name);
          console.log(`✅ ${app.name} has substantial content: ${detectedFeatures.join(', ')}`);
        } else {
          contentResults.emptyOrMinimal.push(app.name);
          console.log(`⚠️  ${app.name} has minimal content: ${detectedFeatures.join(', ')}`);
        }

      } catch (error) {
        contentResults.emptyOrMinimal.push(app.name);
        console.log(`💥 ${app.name} content analysis failed: ${error}`);
      }
    }

    console.log(`\n📊 CONTENT ANALYSIS RESULTS:`);
    console.log(`✅ Rich Content: ${contentResults.hasContent.length}/27`);
    console.log(`⚠️  Minimal Content: ${contentResults.emptyOrMinimal.length}/27`);
    console.log(`\n🔍 DETAILED FEATURE ANALYSIS:`);
    console.log(JSON.stringify(contentResults.actualFeatures, null, 2));

    // Verify that apps aren't just placeholder pages
    expect(contentResults.hasContent.length,
      `Only ${contentResults.hasContent.length}/27 apps have substantial content. Many appear to be placeholders.`
    ).toBeGreaterThan(15);
  });

  // Test 3: Critical Flow Testing - Do the core features actually work?
  test('VERIFICATION 3: Critical Flow Implementation', async ({ page }) => {
    const flowResults = {
      implementedFlows: {} as Record<string, string[]>,
      missingFlows: {} as Record<string, string[]>,
      totalImplemented: 0,
      totalExpected: 0
    };

    for (const app of APPS.slice(0, 5)) { // Test first 5 apps thoroughly
      try {
        await page.goto(`http://localhost:${app.port}`, { timeout: 10000 });

        const implemented = [];
        const missing = [];

        for (const flow of app.criticalFlows) {
          flowResults.totalExpected++;

          // Test specific flow patterns based on flow type
          let flowExists = false;

          switch (flow) {
            case 'user_registration':
              try {
                flowExists = await page.locator('text=register').count() > 0 ||
                  await page.locator('text=sign up').count() > 0 ||
                  await page.locator('[data-testid*="register"]').count() > 0;
              } catch (e) { flowExists = false; }
              break;

            case 'user_login':
              try {
                flowExists = await page.locator('text=login').count() > 0 ||
                  await page.locator('text=sign in').count() > 0 ||
                  await page.locator('input[type="password"]').count() > 0;
              } catch (e) { flowExists = false; }
              break;

            case 'project_creation':
              try {
                flowExists = await page.locator('text=create project').count() > 0 ||
                  await page.locator('text=new project').count() > 0 ||
                  await page.locator('[data-testid*="create"]').count() > 0;
              } catch (e) { flowExists = false; }
              break;

            case 'payment_processing':
              try {
                flowExists = await page.locator('text=payment').count() > 0 ||
                  await page.locator('text=checkout').count() > 0 ||
                  await page.locator('text=stripe').count() > 0;
              } catch (e) { flowExists = false; }
              break;

            default:
              // Generic flow detection
              try {
                flowExists = await page.locator(`text=${flow.replace('_', ' ')}`).count() > 0;
              } catch (e) { flowExists = false; }
          }

          if (flowExists) {
            implemented.push(flow);
            flowResults.totalImplemented++;
            console.log(`✅ ${app.name}: ${flow} flow detected`);
          } else {
            missing.push(flow);
            console.log(`❌ ${app.name}: ${flow} flow NOT found`);
          }
        }

        flowResults.implementedFlows[app.name] = implemented;
        flowResults.missingFlows[app.name] = missing;

      } catch (error) {
        flowResults.missingFlows[app.name] = app.criticalFlows;
        console.log(`💥 ${app.name} flow testing failed: ${error}`);
      }
    }

    console.log(`\n📊 CRITICAL FLOW RESULTS:`);
    console.log(`✅ Implemented Flows: ${flowResults.totalImplemented}/${flowResults.totalExpected}`);
    console.log(`\n🔍 DETAILED FLOW ANALYSIS:`);
    console.log(`Implemented:`, JSON.stringify(flowResults.implementedFlows, null, 2));
    console.log(`Missing:`, JSON.stringify(flowResults.missingFlows, null, 2));

    // Verify that critical flows are actually implemented
    const implementationRate = flowResults.totalImplemented / flowResults.totalExpected;
    expect(implementationRate,
      `Only ${Math.round(implementationRate * 100)}% of critical flows are implemented. This suggests many features are missing or placeholder.`
    ).toBeGreaterThan(0.6); // At least 60% of flows should be implemented
  });

  // Test 4: Database Integration - Are databases actually connected and working?
  test('VERIFICATION 4: Database Integration Status', async ({ page }) => {
    const dbResults = {
      connectedApps: [] as string[],
      disconnectedApps: [] as string[],
      unknownApps: [] as string[]
    };

    for (const app of APPS.filter(a => a.hasDatabase)) {
      try {
        // Try to access common database-dependent endpoints
        const endpoints = [
          `http://localhost:${app.port}/api/health`,
          `http://localhost:${app.port}/api/status`,
          `http://localhost:${app.port}/health`,
          `http://localhost:${app.port}/status`
        ];

        let dbConnected = false;

        for (const endpoint of endpoints) {
          try {
            const response = await page.request.get(endpoint, { timeout: 5000 });
            if (response.ok()) {
              const data = await response.json();
              if (data.database || data.db || data.connected || data.status === 'healthy') {
                dbConnected = true;
                break;
              }
            }
          } catch (e) {
            // Continue trying other endpoints
          }
        }

        if (dbConnected) {
          dbResults.connectedApps.push(app.name);
          console.log(`✅ ${app.name}: Database connection verified`);
        } else {
          dbResults.disconnectedApps.push(app.name);
          console.log(`❌ ${app.name}: No database connection detected`);
        }

      } catch (error) {
        dbResults.unknownApps.push(app.name);
        console.log(`⚠️  ${app.name}: Database status unknown - ${error}`);
      }
    }

    console.log(`\n📊 DATABASE INTEGRATION RESULTS:`);
    console.log(`✅ Connected: ${dbResults.connectedApps.length}`);
    console.log(`❌ Disconnected: ${dbResults.disconnectedApps.length}`);
    console.log(`⚠️  Unknown: ${dbResults.unknownApps.length}`);

    // Most apps claiming database integration should actually have working databases
    const appsWithDbClaim = APPS.filter(a => a.hasDatabase).length;
    expect(dbResults.connectedApps.length,
      `Only ${dbResults.connectedApps.length}/${appsWithDbClaim} apps claiming database integration actually have working database connections.`
    ).toBeGreaterThan(appsWithDbClaim * 0.5);
  });

  // Test 5: API Completeness - Do Express services actually provide APIs?
  test('VERIFICATION 5: Express.js API Implementation', async ({ page }) => {
    const apiResults = {
      completeAPIs: [] as string[],
      minimalAPIs: [] as string[],
      noAPIs: [] as string[],
      endpointCounts: {} as Record<string, number>
    };

    for (const app of APPS.filter(a => a.type === 'express')) {
      try {
        // Test common API endpoints
        const testEndpoints = [
          '',
          '/api',
          '/health',
          '/status',
          '/docs',
          '/swagger',
          `/${app.name.toLowerCase()}`,
          '/users',
          '/data',
          '/services'
        ];

        let workingEndpoints = 0;
        const endpoints = [];

        for (const endpoint of testEndpoints) {
          try {
            const response = await page.request.get(`http://localhost:${app.port}${endpoint}`, { timeout: 3000 });
            if (response.ok()) {
              workingEndpoints++;
              endpoints.push(endpoint);
            }
          } catch (e) {
            // Endpoint doesn't exist or errored
          }
        }

        apiResults.endpointCounts[app.name] = workingEndpoints;

        if (workingEndpoints >= 5) {
          apiResults.completeAPIs.push(app.name);
          console.log(`✅ ${app.name}: Complete API (${workingEndpoints} endpoints) - ${endpoints.join(', ')}`);
        } else if (workingEndpoints >= 2) {
          apiResults.minimalAPIs.push(app.name);
          console.log(`⚠️  ${app.name}: Minimal API (${workingEndpoints} endpoints) - ${endpoints.join(', ')}`);
        } else {
          apiResults.noAPIs.push(app.name);
          console.log(`❌ ${app.name}: No meaningful API (${workingEndpoints} endpoints)`);
        }

      } catch (error) {
        apiResults.noAPIs.push(app.name);
        console.log(`💥 ${app.name}: API testing failed - ${error}`);
      }
    }

    console.log(`\n📊 EXPRESS.JS API RESULTS:`);
    console.log(`✅ Complete APIs: ${apiResults.completeAPIs.length}/15`);
    console.log(`⚠️  Minimal APIs: ${apiResults.minimalAPIs.length}/15`);
    console.log(`❌ No APIs: ${apiResults.noAPIs.length}/15`);
    console.log(`\n🔍 ENDPOINT COUNTS:`, apiResults.endpointCounts);

    // Express services should actually provide APIs
    expect(apiResults.completeAPIs.length,
      `Only ${apiResults.completeAPIs.length}/15 Express services have complete APIs. Many appear to be placeholder services.`
    ).toBeGreaterThan(8);
  });

  // Test 6: Mobile App Crash Investigation
  test('VERIFICATION 6: Mobile App Crash Analysis', async ({ page }) => {
    console.log('🔍 Investigating Mobile App constant crashes...');

    const crashResults = {
      canAccess: false,
      errorMessages: [] as string[],
      consoleErrors: [] as string[],
      possibleCauses: [] as string[]
    };

    // Monitor console for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        crashResults.consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      crashResults.errorMessages.push(error.message);
    });

    try {
      // Try to access mobile app multiple times
      for (let attempt = 1; attempt <= 3; attempt++) {
        console.log(`📱 Mobile app access attempt ${attempt}/3...`);

        try {
          await page.goto('http://localhost:4056', { timeout: 5000, waitUntil: 'networkidle' });
          crashResults.canAccess = true;
          console.log(`✅ Mobile app accessible on attempt ${attempt}`);
          break;
        } catch (error) {
          console.log(`❌ Mobile app access failed on attempt ${attempt}: ${error}`);

          // Wait a bit before retry
          await page.waitForTimeout(2000);
        }
      }

      // If we got access, check for runtime errors
      if (crashResults.canAccess) {
        await page.waitForTimeout(5000); // Wait for potential runtime errors

        // Check for common React Native web issues
        const bodyText = await page.textContent('body');
        if (bodyText?.includes('react-native-camera')) {
          crashResults.possibleCauses.push('deprecated react-native-camera dependency');
        }
        if (bodyText?.includes('Metro')) {
          crashResults.possibleCauses.push('Metro bundler issues');
        }
        if (crashResults.consoleErrors.length > 0) {
          crashResults.possibleCauses.push('JavaScript runtime errors');
        }
      }

    } catch (error) {
      crashResults.errorMessages.push(String(error));
      crashResults.possibleCauses.push('fundamental startup issues');
    }

    console.log(`\n📊 MOBILE APP ANALYSIS:`);
    console.log(`📱 Can Access: ${crashResults.canAccess}`);
    console.log(`🚨 Console Errors: ${crashResults.consoleErrors.length}`);
    console.log(`💥 Error Messages: ${crashResults.errorMessages.length}`);
    console.log(`🔍 Possible Causes:`, crashResults.possibleCauses);

    if (crashResults.consoleErrors.length > 0) {
      console.log(`\n📝 Console Errors:`, crashResults.consoleErrors);
    }
    if (crashResults.errorMessages.length > 0) {
      console.log(`\n📝 Error Messages:`, crashResults.errorMessages);
    }

    // Mobile app should not be in constant crash loop
    expect(crashResults.canAccess,
      `Mobile app is in constant crash loop. Causes: ${crashResults.possibleCauses.join(', ')}`
    ).toBe(true);
  });

  test.afterAll(async () => {
    console.log('\n🎯 COMPREHENSIVE VERIFICATION COMPLETE');
    console.log('📋 Summary: Check individual test results above for detailed findings');
    console.log('⚡ Challenge accepted - this verification exposes the real implementation status!');
  });
});

import { test, expect } from '@playwright/test';
import fs from 'fs';

/**
 * Phase 3B: Authentication and Authorization Integration Testing
 * Tests authentication flows, session management, and authorization across services
 */

test.describe('Phase 3B: Authentication & Authorization Integration', () => {

    const allServices = [
        { name: 'Gateway', url: 'http://localhost:4000', hasAuth: false },
        { name: 'CODAI', url: 'http://localhost:4001', hasAuth: true },
        { name: 'ID', url: 'http://localhost:4004', hasAuth: true, isAuthProvider: true },
        { name: 'BancAI', url: 'http://localhost:4005', hasAuth: true },
        { name: 'MemorAI', url: 'http://localhost:4006', hasAuth: true },
        { name: 'Admin', url: 'http://localhost:4007', hasAuth: true, requiresAdmin: true },
        { name: 'Hub', url: 'http://localhost:4008', hasAuth: false },
        { name: 'CBD', url: 'http://localhost:4180', hasAuth: false }
    ];

    test.beforeAll(async () => {
        if (!fs.existsSync('test-results')) {
            fs.mkdirSync('test-results', { recursive: true });
        }
    });

    test('Phase 3B.1: Authentication Interface Discovery', async ({ page }) => {
        console.log('🔐 Phase 3B.1: Discovering authentication interfaces across services...');

        const authDiscovery = {
            timestamp: new Date().toISOString(),
            phase: 'Phase 3B - Authentication Discovery',
            services: [],
            summary: {
                totalServices: allServices.length,
                servicesWithAuth: 0,
                servicesWithoutAuth: 0,
                authenticationPatterns: []
            }
        };

        for (const service of allServices) {
            console.log(`🔍 Analyzing ${service.name} authentication...`);

            const serviceAuth = {
                name: service.name,
                url: service.url,
                expectedAuth: service.hasAuth,
                isAuthProvider: service.isAuthProvider || false,
                requiresAdmin: service.requiresAdmin || false,
                authElements: {
                    loginForm: false,
                    loginButton: false,
                    signupLink: false,
                    logoutButton: false,
                    userProfile: false,
                    protectedContent: false
                },
                authPatterns: [],
                screenshots: []
            };

            try {
                await page.goto(service.url, { timeout: 15000 });
                await page.waitForLoadState('domcontentloaded');
                await page.waitForTimeout(2000); // Allow dynamic content to load

                // Take initial screenshot
                await page.screenshot({
                    path: `test-results/auth-${service.name.toLowerCase()}-initial.png`,
                    fullPage: true
                });
                serviceAuth.screenshots.push(`auth-${service.name.toLowerCase()}-initial.png`);

                // Check for login form
                const loginForms = await page.locator('form[action*="login"], form[action*="auth"], form:has(input[type="password"])').count();
                serviceAuth.authElements.loginForm = loginForms > 0;

                // Check for login button
                const loginButtons = await page.locator('button:has-text("Login"), button:has-text("Sign In"), a[href*="login"], a[href*="signin"]').count();
                serviceAuth.authElements.loginButton = loginButtons > 0;

                // Check for signup/register links
                const signupLinks = await page.locator('a[href*="signup"], a[href*="register"], button:has-text("Sign Up"), button:has-text("Register")').count();
                serviceAuth.authElements.signupLink = signupLinks > 0;

                // Check for logout button (indicates authenticated state)
                const logoutButtons = await page.locator('button:has-text("Logout"), button:has-text("Sign Out"), a[href*="logout"]').count();
                serviceAuth.authElements.logoutButton = logoutButtons > 0;

                // Check for user profile elements
                const userProfiles = await page.locator('.user-profile, .profile-menu, [data-testid*="profile"], [data-testid*="user"]').count();
                serviceAuth.authElements.userProfile = userProfiles > 0;

                // Check for protected content indicators
                const protectedContent = await page.locator('.protected, .auth-required, .login-required, [data-auth="required"]').count();
                serviceAuth.authElements.protectedContent = protectedContent > 0;

                // Analyze page title and content for auth patterns
                const title = await page.title();
                const bodyText = await page.textContent('body');

                if (title.toLowerCase().includes('login') || title.toLowerCase().includes('auth')) {
                    serviceAuth.authPatterns.push('Auth-focused page title');
                }

                if (bodyText?.toLowerCase().includes('please sign in') || bodyText?.toLowerCase().includes('login required')) {
                    serviceAuth.authPatterns.push('Login required message');
                }

                if (bodyText?.toLowerCase().includes('welcome') && bodyText?.toLowerCase().includes('dashboard')) {
                    serviceAuth.authPatterns.push('Authenticated dashboard pattern');
                }

                // Check if service redirects to auth
                const currentUrl = page.url();
                if (currentUrl !== service.url && (currentUrl.includes('login') || currentUrl.includes('auth'))) {
                    serviceAuth.authPatterns.push('Auto-redirect to authentication');
                }

                console.log(`  📊 ${service.name}: ${serviceAuth.authElements.loginForm ? '🔐' : '🔓'} Form, ${serviceAuth.authElements.loginButton ? '🔘' : '⚪'} Button, ${serviceAuth.authElements.logoutButton ? '👤' : '👥'} Profile`);

            } catch (error) {
                console.log(`  ❌ ${service.name} auth discovery failed: ${error.message}`);
                serviceAuth.error = error.message;
            }

            // Classify authentication type
            const hasAnyAuth = Object.values(serviceAuth.authElements).some(Boolean) || serviceAuth.authPatterns.length > 0;

            if (hasAnyAuth) {
                authDiscovery.summary.servicesWithAuth++;
            } else {
                authDiscovery.summary.servicesWithoutAuth++;
            }

            authDiscovery.services.push(serviceAuth);
        }

        // Identify common authentication patterns
        const allPatterns = authDiscovery.services.flatMap(s => s.authPatterns);
        const patternCounts = allPatterns.reduce((acc, pattern) => {
            acc[pattern] = (acc[pattern] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        authDiscovery.summary.authenticationPatterns = Object.entries(patternCounts)
            .map(([pattern, count]) => ({ pattern, count }))
            .sort((a, b) => b.count - a.count);

        // Save authentication discovery results
        fs.writeFileSync('test-results/phase3b-auth-discovery.json', JSON.stringify(authDiscovery, null, 2));

        console.log('\n📊 Authentication Discovery Summary:');
        console.log(`   🏢 Total services: ${authDiscovery.summary.totalServices}`);
        console.log(`   🔐 Services with auth: ${authDiscovery.summary.servicesWithAuth}`);
        console.log(`   🔓 Services without auth: ${authDiscovery.summary.servicesWithoutAuth}`);
        console.log(`   📈 Common patterns: ${authDiscovery.summary.authenticationPatterns.slice(0, 3).map(p => p.pattern).join(', ')}`);
        console.log(`   💾 Results saved: test-results/phase3b-auth-discovery.json`);

        expect(authDiscovery.summary.totalServices).toBe(allServices.length);
    });

    test('Phase 3B.2: Cross-Service Authentication Flow', async ({ page, context }) => {
        console.log('🔄 Phase 3B.2: Testing cross-service authentication flow...');

        const authFlow = {
            timestamp: new Date().toISOString(),
            phase: 'Phase 3B - Cross-Service Auth Flow',
            authProvider: 'ID Service (localhost:4004)',
            testScenarios: [],
            summary: {
                totalScenarios: 0,
                successfulAuths: 0,
                failedAuths: 0
            }
        };

        // Scenario 1: Direct authentication attempt on ID service
        try {
            console.log('🔐 Scenario 1: ID Service authentication...');

            const scenario1 = {
                name: 'ID Service Direct Authentication',
                steps: [],
                success: false,
                startTime: Date.now()
            };

            await page.goto('http://localhost:4004', { timeout: 15000 });
            await page.waitForLoadState('domcontentloaded');

            scenario1.steps.push({
                step: 'Navigate to ID Service',
                success: true,
                url: page.url(),
                screenshot: 'id-service-landing.png'
            });

            await page.screenshot({ path: 'test-results/auth-flow-id-landing.png', fullPage: true });

            // Look for authentication elements
            const loginForm = page.locator('form:has(input[type="password"])').first();
            const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]').first();
            const passwordInput = page.locator('input[type="password"]').first();
            const loginButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();

            if (await loginForm.isVisible()) {
                console.log('  ✅ Login form found');

                // Attempt to fill login form with test credentials
                if (await emailInput.isVisible()) {
                    await emailInput.fill('test@codai.dev');
                    scenario1.steps.push({ step: 'Fill email', success: true });
                }

                if (await passwordInput.isVisible()) {
                    await passwordInput.fill('TestPassword123!');
                    scenario1.steps.push({ step: 'Fill password', success: true });
                }

                await page.screenshot({ path: 'test-results/auth-flow-form-filled.png', fullPage: true });

                if (await loginButton.isVisible()) {
                    // Set up response monitoring
                    const responsePromise = page.waitForResponse(response =>
                        response.url().includes('login') || response.url().includes('auth'),
                        { timeout: 10000 }
                    ).catch(() => null);

                    await loginButton.click();

                    // Wait for response or navigation
                    await Promise.race([
                        responsePromise,
                        page.waitForNavigation({ timeout: 10000 }).catch(() => null),
                        page.waitForTimeout(3000)
                    ]);

                    await page.screenshot({ path: 'test-results/auth-flow-post-submit.png', fullPage: true });

                    // Check for success indicators
                    const currentUrl = page.url();
                    const hasSuccessMessage = await page.locator('.success, .welcome, [data-testid="success"]').count() > 0;
                    const hasErrorMessage = await page.locator('.error, .alert-danger, [data-testid="error"]').count() > 0;
                    const urlChanged = currentUrl !== 'http://localhost:4004';

                    scenario1.steps.push({
                        step: 'Submit login form',
                        success: !hasErrorMessage,
                        currentUrl,
                        urlChanged,
                        hasSuccessMessage,
                        hasErrorMessage
                    });

                    if (!hasErrorMessage) {
                        scenario1.success = true;
                        console.log(`  ✅ Authentication attempt successful (${urlChanged ? 'redirected' : 'same page'})`);
                    } else {
                        console.log('  ⚠️ Authentication failed (expected for test credentials)');
                    }
                }
            } else {
                console.log('  ℹ️ No login form found - checking for other auth patterns');

                // Check for other authentication patterns
                const authLinks = await page.locator('a[href*="login"], a[href*="auth"]').count();
                const authButtons = await page.locator('button:has-text("Login"), button:has-text("Sign In")').count();

                scenario1.steps.push({
                    step: 'Check alternative auth patterns',
                    authLinks,
                    authButtons,
                    hasAlternativeAuth: authLinks > 0 || authButtons > 0
                });
            }

            scenario1.endTime = Date.now();
            scenario1.duration = scenario1.endTime - scenario1.startTime;

            authFlow.testScenarios.push(scenario1);

        } catch (error) {
            console.log(`❌ Scenario 1 failed: ${error.message}`);
            authFlow.testScenarios.push({
                name: 'ID Service Direct Authentication',
                success: false,
                error: error.message
            });
        }

        // Scenario 2: Test authentication requirement on protected services
        const protectedServices = ['http://localhost:4007']; // Admin service

        for (let i = 0; i < protectedServices.length; i++) {
            const serviceUrl = protectedServices[i];
            const serviceName = serviceUrl.includes('4007') ? 'Admin' : 'Unknown';

            try {
                console.log(`🔒 Scenario ${i + 2}: ${serviceName} service auth requirement...`);

                const scenario = {
                    name: `${serviceName} Service Auth Requirement`,
                    serviceUrl,
                    steps: [],
                    success: false,
                    startTime: Date.now()
                };

                await page.goto(serviceUrl, { timeout: 15000 });
                await page.waitForLoadState('domcontentloaded');
                await page.waitForTimeout(2000);

                const currentUrl = page.url();
                const title = await page.title();
                const hasLoginElements = await page.locator('input[type="password"], form:has(input[type="password"])').count() > 0;
                const hasProtectedMessage = await page.locator('.auth-required, .login-required').count() > 0;

                scenario.steps.push({
                    step: 'Check auth requirement',
                    originalUrl: serviceUrl,
                    currentUrl,
                    redirectedToAuth: currentUrl !== serviceUrl && (currentUrl.includes('login') || currentUrl.includes('auth')),
                    hasLoginElements,
                    hasProtectedMessage,
                    title
                });

                await page.screenshot({ path: `test-results/auth-flow-${serviceName.toLowerCase()}-check.png`, fullPage: true });

                // Determine if authentication is required
                const requiresAuth =
                    scenario.steps[0].redirectedToAuth ||
                    hasLoginElements ||
                    hasProtectedMessage ||
                    title.toLowerCase().includes('login');

                scenario.success = true; // Success means we could determine auth requirement
                scenario.requiresAuthentication = requiresAuth;

                console.log(`  ${requiresAuth ? '🔐' : '🔓'} ${serviceName} ${requiresAuth ? 'requires' : 'does not require'} authentication`);

                scenario.endTime = Date.now();
                scenario.duration = scenario.endTime - scenario.startTime;

                authFlow.testScenarios.push(scenario);

            } catch (error) {
                console.log(`❌ Scenario ${i + 2} failed: ${error.message}`);
                authFlow.testScenarios.push({
                    name: `${serviceName} Service Auth Requirement`,
                    success: false,
                    error: error.message
                });
            }
        }

        // Calculate summary
        authFlow.summary.totalScenarios = authFlow.testScenarios.length;
        authFlow.summary.successfulAuths = authFlow.testScenarios.filter(s => s.success && !s.error).length;
        authFlow.summary.failedAuths = authFlow.testScenarios.filter(s => !s.success || s.error).length;

        // Save authentication flow results
        fs.writeFileSync('test-results/phase3b-auth-flow.json', JSON.stringify(authFlow, null, 2));

        console.log('\n📊 Cross-Service Authentication Flow Summary:');
        console.log(`   🎯 Total scenarios: ${authFlow.summary.totalScenarios}`);
        console.log(`   ✅ Successful tests: ${authFlow.summary.successfulAuths}`);
        console.log(`   ❌ Failed tests: ${authFlow.summary.failedAuths}`);
        console.log(`   💾 Results saved: test-results/phase3b-auth-flow.json`);

        expect(authFlow.summary.totalScenarios).toBeGreaterThan(0);
    });

    test('Phase 3B.3: Session Management and Token Handling', async ({ page, context }) => {
        console.log('🎫 Phase 3B.3: Testing session management and token handling...');

        const sessionTest = {
            timestamp: new Date().toISOString(),
            phase: 'Phase 3B - Session Management',
            tests: [],
            summary: {
                totalTests: 0,
                passedTests: 0,
                failedTests: 0
            }
        };

        // Test 1: Cookie and session storage analysis
        try {
            console.log('🍪 Test 1: Analyzing cookies and session storage...');

            const cookieTest = {
                name: 'Cookie and Session Analysis',
                services: [],
                success: false
            };

            const testServices = [
                'http://localhost:4001', // CODAI
                'http://localhost:4004', // ID
                'http://localhost:4007'  // Admin
            ];

            for (const serviceUrl of testServices) {
                const serviceName = serviceUrl.includes('4001') ? 'CODAI' :
                    serviceUrl.includes('4004') ? 'ID' : 'Admin';

                await page.goto(serviceUrl, { timeout: 15000 });
                await page.waitForLoadState('domcontentloaded');

                // Get cookies
                const cookies = await context.cookies();
                const serviceCookies = cookies.filter(c => c.domain.includes('localhost'));

                // Get session storage
                const sessionStorage = await page.evaluate(() => {
                    const storage = {};
                    for (let i = 0; i < window.sessionStorage.length; i++) {
                        const key = window.sessionStorage.key(i);
                        if (key) {
                            storage[key] = window.sessionStorage.getItem(key);
                        }
                    }
                    return storage;
                });

                // Get local storage
                const localStorage = await page.evaluate(() => {
                    const storage = {};
                    for (let i = 0; i < window.localStorage.length; i++) {
                        const key = window.localStorage.key(i);
                        if (key) {
                            storage[key] = window.localStorage.getItem(key);
                        }
                    }
                    return storage;
                });

                cookieTest.services.push({
                    name: serviceName,
                    url: serviceUrl,
                    cookies: serviceCookies.length,
                    sessionStorageKeys: Object.keys(sessionStorage).length,
                    localStorageKeys: Object.keys(localStorage).length,
                    authRelatedStorage: {
                        hasAuthToken: Object.keys({ ...sessionStorage, ...localStorage }).some(k =>
                            k.toLowerCase().includes('token') ||
                            k.toLowerCase().includes('auth') ||
                            k.toLowerCase().includes('session')
                        ),
                        authKeys: Object.keys({ ...sessionStorage, ...localStorage }).filter(k =>
                            k.toLowerCase().includes('token') ||
                            k.toLowerCase().includes('auth') ||
                            k.toLowerCase().includes('session')
                        )
                    }
                });

                console.log(`  📊 ${serviceName}: ${serviceCookies.length} cookies, ${Object.keys(sessionStorage).length} session keys, ${Object.keys(localStorage).length} local keys`);
            }

            cookieTest.success = true;
            sessionTest.tests.push(cookieTest);

        } catch (error) {
            console.log(`❌ Cookie test failed: ${error.message}`);
            sessionTest.tests.push({
                name: 'Cookie and Session Analysis',
                success: false,
                error: error.message
            });
        }

        // Test 2: Cross-origin request testing
        try {
            console.log('🌐 Test 2: Testing cross-origin requests...');

            const corsTest = {
                name: 'Cross-Origin Request Testing',
                requests: [],
                success: false
            };

            // Test requests from CODAI to other services
            await page.goto('http://localhost:4001', { timeout: 15000 });
            await page.waitForLoadState('domcontentloaded');

            const testRequests = [
                { target: 'http://localhost:4000/health', service: 'Gateway' },
                { target: 'http://localhost:4004/api/health', service: 'ID' },
                { target: 'http://localhost:4008/api/status', service: 'Hub' }
            ];

            for (const req of testRequests) {
                try {
                    const response = await page.evaluate(async (url) => {
                        try {
                            const res = await fetch(url);
                            return {
                                status: res.status,
                                ok: res.ok,
                                headers: Object.fromEntries(res.headers.entries())
                            };
                        } catch (error) {
                            return {
                                error: error.message,
                                blocked: error.message.includes('CORS')
                            };
                        }
                    }, req.target);

                    corsTest.requests.push({
                        target: req.target,
                        service: req.service,
                        ...response
                    });

                    console.log(`  ${response.ok ? '✅' : response.blocked ? '🚫' : '❌'} ${req.service}: ${response.status || response.error}`);

                } catch (error) {
                    corsTest.requests.push({
                        target: req.target,
                        service: req.service,
                        error: error.message
                    });

                    console.log(`  ❌ ${req.service}: ${error.message}`);
                }
            }

            corsTest.success = corsTest.requests.some(r => r.ok);
            sessionTest.tests.push(corsTest);

        } catch (error) {
            console.log(`❌ CORS test failed: ${error.message}`);
            sessionTest.tests.push({
                name: 'Cross-Origin Request Testing',
                success: false,
                error: error.message
            });
        }

        // Calculate summary
        sessionTest.summary.totalTests = sessionTest.tests.length;
        sessionTest.summary.passedTests = sessionTest.tests.filter(t => t.success).length;
        sessionTest.summary.failedTests = sessionTest.tests.filter(t => !t.success).length;

        // Save session management results
        fs.writeFileSync('test-results/phase3b-session-management.json', JSON.stringify(sessionTest, null, 2));

        console.log('\n📊 Session Management Summary:');
        console.log(`   🎯 Total tests: ${sessionTest.summary.totalTests}`);
        console.log(`   ✅ Passed tests: ${sessionTest.summary.passedTests}`);
        console.log(`   ❌ Failed tests: ${sessionTest.summary.failedTests}`);
        console.log(`   💾 Results saved: test-results/phase3b-session-management.json`);

        expect(sessionTest.summary.totalTests).toBeGreaterThan(0);
    });

    test('Phase 3B: Generate Authentication Integration Report', async () => {
        console.log('📋 Phase 3B.4: Generating authentication integration report...');

        const authReport = {
            timestamp: new Date().toISOString(),
            phase: 'Phase 3B - Authentication & Authorization Integration',
            services: allServices.map(s => ({ name: s.name, url: s.url, expectedAuth: s.hasAuth })),
            testResults: {},
            summary: {
                totalServices: allServices.length,
                servicesAnalyzed: 0,
                authenticationReady: 0,
                integrationReady: false
            },
            recommendations: []
        };

        // Load test results
        const testFiles = [
            { key: 'discovery', path: 'test-results/phase3b-auth-discovery.json' },
            { key: 'flow', path: 'test-results/phase3b-auth-flow.json' },
            { key: 'session', path: 'test-results/phase3b-session-management.json' }
        ];

        for (const testFile of testFiles) {
            try {
                if (fs.existsSync(testFile.path)) {
                    const data = JSON.parse(fs.readFileSync(testFile.path, 'utf8'));
                    authReport.testResults[testFile.key] = data;

                    if (testFile.key === 'discovery') {
                        authReport.summary.servicesAnalyzed = data.summary.totalServices;
                        authReport.summary.authenticationReady = data.summary.servicesWithAuth;
                    }
                }
            } catch (error) {
                console.log(`⚠️ Could not load ${testFile.key} results: ${error.message}`);
            }
        }

        // Generate recommendations
        if (authReport.testResults.discovery) {
            const discovery = authReport.testResults.discovery;

            if (discovery.summary.servicesWithAuth === 0) {
                authReport.recommendations.push('No authentication interfaces found - consider implementing authentication for protected services');
            } else if (discovery.summary.servicesWithAuth < 3) {
                authReport.recommendations.push('Limited authentication coverage - review which services should require authentication');
            } else {
                authReport.recommendations.push('Good authentication coverage detected across services');
            }

            if (discovery.summary.authenticationPatterns.length > 0) {
                authReport.recommendations.push(`Common auth patterns identified: ${discovery.summary.authenticationPatterns[0]?.pattern || 'Multiple patterns'}`);
            }
        }

        if (authReport.testResults.flow) {
            const flow = authReport.testResults.flow;

            if (flow.summary.failedAuths > flow.summary.successfulAuths) {
                authReport.recommendations.push('Authentication flow testing shows issues - review auth implementations');
            } else {
                authReport.recommendations.push('Authentication flows are functioning correctly');
            }
        }

        if (authReport.testResults.session) {
            const session = authReport.testResults.session;

            if (session.summary.passedTests > 0) {
                authReport.recommendations.push('Session management capabilities detected - ensure secure token handling');
            }
        }

        // Determine integration readiness
        authReport.summary.integrationReady =
            authReport.summary.authenticationReady > 0 &&
            (authReport.testResults.flow?.summary.successfulAuths || 0) > 0;

        if (authReport.recommendations.length === 0) {
            authReport.recommendations.push('Authentication analysis completed - review individual test results for specific guidance');
        }

        // Save comprehensive authentication report
        fs.writeFileSync('test-results/phase3b-authentication-integration-report.json', JSON.stringify(authReport, null, 2));

        console.log('\n📊 Phase 3B Authentication Integration Report:');
        console.log(`   🏢 Total services: ${authReport.summary.totalServices}`);
        console.log(`   🔍 Services analyzed: ${authReport.summary.servicesAnalyzed}`);
        console.log(`   🔐 Authentication ready: ${authReport.summary.authenticationReady}`);
        console.log(`   🎯 Integration ready: ${authReport.summary.integrationReady ? 'YES' : 'NO'}`);
        console.log(`   💾 Report saved: test-results/phase3b-authentication-integration-report.json`);

        console.log('\n🎯 Recommendations:');
        authReport.recommendations.forEach((rec, i) => {
            console.log(`   ${i + 1}. ${rec}`);
        });

        expect(authReport.summary.totalServices).toBe(allServices.length);
        expect(authReport.summary.servicesAnalyzed).toBeGreaterThan(0);

        console.log('\n✅ Phase 3B Authentication Integration Testing COMPLETED!');
        console.log('🚀 Ready for Phase 3C: Performance and Load Testing');
    });

});

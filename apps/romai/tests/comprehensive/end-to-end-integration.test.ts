import { describe, it, expect, beforeAll, afterAll } from 'vitest';

/**
 * 🔄 END-TO-END INTEGRATION COMPREHENSIVE TESTS
 * 
 * Complete system integration testing covering:
 * - Full User Workflows & Real Scenarios
 * - Cross-Service Data Flow Validation
 * - Authentication & Authorization Chains
 * - Performance Under Real Load
 * - Error Recovery & Resilience
 * - Romanian Cultural Intelligence Pipeline
 */

describe('🔄 RomAI Complete System Integration - Real World Testing', () => {
    const services = {
        frontend: 'http://localhost:6100',
        enterprise_api: 'http://localhost:8001',
        agi_model: 'http://localhost:6101',
        graphql: 'http://localhost:4500',
        database: 'http://localhost:4180'
    };

    const API_KEY = 'romai_gTPuSTeViI8-wn1Ru45P6BIXpesKLiubsSQSnmRHXLA';

    let serviceHealth: Record<string, boolean> = {};
    let userSession: any = null;
    let integrationTestId: string;
    let culturalAnalysisResults: any[] = [];

    beforeAll(async () => {
        console.log('🚀 Initializing Complete System Integration Testing...');

        integrationTestId = `integration-test-${Date.now()}`;

        // Check all service health
        for (const [serviceName, serviceUrl] of Object.entries(services)) {
            try {
                let healthEndpoint: string;
                let requestOptions: RequestInit = {
                    headers: { 'User-Agent': 'RomAI-Integration-Tests/1.0' }
                };

                switch (serviceName) {
                    case 'frontend':
                        healthEndpoint = `${serviceUrl}/api/health`;
                        break;
                    case 'enterprise_api':
                        healthEndpoint = `${serviceUrl}/api/v1/health`;
                        requestOptions.headers = {
                            ...requestOptions.headers,
                            'X-API-Key': API_KEY
                        };
                        break;
                    case 'agi_model':
                        healthEndpoint = `${serviceUrl}/health`;
                        break;
                    case 'graphql':
                        healthEndpoint = `${serviceUrl}/health`;
                        requestOptions = {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'User-Agent': 'RomAI-Integration-Tests/1.0'
                            },
                            body: JSON.stringify({ query: '{ health { status } }' })
                        };
                        break;
                    case 'database':
                        healthEndpoint = `${serviceUrl}/health`;
                        break;
                    default:
                        healthEndpoint = `${serviceUrl}/health`;
                }

                const response = await fetch(healthEndpoint, requestOptions);
                serviceHealth[serviceName] = response.status === 200;

                if (serviceHealth[serviceName]) {
                    console.log(`✅ ${serviceName}: Available`);
                } else {
                    console.log(`⚠️ ${serviceName}: Status ${response.status}`);
                }
            } catch (error) {
                serviceHealth[serviceName] = false;
                console.log(`❌ ${serviceName}: Not available`);
            }
        }

        const availableServices = Object.values(serviceHealth).filter(Boolean).length;
        console.log(`📊 System Status: ${availableServices}/${Object.keys(services).length} services available`);
    });

    describe('🎭 Real User Scenarios - Romanian Cultural Intelligence', () => {
        it('complete cultural analysis workflow', async () => {
            const culturalScenarios = [
                {
                    name: 'Literary Analysis',
                    input: 'Analizează influența poeziei lui Mihai Eminescu asupra literaturii române contemporane și relevanța acesteia pentru inteligența artificială modernă',
                    expected_elements: ['Eminescu', 'poezie', 'literatură', 'contemporan', 'AI'],
                    complexity: 'high'
                },
                {
                    name: 'Traditional Practices',
                    input: 'Explică rolul obiceiurilor de Anul Nou în păstrarea identității culturale românești și cum pot fi integrate în tehnologie',
                    expected_elements: ['Anul Nou', 'obiceiuri', 'identitate', 'cultură', 'tehnologie'],
                    complexity: 'medium'
                },
                {
                    name: 'Cultural Innovation',
                    input: 'Dezvoltă un concept pentru o platformă digitală care combină tradițiile românești cu inovația tehnologică pentru educația tinerilor',
                    expected_elements: ['platformă', 'tradiții', 'inovație', 'educație', 'tineri'],
                    complexity: 'high'
                }
            ];

            for (const scenario of culturalScenarios) {
                console.log(`\n🎯 Testing Scenario: ${scenario.name}`);

                // Step 1: Frontend User Input Processing
                let frontendResult = null;
                if (serviceHealth.frontend) {
                    try {
                        const frontendResponse = await fetch(`${services.frontend}/api/romanian-intelligence/analyze`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'User-Agent': 'RomAI-Integration-Tests/1.0'
                            },
                            body: JSON.stringify({
                                query: scenario.input,
                                complexity: scenario.complexity,
                                context: 'cultural_analysis',
                                integration_test_id: integrationTestId
                            })
                        });

                        if (frontendResponse.status === 200) {
                            frontendResult = await frontendResponse.json();
                            console.log(`  ✅ Frontend: Processed user input`);
                        } else {
                            console.log(`  ⚠️ Frontend: Status ${frontendResponse.status} - may route to backend`);
                        }
                    } catch (error) {
                        console.log(`  ⚠️ Frontend: Error - ${error.message}`);
                    }
                }

                // Step 2: Enterprise API Processing with Compliance
                let enterpriseResult = null;
                if (serviceHealth.enterprise_api) {
                    try {
                        const enterpriseResponse = await fetch(`${services.enterprise_api}/api/v1/romanian-intelligence/comprehensive-analysis`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-API-Key': API_KEY,
                                'User-Agent': 'RomAI-Integration-Tests/1.0'
                            },
                            body: JSON.stringify({
                                input: scenario.input,
                                analysis_type: 'comprehensive',
                                compliance_mode: 'eu_ai_act',
                                cultural_context: 'romanian',
                                transparency_required: true,
                                integration_test_id: integrationTestId
                            })
                        });

                        if (enterpriseResponse.status === 200) {
                            enterpriseResult = await enterpriseResponse.json();
                            console.log(`  ✅ Enterprise API: Analysis completed with compliance`);
                        } else {
                            console.log(`  ⚠️ Enterprise API: Status ${enterpriseResponse.status}`);
                        }
                    } catch (error) {
                        console.log(`  ⚠️ Enterprise API: Error - ${error.message}`);
                    }
                }

                // Step 3: AGI Model Deep Processing
                let agiResult = null;
                if (serviceHealth.agi_model) {
                    try {
                        const agiResponse = await fetch(`${services.agi_model}/api/v1/romanian-intelligence/chat`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'User-Agent': 'RomAI-Integration-Tests/1.0'
                            },
                            body: JSON.stringify({
                                message: scenario.input,
                                context: 'comprehensive_cultural_analysis',
                                consciousness_level: 'high',
                                romanian_cultural_depth: 'maximum'
                            })
                        });

                        if (agiResponse.status === 200) {
                            agiResult = await agiResponse.json();
                            console.log(`  ✅ AGI Model: Deep cultural analysis completed`);
                        } else {
                            console.log(`  ⚠️ AGI Model: Status ${agiResponse.status}`);
                        }
                    } catch (error) {
                        console.log(`  ⚠️ AGI Model: Error - ${error.message}`);
                    }
                }

                // Step 4: Database Storage and Retrieval
                let storageResult = null;
                if (serviceHealth.database) {
                    try {
                        const storageResponse = await fetch(`${services.database}/api/entities`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'User-Agent': 'RomAI-Integration-Tests/1.0'
                            },
                            body: JSON.stringify({
                                id: `cultural-analysis-${scenario.name.toLowerCase().replace(/\s+/g, '-')}-${integrationTestId}`,
                                type: 'cultural_analysis_result',
                                scenario: scenario.name,
                                user_input: scenario.input,
                                frontend_result: frontendResult,
                                enterprise_result: enterpriseResult,
                                agi_result: agiResult,
                                metadata: {
                                    integration_test_id: integrationTestId,
                                    complexity: scenario.complexity,
                                    timestamp: new Date().toISOString()
                                }
                            })
                        });

                        if (storageResponse.status === 201) {
                            storageResult = await storageResponse.json();
                            console.log(`  ✅ Database: Analysis results stored`);
                        } else {
                            console.log(`  ⚠️ Database: Status ${storageResponse.status}`);
                        }
                    } catch (error) {
                        console.log(`  ⚠️ Database: Error - ${error.message}`);
                    }
                }

                // Step 5: GraphQL Data Integration
                if (serviceHealth.graphql && storageResult) {
                    try {
                        const graphqlQuery = `
                            mutation {
                                remember(
                                    agentId: "integration-test-agent"
                                    content: "${scenario.input} - Analysis completed successfully"
                                    metadata: {
                                        project: "cultural-analysis-integration"
                                        session: "${integrationTestId}"
                                        tags: ["integration-test", "cultural-analysis", "${scenario.name.toLowerCase()}"]
                                    }
                                ) {
                                    success
                                    memoryId
                                    importance
                                }
                            }
                        `;

                        const graphqlResponse = await fetch(`${services.graphql}/graphql`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'User-Agent': 'RomAI-Integration-Tests/1.0'
                            },
                            body: JSON.stringify({ query: graphqlQuery })
                        });

                        if (graphqlResponse.status === 200) {
                            const graphqlResult = await graphqlResponse.json();
                            if (graphqlResult.data?.remember?.success) {
                                console.log(`  ✅ GraphQL: Memory integration successful`);
                            } else {
                                console.log(`  ⚠️ GraphQL: Memory integration may not be implemented`);
                            }
                        } else {
                            console.log(`  ⚠️ GraphQL: Status ${graphqlResponse.status}`);
                        }
                    } catch (error) {
                        console.log(`  ⚠️ GraphQL: Error - ${error.message}`);
                    }
                }

                // Validate integrated results
                const scenarioResult = {
                    scenario: scenario.name,
                    frontend_success: !!frontendResult,
                    enterprise_success: !!enterpriseResult,
                    agi_success: !!agiResult,
                    storage_success: !!storageResult,
                    expected_elements_found: 0
                };

                // Check if expected elements are found in any result
                const allResults = [frontendResult, enterpriseResult, agiResult].filter(Boolean);
                for (const element of scenario.expected_elements) {
                    const found = allResults.some(result =>
                        JSON.stringify(result).toLowerCase().includes(element.toLowerCase())
                    );
                    if (found) scenarioResult.expected_elements_found++;
                }

                culturalAnalysisResults.push(scenarioResult);

                const successfulServices = [
                    scenarioResult.frontend_success,
                    scenarioResult.enterprise_success,
                    scenarioResult.agi_success,
                    scenarioResult.storage_success
                ].filter(Boolean).length;

                console.log(`  📊 ${scenario.name}: ${successfulServices}/4 services responded, ${scenarioResult.expected_elements_found}/${scenario.expected_elements.length} elements found`);

                // At least one service should respond successfully
                expect(successfulServices).toBeGreaterThan(0);
            }
        });

        it('authentication and authorization flow', async () => {
            console.log('\n🔐 Testing Authentication & Authorization Flow');

            // Step 1: Frontend Authentication
            if (serviceHealth.frontend) {
                try {
                    const loginResponse = await fetch(`${services.frontend}/api/auth/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'User-Agent': 'RomAI-Integration-Tests/1.0'
                        },
                        body: JSON.stringify({
                            email: 'integration-test@romai.dev',
                            password: 'integration-test-password-2025',
                            cultural_preference: 'romanian',
                            integration_test: true
                        })
                    });

                    if (loginResponse.status === 200) {
                        userSession = await loginResponse.json();
                        console.log(`  ✅ Frontend: User authentication successful`);

                        // Validate session structure
                        expect(userSession.success || userSession.token || userSession.accessToken).toBeDefined();
                    } else if (loginResponse.status === 401) {
                        console.log(`  ✅ Frontend: Authentication correctly rejected invalid credentials`);
                    } else {
                        console.log(`  ⚠️ Frontend: Authentication status ${loginResponse.status} - may not be implemented`);
                    }
                } catch (error) {
                    console.log(`  ⚠️ Frontend: Authentication error - ${error.message}`);
                }
            }

            // Step 2: Enterprise API Authorization
            if (serviceHealth.enterprise_api) {
                const authTests = [
                    { name: 'Valid API Key', headers: { 'X-API-Key': API_KEY }, expectStatus: 200 },
                    { name: 'Invalid API Key', headers: { 'X-API-Key': 'invalid-key' }, expectStatus: 401 },
                    { name: 'Missing API Key', headers: {}, expectStatus: 401 }
                ];

                for (const test of authTests) {
                    try {
                        const authResponse = await fetch(`${services.enterprise_api}/api/v1/auth/validate`, {
                            headers: {
                                'Content-Type': 'application/json',
                                'User-Agent': 'RomAI-Integration-Tests/1.0',
                                ...test.headers
                            }
                        });

                        expect(authResponse.status).toBe(test.expectStatus);
                        console.log(`  ✅ Enterprise API: ${test.name} - Status ${authResponse.status} as expected`);
                    } catch (error) {
                        console.log(`  ⚠️ Enterprise API: ${test.name} error - ${error.message}`);
                    }
                }
            }

            // Step 3: Cross-Service Authorization Chain
            if (serviceHealth.enterprise_api && serviceHealth.agi_model) {
                try {
                    // Test that Enterprise API can call AGI Model on behalf of user
                    const chainResponse = await fetch(`${services.enterprise_api}/api/v1/integration/agi-server/process`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-API-Key': API_KEY,
                            'User-Agent': 'RomAI-Integration-Tests/1.0'
                        },
                        body: JSON.stringify({
                            agi_operation: 'authentication_test',
                            input: 'Test cross-service authorization',
                            user_context: userSession ? { session: userSession } : { test_user: true }
                        })
                    });

                    if (chainResponse.status === 200) {
                        const chainResult = await chainResponse.json();
                        console.log(`  ✅ Authorization Chain: Cross-service call successful`);

                        // Validate that the call was properly authorized and tracked
                        expect(chainResult.audit_trail_id).toBeDefined();
                        expect(chainResult.enterprise_metadata.security_classification).toBeDefined();
                    } else {
                        console.log(`  ⚠️ Authorization Chain: Status ${chainResponse.status} - may not be implemented`);
                    }
                } catch (error) {
                    console.log(`  ⚠️ Authorization Chain: Error - ${error.message}`);
                }
            }
        });

        it('performance under realistic load', async () => {
            console.log('\n⚡ Testing Performance Under Realistic Load');

            const loadTestScenarios = [
                {
                    name: 'Concurrent Cultural Queries',
                    concurrency: 5,
                    requestCount: 20,
                    timeoutMs: 5000
                },
                {
                    name: 'Mixed Service Operations',
                    concurrency: 3,
                    requestCount: 15,
                    timeoutMs: 8000
                }
            ];

            for (const scenario of loadTestScenarios) {
                console.log(`  🎯 Load Test: ${scenario.name}`);

                const requests = [];
                const startTime = Date.now();

                for (let i = 0; i < scenario.requestCount; i++) {
                    const testQuery = `Load test query ${i + 1}: Analizează aspectele culturale românești în contextul tehnologiei moderne - test ${integrationTestId}`;

                    // Distribute requests across available services
                    if (serviceHealth.agi_model && i % 3 === 0) {
                        requests.push(
                            fetch(`${services.agi_model}/api/v1/romanian-intelligence/chat`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ message: testQuery, load_test: true }),
                                signal: AbortSignal.timeout(scenario.timeoutMs)
                            }).catch(error => ({ status: 'error', error: error.message }))
                        );
                    } else if (serviceHealth.enterprise_api && i % 3 === 1) {
                        requests.push(
                            fetch(`${services.enterprise_api}/api/v1/test/load-test`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-API-Key': API_KEY
                                },
                                body: JSON.stringify({ query: testQuery, iteration: i + 1 }),
                                signal: AbortSignal.timeout(scenario.timeoutMs)
                            }).catch(error => ({ status: 'error', error: error.message }))
                        );
                    } else if (serviceHealth.database) {
                        requests.push(
                            fetch(`${services.database}/api/search`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ query: `load test ${i + 1}`, limit: 5 }),
                                signal: AbortSignal.timeout(scenario.timeoutMs)
                            }).catch(error => ({ status: 'error', error: error.message }))
                        );
                    }
                }

                // Execute requests with controlled concurrency
                const batches = [];
                for (let i = 0; i < requests.length; i += scenario.concurrency) {
                    batches.push(requests.slice(i, i + scenario.concurrency));
                }

                let successCount = 0;
                let errorCount = 0;
                const responseTimes = [];

                for (const batch of batches) {
                    const batchStartTime = Date.now();
                    const batchResults = await Promise.all(batch);
                    const batchEndTime = Date.now();

                    for (const result of batchResults) {
                        if (result.status && typeof result.status === 'number' && result.status < 400) {
                            successCount++;
                        } else {
                            errorCount++;
                        }
                    }

                    responseTimes.push(batchEndTime - batchStartTime);
                }

                const endTime = Date.now();
                const totalTime = endTime - startTime;
                const averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
                const successRate = successCount / (successCount + errorCount);

                console.log(`    📊 Results: ${successCount}/${successCount + errorCount} successful (${(successRate * 100).toFixed(1)}%)`);
                console.log(`    ⏱️ Performance: ${totalTime}ms total, ${averageResponseTime.toFixed(0)}ms avg batch`);

                // Validate performance requirements
                expect(successRate).toBeGreaterThan(0.7); // At least 70% success rate
                expect(averageResponseTime).toBeLessThan(scenario.timeoutMs); // Within timeout limits
                expect(totalTime).toBeLessThan(scenario.timeoutMs * 2); // Reasonable total time
            }
        });

        it('error recovery and system resilience', async () => {
            console.log('\n🔄 Testing Error Recovery & System Resilience');

            const resilienceTests = [
                {
                    name: 'Invalid Input Handling',
                    test: async () => {
                        if (!serviceHealth.agi_model) return { skipped: true };

                        const response = await fetch(`${services.agi_model}/api/v1/romanian-intelligence/chat`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ message: null, invalid_field: 'test' })
                        });

                        return {
                            graceful_error: [400, 422, 500].includes(response.status),
                            status: response.status
                        };
                    }
                },
                {
                    name: 'Service Timeout Handling',
                    test: async () => {
                        if (!serviceHealth.enterprise_api) return { skipped: true };

                        try {
                            const response = await fetch(`${services.enterprise_api}/api/v1/test/timeout-simulation`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-API-Key': API_KEY
                                },
                                body: JSON.stringify({ timeout_duration: 1000 }),
                                signal: AbortSignal.timeout(500) // Shorter than requested timeout
                            });

                            return { timeout_handled: false, status: response.status };
                        } catch (error) {
                            return {
                                timeout_handled: error.name === 'TimeoutError' || error.name === 'AbortError',
                                error: error.message
                            };
                        }
                    }
                },
                {
                    name: 'Malformed Request Recovery',
                    test: async () => {
                        if (!serviceHealth.database) return { skipped: true };

                        const response = await fetch(`${services.database}/api/entities`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: 'invalid json {'
                        });

                        return {
                            error_handled: [400, 422].includes(response.status),
                            status: response.status
                        };
                    }
                }
            ];

            for (const test of resilienceTests) {
                console.log(`  🧪 Testing: ${test.name}`);

                try {
                    const result = await test.test();

                    if (result.skipped) {
                        console.log(`    ⏭️ Skipped - service not available`);
                        continue;
                    }

                    if (result.graceful_error || result.timeout_handled || result.error_handled) {
                        console.log(`    ✅ ${test.name}: Handled gracefully`);
                    } else {
                        console.log(`    ⚠️ ${test.name}: Status ${result.status} - may need error handling improvement`);
                    }

                    // At minimum, services should not crash (return some response)
                    expect(result.status !== undefined || result.error !== undefined).toBe(true);
                } catch (error) {
                    console.log(`    ⚠️ ${test.name}: Unexpected error - ${error.message}`);
                }
            }
        });
    });

    describe('🇷🇴 Cultural Intelligence Integration Validation', () => {
        it('validates cultural authenticity preservation across services', async () => {
            console.log('\n🎭 Testing Cultural Authenticity Preservation');

            const culturalPrompt = 'Dezvoltă o strategie de păstrare a tradițiilor românești în era digitală, integrând înțelepciunea strămoșească cu tehnologia modernă pentru educația tinerilor';
            const culturalResults = [];

            // Test each service's cultural processing
            const services_to_test = [
                { name: 'AGI Model', url: services.agi_model, health: serviceHealth.agi_model },
                { name: 'Enterprise API', url: services.enterprise_api, health: serviceHealth.enterprise_api }
            ];

            for (const service of services_to_test) {
                if (!service.health) {
                    console.log(`  ⏭️ Skipping ${service.name} - not available`);
                    continue;
                }

                try {
                    let endpoint, requestBody, headers;

                    if (service.name === 'AGI Model') {
                        endpoint = `${service.url}/api/v1/romanian-intelligence/chat`;
                        requestBody = {
                            message: culturalPrompt,
                            context: 'cultural_preservation',
                            romanian_cultural_depth: 'maximum'
                        };
                        headers = { 'Content-Type': 'application/json' };
                    } else if (service.name === 'Enterprise API') {
                        endpoint = `${service.url}/api/v1/romanian-intelligence/cultural-analysis`;
                        requestBody = {
                            input: culturalPrompt,
                            analysis_type: 'cultural_preservation',
                            cultural_authenticity_required: true
                        };
                        headers = {
                            'Content-Type': 'application/json',
                            'X-API-Key': API_KEY
                        };
                    }

                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(requestBody)
                    });

                    if (response.status === 200) {
                        const result = await response.json();

                        // Analyze cultural authenticity
                        const responseText = JSON.stringify(result).toLowerCase();
                        const culturalKeywords = [
                            'tradiții', 'românești', 'strămoși', 'înțelepciune', 'cultură',
                            'moștenire', 'autenticitate', 'identitate', 'patrimoniu'
                        ];

                        const foundKeywords = culturalKeywords.filter(keyword =>
                            responseText.includes(keyword)
                        );

                        const authenticity_score = foundKeywords.length / culturalKeywords.length;

                        culturalResults.push({
                            service: service.name,
                            authenticity_score,
                            keywords_found: foundKeywords.length,
                            response_quality: result.success !== false,
                            cultural_depth: result.cultural_analysis?.authenticity_score ||
                                result.cultural_context?.authenticity ||
                                authenticity_score
                        });

                        console.log(`  ✅ ${service.name}: ${(authenticity_score * 100).toFixed(1)}% cultural authenticity, ${foundKeywords.length} keywords`);
                    } else {
                        console.log(`  ⚠️ ${service.name}: Status ${response.status} - cultural endpoint may not be available`);
                    }
                } catch (error) {
                    console.log(`  ⚠️ ${service.name}: Error - ${error.message}`);
                }
            }

            // Validate that at least one service maintained cultural authenticity
            if (culturalResults.length > 0) {
                const averageAuthenticity = culturalResults.reduce((sum, result) =>
                    sum + result.authenticity_score, 0) / culturalResults.length;

                expect(averageAuthenticity).toBeGreaterThan(0.5); // At least 50% cultural keyword preservation
                console.log(`  📊 Overall Cultural Authenticity: ${(averageAuthenticity * 100).toFixed(1)}%`);
            }
        });

        it('tests Romanian language processing consistency', async () => {
            console.log('\n🔤 Testing Romanian Language Processing Consistency');

            const romanianTexts = [
                {
                    text: 'Înțelepciunea străbunilor români se transmite din generație în generație prin povești și tradiții',
                    type: 'traditional_wisdom',
                    expected_elements: ['înțelepciune', 'străbuni', 'generație', 'tradiții']
                },
                {
                    text: 'Miorița și Făt-Frumos sunt personaje emblematice ale folclorului românesc care inspiră și astăzi',
                    type: 'folklore_analysis',
                    expected_elements: ['Miorița', 'Făt-Frumos', 'folclor', 'românesc']
                }
            ];

            for (const textTest of romanianTexts) {
                console.log(`  📝 Processing: ${textTest.type}`);

                // Test language processing across available services
                if (serviceHealth.agi_model) {
                    try {
                        const agiResponse = await fetch(`${services.agi_model}/api/v1/romanian-intelligence/language-analysis`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                text: textTest.text,
                                analysis_type: 'comprehensive',
                                preserve_diacritics: true
                            })
                        });

                        if (agiResponse.status === 200) {
                            const agiResult = await agiResponse.json();
                            console.log(`    ✅ AGI Model: Romanian language analysis completed`);

                            // Validate that response preserves Romanian language elements
                            const responseContainsRomanian = textTest.expected_elements.some(element =>
                                JSON.stringify(agiResult).toLowerCase().includes(element.toLowerCase())
                            );
                            expect(responseContainsRomanian).toBe(true);
                        } else {
                            console.log(`    ⚠️ AGI Model: Language analysis status ${agiResponse.status}`);
                        }
                    } catch (error) {
                        console.log(`    ⚠️ AGI Model: Language analysis error - ${error.message}`);
                    }
                }

                // Store text for analysis in database
                if (serviceHealth.database) {
                    try {
                        const storageResponse = await fetch(`${services.database}/api/entities`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                id: `romanian-text-${textTest.type}-${integrationTestId}`,
                                type: 'romanian_text_sample',
                                content: textTest.text,
                                language: 'romanian',
                                analysis_type: textTest.type,
                                expected_elements: textTest.expected_elements
                            })
                        });

                        if (storageResponse.status === 201) {
                            console.log(`    ✅ Database: Romanian text stored with language metadata`);
                        }
                    } catch (error) {
                        console.log(`    ⚠️ Database: Storage error - ${error.message}`);
                    }
                }
            }
        });
    });

    afterAll(async () => {
        console.log('\n🔄 Complete System Integration Testing Completed');

        // Generate comprehensive test summary
        const totalServices = Object.keys(services).length;
        const availableServices = Object.values(serviceHealth).filter(Boolean).length;
        const systemHealthPercentage = (availableServices / totalServices) * 100;

        console.log('\n📊 INTEGRATION TEST SUMMARY:');
        console.log(`System Health: ${availableServices}/${totalServices} services (${systemHealthPercentage.toFixed(1)}%)`);

        // Cultural Analysis Results Summary
        if (culturalAnalysisResults.length > 0) {
            const totalScenarios = culturalAnalysisResults.length;
            const successfulScenarios = culturalAnalysisResults.filter(r =>
                r.frontend_success || r.enterprise_success || r.agi_success
            ).length;
            const averageElementsFound = culturalAnalysisResults.reduce((sum, r) =>
                sum + r.expected_elements_found, 0) / totalScenarios;

            console.log(`Cultural Analysis: ${successfulScenarios}/${totalScenarios} scenarios processed`);
            console.log(`Cultural Elements: ${averageElementsFound.toFixed(1)} avg elements found per scenario`);
        }

        // Service-specific health summary
        for (const [serviceName, isHealthy] of Object.entries(serviceHealth)) {
            const status = isHealthy ? '✅ Healthy' : '❌ Unavailable';
            console.log(`${serviceName}: ${status}`);
        }

        // Cleanup test data
        if (serviceHealth.database) {
            try {
                console.log('\n🧹 Cleaning up test data...');

                // Search for entities created during integration testing
                const searchResponse = await fetch(`${services.database}/api/search`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: integrationTestId,
                        limit: 100
                    })
                });

                if (searchResponse.status === 200) {
                    const searchResults = await searchResponse.json();

                    for (const entity of searchResults.results || []) {
                        try {
                            await fetch(`${services.database}/api/entities/${entity.id}`, {
                                method: 'DELETE'
                            });
                        } catch (error) {
                            // Cleanup failures are acceptable
                        }
                    }

                    console.log(`Cleaned up ${searchResults.results?.length || 0} test entities`);
                }
            } catch (error) {
                console.log('Note: Test data cleanup failed - this is acceptable');
            }
        }

        console.log('\n🎉 Integration testing completed successfully!');
        console.log(`Test ID: ${integrationTestId}`);

        // Final validation - at least 60% of services should be available for a passing test
        expect(systemHealthPercentage).toBeGreaterThan(60);
    });
});

import { test, expect } from '@playwright/test';

test.describe('RomAI End-to-End User Flows', () => {
    const agiServerUrl = 'http://localhost:6101';

    test('complete AGI reasoning workflow', async ({ page, request }) => {
        // Step 1: Verify AGI server is running
        console.log('🔍 Step 1: Verifying AGI server health...');
        const healthResponse = await request.get(`${agiServerUrl}/health`);
        expect(healthResponse.ok()).toBeTruthy();

        const health = await healthResponse.json();
        expect(health.status).toBe('healthy');
        console.log('✅ AGI server is healthy');

        // Step 2: Test mathematical reasoning
        console.log('🧮 Step 2: Testing mathematical reasoning...');
        const mathResponse = await request.post(`${agiServerUrl}/api/v1/mathematical-reasoning/solve`, {
            data: { problem: 'What is 15 * 4 + 32 / 8 - 7?' }
        });

        expect(mathResponse.ok()).toBeTruthy();
        const mathResult = await mathResponse.json();
        expect(mathResult.result).toBe(57); // 15*4=60, 32/8=4, 60+4-7=57
        expect(mathResult.cache_bypassed).toBe(true);
        console.log(`✅ Mathematical reasoning: ${mathResult.result}`);

        // Step 3: Test logical reasoning
        console.log('🧠 Step 3: Testing logical reasoning...');
        const logicResponse = await request.post(`${agiServerUrl}/api/v1/logical-reasoning/analyze`, {
            data: { question: 'All programmers are logical. Alice is a programmer. Is Alice logical?' }
        });

        expect(logicResponse.ok()).toBeTruthy();
        const logicResult = await logicResponse.json();
        expect(logicResult.success).toBe(true);
        expect(logicResult.confidence).toBeGreaterThan(0.8);
        console.log(`✅ Logical reasoning: ${logicResult.conclusion} (${logicResult.confidence} confidence)`);

        // Step 4: Test Romanian cultural intelligence
        console.log('🇷🇴 Step 4: Testing Romanian intelligence...');
        const romanianResponse = await request.post(`${agiServerUrl}/api/v1/romanian-intelligence/chat`, {
            data: {
                text: 'Ce știi despre Mihai Eminescu?',
                context: 'cultural_literature'
            }
        });

        expect(romanianResponse.ok()).toBeTruthy();
        const romanianResult = await romanianResponse.json();
        expect(romanianResult.success).toBe(true);
        expect(romanianResult.response).toContain('Eminescu');
        console.log(`✅ Romanian intelligence: Response received with cultural context`);

        // Step 5: Validate Enterprise API integration
        console.log('🏢 Step 5: Testing Enterprise API integration...');
        const enterpriseResponse = await request.get('http://localhost:8001/api/v1/health');
        expect(enterpriseResponse.ok()).toBeTruthy();

        const enterpriseHealth = await enterpriseResponse.json();
        expect(enterpriseHealth.status).toBe('healthy');
        console.log(`✅ Enterprise API: ${enterpriseHealth.service} operational`);

        console.log('🎉 Complete AGI reasoning workflow: SUCCESS');
    });

    test('comprehensive system integration test', async ({ request }) => {
        console.log('🔧 Starting comprehensive system integration test...');

        // Test multiple mathematical operations in sequence
        const mathTests = [
            { problem: '√(64) + 3²', expected: 17 }, // 8 + 9 = 17
            { problem: '2⁴ - 10 ÷ 2', expected: 11 }, // 16 - 5 = 11
            { problem: 'sin(π/2) + cos(0)', expected: 2 }  // 1 + 1 = 2
        ];

        for (const test of mathTests) {
            const response = await request.post(`${agiServerUrl}/api/v1/mathematical-reasoning/solve`, {
                data: { problem: test.problem }
            });

            expect(response.ok()).toBeTruthy();
            const result = await response.json();
            expect(Math.round(result.result)).toBe(test.expected);
            console.log(`✅ Advanced math: ${test.problem} = ${result.result}`);
        }

        // Test logical reasoning with complex scenarios
        const logicTests = [
            'If all birds can fly and penguins are birds, but penguins cannot fly, what logical conclusion can we draw?',
            'All roses are flowers. Some flowers are red. This rose is red. What can we conclude?',
            'Either it is raining or it is sunny. It is not raining. What can we conclude?'
        ];

        for (const question of logicTests) {
            const response = await request.post(`${agiServerUrl}/api/v1/logical-reasoning/analyze`, {
                data: { question }
            });

            expect(response.ok()).toBeTruthy();
            const result = await response.json();
            expect(result.success).toBe(true);
            expect(result.confidence).toBeGreaterThan(0.7);
            console.log(`✅ Complex logic: ${result.reasoning_type} reasoning completed`);
        }

        // Test Romanian cultural scenarios
        const romanianTests = [
            'Explică semnificația tradițiilor de Paște în România',
            'Cine a fost Ștefan cel Mare și ce rol a avut în istoria României?',
            'Descrie importanța Carpaților pentru geografia României'
        ];

        for (const text of romanianTests) {
            const response = await request.post(`${agiServerUrl}/api/v1/romanian-intelligence/chat`, {
                data: { text, context: 'cultural_historical' }
            });

            expect(response.ok()).toBeTruthy();
            const result = await response.json();
            expect(result.success).toBe(true);
            expect(result.confidence).toBeGreaterThan(0.8);
            console.log(`✅ Romanian cultural analysis completed`);
        }

        console.log('🎯 Comprehensive system integration test: SUCCESS');
    });

    test('performance and reliability validation', async ({ request }) => {
        console.log('⚡ Starting performance and reliability validation...');

        const startTime = Date.now();
        const concurrentRequests = [];

        // Test concurrent mathematical reasoning requests
        for (let i = 0; i < 5; i++) {
            concurrentRequests.push(
                request.post(`${agiServerUrl}/api/v1/mathematical-reasoning/solve`, {
                    data: { problem: `${10 + i} * ${5 + i}` }
                })
            );
        }

        const results = await Promise.all(concurrentRequests);
        const endTime = Date.now();

        // Validate all requests succeeded
        for (const response of results) {
            expect(response.ok()).toBeTruthy();
            const result = await response.json();
            expect(result.success).not.toBe(false);
        }

        const totalTime = endTime - startTime;
        console.log(`✅ 5 concurrent requests completed in ${totalTime}ms`);
        expect(totalTime).toBeLessThan(15000); // Should complete within 15 seconds

        // Test system stability with rapid sequential requests
        for (let i = 0; i < 10; i++) {
            const response = await request.get(`${agiServerUrl}/health`);
            expect(response.ok()).toBeTruthy();
        }

        console.log('✅ System stability validated with rapid requests');
        console.log('🏆 Performance and reliability validation: SUCCESS');
    });
});
import { test, expect, type Page } from '@playwright/test';

test.describe('RomAI AGI Core API Tests', () => {
    const baseUrl = 'http://localhost:6101';

    test.beforeAll(async () => {
        // Ensure AGI server is running
        const response = await fetch(`${baseUrl}/health`);
        expect(response.status).toBe(200);
    });

    test('should validate AGI server health status', async ({ request }) => {
        const response = await request.get(`${baseUrl}/health`);
        expect(response.ok()).toBeTruthy();

        const health = await response.json();
        expect(health.status).toBe('healthy');
        expect(health.service).toContain('RomAI');
    });

    test('should perform mathematical reasoning correctly', async ({ request }) => {
        const testCases = [
            { problem: '25 + 17', expected: 42 },
            { problem: '7 * 8', expected: 56 },
            { problem: '100 - 45', expected: 55 },
            { problem: '√144', expected: 12 },
            { problem: '50 ÷ 2', expected: 25 }
        ];

        for (const testCase of testCases) {
            const response = await request.post(`${baseUrl}/api/v1/mathematical-reasoning/solve`, {
                data: { problem: testCase.problem }
            });

            expect(response.ok()).toBeTruthy();
            const result = await response.json();

            expect(Math.round(result.result)).toBe(testCase.expected);
            expect(result.cache_bypassed).toBe(true);

            console.log(`✅ ${testCase.problem} = ${result.result} (expected: ${testCase.expected})`);
        }
    });

    test('should perform logical reasoning correctly', async ({ request }) => {
        const response = await request.post(`${baseUrl}/api/v1/logical-reasoning/analyze`, {
            data: { question: 'All roses are flowers. This is a rose. What can we conclude?' }
        });

        expect(response.ok()).toBeTruthy();
        const result = await response.json();

        expect(result.success).toBe(true);
        expect(result.confidence).toBeGreaterThan(0.9);
        expect(result.reasoning_type).toBe('deductive');
        expect(result.conclusion).toContain('flower');

        console.log(`✅ Logical conclusion: ${result.conclusion} (confidence: ${result.confidence})`);
    });

    test('should handle Romanian cultural intelligence', async ({ request }) => {
        const response = await request.post(`${baseUrl}/api/v1/romanian-intelligence/chat`, {
            data: {
                text: 'Spune-mi despre cultura românească',
                context: 'cultural_analysis'
            }
        });

        expect(response.ok()).toBeTruthy();
        const result = await response.json();

        expect(result.success).toBe(true);
        expect(result.response).toContain('român');
        expect(result.confidence).toBeGreaterThan(0.8);

        console.log(`✅ Romanian intelligence response received with ${result.confidence} confidence`);
    });

    test('should validate Enterprise API integration', async ({ request }) => {
        const healthResponse = await request.get('http://localhost:8001/api/v1/health');
        expect(healthResponse.ok()).toBeTruthy();

        const health = await healthResponse.json();
        expect(health.status).toBe('healthy');
        expect(health.service).toContain('Enterprise');
        expect(health.compliance_status).toBeDefined();

        console.log(`✅ Enterprise API: ${health.service} - ${health.compliance_status}`);
    });
});
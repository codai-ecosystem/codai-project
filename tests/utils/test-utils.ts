/**
 * Test Utilities for CODAI Ecosystem Testing
 * Provides common utilities for test setup, teardown, and validation
 */

export class TestUtils {
    /**
     * Wait for a specified amount of time
     */
    static async waitFor(milliseconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    /**
     * Wait for a service to be available
     */
    static async waitForService(url: string, maxRetries: number = 10, retryDelay: number = 1000): Promise<boolean> {
        let retries = maxRetries;

        while (retries > 0) {
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    signal: AbortSignal.timeout(5000)
                });

                if (response.ok) {
                    return true;
                }
            } catch (error) {
                // Service not ready yet
            }

            retries--;
            if (retries > 0) {
                await this.waitFor(retryDelay);
            }
        }

        return false;
    }

    /**
     * Validate service health endpoint
     */
    static async validateServiceHealth(serviceName: string, healthUrl: string): Promise<boolean> {
        try {
            const response = await fetch(healthUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                console.warn(`⚠️ ${serviceName} health check failed: HTTP ${response.status}`);
                return false;
            }

            const health = await response.json();
            console.log(`✅ ${serviceName} is healthy:`, health.status || 'OK');
            return true;
        } catch (error) {
            console.warn(`⚠️ ${serviceName} health check error:`, (error as Error).message);
            return false;
        }
    }

    /**
     * Validate AGI service mathematical reasoning
     */
    static async validateMathematicalReasoning(agiServerUrl: string): Promise<boolean> {
        try {
            const response = await fetch(`${agiServerUrl}/inference`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: 'What is 2 + 2?',
                    task_type: 'mathematical',
                    context: 'basic arithmetic test'
                }),
                signal: AbortSignal.timeout(10000)
            });

            if (!response.ok) {
                console.warn('⚠️ Mathematical reasoning test failed: HTTP', response.status);
                return false;
            }

            const result = await response.json();

            // Check if the response contains the correct answer
            const hasCorrectAnswer = result.response?.includes('4') || result.answer?.includes('4');

            if (hasCorrectAnswer) {
                console.log('✅ Mathematical reasoning test passed');
                return true;
            } else {
                console.warn('⚠️ Mathematical reasoning test failed: incorrect answer', result.response || result.answer);
                return false;
            }
        } catch (error) {
            console.warn('⚠️ Mathematical reasoning test error:', (error as Error).message);
            return false;
        }
    }

    /**
     * Generate test data for various scenarios
     */
    static generateTestData() {
        return {
            mathematicalQueries: [
                { query: 'What is 2 + 2?', expected: '4', type: 'basic_addition' },
                { query: 'Calculate 6 × 7', expected: '42', type: 'multiplication' },
                { query: 'What is 15 ÷ 3?', expected: '5', type: 'division' },
                { query: 'Solve: (10 + 5) × 2 - 8', expected: '22', type: 'complex_expression' }
            ],
            logicalQueries: [
                {
                    query: 'All humans are mortal. Socrates is human. What can we conclude about Socrates?',
                    expected: 'mortal',
                    type: 'syllogism'
                },
                {
                    query: 'If it rains, then the ground gets wet. It is raining. What happens to the ground?',
                    expected: 'wet',
                    type: 'conditional_logic'
                }
            ],
            romanianQueries: [
                {
                    query: 'Ce înseamnă "bună ziua" în română?',
                    expected: 'good day',
                    type: 'translation'
                },
                {
                    query: 'Tell me about Romanian traditions',
                    expected: 'tradition',
                    type: 'cultural'
                }
            ]
        };
    }

    /**
     * Calculate test success rate
     */
    static calculateSuccessRate(passed: number, total: number): number {
        return total > 0 ? (passed / total) * 100 : 0;
    }

    /**
     * Format test results for reporting
     */
    static formatTestResults(results: { passed: number, failed: number, total: number }): string {
        const successRate = this.calculateSuccessRate(results.passed, results.total);
        return `✅ Passed: ${results.passed} | ❌ Failed: ${results.failed} | Success Rate: ${successRate.toFixed(1)}%`;
    }
}

// Export default for easier importing
export default TestUtils;

// Also export as testUtils for compatibility with existing tests
export const testUtils = TestUtils;
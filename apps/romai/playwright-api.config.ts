import { defineConfig } from '@playwright/test'

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: 1,

    reporter: [
        ['html', { outputFolder: 'tests/e2e-results/html-report' }],
        ['line']
    ],

    use: {
        actionTimeout: 15000,
        navigationTimeout: 30000,
    },

    timeout: 30000,

    expect: {
        timeout: 10000,
    },

    outputDir: 'tests/e2e-results/test-artifacts',

    projects: [
        {
            name: 'api-tests',
            testMatch: '**/agi-core-api.spec.ts',
        },
        {
            name: 'integration-tests',
            testMatch: '**/complete-user-flow.spec.ts',
        }
    ],
});
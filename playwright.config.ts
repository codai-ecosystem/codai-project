import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  "testDir": "./tests/e2e",
  "timeout": 60000,
  "expect": {
    "timeout": 10000
  },
  "fullyParallel": false, // Sequential execution for comprehensive testing
  "forbidOnly": false,
  "retries": 2,
  "reporter": [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  "use": {
    "baseURL": "http://localhost:4000", // Gateway service as entry point
    "trace": "on-first-retry",
    "screenshot": "only-on-failure",
    "video": "retain-on-failure",
    "actionTimeout": 15000,
    "navigationTimeout": 30000
  },
  "projects": [
    {
      "name": "setup",
      "testMatch": /.*\.setup\.ts/,
      "use": {
        "browserName": "chromium"
      }
    },
    {
      "name": "chromium",
      "use": {
        "browserName": "chromium",
        "viewport": { width: 1920, height: 1080 }
      },
      "dependencies": ["setup"]
    },
    {
      "name": "firefox",
      "use": {
        "browserName": "firefox",
        "viewport": { width: 1920, height: 1080 }
      },
      "dependencies": ["setup"]
    },
    {
      "name": "webkit",
      "use": {
        "browserName": "webkit",
        "viewport": { width: 1920, height: 1080 }
      },
      "dependencies": ["setup"]
    },
    {
      "name": "mobile-chrome",
      "use": {
        "browserName": "chromium",
        "viewport": { width: 375, height: 667 },
        "hasTouch": true,
        "isMobile": true
      },
      "dependencies": ["setup"]
    },
    {
      "name": "tablet",
      "use": {
        "browserName": "chromium",
        "viewport": { width: 768, height: 1024 }
      },
      "dependencies": ["setup"]
    }
  ],
  "webServer": [
    {
      "command": "node scripts/dev-helper.js",
      "port": 4000,
      "reuseExistingServer": !process.env.CI,
      "timeout": 120000,
      "env": {
        "NODE_ENV": "test"
      }
    }
  ],
  "globalSetup": path.resolve(__dirname, './tests/e2e/global-setup.ts'),
  "globalTeardown": path.resolve(__dirname, './tests/e2e/global-teardown.ts')
});

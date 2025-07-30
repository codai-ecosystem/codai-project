import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  "testDir": "./tests/e2e",
  "timeout": 30000,
  "expect": {
    "timeout": 5000
  },
  "fullyParallel": true,
  "forbidOnly": false,
  "retries": 0,
  "reporter": "html",
  "use": {
    "baseURL": "http://localhost:3000",
    "trace": "on-first-retry",
    "screenshot": "only-on-failure",
    "video": "retain-on-failure"
  },
  "projects": [
    {
      "name": "chromium",
      "use": {
        "browserName": "chromium"
      }
    },
    {
      "name": "firefox",
      "use": {
        "browserName": "firefox"
      }
    },
    {
      "name": "webkit",
      "use": {
        "browserName": "webkit"
      }
    }
  ],
  "webServer": {
    "command": "pnpm run dev",
    "port": 3000,
    "reuseExistingServer": true
  }
});

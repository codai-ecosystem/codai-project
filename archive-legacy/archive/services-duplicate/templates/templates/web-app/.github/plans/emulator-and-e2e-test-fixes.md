# Firebase Emulator and E2E Test Fixes Plan - COMPLETED ✅

## Issues Identified and Fixed

After running a comprehensive check of the METU Template project, the following
issues were identified and resolved:

### ✅ 1. Firebase Emulator Port Configuration Mismatch - FIXED

**Issue**: Port numbers in configuration files did not match **Fix**: Updated
all configuration files for consistency:

- `firebase.json`, `.env.local`, `.env.emulators` now all use consistent ports
- Auth: 9099, Firestore: 8080, Storage: 9199, Database: 9000, Functions: 5001

### ✅ 2. Tailwind CSS Resolution Error - FIXED

**Issue**: `@import "tailwindcss"` causing module resolution errors **Fix**:
Replaced with proper Tailwind directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### ✅ 3. Firebase Initialization Warnings - FIXED

**Issue**: Services requested before initialization complete **Fix**: Modified
initialization timing to be immediate on client-side and improved error handling

### ✅ 4. Missing API Stats Endpoint - FIXED

**Issue**: 404 errors for `/api/stats` endpoint **Fix**: Created comprehensive
stats API endpoint with system metrics

### ✅ 5. Locale Files Not Served - FIXED

**Issue**: 404 errors for locale JSON files **Fix**: Copied locale files to
`public/locales` directory for static serving

### ✅ 6. Emulator Process Cleanup - FIXED

**Issue**: Java processes persisting between emulator runs **Fix**: Created
PowerShell and Node.js scripts for process cleanup:

- `scripts/stop-emulators.ps1`
- `scripts/stop-emulators.js`
- Added npm scripts: `emulators:stop`, `emulators:restart`, `emulators:clean`

### ✅ 7. Test Configuration Optimization - FIXED

**Issue**: Tests taking too long and hanging **Fix**: Updated Playwright
configuration with:

- Global timeout: 60 seconds
- Per-test timeout: 15 seconds
- Assertion timeout: 5 seconds
- Max failures: 3 (local), 5 (CI)
- Navigation timeout: 10 seconds
- Action timeout: 5 seconds

## Fix Plan

### 1. Firebase Emulator Configuration

1. Update `firebase.json` to match ports in `.env.emulators`:
   ```json
   {
     "emulators": {
       "auth": {
         "port": 9099
       },
       "firestore": {
         "port": 8080
       },
       "hosting": {
         "port": 5004
       },
       "storage": {
         "port": 9199
       },
       "ui": {
         "enabled": true,
         "port": 4002
       },
       "functions": {
         "port": 5001
       },
       "database": {
         "port": 9000
       }
     }
   }
   ```
2. Alternatively, update `.env.emulators` to match `firebase.json` ports
3. Create missing Firebase rules files:
   - `firebase/firestore.rules`
   - `firebase/storage.rules`
   - `firebase/database.rules.json`

### 2. E2E Test Fixes

1. Update Playwright configuration:

   ```typescript
   // playwright.config.ts
   export default defineConfig({
     // ...
     use: {
       baseURL: 'http://localhost:3003', // Update to match actual port
       // or use a dynamic solution
     },
     // ...
   });
   ```

2. Fix page title in `<head>` component or update test to match actual title
3. Review and fix test selectors:
   - Check why test IDs are not found: might be due to incorrect IDs or elements
     not rendered

### 3. Firebase Configuration

1. Create or update `.firebaserc`:

   ```json
   {
     "projects": {
       "default": "demo-metu-template"
     },
     "targets": {
       "demo-metu-template": {
         "hosting": {
           "production": ["demo-metu-template"],
           "staging": ["demo-metu-template-staging"]
         }
       }
     }
   }
   ```

2. Fix rules initialization:
   - Create proper skeleton rules files if missing

### 4. Next.js and React App Updates

1. Update page title to match E2E test expectations:
   - Look for title configuration in `layout.tsx` or meta components
   - Add "METU" to the title or update tests

## Implementation Steps

1. First, synchronize Firebase emulator configuration
2. Create missing Firebase files
3. Update Playwright configuration for correct port
4. Fix application title or update tests
5. Update element test IDs in application or tests
6. Configure Firebase deploy targets
7. Rerun tests to validate fixes

## Validation

After implementing fixes, validate by:

1. Running emulators with `pnpm emulators`
2. Running the app with `pnpm dev`
3. Running E2E tests with `pnpm test:e2e:quick`
4. Checking Firebase emulator UI at http://localhost:4002

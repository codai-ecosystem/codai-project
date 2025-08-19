# 🧪 Testing Directory

Consolidated testing artifacts and reports for the CODAI ecosystem.

## 📁 Directory Structure

### `/results/` - Test Results

- Test execution results and output files
- Moved from root `test-results/` folder
- Contains test runs, coverage reports, and execution logs

### `/reports/` - Test Reports

- Generated test reports and analysis
- Moved from root `playwright-report/` and similar
- HTML reports, screenshots, and detailed test analysis

## 📊 Test Artifact Organization

### Test Results (`/results/`)

- **Coverage Reports**: Code coverage analysis
- **Unit Test Results**: Jest/Vitest output
- **Integration Test Results**: API and service test results
- **Performance Test Results**: Load and performance metrics

### Test Reports (`/reports/`)

- **Playwright Reports**: E2E test reports with screenshots
- **Visual Regression Reports**: UI comparison results
- **Accessibility Reports**: A11y compliance test results
- **Security Test Reports**: Security scan results

## 🔧 Configuration Updates

Test runners may need path updates:

- `test-results/` → `testing/results/`
- `playwright-report/` → `testing/reports/`

Update your test configuration files accordingly.

# E2E Tests

This directory contains end-to-end tests for the METU Template application, organized by feature domains for better maintainability and faster execution.

## Test Organization

The tests are split into focused files by domain:

### Core Tests

- **`homepage.spec.ts`** - Homepage functionality and basic navigation
- **`auth.spec.ts`** - Authentication flows (login, register, password reset)
- **`dashboard.spec.ts`** - Protected routes and dashboard functionality

### Feature Tests

- **`theme.spec.ts`** - Dark/light mode and theme persistence
- **`i18n.spec.ts`** - Internationalization and language switching
- **`components.spec.ts`** - Component interactions and form validation
- **`responsive.spec.ts`** - Responsive design across viewports

### Quality Tests

- **`accessibility.spec.ts`** - WCAG compliance and keyboard navigation
- **`performance.spec.ts`** - Performance metrics and SEO
- **`pwa.spec.ts`** - Progressive Web App features

## Running Tests

### All Tests

```bash
pnpm test:e2e
```

### Individual Test Suites

```bash
# Quick smoke tests
pnpm test:e2e:quick

# Core functionality
pnpm test:e2e:homepage
pnpm test:e2e:auth
pnpm test:e2e:dashboard

# Features
pnpm test:e2e:theme
pnpm test:e2e:i18n
pnpm test:e2e:components
pnpm test:e2e:responsive

# Quality assurance
pnpm test:e2e:accessibility
pnpm test:e2e:performance
pnpm test:e2e:pwa
```

### Development Tools

```bash
# Interactive UI mode
pnpm test:e2e:ui

# Debug mode (step through tests)
pnpm test:e2e:debug
```

## Test Strategy

### Test Prioritization

1. **Critical Path** (`homepage`, `auth`) - Core user journeys
2. **Feature Complete** (`theme`, `i18n`, `components`) - Key features
3. **Quality Gates** (`accessibility`, `performance`) - Quality assurance
4. **Enhancement** (`responsive`, `pwa`) - Progressive enhancement

### Running During Development

- Run `test:e2e:quick` for rapid feedback during development
- Run specific feature tests when working on those areas
- Run full suite before commits and deployments

### CI/CD Integration

- **Pull Requests**: Run `test:e2e:quick` and affected test suites
- **Main Branch**: Run full test suite
- **Deployment**: Run critical path tests post-deployment

## Test Configuration

Tests are configured to:

- Run in parallel for faster execution
- Use multiple browsers (Chrome, Firefox, Safari)
- Test mobile and desktop viewports
- Generate HTML reports with screenshots and traces

## Debugging Failed Tests

1. **Check the HTML Report**: Generated after test runs with detailed information
2. **Use Debug Mode**: `pnpm test:e2e:debug` to step through tests
3. **Check Screenshots**: Automatically captured on failures
4. **Review Traces**: Playwright traces are available for failed tests

## Writing New Tests

When adding new tests:

1. Choose the appropriate test file based on the feature domain
2. Follow the existing naming conventions
3. Use descriptive test names that explain the expected behavior
4. Include proper setup and cleanup
5. Use page object patterns for complex interactions

## Common Issues and Solutions

### Timeouts

- Increase timeout for slow operations
- Use `waitFor` methods for dynamic content
- Check for proper element selectors

### Flaky Tests

- Add proper waits for dynamic content
- Use more specific selectors
- Avoid hardcoded delays

### Element Not Found

- Verify element selectors are correct
- Check if element is in viewport
- Ensure proper page load state

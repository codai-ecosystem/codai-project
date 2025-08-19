# Firebase Emulator and E2E Test Issues

## Description

During a thorough check of the project, several issues were identified with
Firebase emulator configuration and E2E tests. These issues are preventing
proper development workflow and test execution.

## Issues

- Firebase emulator port configuration mismatch between `.env.emulators` and
  `firebase.json`
- E2E tests failing due to:
  - Element selectors not found (timeout waiting for elements)
  - Page title mismatch (expected "METU", got "GangGPT - AI-Powered GTA V
    Roleplay")
- Port conflict with Playwright tests (configured for port 3000, app running
  on 3003)
- Missing or incorrect Firebase rules files causing runtime errors
- Firebase deploy target misconfiguration

## Action Items

1. [ ] Synchronize ports between `.env.emulators` and `firebase.json`
2. [ ] Create missing Firebase rules files
3. [ ] Update Playwright baseURL to use correct port
4. [ ] Fix application title or update tests to match actual title
5. [ ] Update element test IDs in application or tests
6. [ ] Configure Firebase deploy targets in `.firebaserc`
7. [ ] Rerun tests to validate fixes

## Additional Context

A detailed fix plan has been created in
`.github/plans/emulator-and-e2e-test-fixes.md` with all the necessary steps and
code changes to resolve these issues.

## Priority

High - These issues are blocking proper development and testing workflows.

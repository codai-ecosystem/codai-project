# METU Template Troubleshooting Guide

This guide addresses common issues you might encounter when working with the
METU Template.

## Table of Contents

- [Development Environment Issues](#development-environment-issues)
- [Firebase Emulator Issues](#firebase-emulator-issues)
- [Next.js Issues](#nextjs-issues)
- [TypeScript and Build Issues](#typescript-and-build-issues)
- [Testing Issues](#testing-issues)
- [Deployment Issues](#deployment-issues)

## Development Environment Issues

### Error: Cannot find module 'xyz'

**Problem**: Package dependencies are missing or corrupt.

**Solution**:

1. Delete node modules and reinstall:
   ```bash
   pnpm clean:deps
   pnpm install
   ```
2. Check that you're using the correct Node.js version (see `engines` field in
   `package.json`)

### Error: Port already in use

**Problem**: Another process is using the same port.

**Solution**:

1. Find the process using the port:
   - Windows: `netstat -ano | findstr :<PORT>`
   - Mac/Linux: `lsof -i :<PORT>`
2. Kill the process:
   - Windows: `taskkill /PID <PID> /F`
   - Mac/Linux: `kill -9 <PID>`
3. Or use different ports in `.env.local` files

## Firebase Emulator Issues

### Firebase emulators won't start

**Problem**: Firebase CLI config issues or port conflicts.

**Solution**:

1. Check if Java is installed (required for emulators)
2. Run `firebase init emulators` in the `apps/web` directory to reconfigure
3. Check for port conflicts in `firebase.json`

### Firebase Auth emulator not working with Next.js

**Problem**: Environment configuration not pointing to emulators.

**Solution**:

1. Ensure `.env.emulators` has `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true`
2. Verify emulator port matches in `firebase.json` and application code
3. Run `pnpm dev:reset` to reset the development environment

### Data in emulators is lost between sessions

**Problem**: Emulator data persistence not configured.

**Solution**:

1. Make sure you're starting emulators with the export flag:
   ```bash
   firebase emulators:start --import=./firebase/seed --export-on-exit=./firebase/seed
   ```
2. Or use the script `pnpm dev:firebase` which has this configuration

## Next.js Issues

### Next.js hot reload not working

**Problem**: Files not being watched correctly or cache issues.

**Solution**:

1. Restart the development server
2. Clear Next.js cache: `rm -rf .next`
3. Check for file watching limitations on your OS

### API routes return 500 errors

**Problem**: Server-side errors in API route handlers.

**Solution**:

1. Check server logs for error details
2. Verify environment variables are correctly set
3. Add proper error handling to API routes

## TypeScript and Build Issues

### TypeScript errors during build

**Problem**: Type mismatches or missing typings.

**Solution**:

1. Run `pnpm type-check` to find all errors
2. Add proper typings for untyped libraries
3. Fix any `any` types using the `pnpm ts:any-check` tool

### Build fails with module resolution errors

**Problem**: Path mapping or module import issues.

**Solution**:

1. Check `tsconfig.json` paths configuration
2. Ensure package versions are compatible
3. Rebuild the project: `pnpm clean && pnpm build`

## Testing Issues

### Jest tests fail with timeout errors

**Problem**: Tests taking too long or hanging.

**Solution**:

1. Increase test timeout in `jest.config.js`
2. Check for async operations that aren't properly resolved
3. Mock external services that might be causing delays

### Playwright tests fail with element not found

**Problem**: Test selectors not matching or timing issues.

**Solution**:

1. Add proper waitFor conditions before interactions
2. Update selectors to match current DOM structure
3. Check if components are conditionally rendered

## Deployment Issues

### Vercel deployment fails with environment variable errors

**Problem**: Missing required environment variables.

**Solution**:

1. Check all required variables are set in Vercel project settings
2. Verify variable naming matches exactly what the app expects
3. Make sure sensitive values are properly encrypted

### Firebase deployment permission issues

**Problem**: Insufficient permissions or authentication issues.

**Solution**:

1. Make sure you're logged in: `firebase login`
2. Verify you have proper permissions on the Firebase project
3. Check that the deployment target in `firebase.json` is correct

---

Still having issues? Please
[create an issue](https://github.com/your-org/metu-template/issues/new) with:

1. A clear description of the problem
2. Steps to reproduce
3. Expected vs actual behavior
4. Error messages and logs
5. Environment details (OS, Node.js version, etc.)

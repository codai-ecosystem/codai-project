# Publishing Guide for METU Template

This guide covers the steps to publish the METU template to NPM and make it
available via `npx create-metu@latest`.

## Prerequisites

- ✅ All validation tests pass (`pnpm validate`)
- ✅ Production build successful (`pnpm build`)
- ✅ Git repository clean (no uncommitted changes)
- ✅ NPM account with publishing permissions

## Publishing Steps

### 1. Version Management

```bash
# Check current version
npm version

# Update version (patch/minor/major)
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# Or use changesets (recommended)
pnpm changeset
pnpm version-packages
```

### 2. Final Validation

```bash
# Run complete validation suite
pnpm validate

# Test CLI tool locally
node bin/create-metu.js

# Test in clean directory
cd ../test-directory
npx ../metu-template/bin/create-metu.js test-project
```

### 3. Build and Test

```bash
# Clean build
pnpm clean
pnpm build

# Run all tests
pnpm test
pnpm test:e2e

# Bundle analysis
pnpm analyze
```

### 4. Git Preparation

```bash
# Ensure all changes are committed
git status
git add .
git commit -m "feat: prepare v1.0.0 release"

# Create and push tag
git tag v1.0.0
git push origin main --tags
```

### 5. NPM Publishing

```bash
# Login to NPM (if not already)
npm login

# Dry run (optional)
npm publish --dry-run

# Publish to NPM
npm publish

# Or use pnpm
pnpm publish
```

### 6. Verify Publication

```bash
# Check package on NPM
npm view create-metu

# Test installation from NPM
npx create-metu@latest my-test-project
```

## Post-Publishing

### 1. Update Documentation

- Update README.md with new version
- Update CHANGELOG.md
- Update GitHub releases

### 2. Social Announcement

- Tweet about the release
- Post on relevant forums/communities
- Update personal/company websites

### 3. Monitor Usage

- Check NPM download statistics
- Monitor GitHub issues
- Collect user feedback

## Troubleshooting

### Common Issues

**Publishing Failed - Permission Denied**

```bash
npm login
npm whoami  # verify login
```

**Version Already Exists**

```bash
npm version patch  # increment version
```

**Build Failures**

```bash
pnpm clean
pnpm install
pnpm build
```

**CLI Tool Not Working**

```bash
# Check bin field in package.json
# Ensure create-metu.js has execute permissions
chmod +x bin/create-metu.js
```

### Rollback

If issues are discovered after publishing:

```bash
# Unpublish (within 24 hours)
npm unpublish create-metu@1.0.0

# Or deprecate
npm deprecate create-metu@1.0.0 "This version has issues, use latest"
```

## Automation

### GitHub Actions

The project includes automated publishing via GitHub Actions:

1. Push to main triggers tests
2. Creating a release tag triggers publishing
3. Failed tests prevent publishing

### Release Process

```bash
# Automated release with changesets
pnpm changeset
git add .
git commit -m "chore: release"
git push

# Manual release
pnpm release
```

## Security

### Package Security

- ✅ No sensitive data in published package
- ✅ Dependencies regularly updated
- ✅ Security audit passed
- ✅ Environment variables properly handled

### NPM Security

- Use 2FA on NPM account
- Regularly rotate access tokens
- Monitor package for unauthorized changes
- Use `npm audit` regularly

## Support

After publishing, maintain the package by:

1. Responding to GitHub issues
2. Regular dependency updates
3. Security patches
4. Feature requests evaluation
5. Community engagement

---

**Ready to publish?** Run `pnpm validate` one final time and follow the steps
above!

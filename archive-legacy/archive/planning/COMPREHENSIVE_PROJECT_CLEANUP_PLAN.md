# 🧹 Comprehensive Project Cleanup Plan

**Generated**: July 3, 2025  
**Status**: Analysis Complete - Ready for Implementation  
**Agent**: Codai Orchestrator  

## 📊 Current Project Reality Check

### Major Issues Discovered
1. **Dependency Chaos**: 62 unmet workspace dependencies causing build failures
2. **Unused Dependencies**: 14 production + 12 dev dependencies unused at root level
3. **Missing Dependencies**: 6 critical dependencies missing for functionality
4. **Extraneous Packages**: 15+ packages installed but not declared
5. **Archive Bloat**: Multiple report files and outdated scripts accumulated
6. **Configuration Drift**: Inconsistent configurations across apps/services

### Root Cause Analysis
- Package.json incorrectly lists all apps/services as dependencies instead of workspace references
- UI dependencies declared at root but only used in individual apps
- Multiple cleanup attempts have created dependency conflicts
- Workspace structure not properly configured for monorepo
- Build artifacts and temporary files accumulated over time

## 🎯 Cleanup Strategy

### Phase 1: Package.json Restructuring ⚡ CRITICAL
**Objective**: Fix workspace dependency structure to enable basic functionality

#### Actions:
1. **Remove Invalid Workspace Dependencies**
   - Remove all app references: `@codai/bancai`, `@codai/codai`, etc.
   - Remove all service references: `admin`, `AIDE`, `ajutai`, etc.
   - Keep only legitimate package references from `/packages` folder

2. **Clean Root Dependencies**
   - Move UI dependencies to appropriate apps (React, Radix UI, Heroicons)
   - Keep only orchestration-level dependencies (chalk, commander, turbo)
   - Remove unused database connections (postgres) from root

3. **Fix Missing Dependencies**
   - Add `@eslint/js` and `@eslint/eslintrc` for ESLint configuration
   - Add missing testing dependencies if tests exist at root level
   - Add any missing build dependencies

### Phase 2: File System Cleanup 🗂️
**Objective**: Remove unused files and organize project structure

#### Actions:
1. **Archive Legacy Reports**
   - Move all `.md` reports to `archive/reports/2025-07/`
   - Keep only `README.md`, `CURRENT_STATUS.md`, and `ARCHITECTURE.md`

2. **Clean Root Directory**
   - Remove test files from root (`test-*.cjs`)
   - Remove outdated orchestrator files (`orchestrator*.cjs`)
   - Remove one-off fix scripts (`fix-*.js`, `fix-*.cjs`)

3. **Optimize Scripts Directory**
   - Archive scripts older than 30 days
   - Remove duplicated functionality scripts
   - Keep only core orchestration scripts

### Phase 3: Dependency Optimization 📦
**Objective**: Minimize dependencies and resolve conflicts

#### Actions:
1. **Remove Genuinely Unused Dependencies**
   - `react-dom`, `class-variance-authority` (move to apps)
   - `@heroicons/react`, `lucide-react` (move to apps)
   - `@radix-ui/*` components (move to apps)
   - `tailwind-merge`, `clsx` (move to apps)

2. **Optimize Dev Dependencies**
   - Remove unused testing libs if no root tests
   - Keep build tools only if used at workspace level
   - Consolidate ESLint and TypeScript configs

3. **Fix Extraneous Packages**
   - Remove unlisted packages causing npm warnings
   - Update `.pnpmrc` to prevent future issues

### Phase 4: Configuration Standardization ⚙️
**Objective**: Ensure consistent configuration across workspace

#### Actions:
1. **Workspace Configuration**
   - Fix `pnpm-workspace.yaml` to properly include all workspaces
   - Ensure consistent package.json structure across apps/services
   - Standardize port allocations per projects.index.json

2. **Build Configuration**
   - Optimize `turbo.json` for actual project structure
   - Remove unused build targets
   - Ensure proper dependency chains

3. **Development Environment**
   - Update VS Code tasks to match actual scripts
   - Fix any broken development shortcuts
   - Ensure proper environment variable handling

### Phase 5: Quality Assurance 🧪
**Objective**: Validate cleanup success and prevent regression

#### Actions:
1. **Dependency Validation**
   - Run `pnpm install` successfully
   - Verify no unmet dependencies
   - Test build process works

2. **Functionality Testing**
   - Verify workspace commands work
   - Test app development servers
   - Validate service orchestration

3. **Documentation Update**
   - Update README with clean instructions
   - Document any breaking changes
   - Create maintenance guidelines

## 🚀 Implementation Priority

### Immediate (Today)
- [ ] Fix package.json workspace dependencies
- [ ] Remove unmet dependency errors
- [ ] Archive legacy report files

### Short Term (This Week)
- [ ] Complete dependency optimization
- [ ] Clean up scripts directory
- [ ] Update build configurations

### Medium Term (Next Week)
- [ ] Validate all apps/services functionality
- [ ] Implement quality gates
- [ ] Create maintenance automation

## 📈 Success Metrics

### Technical Metrics
- ✅ Zero unmet dependencies
- ✅ Sub-30 second `pnpm install`
- ✅ All VS Code tasks functional
- ✅ Build process under 5 minutes
- ✅ Root directory under 25 files

### Quality Metrics
- ✅ No unused dependencies detected by depcheck
- ✅ All apps start successfully
- ✅ Workspace integrity validated
- ✅ No extraneous packages
- ✅ Consistent configuration patterns

## 🛡️ Risk Mitigation

### Backup Strategy
- Create `package.json.backup` before changes
- Archive all removed files for recovery
- Document all configuration changes

### Rollback Plan
- Keep archive of all removed scripts
- Maintain previous workspace configuration
- Test each phase before proceeding

### Validation Gates
- Run dependency check after each phase
- Test basic functionality before continuing
- Validate with actual development workflow

## 🔄 Maintenance Strategy

### Prevention
- Add pre-commit hooks for dependency validation
- Implement automated cleanup scripts
- Monitor for configuration drift

### Regular Cleanup
- Monthly dependency audit
- Quarterly script directory review
- Bi-annual architecture review

## 💡 Improvement Opportunities

### Architecture Enhancements
1. **Proper Workspace Structure**: Implement true monorepo patterns
2. **Dependency Management**: Use workspace protocols for internal deps
3. **Build Optimization**: Implement incremental builds with Turbo
4. **Development Experience**: Streamline local development workflow

### Automation Opportunities
1. **Automated Dependency Updates**: Keep packages current
2. **Configuration Drift Detection**: Monitor consistency
3. **Performance Monitoring**: Track build and startup times
4. **Quality Gates**: Prevent regression introduction

---

**Next Action**: Begin Phase 1 - Package.json Restructuring
**Estimated Effort**: 2-3 hours for complete cleanup
**Risk Level**: Low (with proper backups)
**Impact**: High (enables all other functionality)

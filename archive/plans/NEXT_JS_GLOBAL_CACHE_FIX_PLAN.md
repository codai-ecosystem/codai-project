# 🔧 Next.js Global Cache Resolution Plan

## Current Status (August 2, 2025 - 7:03 AM)

### ✅ Completed Successfully

- **Next.js Version Standardization**: All 6 core services updated to Next.js 15.4.5 in package.json
- **Dependency Installation**: pnpm install completed with 15.4.5 locally installed in CODAI
- **eslint-config-next**: Updated to 15.4.5 across all services for consistency

### ❌ Critical Issues Identified

- **Global Cache Conflict**: CODAI service running Next.js 15.3.5 from global pnpm cache instead of local 15.4.5
- **Build Manifest Missing**: fallback-build-manifest.json not found in .next directory
- **Module Resolution Failure**: Module paths pointing to global cache instead of local node_modules
- **Service Health**: CODAI /health endpoint returning 500 errors due to build manifest issues

### 🔍 Root Cause Analysis

1. **Global PNPM Cache Priority**: Global cache taking precedence over local dependencies
2. **Version Mismatch**: Runtime version (15.3.5) != installed version (15.4.5)
3. **Build State Corruption**: .next directory in invalid state due to version conflicts
4. **Module Resolution Path**: Next.js resolving to global pnpm store instead of workspace

## 🚀 Systematic Resolution Strategy

### Phase 1: Global Cache Clearing

```powershell
# Clear all global pnpm caches
pnpm store prune
pnpm cache clear
```

### Phase 2: Workspace-Level Dependency Reset

```powershell
# Root workspace level
cd e:\GitHub\codai-project
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force pnpm-lock.yaml -ErrorAction SilentlyContinue
pnpm install --frozen-lockfile=false
```

### Phase 3: Service-Specific Build Reset

```powershell
# Each failing service
cd e:\GitHub\codai-project\apps\codai
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
pnpm install --no-global
```

### Phase 4: Build System Verification

```powershell
# Verify Next.js version resolution
cd e:\GitHub\codai-project\apps\codai
pnpm list next
pnpm dev --dry-run
```

## 🎯 Expected Outcomes

### Success Criteria

- [ ] CODAI service reports Next.js 15.4.5 at startup
- [ ] Build manifest generated successfully in .next directory
- [ ] Module resolution points to local node_modules
- [ ] /health endpoint returns 200 status
- [ ] No global cache path references in error logs

### Verification Commands

```powershell
# Version verification
curl http://localhost:4001/health

# Service status check
pnpm run health-check
```

## 📊 Service Status Matrix

| Service | Package.json | Runtime Version | Status | Health Endpoint |
| ------- | ------------ | --------------- | ------ | --------------- |
| CODAI   | 15.4.5 ✅    | 15.3.5 ❌       | FAIL   | 500 ❌          |
| MemorAI | 15.4.5 ✅    | TBD             | TBD    | TBD             |
| Admin   | 15.4.5 ✅    | TBD             | TBD    | TBD             |
| ID      | 15.4.5 ✅    | Running ✅      | OK     | 200 ✅          |
| BancAI  | 15.4.5 ✅    | Running ✅      | OK     | 200 ✅          |
| Hub     | 15.4.5 ✅    | Running ✅      | OK     | 200 ✅          |

## 🔄 Implementation Timeline

### Immediate (Next 15 minutes)

1. Clear global pnpm cache and store
2. Reset workspace dependencies from root
3. Rebuild CODAI with proper version resolution
4. Test CODAI service startup and health endpoint

### Short-term (Next 30 minutes)

1. Apply same fix to MemorAI and Admin services
2. Verify all 6 services running with correct Next.js versions
3. Update service status matrix
4. Document successful resolution steps

### Long-term (Next session)

1. Create automated cache clearing script
2. Add version verification to startup tasks
3. Document best practices for version management
4. Set up monitoring for version drift

## 📝 Notes for Future Reference

### Global Cache Issues Prevention

- Use `--no-global` flag for workspace dependencies
- Regular `pnpm store prune` in development
- Version lock files commitment to prevent drift
- Workspace-specific .npmrc configuration

### Debugging Commands

```powershell
# Cache inspection
pnpm store path
pnpm store status

# Version resolution
pnpm list --depth=0
pnpm why next

# Build debugging
NODE_OPTIONS="--inspect" pnpm dev
```

This systematic approach should resolve the Next.js global cache conflicts and restore proper service functionality.

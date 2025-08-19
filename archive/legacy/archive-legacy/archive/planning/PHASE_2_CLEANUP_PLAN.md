# PHASE 2 CLEANUP EXECUTION PLAN

## Overview
Phase 2 focuses on file system cleanup, removing outdated reports, test scripts, and temporary files while preserving functionality.

## Categories for Cleanup

### 1. Temporary & Log Files (Safe to Remove)
- Build artifacts: `.turbo/`, `.next/`, build logs
- Temporary files: `temp/` directory contents
- Log files: Various `.log` files throughout project
- Cache files: Compiler/build caches

### 2. Outdated Report Files (Archive/Remove)
- 60+ various completion reports and status files
- Duplicate planning documents
- Outdated execution plans
- Phase completion reports from previous iterations

### 3. Legacy Test & Fix Scripts (Review/Archive)
- 50+ test-* scripts that may be outdated
- 80+ fix-* scripts for specific issues
- Orchestrator variants (keep latest)
- Brutal reality check scripts

### 4. Deprecated Native Dependencies (Remove)
- bignum@0.6.1 - deprecated, build failing
- sha3@1.0.0 - deprecated, build failing  
- buffertools@2.1.6 - deprecated, build failing

## Execution Strategy

### Step 1: Clean Temporary Files
```bash
# Remove build artifacts and logs
Remove-Item -Recurse -Force .\.turbo, .\.next, .\temp\*
Remove-Item *.log, **/*.log (excluding node_modules)
```

### Step 2: Archive Outdated Reports
```bash
# Move reports to consolidated archive
Create archive/reports/phase2-cleanup/
Move outdated reports maintaining history
```

### Step 3: Clean Legacy Scripts  
```bash
# Archive old fix and test scripts
Move to scripts/archive/legacy/
Keep only current functional scripts
```

### Step 4: Remove Deprecated Dependencies
```bash
# Find and remove packages using deprecated natives
# Replace with modern alternatives where needed
```

## Files Identified for Action

### Log Files (Delete)
- dash_transformation_status.log (102 bytes)
- apps/codai/build-error.log (1,233 bytes)
- apps/memorai/apps/api/logs/* (multiple files)
- Various .turbo build logs

### Report Files (Archive)
- BANCAI_90_PERCENT_COMPLETION_REPORT.md
- CODAI_ECOSYSTEM_COMPLETION_PLAN.md
- COMPREHENSIVE_EXECUTION_PLAN.md
- FINAL_VERIFICATION_REPORT.md
- And 50+ similar files

### Legacy Scripts (Review/Archive)
- brutal-reality-check.js
- fix-and-start.js
- test-*-demo.cjs files
- orchestrator-*.cjs variants
- ultimate-* scripts

## Safety Measures
- Create backups before deletion
- Test workspace functionality after each step
- Maintain git history through proper archiving
- Preserve any scripts referenced in package.json

## Success Criteria
- Reduced file count by 200+ files
- Cleaner project structure
- Maintained functionality
- Improved build performance
- Better developer experience

## Risk Assessment
- Low risk: Temporary files, logs, build artifacts
- Medium risk: Old reports (archive first)
- High risk: Scripts in use (careful review needed)

## Validation Steps
1. Run `pnpm run status` after each cleanup step
2. Verify key scripts still function
3. Check build process remains intact
4. Confirm no broken references

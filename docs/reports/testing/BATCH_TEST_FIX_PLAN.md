# 🔧 Batch Test Fix Plan

## Current Service Status
❌ All CODAI services are offline (ports 4000-4005)
✅ Test infrastructure is ready with enhanced service status handling

## Batch Fix Strategy

### Phase 1: Gateway Service (Foundation)
**Target**: Get Gateway service running and fix gateway-related tests
**Service**: Gateway (port 4000)
**Command to start**: 
```bash
cd apps/gateway
pnpm dev
```
**Tests to fix**: ~20 tests related to service discovery and gateway functionality

### Phase 2: Admin Service (Core Infrastructure)
**Target**: Get Admin service running and fix admin-related tests  
**Service**: Admin (port 4002)
**Command to start**:
```bash
cd apps/admin
pnpm dev
```
**Tests to fix**: ~30 tests related to admin APIs and health endpoints

### Phase 3: Hub Service (Communication Hub)
**Target**: Get Hub service running and fix hub-related tests
**Service**: Hub (port 4003)  
**Command to start**:
```bash
cd apps/hub
pnpm dev
```
**Tests to fix**: ~25 tests related to hub APIs and navigation

### Phase 4: ID Service (Authentication)
**Target**: Fix ID service API endpoints (service runs but APIs return 500)
**Service**: ID (port 4004) - Already partially working
**Command to start** (if needed):
```bash
cd apps/id
pnpm dev
```
**Tests to fix**: ~50 tests related to authentication and OAuth2

### Phase 5: CODAI Service (Main Application)
**Target**: Get CODAI service running properly
**Service**: CODAI (port 4001)
**Command to start**:
```bash
cd apps/codai
pnpm dev
```
**Tests to fix**: ~35 tests related to main application functionality

### Phase 6: BancAI Service (Optional)
**Target**: Complete BancAI installation and startup
**Service**: BancAI (port 4005)
**Command to start**:
```bash
cd apps/bancai
pnpm install
pnpm dev
```
**Tests to fix**: ~15 tests related to BancAI functionality

## Test Execution Strategy

For each phase:
1. Start the required service(s)
2. Run targeted tests for that service only
3. Fix any service-specific issues
4. Verify tests pass before moving to next phase
5. Keep service running for integration testing

## Targeted Test Commands

### Run tests for specific services:
```bash
# Gateway tests
npx playwright test --grep "gateway|Gateway|Service Discovery"

# Admin tests  
npx playwright test --grep "admin|Admin|ADMIN"

# Hub tests
npx playwright test --grep "hub|Hub|HUB"

# ID tests
npx playwright test --grep "id|ID|auth|Auth|OAuth"

# CODAI tests
npx playwright test --grep "codai|CODAI"

# BancAI tests
npx playwright test --grep "bancai|BancAI|BANCAI"
```

## Current Priority: Phase 1 - Gateway Service

The Gateway service is the foundation that routes requests to other services. Starting with this will establish the basic infrastructure needed for other services to work properly.

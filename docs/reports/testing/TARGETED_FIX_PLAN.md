# 🎯 Targeted Service Fix Plan - Phase 7

## 📊 Current Status: 74.6% Test Success Rate (402/539 tests PASSED)

**Achievement**: Major milestone reached with comprehensive test coverage and 4/6 services operational.

---

## 🔧 Critical Fixes Required

### 1. Priority 1: ID Service Backend API Integration
**Issue**: Authentication APIs returning 500 errors
**Impact**: 10 test failures across all browsers
**Root Cause**: Backend API not properly connected/configured

**Fix Strategy**:
```bash
# Check ID service API routing
npx next dev --port 4004 --turbo
```

**Target Files**:
- `apps/id/src/pages/api/auth/validate.ts`
- `apps/id/src/pages/api/oauth2/*`
- `apps/id/next.config.js` (API routing configuration)

### 2. Priority 2: Gateway Service Routing
**Issue**: 404 responses from Gateway on port 4000
**Impact**: Service discovery and routing not working
**Root Cause**: Express proxy middleware configuration

**Fix Strategy**:
```bash
# Check Gateway proxy configuration
cd apps/gateway
npm run dev
```

**Target Files**:
- `apps/gateway/src/api-gateway.ts`
- `apps/gateway/package.json`
- Gateway middleware configuration

### 3. Priority 3: BancAI Service Internal Errors
**Issue**: 500 internal server errors
**Impact**: Service marked as degraded
**Root Cause**: Backend dependency or configuration issue

**Fix Strategy**:
```bash
# Debug BancAI service
cd apps/bancai
npm run dev --port 4005
```

---

## 🎯 Targeted Commands (Run individually)

### Phase 7A: ID Service Backend Fix
```bash
# Start ID service with debug logging
cd apps/id
npm run dev -- --port 4004

# Check API routes exist
ls -la src/pages/api/auth/
ls -la src/pages/api/oauth2/
```

### Phase 7B: Gateway Service Fix
```bash
# Start Gateway with debug
cd apps/gateway
npm run dev -- --port 4000

# Check proxy configuration
cat src/api-gateway.ts | grep -A 10 "proxy"
```

### Phase 7C: BancAI Service Debug
```bash
# Start BancAI with error logging
cd apps/bancai
npm run dev -- --port 4005

# Check for missing dependencies
npm ls --depth=0
```

---

## 🧪 Validation Strategy

After each fix, run targeted tests:

```bash
# Test specific service APIs
npx playwright test tests/e2e/comprehensive-coverage.spec.ts -g "ID Service Authentication APIs" --headed

# Test Gateway routing
npx playwright test tests/e2e/comprehensive-coverage.spec.ts -g "Infrastructure & Service Health" --headed

# Test BancAI functionality
npx playwright test tests/e2e/comprehensive-coverage.spec.ts -g "BANCAI" --headed
```

---

## 📈 Success Criteria

- **Target**: 90%+ test pass rate (485+ tests passing)
- **ID Service**: All authentication APIs return < 500 status
- **Gateway**: Proper proxy routing to backend services
- **BancAI**: 200 OK responses for health endpoints

---

## 🎯 Expected Outcomes

1. **ID Authentication APIs**: Fix 10 failing tests
2. **Gateway Routing**: Enable proper service discovery
3. **BancAI Service**: Move from degraded to operational
4. **Overall**: Achieve 90%+ comprehensive test success rate

---

## 📋 Next Actions

1. **Start with ID service** (highest impact - fixes 10 tests)
2. **Then Gateway** (enables service ecosystem)
3. **Finally BancAI** (completes service health)
4. **Re-run comprehensive tests** to validate improvements

This targeted approach focuses on the specific issues preventing 100% test success while building on our 74.6% achievement baseline.

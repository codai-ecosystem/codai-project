# CODAI Naming Pattern Consolidation Plan
## Microsoft-Compliant File Naming Strategy

### Current Issues Identified:
- **simple-** prefix files suggesting basic versions instead of feature names
- **advanced-** prefix files suggesting complex versions instead of capabilities  
- Multiple gateway implementations with unclear purposes
- Test files with vague naming conventions

### Renaming Strategy:

#### 1. Gateway Services Consolidation
**Current Files:**
- `apps/gateway/src/simple-gateway.js`
- `apps/gateway/src/simple-gateway.ts` 
- `apps/gateway/src/archived/simple-gateway.ts`

**Microsoft Pattern:** 
- `apps/gateway/src/core-gateway.ts` (main implementation)
- `apps/gateway/src/archived/legacy-gateway.ts` (archived version)

#### 2. Authentication Services
**Current:**
- `apps/id/src/services/simple-auth.ts`

**Microsoft Pattern:**
- `apps/id/src/services/core-auth.ts` or `apps/id/src/services/identity-auth.ts`

#### 3. Health Check Services
**Current:**
- `apps/id/simple-health.js`
- `apps/codai/simple-health.js`

**Microsoft Pattern:**
- `apps/id/health.js` (standard naming)
- `apps/codai/health.js` (standard naming)

#### 4. Component Naming
**Current:**
- `apps/memorai/src/components/simple-charts.tsx`
- `apps/romai/src/components/simple-training-dashboard.tsx`

**Microsoft Pattern:**
- `apps/memorai/src/components/analytics-charts.tsx`
- `apps/romai/src/components/training-dashboard.tsx`

#### 5. Test File Standardization
**Current:**
- `apps/codai/__tests__/simple.test.ts`
- `apps/codai/__tests__/simple-hook.test.tsx`
- `apps/codai/__tests__/simple-hook-test.tsx`

**Microsoft Pattern:**
- `apps/codai/__tests__/core.test.ts`
- `apps/codai/__tests__/hooks.test.tsx` (consolidated)

### Implementation Priority:
1. **High Priority:** Gateway and auth services (infrastructure)
2. **Medium Priority:** Components and UI elements  
3. **Low Priority:** Test files and documentation

### Microsoft Naming Principles Applied:
- **Feature-based naming** instead of complexity indicators
- **Clear purpose indication** in filename
- **Consistent patterns** across similar file types
- **Standard conventions** for common patterns (health, auth, core)
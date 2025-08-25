# 🧹 File Naming Consolidation Plan

Based on **Microsoft Best Practices** and analysis of current codebase, this plan addresses file naming inconsistencies and consolidates redundant "advanced" and "simple" naming patterns.

## 📋 Current Issues Identified

### 1. **Express.js Service Files** - Redundant "Simple" Prefix
**Problem**: Multiple service files with "simple-" prefix when they should be the main service implementation.

Current files:
- `apps/bancai/simple-bancai-service.js` → Main BancAI service implementation
- `apps/hub/simple-hub-service.js` → Main Hub service implementation  
- `apps/id/simple-id-service.js` → Main ID service implementation

**Recommended Action**: Rename to standard service naming
- `apps/bancai/simple-bancai-service.js` → `apps/bancai/bancai.service.js`
- `apps/hub/simple-hub-service.js` → `apps/hub/hub.service.js`
- `apps/id/simple-id-service.js` → `apps/id/id.service.js`

### 2. **MemorAI MCP Package** - Multiple Server Implementations
**Problem**: Confusion between "advanced" and main server implementations.

Current files:
- `memorai-advanced-server.cjs` (3,513 lines) - Enterprise features
- `memorai-mcp-server.cjs` (1,220 lines) - Standard implementation
- `simple-http-server.cjs` - HTTP server variant
- `simple-test.cjs` - Simple test suite

**Recommended Action**: Establish clear naming hierarchy
- `memorai-mcp-server.cjs` → `memorai-mcp.server.js` (main production server)
- `memorai-advanced-server.cjs` → `memorai-mcp.enterprise.js` (enterprise features)
- `simple-http-server.cjs` → `memorai-mcp.http.js` (HTTP transport)
- `simple-test.cjs` → `memorai-mcp.test.js` (test suite)

### 3. **Test Files** - Inconsistent "Advanced" Prefix
**Problem**: Test files with "advanced" prefix creating confusion.

Current files:
- `test-advanced-memorai.cjs`
- `test-advanced-server.cjs`
- `validate-advanced-server.js`

**Recommended Action**: Use feature-based naming
- `test-advanced-memorai.cjs` → `memorai-mcp.enterprise.test.js`
- `test-advanced-server.cjs` → `memorai-mcp.server.test.js`
- `validate-advanced-server.js` → `memorai-mcp.validation.js`

## 🎯 Microsoft Naming Best Practices Applied

### **File Naming Convention**
Based on Microsoft AL/Business Central guidelines:
- `<ComponentName>.<TypeName>.<extension>`
- Use PascalCase for component names
- Use descriptive type names (service, test, config, etc.)
- Avoid ambiguous prefixes like "simple" or "advanced"

### **Proposed Standard**
```
<ServiceName>.<TypeName>.js
```

Examples:
- `BancAI.Service.js` - Main service
- `BancAI.Enterprise.js` - Enterprise features
- `BancAI.Test.js` - Test suite
- `BancAI.Config.js` - Configuration

## 📁 Directory Structure Improvements

### **Before** (Current)
```
apps/bancai/
├── simple-bancai-service.js
├── demo-cnd-bancai-service.js
├── server.js
└── simple-health.cjs

packages/memorai-mcp/
├── memorai-advanced-server.cjs
├── memorai-mcp-server.cjs
├── simple-http-server.cjs
└── test-advanced-memorai.cjs
```

### **After** (Recommended)
```
apps/bancai/
├── bancai.service.js          # Main service (renamed from simple-*)
├── bancai.demo.js             # Demo/CND service (renamed from demo-cnd-*)
├── bancai.server.js           # Next.js server (renamed from server.js)
└── bancai.health.js           # Health checks (renamed from simple-health.cjs)

packages/memorai-mcp/
├── memorai-mcp.server.js      # Main production server
├── memorai-mcp.enterprise.js  # Enterprise features (from advanced)
├── memorai-mcp.http.js        # HTTP transport (from simple-http)
└── memorai-mcp.test.js        # Test suite (from test-advanced)
```

## 🔍 Archived/Legacy Test Exclusions

### **Test Directories to Exclude**
Based on comprehensive audit, exclude these patterns from test runs:
- `archive/` directories (multiple levels)
- `backup/` and `backups/` directories
- `legacy/` and `legacy-duplicates/` directories
- `_archive/` directories
- `node_modules/` test directories
- `deprecated/` directories
- `.pytest_cache/` directories
- `**/archived_tests/` directories

### **Vitest Configuration Update**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    exclude: [
      'node_modules/**',
      'archive/**',
      'backup/**',
      'backups/**',
      'legacy/**',
      'legacy-duplicates/**',
      '_archive/**',
      '**/archived/**',
      '**/deprecated/**',
      '**/backup/**',
      '**/legacy/**',
      '**/.pytest_cache/**',
      '**/archived_tests/**',
      // Existing exclusions...
    ]
  }
})
```

## 🎯 Implementation Priority

### **Phase 1: Critical Service Files** (High Priority)
1. Rename main Express.js service files
2. Update Docker configurations
3. Update VS Code tasks
4. Update documentation

### **Phase 2: MCP Package Consolidation** (Medium Priority)
1. Rename MemorAI MCP server files
2. Update package.json scripts
3. Update deployment configurations
4. Update test references

### **Phase 3: Test Configuration** (Medium Priority)
1. Update vitest.config.ts exclusions
2. Validate test discovery
3. Run comprehensive test suite
4. Update CI/CD configurations

## 🔧 Impact Analysis

### **Files Requiring Updates**
- Docker Compose files
- VS Code tasks.json
- Package.json scripts
- GitHub Actions workflows
- Kubernetes manifests
- Documentation files

### **Risk Mitigation**
- Create backup of current files
- Update references in phases
- Test each phase thoroughly
- Maintain backward compatibility where needed

## ✅ Success Criteria
1. **Clear naming**: No ambiguous "simple" or "advanced" prefixes
2. **Consistent structure**: All services follow same naming pattern
3. **Microsoft compliance**: Adheres to Microsoft naming best practices
4. **Test coverage**: Only active tests run, archived tests excluded
5. **Documentation**: All references updated and documented

## 📋 Next Steps
1. Get approval for naming convention changes
2. Create migration scripts for file renames
3. Update all references and dependencies
4. Execute phased implementation
5. Validate functionality after each phase
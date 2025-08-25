# MemorAI MCP Server - File Consolidation Plan

## Current Problem Analysis

### Redundant Server Files Identified:
- `src/advanced-mcp-server.ts` (547 lines) - CURRENT PRODUCTION (used in tests)
- `src/server.ts` (488 lines) - Legacy server
- `src/modern-server.ts` (890 lines) - Alternative implementation 
- `src/modern-server-compliant.ts` - Duplicate
- `src/advanced-server.ts` - Another variation
- Multiple archive files with similar names

### Archive Directories with Outdated Code:
- `archive/` - 20+ old server files
- `memorai-mcp-backup/` - Backup files
- `memorai-backups/` - Another backup location
- `phase8/` - Development phases

### Test File Naming Issues:
- `server-simple.test.ts` vs `comprehensive-server.test.ts` vs `advanced-coverage.test.ts`
- Multiple archived test files causing confusion

## Microsoft Clean Architecture Best Practices Applied:

Based on Microsoft documentation analysis:

### 1. Clear Naming Convention:
- Remove technical prefixes (advanced-, simple-, modern-)
- Use domain-driven names that describe business purpose
- Follow consistent kebab-case for files

### 2. Clean Architecture Principles:
- Single responsibility per file
- Clear separation of concerns
- Proper dependency injection
- Domain-driven organization

## Consolidation Plan:

### Phase 1: Core Server Consolidation
1. **Rename `advanced-mcp-server.ts` → `mcp-server.ts`** (single production server)
2. **Archive all redundant servers** (server.ts, modern-server.ts, etc.)
3. **Update all imports and references**

### Phase 2: Test Suite Consolidation  
1. **Rename test files with clear purpose:**
   - `server-simple.test.ts` → `mcp-server.unit.test.ts`
   - `comprehensive-server.test.ts` → `mcp-server.integration.test.ts`
   - `advanced-coverage.test.ts` → `mcp-server.coverage.test.ts`
   - `memorai-focused.test.ts` → `mcp-server.core.test.ts`
   - `memory-tools-unit.test.ts` → `memory-tools.test.ts`

### Phase 3: Clean Directory Structure
```
src/
├── mcp-server.ts (single production server)
├── ai-integration.ts (renamed from advanced-ai-integration.ts)
├── memory/ (memory management domain)
├── tools/ (MCP tools)
├── transport/ (communication layer)
├── config/ (configuration)
└── __tests__/
    ├── mcp-server.unit.test.ts
    ├── mcp-server.integration.test.ts  
    ├── mcp-server.coverage.test.ts
    ├── mcp-server.core.test.ts
    └── memory-tools.test.ts
```

### Phase 4: Archive Cleanup
1. **Remove redundant archive directories**
2. **Keep single `archive/` directory for historical reference**
3. **Update .gitignore to prevent future clutter**

## Implementation Priority:
1. Core server consolidation (HIGH)
2. Test file reorganization (MEDIUM) 
3. Directory cleanup (LOW)

This approach follows Microsoft's Clean Architecture principles while maintaining all current functionality and improving maintainability.
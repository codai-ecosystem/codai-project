# MemoraiMCP Tool Naming Fix - Implementation Plan

## 🔍 Issue Identified and Fixed

### Root Cause

The local MCP server implementation in `apps/memorai/mcp-server.cjs` was incorrectly naming tools with the full `mcp_memoraimcp_` prefix, causing double-prefixing issues.

### Fix Applied

✅ **Updated tool names in mcp-server.cjs:**

- `mcp_memoraimcp_remember` → `remember`
- `mcp_memoraimcp_recall` → `recall`
- `mcp_memoraimcp_forget` → `forget`
- `mcp_memoraimcp_context` → `context`
- Added `search_keys` tool with proper implementation

### MCP Standard Compliance

- **Server defines**: `remember`, `recall`, `forget`
- **VS Code calls**: `mcp_memoraimcp_remember`, `mcp_memoraimcp_recall`, `mcp_memoraimcp_forget`

## ✅ Current Status

### Fixed Files

1. `apps/memorai/mcp-server.cjs` - Tool naming corrected
2. `apps/memorai/cbd-mcp-server.ts` - Already correct (uses proper naming)

### Configuration Status

- MCP configuration in VS Code points to published package: `@codai/memorai-mcp@latest`
- Environment variables properly configured
- Data directory exists and accessible

## 🚀 Next Steps

### 1. Test the Fixed Implementation

```bash
# Test local server directly
cd apps/memorai
node mcp-server.cjs

# Test published package
npx @codai/memorai-mcp@latest
```

### 2. Update Published Package

Need to ensure the published package `@codai/memorai-mcp` uses the corrected implementation:

- Verify package source code matches fixed implementation
- If needed, republish with correct tool naming
- Update version if breaking changes made

### 3. Verification Steps

- [ ] Test `mcp_memoraimcp_remember` function
- [ ] Test `mcp_memoraimcp_recall` function
- [ ] Test `mcp_memoraimcp_forget` function
- [ ] Test `mcp_memoraimcp_context` function
- [ ] Test `mcp_memoraimcp_search_keys` function

### 4. Documentation Updates

- [ ] Update tool documentation with correct names
- [ ] Update API examples
- [ ] Update integration guides

## 🔧 Technical Details

### Before Fix (WRONG)

```javascript
// Server provided tools with full prefix
{
  name: 'mcp_memoraimcp_remember', // DOUBLE PREFIX!
  // VS Code would call: mcp_memoraimcp_mcp_memoraimcp_remember
}
```

### After Fix (CORRECT)

```javascript
// Server provides tools with simple names
{
  name: 'remember', // Correct!
  // VS Code calls: mcp_memoraimcp_remember
}
```

### CBD Server Status

The `cbd-mcp-server.ts` already uses correct naming and is more feature-complete:

- Proper tool naming convention
- CBD backend integration
- Enhanced performance
- More comprehensive tool set (27 tools vs 4-5 in simple server)

## 🎯 Recommendations

1. **Use CBD-based server** for production (more complete implementation)
2. **Test both implementations** to ensure compatibility
3. **Update package.json** to use correct entry point
4. **Publish corrected package** to npm registry
5. **Update VS Code configuration** if needed

## ⚡ Immediate Actions Required

1. Test the fixed tools in VS Code
2. Verify which server implementation is actually being used by the published package
3. Update and republish if needed
4. Document the fix for future reference

The core issue has been identified and fixed - tool naming convention now follows MCP standards correctly.

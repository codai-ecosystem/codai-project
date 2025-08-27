# 📖 Glass MCP v10.0 Migration Guide

## Overview

Glass MCP v10.0 introduces a **consolidated tool architecture** that reduces tool proliferation while maintaining full backwards compatibility. This guide helps users migrate from legacy individual tools to the new consolidated tools for a cleaner, more efficient experience.

---

## 🎯 What Changed

### Before v10.0 (Legacy Architecture)
```json
{
  "tools": [
    "window_list",
    "window_focus", 
    "window_extract_text",
    "window_send_text",
    "clipboard_get_text",
    "clipboard_set_text",
    "... 8+ individual tools"
  ]
}
```

### After v10.0 (Consolidated Architecture)
```json
{
  "tools": [
    "glass_windows",      // 4 window operations
    "glass_clipboard",    // 2 clipboard operations  
    "... legacy tools"    // Still available with deprecation warnings
  ]
}
```

---

## 🚀 Migration Examples

### Window Management Operations

#### ✅ NEW: Consolidated `glass_windows` Tool

**List Windows**
```javascript
// New consolidated approach
{
  "tool": "glass_windows",
  "operation": "list",
  "parameters": {
    "query": "help"  // optional
  }
}
```

**Focus Window**
```javascript
// New consolidated approach  
{
  "tool": "glass_windows",
  "operation": "focus",
  "parameters": {
    "title": "VS Code",
    "exact": false  // optional
  }
}
```

**Extract Window Text**
```javascript
// New consolidated approach
{
  "tool": "glass_windows", 
  "operation": "extract_text",
  "parameters": {
    "windowHandle": 123456
  }
}
```

**Send Text to Window**
```javascript
// New consolidated approach
{
  "tool": "glass_windows",
  "operation": "send_text", 
  "parameters": {
    "title": "Notepad",
    "text": "Hello World",
    "exact": false  // optional
  }
}
```

#### 🔄 LEGACY: Individual Tools (Still Supported)

```javascript
// Legacy approach - still works but shows deprecation warning
{
  "tool": "window_list",
  "parameters": {}
}

{
  "tool": "window_focus", 
  "parameters": {
    "title": "VS Code"
  }
}
```

### Clipboard Operations  

#### ✅ NEW: Consolidated `glass_clipboard` Tool

**Get Clipboard Text**
```javascript
// New consolidated approach
{
  "tool": "glass_clipboard",
  "operation": "get_text", 
  "parameters": {}
}
```

**Set Clipboard Text** 
```javascript
// New consolidated approach
{
  "tool": "glass_clipboard",
  "operation": "set_text",
  "parameters": {
    "text": "Hello from Glass MCP!"
  }
}
```

#### 🔄 LEGACY: Individual Tools (Still Supported)

```javascript
// Legacy approach - still works but shows deprecation warning  
{
  "tool": "clipboard_get_text",
  "parameters": {}
}

{
  "tool": "clipboard_set_text",
  "parameters": {
    "text": "Hello World"
  }
}
```

---

## 🔧 Implementation Patterns

### Node.js/JavaScript Usage

**Using Consolidated Tools**
```javascript
import { createMCPClient } from '@codai/glass-mcp';

const client = createMCPClient();

// List windows using consolidated tool
const windows = await client.callTool('glass_windows', {
  operation: 'list'
});

// Get clipboard using consolidated tool  
const clipboard = await client.callTool('glass_clipboard', {
  operation: 'get_text'
});

// Focus window using consolidated tool
await client.callTool('glass_windows', {
  operation: 'focus',
  title: 'My Application',
  exact: true
});
```

**Legacy Compatibility** 
```javascript
// This still works but shows deprecation warnings
const windows = await client.callTool('window_list', {});
const clipboard = await client.callTool('clipboard_get_text', {});
```

### VS Code MCP Integration

**settings.json Configuration**
```json
{
  "mcp": {
    "servers": {
      "glass": {
        "command": "npx",
        "args": ["@codai/glass-mcp"],
        "env": {
          "GLASS_MCP_VERSION": "v10"
        }
      }
    }
  }
}
```

**Usage in VS Code**
```
// Use the consolidated tools for cleaner interface
@glass glass_windows operation=list
@glass glass_clipboard operation=get_text

// Legacy tools still work (with warnings)
@glass window_list  
@glass clipboard_get_text
```

### Python Integration

```python
import json
import subprocess

def call_glass_mcp_tool(tool_name, operation=None, **params):
    """Call Glass MCP consolidated tool"""
    if operation:
        # New consolidated approach
        args = {
            'tool': tool_name,
            'operation': operation,
            'parameters': params
        }
    else:
        # Legacy approach  
        args = {
            'tool': tool_name,
            'parameters': params
        }
    
    # Call via MCP protocol
    result = subprocess.run([
        'npx', '@codai/glass-mcp', 
        json.dumps(args)
    ], capture_output=True, text=True)
    
    return json.loads(result.stdout)

# New consolidated usage
windows = call_glass_mcp_tool('glass_windows', 'list')
clipboard = call_glass_mcp_tool('glass_clipboard', 'get_text')

# Focus a specific window
call_glass_mcp_tool('glass_windows', 'focus', title='VS Code')
```

---

## 📋 Migration Checklist

### For Individual Developers

- [ ] **Update Tool Calls**: Replace individual tools with consolidated versions
- [ ] **Parameter Mapping**: Map old parameters to new `operation` + `parameters` structure  
- [ ] **Test Functionality**: Verify all operations work as expected
- [ ] **Remove Deprecation Warnings**: Migrate away from legacy tools
- [ ] **Update Documentation**: Update your project docs with new tool names

### For Teams and Organizations  

- [ ] **Audit Current Usage**: Identify all Glass MCP tool usages in codebase
- [ ] **Create Migration Plan**: Plan gradual migration to consolidated tools
- [ ] **Update CI/CD**: Update automation scripts to use new tool format
- [ ] **Train Team Members**: Share this migration guide with team
- [ ] **Monitor Deprecation Warnings**: Track and resolve deprecation warnings

### For Library Authors

- [ ] **Update Dependencies**: Ensure compatibility with Glass MCP v10.0+
- [ ] **Wrapper Functions**: Update wrapper functions to use consolidated tools
- [ ] **Documentation Updates**: Update API documentation and examples
- [ ] **Backwards Compatibility**: Consider supporting both old and new formats temporarily
- [ ] **Version Pinning**: Pin to Glass MCP v10.0+ for new consolidated features

---

## ⚠️ Important Notes

### Breaking Changes
**None!** Glass MCP v10.0 maintains **100% backwards compatibility**. All legacy tools continue to work exactly as before, they just show deprecation warnings.

### Deprecation Timeline
- **v10.0**: Legacy tools show deprecation warnings
- **v10.x**: Legacy tools remain fully functional
- **v11.0**: Legacy tools will be removed (estimated Q2 2025)

### Performance Benefits
- **Reduced Tool Count**: 15 tools instead of potential 63+ tools
- **Faster Tool Discovery**: Less MCP protocol overhead  
- **Better Parameter Validation**: Enhanced error messages and validation
- **Cleaner Namespaces**: Reduced tool proliferation in MCP environments

---

## 🆘 Troubleshooting

### Common Migration Issues

**Issue**: "Operation not found"
```
Error: Unknown operation: invalid_op for glass_windows
```
**Solution**: Check the available operations for each tool:
- `glass_windows`: list, focus, extract_text, send_text
- `glass_clipboard`: get_text, set_text

**Issue**: "Parameter validation failed"
```  
Error: Missing required parameter: title for glass_windows focus
```
**Solution**: Ensure all required parameters are provided. Use tool schemas for reference.

**Issue**: "Legacy tool deprecation warning"
```
[DEPRECATION WARNING] window_list is deprecated. Use glass_windows with operation: "list"
```
**Solution**: Migrate to consolidated tool format to remove warnings.

### Getting Help

1. **Check Tool Schemas**: Use `tools/list` to see all available tools and parameters
2. **Review Examples**: Reference this migration guide for usage patterns  
3. **GitHub Issues**: Report bugs or ask questions on GitHub
4. **Discord Community**: Join our Discord for real-time help

---

## 🎉 Benefits of Migration

### For Users
- **Simpler Interface**: Fewer tools to remember, consistent patterns
- **Better Documentation**: Dynamic schemas with clear parameter descriptions  
- **Enhanced Functionality**: New operations and improved error handling
- **Future-Proof**: Ready for upcoming Phase 2 enhancements

### for Developers  
- **Cleaner Code**: Consolidated tool calls, consistent parameter patterns
- **Better IDE Support**: Enhanced autocomplete and validation
- **Easier Testing**: Fewer tool combinations to test
- **Maintainable**: Less complexity in MCP tool management

### For Organizations
- **Reduced Complexity**: Fewer tools to manage and document
- **Training Efficiency**: Simpler onboarding for new team members  
- **Integration Benefits**: Cleaner APIs for enterprise integrations
- **Compliance Ready**: Enterprise-grade architecture patterns

---

## 📚 Additional Resources

- **[Glass MCP v10.0 Changelog](CHANGELOG.md)**: Complete list of changes
- **[API Reference](README.md)**: Detailed API documentation  
- **[Examples Repository](https://github.com/codai-project/glass-mcp-examples)**: Code samples and use cases
- **[Phase 2 Roadmap](GLASS_MCP_CONSOLIDATION_PLAN_V10.md)**: Upcoming consolidation plans

---

*Migration Guide Version: 1.0*  
*Glass MCP Version: v10.0+*  
*Last Updated: January 2025*
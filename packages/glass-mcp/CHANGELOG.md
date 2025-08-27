# Changelog - Glass MCP

## [10.0.0] - 2025-08-27

### 🚀 Major Release - Phase 1 Consolidation Architecture

This is a **major milestone release** introducing Glass MCP's consolidated tool architecture, reducing tool proliferation while maintaining 100% backwards compatibility.

#### ✨ **New Features - Consolidated Tools**

**🪟 `glass_windows` - Unified Window Management**
- **4 Operations**: `list`, `focus`, `extract_text`, `send_text`
- **Dynamic Schema Generation**: Automatic parameter validation and documentation
- **Enhanced Error Handling**: Comprehensive validation with user-friendly messages
- **Consistent Interface**: Standardized operation-based parameter handling

**📋 `glass_clipboard` - Unified Clipboard Operations**  
- **2 Operations**: `get_text`, `set_text`
- **Unicode Support**: Full Windows clipboard integration
- **Type Safety**: Strict parameter validation and error reporting

#### 🔄 **Legacy Compatibility Layer**

**Zero Breaking Changes** - All existing tools continue to work exactly as before:

| Legacy Tool | Status | Replacement |
|-------------|--------|-------------|
| `window_list` | ⚠️ Deprecated | `glass_windows` → `list` |
| `window_focus` | ⚠️ Deprecated | `glass_windows` → `focus` |
| `window_extract_text` | ⚠️ Deprecated | `glass_windows` → `extract_text` |
| `window_send_text` | ⚠️ Deprecated | `glass_windows` → `send_text` |
| `clipboard_get_text` | ⚠️ Deprecated | `glass_clipboard` → `get_text` |
| `clipboard_set_text` | ⚠️ Deprecated | `glass_clipboard` → `set_text` |

**Legacy Features:**
- **Automatic Routing**: Legacy tool calls automatically route to consolidated tools
- **Deprecation Warnings**: Clear migration guidance with each legacy tool usage
- **Parameter Compatibility**: All existing parameters continue to work unchanged
- **Timeline**: Legacy tools will be removed in v11.0 (estimated Q2 2026)

#### 🏗️ **Architecture Improvements**

**Microsoft MCP Patterns Implementation:**
- **Service-Based Organization**: Tools organized by functional domain
- **Operation Parameters**: Clean, extensible parameter structure  
- **Dynamic Schemas**: Auto-generated tool schemas based on operations
- **Clean Namespaces**: Reduced tool count from potential 63+ to 15 total

**Enterprise-Grade Features:**
- **TypeScript First**: Full type safety and IntelliSense support
- **Comprehensive Error Handling**: Detailed validation and error reporting
- **Performance Optimized**: Reduced MCP protocol overhead
- **Extensible Framework**: Ready for Phase 2 consolidations

#### 📚 **Documentation Enhancements**

**New Documentation:**
- **[Migration Guide](MIGRATION_GUIDE_V10.md)**: Complete migration instructions with examples
- **[README.md](README.md)**: Comprehensive usage guide and API reference
- **[Phase 1 Validation Report](GLASS_MCP_PHASE1_VALIDATION_REPORT.md)**: Technical validation results
- **[Consolidation Plan](GLASS_MCP_CONSOLIDATION_PLAN_V10.md)**: Strategic architecture overview

**Updated Features:**
- **Usage Examples**: Node.js, Python, VS Code, and Claude Desktop integration
- **Troubleshooting Guide**: Common issues and solutions
- **API Reference**: Complete tool and operation documentation
- **Migration Examples**: Before/after code samples for all tools

#### 🔧 **Technical Changes**

**Package Metadata:**
- **Description Updated**: Reflects consolidated architecture and enterprise focus
- **Keywords Updated**: Emphasizes consolidation, backwards compatibility, enterprise features
- **Dependencies**: Updated to latest MCP SDK (v1.17.4) and Zod (v3.23.8)

**Build System:**
- **TypeScript 5.6.3**: Latest TypeScript with strict compilation
- **ESM Modules**: Full ES modules support
- **Source Maps**: Complete debugging support included
- **Test Framework**: Vitest integration for comprehensive testing

#### 📊 **Performance Improvements**

- **Tool Count Reduction**: 85% fewer tools to manage (15 vs potential 63+)
- **MCP Protocol Efficiency**: Faster tool discovery and registration
- **Memory Usage**: Optimized tool handler architecture
- **Response Times**: Improved parameter validation and error handling

### 🔄 **Migration Guide**

#### For New Users
Simply use the consolidated tools:
```javascript
// Window management
{ "tool": "glass_windows", "operation": "list" }
{ "tool": "glass_windows", "operation": "focus", "title": "VS Code" }

// Clipboard operations  
{ "tool": "glass_clipboard", "operation": "get_text" }
{ "tool": "glass_clipboard", "operation": "set_text", "text": "Hello World" }
```

#### For Existing Users
Your existing code continues to work unchanged:
```javascript
// This still works (with deprecation warning)
{ "tool": "window_list", "parameters": {} }
{ "tool": "clipboard_get_text", "parameters": {} }

// But this is recommended
{ "tool": "glass_windows", "operation": "list" }
{ "tool": "glass_clipboard", "operation": "get_text" }
```

### 🎯 **What's Next - Phase 2 Roadmap**

**Planned Consolidations (Q2 2026):**
- **`glass_files`**: File system operations consolidation
- **`glass_processes`**: Process management consolidation
- **`glass_system`**: System information consolidation

**Future Enhancements:**
- Enhanced security features for enterprise environments
- Performance optimizations with native modules
- Cross-platform support expansion (macOS, Linux)

---

## [9.4.0] - 2025-01-15

### Added
- Enhanced MCP server architecture
- Advanced Windows automation capabilities  
- Mouse drawing and shape recognition
- Vision-based screen automation
- Comprehensive file operations
- Process management tools
- System information gathering

### Changed
- Improved PowerShell integration
- Enhanced error handling
- Better TypeScript support

### Fixed
- Various PowerShell script execution issues
- Memory management improvements
- Stability enhancements

---

## [9.3.1] - 2024-12-10

### Added
- System information tools
- Process management
- File operation capabilities

### Fixed
- VS Code MCP integration issues
- Tool discovery problems
- npm cache conflicts

---

## [9.0.0] - 2024-11-20

### Added  
- Initial MCP server implementation
- Basic window management
- Clipboard operations
- PowerShell integration

---

**Legend:**
- ✨ New Features
- 🔧 Technical Changes  
- 📚 Documentation
- 🔄 Breaking Changes
- 🏗️ Architecture
- 📊 Performance
- 🎯 Future Plans

**Migration Support:** See [MIGRATION_GUIDE_V10.md](MIGRATION_GUIDE_V10.md) for detailed migration instructions.
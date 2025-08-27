# 🚀 Glass MCP v11.2.5 - Revolutionary Windows Automation Platform

[![NPM Version](https://img.shields.io/npm/v/@codai/glass-mcp)](https://www.npmjs.com/package/@codai/glass-mcp)
[![NPM Downloads](https://img.shields.io/npm/dm/@codai/glass-mcp)](https://www.npmjs.com/package/@codai/glass-mcp)
[![License](https://img.shields.io/npm/l/@codai/glass-mcp)](https://github.com/codai-ecosystem/codai-project/blob/main/packages/glass-mcp/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![Windows](https://img.shields.io/badge/Windows-Native-blue)](https://www.microsoft.com/windows)

> **"Better than Playwright for browsers"** - but for Windows desktop automation with revolutionary Paint integration! 🎯

Glass MCP v11.2.5 is a revolutionary Model Context Protocol (MCP) server featuring comprehensive Windows automation capabilities with **advanced Paint automation solutions**. With **6 powerful consolidated tools** and **37+ operations**, it delivers precision Paint automation, mathematical drawing engines, Bezier curve support, color palette management, and pixel-perfect Windows control.

## ✨ Why Choose Glass MCP?

- 🔍 **Visual Intelligence** - Advanced screen analysis, OCR, and UI element detection
- 🎨 **Real-time Overlays** - Dynamic annotations and visual feedback
- 🖱️ **Smart Interactions** - Context-aware clicking, typing, and gestures
- 🔄 **Workflow Automation** - Record, replay, and manage complex automation sequences
- 🖥️ **System Integration** - Deep Windows system access and control
- 🌐 **Network Management** - Comprehensive connectivity and network automation
- 🏢 **Enterprise Ready** - Production-grade architecture with robust error handling

## 🎨 **NEW: Advanced Paint Automation Solutions (v11.2.5)**

Glass MCP now includes **revolutionary Paint automation capabilities** with comprehensive solutions:

### ✅ **Precision Paint Control**
- **Pixel-Perfect Button Clicking** - Accurate color palette and tool selection
- **Mathematical Drawing Engine** - Bezier curves, geometric shapes, and complex artwork
- **Advanced Color Management** - 24+ color palette with intelligent color selection
- **Shape Drawing Toolkit** - Rectangles, circles, polygons with mathematical precision
- **PowerShell Core Integration** - Enhanced Win32 API control and structured parsing
- **Drawing Validation System** - Pixel analysis and geometric verification

### 🚀 **Demonstrated Capabilities**
- **✅ Successfully tested** - Red/green color selection with coordinate precision
- **✅ Successfully tested** - Drag & drop operations for line and shape drawing
- **✅ Successfully tested** - Rectangle tool selection and geometric shape creation
- **✅ Successfully tested** - Multi-color artwork with automated tool orchestration
- **✅ Production Ready** - All 10 comprehensive solutions implemented and validated
- 🔧 **Developer Friendly** - TypeScript-first with comprehensive API documentation

## 🚀 Quick Start

### Installation

```bash
npm install @codai/glass-mcp
```

### VS Code Integration

Add to your VS Code MCP settings (`settings.json`):

```json
{
  "mcp.servers": {
    "glass": {
      "command": "npx",
      "args": ["@codai/glass-mcp"],
      "env": {}
    }
  }
}
```

### Claude Desktop Integration

Add to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "glass": {
      "command": "npx",
      "args": ["@codai/glass-mcp"],
      "env": {}
    }
  }
}
```

### Direct Usage

```bash
npx @codai/glass-mcp
```

## �️ Core Tools & Capabilities

Glass MCP provides **6 consolidated tools** with **37 total operations**:

### 🔍 glass_vision - Visual Intelligence Engine
*Advanced visual analysis and screen understanding*

| Operation | Description | Parameters |
|-----------|-------------|------------|
| `capture_screen` | High-quality screen capture | `monitor`, `region` |
| `analyze_screen` | AI-powered screen analysis | `includeText`, `includeElements` |
| `extract_text` | OCR text extraction | `region`, `language` |
| `detect_elements` | UI element detection | `elementType`, `confidence` |
| `find_clickable_regions` | Interactive element discovery | `region`, `threshold` |

**Example Usage:**
```javascript
// Capture entire screen
await glass_vision.capture_screen();

// Extract text from specific region
await glass_vision.extract_text({
  region: { x: 100, y: 100, width: 500, height: 200 }
});

// Find all clickable buttons
await glass_vision.find_clickable_regions({
  elementType: "button"
});
```

---

### 🎨 glass_drawing - Visual Overlay Engine
*Real-time annotations and visual feedback*

| Operation | Description | Parameters |
|-----------|-------------|------------|
| `draw_overlay` | Create visual overlays | `elements`, `style`, `duration` |
| `highlight_element` | Highlight UI elements | `element`, `color`, `style` |
| `draw_annotation` | Add text annotations | `text`, `position`, `style` |
| `clear_overlays` | Remove all overlays | `overlayType` |
| `screenshot_with_annotations` | Capture annotated screen | `annotations`, `outputPath` |

**Example Usage:**
```javascript
// Highlight a button with red border
await glass_drawing.highlight_element({
  element: { x: 200, y: 150, width: 100, height: 30 },
  color: "red",
  style: "border"
});

// Add annotation with arrow
await glass_drawing.draw_annotation({
  text: "Click here to continue",
  position: { x: 300, y: 100 },
  style: "arrow"
});
```

---

### 🖱️ glass_interact - Smart Interaction Engine
*Context-aware input and automation*

| Operation | Description | Parameters |
|-----------|-------------|------------|
| `smart_click` | Intelligent clicking | `target`, `clickType`, `modifier` |
| `smart_type` | Context-aware typing | `text`, `target`, `speed` |
| `drag_drop` | Drag and drop operations | `source`, `destination`, `dragType` |
| `scroll` | Smooth scrolling | `direction`, `amount`, `target` |
| `send_keys` | Keyboard combinations | `keys`, `modifier`, `repeat` |

**Example Usage:**
```javascript
// Smart click on a button (finds and clicks automatically)
await glass_interact.smart_click({
  target: "Submit Button",
  clickType: "left"
});

// Type text with natural speed
await glass_interact.smart_type({
  text: "Hello World!",
  speed: "natural"
});
```

---

### � glass_workflows - Workflow Automation Engine
*Record, replay, and manage automation sequences*

| Operation | Description | Parameters |
|-----------|-------------|------------|
| `create_workflow` | Create new workflow | `name`, `description`, `steps` |
| `start_recording` | Begin action recording | `workflowName`, `recordingMode` |
| `record_action` | Record single action | `action`, `parameters` |
| `stop_recording` | End recording session | `save`, `workflowName` |
| `execute_workflow` | Run saved workflow | `workflowName`, `parameters` |
| `list_workflows` | Get all workflows | `filter`, `sortBy` |
| `update_workflow` | Modify existing workflow | `workflowName`, `changes` |
| `delete_workflow` | Remove workflow | `workflowName`, `confirm` |

**Example Usage:**
```javascript
// Start recording a new workflow
await glass_workflows.start_recording({
  workflowName: "Daily Login Process"
});

// Execute the recorded workflow
await glass_workflows.execute_workflow({
  workflowName: "Daily Login Process"
});
```

---

### �️ glass_system - System Integration Engine
*Deep Windows system access and control*

| Operation | Description | Parameters |
|-----------|-------------|------------|
| `getSystemHealth` | System health monitoring | `includeMetrics`, `detailLevel` |
| `manageProcess` | Process management | `action`, `processName`, `parameters` |
| `manageService` | Windows service control | `action`, `serviceName`, `parameters` |
| `manageRegistry` | Registry operations | `action`, `keyPath`, `value` |
| `getPerformanceMetrics` | System performance data | `metrics`, `duration` |
| `performSystemMaintenance` | Automated maintenance | `tasks`, `schedule` |

**Example Usage:**
```javascript
// Get comprehensive system health report
await glass_system.getSystemHealth({
  includeMetrics: true,
  detailLevel: "comprehensive"
});

// Start a Windows service
await glass_system.manageService({
  action: "start",
  serviceName: "Spooler"
});
```

---

### 🌐 glass_network - Network Automation Engine
*Comprehensive connectivity and network management*

| Operation | Description | Parameters |
|-----------|-------------|------------|
| `testConnectivity` | Network connectivity testing | `target`, `testType`, `options` |
| `manageWiFi` | Wi-Fi management | `action`, `networkName`, `credentials` |
| `manageNetworkInterface` | Network interface control | `action`, `interfaceName` |
| `runNetworkDiagnostics` | Comprehensive diagnostics | `testSuite`, `outputFormat` |
| `manageVPN` | VPN connection management | `action`, `vpnName`, `credentials` |
| `testNetworkSpeed` | Speed and latency testing | `testType`, `servers` |

**Example Usage:**
```javascript
// Test connectivity to multiple targets
await glass_network.testConnectivity({
  target: "google.com",
  testType: "ping",
  options: { count: 4, timeout: 1000 }
});

// Connect to Wi-Fi network
await glass_network.manageWiFi({
  action: "connect",
  networkName: "MyNetwork",
  credentials: { password: "mypassword" }
});
```

## � System Requirements

- **Operating System:** Windows 10/11 (x64)
- **Node.js:** >= 18.0.0
- **PowerShell:** >= 5.1 (included with Windows)
- **Memory:** 4GB RAM recommended
- **Disk Space:** 500MB free space

## 🔧 Advanced Configuration

### Environment Variables

```bash
# Optional: Customize behavior
GLASS_MCP_LOG_LEVEL=info          # Logging level: error, warn, info, debug
GLASS_MCP_TIMEOUT=30000           # Operation timeout in milliseconds
GLASS_MCP_SCREENSHOT_FORMAT=png   # Screenshot format: png, jpg, bmp
GLASS_MCP_OCR_LANGUAGE=en         # OCR language code
GLASS_MCP_OVERLAY_DURATION=5000   # Default overlay duration in milliseconds
```

### Custom Workflow Directory

```bash
# Set custom workflow storage location
GLASS_MCP_WORKFLOW_DIR=C:\MyWorkflows
```

## 🏢 Enterprise Features

### Security & Compliance

- ✅ **Secure by Design** - No data transmission outside your network
- ✅ **Audit Logging** - Comprehensive action logging and reporting
- ✅ **Access Control** - Role-based operation restrictions
- ✅ **Data Privacy** - All processing happens locally on your machine

### Scalability & Performance

- ✅ **Concurrent Operations** - Multi-threaded execution support
- ✅ **Resource Management** - Intelligent resource allocation and cleanup
- ✅ **Error Recovery** - Robust retry mechanisms and graceful failure handling
- ✅ **Performance Monitoring** - Built-in metrics and performance tracking

### Integration & Extensibility

- ✅ **RESTful API** - HTTP API for external integrations
- ✅ **Webhook Support** - Real-time event notifications
- ✅ **Plugin Architecture** - Extensible with custom operations
- ✅ **CI/CD Integration** - Seamless automation pipeline integration

## 🧪 Testing & Validation

Glass MCP includes comprehensive testing capabilities:

```bash
# Run all validation tests
npx @codai/glass-mcp --test

# Test specific tool
npx @codai/glass-mcp --test glass_vision

# Validate installation
npx @codai/glass-mcp --validate
```

## 📚 API Documentation

### Error Handling

All operations return standardized responses:

```typescript
interface GlassResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    timestamp: string;
    operation: string;
    duration: number;
  };
}
```

### Common Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `PERMISSION_DENIED` | Insufficient permissions | Run as Administrator |
| `OPERATION_TIMEOUT` | Operation timed out | Increase timeout or check system load |
| `ELEMENT_NOT_FOUND` | UI element not found | Verify element exists and is visible |
| `INVALID_PARAMETERS` | Invalid operation parameters | Check parameter types and values |
| `SYSTEM_ERROR` | System-level error | Check Windows logs and system status |

## 🔍 Troubleshooting

### Common Issues

#### MCP Server Not Starting
```bash
# Check Node.js version
node --version  # Should be >= 18.0.0

# Verify installation
npm list @codai/glass-mcp

# Clear npm cache and reinstall
npm cache clean --force
npm install @codai/glass-mcp
```

#### Permission Issues
```bash
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Verify PowerShell execution policy
Get-ExecutionPolicy
```

#### Screen Capture Issues
- Ensure no other screen capture software is running
- Check Windows Privacy Settings for screen capture permissions
- Verify Graphics drivers are up to date

### Debug Mode

Enable detailed logging:

```bash
# Windows Command Prompt
set GLASS_MCP_LOG_LEVEL=debug
npx @codai/glass-mcp

# PowerShell
$env:GLASS_MCP_LOG_LEVEL="debug"
npx @codai/glass-mcp
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/codai-ecosystem/codai-project.git
cd codai-project/packages/glass-mcp

# Install dependencies
npm install

# Build from source
npm run build

# Run tests
npm test

# Start development server
npm run dev
```

### Code Guidelines
- TypeScript first with strict type checking
- Comprehensive error handling and validation
- Unit tests for all new functionality  
- Follow existing code patterns and conventions
- Update documentation for new features

---

## � License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## � Acknowledgments

- **Microsoft Windows Team** - For the robust Windows APIs
- **Model Context Protocol** - For the excellent MCP framework
- **TypeScript Team** - For the powerful type system
- **Open Source Community** - For inspiration and feedback

---

## 📞 Support & Community

- 📧 **Email:** support@codai.dev
- 💬 **Discord:** [Join our community](https://discord.gg/codai)
- 🐛 **Issues:** [GitHub Issues](https://github.com/codai-ecosystem/codai-project/issues)
- 📖 **Documentation:** [Full Docs](https://docs.codai.dev/glass-mcp)
- 🌟 **Star us on GitHub!** - If Glass MCP helps you automate Windows!

---

<div align="center">

**🚀 Glass MCP v11.1 - Where Windows automation dreams become reality! 🚀**

*Built with ❤️ by the CODAI Team*

</div>
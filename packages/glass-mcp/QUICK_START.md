# 🏁 Glass MCP Quick Start Guide

Get up and running with Glass MCP in minutes! This guide covers installation, basic usage, and common workflows.

## 📋 Prerequisites

- **Windows 10/11** (64-bit)
- **Node.js 18+** ([Download here](https://nodejs.org/))
- **PowerShell 5.1+** (included with Windows)

## 🚀 Installation

### Option 1: Direct Installation (Recommended)
```bash
npm install @codai/glass-mcp
```

### Option 2: Global Installation
```bash
npm install -g @codai/glass-mcp
```

### Verify Installation
```bash
npx @codai/glass-mcp --version
```

## 🔧 Configuration

### VS Code Setup

1. Open VS Code Settings (`Ctrl+,`)
2. Search for "MCP"
3. Add Glass MCP server:

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

### Claude Desktop Setup

1. Locate your Claude Desktop config file:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add Glass MCP configuration:

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

## 🎯 First Steps

### 1. Test Your Installation

```bash
# Test MCP server
npx @codai/glass-mcp

# In another terminal, send a test request
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | npx @codai/glass-mcp
```

### 2. Take Your First Screenshot

In VS Code with MCP enabled or Claude Desktop:

```
Use glass_vision to capture_screen
```

This will capture your entire screen and return the image data.

### 3. Extract Text from Screen

```
Use glass_vision to extract_text from the entire screen
```

Glass MCP will use OCR to extract all visible text.

## 🛠️ Common Use Cases

### 📸 Screen Analysis

**Capture specific region:**
```javascript
glass_vision.capture_screen({
  region: { x: 100, y: 100, width: 800, height: 600 }
})
```

**Find clickable elements:**
```javascript
glass_vision.find_clickable_regions({
  elementType: "button"
})
```

### 🖱️ Smart Interactions

**Click on a button:**
```javascript
glass_interact.smart_click({
  target: "Submit Button",
  clickType: "left"
})
```

**Type text naturally:**
```javascript
glass_interact.smart_type({
  text: "Hello World!",
  speed: "natural"
})
```

### 🎨 Visual Feedback

**Highlight an element:**
```javascript
glass_drawing.highlight_element({
  element: { x: 200, y: 150, width: 100, height: 30 },
  color: "red",
  style: "border"
})
```

**Add annotation:**
```javascript
glass_drawing.draw_annotation({
  text: "Click here!",
  position: { x: 250, y: 100 },
  style: { arrow: true }
})
```

### 🔄 Workflow Automation

**Create a simple workflow:**
```javascript
// Start recording
glass_workflows.start_recording({
  workflowName: "Login Process"
});

// Perform actions (they'll be recorded automatically)
glass_interact.smart_click({ target: "Username field" });
glass_interact.smart_type({ text: "myusername" });
glass_interact.smart_click({ target: "Password field" });
glass_interact.smart_type({ text: "mypassword" });
glass_interact.smart_click({ target: "Login button" });

// Stop recording
glass_workflows.stop_recording({
  save: true,
  workflowName: "Login Process"
});

// Execute the workflow later
glass_workflows.execute_workflow({
  workflowName: "Login Process"
});
```

### 🖥️ System Information

**Get system health:**
```javascript
glass_system.getSystemHealth({
  includeMetrics: true,
  detailLevel: "comprehensive"
})
```

**Manage Windows services:**
```javascript
glass_system.manageService({
  action: "start",
  serviceName: "Spooler"
})
```

### 🌐 Network Operations

**Test connectivity:**
```javascript
glass_network.testConnectivity({
  target: "google.com",
  testType: "ping",
  options: { count: 4 }
})
```

**Manage Wi-Fi:**
```javascript
glass_network.manageWiFi({
  action: "list"
})
```

## 🐛 Troubleshooting

### Common Issues

**"PowerShell execution policy restriction"**
```powershell
# Run as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**"Permission denied for screen capture"**
- Check Windows Privacy Settings
- Ensure no other screen capture software is running
- Try running VS Code/Claude as Administrator

**"Cannot find module '@codai/glass-mcp'"**
```bash
# Clear npm cache and reinstall
npm cache clean --force
npm install @codai/glass-mcp
```

### Enable Debug Mode

```bash
# Windows Command Prompt
set GLASS_MCP_LOG_LEVEL=debug
npx @codai/glass-mcp

# PowerShell
$env:GLASS_MCP_LOG_LEVEL="debug"
npx @codai/glass-mcp
```

## 🎓 Learning Path

### Beginner (Week 1)
1. ✅ Install and configure Glass MCP
2. ✅ Take screenshots and extract text
3. ✅ Use smart interactions (click, type)
4. ✅ Create simple visual overlays

### Intermediate (Week 2-3)
1. 🔄 Create and execute basic workflows  
2. 🖥️ Monitor system health and performance
3. 🌐 Test network connectivity
4. 🎨 Advanced visual annotations

### Advanced (Week 4+)
1. 🏢 Enterprise integration and security
2. 🔧 Custom workflow development
3. 📊 Performance optimization
4. 🔌 API integration and extensions

## 📚 Next Steps

### Essential Reading
- [API Reference](API_REFERENCE.md) - Complete function documentation
- [Best Practices](BEST_PRACTICES.md) - Performance and security guidelines
- [Examples](examples/) - Real-world use cases and code samples

### Community Resources
- 💬 [Discord Community](https://discord.gg/codai)
- 🐛 [GitHub Issues](https://github.com/codai-ecosystem/codai-project/issues)
- 📖 [Full Documentation](https://docs.codai.dev/glass-mcp)

## 🎯 Ready to Automate?

You're now ready to start automating Windows with Glass MCP! Here are some ideas to get started:

- 📋 **Automate form filling** - Extract data and fill forms automatically
- 🧪 **UI testing** - Create automated test workflows for applications  
- 📊 **Data extraction** - Extract information from legacy applications
- 🔄 **Repetitive tasks** - Automate daily workflows and processes
- 📈 **System monitoring** - Monitor system health and performance

**Happy automating! 🚀**

---

*Need help? Join our [Discord community](https://discord.gg/codai) or check our [GitHub discussions](https://github.com/codai-ecosystem/codai-project/discussions)*
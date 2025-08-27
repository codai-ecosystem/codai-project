# 🚀 Glass MCP API Reference

## Table of Contents

1. [Core Architecture](#core-architecture)
2. [Tool Specifications](#tool-specifications)
3. [Error Handling](#error-handling)
4. [Performance Guidelines](#performance-guidelines)
5. [Security Considerations](#security-considerations)

---

## Core Architecture

Glass MCP follows the Model Context Protocol (MCP) specification with a consolidated tool architecture:

### MCP Protocol Support

- **JSON-RPC 2.0**: All communications follow JSON-RPC 2.0 standard
- **Stdio Transport**: Primary transport method for VS Code and Claude Desktop
- **Tool Discovery**: Dynamic tool listing with operation enumeration
- **Error Standardization**: Consistent error reporting across all operations

### Tool Organization

```typescript
interface ConsolidatedTool {
  name: string;
  description: string;
  operations: {
    [operationName: string]: {
      description: string;
      parameters: ParameterSchema;
      handler: (params: any) => Promise<any>;
    };
  };
}
```

---

## Tool Specifications

### 🔍 glass_vision

**Purpose**: Advanced visual analysis and screen understanding

#### Operations

##### capture_screen
```typescript
interface CaptureScreenParams {
  monitor?: number;        // Monitor index (default: primary)
  region?: {              // Specific region to capture
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface CaptureScreenResponse {
  success: boolean;
  imagePath?: string;
  imageData?: string;     // Base64 encoded image
  metadata: {
    width: number;
    height: number;
    format: string;
    timestamp: string;
  };
}
```

##### analyze_screen
```typescript
interface AnalyzeScreenParams {
  includeText?: boolean;        // Include OCR text extraction
  includeElements?: boolean;    // Include UI element detection
  confidenceThreshold?: number; // Minimum confidence (0-1)
}

interface AnalyzeScreenResponse {
  success: boolean;
  analysis: {
    text?: string[];
    elements?: UIElement[];
    regions?: ClickableRegion[];
    metadata: AnalysisMetadata;
  };
}
```

##### extract_text
```typescript
interface ExtractTextParams {
  region?: BoundingBox;
  language?: string;      // OCR language code (default: 'en')
  confidence?: number;    // Minimum confidence threshold
}

interface ExtractTextResponse {
  success: boolean;
  text: string;
  confidence: number;
  boundingBoxes: TextBoundingBox[];
}
```

##### detect_elements
```typescript
interface DetectElementsParams {
  elementType?: 'button' | 'textbox' | 'checkbox' | 'all';
  confidence?: number;
  region?: BoundingBox;
}

interface DetectElementsResponse {
  success: boolean;
  elements: UIElement[];
  metadata: {
    totalFound: number;
    averageConfidence: number;
  };
}
```

##### find_clickable_regions
```typescript
interface FindClickableRegionsParams {
  region?: BoundingBox;
  threshold?: number;     // Clickability threshold (0-1)
}

interface FindClickableRegionsResponse {
  success: boolean;
  clickableRegions: ClickableRegion[];
  metadata: {
    totalRegions: number;
    highConfidenceCount: number;
  };
}
```

---

### 🎨 glass_drawing

**Purpose**: Real-time visual overlays and annotations

#### Operations

##### draw_overlay
```typescript
interface DrawOverlayParams {
  elements: OverlayElement[];
  style?: OverlayStyle;
  duration?: number;      // Duration in milliseconds (0 = permanent)
}

interface OverlayElement {
  type: 'rectangle' | 'circle' | 'arrow' | 'text';
  bounds: BoundingBox;
  style: ElementStyle;
  content?: string;       // For text elements
}
```

##### highlight_element
```typescript
interface HighlightElementParams {
  element: BoundingBox;
  color?: string;         // CSS color or hex code
  style?: 'border' | 'fill' | 'glow';
  thickness?: number;     // Border thickness in pixels
  duration?: number;      // Auto-clear duration
}
```

##### draw_annotation
```typescript
interface DrawAnnotationParams {
  text: string;
  position: Point;
  style?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    arrow?: boolean;      // Show arrow pointing to position
    arrowDirection?: 'up' | 'down' | 'left' | 'right';
  };
}
```

##### clear_overlays
```typescript
interface ClearOverlaysParams {
  overlayType?: 'all' | 'highlights' | 'annotations' | 'custom';
  region?: BoundingBox;   // Clear only in specific region
}
```

##### screenshot_with_annotations
```typescript
interface ScreenshotWithAnnotationsParams {
  annotations?: AnnotationElement[];
  outputPath?: string;    // File save path
  format?: 'png' | 'jpg' | 'bmp';
}
```

---

### 🖱️ glass_interact

**Purpose**: Context-aware input and automation

#### Operations

##### smart_click
```typescript
interface SmartClickParams {
  target: Point | string;  // Coordinates or element description
  clickType?: 'left' | 'right' | 'middle' | 'double';
  modifier?: 'ctrl' | 'shift' | 'alt';
  delay?: number;         // Delay before click (ms)
  verification?: boolean; // Verify click success
}
```

##### smart_type
```typescript
interface SmartTypeParams {
  text: string;
  target?: Point | string; // Where to click before typing
  speed?: 'slow' | 'normal' | 'fast' | 'natural';
  clearFirst?: boolean;   // Clear existing text first
  pressEnter?: boolean;   // Press Enter after typing
}
```

##### drag_drop
```typescript
interface DragDropParams {
  source: Point;
  destination: Point;
  dragType?: 'move' | 'copy' | 'link';
  duration?: number;      // Drag duration in milliseconds
  path?: 'direct' | 'smooth'; // Movement path type
}
```

##### scroll
```typescript
interface ScrollParams {
  direction: 'up' | 'down' | 'left' | 'right';
  amount?: number;        // Scroll amount (default: 3 lines)
  target?: Point;         // Where to scroll (default: cursor position)
  smooth?: boolean;       // Smooth scrolling
}
```

##### send_keys
```typescript
interface SendKeysParams {
  keys: string;           // Key combination (e.g., "ctrl+c", "alt+tab")
  repeat?: number;        // Number of repetitions
  delay?: number;         // Delay between repetitions
  target?: Point;         // Focus target before sending keys
}
```

---

### 🔄 glass_workflows

**Purpose**: Workflow automation and management

#### Operations

##### create_workflow
```typescript
interface CreateWorkflowParams {
  name: string;
  description?: string;
  steps: WorkflowStep[];
  metadata?: WorkflowMetadata;
}

interface WorkflowStep {
  id: string;
  type: 'click' | 'type' | 'wait' | 'condition' | 'loop';
  parameters: StepParameters;
  nextStepId?: string;
  onError?: ErrorHandling;
}
```

##### start_recording
```typescript
interface StartRecordingParams {
  workflowName: string;
  recordingMode?: 'actions' | 'smart' | 'detailed';
  captureScreenshots?: boolean;
  captureTimings?: boolean;
}
```

##### execute_workflow
```typescript
interface ExecuteWorkflowParams {
  workflowName: string;
  parameters?: Record<string, any>;
  options?: {
    continueOnError?: boolean;
    stepDelay?: number;
    maxRetries?: number;
  };
}
```

---

### 🖥️ glass_system

**Purpose**: Deep Windows system integration

#### Operations

##### getSystemHealth
```typescript
interface SystemHealthParams {
  includeMetrics?: boolean;
  detailLevel?: 'basic' | 'standard' | 'comprehensive';
  categories?: SystemCategory[];
}

interface SystemHealthResponse {
  success: boolean;
  health: {
    overall: HealthStatus;
    cpu: ComponentHealth;
    memory: ComponentHealth;
    disk: ComponentHealth;
    network: ComponentHealth;
    services: ServiceHealth[];
  };
  recommendations?: string[];
}
```

##### manageProcess
```typescript
interface ManageProcessParams {
  action: 'list' | 'start' | 'stop' | 'restart' | 'info';
  processName?: string;
  processId?: number;
  parameters?: ProcessParameters;
}
```

##### manageService
```typescript
interface ManageServiceParams {
  action: 'list' | 'start' | 'stop' | 'restart' | 'status';
  serviceName?: string;
  waitForCompletion?: boolean;
  timeout?: number;
}
```

---

### 🌐 glass_network

**Purpose**: Network automation and diagnostics

#### Operations

##### testConnectivity
```typescript
interface TestConnectivityParams {
  target: string;         // Hostname or IP address
  testType: 'ping' | 'traceroute' | 'nslookup' | 'telnet';
  options?: {
    count?: number;       // Number of tests
    timeout?: number;     // Timeout in milliseconds
    port?: number;        // For telnet tests
    ipv6?: boolean;       // Use IPv6
  };
}
```

##### manageWiFi
```typescript
interface ManageWiFiParams {
  action: 'list' | 'connect' | 'disconnect' | 'scan' | 'profile';
  networkName?: string;
  credentials?: {
    password?: string;
    security?: 'WPA2' | 'WPA3' | 'Open';
  };
}
```

---

## Error Handling

### Standard Error Response

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    stack?: string;        // In debug mode only
  };
  metadata: {
    timestamp: string;
    operation: string;
    duration: number;
  };
}
```

### Error Codes

| Code | Category | Description | Recovery Action |
|------|----------|-------------|-----------------|
| `INVALID_PARAMETERS` | Validation | Parameter validation failed | Check parameter types and values |
| `PERMISSION_DENIED` | Security | Insufficient permissions | Run as Administrator or check UAC |
| `OPERATION_TIMEOUT` | Performance | Operation timed out | Increase timeout or check system load |
| `ELEMENT_NOT_FOUND` | Interaction | UI element not found | Verify element exists and is visible |
| `SYSTEM_ERROR` | System | Windows API error | Check system logs and status |
| `NETWORK_ERROR` | Network | Network operation failed | Check connectivity and DNS |
| `FILE_ERROR` | FileSystem | File operation failed | Check path permissions and disk space |

---

## Performance Guidelines

### Best Practices

1. **Batch Operations**: Group related operations to minimize overhead
2. **Caching**: Use built-in caching for repeated screen captures
3. **Timeouts**: Set appropriate timeouts based on operation complexity
4. **Resource Management**: Clean up overlays and temporary files

### Performance Benchmarks

| Operation Category | Expected Time | Memory Usage | CPU Usage |
|-------------------|---------------|---------------|-----------|
| Screen Capture | 50-200ms | 10-50MB | Low |
| OCR Text Extraction | 200-1000ms | 20-100MB | Medium |
| UI Element Detection | 300-1500ms | 30-150MB | High |
| Smart Interaction | 50-500ms | 5-20MB | Low |
| Workflow Execution | Variable | Variable | Variable |

### Optimization Tips

- Use region-specific captures instead of full screen when possible
- Cache OCR results for static content
- Implement retry logic with exponential backoff
- Monitor memory usage for long-running workflows

---

## Security Considerations

### Data Privacy

- All processing happens locally on the user's machine
- No data is transmitted to external servers
- Temporary files are automatically cleaned up
- Screenshots are stored only with user consent

### Access Control

- Operations require appropriate Windows permissions
- Registry operations are restricted to safe keys
- File operations respect Windows ACLs
- Service management requires administrative privileges

### Audit Logging

```typescript
interface AuditLog {
  timestamp: string;
  operation: string;
  user: string;
  parameters: Record<string, any>;
  result: 'success' | 'error';
  duration: number;
  metadata?: any;
}
```

Enable audit logging with:
```bash
GLASS_MCP_AUDIT_ENABLED=true
GLASS_MCP_AUDIT_FILE=./logs/glass-audit.log
```

---

## Integration Examples

### Custom MCP Client

```typescript
import { spawn } from 'child_process';

class GlassMCPClient {
  private server: any;
  private requestId: number = 1;

  constructor() {
    this.server = spawn('npx', ['@codai/glass-mcp'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
  }

  async callTool(toolName: string, operation: string, params: any = {}): Promise<any> {
    const request = {
      jsonrpc: '2.0',
      method: 'tools/call',
      id: this.requestId++,
      params: {
        name: toolName,
        arguments: {
          operation,
          ...params
        }
      }
    };

    this.server.stdin.write(JSON.stringify(request) + '\n');

    return new Promise((resolve, reject) => {
      this.server.stdout.once('data', (data: Buffer) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.error) {
            reject(new Error(response.error.message));
          } else {
            resolve(response.result);
          }
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  // Convenience methods
  async captureScreen(params?: any) {
    return this.callTool('glass_vision', 'capture_screen', params);
  }

  async smartClick(params: any) {
    return this.callTool('glass_interact', 'smart_click', params);
  }

  async executeWorkflow(workflowName: string, params?: any) {
    return this.callTool('glass_workflows', 'execute_workflow', { 
      workflowName, 
      parameters: params 
    });
  }
}
```

### Error Handling Example

```typescript
async function robustScreenCapture(client: GlassMCPClient, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await client.captureScreen();
      return result;
    } catch (error) {
      console.warn(`Screen capture attempt ${i + 1} failed:`, error.message);
      
      if (error.code === 'PERMISSION_DENIED') {
        throw new Error('Administrator privileges required for screen capture');
      }
      
      if (error.code === 'OPERATION_TIMEOUT') {
        // Increase timeout for next attempt
        await client.callTool('glass_vision', 'capture_screen', { 
          timeout: 10000 * (i + 1) 
        });
      }
      
      if (i === retries - 1) {
        throw error; // Final attempt failed
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

---

This API reference provides comprehensive documentation for all Glass MCP capabilities. For more examples and tutorials, visit our [GitHub repository](https://github.com/codai-ecosystem/codai-project/tree/main/packages/glass-mcp).
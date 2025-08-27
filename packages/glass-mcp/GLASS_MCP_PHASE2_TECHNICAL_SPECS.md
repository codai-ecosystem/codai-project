# 🔧 Glass MCP Phase 2 - Technical Specifications

## Overview

This document provides detailed technical specifications for the three consolidated tools to be implemented in Glass MCP v11.0: `glass_files`, `glass_processes`, and `glass_system`.

---

## 📁 `glass_files` - File System Operations

### Operation Specifications

#### `exists` Operation
**Purpose**: Check if a file or directory exists
```typescript
interface ExistsParams {
  path: string;                    // Target file/directory path
  checkType?: 'file' | 'directory' | 'any'; // Default: 'any'
}

interface ExistsResult {
  exists: boolean;
  type?: 'file' | 'directory';    // Only if exists=true
  size?: number;                   // File size in bytes (files only)
  modified?: string;               // ISO timestamp (if available)
}
```

**PowerShell Implementation**:
```powershell
$path = $params.path
$checkType = $params.checkType ?? 'any'

$item = Get-Item -Path $path -ErrorAction SilentlyContinue
if ($item) {
    $type = if ($item.PSIsContainer) { 'directory' } else { 'file' }
    
    if ($checkType -eq 'any' -or $checkType -eq $type) {
        @{
            exists = $true
            type = $type
            size = if ($type -eq 'file') { $item.Length } else { $null }
            modified = $item.LastWriteTime.ToString('o')
        }
    } else {
        @{ exists = $false }
    }
} else {
    @{ exists = $false }
}
```

#### `read` Operation
**Purpose**: Read text content from a file
```typescript
interface ReadParams {
  path: string;                    // Source file path
  encoding?: string;               // Default: 'utf8'
  maxSize?: number;                // Max file size in bytes (default: 10MB)
  offset?: number;                 // Start position (default: 0)
  length?: number;                 // Bytes to read (default: all)
}

interface ReadResult {
  content: string;
  size: number;                    // Actual file size
  encoding: string;                // Encoding used
  truncated?: boolean;             // True if content was truncated
}
```

**PowerShell Implementation**:
```powershell
$path = $params.path
$encoding = $params.encoding ?? 'utf8'
$maxSize = $params.maxSize ?? 10485760  # 10MB default

# Security validation
if (-not (Test-Path -Path $path -PathType Leaf)) {
    throw "File not found or is not a file: $path"
}

$item = Get-Item -Path $path
if ($item.Length -gt $maxSize) {
    throw "File size ($($item.Length)) exceeds maximum allowed size ($maxSize)"
}

try {
    $content = Get-Content -Path $path -Encoding $encoding -Raw
    @{
        content = $content
        size = $item.Length
        encoding = $encoding
        truncated = $false
    }
} catch {
    throw "Failed to read file: $($_.Exception.Message)"
}
```

#### `write` Operation
**Purpose**: Write text content to a file
```typescript
interface WriteParams {
  path: string;                    // Target file path
  content: string;                 // Content to write
  encoding?: string;               // Default: 'utf8'
  createDirs?: boolean;            // Create parent directories (default: false)
  append?: boolean;                // Append vs overwrite (default: false)
}

interface WriteResult {
  success: boolean;
  bytesWritten: number;
  created: boolean;                // True if file was created
  encoding: string;
}
```

#### `list` Operation
**Purpose**: List files and directories
```typescript
interface ListParams {
  path: string;                    // Directory path
  pattern?: string;                // Glob pattern (default: '*')
  recursive?: boolean;             // Recursive listing (default: false)
  includeHidden?: boolean;         // Include hidden files (default: false)
  sortBy?: 'name' | 'size' | 'modified'; // Sort order (default: 'name')
  maxResults?: number;             // Limit results (default: 1000)
}

interface ListResult {
  items: FileItem[];
  totalCount: number;              // Total items found
  truncated: boolean;              // True if results were limited
}

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;                   // Files only
  modified: string;                // ISO timestamp
  hidden: boolean;
}
```

### Security Features
- **Path Validation**: Prevent path traversal attacks
- **Restricted Directories**: Configurable blocked paths
- **File Size Limits**: Prevent memory exhaustion
- **Audit Logging**: Log all file operations

---

## ⚙️ `glass_processes` - Process Management

### Operation Specifications

#### `list` Operation
**Purpose**: List running processes with filtering
```typescript
interface ListProcessesParams {
  filter?: string;                 // Process name filter (supports wildcards)
  detailed?: boolean;              // Include resource usage (default: false)
  sortBy?: 'name' | 'cpu' | 'memory' | 'pid'; // Sort order (default: 'name')
  maxResults?: number;             // Limit results (default: 500)
  includeSystem?: boolean;         // Include system processes (default: true)
}

interface ListProcessesResult {
  processes: ProcessInfo[];
  totalCount: number;
  truncated: boolean;
  timestamp: string;               // When data was collected
}

interface ProcessInfo {
  pid: number;
  name: string;
  executablePath?: string;
  windowTitle?: string;            // Main window title if any
  startTime: string;               // ISO timestamp
  
  // Detailed info (if requested)
  cpuUsage?: number;               // CPU percentage
  memoryUsage?: number;            // Memory in bytes
  threadCount?: number;
  handleCount?: number;
}
```

**PowerShell Implementation**:
```powershell
$filter = $params.filter ?? '*'
$detailed = $params.detailed ?? $false
$sortBy = $params.sortBy ?? 'name'
$maxResults = $params.maxResults ?? 500

$processes = Get-Process -Name $filter -ErrorAction SilentlyContinue
if ($detailed) {
    $processes = $processes | Select-Object Id, ProcessName, Path, MainWindowTitle, StartTime, CPU, WorkingSet, Threads, HandleCount
} else {
    $processes = $processes | Select-Object Id, ProcessName, Path, MainWindowTitle, StartTime
}

# Apply sorting
switch ($sortBy) {
    'cpu' { $processes = $processes | Sort-Object CPU -Descending }
    'memory' { $processes = $processes | Sort-Object WorkingSet -Descending }  
    'pid' { $processes = $processes | Sort-Object Id }
    default { $processes = $processes | Sort-Object ProcessName }
}

# Limit results
$totalCount = $processes.Count
$truncated = $totalCount -gt $maxResults
$processes = $processes | Select-Object -First $maxResults

@{
    processes = $processes | ForEach-Object {
        @{
            pid = $_.Id
            name = $_.ProcessName
            executablePath = $_.Path
            windowTitle = $_.MainWindowTitle
            startTime = $_.StartTime.ToString('o')
            cpuUsage = if ($detailed) { $_.CPU } else { $null }
            memoryUsage = if ($detailed) { $_.WorkingSet } else { $null }
            threadCount = if ($detailed) { $_.Threads.Count } else { $null }
            handleCount = if ($detailed) { $_.HandleCount } else { $null }
        }
    }
    totalCount = $totalCount
    truncated = $truncated
    timestamp = (Get-Date).ToString('o')
}
```

#### `info` Operation
**Purpose**: Get detailed information about a specific process
```typescript
interface ProcessInfoParams {
  pid?: number;                    // Process ID
  name?: string;                   // Process name (if pid not provided)
  includeChildren?: boolean;       // Include child processes (default: false)
  includeModules?: boolean;        // Include loaded modules (default: false)
}

interface ProcessInfoResult {
  process: DetailedProcessInfo;
  children?: ProcessInfo[];        // If includeChildren=true
  modules?: ModuleInfo[];          // If includeModules=true
}

interface DetailedProcessInfo extends ProcessInfo {
  parentPid?: number;
  commandLine?: string;
  workingDirectory?: string;
  environmentVariables?: Record<string, string>;
  performance: {
    cpuTime: number;               // Total CPU time in milliseconds
    peakMemoryUsage: number;       // Peak memory usage in bytes
    ioOperations: number;          // Total I/O operations
  };
}
```

#### `monitor` Operation
**Purpose**: Monitor process resource usage over time
```typescript
interface MonitorParams {
  pid?: number;                    // Process ID
  name?: string;                   // Process name
  interval?: number;               // Sample interval in milliseconds (default: 1000)
  duration?: number;               // Monitoring duration in milliseconds (default: 10000)
  metrics?: ('cpu' | 'memory' | 'io' | 'threads')[]; // Metrics to collect
}

interface MonitorResult {
  processId: number;
  processName: string;
  samples: ProcessSample[];
  summary: MonitoringSummary;
}

interface ProcessSample {
  timestamp: string;
  cpuUsage?: number;
  memoryUsage?: number;
  ioOperations?: number;
  threadCount?: number;
}

interface MonitoringSummary {
  averageCpuUsage: number;
  peakMemoryUsage: number;
  totalSamples: number;
  duration: number;                // Actual monitoring duration
}
```

---

## 💻 `glass_system` - System Information

### Operation Specifications

#### `info` Operation
**Purpose**: Get comprehensive system information
```typescript
interface SystemInfoParams {
  detailed?: boolean;              // Include hardware details (default: false)
  includeNetwork?: boolean;        // Include network config (default: false)
  includeStorage?: boolean;        // Include disk information (default: false)
  includeSoftware?: boolean;       // Include installed software (default: false)
}

interface SystemInfoResult {
  basic: BasicSystemInfo;
  hardware?: HardwareInfo;         // If detailed=true
  network?: NetworkInfo;           // If includeNetwork=true
  storage?: StorageInfo;           // If includeStorage=true
  software?: SoftwareInfo;         // If includeSoftware=true
}

interface BasicSystemInfo {
  computerName: string;
  userName: string;
  domain?: string;
  osVersion: string;
  osArchitecture: string;
  systemUptime: number;            // Uptime in seconds
  timeZone: string;
  locale: string;
  lastBootTime: string;            // ISO timestamp
}

interface HardwareInfo {
  processor: {
    name: string;
    cores: number;
    threads: number;
    speed: number;                 // MHz
    architecture: string;
  };
  memory: {
    totalPhysical: number;         // Bytes
    availablePhysical: number;     // Bytes
    totalVirtual: number;          // Bytes
    availableVirtual: number;      // Bytes
  };
  graphics: {
    name: string;
    memory?: number;               // Bytes
    driverVersion?: string;
  }[];
}
```

#### `performance` Operation
**Purpose**: Get real-time system performance metrics
```typescript
interface PerformanceParams {
  metrics?: ('cpu' | 'memory' | 'disk' | 'network')[]; // Default: all
  interval?: number;               // Sample interval in ms (default: 1000)
  samples?: number;                // Number of samples (default: 5)
  includeProcesses?: boolean;      // Include top processes (default: false)
}

interface PerformanceResult {
  samples: PerformanceSample[];
  summary: PerformanceSummary;
  topProcesses?: ProcessInfo[];    // If includeProcesses=true
}

interface PerformanceSample {
  timestamp: string;
  cpu: {
    usage: number;                 // Overall CPU usage percentage
    perCore?: number[];            // Per-core usage if available
  };
  memory: {
    usage: number;                 // Memory usage percentage
    used: number;                  // Used memory in bytes
    available: number;             // Available memory in bytes
  };
  disk?: {
    readRate: number;              // Bytes per second
    writeRate: number;             // Bytes per second
    usage: number;                 // Disk usage percentage
  };
  network?: {
    bytesReceived: number;         // Bytes per second
    bytesSent: number;             // Bytes per second
    packetsReceived: number;       // Packets per second
    packetsSent: number;           // Packets per second
  };
}
```

#### `status` Operation
**Purpose**: Get system status and health information
```typescript
interface StatusParams {
  services?: boolean;              // Include Windows services (default: false)
  updates?: boolean;               // Include Windows Update status (default: false)
  security?: boolean;              // Include security status (default: false)
  eventLog?: boolean;              // Include recent event log entries (default: false)
}

interface StatusResult {
  systemHealth: 'healthy' | 'warning' | 'critical';
  issues: SystemIssue[];
  services?: ServiceInfo[];        // If services=true
  updates?: UpdateInfo;            // If updates=true
  security?: SecurityStatus;       // If security=true
  eventLog?: EventLogEntry[];      // If eventLog=true
}
```

#### `capabilities` Operation
**Purpose**: Detect system capabilities and features
```typescript
interface CapabilitiesParams {
  features?: ('uac' | 'hyperv' | 'wsl' | 'containers' | 'powershell')[];
  checkAdmin?: boolean;            // Check if running as administrator
  checkPermissions?: boolean;      // Check Glass MCP permissions
}

interface CapabilitiesResult {
  features: Record<string, boolean>;
  permissions: {
    isAdmin: boolean;
    canAccessFiles: boolean;
    canAccessProcesses: boolean;
    canAccessRegistry: boolean;
    canAccessNetwork: boolean;
  };
  limitations: string[];           // List of detected limitations
  recommendations: string[];       // Recommendations for optimal usage
}
```

---

## 🔧 Implementation Framework

### Consolidated Tool Base Class
```typescript
abstract class ConsolidatedTool {
  abstract name: string;
  abstract description: string;
  abstract operations: Record<string, OperationDefinition>;
  
  async execute(operation: string, params: any): Promise<any> {
    const operationDef = this.operations[operation];
    if (!operationDef) {
      throw new ConsolidatedToolError(
        this.name, 
        operation,
        'UNKNOWN_OPERATION',
        `Unknown operation: ${operation}. Available operations: ${Object.keys(this.operations).join(', ')}`
      );
    }
    
    // Validate parameters
    const validationResult = operationDef.validateParams(params);
    if (!validationResult.valid) {
      throw new ConsolidatedToolError(
        this.name,
        operation,
        'INVALID_PARAMETERS',
        `Parameter validation failed: ${validationResult.errors.join(', ')}`
      );
    }
    
    // Execute operation
    try {
      return await operationDef.handler(params);
    } catch (error) {
      throw new ConsolidatedToolError(
        this.name,
        operation,
        'EXECUTION_ERROR',
        error.message
      );
    }
  }
  
  generateSchema(): ToolSchema {
    return generateConsolidatedToolSchema(this);
  }
}
```

### Operation Definition Interface
```typescript
interface OperationDefinition {
  description: string;
  parameters: ParameterSchema;
  handler: (params: any) => Promise<any>;
  validateParams: (params: any) => ValidationResult;
  
  // Optional metadata
  examples?: OperationExample[];
  security?: SecurityRequirements;
  performance?: PerformanceHints;
}

interface ParameterSchema {
  [key: string]: {
    type: string;
    description: string;
    required?: boolean;
    default?: any;
    enum?: string[];
    minimum?: number;
    maximum?: number;
  };
}
```

### Security Framework
```typescript
interface SecurityRequirements {
  requiresAdmin?: boolean;
  restrictedPaths?: string[];
  auditLog?: boolean;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
}

class SecurityValidator {
  static validatePath(path: string, restrictedPaths: string[]): boolean {
    // Implement path validation logic
    return !restrictedPaths.some(restricted => 
      path.toLowerCase().startsWith(restricted.toLowerCase())
    );
  }
  
  static checkAdminRights(): boolean {
    // Check if running with administrator privileges
    return process.platform === 'win32' && 
           require('child_process').execSync('whoami /groups', { encoding: 'utf8' })
           .includes('S-1-16-12288'); // High integrity level
  }
}
```

### Performance Monitoring
```typescript
class PerformanceMonitor {
  static async measureOperation<T>(
    operation: () => Promise<T>,
    toolName: string,
    operationName: string
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();
    
    try {
      const result = await operation();
      const endTime = Date.now();
      const endMemory = process.memoryUsage();
      
      const metrics: PerformanceMetrics = {
        duration: endTime - startTime,
        memoryDelta: {
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
          external: endMemory.external - startMemory.external
        },
        toolName,
        operationName,
        timestamp: new Date().toISOString()
      };
      
      return { result, metrics };
    } catch (error) {
      // Log performance data even for failed operations
      throw error;
    }
  }
}
```

---

## 📋 Quality Assurance Specifications

### Testing Requirements

**Unit Testing Coverage:**
- Each operation must have 100% code path coverage
- Parameter validation testing for all edge cases
- Error handling testing for all failure scenarios
- Performance testing within acceptable limits

**Integration Testing:**
- Cross-tool operation compatibility
- Legacy tool routing validation
- MCP protocol compliance testing
- Windows version compatibility testing

**Security Testing:**
- Path traversal attack prevention
- Privilege escalation prevention
- Input sanitization validation
- Audit log integrity verification

### Performance Benchmarks

**Response Time Targets:**
- File operations: <50ms average
- Process operations: <100ms average
- System operations: <200ms average
- Monitoring operations: <500ms average

**Resource Usage Limits:**
- Memory baseline: <50MB per tool
- CPU usage: <5% during idle operations
- Disk I/O: Minimal impact on system performance
- Network usage: None unless explicitly requested

### Documentation Requirements

**API Documentation:**
- Complete parameter documentation with examples
- Error code reference with resolution steps
- Security considerations and best practices
- Performance characteristics and limitations

**Migration Documentation:**
- Legacy tool mapping with examples
- Breaking changes and compatibility notes
- Step-by-step migration instructions
- Troubleshooting guide for common issues

---

## 🎯 Success Criteria

### Technical Success Metrics
- All operations implement within performance benchmarks
- 100% test coverage across all tools and operations
- Zero security vulnerabilities in security audit
- Successful integration with existing Phase 1 tools

### User Experience Success Metrics
- Intuitive parameter structure consistent with Phase 1
- Comprehensive error messages with actionable guidance
- Complete documentation with working examples
- Smooth migration path from legacy tools

### Project Success Metrics
- On-time delivery within 4-month timeline
- Community acceptance and positive feedback
- Enterprise customer adoption and satisfaction
- Foundation established for future enhancements

---

*Technical Specifications Version: 1.0*  
*Date: August 27, 2025*  
*Target Implementation: Glass MCP v11.0*  
*Foundation: Phase 1 Success Patterns*
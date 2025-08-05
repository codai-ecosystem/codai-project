# 🚀 Portable CBD & MemorAI MCP Startup Scripts

Portable scripts to start CBD database and MemorAI MCP server from any folder location across different operating systems.

## 📋 Available Scripts

### Windows Scripts

#### PowerShell Script (Recommended)
- **File**: `start-cbd-memorai.ps1`
- **Features**: Full-featured with auto-detection, health checks, service management
- **Requirements**: PowerShell 5.1+ (Windows 10/11 included)

#### Batch Script (Simple)
- **File**: `start-cbd-memorai.bat`
- **Features**: Basic startup functionality
- **Requirements**: Windows Command Prompt

### Linux/Mac Script

#### Shell Script
- **File**: `start-cbd-memorai.sh`
- **Features**: Full-featured with auto-detection, health checks, service management
- **Requirements**: Bash shell, curl, lsof, tsx/node

## 🎯 Quick Start

### Windows (PowerShell - Recommended)
```powershell
# Copy the script anywhere you want
copy start-cbd-memorai.ps1 C:\temp\

# Run it
cd C:\temp
.\start-cbd-memorai.ps1
```

### Windows (Batch)
```cmd
# Copy the script anywhere you want
copy start-cbd-memorai.bat C:\temp\

# Run it
cd C:\temp
start-cbd-memorai.bat
```

### Linux/Mac
```bash
# Copy the script anywhere you want
cp start-cbd-memorai.sh /tmp/

# Make it executable (Linux/Mac only)
chmod +x /tmp/start-cbd-memorai.sh

# Run it
cd /tmp
./start-cbd-memorai.sh
```

## 🔧 Usage Options

All scripts support these common features:

### Auto-Detection
Scripts automatically detect your codai-project path by checking common locations:
- `~/codai-project`
- `~/GitHub/codai-project`
- `~/Projects/codai-project`
- `./codai-project` (relative paths)

### Manual Path Specification
```bash
# Specify custom path
./start-cbd-memorai.ps1 "C:\MyProjects\codai-project"
./start-cbd-memorai.sh "/home/user/custom/codai-project"
```

### Service Management

#### Check Status
```bash
./start-cbd-memorai.ps1 -Status
./start-cbd-memorai.sh --status
```

#### Stop Services
```bash
./start-cbd-memorai.ps1 -Stop
./start-cbd-memorai.sh --stop
```

#### Restart Services
```bash
./start-cbd-memorai.ps1 -Restart
./start-cbd-memorai.sh --restart
```

#### Verbose Logging
```bash
./start-cbd-memorai.ps1 -Verbose
./start-cbd-memorai.sh --verbose
```

### Help
```bash
./start-cbd-memorai.ps1 -Help
./start-cbd-memorai.sh --help
```

## 📊 Default Configuration

### Ports
- **CBD Database**: Port 8080
- **MemorAI MCP Server**: Port 4950

### Custom Ports
```bash
# PowerShell
./start-cbd-memorai.ps1 -CbdPort 9090 -MemoraiPort 5050

# Shell
./start-cbd-memorai.sh --cbd-port 9090 --memorai-port 5050
```

## 🔍 Health Checks

All scripts perform automatic health checks:
- **CBD Database**: `http://localhost:8080/health`
- **MemorAI MCP**: `http://localhost:4950/health`

Health check results are displayed in the startup summary.

## 📁 Auto-Detected Paths

Scripts check these common locations for codai-project:

### Windows
- `C:\Users\{username}\codai-project`
- `C:\Users\{username}\GitHub\codai-project`
- `C:\Users\{username}\Projects\codai-project`
- `.\codai-project` (current directory)
- `..\codai-project` (parent directory)

### Linux/Mac  
- `/home/{username}/codai-project`
- `/home/{username}/GitHub/codai-project`
- `/home/{username}/Projects/codai-project`
- `~/codai-project`
- `~/GitHub/codai-project`
- `~/Projects/codai-project`
- `./codai-project`
- `../codai-project`

## ⚠️ Prerequisites

### Windows
- PowerShell 5.1+ (included in Windows 10/11)
- Node.js with npm/tsx installed
- codai-project with packages/cbd and packages/memorai-mcp

### Linux/Mac
- Bash shell
- curl command
- lsof command  
- tsx/node installed
- codai-project with packages/cbd and packages/memorai-mcp

## 🔧 Environment Variables

The scripts automatically set these environment variables:

### CBD Database
```bash
CBD_PORT=8080
CBD_LOG_LEVEL=info (debug in verbose mode)
NODE_ENV=development
```

### MemorAI MCP Server
```bash
MEMORAI_API_KEY=memorai-dev-key-2025
MEMORAI_MCP_PORT=4950
PORT=4950
NODE_ENV=development
DEBUG=memorai:* (in verbose mode)
MEMORAI_DEBUG=true (in verbose mode)
MEMORAI_LOG_LEVEL=info (debug in verbose mode)
MEMORAI_CBD_PATH=./memorai-cbd-data
```

## 📝 Log Files

Services create log files in their respective directories:
- **CBD**: `packages/cbd/cbd.log`
- **MemorAI**: `packages/memorai-mcp/memorai.log`

## 🐛 Troubleshooting

### Port Already in Use
Scripts automatically kill processes on required ports before starting.

### Path Not Found
Ensure codai-project exists and contains:
- `packages/cbd/` directory
- `packages/memorai-mcp/` directory

### Permission Errors (Linux/Mac)
Make the script executable:
```bash
chmod +x start-cbd-memorai.sh
```

### PowerShell Execution Policy (Windows)
If you get execution policy errors:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 🎯 Examples

### Basic Usage
```bash
# Just run it - auto-detects everything
./start-cbd-memorai.ps1
```

### With Custom Path
```bash
# Specify custom project location
./start-cbd-memorai.ps1 "D:\MyCode\codai-project"
```

### Check if Services Are Running
```bash
# Quick status check
./start-cbd-memorai.ps1 -Status
```

### Restart Everything
```bash
# Stop and start fresh
./start-cbd-memorai.ps1 -Restart -Verbose
```

### Stop Services
```bash
# Clean shutdown
./start-cbd-memorai.ps1 -Stop
```

## 🚀 Success Output

When everything works correctly, you'll see:
```
🚀 CBD & MemorAI MCP Startup Script v1.0.0
=================================================
✅ Found codai-project at: [path]
✅ Project paths validated
✅ CBD Database started
✅ MemorAI MCP Server started
✅ CBD Database is healthy
✅ MemorAI MCP Server is healthy

🎉 Startup Complete!
=================================================
📊 Service Status:
  🗃️ CBD Database:
    - Port: 8080
    - Health: ✅ HEALTHY
    - URL: http://localhost:8080

  🧠 MemorAI MCP Server:
    - Port: 4950
    - Health: ✅ HEALTHY
    - URL: http://localhost:4950

🎯 All services are running successfully!
```

## 📞 Support

If you encounter issues:
1. Run with `-Verbose` or `--verbose` for detailed logging
2. Check the log files in the respective package directories
3. Ensure all prerequisites are installed
4. Verify the codai-project structure is correct

Happy coding! 🎉

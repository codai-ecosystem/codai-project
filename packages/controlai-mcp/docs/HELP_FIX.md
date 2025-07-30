# ControlAI MCP Help Command Fix

## Issue Fixed
The `controlai-mcp --help` command was failing with an Azure OpenAI configuration error because the server was trying to initialize all services immediately when the module loaded, even when just showing help.

## Solution
Modified `src/server.ts` to:

1. **Conditional Initialization**: Only initialize the ControlAI MCP Server when not in help mode
2. **Help Command**: Added proper `--help` and `-h` argument handling
3. **Graceful Help Display**: Show comprehensive help information without service initialization

## Changes Made
- Added command-line argument parsing
- Implemented help mode check before server initialization
- Added comprehensive help output with usage, features, and environment variables
- Made server instance nullable for proper shutdown handling

## Help Output
```bash
npx controlai-mcp --help
```

Shows:
- Usage instructions
- Available MCP tools description
- Required environment variables
- Feature overview
- GitHub repository link

## Testing
```bash
# This now works without Azure OpenAI configuration
npx controlai-mcp --help

# This requires proper environment configuration
npx controlai-mcp
```

## Version
Fixed in: `controlai-mcp@1.0.2`

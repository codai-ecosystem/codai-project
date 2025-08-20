# MemorAI MCP Server v9.5.1 - Bug Fix Release

🐛 **FIXED: Suggestions Bug** - Clean suggestion generation instead of repetitive query text

## What's Fixed

- **Suggestions Array Bug**: Fixed repetitive query text in suggestions
- **Intelligent Suggestions**: Implemented smart suggestion generation
- **Clean Output**: No more "query query query query" repetition

## Installation

```bash
npm install -g @codai/memorai-mcp@9.5.1
```

## Usage

```bash
memorai-mcp
```

## Tools Available

- `mcp_memoraimcp_recall` - Search and retrieve memories
- `mcp_memoraimcp_remember` - Store new memory
- `mcp_memoraimcp_forget` - Delete memory
- `mcp_memoraimcp_context` - Get recent context

## Bug Fix Details

The previous version (9.5.0) had a bug where the suggestions array would return:
```json
{
  "suggestions": [
    "test query test query test query test query",
    "test query test query test query test query test query"
  ]
}
```

Version 9.5.1 now returns clean suggestions:
```json
{
  "suggestions": [
    "test query progress",
    "test query status", 
    "test query update",
    "recent test query",
    "test query details"
  ]
}
```

## Performance

- Sub-15ms response times
- Agent-isolated memory spaces
- Vector semantic search
- High-performance key-value storage

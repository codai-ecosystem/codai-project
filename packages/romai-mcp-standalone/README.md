# ROMAI MCP Server - Standalone

A standalone Romanian AI Intelligence Model Context Protocol (MCP) server that provides Romanian language analysis, translation assistance, and cultural context tools.

## Features

- **Romanian Text Analysis**: Analyze Romanian text for sentiment, linguistic patterns, and structure
- **Translation Support**: Placeholder for Romanian translation with cultural context awareness  
- **Cultural Context**: Provide Romanian cultural insights and context for various topics
- **Standalone**: No external dependencies on workspace packages

## Installation

```bash
npx -y @codai/romai-mcp-standalone
```

## Usage with VS Code

Add to your MCP configuration:

```json
{
  "servers": {
    "RomaiMCP": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@codai/romai-mcp-standalone"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

## Tools Available

1. **analyze_romanian_text**: Analyze Romanian text for various patterns
2. **translate_to_romanian**: Translation assistance (placeholder for integration)
3. **romanian_culture_context**: Cultural context and insights

## Development

```bash
npm run build
npm publish --access public
```

## License

MIT - Part of the CODAI Project

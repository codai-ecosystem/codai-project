# MCP Server Template

Enterprise-grade Model Context Protocol (MCP) server template for the CODAI ecosystem. This template provides a standardized, production-ready foundation for building MCP servers with TypeScript, comprehensive testing, and Docker support.

## Features

- ✅ **TypeScript**: Full type safety and modern JavaScript features
- ✅ **MCP SDK Integration**: Built on the official Model Context Protocol SDK
- ✅ **Express.js**: HTTP server capabilities for hybrid MCP servers
- ✅ **Structured Logging**: Winston-based logging with configurable levels
- ✅ **Configuration Management**: Environment-based configuration with Zod validation
- ✅ **Testing Suite**: Comprehensive testing setup with Vitest
- ✅ **Code Quality**: ESLint, Prettier, and TypeScript strict mode
- ✅ **Docker Support**: Multi-stage Docker builds for production deployment
- ✅ **Security**: Built-in security headers, CORS, and rate limiting
- ✅ **Health Monitoring**: Health check endpoints and performance monitoring

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Docker (optional, for containerization)

### Installation

1. **Clone the template**
   ```bash
   cp -r templates/mcp-server-template my-mcp-server
   cd my-mcp-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Build and run**
   ```bash
   npm run build
   npm start
   
   # Or for development with hot reload
   npm run dev
   ```

## Project Structure

```
├── src/
│   ├── server.ts           # Main MCP server entry point
│   ├── config/
│   │   └── index.ts        # Configuration management
│   ├── utils/
│   │   └── logger.ts       # Logging utilities
│   └── types/
│       └── mcp.ts          # Type definitions
├── tests/
│   ├── setup.ts           # Test configuration
│   └── *.test.ts          # Test files
├── Dockerfile             # Docker configuration
├── vitest.config.ts       # Test configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

## Configuration

Environment variables are managed through `.env` files and validated using Zod schemas:

```env
NODE_ENV=development
SERVER_NAME=@codai/my-mcp-server
LOG_LEVEL=info
API_TIMEOUT=30000
ENABLE_CORS=true
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

## Adding Tools

To add new MCP tools, extend the `getTools()` and `executeTool()` methods:

```typescript
private getTools(): MCPTool[] {
  return [
    {
      name: 'my_custom_tool',
      description: 'Description of what this tool does',
      inputSchema: {
        type: 'object',
        properties: {
          param1: {
            type: 'string',
            description: 'Parameter description',
          },
        },
        required: ['param1'],
      },
    },
  ];
}

private async executeTool(name: string, args: unknown): Promise<any> {
  switch (name) {
    case 'my_custom_tool':
      return this.handleMyCustomTool(args);
    // ... other cases
  }
}
```

## Testing

The template includes a comprehensive testing setup:

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Code Quality

Maintain code quality with the included tools:

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type check
npm run type-check
```

## Docker Deployment

Build and run with Docker:

```bash
# Build image
npm run docker:build

# Run container
npm run docker:run

# Or use docker-compose for full stack
docker-compose up
```

## VS Code Integration

Add your MCP server to VS Code by creating a `.vscode/mcp.json` file:

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "node",
      "args": ["path/to/your/dist/server.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

## Advanced Features

### Custom Resources

Add MCP resources for file-based data:

```typescript
// In your server setup
this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "file://logs/application.log",
        name: "Application Logs",
        mimeType: "text/plain"
      }
    ]
  };
});
```

### Custom Prompts

Add reusable prompt templates:

```typescript
this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return {
    prompts: [
      {
        name: "analyze_code",
        description: "Analyze code quality and suggest improvements",
        arguments: [
          {
            name: "code",
            description: "Code to analyze",
            required: true
          }
        ]
      }
    ]
  };
});
```

## Performance Monitoring

The template includes built-in performance monitoring:

- Request/response timing
- Memory usage tracking
- Tool execution metrics
- Health check endpoints

## Security

Security features included:

- CORS configuration
- Rate limiting
- Input validation with Zod
- Security headers with Helmet
- Non-root Docker container

## Contributing

1. Follow the established code style (ESLint + Prettier)
2. Maintain test coverage above 80%
3. Add JSDoc comments for public APIs
4. Update documentation for new features

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create an issue in the CODAI project repository
- Check the VS Code MCP documentation
- Review the Model Context Protocol specification

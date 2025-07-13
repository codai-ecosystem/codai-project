# 📚 ROMAI Documentation

Welcome to the complete documentation for ROMAI - Romanian AI Central Intelligence System.

## Quick Navigation

### 🚀 Getting Started
- **[User Guide](user-guide.md)** - Complete guide for end users
- **[API Documentation](api.md)** - REST API reference and examples
- **[MCP Integration](mcp-integration.md)** - Model Context Protocol integration
- **[Deployment Guide](deployment.md)** - Production deployment instructions

### 📖 Table of Contents

#### For Users
1. **[User Guide](user-guide.md)**
   - Getting started with ROMAI
   - Web dashboard usage
   - Common use cases and examples
   - Troubleshooting and tips

#### For Developers  
2. **[API Documentation](api.md)**
   - Authentication and security
   - Endpoint reference
   - Request/response schemas
   - SDK examples (JavaScript, Python, cURL)

3. **[MCP Integration Guide](mcp-integration.md)**
   - Claude Desktop configuration
   - Available MCP tools
   - Integration examples
   - Troubleshooting MCP issues

#### For DevOps
4. **[Deployment Guide](deployment.md)**
   - Production readiness checklist
   - Docker deployment
   - Cloud deployment (GCP, Azure, AWS)
   - Monitoring and maintenance

## System Overview

ROMAI is a production-ready Romanian AI system with three main interfaces:

### 🌐 Web Dashboard
- **URL**: http://localhost:4000
- **Features**: Real-time chat, Romanian expert mode, system monitoring
- **Best For**: End users, testing, demonstrations

### 🔌 REST API
- **URL**: http://localhost:8000
- **Features**: JWT authentication, rate limiting, OpenAPI docs
- **Best For**: Application integration, automated systems

### 🤖 MCP Server
- **Protocol**: JSON-RPC over stdio
- **Features**: 5 specialized tools, Claude Desktop integration
- **Best For**: AI workflows, Claude Desktop, Cline integration

## Quick Start

### 1. Installation
```bash
git clone https://github.com/codai/romai.git
cd romai && pnpm install && pnpm build
```

### 2. Configuration  
```bash
cp .env.example .env
# Add your Azure OpenAI credentials
```

### 3. Start All Services
```bash
pnpm dev:all
```

### 4. Access ROMAI
- **Dashboard**: http://localhost:4000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Dashboard │    │    REST API     │    │   MCP Server    │
│   (Port 4000)   │    │   (Port 8000)   │    │    (stdio)      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴───────────┐
                    │     ROMAI Core          │
                    │   Intelligence Engine   │
                    └─────────────┬───────────┘
                                  │
                    ┌─────────────┴───────────┐
                    │    Azure OpenAI         │
                    │      (gpt-4o)           │
                    └─────────────────────────┘
```

## Key Features

### ✨ Romanian-First AI
- Native Romanian language understanding
- Cultural context awareness
- Regional variations support
- Historical and modern perspectives

### 🛡️ Production Ready
- JWT authentication and authorization
- Rate limiting and security headers
- Comprehensive error handling
- Health monitoring and logging

### ⚡ High Performance
- Optimized builds with Turbo
- Concurrent request handling
- Connection pooling
- Response caching

### 🔧 Developer Friendly
- Complete TypeScript support
- OpenAPI documentation
- Multiple SDK examples
- Comprehensive testing

## Usage Examples

### Romanian Cultural Questions
```bash
curl -X POST http://localhost:8000/romanian-expert \
  -H "Authorization: Bearer TOKEN" \
  -d '{"query": "Explică-mi tradițiile de Crăciun din România"}'
```

### General Intelligence
```bash
curl -X POST http://localhost:8000/intelligence \
  -H "Authorization: Bearer TOKEN" \
  -d '{"query": "Care sunt avantajele inteligenței artificiale?"}'
```

### Chat Interface
```bash
curl -X POST http://localhost:8000/chat \
  -H "Authorization: Bearer TOKEN" \
  -d '{"messages": [{"role": "user", "content": "Salut!"}]}'
```

## Production Deployment

### Environment Setup
```bash
# Production environment variables
AZURE_OPENAI_API_KEY=your-production-key
AZURE_OPENAI_ENDPOINT=https://your-prod.openai.azure.com/
NODE_ENV=production
JWT_SECRET=your-strong-secret
```

### Docker Deployment
```bash
docker build -t romai:latest .
docker run -d -p 8000:8000 -p 4000:4000 --env-file .env.prod romai:latest
```

### Health Verification
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy","timestamp":"..."}
```

## Monitoring

### Health Endpoints
- **API Health**: `GET /health`
- **Dashboard**: Visual health indicators
- **MCP Health**: `romai_health_check` tool

### Performance Metrics
- API response time: < 100ms (95th percentile)
- Concurrent requests: 1000+ RPS
- Uptime: 99.9% target

### Logging
- Structured JSON logging with Winston
- Error tracking and stack traces
- Request/response monitoring
- Performance analytics

## Security

### Authentication
- JWT tokens with configurable expiration
- Secure password hashing
- Rate limiting per IP/token

### Data Protection
- No sensitive data logging
- Secure Azure OpenAI communication
- Input validation and sanitization
- CORS protection

### Best Practices
- Environment variable validation
- Secure headers (Helmet.js)
- Regular security updates
- Dependency vulnerability scanning

## Contributing

### Development Setup
```bash
# Clone and setup
git clone https://github.com/codai/romai.git
cd romai && pnpm install

# Start development servers
pnpm dev:all

# Run tests
pnpm test

# Build for production
pnpm build
```

### Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Follow commit message conventions

## Support

### Documentation
- **User Questions**: [User Guide](user-guide.md)
- **API Issues**: [API Documentation](api.md)
- **Integration Help**: [MCP Guide](mcp-integration.md)
- **Deployment Issues**: [Deployment Guide](deployment.md)

### Contact
- **Email**: support@codai.ro
- **GitHub**: https://github.com/codai/romai
- **Issues**: https://github.com/codai/romai/issues

### Community
- **Discord**: Coming soon
- **Newsletter**: updates@codai.ro
- **Blog**: https://blog.codai.ro

---

**ROMAI - Inteligența Artificială Românească** 🇷🇴

Built with ❤️ by [CodAI Team](https://codai.ro)

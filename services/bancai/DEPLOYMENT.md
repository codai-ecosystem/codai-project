# Bancai Service - Production Deployment Guide

## Overview

Bancai is a financial platform service that integrates with the Codai ecosystem, providing authentication via LogAI and memory management via MemorAI.

## Docker Deployment

### Building the Production Image

```bash
# Build the Docker image
docker build -t bancai:latest .

# The build process includes:
# - Next.js production optimization
# - Static asset generation
# - Standalone output for minimal container size
```

### Running the Container

```bash
# Run with environment file
docker run -p 3003:3003 --env-file .env.docker bancai:latest

# Or with custom port mapping
docker run -p 3004:3003 --env-file .env.docker bancai:latest
```

### Environment Configuration

Create a `.env.docker` file with:

```env
NODE_ENV=production
PORT=3003
MEMORAI_API_URL=http://host.docker.internal:3001
LOGAI_API_URL=http://host.docker.internal:3002
CODAI_API_URL=http://host.docker.internal:3000
NEXT_PUBLIC_SERVICE_NAME=bancai
```

## Health Monitoring

### Health Check Endpoint

```bash
curl http://localhost:3003/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2025-06-23T21:36:41.026Z",
  "service": "bancai",
  "version": "0.1.0",
  "environment": "production",
  "port": 3003,
  "uptime": 0.770693124,
  "memory": {
    "rss": 72597504,
    "heapTotal": 24256512,
    "heapUsed": 16772744,
    "external": 2839494,
    "arrayBuffers": 65982
  },
  "dependencies": {
    "memorai": "not_configured",
    "logai": "not_configured"
  }
}
```

## API Endpoints

### Authentication

- `POST /api/auth/signin` - User authentication
- `POST /api/auth/signout` - User logout
- `GET /api/auth/me` - Current user info

### Financial APIs

- `GET /api/accounts` - User accounts
- `GET /api/transactions` - Transaction history
- `GET /api/insights` - AI-powered financial insights
- `GET /api/dashboard` - Dashboard data

### System

- `GET /api/health` - Service health check

## Docker Compose Integration

For full Codai ecosystem deployment:

```yaml
version: '3.8'
services:
  bancai:
    build: ./services/bancai
    ports:
      - '3003:3003'
    environment:
      - NODE_ENV=production
      - MEMORAI_API_URL=http://memorai:3001
      - LOGAI_API_URL=http://logai:3002
      - CODAI_API_URL=http://codai:3000
    depends_on:
      - memorai
      - logai
    healthcheck:
      test: ['CMD', 'node', 'healthcheck.js']
      interval: 30s
      timeout: 10s
      retries: 3
```

## Performance Features

### Next.js Production Optimizations

- Static generation where possible
- Automatic code splitting
- Image optimization
- Minification and compression

### Container Optimizations

- Multi-stage build for minimal image size
- Non-root user for security
- Standalone output mode
- Health check integration

## Monitoring and Debugging

### Container Logs

```bash
# View container logs
docker logs <container-id>

# Follow logs in real-time
docker logs -f <container-id>
```

### Performance Monitoring

- Memory usage via health endpoint
- Response times for API calls
- Docker container metrics

### Troubleshooting

#### Port Conflicts

If port 3003 is in use:

```bash
# Find process using port
netstat -ano | findstr :3003

# Use different port mapping
docker run -p 3004:3003 --env-file .env.docker bancai:latest
```

#### Memory Issues

- Monitor heap usage via health endpoint
- Adjust container memory limits if needed
- Check for memory leaks in logs

## Security Considerations

### Container Security

- Runs as non-root user (nextjs:1001)
- Minimal attack surface with Alpine Linux
- No unnecessary packages installed

### Network Security

- Internal service communication
- Environment variable configuration
- Health check validation

## Deployment Checklist

- [ ] Docker image builds successfully
- [ ] Container starts without errors
- [ ] Health endpoint responds correctly
- [ ] All API endpoints accessible
- [ ] Environment variables configured
- [ ] Dependencies (MemorAI, LogAI) reachable
- [ ] Monitoring and logging configured
- [ ] Backup and recovery procedures in place

## Support

For issues or questions:

1. Check container logs for errors
2. Verify environment configuration
3. Test health endpoint connectivity
4. Review Codai ecosystem status

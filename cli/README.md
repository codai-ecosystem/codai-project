# CODAI CLI

The official command-line interface for managing the CODAI ecosystem.

## Installation

```bash
# Install globally
npm install -g @codai/cli

# Or run directly with npx
npx @codai/cli
```

## Quick Start

```bash
# Check system status
codai status

# Start core services
codai start --core

# Start all services
codai start --all

# Health check
codai health --verbose

# Interactive mode
codai
```

## Commands

### Status Management
- `codai status` - Check status of all services
- `codai status --json` - Output status in JSON format
- `codai status --watch` - Continuously monitor status

### Service Control
- `codai start` - Interactive service startup
- `codai start --core` - Start core services (CBD, Gateway, Admin, ID, Hub)
- `codai start --all` - Start all services
- `codai start -s <service>` - Start specific service
- `codai stop` - Interactive service shutdown
- `codai stop --all` - Stop all services
- `codai stop -s <service>` - Stop specific service

### Health & Monitoring
- `codai health` - Comprehensive health check
- `codai health --verbose` - Detailed health report
- `codai logs -s <service>` - View service logs
- `codai logs -s <service> --follow` - Follow log output

### Testing & Deployment
- `codai test` - Run test suites
- `codai test -s <service>` - Test specific service
- `codai test -t <type>` - Run specific test type (unit|integration|e2e)
- `codai deploy` - Deploy to production
- `codai deploy -e <env>` - Deploy to specific environment

## Services

The CLI manages the following CODAI services:

| Service | Port | Description |
|---------|------|-------------|
| Gateway | 4003 | API Gateway & Load Balancer |
| Admin | 4007 | Admin Dashboard |
| ID | 4004 | Identity & Authentication Service |
| Hub | 4008 | Service Orchestration Hub |
| CODAI | 4001 | Main CODAI Application |
| BancAI | 4005 | Banking AI Service |
| MemorAI | 4006 | Memory Management Service |
| CBD | 4180 | Universal Database |
| ControlAI | 4200 | Control Dashboard |
| RomAI | 6100 | Romanian AI Service |

## Configuration

The CLI automatically detects your CODAI installation and configures service endpoints. No manual configuration required.

## Development

```bash
# Clone and setup
git clone <repo>
cd cli
pnpm install

# Development mode
pnpm dev

# Build
pnpm build

# Install locally
pnpm install-global
```

## Examples

### Basic Operations
```bash
# Check what's running
codai status

# Start the core platform
codai start --core

# Check detailed health
codai health --verbose

# Stop everything
codai stop --all
```

### Service-Specific Operations
```bash
# Start just the admin dashboard
codai start -s admin

# Check gateway logs
codai logs -s gateway --follow

# Test the ID service
codai test -s id -t integration

# Stop the database
codai stop -s cbd
```

### Production Operations
```bash
# Production health check
codai health --verbose

# Deploy to staging
codai deploy -e staging

# Monitor system continuously
codai status --watch
```

## Troubleshooting

### Common Issues

**Services won't start:**
- Check if ports are already in use
- Ensure dependencies are installed (`pnpm install`)
- Verify workspace structure

**Health checks fail:**
- Ensure services have started completely (may take 30-60 seconds)
- Check network connectivity
- Verify service configurations

**Permission errors:**
- Run with appropriate permissions
- Check file system permissions
- Ensure ports are available

### Getting Help

```bash
# Show detailed help
codai help

# Command-specific help
codai start --help
codai health --help
```

## API

The CLI can also be used as a Node.js module:

```typescript
import { CODAI } from '@codai/cli';

const cli = new CODAI();

// Check status
const status = await cli.getStatus();

// Start services
await cli.startService('admin');

// Health check
const health = await cli.healthCheck();
```

## License

MIT - See LICENSE file for details.

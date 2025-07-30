# 🎼 Codai Development Orchestrator CLI

The Codai Development Orchestrator is a comprehensive CLI tool for managing all development services in the Codai ecosystem. It provides an interactive, table-based interface for monitoring and controlling your development environment.

## 🚀 Features

- **Interactive Service Management**: Real-time updateable table showing service status
- **Individual Service Control**: Start, stop, and restart services individually
- **Bulk Operations**: Start/stop multiple services with confirmation prompts
- **Port Conflict Detection**: Automatic port availability checking
- **Process Health Monitoring**: Track service uptime, PID, and status
- **Service Discovery**: Automatically discovers all apps and services in the workspace

## 📋 Installation

The orchestrator is already installed with the project dependencies. No additional setup required.

## 🎯 Usage

### Quick Start

```bash
# Start the interactive orchestrator
pnpm orchestrator

# Or use the direct command
node scripts/orchestrator-cli.js
```

### Available Commands

#### Interactive Mode (Recommended)
```bash
# Launch interactive mode with live status table
pnpm orchestrator
# or
pnpm orchestrator:interactive
```

#### Service Management Commands
```bash
# Start a specific service
pnpm start:service codai
node scripts/orchestrator-cli.js start codai

# Stop a specific service
node scripts/orchestrator-cli.js stop codai

# Restart a specific service
node scripts/orchestrator-cli.js restart codai
```

#### Information Commands
```bash
# Show current status of all services
pnpm orchestrator:status

# List all available services
pnpm orchestrator:list

# Show status table
node scripts/orchestrator-cli.js status
```

## 🖥️ Interactive Mode Features

When you run the orchestrator in interactive mode, you get:

### Real-time Status Table
```
┌───────────────┬────────┬────────────┬────────┬────────┬──────────┬─────────────────────────────────┐
│ Service       │ Type   │ Status     │ Port   │ PID    │ Uptime   │ Description                     │
├───────────────┼────────┼────────────┼────────┼────────┼──────────┼─────────────────────────────────┤
│ codai         │ app    │ 🟢 running │ 5000   │ 12345  │ 2m 15s   │ AI-native development environ…  │
│ memorai       │ app    │ ⚪ stopped │ 5002   │ -      │ N/A      │ AI-powered memory and knowle…   │
│ bancai        │ app    │ 🟡 starting│ 5004   │ 12346  │ 5s       │ AI-powered banking platform     │
└───────────────┴────────┴────────────┴────────┴────────┴──────────┴─────────────────────────────────┘
```

### Interactive Menu Options

1. **🚀 Start service** - Select and start a stopped service
2. **🛑 Stop service** - Select and stop a running service  
3. **🔄 Restart service** - Select and restart any service
4. **📊 Refresh status** - Manually refresh the status table
5. **🚀 Start multiple services** - Select multiple services to start
6. **🛑 Stop all services** - Stop all running services (with confirmation)
7. **🔄 Restart all services** - Restart all running services (with confirmation)
8. **❌ Exit** - Exit the orchestrator

### Status Indicators

- 🟢 **Running** - Service is running normally
- 🟡 **Starting** - Service is in the process of starting
- ⚪ **Stopped** - Service is not running
- 🔴 **Error** - Service encountered an error
- 🟣 **Port Conflict** - Service couldn't start due to port conflict

## 🔧 Configuration

### Service Discovery

The orchestrator automatically discovers services by:

1. **Apps**: Scanning `apps/*/package.json` files
2. **Services**: Scanning `services/*/package.json` files (if directory exists)

### Port Detection

Ports are automatically detected from package.json scripts using these patterns:
- `-p 5000` or `--port 5000` flags
- `PORT=5000` environment variables

### Service Requirements

For a service to be manageable by the orchestrator, it needs:
- A `package.json` file in its directory
- A `dev` or `start` script defined
- Optional: A port specification for conflict detection

## 📊 Service Status

The orchestrator tracks the following information for each service:

- **Name**: Service identifier
- **Type**: `app` or `service`
- **Status**: Current operational state
- **Port**: Configured port number (or 'auto')
- **PID**: Process ID when running
- **Uptime**: Time since service started
- **Description**: From package.json description field

## 🛠️ Advanced Usage

### Starting Multiple Services with Confirmation

```bash
# Interactive selection with confirmation
pnpm orchestrator
# Choose "Start multiple services"
# Select desired services from checkbox list
# Confirm with Y/n prompt
```

### Bulk Operations

All bulk operations (start multiple, stop all, restart all) require explicit confirmation to prevent accidental disruption of your development environment.

### Port Conflict Handling

If a service fails to start due to a port conflict:
1. The status will show 🟣 **Port Conflict**
2. Check what's using the port: `netstat -ano | findstr :5000`
3. Either stop the conflicting service or change the port in package.json

## 🔍 Troubleshooting

### Common Issues

#### Service Won't Start
1. Check if the service directory exists
2. Verify package.json has a `dev` or `start` script
3. Check for port conflicts
4. Review service dependencies

#### Port Already in Use
```bash
# Find what's using a port
netstat -ano | findstr :5000

# Kill process by PID (replace 12345 with actual PID)
taskkill /PID 12345 /F
```

#### Service Status Not Updating
- The table refreshes every 3 seconds automatically
- Use "Refresh status" option in interactive mode
- Exit and restart the orchestrator if needed

### Debug Mode

For detailed debugging, you can check the service logs directly:

```bash
cd apps/codai
pnpm dev
# Watch the console output for errors
```

## 📈 Performance

The orchestrator is designed for efficiency:
- **Service Discovery**: ~100ms for 43 services
- **Status Updates**: Real-time every 3 seconds
- **Port Checking**: ~1 second timeout per service
- **Memory Usage**: Minimal footprint with process tracking

## 🔄 Integration with Existing Scripts

The orchestrator works alongside existing project scripts:

```json
{
  "scripts": {
    "dev": "turbo dev --concurrency=80",           // Starts all services
    "orchestrator": "node scripts/orchestrator-cli.js",  // Interactive control
    "start:service": "node scripts/orchestrator-cli.js start"  // Individual control
  }
}
```

## 🎯 Best Practices

### Development Workflow

1. **Start Development**:
   ```bash
   pnpm orchestrator
   # Start only the services you need
   ```

2. **Add Services Gradually**:
   - Start core services first (codai, memorai, id)
   - Add additional services as needed
   - Monitor resource usage

3. **Clean Shutdown**:
   - Use "Stop all services" in interactive mode
   - Or Ctrl+C to gracefully shutdown

### Resource Management

- Start services on-demand rather than all at once
- Monitor service uptime and restart if needed
- Use port checking to avoid conflicts

## 🔮 Future Enhancements

Planned features for future releases:

- **Service Dependencies**: Automatic dependency ordering
- **Health Checks**: Advanced service health monitoring  
- **Log Aggregation**: Centralized log viewing
- **Performance Metrics**: Resource usage monitoring
- **Service Templates**: Quick service generation
- **Docker Integration**: Container-based services
- **Remote Services**: SSH-based remote service management

## 💡 Tips

- Use interactive mode for daily development
- Keep the status table open in a dedicated terminal
- Start services incrementally to manage resources
- Use the list command to see all available services
- Set up service descriptions in package.json for better overview

---

The Orchestrator CLI makes managing the complex Codai ecosystem simple and intuitive. Happy coding! 🚀

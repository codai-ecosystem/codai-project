# Port Policy Enforcement

## Overview

To maintain consistency and avoid conflicts, all development services in the Codai ecosystem must use ports **4000 or higher**. This policy ensures that:

- Development ports don't conflict with common system services (ports 1-3999)
- There's clear separation between development and production environments
- Port assignments are predictable and well-organized

## Port Assignment Strategy

### Port Ranges

- **4000-4049**: Core applications (codai, memorai, logai, bancai, etc.)
- **4050-4099**: Infrastructure services (admin, docs, monitoring, etc.)
- **4100-4199**: Monitoring and analytics tools
- **4200-4299**: Development tools and utilities

### Current Port Assignments

The complete list of port assignments is maintained in `projects.index.json`:

```json
{
  "portConfiguration": {
    "portRange": "4000-4099",
    "totalPorts": 100,
    "coreAppPorts": "4000-4049",
    "servicePorts": "4050-4099"
  }
}
```

## Enforcement

### Automated Checking

The port policy is enforced through several mechanisms:

1. **Pre-commit Hook**: Automatically checks port compliance before each commit
2. **CI/CD Pipeline**: Validates port configuration in build process
3. **Manual Verification**: Run `pnpm ports:check` at any time

### Scripts Available

```bash
# Check for port policy violations
pnpm ports:check

# Automatically fix package.json violations
pnpm ports:fix
```

### What Gets Checked

The enforcement script examines:

- `package.json` files for `--port` flags in dev/start scripts
- Docker Compose files for port mappings
- `projects.index.json` for service port assignments
- Environment variable configurations

## Adding New Services

When adding a new service:

1. **Choose an available port** from the appropriate range
2. **Update package.json** with explicit port assignment:
   ```json
   {
     "scripts": {
       "dev": "next dev --port 4XXX",
       "start": "next start --port 4XXX"
     }
   }
   ```
3. **Update projects.index.json** with the new service entry
4. **Update Docker configurations** if applicable
5. **Run verification**: `pnpm ports:check`

## Common Violations and Fixes

### Package.json Scripts

❌ **Violation:**
```json
{
  "scripts": {
    "dev": "next dev"  // Uses default port 3000
  }
}
```

✅ **Fixed:**
```json
{
  "scripts": {
    "dev": "next dev --port 4030"
  }
}
```

### Docker Compose

❌ **Violation:**
```yaml
services:
  app:
    ports:
      - "3000:3000"  # Host port below 4000
```

✅ **Fixed:**
```yaml
services:
  app:
    ports:
      - "4030:3000"  # Host port 4000+
```

### VS Code Tasks

❌ **Violation:**
```json
{
  "command": "pnpm",
  "args": ["dev", "--port", "3000"]
}
```

✅ **Fixed:**
```json
{
  "command": "pnpm",
  "args": ["dev", "--port", "4030"]
}
```

## Troubleshooting

### Port Already in Use

If you encounter "port already in use" errors:

1. Check what's running on the port: `netstat -an | grep :4XXX`
2. Kill the process if needed: `taskkill /F /PID <pid>` (Windows) or `kill -9 <pid>` (Unix)
3. Use a different port in the assigned range

### Next.js Default Behavior

Next.js defaults to port 3000. Always specify the port explicitly:

```bash
# Development
next dev --port 4XXX

# Production
next start --port 4XXX
```

### Environment Variables

Some services use environment variables for port configuration:

```bash
PORT=4XXX npm run dev
```

Make sure these are also >= 4000.

## Integration with CI/CD

The port policy is integrated into our build process:

1. **Pre-commit**: Validates before code is committed
2. **PR Checks**: Runs validation on pull requests
3. **Deployment**: Ensures production deployments follow policy

## Exceptions

In rare cases where exceptions are needed:

1. **Document the reason** in code comments
2. **Get approval** from the development team
3. **Add to exclusion list** in the enforcement script

## Benefits

This policy provides:

- **Consistency**: All developers use the same port ranges
- **Predictability**: Easy to find services by their assigned ports
- **Conflict Prevention**: No more "port already in use" errors
- **Production Readiness**: Clear separation from system services
- **Scale**: Room for growth with 1000+ available ports

## Related Files

- `scripts/enforce-port-policy.js` - Main enforcement script
- `projects.index.json` - Port assignment registry
- `.githooks/pre-commit` - Git hook for automatic checking
- `.vscode/tasks.json` - VS Code task configurations
- `docker-compose*.yml` - Docker service configurations

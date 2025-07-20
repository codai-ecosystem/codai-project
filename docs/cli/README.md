# 🛠️ Universal CLI Documentation

**Complete command-line interface guide for the CODAI ecosystem - powerful CLI tools for all services.**

## 📋 Overview

The CODAI CLI provides unified command-line access to all ecosystem services:
- **Single CLI Tool**: One command-line interface for all CODAI services
- **Consistent Commands**: Standardized command structure across all services
- **Interactive Mode**: Rich interactive prompts and wizards
- **Authentication Integration**: Seamless authentication across all commands
- **Configuration Management**: Centralized configuration and profiles
- **Scripting Support**: Perfect for automation and CI/CD pipelines

## 🏗️ CLI Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   codai-cli     │────│    Commands     │────│  CODAI APIs     │
│   (Main CLI)    │    │  (Subcommands)  │    │  (All Services) │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Authentication  │    │ Configuration   │    │  Profiles &     │
│ Session Mgmt    │    │ Validation      │    │  Environments   │
│ Auto-complete   │    │ Help System     │    │  Aliases        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Installation

### Global Installation

```bash
# Install globally
npm install -g @codai/cli

# Verify installation
codai --version
# Output: @codai/cli v2.0.0

# Check available commands
codai --help
```

### Project-specific Installation

```bash
# Install in project
npm install --save-dev @codai/cli

# Use with npx
npx codai --version

# Add to package.json scripts
{
  "scripts": {
    "codai": "codai",
    "deploy": "codai deploy production"
  }
}
```

## 🔧 Initial Setup

### Authentication

```bash
# Login to CODAI ecosystem
codai auth login
# Interactive prompts for email/password
# Stores authentication token locally

# Login with API key
codai auth login --api-key YOUR_API_KEY

# Check authentication status
codai auth status
# Output: Authenticated as: user@example.com

# Logout
codai auth logout
```

### Configuration

```bash
# Initialize configuration
codai config init
# Creates ~/.codai/config.json

# Set default configurations
codai config set default-project my-project
codai config set default-environment production
codai config set api-timeout 30000

# View current configuration
codai config list
# Output: Configuration at ~/.codai/config.json

# View specific setting
codai config get default-project
```

### Profiles

```bash
# Create profiles for different environments
codai profile create development --api-url https://dev-api.codai.ro
codai profile create staging --api-url https://staging-api.codai.ro
codai profile create production --api-url https://api.codai.ro

# Switch between profiles
codai profile use production

# List profiles
codai profile list
# * production (active)
#   staging  
#   development
```

## 📚 Command Structure

### Universal Command Pattern

```bash
# General pattern
codai [global-options] <service> <resource> <action> [options] [arguments]

# Examples
codai projects create "My New Project"
codai auth users list --limit 10
codai memorai data search "user profiles"
codai bancai accounts balance --account-id 123
```

### Global Options

```bash
# Available for all commands
codai --help                    # Show help
codai --version                # Show version
codai --profile development    # Use specific profile  
codai --output json           # Output format (json, table, yaml)
codai --verbose               # Verbose logging
codai --dry-run              # Show what would happen without executing
codai --config /path/config  # Use specific config file
```

## 🎯 Core Service Commands

### Authentication Commands

```bash
# User authentication
codai auth login [options]
codai auth logout
codai auth status
codai auth refresh-token

# User management
codai auth users list [options]
codai auth users create --email user@example.com --name "User Name"
codai auth users update USER_ID --name "Updated Name"
codai auth users delete USER_ID

# Profile management  
codai auth profile show
codai auth profile update --name "New Name"
codai auth password change
```

### Project Management (CODAI)

```bash
# Project operations
codai projects list [options]
codai projects create PROJECT_NAME [options]
codai projects show PROJECT_ID
codai projects update PROJECT_ID [options]
codai projects delete PROJECT_ID

# Project templates
codai templates list
codai templates show TEMPLATE_ID
codai projects create "My App" --template react-typescript

# Code generation
codai generate component UserCard --type react --style tailwind
codai generate api user-service --database postgresql
codai generate page dashboard --layout admin
```

### Database Operations (MEMORAI)

```bash
# Data management
codai memorai entities list TYPE [options]
codai memorai entities create TYPE --data '{"name":"value"}'
codai memorai entities show TYPE ENTITY_ID
codai memorai entities update TYPE ENTITY_ID --data '{"field":"value"}'
codai memorai entities delete TYPE ENTITY_ID

# Search operations
codai memorai search "query string" [options]
codai memorai search --type users --filter '{"active":true}'

# Database operations
codai memorai backup create --name backup-$(date)
codai memorai backup restore BACKUP_ID
codai memorai migrate up
codai memorai seed run
```

### File Management

```bash
# File operations
codai files list [options]
codai files upload LOCAL_PATH [options]
codai files download FILE_ID LOCAL_PATH
codai files delete FILE_ID

# Bulk operations
codai files sync DIRECTORY --remote-path /projects/assets
codai files bulk-upload DIRECTORY --pattern "*.jpg"
```

### Service Discovery (HUB)

```bash
# Service management
codai hub services list
codai hub services show SERVICE_NAME
codai hub services health SERVICE_NAME
codai hub services logs SERVICE_NAME [options]

# Load balancing
codai hub lb status
codai hub lb config show
codai hub lb config update --file config.json
```

## 💼 Business Service Commands

### Financial Services (BANCAI)

```bash
# Account management
codai bancai accounts list
codai bancai accounts create --type checking --currency USD
codai bancai accounts balance ACCOUNT_ID
codai bancai accounts transactions ACCOUNT_ID [options]

# Transaction operations
codai bancai transactions create --from ACCOUNT_ID --to ACCOUNT_ID --amount 100.00
codai bancai transactions list [options]
codai bancai transactions show TRANSACTION_ID

# Payment processing
codai bancai payments process --amount 250.00 --method card --card-token TOKEN
codai bancai payments refund PAYMENT_ID --amount 50.00
```

### E-commerce (CUMPARAI)

```bash
# Product management
codai cumparai products list [options]
codai cumparai products create --name "Product Name" --price 29.99
codai cumparai products import --file products.csv
codai cumparai products export --format csv

# Order management
codai cumparai orders list [options]
codai cumparai orders show ORDER_ID
codai cumparai orders update ORDER_ID --status shipped
codai cumparai orders refund ORDER_ID --amount 15.00

# Inventory tracking
codai cumparai inventory list
codai cumparai inventory update PRODUCT_ID --quantity 100
codai cumparai inventory alert --low-stock-threshold 10
```

### Learning Platform (STUDIAI)

```bash
# Course management
codai studiai courses list
codai studiai courses create --title "Course Title" --file course.json
codai studiai courses publish COURSE_ID
codai studiai courses analytics COURSE_ID

# Student management
codai studiai students list [options]
codai studiai students enroll STUDENT_ID COURSE_ID
codai studiai students progress STUDENT_ID COURSE_ID
codai studiai students certificate STUDENT_ID COURSE_ID

# Content operations
codai studiai content upload --course COURSE_ID --file video.mp4
codai studiai content generate --type quiz --topic "TypeScript Basics"
```

## 🔧 Development & Deployment

### Development Workflow

```bash
# Initialize new project
codai init
# Interactive wizard for project setup

# Development server
codai dev start [options]
codai dev status
codai dev stop
codai dev restart

# Build operations
codai build --environment production
codai build --watch
codai build clean

# Testing
codai test run [options]
codai test coverage
codai test e2e
```

### Deployment Commands

```bash
# Environment management
codai env list
codai env create staging --clone-from development
codai env switch production
codai env vars list [ENV]
codai env vars set ENV KEY=value

# Deployment operations
codai deploy [environment] [options]
codai deploy production --build --migrate
codai deploy status production
codai rollback production --to-version v1.2.3

# Infrastructure management
codai infra status
codai infra scale SERVICE_NAME --replicas 3
codai infra logs SERVICE_NAME --tail 100
```

## 🤖 AI & Automation

### AI-Powered Commands

```bash
# Code generation
codai ai generate component --description "User profile with avatar"
codai ai generate api --spec openapi.yaml
codai ai optimize --file app.js --target performance

# Content creation
codai ai write blog --topic "Web Development Best Practices"
codai ai translate content.md --to romanian
codai ai summarize document.pdf

# Analysis and insights
codai ai analyze codebase --report security
codai ai recommend --context "e-commerce performance"
codai ai debug --error-log error.log
```

### Automation & Scripting

```bash
# Workflow automation
codai workflow create --file workflow.yaml
codai workflow run WORKFLOW_NAME
codai workflow list --status active
codai workflow logs WORKFLOW_ID

# Scheduled tasks
codai schedule create "Daily Backup" --cron "0 2 * * *" --command "codai memorai backup create"
codai schedule list
codai schedule disable SCHEDULE_ID

# Batch operations
codai batch process --file operations.json
codai batch status BATCH_ID
codai batch retry BATCH_ID --failed-only
```

## 📊 Monitoring & Analytics

### System Monitoring

```bash
# Health checks
codai health check [service]
codai health status --all-services
codai health monitor --interval 30s

# Performance monitoring
codai monitor metrics [service] [options]
codai monitor alerts list
codai monitor alerts create --file alert.json

# Log management
codai logs tail SERVICE_NAME [options]
codai logs search "ERROR" --since 1h
codai logs export --service api --format json --output logs.json
```

### Analytics & Reporting

```bash
# Usage analytics
codai analytics usage --service codai --period 7d
codai analytics users --active --period 30d
codai analytics performance --endpoint /api/projects

# Custom reports
codai reports generate --template monthly --output report.pdf
codai reports schedule --template usage --cron "0 9 1 * *"
codai reports list --type automated
```

## 🔧 Interactive Mode

### Interactive Commands

```bash
# Start interactive mode
codai interactive
# or
codai -i

# Interactive project creation
codai projects create --interactive
# Step-by-step wizard with validation

# Interactive configuration
codai config --interactive
# Guided configuration setup

# Interactive deployment
codai deploy --interactive
# Deployment wizard with safety checks
```

### Auto-completion

```bash
# Install auto-completion (bash)
codai completion bash >> ~/.bashrc
source ~/.bashrc

# Install auto-completion (zsh)
codai completion zsh >> ~/.zshrc
source ~/.zshrc

# Install auto-completion (fish)
codai completion fish > ~/.config/fish/completions/codai.fish
```

## 🧪 Testing & Validation

### Testing Commands

```bash
# Run tests for CLI commands
codai test cli
codai test integration --service auth
codai test e2e --environment staging

# Validate configurations
codai validate config
codai validate environment production
codai validate deployment --dry-run

# Performance testing
codai perf test --endpoints api-endpoints.txt
codai perf benchmark --service memorai
```

### Debugging

```bash
# Debug mode
codai --debug command args

# Verbose output
codai --verbose command args

# Dry run mode
codai --dry-run deploy production

# Show API requests
codai --trace api-calls projects list
```

## 📝 Configuration Files

### Global Configuration

```json
// ~/.codai/config.json
{
  "defaultProfile": "production",
  "defaultProject": "my-project",
  "apiTimeout": 30000,
  "maxRetries": 3,
  "outputFormat": "table",
  "editor": "code",
  "profiles": {
    "development": {
      "apiUrl": "https://dev-api.codai.ro",
      "authToken": "dev-token"
    },
    "production": {
      "apiUrl": "https://api.codai.ro", 
      "authToken": "prod-token"
    }
  }
}
```

### Project Configuration

```json
// codai.config.json (project root)
{
  "project": {
    "name": "my-awesome-app",
    "type": "web-application",
    "template": "react-typescript"
  },
  "services": {
    "auth": {
      "provider": "codai-auth",
      "config": {
        "jwtExpiration": "24h"
      }
    },
    "database": {
      "provider": "memorai",
      "config": {
        "cache": true,
        "realTimeSync": true
      }
    }
  },
  "deployment": {
    "production": {
      "platform": "vercel",
      "domain": "myapp.com",
      "environment": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

## 🔌 Plugins & Extensions

### Plugin Management

```bash
# List available plugins
codai plugins list --available

# Install plugin
codai plugins install @codai/cli-plugin-docker

# List installed plugins
codai plugins list --installed

# Update plugins
codai plugins update
codai plugins update @codai/cli-plugin-docker

# Remove plugin
codai plugins remove @codai/cli-plugin-docker
```

### Creating Custom Commands

```bash
# Generate plugin template
codai plugins create my-custom-plugin

# Register custom command
codai plugins register ./my-plugin.js

# Custom command structure
#!/usr/bin/env node
// my-plugin.js
module.exports = {
  command: 'custom <action>',
  describe: 'Custom command description',
  handler: async (argv) => {
    console.log('Custom command executed:', argv.action);
  }
};
```

## 📊 Output Formats

### Format Options

```bash
# Table format (default)
codai projects list
# ┌──────┬─────────────────┬─────────────┬─────────────────┐
# │ ID   │ Name           │ Status      │ Created         │
# ├──────┼─────────────────┼─────────────┼─────────────────┤
# │ 1    │ My Project     │ active      │ 2025-07-19      │
# └──────┴─────────────────┴─────────────┴─────────────────┘

# JSON format
codai projects list --output json
# [{"id": "1", "name": "My Project", "status": "active"}]

# YAML format  
codai projects list --output yaml
# - id: '1'
#   name: My Project
#   status: active

# CSV format
codai projects list --output csv
# id,name,status,created
# 1,My Project,active,2025-07-19
```

### Output Filtering

```bash
# Filter output with JQ-like syntax
codai projects list --filter '.[] | select(.status == "active")'

# Select specific fields
codai projects list --fields id,name,status

# Sort output
codai projects list --sort name
codai projects list --sort -created # Descending
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Authentication Problems

```bash
# Check authentication status
codai auth status

# Re-authenticate
codai auth logout
codai auth login

# Check token expiration
codai auth refresh-token

# Debug authentication
codai --debug auth status
```

#### 2. Configuration Issues

```bash
# Validate configuration
codai config validate

# Reset configuration
codai config reset

# Check configuration file location
codai config info

# Fix permissions
chmod 600 ~/.codai/config.json
```

#### 3. Network Issues

```bash
# Test connectivity
codai health check --all-services

# Check API endpoints
codai --trace api-calls health check

# Use specific profile
codai --profile development health check
```

### Debug Mode

```bash
# Enable debug logging
export DEBUG=codai:*
codai projects list

# Or use debug flag
codai --debug projects list

# Trace API calls
codai --trace api-calls projects create "Debug Project"
```

### Getting Help

```bash
# General help
codai --help

# Command-specific help
codai projects --help
codai projects create --help

# Show examples
codai projects create --examples

# Man pages (Unix systems)
man codai
```

## 📚 Examples & Recipes

### Common Workflows

```bash
# Complete project setup
codai auth login
codai projects create "E-commerce Site" --template next-js-commerce
codai env create production --copy-from development  
codai deploy production

# Daily operations
codai health check --all-services
codai logs tail api --since 1h --follow
codai analytics usage --period 24h

# Backup and maintenance
codai memorai backup create --name "daily-$(date +%Y%m%d)"
codai projects optimize --remove-unused-assets
codai cache clear --all-services
```

### CI/CD Integration

```bash
# GitHub Actions example
# .github/workflows/deploy.yml
- name: Deploy to production
  run: |
    codai auth login --api-key ${{ secrets.CODAI_API_KEY }}
    codai deploy production --wait --timeout 600
    codai health check --retry 3
```

### Scripting Examples

```bash
#!/bin/bash
# deployment-script.sh

# Setup
codai auth login --api-key "$CODAI_API_KEY"
codai profile use production

# Pre-deployment checks
if ! codai health check api; then
  echo "API health check failed"
  exit 1
fi

# Deploy
codai deploy production --build --migrate
if [ $? -eq 0 ]; then
  echo "Deployment successful"
  codai monitor alerts create --template deployment-success
else
  echo "Deployment failed"
  codai rollback production
  exit 1
fi
```

## 🔄 Updates & Maintenance

### CLI Updates

```bash
# Check for updates
codai update check

# Update CLI
codai update install
# or
npm update -g @codai/cli

# Version history
codai version history

# Rollback to previous version
codai update rollback
```

### Maintenance Commands

```bash
# Clear cache
codai cache clear

# Cleanup old logs
codai logs cleanup --older-than 30d

# Optimize configuration
codai config optimize

# Check CLI health
codai self-check
```

---

**Last Updated**: July 19, 2025  
**CLI Version**: 2.0.0  
**Status**: Production Ready ✅

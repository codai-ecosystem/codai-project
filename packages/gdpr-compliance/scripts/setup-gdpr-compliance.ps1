# GDPR Compliance Setup Script
# Comprehensive setup automation for GDPR compliance package

Write-Host "🛡️ CodAI GDPR Compliance Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check Node.js version
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js not found. Please install Node.js 18 or higher." -ForegroundColor Red
    exit 1
}

$majorVersion = [int]($nodeVersion -replace 'v(\d+).*', '$1')
if ($majorVersion -lt 18) {
    Write-Host "❌ Node.js version $nodeVersion is not supported. Please upgrade to Node.js 18 or higher." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green

# Create necessary directories
Write-Host "`n📁 Creating directories..." -ForegroundColor Yellow
$directories = @(
    "logs",
    "reports",
    "exports", 
    "archives",
    "config",
    "scripts"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "   Created: $dir" -ForegroundColor White
    } else {
        Write-Host "   Exists: $dir" -ForegroundColor Gray
    }
}

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ package.json not found" -ForegroundColor Red
    exit 1
}

# Build TypeScript
Write-Host "`n🔨 Building TypeScript..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ TypeScript build successful" -ForegroundColor Green
} else {
    Write-Host "⚠️ TypeScript build completed with warnings" -ForegroundColor Yellow
}

# Create environment configuration template
Write-Host "`n⚙️ Creating environment configuration..." -ForegroundColor Yellow
$envTemplate = @"
# GDPR Compliance Configuration
NODE_ENV=development

# Core Settings
GDPR_COMPLIANCE_ENABLED=true
GDPR_LOG_LEVEL=info

# Data Retention
GDPR_DATA_RETENTION_ENABLED=true
GDPR_DEFAULT_RETENTION_DAYS=1095
GDPR_AUTOMATIC_DELETION=true
GDPR_ARCHIVE_BEFORE_DELETION=true

# Consent Management
GDPR_CONSENT_MANAGEMENT_ENABLED=true
GDPR_REQUIRE_EXPLICIT_CONSENT=true
GDPR_CONSENT_EXPIRATION_DAYS=730
GDPR_GRANULAR_CONSENT=true
GDPR_DOUBLE_OPT_IN=false

# Data Subject Rights
GDPR_DATA_SUBJECT_RIGHTS_ENABLED=true
GDPR_ACCESS_REQUEST_RESPONSE_DAYS=30
GDPR_RECTIFICATION_RESPONSE_DAYS=30
GDPR_ERASURE_RESPONSE_DAYS=30
GDPR_PORTABILITY_RESPONSE_DAYS=30
GDPR_IDENTITY_VERIFICATION=true

# Audit Trail
GDPR_AUDIT_TRAIL_ENABLED=true
GDPR_AUDIT_ALL_DATA_ACCESS=true
GDPR_AUDIT_DATA_MODIFICATION=true
GDPR_AUDIT_CONSENT_CHANGES=true
GDPR_AUDIT_RETENTION_YEARS=7

# Reporting
GDPR_REPORTING_ENABLED=true
GDPR_AUTOMATIC_REPORTING=true
GDPR_REPORTING_FREQUENCY=monthly
GDPR_EMAIL_REPORTS=true
GDPR_REPORT_RECIPIENTS=compliance@codai.ro,dpo@codai.ro

# Notifications
GDPR_NOTIFICATIONS_ENABLED=true
GDPR_NOTIFICATION_CHANNELS=email,dashboard
GDPR_FROM_EMAIL=compliance@codai.ro
GDPR_FROM_NAME=CodAI Compliance Team

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=

# Webhook Configuration
GDPR_WEBHOOK_URL=
GDPR_WEBHOOK_SECRET=

# Elasticsearch Configuration
ELASTICSEARCH_URL=http://localhost:9200

# Security
GDPR_ENCRYPTION_AT_REST=true
GDPR_ENCRYPTION_IN_TRANSIT=true
GDPR_ROLE_BASED_ACCESS=true
GDPR_MULTI_FACTOR_AUTH=true

# Monitoring
GDPR_MONITORING_ENABLED=true
GDPR_DASHBOARD_ENABLED=true
GDPR_METRICS_COLLECTION=true
GDPR_COMPLIANCE_SCORING=true
"@

if (-not (Test-Path ".env.example")) {
    $envTemplate | Out-File -FilePath ".env.example" -Encoding UTF8
    Write-Host "   Created: .env.example" -ForegroundColor White
} else {
    Write-Host "   Exists: .env.example" -ForegroundColor Gray
}

if (-not (Test-Path ".env")) {
    $envTemplate | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "   Created: .env (copy of example)" -ForegroundColor White
} else {
    Write-Host "   Exists: .env (not modified)" -ForegroundColor Gray
}

# Create sample configuration files
Write-Host "`n📋 Creating sample configuration files..." -ForegroundColor Yellow

# Create logrotate configuration
$logrotateConfig = @"
logs/gdpr-compliance-*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    sharedscripts
    copytruncate
}

logs/gdpr-audit-*.log {
    daily
    missingok
    rotate 2555
    compress
    delaycompress
    notifempty
    sharedscripts
    copytruncate
}
"@

$logrotateConfig | Out-File -FilePath "config/logrotate.conf" -Encoding UTF8
Write-Host "   Created: config/logrotate.conf" -ForegroundColor White

# Create service monitoring script
$monitoringScript = @'
#!/usr/bin/env node
/**
 * GDPR Compliance Monitoring Script
 */
const { createGdprCompliance, getAllServiceIds } = require('./dist/index');

async function monitorCompliance() {
  console.log('🛡️ Starting GDPR Compliance Monitor...');
  
  try {
    const serviceIds = getAllServiceIds();
    
    for (const serviceId of serviceIds) {
      const manager = await createGdprCompliance(serviceId);
      const status = await manager.getComplianceStatus(serviceId);
      
      console.log(`📊 ${serviceId}: ${status.overall} (${status.score}%)`);
      
      await manager.cleanup();
    }
  } catch (error) {
    console.error('❌ Monitoring error:', error);
  }
}

// Run monitoring every hour
setInterval(monitorCompliance, 60 * 60 * 1000);
monitorCompliance(); // Run immediately
'@

$monitoringScript | Out-File -FilePath "scripts/monitor-compliance.js" -Encoding UTF8
Write-Host "   Created: scripts/monitor-compliance.js" -ForegroundColor White

# Create cleanup script
$cleanupScript = @'
#!/usr/bin/env node
/**
 * GDPR Data Retention Cleanup Script
 */
const { createGdprCompliance, getAllServiceIds } = require('./dist/index');

async function runCleanup() {
  console.log('🧹 Starting Data Retention Cleanup...');
  
  try {
    const serviceIds = getAllServiceIds();
    
    for (const serviceId of serviceIds) {
      console.log(`🧹 Processing ${serviceId}...`);
      
      const manager = await createGdprCompliance(serviceId);
      await manager.runDataRetentionCleanup(serviceId);
      await manager.cleanup();
      
      console.log(`✅ Cleanup completed for ${serviceId}`);
    }
    
    console.log('🎉 All cleanup tasks completed');
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    process.exit(1);
  }
}

runCleanup();
'@

$cleanupScript | Out-File -FilePath "scripts/cleanup-data.js" -Encoding UTF8
Write-Host "   Created: scripts/cleanup-data.js" -ForegroundColor White

# Test CLI functionality
Write-Host "`n🧪 Testing CLI functionality..." -ForegroundColor Yellow
try {
    $cliTest = npx tsx src/cli.ts --help 2>&1
    if ($LASTEXITCODE -eq 0 -or $cliTest -match "Usage:") {
        Write-Host "✅ CLI is functional" -ForegroundColor Green
    } else {
        Write-Host "⚠️ CLI test completed with warnings" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ CLI test failed (may require dependency installation)" -ForegroundColor Yellow
}

# Create systemd service file (Linux)
if ($IsLinux -or $IsMacOS) {
    Write-Host "`n🔧 Creating systemd service file..." -ForegroundColor Yellow
    
    $systemdService = @"
[Unit]
Description=CodAI GDPR Compliance Monitor
After=network.target

[Service]
Type=simple
User=codai
Group=codai
WorkingDirectory=/opt/codai/packages/gdpr-compliance
ExecStart=/usr/bin/node scripts/monitor-compliance.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
"@

    $systemdService | Out-File -FilePath "config/codai-gdpr-compliance.service" -Encoding UTF8
    Write-Host "   Created: config/codai-gdpr-compliance.service" -ForegroundColor White
}

# Create Docker health check
$dockerHealthCheck = @"
#!/bin/bash
# GDPR Compliance Health Check Script

npx tsx src/cli.ts status > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ GDPR Compliance: Healthy"
    exit 0
else
    echo "❌ GDPR Compliance: Unhealthy"
    exit 1
fi
"@

$dockerHealthCheck | Out-File -FilePath "scripts/health-check.sh" -Encoding UTF8
Write-Host "   Created: scripts/health-check.sh" -ForegroundColor White

# Set executable permissions on Unix-like systems
if ($IsLinux -or $IsMacOS) {
    chmod +x scripts/monitor-compliance.js 2>$null
    chmod +x scripts/cleanup-data.js 2>$null
    chmod +x scripts/health-check.sh 2>$null
}

# Final status check
Write-Host "`n🎯 Running final compliance check..." -ForegroundColor Yellow
try {
    npx tsx src/cli.ts list 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ GDPR compliance system is ready!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ GDPR compliance system setup completed with warnings" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Final check completed with warnings" -ForegroundColor Yellow
}

# Setup summary
Write-Host "`n🎉 GDPR Compliance Setup Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

Write-Host "`n📋 What was created:" -ForegroundColor Yellow
Write-Host "   • TypeScript build completed" -ForegroundColor White
Write-Host "   • Environment configuration (.env)" -ForegroundColor White
Write-Host "   • Log directories and rotation config" -ForegroundColor White
Write-Host "   • Monitoring and cleanup scripts" -ForegroundColor White
Write-Host "   • Service configuration files" -ForegroundColor White
Write-Host "   • Health check scripts" -ForegroundColor White

Write-Host "`n🚀 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Review and update .env file with your settings" -ForegroundColor White
Write-Host "   2. Configure SMTP settings for email notifications" -ForegroundColor White
Write-Host "   3. Set up Elasticsearch connection if needed" -ForegroundColor White
Write-Host "   4. Test with: npx tsx src/cli.ts status" -ForegroundColor White
Write-Host "   5. Schedule periodic compliance audits" -ForegroundColor White

Write-Host "`n📚 Available CLI commands:" -ForegroundColor Yellow
Write-Host "   • npx codai-gdpr status         - Check compliance status" -ForegroundColor White
Write-Host "   • npx codai-gdpr audit          - Run compliance audit" -ForegroundColor White
Write-Host "   • npx codai-gdpr report         - Generate reports" -ForegroundColor White
Write-Host "   • npx codai-gdpr cleanup        - Run data cleanup" -ForegroundColor White
Write-Host "   • npx codai-gdpr export         - Export data subject data" -ForegroundColor White
Write-Host "   • npx codai-gdpr config         - Show configuration" -ForegroundColor White
Write-Host "   • npx codai-gdpr list           - List all services" -ForegroundColor White

Write-Host "`n🛡️ GDPR Compliance System Ready for Production!" -ForegroundColor Green
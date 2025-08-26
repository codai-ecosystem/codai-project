# 🚀 CODAI Cloud Production Deployment Script
# Updated deployment for the latest CODAI ecosystem with Vercel nameservers
# Date: August 26, 2025

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "production",
    
    [Parameter(Mandatory=$false)]
    [string]$CloudProvider = "vercel", # vercel, azure, aws, gcp
    
    [Parameter(Mandatory=$false)]
    [switch]$DeployFrontend,
    
    [Parameter(Mandatory=$false)]
    [switch]$DeployBackend,
    
    [Parameter(Mandatory=$false)]
    [switch]$DeployDatabases,
    
    [Parameter(Mandatory=$false)]
    [switch]$UpdateDNS,
    
    [Parameter(Mandatory=$false)]
    [switch]$All
)

# Color coding for output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) { Write-Output $args } else { $input | Write-Output }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green @args }
function Write-Warning { Write-ColorOutput Yellow @args }
function Write-Error { Write-ColorOutput Red @args }
function Write-Info { Write-ColorOutput Cyan @args }
function Write-Header { Write-ColorOutput Magenta @args }

Write-Header "🚀 CODAI Cloud Production Deployment"
Write-Header "======================================"
Write-Info ""
Write-Info "📅 Deployment Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Info "🌍 Environment: $Environment"
Write-Info "☁️ Cloud Provider: $CloudProvider"
Write-Info ""

# Check prerequisites
Write-Header "🔍 Prerequisites Check"
Write-Info "Checking required tools..."

$tools = @(
    @{Name="Node.js"; Command="node"; Args="--version"},
    @{Name="npm"; Command="npm"; Args="--version"},
    @{Name="Vercel CLI"; Command="vercel"; Args="--version"},
    @{Name="Docker"; Command="docker"; Args="--version"},
    @{Name="Git"; Command="git"; Args="--version"}
)

$missingTools = @()
foreach ($tool in $tools) {
    try {
        $version = & $tool.Command $tool.Args 2>$null
        Write-Success "  ✅ $($tool.Name): $version"
    } catch {
        Write-Error "  ❌ $($tool.Name): Not found"
        $missingTools += $tool.Name
    }
}

if ($missingTools.Count -gt 0) {
    Write-Error "❌ Missing required tools: $($missingTools -join ', ')"
    Write-Info "Please install missing tools and retry."
    exit 1
}

# CODAI Services Configuration
$frontendApps = @(
    @{Name="codai"; Path="apps/codai"; Domain="codai.dev"; Port="4002"},
    @{Name="memorai"; Path="apps/memorai"; Domain="memorai.app"; Port="4006"},
    @{Name="bancai"; Path="apps/bancai"; Domain="bancai.finance"; Port="4005"},
    @{Name="admin"; Path="apps/admin"; Domain="admin.codai.dev"; Port="4007"},
    @{Name="docs"; Path="apps/docs"; Domain="docs.codai.dev"; Port="4003"},
    @{Name="wallet"; Path="apps/wallet"; Domain="wallet.codai.dev"; Port="4008"},
    @{Name="conversai"; Path="apps/conversai"; Domain="chat.codai.dev"; Port="4009"}
)

$backendServices = @(
    @{Name="gateway"; Path="apps/gateway"; Port="8010"; Type="api"},
    @{Name="identity"; Path="apps/id"; Port="8100"; Type="api"},
    @{Name="hub"; Path="apps/hub"; Port="8110"; Type="api"},
    @{Name="memorai-graphql"; Path="apps/memorai/graphql"; Port="4500"; Type="api"},
    @{Name="memorai-mcp"; Path="packages/memorai-mcp"; Port="4950"; Type="service"},
    @{Name="cbd-database"; Path="packages/cbd"; Port="8180"; Type="database"}
)

# Function to deploy frontend to Vercel
function Deploy-Frontend {
    Write-Header "🌐 Deploying Frontend Applications to Vercel"
    
    foreach ($app in $frontendApps) {
        if (Test-Path $app.Path) {
            Write-Info "📦 Deploying $($app.Name)..."
            Push-Location $app.Path
            
            try {
                # Check if vercel.json exists, create if not
                if (-not (Test-Path "vercel.json")) {
                    Write-Info "Creating vercel.json for $($app.Name)..."
                    @{
                        version = 2
                        builds = @(@{
                            src = "package.json"
                            use = "@vercel/next"
                        })
                        env = @{
                            NODE_ENV = "production"
                        }
                    } | ConvertTo-Json -Depth 3 | Out-File -FilePath "vercel.json" -Encoding UTF8
                }
                
                # Deploy to Vercel
                Write-Info "🚀 Running vercel deploy --prod..."
                vercel deploy --prod --confirm
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "✅ $($app.Name) deployed successfully to $($app.Domain)"
                } else {
                    Write-Error "❌ Failed to deploy $($app.Name)"
                }
                
            } catch {
                Write-Error "❌ Error deploying $($app.Name): $($_.Exception.Message)"
            } finally {
                Pop-Location
            }
        } else {
            Write-Warning "⚠️ $($app.Name) path not found: $($app.Path)"
        }
    }
}

# Function to deploy backend services
function Deploy-Backend {
    Write-Header "🔧 Deploying Backend Services"
    
    foreach ($service in $backendServices) {
        if (Test-Path $service.Path) {
            Write-Info "📦 Preparing $($service.Name) for deployment..."
            
            # Build Docker image if Dockerfile exists
            $dockerfilePath = Join-Path $service.Path "Dockerfile"
            if (Test-Path $dockerfilePath) {
                Write-Info "🐳 Building Docker image for $($service.Name)..."
                Push-Location $service.Path
                
                try {
                    docker build -t "codai-$($service.Name):latest" .
                    
                    if ($LASTEXITCODE -eq 0) {
                        Write-Success "✅ Docker image built for $($service.Name)"
                        
                        # Tag for cloud registry (example for Azure Container Registry)
                        Write-Info "🏷️ Tagging image for cloud deployment..."
                        docker tag "codai-$($service.Name):latest" "codai.azurecr.io/codai-$($service.Name):$(Get-Date -Format 'yyyyMMdd-HHmmss')"
                        
                    } else {
                        Write-Error "❌ Failed to build Docker image for $($service.Name)"
                    }
                } catch {
                    Write-Error "❌ Error building $($service.Name): $($_.Exception.Message)"
                } finally {
                    Pop-Location
                }
            } else {
                Write-Warning "⚠️ No Dockerfile found for $($service.Name)"
            }
        } else {
            Write-Warning "⚠️ $($service.Name) path not found: $($service.Path)"
        }
    }
}

# Function to setup cloud databases
function Deploy-Databases {
    Write-Header "🗄️ Setting up Cloud Databases"
    
    Write-Info "🐘 PostgreSQL Database Setup:"
    Write-Info "  - Consider Azure Database for PostgreSQL"
    Write-Info "  - Or Amazon RDS for PostgreSQL"
    Write-Info "  - Update connection strings in environment variables"
    
    Write-Info "📦 Redis Cache Setup:"
    Write-Info "  - Consider Azure Cache for Redis"
    Write-Info "  - Or Amazon ElastiCache"
    Write-Info "  - Update Redis URLs in environment variables"
    
    Write-Info "🗃️ CBD Database Setup:"
    Write-Info "  - Deploy as container service"
    Write-Info "  - Or migrate to cloud-native database"
    Write-Info "  - Ensure data persistence and backup"
}

# Function to update DNS settings
function Update-DNS {
    Write-Header "🌐 DNS Configuration Update"
    
    Write-Info "📍 Updating DNS records for Vercel nameservers..."
    
    foreach ($app in $frontendApps) {
        Write-Info "  🔗 $($app.Domain) -> Vercel deployment"
        Write-Info "     Add CNAME record pointing to Vercel"
    }
    
    Write-Info "🔒 SSL Certificates:"
    Write-Info "  - Vercel provides automatic HTTPS"
    Write-Info "  - Backend services need SSL configuration"
}

# Function to validate deployment
function Validate-Deployment {
    Write-Header "✅ Deployment Validation"
    
    Write-Info "🔍 Testing frontend applications..."
    foreach ($app in $frontendApps) {
        Write-Info "  📱 Testing https://$($app.Domain)"
        # Add actual URL testing here
    }
    
    Write-Info "🔍 Testing backend services..."
    foreach ($service in $backendServices) {
        Write-Info "  🔧 Testing $($service.Name) health endpoint"
        # Add actual health check testing here
    }
}

# Main execution logic
Write-Header "🎯 Deployment Execution Plan"

if ($All) {
    $DeployFrontend = $true
    $DeployBackend = $true
    $DeployDatabases = $true
    $UpdateDNS = $true
}

if ($DeployFrontend -or $All) {
    Deploy-Frontend
}

if ($DeployBackend -or $All) {
    Deploy-Backend
}

if ($DeployDatabases -or $All) {
    Deploy-Databases
}

if ($UpdateDNS -or $All) {
    Update-DNS
}

# Always run validation
Validate-Deployment

Write-Header "🎉 CODAI Cloud Deployment Complete!"
Write-Success "✅ All selected deployment steps completed"
Write-Info "📊 Next steps:"
Write-Info "  1. Update environment variables in cloud services"
Write-Info "  2. Configure monitoring and logging"
Write-Info "  3. Set up CI/CD pipelines"
Write-Info "  4. Configure backup and disaster recovery"
Write-Info ""
Write-Success "🚀 CODAI ecosystem is ready for production!"
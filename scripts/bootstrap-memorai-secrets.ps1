<#
    Bootstrap MemorAI Secrets

    - Retrieves Azure OpenAI API key via Azure CLI
    - Generates an MCP API key via CBD Developer Ecosystem
    - Stores both secrets in AWS SSM Parameter Store (SecureString)
    - Writes GraphQL Allowed Origins CSV to SSM (String)

    Requirements:
    - Azure CLI (az) authenticated (az login)
    - AWS CLI authenticated (aws configure or env vars)
    - CBD service reachable (default http://localhost:4180)

    Usage examples (PowerShell 7+):
    pwsh -File ./scripts/bootstrap-memorai-secrets.ps1 -Environment prod -AwsRegion eu-central-1 -OwnerId memorai -Subscription "YOUR-SUB-ID"

    Optional overrides:
    -OpenAIResourceName codai-openai-dev -OpenAIResourceGroup rg-codai-dev
    -CBDBaseUrl http://localhost:4180
    -GraphQLAllowedOrigins "https://memorai.ro,https://app.memorai.ro,https://api.memorai.ro,https://mcp.memorai.ro,https://cbd.memorai.ro,https://memorai.vercel.app,https://www.memorai.ro"
#>

param(
    [string]$Environment = "prod",
    [string]$AwsRegion = "eu-central-1",
    [string]$OwnerId = "memorai",
    [string]$CBDBaseUrl = "http://localhost:4180",
    [string]$Subscription,
    [string]$OpenAIResourceName,
    [string]$OpenAIResourceGroup,
    [string]$OpenAILocation = "swedencentral",
    [string]$GraphQLAllowedOrigins = "https://memorai.ro,https://app.memorai.ro,https://api.memorai.ro,https://mcp.memorai.ro,https://cbd.memorai.ro,https://memorai.vercel.app,https://www.memorai.ro",
    [switch]$VerboseOutput
)

$ErrorActionPreference = 'Stop'

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "[OK]   $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-ErrorLine($msg) { Write-Host "[ERR]  $msg" -ForegroundColor Red }

function Assert-Command($name) {
    if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
        throw "Required command '$name' not found in PATH. Please install it first."
    }
}

function Ensure-Subscription() {
    if ($Subscription) {
        Write-Info "Setting Azure subscription: $Subscription"
        az account set --subscription $Subscription | Out-Null
    }
    $ctx = az account show --query "{name:name, sub: id}" -o json | ConvertFrom-Json
    Write-Info "Azure context: $($ctx.name) ($($ctx.sub))"
}

function Resolve-OpenAI() {
    if ($OpenAIResourceName -and $OpenAIResourceGroup) { return @{ name=$OpenAIResourceName; rg=$OpenAIResourceGroup } }

    Write-Info "Discovering Azure OpenAI account (kind=='OpenAI', location contains '$OpenAILocation')..."
    $list = az cognitiveservices account list --query "[?kind=='OpenAI' && contains(location, '$OpenAILocation')].{name:name,rg:resourceGroup,kind:kind,loc:location}" -o json | ConvertFrom-Json
    if (-not $list -or $list.Count -eq 0) {
        Write-Warn "No 'OpenAI' accounts found in location filter. Falling back to any OpenAI account in subscription."
        $list = az cognitiveservices account list --query "[?kind=='OpenAI'].{name:name,rg:resourceGroup,kind:kind,loc:location}" -o json | ConvertFrom-Json
    }
    if (-not $list -or $list.Count -eq 0) {
        throw "No Azure OpenAI accounts found. Provide -OpenAIResourceName and -OpenAIResourceGroup."
    }
    if ($list.Count -gt 1) {
        Write-Warn "Multiple OpenAI accounts found. Using the first: $($list[0].name) in RG $($list[0].rg)"
    }
    return @{ name=$list[0].name; rg=$list[0].rg }
}

function Get-AzureOpenAIKey($name, $rg) {
    Write-Info "Retrieving Azure OpenAI key for $name in $rg"
    $key = az cognitiveservices account keys list --name $name --resource-group $rg --query key1 -o tsv
    if (-not $key) { throw "Failed to retrieve Azure OpenAI key for $name/$rg" }
    Write-Success "Azure OpenAI key retrieved"
    return $key
}

function Ensure-CBD-Healthy($baseUrl) {
    Write-Info "Checking CBD health at $baseUrl/health"
    try {
        $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -TimeoutSec 5
        if ($health.status -ne 'healthy') { throw "CBD not healthy: $($health | ConvertTo-Json -Depth 3)" }
        Write-Success "CBD is healthy"
    } catch {
        throw "CBD health check failed: $($_.Exception.Message)"
    }
}

function Create-CBD-Project($baseUrl, $ownerId) {
    Write-Info "Creating CBD project for owner '$ownerId'"
    $body = @{ name = "MemorAI"; description = "MemorAI Production" } | ConvertTo-Json
    $resp = Invoke-RestMethod -Uri "$baseUrl/ecosystem/projects" -Method Post -Headers @{ 'Content-Type'='application/json'; 'X-Owner-Id'=$ownerId } -Body $body
    $projId = $null
    if ($resp.id) { $projId = $resp.id }
    elseif ($resp.data -and $resp.data.id) { $projId = $resp.data.id }
    if (-not $projId) { throw "Failed to create project: $($resp | ConvertTo-Json -Depth 3)" }
    Write-Success "CBD project created: $projId"
    return $projId
}

function Create-CBD-ApiKey($baseUrl, $ownerId, $projectId) {
    Write-Info "Creating MCP API key in CBD for project $projectId"
    $payload = @{ projectId=$projectId; name="memorai-mcp"; scopes=@('admin'); rateLimit=@{requestsPerMinute=2000;requestsPerHour=100000} } | ConvertTo-Json
    $resp = Invoke-RestMethod -Uri "$baseUrl/ecosystem/api-keys" -Method Post -Headers @{ 'Content-Type'='application/json'; 'X-Owner-Id'=$ownerId } -Body $payload
    $plainKey = $null
    if ($resp.plainKey) { $plainKey = $resp.plainKey }
    elseif ($resp.data -and $resp.data.plainKey) { $plainKey = $resp.data.plainKey }
    elseif ($resp.key) { $plainKey = $resp.key }
    elseif ($resp.data -and $resp.data.key) { $plainKey = $resp.data.key }
    if (-not $plainKey) { throw "Failed to create API key: $($resp | ConvertTo-Json -Depth 3)" }
    Write-Success "CBD API key created"
    return $plainKey
}

function Put-SSM-Secret([string]$Name, [string]$Value, [string]$Type) {
    Write-Info "Writing SSM $Type parameter: $Name (region $AwsRegion)"
    $args = @('ssm','put-parameter','--name',$Name,'--value',$Value,'--type',$Type,'--region',$AwsRegion,'--overwrite')
    $null = & aws @args
    Write-Success "SSM parameter updated: $Name"
}

try {
    Write-Host "=== MemorAI Secrets Bootstrap ===" -ForegroundColor Magenta
    Assert-Command az
    Assert-Command aws

    Ensure-Subscription

    # Resolve Azure OpenAI resource
    $openAI = Resolve-OpenAI
    if ($VerboseOutput) { Write-Info ("Using OpenAI resource: " + ($openAI | ConvertTo-Json)) }
    $openAIKey = Get-AzureOpenAIKey -name $openAI.name -rg $openAI.rg

    # Ensure CBD is up
    Ensure-CBD-Healthy -baseUrl $CBDBaseUrl

    # Create project and API key in CBD
    $projectId = Create-CBD-Project -baseUrl $CBDBaseUrl -ownerId $OwnerId
    $mcpApiKey = Create-CBD-ApiKey -baseUrl $CBDBaseUrl -ownerId $OwnerId -projectId $projectId

    # Store in AWS SSM Parameter Store
    $ssmPrefix = "/memorai/$Environment"
    Put-SSM-Secret -Name "$ssmPrefix/azure/openai_api_key" -Value $openAIKey -Type "SecureString"
    Put-SSM-Secret -Name "$ssmPrefix/mcp/api_key" -Value $mcpApiKey -Type "SecureString"
    Put-SSM-Secret -Name "$ssmPrefix/graphql/allowed_origins" -Value $GraphQLAllowedOrigins -Type "String"

    Write-Host "\nAll secrets stored successfully in SSM." -ForegroundColor Green
    Write-Host "Paths:" -ForegroundColor Green
    Write-Host "  - $ssmPrefix/azure/openai_api_key (SecureString)" -ForegroundColor Gray
    Write-Host "  - $ssmPrefix/mcp/api_key (SecureString)" -ForegroundColor Gray
    Write-Host "  - $ssmPrefix/graphql/allowed_origins (String)" -ForegroundColor Gray

    Write-Host "\nNext steps:" -ForegroundColor Cyan
    Write-Host "  - Redeploy or force new task revisions for ECS services to pick up updated SSM values." -ForegroundColor Gray
    Write-Host "  - After ACM validation, enable HTTPS listener and (optionally) CloudFront." -ForegroundColor Gray
}
catch {
    Write-ErrorLine $_.Exception.Message
    exit 1
}

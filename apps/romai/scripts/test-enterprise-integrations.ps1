# 🧪 Enterprise Integration Tools Test Suite
# Comprehensive testing for RomAI enterprise integrations

param(
    [switch]$LDAP,
    [switch]$SSO,
    [switch]$Backup,
    [switch]$All,
    [switch]$Verbose
)

Write-Host "🔧 RomAI Enterprise Integration Tools Test Suite" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# Set error action preference
$ErrorActionPreference = "Continue"

# Test results tracking
$TestResults = @{
    LDAP = @{}
    SSO = @{}
    Backup = @{}
    Overall = "PASS"
}

function Write-TestResult {
    param(
        [string]$Component,
        [string]$Test,
        [string]$Status,
        [string]$Message = ""
    )
    
    $Color = switch ($Status) {
        "PASS" { "Green" }
        "FAIL" { "Red" }
        "WARN" { "Yellow" }
        "INFO" { "Cyan" }
    }
    
    Write-Host "[$Component] $Test : $Status" -ForegroundColor $Color
    if ($Message -and $Verbose) {
        Write-Host "    $Message" -ForegroundColor Gray
    }
    
    $TestResults[$Component][$Test] = @{
        Status = $Status
        Message = $Message
        Timestamp = Get-Date
    }
    
    if ($Status -eq "FAIL") {
        $TestResults.Overall = "FAIL"
    }
}

function Test-PythonModule {
    param([string]$ModulePath)
    
    try {
        $result = python -c "import sys; sys.path.append('$ModulePath'); import importlib; print('OK')" 2>&1
        return $result -match "OK"
    }
    catch {
        return $false
    }
}

function Test-LDAPIntegration {
    Write-Host "`n🔐 Testing LDAP Integration..." -ForegroundColor Yellow
    
    # Test 1: Module Import
    try {
        $ldapPath = "e:\GitHub\codai-project\apps\romai\src\enterprise\integrations"
        $moduleTest = python -c "
import sys
sys.path.append('$ldapPath')
try:
    from ldap_integration import RomAILDAPIntegration, create_ldap_integration
    print('IMPORT_SUCCESS')
except Exception as e:
    print(f'IMPORT_ERROR: {e}')
" 2>&1
        
        if ($moduleTest -match "IMPORT_SUCCESS") {
            Write-TestResult "LDAP" "Module Import" "PASS" "LDAP integration module imported successfully"
        } else {
            Write-TestResult "LDAP" "Module Import" "FAIL" "Failed to import LDAP module: $moduleTest"
        }
    }
    catch {
        Write-TestResult "LDAP" "Module Import" "FAIL" "Exception during import test: $($_.Exception.Message)"
    }
    
    # Test 2: Class Instantiation
    try {
        $instantiationTest = python -c "
import sys
sys.path.append('$ldapPath')
try:
    from ldap_integration import create_ldap_integration
    ldap = create_ldap_integration()
    print('INSTANTIATION_SUCCESS')
    print(f'Configurations: {len(ldap.configurations)}')
except Exception as e:
    print(f'INSTANTIATION_ERROR: {e}')
" 2>&1
        
        if ($instantiationTest -match "INSTANTIATION_SUCCESS") {
            Write-TestResult "LDAP" "Instantiation" "PASS" "LDAP integration created successfully"
            
            # Extract configuration count
            $configMatch = $instantiationTest | Select-String "Configurations: (\d+)"
            if ($configMatch) {
                $configCount = $configMatch.Matches[0].Groups[1].Value
                Write-TestResult "LDAP" "Default Configs" "INFO" "Default configurations loaded: $configCount"
            }
        } else {
            Write-TestResult "LDAP" "Instantiation" "FAIL" "Failed to create LDAP integration: $instantiationTest"
        }
    }
    catch {
        Write-TestResult "LDAP" "Instantiation" "FAIL" "Exception during instantiation test: $($_.Exception.Message)"
    }
    
    # Test 3: Health Check
    try {
        $healthTest = python -c "
import sys, asyncio
sys.path.append('$ldapPath')
try:
    from ldap_integration import create_ldap_integration
    async def test_health():
        ldap = create_ldap_integration()
        health = await ldap.health_check()
        print('HEALTH_SUCCESS')
        print(f'Status: {health.get(\"connection_status\", \"unknown\")}')
        return health
    
    result = asyncio.run(test_health())
except Exception as e:
    print(f'HEALTH_ERROR: {e}')
" 2>&1
        
        if ($healthTest -match "HEALTH_SUCCESS") {
            Write-TestResult "LDAP" "Health Check" "PASS" "Health check executed successfully"
            
            # Extract status
            $statusMatch = $healthTest | Select-String "Status: (\w+)"
            if ($statusMatch) {
                $status = $statusMatch.Matches[0].Groups[1].Value
                Write-TestResult "LDAP" "Connection Status" "INFO" "Connection status: $status"
            }
        } else {
            Write-TestResult "LDAP" "Health Check" "WARN" "Health check completed with issues: $healthTest"
        }
    }
    catch {
        Write-TestResult "LDAP" "Health Check" "FAIL" "Exception during health check: $($_.Exception.Message)"
    }
    
    # Test 4: Configuration Management
    try {
        $configTest = python -c "
import sys
sys.path.append('$ldapPath')
try:
    from ldap_integration import create_ldap_integration, LDAPConfiguration
    ldap = create_ldap_integration()
    
    # Test adding configuration
    config = LDAPConfiguration(
        name='test_config',
        server='ldap://test.example.com',
        port=389,
        bind_dn='cn=admin,dc=test,dc=com',
        bind_password='test_password',
        base_dn='dc=test,dc=com'
    )
    
    ldap.add_configuration(config)
    print('CONFIG_SUCCESS')
    print(f'Total configs: {len(ldap.configurations)}')
except Exception as e:
    print(f'CONFIG_ERROR: {e}')
" 2>&1
        
        if ($configTest -match "CONFIG_SUCCESS") {
            Write-TestResult "LDAP" "Configuration Management" "PASS" "Configuration management working correctly"
        } else {
            Write-TestResult "LDAP" "Configuration Management" "FAIL" "Configuration management failed: $configTest"
        }
    }
    catch {
        Write-TestResult "LDAP" "Configuration Management" "FAIL" "Exception during configuration test: $($_.Exception.Message)"
    }
}

function Test-SSOIntegration {
    Write-Host "`n🔑 Testing SSO Integration..." -ForegroundColor Yellow
    
    # Test 1: Module Import
    try {
        $ssoPath = "e:\GitHub\codai-project\apps\romai\src\enterprise\integrations"
        $moduleTest = python -c "
import sys
sys.path.append('$ssoPath')
try:
    from sso_integration import RomAISSOIntegration, create_sso_integration
    print('IMPORT_SUCCESS')
except Exception as e:
    print(f'IMPORT_ERROR: {e}')
" 2>&1
        
        if ($moduleTest -match "IMPORT_SUCCESS") {
            Write-TestResult "SSO" "Module Import" "PASS" "SSO integration module imported successfully"
        } else {
            Write-TestResult "SSO" "Module Import" "FAIL" "Failed to import SSO module: $moduleTest"
        }
    }
    catch {
        Write-TestResult "SSO" "Module Import" "FAIL" "Exception during import test: $($_.Exception.Message)"
    }
    
    # Test 2: Class Instantiation
    try {
        $instantiationTest = python -c "
import sys
sys.path.append('$ssoPath')
try:
    from sso_integration import create_sso_integration
    sso = create_sso_integration()
    print('INSTANTIATION_SUCCESS')
    print(f'Providers: {len(sso.providers)}')
except Exception as e:
    print(f'INSTANTIATION_ERROR: {e}')
" 2>&1
        
        if ($instantiationTest -match "INSTANTIATION_SUCCESS") {
            Write-TestResult "SSO" "Instantiation" "PASS" "SSO integration created successfully"
            
            # Extract provider count
            $providerMatch = $instantiationTest | Select-String "Providers: (\d+)"
            if ($providerMatch) {
                $providerCount = $providerMatch.Matches[0].Groups[1].Value
                Write-TestResult "SSO" "Default Providers" "INFO" "Default providers loaded: $providerCount"
            }
        } else {
            Write-TestResult "SSO" "Instantiation" "FAIL" "Failed to create SSO integration: $instantiationTest"
        }
    }
    catch {
        Write-TestResult "SSO" "Instantiation" "FAIL" "Exception during instantiation test: $($_.Exception.Message)"
    }
    
    # Test 3: Health Check
    try {
        $healthTest = python -c "
import sys, asyncio
sys.path.append('$ssoPath')
try:
    from sso_integration import create_sso_integration
    async def test_health():
        sso = create_sso_integration()
        health = await sso.health_check()
        print('HEALTH_SUCCESS')
        print(f'Providers configured: {health.get(\"providers_configured\", 0)}')
        print(f'Active sessions: {health.get(\"active_sessions\", 0)}')
        return health
    
    result = asyncio.run(test_health())
except Exception as e:
    print(f'HEALTH_ERROR: {e}')
" 2>&1
        
        if ($healthTest -match "HEALTH_SUCCESS") {
            Write-TestResult "SSO" "Health Check" "PASS" "Health check executed successfully"
            
            # Extract metrics
            $providerMatch = $healthTest | Select-String "Providers configured: (\d+)"
            $sessionMatch = $healthTest | Select-String "Active sessions: (\d+)"
            
            if ($providerMatch) {
                $providers = $providerMatch.Matches[0].Groups[1].Value
                Write-TestResult "SSO" "Provider Count" "INFO" "Providers configured: $providers"
            }
            
            if ($sessionMatch) {
                $sessions = $sessionMatch.Matches[0].Groups[1].Value
                Write-TestResult "SSO" "Active Sessions" "INFO" "Active sessions: $sessions"
            }
        } else {
            Write-TestResult "SSO" "Health Check" "WARN" "Health check completed with issues: $healthTest"
        }
    }
    catch {
        Write-TestResult "SSO" "Health Check" "FAIL" "Exception during health check: $($_.Exception.Message)"
    }
    
    # Test 4: Provider Management
    try {
        $providerTest = python -c "
import sys
sys.path.append('$ssoPath')
try:
    from sso_integration import create_sso_integration, SSOConfiguration, SSOProtocol
    sso = create_sso_integration()
    
    # Test provider metadata
    providers = list(sso.providers.keys())
    if providers:
        metadata = asyncio.run(sso.get_provider_metadata(providers[0]))
        print('PROVIDER_SUCCESS')
        print(f'First provider: {providers[0]}')
    else:
        print('NO_PROVIDERS')
except Exception as e:
    print(f'PROVIDER_ERROR: {e}')
" 2>&1
        
        if ($providerTest -match "PROVIDER_SUCCESS") {
            Write-TestResult "SSO" "Provider Management" "PASS" "Provider management working correctly"
        } else {
            Write-TestResult "SSO" "Provider Management" "WARN" "Provider management test completed: $providerTest"
        }
    }
    catch {
        Write-TestResult "SSO" "Provider Management" "FAIL" "Exception during provider test: $($_.Exception.Message)"
    }
}

function Test-BackupSystem {
    Write-Host "`n💾 Testing Backup & Disaster Recovery..." -ForegroundColor Yellow
    
    # Test 1: Module Import
    try {
        $backupPath = "e:\GitHub\codai-project\apps\romai\src\enterprise\integrations"
        $moduleTest = python -c "
import sys
sys.path.append('$backupPath')
try:
    from backup_disaster_recovery import RomAIBackupDisasterRecovery, create_backup_system
    print('IMPORT_SUCCESS')
except Exception as e:
    print(f'IMPORT_ERROR: {e}')
" 2>&1
        
        if ($moduleTest -match "IMPORT_SUCCESS") {
            Write-TestResult "Backup" "Module Import" "PASS" "Backup system module imported successfully"
        } else {
            Write-TestResult "Backup" "Module Import" "FAIL" "Failed to import backup module: $moduleTest"
        }
    }
    catch {
        Write-TestResult "Backup" "Module Import" "FAIL" "Exception during import test: $($_.Exception.Message)"
    }
    
    # Test 2: Class Instantiation
    try {
        $instantiationTest = python -c "
import sys
sys.path.append('$backupPath')
try:
    from backup_disaster_recovery import create_backup_system
    backup = create_backup_system()
    print('INSTANTIATION_SUCCESS')
    print(f'Backup configs: {len(backup.backup_configs)}')
    print(f'DR plans: {len(backup.dr_plans)}')
except Exception as e:
    print(f'INSTANTIATION_ERROR: {e}')
" 2>&1
        
        if ($instantiationTest -match "INSTANTIATION_SUCCESS") {
            Write-TestResult "Backup" "Instantiation" "PASS" "Backup system created successfully"
            
            # Extract metrics
            $configMatch = $instantiationTest | Select-String "Backup configs: (\d+)"
            $drMatch = $instantiationTest | Select-String "DR plans: (\d+)"
            
            if ($configMatch) {
                $configs = $configMatch.Matches[0].Groups[1].Value
                Write-TestResult "Backup" "Default Configs" "INFO" "Default backup configs: $configs"
            }
            
            if ($drMatch) {
                $drPlans = $drMatch.Matches[0].Groups[1].Value
                Write-TestResult "Backup" "DR Plans" "INFO" "DR plans configured: $drPlans"
            }
        } else {
            Write-TestResult "Backup" "Instantiation" "FAIL" "Failed to create backup system: $instantiationTest"
        }
    }
    catch {
        Write-TestResult "Backup" "Instantiation" "FAIL" "Exception during instantiation test: $($_.Exception.Message)"
    }
    
    # Test 3: System Status
    try {
        $statusTest = python -c "
import sys, asyncio
sys.path.append('$backupPath')
try:
    from backup_disaster_recovery import create_backup_system
    async def test_status():
        backup = create_backup_system()
        status = await backup.get_system_status()
        print('STATUS_SUCCESS')
        print(f'Configurations: {status.get(\"backup_configurations\", 0)}')
        print(f'Active jobs: {status.get(\"active_backup_jobs\", 0)}')
        return status
    
    result = asyncio.run(test_status())
except Exception as e:
    print(f'STATUS_ERROR: {e}')
" 2>&1
        
        if ($statusTest -match "STATUS_SUCCESS") {
            Write-TestResult "Backup" "System Status" "PASS" "System status retrieved successfully"
            
            # Extract metrics
            $configMatch = $statusTest | Select-String "Configurations: (\d+)"
            $jobMatch = $statusTest | Select-String "Active jobs: (\d+)"
            
            if ($configMatch) {
                $configs = $configMatch.Matches[0].Groups[1].Value
                Write-TestResult "Backup" "Config Count" "INFO" "Backup configurations: $configs"
            }
            
            if ($jobMatch) {
                $jobs = $jobMatch.Matches[0].Groups[1].Value
                Write-TestResult "Backup" "Active Jobs" "INFO" "Active backup jobs: $jobs"
            }
        } else {
            Write-TestResult "Backup" "System Status" "WARN" "System status test completed with issues: $statusTest"
        }
    }
    catch {
        Write-TestResult "Backup" "System Status" "FAIL" "Exception during status test: $($_.Exception.Message)"
    }
    
    # Test 4: Configuration Management
    try {
        $configTest = python -c "
import sys
sys.path.append('$backupPath')
try:
    from backup_disaster_recovery import create_backup_system, BackupConfiguration, BackupType, StorageProvider
    backup = create_backup_system()
    
    # Test adding configuration
    config = BackupConfiguration(
        name='test_backup',
        backup_type=BackupType.APPLICATION,
        source_paths=['/tmp/test'],
        destination_path='/tmp/backup',
        storage_provider=StorageProvider.LOCAL
    )
    
    backup.add_backup_configuration(config)
    print('CONFIG_SUCCESS')
    print(f'Total configs: {len(backup.backup_configs)}')
except Exception as e:
    print(f'CONFIG_ERROR: {e}')
" 2>&1
        
        if ($configTest -match "CONFIG_SUCCESS") {
            Write-TestResult "Backup" "Configuration Management" "PASS" "Configuration management working correctly"
        } else {
            Write-TestResult "Backup" "Configuration Management" "FAIL" "Configuration management failed: $configTest"
        }
    }
    catch {
        Write-TestResult "Backup" "Configuration Management" "FAIL" "Exception during configuration test: $($_.Exception.Message)"
    }
}

function Test-IntegrationSuite {
    Write-Host "`n🔧 Testing Enterprise Integration Suite..." -ForegroundColor Yellow
    
    # Test main integration module
    try {
        $integrationPath = "e:\GitHub\codai-project\apps\romai\src\enterprise\integrations"
        $suiteTest = python -c "
import sys
sys.path.append('$integrationPath')
try:
    from . import RomAIEnterpriseIntegrations, create_enterprise_integrations
    suite = create_enterprise_integrations()
    print('SUITE_SUCCESS')
    
    # Test health check
    import asyncio
    health = asyncio.run(suite.health_check())
    print(f'Overall status: {health.get(\"overall_status\", \"unknown\")}')
    
    # Test integration status
    status = asyncio.run(suite.get_integration_status())
    print(f'LDAP configured: {status.get(\"ldap\", {}).get(\"configured\", False)}')
    print(f'SSO configured: {status.get(\"sso\", {}).get(\"configured\", False)}')
    print(f'Backup configured: {status.get(\"backup\", {}).get(\"configured\", False)}')
    
except Exception as e:
    print(f'SUITE_ERROR: {e}')
" 2>&1
        
        if ($suiteTest -match "SUITE_SUCCESS") {
            Write-TestResult "Integration" "Suite Initialization" "PASS" "Integration suite created successfully"
            
            # Extract status information
            $overallMatch = $suiteTest | Select-String "Overall status: (\w+)"
            if ($overallMatch) {
                $overallStatus = $overallMatch.Matches[0].Groups[1].Value
                Write-TestResult "Integration" "Overall Health" "INFO" "Overall health status: $overallStatus"
            }
            
            # Check individual integrations
            $ldapMatch = $suiteTest | Select-String "LDAP configured: (\w+)"
            $ssoMatch = $suiteTest | Select-String "SSO configured: (\w+)"
            $backupMatch = $suiteTest | Select-String "Backup configured: (\w+)"
            
            if ($ldapMatch) {
                $ldapConfigured = $ldapMatch.Matches[0].Groups[1].Value
                Write-TestResult "Integration" "LDAP Configured" "INFO" "LDAP integration: $ldapConfigured"
            }
            
            if ($ssoMatch) {
                $ssoConfigured = $ssoMatch.Matches[0].Groups[1].Value
                Write-TestResult "Integration" "SSO Configured" "INFO" "SSO integration: $ssoConfigured"
            }
            
            if ($backupMatch) {
                $backupConfigured = $backupMatch.Matches[0].Groups[1].Value
                Write-TestResult "Integration" "Backup Configured" "INFO" "Backup integration: $backupConfigured"
            }
        } else {
            Write-TestResult "Integration" "Suite Initialization" "FAIL" "Integration suite failed: $suiteTest"
        }
    }
    catch {
        Write-TestResult "Integration" "Suite Initialization" "FAIL" "Exception during suite test: $($_.Exception.Message)"
    }
}

# Main execution
Write-Host "Starting enterprise integration tests...`n" -ForegroundColor White

# Check Python availability
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python version: $pythonVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Python not found! Please install Python first." -ForegroundColor Red
    exit 1
}

# Run tests based on parameters
if ($All -or $LDAP) {
    Test-LDAPIntegration
}

if ($All -or $SSO) {
    Test-SSOIntegration
}

if ($All -or $Backup) {
    Test-BackupSystem
}

if ($All) {
    Test-IntegrationSuite
}

# If no specific tests requested, run all
if (-not ($LDAP -or $SSO -or $Backup -or $All)) {
    Test-LDAPIntegration
    Test-SSOIntegration
    Test-BackupSystem
    Test-IntegrationSuite
}

# Generate summary report
Write-Host "`n" + "=" * 60 -ForegroundColor Gray
Write-Host "📊 Test Summary Report" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

$totalTests = 0
$passedTests = 0
$failedTests = 0

foreach ($component in $TestResults.Keys) {
    if ($component -eq "Overall") { continue }
    
    Write-Host "`n$component Integration:" -ForegroundColor Yellow
    
    foreach ($test in $TestResults[$component].Keys) {
        $result = $TestResults[$component][$test]
        $totalTests++
        
        $status = $result.Status
        $color = switch ($status) {
            "PASS" { "Green"; $passedTests++ }
            "FAIL" { "Red"; $failedTests++ }
            "WARN" { "Yellow" }
            "INFO" { "Cyan" }
        }
        
        Write-Host "  ✓ $test : $status" -ForegroundColor $color
        if ($result.Message -and $Verbose) {
            Write-Host "    $($result.Message)" -ForegroundColor Gray
        }
    }
}

Write-Host "`n" + "=" * 60 -ForegroundColor Gray
Write-Host "Final Results:" -ForegroundColor White
Write-Host "  Total Tests: $totalTests" -ForegroundColor White
Write-Host "  Passed: $passedTests" -ForegroundColor Green
Write-Host "  Failed: $failedTests" -ForegroundColor Red
Write-Host "  Overall Status: $($TestResults.Overall)" -ForegroundColor $(if ($TestResults.Overall -eq "PASS") { "Green" } else { "Red" })

if ($TestResults.Overall -eq "PASS") {
    Write-Host "`n✅ All enterprise integration tests completed successfully!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n❌ Some tests failed. Please review the results above." -ForegroundColor Red
    exit 1
}

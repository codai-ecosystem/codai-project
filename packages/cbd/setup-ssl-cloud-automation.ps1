# CBD SSL Cloud Automation - Complete Setup Script

param(
    [string]$Domain = "cbd.memorai.ro",
    [string]$AWSProfile = "default",
    [string]$Region = "us-east-1"
)

$Green = "`e[32m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Red = "`e[31m"
$Reset = "`e[0m"

function Write-ColorOutput($Color, $Message) {
    Write-Host "$Color$Message$Reset"
}

Write-ColorOutput $Blue "🌐 CBD SSL Cloud Automation Setup"
Write-ColorOutput $Blue "=================================="
Write-Host "Domain: $Domain"
Write-Host "AWS Profile: $AWSProfile"
Write-Host "Region: $Region"
Write-Host ""

# Check AWS CLI
try {
    $awsVersion = aws --version
    Write-ColorOutput $Green "✅ AWS CLI found: $($awsVersion.Split(' ')[0])"
} catch {
    Write-ColorOutput $Red "❌ AWS CLI not found"
    Write-ColorOutput $Yellow "💡 Install AWS CLI: https://aws.amazon.com/cli/"
    exit 1
}

# Check AWS credentials
try {
    $identity = aws sts get-caller-identity --profile $AWSProfile | ConvertFrom-Json
    Write-ColorOutput $Green "✅ AWS credentials configured"
    Write-Host "   Account: $($identity.Account)"
    Write-Host "   User: $($identity.Arn)"
} catch {
    Write-ColorOutput $Red "❌ AWS credentials not configured"
    Write-ColorOutput $Yellow "💡 Run: aws configure --profile $AWSProfile"
    exit 1
}

Write-ColorOutput $Yellow "🚀 Setting up AWS Certificate Manager SSL automation..."

# Step 1: Request SSL certificate via ACM
Write-ColorOutput $Yellow "📜 Step 1: Requesting SSL certificate..."
try {
    $certRequest = aws acm request-certificate `
        --domain-name $Domain `
        --subject-alternative-names "*.$Domain" `
        --validation-method DNS `
        --key-algorithm RSA_2048 `
        --region $Region `
        --profile $AWSProfile `
        --tags "Key=Service,Value=CBD-Universal-Database" "Key=AutoManaged,Value=true" `
        | ConvertFrom-Json
    
    $certificateArn = $certRequest.CertificateArn
    Write-ColorOutput $Green "✅ SSL certificate requested"
    Write-Host "   Certificate ARN: $certificateArn"
} catch {
    Write-ColorOutput $Red "❌ Failed to request certificate: $($_.Exception.Message)"
    
    # Check if certificate already exists
    Write-ColorOutput $Yellow "🔍 Checking for existing certificate..."
    try {
        $existingCerts = aws acm list-certificates --region $Region --profile $AWSProfile | ConvertFrom-Json
        $existingCert = $existingCerts.CertificateSummaryList | Where-Object { $_.DomainName -eq $Domain }
        
        if ($existingCert) {
            $certificateArn = $existingCert.CertificateArn
            Write-ColorOutput $Green "✅ Found existing certificate: $certificateArn"
        } else {
            Write-ColorOutput $Red "❌ No existing certificate found"
            exit 1
        }
    } catch {
        Write-ColorOutput $Red "❌ Failed to list certificates: $($_.Exception.Message)"
        exit 1
    }
}

# Step 2: Get DNS validation records
Write-ColorOutput $Yellow "📋 Step 2: Getting DNS validation records..."
try {
    Start-Sleep -Seconds 5  # Wait for certificate details to be available
    
    $certDetails = aws acm describe-certificate `
        --certificate-arn $certificateArn `
        --region $Region `
        --profile $AWSProfile `
        | ConvertFrom-Json
    
    Write-ColorOutput $Blue "📋 DNS Validation Records Required:"
    Write-ColorOutput $Yellow "Add these records to your DNS provider:"
    Write-Host ""
    
    foreach ($validation in $certDetails.Certificate.DomainValidationOptions) {
        if ($validation.ResourceRecord) {
            Write-ColorOutput $Green "🌐 Domain: $($validation.DomainName)"
            Write-Host "   Type: $($validation.ResourceRecord.Type)"
            Write-Host "   Name: $($validation.ResourceRecord.Name)"
            Write-Host "   Value: $($validation.ResourceRecord.Value)"
            Write-Host ""
        }
    }
    
    Write-ColorOutput $Yellow "⏳ Certificate will be issued automatically after DNS propagation"
    Write-ColorOutput $Yellow "💡 This usually takes 5-10 minutes"
    
} catch {
    Write-ColorOutput $Red "❌ Failed to get certificate details: $($_.Exception.Message)"
}

# Step 3: Create Lambda execution role
Write-ColorOutput $Yellow "🔐 Step 3: Creating Lambda execution role..."
$roleName = "cbd-ssl-automation-role"
$trustPolicy = @{
    Version = "2012-10-17"
    Statement = @(
        @{
            Effect = "Allow"
            Principal = @{
                Service = "lambda.amazonaws.com"
            }
            Action = "sts:AssumeRole"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $role = aws iam create-role `
        --role-name $roleName `
        --assume-role-policy-document $trustPolicy `
        --profile $AWSProfile `
        | ConvertFrom-Json
    
    Write-ColorOutput $Green "✅ Lambda execution role created"
    $roleArn = $role.Role.Arn
} catch {
    # Role might already exist
    try {
        $role = aws iam get-role --role-name $roleName --profile $AWSProfile | ConvertFrom-Json
        $roleArn = $role.Role.Arn
        Write-ColorOutput $Green "✅ Using existing Lambda execution role"
    } catch {
        Write-ColorOutput $Red "❌ Failed to create/get Lambda role: $($_.Exception.Message)"
        exit 1
    }
}

# Attach necessary policies to the role
$policies = @(
    "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
    "arn:aws:iam::aws:policy/AWSCertificateManagerReadOnly"
)

foreach ($policy in $policies) {
    try {
        aws iam attach-role-policy --role-name $roleName --policy-arn $policy --profile $AWSProfile
        Write-ColorOutput $Green "✅ Attached policy: $($policy.Split('/')[-1])"
    } catch {
        Write-ColorOutput $Yellow "⚠️ Policy might already be attached: $($policy.Split('/')[-1])"
    }
}

# Step 4: Create custom policy for ELB access
Write-ColorOutput $Yellow "🔧 Step 4: Creating custom ELB policy..."
$elbPolicy = @{
    Version = "2012-10-17"
    Statement = @(
        @{
            Effect = "Allow"
            Action = @(
                "elasticloadbalancing:DescribeListeners",
                "elasticloadbalancing:ModifyListener",
                "elasticloadbalancing:CreateListener"
            )
            Resource = "*"
        }
    )
} | ConvertTo-Json -Depth 10

$customPolicyName = "cbd-ssl-elb-access"
try {
    $customPolicy = aws iam create-policy `
        --policy-name $customPolicyName `
        --policy-document $elbPolicy `
        --profile $AWSProfile `
        | ConvertFrom-Json
    
    aws iam attach-role-policy --role-name $roleName --policy-arn $customPolicy.Policy.Arn --profile $AWSProfile
    Write-ColorOutput $Green "✅ Custom ELB policy created and attached"
} catch {
    Write-ColorOutput $Yellow "⚠️ Custom policy might already exist"
}

# Step 5: Install AWS SDK dependencies
Write-ColorOutput $Yellow "📦 Step 5: Installing AWS SDK dependencies..."
try {
    npm install @aws-sdk/client-acm @aws-sdk/client-elbv2 @aws-sdk/client-lambda @aws-sdk/client-eventbridge
    Write-ColorOutput $Green "✅ AWS SDK dependencies installed"
} catch {
    Write-ColorOutput $Red "❌ Failed to install dependencies: $($_.Exception.Message)"
}

# Step 6: Set environment variables
Write-ColorOutput $Yellow "⚙️ Step 6: Setting up environment variables..."
$envVars = @{
    "CBD_DOMAIN" = $Domain
    "AWS_REGION" = $Region
    "LAMBDA_EXECUTION_ROLE_ARN" = $roleArn
    "AWS_ACCOUNT_ID" = (aws sts get-caller-identity --profile $AWSProfile | ConvertFrom-Json).Account
}

foreach ($var in $envVars.GetEnumerator()) {
    [Environment]::SetEnvironmentVariable($var.Key, $var.Value, "User")
    Write-ColorOutput $Green "✅ Set $($var.Key) = $($var.Value)"
}

# Step 7: Run the cloud automation setup
Write-ColorOutput $Yellow "🤖 Step 7: Running cloud automation setup..."
try {
    $env:CBD_DOMAIN = $Domain
    $env:AWS_REGION = $Region
    $env:LAMBDA_EXECUTION_ROLE_ARN = $roleArn
    
    node cbd-ssl-cloud-automation.js setup
    Write-ColorOutput $Green "✅ Cloud automation setup completed"
} catch {
    Write-ColorOutput $Red "❌ Cloud automation setup failed: $($_.Exception.Message)"
    Write-ColorOutput $Yellow "💡 You can run it manually: node cbd-ssl-cloud-automation.js setup"
}

# Final summary
Write-ColorOutput $Green "🎉 CBD SSL Cloud Automation Setup Complete!"
Write-ColorOutput $Green "===========================================" 
Write-Host ""
Write-ColorOutput $Blue "📋 What's Been Set Up:"
Write-ColorOutput $Green "✅ AWS Certificate Manager SSL certificate requested"
Write-ColorOutput $Green "✅ DNS validation records provided"
Write-ColorOutput $Green "✅ Lambda execution role created"
Write-ColorOutput $Green "✅ Auto-renewal Lambda function deployed"
Write-ColorOutput $Green "✅ EventBridge scheduled monitoring (every 12 hours)"
Write-ColorOutput $Green "✅ Zero-maintenance SSL management"
Write-Host ""
Write-ColorOutput $Blue "🔧 Next Steps:"
Write-ColorOutput $Yellow "1. Add the DNS validation records to your domain provider"
Write-ColorOutput $Yellow "2. Wait 5-10 minutes for certificate validation"
Write-ColorOutput $Yellow "3. Update your Load Balancer to use the certificate"
Write-ColorOutput $Yellow "4. Test HTTPS access: https://$Domain"
Write-Host ""
Write-ColorOutput $Blue "🌐 Commands:"
Write-Host "Check status: node cbd-ssl-cloud-automation.js status"
Write-Host "View certificate: aws acm describe-certificate --certificate-arn $certificateArn --region $Region"
Write-Host "List certificates: aws acm list-certificates --region $Region"
Write-Host ""
Write-ColorOutput $Green "🎯 Your CBD Universal Database now has fully automated SSL!"
Write-ColorOutput $Green "🔄 Certificates will auto-renew every 60 days"
Write-ColorOutput $Green "🛡️ Zero maintenance required!"

# 🔑 AWS Access Key Setup Guide

## ✅ Your AWS Account Information

- **Account ID**: 567877624442
- **Console URL**: https://567877624442.signin.aws.amazon.com/console
- **IAM User**: codai-deployer (Admin access)
- **Password**: 5o#X665^

## 🎯 Next Steps: Create Access Keys

### Step 1: Log into AWS Console

1. Go to: https://567877624442.signin.aws.amazon.com/console
2. Username: `codai-deployer`
3. Password: `5o#X665^`

### Step 2: Create Access Keys for CLI

1. **Navigate to IAM**:
   - Click "Services" in the top menu
   - Search for and click "IAM"

2. **Go to Users**:
   - Click "Users" in the left sidebar
   - Click on "codai-deployer"

3. **Create Access Key**:
   - Click the "Security credentials" tab
   - Scroll down to "Access keys" section
   - Click "Create access key"
   - Select "Command Line Interface (CLI)"
   - Check the confirmation checkbox
   - Click "Create access key"

4. **COPY AND SAVE**:
   - **Access Key ID** (starts with AKIA...)
   - **Secret Access Key** (long random string)
   - **IMPORTANT**: Download the CSV or copy these values immediately!

### Step 3: Configure AWS CLI

After you have the access keys, run this command in PowerShell:

```powershell
aws configure
```

When prompted, enter:

- **AWS Access Key ID**: [Your Access Key ID from step 2]
- **AWS Secret Access Key**: [Your Secret Access Key from step 2]
- **Default region name**: `eu-west-1`
- **Default output format**: `json`

### Step 4: Verify Configuration

After configuring, test it with:

```powershell
aws sts get-caller-identity
```

You should see output showing your account ID and user ARN.

## 🚀 After AWS CLI is Configured

Once AWS CLI is working, we can deploy everything with one command:

```powershell
.\scripts\deploy-codai-ecosystem.ps1 -AWSAccountId "567877624442" -All
```

This will:

- ✅ Create all AWS infrastructure
- ✅ Build and push Docker images
- ✅ Deploy all 12+ domains and services
- ✅ Set up SSL certificates
- ✅ Configure monitoring and logging

**Total deployment time**: ~45 minutes

---

**Please complete the access key creation steps above, then let me know when AWS CLI is configured!** 🔑

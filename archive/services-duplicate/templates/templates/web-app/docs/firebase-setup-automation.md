# Firebase Project Setup Automation

This document provides comprehensive automation for Firebase project creation,
credential setup, and Stripe integration for the METU Template.

## Overview

The METU template includes automated Firebase project setup scripts that use
Google Cloud CLI and Firebase CLI to create and configure a complete Firebase
project with Stripe integration and testing support.

## Prerequisites

Before using the automated setup, ensure you have:

1. **Google Cloud CLI** installed and authenticated

   ```bash
   # Install Google Cloud CLI
   # Windows: Download from https://cloud.google.com/sdk/docs/install
   # macOS: brew install google-cloud-sdk
   # Linux: curl https://sdk.cloud.google.com | bash

   # Authenticate
   gcloud auth login
   gcloud auth application-default login
   ```

2. **Firebase CLI** installed

   ```bash
   npm install -g firebase-tools
   firebase login
   ```

3. **Node.js and npm/pnpm** installed

4. **Stripe account** with test API keys (for payment integration)

## Quick Start

### Option 1: Complete Automated Setup (Recommended)

Run the comprehensive setup script:

```bash
pnpm setup:firebase:complete
```

This will:

- Create Firebase project
- Enable all required services
- Configure Authentication providers
- Install Stripe extension
- Generate credentials
- Update environment files

### Option 2: Individual Setup Scripts

```bash
# Create Firebase project only
pnpm firebase:create

# Setup services and configure
pnpm firebase:configure

# Install Stripe extension
pnpm firebase:stripe

# Generate credentials
pnpm firebase:credentials
```

### Option 3: Manual Setup

If you prefer manual control or automation fails:

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication and Firestore
3. Create a web app and service accounts
4. Copy configurations to environment files

## What the Automated Setup Does

### 1. Authentication

- Authenticates with Google Cloud using your browser
- Verifies access to create projects

### 2. Project Creation

- Creates a new Google Cloud project with a unique ID
- Links billing account (if available)
- Enables required APIs:
  - Firebase API
  - Firestore API
  - Identity Toolkit API
  - Cloud Functions API
  - Cloud Storage API

### 3. Firebase Initialization

- Adds Firebase to the Google Cloud project
- Enables Firebase Authentication
- Creates Firestore database in us-central1 region
- Sets the project as default for Firebase CLI

### 4. Service Account Setup

- Creates separate service accounts for development and testing
- Grants necessary IAM roles:
  - Firebase Admin
  - Datastore User
  - Storage Admin
- Generates and downloads service account keys

### 5. Web App Configuration

- Creates a Firebase web app
- Generates client-side configuration
- Extracts API keys and configuration

### 6. Environment File Generation

- Creates `apps/backend/.env` with development credentials
- Creates `apps/backend/.env.test` with test credentials
- Creates `apps/web/.env.local` with web app configuration
- Includes all necessary environment variables

### 7. Security Rules

- Sets up basic Firestore security rules
- Deploys rules to the Firebase project
- Provides user-based access control

## Generated Files

After successful setup, the following files are created/updated:

```
apps/
├── backend/
│   ├── .env                    # Development environment
│   ├── .env.test              # Test environment
│   ├── metu-dev-key.json      # Development service account key
│   └── metu-test-key.json     # Test service account key
└── web/
    └── .env.local             # Frontend environment
```

## Environment Variables Reference

### Backend Development (.env)

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=metu-dev@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_PRIVATE_KEY_ID=key_id_here
PORT=3001
NODE_ENV=development
```

### Backend Testing (.env.test)

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=metu-test@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_PRIVATE_KEY_ID=key_id_here
PORT=3002
NODE_ENV=test
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Security Considerations

### Service Account Keys

- Service account keys contain sensitive credentials
- Never commit these files to version control
- Store them securely in production environments
- Rotate keys regularly for security

### Environment Files

- All `.env*` files are git-ignored by default
- Never commit environment files containing real credentials
- Use different projects for development, testing, and production

### Firebase Security Rules

The automated setup creates basic security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Public data that anyone can read
    match /public/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### CLI Tools Not Found

If you see errors about missing CLI tools:

```bash
# Install Google Cloud CLI
# See: https://cloud.google.com/sdk/docs/install

# Install Firebase CLI
npm install -g firebase-tools

# Verify installations
gcloud --version
firebase --version
```

### Authentication Issues

```bash
# Re-authenticate with Google Cloud
gcloud auth login

# Re-authenticate with Firebase
firebase login
```

### Permission Errors

Ensure your Google Cloud account has:

- Project creation permissions
- Billing account access (for some features)
- IAM admin permissions

### Billing Account Required

Some Firebase features require a billing account:

- Cloud Functions
- Firestore beyond free tier
- Cloud Storage beyond free tier

Set up billing in the Google Cloud Console.

### Project Creation Fails

If project creation fails:

1. Check if you have quota for new projects
2. Verify billing account is set up
3. Ensure unique project naming
4. Check Google Cloud Console for error details

## Manual Cleanup

If you need to clean up a created project:

```bash
# List projects
gcloud projects list

# Delete project (irreversible)
gcloud projects delete PROJECT_ID

# Remove local configurations
rm apps/backend/.env apps/backend/.env.test
rm apps/web/.env.local
rm apps/backend/metu-*-key.json
```

## Production Deployment

For production deployments:

1. Create a separate Firebase project for production
2. Use different service accounts with minimal permissions
3. Set up CI/CD environment variables
4. Never use development credentials in production
5. Enable additional security features (App Check, etc.)

## Advanced Configuration

### Custom Regions

The script creates Firestore in `us-central1`. To use a different region:

1. Run the automated setup
2. Manually migrate Firestore to your preferred region
3. Update any region-specific configurations

### Multiple Environments

For staging, preview, or other environments:

1. Run the setup script multiple times with different project names
2. Create separate environment files (`.env.staging`, etc.)
3. Update deployment scripts to use appropriate configurations

### CI/CD Integration

For automated deployments:

1. Store service account keys as CI/CD secrets
2. Use environment-specific Firebase projects
3. Set up automated deployment with Firebase CLI
4. Implement proper secret rotation

## Support

For issues with the automated setup:

1. Check the troubleshooting section above
2. Review logs for specific error messages
3. Verify CLI tool installations and authentication
4. Consult Firebase and Google Cloud documentation
5. Open an issue in the project repository

For Firebase-specific questions:

- Firebase Documentation: https://firebase.google.com/docs
- Firebase Console: https://console.firebase.google.com
- Google Cloud Console: https://console.cloud.google.com

# 📱 Mobile Development Environment Setup Guide - Sprint 15

**Target**: CODAI Mobile App Development Team  
**Sprint**: 15 (Sep 11-24, 2025)  
**Platform**: React Native (iOS & Android)  
**Setup Time**: 2-3 hours  

---

## 🎯 Quick Start Overview

This guide will get you set up for CODAI mobile development in **3 major steps**:

1. **Prerequisites Installation** (1 hour)
2. **Project Setup & Configuration** (45 minutes) 
3. **Development Environment Validation** (30 minutes)

**By the end, you'll have:**
- React Native development environment
- CODAI mobile app running on simulators
- AI integration and offline features working
- Hot reloading and debugging tools configured

---

## 🔧 Prerequisites Installation

### System Requirements

#### Minimum Specifications
```yaml
Operating System:
  - macOS: 12.0+ (for iOS development)
  - Windows: 10/11 (Android only)
  - Linux: Ubuntu 20.04+ (Android only)

Hardware:
  - RAM: 16GB minimum, 32GB recommended
  - Storage: 50GB free space
  - CPU: Intel i5/AMD Ryzen 5 or better

Network:
  - Stable internet connection for package downloads
  - Access to GitHub and npm repositories
```

### Core Development Tools

#### 1. Node.js & Package Management
```bash
# Install Node.js v20.11.0+ (LTS)
# Option A: Using Node Version Manager (Recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20.11.0
nvm use 20.11.0
nvm alias default 20.11.0

# Option B: Direct download from nodejs.org
# Download and install Node.js 20.11.0 LTS

# Verify installation
node --version  # Should output v20.11.0+
npm --version   # Should output v10.0.0+

# Install pnpm (CODAI package manager)
npm install -g pnpm@8.15.0
pnpm --version  # Should output 8.15.0+
```

#### 2. React Native CLI
```bash
# Install React Native CLI globally
npm install -g @react-native-community/cli@12.0.0

# Verify installation
npx react-native --version
```

#### 3. Git Configuration
```bash
# Configure Git (replace with your details)
git config --global user.name "Your Name"
git config --global user.email "your.email@codai.dev"
git config --global init.defaultBranch main

# Set up SSH key for GitHub (if not done)
ssh-keygen -t ed25519 -C "your.email@codai.dev"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Add public key to GitHub account
cat ~/.ssh/id_ed25519.pub  # Copy this to GitHub SSH keys
```

### iOS Development Setup (macOS Only)

#### Xcode Installation
```bash
# Install Xcode from Mac App Store (13GB+ download)
# Or install Xcode Command Line Tools only:
xcode-select --install

# Verify Xcode installation
xcode-select -p  # Should show Xcode path
xcrun simctl list devices  # List available simulators
```

#### iOS Simulator Setup
```bash
# Open Xcode and install additional simulators
# Xcode → Preferences → Components → Simulators
# Recommended: iPhone 15 Pro, iPhone SE, iPad Pro

# Install CocoaPods (iOS dependency manager)
sudo gem install cocoapods
pod --version  # Should output 1.14.0+

# If gem install fails, use Homebrew:
brew install cocoapods
```

#### iOS Development Certificates
```bash
# This will be handled during first build
# Xcode will prompt for developer account setup
# For team development, use shared provisioning profiles
```

### Android Development Setup

#### Android Studio Installation
```bash
# Download Android Studio from developer.android.com
# Install with default settings (includes Android SDK)

# After installation, open Android Studio and:
# 1. Complete the setup wizard
# 2. Install Android SDK Platform 34 (Android 14)
# 3. Install Android SDK Build-Tools 34.0.0
# 4. Install Android Emulator
# 5. Install Intel x86 Emulator Accelerator (HAXM)
```

#### Environment Variables (macOS/Linux)
```bash
# Add to ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
# export ANDROID_HOME=$HOME/Android/Sdk  # Linux

export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin

# Reload shell configuration
source ~/.bashrc  # or source ~/.zshrc
```

#### Environment Variables (Windows)
```powershell
# Add to System Environment Variables
# ANDROID_HOME: C:\Users\%USERNAME%\AppData\Local\Android\Sdk
# Path additions:
#   %ANDROID_HOME%\emulator
#   %ANDROID_HOME%\platform-tools
#   %ANDROID_HOME%\cmdline-tools\latest\bin
```

#### Android Virtual Device (AVD) Setup
```bash
# Open Android Studio → AVD Manager
# Create virtual device:
# - Device: Pixel 7 Pro (recommended)
# - System Image: Android 14 (API 34) x86_64
# - Advanced Settings: 4GB RAM, 32GB internal storage

# Verify AVD is working
emulator -list-avds
```

---

## 🏗️ Project Setup & Configuration

### CODAI Repository Clone
```bash
# Create development directory
mkdir ~/Development/codai
cd ~/Development/codai

# Clone the repository
git clone git@github.com:codai-ecosystem/codai-project.git
cd codai-project

# Switch to development branch
git checkout dev
git pull origin dev

# Verify repository structure
ls -la  # Should see apps/, packages/, libs/, etc.
```

### Dependencies Installation
```bash
# Install root dependencies (this may take 10-15 minutes)
pnpm install

# Verify package installation
pnpm list  # Should show dependency tree
```

### Mobile App Specific Setup
```bash
# Navigate to mobile app directory
cd apps/mobile

# Install mobile-specific dependencies
pnpm install

# iOS-specific setup (macOS only)
cd ios
pod install  # Install iOS native dependencies
cd ..

# Verify mobile app structure
ls -la  # Should see src/, ios/, android/ directories
```

### Environment Configuration

#### Development Environment Variables
```bash
# Create environment file
cp .env.example .env.local

# Edit .env.local with development values:
# REACT_NATIVE_ENV=development
# CODAI_API_BASE_URL=http://localhost:4000
# CODAI_WEBSOCKET_URL=ws://localhost:4900
# AI_SERVICE_URL=http://localhost:6101
# IDENTITY_SERVICE_URL=http://localhost:4100
```

#### Metro Configuration
```javascript
// metro.config.js (should already exist)
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add workspace support for monorepo
const workspaceRoot = path.resolve(__dirname, '../..');
const projectRoot = __dirname;

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
```

---

## 🚀 Development Environment Validation

### Backend Services Startup
```bash
# Start CODAI backend services (in separate terminal)
cd ~/Development/codai/codai-project

# Start essential services using VS Code task
# Or manually:
pnpm services:start

# Verify services are running
curl http://localhost:4000/health  # Load balancer
curl http://localhost:4100/health  # Identity service
curl http://localhost:6101/health  # AI service
```

### Mobile App Development Server
```bash
# In mobile app directory
cd apps/mobile

# Start Metro bundler
pnpm start
# This should show QR code and instructions
```

### iOS Development Validation
```bash
# In new terminal, navigate to mobile app
cd apps/mobile

# Start iOS simulator (macOS only)
pnpm ios

# Expected behavior:
# 1. iOS Simulator opens with iPhone device
# 2. CODAI app installs and launches
# 3. App shows login/auth screen
# 4. Hot reloading works when you save files

# If build fails, common fixes:
cd ios
pod install --repo-update
cd ..
pnpm ios
```

### Android Development Validation  
```bash
# Start Android emulator first
emulator -avd Pixel_7_Pro_API_34

# In mobile app directory
cd apps/mobile

# Start Android development
pnpm android

# Expected behavior:
# 1. App builds and installs on emulator
# 2. CODAI app launches automatically  
# 3. Authentication flow appears
# 4. Hot reloading responds to code changes

# If build fails, try:
cd android
./gradlew clean
cd ..
pnpm android
```

---

## 🔧 Development Tools Configuration

### IDE Setup (VS Code Recommended)

#### Essential Extensions
```bash
# Install via VS Code extensions panel:
# - React Native Tools (Microsoft)
# - ES7+ React/Redux/React-Native snippets
# - Prettier - Code formatter
# - ESLint
# - GitLens
# - Thunder Client (API testing)
# - React Native Snippet
```

#### VS Code Settings
```json
// .vscode/settings.json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact",
    "typescript": "typescriptreact"
  },
  "react-native-tools.showUserTips": false,
  "react-native-tools.projectRoot": "./apps/mobile"
}
```

#### Prettier Configuration
```json
// apps/mobile/.prettierrc
{
  "arrowParens": "avoid",
  "bracketSameLine": true,
  "bracketSpacing": false,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "semi": true
}
```

### Debugging Setup

#### React Native Debugger (Recommended)
```bash
# Install React Native Debugger
# macOS
brew install --cask react-native-debugger

# Windows
# Download from GitHub releases: react-native-debugger/react-native-debugger

# Linux  
# Download AppImage from GitHub releases
```

#### Chrome DevTools Integration
```bash
# Enable remote debugging in app
# Shake device/simulator → "Debug" → "Open DevTools"
# Or use React Native Debugger (preferred)
```

#### Flipper Integration (Advanced)
```bash
# Install Flipper desktop app
# macOS
brew install --cask flipper

# Configure Flipper plugins for React Native
# Network, Databases, Shared Preferences, Crash Reporter
```

---

## 🧪 Testing Environment Setup

### Unit Testing
```bash
# Testing dependencies should be installed via pnpm install
# Verify Jest configuration in package.json

# Run tests to verify setup
cd apps/mobile
pnpm test

# Expected output: Test suite runs successfully
```

### E2E Testing with Detox
```bash
# Install Detox CLI globally
npm install -g detox-cli

# iOS E2E setup (macOS only)
cd apps/mobile
detox build --configuration ios.sim.debug
detox test --configuration ios.sim.debug

# Android E2E setup
detox build --configuration android.emu.debug
detox test --configuration android.emu.debug
```

---

## 🔌 AI Integration Setup

### AI Service Connection
```bash
# Verify AI service is running
curl http://localhost:6101/health

# Test AI API endpoint
curl -X POST http://localhost:6101/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello from mobile setup", "model": "romai"}'
```

### Voice Integration Setup
```bash
# iOS Speech Framework (built-in)
# Android Speech Recognition (built-in)
# Both should work out-of-the-box with react-native-voice

# Test voice permissions in simulator:
# Settings → Privacy & Security → Microphone → CODAI → Enable
```

---

## 📱 Mobile-Specific Configuration

### iOS Configuration

#### Info.plist Permissions
```xml
<!-- ios/codai/Info.plist -->
<key>NSMicrophoneUsageDescription</key>
<string>CODAI needs microphone access for voice-to-text AI features</string>

<key>NSCameraUsageDescription</key>
<string>CODAI needs camera access for document scanning</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>CODAI needs photo access to share images in chats</string>
```

#### iOS Bundle Configuration
```xml
<!-- ios/codai/Info.plist -->
<key>CFBundleDisplayName</key>
<string>CODAI</string>

<key>CFBundleIdentifier</key>
<string>dev.codai.mobile</string>

<key>CFBundleVersion</key>
<string>1.0.0</string>
```

### Android Configuration

#### AndroidManifest.xml Permissions
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

#### Application Configuration
```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<application
  android:name=".MainApplication"
  android:label="@string/app_name"
  android:icon="@mipmap/ic_launcher"
  android:allowBackup="false"
  android:theme="@style/AppTheme"
  android:usesCleartextTraffic="true">
```

---

## 🏃‍♂️ Development Workflow

### Daily Development Process

#### 1. Start Development Session
```bash
# Terminal 1: Backend services
cd ~/Development/codai/codai-project
pnpm services:start

# Terminal 2: Mobile Metro bundler
cd apps/mobile  
pnpm start

# Terminal 3: iOS/Android specific
pnpm ios    # or pnpm android
```

#### 2. Development Commands
```bash
# Hot reload (automatic on file save)
# Manual reload: 'r' in Metro terminal

# Developer menu in simulator:
# iOS: Cmd+D (simulator) or Cmd+Shift+Z (device)
# Android: Cmd+M (simulator) or shake device

# Common development commands
pnpm test           # Run unit tests
pnpm test:e2e       # Run E2E tests
pnpm lint           # ESLint check
pnpm type-check     # TypeScript validation
```

### Code Organization

#### Mobile App Structure
```
apps/mobile/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   ├── navigation/     # Navigation configuration
│   ├── services/       # API clients and services
│   ├── store/         # State management (Zustand)
│   ├── utils/         # Helper functions
│   ├── hooks/         # Custom React hooks
│   └── types/         # TypeScript type definitions
├── ios/               # iOS native configuration
├── android/           # Android native configuration
├── __tests__/         # Unit tests
└── e2e/              # End-to-end tests
```

#### Coding Standards
```typescript
// Example component structure
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAIService } from '../hooks/useAIService';

interface AIChatScreenProps {
  navigation: NavigationProp<any>;
}

export const AIChatScreen: React.FC<AIChatScreenProps> = ({ navigation }) => {
  const { sendMessage, isLoading } = useAIService();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Chat</Text>
      {/* Component implementation */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
```

---

## 🚨 Troubleshooting Guide

### Common Issues & Solutions

#### Metro Bundler Issues
```bash
# Problem: Metro cache issues
# Solution: Clear Metro cache
pnpm start --reset-cache

# Problem: Port conflicts
# Solution: Kill processes on port 8081
npx kill-port 8081
pnpm start
```

#### iOS Build Issues
```bash
# Problem: CocoaPods installation failures  
# Solution: Update and reinstall pods
cd ios
pod deintegrate
pod install --repo-update
cd ..

# Problem: Xcode build failures
# Solution: Clean build folder
cd ios
xcodebuild -workspace codai.xcworkspace -scheme codai clean
cd ..
pnpm ios
```

#### Android Build Issues
```bash
# Problem: Gradle build failures
# Solution: Clean and rebuild
cd android
./gradlew clean
cd ..
pnpm android

# Problem: SDK not found
# Solution: Verify ANDROID_HOME environment variable
echo $ANDROID_HOME  # Should show SDK path
```

#### Common Development Issues
```bash
# Problem: Hot reloading not working
# Solution: Restart Metro bundler and reload app

# Problem: AI service connection failed
# Solution: Verify backend services are running
curl http://localhost:6101/health

# Problem: Authentication errors
# Solution: Check identity service
curl http://localhost:4100/health
```

### Performance Optimization Tips

#### Development Performance
- Use physical device for best performance testing
- Enable Hermes JavaScript engine (already configured)
- Optimize images for mobile (use WebP format)
- Implement proper loading states for AI features
- Use FlatList for large data sets

#### Build Performance  
```bash
# Enable parallel builds (Android)
# android/gradle.properties
org.gradle.parallel=true
org.gradle.daemon=true
org.gradle.jvmargs=-Xmx4096m

# iOS build optimization (already configured)
# Use Hermes engine for better performance
```

---

## 📋 Pre-Development Checklist

Before starting Sprint 15 development:

### Environment Verification
- [ ] Node.js v20.11.0+ installed and working
- [ ] pnpm package manager installed
- [ ] React Native CLI installed globally
- [ ] Git configured with SSH keys
- [ ] CODAI repository cloned and dependencies installed

### iOS Development (macOS only)
- [ ] Xcode installed with Command Line Tools
- [ ] iOS Simulator configured (iPhone 15 Pro recommended)
- [ ] CocoaPods installed and working
- [ ] iOS app builds and runs successfully

### Android Development
- [ ] Android Studio installed with SDK 34
- [ ] ANDROID_HOME environment variable set
- [ ] Android Virtual Device created and working
- [ ] Android app builds and runs successfully

### CODAI Integration
- [ ] Backend services running and accessible
- [ ] AI service responding to test requests
- [ ] Identity service authentication working
- [ ] Mobile app can connect to all required services

### Development Tools
- [ ] VS Code configured with essential extensions
- [ ] React Native Debugger or Flipper installed
- [ ] Testing environment functional (unit + E2E)
- [ ] Code formatting and linting working

---

## 🆘 Getting Help

### Team Support Channels
- **Slack**: #mobile-dev-support (immediate help)
- **Email**: mobile-team@codai.dev (non-urgent questions)
- **Video Call**: Available 9 AM - 6 PM EST for screen sharing

### Documentation Resources
- [React Native Official Docs](https://reactnative.dev/docs/getting-started)
- [CODAI API Documentation](./docs/api/README.md)
- [Sprint 15 Technical Specs](./SPRINT_15_PLAN.md)
- [Mobile Architecture Guide](./docs/mobile/architecture.md)

### Emergency Escalation
If you're completely blocked and can't proceed:
1. Post in #mobile-dev-support with error details
2. Tag @mobile-team-leads for immediate assistance
3. If urgent, call: +1-555-CODAI-HELP

---

## ✅ Setup Complete!

**Congratulations!** 🎉 Your mobile development environment is now ready for Sprint 15.

### What you've accomplished:
✅ Complete React Native development environment  
✅ iOS and Android build capabilities  
✅ CODAI backend integration working  
✅ AI service connectivity established  
✅ Development tools and debugging setup  
✅ Testing environment functional  

### Next steps:
1. **Join Sprint Kickoff** (Sep 11, 9:00 AM)
2. **Review Sprint 15 Plan** (SPRINT_15_PLAN.md)
3. **Start with User Story #415** (React Native App Foundation)
4. **Daily Standups** at 9:00 AM starting Sep 12

### Quick validation test:
```bash
# Run this to verify everything is working:
cd apps/mobile
pnpm test  # Unit tests should pass
pnpm ios   # iOS app should launch
pnpm android  # Android app should launch (in separate terminal)
```

---

**Setup Guide Version**: 1.0  
**Created**: August 27, 2025  
**Mobile Team**: mobile-team@codai.dev  
**Sprint Manager**: product@codai.dev  

*Ready to build something amazing! 🚀*
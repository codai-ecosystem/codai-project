#!/usr/bin/env node

/**
 * CODAI Ecosystem Template Applier
 * 
 * Applies our shared components and authentication infrastructure
 * to all apps in the CODAI ecosystem.
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Get list of all apps
const appsDir = path.join(__dirname, '..', 'apps')
const apps = fs.readdirSync(appsDir).filter(name => {
  const appPath = path.join(appsDir, name)
  return fs.statSync(appPath).isDirectory() && name !== 'README.md'
})

console.log(`🚀 Found ${apps.length} apps to update:`)
apps.forEach(app => console.log(`   - ${app}`))

console.log(`\\n🔧 Starting template application...`)

let successful = 0
let failed = 0
const failedApps = []

for (const app of apps) {
  try {
    console.log(`\\n📝 Processing ${app}...`)

    // Skip if app doesn't have package.json (not a valid Next.js app)
    const packageJsonPath = path.join(appsDir, app, 'package.json')
    if (!fs.existsSync(packageJsonPath)) {
      console.log(`   ⚠️  Skipping ${app} - no package.json found`)
      continue
    }

    // Apply template
    execSync(`node generate-app-template.cjs ${app}`, {
      cwd: path.join(__dirname),
      stdio: 'pipe'
    })

    console.log(`   ✅ ${app} updated successfully`)
    successful++

  } catch (error) {
    console.log(`   ❌ Failed to update ${app}: ${error.message}`)
    failed++
    failedApps.push(app)
  }
}

console.log(`\\n📊 Summary:`)
console.log(`   ✅ Successful: ${successful}`)
console.log(`   ❌ Failed: ${failed}`)

if (failedApps.length > 0) {
  console.log(`\\n❌ Failed apps:`)
  failedApps.forEach(app => console.log(`   - ${app}`))
}

console.log(`\\n🎯 Next steps:`)
console.log(`   1. Review the updated files`)
console.log(`   2. Test each app individually`)
console.log(`   3. Build shared packages: pnpm build --filter @codai/shared-ui`)
console.log(`   4. Run apps: cd apps/<app-name> && pnpm dev`)

console.log(`\\n🔗 Shared Components Available:`)
console.log(`   - LandingPage: Pre-built landing page with features`)
console.log(`   - DashboardPage: Complete dashboard with stats and actions`)
console.log(`   - AppShell: Universal app wrapper with auth`)
console.log(`   - AuthProvider: Complete authentication system`)
console.log(`   - Authentication middleware for route protection`)
console.log(`   - Shared UI components (Button, Input, Card, etc.)`)

console.log(`\\n✨ All apps now have:`)
console.log(`   - Consistent authentication flow`)
console.log(`   - Landing page for non-authenticated users`)
console.log(`   - Dashboard for authenticated users`)
console.log(`   - Shared UI components and styling`)
console.log(`   - Route protection middleware`)
console.log(`   - Romanian/English translation support`)

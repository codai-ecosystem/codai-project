#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🗂️ CODAI ECOSYSTEM - WORKSPACE SIMPLIFICATION EXECUTION\n');
console.log('Date:', new Date().toISOString());
console.log('Phase: 1.3 - Implementing Workspace Optimization\n');

const workspaceRoot = process.cwd();

// Apps to archive (from analysis)
const APPS_TO_ARCHIVE = [
    'acasai', 'curtai', 'dexai', 'mobile', 'muzicai', 'sunai', 'talentai'
];

// Core apps to keep active
const CORE_APPS = [
    'codai', 'memorai', 'logai', 'bancai', 'fabricai', 'wallet', 'admin', 'docs'
];

// Apps to evaluate for future phases
const FUTURE_APPS = [
    'studiai', 'sociai', 'cumparai', 'publicai'
];

function createArchiveStructure() {
    const archiveDir = path.join(workspaceRoot, 'archive');
    const appsArchiveDir = path.join(archiveDir, 'apps');

    if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir);
        console.log('✅ Created archive/ directory');
    }

    if (!fs.existsSync(appsArchiveDir)) {
        fs.mkdirSync(appsArchiveDir);
        console.log('✅ Created archive/apps/ directory');
    }

    return appsArchiveDir;
}

function moveAppToArchive(appName, archiveDir) {
    const sourcePath = path.join(workspaceRoot, 'apps', appName);
    const targetPath = path.join(archiveDir, appName);

    if (!fs.existsSync(sourcePath)) {
        console.log(`   ⚠️  App ${appName} not found, skipping`);
        return false;
    }

    if (fs.existsSync(targetPath)) {
        console.log(`   ⚠️  Archive target for ${appName} already exists, skipping`);
        return false;
    }

    try {
        // Use Windows robocopy for reliable directory moving
        execSync(`robocopy "${sourcePath}" "${targetPath}" /E /MOVE`, {
            stdio: 'pipe'
        });
        console.log(`   📦 Archived ${appName}`);
        return true;
    } catch (error) {
        // Robocopy returns non-zero exit codes for success, so check if directory was actually moved
        if (!fs.existsSync(sourcePath) && fs.existsSync(targetPath)) {
            console.log(`   📦 Archived ${appName}`);
            return true;
        } else {
            console.error(`   ❌ Failed to archive ${appName}: ${error.message}`);
            return false;
        }
    }
}

function updateWorkspaceConfig() {
    const workspaceConfigPath = path.join(workspaceRoot, 'pnpm-workspace.yaml');

    if (!fs.existsSync(workspaceConfigPath)) {
        console.log('⚠️  pnpm-workspace.yaml not found');
        return;
    }

    const config = fs.readFileSync(workspaceConfigPath, 'utf8');
    const lines = config.split('\n');

    // Add archive patterns to packages
    const updatedLines = lines.map(line => {
        if (line.trim() === '# Primary applications' || line.trim() === 'packages:') {
            return line;
        }
        if (line.trim() === '- "apps/*"') {
            return [
                '  # Core applications (active development)',
                '  - "apps/*"',
                '  ',
                '  # Archived applications (for reference)',
                '  - "archive/apps/*"'
            ].join('\n');
        }
        return line;
    });

    const updatedConfig = updatedLines.join('\n');
    fs.writeFileSync(workspaceConfigPath, updatedConfig);
    console.log('✅ Updated pnpm-workspace.yaml to include archive patterns');
}

function createCoreAppsReadme() {
    const readmeContent = `# Codai Ecosystem - Core Applications

**Status**: Active Development - Phase 1 Complete  
**Updated**: ${new Date().toISOString().split('T')[0]}

## 🎯 Core Applications (Priority 1-2)

These applications represent the essential functionality of the Codai ecosystem and are actively maintained with modern dependencies.

### Foundation Tier (Priority 1)
- **codai** - Central Platform & AIDE Hub
- **memorai** - AI Memory & Database Core  
- **logai** - Identity & Authentication Hub

### Business Tier (Priority 2)
- **bancai** - Financial Platform
- **fabricai** - AI Services Platform
- **wallet** - Programmable Wallet

### Administrative Tools
- **admin** - Administrative Dashboard
- **docs** - Documentation Platform

## 📦 Recent Updates (Phase 1.2)

✅ **Dependency Modernization Completed**:
- React 19.0.0 (latest stable)
- Next.js 15.1.0 (latest stable)
- TailwindCSS 4.1.0 (latest with @tailwindcss/postcss)
- TypeScript 5.7.0 (latest stable)
- Vitest 3.2.0 (latest testing framework)

✅ **TailwindCSS v4 Migration**:
- Automated PostCSS configuration updates
- Deprecated packages removed (@tailwindcss/forms)
- New packages added (@tailwindcss/postcss)

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ LTS
- pnpm 8.15.0+

### Development
\`\`\`bash
# Install dependencies
pnpm install

# Start core application
cd apps/codai && pnpm dev

# Start with specific port
cd apps/memorai && pnpm dev --port 4031
\`\`\`

### Port Allocation
- **codai**: 4030 (Central Platform)
- **memorai**: 4031 (AI Memory)
- **logai**: 4032 (Authentication)
- **bancai**: 4033 (Financial)
- **wallet**: 4034 (Wallet)
- **fabricai**: 4035 (AI Services)

## 📂 Archived Applications

The following applications have been archived to \`archive/apps/\` for future development:
- acasai, curtai, dexai, mobile, muzicai, sunai, talentai

## 🔄 Future Development Applications

These applications are planned for Phase 2-3 development:
- **studiai** - AI Education Platform
- **sociai** - AI Social Platform  
- **cumparai** - AI Shopping Platform
- **publicai** - Public AI Services

## 🎯 Next Steps

1. **Phase 2**: Core Application Development (Weeks 3-6)
2. **Phase 3**: Design Excellence & Additional Features (Weeks 7-10)
3. **Phase 4**: Production Readiness (Weeks 11-14)
4. **Phase 5**: Launch & Optimization (Weeks 15-16)

---
*Generated by Workspace Simplification Process - Phase 1.3*
`;

    const readmePath = path.join(workspaceRoot, 'apps', 'README.md');
    fs.writeFileSync(readmePath, readmeContent);
    console.log('✅ Created apps/README.md with core applications guide');
}

function createArchiveIndex() {
    const indexContent = `# Archived Applications

**Date Archived**: ${new Date().toISOString().split('T')[0]}  
**Reason**: Workspace simplification during Phase 1.3

## Archived Applications

The following applications have been moved to archive during the workspace simplification process:

${APPS_TO_ARCHIVE.map(app => `- **${app}** - Experimental/newer application`).join('\n')}

## Status

These applications are preserved for future development but are not part of the current core development focus. They can be restored to active development by moving them back to the \`apps/\` directory.

## Restoration Process

To restore an archived application:

\`\`\`bash
# Move back to active apps
mv archive/apps/[app-name] apps/[app-name]

# Update dependencies (may need modernization)
cd apps/[app-name] && pnpm install

# Update to current dependency versions if needed
\`\`\`

## Notes

- All archived applications preserve their full history and configuration
- Dependencies may need updating when restored
- Some applications may require migration to current architecture patterns

---
*Generated by Workspace Simplification Process*
`;

    const indexPath = path.join(workspaceRoot, 'archive', 'apps', 'README.md');
    fs.writeFileSync(indexPath, indexContent);
    console.log('✅ Created archive/apps/README.md');
}

async function executeWorkspaceSimplification() {
    console.log('📋 Step 1: Creating archive structure...');
    const archiveDir = createArchiveStructure();

    console.log('\n📋 Step 2: Archiving experimental applications...');
    let archivedCount = 0;

    for (const app of APPS_TO_ARCHIVE) {
        if (moveAppToArchive(app, archiveDir)) {
            archivedCount++;
        }
    }

    console.log(`\n   📊 Archived ${archivedCount}/${APPS_TO_ARCHIVE.length} applications`);

    console.log('\n📋 Step 3: Updating workspace configuration...');
    updateWorkspaceConfig();

    console.log('\n📋 Step 4: Creating documentation...');
    createCoreAppsReadme();
    createArchiveIndex();

    console.log('\n📋 Step 5: Validating core applications...');
    const appsDir = path.join(workspaceRoot, 'apps');
    const remainingApps = fs.readdirSync(appsDir).filter(item => {
        const itemPath = path.join(appsDir, item);
        return fs.statSync(itemPath).isDirectory();
    });

    console.log(`\n   📊 Remaining applications: ${remainingApps.length}`);
    console.log(`   Core apps: ${remainingApps.filter(app => CORE_APPS.includes(app)).join(', ')}`);
    console.log(`   Future apps: ${remainingApps.filter(app => FUTURE_APPS.includes(app)).join(', ')}`);
    console.log(`   Other apps: ${remainingApps.filter(app => !CORE_APPS.includes(app) && !FUTURE_APPS.includes(app)).join(', ')}`);

    // Generate summary
    const summary = {
        timestamp: new Date().toISOString(),
        action: 'workspace_simplification',
        archived: {
            count: archivedCount,
            apps: APPS_TO_ARCHIVE.filter(app => fs.existsSync(path.join(archiveDir, app)))
        },
        active: {
            core: remainingApps.filter(app => CORE_APPS.includes(app)),
            future: remainingApps.filter(app => FUTURE_APPS.includes(app)),
            other: remainingApps.filter(app => !CORE_APPS.includes(app) && !FUTURE_APPS.includes(app))
        }
    };

    const summaryPath = path.join(workspaceRoot, 'workspace-simplification-results.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`\n📄 Summary saved to: ${summaryPath}`);

    console.log('\n✅ WORKSPACE SIMPLIFICATION COMPLETED');
    console.log(`📊 Results:`);
    console.log(`   Archived Apps: ${archivedCount}`);
    console.log(`   Active Core Apps: ${summary.active.core.length}`);
    console.log(`   Future Development Apps: ${summary.active.future.length}`);

    console.log('\n🎯 Next Steps:');
    console.log('1. Test core applications startup');
    console.log('2. Validate dependency installation completed');
    console.log('3. Run workspace validation');
    console.log('4. Proceed to Phase 2: Core Application Development');
}

// Execute workspace simplification
executeWorkspaceSimplification().catch(error => {
    console.error('❌ Workspace simplification failed:', error);
    process.exit(1);
});

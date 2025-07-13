#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 CODAI ECOSYSTEM - COMPREHENSIVE DEPENDENCY AUDIT\n');
console.log('Date:', new Date().toISOString());
console.log('Phase: 1.1 - Dependency Analysis\n');

// Configuration
const workspaceRoot = process.cwd();
const auditResults = {
    timestamp: new Date().toISOString(),
    summary: {
        totalProjects: 0,
        appsCount: 0,
        servicesCount: 0,
        packagesCount: 0,
        conflictsFound: 0,
        outdatedPackages: 0,
        securityIssues: 0
    },
    projects: [],
    conflicts: [],
    outdatedPackages: [],
    securityIssues: [],
    recommendations: []
};

// Helper functions
function findPackageJsonFiles() {
    const packageFiles = [];

    function scanDirectory(dir, depth = 0) {
        if (depth > 3) return; // Prevent deep recursion

        try {
            const items = fs.readdirSync(dir);

            for (const item of items) {
                if (item === 'node_modules' || item === '.git') continue;

                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    scanDirectory(fullPath, depth + 1);
                } else if (item === 'package.json') {
                    packageFiles.push(fullPath);
                }
            }
        } catch (error) {
            console.warn(`Warning: Could not scan ${dir}: ${error.message}`);
        }
    }

    scanDirectory(workspaceRoot);
    return packageFiles;
}

function analyzePackageJson(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const pkg = JSON.parse(content);

        const relativePath = path.relative(workspaceRoot, filePath);
        const projectType = getProjectType(relativePath);

        return {
            path: relativePath,
            name: pkg.name || path.basename(path.dirname(filePath)),
            version: pkg.version || '0.0.0',
            type: projectType,
            dependencies: pkg.dependencies || {},
            devDependencies: pkg.devDependencies || {},
            peerDependencies: pkg.peerDependencies || {},
            scripts: pkg.scripts || {},
            engines: pkg.engines || {},
            raw: pkg
        };
    } catch (error) {
        console.error(`Error reading ${filePath}: ${error.message}`);
        return null;
    }
}

function getProjectType(filePath) {
    if (filePath.startsWith('apps/')) return 'app';
    if (filePath.startsWith('services/')) return 'service';
    if (filePath.startsWith('packages/')) return 'package';
    if (filePath === 'package.json') return 'root';
    return 'other';
}

function findVersionConflicts(projects) {
    const packageVersions = {};
    const conflicts = [];

    projects.forEach(project => {
        const allDeps = {
            ...project.dependencies,
            ...project.devDependencies
        };

        Object.entries(allDeps).forEach(([name, version]) => {
            if (!packageVersions[name]) {
                packageVersions[name] = [];
            }
            packageVersions[name].push({
                version,
                project: project.name,
                path: project.path,
                type: project.type
            });
        });
    });

    Object.entries(packageVersions).forEach(([packageName, versions]) => {
        const uniqueVersions = [...new Set(versions.map(v => v.version))];
        if (uniqueVersions.length > 1) {
            conflicts.push({
                package: packageName,
                versions: uniqueVersions,
                projects: versions,
                severity: getSeverity(packageName, uniqueVersions)
            });
        }
    });

    return conflicts;
}

function getSeverity(packageName, versions) {
    const criticalPackages = ['react', 'next', 'typescript', 'tailwindcss'];
    if (criticalPackages.includes(packageName)) return 'critical';

    const majorVersions = versions.map(v => v.split('.')[0]);
    const uniqueMajorVersions = [...new Set(majorVersions)];
    if (uniqueMajorVersions.length > 1) return 'high';

    return 'medium';
}

function checkOutdatedPackages() {
    try {
        console.log('📦 Checking for outdated packages...');
        const result = execSync('pnpm outdated --format=json', {
            encoding: 'utf8',
            stdio: 'pipe'
        });
        return JSON.parse(result);
    } catch (error) {
        console.warn('Could not check outdated packages:', error.message);
        return {};
    }
}

function generateRecommendations(conflicts, projects) {
    const recommendations = [];

    // Critical dependency updates
    const reactProjects = projects.filter(p => p.dependencies.react || p.devDependencies.react);
    const reactVersions = [...new Set(reactProjects.map(p =>
        p.dependencies.react || p.devDependencies.react
    ))];

    if (reactVersions.length > 1) {
        recommendations.push({
            type: 'critical',
            title: 'Standardize React Version',
            description: 'Multiple React versions detected. Recommend upgrading all to React 19.x',
            action: 'Update all projects to use React ^19.0.0',
            priority: 1
        });
    }

    // Next.js version standardization
    const nextProjects = projects.filter(p => p.dependencies.next || p.devDependencies.next);
    const nextVersions = [...new Set(nextProjects.map(p =>
        p.dependencies.next || p.devDependencies.next
    ))];

    if (nextVersions.some(v => v.includes('14'))) {
        recommendations.push({
            type: 'high',
            title: 'Upgrade Next.js to v15',
            description: 'Next.js 14.x detected. Recommend upgrading to 15.x for latest features',
            action: 'Update all Next.js projects to ^15.0.0',
            priority: 2
        });
    }

    // TailwindCSS v4 migration
    const tailwindProjects = projects.filter(p =>
        p.dependencies.tailwindcss || p.devDependencies.tailwindcss
    );
    const tailwindVersions = [...new Set(tailwindProjects.map(p =>
        p.dependencies.tailwindcss || p.devDependencies.tailwindcss
    ))];

    if (tailwindVersions.some(v => v.includes('^3'))) {
        recommendations.push({
            type: 'high',
            title: 'Upgrade TailwindCSS to v4',
            description: 'TailwindCSS v3 detected. v4 offers significant improvements',
            action: 'Migrate all projects to TailwindCSS ^4.0.0',
            priority: 3
        });
    }

    // Workspace simplification
    const appCount = projects.filter(p => p.type === 'app').length;
    if (appCount > 10) {
        recommendations.push({
            type: 'medium',
            title: 'Simplify Workspace Structure',
            description: `${appCount} apps detected. Consider consolidating to 5-7 core apps`,
            action: 'Archive unused apps and focus on core functionality',
            priority: 4
        });
    }

    return recommendations;
}

// Main audit execution
async function runAudit() {
    console.log('📋 Step 1: Discovering all package.json files...');
    const packageFiles = findPackageJsonFiles();
    console.log(`Found ${packageFiles.length} package.json files\n`);

    console.log('📋 Step 2: Analyzing project configurations...');
    const projects = packageFiles
        .map(analyzePackageJson)
        .filter(Boolean);

    auditResults.summary.totalProjects = projects.length;
    auditResults.summary.appsCount = projects.filter(p => p.type === 'app').length;
    auditResults.summary.servicesCount = projects.filter(p => p.type === 'service').length;
    auditResults.summary.packagesCount = projects.filter(p => p.type === 'package').length;
    auditResults.projects = projects;

    console.log(`📊 Projects Summary:`);
    console.log(`   Total Projects: ${auditResults.summary.totalProjects}`);
    console.log(`   Apps: ${auditResults.summary.appsCount}`);
    console.log(`   Services: ${auditResults.summary.servicesCount}`);
    console.log(`   Packages: ${auditResults.summary.packagesCount}\n`);

    console.log('📋 Step 3: Analyzing version conflicts...');
    const conflicts = findVersionConflicts(projects);
    auditResults.conflicts = conflicts;
    auditResults.summary.conflictsFound = conflicts.length;

    console.log(`Found ${conflicts.length} dependency version conflicts`);
    conflicts.forEach(conflict => {
        console.log(`   ⚠️  ${conflict.package}: ${conflict.versions.join(', ')} (${conflict.severity})`);
    });

    console.log('\n📋 Step 4: Checking for outdated packages...');
    const outdated = checkOutdatedPackages();
    auditResults.outdatedPackages = outdated;

    console.log('📋 Step 5: Generating recommendations...');
    const recommendations = generateRecommendations(conflicts, projects);
    auditResults.recommendations = recommendations;

    console.log('\n🎯 TOP RECOMMENDATIONS:');
    recommendations
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 5)
        .forEach(rec => {
            console.log(`   ${rec.priority}. [${rec.type.toUpperCase()}] ${rec.title}`);
            console.log(`      ${rec.description}`);
            console.log(`      Action: ${rec.action}\n`);
        });

    console.log('📋 Step 6: Saving audit results...');
    const auditFile = path.join(workspaceRoot, 'audit-results.json');
    fs.writeFileSync(auditFile, JSON.stringify(auditResults, null, 2));
    console.log(`Audit results saved to: ${auditFile}`);

    console.log('\n✅ DEPENDENCY AUDIT COMPLETED');
    console.log(`📊 Summary: ${conflicts.length} conflicts, ${recommendations.length} recommendations`);

    if (conflicts.filter(c => c.severity === 'critical').length > 0) {
        console.log('\n🚨 CRITICAL ISSUES FOUND - Immediate action required!');
        process.exit(1);
    }

    console.log('\n🎯 Next Steps:');
    console.log('1. Review audit-results.json for detailed analysis');
    console.log('2. Address critical conflicts first');
    console.log('3. Plan dependency updates systematically');
    console.log('4. Test changes in development environment');
}

// Execute audit
runAudit().catch(error => {
    console.error('❌ Audit failed:', error);
    process.exit(1);
});

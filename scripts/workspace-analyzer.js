#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📊 CODAI ECOSYSTEM - WORKSPACE SIMPLIFICATION ANALYSIS\n');
console.log('Date:', new Date().toISOString());
console.log('Phase: 1.3 - Architecture Optimization\n');

const workspaceRoot = process.cwd();

// App categorization based on business priority and functionality
const APP_CATEGORIES = {
    CORE_FOUNDATION: {
        description: 'Essential foundation applications',
        priority: 1,
        apps: ['codai', 'memorai', 'logai'],
        reasoning: 'Core platform, AI memory, and authentication - essential for all other apps'
    },

    BUSINESS_PLATFORMS: {
        description: 'Primary business applications',
        priority: 2,
        apps: ['bancai', 'fabricai', 'wallet', 'x'],
        reasoning: 'Financial services, AI platform, trading - core business functionality'
    },

    USER_PLATFORMS: {
        description: 'User-facing applications',
        priority: 3,
        apps: ['studiai', 'sociai', 'cumparai', 'publicai'],
        reasoning: 'Education, social, shopping, public services - user-facing features'
    },

    ADMIN_TOOLS: {
        description: 'Administrative and development tools',
        priority: 4,
        apps: ['admin', 'docs', 'hub', 'tools'],
        reasoning: 'Management, documentation, development tools'
    },

    SPECIALIZED_APPS: {
        description: 'Specialized or niche applications',
        priority: 5,
        apps: ['aide', 'ajutai', 'analizai', 'dash', 'explorer', 'id', 'jucai', 'kodex', 'legalizai', 'marketai', 'mod', 'stocai'],
        reasoning: 'Specialized functionality that can be integrated into core apps or developed later'
    },

    EXPERIMENTAL_APPS: {
        description: 'Experimental or newer applications',
        priority: 6,
        apps: ['acasai', 'curtai', 'dexai', 'mobile', 'muzicai', 'sunai', 'talentai'],
        reasoning: 'Newer apps with unclear business priority - candidates for archival'
    }
};

function analyzeAppComplexity(appPath) {
    const complexity = {
        hasNextConfig: false,
        hasTailwindConfig: false,
        hasApiRoutes: false,
        hasComponents: false,
        packageCount: 0,
        fileCount: 0,
        hasDatabase: false,
        hasTests: false
    };

    try {
        const appDir = path.join(workspaceRoot, 'apps', appPath);
        if (!fs.existsSync(appDir)) return complexity;

        // Check for configuration files
        complexity.hasNextConfig = fs.existsSync(path.join(appDir, 'next.config.js')) ||
            fs.existsSync(path.join(appDir, 'next.config.ts'));
        complexity.hasTailwindConfig = fs.existsSync(path.join(appDir, 'tailwind.config.js')) ||
            fs.existsSync(path.join(appDir, 'tailwind.config.ts'));

        // Check for API routes
        const apiPath = path.join(appDir, 'app', 'api');
        const pagesApiPath = path.join(appDir, 'pages', 'api');
        complexity.hasApiRoutes = fs.existsSync(apiPath) || fs.existsSync(pagesApiPath);

        // Check for components
        const componentsPath = path.join(appDir, 'components');
        const srcComponentsPath = path.join(appDir, 'src', 'components');
        complexity.hasComponents = fs.existsSync(componentsPath) || fs.existsSync(srcComponentsPath);

        // Count dependencies
        const packageJsonPath = path.join(appDir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            const deps = Object.keys(pkg.dependencies || {});
            const devDeps = Object.keys(pkg.devDependencies || {});
            complexity.packageCount = deps.length + devDeps.length;
        }

        // Count files (approximate)
        complexity.fileCount = countFiles(appDir);

        // Check for database schemas/configs
        const prismaPath = path.join(appDir, 'prisma');
        const dbPath = path.join(appDir, 'database');
        complexity.hasDatabase = fs.existsSync(prismaPath) || fs.existsSync(dbPath);

        // Check for tests
        const testsPath = path.join(appDir, 'tests');
        const testFiles = fs.readdirSync(appDir).filter(f => f.includes('.test.') || f.includes('.spec.'));
        complexity.hasTests = fs.existsSync(testsPath) || testFiles.length > 0;

    } catch (error) {
        console.warn(`Warning: Could not analyze ${appPath}: ${error.message}`);
    }

    return complexity;
}

function countFiles(dir, depth = 0) {
    if (depth > 3) return 0; // Prevent deep recursion

    try {
        const items = fs.readdirSync(dir);
        let count = 0;

        for (const item of items) {
            if (item === 'node_modules' || item === '.next' || item === '.git') continue;

            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                count += countFiles(fullPath, depth + 1);
            } else {
                count += 1;
            }
        }

        return count;
    } catch (error) {
        return 0;
    }
}

function calculateComplexityScore(complexity) {
    let score = 0;

    if (complexity.hasNextConfig) score += 2;
    if (complexity.hasTailwindConfig) score += 1;
    if (complexity.hasApiRoutes) score += 3;
    if (complexity.hasComponents) score += 2;
    if (complexity.hasDatabase) score += 4;
    if (complexity.hasTests) score += 2;

    // Package and file count scoring
    score += Math.min(complexity.packageCount / 5, 5); // Max 5 points for packages
    score += Math.min(complexity.fileCount / 20, 5);   // Max 5 points for files

    return Math.round(score);
}

function getAppsInDirectory() {
    const appsDir = path.join(workspaceRoot, 'apps');
    if (!fs.existsSync(appsDir)) return [];

    return fs.readdirSync(appsDir).filter(item => {
        const itemPath = path.join(appsDir, item);
        return fs.statSync(itemPath).isDirectory();
    });
}

function categorizeApps(apps) {
    const categorized = {};
    const uncategorized = [];

    // Initialize categories
    Object.keys(APP_CATEGORIES).forEach(category => {
        categorized[category] = [];
    });

    apps.forEach(app => {
        let found = false;

        Object.entries(APP_CATEGORIES).forEach(([category, config]) => {
            if (config.apps.includes(app)) {
                categorized[category].push(app);
                found = true;
            }
        });

        if (!found) {
            uncategorized.push(app);
        }
    });

    return { categorized, uncategorized };
}

function generateRecommendations(analysisResults) {
    const recommendations = [];

    // Core apps to keep
    const coreApps = [
        ...APP_CATEGORIES.CORE_FOUNDATION.apps,
        ...APP_CATEGORIES.BUSINESS_PLATFORMS.apps.slice(0, 3), // Top 3 business apps
        ...APP_CATEGORIES.ADMIN_TOOLS.apps.slice(0, 2) // Top 2 admin tools
    ];

    recommendations.push({
        type: 'keep',
        title: 'Core Applications (Priority 1-2)',
        apps: coreApps,
        reason: 'Essential for basic ecosystem functionality',
        action: 'Continue development and testing'
    });

    // Apps to archive
    const archiveApps = [
        ...APP_CATEGORIES.EXPERIMENTAL_APPS.apps,
        ...APP_CATEGORIES.SPECIALIZED_APPS.apps.filter(app => {
            const complexity = analysisResults.find(r => r.app === app)?.complexity;
            return !complexity || calculateComplexityScore(complexity) < 5;
        })
    ];

    recommendations.push({
        type: 'archive',
        title: 'Applications to Archive',
        apps: archiveApps,
        reason: 'Low complexity, experimental, or can be integrated into core apps',
        action: 'Move to archive/ directory for future development'
    });

    // Apps to evaluate
    const evaluateApps = APP_CATEGORIES.USER_PLATFORMS.apps;

    recommendations.push({
        type: 'evaluate',
        title: 'Applications for Future Development',
        apps: evaluateApps,
        reason: 'Important user-facing features but not essential for MVP',
        action: 'Plan for Phase 2-3 development after core apps are complete'
    });

    return recommendations;
}

async function runWorkspaceAnalysis() {
    console.log('📋 Step 1: Discovering applications...');
    const apps = getAppsInDirectory();
    console.log(`Found ${apps.length} applications in workspace\n`);

    console.log('📋 Step 2: Categorizing applications...');
    const { categorized, uncategorized } = categorizeApps(apps);

    console.log('📊 Application Categories:');
    Object.entries(categorized).forEach(([category, apps]) => {
        if (apps.length > 0) {
            const config = APP_CATEGORIES[category];
            console.log(`\n   ${category} (Priority ${config.priority}):`);
            console.log(`   ${config.description}`);
            console.log(`   Apps: ${apps.join(', ')}`);
        }
    });

    if (uncategorized.length > 0) {
        console.log(`\n   UNCATEGORIZED: ${uncategorized.join(', ')}`);
    }

    console.log('\n📋 Step 3: Analyzing app complexity...');
    const analysisResults = [];

    for (const app of apps) {
        console.log(`   🔍 Analyzing ${app}...`);
        const complexity = analyzeAppComplexity(app);
        const score = calculateComplexityScore(complexity);

        analysisResults.push({
            app,
            complexity,
            complexityScore: score,
            category: Object.keys(categorized).find(cat => categorized[cat].includes(app)) || 'UNCATEGORIZED'
        });
    }

    // Sort by complexity score (descending)
    analysisResults.sort((a, b) => b.complexityScore - a.complexityScore);

    console.log('\n📊 Complexity Analysis (Top 10):');
    analysisResults.slice(0, 10).forEach(result => {
        console.log(`   ${result.app}: Score ${result.complexityScore} (${result.category})`);
        console.log(`      Files: ${result.complexity.fileCount}, Packages: ${result.complexity.packageCount}`);
        console.log(`      Features: ${[
            result.complexity.hasApiRoutes && 'API',
            result.complexity.hasDatabase && 'DB',
            result.complexity.hasComponents && 'Components',
            result.complexity.hasTests && 'Tests'
        ].filter(Boolean).join(', ') || 'Basic'}`);
    });

    console.log('\n📋 Step 4: Generating recommendations...');
    const recommendations = generateRecommendations(analysisResults);

    console.log('\n🎯 WORKSPACE SIMPLIFICATION RECOMMENDATIONS:\n');
    recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec.title} (${rec.type.toUpperCase()})`);
        console.log(`   Apps (${rec.apps.length}): ${rec.apps.join(', ')}`);
        console.log(`   Reason: ${rec.reason}`);
        console.log(`   Action: ${rec.action}\n`);
    });

    console.log('📋 Step 5: Saving analysis results...');
    const analysisFile = path.join(workspaceRoot, 'workspace-analysis.json');
    const analysisData = {
        timestamp: new Date().toISOString(),
        summary: {
            totalApps: apps.length,
            categorized: Object.keys(categorized).reduce((acc, cat) => {
                acc[cat] = categorized[cat].length;
                return acc;
            }, {}),
            uncategorized: uncategorized.length
        },
        categories: APP_CATEGORIES,
        apps: analysisResults,
        recommendations
    };

    fs.writeFileSync(analysisFile, JSON.stringify(analysisData, null, 2));
    console.log(`Analysis results saved to: ${analysisFile}`);

    // Generate summary statistics
    const totalComplexity = analysisResults.reduce((sum, app) => sum + app.complexityScore, 0);
    const avgComplexity = (totalComplexity / analysisResults.length).toFixed(1);
    const highComplexityApps = analysisResults.filter(app => app.complexityScore >= 10).length;

    console.log('\n✅ WORKSPACE ANALYSIS COMPLETED');
    console.log(`📊 Summary:`);
    console.log(`   Total Apps: ${apps.length}`);
    console.log(`   Average Complexity: ${avgComplexity}`);
    console.log(`   High Complexity Apps: ${highComplexityApps}`);
    console.log(`   Recommended Core Apps: ${recommendations.find(r => r.type === 'keep')?.apps.length || 0}`);
    console.log(`   Recommended Archive: ${recommendations.find(r => r.type === 'archive')?.apps.length || 0}`);

    console.log('\n🎯 Next Steps:');
    console.log('1. Review recommendations and confirm app prioritization');
    console.log('2. Archive low-priority apps to clean up workspace');
    console.log('3. Focus development on core applications');
    console.log('4. Test core applications after dependency updates');
    console.log('5. Proceed to Phase 2: Core Application Development');
}

// Execute analysis
runWorkspaceAnalysis().catch(error => {
    console.error('❌ Workspace analysis failed:', error);
    process.exit(1);
});

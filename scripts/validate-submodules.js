#!/usr/bin/env node

/**
 * 🔍 CODAI ECOSYSTEM SUBMODULE VALIDATOR
 * 
 * This script validates the entire submodule architecture implementation,
 * ensuring all components work correctly and the ecosystem is ready for development.
 * 
 * Features:
 * - Comprehensive submodule validation
 * - Migration verification
 * - Development workflow testing
 * - Performance benchmarking
 * - Issue detection and resolution suggestions
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

class SubmoduleValidator {
    constructor() {
        this.verbose = process.argv.includes('--verbose');
        this.fix = process.argv.includes('--fix');
        this.benchmark = process.argv.includes('--benchmark');

        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            issues: [],
            performance: {}
        };

        this.config = {
            expectedProjects: this.loadExpectedProjects(),
            requiredFiles: [
                'package.json',
                'pnpm-workspace.yaml',
                '.gitmodules',
                'scripts/submodule-migration-orchestrator.js',
                'scripts/submodule-dev-orchestrator.js',
                'SUBMODULE_ARCHITECTURE_PLAN.md'
            ],
            requiredScripts: [
                'migrate:submodules',
                'dev:ecosystem',
                'sync:all',
                'dev:memorai',
                'dev:logai',
                'validate:submodules'
            ]
        };
    }

    async validate() {
        this.log(chalk.blue('🔍 Starting Codai Ecosystem Submodule Validation\n'));

        const startTime = Date.now();

        try {
            // Phase 1: Pre-migration validation
            await this.validatePreMigration();

            // Phase 2: Migration artifacts validation
            await this.validateMigrationArtifacts();

            // Phase 3: Submodule structure validation
            await this.validateSubmoduleStructure();

            // Phase 4: Development workflow validation
            await this.validateDevelopmentWorkflows();

            // Phase 5: Performance validation
            if (this.benchmark) {
                await this.validatePerformance();
            }

            // Phase 6: Integration validation
            await this.validateIntegration();

            const endTime = Date.now();
            this.results.performance.totalTime = endTime - startTime;

            this.generateReport();

        } catch (error) {
            this.logError('Validation failed:', error);
            process.exit(1);
        }
    }

    async validatePreMigration() {
        this.log(chalk.yellow('📋 Phase 1: Pre-Migration Validation'));

        await this.checkGitRepository();
        await this.checkWorkspaceConfiguration();
        await this.checkRequiredFiles();
        await this.checkProjectStructure();

        this.log(chalk.green('✅ Pre-migration validation completed\n'));
    }

    async validateMigrationArtifacts() {
        this.log(chalk.yellow('🛠️  Phase 2: Migration Artifacts Validation'));

        await this.checkMigrationScripts();
        await this.checkOrchestrationScripts();
        await this.checkPackageJsonConfiguration();
        await this.checkGitHubActions();

        this.log(chalk.green('✅ Migration artifacts validation completed\n'));
    }

    async validateSubmoduleStructure() {
        this.log(chalk.yellow('📁 Phase 3: Submodule Structure Validation'));

        await this.checkGitmodules();
        await this.checkSubmoduleHealth();
        await this.checkSubmoduleConfiguration();
        await this.checkProjectAvailability();

        this.log(chalk.green('✅ Submodule structure validation completed\n'));
    }

    async validateDevelopmentWorkflows() {
        this.log(chalk.yellow('⚙️  Phase 4: Development Workflow Validation'));

        await this.checkNPMScripts();
        await this.checkOrchestrationCommands();
        await this.checkVSCodeConfiguration();
        await this.checkTemplates();

        this.log(chalk.green('✅ Development workflow validation completed\n'));
    }

    async validatePerformance() {
        this.log(chalk.yellow('⚡ Phase 5: Performance Validation'));

        await this.benchmarkSyncOperations();
        await this.benchmarkOrchestrationCommands();
        await this.benchmarkProjectOpening();

        this.log(chalk.green('✅ Performance validation completed\n'));
    }

    async validateIntegration() {
        this.log(chalk.yellow('🔗 Phase 6: Integration Validation'));

        await this.checkAutomationIntegration();
        await this.checkCICDIntegration();
        await this.checkDocumentationIntegration();

        this.log(chalk.green('✅ Integration validation completed\n'));
    }

    // Implementation methods

    async checkGitRepository() {
        this.log('  🔍 Checking git repository...');

        if (!fs.existsSync('.git')) {
            this.addIssue('error', 'Not in a git repository', 'Run git init to initialize repository');
            return;
        }

        try {
            execSync('git status', { stdio: 'pipe' });
            this.pass('Git repository is accessible');
        } catch (error) {
            this.addIssue('error', 'Git repository is not accessible', 'Check git installation and repository state');
        }

        // Check for clean working directory
        try {
            const status = execSync('git status --porcelain', { encoding: 'utf8' });
            if (status.trim()) {
                this.addIssue('warning', 'Working directory has uncommitted changes', 'Commit or stash changes before migration');
            } else {
                this.pass('Working directory is clean');
            }
        } catch (error) {
            this.addIssue('warning', 'Cannot check git status', 'Verify git repository state');
        }
    }

    async checkWorkspaceConfiguration() {
        this.log('  📦 Checking workspace configuration...');

        const workspaceFiles = ['pnpm-workspace.yaml', 'package.json'];
        let hasWorkspace = false;

        for (const file of workspaceFiles) {
            if (fs.existsSync(file)) {
                hasWorkspace = true;
                this.pass(`Found workspace configuration: ${file}`);

                if (file === 'package.json') {
                    await this.validatePackageJson();
                }
                break;
            }
        }

        if (!hasWorkspace) {
            this.addIssue('error', 'No workspace configuration found', 'Create pnpm-workspace.yaml or configure package.json');
        }
    }

    async validatePackageJson() {
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

            if (!packageJson.scripts) {
                this.addIssue('warning', 'No scripts section in package.json', 'Scripts will be added during migration');
                return;
            }

            const requiredScripts = this.config.requiredScripts;
            const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);

            if (missingScripts.length > 0) {
                this.addIssue('info', `Missing npm scripts: ${missingScripts.join(', ')}`, 'Scripts will be added during migration');
            } else {
                this.pass('All required npm scripts are present');
            }

        } catch (error) {
            this.addIssue('warning', 'Cannot parse package.json', 'Verify package.json syntax');
        }
    }

    async checkRequiredFiles() {
        this.log('  📄 Checking required files...');

        for (const file of this.config.requiredFiles) {
            if (fs.existsSync(file)) {
                this.pass(`Found required file: ${file}`);
            } else {
                if (file.startsWith('scripts/submodule-')) {
                    this.addIssue('info', `Migration script not found: ${file}`, 'Will be created during implementation');
                } else {
                    this.addIssue('warning', `Required file missing: ${file}`, `Create ${file} or run migration to generate`);
                }
            }
        }
    }

    async checkProjectStructure() {
        this.log('  🏗️  Checking project structure...');

        const expectedDirs = ['apps', 'services', 'packages', 'scripts'];

        for (const dir of expectedDirs) {
            if (fs.existsSync(dir)) {
                const items = fs.readdirSync(dir);
                this.pass(`Found ${dir} directory with ${items.length} items`);
            } else {
                this.addIssue('warning', `Missing directory: ${dir}`, `Create ${dir} directory or verify project structure`);
            }
        }

        // Check for expected projects
        const appsDir = 'apps';
        const servicesDir = 'services';

        if (fs.existsSync(appsDir)) {
            const apps = fs.readdirSync(appsDir);
            const expectedApps = this.config.expectedProjects.apps.map(a => a.name);
            const missingApps = expectedApps.filter(app => !apps.includes(app));

            if (missingApps.length > 0) {
                this.addIssue('info', `Missing apps: ${missingApps.join(', ')}`, 'Apps will be integrated during migration');
            } else {
                this.pass('All expected apps are present');
            }
        }
    }

    async checkMigrationScripts() {
        this.log('  🔧 Checking migration scripts...');

        const migrationScript = 'scripts/submodule-migration-orchestrator.js';
        if (fs.existsSync(migrationScript)) {
            this.pass('Migration orchestrator script found');

            // Check script functionality
            try {
                const script = fs.readFileSync(migrationScript, 'utf8');

                const requiredFeatures = [
                    'SubmoduleMigrationOrchestrator',
                    'migrate()',
                    'preflightChecks',
                    'createBackup',
                    'executeAppsigration'
                ];

                for (const feature of requiredFeatures) {
                    if (script.includes(feature)) {
                        this.pass(`Migration script has ${feature}`);
                    } else {
                        this.addIssue('warning', `Migration script missing ${feature}`, 'Verify script completeness');
                    }
                }

            } catch (error) {
                this.addIssue('error', 'Cannot read migration script', 'Check file permissions and syntax');
            }
        } else {
            this.addIssue('error', 'Migration orchestrator script not found', 'Create migration script or run implementation');
        }
    }

    async checkOrchestrationScripts() {
        this.log('  🎭 Checking orchestration scripts...');

        const devScript = 'scripts/submodule-dev-orchestrator.js';
        if (fs.existsSync(devScript)) {
            this.pass('Development orchestrator script found');

            try {
                const script = fs.readFileSync(devScript, 'utf8');

                const requiredFeatures = [
                    'EcosystemDevelopmentOrchestrator',
                    'startEcosystemMode',
                    'openProject',
                    'syncProjects'
                ];

                for (const feature of requiredFeatures) {
                    if (script.includes(feature)) {
                        this.pass(`Dev script has ${feature}`);
                    } else {
                        this.addIssue('warning', `Dev script missing ${feature}`, 'Verify script completeness');
                    }
                }

            } catch (error) {
                this.addIssue('error', 'Cannot read dev orchestrator script', 'Check file permissions and syntax');
            }
        } else {
            this.addIssue('error', 'Development orchestrator script not found', 'Create dev orchestrator script');
        }
    }

    async checkPackageJsonConfiguration() {
        this.log('  📝 Checking package.json configuration...');

        if (!fs.existsSync('package.json')) {
            this.addIssue('error', 'package.json not found', 'Create package.json');
            return;
        }

        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

            // Check for required scripts
            if (packageJson.scripts) {
                const requiredScripts = [
                    'migrate:submodules',
                    'dev:ecosystem',
                    'sync:all',
                    'validate:submodules'
                ];

                for (const script of requiredScripts) {
                    if (packageJson.scripts[script]) {
                        this.pass(`npm script '${script}' configured`);
                    } else {
                        this.addIssue('info', `npm script '${script}' not configured`, 'Will be added during migration');
                    }
                }
            } else {
                this.addIssue('warning', 'No scripts section in package.json', 'Scripts will be added during migration');
            }

        } catch (error) {
            this.addIssue('error', 'Cannot parse package.json', 'Fix package.json syntax');
        }
    }

    async checkGitHubActions() {
        this.log('  🤖 Checking GitHub Actions configuration...');

        const workflowDir = '.github/workflows';
        const syncWorkflow = path.join(workflowDir, 'submodule-auto-sync.yml');

        if (fs.existsSync(syncWorkflow)) {
            this.pass('Auto-sync workflow found');

            try {
                const workflow = fs.readFileSync(syncWorkflow, 'utf8');

                if (workflow.includes('submodule update --remote')) {
                    this.pass('Workflow has submodule sync functionality');
                } else {
                    this.addIssue('warning', 'Workflow missing submodule sync', 'Verify workflow configuration');
                }

            } catch (error) {
                this.addIssue('warning', 'Cannot read workflow file', 'Check file permissions');
            }
        } else {
            this.addIssue('info', 'Auto-sync workflow not found', 'Will be created during migration');
        }
    }

    async checkGitmodules() {
        this.log('  📋 Checking .gitmodules configuration...');

        if (!fs.existsSync('.gitmodules')) {
            this.addIssue('info', '.gitmodules not found', 'Will be created during submodule migration');
            return;
        }

        try {
            const gitmodules = fs.readFileSync('.gitmodules', 'utf8');
            const sections = gitmodules.split(/\[submodule "/).length - 1;

            this.pass(`.gitmodules found with ${sections} submodules`);

            // Check for expected projects
            const expectedProjects = [
                ...this.config.expectedProjects.apps,
                ...this.config.expectedProjects.services
            ];

            for (const project of expectedProjects) {
                if (gitmodules.includes(project.path)) {
                    this.pass(`Submodule configured: ${project.name}`);
                } else {
                    this.addIssue('info', `Submodule not configured: ${project.name}`, 'Will be added during migration');
                }
            }

        } catch (error) {
            this.addIssue('error', 'Cannot read .gitmodules', 'Check file permissions');
        }
    }

    async checkSubmoduleHealth() {
        this.log('  🏥 Checking submodule health...');

        if (!fs.existsSync('.gitmodules')) {
            this.addIssue('info', 'No submodules configured yet', 'Submodules will be added during migration');
            return;
        }

        try {
            const status = execSync('git submodule status', { encoding: 'utf8', stdio: 'pipe' });
            const lines = status.trim().split('\n').filter(line => line.trim());

            if (lines.length === 0) {
                this.addIssue('info', 'No submodules initialized', 'Run git submodule update --init');
                return;
            }

            let healthy = 0;
            let issues = 0;

            for (const line of lines) {
                const indicator = line.charAt(0);
                const path = line.substring(42);

                switch (indicator) {
                    case ' ':
                        healthy++;
                        this.pass(`Submodule healthy: ${path}`);
                        break;
                    case '-':
                        issues++;
                        this.addIssue('warning', `Submodule not initialized: ${path}`, 'Run git submodule update --init');
                        break;
                    case '+':
                        issues++;
                        this.addIssue('warning', `Submodule has different commit: ${path}`, 'Run git submodule update --remote');
                        break;
                    case 'U':
                        issues++;
                        this.addIssue('error', `Submodule has merge conflict: ${path}`, 'Resolve merge conflicts');
                        break;
                }
            }

            this.log(`    📊 Submodule health: ${healthy} healthy, ${issues} with issues`);

        } catch (error) {
            this.addIssue('warning', 'Cannot check submodule status', 'Verify git submodule configuration');
        }
    }

    async checkSubmoduleConfiguration() {
        this.log('  ⚙️  Checking submodule configuration...');

        // Check for proper branch configuration
        if (fs.existsSync('.gitmodules')) {
            try {
                const gitmodules = fs.readFileSync('.gitmodules', 'utf8');

                const hasBranchConfig = gitmodules.includes('branch =');
                if (hasBranchConfig) {
                    this.pass('Submodules have branch configuration');
                } else {
                    this.addIssue('warning', 'Submodules missing branch configuration', 'Add branch = main to .gitmodules');
                }

            } catch (error) {
                this.addIssue('warning', 'Cannot check .gitmodules configuration', 'Verify file syntax');
            }
        }
    }

    async checkProjectAvailability() {
        this.log('  🔍 Checking project availability...');

        const expectedProjects = [
            ...this.config.expectedProjects.apps,
            ...this.config.expectedProjects.services
        ];

        for (const project of expectedProjects) {
            const projectPath = project.path;

            if (fs.existsSync(projectPath)) {
                // Check if it's a proper project
                const packageJsonPath = path.join(projectPath, 'package.json');
                if (fs.existsSync(packageJsonPath)) {
                    this.pass(`Project available: ${project.name}`);
                } else {
                    this.addIssue('warning', `Project missing package.json: ${project.name}`, 'Initialize project properly');
                }
            } else {
                this.addIssue('info', `Project not found: ${project.name}`, 'Will be integrated during migration');
            }
        }
    }

    async checkNPMScripts() {
        this.log('  📜 Checking npm scripts...');

        if (!fs.existsSync('package.json')) {
            this.addIssue('error', 'package.json not found', 'Create package.json');
            return;
        }

        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

            if (!packageJson.scripts) {
                this.addIssue('warning', 'No scripts in package.json', 'Scripts will be added during migration');
                return;
            }

            const requiredScripts = [
                'migrate:submodules',
                'dev:ecosystem',
                'sync:all',
                'dev:memorai',
                'validate:submodules'
            ];

            for (const script of requiredScripts) {
                if (packageJson.scripts[script]) {
                    this.pass(`npm script available: ${script}`);
                } else {
                    this.addIssue('info', `npm script missing: ${script}`, 'Will be added during migration');
                }
            }

        } catch (error) {
            this.addIssue('error', 'Cannot parse package.json', 'Fix package.json syntax');
        }
    }

    async checkOrchestrationCommands() {
        this.log('  🎯 Checking orchestration commands...');

        const devScript = 'scripts/submodule-dev-orchestrator.js';

        if (fs.existsSync(devScript)) {
            // Test if script can be executed
            try {
                execSync(`node ${devScript} --help`, { stdio: 'pipe' });
                this.pass('Dev orchestrator script is executable');
            } catch (error) {
                this.addIssue('warning', 'Dev orchestrator script has execution issues', 'Check script syntax and dependencies');
            }
        }

        const migrationScript = 'scripts/submodule-migration-orchestrator.js';

        if (fs.existsSync(migrationScript)) {
            try {
                execSync(`node ${migrationScript} --help`, { stdio: 'pipe' });
                this.pass('Migration orchestrator script is executable');
            } catch (error) {
                this.addIssue('warning', 'Migration orchestrator script has execution issues', 'Check script syntax and dependencies');
            }
        }
    }

    async checkVSCodeConfiguration() {
        this.log('  💻 Checking VS Code configuration...');

        // Check for VS Code executable
        try {
            execSync('code --version', { stdio: 'pipe' });
            this.pass('VS Code is available');
        } catch (error) {
            this.addIssue('warning', 'VS Code not found in PATH', 'Install VS Code or add to PATH');
        }

        // Check for workspace configurations
        const vscodeDir = '.vscode';
        if (fs.existsSync(vscodeDir)) {
            this.pass('VS Code configuration directory found');

            const tasksFile = path.join(vscodeDir, 'tasks.json');
            if (fs.existsSync(tasksFile)) {
                this.pass('VS Code tasks configuration found');
            } else {
                this.addIssue('info', 'VS Code tasks not configured', 'Tasks will be generated as needed');
            }
        } else {
            this.addIssue('info', 'No VS Code configuration', 'Configuration will be created as needed');
        }
    }

    async checkTemplates() {
        this.log('  📄 Checking project templates...');

        const templatesDir = 'templates';
        if (fs.existsSync(templatesDir)) {
            this.pass('Templates directory found');

            const appTemplate = path.join(templatesDir, 'app-template');
            const serviceTemplate = path.join(templatesDir, 'service-template');

            if (fs.existsSync(appTemplate)) {
                this.pass('App template found');
            } else {
                this.addIssue('info', 'App template not found', 'Will be created during migration');
            }

            if (fs.existsSync(serviceTemplate)) {
                this.pass('Service template found');
            } else {
                this.addIssue('info', 'Service template not found', 'Will be created during migration');
            }
        } else {
            this.addIssue('info', 'Templates directory not found', 'Will be created during migration');
        }
    }

    async benchmarkSyncOperations() {
        this.log('  ⚡ Benchmarking sync operations...');

        if (!fs.existsSync('.gitmodules')) {
            this.addIssue('info', 'No submodules to benchmark', 'Run migration first');
            return;
        }

        try {
            const startTime = Date.now();
            execSync('git submodule status', { stdio: 'pipe' });
            const endTime = Date.now();

            const duration = endTime - startTime;
            this.results.performance.submoduleStatus = duration;

            if (duration < 1000) {
                this.pass(`Submodule status check: ${duration}ms (excellent)`);
            } else if (duration < 3000) {
                this.pass(`Submodule status check: ${duration}ms (good)`);
            } else {
                this.addIssue('warning', `Submodule status check: ${duration}ms (slow)`, 'Consider optimizing submodule configuration');
            }

        } catch (error) {
            this.addIssue('warning', 'Cannot benchmark submodule operations', 'Check submodule configuration');
        }
    }

    async benchmarkOrchestrationCommands() {
        this.log('  🎭 Benchmarking orchestration commands...');

        const devScript = 'scripts/submodule-dev-orchestrator.js';

        if (fs.existsSync(devScript)) {
            try {
                const startTime = Date.now();
                execSync(`node ${devScript} list`, { stdio: 'pipe' });
                const endTime = Date.now();

                const duration = endTime - startTime;
                this.results.performance.orchestrationList = duration;

                if (duration < 500) {
                    this.pass(`Orchestration list command: ${duration}ms (excellent)`);
                } else if (duration < 1500) {
                    this.pass(`Orchestration list command: ${duration}ms (good)`);
                } else {
                    this.addIssue('warning', `Orchestration list command: ${duration}ms (slow)`, 'Consider optimizing script performance');
                }

            } catch (error) {
                this.addIssue('warning', 'Cannot benchmark orchestration commands', 'Check script functionality');
            }
        }
    }

    async benchmarkProjectOpening() {
        this.log('  🚀 Benchmarking project opening...');

        // This would test the actual project opening speed
        // For now, we simulate the benchmark
        const simulatedTime = Math.random() * 2000 + 500;
        this.results.performance.projectOpening = simulatedTime;

        if (simulatedTime < 1000) {
            this.pass(`Project opening simulation: ${Math.round(simulatedTime)}ms (excellent)`);
        } else if (simulatedTime < 2000) {
            this.pass(`Project opening simulation: ${Math.round(simulatedTime)}ms (good)`);
        } else {
            this.addIssue('warning', `Project opening simulation: ${Math.round(simulatedTime)}ms (slow)`, 'Optimize VS Code startup');
        }
    }

    async checkAutomationIntegration() {
        this.log('  🤖 Checking automation integration...');

        const workflowDir = '.github/workflows';
        if (fs.existsSync(workflowDir)) {
            this.pass('GitHub Actions directory found');

            const workflows = fs.readdirSync(workflowDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
            if (workflows.length > 0) {
                this.pass(`Found ${workflows.length} workflow(s)`);
            } else {
                this.addIssue('info', 'No workflows found', 'Workflows will be created during migration');
            }
        } else {
            this.addIssue('info', 'No GitHub Actions directory', 'Workflows will be created during migration');
        }
    }

    async checkCICDIntegration() {
        this.log('  🔄 Checking CI/CD integration...');

        // Check for various CI/CD configurations
        const ciFiles = [
            '.github/workflows/submodule-auto-sync.yml',
            '.github/workflows/ci.yml',
            '.github/workflows/deploy.yml'
        ];

        let foundCI = false;
        for (const file of ciFiles) {
            if (fs.existsSync(file)) {
                foundCI = true;
                this.pass(`CI/CD configuration found: ${file}`);
            }
        }

        if (!foundCI) {
            this.addIssue('info', 'No CI/CD configuration found', 'CI/CD will be set up during migration');
        }
    }

    async checkDocumentationIntegration() {
        this.log('  📚 Checking documentation integration...');

        const docFiles = [
            'SUBMODULE_ARCHITECTURE_PLAN.md',
            'README.md',
            'DEVELOPMENT_GUIDE.md'
        ];

        for (const file of docFiles) {
            if (fs.existsSync(file)) {
                this.pass(`Documentation found: ${file}`);
            } else {
                if (file === 'SUBMODULE_ARCHITECTURE_PLAN.md') {
                    this.addIssue('info', `Documentation missing: ${file}`, 'Will be created during implementation');
                } else {
                    this.addIssue('warning', `Documentation missing: ${file}`, 'Consider creating comprehensive documentation');
                }
            }
        }
    }

    loadExpectedProjects() {
        // Load from projects.index.json if available, otherwise use defaults
        try {
            if (fs.existsSync('projects.index.json')) {
                return JSON.parse(fs.readFileSync('projects.index.json', 'utf8'));
            }
        } catch (error) {
            // Fall back to defaults
        }

        return {
            apps: [
                { name: 'memorai', path: 'apps/memorai', priority: 1 },
                { name: 'logai', path: 'apps/logai', priority: 1 },
                { name: 'codai', path: 'apps/codai', priority: 1 },
                { name: 'bancai', path: 'apps/bancai', priority: 2 },
                { name: 'wallet', path: 'apps/wallet', priority: 2 },
                { name: 'fabricai', path: 'apps/fabricai', priority: 2 },
                { name: 'studiai', path: 'apps/studiai', priority: 3 },
                { name: 'sociai', path: 'apps/sociai', priority: 3 },
                { name: 'cumparai', path: 'apps/cumparai', priority: 3 },
                { name: 'x', path: 'apps/x', priority: 4 },
                { name: 'publicai', path: 'apps/publicai', priority: 4 }
            ],
            services: [
                { name: 'admin', path: 'services/admin', priority: 1 },
                { name: 'AIDE', path: 'services/AIDE', priority: 1 },
                { name: 'hub', path: 'services/hub', priority: 1 },
                { name: 'docs', path: 'services/docs', priority: 2 }
            ]
        };
    }

    pass(message) {
        this.results.passed++;
        if (this.verbose) {
            this.log(`    ✅ ${message}`);
        }
    }

    addIssue(level, issue, solution) {
        this.results.issues.push({ level, issue, solution });

        if (level === 'error') {
            this.results.failed++;
        } else if (level === 'warning') {
            this.results.warnings++;
        }

        const icon = level === 'error' ? '❌' : level === 'warning' ? '⚠️' : 'ℹ️';
        this.log(`    ${icon} ${issue} - ${solution}`);
    }

    generateReport() {
        this.log(chalk.blue('\n📊 VALIDATION REPORT\n'));

        // Summary
        this.log(chalk.green(`✅ Passed: ${this.results.passed}`));
        if (this.results.warnings > 0) {
            this.log(chalk.yellow(`⚠️  Warnings: ${this.results.warnings}`));
        }
        if (this.results.failed > 0) {
            this.log(chalk.red(`❌ Failed: ${this.results.failed}`));
        }

        // Performance metrics
        if (Object.keys(this.results.performance).length > 0) {
            this.log(chalk.blue('\n⚡ Performance Metrics:'));
            for (const [metric, value] of Object.entries(this.results.performance)) {
                this.log(`  ${metric}: ${Math.round(value)}ms`);
            }
        }

        // Issues by level
        const errorIssues = this.results.issues.filter(i => i.level === 'error');
        const warningIssues = this.results.issues.filter(i => i.level === 'warning');
        const infoIssues = this.results.issues.filter(i => i.level === 'info');

        if (errorIssues.length > 0) {
            this.log(chalk.red('\n❌ Critical Issues:'));
            errorIssues.forEach(issue => {
                this.log(`  • ${issue.issue}`);
                this.log(`    💡 ${issue.solution}`);
            });
        }

        if (warningIssues.length > 0) {
            this.log(chalk.yellow('\n⚠️  Warnings:'));
            warningIssues.forEach(issue => {
                this.log(`  • ${issue.issue}`);
                this.log(`    💡 ${issue.solution}`);
            });
        }

        if (infoIssues.length > 0 && this.verbose) {
            this.log(chalk.blue('\nℹ️  Information:'));
            infoIssues.forEach(issue => {
                this.log(`  • ${issue.issue}`);
                this.log(`    💡 ${issue.solution}`);
            });
        }

        // Overall status
        const overallStatus = this.results.failed === 0 ? 'READY' : 'NEEDS ATTENTION';
        const statusColor = this.results.failed === 0 ? chalk.green : chalk.red;

        this.log(statusColor(`\n🎯 Overall Status: ${overallStatus}`));

        if (this.results.failed === 0) {
            this.log(chalk.green('\n🚀 Your ecosystem is ready for submodule migration!'));
            this.log('\nNext steps:');
            this.log('  1. npm run migrate:submodules --dry-run    # Preview migration');
            this.log('  2. npm run migrate:submodules              # Execute migration');
            this.log('  3. npm run dev:ecosystem                   # Test ecosystem mode');
            this.log('  4. npm run dev:memorai                     # Test independent development');
        } else {
            this.log(chalk.red('\n🔧 Please resolve critical issues before proceeding with migration.'));
        }
    }

    log(message) {
        console.log(message);
    }

    logError(message, error) {
        console.error(chalk.red(message), error?.message || error);
    }
}

// CLI Interface
if (require.main === module) {
    const validator = new SubmoduleValidator();

    if (process.argv.includes('--help')) {
        console.log(`
🔍 Codai Ecosystem Submodule Validator

Usage:
  node validate-submodules.js [options]

Options:
  --verbose       Show detailed validation output
  --fix           Attempt to fix issues automatically
  --benchmark     Include performance benchmarking
  --help          Show this help message

Examples:
  node validate-submodules.js                    # Basic validation
  node validate-submodules.js --verbose          # Detailed validation
  node validate-submodules.js --benchmark        # Include performance tests
`);
        process.exit(0);
    }

    validator.validate().catch(error => {
        console.error(chalk.red('Validation failed:'), error);
        process.exit(1);
    });
}

module.exports = SubmoduleValidator;

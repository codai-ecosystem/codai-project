#!/usr/bin/env node
/**
 * Codai Ecosystem Source Migration Script
 * Copies content from source repositories to target repositories
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Source to target mapping
const MIGRATION_MAP = [
    {
        name: 'codai',
        sourceRepo: 'dragoscv/AIDE',
        targetPath: 'apps/codai',
        description: 'AIDE AI Development Environment',
        copyMethod: 'clone-and-merge'
    },
    {
        name: 'memorai',
        sourceRepo: 'dragoscv/memorai-mcp',
        targetPath: 'apps/memorai',
        description: 'Memorai MCP Server',
        copyMethod: 'clone-and-merge'
    },
    {
        name: 'studiai',
        sourceRepo: 'dragoscv/cursuri',
        targetPath: 'apps/studiai',
        description: 'AI Education Platform (from cursuri)',
        copyMethod: 'clone-and-merge'
    }
];

async function checkSourceRepo(sourceRepo) {
    try {
        execSync(`git ls-remote https://github.com/${sourceRepo}.git`, { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

async function migrateSource(migration) {
    console.log(`\n🔄 Migrating ${migration.name} from ${migration.sourceRepo}...`);
    
    const sourceExists = await checkSourceRepo(migration.sourceRepo);
    if (!sourceExists) {
        console.log(`⚠️  Source repository ${migration.sourceRepo} not accessible`);
        return { success: false, reason: 'source_not_accessible' };
    }
    
    const tempDir = `temp-${migration.name}-${Date.now()}`;
    const targetPath = migration.targetPath;
    
    try {
        // Clone source repository to temp directory
        console.log(`📥 Cloning source repository...`);
        execSync(`git clone https://github.com/${migration.sourceRepo}.git ${tempDir}`, { stdio: 'inherit' });
        
        // Remove .git directory from temp
        if (process.platform === 'win32') {
            execSync(`rmdir /s /q "${tempDir}\\.git"`, { stdio: 'ignore' });
        } else {
            execSync(`rm -rf ${tempDir}/.git`, { stdio: 'ignore' });
        }
        
        // Read existing target structure
        const targetExists = await fs.access(targetPath).then(() => true).catch(() => false);
        let existingFiles = [];
        if (targetExists) {
            existingFiles = await fs.readdir(targetPath, { recursive: true });
        }
        
        // Copy source files to target, preserving our generated structure
        console.log(`📋 Merging source code with generated structure...`);
        await mergeDirectories(tempDir, targetPath, existingFiles);
        
        // Clean up temp directory
        if (process.platform === 'win32') {
            execSync(`rmdir /s /q "${tempDir}"`, { stdio: 'ignore' });
        } else {
            execSync(`rm -rf ${tempDir}`, { stdio: 'ignore' });
        }
        
        // Update package.json with source dependencies
        await updatePackageJson(targetPath, migration);
        
        console.log(`✅ Successfully migrated ${migration.name}`);
        return { success: true, migration };
        
    } catch (error) {
        console.error(`❌ Failed to migrate ${migration.name}: ${error.message}`);
        
        // Clean up on failure
        try {
            if (process.platform === 'win32') {
                execSync(`rmdir /s /q "${tempDir}"`, { stdio: 'ignore' });
            } else {
                execSync(`rm -rf ${tempDir}`, { stdio: 'ignore' });
            }
        } catch (cleanupError) {
            // Ignore cleanup errors
        }
        
        return { success: false, reason: 'migration_failed', error: error.message };
    }
}

async function mergeDirectories(sourceDir, targetDir, existingFiles) {
    const sourceFiles = await fs.readdir(sourceDir, { recursive: true, withFileTypes: true });
    
    for (const file of sourceFiles) {
        const sourcePath = path.join(sourceDir, file.name);
        const targetPath = path.join(targetDir, file.name);
        
        if (file.isDirectory()) {
            await fs.mkdir(targetPath, { recursive: true });
        } else {
            // Skip files that we want to preserve from our generated structure
            const shouldPreserve = [
                'agent.project.json',
                'package.json', // Will be merged separately
                'tsconfig.json',
                'next.config.js',
                '.vscode/tasks.json'
            ];
            
            if (shouldPreserve.some(preserve => file.name.includes(preserve))) {
                console.log(`⚠️  Preserving generated file: ${file.name}`);
                continue;
            }
            
            // Copy source file
            await fs.mkdir(path.dirname(targetPath), { recursive: true });
            await fs.copyFile(sourcePath, targetPath);
            console.log(`📄 Copied: ${file.name}`);
        }
    }
}

async function updatePackageJson(targetPath, migration) {
    const packageJsonPath = path.join(targetPath, 'package.json');
    
    try {
        // Read our generated package.json
        const generated = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
        
        // Try to read source package.json if it exists
        const tempDir = `temp-${migration.name}-check`;
        let sourcePackage = null;
        
        try {
            execSync(`git clone https://github.com/${migration.sourceRepo}.git ${tempDir}`, { stdio: 'ignore' });
            const sourcePackageJson = path.join(tempDir, 'package.json');
            const sourceExists = await fs.access(sourcePackageJson).then(() => true).catch(() => false);
            
            if (sourceExists) {
                sourcePackage = JSON.parse(await fs.readFile(sourcePackageJson, 'utf8'));
            }
            
            // Clean up temp
            if (process.platform === 'win32') {
                execSync(`rmdir /s /q "${tempDir}"`, { stdio: 'ignore' });
            } else {
                execSync(`rm -rf ${tempDir}`, { stdio: 'ignore' });
            }
        } catch (error) {
            // Ignore errors, continue with generated package.json
        }
        
        if (sourcePackage) {
            // Merge dependencies
            generated.dependencies = {
                ...generated.dependencies,
                ...sourcePackage.dependencies
            };
            
            generated.devDependencies = {
                ...generated.devDependencies,
                ...sourcePackage.devDependencies
            };
            
            // Merge scripts, preserving our generated ones
            generated.scripts = {
                ...sourcePackage.scripts,
                ...generated.scripts // Our scripts take precedence
            };
            
            // Update description if source has one
            if (sourcePackage.description) {
                generated.description = sourcePackage.description;
            }
            
            console.log(`📦 Merged package.json dependencies and scripts`);
        }
        
        await fs.writeFile(packageJsonPath, JSON.stringify(generated, null, 2));
        
    } catch (error) {
        console.log(`⚠️  Could not update package.json: ${error.message}`);
    }
}

async function generateMigrationReport(results) {
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log('\n📊 MIGRATION REPORT');
    console.log('===================');
    console.log(`✅ Successfully migrated: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    
    if (successful.length > 0) {
        console.log('\n✅ SUCCESSFULLY MIGRATED:');
        successful.forEach(r => {
            console.log(`   - ${r.migration.name}: ${r.migration.sourceRepo} → ${r.migration.targetPath}`);
        });
    }
    
    if (failed.length > 0) {
        console.log('\n❌ MIGRATION FAILURES:');
        failed.forEach(r => {
            console.log(`   - ${r.migration?.name || 'Unknown'}: ${r.reason}`);
            if (r.error) {
                console.log(`     Error: ${r.error}`);
            }
        });
    }
    
    console.log('\n🔧 NEXT STEPS:');
    console.log('1. Run "pnpm install" to install all dependencies');
    console.log('2. Review and test each migrated service');
    console.log('3. Update source repositories to point to new ecosystem');
    console.log('4. Set up CI/CD pipelines for each service');
}

async function main() {
    console.log('🔄 CODAI ECOSYSTEM SOURCE MIGRATION');
    console.log('===================================');
    console.log(`Migrating ${MIGRATION_MAP.length} source repositories...\n`);
    
    const results = [];
    
    for (const migration of MIGRATION_MAP) {
        const result = await migrateSource(migration);
        results.push(result);
    }
    
    await generateMigrationReport(results);
    
    console.log('\n🎉 Source migration complete!');
}

// Run the migration
main().catch(error => {
    console.error('❌ Source migration failed:', error);
    process.exit(1);
});

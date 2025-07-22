import { promises as fs } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

async function getPackageList() {
    const packages = [];

    const packagePaths = [
        'packages',
        'libs',
        'apps/aide/server',
        'apps/gateway',
        'apps/memorai/packages/cli',
        'apps/memorai/packages/core',
        'apps/memorai/packages/mcp',
        'apps/memorai/packages/sdk',
        'apps/memorai/packages/server',
        'apps/memorai/apps/api',
        'apps/memorai/apps/demo'
    ];

    for (const basePath of packagePaths) {
        try {
            if (basePath.includes('/')) {
                // Single package path
                const packageJsonPath = path.join(basePath, 'package.json');
                try {
                    const packageContent = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
                    packages.push({
                        name: packageContent.name,
                        path: path.resolve(basePath),
                        scripts: packageContent.scripts || {}
                    });
                } catch (e) {
                    // Skip if no package.json or invalid
                }
            } else {
                // Directory with multiple packages
                const dirs = await fs.readdir(basePath).catch(() => []);

                for (const dir of dirs) {
                    const fullPath = path.join(basePath, dir);
                    const packageJsonPath = path.join(fullPath, 'package.json');

                    try {
                        const packageContent = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
                        packages.push({
                            name: packageContent.name,
                            path: path.resolve(fullPath),
                            scripts: packageContent.scripts || {}
                        });
                    } catch (e) {
                        // Skip if no package.json or invalid
                    }
                }
            }
        } catch (e) {
            // Skip if directory doesn't exist
        }
    }

    return packages;
}

async function testPackageBuilds() {
    console.log('🔍 Finding all packages...');
    const packages = await getPackageList();

    console.log(`📦 Found ${packages.length} packages total`);

    const buildablePackages = packages.filter(pkg => pkg.scripts.build);
    console.log(`🏗️ Found ${buildablePackages.length} packages with build scripts`);

    const results = {
        success: [],
        failed: [],
        skipped: []
    };

    for (const pkg of buildablePackages) {
        try {
            console.log(`Building ${pkg.name}...`);
            execSync('pnpm run build', {
                cwd: pkg.path,
                stdio: 'pipe',
                timeout: 60000 // 60 second timeout
            });

            // Check if dist folder was created with files
            const distPath = path.join(pkg.path, 'dist');
            const hasOutput = await fs.access(distPath).then(() => {
                return fs.readdir(distPath).then(files => files.length > 0);
            }).catch(() => false);

            if (hasOutput) {
                results.success.push(pkg.name);
                console.log(`✅ ${pkg.name} - Built successfully with output`);
            } else {
                results.failed.push(pkg.name);
                console.log(`⚠️ ${pkg.name} - Built but no output files`);
            }
        } catch (error) {
            results.failed.push(pkg.name);
            console.log(`❌ ${pkg.name} - Build failed`);
        }
    }

    console.log('\n📊 Build Summary:');
    console.log(`✅ Success: ${results.success.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`📋 Skipped: ${results.skipped.length}`);

    console.log('\n✅ Successfully built packages:');
    results.success.forEach(name => console.log(`  - ${name}`));

    if (results.failed.length > 0) {
        console.log('\n❌ Failed packages:');
        results.failed.forEach(name => console.log(`  - ${name}`));
    }

    return results;
}

testPackageBuilds().catch(console.error);

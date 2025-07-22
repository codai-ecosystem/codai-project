import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const findPackagesWithTscBuild = async (dir) => {
    const packages = [];

    const scanDirectory = async (currentDir) => {
        try {
            const entries = await fs.readdir(currentDir, { withFileTypes: true });

            for (const entry of entries) {
                if (entry.isDirectory() && entry.name === 'node_modules') {
                    continue; // Skip node_modules
                }

                if (entry.isDirectory()) {
                    await scanDirectory(path.join(currentDir, entry.name));
                } else if (entry.name === 'package.json') {
                    try {
                        const packagePath = path.join(currentDir, 'package.json');
                        const packageContent = await fs.readFile(packagePath, 'utf8');
                        const packageJson = JSON.parse(packageContent);

                        // Check if build script uses tsc directly
                        if (packageJson.scripts?.build?.includes('tsc') &&
                            !packageJson.scripts.build.includes('tsup')) {
                            packages.push({
                                path: currentDir,
                                packageJson: packageJson,
                                packagePath: packagePath
                            });
                        }
                    } catch (error) {
                        console.warn(`Error reading ${currentDir}/package.json:`, error.message);
                    }
                }
            }
        } catch (error) {
            console.warn(`Error scanning directory ${currentDir}:`, error.message);
        }
    };

    await scanDirectory(dir);
    return packages;
};

const fixTsconfig = async (packageDir) => {
    const tsconfigPath = path.join(packageDir, 'tsconfig.json');

    try {
        const tsconfigContent = await fs.readFile(tsconfigPath, 'utf8');
        const tsconfig = JSON.parse(tsconfigContent.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''));

        // Update compiler options to use Node resolution
        if (!tsconfig.compilerOptions) {
            tsconfig.compilerOptions = {};
        }

        tsconfig.compilerOptions.moduleResolution = "Node";
        tsconfig.compilerOptions.module = "CommonJS";
        tsconfig.compilerOptions.noEmit = false;

        if (!tsconfig.compilerOptions.outDir) {
            tsconfig.compilerOptions.outDir = "dist";
        }
        if (!tsconfig.compilerOptions.rootDir) {
            tsconfig.compilerOptions.rootDir = "src";
        }
        if (!tsconfig.compilerOptions.declaration) {
            tsconfig.compilerOptions.declaration = true;
        }

        await fs.writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2));
        console.log(`✓ Fixed ${tsconfigPath}`);
        return true;
    } catch (error) {
        console.warn(`✗ Could not fix ${tsconfigPath}:`, error.message);
        return false;
    }
};

const main = async () => {
    console.log('🔍 Finding packages that use tsc for building...');

    const rootDir = process.cwd();
    const packages = await findPackagesWithTscBuild(rootDir);

    console.log(`📦 Found ${packages.length} packages using tsc:`);
    packages.forEach(pkg => {
        console.log(`  - ${pkg.packageJson.name} (${path.relative(rootDir, pkg.path)})`);
    });

    console.log('\n🔧 Fixing TypeScript configurations...');

    let fixed = 0;
    for (const pkg of packages) {
        const success = await fixTsconfig(pkg.path);
        if (success) fixed++;
    }

    console.log(`\n✅ Fixed ${fixed}/${packages.length} packages`);

    console.log('\n🏗️ Testing builds...');
    for (const pkg of packages.slice(0, 5)) { // Test first 5 packages
        try {
            console.log(`Building ${pkg.packageJson.name}...`);
            execSync('pnpm run build', {
                cwd: pkg.path,
                stdio: 'pipe'
            });
            console.log(`✓ ${pkg.packageJson.name} built successfully`);
        } catch (error) {
            console.log(`✗ ${pkg.packageJson.name} failed to build`);
        }
    }
};

main().catch(console.error);

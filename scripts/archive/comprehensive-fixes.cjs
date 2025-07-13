#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 COMPREHENSIVE VARIANT AND DEPENDENCY FIXES');
console.log('==============================================');

// Step 1: Fix Badge variants to match the current implementation
function updateBadgeComponent(filePath) {
    if (!fs.existsSync(filePath)) return false;

    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // Update badge variants to include all needed types
        const newBadgeVariants = `const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        success: "border-transparent bg-green-500 text-white hover:bg-green-600",
        warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        error: "border-transparent bg-red-500 text-white hover:bg-red-600",
        destructive: "border-transparent bg-red-500 text-white hover:bg-red-600",
        info: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
        outline: "text-foreground border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);`;

        if (content.includes('const badgeVariants = cva(')) {
            content = content.replace(/const badgeVariants = cva\([\s\S]*?\);/, newBadgeVariants);
            fs.writeFileSync(filePath, content);
            return true;
        }
    } catch (error) {
        console.error(`  ❌ Error updating badge ${filePath}:`, error.message);
    }
    return false;
}

// Step 2: Fix Button variants
function updateButtonComponent(filePath) {
    if (!fs.existsSync(filePath)) return false;

    try {
        let content = fs.readFileSync(filePath, 'utf8');

        const newButtonVariants = `const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);`;

        if (content.includes('const buttonVariants = cva(')) {
            content = content.replace(/const buttonVariants = cva\([\s\S]*?\);/, newButtonVariants);
            fs.writeFileSync(filePath, content);
            return true;
        }
    } catch (error) {
        console.error(`  ❌ Error updating button ${filePath}:`, error.message);
    }
    return false;
}

// Step 3: Fix component code that uses variants
function fixComponentVariants(filePath) {
    if (!fs.existsSync(filePath)) return false;

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        // Fix all destructive -> error
        content = content.replace(/variant="destructive"/g, 'variant="error"');
        content = content.replace(/'destructive'/g, "'error'");
        content = content.replace(/"destructive"/g, '"error"');

        // Fix secondary -> default for badges (not buttons)
        content = content.replace(/Badge.*variant="secondary"/g, 'Badge variant="default"');

        // Fix outline -> default for badges in some contexts
        content = content.replace(/Badge.*variant="outline"/g, 'Badge variant="default"');

        // Update color functions to return valid variants
        content = content.replace(/return 'destructive';/g, "return 'error';");
        content = content.replace(/return 'secondary';/g, "return 'default';");

        // Fix function returns in switch statements
        content = content.replace(/(case '[^']*':\s*return\s*)'destructive'(;)/g, "$1'error'$2");
        content = content.replace(/(case '[^']*':\s*return\s*)'secondary'(;)/g, "$1'default'$2");

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content);
            return true;
        }
    } catch (error) {
        console.error(`  ❌ Error fixing variants ${filePath}:`, error.message);
    }
    return false;
}

// Step 4: Add missing dependencies
function addMissingDependencies(servicePath) {
    const packageJsonPath = path.join(servicePath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) return false;

    try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        let modified = false;

        // Ensure all needed dependencies are present
        const requiredDeps = {
            '@radix-ui/react-slot': '^1.0.2',
            'class-variance-authority': '^0.7.0',
            'clsx': '^2.1.0',
            'tailwind-merge': '^2.3.0',
            'lucide-react': '^0.263.1',
            '@heroicons/react': '^2.0.18'
        };

        if (!packageJson.dependencies) packageJson.dependencies = {};

        for (const [dep, version] of Object.entries(requiredDeps)) {
            if (!packageJson.dependencies[dep] && !packageJson.devDependencies?.[dep]) {
                packageJson.dependencies[dep] = version;
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            return true;
        }
    } catch (error) {
        console.error(`  ❌ Error updating dependencies ${servicePath}:`, error.message);
    }
    return false;
}

// Step 5: Create missing utils.ts files
function ensureUtilsFile(servicePath) {
    const libPaths = [
        path.join(servicePath, 'lib', 'utils.ts'),
        path.join(servicePath, 'src', 'lib', 'utils.ts')
    ];

    for (const utilsPath of libPaths) {
        const libDir = path.dirname(utilsPath);
        if (fs.existsSync(libDir) || utilsPath.includes('src')) {
            if (!fs.existsSync(utilsPath)) {
                fs.mkdirSync(libDir, { recursive: true });
                const utilsContent = `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;
                fs.writeFileSync(utilsPath, utilsContent);
                return true;
            }
        }
    }
    return false;
}

// Main execution
let totalFixed = 0;

// Process all services
const directories = ['apps', 'services'];

for (const dir of directories) {
    const dirPath = path.join(process.cwd(), dir);
    if (fs.existsSync(dirPath)) {
        const services = fs.readdirSync(dirPath);
        for (const service of services) {
            const servicePath = path.join(dirPath, service);
            const packageJsonPath = path.join(servicePath, 'package.json');

            if (fs.existsSync(packageJsonPath)) {
                console.log(`🔍 Processing ${service}:`);
                let serviceFixed = 0;

                // Fix dependencies
                if (addMissingDependencies(servicePath)) {
                    console.log(`  ✅ Added missing dependencies`);
                    serviceFixed++;
                }

                // Ensure utils file exists
                if (ensureUtilsFile(servicePath)) {
                    console.log(`  ✅ Created utils.ts file`);
                    serviceFixed++;
                }

                // Fix UI components
                const uiPaths = [
                    path.join(servicePath, 'components', 'ui'),
                    path.join(servicePath, 'src', 'components', 'ui')
                ];

                for (const uiPath of uiPaths) {
                    if (fs.existsSync(uiPath)) {
                        const badgePath = path.join(uiPath, 'badge.tsx');
                        const buttonPath = path.join(uiPath, 'button.tsx');

                        if (updateBadgeComponent(badgePath)) {
                            console.log(`  ✅ Updated badge component`);
                            serviceFixed++;
                        }

                        if (updateButtonComponent(buttonPath)) {
                            console.log(`  ✅ Updated button component`);
                            serviceFixed++;
                        }
                    }
                }

                // Fix component files that use variants
                const componentDirs = [
                    path.join(servicePath, 'components'),
                    path.join(servicePath, 'src', 'components')
                ];

                for (const componentDir of componentDirs) {
                    if (fs.existsSync(componentDir)) {
                        // Recursively find all .tsx files
                        function findTsxFiles(dir) {
                            const files = [];
                            const items = fs.readdirSync(dir);
                            for (const item of items) {
                                const fullPath = path.join(dir, item);
                                const stat = fs.statSync(fullPath);
                                if (stat.isDirectory()) {
                                    files.push(...findTsxFiles(fullPath));
                                } else if (item.endsWith('.tsx')) {
                                    files.push(fullPath);
                                }
                            }
                            return files;
                        }

                        const tsxFiles = findTsxFiles(componentDir);
                        for (const file of tsxFiles) {
                            if (fixComponentVariants(file)) {
                                console.log(`  ✅ Fixed variants in ${path.basename(file)}`);
                                serviceFixed++;
                            }
                        }
                    }
                }

                if (serviceFixed === 0) {
                    console.log(`  ℹ️  No fixes needed`);
                }

                totalFixed += serviceFixed;
            }
        }
    }
}

console.log(`🎖️ COMPREHENSIVE FIXES COMPLETE - ${totalFixed} total fixes applied`);

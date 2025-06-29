#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING BUTTON COMPONENTS AND DEPENDENCIES');
console.log('===========================================');

function fixButtonComponent(filePath) {
    if (!fs.existsSync(filePath)) return false;

    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace the button component with a version that doesn't use Slot
        const newButtonComponent = `import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
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
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
`;

        // Check if the file contains Slot import and replace entire content
        if (content.includes('@radix-ui/react-slot') || content.includes('Slot')) {
            fs.writeFileSync(filePath, newButtonComponent);
            return true;
        }
    } catch (error) {
        console.error(`  ❌ Error fixing button ${filePath}:`, error.message);
    }
    return false;
}

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

function fixHeroiconsImports(filePath) {
    if (!fs.existsSync(filePath)) return false;

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        // Fix common heroicons import issues
        const heroiconsFixes = {
            'TrendingUpIcon': 'ArrowTrendingUpIcon',
            'TrendingDownIcon': 'ArrowTrendingDownIcon',
            'DatabaseIcon': 'CircleStackIcon',
            'Receive': 'ArrowDownIcon' // This is actually a lucide-react issue
        };

        for (const [oldIcon, newIcon] of Object.entries(heroiconsFixes)) {
            content = content.replace(new RegExp(oldIcon, 'g'), newIcon);
        }

        // Fix lucide-react Receive icon (doesn't exist, use ArrowDown)
        content = content.replace(/import.*Receive.*from.*lucide-react/g,
            "import { ArrowDown as Receive } from 'lucide-react'");

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content);
            return true;
        }
    } catch (error) {
        console.error(`  ❌ Error fixing heroicons ${filePath}:`, error.message);
    }
    return false;
}

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

                // Add missing dependencies
                if (addMissingDependencies(servicePath)) {
                    console.log(`  ✅ Updated dependencies`);
                    serviceFixed++;
                }

                // Fix button components
                const buttonPaths = [
                    path.join(servicePath, 'components', 'ui', 'button.tsx'),
                    path.join(servicePath, 'src', 'components', 'ui', 'button.tsx')
                ];

                for (const buttonPath of buttonPaths) {
                    if (fixButtonComponent(buttonPath)) {
                        console.log(`  ✅ Fixed button component`);
                        serviceFixed++;
                    }
                }

                // Fix heroicons imports in all component files
                const componentDirs = [
                    path.join(servicePath, 'components'),
                    path.join(servicePath, 'src', 'components')
                ];

                for (const componentDir of componentDirs) {
                    if (fs.existsSync(componentDir)) {
                        function findFiles(dir, extension) {
                            const files = [];
                            const items = fs.readdirSync(dir);
                            for (const item of items) {
                                const fullPath = path.join(dir, item);
                                const stat = fs.statSync(fullPath);
                                if (stat.isDirectory()) {
                                    files.push(...findFiles(fullPath, extension));
                                } else if (item.endsWith(extension)) {
                                    files.push(fullPath);
                                }
                            }
                            return files;
                        }

                        const componentFiles = findFiles(componentDir, '.tsx');
                        for (const file of componentFiles) {
                            if (fixHeroiconsImports(file)) {
                                console.log(`  ✅ Fixed heroicons in ${path.basename(file)}`);
                                serviceFixed++;
                            }
                        }
                    }
                }

                if (serviceFixed === 0) {
                    console.log(`  ℹ️  No fixes needed`);
                }
            }
        }
    }
}

console.log('🎖️ BUTTON AND DEPENDENCY FIXES COMPLETE');

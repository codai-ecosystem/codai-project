#!/usr/bin/env node

/**
 * UI Component Distribution Script
 * Phase 3: Distribute shadcn/ui components to all services
 * 
 * Each service expects UI components at their local @/components/ui/ path.
 * This script copies the workspace-level shadcn components to each service.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bright: '\x1b[1m'
};

const log = (message, color = 'reset') => {
    console.log(`${colors[color]}${message}${colors.reset}`);
};

const projectRoot = path.resolve(__dirname, '..');

// Helper function to copy file recursively
const copyFile = (src, dest) => {
    try {
        // Ensure destination directory exists
        const destDir = path.dirname(dest);
        fs.mkdirSync(destDir, { recursive: true });

        // Copy file
        fs.copyFileSync(src, dest);
        return true;
    } catch (error) {
        log(`   ❌ Error copying ${src} to ${dest}: ${error.message}`, 'red');
        return false;
    }
};

// Helper function to get all service directories
const getServiceDirectories = () => {
    const directories = [];

    // Apps directory
    const appsDir = path.join(projectRoot, 'apps');
    if (fs.existsSync(appsDir)) {
        const apps = fs.readdirSync(appsDir).filter(item => {
            const itemPath = path.join(appsDir, item);
            return fs.statSync(itemPath).isDirectory();
        });
        directories.push(...apps.map(app => ({
            name: app,
            path: path.join(appsDir, app),
            type: 'app',
            hasComponents: fs.existsSync(path.join(appsDir, app, 'components')) ||
                fs.existsSync(path.join(appsDir, app, 'src', 'components'))
        })));
    }

    // Services directory
    const servicesDir = path.join(projectRoot, 'services');
    if (fs.existsSync(servicesDir)) {
        const services = fs.readdirSync(servicesDir).filter(item => {
            const itemPath = path.join(servicesDir, item);
            return fs.statSync(itemPath).isDirectory();
        });
        directories.push(...services.map(service => ({
            name: service,
            path: path.join(servicesDir, service),
            type: 'service',
            hasComponents: fs.existsSync(path.join(servicesDir, service, 'components')) ||
                fs.existsSync(path.join(servicesDir, service, 'src', 'components'))
        })));
    }

    return directories;
};

// Helper function to find the source UI components directory
const findSourceUIComponents = () => {
    const possiblePaths = [
        path.join(projectRoot, 'components', 'ui'),
        path.join(projectRoot, 'src', 'components', 'ui'),
        path.join(projectRoot, 'apps', 'codai', 'src', 'components', 'ui'),
        path.join(projectRoot, 'packages', 'ui', 'components'),
    ];

    for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
            const files = fs.readdirSync(possiblePath);
            if (files.length > 0 && files.some(f => f.endsWith('.tsx'))) {
                return possiblePath;
            }
        }
    }

    return null;
};

// UI Component templates (in case we need to create them)
const componentTemplates = {
    'button.tsx': `import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }`,

    'card.tsx': `import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }`,

    'badge.tsx': `import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }`,

    'tabs.tsx': `import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }`,

    'select.tsx': `import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}`,

    'progress.tsx': `import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ transform: \`translateX(-\${100 - (value || 0)}%)\` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }`
};

// Utils template
const utilsTemplate = `import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`;

async function distributeUIComponents() {
    log('🎨 UI COMPONENT DISTRIBUTION - PHASE 3', 'bright');
    log('═'.repeat(60), 'cyan');

    const results = {
        servicesProcessed: 0,
        componentsDistributed: 0,
        libUtilsCreated: 0,
        errors: []
    };

    // Find source UI components
    const sourceUIPath = findSourceUIComponents();
    log(`\n🔍 Source UI Components: ${sourceUIPath || 'Creating from templates'}`, 'blue');

    // Get all services
    const services = getServiceDirectories();
    log(`📁 Found ${services.length} services to process`, 'blue');

    for (const service of services) {
        log(`\n📦 Processing ${service.name} (${service.type})...`, 'yellow');
        results.servicesProcessed++;

        // Determine component paths based on service structure
        let componentsBasePath;
        let libPath;

        if (fs.existsSync(path.join(service.path, 'src'))) {
            componentsBasePath = path.join(service.path, 'src', 'components', 'ui');
            libPath = path.join(service.path, 'src', 'lib');
        } else {
            componentsBasePath = path.join(service.path, 'components', 'ui');
            libPath = path.join(service.path, 'lib');
        }

        // Ensure directories exist
        fs.mkdirSync(componentsBasePath, { recursive: true });
        fs.mkdirSync(libPath, { recursive: true });

        // Create/copy UI components
        const componentNames = ['button', 'card', 'badge', 'tabs', 'select', 'progress'];

        for (const componentName of componentNames) {
            const componentFile = `${componentName}.tsx`;
            const destPath = path.join(componentsBasePath, componentFile);

            // Skip if component already exists
            if (fs.existsSync(destPath)) {
                log(`   ✓ ${componentFile} already exists`, 'cyan');
                continue;
            }

            let success = false;

            // Try to copy from source if available
            if (sourceUIPath) {
                const sourcePath = path.join(sourceUIPath, componentFile);
                if (fs.existsSync(sourcePath)) {
                    success = copyFile(sourcePath, destPath);
                }
            }

            // Fall back to template if copy failed or no source
            if (!success && componentTemplates[componentFile]) {
                try {
                    fs.writeFileSync(destPath, componentTemplates[componentFile]);
                    success = true;
                } catch (error) {
                    results.errors.push(`Failed to create ${componentFile} for ${service.name}: ${error.message}`);
                }
            }

            if (success) {
                log(`   ✅ ${componentFile} created/copied`, 'green');
                results.componentsDistributed++;
            } else {
                log(`   ❌ Failed to create ${componentFile}`, 'red');
            }
        }

        // Create lib/utils.ts if it doesn't exist
        const utilsPath = path.join(libPath, 'utils.ts');
        if (!fs.existsSync(utilsPath)) {
            try {
                fs.writeFileSync(utilsPath, utilsTemplate);
                log(`   ✅ lib/utils.ts created`, 'green');
                results.libUtilsCreated++;
            } catch (error) {
                log(`   ❌ Failed to create lib/utils.ts: ${error.message}`, 'red');
                results.errors.push(`Failed to create lib/utils.ts for ${service.name}: ${error.message}`);
            }
        } else {
            log(`   ✓ lib/utils.ts already exists`, 'cyan');
        }
    }

    // Summary
    log('\n' + '═'.repeat(60), 'cyan');
    log('📊 UI COMPONENT DISTRIBUTION SUMMARY:', 'bright');
    log(`   Services processed: ${results.servicesProcessed}`, 'green');
    log(`   Components distributed: ${results.componentsDistributed}`, 'green');
    log(`   lib/utils.ts files created: ${results.libUtilsCreated}`, 'green');
    log(`   Errors encountered: ${results.errors.length}`, results.errors.length > 0 ? 'red' : 'green');

    if (results.errors.length > 0) {
        log('\n❌ ERRORS:', 'red');
        results.errors.forEach(error => log(`   • ${error}`, 'red'));
    }

    log('\n🎉 UI COMPONENT DISTRIBUTION COMPLETE!', 'green');
    log('All services should now have access to shadcn/ui components.', 'cyan');
    log('Run "pnpm build" to test the improvements.', 'cyan');

    return results;
}

// Run the UI component distribution
distributeUIComponents().catch(error => {
    log(`❌ Fatal error: ${error.message}`, 'red');
    process.exit(1);
});

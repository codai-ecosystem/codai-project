#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 CREATING MISSING UI COMPONENTS');
console.log('==================================');

function createMissingComponents(servicePath, serviceName) {
    const componentsPath = path.join(servicePath, 'components', 'ui');
    const srcComponentsPath = path.join(servicePath, 'src', 'components', 'ui');

    const uiPath = fs.existsSync(componentsPath) ? componentsPath :
        fs.existsSync(srcComponentsPath) ? srcComponentsPath : null;

    if (!uiPath) {
        // Create components/ui directory
        fs.mkdirSync(componentsPath, { recursive: true });
        createUtilsFile(servicePath, serviceName);
    }

    const finalUiPath = uiPath || componentsPath;

    // Create missing components
    createTabsComponent(finalUiPath);
    createSelectComponent(finalUiPath);
    createInputComponent(finalUiPath);
    createLabelComponent(finalUiPath);

    console.log(`  ✅ ${serviceName}: Created missing UI components`);
}

function createUtilsFile(servicePath, serviceName) {
    const libPath = path.join(servicePath, 'lib');
    const srcLibPath = path.join(servicePath, 'src', 'lib');

    let utilsPath;
    if (fs.existsSync(libPath)) {
        utilsPath = path.join(libPath, 'utils.ts');
    } else if (fs.existsSync(srcLibPath)) {
        utilsPath = path.join(srcLibPath, 'utils.ts');
    } else {
        // Create lib directory
        fs.mkdirSync(libPath, { recursive: true });
        utilsPath = path.join(libPath, 'utils.ts');
    }

    if (!fs.existsSync(utilsPath)) {
        const utilsContent = `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;
        fs.writeFileSync(utilsPath, utilsContent);
        console.log(`  ✅ ${serviceName}: Created utils.ts`);
    }
}

function createTabsComponent(uiPath) {
    const tabsPath = path.join(uiPath, 'tabs.tsx');
    if (!fs.existsSync(tabsPath)) {
        const tabsComponent = `"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("w-full", className)} {...props} />
))
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value: string
  }
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
  }
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
`;
        fs.writeFileSync(tabsPath, tabsComponent);
    }
}

function createSelectComponent(uiPath) {
    const selectPath = path.join(uiPath, 'select.tsx');
    if (!fs.existsSync(selectPath)) {
        const selectComponent = `"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </select>
))
Select.displayName = "Select"

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", className)}
    {...props}
  />
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ className, children, ...props }, ref) => (
  <option
    ref={ref}
    className={cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground", className)}
    {...props}
  >
    {children}
  </option>
))
SelectItem.displayName = "SelectItem"

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span ref={ref} className={cn("block truncate", className)} {...props} />
))
SelectValue.displayName = "SelectValue"

export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
}
`;
        fs.writeFileSync(selectPath, selectComponent);
    }
}

function createInputComponent(uiPath) {
    const inputPath = path.join(uiPath, 'input.tsx');
    if (!fs.existsSync(inputPath)) {
        const inputComponent = `import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
`;
        fs.writeFileSync(inputPath, inputComponent);
    }
}

function createLabelComponent(uiPath) {
    const labelPath = path.join(uiPath, 'label.tsx');
    if (!fs.existsSync(labelPath)) {
        const labelComponent = `"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = "Label"

export { Label }
`;
        fs.writeFileSync(labelPath, labelComponent);
    }
}

function fixJavaScriptSyntax(servicePath, serviceName) {
    const apiRoutePath = path.join(servicePath, 'app', 'api', 'options', 'route.ts');
    if (fs.existsSync(apiRoutePath)) {
        try {
            let content = fs.readFileSync(apiRoutePath, 'utf8');

            // Fix invalid property names (numbers can't start property names)
            content = content.replace(/(\s+)30day:/g, '$1"30day":');
            content = content.replace(/(\s+)60day:/g, '$1"60day":');
            content = content.replace(/(\s+)90day:/g, '$1"90day":');

            fs.writeFileSync(apiRoutePath, content);
            console.log(`  ✅ ${serviceName}: Fixed JavaScript syntax in API route`);
        } catch (error) {
            console.error(`  ❌ ${serviceName}: Failed to fix API route:`, error.message);
        }
    }
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
                createMissingComponents(servicePath, service);
                fixJavaScriptSyntax(servicePath, service);
            }
        }
    }
}

console.log('🎖️ MISSING COMPONENTS CREATION COMPLETE');

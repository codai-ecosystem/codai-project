#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 CREATING MISSING UI COMPONENTS PHASE 2');
console.log('==========================================');

function createMissingUiComponents(servicePath, serviceName) {
    const componentsPath = path.join(servicePath, 'components', 'ui');
    const srcComponentsPath = path.join(servicePath, 'src', 'components', 'ui');

    const uiPath = fs.existsSync(componentsPath) ? componentsPath :
        fs.existsSync(srcComponentsPath) ? srcComponentsPath : null;

    if (!uiPath) {
        // Create components/ui directory
        fs.mkdirSync(componentsPath, { recursive: true });
        createUtilsFile(servicePath);
    }

    const finalUiPath = uiPath || componentsPath;

    // Create missing essential components
    createLoadingSpinner(finalUiPath);
    createErrorMessage(finalUiPath);
    createIndexFile(finalUiPath);

    console.log(`  ✅ ${serviceName}: Created missing UI components`);
}

function createUtilsFile(servicePath) {
    const libPaths = [
        path.join(servicePath, 'lib'),
        path.join(servicePath, 'src', 'lib')
    ];

    for (const libPath of libPaths) {
        if (!fs.existsSync(libPath)) {
            fs.mkdirSync(libPath, { recursive: true });
        }

        const utilsPath = path.join(libPath, 'utils.ts');
        if (!fs.existsSync(utilsPath)) {
            const utilsContent = `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`;
            fs.writeFileSync(utilsPath, utilsContent);
            console.log(`  ✅ Created utils.ts in ${libPath}`);
            return;
        }
    }
}

function createLoadingSpinner(uiPath) {
    const spinnerPath = path.join(uiPath, 'loading-spinner.tsx');
    if (!fs.existsSync(spinnerPath)) {
        const spinnerComponent = `import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div 
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
        sizeClasses[size],
        className
      )}
    />
  );
};

export { LoadingSpinner };
`;
        fs.writeFileSync(spinnerPath, spinnerComponent);
    }
}

function createErrorMessage(uiPath) {
    const errorPath = path.join(uiPath, 'error-message.tsx');
    if (!fs.existsSync(errorPath)) {
        const errorComponent = `import React from 'react';
import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  message: string;
  className?: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  className, 
  onRetry 
}) => {
  return (
    <div className={cn('rounded-md bg-red-50 p-4 border border-red-200', className)}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="mt-1 text-sm text-red-700">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export { ErrorMessage };
`;
        fs.writeFileSync(errorPath, errorComponent);
    }
}

function createIndexFile(uiPath) {
    const indexPath = path.join(uiPath, 'index.ts');
    if (!fs.existsSync(indexPath)) {
        const indexContent = `export { Badge } from './badge';
export { Button } from './button';
export { Card, CardHeader, CardTitle, CardDescription, CardContent } from './card';
export { Input } from './input';
export { Label } from './label';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
export { LoadingSpinner } from './loading-spinner';
export { ErrorMessage } from './error-message';
`;
        fs.writeFileSync(indexPath, indexContent);
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
                createMissingUiComponents(servicePath, service);
            }
        }
    }
}

console.log('🎖️ MISSING UI COMPONENTS CREATION COMPLETE');

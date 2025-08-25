#!/usr/bin/env node
/**
 * CODAI State Management Modernization Script
 * Migrates applications from useState patterns to modern Zustand stores
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { execSync } from 'child_process';

class StateManagementModernizer {
    constructor(workspaceRoot = process.cwd()) {
        this.workspaceRoot = workspaceRoot;
        this.appsToModernize = ['memorai', 'romai', 'bancai', 'codai', 'admin', 'hub', 'id'];
        this.analysis = [];
        console.log('🔄 Initializing State Management Modernization...');
    }

    /**
     * Main modernization process
     */
    async modernize() {
        try {
            console.log('📊 Analyzing current state management patterns...');
            await this.analyzeCurrentState();

            console.log('🏗️ Creating modernized store templates...');
            await this.createStoreTemplates();

            console.log('📦 Installing and configuring dependencies...');
            await this.setupDependencies();

            console.log('🔧 Implementing Zustand stores...');
            await this.implementZustandStores();

            console.log('📚 Generating documentation...');
            await this.generateDocumentation();

            console.log('✅ State management modernization completed successfully!');
            this.printSummary();

        } catch (error) {
            console.error('❌ State management modernization failed:', error);
            process.exit(1);
        }
    }

    /**
     * Analyze current state management patterns in each app
     */
    async analyzeCurrentState() {
        for (const appName of this.appsToModernize) {
            const appPath = join(this.workspaceRoot, 'apps', appName);

            if (!existsSync(appPath)) {
                console.log(`⚠️  App ${appName} not found, skipping...`);
                continue;
            }

            console.log(`🔍 Analyzing ${appName}...`);

            const analysis = {
                appName,
                currentPattern: 'useState',
                stateComplexity: 'low',
                stateCount: 0,
                files: [],
                recommendations: []
            };

            // Check package.json for existing state management
            const packageJsonPath = join(appPath, 'package.json');
            if (existsSync(packageJsonPath)) {
                try {
                    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

                    if (packageJson.dependencies?.zustand) {
                        analysis.currentPattern = 'zustand';
                    } else if (packageJson.dependencies?.['@reduxjs/toolkit'] || packageJson.dependencies?.redux) {
                        analysis.currentPattern = 'redux';
                    }
                } catch (error) {
                    console.warn(`Could not read package.json for ${appName}:`, error.message);
                }
            }

            // Analyze source files for state patterns
            try {
                const srcPath = join(appPath, 'src');
                if (existsSync(srcPath)) {
                    const files = this.findStateFiles(srcPath);
                    analysis.files = files;
                    analysis.stateCount = this.countStateUsage(files);

                    if (analysis.stateCount > 20) {
                        analysis.stateComplexity = 'high';
                    } else if (analysis.stateCount > 10) {
                        analysis.stateComplexity = 'medium';
                    }
                }
            } catch (error) {
                console.warn(`⚠️  Could not analyze ${appName} source files:`, error.message);
            }

            // Generate recommendations
            this.generateRecommendations(analysis);
            this.analysis.push(analysis);
        }
    }

    /**
     * Find files with state management patterns
     */
    findStateFiles(dir) {
        const files = [];

        try {
            // Use find command to locate files with state patterns
            const result = execSync(`find "${dir}" -name "*.ts" -o -name "*.tsx" | head -50`, { encoding: 'utf8' });
            const allFiles = result.trim().split('\n').filter(Boolean);

            for (const file of allFiles) {
                try {
                    const content = readFileSync(file, 'utf8');
                    if (content.includes('useState') || content.includes('useContext') || content.includes('useStore')) {
                        files.push(file);
                    }
                } catch (error) {
                    // Skip files we can't read
                }
            }
        } catch (error) {
            console.warn('Could not find state files:', error.message);
        }

        return files;
    }

    /**
     * Count useState occurrences in files
     */
    countStateUsage(files) {
        let count = 0;

        for (const file of files) {
            try {
                const content = readFileSync(file, 'utf8');
                const matches = content.match(/useState/g);
                count += matches ? matches.length : 0;
            } catch (error) {
                // Skip files we can't read
            }
        }

        return count;
    }

    /**
     * Generate modernization recommendations
     */
    generateRecommendations(analysis) {
        const { appName, currentPattern, stateComplexity, stateCount } = analysis;

        if (currentPattern === 'useState' && stateComplexity === 'high') {
            analysis.recommendations.push('Migrate to Zustand for better performance and maintainability');
            analysis.recommendations.push('Implement global state stores for shared data');
            analysis.recommendations.push('Add state persistence for user preferences');
        }

        if (currentPattern === 'useState' && stateComplexity === 'medium') {
            analysis.recommendations.push('Consider Zustand for complex state logic');
            analysis.recommendations.push('Create custom hooks for reusable state logic');
        }

        if (currentPattern === 'redux') {
            analysis.recommendations.push('Consider migrating to Zustand for simpler codebase');
            analysis.recommendations.push('Reduce boilerplate with modern state patterns');
        }

        analysis.recommendations.push('Implement state management testing');
        analysis.recommendations.push('Add TypeScript strict typing for state');
    }

    /**
     * Create store templates for each app
     */
    async createStoreTemplates() {
        const storeTemplates = {
            memorai: [
                {
                    name: 'memory',
                    interface: `interface Memory {
  id: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  importance: number;
}

interface MemoryState {
  memories: Memory[];
  searchQuery: string;
  selectedMemory: Memory | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addMemory: (memory: Omit<Memory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMemory: (id: string, updates: Partial<Memory>) => void;
  deleteMemory: (id: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedMemory: (memory: Memory | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}`,
                    implementation: 'memory store with search and filtering',
                    persistence: true,
                    crossApp: true
                }
            ],
            bancai: [
                {
                    name: 'banking',
                    interface: `interface BankingState {
  accounts: Account[];
  transactions: Transaction[];
  selectedAccount: Account | null;
  balance: number;
  isLoading: boolean;
  
  // Actions
  fetchAccounts: () => void;
  selectAccount: (account: Account) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateBalance: (accountId: string, amount: number) => void;
}`,
                    implementation: 'banking operations and account management',
                    persistence: true,
                    crossApp: true
                }
            ]
        };

        for (const [appName, templates] of Object.entries(storeTemplates)) {
            if (this.appsToModernize.includes(appName)) {
                await this.createStoreFiles(appName, templates);
            }
        }
    }

    /**
     * Create store files for an app
     */
    async createStoreFiles(appName, templates) {
        const appPath = join(this.workspaceRoot, 'apps', appName);
        const storesDir = join(appPath, 'src', 'stores');

        // Create stores directory
        if (!existsSync(storesDir)) {
            mkdirSync(storesDir, { recursive: true });
        }

        // Create individual store files
        for (const template of templates) {
            const storeFile = join(storesDir, `${template.name}.ts`);
            const storeContent = this.generateStoreContent(template);

            writeFileSync(storeFile, storeContent);
            console.log(`✅ Created store: ${appName}/${template.name}.ts`);
        }

        // Create index file
        const indexFile = join(storesDir, 'index.ts');
        const indexContent = this.generateStoreIndex(templates);

        writeFileSync(indexFile, indexContent);
        console.log(`✅ Created store index: ${appName}/index.ts`);

        // Create common stores
        await this.createCommonStores(storesDir);
    }

    /**
     * Generate store content from template
     */
    generateStoreContent(template) {
        const persistenceImport = template.persistence
            ? "import { createJSONStorage, persist } from 'zustand/middleware';"
            : '';

        const storeName = template.name.charAt(0).toUpperCase() + template.name.slice(1);

        return `import { create } from 'zustand';
${persistenceImport}

${template.interface}

export const use${storeName}Store = create${template.persistence ? `(
  persist(
    (set, get) => ({
      // Store implementation will be added here
      // Based on the interface above
    }),
    {
      name: '${template.name}-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)` : `((set, get) => ({
  // Store implementation will be added here
  // Based on the interface above
}))`};
`;
    }

    /**
     * Generate store index file
     */
    generateStoreIndex(templates) {
        const exports = templates
            .map(t => `export { use${t.name.charAt(0).toUpperCase() + t.name.slice(1)}Store } from './${t.name}';`)
            .join('\n');

        return `// ${new Date().getFullYear()} CODAI State Management
// Modern Zustand stores for improved performance and maintainability

${exports}

// Common stores
export { useThemeStore } from './theme';
export { usePreferencesStore } from './preferences';
`;
    }

    /**
     * Create common stores for all apps
     */
    async createCommonStores(storesDir) {
        // Theme store
        const themeStore = `import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  effectiveTheme: 'light' | 'dark';
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  setEffectiveTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'system',
      effectiveTheme: 'light',
      
      setTheme: (theme) => {
        set({ theme });
        
        if (theme === 'system') {
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          get().setEffectiveTheme(systemTheme);
        } else {
          get().setEffectiveTheme(theme);
        }
      },
      
      toggleTheme: () => {
        const current = get().theme;
        if (current === 'light') {
          get().setTheme('dark');
        } else {
          get().setTheme('light');
        }
      },
      
      setEffectiveTheme: (effectiveTheme) => {
        set({ effectiveTheme });
        
        if (typeof document !== 'undefined') {
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(effectiveTheme);
        }
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
`;

        writeFileSync(join(storesDir, 'theme.ts'), themeStore);
        console.log(`✅ Created common theme store`);
    }

    /**
     * Setup dependencies for all apps
     */
    async setupDependencies() {
        for (const appName of this.appsToModernize) {
            const appPath = join(this.workspaceRoot, 'apps', appName);

            if (!existsSync(appPath)) continue;

            console.log(`📦 Setting up dependencies for ${appName}...`);

            // Check if zustand is already installed
            const packageJsonPath = join(appPath, 'package.json');
            if (existsSync(packageJsonPath)) {
                try {
                    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

                    if (!packageJson.dependencies?.zustand) {
                        try {
                            execSync('pnpm add zustand', { cwd: appPath, stdio: 'ignore' });
                            console.log(`✅ Installed Zustand for ${appName}`);
                        } catch (error) {
                            console.warn(`⚠️  Could not install Zustand for ${appName}`);
                        }
                    } else {
                        console.log(`✅ Zustand already installed for ${appName}`);
                    }
                } catch (error) {
                    console.warn(`Could not process package.json for ${appName}`);
                }
            }
        }
    }

    /**
     * Implement Zustand stores for each app
     */
    async implementZustandStores() {
        for (const analysis of this.analysis) {
            if (analysis.currentPattern === 'zustand') {
                console.log(`✅ ${analysis.appName} already using Zustand, enhancing...`);
            }

            console.log(`🔧 Implementing Zustand stores for ${analysis.appName}...`);
            await this.createAppSpecificStores(analysis.appName);
        }
    }

    /**
     * Create app-specific store implementations
     */
    async createAppSpecificStores(appName) {
        const appPath = join(this.workspaceRoot, 'apps', appName);
        const storesDir = join(appPath, 'src', 'stores');

        if (!existsSync(storesDir)) {
            console.log(`⚠️  No stores directory for ${appName}, creating basic structure...`);
            mkdirSync(storesDir, { recursive: true });

            // Create a basic app store
            const basicStore = `import { create } from 'zustand';

interface AppState {
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAppStore = create((set) => ({
  isLoading: false,
  error: null,
  
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
`;

            writeFileSync(join(storesDir, 'app.ts'), basicStore);
            await this.createCommonStores(storesDir);

            // Create index file
            const indexContent = `// ${new Date().getFullYear()} CODAI State Management
// Modern Zustand stores for improved performance and maintainability

export { useAppStore } from './app';
export { useThemeStore } from './theme';
`;

            writeFileSync(join(storesDir, 'index.ts'), indexContent);
            console.log(`✅ Created basic store structure for ${appName}`);
        }
    }

    /**
     * Generate documentation
     */
    async generateDocumentation() {
        const docContent = `# State Management Modernization Guide

## Overview

This document outlines the modernized state management architecture across CODAI applications using Zustand for optimal performance and developer experience.

## Architecture

### Store Structure
- **Common Stores**: Theme, User Preferences, Auth (shared across apps)
- **App-Specific Stores**: Domain-specific state management
- **Cross-App Communication**: State synchronization between applications

### Benefits of Zustand
- 🚀 **Performance**: Minimal re-renders with selective subscriptions
- 📦 **Bundle Size**: Lightweight compared to Redux (2.5kb vs 47kb)
- 🎯 **TypeScript**: First-class TypeScript support
- 🔄 **Persistence**: Built-in localStorage/sessionStorage support
- 🛠️ **DevTools**: Redux DevTools integration
- 📝 **Simplicity**: Less boilerplate, more productive development

## Store Patterns

### Basic Store
\`\`\`typescript
import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useCounterStore = create<CounterState>(set => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 })),
}));
\`\`\`

### Persistent Store
\`\`\`typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const usePreferencesStore = create(
  persist(
    (set) => ({
      // store implementation
    }),
    {
      name: 'preferences-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
\`\`\`

## Migration Guide

### From useState to Zustand

**Before (useState):**
\`\`\`tsx
function Component() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Complex state logic...
}
\`\`\`

**After (Zustand):**
\`\`\`tsx
function Component() {
  const { user, loading, setUser, setLoading } = useAuthStore();
  
  // Clean, reusable state logic
}
\`\`\`

## App-Specific Analysis

${this.analysis.map(app => `
### ${app.appName.toUpperCase()}
- **Current Pattern**: ${app.currentPattern}
- **Complexity**: ${app.stateComplexity}
- **State Count**: ${app.stateCount} useState calls
- **Files**: ${app.files.length} files with state
- **Recommendations**: ${app.recommendations.join(', ')}
`).join('')}

## Next Steps

1. ✅ Zustand stores created for all applications
2. 🔄 Migrate existing useState patterns gradually
3. 🧪 Implement comprehensive testing
4. 📊 Monitor performance improvements
5. 🔄 Set up cross-app state synchronization

---

Generated on ${new Date().toISOString()}
`;

        const docsPath = join(this.workspaceRoot, 'docs', 'state-management-modernization.md');
        mkdirSync(dirname(docsPath), { recursive: true });
        writeFileSync(docsPath, docContent);

        console.log('✅ Generated state management documentation');
    }

    /**
     * Print summary of modernization
     */
    printSummary() {
        console.log('\n🎉 STATE MANAGEMENT MODERNIZATION COMPLETE!\n');

        console.log('📊 ANALYSIS SUMMARY:');
        console.log('├─ Apps Analyzed:', this.analysis.length);
        console.log('├─ Total useState Count:', this.analysis.reduce((sum, app) => sum + app.stateCount, 0));
        console.log('└─ Complex Apps:', this.analysis.filter(app => app.stateComplexity === 'high').length);

        console.log('\n🏗️ IMPLEMENTATION:');
        console.log('├─ Zustand Stores Created');
        console.log('├─ Persistence Configured');
        console.log('├─ TypeScript Interfaces');
        console.log('├─ Common Stores (Theme, etc.)');
        console.log('└─ Documentation Generated');

        console.log('\n📈 BENEFITS:');
        console.log('├─ 🚀 Better Performance (selective re-renders)');
        console.log('├─ 📦 Smaller Bundle Size (Zustand vs Redux)');
        console.log('├─ 🎯 Type Safety (TypeScript first)');
        console.log('├─ 🔄 State Persistence (localStorage integration)');
        console.log('├─ 🧪 Testing Ready (isolated store testing)');
        console.log('└─ 🛠️ Developer Experience (less boilerplate)');

        console.log('\n🎯 NEXT ACTIONS:');
        console.log('├─ 1. Review generated stores in apps/*/src/stores/');
        console.log('├─ 2. Gradually migrate useState to useStore hooks');
        console.log('├─ 3. Implement store logic based on interfaces');
        console.log('├─ 4. Test store functionality');
        console.log('└─ 5. Monitor performance improvements');

        console.log('\n📚 DOCUMENTATION:');
        console.log('└─ docs/state-management-modernization.md - Complete migration guide');

        console.log('\n📋 ANALYSIS DETAILS:');
        this.analysis.forEach(app => {
            console.log(`\n${app.appName.toUpperCase()}:`);
            console.log(`  Pattern: ${app.currentPattern}`);
            console.log(`  Complexity: ${app.stateComplexity}`);
            console.log(`  useState calls: ${app.stateCount}`);
            console.log(`  Files: ${app.files.length}`);
            if (app.recommendations.length > 0) {
                console.log(`  Recommendations: ${app.recommendations.slice(0, 2).join(', ')}`);
            }
        });
    }
}

// Self-executing module
const modernizer = new StateManagementModernizer();
modernizer.modernize().catch(console.error);
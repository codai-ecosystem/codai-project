const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class StateManagementModernizer {
    constructor() {
        this.workspaceRoot = process.cwd();
        this.targetApps = ['memorai', 'romai', 'bancai', 'codai', 'admin', 'hub', 'id'];
        this.analysisResults = {};
        
        console.log('🚀 State Management Modernizer - Windows Compatible');
        console.log(`📂 Workspace: ${this.workspaceRoot}`);
    }

    async modernize() {
        console.log('\n🔄 Starting State Management Modernization...');
        
        try {
            await this.analyzeCurrentState();
            await this.createStoreTemplates();
            await this.setupDependencies();
            await this.generateMigrationGuide();
            
            console.log('\n✅ State Management Modernization Complete!');
            console.log('\n📋 Summary:');
            this.printSummary();
            
        } catch (error) {
            console.error('❌ Modernization failed:', error.message);
            console.error(error.stack);
        }
    }

    async analyzeCurrentState() {
        console.log('\n📊 Analyzing current state management patterns...');
        
        for (const app of this.targetApps) {
            console.log(`🔍 Analyzing ${app}...`);
            const appPath = path.join(this.workspaceRoot, 'apps', app);
            
            if (!fs.existsSync(appPath)) {
                console.log(`⚠️  App ${app} not found, skipping...`);
                continue;
            }
            
            try {
                const analysis = await this.analyzeApp(appPath, app);
                this.analysisResults[app] = analysis;
                
                console.log(`   📈 useState count: ${analysis.useStateCount}`);
                console.log(`   📊 Complexity: ${analysis.modernizationPriority}`);
                console.log(`   🏪 Has Zustand: ${analysis.hasZustand ? '✅' : '❌'}`);
                
            } catch (error) {
                console.error(`   ❌ Error analyzing ${app}:`, error.message);
                this.analysisResults[app] = {
                    useStateCount: 0,
                    stateComplexity: 0,
                    statePatterns: [],
                    hasZustand: false,
                    modernizationPriority: 'LOW'
                };
            }
        }
    }

    async analyzeApp(appPath, appName) {
        const srcPath = path.join(appPath, 'src');
        const appDir = path.join(appPath, 'app'); // Next.js app directory
        
        // Check both src and app directories
        const searchDirs = [srcPath, appDir].filter(dir => fs.existsSync(dir));
        
        let useStateCount = 0;
        let stateComplexity = 0;
        const statePatterns = [];
        
        for (const searchDir of searchDirs) {
            const files = this.findFilesRecursive(searchDir, ['.ts', '.tsx']);
            
            for (const file of files.slice(0, 30)) { // Limit for performance
                try {
                    const content = fs.readFileSync(file, 'utf-8');
                    
                    // Count useState patterns
                    const useStateMatches = content.match(/const\s+\[([^,]+),\s*set\w+\]\s*=\s*useState/g) || [];
                    useStateCount += useStateMatches.length;
                    
                    // Count complex state (objects, arrays)
                    const complexStates = content.match(/useState\s*\(\s*[\{\[]/g) || [];
                    stateComplexity += complexStates.length;
                    
                    // Extract state variable names
                    useStateMatches.forEach(match => {
                        const stateVar = match.match(/\[([^,]+),/)?.[1];
                        if (stateVar) statePatterns.push(stateVar.trim());
                    });
                    
                } catch (error) {
                    // Skip files we can't read
                }
            }
        }
        
        // Check if Zustand is already in use
        const hasZustand = this.checkForZustand(appPath);
        
        return {
            useStateCount,
            stateComplexity,
            statePatterns: [...new Set(statePatterns)],
            hasZustand,
            modernizationPriority: useStateCount > 15 ? 'HIGH' : useStateCount > 8 ? 'MEDIUM' : 'LOW'
        };
    }

    findFilesRecursive(dir, extensions) {
        const files = [];
        
        if (!fs.existsSync(dir)) {
            return files;
        }
        
        const walkDir = (currentPath, depth = 0) => {
            if (depth > 5) return; // Limit depth
            
            try {
                const entries = fs.readdirSync(currentPath, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(currentPath, entry.name);
                    
                    if (entry.isDirectory()) {
                        // Skip common directories we don't need
                        if (!['node_modules', '.next', 'dist', '.git', 'coverage'].includes(entry.name) && 
                            !entry.name.startsWith('.')) {
                            walkDir(fullPath, depth + 1);
                        }
                    } else if (entry.isFile()) {
                        const ext = path.extname(entry.name);
                        if (extensions.includes(ext)) {
                            files.push(fullPath);
                        }
                    }
                }
            } catch (error) {
                // Skip directories we can't read
            }
        };
        
        walkDir(dir);
        return files;
    }

    checkForZustand(appPath) {
        // Check package.json
        const packageJsonPath = path.join(appPath, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                if (packageJson.dependencies?.zustand || packageJson.devDependencies?.zustand) {
                    return true;
                }
            } catch (error) {
                // Skip if can't read package.json
            }
        }
        
        // Check for store files
        const storeFiles = this.findFilesRecursive(appPath, ['.ts', '.tsx']).filter(file => 
            file.includes('store') || file.includes('Store')
        );
        
        return storeFiles.length > 0;
    }

    async createStoreTemplates() {
        console.log('\n🏗️ Creating modernized store templates...');
        
        for (const [appName, analysis] of Object.entries(this.analysisResults)) {
            if (analysis.modernizationPriority === 'LOW' && analysis.hasZustand) {
                console.log(`⏭️  Skipping ${appName} - already modern`);
                continue;
            }
            
            await this.createAppStores(appName, analysis);
        }
    }

    async createAppStores(appName, analysis) {
        const appPath = path.join(this.workspaceRoot, 'apps', appName);
        const storesDir = path.join(appPath, 'src', 'stores');
        
        // Create stores directory
        if (!fs.existsSync(storesDir)) {
            fs.mkdirSync(storesDir, { recursive: true });
        }
        
        // Create main application store based on detected patterns
        const mainStoreContent = this.generateMainStore(appName, analysis);
        const mainStorePath = path.join(storesDir, `${appName}.ts`);
        fs.writeFileSync(mainStorePath, mainStoreContent);
        console.log(`✅ Created store: ${appName}/${appName}.ts`);
        
        // Create common stores that most apps need
        await this.createCommonStores(storesDir, appName);
        
        // Create store index
        const indexContent = this.generateStoreIndex(appName);
        const indexPath = path.join(storesDir, 'index.ts');
        fs.writeFileSync(indexPath, indexContent);
        console.log(`✅ Created store index: ${appName}/index.ts`);
    }

    generateMainStore(appName, analysis) {
        const statePatterns = analysis.statePatterns.slice(0, 10); // Limit patterns
        
        return `import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';

// ${appName.charAt(0).toUpperCase() + appName.slice(1)} App State Interface
interface ${appName.charAt(0).toUpperCase() + appName.slice(1)}State {
  // Core application state
  isLoading: boolean;
  error: string | null;
  
  // Detected state patterns (migrate from useState)
${statePatterns.map(pattern => `  ${pattern}: any; // TODO: Define proper type`).join('\n')}
  
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Pattern-specific actions
${statePatterns.map(pattern => `  set${pattern.charAt(0).toUpperCase() + pattern.slice(1)}: (value: any) => void;`).join('\n')}
}

// ${appName.charAt(0).toUpperCase() + appName.slice(1)} Store with persistence and middleware
export const use${appName.charAt(0).toUpperCase() + appName.slice(1)}Store = create<${appName.charAt(0).toUpperCase() + appName.slice(1)}State>()(
  subscribeWithSelector(
    persist(
      immer((set) => ({
        // Initial state
        isLoading: false,
        error: null,
        
        // Initialize detected patterns
${statePatterns.map(pattern => `        ${pattern}: null,`).join('\n')}
        
        // Actions
        setLoading: (loading) => set((state) => {
          state.isLoading = loading;
        }),
        
        setError: (error) => set((state) => {
          state.error = error;
        }),
        
        clearError: () => set((state) => {
          state.error = null;
        }),
        
        // Pattern-specific actions
${statePatterns.map(pattern => `        set${pattern.charAt(0).toUpperCase() + pattern.slice(1)}: (value) => set((state) => {
          state.${pattern} = value;
        }),`).join('\n')}
      })),
      {
        name: '${appName}-storage',
        storage: createJSONStorage(() => localStorage),
        // Only persist non-sensitive data
        partialize: (state) => ({
          // Add specific fields to persist
          error: state.error,
          // Add other non-sensitive state
        }),
      }
    )
  )
);

// Selectors for optimized re-renders
export const ${appName}Selectors = {
  isLoading: (state: ${appName.charAt(0).toUpperCase() + appName.slice(1)}State) => state.isLoading,
  error: (state: ${appName.charAt(0).toUpperCase() + appName.slice(1)}State) => state.error,
  hasError: (state: ${appName.charAt(0).toUpperCase() + appName.slice(1)}State) => state.error !== null,
${statePatterns.map(pattern => `  ${pattern}: (state: ${appName.charAt(0).toUpperCase() + appName.slice(1)}State) => state.${pattern},`).join('\n')}
};

// Hooks for common patterns
export const use${appName.charAt(0).toUpperCase() + appName.slice(1)}Loading = () => use${appName.charAt(0).toUpperCase() + appName.slice(1)}Store(${appName}Selectors.isLoading);
export const use${appName.charAt(0).toUpperCase() + appName.slice(1)}Error = () => use${appName.charAt(0).toUpperCase() + appName.slice(1)}Store(${appName}Selectors.error);
`;
    }

    async createCommonStores(storesDir, appName) {
        // Theme store
        const themeStore = `import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          root.classList.remove('light', 'dark');
          
          if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
          } else {
            root.classList.add(theme);
          }
        }
      },
      toggleTheme: () => {
        const currentTheme = get().theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
    }),
    {
      name: '${appName}-theme-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
`;
        
        fs.writeFileSync(path.join(storesDir, 'theme.ts'), themeStore);
        console.log(`✅ Created common theme store`);
        
        // UI state store
        const uiStore = `import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  modalOpen: boolean;
  notifications: Array<{ id: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }>;
  
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: () => void;
  closeModal: () => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: false,
  modalOpen: false,
  notifications: [],
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openModal: () => set({ modalOpen: true }),
  closeModal: () => set({ modalOpen: false }),
  
  addNotification: (notification) => {
    const id = Date.now().toString();
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id }]
    }));
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      get().removeNotification(id);
    }, 5000);
  },
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  clearNotifications: () => set({ notifications: [] }),
}));
`;
        
        fs.writeFileSync(path.join(storesDir, 'ui.ts'), uiStore);
        console.log(`✅ Created UI state store`);
    }

    generateStoreIndex(appName) {
        return `// ${appName.charAt(0).toUpperCase() + appName.slice(1)} Store Exports
export * from './${appName}';
export * from './theme';
export * from './ui';

// Re-export common hooks for convenience
export { use${appName.charAt(0).toUpperCase() + appName.slice(1)}Store, use${appName.charAt(0).toUpperCase() + appName.slice(1)}Loading, use${appName.charAt(0).toUpperCase() + appName.slice(1)}Error } from './${appName}';
export { useThemeStore } from './theme';
export { useUIStore } from './ui';
`;
    }

    async setupDependencies() {
        console.log('\n📦 Setting up dependencies...');
        
        for (const appName of this.targetApps) {
            const appPath = path.join(this.workspaceRoot, 'apps', appName);
            
            if (!fs.existsSync(appPath)) {
                console.log(`⚠️  Skipping ${appName} - app not found`);
                continue;
            }
            
            console.log(`📦 Setting up dependencies for ${appName}...`);
            
            try {
                // Check if Zustand is already installed
                const packageJsonPath = path.join(appPath, 'package.json');
                if (fs.existsSync(packageJsonPath)) {
                    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
                    
                    if (!packageJson.dependencies?.zustand) {
                        // Install Zustand and middleware
                        execSync('pnpm add zustand immer', { cwd: appPath, stdio: 'inherit' });
                        console.log(`✅ Installed Zustand for ${appName}`);
                    } else {
                        console.log(`✅ Zustand already installed for ${appName}`);
                    }
                } else {
                    console.log(`⚠️  No package.json found for ${appName}`);
                }
                
            } catch (error) {
                console.error(`❌ Failed to setup dependencies for ${appName}:`, error.message);
            }
        }
    }

    async generateMigrationGuide() {
        console.log('\n📚 Generating migration guide...');
        
        const guideContent = `# State Management Migration Guide
        
## Overview
This guide helps you migrate from useState patterns to modern Zustand stores.

## Migration Steps

### 1. Replace useState with Zustand hooks

**Before (useState):**
\`\`\`tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [data, setData] = useState(null);
\`\`\`

**After (Zustand):**
\`\`\`tsx
import { useMemoraiStore } from '@/stores';

// Use selectors for optimized re-renders
const loading = useMemoraiStore(state => state.isLoading);
const error = useMemoraiStore(state => state.error);
const setLoading = useMemoraiStore(state => state.setLoading);
const setError = useMemoraiStore(state => state.setError);

// Or use the convenience hooks
const loading = useMemoraiLoading();
const error = useMemoraiError();
\`\`\`

### 2. Update component patterns

**Before:**
\`\`\`tsx
useEffect(() => {
  setLoading(true);
  fetchData()
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);
\`\`\`

**After:**
\`\`\`tsx
useEffect(() => {
  setLoading(true);
  fetchData()
    .then((data) => {
      // Store data in Zustand
      setData(data);
    })
    .catch(setError)
    .finally(() => setLoading(false));
}, []);
\`\`\`

### 3. Cross-component state sharing

With Zustand, state is automatically shared across components without prop drilling:

\`\`\`tsx
// Any component can access the same state
const Component1 = () => {
  const error = useMemoraiError();
  return error ? <ErrorDisplay error={error} /> : null;
};

const Component2 = () => {
  const setError = useMemoraiStore(state => state.setError);
  return <Button onClick={() => setError('Something went wrong')} />;
};
\`\`\`

## Apps Analysis Results:

${Object.entries(this.analysisResults).map(([app, analysis]) => `
### ${app.charAt(0).toUpperCase() + app.slice(1)}
- **useState count**: ${analysis.useStateCount}
- **Priority**: ${analysis.modernizationPriority}
- **Has Zustand**: ${analysis.hasZustand ? 'Yes' : 'No'}
- **State patterns found**: ${analysis.statePatterns.join(', ') || 'None detected'}
`).join('')}

## Testing Migration

1. Start with low-complexity components
2. Test each component after migration
3. Use React Developer Tools to verify state updates
4. Check that persistence works correctly

## Performance Benefits

- Automatic re-render optimization with selectors
- Better TypeScript integration
- Smaller bundle size compared to Redux
- Built-in persistence and middleware support

## Next Steps

1. Run the created stores in your applications
2. Gradually migrate useState patterns to Zustand
3. Add proper TypeScript types to generated stores
4. Test thoroughly in development
5. Consider adding more middleware as needed (devtools, subscriptions)
`;
        
        const guidePath = path.join(this.workspaceRoot, 'STATE_MANAGEMENT_MIGRATION_GUIDE.md');
        fs.writeFileSync(guidePath, guideContent);
        console.log('✅ Created migration guide: STATE_MANAGEMENT_MIGRATION_GUIDE.md');
    }

    printSummary() {
        const total = Object.keys(this.analysisResults).length;
        const high = Object.values(this.analysisResults).filter(a => a.modernizationPriority === 'HIGH').length;
        const medium = Object.values(this.analysisResults).filter(a => a.modernizationPriority === 'MEDIUM').length;
        const low = Object.values(this.analysisResults).filter(a => a.modernizationPriority === 'LOW').length;
        const totalUseState = Object.values(this.analysisResults).reduce((sum, a) => sum + a.useStateCount, 0);
        
        console.log(`📊 Analyzed ${total} applications`);
        console.log(`🔥 High priority: ${high}`);
        console.log(`⚡ Medium priority: ${medium}`);
        console.log(`✅ Low priority: ${low}`);
        console.log(`📈 Total useState patterns: ${totalUseState}`);
        console.log('\n🏪 Generated Zustand stores for all applications');
        console.log('📚 Created comprehensive migration guide');
        console.log('\n📝 Next: Review generated stores and start migrating components');
    }
}

// Run the modernization
if (require.main === module) {
    const modernizer = new StateManagementModernizer();
    modernizer.modernize().catch(console.error);
}

module.exports = StateManagementModernizer;
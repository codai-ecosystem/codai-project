#!/usr/bin/env node
/**
 * New Service Setup Script for Codai Ecosystem
 * Automatically configures TypeScript and development environment for new services
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ServiceSetup {
    constructor() {
        this.templates = {
            browser: {
                name: 'Next.js Browser Application',
                description: 'React-based web application with Next.js',
                dependencies: ['next', 'react', 'react-dom', '@types/react', '@types/react-dom']
            },
            node: {
                name: 'Node.js Service',
                description: 'Backend API service with Express',
                dependencies: ['express', '@types/express', '@types/node']
            },
            package: {
                name: 'Shared Package',
                description: 'Reusable library package',
                dependencies: ['@types/node']
            }
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '📝';
        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    async setupService(serviceName, serviceType, targetDir = null) {
        this.log(`🚀 Setting up new ${serviceType} service: ${serviceName}`, 'info');

        if (!this.templates[serviceType]) {
            throw new Error(`Unknown service type: ${serviceType}. Available: ${Object.keys(this.templates).join(', ')}`);
        }

        const template = this.templates[serviceType];
        this.log(`Using template: ${template.name}`, 'info');

        try {
            // Determine service directory
            const serviceDir = targetDir || this.getServiceDirectory(serviceName, serviceType);

            // Create service structure
            await this.createServiceStructure(serviceDir, serviceName, serviceType);

            // Setup TypeScript configuration
            await this.setupTypeScriptConfig(serviceDir, serviceType);

            // Create package.json
            await this.createPackageJson(serviceDir, serviceName, serviceType);

            // Create basic source files
            await this.createSourceFiles(serviceDir, serviceName, serviceType);

            // Setup development tools
            await this.setupDevelopmentTools(serviceDir, serviceType);

            // Generate documentation
            await this.generateDocumentation(serviceDir, serviceName, serviceType);

            this.log(`✅ Service ${serviceName} setup completed successfully!`, 'success');
            this.printNextSteps(serviceName, serviceDir, serviceType);

        } catch (error) {
            this.log(`Error setting up service: ${error.message}`, 'error');
            throw error;
        }
    }

    getServiceDirectory(serviceName, serviceType) {
        const rootDir = process.cwd();

        switch (serviceType) {
            case 'browser':
                return path.join(rootDir, 'apps', serviceName);
            case 'node':
                return path.join(rootDir, 'apps', serviceName);
            case 'package':
                return path.join(rootDir, 'packages', serviceName);
            default:
                return path.join(rootDir, 'services', serviceName);
        }
    }

    async createServiceStructure(serviceDir, serviceName, serviceType) {
        this.log(`📁 Creating directory structure...`, 'info');

        // Create main directory
        if (!fs.existsSync(serviceDir)) {
            fs.mkdirSync(serviceDir, { recursive: true });
        }

        // Create standard directories
        const directories = ['src'];

        if (serviceType === 'browser') {
            directories.push('src/components', 'src/pages', 'src/lib', 'src/utils', 'public');
        } else if (serviceType === 'node') {
            directories.push('src/routes', 'src/middleware', 'src/services', 'src/utils');
        } else if (serviceType === 'package') {
            directories.push('src/types', 'src/utils', 'tests');
        }

        directories.forEach(dir => {
            const dirPath = path.join(serviceDir, dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
            }
        });
    }

    async setupTypeScriptConfig(serviceDir, serviceType) {
        this.log(`⚙️ Setting up TypeScript configuration...`, 'info');

        let tsConfig;

        switch (serviceType) {
            case 'browser':
                tsConfig = {
                    "extends": "../../configs/tsconfig.browser.json",
                    "compilerOptions": {
                        "baseUrl": ".",
                        "paths": {
                            "@/*": ["./src/*"],
                            "@/components/*": ["./src/components/*"],
                            "@/lib/*": ["./src/lib/*"],
                            "@/utils/*": ["./src/utils/*"]
                        }
                    },
                    "include": [
                        "../../types/**/*",
                        "next-env.d.ts",
                        "**/*.ts",
                        "**/*.tsx",
                        ".next/types/**/*.ts"
                    ],
                    "exclude": [
                        "node_modules",
                        "dist",
                        "build",
                        ".next",
                        "coverage"
                    ]
                };
                break;

            case 'node':
                tsConfig = {
                    "extends": "../../configs/tsconfig.node.json",
                    "compilerOptions": {
                        "baseUrl": ".",
                        "rootDir": "./src",
                        "outDir": "./dist"
                    },
                    "include": [
                        "../../types/**/*",
                        "src/**/*"
                    ]
                };
                break;

            case 'package':
                tsConfig = {
                    "extends": "../../configs/tsconfig.package.json",
                    "compilerOptions": {
                        "baseUrl": ".",
                        "rootDir": "./src",
                        "outDir": "./dist"
                    },
                    "include": [
                        "../../types/**/*",
                        "src/**/*"
                    ]
                };
                break;
        }

        const tsConfigPath = path.join(serviceDir, 'tsconfig.json');
        fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));

        // Create next-env.d.ts for browser apps
        if (serviceType === 'browser') {
            const nextEnvPath = path.join(serviceDir, 'next-env.d.ts');
            const nextEnvContent = `/// <reference types="next" />
/// <reference types="next/image-types/global" />
/// <reference types="../../types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
`;
            fs.writeFileSync(nextEnvPath, nextEnvContent);
        }
    }

    async createPackageJson(serviceDir, serviceName, serviceType) {
        this.log(`📦 Creating package.json...`, 'info');

        const template = this.templates[serviceType];
        const packageJson = {
            "name": `@codai/${serviceName}`,
            "version": "0.1.0",
            "description": template.description,
            "main": serviceType === 'package' ? "dist/index.js" : "src/index.ts",
            "types": serviceType === 'package' ? "dist/index.d.ts" : undefined,
            "scripts": this.getScripts(serviceType),
            "dependencies": {},
            "devDependencies": {
                "typescript": "^5.0.0",
                "@types/node": "^20.0.0"
            },
            "keywords": ["codai", "ecosystem", serviceType],
            "author": "Codai Ecosystem",
            "license": "MIT",
            "publishConfig": {
                "access": "restricted"
            }
        };

        // Add type-specific dependencies
        template.dependencies.forEach(dep => {
            if (dep.startsWith('@types/')) {
                packageJson.devDependencies[dep] = '^20.0.0';
            } else {
                packageJson.dependencies[dep] = 'latest';
            }
        });

        const packageJsonPath = path.join(serviceDir, 'package.json');
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

    getScripts(serviceType) {
        const baseScripts = {
            "build": "tsc",
            "dev": "tsc --watch",
            "clean": "rm -rf dist",
            "type-check": "tsc --noEmit"
        };

        switch (serviceType) {
            case 'browser':
                return {
                    ...baseScripts,
                    "dev": "next dev",
                    "build": "next build",
                    "start": "next start",
                    "lint": "next lint"
                };

            case 'node':
                return {
                    ...baseScripts,
                    "dev": "tsx watch src/index.ts",
                    "start": "node dist/index.js",
                    "build": "tsc"
                };

            case 'package':
                return {
                    ...baseScripts,
                    "prepublishOnly": "npm run build",
                    "test": "jest"
                };

            default:
                return baseScripts;
        }
    }

    async createSourceFiles(serviceDir, serviceName, serviceType) {
        this.log(`📝 Creating source files...`, 'info');

        switch (serviceType) {
            case 'browser':
                await this.createBrowserSourceFiles(serviceDir, serviceName);
                break;
            case 'node':
                await this.createNodeSourceFiles(serviceDir, serviceName);
                break;
            case 'package':
                await this.createPackageSourceFiles(serviceDir, serviceName);
                break;
        }
    }

    async createBrowserSourceFiles(serviceDir, serviceName) {
        // Create Next.js app structure
        const appDir = path.join(serviceDir, 'src/app');
        fs.mkdirSync(appDir, { recursive: true });

        // Create layout.tsx
        const layoutContent = `import './globals.css'

export const metadata = {
  title: '${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} - Codai Platform',
  description: 'AI-native ${serviceName} service',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`;
        fs.writeFileSync(path.join(appDir, 'layout.tsx'), layoutContent);

        // Create page.tsx
        const pageContent = `export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}
          </h1>
          <p className="text-xl text-gray-600">
            AI-native ${serviceName} service powered by Codai
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold mb-2">Feature 1</h3>
            <p className="text-gray-600">
              Describe your first feature here.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold mb-2">Feature 2</h3>
            <p className="text-gray-600">
              Describe your second feature here.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-lg font-semibold mb-2">Feature 3</h3>
            <p className="text-gray-600">
              Describe your third feature here.
            </p>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-md">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
            </svg>
            System Status: Online
          </div>
        </div>
      </div>
    </div>
  )
}
`;
        fs.writeFileSync(path.join(appDir, 'page.tsx'), pageContent);

        // Create globals.css
        const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background: #f8fafc;
  min-height: 100vh;
}
`;
        fs.writeFileSync(path.join(appDir, 'globals.css'), cssContent);

        // Create next.config.js
        const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
}

module.exports = nextConfig
`;
        fs.writeFileSync(path.join(serviceDir, 'next.config.js'), nextConfigContent);
    }

    async createNodeSourceFiles(serviceDir, serviceName) {
        // Create main index.ts
        const indexContent = `import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: '${serviceName}',
    version: '0.1.0',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.get('/api/status', (req, res) => {
  res.json({
    message: '${serviceName} service is running',
    features: [
      'Feature 1',
      'Feature 2', 
      'Feature 3'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(\`🚀 ${serviceName} service running on port \${PORT}\`);
  console.log(\`📊 Health: http://localhost:\${PORT}/health\`);
  console.log(\`🔗 API: http://localhost:\${PORT}/api/status\`);
});

export default app;
`;
        fs.writeFileSync(path.join(serviceDir, 'src/index.ts'), indexContent);
    }

    async createPackageSourceFiles(serviceDir, serviceName) {
        // Create main index.ts
        const indexContent = `/**
 * ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} Package
 * Part of the Codai Ecosystem
 */

export interface ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}Config {
  // Define your configuration interface here
}

export class ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} {
  private config: ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}Config;

  constructor(config: ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}Config) {
    this.config = config;
  }

  // Add your methods here
  public getStatus(): string {
    return '${serviceName} package is ready';
  }
}

export default ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)};
`;
        fs.writeFileSync(path.join(serviceDir, 'src/index.ts'), indexContent);

        // Create types file
        const typesContent = `/**
 * Type definitions for ${serviceName} package
 */

export interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'unknown';
  lastCheck: Date;
  version: string;
}

export interface ServiceConfig {
  name: string;
  version: string;
  features: string[];
}

export type ServiceStatus = 'starting' | 'running' | 'stopping' | 'stopped' | 'error';
`;
        fs.writeFileSync(path.join(serviceDir, 'src/types.ts'), typesContent);
    }

    async setupDevelopmentTools(serviceDir, serviceType) {
        this.log(`🛠️ Setting up development tools...`, 'info');

        // Create .gitignore
        const gitignoreContent = `# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
.next/
out/

# Environment files
.env
.env.local
.env.production
.env.development

# IDE files
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Runtime data
pids/
*.pid
*.seed

# Coverage directory used by tools like istanbul
coverage/

# Test results
test-results/
playwright-report/

# Cache
.cache/
.turbo/

# Temporary files
tmp/
temp/
`;
        fs.writeFileSync(path.join(serviceDir, '.gitignore'), gitignoreContent);

        // Create .eslintrc.js for browser apps
        if (serviceType === 'browser') {
            const eslintContent = `module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Add custom rules here
  }
}
`;
            fs.writeFileSync(path.join(serviceDir, '.eslintrc.js'), eslintContent);

            // Create tailwind.config.js
            const tailwindContent = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
            fs.writeFileSync(path.join(serviceDir, 'tailwind.config.js'), tailwindContent);

            // Create postcss.config.js
            const postcssContent = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
            fs.writeFileSync(path.join(serviceDir, 'postcss.config.js'), postcssContent);
        }
    }

    async generateDocumentation(serviceDir, serviceName, serviceType) {
        this.log(`📚 Generating documentation...`, 'info');

        const readmeContent = `# ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)}

${this.templates[serviceType].description}

## 🚀 Getting Started

### Installation

\`\`\`bash
cd ${path.basename(serviceDir)}
pnpm install
\`\`\`

### Development

\`\`\`bash
pnpm dev
\`\`\`

### Building

\`\`\`bash
pnpm build
\`\`\`

## 📁 Project Structure

\`\`\`
${serviceName}/
├── src/                 # Source code
${serviceType === 'browser' ? '├── public/             # Static assets' : ''}
├── dist/                # Build output
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
\`\`\`

## 🛠️ Development

This service is part of the Codai ecosystem and follows our standardized development practices:

- **TypeScript**: Strict typing with ecosystem-wide type definitions
- **ESLint**: Code quality and consistency
${serviceType === 'browser' ? '- **Tailwind CSS**: Utility-first styling' : ''}
- **Testing**: Jest for unit tests, Playwright for E2E tests

## 🔧 Configuration

The service uses the standardized TypeScript configuration from \`configs/tsconfig.${serviceType}.json\`.

### Environment Variables

Create a \`.env.local\` file with:

\`\`\`env
# Add your environment variables here
\`\`\`

## 🧪 Testing

\`\`\`bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests (browser apps only)
pnpm test:e2e
\`\`\`

## 📊 Health Check

${serviceType === 'node' ? `The service provides a health check endpoint at \`/health\` that returns service status and version information.` : `Visit the application to see the service status dashboard.`}

## 🤝 Contributing

1. Follow the Codai ecosystem development guidelines
2. Ensure all TypeScript checks pass: \`pnpm type-check\`
3. Run tests before submitting: \`pnpm test\`
4. Follow conventional commit format

## 📝 License

Part of the Codai ecosystem - MIT License

---

Generated by Codai Service Setup v1.0.0
`;
        fs.writeFileSync(path.join(serviceDir, 'README.md'), readmeContent);
    }

    printNextSteps(serviceName, serviceDir, serviceType) {
        this.log('\n🎉 Service setup completed!', 'success');
        this.log('='.repeat(50), 'info');
        this.log('Next steps:', 'info');
        this.log(`1. cd ${path.relative(process.cwd(), serviceDir)}`, 'info');
        this.log('2. pnpm install', 'info');
        this.log('3. pnpm dev', 'info');
        this.log('', 'info');
        this.log('📚 Documentation:', 'info');
        this.log(`   - README.md: ${path.join(serviceDir, 'README.md')}`, 'info');
        this.log(`   - TypeScript config: ${path.join(serviceDir, 'tsconfig.json')}`, 'info');
        this.log('', 'info');
        this.log('🔗 Integration:', 'info');
        this.log('   - Update projects.index.json to register the service', 'info');
        this.log('   - Add to orchestrator configuration if needed', 'info');
        this.log('', 'info');
        this.log(`🌟 Your ${serviceType} service "${serviceName}" is ready to use!`, 'success');
    }
}

// CLI interface
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log('Usage: node setup-new-service.js <service-name> <service-type> [target-dir]');
        console.log('');
        console.log('Service types:');
        console.log('  browser  - Next.js browser application');
        console.log('  node     - Node.js API service');
        console.log('  package  - Shared library package');
        console.log('');
        console.log('Examples:');
        console.log('  node setup-new-service.js my-api node');
        console.log('  node setup-new-service.js my-app browser');
        console.log('  node setup-new-service.js my-lib package');
        process.exit(1);
    }

    const [serviceName, serviceType, targetDir] = args;
    const setup = new ServiceSetup();

    setup.setupService(serviceName, serviceType, targetDir).catch(error => {
        console.error('Setup failed:', error.message);
        process.exit(1);
    });
}

module.exports = ServiceSetup;

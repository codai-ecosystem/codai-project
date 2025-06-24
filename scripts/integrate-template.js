#!/usr/bin/env node
/**
 * Codai Template Integration Script
 * Copies local metu-template to codai-ecosystem/templates repository
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Template configuration
const TEMPLATE_CONFIG = {
    name: 'web-app',
    description: 'Modern Next.js web application template with TypeScript, Tailwind CSS, and best practices',
    sourcePath: 'E:\\GitHub\\metu\\metu-template',
    targetRepo: 'https://github.com/codai-ecosystem/templates.git',
    category: 'web'
};

async function copyDirectory(source, target, excludePatterns = []) {
    console.log(`📁 Copying ${source} → ${target}`);

    try {
        const stats = await fs.stat(source);
        if (!stats.isDirectory()) {
            // Copy single file
            await fs.mkdir(path.dirname(target), { recursive: true });
            await fs.copyFile(source, target);
            return;
        }

        // Create target directory
        await fs.mkdir(target, { recursive: true });

        // Read source directory
        const items = await fs.readdir(source, { withFileTypes: true });

        for (const item of items) {
            const sourcePath = path.join(source, item.name);
            const targetPath = path.join(target, item.name);

            // Skip excluded patterns
            if (excludePatterns.some(pattern => {
                if (typeof pattern === 'string') {
                    return item.name === pattern;
                }
                return pattern.test(item.name);
            })) {
                console.log(`⏭️  Skipping ${item.name}`);
                continue;
            }

            if (item.isDirectory()) {
                await copyDirectory(sourcePath, targetPath, excludePatterns);
            } else {
                await fs.copyFile(sourcePath, targetPath);
                console.log(`📄 Copied ${item.name}`);
            }
        }
    } catch (error) {
        console.error(`❌ Error copying ${source}: ${error.message}`);
        throw error;
    }
}

async function createTemplateMetadata(templatePath) {
    const metadata = {
        name: TEMPLATE_CONFIG.name,
        description: TEMPLATE_CONFIG.description,
        category: TEMPLATE_CONFIG.category,
        version: "1.0.0",
        author: "Codai Team",
        license: "MIT",
        created: new Date().toISOString(),
        tags: ["nextjs", "typescript", "tailwindcss", "react", "web-app"],
        framework: "Next.js",
        language: "TypeScript",
        styling: "Tailwind CSS",
        features: [
            "Next.js 14 with App Router",
            "TypeScript configuration",
            "Tailwind CSS styling",
            "ESLint and Prettier setup",
            "Responsive design ready",
            "SEO optimized",
            "PWA ready",
            "Modern development tooling"
        ],
        requirements: {
            node: ">=18.0.0",
            packageManager: "pnpm"
        },
        structure: {
            "src/": "Source code directory",
            "src/app/": "Next.js app directory (App Router)",
            "src/components/": "Reusable React components",
            "src/lib/": "Utility functions and configurations",
            "public/": "Static assets",
            "styles/": "Global styles and Tailwind configuration"
        },
        scripts: {
            setup: "Template setup and customization script",
            dev: "Start development server",
            build: "Build for production",
            start: "Start production server",
            lint: "Run ESLint",
            test: "Run tests"
        }
    };

    await fs.writeFile(
        path.join(templatePath, 'template.json'),
        JSON.stringify(metadata, null, 2)
    );

    console.log(`📋 Created template metadata`);
}

async function createTemplateReadme(templatePath) {
    const readme = `# ${TEMPLATE_CONFIG.name.charAt(0).toUpperCase() + TEMPLATE_CONFIG.name.slice(1)} Template

${TEMPLATE_CONFIG.description}

## Features

- ⚡ **Next.js 14** with App Router
- 🔷 **TypeScript** for type safety
- 🎨 **Tailwind CSS** for styling
- 🧩 **Component Library** ready
- 📱 **Responsive Design** built-in
- 🔍 **SEO Optimized** out of the box
- 🚀 **Performance Optimized**
- 🛠️ **Developer Experience** focused

## Quick Start

\`\`\`bash
# Create new project from this template
npx create-codai-app my-app --template web-app

# Or using the Codai CLI
codai create my-app --template web-app

# Navigate to project
cd my-app

# Install dependencies
pnpm install

# Start development server
pnpm dev
\`\`\`

## Project Structure

\`\`\`
${TEMPLATE_CONFIG.name}/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # Reusable components
│   │   ├── ui/             # UI components
│   │   └── layout/         # Layout components
│   ├── lib/                # Utility functions
│   │   ├── utils.ts        # General utilities
│   │   └── constants.ts    # Constants
│   └── styles/             # Additional styles
├── public/                 # Static assets
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
├── next.config.js         # Next.js configuration
└── README.md              # Project documentation
\`\`\`

## Configuration

### Environment Variables

Create a \`.env.local\` file in the root directory:

\`\`\`env
NEXT_PUBLIC_APP_NAME="My App"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
\`\`\`

### Tailwind CSS

The template includes a pre-configured Tailwind CSS setup with:
- Custom color palette
- Responsive breakpoints
- Component-friendly utilities
- Dark mode support ready

### TypeScript

Strict TypeScript configuration with:
- Path mapping for clean imports
- Strict type checking
- Modern ES features enabled

## Available Scripts

\`\`\`bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint errors
pnpm type-check   # Run TypeScript checks
pnpm format       # Format code with Prettier
\`\`\`

## Customization

### Adding Components

Components should be placed in \`src/components/\` and follow this structure:

\`\`\`typescript
// src/components/ui/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export function Button({ children, variant = 'primary', onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={\`btn btn-\${variant}\`}
    >
      {children}
    </button>
  );
}
\`\`\`

### Styling Guidelines

- Use Tailwind CSS utility classes
- Create component variants using CSS-in-JS or CSS modules
- Follow mobile-first responsive design
- Maintain consistent spacing and typography scales

## Integration with Codai Ecosystem

This template is designed to integrate seamlessly with the Codai ecosystem:

- **Authentication**: Ready for @codai/auth integration
- **API**: Configured for Codai API endpoints
- **Styling**: Consistent with Codai design system
- **Deployment**: Optimized for Codai hosting platforms

## Contributing

When contributing to this template:

1. Maintain compatibility with the Codai ecosystem
2. Follow established coding standards
3. Update documentation for any new features
4. Test template generation and setup process

## License

MIT License - see LICENSE file for details.

---

Generated by Codai Ecosystem Template System
`;

    await fs.writeFile(path.join(templatePath, 'README.md'), readme);
    console.log(`📖 Created template README`);
}

async function createTemplateSetupScript(templatePath) {
    const setupScript = `#!/usr/bin/env node
/**
 * Template Setup Script
 * Customizes the template for the new project
 */

const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function customizeTemplate() {
    console.log('🚀 Codai Web App Template Setup');
    console.log('================================\\n');
    
    // Get project details
    const projectName = await askQuestion('Project name: ');
    const projectDescription = await askQuestion('Project description: ');
    const authorName = await askQuestion('Author name: ');
    const authorEmail = await askQuestion('Author email: ');
    
    // Update package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    
    packageJson.name = projectName.toLowerCase().replace(/\\s+/g, '-');
    packageJson.description = projectDescription;
    packageJson.author = \`\${authorName} <\${authorEmail}>\`;
    
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    // Update README.md
    const readmePath = path.join(process.cwd(), 'README.md');
    let readme = await fs.readFile(readmePath, 'utf8');
    
    readme = readme.replace(/# .+ Template/, \`# \${projectName}\`);
    readme = readme.replace(/Modern Next.js web application template.*/, projectDescription);
    
    await fs.writeFile(readmePath, readme);
    
    // Create .env.local
    const envContent = \`NEXT_PUBLIC_APP_NAME="\${projectName}"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
\`;
    
    await fs.writeFile(path.join(process.cwd(), '.env.local'), envContent);
    
    console.log('\\n✅ Template setup complete!');
    console.log('\\n🔧 Next steps:');
    console.log('1. pnpm install');
    console.log('2. pnpm dev');
    console.log('3. Open http://localhost:3000');
    
    rl.close();
}

customizeTemplate().catch(console.error);
`;

    await fs.writeFile(path.join(templatePath, 'setup.js'), setupScript);
    await fs.chmod(path.join(templatePath, 'setup.js'), 0o755);
    console.log(`🔧 Created template setup script`);
}

async function updateTemplatesIndex(templatesDir) {
    const indexPath = path.join(templatesDir, 'templates.json');

    let index = {
        version: "1.0.0",
        updated: new Date().toISOString(),
        templates: []
    };

    // Read existing index if it exists
    try {
        const existing = await fs.readFile(indexPath, 'utf8');
        index = JSON.parse(existing);
    } catch (error) {
        // File doesn't exist, use default
    }

    // Add or update web-app template
    const templateEntry = {
        name: TEMPLATE_CONFIG.name,
        description: TEMPLATE_CONFIG.description,
        category: TEMPLATE_CONFIG.category,
        path: `templates/${TEMPLATE_CONFIG.name}`,
        framework: "Next.js",
        language: "TypeScript",
        featured: true,
        tags: ["nextjs", "typescript", "tailwindcss", "react", "web-app"],
        created: new Date().toISOString(),
        updated: new Date().toISOString()
    };

    // Remove existing entry if it exists
    index.templates = index.templates.filter(t => t.name !== TEMPLATE_CONFIG.name);

    // Add new entry
    index.templates.push(templateEntry);

    // Update index metadata
    index.updated = new Date().toISOString();
    index.totalTemplates = index.templates.length;

    await fs.writeFile(indexPath, JSON.stringify(index, null, 2));
    console.log(`📋 Updated templates index`);
}

async function createTemplatesReadme(templatesDir) {
    const readme = \`# Codai Ecosystem Templates

Official template collection for the Codai ecosystem, providing production-ready starting points for various types of applications and services.

## Available Templates

### Web Applications
- **web-app** - Modern Next.js web application with TypeScript and Tailwind CSS

## Usage

### Using Codai CLI (Recommended)
\\\`\\\`\\\`bash
# Install Codai CLI
npm install -g @codai/cli

# Create new project
codai create my-project --template web-app
\\\`\\\`\\\`

### Using npx
\\\`\\\`\\\`bash
npx create-codai-app my-project --template web-app
\\\`\\\`\\\`

### Manual Clone
\\\`\\\`\\\`bash
git clone https://github.com/codai-ecosystem/templates.git
cp -r templates/web-app my-project
cd my-project
node setup.js
\\\`\\\`\\\`

## Template Structure

Each template follows this structure:
\\\`\\\`\\\`
template-name/
├── template.json          # Template metadata
├── README.md             # Template documentation  
├── setup.js              # Setup and customization script
└── [template files...]   # Actual template content
\\\`\\\`\\\`

## Contributing Templates

1. Create your template in the \\\`templates/\\\` directory
2. Include \\\`template.json\\\` with metadata
3. Add comprehensive \\\`README.md\\\`
4. Create \\\`setup.js\\\` for customization
5. Update \\\`templates.json\\\` index
6. Submit pull request

### Template Requirements

- ✅ Production-ready code quality
- ✅ Comprehensive documentation
- ✅ Setup automation
- ✅ Codai ecosystem integration
- ✅ Modern development practices
- ✅ Security best practices

## License

MIT License - Individual templates may have additional licenses.

---

Generated by Codai Ecosystem Template System
\`;
    
    await fs.writeFile(path.join(templatesDir, 'README.md'), readme);
    console.log(\`📖 Created templates repository README\`);
}

async function main() {
    console.log('🚀 CODAI TEMPLATE INTEGRATION');
    console.log('=============================\\n');
    
    const tempDir = 'temp-templates';
    const templatesDir = path.join(tempDir, 'templates', TEMPLATE_CONFIG.name);
    
    try {
        // Check if source template exists
        try {
            await fs.access(TEMPLATE_CONFIG.sourcePath);
            console.log(\`✅ Source template found: \${TEMPLATE_CONFIG.sourcePath}\`);
        } catch (error) {
            console.error(\`❌ Source template not found: \${TEMPLATE_CONFIG.sourcePath}\`);
            console.log('\\n🔧 Please ensure the metu-template directory exists and is accessible.');
            return;
        }
        
        // Create templates directory structure
        await fs.mkdir(templatesDir, { recursive: true });
        
        // Copy template files (excluding node_modules, .git, etc.)
        const excludePatterns = [
            'node_modules',
            '.git',
            '.next',
            'dist',
            'build',
            '.env.local',
            '.env.*.local',
            /\\.log$/,
            /\\.cache$/
        ];
        
        console.log(\`\\n📦 Copying template files...\`);
        await copyDirectory(TEMPLATE_CONFIG.sourcePath, templatesDir, excludePatterns);
        
        // Create template metadata and documentation
        console.log(\`\\n📋 Creating template metadata...\`);
        await createTemplateMetadata(templatesDir);
        await createTemplateReadme(templatesDir);
        await createTemplateSetupScript(templatesDir);
        
        // Update templates index
        console.log(\`\\n📚 Updating templates index...\`);
        await updateTemplatesIndex(tempDir);
        await createTemplatesReadme(tempDir);
        
        // Git operations
        console.log(\`\\n🔄 Committing to repository...\`);
        process.chdir(tempDir);
        
        execSync('git add .', { stdio: 'inherit' });
        execSync(\`git commit -m "Add web-app template

✅ Complete Next.js web application template
📦 TypeScript + Tailwind CSS + Best practices  
🚀 Production-ready with setup automation
🔧 Codai ecosystem integration ready

Features:
- Next.js 14 with App Router
- TypeScript configuration
- Tailwind CSS styling  
- ESLint and Prettier setup
- Responsive design ready
- SEO optimized
- Setup automation script
- Comprehensive documentation"\`, { stdio: 'inherit' });
        
        execSync('git push origin main', { stdio: 'inherit' });
        
        console.log(\`\\n✅ Template integration complete!\`);
        console.log(\`\\n🎉 The web-app template is now available at:\`);
        console.log(\`   https://github.com/codai-ecosystem/templates\`);
        
        // Cleanup
        process.chdir('..');
        execSync(\`rmdir /s /q "\${tempDir}"\`, { stdio: 'ignore' });
        
    } catch (error) {
        console.error(\`❌ Template integration failed: \${error.message}\`);
        
        // Cleanup on failure
        try {
            process.chdir('..');
            execSync(\`rmdir /s /q "\${tempDir}"\`, { stdio: 'ignore' });
        } catch (cleanupError) {
            // Ignore cleanup errors
        }
        
        process.exit(1);
    }
}

// Run the integration
main().catch(error => {
    console.error('❌ Template integration failed:', error);
    process.exit(1);
});

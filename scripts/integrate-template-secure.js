const fs = require('fs');
const path = require('path');

console.log('🚀 CODAI TEMPLATE INTEGRATION (SECURE)');
console.log('=============================');

const sourcePath = 'E:\\GitHub\\metu\\metu-template';
const templatesRepoPath = 'temp-templates';
const templateName = 'web-app';
const templateDestPath = path.join(templatesRepoPath, 'templates', templateName);

// Check source template exists
if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Source template not found: ${sourcePath}`);
    process.exit(1);
}

console.log(`✅ Source template found: ${sourcePath}`);

// Clone templates repository
const { execSync } = require('child_process');

try {
    if (fs.existsSync(templatesRepoPath)) {
        fs.rmSync(templatesRepoPath, { recursive: true, force: true });
    }

    console.log('📦 Cloning templates repository...');
    execSync(`git clone https://github.com/codai-ecosystem/templates.git ${templatesRepoPath}`, { stdio: 'inherit' });

    console.log('📦 Copying template files...');

    // Create templates directory if not exists
    const templatesDir = path.join(templatesRepoPath, 'templates');
    if (!fs.existsSync(templatesDir)) {
        fs.mkdirSync(templatesDir, { recursive: true });
    }

    // Function to copy directory recursively with exclusions and sanitization
    function copyDirectory(src, dest, level = 0) {
        const indent = '  '.repeat(level);
        const basename = path.basename(src);

        // Skip patterns
        const skipPatterns = [
            /node_modules/,
            /\.git$/,
            /\.next$/,
            /dist$/,
            /\.env\.local$/,
            /\.turbo.*\.log$/,
            /turbo-.*\.log$/
        ];

        if (skipPatterns.some(pattern => pattern.test(basename))) {
            console.log(`${indent}⏭️  Skipping ${basename}`);
            return;
        }

        if (fs.statSync(src).isDirectory()) {
            console.log(`${indent}📁 Copying ${src} → ${dest}`);
            if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
            }

            const items = fs.readdirSync(src);
            for (const item of items) {
                const srcPath = path.join(src, item);
                const destPath = path.join(dest, item);
                copyDirectory(srcPath, destPath, level + 1);
            }
        } else {
            console.log(`${indent}📄 Copied ${basename}`);
            let content = fs.readFileSync(src, 'utf8');

            // Sanitize Stripe secrets
            if (basename === '.env.example' || basename.endsWith('.js')) {
                content = content.replace(/sk_test_[a-zA-Z0-9]{24,}/g, 'sk_test_your_stripe_secret_key_here');
                content = content.replace(/pk_test_[a-zA-Z0-9]{24,}/g, 'pk_test_your_stripe_publishable_key_here');
            }

            fs.writeFileSync(dest, content);
        }
    }

    copyDirectory(sourcePath, templateDestPath);

    // Create template metadata
    console.log('📋 Creating template metadata...');
    const templateMetadata = {
        name: 'web-app',
        displayName: 'Web Application',
        description: 'Production-ready web application template with Next.js, TypeScript, and Tailwind CSS',
        version: '1.0.0',
        author: 'Codai Team',
        tags: ['nextjs', 'typescript', 'tailwind', 'web', 'fullstack'],
        features: [
            'Next.js 14 with App Router',
            'TypeScript for type safety',
            'Tailwind CSS for styling',
            'Component library ready',
            'Responsive design built-in',
            'SEO optimized out of the box',
            'Performance optimized',
            'Developer experience focused'
        ],
        framework: 'nextjs',
        language: 'typescript',
        category: 'web'
    };

    fs.writeFileSync(
        path.join(templateDestPath, 'template.json'),
        JSON.stringify(templateMetadata, null, 2)
    );
    console.log('📋 Created template metadata');

    // Create template README
    const templateReadme = `# Web Application Template

A production-ready web application template powered by Next.js, TypeScript, and Tailwind CSS.

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

# Or clone directly
git clone https://github.com/codai-ecosystem/templates.git
cd templates/web-app
pnpm install
pnpm dev
\`\`\`

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** Radix UI
- **State:** Zustand
- **Testing:** Jest + Playwright
- **Linting:** ESLint + Prettier
- **CI/CD:** GitHub Actions

## Project Structure

\`\`\`
web-app/
├── apps/
│   ├── web/          # Next.js frontend
│   └── backend/      # Fastify backend
├── packages/
│   ├── ui/           # Shared UI components
│   ├── utils/        # Shared utilities
│   └── config/       # Shared configurations
└── docs/             # Documentation
\`\`\`

## Getting Started

1. **Install dependencies:**
   \`\`\`bash
   pnpm install
   \`\`\`

2. **Start development:**
   \`\`\`bash
   pnpm dev
   \`\`\`

3. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

## Available Scripts

- \`pnpm dev\` - Start development servers
- \`pnpm build\` - Build for production
- \`pnpm test\` - Run tests
- \`pnpm lint\` - Lint and fix code
- \`pnpm type-check\` - Check TypeScript types

## Documentation

- [Getting Started](./docs/getting-started.md)
- [Deployment](./docs/deployment.md)
- [Contributing](./docs/contributing.md)

## License

MIT License - see [LICENSE](./LICENSE) for details.
`;

    fs.writeFileSync(path.join(templateDestPath, 'README.md'), templateReadme);
    console.log('📖 Created template README');

    // Update templates index
    console.log('📚 Updating templates index...');
    const templatesIndexPath = path.join(templatesRepoPath, 'templates.json');
    let templatesIndex = {};

    if (fs.existsSync(templatesIndexPath)) {
        templatesIndex = JSON.parse(fs.readFileSync(templatesIndexPath, 'utf8'));
    }

    templatesIndex.templates = templatesIndex.templates || [];

    // Remove existing web-app template if exists
    templatesIndex.templates = templatesIndex.templates.filter(t => t.name !== 'web-app');

    // Add new template
    templatesIndex.templates.push({
        name: 'web-app',
        displayName: 'Web Application',
        description: 'Production-ready web application template with Next.js, TypeScript, and Tailwind CSS',
        path: 'templates/web-app',
        framework: 'nextjs',
        language: 'typescript',
        category: 'web',
        tags: ['nextjs', 'typescript', 'tailwind', 'web', 'fullstack']
    });

    fs.writeFileSync(templatesIndexPath, JSON.stringify(templatesIndex, null, 2));
    console.log('📋 Updated templates index');

    // Create repository README
    const repoReadme = `# Codai Templates

A collection of production-ready templates for the Codai ecosystem.

## Available Templates

${templatesIndex.templates.map(t => `- **${t.displayName}** (\`${t.name}\`) - ${t.description}`).join('\\n')}

## Usage

\`\`\`bash
# Using create-codai-app
npx create-codai-app my-project --template template-name

# Or clone directly
git clone https://github.com/codai-ecosystem/templates.git
cd templates/template-name
\`\`\`

## Contributing

1. Fork this repository
2. Create your template in \`templates/your-template-name/\`
3. Add template metadata in \`template.json\`
4. Update \`templates.json\` index
5. Submit a pull request

## Template Structure

Each template should include:

- \`template.json\` - Template metadata
- \`README.md\` - Template documentation
- \`package.json\` - Dependencies and scripts
- Source code and configuration files

## License

MIT License - see individual templates for specific licenses.
`;

    fs.writeFileSync(path.join(templatesRepoPath, 'README.md'), repoReadme);
    console.log('📖 Created templates repository README');

    // Commit and push
    console.log('🔄 Committing to repository...');
    process.chdir(templatesRepoPath);

    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "Add web-app template (secure)"', { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });

    console.log('✅ Template integration completed successfully!');
    console.log('🌐 Template available at: https://github.com/codai-ecosystem/templates/tree/main/templates/web-app');

} catch (error) {
    console.error(`❌ Template integration failed: ${error.message}`);
    process.exit(1);
}

#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      resolve(answer);
    });
  });
}

async function createMetuProject() {
  console.log('🚀 Welcome to METU Template Generator!');
  console.log('');

  // Get project name
  const projectName = await askQuestion('Project name: ');
  if (!projectName) {
    console.error('❌ Project name is required');
    process.exit(1);
  }

  // Get project description
  const projectDescription = await askQuestion('Project description (optional): ');

  // Get author name
  const authorName = await askQuestion('Author name (optional): ');

  // Ask about features
  console.log('');
  console.log('🔧 Select features:');

  const useTypeScript = await askQuestion('Use TypeScript? (Y/n): ');
  const useTailwind = await askQuestion('Use Tailwind CSS? (Y/n): ');
  const useFirebase = await askQuestion('Use Firebase? (Y/n): ');
  const usePWA = await askQuestion('Enable PWA features? (Y/n): ');
  const useI18n = await askQuestion('Enable internationalization? (Y/n): ');
  const useAnalytics = await askQuestion('Enable analytics? (y/N): ');

  rl.close();

  const features = {
    typescript: useTypeScript.toLowerCase() !== 'n',
    tailwind: useTailwind.toLowerCase() !== 'n',
    firebase: useFirebase.toLowerCase() !== 'n',
    pwa: usePWA.toLowerCase() !== 'n',
    i18n: useI18n.toLowerCase() !== 'n',
    analytics: useAnalytics.toLowerCase() === 'y',
  };

  console.log('');
  console.log('🎯 Creating your project...');

  try {
    // Create project directory
    const projectPath = path.join(process.cwd(), projectName);

    if (fs.existsSync(projectPath)) {
      console.error(`❌ Directory ${projectName} already exists`);
      process.exit(1);
    }

    fs.mkdirSync(projectPath, { recursive: true }); // Clone the template
    console.log('📥 Downloading template...');

    // For testing purposes, copy from current directory if repository doesn't exist
    try {
      execSync(`git clone https://github.com/metu-org/metu-template.git ${projectPath}`, {
        stdio: 'inherit',
      });
    } catch (error) {
      console.log('🔄 Repository not found, copying from local template...');
      // Copy current directory excluding node_modules, .git, and build artifacts
      const currentDir = path.dirname(__dirname);
      const excludePatterns = [
        'node_modules',
        '.git',
        '.next',
        'dist',
        'build',
        'test-results',
        'playwright-report',
        '.turbo',
        '*.log',
      ];

      const copyCommand =
        process.platform === 'win32'
          ? `xcopy "${currentDir}" "${projectPath}" /E /I /H /Y /Q`
          : `cp -r "${currentDir}/." "${projectPath}"`;

      execSync(copyCommand, { stdio: 'inherit' });

      // Remove excluded directories from copied project
      excludePatterns.forEach(pattern => {
        const targetPath = path.join(projectPath, pattern);
        if (fs.existsSync(targetPath)) {
          fs.rmSync(targetPath, { recursive: true, force: true });
        }
      });
    }

    // Remove .git directory
    const gitPath = path.join(projectPath, '.git');
    if (fs.existsSync(gitPath)) {
      fs.rmSync(gitPath, { recursive: true, force: true });
    }

    // Update package.json with project details
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    packageJson.name = projectName;
    if (projectDescription) packageJson.description = projectDescription;
    if (authorName) packageJson.author = authorName;

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Update web app package.json
    const webPackageJsonPath = path.join(projectPath, 'apps', 'web', 'package.json');
    if (fs.existsSync(webPackageJsonPath)) {
      const webPackageJson = JSON.parse(fs.readFileSync(webPackageJsonPath, 'utf8'));
      webPackageJson.name = `${projectName}-web`;
      if (projectDescription) webPackageJson.description = projectDescription;
      fs.writeFileSync(webPackageJsonPath, JSON.stringify(webPackageJson, null, 2));
    }

    // Configure features based on user selection
    await configureFeatures(projectPath, features);

    // Install dependencies
    console.log('📦 Installing dependencies...');
    process.chdir(projectPath);
    execSync('pnpm install', { stdio: 'inherit' });

    // Initialize git repository
    console.log('🔧 Initializing git repository...');
    execSync('git init', { stdio: 'inherit' });
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "feat: initial commit from METU template"', { stdio: 'inherit' });

    console.log('');
    console.log('✅ Project created successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log(`   cd ${projectName}`);
    console.log('   pnpm dev');
    console.log('');
    console.log('🔗 Useful commands:');
    console.log('   pnpm dev       - Start development server');
    console.log('   pnpm build     - Build for production');
    console.log('   pnpm test      - Run tests');
    console.log('   pnpm lint      - Lint code');
    console.log('   pnpm type-check - Check TypeScript');
    console.log('');
    console.log('📚 Documentation: https://github.com/metu-org/metu-template');
  } catch (error) {
    console.error('❌ Error creating project:', error.message);
    process.exit(1);
  }
}

async function configureFeatures(projectPath, features) {
  // Configure Firebase
  if (!features.firebase) {
    console.log('🔧 Removing Firebase integration...');

    // Remove Firebase files
    const firebaseFiles = [
      'apps/web/firebase',
      'apps/web/src/lib/firebase.ts',
      'apps/web/src/lib/firebase-simple.ts',
      'apps/web/src/lib/firebase-new.ts',
      'apps/web/src/lib/firebase-minimal.ts',
      'apps/web/src/contexts/AuthContext.tsx',
      'apps/web/src/hooks/useAuth.ts',
      'apps/web/src/services/auth.ts',
      'apps/web/src/stores/auth.ts',
    ];

    firebaseFiles.forEach(file => {
      const fullPath = path.join(projectPath, file);
      if (fs.existsSync(fullPath)) {
        if (fs.statSync(fullPath).isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(fullPath);
        }
      }
    });

    // Remove Firebase dependencies from package.json
    const webPackageJsonPath = path.join(projectPath, 'apps', 'web', 'package.json');
    if (fs.existsSync(webPackageJsonPath)) {
      const webPackageJson = JSON.parse(fs.readFileSync(webPackageJsonPath, 'utf8'));
      delete webPackageJson.dependencies['firebase'];
      delete webPackageJson.dependencies['react-firebase-hooks'];
      fs.writeFileSync(webPackageJsonPath, JSON.stringify(webPackageJson, null, 2));
    }
  }

  // Configure PWA
  if (!features.pwa) {
    console.log('🔧 Removing PWA features...');

    const pwaFiles = [
      'apps/web/public/manifest.json',
      'apps/web/public/sw.js',
      'apps/web/src/components/pwa',
      'apps/web/src/hooks/usePWA.ts',
    ];

    pwaFiles.forEach(file => {
      const fullPath = path.join(projectPath, file);
      if (fs.existsSync(fullPath)) {
        if (fs.statSync(fullPath).isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(fullPath);
        }
      }
    });
  }

  // Configure i18n
  if (!features.i18n) {
    console.log('🔧 Removing internationalization...');

    const i18nFiles = [
      'apps/web/locales',
      'apps/web/src/components/i18n',
      'apps/web/src/contexts/I18nContext.tsx',
      'apps/web/src/hooks/useI18n.ts',
      'apps/web/src/types/i18n.ts',
    ];

    i18nFiles.forEach(file => {
      const fullPath = path.join(projectPath, file);
      if (fs.existsSync(fullPath)) {
        if (fs.statSync(fullPath).isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(fullPath);
        }
      }
    });
  }

  // Configure Tailwind CSS
  if (!features.tailwind) {
    console.log('🔧 Removing Tailwind CSS...');

    const tailwindFiles = ['apps/web/tailwind.config.ts', 'apps/web/postcss.config.mjs'];

    tailwindFiles.forEach(file => {
      const fullPath = path.join(projectPath, file);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    // Remove Tailwind dependencies
    const webPackageJsonPath = path.join(projectPath, 'apps', 'web', 'package.json');
    if (fs.existsSync(webPackageJsonPath)) {
      const webPackageJson = JSON.parse(fs.readFileSync(webPackageJsonPath, 'utf8'));
      delete webPackageJson.devDependencies['tailwindcss'];
      delete webPackageJson.devDependencies['autoprefixer'];
      delete webPackageJson.devDependencies['postcss'];
      fs.writeFileSync(webPackageJsonPath, JSON.stringify(webPackageJson, null, 2));
    }
  }

  // Configure TypeScript
  if (!features.typescript) {
    console.log('🔧 Converting to JavaScript...');

    // This would require more complex transformation
    // For now, we'll keep TypeScript as the default
    console.log('⚠️  TypeScript conversion not implemented yet. Keeping TypeScript.');
  }
}

// Run the CLI
createMetuProject().catch(console.error);

#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const servicesDir = 'services';

// Service configurations for missing files
const serviceConfigs = {
  logai: { port: 3002, type: 'Identity & Authentication Hub', priority: 1 },
  bancai: { port: 3003, type: 'Financial Platform', priority: 2 },
  wallet: { port: 3004, type: 'Programmable Wallet', priority: 2 },
  fabricai: { port: 3005, type: 'AI Services Platform', priority: 2 },
  sociai: { port: 3006, type: 'Social Platform', priority: 3 },
  cumparai: { port: 3007, type: 'Shopping Platform', priority: 3 },
  x: { port: 3008, type: 'Trading Platform', priority: 4 },
  codai: { port: 3000, type: 'Central Platform & AIDE Hub', priority: 1 },
  studiai: { port: 3001, type: 'Education Platform', priority: 3 },
};

function createVSCodeSettings(serviceName, config) {
  return {
    'typescript.preferences.noSemicolons': 'off',
    'editor.codeActionsOnSave': {
      'source.fixAll.eslint': 'explicit',
    },
    'editor.formatOnSave': true,
    'editor.defaultFormatter': 'esbenp.prettier-vscode',
    'emmet.includeLanguages': {
      typescript: 'html',
    },
    'files.associations': {
      '*.css': 'tailwindcss',
    },
    'tailwindCSS.includeLanguages': {
      typescript: 'html',
      typescriptreact: 'html',
    },
    'search.exclude': {
      '**/node_modules': true,
      '**/.next': true,
      '**/dist': true,
      '**/.turbo': true,
    },
  };
}

function createVSCodeTasks(serviceName, config) {
  return {
    version: '2.0.0',
    tasks: [
      {
        type: 'shell',
        label: `${serviceName}: Install Dependencies`,
        command: 'pnpm',
        args: ['install'],
        group: 'build',
        options: {
          cwd: '${workspaceFolder}',
        },
        problemMatcher: [],
      },
      {
        type: 'shell',
        label: `${serviceName}: Start Development`,
        command: 'pnpm',
        args: ['dev'],
        group: 'build',
        isBackground: true,
        options: {
          cwd: '${workspaceFolder}',
        },
        problemMatcher: {
          owner: 'typescript',
          source: 'ts',
          applyTo: 'closedDocuments',
          fileLocation: ['relative', '${workspaceFolder}'],
          pattern: {
            regexp: '\\\\b(ERROR|WARNING|INFO)\\\\b',
            severity: 1,
          },
          background: {
            activeOnStart: true,
            beginsPattern: '.*server.*started.*',
            endsPattern: '.*compiled.*successfully.*',
          },
        },
      },
      {
        type: 'shell',
        label: `${serviceName}: Build Production`,
        command: 'pnpm',
        args: ['build'],
        group: 'build',
        options: {
          cwd: '${workspaceFolder}',
        },
        problemMatcher: ['$tsc'],
      },
      {
        type: 'shell',
        label: `${serviceName}: Run Tests`,
        command: 'pnpm',
        args: ['test'],
        group: 'test',
        options: {
          cwd: '${workspaceFolder}',
        },
        problemMatcher: [],
      },
      {
        type: 'shell',
        label: `${serviceName}: Type Check`,
        command: 'pnpm',
        args: ['type-check'],
        group: 'build',
        options: {
          cwd: '${workspaceFolder}',
        },
        problemMatcher: ['$tsc'],
      },
    ],
  };
}

function createVSCodeLaunch(serviceName, config) {
  return {
    version: '0.2.0',
    configurations: [
      {
        name: `Debug ${serviceName}`,
        type: 'node',
        request: 'launch',
        program: '${workspaceFolder}/node_modules/.bin/next',
        args: ['dev', '-p', config.port.toString()],
        cwd: '${workspaceFolder}',
        runtimeExecutable: 'node',
        skipFiles: ['<node_internals>/**'],
        env: {
          NODE_ENV: 'development',
        },
      },
      {
        name: `Attach to ${serviceName}`,
        type: 'node',
        request: 'attach',
        port: 9229,
        skipFiles: ['<node_internals>/**'],
      },
    ],
  };
}

function createCopilotInstructions(serviceName, config) {
  return `# ${serviceName.charAt(0).toUpperCase() + serviceName.slice(1)} Service - Copilot Instructions

## Service Overview

**${config.type}** - Priority ${config.priority} service in the Codai Ecosystem

- **Domain**: ${serviceName}.ro (or subdomain)
- **Port**: ${config.port}
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS

## Development Context

This is a ${config.type.toLowerCase()} service that is part of the larger Codai ecosystem. The service should:

1. **Follow Codai Design System**: Use consistent UI patterns and components
2. **Integrate with Core Services**: Connect with memorai (memory), logai (auth), and codai (central)
3. **Maintain Performance**: Optimize for fast loading and responsive interactions
4. **Ensure Accessibility**: Follow WCAG guidelines and semantic HTML

## Code Style & Patterns

### TypeScript
- Use strict TypeScript configuration
- Define proper interfaces and types
- Prefer type inference where possible
- Use generic types for reusable components

### React/Next.js
- Use functional components with hooks
- Implement proper error boundaries
- Use Next.js App Router (app/ directory)
- Optimize images with next/image
- Implement proper SEO with metadata

### Styling
- Use Tailwind CSS utilities
- Create reusable component classes
- Follow mobile-first responsive design
- Use CSS variables for theming

### File Organization
\`\`\`
${serviceName}/
├── app/                 # Next.js App Router
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # Reusable UI components
├── lib/               # Utility functions
├── types/             # TypeScript definitions
└── public/            # Static assets
\`\`\`

## API Integration

When integrating with other Codai services:

1. **Authentication**: Use LogAI for user authentication
2. **Memory/State**: Use MemorAI for persistent data
3. **Core Features**: Leverage Codai central platform APIs

## Testing

- Write unit tests for utilities and components
- Use Vitest for testing framework
- Test user interactions and edge cases
- Maintain good test coverage

## Performance

- Implement code splitting
- Use React.lazy for dynamic imports
- Optimize bundle size
- Monitor Core Web Vitals

## Deployment

- Build optimized for production
- Use environment variables for configuration
- Implement proper error logging
- Set up health checks

## AI-Specific Considerations

As an AI-native service:
- Implement proper loading states for AI operations
- Handle async AI responses gracefully
- Provide meaningful error messages
- Consider progressive enhancement for AI features

---

**Remember**: This service is part of a larger ecosystem. Always consider how changes might affect other services and maintain consistency across the platform.
`;
}

function createEnvExample(serviceName, config) {
  return `# ${serviceName.toUpperCase()} SERVICE ENVIRONMENT VARIABLES

# Application
NODE_ENV=development
PORT=${config.port}
NEXT_PUBLIC_APP_NAME="${config.type}"
NEXT_PUBLIC_APP_URL=http://localhost:${config.port}

# Database (if needed)
# DATABASE_URL=
# POSTGRES_URL=

# Authentication (LogAI integration)
# LOGAI_API_URL=http://localhost:3002
# LOGAI_API_KEY=

# Memory (MemorAI integration)
# MEMORAI_API_URL=http://localhost:3001
# MEMORAI_API_KEY=

# External APIs
# OPENAI_API_KEY=
# ANTHROPIC_API_KEY=

# Monitoring & Analytics
# SENTRY_DSN=
# GA_TRACKING_ID=

# Feature Flags
# ENABLE_AI_FEATURES=true
# ENABLE_EXPERIMENTAL=false
`;
}

async function addMissingFiles(serviceName, config) {
  const servicePath = path.join(servicesDir, serviceName);

  if (!fs.existsSync(servicePath)) {
    console.log(`❌ Service ${serviceName} does not exist`);
    return;
  }

  console.log(`\n🔧 Adding missing files to ${serviceName}...`);

  // Create .vscode directory if it doesn't exist
  const vscodePath = path.join(servicePath, '.vscode');
  if (!fs.existsSync(vscodePath)) {
    fs.mkdirSync(vscodePath, { recursive: true });
  }

  // Add VS Code settings
  const settingsPath = path.join(vscodePath, 'settings.json');
  if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(
      settingsPath,
      JSON.stringify(createVSCodeSettings(serviceName, config), null, 2)
    );
    console.log(`  ✅ Created .vscode/settings.json`);
  }

  // Add VS Code tasks
  const tasksPath = path.join(vscodePath, 'tasks.json');
  if (!fs.existsSync(tasksPath)) {
    fs.writeFileSync(
      tasksPath,
      JSON.stringify(createVSCodeTasks(serviceName, config), null, 2)
    );
    console.log(`  ✅ Created .vscode/tasks.json`);
  }

  // Add VS Code launch config
  const launchPath = path.join(vscodePath, 'launch.json');
  if (!fs.existsSync(launchPath)) {
    fs.writeFileSync(
      launchPath,
      JSON.stringify(createVSCodeLaunch(serviceName, config), null, 2)
    );
    console.log(`  ✅ Created .vscode/launch.json`);
  }

  // Add copilot instructions
  const copilotPath = path.join(servicePath, 'copilot-instructions.md');
  if (!fs.existsSync(copilotPath)) {
    fs.writeFileSync(
      copilotPath,
      createCopilotInstructions(serviceName, config)
    );
    console.log(`  ✅ Created copilot-instructions.md`);
  }

  // Add .env.example
  const envPath = path.join(servicePath, '.env.example');
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, createEnvExample(serviceName, config));
    console.log(`  ✅ Created .env.example`);
  }
}

// Main execution
console.log('🛠️  ADDING MISSING CONFIGURATION FILES');
console.log('======================================');

for (const [serviceName, config] of Object.entries(serviceConfigs)) {
  await addMissingFiles(serviceName, config);
}

console.log('\n🎉 Configuration files update complete!');
console.log('\nAdded files:');
console.log('- .vscode/settings.json (VS Code workspace settings)');
console.log('- .vscode/tasks.json (Build and development tasks)');
console.log('- .vscode/launch.json (Debugging configuration)');
console.log('- copilot-instructions.md (AI development guidance)');
console.log('- .env.example (Environment variables template)');

#!/usr/bin/env node

/**
 * BRUTAL REALITY CHECK - Comprehensive Implementation Verification
 * Tests every single app and service to validate completion claims
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

const APPS_DIR = './apps';
const SERVICES_DIR = './services';

// Expected business domains for each app
const EXPECTED_DOMAINS = {
  bancai: {
    type: 'banking',
    expectedModels: ['Account', 'Transaction', 'Customer', 'KYCDocument', 'CreditApplication', 'Card'],
    expectedApis: ['accounts', 'transactions', 'customers', 'kyc', 'cards']
  },
  logai: {
    type: 'identity',
    expectedModels: ['User', 'Identity', 'Role', 'Permission', 'Session', 'AuditLog'],
    expectedApis: ['auth', 'users', 'roles', 'permissions', 'sessions']
  },
  memorai: {
    type: 'ai-memory',
    expectedModels: ['Memory', 'Agent', 'MemorySession', 'MemoryEmbedding', 'MemoryRetrieval'],
    expectedApis: ['memory', 'agents', 'search', 'context']
  },
  wallet: {
    type: 'crypto',
    expectedModels: ['Wallet', 'Asset', 'Transaction', 'SmartContract', 'DeFiPosition', 'NFT'],
    expectedApis: ['wallets', 'assets', 'transactions', 'smart-contracts', 'defi']
  },
  fabricai: {
    type: 'ai-services',
    expectedModels: ['AIProvider', 'AIModel', 'AIService', 'AIDeployment', 'APIKey'],
    expectedApis: ['providers', 'models', 'services', 'deployments']
  },
  x: {
    type: 'trading',
    expectedModels: ['Portfolio', 'Asset', 'Order', 'Trade', 'Position', 'TradingStrategy'],
    expectedApis: ['portfolio', 'orders', 'trades', 'strategies']
  },
  cumparai: {
    type: 'ecommerce',
    expectedModels: ['Store', 'Product', 'Order', 'Payment', 'Cart', 'AIRecommendation'],
    expectedApis: ['stores', 'products', 'orders', 'payments', 'recommendations']
  },
  sociai: {
    type: 'social',
    expectedModels: ['Post', 'Comment', 'Like', 'Follow', 'Group', 'Message'],
    expectedApis: ['posts', 'comments', 'social', 'groups', 'messages']
  },
  studiai: {
    type: 'education',
    expectedModels: ['Course', 'Lesson', 'Student', 'Progress', 'Assignment', 'Grade'],
    expectedApis: ['courses', 'lessons', 'students', 'assignments']
  },
  publicai: {
    type: 'ai-api',
    expectedModels: ['AIProvider', 'AIModel', 'APIRequest', 'Usage', 'Quota'],
    expectedApis: ['ai', 'providers', 'usage', 'requests']
  },
  codai: {
    type: 'platform',
    expectedModels: ['Project', 'Workspace', 'User', 'Collaboration'],
    expectedApis: ['projects', 'workspaces', 'collaboration']
  }
};

function analyzeSchema(schemaPath) {
  if (!existsSync(schemaPath)) {
    return { models: [], enums: [], hasModels: false };
  }

  try {
    const content = readFileSync(schemaPath, 'utf8');

    // Extract models
    const modelMatches = content.match(/model\s+(\w+)/g) || [];
    const models = modelMatches.map(match => match.replace('model ', ''));

    // Extract enums
    const enumMatches = content.match(/enum\s+(\w+)/g) || [];
    const enums = enumMatches.map(match => match.replace('enum ', ''));

    // Check for NextAuth basic models (indicates template)
    const hasNextAuthTemplate = models.includes('Account') &&
      models.includes('Session') &&
      models.includes('User') &&
      models.includes('VerificationToken');

    return {
      models,
      enums,
      hasModels: models.length > 0,
      isTemplate: hasNextAuthTemplate && models.length <= 8,
      totalModels: models.length
    };
  } catch (error) {
    return { models: [], enums: [], hasModels: false, error: error.message };
  }
}

function analyzeApis(apiPath) {
  if (!existsSync(apiPath)) {
    return { routes: [], hasApis: false };
  }

  try {
    function findRoutes(dir, routes = []) {
      const items = readdirSync(dir, { withFileTypes: true });

      for (const item of items) {
        const fullPath = join(dir, item.name);

        if (item.isDirectory()) {
          findRoutes(fullPath, routes);
        } else if (item.name === 'route.ts' || item.name === 'route.js') {
          // Extract route path from directory structure
          const routePath = fullPath
            .replace(apiPath, '')
            .replace(/[\\\/]route\.(ts|js)$/, '')
            .replace(/[\\\/]/g, '/')
            .replace(/^\//, '');

          if (routePath) {
            routes.push(routePath);
          }
        }
      }

      return routes;
    }

    const routes = findRoutes(apiPath);

    return {
      routes,
      hasApis: routes.length > 0,
      totalRoutes: routes.length
    };
  } catch (error) {
    return { routes: [], hasApis: false, error: error.message };
  }
}

function validateImplementation(appName, domain, appSchema, serviceSchema, appApis, serviceApis) {
  const validation = {
    appName,
    domain: domain.type,
    score: 0,
    maxScore: 100,
    issues: [],
    strengths: []
  };

  // Schema validation (40 points)
  const expectedModels = domain.expectedModels;
  const appModelsFound = expectedModels.filter(model =>
    appSchema.models.includes(model)
  );
  const serviceModelsFound = expectedModels.filter(model =>
    serviceSchema.models.includes(model)
  );

  const appModelScore = (appModelsFound.length / expectedModels.length) * 20;
  const serviceModelScore = (serviceModelsFound.length / expectedModels.length) * 20;

  validation.score += Math.max(appModelScore, serviceModelScore);

  if (appModelsFound.length === 0 && serviceModelsFound.length === 0) {
    validation.issues.push(`No domain-specific models found (expected: ${expectedModels.join(', ')})`);
  } else {
    validation.strengths.push(`Domain models: ${Math.max(appModelsFound.length, serviceModelsFound.length)}/${expectedModels.length}`);
  }

  // Template check (penalty)
  if (appSchema.isTemplate || serviceSchema.isTemplate) {
    validation.score -= 20;
    validation.issues.push('Using generic template instead of domain-specific implementation');
  }

  // API validation (30 points)
  const expectedApis = domain.expectedApis;
  const appApisFound = expectedApis.filter(api =>
    appApis.routes.some(route => route.includes(api))
  );
  const serviceApisFound = expectedApis.filter(api =>
    serviceApis.routes.some(route => route.includes(api))
  );

  const apiScore = Math.max(
    (appApisFound.length / expectedApis.length) * 30,
    (serviceApisFound.length / expectedApis.length) * 30
  );

  validation.score += apiScore;

  if (appApisFound.length === 0 && serviceApisFound.length === 0) {
    validation.issues.push(`No domain-specific APIs found (expected: ${expectedApis.join(', ')})`);
  } else {
    validation.strengths.push(`Domain APIs: ${Math.max(appApisFound.length, serviceApisFound.length)}/${expectedApis.length}`);
  }

  // Implementation completeness (30 points)
  const hasAppImplementation = appSchema.hasModels && appApis.hasApis;
  const hasServiceImplementation = serviceSchema.hasModels && serviceApis.hasApis;

  if (hasAppImplementation || hasServiceImplementation) {
    validation.score += 15;
    validation.strengths.push('Has implementation in ' +
      (hasAppImplementation && hasServiceImplementation ? 'both apps and services' :
        hasAppImplementation ? 'apps' : 'services'));
  } else {
    validation.issues.push('No complete implementation found');
  }

  // Business logic assessment
  const totalModels = Math.max(appSchema.totalModels, serviceSchema.totalModels);
  const totalRoutes = Math.max(appApis.totalRoutes, serviceApis.totalRoutes);

  if (totalModels >= 10 && totalRoutes >= 5) {
    validation.score += 15;
    validation.strengths.push('Comprehensive implementation');
  } else if (totalModels >= 5 && totalRoutes >= 3) {
    validation.score += 10;
    validation.strengths.push('Moderate implementation');
  } else {
    validation.issues.push('Minimal implementation');
  }

  return validation;
}

async function brutalRealityCheck() {
  console.log(chalk.red.bold('\n🔥 BRUTAL REALITY CHECK - Implementation Verification\n'));

  const results = [];
  const allApps = Object.keys(EXPECTED_DOMAINS);

  for (const appName of allApps) {
    console.log(chalk.yellow(`Analyzing ${appName}...`));

    const domain = EXPECTED_DOMAINS[appName];

    // Analyze schemas
    const appSchemaPath = join(APPS_DIR, appName, 'prisma', 'schema.prisma');
    const serviceSchemaPath = join(SERVICES_DIR, appName, 'prisma', 'schema.prisma');

    const appSchema = analyzeSchema(appSchemaPath);
    const serviceSchema = analyzeSchema(serviceSchemaPath);

    // Analyze APIs
    const appApiPath = join(APPS_DIR, appName, 'app', 'api');
    const serviceApiPath = join(SERVICES_DIR, appName, 'app', 'api');

    const appApis = analyzeApis(appApiPath);
    const serviceApis = analyzeApis(serviceApiPath);

    // Validate implementation
    const validation = validateImplementation(
      appName, domain, appSchema, serviceSchema, appApis, serviceApis
    );

    results.push({
      ...validation,
      appSchema,
      serviceSchema,
      appApis,
      serviceApis
    });
  }

  // Generate report
  console.log(chalk.blue.bold('\n📊 IMPLEMENTATION REPORT\n'));

  const sortedResults = results.sort((a, b) => b.score - a.score);

  let totalScore = 0;
  let maxTotalScore = 0;

  for (const result of sortedResults) {
    const scoreColor = result.score >= 80 ? 'green' :
      result.score >= 60 ? 'yellow' :
        result.score >= 40 ? 'yellow' : 'red';

    console.log(chalk[scoreColor].bold(`${result.appName.toUpperCase()}: ${result.score.toFixed(1)}/100`));
    console.log(chalk.gray(`  Domain: ${result.domain}`));

    if (result.strengths.length > 0) {
      console.log(chalk.green('  ✅ ' + result.strengths.join(', ')));
    }

    if (result.issues.length > 0) {
      console.log(chalk.red('  ❌ ' + result.issues.join(', ')));
    }

    console.log(chalk.gray(`  App: ${result.appSchema.totalModels || 0} models, ${result.appApis.totalRoutes || 0} routes`));
    console.log(chalk.gray(`  Service: ${result.serviceSchema.totalModels || 0} models, ${result.serviceApis.totalRoutes || 0} routes\n`));

    totalScore += result.score;
    maxTotalScore += result.maxScore;
  }

  const overallScore = (totalScore / maxTotalScore) * 100;
  const overallColor = overallScore >= 80 ? 'green' :
    overallScore >= 60 ? 'yellow' :
      overallScore >= 40 ? 'yellow' : 'red';

  console.log(chalk[overallColor].bold(`\n🎯 OVERALL ECOSYSTEM SCORE: ${overallScore.toFixed(1)}%\n`));

  // Categories
  const excellent = sortedResults.filter(r => r.score >= 80);
  const good = sortedResults.filter(r => r.score >= 60 && r.score < 80);
  const poor = sortedResults.filter(r => r.score < 60);

  console.log(chalk.green(`✅ EXCELLENT (80%+): ${excellent.map(r => r.appName).join(', ') || 'None'}`));
  console.log(chalk.yellow(`⚠️  GOOD (60-79%): ${good.map(r => r.appName).join(', ') || 'None'}`));
  console.log(chalk.red(`❌ POOR (<60%): ${poor.map(r => r.appName).join(', ') || 'None'}`));

  console.log(chalk.blue.bold('\n🔍 DETAILED FINDINGS:\n'));

  // Identify template vs real implementations
  const templates = sortedResults.filter(r => r.appSchema.isTemplate || r.serviceSchema.isTemplate);
  const realImplementations = sortedResults.filter(r => !r.appSchema.isTemplate && !r.serviceSchema.isTemplate && r.score >= 60);

  console.log(chalk.red(`📋 TEMPLATE IMPLEMENTATIONS: ${templates.map(r => r.appName).join(', ') || 'None'}`));
  console.log(chalk.green(`🚀 REAL IMPLEMENTATIONS: ${realImplementations.map(r => r.appName).join(', ') || 'None'}`));

  // Generate conclusions
  console.log(chalk.blue.bold('\n💡 CONCLUSIONS:\n'));

  if (overallScore >= 80) {
    console.log(chalk.green('✅ Ecosystem completion claims are VERIFIED'));
  } else if (overallScore >= 60) {
    console.log(chalk.yellow('⚠️  Ecosystem is PARTIALLY implemented'));
  } else {
    console.log(chalk.red('❌ Ecosystem completion claims are EXAGGERATED'));
  }

  console.log(chalk.gray(`\nReal implementations: ${realImplementations.length}/${allApps.length} apps`));
  console.log(chalk.gray(`Template scaffolds: ${templates.length}/${allApps.length} apps`));

  return {
    overallScore,
    results: sortedResults,
    excellent: excellent.length,
    good: good.length,
    poor: poor.length,
    realImplementations: realImplementations.length,
    templates: templates.length
  };
}

// Run the check
brutalRealityCheck().catch(console.error);

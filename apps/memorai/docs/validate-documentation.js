/**
 * MemorAI Documentation Validation
 * Validates generated documentation for completeness and accuracy
 */

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const { JSDOM } = require('jsdom');

class DocumentationValidator {
  constructor() {
    this.docsDir = './generated';
    this.validationResults = [];
    this.errors = [];
    this.warnings = [];
  }

  async validateAllDocumentation() {
    console.log('🔍 MemorAI Documentation Validation');
    console.log('===================================\n');

    try {
      // Check directory structure
      await this.validateDirectoryStructure();

      // Validate API documentation
      await this.validateAPIDocumentation();

      // Validate SDK documentation
      await this.validateSDKDocumentation();

      // Validate webhook documentation
      await this.validateWebhookDocumentation();

      // Validate GraphQL documentation
      await this.validateGraphQLDocumentation();

      // Validate user guides
      await this.validateUserGuides();

      // Validate links and references
      await this.validateLinks();

      // Validate code examples
      await this.validateCodeExamples();

      // Validate completeness
      await this.validateCompleteness();

      // Generate validation report
      this.generateValidationReport();

    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      this.errors.push(`Validation process failed: ${error.message}`);
    }
  }

  async validateDirectoryStructure() {
    console.log('📁 Validating directory structure...');

    const requiredDirs = [
      'api',
      'sdk',
      'webhook',
      'graphql',
      'guides',
      'tutorials',
      'assets',
      'postman'
    ];

    const requiredFiles = [
      'README.md',
      'CHANGELOG.md',
      'navigation.json'
    ];

    // Check directories
    for (const dir of requiredDirs) {
      const dirPath = path.join(this.docsDir, dir);
      if (await fs.pathExists(dirPath)) {
        this.addSuccess('Directory Structure', `Directory ${dir} exists`);
      } else {
        this.addError('Directory Structure', `Missing directory: ${dir}`);
      }
    }

    // Check files
    for (const file of requiredFiles) {
      const filePath = path.join(this.docsDir, file);
      if (await fs.pathExists(filePath)) {
        this.addSuccess('Directory Structure', `File ${file} exists`);
      } else {
        this.addError('Directory Structure', `Missing file: ${file}`);
      }
    }
  }

  async validateAPIDocumentation() {
    console.log('📖 Validating API documentation...');

    const apiDir = path.join(this.docsDir, 'api');

    // Check OpenAPI files
    const openApiFiles = ['openapi.json', 'openapi.yaml', 'index.html'];

    for (const file of openApiFiles) {
      const filePath = path.join(apiDir, file);

      if (await fs.pathExists(filePath)) {
        this.addSuccess('API Documentation', `${file} exists`);

        // Validate file content
        await this.validateAPIFile(filePath, file);
      } else {
        this.addError('API Documentation', `Missing ${file}`);
      }
    }
  }

  async validateAPIFile(filePath, fileName) {
    try {
      const content = await fs.readFile(filePath, 'utf8');

      switch (fileName) {
        case 'openapi.json':
          const jsonSpec = JSON.parse(content);
          if (jsonSpec.openapi && jsonSpec.info && jsonSpec.paths) {
            this.addSuccess('API Documentation', 'OpenAPI JSON is valid');
          } else {
            this.addError('API Documentation', 'OpenAPI JSON is malformed');
          }
          break;

        case 'openapi.yaml':
          if (content.includes('openapi:') && content.includes('info:') && content.includes('paths:')) {
            this.addSuccess('API Documentation', 'OpenAPI YAML structure is valid');
          } else {
            this.addError('API Documentation', 'OpenAPI YAML is malformed');
          }
          break;

        case 'index.html':
          if (content.includes('swagger-ui') && content.includes('openapi.yaml')) {
            this.addSuccess('API Documentation', 'Swagger UI HTML is properly configured');
          } else {
            this.addWarning('API Documentation', 'Swagger UI HTML may be misconfigured');
          }
          break;
      }
    } catch (error) {
      this.addError('API Documentation', `Error validating ${fileName}: ${error.message}`);
    }
  }

  async validateSDKDocumentation() {
    console.log('📦 Validating SDK documentation...');

    const sdkDir = path.join(this.docsDir, 'sdk');
    const readmePath = path.join(sdkDir, 'README.md');

    if (await fs.pathExists(readmePath)) {
      const content = await fs.readFile(readmePath, 'utf8');

      // Check for required sections
      const requiredSections = [
        'Installation',
        'Quick Start',
        'API Reference'
      ];

      for (const section of requiredSections) {
        if (content.includes(section)) {
          this.addSuccess('SDK Documentation', `Contains ${section} section`);
        } else {
          this.addError('SDK Documentation', `Missing ${section} section`);
        }
      }

      // Check for code examples
      const codeBlockCount = (content.match(/```/g) || []).length / 2;
      if (codeBlockCount >= 3) {
        this.addSuccess('SDK Documentation', `Contains ${codeBlockCount} code examples`);
      } else {
        this.addWarning('SDK Documentation', `Only ${codeBlockCount} code examples found`);
      }

    } else {
      this.addError('SDK Documentation', 'README.md not found');
    }
  }

  async validateWebhookDocumentation() {
    console.log('📡 Validating webhook documentation...');

    const webhookDir = path.join(this.docsDir, 'webhook');
    const readmePath = path.join(webhookDir, 'README.md');

    if (await fs.pathExists(readmePath)) {
      const content = await fs.readFile(readmePath, 'utf8');

      // Check for webhook-specific content
      const webhookElements = [
        'Event Types',
        'security',
        'signature',
        'memory.created',
        'search.performed'
      ];

      for (const element of webhookElements) {
        if (content.toLowerCase().includes(element.toLowerCase())) {
          this.addSuccess('Webhook Documentation', `Contains ${element} information`);
        } else {
          this.addError('Webhook Documentation', `Missing ${element} information`);
        }
      }

    } else {
      this.addError('Webhook Documentation', 'README.md not found');
    }
  }

  async validateGraphQLDocumentation() {
    console.log('🧬 Validating GraphQL documentation...');

    const graphqlDir = path.join(this.docsDir, 'graphql');
    const readmePath = path.join(graphqlDir, 'README.md');

    if (await fs.pathExists(readmePath)) {
      const content = await fs.readFile(readmePath, 'utf8');

      // Check for GraphQL-specific content
      const graphqlElements = [
        'Schema Overview',
        'Queries',
        'Mutations',
        'Subscriptions',
        'type Memory',
        'query',
        'mutation'
      ];

      for (const element of graphqlElements) {
        if (content.includes(element)) {
          this.addSuccess('GraphQL Documentation', `Contains ${element} information`);
        } else {
          this.addError('GraphQL Documentation', `Missing ${element} information`);
        }
      }

    } else {
      this.addError('GraphQL Documentation', 'README.md not found');
    }
  }

  async validateUserGuides() {
    console.log('📚 Validating user guides...');

    const guidesDir = path.join(this.docsDir, 'guides');

    if (await fs.pathExists(guidesDir)) {
      const files = await fs.readdir(guidesDir);
      const markdownFiles = files.filter(f => f.endsWith('.md'));

      if (markdownFiles.length > 0) {
        this.addSuccess('User Guides', `Found ${markdownFiles.length} guide files`);

        // Validate each guide
        for (const file of markdownFiles) {
          const filePath = path.join(guidesDir, file);
          const content = await fs.readFile(filePath, 'utf8');

          if (content.length > 500) {
            this.addSuccess('User Guides', `${file} has substantial content`);
          } else {
            this.addWarning('User Guides', `${file} content may be too short`);
          }
        }
      } else {
        this.addError('User Guides', 'No guide files found');
      }
    } else {
      this.addError('User Guides', 'Guides directory not found');
    }
  }

  async validateLinks() {
    console.log('🔗 Validating links and references...');

    const allMarkdownFiles = await this.findAllMarkdownFiles();
    let totalLinks = 0;
    let brokenLinks = 0;

    for (const filePath of allMarkdownFiles) {
      const content = await fs.readFile(filePath, 'utf8');
      const links = this.extractLinks(content);

      totalLinks += links.length;

      for (const link of links) {
        const isValid = await this.validateLink(link, filePath);
        if (!isValid) {
          brokenLinks++;
          this.addWarning('Link Validation', `Broken link in ${path.basename(filePath)}: ${link}`);
        }
      }
    }

    if (brokenLinks === 0) {
      this.addSuccess('Link Validation', `All ${totalLinks} links are valid`);
    } else {
      this.addError('Link Validation', `Found ${brokenLinks} broken links out of ${totalLinks} total`);
    }
  }

  async validateCodeExamples() {
    console.log('💻 Validating code examples...');

    const allMarkdownFiles = await this.findAllMarkdownFiles();
    let totalExamples = 0;
    let validExamples = 0;

    for (const filePath of allMarkdownFiles) {
      const content = await fs.readFile(filePath, 'utf8');
      const codeBlocks = this.extractCodeBlocks(content);

      totalExamples += codeBlocks.length;

      for (const codeBlock of codeBlocks) {
        if (this.validateCodeBlock(codeBlock)) {
          validExamples++;
        } else {
          this.addWarning('Code Examples', `Potentially invalid code in ${path.basename(filePath)}`);
        }
      }
    }

    if (totalExamples > 0) {
      const percentage = Math.round((validExamples / totalExamples) * 100);
      this.addSuccess('Code Examples', `${validExamples}/${totalExamples} code examples appear valid (${percentage}%)`);
    } else {
      this.addWarning('Code Examples', 'No code examples found in documentation');
    }
  }

  async validateCompleteness() {
    console.log('✅ Validating documentation completeness...');

    const expectedSections = {
      'API Documentation': ['openapi.json', 'openapi.yaml', 'index.html'],
      'SDK Documentation': ['README.md'],
      'Webhook Documentation': ['README.md'],
      'GraphQL Documentation': ['README.md'],
      'User Guides': ['getting-started.md', 'advanced-features.md'],
      'Tutorials': ['knowledge-base.md'],
      'Postman Collection': ['MemorAI-API.postman_collection.json']
    };

    let totalSections = 0;
    let completeSections = 0;

    for (const [sectionName, files] of Object.entries(expectedSections)) {
      totalSections++;

      const sectionDir = path.join(this.docsDir, sectionName.toLowerCase().replace(' ', '-').replace('documentation', '').trim() || 'root');
      let sectionComplete = true;

      for (const file of files) {
        const filePath = sectionName === 'Postman Collection'
          ? path.join(this.docsDir, 'postman', file)
          : sectionName === 'User Guides'
            ? path.join(this.docsDir, 'guides', file)
            : sectionName === 'Tutorials'
              ? path.join(this.docsDir, 'tutorials', file)
              : path.join(this.docsDir, sectionName.toLowerCase().split(' ')[0], file);

        if (!(await fs.pathExists(filePath))) {
          sectionComplete = false;
          break;
        }
      }

      if (sectionComplete) {
        completeSections++;
        this.addSuccess('Completeness', `${sectionName} is complete`);
      } else {
        this.addError('Completeness', `${sectionName} is incomplete`);
      }
    }

    const completeness = Math.round((completeSections / totalSections) * 100);
    console.log(`📊 Overall Completeness: ${completeness}% (${completeSections}/${totalSections} sections)`);
  }

  async findAllMarkdownFiles() {
    const files = [];

    async function scanDir(dir) {
      if (await fs.pathExists(dir)) {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            await scanDir(fullPath);
          } else if (entry.name.endsWith('.md')) {
            files.push(fullPath);
          }
        }
      }
    }

    await scanDir(this.docsDir);
    return files;
  }

  extractLinks(content) {
    const linkRegex = /\[([^\]]+)\]\(([^\)]+)\)/g;
    const links = [];
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      links.push(match[2]);
    }

    return links;
  }

  async validateLink(link, sourcePath) {
    // Skip external links for now (would need network validation)
    if (link.startsWith('http://') || link.startsWith('https://')) {
      return true;
    }

    // Validate local links
    if (link.startsWith('./') || link.startsWith('../')) {
      const resolvedPath = path.resolve(path.dirname(sourcePath), link);
      return await fs.pathExists(resolvedPath);
    }

    // Assume other links are valid for now
    return true;
  }

  extractCodeBlocks(content) {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const codeBlocks = [];
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      codeBlocks.push({
        language: match[1] || 'unknown',
        code: match[2]
      });
    }

    return codeBlocks;
  }

  validateCodeBlock(codeBlock) {
    const { language, code } = codeBlock;

    // Basic validation based on language
    switch (language) {
      case 'javascript':
      case 'js':
        return !code.includes('SyntaxError') && code.trim().length > 0;
      case 'json':
        try {
          JSON.parse(code);
          return true;
        } catch {
          return false;
        }
      case 'bash':
      case 'shell':
        return code.trim().length > 0 && !code.includes('command not found');
      default:
        return code.trim().length > 0;
    }
  }

  addSuccess(category, message) {
    this.validationResults.push({
      category,
      type: 'success',
      message,
      timestamp: new Date().toISOString()
    });

    console.log(`✅ ${category}: ${message}`);
  }

  addError(category, message) {
    this.errors.push({ category, message });
    this.validationResults.push({
      category,
      type: 'error',
      message,
      timestamp: new Date().toISOString()
    });

    console.log(`❌ ${category}: ${message}`);
  }

  addWarning(category, message) {
    this.warnings.push({ category, message });
    this.validationResults.push({
      category,
      type: 'warning',
      message,
      timestamp: new Date().toISOString()
    });

    console.log(`⚠️  ${category}: ${message}`);
  }

  generateValidationReport() {
    console.log('\n📊 Documentation Validation Report');
    console.log('=================================');

    const successCount = this.validationResults.filter(r => r.type === 'success').length;
    const errorCount = this.errors.length;
    const warningCount = this.warnings.length;
    const totalChecks = this.validationResults.length;

    console.log(`\n🎯 Summary:`);
    console.log(`   ✅ Passed: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   ⚠️  Warnings: ${warningCount}`);
    console.log(`   📊 Total Checks: ${totalChecks}`);

    const successRate = Math.round((successCount / totalChecks) * 100);
    console.log(`   🎯 Success Rate: ${successRate}%`);

    if (errorCount === 0) {
      console.log('\n🎉 Documentation validation passed with no errors!');
    } else {
      console.log('\n❌ Documentation validation failed. Please fix the errors above.');
    }

    if (warningCount > 0) {
      console.log(`⚠️  ${warningCount} warnings found - consider addressing these for better documentation quality.`);
    }

    // Save detailed report
    const report = {
      summary: {
        total_checks: totalChecks,
        passed: successCount,
        errors: errorCount,
        warnings: warningCount,
        success_rate: successRate,
        timestamp: new Date().toISOString()
      },
      results: this.validationResults,
      errors: this.errors,
      warnings: this.warnings
    };

    const reportPath = path.join(this.docsDir, 'validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// Run validation if called directly
async function main() {
  const validator = new DocumentationValidator();
  await validator.validateAllDocumentation();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { DocumentationValidator };

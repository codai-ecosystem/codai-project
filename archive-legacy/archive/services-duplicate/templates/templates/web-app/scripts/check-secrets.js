#!/usr/bin/env node

/**
 * Secret Detection Script
 * Scans for potential sensitive data in the codebase
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { glob } = require('glob');

class SecretDetector {
  constructor() {
    this.rootDir = process.cwd();
    this.patterns = [
      // API Keys
      {
        pattern:
          /[a-zA-Z0-9_-]*[aA][pP][iI][_-]?[kK][eE][yY][_-]?[=:]\s*['""]?[a-zA-Z0-9_-]{20,}['""]?/,
        type: 'API Key',
      },
      // Firebase keys
      { pattern: /AIza[0-9A-Za-z\\-_]{35}/, type: 'Firebase API Key' },
      // Private keys
      { pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, type: 'Private Key' },
      // Tokens
      {
        pattern: /[a-zA-Z0-9_-]*[tT][oO][kK][eE][nN][_-]?[=:]\s*['""]?[a-zA-Z0-9_-]{20,}['""]?/,
        type: 'Token',
      },
      // Secrets
      {
        pattern: /[a-zA-Z0-9_-]*[sS][eE][cC][rR][eE][tT][_-]?[=:]\s*['""]?[a-zA-Z0-9_-]{20,}['""]?/,
        type: 'Secret',
      },
      // Passwords
      {
        pattern:
          /[a-zA-Z0-9_-]*[pP][aA][sS][sS][wW][oO][rR][dD][_-]?[=:]\s*['""]?[a-zA-Z0-9_-]{8,}['""]?/,
        type: 'Password',
      },
      // Database URLs
      { pattern: /mongodb(\+srv)?:\/\/[^\s'"]+/, type: 'Database URL' },
      { pattern: /postgres(ql)?:\/\/[^\s'"]+/, type: 'Database URL' },
      // AWS
      { pattern: /AKIA[0-9A-Z]{16}/, type: 'AWS Access Key' },
      // Generic secrets
      {
        pattern:
          /[a-zA-Z0-9_-]*[cC][rR][eE][dD][eE][nN][tT][iI][aA][lL][sS]?[_-]?[=:]\s*['""]?[a-zA-Z0-9_-]{20,}['""]?/,
        type: 'Credentials',
      },
    ];

    this.whitelistPatterns = [
      /\.example$/,
      /\.template$/,
      /\.sample$/,
      /test.*\.ts$/,
      /test.*\.js$/,
      /\.test\./,
      /\.spec\./,
      /node_modules/,
      /\.git/,
      /README\.md$/,
      /DESCRIPTION\.md$/,
      /package-lock\.json$/,
      /pnpm-lock\.yaml$/,
    ];

    this.allowedValues = [
      'your-api-key-here',
      'your-secret-here',
      'placeholder',
      'example',
      'demo',
      'test',
      'mock',
      'fake',
      'sample',
      'dummy',
    ];
  }

  log(message, type = 'info') {
    const icons = {
      info: '💡',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      progress: '🔄',
    };

    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red,
      progress: chalk.cyan,
    };

    console.log(`${icons[type]} ${colors[type](message)}`);
  }

  async run() {
    try {
      this.log('Scanning for potential sensitive data...', 'progress');

      const files = await this.getFilesToScan();
      const findings = await this.scanFiles(files);

      if (findings.length === 0) {
        this.log('No potential sensitive data found!', 'success');
        return;
      }

      this.reportFindings(findings);

      // Exit with error code if critical secrets found
      const criticalFindings = findings.filter(f => f.severity === 'critical');
      if (criticalFindings.length > 0) {
        process.exit(1);
      }
    } catch (error) {
      this.log(`Secret detection failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  async getFilesToScan() {
    const patterns = [
      '**/*.js',
      '**/*.ts',
      '**/*.jsx',
      '**/*.tsx',
      '**/*.json',
      '**/*.env*',
      '**/*.yml',
      '**/*.yaml',
      '**/*.md',
      '**/*.txt',
    ];

    const allFiles = [];

    for (const pattern of patterns) {
      const files = await glob(pattern, {
        cwd: this.rootDir,
        ignore: ['node_modules/**', '.git/**', 'dist/**', '.next/**', 'coverage/**'],
      });
      allFiles.push(...files);
    }

    // Remove duplicates and filter whitelisted
    const uniqueFiles = [...new Set(allFiles)];
    return uniqueFiles.filter(file => !this.isWhitelisted(file));
  }

  isWhitelisted(filePath) {
    return this.whitelistPatterns.some(pattern => pattern.test(filePath));
  }

  async scanFiles(files) {
    const findings = [];

    for (const file of files) {
      const fullPath = path.join(this.rootDir, file);

      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const fileFindings = this.scanContent(content, file);
        findings.push(...fileFindings);
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }

    return findings;
  }

  scanContent(content, filePath) {
    const findings = [];
    const lines = content.split('\n');

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];

      for (const { pattern, type } of this.patterns) {
        const matches = line.match(pattern);

        if (matches) {
          const match = matches[0];

          // Skip if it's an allowed placeholder value
          if (this.isAllowedValue(match)) {
            continue;
          }

          // Determine severity
          const severity = this.determineSeverity(type, match, filePath);

          findings.push({
            file: filePath,
            line: lineIndex + 1,
            type,
            match: this.maskSensitiveData(match),
            severity,
            context: line.trim(),
          });
        }
      }
    }

    return findings;
  }

  isAllowedValue(value) {
    const normalizedValue = value.toLowerCase();
    return this.allowedValues.some(allowed => normalizedValue.includes(allowed.toLowerCase()));
  }

  determineSeverity(type, match, filePath) {
    // Critical: Real secrets in non-example files
    if (filePath.includes('.env') && !filePath.includes('example')) {
      return 'critical';
    }

    if (type === 'Private Key') {
      return 'critical';
    }

    if (type === 'Firebase API Key' && match.length > 30) {
      return 'critical';
    }

    // High: API keys and tokens
    if (['API Key', 'Token', 'AWS Access Key'].includes(type)) {
      return 'high';
    }

    // Medium: Other potential secrets
    if (['Secret', 'Credentials', 'Database URL'].includes(type)) {
      return 'medium';
    }

    // Low: Passwords (might be examples)
    return 'low';
  }

  maskSensitiveData(value) {
    if (value.length <= 8) {
      return '*'.repeat(value.length);
    }

    const start = value.substring(0, 4);
    const end = value.substring(value.length - 4);
    const middle = '*'.repeat(value.length - 8);

    return start + middle + end;
  }

  reportFindings(findings) {
    console.log('\n' + chalk.bold.red('🚨 Potential Sensitive Data Found'));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const groupedFindings = this.groupFindingsBySeverity(findings);

    for (const severity of ['critical', 'high', 'medium', 'low']) {
      const severityFindings = groupedFindings[severity] || [];

      if (severityFindings.length === 0) continue;

      const color = {
        critical: chalk.red.bold,
        high: chalk.red,
        medium: chalk.yellow,
        low: chalk.blue,
      }[severity];

      console.log(`\n${color(`${severity.toUpperCase()} (${severityFindings.length})`)}`);

      for (const finding of severityFindings) {
        console.log(`  ${chalk.cyan(finding.file)}:${chalk.yellow(finding.line)}`);
        console.log(`    Type: ${finding.type}`);
        console.log(`    Match: ${finding.match}`);
        console.log(`    Context: ${chalk.gray(finding.context.substring(0, 80))}`);
        console.log('');
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`${chalk.yellow('Total findings:')} ${findings.length}`);

    if (groupedFindings.critical?.length > 0) {
      console.log(
        `\n${chalk.red.bold('⚠️  CRITICAL: Please review and remove sensitive data before committing!')}`
      );
    }
  }

  groupFindingsBySeverity(findings) {
    return findings.reduce((groups, finding) => {
      const severity = finding.severity;
      if (!groups[severity]) {
        groups[severity] = [];
      }
      groups[severity].push(finding);
      return groups;
    }, {});
  }
}

if (require.main === module) {
  const detector = new SecretDetector();
  detector.run();
}

module.exports = SecretDetector;

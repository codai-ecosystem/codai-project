#!/usr/bin/env node

/**
 * Comprehensive Security Audit Tool
 * Performs security analysis across the entire monorepo
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Use colors without chalk for compatibility
const colors = {
  blue: text => `\x1b[34m${text}\x1b[0m`,
  green: text => `\x1b[32m${text}\x1b[0m`,
  yellow: text => `\x1b[33m${text}\x1b[0m`,
  red: text => `\x1b[31m${text}\x1b[0m`,
  magenta: text => `\x1b[35m${text}\x1b[0m`,
  bold: text => `\x1b[1m${text}\x1b[0m`,
};

const log = {
  info: msg => console.log(colors.blue('ℹ'), msg),
  success: msg => console.log(colors.green('✓'), msg),
  warning: msg => console.log(colors.yellow('⚠'), msg),
  error: msg => console.log(colors.red('✗'), msg),
  step: msg => console.log(colors.magenta('→'), msg),
  critical: msg => console.log(colors.red(colors.bold('🚨')), msg),
};

function runCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      cwd: options.cwd || process.cwd(),
      stdio: options.silent ? 'pipe' : 'inherit',
    });
    return result ? result.trim() : '';
  } catch (error) {
    if (!options.silent) {
      log.error(`Failed to run: ${command}`);
    }
    return null;
  }
}

function checkEnvironmentFiles() {
  log.step('Auditing environment files...');

  const envFiles = [
    'apps/web/.env.local',
    'apps/web/.env.example',
    'apps/backend/.env.local',
    'apps/backend/.env.example',
  ];

  const sensitivePatterns = [/password/i, /secret/i, /key/i, /token/i, /credential/i];

  const issues = [];

  envFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');

      // Check for sensitive data patterns
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.includes('=') && !line.startsWith('#')) {
          const [key, value] = line.split('=');

          // Check if sensitive value is exposed
          if (value && value.length > 0 && value !== 'your-value-here') {
            sensitivePatterns.forEach(pattern => {
              if (pattern.test(key)) {
                issues.push({
                  file: filePath,
                  line: index + 1,
                  issue: `Potential sensitive value in ${key}`,
                  severity: 'medium',
                });
              }
            });
          }
        }
      });

      log.success(`Checked ${filePath}`);
    }
  });

  if (issues.length > 0) {
    log.warning(`Found ${issues.length} potential environment issues`);
    issues.forEach(issue => {
      console.log(`  ${issue.file}:${issue.line} - ${issue.issue}`);
    });
  } else {
    log.success('Environment files look secure');
  }

  return issues;
}

function auditDependencies() {
  log.step('Auditing dependencies for vulnerabilities...');

  try {
    // Run pnpm audit
    const auditResult = runCommand('pnpm audit --json', { silent: true });

    if (auditResult) {
      try {
        const auditData = JSON.parse(auditResult);

        if (auditData.metadata && auditData.metadata.vulnerabilities) {
          const vulns = auditData.metadata.vulnerabilities;
          const total = Object.values(vulns).reduce((sum, count) => sum + count, 0);

          if (total > 0) {
            log.warning(`Found ${total} vulnerabilities:`);
            Object.entries(vulns).forEach(([severity, count]) => {
              if (count > 0) {
                const color =
                  severity === 'critical'
                    ? 'red'
                    : severity === 'high'
                      ? 'magenta'
                      : severity === 'moderate'
                        ? 'yellow'
                        : 'blue';
                console.log(`  ${colors[color](severity)}: ${count}`);
              }
            });
          } else {
            log.success('No known vulnerabilities found');
          }
        }
      } catch (parseError) {
        log.warning('Could not parse audit results');
      }
    }

    // Check for outdated packages
    log.step('Checking for outdated packages...');
    const outdatedResult = runCommand('pnpm outdated --json', { silent: true });

    if (outdatedResult) {
      try {
        const outdatedData = JSON.parse(outdatedResult);
        const outdatedCount = Object.keys(outdatedData).length;

        if (outdatedCount > 0) {
          log.warning(`Found ${outdatedCount} outdated packages`);
        } else {
          log.success('All packages are up to date');
        }
      } catch (parseError) {
        // Ignore parse errors for outdated check
      }
    }
  } catch (error) {
    log.warning('Dependency audit encountered issues');
  }
}

function checkGitSecrets() {
  log.step('Scanning for potential secrets in git history...');

  const secretPatterns = [
    /api[_-]?key/i,
    /secret[_-]?key/i,
    /access[_-]?token/i,
    /auth[_-]?token/i,
    /password/i,
    /passwd/i,
    /firebase[_-]?config/i,
    /private[_-]?key/i,
  ];

  try {
    // Check recent commits for potential secrets
    const gitLog = runCommand('git log --oneline -10', { silent: true });

    if (gitLog) {
      const commits = gitLog.split('\n');
      const issues = [];

      commits.forEach(commit => {
        secretPatterns.forEach(pattern => {
          if (pattern.test(commit)) {
            issues.push({
              commit: commit.split(' ')[0],
              message: commit,
              pattern: pattern.source,
            });
          }
        });
      });

      if (issues.length > 0) {
        log.warning(`Found ${issues.length} potential secrets in git history`);
        issues.forEach(issue => {
          console.log(`  ${issue.commit}: ${issue.message}`);
        });
      } else {
        log.success('No obvious secrets found in recent git history');
      }
    }
  } catch (error) {
    log.warning('Could not check git history');
  }
}

function auditFirebaseRules() {
  log.step('Auditing Firebase security rules...');

  const rulesFiles = ['apps/web/firebase/firestore.rules', 'apps/web/firebase/storage.rules'];

  const issues = [];

  rulesFiles.forEach(rulesFile => {
    if (fs.existsSync(rulesFile)) {
      const content = fs.readFileSync(rulesFile, 'utf8');

      // Check for overly permissive rules
      if (content.includes('allow read, write: if true')) {
        issues.push({
          file: rulesFile,
          issue: 'Overly permissive rule: allow read, write: if true',
          severity: 'high',
        });
      }

      // Check for authentication requirements
      if (!content.includes('request.auth')) {
        issues.push({
          file: rulesFile,
          issue: 'No authentication checks found',
          severity: 'medium',
        });
      }

      log.success(`Checked ${rulesFile}`);
    }
  });

  if (issues.length > 0) {
    log.warning(`Found ${issues.length} Firebase rules issues`);
    issues.forEach(issue => {
      console.log(`  ${issue.file}: ${issue.issue} (${issue.severity})`);
    });
  } else if (rulesFiles.some(file => fs.existsSync(file))) {
    log.success('Firebase rules look secure');
  } else {
    log.warning('No Firebase rules files found');
  }

  return issues;
}

function checkCSPHeaders() {
  log.step('Checking Content Security Policy configuration...');

  const nextConfigPath = 'apps/web/next.config.ts';

  if (fs.existsSync(nextConfigPath)) {
    const content = fs.readFileSync(nextConfigPath, 'utf8');

    if (content.includes('Content-Security-Policy')) {
      log.success('CSP headers configured');
    } else {
      log.warning('No CSP headers found in next.config.ts');
      console.log('  Consider adding CSP headers for security');
    }
  } else {
    log.warning('next.config.ts not found');
  }
}

function generateSecurityReport(allIssues) {
  console.log(colors.bold('\n🔒 Security Audit Report\n'));

  const severityCounts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  allIssues.forEach(issue => {
    if (severityCounts[issue.severity] !== undefined) {
      severityCounts[issue.severity]++;
    }
  });

  const totalIssues = Object.values(severityCounts).reduce((sum, count) => sum + count, 0);

  if (totalIssues === 0) {
    log.success('No security issues found!');
  } else {
    console.log(colors.bold('Issues by severity:'));
    Object.entries(severityCounts).forEach(([severity, count]) => {
      if (count > 0) {
        const color =
          severity === 'critical'
            ? 'red'
            : severity === 'high'
              ? 'magenta'
              : severity === 'medium'
                ? 'yellow'
                : 'blue';
        console.log(`  ${colors[color](severity)}: ${count}`);
      }
    });
  }

  console.log(colors.bold('\n🔧 Security Recommendations:\n'));

  const recommendations = [
    'Enable Content Security Policy (CSP) headers',
    'Implement proper input validation and sanitization',
    'Use HTTPS everywhere in production',
    'Regularly update dependencies',
    'Implement proper authentication and authorization',
    'Use environment variables for sensitive configuration',
    'Enable security headers (HSTS, X-Frame-Options, etc.)',
    'Implement rate limiting for API endpoints',
    'Use secure session management',
    'Regular security audits and penetration testing',
  ];

  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });
}

async function main() {
  console.log(colors.blue(colors.bold('\n🔐 Comprehensive Security Audit\n')));

  const allIssues = [];

  // Run all security checks
  allIssues.push(...checkEnvironmentFiles());
  auditDependencies();
  checkGitSecrets();
  allIssues.push(...auditFirebaseRules());
  checkCSPHeaders();

  // Generate comprehensive report
  generateSecurityReport(allIssues);

  console.log(colors.green(colors.bold('\n✅ Security audit complete!\n')));

  if (allIssues.some(issue => issue.severity === 'critical' || issue.severity === 'high')) {
    log.critical('High or critical security issues found - please address immediately');
    process.exit(1);
  } else if (allIssues.length > 0) {
    log.warning('Some security issues found - please review and address');
  } else {
    log.success('No security issues detected');
  }
}

main().catch(error => {
  log.error('Security audit failed:');
  console.error(error);
  process.exit(1);
});

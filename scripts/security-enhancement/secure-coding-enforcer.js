/**
 * @fileoverview Secure Coding Enforcer
 * @description Creates secure coding standards and enforcement tools
 */

import fs from 'fs';
import path from 'path';

export default function createSecureCodingEnforcer(dirs, appName) {
    createESLintSecurityRules(dirs.rootDir, appName);
    createSecurityLintConfig(dirs.rootDir, appName);
    createCodeSecurityAnalyzer(dirs.utilsDir, appName);
    createSecureCodingGuidelines(dirs.rootDir, appName);
    console.log(`🔐 Secure coding enforcement created for ${appName}`);
}

function createESLintSecurityRules(rootDir, appName) {
    const eslintSecurityConfig = `{
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:security/recommended",
    "plugin:react-hooks/recommended"
  ],
  "plugins": [
    "security",
    "no-unsanitized",
    "@typescript-eslint"
  ],
  "rules": {
    // Security-related rules
    "security/detect-object-injection": "error",
    "security/detect-non-literal-regexp": "error",
    "security/detect-non-literal-require": "error",
    "security/detect-non-literal-fs-filename": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-pseudoRandomBytes": "error",
    "security/detect-possible-timing-attacks": "warn",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error",
    "security/detect-child-process": "warn",
    "security/detect-disable-mustache-escape": "error",
    "security/detect-new-buffer": "error",
    "security/detect-no-csrf-before-method-override": "error",

    // No unsanitized rules
    "no-unsanitized/method": "error",
    "no-unsanitized/property": "error",

    // TypeScript security rules
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unsafe-assignment": "warn",
    "@typescript-eslint/no-unsafe-call": "warn",
    "@typescript-eslint/no-unsafe-member-access": "warn",
    "@typescript-eslint/no-unsafe-return": "warn",

    // React security rules
    "react/no-danger": "error",
    "react/no-danger-with-children": "error",
    "react/jsx-no-script-url": "error",
    "react/jsx-no-target-blank": "error",

    // General security best practices
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error",
    "no-script-url": "error",
    "prefer-const": "error",
    "no-var": "error",
    "strict": ["error", "safe"],

    // Custom security rules
    "no-console": "warn",
    "no-debugger": "error",
    "no-alert": "error",
    "no-unused-vars": "error",
    "prefer-template": "error",

    // Prevent common vulnerabilities
    "no-useless-escape": "error",
    "no-regex-spaces": "error",
    "no-control-regex": "error",
    "no-invalid-regexp": "error"
  },
  "env": {
    "browser": true,
    "node": true,
    "es2022": true
  },
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "overrides": [
    {
      "files": ["**/*.ts", "**/*.tsx"],
      "parser": "@typescript-eslint/parser",
      "parserOptions": {
        "project": "./tsconfig.json"
      }
    },
    {
      "files": ["**/*.test.js", "**/*.test.ts", "**/*.spec.js", "**/*.spec.ts"],
      "env": {
        "jest": true
      },
      "rules": {
        "security/detect-object-injection": "off",
        "no-console": "off"
      }
    }
  ]
}`;

    fs.writeFileSync(path.join(rootDir, '.eslintrc.security.json'), eslintSecurityConfig);
}

function createSecurityLintConfig(rootDir, appName) {
    const securityLintScript = `#!/usr/bin/env node
/**
 * @fileoverview Security Linting Script
 * @description Runs comprehensive security linting checks
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class SecurityLinter {
    constructor() {
        this.issues = [];
        this.warnings = [];
        this.errors = [];
    }

    async runSecurityLint() {
        console.log('🔍 Running security linting checks...');
        
        await this.runESLintSecurity();
        await this.checkDependencies();
        await this.scanForSecrets();
        await this.checkFilePermissions();
        await this.validateSecurityHeaders();
        
        this.generateReport();
    }

    async runESLintSecurity() {
        return new Promise((resolve) => {
            const eslintCmd = 'npx eslint --config .eslintrc.security.json --ext .js,.ts,.tsx,.jsx src/ --format json';
            
            exec(eslintCmd, (error, stdout, stderr) => {
                if (stdout) {
                    try {
                        const results = JSON.parse(stdout);
                        results.forEach(result => {
                            result.messages.forEach(message => {
                                if (message.ruleId && message.ruleId.includes('security/')) {
                                    this.issues.push({
                                        type: 'eslint-security',
                                        severity: message.severity === 2 ? 'error' : 'warning',
                                        file: result.filePath,
                                        line: message.line,
                                        column: message.column,
                                        rule: message.ruleId,
                                        message: message.message
                                    });
                                }
                            });
                        });
                    } catch (e) {
                        console.warn('Failed to parse ESLint output');
                    }
                }
                resolve();
            });
        });
    }

    async checkDependencies() {
        console.log('📦 Checking dependencies for vulnerabilities...');
        
        return new Promise((resolve) => {
            exec('npm audit --json', (error, stdout, stderr) => {
                if (stdout) {
                    try {
                        const audit = JSON.parse(stdout);
                        if (audit.vulnerabilities) {
                            Object.entries(audit.vulnerabilities).forEach(([pkg, vuln]) => {
                                this.issues.push({
                                    type: 'dependency-vulnerability',
                                    severity: vuln.severity,
                                    package: pkg,
                                    title: vuln.title,
                                    message: \`Vulnerable dependency: \${pkg} (\${vuln.severity})\`,
                                    recommendation: vuln.recommendation
                                });
                            });
                        }
                    } catch (e) {
                        console.warn('Failed to parse npm audit output');
                    }
                }
                resolve();
            });
        });
    }

    async scanForSecrets() {
        console.log('🔐 Scanning for exposed secrets...');
        
        const secretPatterns = [
            { name: 'API Key', pattern: /(?:api_key|apikey|api-key)\\s*[:=]\\s*['""]([a-z0-9]{32,})['""]/ },
            { name: 'JWT Token', pattern: /(?:token|jwt)\\s*[:=]\\s*['""]eyJ[a-zA-Z0-9_-]*\\.[a-zA-Z0-9_-]*\\.[a-zA-Z0-9_-]*['""]/ },
            { name: 'Password', pattern: /(?:password|pwd|pass)\\s*[:=]\\s*['""](?!\\$\\{|process\\.env)([^'"\\n]{8,})['""]/ },
            { name: 'Private Key', pattern: /-----BEGIN (?:RSA )?PRIVATE KEY-----/ },
            { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/ },
            { name: 'Database URL', pattern: /(?:mongodb|postgres|mysql):\\/\\/[^\\s'"]+/ }
        ];

        this.scanDirectory('src', secretPatterns);
        this.scanDirectory('pages', secretPatterns);
        this.scanDirectory('components', secretPatterns);
    }

    scanDirectory(dirPath, patterns) {
        if (!fs.existsSync(dirPath)) return;

        const files = fs.readdirSync(dirPath, { recursive: true });
        files.forEach(file => {
            if (typeof file !== 'string') return;
            if (!file.match(/\\.(js|ts|tsx|jsx|json|env)$/)) return;

            const fullPath = path.join(dirPath, file);
            if (!fs.lstatSync(fullPath).isFile()) return;

            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                patterns.forEach(({ name, pattern }) => {
                    const matches = content.match(pattern);
                    if (matches) {
                        this.issues.push({
                            type: 'secret-exposure',
                            severity: 'error',
                            file: fullPath,
                            secretType: name,
                            message: \`Potential \${name} exposed in file\`,
                            recommendation: 'Move secrets to environment variables'
                        });
                    }
                });
            } catch (error) {
                // Skip files that can't be read
            }
        });
    }

    async checkFilePermissions() {
        console.log('📂 Checking file permissions...');
        
        const sensitiveFiles = [
            '.env',
            '.env.local',
            '.env.production',
            'package.json',
            'tsconfig.json',
            'next.config.js'
        ];

        sensitiveFiles.forEach(file => {
            if (fs.existsSync(file)) {
                try {
                    const stats = fs.statSync(file);
                    const mode = stats.mode & parseInt('777', 8);
                    
                    // Check if file is world-readable
                    if (mode & parseInt('044', 8)) {
                        this.issues.push({
                            type: 'file-permissions',
                            severity: 'warning',
                            file: file,
                            message: \`File \${file} is world-readable\`,
                            recommendation: 'Restrict file permissions'
                        });
                    }
                } catch (error) {
                    // Skip files that can't be accessed
                }
            }
        });
    }

    async validateSecurityHeaders() {
        console.log('🛡️ Validating security headers configuration...');
        
        const configFiles = [
            'next.config.js',
            'next.config.ts',
            'middleware.js',
            'middleware.ts'
        ];

        configFiles.forEach(configFile => {
            if (fs.existsSync(configFile)) {
                try {
                    const content = fs.readFileSync(configFile, 'utf8');
                    
                    const securityHeaders = [
                        'Content-Security-Policy',
                        'X-Frame-Options',
                        'X-Content-Type-Options',
                        'Referrer-Policy',
                        'X-XSS-Protection'
                    ];

                    const missingHeaders = securityHeaders.filter(header => 
                        !content.includes(header)
                    );

                    if (missingHeaders.length > 0) {
                        this.issues.push({
                            type: 'missing-security-headers',
                            severity: 'warning',
                            file: configFile,
                            message: \`Missing security headers: \${missingHeaders.join(', ')}\`,
                            recommendation: 'Add missing security headers to configuration'
                        });
                    }
                } catch (error) {
                    // Skip files that can't be read
                }
            }
        });
    }

    generateReport() {
        console.log('\\n📊 Security Lint Report\\n');
        console.log('=' .repeat(50));
        
        const errors = this.issues.filter(i => i.severity === 'error');
        const warnings = this.issues.filter(i => i.severity === 'warning');
        const criticals = this.issues.filter(i => i.severity === 'critical');
        
        console.log(\`🔴 Critical Issues: \${criticals.length}\`);
        console.log(\`🟠 Errors: \${errors.length}\`);
        console.log(\`🟡 Warnings: \${warnings.length}\`);
        console.log(\`📊 Total Issues: \${this.issues.length}\\n\`);

        if (criticals.length > 0) {
            console.log('🚨 CRITICAL SECURITY ISSUES:');
            criticals.forEach(issue => this.printIssue(issue));
        }

        if (errors.length > 0) {
            console.log('🔴 SECURITY ERRORS:');
            errors.forEach(issue => this.printIssue(issue));
        }

        if (warnings.length > 0) {
            console.log('🟡 SECURITY WARNINGS:');
            warnings.forEach(issue => this.printIssue(issue));
        }

        if (this.issues.length === 0) {
            console.log('✅ No security issues found! Great job!');
        } else {
            console.log('\\n📝 RECOMMENDATIONS:');
            const uniqueRecommendations = [...new Set(this.issues
                .filter(i => i.recommendation)
                .map(i => i.recommendation)
            )];
            uniqueRecommendations.forEach((rec, i) => {
                console.log(\`  \${i + 1}. \${rec}\`);
            });
        }

        // Exit with error if critical issues or errors found
        const exitCode = criticals.length > 0 || errors.length > 0 ? 1 : 0;
        process.exit(exitCode);
    }

    printIssue(issue) {
        console.log(\`  • \${issue.message}\`);
        if (issue.file) console.log(\`    File: \${issue.file}\`);
        if (issue.line) console.log(\`    Line: \${issue.line}\`);
        if (issue.rule) console.log(\`    Rule: \${issue.rule}\`);
        if (issue.secretType) console.log(\`    Type: \${issue.secretType}\`);
        if (issue.package) console.log(\`    Package: \${issue.package}\`);
        console.log('');
    }
}

// Run security linting
const linter = new SecurityLinter();
linter.runSecurityLint().catch(console.error);`;

    fs.writeFileSync(path.join(rootDir, 'scripts/security-lint.js'), securityLintScript);

    // Make script executable
    try {
        fs.chmodSync(path.join(rootDir, 'scripts/security-lint.js'), '755');
    } catch (error) {
        // Ignore chmod errors on Windows
    }
}

function createCodeSecurityAnalyzer(utilsDir, appName) {
    const analyzerContent = `/**
 * @fileoverview Code Security Analyzer
 * @description Advanced static code analysis for security issues
 */

import fs from 'fs';
import path from 'path';

export interface SecurityIssue {
    id: string;
    type: 'vulnerability' | 'bad_practice' | 'potential_risk' | 'compliance';
    severity: 'low' | 'medium' | 'high' | 'critical';
    file: string;
    line: number;
    column?: number;
    message: string;
    description: string;
    recommendation: string;
    cwe?: string; // Common Weakness Enumeration
    owasp?: string; // OWASP category
    confidence: number; // 0-1, higher is more confident
}

export interface AnalysisResult {
    totalFiles: number;
    totalLines: number;
    issues: SecurityIssue[];
    summary: {
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    compliance: {
        owaspTop10: Array<{ category: string; issues: number; status: 'pass' | 'fail' }>;
        sans25: Array<{ category: string; issues: number; status: 'pass' | 'fail' }>;
    };
}

export class CodeSecurityAnalyzer {
    private issues: SecurityIssue[] = [];
    private fileCount: number = 0;
    private lineCount: number = 0;

    /**
     * Analyze directory for security issues
     */
    async analyzeDirectory(directoryPath: string, options: {
        extensions?: string[];
        excludePaths?: string[];
        includeTests?: boolean;
    } = {}): Promise<AnalysisResult> {
        const {
            extensions = ['.js', '.ts', '.tsx', '.jsx'],
            excludePaths = ['node_modules', '.git', 'dist', 'build'],
            includeTests = false
        } = options;

        this.issues = [];
        this.fileCount = 0;
        this.lineCount = 0;

        await this.scanDirectory(directoryPath, extensions, excludePaths, includeTests);

        return this.generateAnalysisResult();
    }

    private async scanDirectory(
        dirPath: string,
        extensions: string[],
        excludePaths: string[],
        includeTests: boolean
    ): Promise<void> {
        if (!fs.existsSync(dirPath)) return;

        const entries = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            // Skip excluded paths
            if (excludePaths.some(exclude => fullPath.includes(exclude))) {
                continue;
            }

            // Skip test files unless specifically included
            if (!includeTests && this.isTestFile(entry.name)) {
                continue;
            }

            if (entry.isDirectory()) {
                await this.scanDirectory(fullPath, extensions, excludePaths, includeTests);
            } else if (entry.isFile() && this.shouldAnalyzeFile(entry.name, extensions)) {
                await this.analyzeFile(fullPath);
            }
        }
    }

    private async analyzeFile(filePath: string): Promise<void> {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\\n');
            
            this.fileCount++;
            this.lineCount += lines.length;

            // Analyze each line
            lines.forEach((line, lineIndex) => {
                this.analyzeLine(line, lineIndex + 1, filePath);
            });

            // Analyze entire file content
            this.analyzeFileContent(content, filePath);

        } catch (error) {
            console.warn(\`Failed to analyze file \${filePath}:\`, error.message);
        }
    }

    private analyzeLine(line: string, lineNumber: number, filePath: string): void {
        const trimmedLine = line.trim();
        
        // Check for various security issues
        this.checkForSQLInjection(line, lineNumber, filePath);
        this.checkForXSSVulnerabilities(line, lineNumber, filePath);
        this.checkForHardcodedSecrets(line, lineNumber, filePath);
        this.checkForInsecureRandomness(line, lineNumber, filePath);
        this.checkForPathTraversal(line, lineNumber, filePath);
        this.checkForCommandInjection(line, lineNumber, filePath);
        this.checkForInsecureDeserization(line, lineNumber, filePath);
        this.checkForWeakCryptography(line, lineNumber, filePath);
        this.checkForInsecureDirectObjectReferences(line, lineNumber, filePath);
        this.checkForLoggingSecrets(line, lineNumber, filePath);
    }

    private analyzeFileContent(content: string, filePath: string): void {
        // Check for larger patterns that span multiple lines
        this.checkForMissingAuthentication(content, filePath);
        this.checkForMissingAuthorization(content, filePath);
        this.checkForInsecureFileUploads(content, filePath);
        this.checkForMissingInputValidation(content, filePath);
    }

    private checkForSQLInjection(line: string, lineNumber: number, filePath: string): void {
        const sqlInjectionPatterns = [
            /[\\\`\\"]\\s*\\+\\s*[a-zA-Z_$][a-zA-Z0-9_$]*\\s*\\+\\s*[\\\`\\"]/, // String concatenation in SQL
            /SELECT.*FROM.*WHERE.*[\\\`\\"]\\s*\\+/, // Direct SQL concatenation
            /INSERT.*INTO.*VALUES.*[\\\`\\"]\\s*\\+/, // Insert with concatenation
            /UPDATE.*SET.*[\\\`\\"]\\s*\\+/, // Update with concatenation
            /DELETE.*FROM.*WHERE.*[\\\`\\"]\\s*\\+/ // Delete with concatenation
        ];

        sqlInjectionPatterns.forEach(pattern => {
            if (pattern.test(line)) {
                this.addIssue({
                    type: 'vulnerability',
                    severity: 'high',
                    file: filePath,
                    line: lineNumber,
                    message: 'Potential SQL injection vulnerability',
                    description: 'String concatenation in SQL query can lead to SQL injection attacks',
                    recommendation: 'Use parameterized queries or ORM methods instead of string concatenation',
                    cwe: 'CWE-89',
                    owasp: 'A03:2021 – Injection',
                    confidence: 0.8
                });
            }
        });
    }

    private checkForXSSVulnerabilities(line: string, lineNumber: number, filePath: string): void {
        const xssPatterns = [
            /dangerouslySetInnerHTML/, // React XSS
            /innerHTML\\s*=/, // Direct innerHTML assignment
            /document\\.write\\(/, // Document.write XSS
            /eval\\(.*\\+/, // Eval with concatenation
            /new Function\\(.*\\+/ // Function constructor with concatenation
        ];

        xssPatterns.forEach(pattern => {
            if (pattern.test(line)) {
                this.addIssue({
                    type: 'vulnerability',
                    severity: 'high',
                    file: filePath,
                    line: lineNumber,
                    message: 'Potential Cross-Site Scripting (XSS) vulnerability',
                    description: 'Unsafe HTML rendering or script execution can lead to XSS attacks',
                    recommendation: 'Sanitize user input and use safe rendering methods',
                    cwe: 'CWE-79',
                    owasp: 'A03:2021 – Injection',
                    confidence: 0.9
                });
            }
        });
    }

    private checkForHardcodedSecrets(line: string, lineNumber: number, filePath: string): void {
        const secretPatterns = [
            { pattern: /(?:api[_-]?key|apikey)\\s*[:=]\\s*[\\\\"\\'][a-zA-Z0-9]{16,}[\\\\"\\']/, type: 'API Key' },
            { pattern: /(?:password|pwd)\\s*[:=]\\s*[\\\\"\\'][^\\$][a-zA-Z0-9@#$%^&*!]{8,}[\\\\"\\']/, type: 'Password' },
            { pattern: /(?:secret|token)\\s*[:=]\\s*[\\\\"\\'][a-zA-Z0-9]{16,}[\\\\"\\']/, type: 'Secret/Token' },
            { pattern: /-----BEGIN (?:RSA )?PRIVATE KEY-----/, type: 'Private Key' },
            { pattern: /AKIA[0-9A-Z]{16}/, type: 'AWS Access Key' }
        ];

        secretPatterns.forEach(({ pattern, type }) => {
            if (pattern.test(line) && !line.includes('process.env') && !line.includes('${')) {
                this.addIssue({
        type: 'vulnerability',
        severity: 'critical',
        file: filePath,
        line: lineNumber,
        message: \`Hardcoded \${type.toLowerCase()} detected\`,
                    description: \`\${type} is hardcoded in source code, which is a security risk\`,
                    recommendation: 'Move sensitive data to environment variables or secure key management',
                    cwe: 'CWE-798',
                    owasp: 'A07:2021 – Identification and Authentication Failures',
                    confidence: 0.95
                });
            }
        });
    }

    private checkForInsecureRandomness(line: string, lineNumber: number, filePath: string): void {
        const weakRandomPatterns = [
            /Math\\.random\\(\\)/, // Math.random for security purposes
            /new Date\\(\\)\\.getTime\\(\\)/, // Timestamp as randomness
            /Math\\.floor\\(Math\\.random/ // Math.random with floor
        ];

        weakRandomPatterns.forEach(pattern => {
            if (pattern.test(line)) {
                this.addIssue({
                    type: 'bad_practice',
                    severity: 'medium',
                    file: filePath,
                    line: lineNumber,
                    message: 'Weak randomness source detected',
                    description: 'Math.random() is not cryptographically secure and should not be used for security purposes',
                    recommendation: 'Use crypto.randomBytes() or crypto.getRandomValues() for secure randomness',
                    cwe: 'CWE-330',
                    owasp: 'A02:2021 – Cryptographic Failures',
                    confidence: 0.7
                });
            }
        });
    }

    private checkForPathTraversal(line: string, lineNumber: number, filePath: string): void {
        const pathTraversalPatterns = [
            /\\.\\.\\//, // Directory traversal sequences
            /\\.\\.\\\\\\\\//, // Windows path traversal
            /path\\.join\\(.*req\\./  // Unsafe path.join with user input
        ];

        pathTraversalPatterns.forEach(pattern => {
            if (pattern.test(line)) {
                this.addIssue({
                    type: 'vulnerability',
                    severity: 'high',
                    file: filePath,
                    line: lineNumber,
                    message: 'Potential path traversal vulnerability',
                    description: 'Unsanitized file paths can lead to unauthorized file access',
                    recommendation: 'Validate and sanitize file paths, use path.resolve() and check against allowed directories',
                    cwe: 'CWE-22',
                    owasp: 'A01:2021 – Broken Access Control',
                    confidence: 0.6
                });
            }
        });
    }

    private checkForCommandInjection(line: string, lineNumber: number, filePath: string): void {
        const commandInjectionPatterns = [
            /exec\\(.*\\+/, // exec with concatenation
            /spawn\\(.*\\+/, // spawn with concatenation
            /system\\(.*\\+/, // system with concatenation
            /shell_exec\\(.*\\+/ // shell_exec with concatenation
        ];

        commandInjectionPatterns.forEach(pattern => {
            if (pattern.test(line)) {
                this.addIssue({
                    type: 'vulnerability',
                    severity: 'critical',
                    file: filePath,
                    line: lineNumber,
                    message: 'Potential command injection vulnerability',
                    description: 'Dynamic command execution can lead to command injection attacks',
                    recommendation: 'Use parameterized command execution or input validation/sanitization',
                    cwe: 'CWE-78',
                    owasp: 'A03:2021 – Injection',
                    confidence: 0.85
                });
            }
        });
    }

    private checkForInsecureDeserization(line: string, lineNumber: number, filePath: string): void {
        const deserializationPatterns = [
            /JSON\\.parse\\(.*req\\./, // JSON.parse with request data
            /eval\\(/, // eval usage
            /Function\\(.*\\)\\(/ // Function constructor execution
        ];

        deserializationPatterns.forEach(pattern => {
            if (pattern.test(line)) {
                this.addIssue({
                    type: 'vulnerability',
                    severity: 'high',
                    file: filePath,
                    line: lineNumber,
                    message: 'Potentially insecure deserialization',
                    description: 'Deserializing untrusted data can lead to code execution',
                    recommendation: 'Validate and sanitize data before deserialization, use safe parsing methods',
                    cwe: 'CWE-502',
                    owasp: 'A08:2021 – Software and Data Integrity Failures',
                    confidence: 0.7
                });
            }
        });
    }

    private checkForWeakCryptography(line: string, lineNumber: number, filePath: string): void {
        const weakCryptoPatterns = [
            /\\.createHash\\(['\\"]md5['\\"]\\)/, // MD5 usage
            /\\.createHash\\(['\\"]sha1['\\"]\\)/, // SHA1 usage
            /DES|3DES|RC4/, // Weak encryption algorithms
            /ECB/, // ECB mode
        ];

        weakCryptoPatterns.forEach(pattern => {
            if (pattern.test(line)) {
                this.addIssue({
                    type: 'bad_practice',
                    severity: 'medium',
                    file: filePath,
                    line: lineNumber,
                    message: 'Weak cryptographic algorithm detected',
                    description: 'Using weak or deprecated cryptographic algorithms',
                    recommendation: 'Use strong cryptographic algorithms like SHA-256, AES-256, etc.',
                    cwe: 'CWE-327',
                    owasp: 'A02:2021 – Cryptographic Failures',
                    confidence: 0.9
                });
            }
        });
    }

    private checkForInsecureDirectObjectReferences(line: string, lineNumber: number, filePath: string): void {
        const idorPatterns = [
            /req\\.params\\.id.*findById/, // Direct ID usage from params
            /req\\.query\\..*find/, // Query params in database queries
        ];

        idorPatterns.forEach(pattern => {
            if (pattern.test(line)) {
                this.addIssue({
                    type: 'potential_risk',
                    severity: 'medium',
                    file: filePath,
                    line: lineNumber,
                    message: 'Potential insecure direct object reference',
                    description: 'Direct use of user-supplied identifiers may allow unauthorized access',
                    recommendation: 'Implement proper authorization checks and validate object ownership',
                    cwe: 'CWE-639',
                    owasp: 'A01:2021 – Broken Access Control',
                    confidence: 0.5
                });
            }
        });
    }

    private checkForLoggingSecrets(line: string, lineNumber: number, filePath: string): void {
        const logSecretPatterns = [
            /console\\.log\\(.*(?:password|secret|token|key)/, // Logging sensitive data
            /logger?\\.[a-z]+\\(.*(?:password|secret|token|key)/, // Logger with sensitive data
        ];

        logSecretPatterns.forEach(pattern => {
            if (pattern.test(line.toLowerCase())) {
                this.addIssue({
                    type: 'bad_practice',
                    severity: 'medium',
                    file: filePath,
                    line: lineNumber,
                    message: 'Potential sensitive data logging',
                    description: 'Logging sensitive information can expose secrets in log files',
                    recommendation: 'Avoid logging sensitive data or sanitize log outputs',
                    cwe: 'CWE-532',
                    owasp: 'A09:2021 – Security Logging and Monitoring Failures',
                    confidence: 0.6
                });
            }
        });
    }

    private checkForMissingAuthentication(content: string, filePath: string): void {
        // Check for API routes without authentication
        if (filePath.includes('api/') || filePath.includes('route')) {
            const hasAuth = /(?:authenticate|authorize|auth|jwt|token|session)/.test(content.toLowerCase());
            const isPublicRoute = /(?:login|register|health|public)/.test(filePath.toLowerCase());
            
            if (!hasAuth && !isPublicRoute) {
                this.addIssue({
                    type: 'potential_risk',
                    severity: 'medium',
                    file: filePath,
                    line: 1,
                    message: 'API endpoint may be missing authentication',
                    description: 'API endpoint does not appear to implement authentication checks',
                    recommendation: 'Implement proper authentication for sensitive endpoints',
                    cwe: 'CWE-306',
                    owasp: 'A07:2021 – Identification and Authentication Failures',
                    confidence: 0.4
                });
            }
        }
    }

    private checkForMissingAuthorization(content: string, filePath: string): void {
        // Check for authorization patterns
        if (content.includes('req.user') && !content.includes('authorization')) {
            this.addIssue({
                type: 'potential_risk',
                severity: 'medium',
                file: filePath,
                line: 1,
                message: 'Potential missing authorization check',
                description: 'User information is accessed but no authorization check is apparent',
                recommendation: 'Implement proper authorization checks for user actions',
                cwe: 'CWE-862',
                owasp: 'A01:2021 – Broken Access Control',
                confidence: 0.3
            });
        }
    }

    private checkForInsecureFileUploads(content: string, filePath: string): void {
        if (content.includes('multer') || content.includes('file upload')) {
            const hasValidation = /(?:mimetype|extension|size)/.test(content);
            if (!hasValidation) {
                this.addIssue({
                    type: 'potential_risk',
                    severity: 'high',
                    file: filePath,
                    line: 1,
                    message: 'File upload may lack proper validation',
                    description: 'File upload functionality should validate file types, sizes, and content',
                    recommendation: 'Implement file type validation, size limits, and content scanning',
                    cwe: 'CWE-434',
                    owasp: 'A01:2021 – Broken Access Control',
                    confidence: 0.5
                });
            }
        }
    }

    private checkForMissingInputValidation(content: string, filePath: string): void {
        // Check for input validation patterns
        if (content.includes('req.body') || content.includes('req.query') || content.includes('req.params')) {
            const hasValidation = /(?:validate|sanitize|escape|zod|joi)/.test(content.toLowerCase());
            if (!hasValidation) {
                this.addIssue({
                    type: 'bad_practice',
                    severity: 'medium',
                    file: filePath,
                    line: 1,
                    message: 'Input validation may be missing',
                    description: 'Request data is used without apparent validation',
                    recommendation: 'Implement input validation and sanitization for all user inputs',
                    cwe: 'CWE-20',
                    owasp: 'A03:2021 – Injection',
                    confidence: 0.4
                });
            }
        }
    }

    private addIssue(issue: Omit<SecurityIssue, 'id'>): void {
        this.issues.push({
            id: \`issue_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`,
            ...issue
        });
    }

    private shouldAnalyzeFile(fileName: string, extensions: string[]): boolean {
        return extensions.some(ext => fileName.endsWith(ext));
    }

    private isTestFile(fileName: string): boolean {
        return /\\.(test|spec)\\.(js|ts|tsx|jsx)$/.test(fileName) || 
               fileName.includes('__tests__');
    }

    private generateAnalysisResult(): AnalysisResult {
        const summary = {
            critical: this.issues.filter(i => i.severity === 'critical').length,
            high: this.issues.filter(i => i.severity === 'high').length,
            medium: this.issues.filter(i => i.severity === 'medium').length,
            low: this.issues.filter(i => i.severity === 'low').length
        };

        const owaspCategories = [
            'A01:2021 – Broken Access Control',
            'A02:2021 – Cryptographic Failures',
            'A03:2021 – Injection',
            'A04:2021 – Insecure Design',
            'A05:2021 – Security Misconfiguration',
            'A06:2021 – Vulnerable and Outdated Components',
            'A07:2021 – Identification and Authentication Failures',
            'A08:2021 – Software and Data Integrity Failures',
            'A09:2021 – Security Logging and Monitoring Failures',
            'A10:2021 – Server-Side Request Forgery (SSRF)'
        ];

        const owaspTop10 = owaspCategories.map(category => {
            const issues = this.issues.filter(i => i.owasp === category).length;
            return {
                category,
                issues,
                status: issues === 0 ? 'pass' as const : 'fail' as const
            };
        });

        // Simplified SANS Top 25 mapping
        const sans25 = [
            { category: 'CWE-79: Cross-site Scripting', issues: this.issues.filter(i => i.cwe === 'CWE-79').length },
            { category: 'CWE-89: SQL Injection', issues: this.issues.filter(i => i.cwe === 'CWE-89').length },
            { category: 'CWE-20: Input Validation', issues: this.issues.filter(i => i.cwe === 'CWE-20').length }
        ].map(item => ({
            ...item,
            status: item.issues === 0 ? 'pass' as const : 'fail' as const
        }));

        return {
            totalFiles: this.fileCount,
            totalLines: this.lineCount,
            issues: this.issues,
            summary,
            compliance: {
                owaspTop10,
                sans25
            }
        };
    }
}`;

    fs.writeFileSync(path.join(utilsDir, 'code-security-analyzer.ts'), analyzerContent);
}

function createSecureCodingGuidelines(rootDir, appName) {
    const guidelinesContent = `# 🔐 Secure Coding Guidelines for ${appName}

## Table of Contents
1. [Input Validation](#input-validation)
2. [Authentication & Authorization](#authentication--authorization)
3. [Data Protection](#data-protection)
4. [Error Handling](#error-handling)
5. [Logging & Monitoring](#logging--monitoring)
6. [Dependency Management](#dependency-management)
7. [Configuration Security](#configuration-security)
8. [Code Review Checklist](#code-review-checklist)

## Input Validation

### ✅ DO
- **Always validate user input** on both client and server side
- **Use allowlists** instead of denylists for input validation
- **Sanitize HTML content** using DOMPurify or similar libraries
- **Use Zod or Joi** for schema validation
- **Validate file uploads** (type, size, content)

\`\`\`typescript
import { z } from 'zod';
import DOMPurify from 'dompurify';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150)
});

function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong'] });
}
\`\`\`

### ❌ DON'T
- Trust user input without validation
- Use client-side validation as the only validation
- Build SQL queries with string concatenation
- Allow unrestricted file uploads

## Authentication & Authorization

### ✅ DO
- **Implement proper session management**
- **Use secure password hashing** (bcrypt with salt rounds ≥ 12)
- **Enable MFA** for sensitive operations
- **Implement account lockout** after failed attempts
- **Use secure JWT tokens** with appropriate expiration

\`\`\`typescript
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

function generateJWT(userId: string): string {
  return jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET!,
    { expiresIn: '15m', issuer: '${appName}' }
  );
}
\`\`\`

### ❌ DON'T
- Store passwords in plain text
- Use weak hashing algorithms (MD5, SHA1)
- Implement custom authentication without expertise
- Store sensitive data in JWT tokens

## Data Protection

### ✅ DO
- **Encrypt sensitive data** at rest and in transit
- **Use HTTPS everywhere**
- **Implement proper key management**
- **Follow data minimization principles**
- **Implement secure data deletion**

\`\`\`typescript
import crypto from 'crypto';

class DataEncryption {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

  encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key);
    cipher.setAAD(Buffer.from('additional-data'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }
}
\`\`\`

### ❌ DON'T
- Store sensitive data in plain text
- Use deprecated encryption algorithms
- Hard-code encryption keys
- Expose sensitive data in logs

## Error Handling

### ✅ DO
- **Implement consistent error handling**
- **Log errors securely** without exposing sensitive data
- **Use generic error messages** for users
- **Implement proper fallback mechanisms**

\`\`\`typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

function handleError(error: Error, req: Request, res: Response) {
  // Log detailed error internally
  logger.error({
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  // Send generic error to user
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
}
\`\`\`

### ❌ DON'T
- Expose stack traces to users
- Log sensitive data in error messages
- Return detailed database errors to clients
- Ignore error handling

## Logging & Monitoring

### ✅ DO
- **Log security events** (logins, failures, privilege changes)
- **Monitor for suspicious patterns**
- **Implement log rotation** and retention policies
- **Protect log files** from unauthorized access
- **Use structured logging**

\`\`\`typescript
import winston from 'winston';

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: '${appName}' },
  transports: [
    new winston.transports.File({ filename: 'security.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

function logSecurityEvent(event: {
  type: string;
  userId?: string;
  ip: string;
  success: boolean;
}) {
  securityLogger.info({
    timestamp: new Date().toISOString(),
    event: 'security',
    ...event
  });
}
\`\`\`

### ❌ DON'T
- Log passwords or sensitive data
- Allow log injection attacks
- Store logs without access controls
- Ignore security monitoring

## Dependency Management

### ✅ DO
- **Keep dependencies up to date**
- **Use \`npm audit\`** regularly to check for vulnerabilities
- **Pin dependency versions** in production
- **Review third-party code** before using
- **Use Software Composition Analysis** tools

\`\`\`bash
# Regular security checks
npm audit
npm audit fix

# Check for outdated packages
npm outdated

# Use exact versions in package.json
{
  "dependencies": {
    "express": "4.18.2",  // Exact version
    "bcrypt": "~5.1.0"    // Patch updates only
  }
}
\`\`\`

### ❌ DON'T
- Use dependencies with known vulnerabilities
- Install packages from untrusted sources
- Use wildcard version ranges in production
- Ignore dependency security advisories

## Configuration Security

### ✅ DO
- **Use environment variables** for configuration
- **Validate configuration values**
- **Implement secure defaults**
- **Separate configs** for different environments
- **Encrypt sensitive configuration**

\`\`\`typescript
import { z } from 'zod';

const configSchema = z.object({
  PORT: z.string().transform(val => parseInt(val)).pipe(z.number().min(1).max(65535)),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().length(64) // 32 bytes in hex
});

export const config = configSchema.parse(process.env);
\`\`\`

### ❌ DON'T
- Hard-code sensitive values
- Use weak default passwords
- Commit .env files to version control
- Use the same secrets across environments

## Code Review Checklist

### Security Review Points
- [ ] **Input validation** implemented for all user inputs
- [ ] **SQL injection** prevention (parameterized queries)
- [ ] **XSS prevention** (proper escaping, CSP headers)
- [ ] **Authentication** properly implemented
- [ ] **Authorization** checks in place
- [ ] **Sensitive data** not exposed in logs or responses
- [ ] **Error handling** doesn't leak information
- [ ] **Dependencies** are up to date and secure
- [ ] **Configuration** uses secure defaults
- [ ] **HTTPS** enforced in production
- [ ] **Security headers** properly configured
- [ ] **Rate limiting** implemented where needed
- [ ] **File uploads** properly validated
- [ ] **Session management** is secure

### Pre-commit Hooks
\`\`\`json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run security-lint && npm audit",
      "pre-push": "npm run test:security"
    }
  }
}
\`\`\`

## Security Testing

### Automated Testing
- **Unit tests** for security functions
- **Integration tests** for authentication flows
- **Dependency vulnerability** scanning
- **Static code analysis** for security issues
- **Security linting** with ESLint security plugins

\`\`\`bash
# Run security tests
npm run security-lint
npm audit
npm run test:security

# Static analysis
npx eslint --config .eslintrc.security.json src/
\`\`\`

### Manual Testing
- **Penetration testing** for critical applications
- **Code review** with security focus
- **Configuration review**
- **Access control testing**
- **Input fuzzing** for validation testing

## Compliance & Standards

### OWASP Top 10 2021
1. ✅ Broken Access Control
2. ✅ Cryptographic Failures  
3. ✅ Injection
4. ✅ Insecure Design
5. ✅ Security Misconfiguration
6. ✅ Vulnerable and Outdated Components
7. ✅ Identification and Authentication Failures
8. ✅ Software and Data Integrity Failures
9. ✅ Security Logging and Monitoring Failures
10. ✅ Server-Side Request Forgery (SSRF)

### Security Tools Integration
\`\`\`json
{
  "scripts": {
    "security-lint": "node scripts/security-lint.js",
    "security-audit": "npm audit && npm run security-lint",
    "security-test": "npm run test && npm run security-audit",
    "pre-deploy": "npm run security-test"
  }
}
\`\`\`

---

## 🚨 Emergency Response

### Security Incident Response
1. **Immediate containment** of the threat
2. **Assessment** of the impact and scope
3. **Evidence preservation** for investigation
4. **Communication** to stakeholders
5. **Recovery** and system restoration
6. **Lessons learned** and process improvement

### Contact Information
- **Security Team**: security@${appName}.com
- **Incident Response**: incident-response@${appName}.com
- **Emergency Hotline**: [Emergency Contact Number]

---

*This document should be reviewed and updated regularly to reflect the latest security best practices and threat landscape.*`;

    fs.writeFileSync(path.join(rootDir, 'SECURITY_GUIDELINES.md'), guidelinesContent);
}
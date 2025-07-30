/**
 * CODAI Vulnerability Scanner
 * 
 * Advanced security vulnerability detection for code analysis
 * Integrates with security databases and performs pattern-based detection
 */

import { EventEmitter } from 'events';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface VulnerabilityConfig {
  enableOWASP: boolean;
  enableCVECheck: boolean;
  enableDependencyAudit: boolean;
  enablePatternDetection: boolean;
  securityRulesPath?: string;
  customPatterns?: SecurityPattern[];
  severityThreshold: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityPattern {
  id: string;
  name: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  cwe?: string; // Common Weakness Enumeration
  owasp?: string; // OWASP Top 10 category
}

export interface VulnerabilityResult {
  vulnerabilities: SecurityVulnerability[];
  summary: VulnerabilitySummary;
  processing_time: number;
  scanned_files: number;
  rules_applied: number;
}

export interface SecurityVulnerability {
  id: string;
  type: 'injection' | 'authentication' | 'encryption' | 'authorization' | 'configuration' | 'dependency' | 'xss' | 'csrf' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  file: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  code: string;
  cwe?: string;
  owasp?: string;
  cvss_score?: number;
  remediation: string;
  references: string[];
  confidence: number;
}

export interface VulnerabilitySummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  by_type: Record<string, number>;
  risk_score: number;
}

export interface DependencyVulnerability {
  package: string;
  version: string;
  vulnerability: string;
  severity: string;
  cve: string;
  patched_versions: string[];
  recommendation: string;
}

export class VulnerabilityScanner extends EventEmitter {
  private config: VulnerabilityConfig;
  private securityPatterns: SecurityPattern[] = [];
  private statistics = {
    filesScanned: 0,
    vulnerabilitiesFound: 0,
    falsePositives: 0,
    scanTime: 0,
    lastScanDate: new Date()
  };

  constructor(config: VulnerabilityConfig) {
    super();
    this.config = config;
    this.initializeSecurityPatterns();
  }

  private initializeSecurityPatterns(): void {
    // Initialize default security patterns
    this.securityPatterns = [
      ...this.getOWASPPatterns(),
      ...this.getInjectionPatterns(),
      ...this.getAuthenticationPatterns(),
      ...this.getEncryptionPatterns(),
      ...this.getXSSPatterns(),
      ...this.getCSRFPatterns(),
      ...(this.config.customPatterns || [])
    ];

    console.log(`✅ Initialized ${this.securityPatterns.length} security patterns`);
  }

  /**
   * Scan code for security vulnerabilities
   */
  async scanCode(
    sourceCode: string,
    filePath: string,
    language: string = 'typescript'
  ): Promise<VulnerabilityResult> {
    const startTime = Date.now();
    const vulnerabilities: SecurityVulnerability[] = [];

    try {
      this.emit('scanStarted', { file: filePath });

      // Pattern-based vulnerability detection
      if (this.config.enablePatternDetection) {
        const patternVulns = await this.detectPatternVulnerabilities(
          sourceCode,
          filePath,
          language
        );
        vulnerabilities.push(...patternVulns);
      }

      // OWASP Top 10 specific checks
      if (this.config.enableOWASP) {
        const owaspVulns = await this.detectOWASPVulnerabilities(
          sourceCode,
          filePath,
          language
        );
        vulnerabilities.push(...owaspVulns);
      }

      // Filter by severity threshold
      const filteredVulns = this.filterBySeverity(vulnerabilities);

      // Generate summary
      const summary = this.generateSummary(filteredVulns);

      const processingTime = Date.now() - startTime;

      const result: VulnerabilityResult = {
        vulnerabilities: filteredVulns.sort((a, b) =>
          this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity)
        ),
        summary,
        processing_time: processingTime,
        scanned_files: 1,
        rules_applied: this.securityPatterns.length
      };

      // Update statistics
      this.updateStatistics(result);

      this.emit('scanCompleted', result);
      return result;

    } catch (error) {
      this.emit('scanError', error);
      console.error('❌ Vulnerability scan failed:', error);
      throw error;
    }
  }

  /**
   * Scan project dependencies for vulnerabilities
   */
  async scanDependencies(projectPath: string): Promise<DependencyVulnerability[]> {
    if (!this.config.enableDependencyAudit) {
      return [];
    }

    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

      // Run npm audit
      const auditResult = await this.runNpmAudit(projectPath);

      // Run yarn audit if yarn.lock exists
      const yarnLockPath = path.join(projectPath, 'yarn.lock');
      let yarnAuditResult = null;
      try {
        await fs.access(yarnLockPath);
        yarnAuditResult = await this.runYarnAudit(projectPath);
      } catch {
        // yarn.lock doesn't exist
      }

      // Combine and process results
      const vulnerabilities = this.processDependencyAuditResults(
        auditResult,
        yarnAuditResult,
        packageJson
      );

      this.emit('dependencyScanCompleted', vulnerabilities);
      return vulnerabilities;

    } catch (error) {
      console.error('❌ Dependency vulnerability scan failed:', error);
      return [];
    }
  }

  /**
   * Batch scan multiple files
   */
  async scanProject(projectPath: string): Promise<VulnerabilityResult> {
    const startTime = Date.now();
    const allVulnerabilities: SecurityVulnerability[] = [];
    let scannedFiles = 0;

    try {
      const files = await this.findCodeFiles(projectPath);

      this.emit('projectScanStarted', { totalFiles: files.length });

      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const language = this.detectLanguage(file);
          const result = await this.scanCode(content, file, language);

          allVulnerabilities.push(...result.vulnerabilities);
          scannedFiles++;

          this.emit('fileScanned', {
            file,
            vulnerabilities: result.vulnerabilities.length,
            progress: Math.round((scannedFiles / files.length) * 100)
          });
        } catch (error) {
          console.error(`❌ Failed to scan file ${file}:`, error);
        }
      }

      // Scan dependencies
      const dependencyVulns = await this.scanDependencies(projectPath);

      // Convert dependency vulnerabilities to security vulnerabilities
      const convertedDepVulns = this.convertDependencyVulnerabilities(dependencyVulns);
      allVulnerabilities.push(...convertedDepVulns);

      const summary = this.generateSummary(allVulnerabilities);
      const processingTime = Date.now() - startTime;

      const result: VulnerabilityResult = {
        vulnerabilities: allVulnerabilities.sort((a, b) =>
          this.getSeverityWeight(b.severity) - this.getSeverityWeight(a.severity)
        ),
        summary,
        processing_time: processingTime,
        scanned_files: scannedFiles,
        rules_applied: this.securityPatterns.length
      };

      this.emit('projectScanCompleted', result);
      return result;

    } catch (error) {
      console.error('❌ Project vulnerability scan failed:', error);
      throw error;
    }
  }

  private async detectPatternVulnerabilities(
    code: string,
    filePath: string,
    language: string
  ): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    const lines = code.split('\n');

    for (const pattern of this.securityPatterns) {
      const matches = code.matchAll(new RegExp(pattern.pattern, 'gm'));

      for (const match of matches) {
        if (match.index !== undefined) {
          const lineNumber = code.substring(0, match.index).split('\n').length;
          const columnNumber = match.index - code.lastIndexOf('\n', match.index - 1) - 1;

          const vulnerability: SecurityVulnerability = {
            id: `${pattern.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: this.categorizeVulnerability(pattern.id),
            severity: pattern.severity,
            title: pattern.name,
            description: pattern.description,
            file: filePath,
            line: lineNumber,
            column: columnNumber,
            code: lines[lineNumber - 1] || '',
            cwe: pattern.cwe,
            owasp: pattern.owasp,
            remediation: pattern.recommendation,
            references: this.getReferences(pattern.id),
            confidence: this.calculateConfidence(pattern, match[0], code)
          };

          // Only add if confidence is above threshold
          if (vulnerability.confidence > 0.5) {
            vulnerabilities.push(vulnerability);
          }
        }
      }
    }

    return vulnerabilities;
  }

  private async detectOWASPVulnerabilities(
    code: string,
    filePath: string,
    language: string
  ): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];

    // A01:2021 – Broken Access Control
    vulnerabilities.push(...await this.detectAccessControlIssues(code, filePath));

    // A02:2021 – Cryptographic Failures
    vulnerabilities.push(...await this.detectCryptographicFailures(code, filePath));

    // A03:2021 – Injection
    vulnerabilities.push(...await this.detectInjectionVulnerabilities(code, filePath));

    // A04:2021 – Insecure Design
    vulnerabilities.push(...await this.detectInsecureDesign(code, filePath));

    // A05:2021 – Security Misconfiguration
    vulnerabilities.push(...await this.detectSecurityMisconfiguration(code, filePath));

    // A06:2021 – Vulnerable and Outdated Components (handled in dependency scan)

    // A07:2021 – Identification and Authentication Failures
    vulnerabilities.push(...await this.detectAuthenticationFailures(code, filePath));

    // A08:2021 – Software and Data Integrity Failures
    vulnerabilities.push(...await this.detectIntegrityFailures(code, filePath));

    // A09:2021 – Security Logging and Monitoring Failures
    vulnerabilities.push(...await this.detectLoggingFailures(code, filePath));

    // A10:2021 – Server-Side Request Forgery (SSRF)
    vulnerabilities.push(...await this.detectSSRFVulnerabilities(code, filePath));

    return vulnerabilities;
  }

  // OWASP-specific detection methods
  private async detectAccessControlIssues(code: string, filePath: string): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    const lines = code.split('\n');

    // Check for missing authorization checks
    const authPatterns = [
      /req\.user\s*&&/g,
      /user\.role\s*===/g,
      /isAdmin\s*\(/g,
      /hasPermission\s*\(/g
    ];

    // Check for routes without authorization
    const routePattern = /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
    let routeMatch;

    while ((routeMatch = routePattern.exec(code)) !== null) {
      const routeIndex = routeMatch.index;
      const lineNumber = code.substring(0, routeIndex).split('\n').length;

      // Check if this route has authorization within next 10 lines
      const routeCode = lines.slice(lineNumber - 1, lineNumber + 10).join('\n');
      const hasAuth = authPatterns.some(pattern => pattern.test(routeCode));

      if (!hasAuth && !routeMatch[2].includes('public')) {
        vulnerabilities.push({
          id: `access-control-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'authorization',
          severity: 'high',
          title: 'Missing Authorization Check',
          description: `Route ${routeMatch[2]} lacks proper authorization checks`,
          file: filePath,
          line: lineNumber,
          column: routeMatch.index - code.lastIndexOf('\n', routeMatch.index - 1) - 1,
          code: lines[lineNumber - 1] || '',
          cwe: 'CWE-862',
          owasp: 'A01:2021',
          remediation: 'Add proper authorization middleware or checks before processing the request',
          references: ['https://owasp.org/Top10/A01_2021-Broken_Access_Control/'],
          confidence: 0.8
        });
      }
    }

    return vulnerabilities;
  }

  private async detectCryptographicFailures(code: string, filePath: string): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    const lines = code.split('\n');

    // Check for weak encryption
    const weakCryptoPatterns = [
      { pattern: /crypto\.createCipher\s*\(\s*['"`]des['"`]/g, name: 'Weak DES Encryption' },
      { pattern: /crypto\.createCipher\s*\(\s*['"`]rc4['"`]/g, name: 'Weak RC4 Encryption' },
      { pattern: /crypto\.createHash\s*\(\s*['"`]md5['"`]/g, name: 'Weak MD5 Hash' },
      { pattern: /crypto\.createHash\s*\(\s*['"`]sha1['"`]/g, name: 'Weak SHA1 Hash' },
      { pattern: /Math\.random\s*\(\s*\)/g, name: 'Cryptographically Weak Random' }
    ];

    for (const { pattern, name } of weakCryptoPatterns) {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        const lineNumber = code.substring(0, match.index).split('\n').length;

        vulnerabilities.push({
          id: `crypto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'encryption',
          severity: name.includes('Random') ? 'medium' : 'high',
          title: name,
          description: `Usage of cryptographically weak algorithm: ${name}`,
          file: filePath,
          line: lineNumber,
          column: match.index - code.lastIndexOf('\n', match.index - 1) - 1,
          code: lines[lineNumber - 1] || '',
          cwe: 'CWE-327',
          owasp: 'A02:2021',
          remediation: 'Use strong cryptographic algorithms like AES-256, SHA-256, or crypto.randomBytes()',
          references: ['https://owasp.org/Top10/A02_2021-Cryptographic_Failures/'],
          confidence: 0.9
        });
      }
    }

    return vulnerabilities;
  }

  private async detectInjectionVulnerabilities(code: string, filePath: string): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];
    const lines = code.split('\n');

    // SQL Injection patterns
    const sqlInjectionPatterns = [
      /query\s*\(\s*['"`][^'"`]*\$\{[^}]+\}[^'"`]*['"`]/g,
      /query\s*\(\s*['"`][^'"`]*\+[^'"`]*['"`]/g,
      /exec\s*\(\s*['"`][^'"`]*\$\{[^}]+\}[^'"`]*['"`]/g
    ];

    for (const pattern of sqlInjectionPatterns) {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        const lineNumber = code.substring(0, match.index).split('\n').length;

        vulnerabilities.push({
          id: `sql-injection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'injection',
          severity: 'critical',
          title: 'SQL Injection Vulnerability',
          description: 'Potential SQL injection through string concatenation or template literals',
          file: filePath,
          line: lineNumber,
          column: match.index - code.lastIndexOf('\n', match.index - 1) - 1,
          code: lines[lineNumber - 1] || '',
          cwe: 'CWE-89',
          owasp: 'A03:2021',
          remediation: 'Use parameterized queries or prepared statements',
          references: ['https://owasp.org/Top10/A03_2021-Injection/'],
          confidence: 0.85
        });
      }
    }

    // Command Injection patterns
    const cmdInjectionPatterns = [
      /exec\s*\(\s*['"`][^'"`]*\$\{[^}]+\}[^'"`]*['"`]/g,
      /spawn\s*\(\s*['"`][^'"`]*\$\{[^}]+\}[^'"`]*['"`]/g,
      /system\s*\(\s*['"`][^'"`]*\$\{[^}]+\}[^'"`]*['"`]/g
    ];

    for (const pattern of cmdInjectionPatterns) {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        const lineNumber = code.substring(0, match.index).split('\n').length;

        vulnerabilities.push({
          id: `cmd-injection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'injection',
          severity: 'critical',
          title: 'Command Injection Vulnerability',
          description: 'Potential command injection through user-controlled input',
          file: filePath,
          line: lineNumber,
          column: match.index - code.lastIndexOf('\n', match.index - 1) - 1,
          code: lines[lineNumber - 1] || '',
          cwe: 'CWE-78',
          owasp: 'A03:2021',
          remediation: 'Sanitize user input and use safe APIs for system commands',
          references: ['https://owasp.org/Top10/A03_2021-Injection/'],
          confidence: 0.8
        });
      }
    }

    return vulnerabilities;
  }

  // Additional OWASP detection methods would be implemented here...
  private async detectInsecureDesign(code: string, filePath: string): Promise<SecurityVulnerability[]> {
    // Implementation for A04:2021 – Insecure Design
    return [];
  }

  private async detectSecurityMisconfiguration(code: string, filePath: string): Promise<SecurityVulnerability[]> {
    // Implementation for A05:2021 – Security Misconfiguration
    return [];
  }

  private async detectAuthenticationFailures(code: string, filePath: string): Promise<SecurityVulnerability[]> {
    // Implementation for A07:2021 – Identification and Authentication Failures
    return [];
  }

  private async detectIntegrityFailures(code: string, filePath: string): Promise<SecurityVulnerability[]> {
    // Implementation for A08:2021 – Software and Data Integrity Failures
    return [];
  }

  private async detectLoggingFailures(code: string, filePath: string): Promise<SecurityVulnerability[]> {
    // Implementation for A09:2021 – Security Logging and Monitoring Failures
    return [];
  }

  private async detectSSRFVulnerabilities(code: string, filePath: string): Promise<SecurityVulnerability[]> {
    // Implementation for A10:2021 – Server-Side Request Forgery (SSRF)
    return [];
  }

  // Security pattern definitions
  private getOWASPPatterns(): SecurityPattern[] {
    return [
      {
        id: 'owasp-a01-broken-access-control',
        name: 'Broken Access Control',
        pattern: /(?:req\.query|req\.params|req\.body)\.[^;]+(?:admin|role|permission)/gi,
        severity: 'high',
        description: 'Potential broken access control through user-controlled parameters',
        recommendation: 'Implement proper authorization checks and validate user permissions',
        cwe: 'CWE-862',
        owasp: 'A01:2021'
      },
      {
        id: 'owasp-a02-crypto-failures',
        name: 'Cryptographic Failures',
        pattern: /(?:md5|sha1|des|rc4)\s*\(/gi,
        severity: 'high',
        description: 'Usage of weak cryptographic algorithms',
        recommendation: 'Use strong cryptographic algorithms like AES-256, SHA-256',
        cwe: 'CWE-327',
        owasp: 'A02:2021'
      },
      {
        id: 'owasp-a03-injection',
        name: 'Injection Vulnerability',
        pattern: /(?:query|exec|system)\s*\(\s*['"`][^'"`]*(?:\$\{|[+])/gi,
        severity: 'critical',
        description: 'Potential injection vulnerability through string concatenation',
        recommendation: 'Use parameterized queries and input validation',
        cwe: 'CWE-89',
        owasp: 'A03:2021'
      }
    ];
  }

  private getInjectionPatterns(): SecurityPattern[] {
    return [
      {
        id: 'sql-injection-concat',
        name: 'SQL Injection via Concatenation',
        pattern: /(?:SELECT|INSERT|UPDATE|DELETE).*(?:\+|\$\{)/gi,
        severity: 'critical',
        description: 'SQL injection through string concatenation',
        recommendation: 'Use parameterized queries',
        cwe: 'CWE-89'
      },
      {
        id: 'nosql-injection',
        name: 'NoSQL Injection',
        pattern: /\{\s*\$(?:where|regex|gt|lt|ne)\s*:/gi,
        severity: 'high',
        description: 'Potential NoSQL injection vulnerability',
        recommendation: 'Sanitize user input and use proper query builders',
        cwe: 'CWE-943'
      }
    ];
  }

  private getAuthenticationPatterns(): SecurityPattern[] {
    return [
      {
        id: 'hardcoded-password',
        name: 'Hardcoded Password',
        pattern: /(?:password|passwd|pwd)\s*[:=]\s*['"`][^'"`]{6,}['"`]/gi,
        severity: 'critical',
        description: 'Hardcoded password detected',
        recommendation: 'Use environment variables or secure configuration',
        cwe: 'CWE-798'
      },
      {
        id: 'weak-jwt-secret',
        name: 'Weak JWT Secret',
        pattern: /jwt\.sign\s*\([^,]+,\s*['"`][^'"`]{1,16}['"`]/gi,
        severity: 'high',
        description: 'JWT signed with weak secret',
        recommendation: 'Use strong, randomly generated JWT secrets',
        cwe: 'CWE-327'
      }
    ];
  }

  private getEncryptionPatterns(): SecurityPattern[] {
    return [
      {
        id: 'weak-random',
        name: 'Cryptographically Weak Random',
        pattern: /Math\.random\s*\(\s*\)/g,
        severity: 'medium',
        description: 'Math.random() is not cryptographically secure',
        recommendation: 'Use crypto.randomBytes() for cryptographic purposes',
        cwe: 'CWE-338'
      }
    ];
  }

  private getXSSPatterns(): SecurityPattern[] {
    return [
      {
        id: 'dom-xss',
        name: 'DOM-based XSS',
        pattern: /innerHTML\s*=\s*.*(?:req\.|params\.|query\.|body\.)/gi,
        severity: 'high',
        description: 'Potential DOM-based XSS vulnerability',
        recommendation: 'Sanitize user input before inserting into DOM',
        cwe: 'CWE-79'
      }
    ];
  }

  private getCSRFPatterns(): SecurityPattern[] {
    return [
      {
        id: 'missing-csrf',
        name: 'Missing CSRF Protection',
        pattern: /app\.(post|put|delete)\s*\([^)]+\)\s*,\s*(?!.*csrf)/gi,
        severity: 'medium',
        description: 'State-changing endpoint without CSRF protection',
        recommendation: 'Implement CSRF tokens for state-changing operations',
        cwe: 'CWE-352'
      }
    ];
  }

  // Helper methods
  private filterBySeverity(vulnerabilities: SecurityVulnerability[]): SecurityVulnerability[] {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const threshold = severityOrder[this.config.severityThreshold];

    return vulnerabilities.filter(vuln =>
      severityOrder[vuln.severity] >= threshold
    );
  }

  private generateSummary(vulnerabilities: SecurityVulnerability[]): VulnerabilitySummary {
    const summary: VulnerabilitySummary = {
      total: vulnerabilities.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      by_type: {},
      risk_score: 0
    };

    vulnerabilities.forEach(vuln => {
      summary[vuln.severity]++;
      summary.by_type[vuln.type] = (summary.by_type[vuln.type] || 0) + 1;
    });

    // Calculate risk score (0-100)
    summary.risk_score = Math.min(100,
      summary.critical * 25 +
      summary.high * 10 +
      summary.medium * 5 +
      summary.low * 1
    );

    return summary;
  }

  private getSeverityWeight(severity: string): number {
    const weights = { critical: 4, high: 3, medium: 2, low: 1 };
    return weights[severity as keyof typeof weights] || 0;
  }

  private categorizeVulnerability(patternId: string): SecurityVulnerability['type'] {
    if (patternId.includes('injection')) return 'injection';
    if (patternId.includes('auth')) return 'authentication';
    if (patternId.includes('crypto') || patternId.includes('encrypt')) return 'encryption';
    if (patternId.includes('access') || patternId.includes('authorization')) return 'authorization';
    if (patternId.includes('config')) return 'configuration';
    if (patternId.includes('xss')) return 'xss';
    if (patternId.includes('csrf')) return 'csrf';
    return 'other';
  }

  private calculateConfidence(pattern: SecurityPattern, match: string, context: string): number {
    let confidence = 0.7; // Base confidence

    // Increase confidence for exact matches
    if (match.toLowerCase().includes('password') || match.toLowerCase().includes('secret')) {
      confidence += 0.2;
    }

    // Decrease confidence for common false positives
    if (context.includes('test') || context.includes('example') || context.includes('mock')) {
      confidence -= 0.3;
    }

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  private getReferences(patternId: string): string[] {
    const baseReferences = [
      'https://owasp.org/www-project-top-ten/',
      'https://cwe.mitre.org/'
    ];

    // Add specific references based on pattern
    if (patternId.includes('owasp')) {
      baseReferences.push('https://owasp.org/Top10/');
    }

    return baseReferences;
  }

  private async runNpmAudit(projectPath: string): Promise<any> {
    try {
      const { stdout } = await execAsync('npm audit --json', { cwd: projectPath });
      return JSON.parse(stdout);
    } catch (error: any) {
      // npm audit returns non-zero exit code when vulnerabilities are found
      if (error.stdout) {
        return JSON.parse(error.stdout);
      }
      throw error;
    }
  }

  private async runYarnAudit(projectPath: string): Promise<any> {
    try {
      const { stdout } = await execAsync('yarn audit --json', { cwd: projectPath });
      return JSON.parse(stdout);
    } catch (error: any) {
      if (error.stdout) {
        return JSON.parse(error.stdout);
      }
      throw error;
    }
  }

  private processDependencyAuditResults(
    npmResult: any,
    yarnResult: any,
    packageJson: any
  ): DependencyVulnerability[] {
    const vulnerabilities: DependencyVulnerability[] = [];

    // Process npm audit results
    if (npmResult?.vulnerabilities) {
      Object.entries(npmResult.vulnerabilities).forEach(([pkg, data]: [string, any]) => {
        if (data.via && Array.isArray(data.via)) {
          data.via.forEach((vuln: any) => {
            if (typeof vuln === 'object') {
              vulnerabilities.push({
                package: pkg,
                version: data.version || 'unknown',
                vulnerability: vuln.title || 'Unknown vulnerability',
                severity: vuln.severity || 'unknown',
                cve: vuln.cve || '',
                patched_versions: data.fixAvailable ? [data.fixAvailable.version] : [],
                recommendation: data.fixAvailable
                  ? `Update to version ${data.fixAvailable.version}`
                  : 'No fix available'
              });
            }
          });
        }
      });
    }

    return vulnerabilities;
  }

  private convertDependencyVulnerabilities(
    depVulns: DependencyVulnerability[]
  ): SecurityVulnerability[] {
    return depVulns.map(depVuln => ({
      id: `dep-${depVuln.cve || Date.now()}`,
      type: 'dependency' as const,
      severity: depVuln.severity as 'low' | 'medium' | 'high' | 'critical',
      title: `${depVuln.package}: ${depVuln.vulnerability}`,
      description: `Vulnerability in dependency ${depVuln.package}@${depVuln.version}`,
      file: 'package.json',
      line: 1,
      column: 1,
      code: `"${depVuln.package}": "${depVuln.version}"`,
      cve: depVuln.cve,
      remediation: depVuln.recommendation,
      references: depVuln.cve ? [`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${depVuln.cve}`] : [],
      confidence: 0.95
    }));
  }

  private async findCodeFiles(projectPath: string): Promise<string[]> {
    const files: string[] = [];
    const extensions = ['.js', '.ts', '.jsx', '.tsx', '.vue', '.php', '.py', '.java', '.cs'];

    const walkDir = async (dir: string) => {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await walkDir(fullPath);
        } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    };

    await walkDir(projectPath);
    return files;
  }

  private detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const languageMap: Record<string, string> = {
      '.js': 'javascript',
      '.ts': 'typescript',
      '.jsx': 'jsx',
      '.tsx': 'tsx',
      '.vue': 'vue',
      '.php': 'php',
      '.py': 'python',
      '.java': 'java',
      '.cs': 'csharp'
    };

    return languageMap[ext] || 'unknown';
  }

  private updateStatistics(result: VulnerabilityResult): void {
    this.statistics.filesScanned += result.scanned_files;
    this.statistics.vulnerabilitiesFound += result.vulnerabilities.length;
    this.statistics.scanTime += result.processing_time;
    this.statistics.lastScanDate = new Date();
  }

  /**
   * Get scanner statistics
   */
  getStatistics() {
    return { ...this.statistics };
  }
}

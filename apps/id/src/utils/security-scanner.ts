/**
 * @fileoverview Security Scanner
 * @description Automated security vulnerability scanning
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface SecurityVulnerability {
    id: string;
    type: 'xss' | 'sql_injection' | 'csrf' | 'insecure_crypto' | 'path_traversal' | 'weak_auth' | 'info_disclosure';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    file: string;
    line: number;
    column?: number;
    evidence: string;
    recommendation: string;
    cwe?: string;
    cvss?: number;
}

export interface ScanResult {
    scanId: string;
    timestamp: Date;
    appName: string;
    vulnerabilities: SecurityVulnerability[];
    summary: {
        total: number;
        critical: number;
        high: number;
        medium: number;
        low: number;
    };
    scannedFiles: number;
    scanDuration: number;
}

export class SecurityScanner {
    private scanPatterns: Map<string, RegExp[]>;
    private excludedPatterns: RegExp[];

    constructor() {
        this.scanPatterns = new Map([
            ['xss', [
                /dangerouslySetInnerHTML/gi,
                /innerHTML\s*=/gi,
                /document\.write\(/gi,
                /eval\(/gi,
                /setTimeout\(.*string/gi,
                /setInterval\(.*string/gi
            ]],
            ['sql_injection', [
                /query\s*\+\s*['"]/gi,
                /execute\s*\([^)]*\+/gi,
                /\$\{[^}]*\}.*FROM/gi,
                /SELECT.*\$\{/gi,
                /INSERT.*\$\{/gi,
                /UPDATE.*\$\{/gi,
                /DELETE.*\$\{/gi
            ]],
            ['csrf', [
                /method\s*=\s*["']post["'](?![^>]*csrf)/gi,
                /fetch\([^)]*method\s*:\s*["']POST["'](?![^}]*csrf)/gi,
                /axios\.post\((?![^)]*csrf)/gi
            ]],
            ['insecure_crypto', [
                /crypto\.createHash\(['"]md5['"]\)/gi,
                /crypto\.createHash\(['"]sha1['"]\)/gi,
                /Math\.random\(\)/gi,
                /btoa\(/gi,
                /atob\(/gi
            ]],
            ['path_traversal', [
                /\.\.\/|\.\.\\/gi,
                /path\.join\([^)]*\.\./gi,
                /fs\.readFile\([^)]*\.\./gi,
                /require\([^)]*\.\./gi
            ]],
            ['weak_auth', [
                /password.*===.*['"'][^'"]{1,5}['"]/gi,
                /token.*===.*['"'][^'"]{1,10}['"]/gi,
                /secret.*['"'][^'"]{1,10}['"]/gi,
                /jwt.*['"'][^'"]{1,20}['"]/gi
            ]],
            ['info_disclosure', [
                /console\.log\([^)]*password/gi,
                /console\.log\([^)]*token/gi,
                /console\.log\([^)]*secret/gi,
                /alert\([^)]*password/gi,
                /process\.env/gi
            ]]
        ]);

        this.excludedPatterns = [
            /node_modules/,
            /\.git/,
            /dist/,
            /build/,
            /coverage/,
            /\.next/,
            /\.cache/
        ];
    }

    /**
     * Scan directory for security vulnerabilities
     */
    async scanDirectory(directoryPath: string): Promise<ScanResult> {
        const startTime = Date.now();
        const scanId = crypto.randomUUID();
        const vulnerabilities: SecurityVulnerability[] = [];
        let scannedFiles = 0;

        const files = await this.getFilesToScan(directoryPath);
        
        for (const filePath of files) {
            try {
                const fileVulns = await this.scanFile(filePath);
                vulnerabilities.push(...fileVulns);
                scannedFiles++;
            } catch (error) {
                console.warn(`Failed to scan file ${filePath}:`, error.message);
            }
        }

        const scanDuration = Date.now() - startTime;
        const summary = this.createSummary(vulnerabilities);

        return {
            scanId,
            timestamp: new Date(),
            appName: 'id',
            vulnerabilities,
            summary,
            scannedFiles,
            scanDuration
        };
    }

    /**
     * Scan individual file for vulnerabilities
     */
    async scanFile(filePath: string): Promise<SecurityVulnerability[]> {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        const vulnerabilities: SecurityVulnerability[] = [];

        for (const [type, patterns] of this.scanPatterns.entries()) {
            for (const pattern of patterns) {
                const matches = this.findMatches(content, pattern);
                
                for (const match of matches) {
                    const lineNumber = this.getLineNumber(content, match.index);
                    const vulnerability = this.createVulnerability(
                        type as any,
                        filePath,
                        lineNumber,
                        match.match,
                        lines[lineNumber - 1] || ''
                    );
                    vulnerabilities.push(vulnerability);
                }
            }
        }

        return vulnerabilities;
    }

    private async getFilesToScan(directoryPath: string): Promise<string[]> {
        const files: string[] = [];
        const extensions = ['.js', '.ts', '.tsx', '.jsx', '.vue', '.php', '.py', '.java'];

        const walkDir = (dir: string) => {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                
                if (this.isExcluded(fullPath)) {
                    continue;
                }

                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    walkDir(fullPath);
                } else if (extensions.includes(path.extname(fullPath))) {
                    files.push(fullPath);
                }
            }
        };

        walkDir(directoryPath);
        return files;
    }

    private isExcluded(filePath: string): boolean {
        return this.excludedPatterns.some(pattern => pattern.test(filePath));
    }

    private findMatches(content: string, pattern: RegExp): Array<{ match: string; index: number }> {
        const matches = [];
        let match;
        
        while ((match = pattern.exec(content)) !== null) {
            matches.push({
                match: match[0],
                index: match.index
            });
            
            if (!pattern.global) break;
        }
        
        return matches;
    }

    private getLineNumber(content: string, index: number): number {
        const beforeMatch = content.substring(0, index);
        return beforeMatch.split('\n').length;
    }

    private createVulnerability(
        type: SecurityVulnerability['type'],
        file: string,
        line: number,
        evidence: string,
        context: string
    ): SecurityVulnerability {
        const vulnerabilityConfig = this.getVulnerabilityConfig(type);
        
        return {
            id: crypto.randomUUID(),
            type,
            severity: vulnerabilityConfig.severity,
            title: vulnerabilityConfig.title,
            description: vulnerabilityConfig.description,
            file: path.relative(process.cwd(), file),
            line,
            evidence: evidence.trim(),
            recommendation: vulnerabilityConfig.recommendation,
            cwe: vulnerabilityConfig.cwe,
            cvss: vulnerabilityConfig.cvss
        };
    }

    private getVulnerabilityConfig(type: SecurityVulnerability['type']) {
        const configs = {
            xss: {
                severity: 'high' as const,
                title: 'Cross-Site Scripting (XSS) Vulnerability',
                description: 'Potential XSS vulnerability detected. Unsafe HTML rendering or script execution.',
                recommendation: 'Use proper input sanitization and avoid dangerouslySetInnerHTML. Use libraries like DOMPurify.',
                cwe: 'CWE-79',
                cvss: 7.5
            },
            sql_injection: {
                severity: 'critical' as const,
                title: 'SQL Injection Vulnerability',
                description: 'Potential SQL injection detected. Dynamic query construction without proper sanitization.',
                recommendation: 'Use parameterized queries or prepared statements. Validate and sanitize all inputs.',
                cwe: 'CWE-89',
                cvss: 9.8
            },
            csrf: {
                severity: 'medium' as const,
                title: 'Cross-Site Request Forgery (CSRF)',
                description: 'Missing CSRF protection on state-changing operations.',
                recommendation: 'Implement CSRF tokens for all POST, PUT, DELETE requests.',
                cwe: 'CWE-352',
                cvss: 5.4
            },
            insecure_crypto: {
                severity: 'high' as const,
                title: 'Insecure Cryptographic Practice',
                description: 'Use of weak or insecure cryptographic functions.',
                recommendation: 'Use secure hash functions (SHA-256+) and proper random number generation.',
                cwe: 'CWE-327',
                cvss: 7.0
            },
            path_traversal: {
                severity: 'high' as const,
                title: 'Path Traversal Vulnerability',
                description: 'Potential directory traversal attack vector detected.',
                recommendation: 'Validate and sanitize file paths. Use path.resolve() and check against allowed directories.',
                cwe: 'CWE-22',
                cvss: 7.5
            },
            weak_auth: {
                severity: 'critical' as const,
                title: 'Weak Authentication',
                description: 'Weak or hardcoded authentication credentials detected.',
                recommendation: 'Use strong, randomly generated passwords and secure authentication mechanisms.',
                cwe: 'CWE-798',
                cvss: 9.1
            },
            info_disclosure: {
                severity: 'medium' as const,
                title: 'Information Disclosure',
                description: 'Sensitive information may be exposed in logs or alerts.',
                recommendation: 'Remove or redact sensitive information from logs and error messages.',
                cwe: 'CWE-200',
                cvss: 5.3
            }
        };

        return configs[type];
    }

    private createSummary(vulnerabilities: SecurityVulnerability[]) {
        const summary = {
            total: vulnerabilities.length,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
        };

        vulnerabilities.forEach(vuln => {
            summary[vuln.severity]++;
        });

        return summary;
    }

    /**
     * Generate security report
     */
    generateReport(scanResult: ScanResult): string {
        const report = [];
        
        report.push('# Security Scan Report');
        report.push(`**Scan ID:** ${scanResult.scanId}`);
        report.push(`**Timestamp:** ${scanResult.timestamp.toISOString()}`);
        report.push(`**Application:** ${scanResult.appName}`);
        report.push(`**Files Scanned:** ${scanResult.scannedFiles}`);
        report.push(`**Scan Duration:** ${scanResult.scanDuration}ms`);
        report.push('');

        // Summary
        report.push('## Summary');
        report.push(`- **Total Vulnerabilities:** ${scanResult.summary.total}`);
        report.push(`- **Critical:** ${scanResult.summary.critical}`);
        report.push(`- **High:** ${scanResult.summary.high}`);
        report.push(`- **Medium:** ${scanResult.summary.medium}`);
        report.push(`- **Low:** ${scanResult.summary.low}`);
        report.push('');

        // Vulnerabilities by severity
        const severities: Array<keyof typeof scanResult.summary> = ['critical', 'high', 'medium', 'low'];
        
        for (const severity of severities) {
            const vulns = scanResult.vulnerabilities.filter(v => v.severity === severity);
            
            if (vulns.length > 0) {
                report.push(`## ${severity.toUpperCase()} Severity Issues`);
                
                vulns.forEach((vuln, index) => {
                    report.push(`### ${index + 1}. ${vuln.title}`);
                    report.push(`**File:** ${vuln.file}:${vuln.line}`);
                    report.push(`**Description:** ${vuln.description}`);
                    report.push(`**Evidence:** \`${vuln.evidence}\``);
                    report.push(`**Recommendation:** ${vuln.recommendation}`);
                    if (vuln.cwe) report.push(`**CWE:** ${vuln.cwe}`);
                    if (vuln.cvss) report.push(`**CVSS Score:** ${vuln.cvss}`);
                    report.push('');
                });
            }
        }

        return report.join('\n');
    }
}
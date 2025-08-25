/**
 * @fileoverview Dependency Security Checker
 * @description Checks for vulnerable dependencies and outdated packages
 */

import fs from 'fs';
import path from 'path';

export interface DependencyVulnerability {
    package: string;
    version: string;
    vulnerability: {
        id: string;
        title: string;
        severity: 'low' | 'moderate' | 'high' | 'critical';
        description: string;
        cvss?: number;
        cwe?: string[];
        references: string[];
    };
    fixedIn?: string;
    patchAvailable: boolean;
}

export interface DependencyAuditResult {
    scanId: string;
    timestamp: Date;
    vulnerabilities: DependencyVulnerability[];
    outdatedPackages: Array<{
        package: string;
        current: string;
        latest: string;
        type: 'dependencies' | 'devDependencies';
    }>;
    summary: {
        total: number;
        critical: number;
        high: number;
        moderate: number;
        low: number;
    };
}

export class DependencyChecker {
    private knownVulnerabilities: Map<string, any[]>;
    
    constructor() {
        this.knownVulnerabilities = new Map();
        this.loadKnownVulnerabilities();
    }

    /**
     * Audit package.json for vulnerabilities
     */
    async auditPackageJson(packageJsonPath: string): Promise<DependencyAuditResult> {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        const vulnerabilities: DependencyVulnerability[] = [];
        const outdatedPackages: any[] = [];

        // Check dependencies
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        for (const [pkg, version] of Object.entries(deps)) {
            // Check for known vulnerabilities
            const vulns = await this.checkPackageVulnerabilities(pkg, version as string);
            vulnerabilities.push(...vulns);

            // Check if package is outdated
            const outdatedInfo = await this.checkIfOutdated(pkg, version as string);
            if (outdatedInfo) {
                outdatedPackages.push(outdatedInfo);
            }
        }

        const summary = this.createSummary(vulnerabilities);

        return {
            scanId: Date.now().toString(),
            timestamp: new Date(),
            vulnerabilities,
            outdatedPackages,
            summary
        };
    }

    private async checkPackageVulnerabilities(
        packageName: string,
        version: string
    ): Promise<DependencyVulnerability[]> {
        // This would typically call a vulnerability database API
        // For now, we'll use known vulnerable packages
        const vulnerabilities = this.knownVulnerabilities.get(packageName) || [];
        
        return vulnerabilities
            .filter(vuln => this.isVersionAffected(version, vuln.affectedVersions))
            .map(vuln => ({
                package: packageName,
                version,
                vulnerability: {
                    id: vuln.id,
                    title: vuln.title,
                    severity: vuln.severity,
                    description: vuln.description,
                    cvss: vuln.cvss,
                    cwe: vuln.cwe,
                    references: vuln.references
                },
                fixedIn: vuln.fixedIn,
                patchAvailable: !!vuln.fixedIn
            }));
    }

    private async checkIfOutdated(packageName: string, currentVersion: string) {
        // This would typically call npm registry API
        // Simplified implementation
        const knownUpdates = {
            'lodash': '4.17.21',
            'react': '18.2.0',
            'next': '14.0.0',
            'typescript': '5.0.0'
        };

        const latestVersion = knownUpdates[packageName];
        if (latestVersion && this.compareVersions(currentVersion, latestVersion) < 0) {
            return {
                package: packageName,
                current: currentVersion,
                latest: latestVersion,
                type: 'dependencies' as const
            };
        }

        return null;
    }

    private loadKnownVulnerabilities() {
        // Load known vulnerabilities (simplified dataset)
        this.knownVulnerabilities.set('lodash', [
            {
                id: 'GHSA-35jh-r3h4-6sjk',
                title: 'Prototype Pollution in lodash',
                severity: 'high',
                description: 'Versions of lodash before 4.17.12 are vulnerable to Prototype Pollution.',
                cvss: 7.0,
                cwe: ['CWE-1321'],
                affectedVersions: '<4.17.12',
                fixedIn: '4.17.12',
                references: [
                    'https://github.com/advisories/GHSA-35jh-r3h4-6sjk'
                ]
            }
        ]);

        this.knownVulnerabilities.set('express', [
            {
                id: 'GHSA-rv95-896h-c2vc',
                title: 'qs vulnerable to Prototype Pollution',
                severity: 'high',
                description: 'Express versions that depend on vulnerable qs versions',
                cvss: 7.5,
                cwe: ['CWE-1321'],
                affectedVersions: '<4.17.3',
                fixedIn: '4.17.3',
                references: [
                    'https://github.com/advisories/GHSA-rv95-896h-c2vc'
                ]
            }
        ]);
    }

    private isVersionAffected(version: string, affectedRange: string): boolean {
        // Simplified version comparison
        // In production, use semver library
        const cleanVersion = version.replace(/^[^0-9]*/, '');
        const cleanRange = affectedRange.replace('<', '');
        
        return this.compareVersions(cleanVersion, cleanRange) < 0;
    }

    private compareVersions(version1: string, version2: string): number {
        const v1parts = version1.split('.').map(n => parseInt(n, 10));
        const v2parts = version2.split('.').map(n => parseInt(n, 10));
        
        const maxLength = Math.max(v1parts.length, v2parts.length);
        
        for (let i = 0; i < maxLength; i++) {
            const v1part = v1parts[i] || 0;
            const v2part = v2parts[i] || 0;
            
            if (v1part < v2part) return -1;
            if (v1part > v2part) return 1;
        }
        
        return 0;
    }

    private createSummary(vulnerabilities: DependencyVulnerability[]) {
        const summary = {
            total: vulnerabilities.length,
            critical: 0,
            high: 0,
            moderate: 0,
            low: 0
        };

        vulnerabilities.forEach(vuln => {
            summary[vuln.vulnerability.severity === 'moderate' ? 'moderate' : vuln.vulnerability.severity]++;
        });

        return summary;
    }

    /**
     * Generate dependency audit report
     */
    generateAuditReport(result: DependencyAuditResult): string {
        const report = [];
        
        report.push('# Dependency Security Audit Report');
        report.push(`**Scan ID:** ${result.scanId}`);
        report.push(`**Timestamp:** ${result.timestamp.toISOString()}`);
        report.push('');

        // Vulnerability summary
        report.push('## Vulnerability Summary');
        report.push(`- **Total:** ${result.summary.total}`);
        report.push(`- **Critical:** ${result.summary.critical}`);
        report.push(`- **High:** ${result.summary.high}`);
        report.push(`- **Moderate:** ${result.summary.moderate}`);
        report.push(`- **Low:** ${result.summary.low}`);
        report.push('');

        // Vulnerabilities
        if (result.vulnerabilities.length > 0) {
            report.push('## Vulnerabilities');
            
            result.vulnerabilities.forEach((vuln, index) => {
                report.push(`### ${index + 1}. ${vuln.package}@${vuln.version}`);
                report.push(`**Severity:** ${vuln.vulnerability.severity.toUpperCase()}`);
                report.push(`**Title:** ${vuln.vulnerability.title}`);
                report.push(`**Description:** ${vuln.vulnerability.description}`);
                
                if (vuln.fixedIn) {
                    report.push(`**Fixed In:** ${vuln.fixedIn}`);
                    report.push(`**Recommended Action:** Update to ${vuln.fixedIn} or later`);
                }
                
                report.push('');
            });
        }

        // Outdated packages
        if (result.outdatedPackages.length > 0) {
            report.push('## Outdated Packages');
            
            result.outdatedPackages.forEach(pkg => {
                report.push(`- **${pkg.package}:** ${pkg.current} → ${pkg.latest}`);
            });
            report.push('');
        }

        return report.join('\n');
    }
}
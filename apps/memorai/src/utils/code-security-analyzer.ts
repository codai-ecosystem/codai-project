/**
 * @fileoverview Code Security Analyzer
 * @description Static analysis for security patterns and code quality
 */

export interface CodeSecurityRule {
    id: string;
    name: string;
    description: string;
    severity: 'info' | 'warning' | 'error';
    category: 'security' | 'performance' | 'maintainability';
    pattern: RegExp;
    message: string;
    recommendation: string;
}

export interface CodeIssue {
    rule: string;
    file: string;
    line: number;
    column: number;
    severity: 'info' | 'warning' | 'error';
    message: string;
    evidence: string;
    recommendation: string;
}

export class CodeSecurityAnalyzer {
    private rules: CodeSecurityRule[] = [
        {
            id: 'no-eval',
            name: 'No eval() usage',
            description: 'Avoid using eval() as it can execute arbitrary code',
            severity: 'error',
            category: 'security',
            pattern: /\beval\s*\(/g,
            message: 'Use of eval() detected',
            recommendation: 'Use JSON.parse() for JSON data or find alternative solutions'
        },
        {
            id: 'no-inner-html',
            name: 'No innerHTML with dynamic content',
            description: 'Using innerHTML with dynamic content can lead to XSS',
            severity: 'warning',
            category: 'security',
            pattern: /innerHTML\s*=\s*.*\$\{|innerHTML\s*=\s*.*\+/g,
            message: 'Dynamic innerHTML usage detected',
            recommendation: 'Use textContent or DOM manipulation methods instead'
        },
        {
            id: 'no-hardcoded-secrets',
            name: 'No hardcoded secrets',
            description: 'Hardcoded secrets should not be in source code',
            severity: 'error',
            category: 'security',
            pattern: /(password|secret|token|key)\s*[:=]\s*['"][^'"]{8,}['"](?!\s*(;|,|\}|$))/gi,
            message: 'Possible hardcoded secret detected',
            recommendation: 'Use environment variables or secure configuration'
        },
        {
            id: 'no-weak-crypto',
            name: 'No weak cryptographic functions',
            description: 'Avoid weak cryptographic hash functions',
            severity: 'warning',
            category: 'security',
            pattern: /crypto\.createHash\(['"]md5['"]|crypto\.createHash\(['"]sha1['"]\)/g,
            message: 'Weak cryptographic hash function detected',
            recommendation: 'Use SHA-256 or stronger hash functions'
        },
        {
            id: 'no-math-random',
            name: 'No Math.random() for security',
            description: 'Math.random() is not cryptographically secure',
            severity: 'warning',
            category: 'security',
            pattern: /Math\.random\(\)/g,
            message: 'Non-cryptographic random number generation',
            recommendation: 'Use crypto.randomBytes() for security-critical random values'
        }
    ];

    /**
     * Analyze code file for security issues
     */
    analyzeFile(filePath: string, content: string): CodeIssue[] {
        const issues: CodeIssue[] = [];
        const lines = content.split('\n');

        for (const rule of this.rules) {
            let match;
            const pattern = new RegExp(rule.pattern.source, rule.pattern.flags);
            
            while ((match = pattern.exec(content)) !== null) {
                const lineNumber = this.getLineNumber(content, match.index);
                const column = this.getColumnNumber(content, match.index);
                
                issues.push({
                    rule: rule.id,
                    file: filePath,
                    line: lineNumber,
                    column,
                    severity: rule.severity,
                    message: rule.message,
                    evidence: lines[lineNumber - 1]?.trim() || '',
                    recommendation: rule.recommendation
                });
            }
        }

        return issues;
    }

    /**
     * Add custom security rule
     */
    addRule(rule: CodeSecurityRule): void {
        this.rules.push(rule);
    }

    /**
     * Remove rule by ID
     */
    removeRule(ruleId: string): void {
        this.rules = this.rules.filter(rule => rule.id !== ruleId);
    }

    private getLineNumber(content: string, index: number): number {
        return content.substring(0, index).split('\n').length;
    }

    private getColumnNumber(content: string, index: number): number {
        const beforeMatch = content.substring(0, index);
        const lastNewline = beforeMatch.lastIndexOf('\n');
        return index - lastNewline - 1;
    }
}
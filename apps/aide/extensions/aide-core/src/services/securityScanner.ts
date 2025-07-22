import * as vscode from 'vscode';
import { PredictionContext, PredictionResult } from './predictiveEngine';
import { LoggerService } from './loggerService';

/**
 * Security Scanner Service
 * Identifies security vulnerabilities, unsafe patterns,
 * and provides security-focused recommendations.
 */
export class SecurityScanner {
	private logger: LoggerService; private securityRules: SecurityRule[] = [];
	private sensitivePatterns: RegExp[] = [];

	constructor() {
		this.logger = LoggerService.getInstance();
		this.initializeSecurityRules();
		this.initializeSensitivePatterns();
	}

	public async initialize(context: vscode.ExtensionContext): Promise<void> {
		this.logger.info('SecurityScanner', 'Initialized security scanner');
	}

	/**
	 * Analyze code for security vulnerabilities
	 */
	public async analyze(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];

		try {
			results.push(...await this.scanForInjectionVulnerabilities(context));
			results.push(...await this.scanForXSSVulnerabilities(context));
			results.push(...await this.scanForAuthenticationIssues(context));
			results.push(...await this.scanForDataExposure(context));
			results.push(...await this.scanForCryptographicIssues(context));
			results.push(...await this.scanForInputValidation(context));
			results.push(...await this.scanForAccessControl(context));

			return results;
		} catch (error) {
			this.logger.error('SecurityScanner', `Error during security analysis: ${error}`);
			return [];
		}
	}

	// Private scanning methods

	private async scanForInjectionVulnerabilities(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];
		const text = context.document.getText();
		const lines = text.split('\n');

		lines.forEach((line, index) => {
			const trimmed = line.trim();

			// SQL Injection patterns
			if (this.containsSQLInjectionRisk(trimmed)) {
				results.push({
					type: 'security',
					severity: 'critical',
					message: 'Potential SQL injection vulnerability detected',
					line: index,
					fix: 'Use parameterized queries or prepared statements',
					confidence: 0.9,
					category: 'sql-injection'
				});
			}

			// Command injection patterns
			if (this.containsCommandInjectionRisk(trimmed)) {
				results.push({
					type: 'security',
					severity: 'critical',
					message: 'Potential command injection vulnerability detected',
					line: index,
					fix: 'Validate and sanitize input, use safe command execution methods',
					confidence: 0.85,
					category: 'command-injection'
				});
			}

			// NoSQL injection patterns
			if (this.containsNoSQLInjectionRisk(trimmed)) {
				results.push({
					type: 'security',
					severity: 'high',
					message: 'Potential NoSQL injection vulnerability detected',
					line: index,
					fix: 'Use proper query builders and input validation',
					confidence: 0.8,
					category: 'nosql-injection'
				});
			}

			// LDAP injection patterns
			if (this.containsLDAPInjectionRisk(trimmed)) {
				results.push({
					type: 'security',
					severity: 'high',
					message: 'Potential LDAP injection vulnerability detected',
					line: index,
					fix: 'Escape LDAP special characters in user input',
					confidence: 0.75,
					category: 'ldap-injection'
				});
			}
		});

		return results;
	}

	private async scanForXSSVulnerabilities(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];
		const text = context.document.getText();
		const lines = text.split('\n');

		lines.forEach((line, index) => {
			const trimmed = line.trim();

			// DOM-based XSS
			if (this.containsDOMXSSRisk(trimmed)) {
				results.push({
					type: 'security',
					severity: 'high',
					message: 'Potential DOM-based XSS vulnerability detected',
					line: index,
					fix: 'Use textContent instead of innerHTML, or sanitize HTML content',
					confidence: 0.85,
					category: 'dom-xss'
				});
			}

			// Reflected XSS
			if (this.containsReflectedXSSRisk(trimmed)) {
				results.push({
					type: 'security',
					severity: 'high',
					message: 'Potential reflected XSS vulnerability detected',
					line: index,
					fix: 'Encode output and validate input',
					confidence: 0.8,
					category: 'reflected-xss'
				});
			}

			// Unsafe URL generation
			if (this.containsUnsafeURLGeneration(trimmed)) {
				results.push({
					type: 'security',
					severity: 'medium',
					message: 'Unsafe URL generation may lead to open redirect',
					line: index,
					fix: 'Validate URLs against whitelist of allowed domains',
					confidence: 0.7,
					category: 'open-redirect'
				});
			}
		});

		return results;
	}

	private async scanForAuthenticationIssues(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];
		const text = context.document.getText();
		const lines = text.split('\n');

		lines.forEach((line, index) => {
			const trimmed = line.trim();

			// Hardcoded credentials
			if (this.containsHardcodedCredentials(trimmed)) {
				results.push({
					type: 'security',
					severity: 'critical',
					message: 'Hardcoded credentials detected',
					line: index,
					fix: 'Use environment variables or secure credential storage',
					confidence: 0.95,
					category: 'hardcoded-credentials'
				});
			}

			// Weak password validation
			if (this.containsWeakPasswordValidation(trimmed)) {
				results.push({
					type: 'security',
					severity: 'medium',
					message: 'Weak password validation detected',
					line: index,
					fix: 'Implement strong password requirements',
					confidence: 0.7,
					category: 'weak-password'
				});
			}

			// Missing authentication
			if (this.containsMissingAuthentication(trimmed)) {
				results.push({
					type: 'security',
					severity: 'high',
					message: 'Potential missing authentication check',
					line: index,
					fix: 'Add proper authentication middleware',
					confidence: 0.6,
					category: 'missing-auth'
				});
			}

			// Session management issues
			if (this.containsSessionIssues(trimmed)) {
				results.push({
					type: 'security',
					severity: 'medium',
					message: 'Potential session management issue',
					line: index,
					fix: 'Use secure session configuration',
					confidence: 0.65,
					category: 'session-security'
				});
			}
		});

		return results;
	}

	private async scanForDataExposure(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];
		const text = context.document.getText();
		const lines = text.split('\n');

		lines.forEach((line, index) => {
			const trimmed = line.trim();

			// Sensitive data in logs
			if (this.containsSensitiveDataInLogs(trimmed)) {
				results.push({
					type: 'security',
					severity: 'medium',
					message: 'Potential sensitive data exposure in logs',
					line: index,
					fix: 'Remove or mask sensitive data before logging',
					confidence: 0.8,
					category: 'data-exposure'
				});
			}

			// Debug information exposure
			if (this.containsDebugInfoExposure(trimmed)) {
				results.push({
					type: 'security',
					severity: 'low',
					message: 'Debug information may be exposed in production',
					line: index,
					fix: 'Remove debug statements or use conditional compilation',
					confidence: 0.6,
					category: 'debug-exposure'
				});
			}

			// Error message exposure
			if (this.containsErrorExposure(trimmed)) {
				results.push({
					type: 'security',
					severity: 'medium',
					message: 'Detailed error messages may expose sensitive information',
					line: index,
					fix: 'Use generic error messages for client responses',
					confidence: 0.7,
					category: 'error-exposure'
				});
			}
		});

		return results;
	}

	private async scanForCryptographicIssues(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];
		const text = context.document.getText();
		const lines = text.split('\n');

		lines.forEach((line, index) => {
			const trimmed = line.trim();

			// Weak cryptographic algorithms
			if (this.containsWeakCrypto(trimmed)) {
				results.push({
					type: 'security',
					severity: 'high',
					message: 'Weak cryptographic algorithm detected',
					line: index,
					fix: 'Use modern, secure cryptographic algorithms (AES, SHA-256, etc.)',
					confidence: 0.9,
					category: 'weak-crypto'
				});
			}

			// Insecure random number generation
			if (this.containsInsecureRandom(trimmed)) {
				results.push({
					type: 'security',
					severity: 'medium',
					message: 'Insecure random number generation',
					line: index,
					fix: 'Use cryptographically secure random number generators',
					confidence: 0.8,
					category: 'insecure-random'
				});
			}

			// Missing encryption
			if (this.containsMissingEncryption(trimmed)) {
				results.push({
					type: 'security',
					severity: 'high',
					message: 'Sensitive data transmitted without encryption',
					line: index,
					fix: 'Use HTTPS/TLS for data transmission',
					confidence: 0.75,
					category: 'missing-encryption'
				});
			}
		});

		return results;
	}

	private async scanForInputValidation(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];
		const text = context.document.getText();
		const lines = text.split('\n');

		lines.forEach((line, index) => {
			const trimmed = line.trim();

			// Missing input validation
			if (this.containsMissingInputValidation(trimmed)) {
				results.push({
					type: 'security',
					severity: 'medium',
					message: 'Missing input validation detected',
					line: index,
					fix: 'Add proper input validation and sanitization',
					confidence: 0.7,
					category: 'input-validation'
				});
			}

			// Unsafe deserialization
			if (this.containsUnsafeDeserialization(trimmed)) {
				results.push({
					type: 'security',
					severity: 'critical',
					message: 'Unsafe deserialization may lead to code execution',
					line: index,
					fix: 'Validate and sanitize serialized data, use safe parsing methods',
					confidence: 0.85,
					category: 'unsafe-deserialization'
				});
			}

			// File upload vulnerabilities
			if (this.containsFileUploadRisk(trimmed)) {
				results.push({
					type: 'security',
					severity: 'high',
					message: 'Potential file upload vulnerability',
					line: index,
					fix: 'Validate file types, limit file sizes, scan for malware',
					confidence: 0.8,
					category: 'file-upload'
				});
			}
		});

		return results;
	}

	private async scanForAccessControl(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];
		const text = context.document.getText();
		const lines = text.split('\n');

		lines.forEach((line, index) => {
			const trimmed = line.trim();

			// Missing authorization checks
			if (this.containsMissingAuthorization(trimmed)) {
				results.push({
					type: 'security',
					severity: 'high',
					message: 'Potential missing authorization check',
					line: index,
					fix: 'Add proper authorization middleware',
					confidence: 0.6,
					category: 'missing-authorization'
				});
			}

			// Privilege escalation risks
			if (this.containsPrivilegeEscalationRisk(trimmed)) {
				results.push({
					type: 'security',
					severity: 'high',
					message: 'Potential privilege escalation vulnerability',
					line: index,
					fix: 'Implement proper access control checks',
					confidence: 0.7,
					category: 'privilege-escalation'
				});
			}

			// CORS misconfigurations
			if (this.containsCORSMisconfiguration(trimmed)) {
				results.push({
					type: 'security',
					severity: 'medium',
					message: 'Potential CORS misconfiguration',
					line: index,
					fix: 'Configure CORS with specific origins and methods',
					confidence: 0.8,
					category: 'cors-misconfiguration'
				});
			}
		});

		return results;
	}

	// Helper methods for vulnerability detection

	private containsSQLInjectionRisk(line: string): boolean {
		const patterns = [
			/query\s*\(\s*['"`].*\+.*['"`]/,
			/execute\s*\(\s*['"`].*\+.*['"`]/,
			/\$\{.*\}.*WHERE/i,
			/\+.*WHERE/i
		];
		return patterns.some(pattern => pattern.test(line));
	}

	private containsCommandInjectionRisk(line: string): boolean {
		const patterns = [
			/exec\s*\(\s*['"`].*\+.*['"`]/,
			/spawn\s*\(\s*['"`].*\+.*['"`]/,
			/system\s*\(\s*['"`].*\+.*['"`]/,
			/shell_exec\s*\(\s*['"`].*\+.*['"`]/
		];
		return patterns.some(pattern => pattern.test(line));
	}

	private containsNoSQLInjectionRisk(line: string): boolean {
		const patterns = [
			/\$where.*\+/,
			/find\(\{.*\$.*\}/,
			/\$regex.*\+/
		];
		return patterns.some(pattern => pattern.test(line));
	}

	private containsLDAPInjectionRisk(line: string): boolean {
		const patterns = [
			/ldap.*search.*\+/,
			/SearchRequest.*\+/
		];
		return patterns.some(pattern => pattern.test(line));
	}

	private containsDOMXSSRisk(line: string): boolean {
		const patterns = [
			/innerHTML.*\+/,
			/outerHTML.*\+/,
			/document\.write.*\+/,
			/eval\s*\(/,
			/setTimeout\s*\(\s*['"`].*\+/,
			/setInterval\s*\(\s*['"`].*\+/
		];
		return patterns.some(pattern => pattern.test(line));
	}

	private containsReflectedXSSRisk(line: string): boolean {
		const patterns = [
			/response\.write.*request/i,
			/echo.*\$_GET/i,
			/print.*\$_POST/i
		];
		return patterns.some(pattern => pattern.test(line));
	}

	private containsUnsafeURLGeneration(line: string): boolean {
		const patterns = [
			/window\.location.*\+/,
			/location\.href.*\+/,
			/redirect.*\+/
		];
		return patterns.some(pattern => pattern.test(line));
	}

	private containsHardcodedCredentials(line: string): boolean {
		return this.sensitivePatterns.some(pattern => pattern.test(line));
	}

	private containsWeakPasswordValidation(line: string): boolean {
		const patterns = [
			/password\.length\s*<\s*[1-5]/,
			/\.test\(\s*password\s*\).*[a-zA-Z0-9]{1,5}/
		];
		return patterns.some(pattern => pattern.test(line));
	}

	private containsMissingAuthentication(line: string): boolean {
		const patterns = [
			/app\.get\(.*\)\s*=>/,
			/router\.post\(.*\)\s*=>/,
			/route\(.*\)\.get\(/
		];
		return patterns.some(pattern => pattern.test(line)) &&
			!line.includes('auth') && !line.includes('login');
	}

	private containsSessionIssues(line: string): boolean {
		const patterns = [
			/session.*secure.*false/i,
			/cookie.*httpOnly.*false/i,
			/sameSite.*none/i
		];
		return patterns.some(pattern => pattern.test(line));
	}

	private containsSensitiveDataInLogs(line: string): boolean {
		const patterns = [
			/log.*password/i,
			/console.*token/i,
			/logger.*secret/i,
			/log.*creditcard/i
		];
		return patterns.some(pattern => pattern.test(line));
	}

	private containsDebugInfoExposure(line: string): boolean {
		const patterns = [
			/console\.log/,
			/debugger/,
			/printStackTrace/
		];
		return patterns.some(pattern => pattern.test(line));
	}

	private containsErrorExposure(line: string): boolean {
		const patterns = [
			/throw new Error\(.*\+/,
			/res\.send\(error/,
			/response\.write\(exception/
		];
		return patterns.some(pattern => pattern.test(line));
	}

	private containsWeakCrypto(line: string): boolean {
		const patterns = [
			/md5\(/i,
			/sha1\(/i,
			/des\(/i,
			/rc4\(/i,
			/createCipher\('des'/i
		];
		return patterns.some(pattern => pattern.test(line));
	}

	private containsInsecureRandom(line: string): boolean {
		const patterns = [
			/Math\.random\(\)/,
			/Random\(\)/,
			/rand\(\)/
		];
		return patterns.some(pattern => pattern.test(line));
	}

	private containsMissingEncryption(line: string): boolean {
		const patterns = [
			/http:\/\//,
			/transmit.*plain/i,
			/send.*unencrypted/i
		];
		return patterns.some(pattern => pattern.test(line));
	}

	private containsMissingInputValidation(line: string): boolean {
		const patterns = [
			/req\.body\./,
			/request\.getParameter/,
			/\$_GET/,
			/\$_POST/
		];
		return patterns.some(pattern => pattern.test(line)) &&
			!line.includes('validate') && !line.includes('sanitize');
	}

	private containsUnsafeDeserialization(line: string): boolean {
		const patterns = [
			/JSON\.parse\(.*req/,
			/unserialize\(/,
			/pickle\.loads\(/,
			/deserialize\(/
		];
		return patterns.some(pattern => pattern.test(line));
	}

	private containsFileUploadRisk(line: string): boolean {
		const patterns = [
			/multer\(/,
			/upload\(/,
			/file.*save/i,
			/move_uploaded_file/
		];
		return patterns.some(pattern => pattern.test(line));
	}

	private containsMissingAuthorization(line: string): boolean {
		const patterns = [
			/app\.(get|post|put|delete)\(/,
			/router\.(get|post|put|delete)\(/
		];
		return patterns.some(pattern => pattern.test(line)) &&
			!line.includes('authorize') && !line.includes('permission');
	}

	private containsPrivilegeEscalationRisk(line: string): boolean {
		const patterns = [
			/sudo/,
			/setuid/,
			/exec.*root/,
			/process\.setuid/
		];
		return patterns.some(pattern => pattern.test(line));
	}

	private containsCORSMisconfiguration(line: string): boolean {
		const patterns = [
			/Access-Control-Allow-Origin.*\*/,
			/cors\(\{\s*origin:\s*true/,
			/allowedOrigins.*\*/
		];
		return patterns.some(pattern => pattern.test(line));
	}

	private initializeSecurityRules(): void {
		this.securityRules = [
			{
				id: 'hardcoded-secret',
				pattern: /(password|secret|key|token)\s*[:=]\s*['"][^'"]{8,}/i,
				severity: 'critical',
				message: 'Hardcoded secret detected',
				fix: 'Use environment variables'
			},
			{
				id: 'sql-injection',
				pattern: /query.*\+.*['"`]/,
				severity: 'critical',
				message: 'SQL injection vulnerability',
				fix: 'Use parameterized queries'
			}
		];
	}

	private initializeSensitivePatterns(): void {
		this.sensitivePatterns = [
			/password\s*[:=]\s*['"][^'"]+['"]/i,
			/api[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
			/secret\s*[:=]\s*['"][^'"]+['"]/i,
			/token\s*[:=]\s*['"][^'"]+['"]/i,
			/private[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
			/access[_-]?key\s*[:=]\s*['"][^'"]+['"]/i,
			/auth[_-]?token\s*[:=]\s*['"][^'"]+['"]/i
		];
	}
}

interface SecurityRule {
	id: string;
	pattern: RegExp;
	severity: 'low' | 'medium' | 'high' | 'critical';
	message: string;
	fix: string;
}

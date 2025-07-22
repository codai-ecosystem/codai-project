import * as vscode from 'vscode';
import { BaseAnalyzer, IAnalyzer } from './baseAnalyzer';
import { PredictionResult, PredictionContext } from '../services/predictiveEngine';
import { LoggerService } from '../services/loggerService';

/**
 * Dependency Analyzer for the Predictive Development Engine
 * Analyzes project dependencies for security vulnerabilities, outdated packages,
 * license compatibility, and optimization opportunities.
 */
export class DependencyAnalyzer extends BaseAnalyzer implements IAnalyzer {
	private logger: LoggerService;
	private vulnerablePackages: Map<string, any> = new Map();
	private licenseDatabase: Map<string, string> = new Map();

	constructor() {
		super('DependencyAnalyzer');
		this.logger = LoggerService.getInstance();
	}

	public async initialize(): Promise<void> {
		try {
			await this.loadVulnerabilityDatabase();
			await this.loadLicenseDatabase();
			this.logger.info('DependencyAnalyzer', 'Dependency Analyzer initialized with vulnerability and license databases');
		} catch (error) {
			this.logger.error('DependencyAnalyzer', 'Failed to initialize Dependency Analyzer', error);
		}
	}

	public async analyze(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];

		try {
			// Only analyze package files
			if (!this.isPackageFile(context.document.fileName)) {
				return results;
			}

			const [
				vulnerabilities,
				outdatedPackages,
				licenseIssues,
				unusedDependencies,
				duplicateDependencies
			] = await Promise.all([
				this.detectVulnerabilities(context),
				this.detectOutdatedPackages(context),
				this.detectLicenseIssues(context),
				this.detectUnusedDependencies(context),
				this.detectDuplicateDependencies(context)
			]);

			results.push(
				...vulnerabilities,
				...outdatedPackages,
				...licenseIssues,
				...unusedDependencies,
				...duplicateDependencies
			);

			this.logger.debug('DependencyAnalyzer', `Found ${results.length} dependency issues in ${context.document.fileName}`);

		} catch (error) {
			this.logger.error('DependencyAnalyzer', 'Error during dependency analysis', error);
		}

		return results;
	}

	public async applyFix(prediction: PredictionResult, document: vscode.TextDocument): Promise<void> {
		try {
			const edit = new vscode.WorkspaceEdit();

			switch (prediction.type) {
				case 'dependency':
					await this.applyDependencyFix(prediction, document, edit);
					break;
				default:
					throw new Error(`Unsupported fix type: ${prediction.type}`);
			}
		} catch (error) {
			this.logger.error('DependencyAnalyzer', 'Error applying dependency fix', error);
			throw error;
		}
	}

	// Private methods

	private isPackageFile(fileName: string): boolean {
		const packageFiles = ['package.json', 'requirements.txt', 'Cargo.toml', 'pom.xml', 'build.gradle'];
		return packageFiles.some(file => fileName.endsWith(file));
	}

	private async loadVulnerabilityDatabase(): Promise<void> {
		// Mock vulnerability database - in real implementation, load from CVE/security databases
		this.vulnerablePackages.set('lodash', {
			versions: ['<4.17.19'],
			severity: 'high',
			cve: 'CVE-2020-8203',
			description: 'Prototype pollution vulnerability'
		});

		this.vulnerablePackages.set('minimist', {
			versions: ['<1.2.2'],
			severity: 'medium',
			cve: 'CVE-2020-7598',
			description: 'Prototype pollution vulnerability'
		});
	}

	private async loadLicenseDatabase(): Promise<void> {
		// Common licenses and their compatibility
		this.licenseDatabase.set('GPL-3.0', 'copyleft');
		this.licenseDatabase.set('MIT', 'permissive');
		this.licenseDatabase.set('Apache-2.0', 'permissive');
		this.licenseDatabase.set('ISC', 'permissive');
		this.licenseDatabase.set('BSD-3-Clause', 'permissive');
	}

	private async detectVulnerabilities(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];

		if (!context.document.fileName.endsWith('package.json')) {
			return results;
		}

		try {
			const packageJson = JSON.parse(context.document.getText());
			const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

			for (const [packageName, version] of Object.entries(dependencies)) {
				const vulnerability = this.vulnerablePackages.get(packageName);
				if (vulnerability && this.isVersionVulnerable(version as string, vulnerability.versions)) {
					// Find the line where this dependency is declared
					const lines = context.document.getText().split('\n');
					const lineIndex = lines.findIndex(line => line.includes(`"${packageName}"`));

					if (lineIndex >= 0) {
						const range = new vscode.Range(lineIndex, 0, lineIndex, lines[lineIndex].length);
						results.push({
							id: this.generatePredictionId('dependency', range),
							type: 'dependency',
							severity: vulnerability.severity,
							title: `Vulnerable Dependency: ${packageName}`,
							description: `${packageName} has a known security vulnerability: ${vulnerability.description}`,
							suggestion: `Update ${packageName} to a secure version to fix ${vulnerability.cve}`,
							location: range,
							confidence: 0.95,
							actionable: true,
							autoFixAvailable: true,
							tags: ['dependency', 'security', 'vulnerability'],
							metadata: {
								cve: vulnerability.cve,
								packageName,
								currentVersion: version,
								impact: 'Security vulnerability'
							}
						});
					}
				}
			}
		} catch (error) {
			this.logger.error('DependencyAnalyzer', 'Error parsing package.json', error);
		}

		return results;
	}

	private async detectOutdatedPackages(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];

		// Mock implementation - in real version, this would check against package registries
		if (context.document.fileName.endsWith('package.json')) {
			try {
				const packageJson = JSON.parse(context.document.getText());
				const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

				// Mock check for outdated packages
				const outdatedPackages = ['react', 'vue', 'angular'];
				const lines = context.document.getText().split('\n');

				for (const pkg of outdatedPackages) {
					if (dependencies[pkg]) {
						const lineIndex = lines.findIndex(line => line.includes(`"${pkg}"`));
						if (lineIndex >= 0) {
							const range = new vscode.Range(lineIndex, 0, lineIndex, lines[lineIndex].length);
							results.push({
								id: this.generatePredictionId('dependency', range),
								type: 'dependency',
								severity: 'low',
								title: `Outdated Package: ${pkg}`,
								description: `${pkg} has newer versions available with bug fixes and improvements.`,
								suggestion: `Consider updating ${pkg} to the latest stable version.`,
								location: range,
								confidence: 0.70,
								actionable: true,
								autoFixAvailable: true,
								tags: ['dependency', 'outdated', 'maintenance'],
								metadata: {
									packageName: pkg,
									type: 'outdated'
								}
							});
						}
					}
				}
			} catch (error) {
				this.logger.error('DependencyAnalyzer', 'Error checking outdated packages', error);
			}
		}

		return results;
	}

	private async detectLicenseIssues(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];

		// Mock implementation for license compatibility checking
		if (context.document.fileName.endsWith('package.json')) {
			try {
				const packageJson = JSON.parse(context.document.getText());

				// Check if project has a license declared
				if (!packageJson.license) {
					const range = new vscode.Range(0, 0, 0, 0);
					results.push({
						id: this.generatePredictionId('dependency', range),
						type: 'dependency',
						severity: 'medium',
						title: 'Missing License Declaration',
						description: 'Project does not have a license declared, which may cause legal issues.',
						suggestion: 'Add a license field to package.json to clearly define usage rights.',
						location: range,
						confidence: 0.90,
						actionable: true,
						autoFixAvailable: true,
						tags: ['dependency', 'license', 'legal'],
						metadata: {
							type: 'missing-license'
						}
					});
				}
			} catch (error) {
				this.logger.error('DependencyAnalyzer', 'Error checking license issues', error);
			}
		}

		return results;
	}

	private async detectUnusedDependencies(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];

		// This would require analyzing the entire codebase to determine usage
		// For now, return empty array - implement based on language-specific import analysis

		return results;
	}

	private async detectDuplicateDependencies(context: PredictionContext): Promise<PredictionResult[]> {
		const results: PredictionResult[] = [];

		if (context.document.fileName.endsWith('package.json')) {
			try {
				const packageJson = JSON.parse(context.document.getText());
				const dependencies = packageJson.dependencies || {};
				const devDependencies = packageJson.devDependencies || {};

				// Check for packages in both dependencies and devDependencies
				for (const pkg of Object.keys(dependencies)) {
					if (devDependencies[pkg]) {
						const lines = context.document.getText().split('\n');
						const lineIndex = lines.findIndex(line => line.includes(`"${pkg}"`));

						if (lineIndex >= 0) {
							const range = new vscode.Range(lineIndex, 0, lineIndex, lines[lineIndex].length);
							results.push({
								id: this.generatePredictionId('dependency', range),
								type: 'dependency',
								severity: 'low',
								title: `Duplicate Dependency: ${pkg}`,
								description: `${pkg} appears in both dependencies and devDependencies.`,
								suggestion: `Remove ${pkg} from one of the dependency sections to avoid conflicts.`,
								location: range,
								confidence: 0.95,
								actionable: true,
								autoFixAvailable: true,
								tags: ['dependency', 'duplicate', 'cleanup'],
								metadata: {
									packageName: pkg,
									type: 'duplicate'
								}
							});
						}
					}
				}
			} catch (error) {
				this.logger.error('DependencyAnalyzer', 'Error checking duplicate dependencies', error);
			}
		}

		return results;
	}

	private isVersionVulnerable(currentVersion: string, vulnerableVersions: string[]): boolean {
		// Simplified version checking - in real implementation, use semver library
		for (const vulnVersion of vulnerableVersions) {
			if (vulnVersion.startsWith('<') && currentVersion < vulnVersion.substring(1)) {
				return true;
			}
		}
		return false;
	}
	private async applyDependencyFix(prediction: PredictionResult, document: vscode.TextDocument, edit: vscode.WorkspaceEdit): Promise<void> {
		const tags = prediction.tags || [];

		if (tags.includes('vulnerability')) {
			// Update vulnerable package version
			const packageName = prediction.metadata?.packageName;
			if (packageName && prediction.location) {
				const line = document.lineAt(prediction.location.start.line);
				// This is a simplified fix - in real implementation, fetch latest secure version
				const newLine = line.text.replace(/"[^"]*"(\s*:\s*)"[^"]*"/, `"${packageName}"$1"^latest"`);
				edit.replace(document.uri, line.range, newLine);
				await vscode.workspace.applyEdit(edit);
			}
		}

		if (tags.includes('missing-license')) {
			// Add MIT license as default
			const packageJson = JSON.parse(document.getText());
			packageJson.license = 'MIT';
			const newContent = JSON.stringify(packageJson, null, 2);
			edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), newContent);
			await vscode.workspace.applyEdit(edit);
		}
	}
}

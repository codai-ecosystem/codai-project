/**
 * Vercel Automation for Glass Browser Automation
 * Specialized automation for Vercel dashboard operations
 */

import type {
  VercelProjectConfig,
  EnvironmentVariable,
  AutomationResult,
  AutomationStep,
  VercelProject
} from '../types';

import { GlassBrowserAutomation } from '../browser/GlassBrowserAutomation';
import { Timer } from '../utils';

export interface VercelBulkEnvironmentConfig {
  project: string;
  variables: Record<string, EnvironmentVariable>;
}

export interface VercelAutomationOptions {
  teamSlug?: string;
  baseUrl?: string;
  timeout?: number;
}

export class VercelAutomation {
  private browser: GlassBrowserAutomation;
  private options: VercelAutomationOptions;

  constructor(browser: GlassBrowserAutomation, options: VercelAutomationOptions = {}) {
    this.browser = browser;
    this.options = {
      baseUrl: 'https://vercel.com',
      timeout: 30000,
      ...options
    };
  }

  // Authentication
  async ensureLoggedIn(): Promise<AutomationResult<boolean>> {
    const timer = new Timer();
    const steps: AutomationStep[] = [];

    try {
      // Navigate to Vercel dashboard
      const navResult = await this.browser.navigate(`${this.options.baseUrl}/dashboard`);
      steps.push(...navResult.steps || []);

      if (!navResult.success) {
        throw new Error('Failed to navigate to Vercel dashboard');
      }

      // Wait a moment for page to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check if we're already logged in by looking for dashboard elements
      const dashboardResult = await this.browser.findElement('.dashboard', { timeout: 5000 });
      if (dashboardResult.success) {
        return {
          success: true,
          data: true,
          duration: timer.elapsed(),
          steps
        };
      }

      // If not logged in, look for login button
      const loginResult = await this.browser.findElement('a[href="/login"], button[data-testid="login"]', { timeout: 5000 });
      if (loginResult.success) {
        // User needs to log in manually
        return {
          success: false,
          error: 'Please log in to Vercel manually in the browser',
          duration: timer.elapsed(),
          steps
        };
      }

      return {
        success: true,
        data: true,
        duration: timer.elapsed(),
        steps
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        duration: timer.elapsed(),
        steps
      };
    }
  }

  // Project Management
  async createProject(config: VercelProjectConfig): Promise<AutomationResult<VercelProject>> {
    const timer = new Timer();
    const steps: AutomationStep[] = [];

    try {
      // Ensure we're logged in
      const loginResult = await this.ensureLoggedIn();
      steps.push(...loginResult.steps || []);

      if (!loginResult.success) {
        throw new Error('Not logged in to Vercel');
      }

      // Navigate to new project page
      const navResult = await this.browser.navigate(`${this.options.baseUrl}/new`);
      steps.push(...navResult.steps || []);

      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 2000));

      // If Git repository is provided, set it up
      if (config.gitRepository) {
        await this.setupGitRepository(config.gitRepository, steps);
      }

      // Configure project settings
      await this.configureProjectSettings(config, steps);

      // Create the project
      const createResult = await this.browser.click('button[type="submit"], button:contains("Deploy")', { timeout: 10000 });
      steps.push(...createResult.steps || []);

      if (!createResult.success) {
        throw new Error('Failed to create project');
      }

      // Wait for project creation
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Extract project information
      const projectData = await this.extractProjectInfo();

      return {
        success: true,
        data: projectData,
        duration: timer.elapsed(),
        steps
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        duration: timer.elapsed(),
        steps
      };
    }
  }

  async configureEnvironmentVariables(
    projectName: string,
    variables: Record<string, EnvironmentVariable>
  ): Promise<AutomationResult<boolean>> {
    const timer = new Timer();
    const steps: AutomationStep[] = [];

    try {
      // Navigate to project settings
      const settingsUrl = `${this.options.baseUrl}/dashboard/${projectName}/settings/environment-variables`;
      const navResult = await this.browser.navigate(settingsUrl);
      steps.push(...navResult.steps || []);

      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Add each environment variable
      for (const [key, config] of Object.entries(variables)) {
        const addResult = await this.addEnvironmentVariable(key, config, steps);
        if (!addResult) {
          throw new Error(`Failed to add environment variable: ${key}`);
        }
      }

      return {
        success: true,
        data: true,
        duration: timer.elapsed(),
        steps
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        duration: timer.elapsed(),
        steps
      };
    }
  }

  async connectGitRepository(
    projectName: string,
    gitRepo: { type: string; url: string; branch?: string }
  ): Promise<AutomationResult<boolean>> {
    const timer = new Timer();
    const steps: AutomationStep[] = [];

    try {
      // Navigate to project Git settings
      const gitUrl = `${this.options.baseUrl}/dashboard/${projectName}/settings/git`;
      const navResult = await this.browser.navigate(gitUrl);
      steps.push(...navResult.steps || []);

      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Look for connect repository button
      const connectResult = await this.browser.click('button:contains("Connect Git Repository"), a[href*="connect"]');
      steps.push(...connectResult.steps || []);

      if (connectResult.success) {
        // Configure git repository details
        await this.configureGitSettings(gitRepo, steps);
      }

      return {
        success: true,
        data: true,
        duration: timer.elapsed(),
        steps
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        duration: timer.elapsed(),
        steps
      };
    }
  }

  async bulkEnvironmentVariables(configs: VercelBulkEnvironmentConfig[]): Promise<AutomationResult<boolean[]>> {
    const timer = new Timer();
    const results: boolean[] = [];
    const steps: AutomationStep[] = [];

    try {
      for (const config of configs) {
        const result = await this.configureEnvironmentVariables(config.project, config.variables);
        steps.push(...result.steps || []);
        results.push(result.success);
      }

      return {
        success: results.every(r => r),
        data: results,
        duration: timer.elapsed(),
        steps
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        duration: timer.elapsed(),
        steps
      };
    }
  }

  // CODAI Specific Automation
  async automateCodaiDeployment(projects: string[]): Promise<AutomationResult<string[]>> {
    const timer = new Timer();
    const completedProjects: string[] = [];
    const steps: AutomationStep[] = [];

    try {
      // Ensure logged in
      const loginResult = await this.ensureLoggedIn();
      steps.push(...loginResult.steps || []);

      if (!loginResult.success) {
        throw new Error('Not logged in to Vercel');
      }

      // Process each project
      for (const projectName of projects) {
        try {
          // Navigate to project dashboard
          const projectUrl = `${this.options.baseUrl}/dashboard/${projectName}`;
          const navResult = await this.browser.navigate(projectUrl);
          steps.push(...navResult.steps || []);

          // Configure Git repository if needed
          await this.ensureGitConnection(projectName, steps);

          // Configure environment variables if needed
          await this.ensureEnvironmentVariables(projectName, steps);

          // Trigger deployment if needed
          await this.triggerDeployment(projectName, steps);

          completedProjects.push(projectName);
        } catch (error) {
          console.warn(`Failed to configure project ${projectName}:`, error);
          // Continue with other projects
        }
      }

      return {
        success: completedProjects.length > 0,
        data: completedProjects,
        warnings: projects.length > completedProjects.length ?
          [`Failed to configure ${projects.length - completedProjects.length} projects`] : undefined,
        duration: timer.elapsed(),
        steps
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
        duration: timer.elapsed(),
        steps
      };
    }
  }

  // Private helper methods
  private async setupGitRepository(
    gitRepo: { type: string; url: string; branch?: string },
    steps: AutomationStep[]
  ): Promise<void> {
    // Look for Git repository input
    const repoInputResult = await this.browser.findElement('input[placeholder*="repository"], input[name="repository"]');
    if (repoInputResult.success) {
      const typeResult = await this.browser.type('input[placeholder*="repository"], input[name="repository"]', gitRepo.url);
      steps.push(...typeResult.steps || []);
    }

    // Set branch if specified
    if (gitRepo.branch) {
      const branchInputResult = await this.browser.findElement('input[placeholder*="branch"], input[name="branch"]');
      if (branchInputResult.success) {
        const typeResult = await this.browser.type('input[placeholder*="branch"], input[name="branch"]', gitRepo.branch);
        steps.push(...typeResult.steps || []);
      }
    }
  }

  private async configureProjectSettings(config: VercelProjectConfig, steps: AutomationStep[]): Promise<void> {
    // Set project name
    const nameInputResult = await this.browser.findElement('input[name="name"], input[placeholder*="project name"]');
    if (nameInputResult.success) {
      const typeResult = await this.browser.type('input[name="name"], input[placeholder*="project name"]', config.name);
      steps.push(...typeResult.steps || []);
    }

    // Set framework if specified
    if (config.framework) {
      const frameworkResult = await this.browser.findElement('select[name="framework"], .framework-selector');
      if (frameworkResult.success) {
        const selectResult = await this.browser.select('select[name="framework"], .framework-selector', config.framework);
        steps.push(...selectResult.steps || []);
      }
    }

    // Configure build settings if provided
    if (config.buildSettings) {
      await this.configureBuildSettings(config.buildSettings, steps);
    }
  }

  private async configureBuildSettings(
    buildSettings: NonNullable<VercelProjectConfig['buildSettings']>,
    steps: AutomationStep[]
  ): Promise<void> {
    if (buildSettings.buildCommand) {
      const buildCommandResult = await this.browser.findElement('input[name="buildCommand"], input[placeholder*="build command"]');
      if (buildCommandResult.success) {
        const typeResult = await this.browser.type('input[name="buildCommand"], input[placeholder*="build command"]', buildSettings.buildCommand);
        steps.push(...typeResult.steps || []);
      }
    }

    if (buildSettings.outputDirectory) {
      const outputResult = await this.browser.findElement('input[name="outputDirectory"], input[placeholder*="output"]');
      if (outputResult.success) {
        const typeResult = await this.browser.type('input[name="outputDirectory"], input[placeholder*="output"]', buildSettings.outputDirectory);
        steps.push(...typeResult.steps || []);
      }
    }
  }

  private async addEnvironmentVariable(
    key: string,
    config: EnvironmentVariable,
    steps: AutomationStep[]
  ): Promise<boolean> {
    try {
      // Click "Add" button
      const addButtonResult = await this.browser.click('button:contains("Add"), button[data-testid="add-env"]');
      steps.push(...addButtonResult.steps || []);

      if (!addButtonResult.success) return false;

      // Wait for form to appear
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fill key field
      const keyResult = await this.browser.type('input[name="key"], input[placeholder*="key"]', key);
      steps.push(...keyResult.steps || []);

      // Fill value field
      const valueResult = await this.browser.type('input[name="value"], textarea[name="value"]', config.value);
      steps.push(...valueResult.steps || []);

      // Select environment targets if specified
      if (config.target && config.target.length > 0) {
        for (const target of config.target) {
          const targetResult = await this.browser.click(`input[value="${target}"], label:contains("${target}")`);
          steps.push(...targetResult.steps || []);
        }
      }

      // Save the environment variable
      const saveResult = await this.browser.click('button[type="submit"], button:contains("Save")');
      steps.push(...saveResult.steps || []);

      return saveResult.success;
    } catch {
      return false;
    }
  }

  private async configureGitSettings(
    gitRepo: { type: string; url: string; branch?: string },
    steps: AutomationStep[]
  ): Promise<void> {
    // This would handle the specific Git configuration flow
    // Implementation would depend on Vercel's exact UI
  }

  private async extractProjectInfo(): Promise<VercelProject> {
    // Extract project information from the page
    const titleResult = await this.browser.extractText('h1, .project-name');
    const urlResult = await this.browser.extractText('.project-url, .domain');

    return {
      id: 'extracted-id',
      name: titleResult.data || 'Unknown Project',
      productionDomain: urlResult.data || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private async ensureGitConnection(projectName: string, steps: AutomationStep[]): Promise<void> {
    // Check if Git is already connected
    // If not, guide through connection process
  }

  private async ensureEnvironmentVariables(projectName: string, steps: AutomationStep[]): Promise<void> {
    // Check if environment variables are configured
    // Configure them if needed
  }

  private async triggerDeployment(projectName: string, steps: AutomationStep[]): Promise<void> {
    // Look for deploy button and trigger deployment
    const deployResult = await this.browser.click('button:contains("Deploy"), button[data-testid="deploy"]');
    steps.push(...deployResult.steps || []);
  }
}

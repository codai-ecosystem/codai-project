import { promises as fs } from 'fs';
import { join, extname, basename } from 'path';
import { stat } from 'fs/promises';

export interface ProjectInfo {
    id: string;
    name: string;
    path: string;
    type: string;
    language: string;
    framework?: string;
    lastModified: Date;
    size: number;
    status: 'active' | 'inactive' | 'archived';
    dependencies?: string[];
    description?: string;
    version?: string;
    author?: string;
}

export class ProjectDiscovery {
    private static instance: ProjectDiscovery;
    private projectsCache: ProjectInfo[] | null = null;
    private cacheExpiry: number = 0;
    private readonly CACHE_DURATION = 300000; // 5 minutes

    public static getInstance(): ProjectDiscovery {
        if (!ProjectDiscovery.instance) {
            ProjectDiscovery.instance = new ProjectDiscovery();
        }
        return ProjectDiscovery.instance;
    }

    private isCacheValid(): boolean {
        return this.cacheExpiry > Date.now();
    }

    public async discoverProjects(rootPath?: string): Promise<ProjectInfo[]> {
        if (this.projectsCache && this.isCacheValid()) {
            return this.projectsCache;
        }

        const searchPaths = rootPath ? [rootPath] : [
            'e:\\GitHub\\codai-project\\apps',
            'e:\\GitHub\\codai-project\\packages',
            'e:\\GitHub\\workspace-ai',
            'e:\\GitHub',
            process.cwd(),
        ];

        const projects: ProjectInfo[] = [];

        for (const searchPath of searchPaths) {
            try {
                const foundProjects = await this.scanDirectory(searchPath);
                projects.push(...foundProjects);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.warn(`Could not scan directory ${searchPath}:`, error);
            }
        }

        // Remove duplicates based on path
        const uniqueProjects = projects.filter((project, index, arr) =>
            arr.findIndex(p => p.path === project.path) === index
        );

        // Cache the results
        this.projectsCache = uniqueProjects;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;

        return uniqueProjects;
    }

    private async scanDirectory(dirPath: string, maxDepth: number = 3): Promise<ProjectInfo[]> {
        const projects: ProjectInfo[] = [];

        try {
            const items = await fs.readdir(dirPath, { withFileTypes: true });

            // Check if current directory is a project
            if (await this.isProjectDirectory(dirPath)) {
                const projectInfo = await this.analyzeProject(dirPath);
                if (projectInfo) {
                    projects.push(projectInfo);
                }
            }

            // Recursively scan subdirectories
            if (maxDepth > 0) {
                for (const item of items) {
                    if (item.isDirectory() && !this.shouldSkipDirectory(item.name)) {
                        const subDirPath = join(dirPath, item.name);
                        const subProjects = await this.scanDirectory(subDirPath, maxDepth - 1);
                        projects.push(...subProjects);
                    }
                }
            }
        } catch (error) {
            // Directory might not exist or be accessible
            // eslint-disable-next-line no-console
            console.warn(`Could not scan ${dirPath}:`, error);
        }

        return projects;
    }

    private shouldSkipDirectory(dirName: string): boolean {
        const skipDirs = [
            'node_modules', '.git', '.next', 'dist', 'build',
            '.vscode', '.idea', 'coverage', 'tmp', 'temp',
            '.cache', '.nyc_output', 'logs'
        ];
        return skipDirs.includes(dirName) || dirName.startsWith('.');
    }

    private async isProjectDirectory(dirPath: string): Promise<boolean> {
        const projectFiles = [
            'package.json',
            'pyproject.toml',
            'requirements.txt',
            'Cargo.toml',
            'pom.xml',
            'build.gradle',
            'CMakeLists.txt',
            'Makefile',
            '.project',
            'composer.json',
            'go.mod',
        ];

        for (const file of projectFiles) {
            try {
                await fs.access(join(dirPath, file));
                return true;
            } catch {
                // File doesn't exist, continue checking
            }
        }

        return false;
    }

    private async analyzeProject(projectPath: string): Promise<ProjectInfo | null> {
        try {
            const stats = await stat(projectPath);
            const projectName = basename(projectPath);

            let projectInfo: Partial<ProjectInfo> = {
                id: require('crypto').createHash('md5').update(projectPath + '_' + Date.now() + '_' + Math.random()).digest('hex').slice(0, 16),
                name: projectName,
                path: projectPath,
                lastModified: stats.mtime,
                size: await this.getDirectorySize(projectPath),
                status: 'active',
            };

            // Analyze package.json if it exists
            const packageJsonPath = join(projectPath, 'package.json');
            try {
                const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
                projectInfo = {
                    ...projectInfo,
                    type: 'Web Application',
                    language: 'TypeScript/JavaScript',
                    framework: this.detectFramework(packageJson),
                    dependencies: Object.keys(packageJson.dependencies || {}),
                    description: packageJson.description,
                    version: packageJson.version,
                    author: typeof packageJson.author === 'string' ? packageJson.author : packageJson.author?.name,
                };
            } catch {
                // No package.json or invalid JSON
            }

            // Analyze Python projects
            const pyprojectPath = join(projectPath, 'pyproject.toml');
            const requirementsPath = join(projectPath, 'requirements.txt');
            try {
                if (await fs.access(pyprojectPath).then(() => true).catch(() => false)) {
                    projectInfo = {
                        ...projectInfo,
                        type: 'Python Application',
                        language: 'Python',
                        framework: 'Python',
                    };
                } else if (await fs.access(requirementsPath).then(() => true).catch(() => false)) {
                    const requirements = await fs.readFile(requirementsPath, 'utf-8');
                    projectInfo = {
                        ...projectInfo,
                        type: 'Python Application',
                        language: 'Python',
                        dependencies: requirements.split('\n').filter(line => line.trim() && !line.startsWith('#')),
                    };
                }
            } catch {
                // Not a Python project
            }

            // Analyze Rust projects
            const cargoPath = join(projectPath, 'Cargo.toml');
            try {
                await fs.access(cargoPath);
                projectInfo = {
                    ...projectInfo,
                    type: 'Rust Application',
                    language: 'Rust',
                    framework: 'Rust/Cargo',
                };
            } catch {
                // Not a Rust project
            }

            // Determine project status based on recent activity
            const daysSinceModified = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceModified > 90) {
                projectInfo.status = 'inactive';
            } else if (daysSinceModified > 365) {
                projectInfo.status = 'archived';
            }

            return projectInfo as ProjectInfo;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error(`Error analyzing project ${projectPath}:`, error);
            return null;
        }
    }

    private detectFramework(packageJson: any): string {
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

        if (dependencies.next) return 'Next.js';
        if (dependencies.react) return 'React';
        if (dependencies.vue) return 'Vue.js';
        if (dependencies.angular || dependencies['@angular/core']) return 'Angular';
        if (dependencies.express) return 'Express.js';
        if (dependencies.fastify) return 'Fastify';
        if (dependencies.nuxt) return 'Nuxt.js';
        if (dependencies.gatsby) return 'Gatsby';
        if (dependencies.svelte) return 'Svelte';
        if (dependencies.electron) return 'Electron';

        return 'Node.js';
    }

    private async getDirectorySize(dirPath: string): Promise<number> {
        let totalSize = 0;

        try {
            const items = await fs.readdir(dirPath, { withFileTypes: true });

            for (const item of items) {
                const itemPath = join(dirPath, item.name);

                if (item.isFile()) {
                    try {
                        const stats = await stat(itemPath);
                        totalSize += stats.size;
                    } catch {
                        // Skip files that can't be accessed
                    }
                } else if (item.isDirectory() && !this.shouldSkipDirectory(item.name)) {
                    // Recursively get size of subdirectories (but skip large ones like node_modules)
                    totalSize += await this.getDirectorySize(itemPath);
                }
            }
        } catch {
            // Directory might not be accessible
        }

        return totalSize;
    }

    public async getProjectById(id: string): Promise<ProjectInfo | null> {
        const projects = await this.discoverProjects();
        return projects.find(project => project.id === id) || null;
    }

    public async getProjectsByType(type: string): Promise<ProjectInfo[]> {
        const projects = await this.discoverProjects();
        return projects.filter(project => project.type === type);
    }

    public async getProjectsByLanguage(language: string): Promise<ProjectInfo[]> {
        const projects = await this.discoverProjects();
        return projects.filter(project => project.language === language);
    }

    public clearCache(): void {
        this.projectsCache = null;
        this.cacheExpiry = 0;
    }
}

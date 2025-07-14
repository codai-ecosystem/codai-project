import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

interface ProjectSettings {
    name: string
    description?: string
    framework?: string
    buildCommand?: string
    outputDirectory?: string
    installCommand?: string
    devCommand?: string
    environmentVariables?: Record<string, string>
    scripts?: Record<string, string>
    author?: string
    license?: string
    repository?: string
    homepage?: string
    keywords?: string[]
    private?: boolean
    version?: string
}

interface ProjectMetadata extends ProjectSettings {
    id: string
    path: string
    lastModified: string
    size: number
    fileCount: number
}

const WORKSPACE_ROOT = process.env.WORKSPACE_ROOT || 'e:\\GitHub\\codai-project'

// Helper function to detect project type and defaults
async function detectProjectDefaults(projectPath: string): Promise<Partial<ProjectSettings>> {
    const defaults: Partial<ProjectSettings> = {}

    try {
        // Check for package.json
        const packageJsonPath = path.join(projectPath, 'package.json')
        try {
            const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8')
            const packageJson = JSON.parse(packageJsonContent)

            defaults.name = packageJson.name || path.basename(projectPath)
            defaults.description = packageJson.description
            defaults.version = packageJson.version
            defaults.author = typeof packageJson.author === 'string' ? packageJson.author : packageJson.author?.name
            defaults.license = packageJson.license
            defaults.repository = typeof packageJson.repository === 'string' ? packageJson.repository : packageJson.repository?.url
            defaults.homepage = packageJson.homepage
            defaults.keywords = packageJson.keywords
            defaults.private = packageJson.private

            // Extract scripts
            if (packageJson.scripts) {
                defaults.scripts = packageJson.scripts
                defaults.buildCommand = packageJson.scripts.build || 'npm run build'
                defaults.devCommand = packageJson.scripts.dev || packageJson.scripts.start || 'npm run dev'
                defaults.installCommand = 'npm install'
            }

            // Detect framework from dependencies
            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }
            if (dependencies.next) defaults.framework = 'Next.js'
            else if (dependencies.react) defaults.framework = 'React'
            else if (dependencies.vue) defaults.framework = 'Vue.js'
            else if (dependencies.angular) defaults.framework = 'Angular'
            else if (dependencies.express) defaults.framework = 'Express'
            else if (dependencies.fastify) defaults.framework = 'Fastify'
            else if (dependencies.typescript) defaults.framework = 'TypeScript'

            // Detect output directory
            if (packageJson.scripts?.build?.includes('dist')) defaults.outputDirectory = 'dist'
            else if (packageJson.scripts?.build?.includes('build')) defaults.outputDirectory = 'build'
            else if (defaults.framework === 'Next.js') defaults.outputDirectory = '.next'

        } catch (error) {
            // No package.json or invalid JSON
        }

        // Check for other config files to refine framework detection
        const configFiles = await fs.readdir(projectPath)

        if (configFiles.includes('next.config.js') || configFiles.includes('next.config.ts')) {
            defaults.framework = 'Next.js'
            defaults.buildCommand = 'npm run build'
            defaults.devCommand = 'npm run dev'
            defaults.outputDirectory = '.next'
        } else if (configFiles.includes('vite.config.js') || configFiles.includes('vite.config.ts')) {
            defaults.framework = 'Vite'
            defaults.buildCommand = 'npm run build'
            defaults.devCommand = 'npm run dev'
            defaults.outputDirectory = 'dist'
        } else if (configFiles.includes('angular.json')) {
            defaults.framework = 'Angular'
            defaults.buildCommand = 'ng build'
            defaults.devCommand = 'ng serve'
            defaults.outputDirectory = 'dist'
        } else if (configFiles.includes('vue.config.js')) {
            defaults.framework = 'Vue.js'
            defaults.buildCommand = 'npm run build'
            defaults.devCommand = 'npm run serve'
            defaults.outputDirectory = 'dist'
        }

        // Set default name if not found
        if (!defaults.name) {
            defaults.name = path.basename(projectPath)
        }

    } catch (error) {
        console.error('Error detecting project defaults:', error)
        defaults.name = path.basename(projectPath)
    }

    return defaults
}

// Helper function to get project metadata
async function getProjectMetadata(projectPath: string): Promise<Partial<ProjectMetadata>> {
    try {
        const stats = await fs.stat(projectPath)

        // Count files (simple implementation)
        let fileCount = 0
        let totalSize = 0

        async function countFiles(dir: string): Promise<void> {
            try {
                const entries = await fs.readdir(dir, { withFileTypes: true })
                for (const entry of entries) {
                    if (entry.name.startsWith('.')) continue // Skip hidden files/folders
                    if (entry.name === 'node_modules') continue // Skip node_modules

                    const fullPath = path.join(dir, entry.name)
                    if (entry.isDirectory()) {
                        await countFiles(fullPath)
                    } else {
                        fileCount++
                        try {
                            const fileStat = await fs.stat(fullPath)
                            totalSize += fileStat.size
                        } catch (error) {
                            // Ignore errors for individual files
                        }
                    }
                }
            } catch (error) {
                // Ignore errors for directories we can't read
            }
        }

        await countFiles(projectPath)

        return {
            path: projectPath,
            lastModified: stats.mtime.toISOString(),
            size: totalSize,
            fileCount
        }
    } catch (error) {
        console.error('Error getting project metadata:', error)
        return {
            path: projectPath,
            lastModified: new Date().toISOString(),
            size: 0,
            fileCount: 0
        }
    }
}

// Helper function to save settings to a config file
async function saveProjectSettings(projectPath: string, settings: ProjectSettings): Promise<void> {
    const configPath = path.join(projectPath, '.codai-settings.json')

    try {
        await fs.writeFile(configPath, JSON.stringify(settings, null, 2), 'utf-8')
    } catch (error) {
        console.error('Error saving project settings:', error)
        throw new Error('Failed to save project settings')
    }
}

// Helper function to load settings from config file
async function loadProjectSettings(projectPath: string): Promise<Partial<ProjectSettings>> {
    const configPath = path.join(projectPath, '.codai-settings.json')

    try {
        const content = await fs.readFile(configPath, 'utf-8')
        return JSON.parse(content)
    } catch (error) {
        // No config file exists, return empty settings
        return {}
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        // Resolve project path
        const projectPath = path.resolve(WORKSPACE_ROOT, id)

        // Verify project exists
        try {
            await fs.access(projectPath)
        } catch (error) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        // Load existing settings
        const savedSettings = await loadProjectSettings(projectPath)

        // Get project defaults
        const defaults = await detectProjectDefaults(projectPath)

        // Get project metadata
        const metadata = await getProjectMetadata(projectPath)

        // Merge settings (saved settings override defaults)
        const settings: ProjectMetadata = {
            id,
            path: projectPath,
            lastModified: metadata.lastModified || new Date().toISOString(),
            size: metadata.size || 0,
            fileCount: metadata.fileCount || 0,
            name: savedSettings.name || defaults.name || path.basename(projectPath),
            description: savedSettings.description || defaults.description,
            framework: savedSettings.framework || defaults.framework,
            buildCommand: savedSettings.buildCommand || defaults.buildCommand,
            outputDirectory: savedSettings.outputDirectory || defaults.outputDirectory,
            installCommand: savedSettings.installCommand || defaults.installCommand,
            devCommand: savedSettings.devCommand || defaults.devCommand,
            environmentVariables: savedSettings.environmentVariables || defaults.environmentVariables || {},
            scripts: savedSettings.scripts || defaults.scripts || {},
            author: savedSettings.author || defaults.author,
            license: savedSettings.license || defaults.license,
            repository: savedSettings.repository || defaults.repository,
            homepage: savedSettings.homepage || defaults.homepage,
            keywords: savedSettings.keywords || defaults.keywords || [],
            private: savedSettings.private !== undefined ? savedSettings.private : defaults.private,
            version: savedSettings.version || defaults.version
        }

        return NextResponse.json({
            success: true,
            settings,
            defaults,
            metadata
        })

    } catch (error) {
        console.error('Error loading project settings:', error)
        return NextResponse.json(
            { error: 'Failed to load project settings' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params
        const body = await request.json()

        // Resolve project path
        const projectPath = path.resolve(WORKSPACE_ROOT, id)

        // Verify project exists
        try {
            await fs.access(projectPath)
        } catch (error) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        // Validate settings
        const settings: ProjectSettings = {
            name: body.name || path.basename(projectPath),
            description: body.description,
            framework: body.framework,
            buildCommand: body.buildCommand,
            outputDirectory: body.outputDirectory,
            installCommand: body.installCommand,
            devCommand: body.devCommand,
            environmentVariables: body.environmentVariables || {},
            scripts: body.scripts || {},
            author: body.author,
            license: body.license,
            repository: body.repository,
            homepage: body.homepage,
            keywords: body.keywords || [],
            private: body.private,
            version: body.version
        }

        // Save settings
        await saveProjectSettings(projectPath, settings)

        // Update package.json if it exists and requested
        if (body.updatePackageJson) {
            const packageJsonPath = path.join(projectPath, 'package.json')
            try {
                const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8')
                const packageJson = JSON.parse(packageJsonContent)

                // Update package.json fields
                if (settings.name) packageJson.name = settings.name
                if (settings.description !== undefined) packageJson.description = settings.description
                if (settings.version) packageJson.version = settings.version
                if (settings.author) packageJson.author = settings.author
                if (settings.license) packageJson.license = settings.license
                if (settings.repository) packageJson.repository = settings.repository
                if (settings.homepage) packageJson.homepage = settings.homepage
                if (settings.keywords) packageJson.keywords = settings.keywords
                if (settings.private !== undefined) packageJson.private = settings.private

                // Update scripts
                if (settings.scripts && Object.keys(settings.scripts).length > 0) {
                    packageJson.scripts = { ...packageJson.scripts, ...settings.scripts }
                }

                await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8')
            } catch (error) {
                console.error('Error updating package.json:', error)
                // Don't fail the request if package.json update fails
            }
        }

        // Get updated metadata
        const metadata = await getProjectMetadata(projectPath)

        const updatedSettings: ProjectMetadata = {
            id,
            path: projectPath,
            lastModified: metadata.lastModified || new Date().toISOString(),
            size: metadata.size || 0,
            fileCount: metadata.fileCount || 0,
            ...settings
        }

        return NextResponse.json({
            success: true,
            message: 'Project settings updated successfully',
            settings: updatedSettings
        })

    } catch (error) {
        console.error('Error updating project settings:', error)
        return NextResponse.json(
            { error: 'Failed to update project settings' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params

        // Resolve project path
        const projectPath = path.resolve(WORKSPACE_ROOT, id)

        // Verify project exists
        try {
            await fs.access(projectPath)
        } catch (error) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        // Delete settings file
        const configPath = path.join(projectPath, '.codai-settings.json')
        try {
            await fs.unlink(configPath)
        } catch (error) {
            // Settings file might not exist, which is fine
        }

        return NextResponse.json({
            success: true,
            message: 'Project settings reset successfully'
        })

    } catch (error) {
        console.error('Error resetting project settings:', error)
        return NextResponse.json(
            { error: 'Failed to reset project settings' },
            { status: 500 }
        )
    }
}

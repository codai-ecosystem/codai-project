import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

interface ProjectTemplate {
  id: string
  name: string
  description: string
  category: 'frontend' | 'backend' | 'fullstack' | 'library' | 'tools'
  tags: string[]
  language: string
  framework: string
  features: string[]
  dependencies: string[]
  devDependencies: string[]
  scripts: Record<string, string>
  files: {
    path: string
    content: string
    template?: boolean
  }[]
  created: Date
  updated: Date
}

// Default project templates
const defaultTemplates: Omit<ProjectTemplate, 'created' | 'updated'>[] = [
  {
    id: 'nextjs-app',
    name: 'Next.js Application',
    description: 'Modern React application with Next.js 15, TypeScript, and Tailwind CSS',
    category: 'frontend',
    tags: ['React', 'Next.js', 'TypeScript', 'Tailwind'],
    language: 'TypeScript',
    framework: 'Next.js',
    features: [
      'Next.js 15 with App Router',
      'TypeScript configuration',
      'Tailwind CSS styling',
      'ESLint and Prettier',
      'Hot module replacement'
    ],
    dependencies: [
      'next@15.3.5',
      'react@19.1.0',
      'react-dom@19.1.0'
    ],
    devDependencies: [
      '@types/node@22.10.5',
      '@types/react@19.0.7',
      '@types/react-dom@19.0.3',
      'typescript@5.8.3',
      'tailwindcss@4.1.11',
      'eslint@9.18.0',
      'eslint-config-next@15.3.5'
    ],
    scripts: {
      'dev': 'next dev',
      'build': 'next build',
      'start': 'next start',
      'lint': 'next lint',
      'type-check': 'tsc --noEmit'
    },
    files: [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: '{{projectName}}',
          version: '0.1.0',
          private: true,
          scripts: {
            'dev': 'next dev',
            'build': 'next build',
            'start': 'next start',
            'lint': 'next lint',
            'type-check': 'tsc --noEmit'
          },
          dependencies: {
            'next': '15.3.5',
            'react': '19.1.0',
            'react-dom': '19.1.0'
          },
          devDependencies: {
            '@types/node': '22.10.5',
            '@types/react': '19.0.7',
            '@types/react-dom': '19.0.3',
            'typescript': '5.8.3',
            'tailwindcss': '4.1.11',
            'eslint': '9.18.0',
            'eslint-config-next': '15.3.5'
          }
        }, null, 2)
      },
      {
        path: 'app/page.tsx',
        content: `export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to {{projectName}}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your Next.js application is ready to go!
        </p>
        <div className="space-x-4">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Get Started
          </button>
          <button className="bg-white hover:bg-gray-50 text-indigo-600 font-medium py-2 px-4 rounded-lg border border-indigo-600 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  )
}`,
        template: true
      },
      {
        path: 'app/layout.tsx',
        content: `import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '{{projectName}}',
  description: '{{description}}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}`,
        template: true
      },
      {
        path: 'app/globals.css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;`
      },
      {
        path: 'tailwind.config.js',
        content: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`
      },
      {
        path: 'tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            lib: ['dom', 'dom.iterable', 'es6'],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            noEmit: true,
            esModuleInterop: true,
            module: 'esnext',
            moduleResolution: 'bundler',
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: 'preserve',
            incremental: true,
            plugins: [
              {
                name: 'next'
              }
            ],
            paths: {
              '@/*': ['./*']
            }
          },
          include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
          exclude: ['node_modules']
        }, null, 2)
      }
    ]
  },
  {
    id: 'react-library',
    name: 'React Component Library',
    description: 'Reusable React component library with TypeScript and Storybook',
    category: 'library',
    tags: ['React', 'TypeScript', 'Components', 'Storybook'],
    language: 'TypeScript',
    framework: 'React',
    features: [
      'React 19 components',
      'TypeScript support',
      'Storybook for documentation',
      'Rollup for bundling',
      'Jest for testing'
    ],
    dependencies: [
      'react@19.1.0',
      'react-dom@19.1.0'
    ],
    devDependencies: [
      '@types/react@19.0.7',
      '@types/react-dom@19.0.3',
      'typescript@5.8.3',
      '@rollup/plugin-typescript@12.1.2',
      'rollup@4.30.1',
      '@storybook/react@8.5.5',
      'jest@29.7.0',
      '@testing-library/react@17.0.2'
    ],
    scripts: {
      'build': 'rollup -c',
      'dev': 'rollup -c -w',
      'test': 'jest',
      'storybook': 'storybook dev -p 6006',
      'build-storybook': 'storybook build'
    },
    files: [
      {
        path: 'src/index.ts',
        content: `export { default as Button } from './components/Button'
export { default as Input } from './components/Input'
export type { ButtonProps } from './components/Button'
export type { InputProps } from './components/Input'`
      },
      {
        path: 'src/components/Button/index.tsx',
        content: `import React from 'react'

export interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: () => void
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2'
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }
  
  return (
    <button
      className={\`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]} \${disabled ? 'opacity-50 cursor-not-allowed' : ''}\`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button`
      }
    ]
  },
  {
    id: 'express-api',
    name: 'Express.js API',
    description: 'RESTful API server with Express.js, TypeScript, and MongoDB',
    category: 'backend',
    tags: ['Express', 'TypeScript', 'MongoDB', 'REST API'],
    language: 'TypeScript',
    framework: 'Express.js',
    features: [
      'Express.js server',
      'TypeScript configuration',
      'MongoDB integration',
      'Authentication middleware',
      'API documentation',
      'Error handling'
    ],
    dependencies: [
      'express@4.21.2',
      'mongoose@8.9.6',
      'cors@2.8.5',
      'helmet@8.0.0',
      'dotenv@16.4.7',
      'bcryptjs@2.4.3',
      'jsonwebtoken@9.0.2'
    ],
    devDependencies: [
      '@types/express@5.0.0',
      '@types/node@22.10.5',
      '@types/cors@2.8.17',
      '@types/bcryptjs@2.4.6',
      '@types/jsonwebtoken@9.0.7',
      'typescript@5.8.3',
      'ts-node@10.9.2',
      'nodemon@3.1.9'
    ],
    scripts: {
      'dev': 'nodemon src/index.ts',
      'build': 'tsc',
      'start': 'node dist/index.js',
      'test': 'jest'
    },
    files: [
      {
        path: 'src/index.ts',
        content: `import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(helmet())
app.use(express.json())

// MongoDB connection
mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost:27017/{{projectName}}')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error))

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to {{projectName}} API' })
})

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(error.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`)
})`,
        template: true
      }
    ]
  }
]

// Helper function to get templates directory
function getTemplatesDirectory(): string {
  const workspaceRoot = process.cwd().includes('apps')
    ? path.join(process.cwd(), '..', '..')
    : process.cwd()
  return path.join(workspaceRoot, '.codai', 'templates')
}

// Helper function to save template
async function saveTemplate(template: ProjectTemplate): Promise<void> {
  const templatesDir = getTemplatesDirectory()
  await fs.mkdir(templatesDir, { recursive: true })

  const templatePath = path.join(templatesDir, `${template.id}.json`)
  await fs.writeFile(templatePath, JSON.stringify(template, null, 2))
}

// Helper function to load template
async function loadTemplate(templateId: string): Promise<ProjectTemplate | null> {
  try {
    const templatesDir = getTemplatesDirectory()
    const templatePath = path.join(templatesDir, `${templateId}.json`)
    const content = await fs.readFile(templatePath, 'utf8')
    return JSON.parse(content)
  } catch {
    return null
  }
}

// Helper function to load all templates
async function loadAllTemplates(): Promise<ProjectTemplate[]> {
  const templates: ProjectTemplate[] = []

  // Add default templates
  for (const defaultTemplate of defaultTemplates) {
    templates.push({
      ...defaultTemplate,
      created: new Date(),
      updated: new Date()
    })
  }

  // Load custom templates
  try {
    const templatesDir = getTemplatesDirectory()
    await fs.mkdir(templatesDir, { recursive: true })

    const files = await fs.readdir(templatesDir)
    const templateFiles = files.filter(file => file.endsWith('.json'))

    for (const file of templateFiles) {
      try {
        const templatePath = path.join(templatesDir, file)
        const content = await fs.readFile(templatePath, 'utf8')
        const template = JSON.parse(content)

        // Don't duplicate default templates
        if (!defaultTemplates.find(dt => dt.id === template.id)) {
          templates.push(template)
        }
      } catch {
        // Skip invalid template files
      }
    }
  } catch {
    // Templates directory doesn't exist or can't be read
  }

  return templates
}

// GET: List all project templates
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')
    const search = url.searchParams.get('search')

    let templates = await loadAllTemplates()

    // Filter by category
    if (category) {
      templates = templates.filter(template => template.category === category)
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase()
      templates = templates.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        template.description.toLowerCase().includes(searchLower) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    return NextResponse.json({
      templates: templates.map(template => ({
        ...template,
        files: undefined // Don't include file content in list
      }))
    })

  } catch (error) {
    console.error('Error loading templates:', error)
    return NextResponse.json(
      { error: 'Failed to load templates' },
      { status: 500 }
    )
  }
}

// POST: Create new custom template
export async function POST(request: NextRequest) {
  try {
    const templateData = await request.json()

    // Validate required fields
    if (!templateData.id || !templateData.name || !templateData.category) {
      return NextResponse.json(
        { error: 'Template ID, name, and category are required' },
        { status: 400 }
      )
    }

    // Check if template already exists
    const existing = await loadTemplate(templateData.id)
    if (existing) {
      return NextResponse.json(
        { error: 'Template with this ID already exists' },
        { status: 409 }
      )
    }

    const template: ProjectTemplate = {
      ...templateData,
      created: new Date(),
      updated: new Date()
    }

    await saveTemplate(template)

    return NextResponse.json({
      message: 'Template created successfully',
      template: {
        ...template,
        files: undefined // Don't return file content
      }
    })

  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}

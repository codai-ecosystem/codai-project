'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FabricAILayout from '../../components/layout/FabricAILayout'
import FabricAIService from '../../services/fabricaiService'
import {
    Sparkles,
    Send,
    Copy,
    Download,
    Code,
    Settings,
    Play,
    Save,
    Share,
    Wand2,
    FileCode,
    Brain,
    Zap,
    CheckCircle,
    AlertCircle,
    Clock,
    Lightbulb,
    MessageSquare,
    History
} from 'lucide-react'

interface GenerationResult {
    id: string
    prompt: string
    code: string
    language: string
    framework?: string
    timestamp: string
    quality: number
    suggestions: string[]
    estimatedLines: number
    complexity: number
}

interface CodeGenerationOptions {
    language: string
    framework?: string
    style?: 'functional' | 'class-based' | 'modular'
    includeTests?: boolean
    includeDocumentation?: boolean
    optimizePerformance?: boolean
    addTypeSafety?: boolean
}

export default function CodeGeneratorPage() {
    const [prompt, setPrompt] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null)
    const [generationHistory, setGenerationHistory] = useState<GenerationResult[]>([])
    const [options, setOptions] = useState<CodeGenerationOptions>({
        language: 'TypeScript',
        framework: 'React',
        style: 'functional',
        includeTests: false,
        includeDocumentation: true,
        optimizePerformance: true,
        addTypeSafety: true
    })
    const [showOptions, setShowOptions] = useState(false)
    const [showHistory, setShowHistory] = useState(false)
    const [copiedCode, setCopiedCode] = useState(false)

    const codeRef = useRef<HTMLPreElement>(null)
    const fabricaiService = FabricAIService.getInstance()

    const languages = [
        'TypeScript', 'JavaScript', 'Python', 'Java', 'C#', 'C++', 'Rust', 'Go', 'PHP', 'Ruby'
    ]

    const frameworks = {
        TypeScript: ['React', 'Next.js', 'Node.js', 'Express', 'NestJS', 'Vue', 'Angular'],
        JavaScript: ['React', 'Next.js', 'Node.js', 'Express', 'Vue', 'Angular', 'Svelte'],
        Python: ['Django', 'Flask', 'FastAPI', 'Scikit-learn', 'TensorFlow', 'PyTorch'],
        Java: ['Spring', 'Spring Boot', 'Hibernate', 'Maven', 'Gradle'],
        'C#': ['.NET Core', 'ASP.NET', 'Entity Framework', 'Xamarin'],
        'C++': ['Qt', 'Boost', 'CMake'],
        Rust: ['Actix', 'Tokio', 'Serde', 'Diesel'],
        Go: ['Gin', 'Echo', 'Fiber', 'GORM'],
        PHP: ['Laravel', 'Symfony', 'CodeIgniter'],
        Ruby: ['Rails', 'Sinatra', 'Grape']
    }

    const examplePrompts = [
        "Create a responsive React component for a user profile card with avatar, name, and social links",
        "Build a REST API endpoint for user authentication with JWT tokens",
        "Generate a Python class for machine learning data preprocessing",
        "Create a TypeScript interface for an e-commerce product catalog",
        "Build a real-time chat component with WebSocket integration",
        "Generate a database schema for a task management system",
        "Create an animated loading spinner component with CSS",
        "Build a form validation hook for React applications"
    ]

    const handleGenerate = async () => {
        if (!prompt.trim()) return

        setIsGenerating(true)
        try {
            const result = await fabricaiService.generateCode(prompt, options)
            setGenerationResult(result)
            setGenerationHistory(prev => [result, ...prev.slice(0, 9)]) // Keep last 10
        } catch (error) {
            console.error('Code generation failed:', error)
        } finally {
            setIsGenerating(false)
        }
    }

    const handleCopyCode = async () => {
        if (generationResult?.code) {
            await navigator.clipboard.writeText(generationResult.code)
            setCopiedCode(true)
            setTimeout(() => setCopiedCode(false), 2000)
        }
    }

    const handleDownloadCode = () => {
        if (generationResult) {
            const blob = new Blob([generationResult.code], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `generated-code.${getFileExtension(generationResult.language)}`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }
    }

    const getFileExtension = (language: string) => {
        const extensions: Record<string, string> = {
            TypeScript: 'ts',
            JavaScript: 'js',
            Python: 'py',
            Java: 'java',
            'C#': 'cs',
            'C++': 'cpp',
            Rust: 'rs',
            Go: 'go',
            PHP: 'php',
            Ruby: 'rb'
        }
        return extensions[language] || 'txt'
    }

    const getQualityColor = (quality: number) => {
        if (quality >= 90) return 'text-emerald-400'
        if (quality >= 70) return 'text-yellow-400'
        return 'text-red-400'
    }

    const getComplexityLevel = (complexity: number) => {
        if (complexity <= 2) return 'Simple'
        if (complexity <= 4) return 'Moderate'
        return 'Complex'
    }

    return (
        <FabricAILayout>
            <div className="p-6 space-y-6">
                {/* Header */}
                <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                            <Sparkles className="w-8 h-8 mr-3 text-purple-400" />
                            Code Generator
                        </h1>
                        <p className="text-slate-300">Generate high-quality code with AI assistance</p>
                    </div>

                    <div className="flex items-center space-x-4">
                        <motion.button
                            className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 text-white hover:bg-white/15 transition-all"
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setShowHistory(!showHistory)}
                        >
                            <History className="w-4 h-4" />
                            <span>History</span>
                        </motion.button>

                        <motion.button
                            className="flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 text-white hover:bg-white/15 transition-all"
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setShowOptions(!showOptions)}
                        >
                            <Settings className="w-4 h-4" />
                            <span>Options</span>
                        </motion.button>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Input Section */}
                    <motion.div
                        className="lg:col-span-2 space-y-6"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        {/* Prompt Input */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                            <div className="flex items-center space-x-3 mb-4">
                                <Brain className="w-5 h-5 text-purple-400" />
                                <h3 className="text-white font-semibold">Describe what you want to build</h3>
                            </div>

                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="E.g., Create a responsive React component for a user dashboard with charts and real-time data..."
                                className="w-full h-32 bg-white/5 border border-white/20 rounded-lg p-4 text-white placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />

                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center space-x-2">
                                    <MessageSquare className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-400 text-sm">{prompt.length} characters</span>
                                </div>

                                <motion.button
                                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-emerald-500 rounded-lg text-white font-medium hover:from-purple-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleGenerate}
                                    disabled={!prompt.trim() || isGenerating}
                                >
                                    {isGenerating ? (
                                        <>
                                            <motion.div
                                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            />
                                            <span>Generating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="w-4 h-4" />
                                            <span>Generate Code</span>
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>

                        {/* Example Prompts */}
                        {!generationResult && (
                            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                                <div className="flex items-center space-x-3 mb-4">
                                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                                    <h3 className="text-white font-semibold">Example Prompts</h3>
                                </div>

                                <div className="grid gap-3">
                                    {examplePrompts.slice(0, 4).map((example, index) => (
                                        <motion.button
                                            key={index}
                                            className="text-left p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                                            whileHover={{ scale: 1.02 }}
                                            onClick={() => setPrompt(example)}
                                        >
                                            <span className="text-slate-300 text-sm">{example}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Generated Code */}
                        <AnimatePresence>
                            {generationResult && (
                                <motion.div
                                    className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    {/* Code Header */}
                                    <div className="flex items-center justify-between p-4 border-b border-white/20">
                                        <div className="flex items-center space-x-3">
                                            <FileCode className="w-5 h-5 text-purple-400" />
                                            <h3 className="text-white font-semibold">Generated Code</h3>
                                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                                                {generationResult.language}
                                            </span>
                                            {generationResult.framework && (
                                                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-xs">
                                                    {generationResult.framework}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <motion.button
                                                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={handleCopyCode}
                                            >
                                                {copiedCode ? (
                                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-slate-400" />
                                                )}
                                            </motion.button>

                                            <motion.button
                                                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={handleDownloadCode}
                                            >
                                                <Download className="w-4 h-4 text-slate-400" />
                                            </motion.button>

                                            <motion.button
                                                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <Share className="w-4 h-4 text-slate-400" />
                                            </motion.button>

                                            <motion.button
                                                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <Save className="w-4 h-4 text-slate-400" />
                                            </motion.button>
                                        </div>
                                    </div>

                                    {/* Code Content */}
                                    <div className="relative">
                                        <pre
                                            ref={codeRef}
                                            className="p-6 bg-slate-900/50 text-green-300 text-sm overflow-x-auto max-h-96 font-mono"
                                        >
                                            {generationResult.code}
                                        </pre>
                                    </div>

                                    {/* Code Stats */}
                                    <div className="p-4 border-t border-white/20 bg-white/5">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center">
                                                <div className={`text-lg font-semibold ${getQualityColor(generationResult.quality)}`}>
                                                    {generationResult.quality}%
                                                </div>
                                                <div className="text-slate-400 text-xs">Quality</div>
                                            </div>

                                            <div className="text-center">
                                                <div className="text-lg font-semibold text-purple-400">
                                                    {generationResult.estimatedLines}
                                                </div>
                                                <div className="text-slate-400 text-xs">Lines</div>
                                            </div>

                                            <div className="text-center">
                                                <div className="text-lg font-semibold text-blue-400">
                                                    {getComplexityLevel(generationResult.complexity)}
                                                </div>
                                                <div className="text-slate-400 text-xs">Complexity</div>
                                            </div>

                                            <div className="text-center">
                                                <div className="text-lg font-semibold text-emerald-400">
                                                    {generationResult.suggestions.length}
                                                </div>
                                                <div className="text-slate-400 text-xs">Suggestions</div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Suggestions */}
                        <AnimatePresence>
                            {generationResult?.suggestions && generationResult.suggestions.length > 0 && (
                                <motion.div
                                    className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <div className="flex items-center space-x-3 mb-4">
                                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                                        <h3 className="text-white font-semibold">AI Suggestions</h3>
                                    </div>

                                    <div className="space-y-3">
                                        {generationResult.suggestions.map((suggestion, index) => (
                                            <motion.div
                                                key={index}
                                                className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                                                <span className="text-slate-300 text-sm">{suggestion}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Sidebar */}
                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {/* Generation Options */}
                        <AnimatePresence>
                            {showOptions && (
                                <motion.div
                                    className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <h3 className="text-white font-semibold mb-4 flex items-center">
                                        <Settings className="w-5 h-5 mr-2 text-purple-400" />
                                        Generation Options
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Language */}
                                        <div>
                                            <label className="block text-slate-300 text-sm mb-2">Language</label>
                                            <select
                                                value={options.language}
                                                onChange={(e) => setOptions(prev => ({ ...prev, language: e.target.value, framework: undefined }))}
                                                className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                {languages.map(lang => (
                                                    <option key={lang} value={lang}>{lang}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Framework */}
                                        <div>
                                            <label className="block text-slate-300 text-sm mb-2">Framework</label>
                                            <select
                                                value={options.framework || ''}
                                                onChange={(e) => setOptions(prev => ({ ...prev, framework: e.target.value || undefined }))}
                                                className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="">None</option>
                                                {frameworks[options.language as keyof typeof frameworks]?.map(fw => (
                                                    <option key={fw} value={fw}>{fw}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Style */}
                                        <div>
                                            <label className="block text-slate-300 text-sm mb-2">Code Style</label>
                                            <select
                                                value={options.style}
                                                onChange={(e) => setOptions(prev => ({ ...prev, style: e.target.value as any }))}
                                                className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            >
                                                <option value="functional">Functional</option>
                                                <option value="class-based">Class-based</option>
                                                <option value="modular">Modular</option>
                                            </select>
                                        </div>

                                        {/* Checkboxes */}
                                        <div className="space-y-2">
                                            {[
                                                { key: 'includeTests', label: 'Include Tests' },
                                                { key: 'includeDocumentation', label: 'Include Documentation' },
                                                { key: 'optimizePerformance', label: 'Optimize Performance' },
                                                { key: 'addTypeSafety', label: 'Add Type Safety' }
                                            ].map(({ key, label }) => (
                                                <label key={key} className="flex items-center space-x-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={options[key as keyof CodeGenerationOptions] as boolean}
                                                        onChange={(e) => setOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                                                        className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                                                    />
                                                    <span className="text-slate-300 text-sm">{label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Generation History */}
                        <AnimatePresence>
                            {showHistory && (
                                <motion.div
                                    className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                >
                                    <h3 className="text-white font-semibold mb-4 flex items-center">
                                        <History className="w-5 h-5 mr-2 text-purple-400" />
                                        Recent Generations
                                    </h3>

                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {generationHistory.map((item, index) => (
                                            <motion.button
                                                key={item.id}
                                                className="w-full text-left p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => setGenerationResult(item)}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-purple-300 text-xs">{item.language}</span>
                                                    <span className="text-slate-400 text-xs">{item.timestamp}</span>
                                                </div>
                                                <p className="text-slate-300 text-sm truncate">{item.prompt}</p>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <span className={`text-xs ${getQualityColor(item.quality)}`}>
                                                        {item.quality}% quality
                                                    </span>
                                                    <span className="text-slate-400 text-xs">
                                                        {item.estimatedLines} lines
                                                    </span>
                                                </div>
                                            </motion.button>
                                        ))}

                                        {generationHistory.length === 0 && (
                                            <div className="text-center py-8">
                                                <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                                <p className="text-slate-400 text-sm">No generations yet</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Quick Stats */}
                        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20">
                            <h3 className="text-white font-semibold mb-4 flex items-center">
                                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                                Quick Stats
                            </h3>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-300 text-sm">Generations Today</span>
                                    <span className="text-white font-medium">12</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-300 text-sm">Lines Generated</span>
                                    <span className="text-white font-medium">2,456</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-300 text-sm">Avg Quality</span>
                                    <span className="text-emerald-400 font-medium">94%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-300 text-sm">Time Saved</span>
                                    <span className="text-purple-400 font-medium">8.5 hours</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </FabricAILayout>
    )
}

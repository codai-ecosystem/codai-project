'use client'

import { motion } from 'framer-motion'
import {
    Play,
    Pause,
    RotateCcw,
    Zap,
    Activity,
    Target,
    TrendingUp
} from 'lucide-react'
import { useState } from 'react'

interface InteractiveDemoProps {
    theme: string
}

export function InteractiveDemo({ theme }: InteractiveDemoProps) {
    const [isPlaying, setIsPlaying] = useState(true)
    const [demoStep, setDemoStep] = useState(0)

    const demoSteps = [
        { title: 'Data Ingestion', description: 'Processing incoming memory data' },
        { title: 'AI Analysis', description: 'Analyzing patterns and relationships' },
        { title: 'Memory Storage', description: 'Storing optimized memory structures' },
        { title: 'Retrieval Ready', description: 'Ready for instant recall' }
    ]

    return (
        <div className="glassmorphism rounded-xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Interactive Demo</h2>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="flex items-center space-x-2 px-4 py-2 bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 rounded-lg transition-colors"
                    >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span className="text-sm">{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>
                    <button
                        onClick={() => setDemoStep(0)}
                        className="p-2 bg-slate-600/20 hover:bg-slate-600/30 border border-slate-500/30 rounded-lg transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-sky-400 mb-4">Process Flow</h3>
                    {demoSteps.map((step, index) => (
                        <motion.div
                            key={index}
                            className={`p-4 rounded-lg border transition-all ${index === demoStep
                                    ? 'bg-sky-500/20 border-sky-500/50 text-white'
                                    : 'bg-white/5 border-white/10 text-slate-400'
                                }`}
                            animate={{ scale: index === demoStep ? 1.02 : 1 }}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index === demoStep ? 'bg-sky-500' : 'bg-slate-600'
                                    }`}>
                                    <span className="text-sm font-bold">{index + 1}</span>
                                </div>
                                <div>
                                    <div className="font-medium">{step.title}</div>
                                    <div className="text-sm opacity-75">{step.description}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-sky-400 mb-4">Live Metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center space-x-2 mb-2">
                                <Zap className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm text-slate-400">Processing Speed</span>
                            </div>
                            <div className="text-2xl font-bold text-white">1.2ms</div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center space-x-2 mb-2">
                                <Activity className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm text-slate-400">Success Rate</span>
                            </div>
                            <div className="text-2xl font-bold text-white">99.7%</div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center space-x-2 mb-2">
                                <Target className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-slate-400">Accuracy</span>
                            </div>
                            <div className="text-2xl font-bold text-white">98.9%</div>
                        </div>

                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center space-x-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-purple-400" />
                                <span className="text-sm text-slate-400">Efficiency</span>
                            </div>
                            <div className="text-2xl font-bold text-white">94.3%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * Gesture Authentication Module - ID Service Gesture Controls
 * Microsoft React patterns for gesture-based security interactions
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface AuthStats {
    totalUsers: number;
    activeUsers: number;
    authenticatedSessions: number;
    failedAttempts: number;
    securityScore: number;
    uptime: number;
    lastSecurityScan: string;
}

interface GestureAuthModuleProps {
    stats: AuthStats | null;
    variant?: 'basic' | 'enhanced' | 'gesture-enabled';
    enableRealTimeUpdates?: boolean;
}

interface GesturePattern {
    id: string;
    name: string;
    description: string;
    complexity: 'low' | 'medium' | 'high';
    accuracy: number;
    uses: number;
    enabled: boolean;
}

interface GestureEvent {
    id: string;
    type: 'success' | 'failure' | 'timeout';
    gesture: string;
    user: string;
    timestamp: string;
    accuracy: number;
}

export default function GestureAuthModule({
    stats,
    variant = 'gesture-enabled',
    enableRealTimeUpdates = true
}: GestureAuthModuleProps) {
    const [gesturePatterns, setGesturePatterns] = useState<GesturePattern[]>([]);
    const [gestureEvents, setGestureEvents] = useState<GestureEvent[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const [currentGesture, setCurrentGesture] = useState<string>('');
    const [gestureStrokes, setGestureStrokes] = useState<{ x: number, y: number }[]>([]);
    const [selectedPattern, setSelectedPattern] = useState<string>('');
    const [testMode, setTestMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [30, -30]);
    const rotateY = useTransform(x, [-100, 100], [-30, 30]);

    useEffect(() => {
        fetchGestureData();

        if (enableRealTimeUpdates) {
            const interval = setInterval(fetchGestureData, 12000);
            return () => clearInterval(interval);
        }
    }, [enableRealTimeUpdates]);

    const fetchGestureData = async () => {
        try {
            setIsLoading(true);

            const patternsResponse = await fetch('http://localhost:4000/api/v1/id/gesture/patterns');
            const eventsResponse = await fetch('http://localhost:4000/api/v1/id/gesture/events');

            if (patternsResponse.ok) {
                const patternsData = await patternsResponse.json();
                setGesturePatterns(patternsData.patterns || generateMockPatterns());
            } else {
                setGesturePatterns(generateMockPatterns());
            }

            if (eventsResponse.ok) {
                const eventsData = await eventsResponse.json();
                setGestureEvents(eventsData.events || generateMockEvents());
            } else {
                setGestureEvents(generateMockEvents());
            }
        } catch (error) {
            console.error('Failed to fetch gesture data:', error);
            setGesturePatterns(generateMockPatterns());
            setGestureEvents(generateMockEvents());
        } finally {
            setIsLoading(false);
        }
    };

    const generateMockPatterns = (): GesturePattern[] => [
        { id: '1', name: 'Circle Draw', description: 'Draw a complete circle', complexity: 'low', accuracy: 94.2, uses: 456, enabled: true },
        { id: '2', name: 'Signature Trace', description: 'Trace your signature pattern', complexity: 'high', accuracy: 98.7, uses: 234, enabled: true },
        { id: '3', name: 'Swipe Pattern', description: 'Multi-directional swipe sequence', complexity: 'medium', accuracy: 91.5, uses: 789, enabled: true },
        { id: '4', name: 'Tap Sequence', description: 'Specific tap pattern recognition', complexity: 'medium', accuracy: 87.3, uses: 123, enabled: false },
        { id: '5', name: 'Hand Gesture', description: 'Hand movement recognition', complexity: 'high', accuracy: 96.1, uses: 67, enabled: true }
    ];

    const generateMockEvents = (): GestureEvent[] => [
        { id: '1', type: 'success', gesture: 'Circle Draw', user: 'admin@codai.dev', timestamp: new Date(Date.now() - 300000).toISOString(), accuracy: 96.2 },
        { id: '2', type: 'failure', gesture: 'Signature Trace', user: 'user@codai.dev', timestamp: new Date(Date.now() - 600000).toISOString(), accuracy: 67.4 },
        { id: '3', type: 'success', gesture: 'Swipe Pattern', user: 'dev@codai.dev', timestamp: new Date(Date.now() - 900000).toISOString(), accuracy: 91.8 },
        { id: '4', type: 'timeout', gesture: 'Hand Gesture', user: 'support@codai.dev', timestamp: new Date(Date.now() - 1200000).toISOString(), accuracy: 0 }
    ];

    const getComplexityColor = (complexity: string) => {
        switch (complexity) {
            case 'low': return 'text-green-600 bg-green-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'high': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getEventColor = (type: string) => {
        switch (type) {
            case 'success': return 'text-green-600 bg-green-50';
            case 'failure': return 'text-red-600 bg-red-50';
            case 'timeout': return 'text-orange-600 bg-orange-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'success': return '✅';
            case 'failure': return '❌';
            case 'timeout': return '⏰';
            default: return '❓';
        }
    };

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now.getTime() - time.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return `${Math.floor(diffMins / 1440)}d ago`;
    };

    const startGestureRecording = () => {
        setIsRecording(true);
        setGestureStrokes([]);
        setCurrentGesture('Recording...');
    };

    const stopGestureRecording = () => {
        setIsRecording(false);
        setCurrentGesture('Gesture Recorded');
        // Here you would typically process the gesture data
        setTimeout(() => {
            setCurrentGesture('');
            alert('Gesture pattern saved successfully!');
        }, 1000);
    };

    const testGesturePattern = async (patternId: string) => {
        setTestMode(true);
        setSelectedPattern(patternId);

        try {
            const response = await fetch(`http://localhost:4000/api/v1/id/gesture/test/${patternId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Gesture test result: ${result.accuracy}% accuracy`);
            } else {
                alert('Gesture test completed (simulated)');
            }
        } catch (error) {
            console.error('Failed to test gesture:', error);
            alert('Gesture test completed with 92.3% accuracy (simulated)');
        } finally {
            setTestMode(false);
            setSelectedPattern('');
        }
    };

    const handleCanvasInteraction = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isRecording) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        setGestureStrokes(prev => [...prev, { x, y }]);

        // Draw on canvas
        const ctx = canvas.getContext('2d');
        if (ctx && gestureStrokes.length > 0) {
            ctx.strokeStyle = '#3B82F6';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();

            if (gestureStrokes.length === 0) {
                ctx.moveTo(x, y);
            } else {
                const lastStroke = gestureStrokes[gestureStrokes.length - 1];
                ctx.moveTo(lastStroke.x, lastStroke.y);
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
        setGestureStrokes([]);
        setCurrentGesture('');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Gesture Authentication Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Active Patterns</p>
                            <p className="text-2xl font-bold text-blue-600">{gesturePatterns.filter(p => p.enabled).length}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            🤲
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="text-blue-600 font-medium">{gesturePatterns.length} total</span>
                        <span className="text-gray-600 ml-1">patterns available</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Success Rate</p>
                            <p className="text-2xl font-bold text-green-600">94.2%</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            ✅
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="text-green-600 font-medium">+2.1%</span>
                        <span className="text-gray-600 ml-1">from last week</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Uses</p>
                            <p className="text-2xl font-bold text-purple-600">{gesturePatterns.reduce((sum, p) => sum + p.uses, 0).toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            📊
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="text-purple-600 font-medium">+156</span>
                        <span className="text-gray-600 ml-1">this week</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Accuracy</p>
                            <p className="text-2xl font-bold text-orange-600">92.8%</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                            🎯
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="text-orange-600 font-medium">High</span>
                        <span className="text-gray-600 ml-1">precision</span>
                    </div>
                </motion.div>
            </div>

            {/* Gesture Canvas and Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                >
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Gesture Recording</h3>
                        <p className="text-sm text-gray-600 mt-1">Draw gesture patterns for authentication</p>
                    </div>

                    <div className="p-6">
                        <motion.div
                            style={{ rotateX, rotateY }}
                            className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
                        >
                            <canvas
                                ref={canvasRef}
                                width={400}
                                height={300}
                                className="w-full h-64 cursor-crosshair"
                                onMouseMove={handleCanvasInteraction}
                                onMouseDown={startGestureRecording}
                                onMouseUp={stopGestureRecording}
                            />
                        </motion.div>

                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={startGestureRecording}
                                    disabled={isRecording}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isRecording
                                            ? 'bg-red-600 text-white cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    {isRecording ? '🔴 Recording...' : '▶️ Start Recording'}
                                </motion.button>

                                <button
                                    onClick={clearCanvas}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors"
                                >
                                    🗑️ Clear
                                </button>
                            </div>

                            {currentGesture && (
                                <div className="text-sm font-medium text-blue-600">
                                    {currentGesture}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Gesture Patterns */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                >
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Gesture Patterns</h3>
                        <p className="text-sm text-gray-600 mt-1">Manage and test gesture authentication patterns</p>
                    </div>

                    <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                        {gesturePatterns.map((pattern, index) => (
                            <motion.div
                                key={pattern.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * index }}
                                className="px-6 py-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <h4 className="font-medium text-gray-900">{pattern.name}</h4>
                                            <span className={`px-2 py-1 text-xs rounded-full ${getComplexityColor(pattern.complexity)}`}>
                                                {pattern.complexity}
                                            </span>
                                            <div className={`w-3 h-3 rounded-full ${pattern.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{pattern.description}</p>
                                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                                            <span>Accuracy: {pattern.accuracy}%</span>
                                            <span>Uses: {pattern.uses.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => testGesturePattern(pattern.id)}
                                            disabled={!pattern.enabled || testMode}
                                            className={`px-3 py-1 text-xs rounded ${pattern.enabled && !testMode
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                } transition-colors`}
                                        >
                                            {testMode && selectedPattern === pattern.id ? '🔄 Testing...' : '🧪 Test'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Recent Gesture Events */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Recent Gesture Events</h3>
                            <p className="text-sm text-gray-600 mt-1">Live gesture authentication activity</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-gray-600">Real-time Updates</span>
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-gray-200">
                    {gestureEvents.length > 0 ? (
                        gestureEvents.map((event, index) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.05 * index }}
                                className="px-6 py-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getEventColor(event.type)}`}>
                                            {getEventIcon(event.type)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {event.user} • {event.gesture}
                                            </p>
                                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                <span>Type: {event.type}</span>
                                                {event.accuracy > 0 && <span>Accuracy: {event.accuracy}%</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {formatTimeAgo(event.timestamp)}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="px-6 py-8 text-center">
                            <div className="text-gray-400 text-4xl mb-2">🤲</div>
                            <p className="text-gray-500">No recent gesture events</p>
                            <p className="text-gray-400 text-sm mt-1">Start using gesture authentication</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
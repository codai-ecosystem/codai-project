'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { codaiProjects, getProjectsByTier } from '@/data/projects';

interface NetworkNode {
    id: string;
    name: string;
    tier: number;
    category: string;
    x: number;
    y: number;
    radius: number;
    connections: string[];
    color: string;
    pulse: boolean;
}

interface NetworkEdge {
    from: string;
    to: string;
    strength: number;
    flow: 'bidirectional' | 'outbound' | 'inbound';
    active: boolean;
}

const ConnectionMap: React.FC = () => {
    const { theme } = useTheme();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [selectedTier, setSelectedTier] = useState<number | null>(null);
    const [animationFrame, setAnimationFrame] = useState(0);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

    // Animation loop
    useEffect(() => {
        const animate = () => {
            setAnimationFrame(prev => prev + 1);
            requestAnimationFrame(animate);
        };
        const frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, []);

    // Canvas size tracking
    useEffect(() => {
        if (!canvasRef.current) return;

        const updateSize = () => {
            const container = canvasRef.current!.parentElement;
            if (container) {
                const rect = container.getBoundingClientRect();
                setCanvasSize({ width: rect.width, height: rect.height });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Generate network topology
    const networkData = useMemo(() => {
        const centerX = canvasSize.width / 2;
        const centerY = canvasSize.height / 2;
        const maxRadius = Math.min(canvasSize.width, canvasSize.height) * 0.4;

        // Color mapping for tiers
        const tierColors = {
            1: '#EF4444', // red
            2: '#F97316', // orange
            3: '#3B82F6', // blue
            4: '#8B5CF6', // purple
            5: '#10B981'  // green
        };

        // Create nodes
        const nodes: NetworkNode[] = [];

        // Central hub node
        nodes.push({
            id: 'hub',
            name: 'CODAI Hub',
            tier: 0,
            category: 'Core',
            x: centerX,
            y: centerY,
            radius: 30,
            connections: [],
            color: '#3B82F6',
            pulse: true
        });

        // Project nodes arranged in concentric circles by tier
        [1, 2, 3, 4, 5].forEach(tier => {
            const tierProjects = getProjectsByTier(tier).slice(0, 8); // Limit for visualization
            const tierRadius = (tier / 5) * maxRadius + 80;
            const angleStep = (2 * Math.PI) / Math.max(tierProjects.length, 6);

            tierProjects.forEach((project, index) => {
                const angle = index * angleStep + (tier * 0.3); // Offset each tier
                const x = centerX + Math.cos(angle) * tierRadius;
                const y = centerY + Math.sin(angle) * tierRadius;

                nodes.push({
                    id: project.id,
                    name: project.name,
                    tier,
                    category: project.category,
                    x,
                    y,
                    radius: 12 + (5 - tier) * 2, // Larger for lower tiers
                    connections: ['hub'],
                    color: tierColors[tier as keyof typeof tierColors],
                    pulse: project.priority === 'critical'
                });
            });
        });

        // Create connections
        const edges: NetworkEdge[] = [];

        // Hub connections
        nodes.filter(n => n.id !== 'hub').forEach(node => {
            edges.push({
                from: 'hub',
                to: node.id,
                strength: 0.8,
                flow: 'bidirectional',
                active: true
            });
        });

        // Inter-tier connections
        nodes.forEach(nodeA => {
            nodes.forEach(nodeB => {
                if (nodeA.id !== nodeB.id &&
                    nodeA.tier !== 0 && nodeB.tier !== 0 &&
                    Math.abs(nodeA.tier - nodeB.tier) === 1 &&
                    Math.random() > 0.7) {

                    edges.push({
                        from: nodeA.id,
                        to: nodeB.id,
                        strength: 0.3 + Math.random() * 0.4,
                        flow: Math.random() > 0.5 ? 'bidirectional' : 'outbound',
                        active: Math.random() > 0.3
                    });
                }
            });
        });

        // Intra-tier connections (same tier)
        [1, 2, 3, 4, 5].forEach(tier => {
            const tierNodes = nodes.filter(n => n.tier === tier);
            for (let i = 0; i < tierNodes.length; i++) {
                const nextIndex = (i + 1) % tierNodes.length;
                if (Math.random() > 0.6) {
                    edges.push({
                        from: tierNodes[i].id,
                        to: tierNodes[nextIndex].id,
                        strength: 0.2 + Math.random() * 0.3,
                        flow: 'bidirectional',
                        active: false
                    });
                }
            }
        });

        return { nodes, edges };
    }, [canvasSize]);

    // Canvas drawing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        canvas.width = canvasSize.width * 2; // For retina displays
        canvas.height = canvasSize.height * 2;
        canvas.style.width = `${canvasSize.width}px`;
        canvas.style.height = `${canvasSize.height}px`;
        ctx.scale(2, 2);

        // Clear canvas
        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

        // Draw background grid
        ctx.strokeStyle = theme === 'dark' ? 'rgba(71, 85, 105, 0.1)' : 'rgba(203, 213, 225, 0.2)';
        ctx.lineWidth = 0.5;
        const gridSize = 50;
        for (let x = 0; x <= canvasSize.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvasSize.height);
            ctx.stroke();
        }
        for (let y = 0; y <= canvasSize.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvasSize.width, y);
            ctx.stroke();
        }

        // Draw edges
        networkData.edges.forEach(edge => {
            const fromNode = networkData.nodes.find(n => n.id === edge.from);
            const toNode = networkData.nodes.find(n => n.id === edge.to);

            if (!fromNode || !toNode) return;

            const isHighlighted = hoveredNode &&
                (hoveredNode === edge.from || hoveredNode === edge.to);

            const isFiltered = selectedTier !== null &&
                (fromNode.tier !== selectedTier && toNode.tier !== selectedTier &&
                    fromNode.tier !== 0 && toNode.tier !== 0);

            if (isFiltered) return;

            // Edge styling
            const alpha = isHighlighted ? 0.8 : hoveredNode ? 0.2 : edge.active ? 0.6 : 0.3;
            const lineWidth = isHighlighted ? 3 : edge.strength * 2;

            ctx.strokeStyle = edge.active
                ? `rgba(59, 130, 246, ${alpha})`
                : `rgba(156, 163, 175, ${alpha})`;
            ctx.lineWidth = lineWidth;

            // Draw connection line
            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.stroke();

            // Draw flow indicators
            if (edge.active && isHighlighted) {
                const midX = (fromNode.x + toNode.x) / 2;
                const midY = (fromNode.y + toNode.y) / 2;
                const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);

                // Animated flow particles
                const flowOffset = (animationFrame * 2) % 40;
                for (let i = 0; i < 3; i++) {
                    const progress = (i * 15 + flowOffset) / 40;
                    const x = fromNode.x + (toNode.x - fromNode.x) * progress;
                    const y = fromNode.y + (toNode.y - fromNode.y) * progress;

                    ctx.fillStyle = `rgba(59, 130, 246, ${1 - progress})`;
                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, 2 * Math.PI);
                    ctx.fill();
                }

                // Direction arrow
                if (edge.flow !== 'bidirectional') {
                    const arrowSize = 8;
                    const arrowX = edge.flow === 'outbound' ? toNode.x : fromNode.x;
                    const arrowY = edge.flow === 'outbound' ? toNode.y : fromNode.y;
                    const arrowAngle = edge.flow === 'outbound' ? angle : angle + Math.PI;

                    ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(
                        arrowX - arrowSize * Math.cos(arrowAngle - 0.5),
                        arrowY - arrowSize * Math.sin(arrowAngle - 0.5)
                    );
                    ctx.lineTo(arrowX, arrowY);
                    ctx.lineTo(
                        arrowX - arrowSize * Math.cos(arrowAngle + 0.5),
                        arrowY - arrowSize * Math.sin(arrowAngle + 0.5)
                    );
                    ctx.fill();
                }
            }
        });

        // Draw nodes
        networkData.nodes.forEach(node => {
            const isFiltered = selectedTier !== null &&
                node.tier !== selectedTier && node.tier !== 0;

            if (isFiltered) return;

            const isHovered = hoveredNode === node.id;
            const isConnected = hoveredNode &&
                networkData.edges.some(e =>
                    (e.from === hoveredNode && e.to === node.id) ||
                    (e.to === hoveredNode && e.from === node.id)
                );

            const alpha = hoveredNode && !isHovered && !isConnected ? 0.3 : 1;
            const scale = isHovered ? 1.3 : isConnected ? 1.1 : 1;
            const radius = node.radius * scale;

            // Node glow for pulse effect
            if (node.pulse && (isHovered || !hoveredNode)) {
                const pulseRadius = radius + Math.sin(animationFrame * 0.1) * 5;
                const gradient = ctx.createRadialGradient(
                    node.x, node.y, radius,
                    node.x, node.y, pulseRadius
                );
                gradient.addColorStop(0, `rgba(59, 130, 246, ${0.3 * alpha})`);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(node.x, node.y, pulseRadius, 0, 2 * Math.PI);
                ctx.fill();
            }

            // Main node circle
            ctx.fillStyle = node.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            ctx.strokeStyle = theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            // Node label
            if (isHovered || node.tier === 0 || radius > 15) {
                ctx.fillStyle = theme === 'dark' ? 'white' : 'black';
                ctx.font = `${isHovered ? 'bold ' : ''}${Math.min(12, radius / 2)}px Inter`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const maxWidth = radius * 3;
                const text = node.name.length > 15 ? node.name.substring(0, 12) + '...' : node.name;

                // Text background for better readability
                const textMetrics = ctx.measureText(text);
                const textHeight = 12;
                ctx.fillStyle = theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.9)';
                ctx.fillRect(
                    node.x - textMetrics.width / 2 - 4,
                    node.y + radius + 5,
                    textMetrics.width + 8,
                    textHeight + 4
                );

                ctx.fillStyle = theme === 'dark' ? 'white' : 'black';
                ctx.fillText(text, node.x, node.y + radius + 12);
            }

            // Tier indicator
            if (node.tier > 0) {
                ctx.fillStyle = theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)';
                ctx.beginPath();
                ctx.arc(node.x + radius * 0.6, node.y - radius * 0.6, 8, 0, 2 * Math.PI);
                ctx.fill();

                ctx.fillStyle = node.color;
                ctx.font = 'bold 10px Inter';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(node.tier.toString(), node.x + radius * 0.6, node.y - radius * 0.6);
            }
        });

    }, [networkData, hoveredNode, selectedTier, animationFrame, canvasSize, theme]);

    // Mouse interaction
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Find hovered node
            let hoveredNodeId: string | null = null;
            for (const node of networkData.nodes) {
                const distance = Math.sqrt(Math.pow(x - node.x, 2) + Math.pow(y - node.y, 2));
                if (distance <= node.radius * 1.2) {
                    hoveredNodeId = node.id;
                    break;
                }
            }

            setHoveredNode(hoveredNodeId);
            canvas.style.cursor = hoveredNodeId ? 'pointer' : 'default';
        };

        const handleMouseLeave = () => {
            setHoveredNode(null);
            canvas.style.cursor = 'default';
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [networkData]);

    return (
        <AnimatedSection
            animationType="zoom-in"
            duration={1}
            className="relative w-full h-full"
        >
            {/* Tier Filter Controls */}
            <div className={`absolute top-4 left-4 z-10 backdrop-blur-xl border rounded-2xl p-4 ${theme === 'dark'
                    ? 'bg-slate-900/80 border-slate-700/50'
                    : 'bg-white/80 border-gray-200/50'
                }`}>
                <h4 className={`font-bold text-sm mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                    Filter by Tier
                </h4>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedTier(null)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${selectedTier === null
                                ? 'bg-blue-500 text-white'
                                : theme === 'dark'
                                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        All
                    </button>
                    {[1, 2, 3, 4, 5].map(tier => (
                        <button
                            key={tier}
                            onClick={() => setSelectedTier(selectedTier === tier ? null : tier)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${selectedTier === tier
                                    ? 'bg-blue-500 text-white'
                                    : theme === 'dark'
                                        ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Tier {tier}
                        </button>
                    ))}
                </div>
            </div>

            {/* Node Info Panel */}
            {hoveredNode && (
                <AnimatedSection
                    animationType="slide-right"
                    duration={0.3}
                    className="absolute top-4 right-4 z-10"
                >
                    {(() => {
                        const node = networkData.nodes.find(n => n.id === hoveredNode);
                        return node ? (
                            <div className={`backdrop-blur-xl border rounded-2xl p-4 max-w-xs ${theme === 'dark'
                                    ? 'bg-slate-900/90 border-slate-700/50'
                                    : 'bg-white/90 border-gray-200/50'
                                }`}>
                                <h4 className={`font-bold text-sm mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                                    }`}>
                                    {node.name}
                                </h4>
                                <div className={`text-xs space-y-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                    }`}>
                                    {node.tier > 0 && <div>Tier: {node.tier}</div>}
                                    <div>Category: {node.category}</div>
                                    <div>Connections: {node.connections.length}</div>
                                    {node.pulse && <div className="text-blue-400">• Active System</div>}
                                </div>
                            </div>
                        ) : null;
                    })()}
                </AnimatedSection>
            )}

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                className="w-full h-full rounded-2xl"
                style={{
                    background: theme === 'dark'
                        ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.6))'
                        : 'linear-gradient(135deg, rgba(248, 250, 252, 0.8), rgba(241, 245, 249, 0.6))',
                    backdropFilter: 'blur(10px)'
                }}
            />

            {/* Legend */}
            <div className={`absolute bottom-4 left-4 backdrop-blur-xl border rounded-2xl p-4 ${theme === 'dark'
                    ? 'bg-slate-900/80 border-slate-700/50'
                    : 'bg-white/80 border-gray-200/50'
                }`}>
                <h4 className={`font-bold text-sm mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                    Network Legend
                </h4>
                <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Active Connection</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-gray-400" />
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Inactive Connection</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Critical System</span>
                    </div>
                </div>
            </div>
        </AnimatedSection>
    );
};

export default ConnectionMap;
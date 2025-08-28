'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
    Brain, 
    Zap, 
    Globe, 
    Shield, 
    Code2, 
    Database, 
    Cpu, 
    Heart, 
    Command,
    Users,
    TrendingUp,
    Sparkles,
    Network,
    Settings,
    Bot
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useScrollAnimation } from '@/components/animations/ScrollAnimationProvider';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { codaiProjects, getProjectsByTier, type Project } from '@/data/projects';

interface Node {
    id: string;
    name: string;
    type: 'core' | 'platform' | 'application' | 'service' | 'ai';
    position: { x: number; y: number; z: number };
    connections: string[];
    project?: Project;
    icon: React.ElementType;
    color: string;
    tier: number;
}

interface Connection {
    from: string;
    to: string;
    strength: number;
    type: 'data' | 'api' | 'integration' | 'ai';
    animated: boolean;
}

const iconMap: Record<string, React.ElementType> = {
    Brain, Zap, Globe, Shield, Code2, Database, Cpu, Heart, Command, Users, TrendingUp, Network, Settings, Bot
};

const EcosystemVisualizer: React.FC = () => {
    const { theme } = useTheme();
    const { scrollY } = useScrollAnimation();
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<string | null>(null);
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
    const [time, setTime] = useState(0);
    const [containerSize, setContainerSize] = useState({ width: 1000, height: 800 });

    // Time animation for dynamic effects
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(Date.now() * 0.001);
        }, 16);
        return () => clearInterval(interval);
    }, []);

    // Container size tracking
    useEffect(() => {
        if (!containerRef.current) return;

        const updateSize = () => {
            const rect = containerRef.current!.getBoundingClientRect();
            setContainerSize({ width: rect.width, height: rect.height });
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Mouse tracking
    useEffect(() => {
        if (!containerRef.current) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = containerRef.current!.getBoundingClientRect();
            setMousePosition({
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100
            });
        };

        containerRef.current.addEventListener('mousemove', handleMouseMove);
        return () => {
            if (containerRef.current) {
                containerRef.current.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, []);

    // Generate ecosystem nodes from projects
    const ecosystemNodes = useMemo((): Node[] => {
        const centerX = containerSize.width / 2;
        const centerY = containerSize.height / 2;
        const maxRadius = Math.min(containerSize.width, containerSize.height) * 0.35;

        // Core CODAI node at center
        const coreNode: Node = {
            id: 'codai-core',
            name: 'CODAI Core',
            type: 'core',
            position: { x: centerX, y: centerY, z: 0 },
            connections: [],
            icon: Brain,
            color: 'blue',
            tier: 0
        };

        // Create nodes for major projects
        const projectNodes: Node[] = codaiProjects
            .filter((project, index) => index < 20) // Limit for performance
            .map((project, index) => {
                const tier = project.tier || 1;
                const radius = (tier / 5) * maxRadius + 100;
                const angle = (index / 20) * 2 * Math.PI + (tier * 0.5);
                
                // Add some organic positioning variation
                const variation = (Math.sin(index * 0.7) * 30) + (Math.cos(index * 1.3) * 20);
                
                const x = centerX + Math.cos(angle) * radius + variation;
                const y = centerY + Math.sin(angle) * radius + variation * 0.5;
                const z = (tier - 3) * 20; // 3D depth based on tier

                const iconName = Object.keys(iconMap)[index % Object.keys(iconMap).length];
                const colors = ['purple', 'green', 'orange', 'cyan', 'pink', 'yellow'];
                
                return {
                    id: project.id,
                    name: project.name,
                    type: tier <= 2 ? 'platform' : tier <= 3 ? 'service' : 'application',
                    position: { x, y, z },
                    connections: ['codai-core'],
                    project,
                    icon: iconMap[iconName],
                    color: colors[tier % colors.length],
                    tier
                };
            });

        // Connect core to all nodes
        coreNode.connections = projectNodes.map(node => node.id);

        return [coreNode, ...projectNodes];
    }, [containerSize]);

    // Generate connections between nodes
    const connections = useMemo((): Connection[] => {
        const allConnections: Connection[] = [];

        ecosystemNodes.forEach(node => {
            node.connections.forEach(targetId => {
                if (node.id !== targetId) {
                    const connectionType = Math.random() > 0.7 ? 'ai' : 
                                         Math.random() > 0.5 ? 'data' : 
                                         Math.random() > 0.3 ? 'api' : 'integration';
                    
                    allConnections.push({
                        from: node.id,
                        to: targetId,
                        strength: 0.3 + Math.random() * 0.7,
                        type: connectionType,
                        animated: Math.random() > 0.6
                    });
                }
            });
        });

        // Add inter-node connections based on tier proximity
        ecosystemNodes.forEach(nodeA => {
            ecosystemNodes.forEach(nodeB => {
                if (nodeA.id !== nodeB.id && 
                    Math.abs(nodeA.tier - nodeB.tier) <= 1 && 
                    Math.random() > 0.8) {
                    allConnections.push({
                        from: nodeA.id,
                        to: nodeB.id,
                        strength: 0.2 + Math.random() * 0.3,
                        type: 'integration',
                        animated: false
                    });
                }
            });
        });

        return allConnections;
    }, [ecosystemNodes]);

    // Get node by ID
    const getNode = useCallback((id: string) => {
        return ecosystemNodes.find(node => node.id === id);
    }, [ecosystemNodes]);

    // Handle node interactions
    const handleNodeHover = useCallback((nodeId: string | null) => {
        setHoveredNode(nodeId);
    }, []);

    const handleNodeClick = useCallback((nodeId: string) => {
        setSelectedNode(selectedNode === nodeId ? null : nodeId);
    }, [selectedNode]);

    // Calculate dynamic node positions with physics simulation
    const dynamicNodes = useMemo(() => {
        return ecosystemNodes.map(node => {
            const isHovered = hoveredNode === node.id;
            const isSelected = selectedNode === node.id;
            const isConnected = hoveredNode && 
                connections.some(conn => 
                    (conn.from === hoveredNode && conn.to === node.id) ||
                    (conn.to === hoveredNode && conn.from === node.id)
                );

            // Apply mouse attraction effect
            const mouseX = (mousePosition.x / 100) * containerSize.width;
            const mouseY = (mousePosition.y / 100) * containerSize.height;
            const distanceToMouse = Math.sqrt(
                Math.pow(node.position.x - mouseX, 2) + 
                Math.pow(node.position.y - mouseY, 2)
            );
            
            const mouseAttraction = Math.max(0, 200 - distanceToMouse) / 200;
            const attractionForce = mouseAttraction * 15;
            
            const attractionX = (mouseX - node.position.x) * attractionForce * 0.02;
            const attractionY = (mouseY - node.position.y) * attractionForce * 0.02;

            // Time-based floating animation
            const floatX = Math.sin(time * 0.5 + node.tier) * 8;
            const floatY = Math.cos(time * 0.3 + node.tier) * 6;

            return {
                ...node,
                position: {
                    x: node.position.x + attractionX + floatX,
                    y: node.position.y + attractionY + floatY,
                    z: node.position.z + (isSelected ? 50 : isHovered || isConnected ? 20 : 0)
                },
                scale: isSelected ? 1.4 : isHovered ? 1.2 : isConnected ? 1.1 : 1,
                opacity: hoveredNode && !isHovered && !isConnected ? 0.3 : 1
            };
        });
    }, [ecosystemNodes, hoveredNode, selectedNode, mousePosition, containerSize, time, connections]);

    // Connection rendering
    const renderConnections = () => {
        return connections.map((connection, index) => {
            const fromNode = getNode(connection.from);
            const toNode = getNode(connection.to);
            
            if (!fromNode || !toNode) return null;

            const fromDynamic = dynamicNodes.find(n => n.id === fromNode.id);
            const toDynamic = dynamicNodes.find(n => n.id === toNode.id);
            
            if (!fromDynamic || !toDynamic) return null;

            const isHighlighted = hoveredNode && 
                (hoveredNode === connection.from || hoveredNode === connection.to);
            
            const opacity = isHighlighted ? 0.8 : hoveredNode ? 0.2 : 0.4;
            
            // Connection colors based on type
            const connectionColors = {
                'data': theme === 'dark' ? '#3B82F6' : '#1E40AF',
                'api': theme === 'dark' ? '#10B981' : '#059669',
                'integration': theme === 'dark' ? '#F59E0B' : '#D97706',
                'ai': theme === 'dark' ? '#8B5CF6' : '#7C3AED'
            };

            const strokeColor = connectionColors[connection.type];

            // Animated connection path
            const pathId = `connection-${index}`;
            const animationOffset = connection.animated ? time * 100 : 0;

            return (
                <g key={`${connection.from}-${connection.to}`}>
                    {/* Connection line */}
                    <line
                        x1={fromDynamic.position.x}
                        y1={fromDynamic.position.y}
                        x2={toDynamic.position.x}
                        y2={toDynamic.position.y}
                        stroke={strokeColor}
                        strokeWidth={isHighlighted ? 3 : connection.strength * 2}
                        opacity={opacity}
                        strokeDasharray={connection.animated ? "5,5" : "none"}
                        strokeDashoffset={connection.animated ? animationOffset : 0}
                        className="transition-all duration-300"
                    />
                    
                    {/* Data flow particles for animated connections */}
                    {connection.animated && isHighlighted && (
                        <circle
                            r="3"
                            fill={strokeColor}
                            opacity={0.8}
                        >
                            <animateMotion
                                dur="2s"
                                repeatCount="indefinite"
                                path={`M${fromDynamic.position.x},${fromDynamic.position.y} L${toDynamic.position.x},${toDynamic.position.y}`}
                            />
                        </circle>
                    )}
                </g>
            );
        });
    };

    // Node rendering
    const renderNodes = () => {
        return dynamicNodes.map((node) => {
            const Icon = node.icon;
            const isCore = node.type === 'core';
            const nodeSize = isCore ? 60 : 40;
            const scaledSize = nodeSize * node.scale;

            return (
                <g
                    key={node.id}
                    transform={`translate(${node.position.x}, ${node.position.y})`}
                    style={{ 
                        cursor: 'pointer',
                        opacity: node.opacity,
                        transition: 'opacity 0.3s ease'
                    }}
                    onMouseEnter={() => handleNodeHover(node.id)}
                    onMouseLeave={() => handleNodeHover(null)}
                    onClick={() => handleNodeClick(node.id)}
                >
                    {/* Node glow effect */}
                    <circle
                        r={scaledSize + 10}
                        fill={`url(#nodeGlow-${node.color})`}
                        opacity={hoveredNode === node.id ? 0.6 : 0.2}
                        className="transition-opacity duration-300"
                    />
                    
                    {/* Main node circle */}
                    <circle
                        r={scaledSize}
                        fill={`url(#nodeGradient-${node.color})`}
                        stroke={theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}
                        strokeWidth="2"
                        className="transition-all duration-300"
                        style={{
                            filter: selectedNode === node.id ? 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))' : 'none'
                        }}
                    />
                    
                    {/* Node icon */}
                    <foreignObject
                        x={-scaledSize/2}
                        y={-scaledSize/2}
                        width={scaledSize}
                        height={scaledSize}
                        className="pointer-events-none"
                    >
                        <div className="w-full h-full flex items-center justify-center">
                            <Icon 
                                size={scaledSize * 0.4} 
                                color={theme === 'dark' ? 'white' : 'rgba(0,0,0,0.8)'}
                            />
                        </div>
                    </foreignObject>
                    
                    {/* Node label */}
                    <text
                        y={scaledSize + 20}
                        textAnchor="middle"
                        className={`text-sm font-bold transition-opacity duration-300 ${
                            theme === 'dark' ? 'fill-white' : 'fill-gray-900'
                        }`}
                        opacity={hoveredNode === node.id || selectedNode === node.id ? 1 : 0.7}
                    >
                        {node.name}
                    </text>
                    
                    {/* Tier indicator */}
                    {!isCore && (
                        <circle
                            cx={scaledSize * 0.7}
                            cy={-scaledSize * 0.7}
                            r="8"
                            fill={theme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)'}
                            stroke={`var(--color-${node.color})`}
                            strokeWidth="2"
                        />
                    )}
                    {!isCore && (
                        <text
                            x={scaledSize * 0.7}
                            y={-scaledSize * 0.7 + 4}
                            textAnchor="middle"
                            className="text-xs font-bold"
                            fill={theme === 'dark' ? 'white' : 'black'}
                        >
                            {node.tier}
                        </text>
                    )}
                </g>
            );
        });
    };

    // Define gradients for nodes
    const renderGradients = () => {
        const colors = ['blue', 'purple', 'green', 'orange', 'cyan', 'pink', 'yellow'];
        const colorValues = {
            blue: ['#3B82F6', '#1E40AF'],
            purple: ['#8B5CF6', '#7C3AED'],
            green: ['#10B981', '#059669'],
            orange: ['#F59E0B', '#D97706'],
            cyan: ['#06B6D4', '#0891B2'],
            pink: ['#EC4899', '#DB2777'],
            yellow: ['#EAB308', '#CA8A04']
        };

        return (
            <defs>
                {colors.map(color => (
                    <React.Fragment key={color}>
                        <radialGradient id={`nodeGradient-${color}`}>
                            <stop offset="0%" stopColor={colorValues[color as keyof typeof colorValues][0]} />
                            <stop offset="100%" stopColor={colorValues[color as keyof typeof colorValues][1]} />
                        </radialGradient>
                        <radialGradient id={`nodeGlow-${color}`}>
                            <stop offset="0%" stopColor={colorValues[color as keyof typeof colorValues][0]} />
                            <stop offset="100%" stopColor="transparent" />
                        </radialGradient>
                    </React.Fragment>
                ))}
            </defs>
        );
    };

    return (
        <AnimatedSection
            animationType="fade-in"
            duration={1.2}
            className="relative w-full h-full min-h-[800px]"
        >
            <div
                ref={containerRef}
                className="relative w-full h-full rounded-3xl overflow-hidden"
                style={{
                    background: `
                        radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
                            ${theme === 'dark' 
                                ? 'rgba(59, 130, 246, 0.1) 0%, transparent 50%' 
                                : 'rgba(59, 130, 246, 0.05) 0%, transparent 50%'
                            }),
                        ${theme === 'dark' 
                            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))'
                            : 'linear-gradient(135deg, rgba(248, 250, 252, 0.9), rgba(241, 245, 249, 0.8))'
                        }
                    `,
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${theme === 'dark' ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.3)'}`
                }}
            >
                {/* SVG Ecosystem Visualization */}
                <svg
                    ref={svgRef}
                    width="100%"
                    height="100%"
                    className="absolute inset-0"
                    style={{ pointerEvents: 'auto' }}
                >
                    {renderGradients()}
                    {renderConnections()}
                    {renderNodes()}
                </svg>

                {/* Legend */}
                <div className={`absolute top-6 left-6 backdrop-blur-xl border rounded-2xl p-4 ${
                    theme === 'dark'
                        ? 'bg-slate-900/60 border-slate-700/50'
                        : 'bg-white/60 border-gray-200/50'
                }`}>
                    <h4 className={`font-bold text-sm mb-3 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                        Connection Types
                    </h4>
                    <div className="space-y-2 text-xs">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-0.5 bg-blue-500" />
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Data Flow</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-0.5 bg-green-500" />
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>API Connection</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-0.5 bg-purple-500" />
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>AI Integration</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-0.5 bg-orange-500" />
                            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>Service Link</span>
                        </div>
                    </div>
                </div>

                {/* Node Details Panel */}
                {selectedNode && (
                    <AnimatedSection
                        animationType="slide-left"
                        duration={0.5}
                        className="absolute top-6 right-6 w-80"
                    >
                        <div className={`backdrop-blur-xl border rounded-2xl p-6 ${
                            theme === 'dark'
                                ? 'bg-slate-900/80 border-slate-700/50'
                                : 'bg-white/80 border-gray-200/50'
                        }`}>
                            {(() => {
                                const node = getNode(selectedNode);
                                const Icon = node?.icon || Brain;
                                
                                return node ? (
                                    <>
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className={`p-3 rounded-xl bg-${node.color}-500/20 border border-${node.color}-400/30`}>
                                                <Icon className={`w-6 h-6 text-${node.color}-400`} />
                                            </div>
                                            <div>
                                                <h4 className={`font-bold text-lg ${
                                                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                }`}>
                                                    {node.name}
                                                </h4>
                                                <p className={`text-sm ${
                                                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                                }`}>
                                                    Tier {node.tier} • {node.type}
                                                </p>
                                            </div>
                                        </div>

                                        {node.project && (
                                            <>
                                                <p className={`text-sm mb-4 leading-relaxed ${
                                                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                                }`}>
                                                    {node.project.description}
                                                </p>

                                                <div className="grid grid-cols-2 gap-3 mb-4">
                                                    <div className={`p-3 rounded-lg ${
                                                        theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-100/50'
                                                    }`}>
                                                        <div className={`text-xs font-semibold ${
                                                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                                        }`}>
                                                            Category
                                                        </div>
                                                        <div className={`text-sm font-bold ${
                                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                        }`}>
                                                            {node.project.category}
                                                        </div>
                                                    </div>
                                                    <div className={`p-3 rounded-lg ${
                                                        theme === 'dark' ? 'bg-slate-800/50' : 'bg-gray-100/50'
                                                    }`}>
                                                        <div className={`text-xs font-semibold ${
                                                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                                        }`}>
                                                            Status
                                                        </div>
                                                        <div className={`text-sm font-bold ${
                                                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                                                        }`}>
                                                            {node.project.status}
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => window.open(node.project!.domain, '_blank')}
                                                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                                                        theme === 'dark'
                                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                                                    } transform hover:scale-105`}
                                                >
                                                    Learn More
                                                </button>
                                            </>
                                        )}
                                    </>
                                ) : null;
                            })()}
                        </div>
                    </AnimatedSection>
                )}

                {/* Instructions */}
                <div className={`absolute bottom-6 left-6 backdrop-blur-xl border rounded-2xl p-4 ${
                    theme === 'dark'
                        ? 'bg-slate-900/60 border-slate-700/50'
                        : 'bg-white/60 border-gray-200/50'
                }`}>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        <div className="flex items-center space-x-2 mb-2">
                            <Sparkles className="w-4 h-4 text-blue-500" />
                            <span className="font-semibold">Interactive Ecosystem</span>
                        </div>
                        <div className="text-xs space-y-1">
                            <div>• Hover over nodes to highlight connections</div>
                            <div>• Click nodes to view detailed information</div>
                            <div>• Move mouse to influence node positions</div>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedSection>
    );
};

export default EcosystemVisualizer;
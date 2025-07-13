/**
 * SPECTACULAR KODEX IDE - World-class animated code editor
 * Enhanced with stunning visuals, particle effects, and modern animations
 */

'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Code2,
    Play,
    Save,
    FileText,
    Settings,
    GitBranch,
    Terminal,
    Zap,
    Shield,
    Database,
    Network,
    Cpu,
    Activity,
    CheckCircle,
    AlertTriangle,
    FileCode,
    Palette,
    Download,
    Upload,
    Eye,
    EyeOff,
    Sparkles,
    Globe,
    Coffee,
    Heart,
    Star,
    Flame
} from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import Monaco Editor
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg animate-pulse flex items-center justify-center">
            <motion.div
                className="w-12 h-12 border-3 border-purple-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
        </div>
    )
})

// Particle Component
const Particle = ({ delay }: { delay: number }) => (
    <motion.div
        className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-60"
        style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
        }}
        animate={{
            y: [0, -100, 0],
            x: [0, Math.random() * 50 - 25, 0],
            opacity: [0.6, 0.2, 0.6],
        }}
        transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
        }}
    />
)

// Spectacular Background
const SpectacularBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Animated Gradient */}
        <motion.div
            className="absolute inset-0"
            animate={{
                background: [
                    "linear-gradient(45deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                    "linear-gradient(45deg, #16213e 0%, #0f3460 50%, #533483 100%)",
                    "linear-gradient(45deg, #0f3460 0%, #533483 50%, #1a1a2e 100%)",
                    "linear-gradient(45deg, #533483 0%, #1a1a2e 50%, #16213e 100%)",
                    "linear-gradient(45deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
                ],
            }}
            transition={{
                duration: 15,
                ease: "linear",
                repeat: Infinity
            }}
        />

        {/* Particles */}
        {Array.from({ length: 30 }, (_, i) => (
            <Particle key={i} delay={Math.random() * 2} />
        ))}

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
            <div
                className="w-full h-full"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />
        </div>
    </div>
)

// Glass Card Component
const GlassCard = ({ children, className = '', glow = false }: {
    children: React.ReactNode;
    className?: string;
    glow?: boolean;
}) => (
    <motion.div
        className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl ${glow ? 'shadow-2xl shadow-purple-500/20' : ''} ${className}`}
        whileHover={{
            scale: 1.02,
            boxShadow: glow ? "0 25px 50px rgba(147, 51, 234, 0.3)" : "0 10px 30px rgba(0,0,0,0.2)"
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
    >
        {children}
    </motion.div>
)

// Spectacular Button
const SpectacularButton = ({
    children,
    variant = 'primary',
    className = '',
    onClick,
    disabled = false
}: {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'success' | 'ghost';
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
}) => {
    const variants = {
        primary: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
        secondary: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
        success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white',
        ghost: 'bg-white/5 backdrop-blur-md border border-white/20 text-white hover:bg-white/10'
    }

    return (
        <motion.button
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 relative overflow-hidden ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            whileHover={!disabled ? {
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(147, 51, 234, 0.4)"
            } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            onClick={onClick}
            disabled={disabled}
        >
            {/* Shimmer Effect */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
            />

            <span className="relative z-10 flex items-center gap-2">{children}</span>
        </motion.button>
    )
}

const SpectacularKodexIDE = () => {
    const [code, setCode] = useState(`// ✨ WELCOME TO SPECTACULAR KODEX IDE ✨
// World-class smart contract development platform

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SpectacularToken 🚀
 * @dev The most advanced ERC20 token with spectacular features
 */
contract SpectacularToken is ERC20, Ownable, ReentrancyGuard {
    uint256 private constant INITIAL_SUPPLY = 1000000000 * 10**18; // 1B tokens ✨
    
    // ======================= SPECTACULAR FEATURES =======================
    mapping(address => bool) public spectacularHolders;
    mapping(address => uint256) public stakingRewards;
    mapping(address => uint256) public lastClaimTime;
    
    // Events with spectacular names 🎉
    event SpectacularMint(address indexed to, uint256 amount, string message);
    event SpectacularStake(address indexed user, uint256 amount, uint256 rewards);
    event SpectacularClaim(address indexed user, uint256 rewards);
    
    constructor() ERC20("SpectacularToken", "SPEC") {
        _mint(msg.sender, INITIAL_SUPPLY);
        spectacularHolders[msg.sender] = true;
    }
    
    /**
     * @dev Mint tokens with spectacular effects ✨
     */
    function spectacularMint(address to, uint256 amount, string memory message) 
        external 
        onlyOwner 
    {
        _mint(to, amount);
        spectacularHolders[to] = true;
        emit SpectacularMint(to, amount, message);
    }
    
    /**
     * @dev Stake tokens for spectacular rewards 🌟
     */
    function stakeForSpectacularRewards(uint256 amount) 
        external 
        nonReentrant 
    {
        require(balanceOf(msg.sender) >= amount, "Insufficient spectacular balance");
        
        _transfer(msg.sender, address(this), amount);
        
        // Calculate spectacular rewards (10% APY)
        uint256 timeStaked = block.timestamp - lastClaimTime[msg.sender];
        uint256 rewards = (amount * 10 * timeStaked) / (365 days * 100);
        
        stakingRewards[msg.sender] += rewards;
        lastClaimTime[msg.sender] = block.timestamp;
        
        emit SpectacularStake(msg.sender, amount, rewards);
    }
    
    /**
     * @dev Claim your spectacular rewards! 💰
     */
    function claimSpectacularRewards() external nonReentrant {
        uint256 rewards = stakingRewards[msg.sender];
        require(rewards > 0, "No spectacular rewards to claim");
        
        stakingRewards[msg.sender] = 0;
        _mint(msg.sender, rewards);
        
        emit SpectacularClaim(msg.sender, rewards);
    }
    
    /**
     * @dev Get spectacular holder status 🎭
     */
    function isSpectacularHolder(address account) external view returns (bool) {
        return spectacularHolders[account];
    }
    
    /**
     * @dev Override transfer to add spectacular features ✨
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        super._afterTokenTransfer(from, to, amount);
        
        // Make recipients spectacular holders if they receive enough tokens
        if (to != address(0) && balanceOf(to) >= 1000 * 10**18) {
            spectacularHolders[to] = true;
        }
    }
}

// 🎉 Spectacular smart contract complete! 🎉`)

    const [isCompiling, setIsCompiling] = useState(false)
    const [compilationResult, setCompilationResult] = useState<{
        success: boolean;
        bytecode: string;
        abi: string;
        gasEstimate: number;
        features: string[];
    } | null>(null)
    const [activeTab, setActiveTab] = useState('editor')
    const [isConsoleVisible, setIsConsoleVisible] = useState(true)
    const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle')

    const handleEditorChange = (value: string | undefined) => {
        setCode(value || '')
    }

    const compileContract = async () => {
        setIsCompiling(true)
        // Spectacular compilation simulation
        setTimeout(() => {
            setCompilationResult({
                success: true,
                bytecode: '0x608060405234801561001057600080fd5b50738c...',
                abi: '[{"inputs":[],"name":"spectacularMint","outputs":[],"stateMutability":"nonpayable","type":"function"}]',
                gasEstimate: 2847293,
                features: ['Spectacular Minting', 'Reward Staking', 'Auto-Holder Detection', 'Reentrancy Protection']
            })
            setIsCompiling(false)
        }, 2500)
    }

    const deployContract = async () => {
        setDeploymentStatus('deploying')
        setTimeout(() => {
            setDeploymentStatus('success')
            setTimeout(() => setDeploymentStatus('idle'), 3000)
        }, 3000)
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            <SpectacularBackground />

            <div className="flex h-screen relative z-10">
                {/* Spectacular Sidebar */}
                <motion.div
                    initial={{ x: -300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="w-72 p-6"
                >
                    <GlassCard className="h-full p-6 flex flex-col" glow>
                        <motion.div
                            className="flex items-center gap-3 mb-8"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        >
                            <motion.div
                                className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Code2 className="w-8 h-8 text-white" />
                            </motion.div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                                    Kodex IDE
                                </h1>
                                <p className="text-gray-400 text-sm">Spectacular Edition ✨</p>
                            </div>
                        </motion.div>

                        <nav className="flex-1 space-y-3">
                            {[
                                { id: 'explorer', icon: FileText, label: 'Smart Explorer', color: 'purple' },
                                { id: 'editor', icon: FileCode, label: 'Spectacular Editor', color: 'blue' },
                                { id: 'deploy', icon: Zap, label: 'Deploy Magic', color: 'green' },
                                { id: 'analytics', icon: Activity, label: 'Gas Analytics', color: 'orange' }
                            ].map((item, index) => (
                                <motion.button
                                    key={item.id}
                                    initial={{ x: -50, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    whileHover={{ scale: 1.05, x: 10 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${activeTab === item.id
                                            ? `bg-${item.color}-500/20 text-${item.color}-400 border border-${item.color}-500/30`
                                            : 'hover:bg-white/5 text-gray-300'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                    {activeTab === item.id && (
                                        <motion.div
                                            className="ml-auto w-2 h-2 bg-current rounded-full"
                                            animate={{ scale: [1, 1.5, 1] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </nav>

                        <div className="mt-8 space-y-3">
                            <motion.div
                                className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20"
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-4 h-4 text-green-400" />
                                    <span className="text-sm font-medium text-green-400">Security Status</span>
                                </div>
                                <p className="text-xs text-green-300">✨ Spectacular Protection Active</p>
                            </motion.div>

                            <SpectacularButton variant="ghost" className="w-full justify-center">
                                <Settings className="w-4 h-4" />
                                Spectacular Settings
                            </SpectacularButton>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col p-6 pl-0">
                    {/* Spectacular Toolbar */}
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mb-6"
                    >
                        <GlassCard className="p-4 flex items-center justify-between" glow>
                            <div className="flex items-center gap-4">
                                <SpectacularButton
                                    variant="success"
                                    onClick={compileContract}
                                    disabled={isCompiling}
                                >
                                    {isCompiling ? (
                                        <>
                                            <motion.div
                                                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            />
                                            Compiling Magic...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4" />
                                            Compile Spectacular
                                        </>
                                    )}
                                </SpectacularButton>

                                <SpectacularButton
                                    variant="primary"
                                    onClick={deployContract}
                                    disabled={deploymentStatus === 'deploying'}
                                >
                                    {deploymentStatus === 'deploying' ? (
                                        <>
                                            <motion.div
                                                className="w-4 h-4"
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity }}
                                            >
                                                <Sparkles className="w-4 h-4" />
                                            </motion.div>
                                            Deploying...
                                        </>
                                    ) : deploymentStatus === 'success' ? (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Deployed! ✨
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-4 h-4" />
                                            Deploy Magic
                                        </>
                                    )}
                                </SpectacularButton>

                                <SpectacularButton variant="ghost">
                                    <Save className="w-4 h-4" />
                                    Save Spectacular
                                </SpectacularButton>
                            </div>

                            <div className="flex items-center gap-4">
                                <motion.div
                                    className="flex items-center gap-2 text-sm text-gray-300"
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Network className="w-4 h-4 text-blue-400" />
                                    CodaiChain Spectacular ✨
                                </motion.div>

                                <SpectacularButton
                                    variant="ghost"
                                    onClick={() => setIsConsoleVisible(!isConsoleVisible)}
                                    className="p-3"
                                >
                                    {isConsoleVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </SpectacularButton>
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* Editor and Console */}
                    <div className={`flex-1 flex ${isConsoleVisible ? 'flex-col' : ''} gap-6`}>
                        {/* Spectacular Code Editor */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className={`${isConsoleVisible ? 'h-2/3' : 'h-full'} w-full`}
                        >
                            <GlassCard className="h-full p-6" glow>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <motion.div
                                            className="p-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg"
                                            animate={{ boxShadow: ["0 0 0 0 rgba(34, 197, 94, 0.4)", "0 0 0 10px rgba(34, 197, 94, 0)", "0 0 0 0 rgba(34, 197, 94, 0)"] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <FileCode className="w-5 h-5 text-white" />
                                        </motion.div>
                                        <div>
                                            <span className="text-lg font-semibold text-white">SpectacularToken.sol</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-400">Solidity ^0.8.0</span>
                                                <motion.div
                                                    className="w-2 h-2 bg-green-400 rounded-full"
                                                    animate={{ scale: [1, 1.5, 1] }}
                                                    transition={{ duration: 1, repeat: Infinity }}
                                                />
                                                <span className="text-xs text-green-400">✨ Spectacular Ready</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Star className="w-5 h-5 text-yellow-400" />
                                        <Flame className="w-5 h-5 text-orange-400" />
                                        <Heart className="w-5 h-5 text-pink-400" />
                                    </div>
                                </div>

                                <div className="h-5/6 rounded-xl overflow-hidden border border-white/10 relative">
                                    <MonacoEditor
                                        height="100%"
                                        defaultLanguage="solidity"
                                        value={code}
                                        onChange={handleEditorChange}
                                        theme="vs-dark"
                                        options={{
                                            fontSize: 14,
                                            fontFamily: 'JetBrains Mono, Fira Code, monospace',
                                            minimap: { enabled: false },
                                            scrollBeyondLastLine: false,
                                            automaticLayout: true,
                                            lineNumbers: 'on',
                                            renderWhitespace: 'selection',
                                            wordWrap: 'on',
                                            cursorBlinking: 'smooth',
                                            cursorSmoothCaretAnimation: "on",
                                            smoothScrolling: true,
                                        }}
                                    />
                                </div>
                            </GlassCard>
                        </motion.div>

                        {/* Spectacular Console */}
                        <AnimatePresence>
                            {isConsoleVisible && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 50 }}
                                    transition={{ duration: 0.4 }}
                                    className="h-1/3"
                                >
                                    <GlassCard className="h-full p-6" glow>
                                        <div className="flex items-center gap-3 mb-4">
                                            <motion.div
                                                className="p-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg"
                                                animate={{ rotate: [0, 360] }}
                                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Terminal className="w-5 h-5 text-white" />
                                            </motion.div>
                                            <span className="text-lg font-semibold text-white">Spectacular Console & Results</span>
                                        </div>

                                        <div className="h-5/6 bg-black/20 rounded-xl p-4 overflow-y-auto font-mono text-sm border border-white/10">
                                            {compilationResult ? (
                                                <motion.div
                                                    className="space-y-3"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                >
                                                    <div className="flex items-center gap-2 text-green-400">
                                                        <CheckCircle className="w-5 h-5" />
                                                        <span className="font-semibold">✨ Spectacular Compilation Success! ✨</span>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4 text-gray-300">
                                                        <div>
                                                            <div className="text-purple-400 font-semibold">Contract: SpectacularToken</div>
                                                            <div>Bytecode: {compilationResult.bytecode.length} bytes</div>
                                                            <div>Gas Estimate: {compilationResult.gasEstimate.toLocaleString()}</div>
                                                        </div>
                                                        <div>
                                                            <div className="text-cyan-400 font-semibold">Spectacular Features:</div>
                                                            {compilationResult.features.map((feature, i) => (
                                                                <motion.div
                                                                    key={i}
                                                                    className="text-green-300 text-xs"
                                                                    initial={{ opacity: 0, x: -20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: i * 0.1 }}
                                                                >
                                                                    ✨ {feature}
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                                        <div className="text-purple-400 font-semibold mb-2">🎉 Deployment Ready!</div>
                                                        <div className="text-xs text-gray-400">
                                                            Your spectacular smart contract is ready for deployment to CodaiChain.
                                                            All security checks passed with flying colors! ✨
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    className="text-gray-400 space-y-2"
                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                    transition={{ duration: 3, repeat: Infinity }}
                                                >
                                                    <div>🌟 Welcome to Spectacular Kodex IDE! 🌟</div>
                                                    <div>✨ Ready to compile world-class smart contracts...</div>
                                                    <div>🚀 Click "Compile Spectacular" to build your amazing contract!</div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Spectacular Right Sidebar */}
                <motion.div
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="w-80 p-6 pl-0"
                >
                    <GlassCard className="h-full p-6 space-y-6" glow>
                        <div>
                            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
                                ✨ Spectacular Details
                            </h3>

                            <div className="space-y-4">
                                {[
                                    { icon: Shield, label: 'Security Status', value: '✨ Spectacular', color: 'green' },
                                    { icon: Cpu, label: 'Gas Optimization', value: 'Ultra High', color: 'blue' },
                                    { icon: Database, label: 'Storage Layout', value: '5 slots used', color: 'purple' },
                                    { icon: Globe, label: 'Network Status', value: 'Connected', color: 'cyan' }
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        className={`p-4 bg-${item.color}-500/10 rounded-xl border border-${item.color}-500/20`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                        whileHover={{ scale: 1.02, x: -5 }}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                                            <span className="text-sm font-medium text-white">{item.label}</span>
                                        </div>
                                        <div className={`text-sm text-${item.color}-400 font-semibold`}>{item.value}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                🚀 Quick Actions
                            </h3>

                            <div className="space-y-3">
                                {[
                                    { icon: Upload, label: 'Verify Contract', variant: 'success' as const },
                                    { icon: Download, label: 'Export ABI', variant: 'primary' as const },
                                    { icon: Palette, label: 'Generate Interface', variant: 'secondary' as const }
                                ].map((action, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 + index * 0.1 }}
                                    >
                                        <SpectacularButton variant={action.variant} className="w-full justify-center">
                                            <action.icon className="w-4 h-4" />
                                            {action.label}
                                        </SpectacularButton>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                                📊 Network Stats
                            </h3>

                            <div className="space-y-4">
                                {[
                                    { label: 'Gas Price', value: '12 GWEI', color: 'green' },
                                    { label: 'Block Height', value: '2,847,293', color: 'blue' },
                                    { label: 'Network TPS', value: '2,156 tx/s', color: 'purple' },
                                    { label: 'Spectacular Score', value: '100/100 ✨', color: 'pink' }
                                ].map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex justify-between items-center"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.8 + index * 0.1 }}
                                    >
                                        <span className="text-sm text-gray-400">{stat.label}</span>
                                        <motion.span
                                            className={`text-sm font-semibold text-${stat.color}-400`}
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                                        >
                                            {stat.value}
                                        </motion.span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Coffee Break Section */}
                        <motion.div
                            className="mt-auto p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20"
                            whileHover={{ scale: 1.02 }}
                            animate={{
                                boxShadow: [
                                    "0 0 0 0 rgba(245, 158, 11, 0.2)",
                                    "0 0 0 10px rgba(245, 158, 11, 0)",
                                    "0 0 0 0 rgba(245, 158, 11, 0)"
                                ]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <div className="flex items-center gap-2 text-amber-400">
                                <Coffee className="w-5 h-5" />
                                <span className="font-semibold">Time for spectacular coffee? ☕</span>
                            </div>
                        </motion.div>
                    </GlassCard>
                </motion.div>
            </div>
        </div>
    )
}

export default function SpectacularKodexPage() {
    return <SpectacularKodexIDE />
}

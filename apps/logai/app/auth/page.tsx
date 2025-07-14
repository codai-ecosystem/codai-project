'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RealAuthService } from '../../services/RealAuthService'
import {
    Mail,
    Lock,
    User,
    Eye,
    EyeOff,
    Chrome,
    Facebook,
    Shield,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    MapPin,
    Smartphone,
    Globe,
    LogIn,
    UserPlus,
    RefreshCw,
    Activity
} from 'lucide-react'

interface SecurityEvent {
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high';
    ipAddress: string;
    userAgent: string;
}

interface AuthSession {
    id: string;
    ipAddress: string;
    userAgent: string;
    location?: string;
    loginAt: Date;
    lastActivity: Date;
    isActive: boolean;
}

export default function AuthPage() {
    const [authMode, setAuthMode] = useState<'login' | 'register' | 'reset'>('login')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
    const [userSessions, setUserSessions] = useState<AuthSession[]>([])

    // Form data
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        displayName: '',
        currentPassword: ''
    })

    // UI state
    const [message, setMessage] = useState<{
        type: 'success' | 'error' | 'info';
        text: string;
    } | null>(null)

    const authService = RealAuthService.getInstance()

    useEffect(() => {
        loadCurrentUser()
    }, [])

    const loadCurrentUser = async () => {
        try {
            const user = await authService.getCurrentUserProfile()
            setCurrentUser(user)

            if (user) {
                // Load security data
                const [events, sessions] = await Promise.all([
                    authService.getSecurityEvents(user.uid, 10),
                    authService.getUserSessions(user.uid)
                ])

                setSecurityEvents(events)
                setUserSessions(sessions)
            }
        } catch (error) {
            console.error('Error loading user:', error)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setMessage(null)
    }

    const handleEmailLogin = async () => {
        if (!formData.email || !formData.password) {
            setMessage({ type: 'error', text: 'Vă rugăm completați toate câmpurile' })
            return
        }

        setLoading(true)
        try {
            const result = await authService.signInWithEmail(formData.email, formData.password)

            if (result.success && result.user) {
                setMessage({ type: 'success', text: 'Autentificare reușită!' })
                setCurrentUser(result.user)
                await loadCurrentUser()
            } else if (result.requiresTwoFactor) {
                setMessage({ type: 'info', text: 'Se necesită autentificare cu doi factori' })
            } else {
                setMessage({ type: 'error', text: result.error || 'Autentificare eșuată' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Eroare de conexiune' })
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setLoading(true)
        try {
            const result = await authService.signInWithGoogle()

            if (result.success && result.user) {
                setMessage({
                    type: 'success',
                    text: result.isNewUser ? 'Cont nou creat cu Google!' : 'Autentificare Google reușită!'
                })
                setCurrentUser(result.user)
                await loadCurrentUser()
            } else {
                setMessage({ type: 'error', text: result.error || 'Autentificare Google eșuată' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Eroare de conexiune' })
        } finally {
            setLoading(false)
        }
    }

    const handleFacebookLogin = async () => {
        setLoading(true)
        try {
            const result = await authService.signInWithFacebook()

            if (result.success && result.user) {
                setMessage({
                    type: 'success',
                    text: result.isNewUser ? 'Cont nou creat cu Facebook!' : 'Autentificare Facebook reușită!'
                })
                setCurrentUser(result.user)
                await loadCurrentUser()
            } else {
                setMessage({ type: 'error', text: result.error || 'Autentificare Facebook eșuată' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Eroare de conexiune' })
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async () => {
        if (!formData.email || !formData.password || !formData.displayName) {
            setMessage({ type: 'error', text: 'Vă rugăm completați toate câmpurile' })
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Parolele nu coincid' })
            return
        }

        setLoading(true)
        try {
            const result = await authService.registerWithEmail(
                formData.email,
                formData.password,
                formData.displayName
            )

            if (result.success && result.user) {
                setMessage({ type: 'success', text: 'Cont creat cu succes!' })
                setCurrentUser(result.user)
                await loadCurrentUser()
            } else {
                setMessage({ type: 'error', text: result.error || 'Crearea contului a eșuat' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Eroare de conexiune' })
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordReset = async () => {
        if (!formData.email) {
            setMessage({ type: 'error', text: 'Vă rugăm introduceți adresa de email' })
            return
        }

        setLoading(true)
        try {
            const result = await authService.resetPassword(formData.email)

            if (result.success) {
                setMessage({ type: 'success', text: 'Email de resetare trimis!' })
                setAuthMode('login')
            } else {
                setMessage({ type: 'error', text: result.error || 'Resetarea parolei a eșuat' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Eroare de conexiune' })
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordUpdate = async () => {
        if (!formData.currentPassword || !formData.password || !formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Vă rugăm completați toate câmpurile' })
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Parolele noi nu coincid' })
            return
        }

        setLoading(true)
        try {
            const result = await authService.updateUserPassword(
                formData.currentPassword,
                formData.password
            )

            if (result.success) {
                setMessage({ type: 'success', text: 'Parola a fost actualizată cu succes!' })
                setFormData(prev => ({ ...prev, currentPassword: '', password: '', confirmPassword: '' }))
                await loadCurrentUser() // Refresh security events
            } else {
                setMessage({ type: 'error', text: result.error || 'Actualizarea parolei a eșuat' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Eroare de conexiune' })
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        setLoading(true)
        try {
            await authService.logout()
            setCurrentUser(null)
            setSecurityEvents([])
            setUserSessions([])
            setMessage({ type: 'success', text: 'Deconectare reușită!' })
        } catch (error) {
            setMessage({ type: 'error', text: 'Eroare la deconectare' })
        } finally {
            setLoading(false)
        }
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'text-red-400 bg-red-500/20'
            case 'medium': return 'text-yellow-400 bg-yellow-500/20'
            case 'low': return 'text-green-400 bg-green-500/20'
            default: return 'text-gray-400 bg-gray-500/20'
        }
    }

    const getEventIcon = (type: string) => {
        switch (type) {
            case 'login': return <LogIn className="w-4 h-4" />
            case 'logout': return <LogIn className="w-4 h-4 rotate-180" />
            case 'failed_login': return <XCircle className="w-4 h-4" />
            case 'password_change': return <Lock className="w-4 h-4" />
            case 'suspicious_activity': return <AlertTriangle className="w-4 h-4" />
            default: return <Shield className="w-4 h-4" />
        }
    }

    const formatUserAgent = (userAgent: string) => {
        if (userAgent.includes('Chrome')) return 'Chrome Browser'
        if (userAgent.includes('Firefox')) return 'Firefox Browser'
        if (userAgent.includes('Safari')) return 'Safari Browser'
        if (userAgent.includes('Edge')) return 'Edge Browser'
        return 'Browser Necunoscut'
    }

    // If user is logged in, show dashboard
    if (currentUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
                {/* Header */}
                <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-white">Panou de Securitate</h1>
                                    <p className="text-sm text-gray-400">Bună ziua, {currentUser.displayName}!</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                disabled={loading}
                                className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Se deconectează...' : 'Deconectare'}
                            </button>
                        </div>
                    </div>
                </header>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* User Profile */}
                        <div className="lg:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                            >
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Profil Utilizator
                                </h2>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        {currentUser.photoURL ? (
                                            <img
                                                src={currentUser.photoURL}
                                                alt="Avatar"
                                                className="w-16 h-16 rounded-full border border-white/20"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                                                <User className="w-8 h-8 text-blue-400" />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">{currentUser.displayName}</h3>
                                            <p className="text-gray-400">{currentUser.email}</p>
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${currentUser.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                                                    currentUser.role === 'premium' ? 'bg-purple-500/20 text-purple-400' :
                                                        'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {currentUser.role.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Membru din:</span>
                                            <span className="text-white">{currentUser.createdAt.toLocaleDateString('ro-RO')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Ultima conectare:</span>
                                            <span className="text-white">{currentUser.lastLogin.toLocaleString('ro-RO')}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Total conectări:</span>
                                            <span className="text-white">{currentUser.loginCount}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Abonament:</span>
                                            <span className="text-white capitalize">{currentUser.subscription.type}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Password Update Section */}
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <h3 className="text-lg font-semibold text-white mb-4">Schimbă Parola</h3>
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Parola curentă"
                                                value={formData.currentPassword}
                                                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                                                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Parola nouă"
                                                value={formData.password}
                                                onChange={(e) => handleInputChange('password', e.target.value)}
                                                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="Confirmă parola nouă"
                                                value={formData.confirmPassword}
                                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                            >
                                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <button
                                            onClick={handlePasswordUpdate}
                                            disabled={loading}
                                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50"
                                        >
                                            {loading ? 'Actualizare...' : 'Actualizează Parola'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Security Events & Sessions */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Security Events */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5" />
                                        Evenimente de Securitate
                                    </h2>
                                    <button
                                        onClick={loadCurrentUser}
                                        className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/20 transition-all"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Reîmprospătează
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {securityEvents.map(event => (
                                        <div key={event.id} className="flex items-start gap-4 p-4 bg-white/5 rounded-lg">
                                            <div className={`p-2 rounded-lg ${getSeverityColor(event.severity)}`}>
                                                {getEventIcon(event.type)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white font-medium">{event.description}</p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {event.timestamp.toLocaleString('ro-RO')}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Globe className="w-3 h-3" />
                                                        {event.ipAddress}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Smartphone className="w-3 h-3" />
                                                        {formatUserAgent(event.userAgent)}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                                                {event.severity.toUpperCase()}
                                            </span>
                                        </div>
                                    ))}

                                    {securityEvents.length === 0 && (
                                        <div className="text-center py-12">
                                            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-400">Nu există evenimente de securitate</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Active Sessions */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                            >
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Activity className="w-5 h-5" />
                                    Sesiuni Active
                                </h2>

                                <div className="space-y-3">
                                    {userSessions.map(session => (
                                        <div key={session.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-green-500/20 rounded-lg">
                                                    <Activity className="w-4 h-4 text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{formatUserAgent(session.userAgent)}</p>
                                                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {session.ipAddress}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {session.loginAt.toLocaleString('ro-RO')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                <span className="text-green-400 text-sm font-medium">Activă</span>
                                            </div>
                                        </div>
                                    ))}

                                    {userSessions.length === 0 && (
                                        <div className="text-center py-12">
                                            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-400">Nu există sesiuni active</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Message Display */}
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.9 }}
                            className="fixed bottom-4 right-4 z-50"
                        >
                            <div className={`p-4 rounded-lg shadow-lg border ${message.type === 'success' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
                                    message.type === 'error' ? 'bg-red-500/20 border-red-500/30 text-red-400' :
                                        'bg-blue-500/20 border-blue-500/30 text-blue-400'
                                }`}>
                                <div className="flex items-center gap-2">
                                    {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
                                    {message.type === 'error' && <XCircle className="w-5 h-5" />}
                                    {message.type === 'info' && <AlertTriangle className="w-5 h-5" />}
                                    <span className="font-medium">{message.text}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )
    }

    // Login/Register UI
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            LogAI Auth
                        </h1>
                        <p className="text-gray-400 text-sm mt-2">
                            {authMode === 'login' && 'Conectați-vă la contul dumneavoastră'}
                            {authMode === 'register' && 'Creați un cont nou'}
                            {authMode === 'reset' && 'Resetați parola contului'}
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex mb-6 bg-white/5 rounded-xl p-1">
                        <button
                            onClick={() => setAuthMode('login')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${authMode === 'login'
                                    ? 'bg-blue-500/30 text-blue-300'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Conectare
                        </button>
                        <button
                            onClick={() => setAuthMode('register')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${authMode === 'register'
                                    ? 'bg-blue-500/30 text-blue-300'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Înregistrare
                        </button>
                    </div>

                    {/* Form */}
                    <div className="space-y-4">
                        {/* Display Name (Register only) */}
                        {authMode === 'register' && (
                            <div className="relative">
                                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Nume complet"
                                    value={formData.displayName}
                                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}

                        {/* Email */}
                        <div className="relative">
                            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                                type="email"
                                placeholder="Adresa de email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Password */}
                        {authMode !== 'reset' && (
                            <div className="relative">
                                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Parola"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        )}

                        {/* Confirm Password (Register only) */}
                        {authMode === 'register' && (
                            <div className="relative">
                                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirmă parola"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        )}

                        {/* Primary Action Button */}
                        <button
                            onClick={
                                authMode === 'login' ? handleEmailLogin :
                                    authMode === 'register' ? handleRegister :
                                        handlePasswordReset
                            }
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    {authMode === 'login' && 'Se conectează...'}
                                    {authMode === 'register' && 'Se înregistrează...'}
                                    {authMode === 'reset' && 'Se trimite...'}
                                </>
                            ) : (
                                <>
                                    {authMode === 'login' && <LogIn className="w-4 h-4" />}
                                    {authMode === 'register' && <UserPlus className="w-4 h-4" />}
                                    {authMode === 'reset' && <RefreshCw className="w-4 h-4" />}
                                    {authMode === 'login' && 'Conectare'}
                                    {authMode === 'register' && 'Înregistrare'}
                                    {authMode === 'reset' && 'Trimite Email Reset'}
                                </>
                            )}
                        </button>

                        {/* OAuth Buttons (not for reset) */}
                        {authMode !== 'reset' && (
                            <>
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/20"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-gray-400">
                                            sau continuați cu
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={handleGoogleLogin}
                                        disabled={loading}
                                        className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white py-3 rounded-lg hover:bg-white/20 transition-all disabled:opacity-50"
                                    >
                                        <Chrome className="w-4 h-4" />
                                        Google
                                    </button>
                                    <button
                                        onClick={handleFacebookLogin}
                                        disabled={loading}
                                        className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white py-3 rounded-lg hover:bg-white/20 transition-all disabled:opacity-50"
                                    >
                                        <Facebook className="w-4 h-4" />
                                        Facebook
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Reset Password Link */}
                        {authMode === 'login' && (
                            <div className="text-center">
                                <button
                                    onClick={() => setAuthMode('reset')}
                                    className="text-blue-400 hover:text-blue-300 text-sm"
                                >
                                    Ați uitat parola?
                                </button>
                            </div>
                        )}

                        {/* Back to Login */}
                        {authMode === 'reset' && (
                            <div className="text-center">
                                <button
                                    onClick={() => setAuthMode('login')}
                                    className="text-blue-400 hover:text-blue-300 text-sm"
                                >
                                    Înapoi la conectare
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Message Display */}
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mt-4"
                        >
                            <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/30 text-green-400' :
                                    message.type === 'error' ? 'bg-red-500/20 border border-red-500/30 text-red-400' :
                                        'bg-blue-500/20 border border-blue-500/30 text-blue-400'
                                }`}>
                                <div className="flex items-center gap-2">
                                    {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
                                    {message.type === 'error' && <XCircle className="w-5 h-5" />}
                                    {message.type === 'info' && <AlertTriangle className="w-5 h-5" />}
                                    <span className="font-medium">{message.text}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

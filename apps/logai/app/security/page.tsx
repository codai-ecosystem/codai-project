'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  Lock,
  Smartphone,
  Key,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Monitor,
  Settings,
  Eye,
  EyeOff,
  Download,
  RefreshCw,
  Globe,
  Wifi,
  UserX
} from 'lucide-react'
import { RealAuthService } from '../../services/RealAuthService'
import { MFAService } from '../../services/MFAService'

interface SecurityEvent {
  id: string
  type: 'login' | 'logout' | 'password_change' | 'failed_login' | 'suspicious_activity'
  description: string
  ipAddress: string
  location: string
  device: string
  timestamp: Date
  severity: 'low' | 'medium' | 'high'
}

interface AuthSession {
  id: string
  device: string
  location: string
  ipAddress: string
  loginAt: Date
  lastActivity: Date
  isActive: boolean
  isCurrent: boolean
}

const SecurityDashboard = () => {
  const [user, setUser] = useState<any>(null)
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [activeSessions, setActiveSessions] = useState<AuthSession[]>([])
  const [mfaStatus, setMfaStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showMFASetup, setShowMFASetup] = useState(false)
  const [totpSecret, setTotpSecret] = useState('')
  const [qrCode, setQrCode] = useState('')

  const authService = RealAuthService.getInstance()
  const mfaService = MFAService.getInstance()

  useEffect(() => {
    loadSecurityData()
  }, [])

  const loadSecurityData = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const currentUser = await authService.getCurrentUserProfile()
      setUser(currentUser)

      if (currentUser) {
        // Get security events
        const events = await authService.getSecurityEvents(currentUser.uid, 20)
        setSecurityEvents(events.map(event => ({
          ...event,
          location: 'București, România', // Simulate location
          device: 'Chrome pe Windows'      // Simulate device
        })))

        // Get active sessions
        const sessions = await authService.getUserSessions(currentUser.uid)
        setActiveSessions(sessions.map((session, index) => ({
          ...session,
          device: 'Chrome pe Windows',
          location: 'București, România',
          isCurrent: index === 0 // First session is current
        })))

        // Get MFA status
        const mfaInfo = await mfaService.getMFAStatus(currentUser.uid)
        setMfaStatus(mfaInfo)
      }

    } catch (error) {
      console.error('Error loading security data:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupMFA = async () => {
    if (!user) return

    try {
      const result = await mfaService.setupTOTP(user.uid)
      if (result.success) {
        setTotpSecret(result.secret || '')
        setQrCode(result.qrCode || '')
        setShowMFASetup(true)
      }
    } catch (error) {
      console.error('Error setting up MFA:', error)
    }
  }

  const verifyMFA = async (code: string) => {
    if (!user) return

    try {
      const result = await mfaService.verifyAndEnableTOTP(user.uid, code)
      if (result.success) {
        setShowMFASetup(false)
        await loadSecurityData() // Refresh data
      }
      return result
    } catch (error) {
      console.error('Error verifying MFA:', error)
      return { success: false, error: 'Eroare la verificarea codului' }
    }
  }

  const terminateSession = async (sessionId: string) => {
    // In production, implement session termination
    console.log('Terminating session:', sessionId)
    await loadSecurityData()
  }

  const getEventIcon = (type: string, severity: string) => {
    switch (type) {
      case 'login':
        return <CheckCircle className={`w-4 h-4 ${severity === 'high' ? 'text-red-500' : 'text-green-500'}`} />
      case 'logout':
        return <UserX className="w-4 h-4 text-blue-500" />
      case 'password_change':
        return <Key className="w-4 h-4 text-yellow-500" />
      case 'failed_login':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500 bg-red-500/20'
      case 'medium': return 'text-yellow-500 bg-yellow-500/20'
      default: return 'text-green-500 bg-green-500/20'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Încărcare date securitate...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-400">Securitate & Autentificare</h1>
              <p className="text-gray-400 mt-1">Gestionează securitatea contului și sesiunile active</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-lg font-bold text-white">{user?.displayName}</div>
                <div className="text-sm text-gray-400">{user?.email}</div>
              </div>
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-white/5 backdrop-blur-lg rounded-2xl p-1 border border-white/10">
          {[
            { id: 'overview', name: 'Prezentare Generală', icon: Shield },
            { id: 'sessions', name: 'Sesiuni Active', icon: Monitor },
            { id: 'events', name: 'Evenimente Securitate', icon: Activity },
            { id: 'mfa', name: 'Autentificare MFA', icon: Smartphone },
            { id: 'settings', name: 'Setări Securitate', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-blue-500/30 text-blue-300 shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Security Score */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Scor Securitate</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-400">85</span>
                  </div>
                  <div className="text-white font-medium">Scor General</div>
                  <div className="text-gray-400 text-sm">Foarte Bun</div>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-blue-400" />
                  </div>
                  <div className="text-white font-medium">Parolă</div>
                  <div className="text-green-400 text-sm">Puternică</div>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Smartphone className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div className="text-white font-medium">2FA</div>
                  <div className={`text-sm ${mfaStatus?.totpEnabled ? 'text-green-400' : 'text-yellow-400'}`}>
                    {mfaStatus?.totpEnabled ? 'Activat' : 'Dezactivat'}
                  </div>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Activity className="w-8 h-8 text-green-400" />
                  </div>
                  <div className="text-white font-medium">Activitate</div>
                  <div className="text-green-400 text-sm">Normală</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Smartphone className="w-8 h-8 text-blue-400" />
                  <h4 className="text-lg font-semibold text-white">Activează 2FA</h4>
                </div>
                <p className="text-gray-400 mb-4">
                  Protejează-ți contul cu autentificare în doi factori
                </p>
                <button
                  onClick={setupMFA}
                  disabled={mfaStatus?.totpEnabled}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    mfaStatus?.totpEnabled
                      ? 'bg-green-600 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {mfaStatus?.totpEnabled ? 'Deja Activat' : 'Configurează 2FA'}
                </button>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Key className="w-8 h-8 text-yellow-400" />
                  <h4 className="text-lg font-semibold text-white">Schimbă Parola</h4>
                </div>
                <p className="text-gray-400 mb-4">
                  Actualizează parola pentru securitate sporită
                </p>
                <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-700 transition-colors">
                  Schimbă Parola
                </button>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Download className="w-8 h-8 text-purple-400" />
                  <h4 className="text-lg font-semibold text-white">Export Date</h4>
                </div>
                <p className="text-gray-400 mb-4">
                  Descarcă un raport cu activitatea de securitate
                </p>
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                  Descarcă Raport
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Activitate Recentă</h3>
              <div className="space-y-4">
                {securityEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center space-x-4 p-3 bg-white/5 rounded-lg">
                    {getEventIcon(event.type, event.severity)}
                    <div className="flex-1">
                      <div className="text-white font-medium">{event.description}</div>
                      <div className="text-gray-400 text-sm">
                        {event.location} • {event.timestamp.toLocaleString('ro-RO')}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                      {event.severity.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'sessions' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Sesiuni Active</h3>
                <button
                  onClick={loadSecurityData}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div key={session.id} className="border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          session.isCurrent ? 'bg-green-500/20' : 'bg-blue-500/20'
                        }`}>
                          <Monitor className={`w-6 h-6 ${
                            session.isCurrent ? 'text-green-400' : 'text-blue-400'
                          }`} />
                        </div>
                        <div>
                          <div className="text-white font-medium flex items-center space-x-2">
                            <span>{session.device}</span>
                            {session.isCurrent && (
                              <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                                Sesiunea Curentă
                              </span>
                            )}
                          </div>
                          <div className="text-gray-400 text-sm flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{session.location}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Wifi className="w-3 h-3" />
                              <span>{session.ipAddress}</span>
                            </span>
                          </div>
                          <div className="text-gray-500 text-xs mt-1">
                            Ultima activitate: {session.lastActivity.toLocaleString('ro-RO')}
                          </div>
                        </div>
                      </div>
                      
                      {!session.isCurrent && (
                        <button
                          onClick={() => terminateSession(session.id)}
                          className="text-red-400 hover:text-red-300 p-2"
                        >
                          <UserX className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'events' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Istoricul Evenimentelor de Securitate</h3>
              
              <div className="space-y-3">
                {securityEvents.map((event) => (
                  <div key={event.id} className="border border-white/10 rounded-lg p-4">
                    <div className="flex items-start space-x-4">
                      {getEventIcon(event.type, event.severity)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{event.description}</span>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(event.severity)}`}>
                            {event.severity.toUpperCase()}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{event.timestamp.toLocaleString('ro-RO')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Globe className="w-3 h-3" />
                            <span>{event.ipAddress}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Monitor className="w-3 h-3" />
                            <span>{event.device}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'mfa' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Autentificare Multi-Factor (2FA)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="w-6 h-6 text-blue-400" />
                        <span className="text-white font-medium">TOTP (Google Authenticator)</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        mfaStatus?.totpEnabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {mfaStatus?.totpEnabled ? 'ACTIVAT' : 'DEZACTIVAT'}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      Folosește o aplicație de autentificare pentru a genera coduri temporare
                    </p>
                    {!mfaStatus?.totpEnabled && (
                      <button
                        onClick={setupMFA}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Configurează TOTP
                      </button>
                    )}
                  </div>

                  <div className="border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="w-6 h-6 text-green-400" />
                        <span className="text-white font-medium">SMS Verification</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        mfaStatus?.smsEnabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {mfaStatus?.smsEnabled ? 'ACTIVAT' : 'DEZACTIVAT'}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      Primește coduri de verificare prin SMS
                    </p>
                    <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors">
                      Configurează SMS
                    </button>
                  </div>

                  <div className="border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Eye className="w-6 h-6 text-purple-400" />
                        <span className="text-white font-medium">Autentificare Biometrică</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        mfaStatus?.biometricEnabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {mfaStatus?.biometricEnabled ? 'ACTIVAT' : 'DEZACTIVAT'}
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      Folosește amprenta sau recunoașterea facială
                    </p>
                    <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                      Configurează Biometric
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Coduri de Rezervă</h4>
                    <p className="text-gray-400 text-sm mb-4">
                      Ai {mfaStatus?.backupCodesCount || 0} coduri de rezervă disponibile
                    </p>
                    <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-yellow-700 transition-colors">
                      Vizualizează Coduri
                    </button>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">Ultima Utilizare</h4>
                    <p className="text-gray-400 text-sm">
                      {mfaStatus?.lastUsed 
                        ? `Ultima oară: ${mfaStatus.lastUsed.toLocaleString('ro-RO')}`
                        : 'Nu a fost folosit încă'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* MFA Setup Modal */}
      {showMFASetup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-2xl border border-white/10 p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-xl font-bold text-white mb-4">Configurare TOTP</h3>
            
            <div className="text-center mb-6">
              <img src={qrCode} alt="QR Code" className="mx-auto mb-4 rounded-lg" />
              <p className="text-gray-400 text-sm mb-2">
                Scanează codul QR cu aplicația ta de autentificare
              </p>
              <p className="text-gray-300 text-xs font-mono bg-white/10 p-2 rounded">
                {totpSecret}
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Introdu codul din aplicație"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                maxLength={6}
                onChange={(e) => {
                  if (e.target.value.length === 6) {
                    verifyMFA(e.target.value)
                  }
                }}
              />
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowMFASetup(false)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Anulează
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                  Verifică
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default SecurityDashboard

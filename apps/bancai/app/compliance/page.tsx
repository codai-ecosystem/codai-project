'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Upload,
  UserCheck,
  Lock,
  Eye,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react'

interface KYCDocument {
  id: string
  type: string
  name: string
  status: 'uploaded' | 'processing' | 'verified' | 'rejected'
  uploadDate: Date
  size: string
  aiAnalysis?: {
    confidence: number
    extractedData: any
    riskFlags: string[]
  }
}

interface ComplianceStatus {
  level: 'basic' | 'enhanced' | 'premium'
  score: number
  status: 'pending' | 'verified' | 'rejected'
  lastUpdate: Date
  expiryDate: Date
  documents: KYCDocument[]
  riskFlags: string[]
  recommendations: string[]
}

const ComplianceKYC = () => {
  const [complianceStatus, setComplianceStatus] = useState<ComplianceStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadComplianceData()
  }, [])

  const loadComplianceData = async () => {
    try {
      setLoading(true)

      // Simulate compliance data loading
      const mockData: ComplianceStatus = {
        level: 'enhanced',
        score: 85,
        status: 'verified',
        lastUpdate: new Date('2024-01-15'),
        expiryDate: new Date('2025-01-15'),
        documents: [
          {
            id: '1',
            type: 'ID Card',
            name: 'Carte de Identitate',
            status: 'verified',
            uploadDate: new Date('2024-01-10'),
            size: '2.4 MB',
            aiAnalysis: {
              confidence: 98,
              extractedData: {
                name: 'Popescu Ion',
                cnp: '1234567890123',
                address: 'Str. Victoriei nr. 1, București',
                expiryDate: '2029-05-15'
              },
              riskFlags: []
            }
          },
          {
            id: '2',
            type: 'Proof of Address',
            name: 'Factură Utilități',
            status: 'verified',
            uploadDate: new Date('2024-01-12'),
            size: '1.8 MB',
            aiAnalysis: {
              confidence: 95,
              extractedData: {
                address: 'Str. Victoriei nr. 1, București',
                date: '2024-01-05',
                provider: 'ENEL Energie'
              },
              riskFlags: []
            }
          },
          {
            id: '3',
            type: 'Bank Statement',
            name: 'Extras de Cont BRD',
            status: 'processing',
            uploadDate: new Date('2024-01-20'),
            size: '3.2 MB'
          }
        ],
        riskFlags: [],
        recommendations: [
          'Documentele sunt complete și verificate',
          'Status KYC Enhanced Level atins cu succes',
          'Următoarea verificare: Ianuarie 2025'
        ]
      }

      setComplianceStatus(mockData)
    } catch (error) {
      console.error('Error loading compliance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-500 bg-green-500/20'
      case 'processing': return 'text-yellow-500 bg-yellow-500/20'
      case 'rejected': return 'text-red-500 bg-red-500/20'
      case 'pending': return 'text-blue-500 bg-blue-500/20'
      default: return 'text-gray-500 bg-gray-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4" />
      case 'processing': return <Clock className="w-4 h-4" />
      case 'rejected': return <AlertTriangle className="w-4 h-4" />
      case 'pending': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const handleFileUpload = async (file: File, documentType: string) => {
    setUploading(true)
    setUploadProgress(0)

    // Simulate file upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploading(false)
          // Add new document to the list
          const newDoc: KYCDocument = {
            id: Date.now().toString(),
            type: documentType,
            name: file.name,
            status: 'processing',
            uploadDate: new Date(),
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`
          }

          if (complianceStatus) {
            setComplianceStatus({
              ...complianceStatus,
              documents: [...complianceStatus.documents, newDoc]
            })
          }
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Încărcare date conformitate...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-emerald-400">Conformitate & KYC</h1>
              <p className="text-gray-400 mt-1">Verificare identitate și conformitate reglementări BNR</p>
            </div>
            <div className="flex items-center space-x-4">
              {complianceStatus && (
                <div className="text-right">
                  <div className={`text-lg font-bold ${getStatusColor(complianceStatus.status).split(' ')[0]}`}>
                    {complianceStatus.level.toUpperCase()} LEVEL
                  </div>
                  <div className="text-sm text-gray-400">
                    Scor: {complianceStatus.score}/100
                  </div>
                </div>
              )}
              <Shield className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-1 bg-white/5 backdrop-blur-lg rounded-2xl p-1 border border-white/10">
          {[
            { id: 'overview', name: 'Prezentare Generală', icon: Shield },
            { id: 'documents', name: 'Documente', icon: FileText },
            { id: 'verification', name: 'Verificare AI', icon: UserCheck },
            { id: 'compliance', name: 'Status Conformitate', icon: Lock }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === tab.id
                    ? 'bg-emerald-500/30 text-emerald-300 shadow-lg'
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
        {activeTab === 'overview' && complianceStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="w-8 h-8 text-emerald-400" />
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(complianceStatus.status)}`}>
                    {getStatusIcon(complianceStatus.status)}
                    <span className="ml-1">{complianceStatus.status.toUpperCase()}</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {complianceStatus.level.toUpperCase()}
                </div>
                <div className="text-gray-400 text-sm">Nivel KYC</div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                  <span className="text-sm text-green-400">{complianceStatus.score}%</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {complianceStatus.score}/100
                </div>
                <div className="text-gray-400 text-sm">Scor Conformitate</div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-8 h-8 text-blue-400" />
                  <span className="text-sm text-blue-400">
                    {complianceStatus.documents.filter(doc => doc.status === 'verified').length}/{complianceStatus.documents.length}
                  </span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {complianceStatus.documents.length}
                </div>
                <div className="text-gray-400 text-sm">Documente</div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 text-yellow-400" />
                  <span className="text-sm text-yellow-400">365 zile</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {complianceStatus.expiryDate.getFullYear()}
                </div>
                <div className="text-gray-400 text-sm">Expirare</div>
              </div>
            </div>

            {/* Compliance Progress */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Progres Verificare KYC</h3>
              <div className="space-y-4">
                {[
                  { step: 'Verificare Identitate', status: 'completed', description: 'Carte de identitate verificată cu AI' },
                  { step: 'Verificare Adresă', status: 'completed', description: 'Domiciliu confirmat prin factură utilități' },
                  { step: 'Verificare Financiară', status: 'in-progress', description: 'Analiză extras de cont în progres' },
                  { step: 'Verificare Risc', status: 'pending', description: 'Evaluare profil de risc programată' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        item.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                      }`}>
                      {item.status === 'completed' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : item.status === 'in-progress' ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{item.step}</div>
                      <div className="text-gray-400 text-sm">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            {complianceStatus.recommendations.length > 0 && (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Recomandări</h3>
                <div className="space-y-3">
                  {complianceStatus.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <span className="text-gray-300">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'documents' && complianceStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Upload Area */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Încărcare Documente</h3>
              <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="text-white font-medium mb-2">Trageți fișierele aici sau click pentru a selecta</div>
                <div className="text-gray-400 text-sm mb-4">Acceptăm PDF, JPG, PNG până la 10MB</div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleFileUpload(file, 'Document Identity')
                    }
                  }}
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer inline-block"
                >
                  Selectează Fișier
                </label>

                {uploading && (
                  <div className="mt-4">
                    <div className="bg-white/10 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <div className="text-sm text-gray-400 mt-2">Încărcare: {uploadProgress}%</div>
                  </div>
                )}
              </div>
            </div>

            {/* Documents List */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Documente Încărcate</h3>
              <div className="space-y-4">
                {complianceStatus.documents.map((doc) => (
                  <div key={doc.id} className="border border-white/10 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-6 h-6 text-blue-400" />
                        <div>
                          <div className="text-white font-medium">{doc.name}</div>
                          <div className="text-gray-400 text-sm">{doc.type} • {doc.size}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                          {getStatusIcon(doc.status)}
                          <span className="ml-1">{doc.status.toUpperCase()}</span>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-white">
                          <Download className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-white">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {doc.aiAnalysis && (
                      <div className="bg-white/5 rounded-lg p-3 mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-purple-400 font-medium">Analiză AI</span>
                          <span className="text-white font-bold">{doc.aiAnalysis.confidence}% încredere</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400">Date Extrase:</span>
                            <div className="text-white mt-1">
                              {Object.entries(doc.aiAnalysis.extractedData).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="capitalize">{key}:</span>
                                  <span>{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400">Status Risc:</span>
                            <div className="text-green-400 mt-1">
                              {doc.aiAnalysis.riskFlags.length === 0 ? 'Fără probleme detectate' : 'Verificare necesară'}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'verification' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Verificare AI Avansată</h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-emerald-400">Tehnologii AI Utilizate</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'OCR Avansat', description: 'Extragere text din documente cu precisie 99%+', status: 'active' },
                      { name: 'Detectare Falsuri', description: 'Analiză forensică pentru identificarea documentelor false', status: 'active' },
                      { name: 'Verificare Biometrică', description: 'Comparare facială automată cu fotografiile din CI', status: 'active' },
                      { name: 'Analiză Comportamentală', description: 'Detectarea modelelor suspecte de comportament', status: 'coming-soon' }
                    ].map((tech, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${tech.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'}`} />
                        <div className="flex-1">
                          <div className="text-white font-medium">{tech.name}</div>
                          <div className="text-gray-400 text-sm">{tech.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-emerald-400">Conformitate Reglementări</h4>
                  <div className="space-y-3">
                    {[
                      { regulation: 'GDPR', compliance: 100, description: 'Protecția datelor personale' },
                      { regulation: 'BNR KYC', compliance: 95, description: 'Reglementări Banca Națională' },
                      { regulation: 'AML Directive', compliance: 98, description: 'Anti-Money Laundering' },
                      { regulation: 'PSD2', compliance: 92, description: 'Payment Services Directive' }
                    ].map((reg, index) => (
                      <div key={index} className="p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{reg.regulation}</span>
                          <span className={`text-sm font-bold ${reg.compliance >= 95 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {reg.compliance}%
                          </span>
                        </div>
                        <div className="text-gray-400 text-sm">{reg.description}</div>
                        <div className="mt-2 bg-white/10 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${reg.compliance >= 95 ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{ width: `${reg.compliance}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'compliance' && complianceStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Status Conformitate Detalizat</h3>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-white mb-4">Niveluri KYC Disponibile</h4>
                    <div className="space-y-3">
                      {[
                        {
                          level: 'Basic',
                          requirements: ['Carte de identitate', 'Adresă email', 'Număr telefon'],
                          limits: 'Până la 1.000 RON/lună',
                          status: complianceStatus.level === 'basic' ? 'current' : 'completed'
                        },
                        {
                          level: 'Enhanced',
                          requirements: ['Verificare adresă', 'Extras de cont', 'Sursă venituri'],
                          limits: 'Până la 10.000 RON/lună',
                          status: complianceStatus.level === 'enhanced' ? 'current' : complianceStatus.level === 'premium' ? 'completed' : 'available'
                        },
                        {
                          level: 'Premium',
                          requirements: ['Verificare video', 'Declarație venituri', 'Verificare angajator'],
                          limits: 'Fără limite',
                          status: complianceStatus.level === 'premium' ? 'current' : 'available'
                        }
                      ].map((kycLevel, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${kycLevel.status === 'current' ? 'border-emerald-400 bg-emerald-500/10' :
                            kycLevel.status === 'completed' ? 'border-green-400 bg-green-500/10' :
                              'border-white/20 bg-white/5'
                          }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-semibold">{kycLevel.level} Level</span>
                            <div className={`px-2 py-1 rounded text-xs ${kycLevel.status === 'current' ? 'bg-emerald-400 text-black' :
                                kycLevel.status === 'completed' ? 'bg-green-400 text-black' :
                                  'bg-white/20 text-gray-300'
                              }`}>
                              {kycLevel.status === 'current' ? 'ACTUAL' : kycLevel.status === 'completed' ? 'COMPLETAT' : 'DISPONIBIL'}
                            </div>
                          </div>
                          <div className="text-gray-400 text-sm mb-2">
                            Limite: {kycLevel.limits}
                          </div>
                          <div className="text-gray-300 text-sm">
                            Cerințe: {kycLevel.requirements.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-white mb-4">Următoarele Acțiuni</h4>
                    <div className="space-y-3">
                      {[
                        { action: 'Actualizare documente', deadline: '30 zile', priority: 'low' },
                        { action: 'Verificare anuală', deadline: '11 luni', priority: 'medium' },
                        { action: 'Upgrade la Premium', deadline: 'Opțional', priority: 'low' }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div>
                            <div className="text-white text-sm font-medium">{item.action}</div>
                            <div className="text-gray-400 text-xs">{item.deadline}</div>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${item.priority === 'high' ? 'bg-red-400' :
                              item.priority === 'medium' ? 'bg-yellow-400' :
                                'bg-green-400'
                            }`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-white mb-4">Informații Contact</h4>
                    <div className="space-y-2 text-sm">
                      <div className="text-gray-400">Suport KYC:</div>
                      <div className="text-white">kyc@bancai.ro</div>
                      <div className="text-white">+40 21 123 4567</div>
                      <div className="text-gray-400 mt-3">Program:</div>
                      <div className="text-white">L-V: 09:00 - 18:00</div>
                      <div className="text-white">S: 09:00 - 14:00</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ComplianceKYC

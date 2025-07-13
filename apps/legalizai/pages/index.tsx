import Head from 'next/head';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scale, FileText, Shield, BookOpen, Gavel, Users, AlertTriangle, CheckCircle } from 'lucide-react';

export default function LegalizAIHub() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    // Set initial time on client mount
    setCurrentTime(new Date().toLocaleTimeString());

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  const legalServices = [
    {
      icon: FileText,
      title: 'Document Review',
      description: 'AI-powered contract and legal document analysis',
      color: 'blue'
    },
    {
      icon: Shield,
      title: 'Compliance Check',
      description: 'Automated regulatory compliance verification',
      color: 'emerald'
    },
    {
      icon: Gavel,
      title: 'Legal Research',
      description: 'Comprehensive case law and precedent analysis',
      color: 'purple'
    },
    {
      icon: Users,
      title: 'Client Management',
      description: 'Secure client communication and case tracking',
      color: 'orange'
    }
  ];

  const recentCases = [
    {
      id: '1',
      title: 'Corporate Merger Agreement',
      type: 'Contract Review',
      status: 'completed',
      priority: 'high',
      lastUpdate: '2 hours ago'
    },
    {
      id: '2',
      title: 'GDPR Compliance Audit',
      type: 'Compliance',
      status: 'in-progress',
      priority: 'medium',
      lastUpdate: '1 day ago'
    },
    {
      id: '3',
      title: 'Employment Law Research',
      type: 'Legal Research',
      status: 'pending',
      priority: 'low',
      lastUpdate: '3 days ago'
    }
  ];

  const complianceMetrics = [
    { label: 'Documents Processed', value: '2,847', change: '+12%' },
    { label: 'Compliance Score', value: '98.7%', change: '+2.1%' },
    { label: 'Risk Assessments', value: '156', change: '+8%' },
    { label: 'Legal Opinions', value: '89', change: '+15%' },
  ];

  return (
    <>
      <Head>
        <title>LegalizAI - AI Legal Services Platform</title>
        <meta name="description" content="AI-powered legal services for compliance, document review, and legal research" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-[10px] opacity-50">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
        </div>

        {/* Header */}
        <header className="relative z-10 p-6">
          <nav className="flex items-center justify-between">
            <div className="text-2xl font-bold gradient-text">LegalizAI</div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-sm text-slate-300">Port 4055 • Online</span>
              </div>
              <div className="text-sm text-slate-400">{currentTime || '...'}</div>
            </div>
          </nav>
        </header>

        <div className="relative z-10 container mx-auto px-4 py-16">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl font-bold mb-6">
              <span className="gradient-text animate-gradient-x">LegalizAI</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
              AI-powered legal services platform for compliance, document review, and intelligent legal research
            </p>
            <div className="flex items-center justify-center space-x-2 text-indigo-400">
              <Scale className="w-5 h-5" />
              <span className="text-sm font-medium">Advanced Legal Intelligence</span>
            </div>
          </motion.div>

          {/* Compliance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          >
            {complianceMetrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-6 hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <Scale className="w-6 h-6 text-indigo-400" />
                  <span className="text-emerald-400 text-sm font-medium">{metric.change}</span>
                </div>
                <div className="text-2xl font-bold mb-1">{metric.value}</div>
                <div className="text-slate-400 text-sm">{metric.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Services Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          >
            {legalServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card p-6 hover:bg-white/20 transition-all duration-300 group"
                >
                  <div className={`w-12 h-12 bg-gradient-to-r ${service.color === 'blue' ? 'from-blue-500 to-blue-600' :
                      service.color === 'emerald' ? 'from-emerald-500 to-emerald-600' :
                        service.color === 'purple' ? 'from-purple-500 to-purple-600' :
                          'from-orange-500 to-orange-600'
                    } rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                  <p className="text-slate-400 text-sm">{service.description}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Recent Cases */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="glass-card p-8 mb-16"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <FileText className="w-8 h-8 mr-3 text-indigo-400" />
              Recent Cases
            </h2>
            <div className="space-y-4">
              {recentCases.map((case_item, index) => (
                <motion.div
                  key={case_item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1">{case_item.title}</h4>
                      <p className="text-slate-400 text-sm mb-2">{case_item.type}</p>
                      <p className="text-xs text-slate-500">Updated {case_item.lastUpdate}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${case_item.priority === 'high' ? 'bg-red-500/30 text-red-300' :
                          case_item.priority === 'medium' ? 'bg-yellow-500/30 text-yellow-300' :
                            'bg-green-500/30 text-green-300'
                        }`}>
                        {case_item.priority}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${case_item.status === 'completed' ? 'bg-emerald-500/30 text-emerald-300' :
                          case_item.status === 'in-progress' ? 'bg-blue-500/30 text-blue-300' :
                            'bg-slate-500/30 text-slate-300'
                        }`}>
                        {case_item.status}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid md:grid-cols-3 gap-6"
          >
            <div className="glass-card p-6 text-center group hover:bg-white/20 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">New Document Review</h3>
              <p className="text-slate-400 mb-4">Upload documents for AI-powered legal analysis</p>
              <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors">
                Start Review
              </button>
            </div>

            <div className="glass-card p-6 text-center group hover:bg-white/20 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Compliance Check</h3>
              <p className="text-slate-400 mb-4">Verify regulatory compliance automatically</p>
              <button className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg font-medium transition-colors">
                Run Check
              </button>
            </div>

            <div className="glass-card p-6 text-center group hover:bg-white/20 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Legal Research</h3>
              <p className="text-slate-400 mb-4">Access comprehensive legal database and precedents</p>
              <button className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg font-medium transition-colors">
                Start Research
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  );
}

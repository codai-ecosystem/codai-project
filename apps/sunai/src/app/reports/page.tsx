'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Download,
  Share,
  Calendar,
  Target,
  DollarSign,
  Zap,
  Sun,
  Battery,
  Settings,
  ChevronDown,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';

// TypeScript interfaces
interface PerformanceReport {
  id: string;
  title: string;
  type: 'performance' | 'financial' | 'environmental' | 'maintenance';
  period: string;
  status: 'completed' | 'generating' | 'scheduled';
  generated: string;
  size: string;
  summary: string;
}

interface AIInsight {
  id: string;
  category: 'optimization' | 'prediction' | 'alert' | 'recommendation';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  action: string;
  priority: number;
}

interface ReportMetrics {
  totalReports: number;
  scheduledReports: number;
  avgGenerationTime: string;
  dataAccuracy: number;
  insightsGenerated: number;
  actionableItems: number;
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('this-month');
  const [reportFilter, setReportFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for reports
  const [reports] = useState<PerformanceReport[]>([
    {
      id: '1',
      title: 'Monthly Performance Summary',
      type: 'performance',
      period: 'July 2025',
      status: 'completed',
      generated: '2025-08-01',
      size: '2.4 MB',
      summary: 'System generated 1,247.8 kWh with 94.2% efficiency. Peak performance on July 15th with 67.2 kW.'
    },
    {
      id: '2',
      title: 'Financial Impact Analysis',
      type: 'financial',
      period: 'Q2 2025',
      status: 'completed',
      generated: '2025-07-31',
      size: '1.8 MB',
      summary: 'Generated $1,840 in savings. ROI improved by 12% compared to Q1. Payback period reduced to 6.2 years.'
    },
    {
      id: '3',
      title: 'Environmental Impact Report',
      type: 'environmental',
      period: 'YTD 2025',
      status: 'completed',
      generated: '2025-08-05',
      size: '3.1 MB',
      summary: 'Avoided 15.8 tons of CO₂ emissions. Equivalent to planting 720 trees or removing 3.4 cars from the road.'
    },
    {
      id: '4',
      title: 'Maintenance & System Health',
      type: 'maintenance',
      period: 'July 2025',
      status: 'completed',
      generated: '2025-08-02',
      size: '1.2 MB',
      summary: 'System uptime 99.2%. 2 preventive maintenance tasks completed. Next service due August 15th.'
    },
    {
      id: '5',
      title: 'August Performance Forecast',
      type: 'performance',
      period: 'August 2025',
      status: 'generating',
      generated: 'In Progress',
      size: 'Estimating...',
      summary: 'AI-powered forecast based on weather patterns and historical performance data.'
    },
    {
      id: '6',
      title: 'Annual ROI Analysis',
      type: 'financial',
      period: '2025 Projection',
      status: 'scheduled',
      generated: 'Aug 31, 2025',
      size: 'TBD',
      summary: 'Comprehensive annual return on investment analysis with 5-year projection.'
    }
  ]);

  const [aiInsights] = useState<AIInsight[]>([
    {
      id: '1',
      category: 'optimization',
      title: 'Panel Cleaning Optimization',
      description: 'AI detected 3.2% efficiency loss due to dust accumulation on panels A7-A12. Cleaning recommended within 5 days.',
      impact: 'medium',
      confidence: 87,
      action: 'Schedule panel cleaning',
      priority: 2
    },
    {
      id: '2',
      category: 'prediction',
      title: 'Weather Pattern Analysis',
      description: 'Upcoming weather patterns suggest 15% above-average solar irradiance for next 10 days. Optimize energy storage.',
      impact: 'high',
      confidence: 94,
      action: 'Adjust battery charging schedule',
      priority: 1
    },
    {
      id: '3',
      category: 'alert',
      title: 'Inverter Performance Decline',
      description: 'Main inverter showing gradual efficiency decline over past 30 days. Maintenance recommended before performance drops below 90%.',
      impact: 'high',
      confidence: 91,
      action: 'Schedule inverter maintenance',
      priority: 1
    },
    {
      id: '4',
      category: 'recommendation',
      title: 'Load Balancing Optimization',
      description: 'AI identified opportunities to reduce grid dependency by 8% through smart load balancing during peak generation hours.',
      impact: 'medium',
      confidence: 82,
      action: 'Configure load balancing',
      priority: 3
    },
    {
      id: '5',
      category: 'optimization',
      title: 'Battery Charging Strategy',
      description: 'Current charging pattern not optimal for maximizing battery lifespan. Recommended strategy could extend life by 18 months.',
      impact: 'high',
      confidence: 89,
      action: 'Update charging algorithm',
      priority: 2
    }
  ]);

  const [metrics] = useState<ReportMetrics>({
    totalReports: 24,
    scheduledReports: 8,
    avgGenerationTime: '3.2 min',
    dataAccuracy: 99.2,
    insightsGenerated: 47,
    actionableItems: 12
  });

  // Filter reports based on selected filter
  const filteredReports = reports.filter(report => {
    if (reportFilter === 'all') return true;
    return report.type === reportFilter;
  });

  // Filter insights based on priority
  const prioritizedInsights = aiInsights.sort((a, b) => a.priority - b.priority);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'generating': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return <BarChart3 className="h-4 w-4 text-blue-500" />;
      case 'financial': return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'environmental': return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'maintenance': return <Settings className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'optimization': return <Target className="h-4 w-4 text-blue-500" />;
      case 'prediction': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'alert': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'recommendation': return <CheckCircle className="h-4 w-4 text-purple-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      {/* Enhanced Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-yellow-200/50 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-2 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                  Reports & Insights
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {metrics.totalReports} Reports • {metrics.insightsGenerated} AI Insights • {metrics.dataAccuracy}% Accuracy
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
              <button className="flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all">
                <Share className="h-4 w-4 mr-2" />
                Share
              </button>
              <button className="flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all">
                <Download className="h-4 w-4 mr-2" />
                Download
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-white rounded-lg border border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="this-week">This Week</option>
                    <option value="this-month">This Month</option>
                    <option value="last-month">Last Month</option>
                    <option value="this-quarter">This Quarter</option>
                    <option value="this-year">This Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <select
                    value={reportFilter}
                    onChange={(e) => setReportFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  >
                    <option value="all">All Reports</option>
                    <option value="performance">Performance</option>
                    <option value="financial">Financial</option>
                    <option value="environmental">Environmental</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="generating">Generating</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex space-x-1 p-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'reports', label: 'Generated Reports', icon: FileText },
              { id: 'insights', label: 'AI Insights', icon: Target },
              { id: 'analytics', label: 'Report Analytics', icon: PieChart },
              { id: 'schedule', label: 'Report Schedule', icon: Calendar },
              { id: 'export', label: 'Export Center', icon: Download }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reports</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.totalReports}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">+12% from last month</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Insights</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.insightsGenerated}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">+{metrics.actionableItems} actionable</span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Data Accuracy</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.dataAccuracy}%</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-gray-600">Avg generation: {metrics.avgGenerationTime}</span>
                </div>
              </div>
            </div>

            {/* Recent Reports Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
                <p className="text-sm text-gray-600 mt-1">Latest generated reports and insights</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {filteredReports.slice(0, 3).map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        {getTypeIcon(report.type)}
                        <div>
                          <h4 className="font-medium text-gray-900">{report.title}</h4>
                          <p className="text-sm text-gray-600">{report.period}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(report.status)}
                        <span className="text-sm text-gray-600">{report.size}</span>
                        <button className="text-yellow-600 hover:text-yellow-700">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top AI Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Priority AI Insights</h3>
                <p className="text-sm text-gray-600 mt-1">High-priority recommendations requiring attention</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {prioritizedInsights.slice(0, 3).map((insight) => (
                    <div key={insight.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          {getCategoryIcon(insight.category)}
                          <div>
                            <h4 className="font-medium text-gray-900">{insight.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getImpactColor(insight.impact)}`}>
                                {insight.impact.toUpperCase()} IMPACT
                              </span>
                              <span className="text-xs text-gray-500">{insight.confidence}% confidence</span>
                            </div>
                          </div>
                        </div>
                        <button className="text-yellow-600 hover:text-yellow-700">
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Generated Reports Tab */}
        {activeTab === 'reports' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Generated Reports</h3>
                    <p className="text-sm text-gray-600 mt-1">{filteredReports.length} reports available for download</p>
                  </div>
                  <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all">
                    Generate New Report
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          {getTypeIcon(report.type)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="font-semibold text-gray-900">{report.title}</h4>
                              {getStatusIcon(report.status)}
                              <span className="text-sm text-gray-500 capitalize">{report.status}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{report.period}</p>
                            <p className="text-sm text-gray-700 mt-2">{report.summary}</p>
                            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                              <span>Generated: {report.generated}</span>
                              <span>Size: {report.size}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {report.status === 'completed' && (
                            <>
                              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
                                <Share className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-yellow-600 hover:text-yellow-700 rounded-lg hover:bg-yellow-50">
                                <Download className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'insights' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
                    <p className="text-sm text-gray-600 mt-1">{aiInsights.length} insights with {metrics.actionableItems} actionable recommendations</p>
                  </div>
                  <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Insights
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {prioritizedInsights.map((insight) => (
                    <div key={insight.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        {getCategoryIcon(insight.category)}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center space-x-3">
                                <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                                <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getImpactColor(insight.impact)}`}>
                                  {insight.impact.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-2">{insight.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">{insight.confidence}%</div>
                              <div className="text-xs text-gray-500">Confidence</div>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Recommended Action:</span>
                              <span className="text-sm font-medium text-gray-900">{insight.action}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                                Dismiss
                              </button>
                              <button className="px-3 py-1 text-sm bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-md hover:from-yellow-500 hover:to-orange-600">
                                Take Action
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Report Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Generation Trends</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Report generation analytics chart</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Insight Categories</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Insight distribution chart</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{metrics.avgGenerationTime}</div>
                    <div className="text-sm text-gray-600">Avg Generation Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{metrics.dataAccuracy}%</div>
                    <div className="text-sm text-gray-600">Data Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{metrics.scheduledReports}</div>
                    <div className="text-sm text-gray-600">Scheduled Reports</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{metrics.actionableItems}</div>
                    <div className="text-sm text-gray-600">Actionable Insights</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Report Schedule</h3>
                    <p className="text-sm text-gray-600 mt-1">Automated report generation schedule</p>
                  </div>
                  <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all">
                    Add Schedule
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <h4 className="font-medium text-gray-900">Daily Performance Summary</h4>
                        <p className="text-sm text-gray-600">Every day at 6:00 AM</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600">Active</span>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Calendar className="h-5 w-5 text-purple-500" />
                      <div>
                        <h4 className="font-medium text-gray-900">Weekly Financial Report</h4>
                        <p className="text-sm text-gray-600">Every Monday at 8:00 AM</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600">Active</span>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Calendar className="h-5 w-5 text-green-500" />
                      <div>
                        <h4 className="font-medium text-gray-900">Monthly System Health</h4>
                        <p className="text-sm text-gray-600">First day of month at 9:00 AM</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-green-600">Active</span>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Export Center Tab */}
        {activeTab === 'export' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Export Center</h3>
                <p className="text-sm text-gray-600 mt-1">Export reports and data in various formats</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border border-gray-200 rounded-lg p-6 text-center">
                    <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <h4 className="font-semibold text-gray-900 mb-2">PDF Reports</h4>
                    <p className="text-sm text-gray-600 mb-4">Professional formatted reports</p>
                    <button className="w-full bg-blue-50 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-100">
                      Export PDF
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6 text-center">
                    <BarChart3 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h4 className="font-semibold text-gray-900 mb-2">Excel Data</h4>
                    <p className="text-sm text-gray-600 mb-4">Raw data for analysis</p>
                    <button className="w-full bg-green-50 text-green-600 py-2 px-4 rounded-lg hover:bg-green-100">
                      Export Excel
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6 text-center">
                    <Download className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                    <h4 className="font-semibold text-gray-900 mb-2">Custom Export</h4>
                    <p className="text-sm text-gray-600 mb-4">Choose format and data</p>
                    <button className="w-full bg-purple-50 text-purple-600 py-2 px-4 rounded-lg hover:bg-purple-100">
                      Custom Export
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-yellow-200/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl"
            >
              <div className="flex items-center space-x-3 mb-3">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Advanced Analytics</h3>
              </div>
              <p className="text-blue-700 text-sm">
                Comprehensive reporting with AI-powered insights and predictive analytics for optimal solar performance.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Target className="h-6 w-6 text-purple-600" />
                <h3 className="font-semibold text-purple-900">AI Insights</h3>
              </div>
              <p className="text-purple-700 text-sm">
                Machine learning-powered recommendations and optimization suggestions for maximum efficiency.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl"
            >
              <div className="flex items-center space-x-3 mb-3">
                <FileText className="h-6 w-6 text-green-600" />
                <h3 className="font-semibold text-green-900">Smart Reporting</h3>
              </div>
              <p className="text-green-700 text-sm">
                Automated report generation with customizable schedules and professional formatting options.
              </p>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
}

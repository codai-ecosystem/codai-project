import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerformanceMonitor } from '@/lib/performance/PerformanceMonitor';
import { useAccessibilityTesting } from '@/lib/accessibility/AccessibilityChecker';
import { LighthouseOptimizer } from '@/lib/performance/LighthouseOptimizer';
import { BundleAnalyzer } from '@/lib/performance/LighthouseOptimizer';
import { trackEvent } from '@/components/analytics/AnalyticsProvider';

interface DashboardTab {
  id: string;
  label: string;
  icon: string;
  component: React.ComponentType;
}

// Performance Dashboard Tab
const PerformanceTab: React.FC = () => {
  const performanceData = usePerformanceMonitor();
  const [optimizationReport, setOptimizationReport] = useState<string>('');
  const [bundleAnalysis, setBundleAnalysis] = useState<any>(null);

  // Extract metrics and monitoring status
  const metrics = performanceData as any; // Temporary type assertion
  const isMonitoring = true; // Default to true for demo

  const runOptimization = async () => {
    const suggestions = await LighthouseOptimizer.runOptimization();
    const report = LighthouseOptimizer.generateReport();
    setOptimizationReport(report);
    
    const analysis = await BundleAnalyzer.analyzeBundleSize();
    setBundleAnalysis(analysis);
    
    trackEvent('dev_dashboard', 'performance', 'optimization_run', suggestions.length);
  };

  const formatSize = (bytes: number) => `${Math.round(bytes / 1024)}KB`;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="bg-black/40 backdrop-blur-lg rounded-lg p-6 border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Core Web Vitals</h3>
          <div className={`px-2 py-1 rounded text-xs ${isMonitoring ? 'bg-green-900 text-green-300' : 'bg-gray-900 text-gray-400'}`}>
            {isMonitoring ? 'Monitoring' : 'Idle'}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(metrics.lcp < 2500 ? 90 : metrics.lcp < 4000 ? 70 : 30)}`}>
              {metrics.lcp > 0 ? `${Math.round(metrics.lcp)}ms` : '-'}
            </div>
            <div className="text-sm text-gray-400">LCP</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(metrics.fid < 100 ? 90 : metrics.fid < 300 ? 70 : 30)}`}>
              {metrics.fid > 0 ? `${Math.round(metrics.fid)}ms` : '-'}
            </div>
            <div className="text-sm text-gray-400">FID</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(metrics.cls < 0.1 ? 90 : metrics.cls < 0.25 ? 70 : 30)}`}>
              {metrics.cls > 0 ? metrics.cls.toFixed(3) : '-'}
            </div>
            <div className="text-sm text-gray-400">CLS</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(metrics.fcp < 1800 ? 90 : metrics.fcp < 3000 ? 70 : 30)}`}>
              {metrics.fcp > 0 ? `${Math.round(metrics.fcp)}ms` : '-'}
            </div>
            <div className="text-sm text-gray-400">FCP</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${getScoreColor(metrics.ttfb < 800 ? 90 : metrics.ttfb < 1800 ? 70 : 30)}`}>
              {metrics.ttfb > 0 ? `${Math.round(metrics.ttfb)}ms` : '-'}
            </div>
            <div className="text-sm text-gray-400">TTFB</div>
          </div>
        </div>
      </div>

      {/* Bundle Analysis */}
      {bundleAnalysis && (
        <div className="bg-black/40 backdrop-blur-lg rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Bundle Analysis</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">{formatSize(bundleAnalysis.totalSize)}</div>
              <div className="text-sm text-gray-400">Total</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-yellow-400">{formatSize(bundleAnalysis.jsSize)}</div>
              <div className="text-sm text-gray-400">JavaScript</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">{formatSize(bundleAnalysis.cssSize)}</div>
              <div className="text-sm text-gray-400">CSS</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-400">{formatSize(bundleAnalysis.imageSize)}</div>
              <div className="text-sm text-gray-400">Images</div>
            </div>
          </div>
          
          {bundleAnalysis.recommendations.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Recommendations:</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                {bundleAnalysis.recommendations.slice(0, 3).map((rec: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="text-orange-400 mr-2">⚠</span>
                    {rec}
                  </li>
                ))}
                {bundleAnalysis.recommendations.length > 3 && (
                  <li className="text-gray-500">+ {bundleAnalysis.recommendations.length - 3} more...</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Optimization Actions */}
      <div className="bg-black/40 backdrop-blur-lg rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={runOptimization}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
          >
            Run Lighthouse Optimization
          </button>
        </div>
      </div>

      {/* Optimization Report */}
      {optimizationReport && (
        <div className="bg-black/40 backdrop-blur-lg rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Optimization Report</h3>
          <pre className="text-xs text-gray-300 overflow-auto max-h-64 whitespace-pre-wrap">
            {optimizationReport}
          </pre>
        </div>
      )}
    </div>
  );
};

// Accessibility Dashboard Tab
const AccessibilityTab: React.FC = () => {
  const { report, isChecking, runAccessibilityCheck } = useAccessibilityTesting();

  const getComplianceColor = (compliance: string) => {
    switch (compliance) {
      case 'compliant': return 'text-green-400 bg-green-900/30';
      case 'partial': return 'text-yellow-400 bg-yellow-900/30';
      case 'non-compliant': return 'text-red-400 bg-red-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Accessibility Overview */}
      <div className="bg-black/40 backdrop-blur-lg rounded-lg p-6 border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">WCAG 2.1 AA Compliance</h3>
          <button
            onClick={() => runAccessibilityCheck()}
            disabled={isChecking}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-sm transition-colors"
          >
            {isChecking ? '⏳ Checking...' : '🔄 Run Check'}
          </button>
        </div>
        
        {report && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getComplianceColor(report.compliance)}`}>
                {report.compliance.replace('-', ' ').toUpperCase()}
              </div>
              <div className={`text-2xl font-bold ${getScoreColor(report.score)}`}>
                {report.score}/100
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-red-400">{report.errors.length}</div>
                <div className="text-sm text-gray-400">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-400">{report.warnings.length}</div>
                <div className="text-sm text-gray-400">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-400">{report.info.length}</div>
                <div className="text-sm text-gray-400">Info</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Issues List */}
      {report && (report.errors.length > 0 || report.warnings.length > 0) && (
        <div className="bg-black/40 backdrop-blur-lg rounded-lg p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Issues Found</h3>
          
          {report.errors.length > 0 && (
            <div className="mb-4">
              <h4 className="text-md font-medium text-red-400 mb-2">Errors ({report.errors.length})</h4>
              <div className="space-y-2">
                {report.errors.slice(0, 5).map((issue, index) => (
                  <div key={index} className="bg-red-900/20 border border-red-900/30 rounded p-3">
                    <div className="font-medium text-red-300">{issue.rule}</div>
                    <div className="text-sm text-red-200 mt-1">{issue.message}</div>
                    <div className="text-xs text-gray-400 mt-2">
                      WCAG {issue.wcagLevel} - {issue.wcagGuideline}
                    </div>
                  </div>
                ))}
                {report.errors.length > 5 && (
                  <div className="text-sm text-gray-400 text-center">
                    + {report.errors.length - 5} more errors
                  </div>
                )}
              </div>
            </div>
          )}

          {report.warnings.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-yellow-400 mb-2">Warnings ({report.warnings.length})</h4>
              <div className="space-y-2">
                {report.warnings.slice(0, 3).map((issue, index) => (
                  <div key={index} className="bg-yellow-900/20 border border-yellow-900/30 rounded p-3">
                    <div className="font-medium text-yellow-300">{issue.rule}</div>
                    <div className="text-sm text-yellow-200 mt-1">{issue.message}</div>
                    <div className="text-xs text-gray-400 mt-2">
                      WCAG {issue.wcagLevel} - {issue.wcagGuideline}
                    </div>
                  </div>
                ))}
                {report.warnings.length > 3 && (
                  <div className="text-sm text-gray-400 text-center">
                    + {report.warnings.length - 3} more warnings
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Accessibility Guidelines */}
      <div className="bg-black/40 backdrop-blur-lg rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-green-400 mb-2">Keyboard Navigation</h4>
            <ul className="text-gray-300 space-y-1 text-xs">
              <li>• Alt + S: Skip to main content</li>
              <li>• Alt + N: Skip to navigation</li>
              <li>• Tab: Navigate forward</li>
              <li>• Shift + Tab: Navigate backward</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-blue-400 mb-2">WCAG Guidelines</h4>
            <ul className="text-gray-300 space-y-1 text-xs">
              <li>• Perceivable: Alt text, contrast</li>
              <li>• Operable: Keyboard navigation</li>
              <li>• Understandable: Clear language</li>
              <li>• Robust: Valid HTML, ARIA</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// System Info Tab
const SystemTab: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<any>(null);

  useEffect(() => {
    const getSystemInfo = () => {
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      setSystemInfo({
        userAgent: navigator.userAgent,
        viewport: `${window.innerWidth}×${window.innerHeight}`,
        screen: `${screen.width}×${screen.height}`,
        devicePixelRatio: window.devicePixelRatio,
        colorDepth: screen.colorDepth,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        connection: connection ? {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt
        } : null,
        memory: (performance as any).memory ? {
          usedJSHeapSize: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
          totalJSHeapSize: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
          jsHeapSizeLimit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024)
        } : null,
        timing: performance.timing ? {
          domLoading: performance.timing.domLoading - performance.timing.navigationStart,
          domContentLoadedEventEnd: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
          loadEventEnd: performance.timing.loadEventEnd - performance.timing.navigationStart
        } : null
      });
    };

    getSystemInfo();
    window.addEventListener('resize', getSystemInfo);
    window.addEventListener('online', getSystemInfo);
    window.addEventListener('offline', getSystemInfo);

    return () => {
      window.removeEventListener('resize', getSystemInfo);
      window.removeEventListener('online', getSystemInfo);
      window.removeEventListener('offline', getSystemInfo);
    };
  }, []);

  if (!systemInfo) return <div>Loading system information...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-lg rounded-lg p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-blue-400 mb-2">Browser</h4>
              <div className="text-sm text-gray-300">
                <div>User Agent: {systemInfo.userAgent}</div>
                <div>Language: {systemInfo.language}</div>
                <div>Platform: {systemInfo.platform}</div>
                <div>Cookies: {systemInfo.cookieEnabled ? 'Enabled' : 'Disabled'}</div>
                <div>Online: {systemInfo.onLine ? 'Yes' : 'No'}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-green-400 mb-2">Display</h4>
              <div className="text-sm text-gray-300">
                <div>Viewport: {systemInfo.viewport}</div>
                <div>Screen: {systemInfo.screen}</div>
                <div>Device Pixel Ratio: {systemInfo.devicePixelRatio}</div>
                <div>Color Depth: {systemInfo.colorDepth}-bit</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {systemInfo.connection && (
              <div>
                <h4 className="font-medium text-purple-400 mb-2">Network</h4>
                <div className="text-sm text-gray-300">
                  <div>Effective Type: {systemInfo.connection.effectiveType}</div>
                  <div>Downlink: {systemInfo.connection.downlink} Mbps</div>
                  <div>RTT: {systemInfo.connection.rtt} ms</div>
                </div>
              </div>
            )}
            
            {systemInfo.memory && (
              <div>
                <h4 className="font-medium text-yellow-400 mb-2">Memory</h4>
                <div className="text-sm text-gray-300">
                  <div>Used Heap: {systemInfo.memory.usedJSHeapSize} MB</div>
                  <div>Total Heap: {systemInfo.memory.totalJSHeapSize} MB</div>
                  <div>Heap Limit: {systemInfo.memory.jsHeapSizeLimit} MB</div>
                </div>
              </div>
            )}
            
            {systemInfo.timing && (
              <div>
                <h4 className="font-medium text-red-400 mb-2">Timing</h4>
                <div className="text-sm text-gray-300">
                  <div>DOM Loading: {systemInfo.timing.domLoading} ms</div>
                  <div>DOM Ready: {systemInfo.timing.domContentLoadedEventEnd} ms</div>
                  <div>Load Complete: {systemInfo.timing.loadEventEnd} ms</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Development Dashboard Component
export const DevelopmentDashboard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('performance');

  const tabs: DashboardTab[] = [
    { id: 'performance', label: 'Performance', icon: '⚡', component: PerformanceTab },
    { id: 'accessibility', label: 'Accessibility', icon: '♿', component: AccessibilityTab },
    { id: 'system', label: 'System', icon: '🖥️', component: SystemTab }
  ];

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || PerformanceTab;

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => {
          setIsOpen(!isOpen);
          trackEvent('dev_dashboard', 'interaction', isOpen ? 'close' : 'open');
        }}
        className="fixed bottom-4 right-4 z-[9999] bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          🔧
        </motion.div>
      </motion.button>

      {/* Dashboard Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-[9998] w-full md:w-96 lg:w-[500px] h-full bg-black/95 backdrop-blur-lg border-l border-white/10 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex-none border-b border-white/10 p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Development Dashboard</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex space-x-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      trackEvent('dev_dashboard', 'navigation', tab.id);
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              <ActiveComponent />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
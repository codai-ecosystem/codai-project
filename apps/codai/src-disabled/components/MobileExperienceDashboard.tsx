/**
 * Mobile Experience Dashboard for CODAI Platform
 * Progressive Web App dashboard with mobile-first design
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Smartphone,
  Tablet,
  Monitor,
  Download,
  Share,
  QrCode,
  Wifi,
  WifiOff,
  Bell,
  Settings,
  TrendingUp,
  Wallet,
  PieChart,
  BarChart3,
  CreditCard,
  Shield,
  Lock,
  Fingerprint,
  Camera,
  Mic,
  Navigation,
  MapPin,
  Globe,
  Zap,
  Battery,
  Signal
} from 'lucide-react';

interface MobileMetrics {
  pwaInstalls: number;
  mobileUsers: number;
  appStoreRating: number;
  offlineUsage: number;
  pushNotifications: number;
  biometricAuth: number;
}

interface DeviceStats {
  mobile: number;
  tablet: number;
  desktop: number;
}

const MobileExperienceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MobileMetrics>({
    pwaInstalls: 2847,
    mobileUsers: 15623,
    appStoreRating: 4.8,
    offlineUsage: 78,
    pushNotifications: 94,
    biometricAuth: 87,
  });

  const [deviceStats, setDeviceStats] = useState<DeviceStats>({
    mobile: 68,
    tablet: 22,
    desktop: 10,
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    // PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    // Online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
      }
    }
  };

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CODAI Mobile',
          text: 'Advanced financial platform with AI-powered trading',
          url: window.location.origin,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    }
  };

  const mobileFeatures = [
    {
      icon: Smartphone,
      title: 'Native Mobile Apps',
      description: 'iOS and Android applications with native performance',
      status: 'Available',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Globe,
      title: 'Progressive Web App',
      description: 'Installable web app with offline capabilities',
      status: 'Live',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Fingerprint,
      title: 'Biometric Security',
      description: 'Face ID, Touch ID, and fingerprint authentication',
      status: 'Enabled',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Zap,
      title: 'Real-time Sync',
      description: 'Instant synchronization across all devices',
      status: 'Active',
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      icon: Bell,
      title: 'Push Notifications',
      description: 'Market alerts, trade confirmations, and updates',
      status: 'Configured',
      color: 'from-red-500 to-red-600',
    },
    {
      icon: Shield,
      title: 'Offline Mode',
      description: 'Full functionality without internet connection',
      status: 'Ready',
      color: 'from-indigo-500 to-indigo-600',
    },
  ];

  const mobileScreens = [
    {
      icon: TrendingUp,
      name: 'Trading Platform',
      description: 'Touch-optimized trading with gesture controls',
      users: '8.2K',
    },
    {
      icon: Wallet,
      name: 'Digital Wallet',
      description: 'Secure cryptocurrency and asset management',
      users: '6.7K',
    },
    {
      icon: PieChart,
      name: 'Portfolio Analytics',
      description: 'Real-time portfolio tracking and insights',
      users: '9.1K',
    },
    {
      icon: CreditCard,
      name: 'Banking Services',
      description: 'Comprehensive banking with AI assistance',
      users: '7.4K',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Mobile Experience Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Progressive Web App & Native Mobile Platform Analytics
          </p>

          {/* Connection Status */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {isOnline ? (
              <><Wifi className="h-5 w-5 text-green-500" />
                <span className="text-green-600">Online</span></>
            ) : (
              <><WifiOff className="h-5 w-5 text-red-500" />
                <span className="text-red-600">Offline</span></>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <button
            onClick={handleInstallPWA}
            disabled={!installPrompt}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
          >
            <Download className="h-5 w-5" />
            Install PWA
          </button>

          <button
            onClick={handleShareApp}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <Share className="h-5 w-5" />
            Share App
          </button>

          <button className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl font-semibold hover:shadow-lg transition-all">
            <QrCode className="h-5 w-5" />
            QR Code
          </button>
        </motion.div>

        {/* Mobile Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">PWA Installs</h3>
              <Download className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {metrics.pwaInstalls.toLocaleString()}
            </div>
            <div className="text-sm text-green-600">+12% this month</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Mobile Users</h3>
              <Smartphone className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {metrics.mobileUsers.toLocaleString()}
            </div>
            <div className="text-sm text-green-600">+18% this month</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">App Rating</h3>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {metrics.appStoreRating}/5.0
            </div>
            <div className="text-sm text-green-600">+0.2 this month</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Offline Usage</h3>
              <WifiOff className="h-8 w-8 text-purple-500" />
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {metrics.offlineUsage}%
            </div>
            <div className="text-sm text-green-600">+5% this month</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Push Notifications</h3>
              <Bell className="h-8 w-8 text-red-500" />
            </div>
            <div className="text-3xl font-bold text-red-600 mb-2">
              {metrics.pushNotifications}%
            </div>
            <div className="text-sm text-green-600">Enabled</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Biometric Auth</h3>
              <Fingerprint className="h-8 w-8 text-indigo-500" />
            </div>
            <div className="text-3xl font-bold text-indigo-600 mb-2">
              {metrics.biometricAuth}%
            </div>
            <div className="text-sm text-green-600">Active users</div>
          </motion.div>
        </div>

        {/* Device Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl p-6 shadow-lg mb-8"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-6">Device Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Smartphone className="h-12 w-12 text-blue-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-blue-600">{deviceStats.mobile}%</div>
              <div className="text-gray-600">Mobile</div>
            </div>
            <div className="text-center">
              <Tablet className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-green-600">{deviceStats.tablet}%</div>
              <div className="text-gray-600">Tablet</div>
            </div>
            <div className="text-center">
              <Monitor className="h-12 w-12 text-purple-500 mx-auto mb-3" />
              <div className="text-2xl font-bold text-purple-600">{deviceStats.desktop}%</div>
              <div className="text-gray-600">Desktop</div>
            </div>
          </div>
        </motion.div>

        {/* Mobile Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-xl p-6 shadow-lg mb-8"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-6">Mobile Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mobileFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1 }}
                className="relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                <div className="relative p-6 border border-gray-200 rounded-xl hover:border-transparent hover:shadow-lg transition-all">
                  <feature.icon className={`h-8 w-8 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent mb-3`} />
                  <h4 className="font-semibold text-gray-800 mb-2">{feature.title}</h4>
                  <p className="text-gray-600 text-sm mb-3">{feature.description}</p>
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                    {feature.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Mobile Screens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="bg-white rounded-xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-800 mb-6">Popular Mobile Screens</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mobileScreens.map((screen, index) => (
              <motion.div
                key={screen.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + index * 0.1 }}
                className="text-center group cursor-pointer"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <screen.icon className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">{screen.name}</h4>
                <p className="text-gray-600 text-sm mb-3">{screen.description}</p>
                <div className="text-blue-600 font-semibold">{screen.users} active users</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Star component for rating
const Star: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default MobileExperienceDashboard;

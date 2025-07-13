/**
 * Mobile App Integration for Memorai V3.0
 * React Native components with offline sync and push notifications
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useMemoryStore } from '../../stores/memory-store';
import {
  Smartphone,
  Tablet,
  Wifi,
  WifiOff,
  Download,
  Upload,
  Bell,
  BellRing,
  RotateCcw,
  Database,
  Cloud,
  Settings,
  User,
  Lock,
  Fingerprint,
  Shield,
  Activity,
  MapPin,
  Camera,
  Mic,
  Image,
  FileText,
  Calendar,
  Clock,
  Battery,
  Signal,
  Bluetooth,
  Headphones,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Zap,
  Globe,
  Eye,
  EyeOff,
  Star,
  Share2,
  Search,
  Filter,
  MoreHorizontal,
  Plus,
  Edit,
  Trash2,
  Archive,
  Bookmark,
  Tag,
  Users,
  MessageCircle,
} from 'lucide-react';

interface MobileDevice {
  id: string;
  name: string;
  type: 'phone' | 'tablet';
  platform: 'ios' | 'android';
  version: string;
  isOnline: boolean;
  lastSync: Date;
  batteryLevel: number;
  storageUsed: number;
  storageTotal: number;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  permissions: {
    notifications: boolean;
    location: boolean;
    camera: boolean;
    microphone: boolean;
    storage: boolean;
  };
}

interface OfflineOperation {
  id: string;
  type: 'create' | 'update' | 'delete' | 'sync';
  entityType: 'memory' | 'comment' | 'tag' | 'setting';
  entityId: string;
  data: any;
  timestamp: Date;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  retryCount: number;
  conflictResolution?: 'server' | 'client' | 'merge';
}

interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'memory_shared' | 'comment_added' | 'sync_completed' | 'reminder' | 'security_alert';
  priority: 'low' | 'normal' | 'high' | 'critical';
  scheduled?: Date;
  sent?: Date;
  opened?: Date;
  data?: Record<string, any>;
  targetDevices: string[];
}

interface SyncStatus {
  isOnline: boolean;
  lastSync: Date;
  pendingOperations: number;
  syncInProgress: boolean;
  syncErrors: string[];
  dataVersion: string;
  conflictsDetected: number;
}

interface MobileFeature {
  id: string;
  name: string;
  description: string;
  component: string;
  isEnabled: boolean;
  platforms: ('ios' | 'android')[];
  requiredVersion: string;
  permissions: string[];
  usage: {
    activeUsers: number;
    dailyEngagement: number;
    retention: number;
  };
}

export const MobileAppIntegration: React.FC = () => {
  const { memories, fetchMemories } = useMemoryStore();
  const [devices, setDevices] = useState<MobileDevice[]>([]);
  const [offlineOps, setOfflineOps] = useState<OfflineOperation[]>([]);
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    lastSync: new Date(),
    pendingOperations: 0,
    syncInProgress: false,
    syncErrors: [],
    dataVersion: '1.0.0',
    conflictsDetected: 0,
  });
  const [mobileFeatures, setMobileFeatures] = useState<MobileFeature[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<MobileDevice | null>(null);

  // Initialize with sample data
  useEffect(() => {
    const sampleDevices: MobileDevice[] = [
      {
        id: 'device-1',
        name: 'iPhone 15 Pro',
        type: 'phone',
        platform: 'ios',
        version: '17.2',
        isOnline: true,
        lastSync: new Date(Date.now() - 5 * 60 * 1000),
        batteryLevel: 85,
        storageUsed: 2.3,
        storageTotal: 128,
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 10,
        },
        permissions: {
          notifications: true,
          location: true,
          camera: true,
          microphone: true,
          storage: true,
        },
      },
      {
        id: 'device-2',
        name: 'Samsung Galaxy S24',
        type: 'phone',
        platform: 'android',
        version: '14.0',
        isOnline: false,
        lastSync: new Date(Date.now() - 45 * 60 * 1000),
        batteryLevel: 42,
        storageUsed: 4.7,
        storageTotal: 256,
        permissions: {
          notifications: true,
          location: false,
          camera: true,
          microphone: false,
          storage: true,
        },
      },
      {
        id: 'device-3',
        name: 'iPad Pro',
        type: 'tablet',
        platform: 'ios',
        version: '17.2',
        isOnline: true,
        lastSync: new Date(Date.now() - 2 * 60 * 1000),
        batteryLevel: 68,
        storageUsed: 12.5,
        storageTotal: 512,
        permissions: {
          notifications: true,
          location: true,
          camera: true,
          microphone: true,
          storage: true,
        },
      },
    ];

    const sampleOfflineOps: OfflineOperation[] = [
      {
        id: 'op-1',
        type: 'create',
        entityType: 'memory',
        entityId: 'mem-offline-1',
        data: { content: 'Meeting notes from client call', tags: ['meeting', 'client'] },
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        status: 'pending',
        retryCount: 0,
      },
      {
        id: 'op-2',
        type: 'update',
        entityType: 'memory',
        entityId: 'mem-123',
        data: { content: 'Updated project requirements' },
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        status: 'syncing',
        retryCount: 1,
      },
      {
        id: 'op-3',
        type: 'create',
        entityType: 'comment',
        entityId: 'comment-offline-1',
        data: { content: 'Great idea for the mobile app!', memoryId: 'mem-456' },
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        status: 'failed',
        retryCount: 3,
      },
    ];

    const sampleNotifications: PushNotification[] = [
      {
        id: 'notif-1',
        title: 'New Memory Shared',
        message: 'Alice shared a project document with you',
        type: 'memory_shared',
        priority: 'normal',
        sent: new Date(Date.now() - 15 * 60 * 1000),
        opened: new Date(Date.now() - 10 * 60 * 1000),
        data: { memoryId: 'mem-789', sharedBy: 'Alice Johnson' },
        targetDevices: ['device-1', 'device-3'],
      },
      {
        id: 'notif-2',
        title: 'Sync Completed',
        message: 'Your memories have been synchronized across all devices',
        type: 'sync_completed',
        priority: 'low',
        sent: new Date(Date.now() - 5 * 60 * 1000),
        data: { memoriesCount: 23, commentsCount: 5 },
        targetDevices: ['device-1', 'device-2', 'device-3'],
      },
      {
        id: 'notif-3',
        title: 'Daily Reminder',
        message: 'You have 3 unread memories from today',
        type: 'reminder',
        priority: 'normal',
        scheduled: new Date(Date.now() + 60 * 60 * 1000),
        data: { unreadCount: 3 },
        targetDevices: ['device-1'],
      },
    ];

    const sampleFeatures: MobileFeature[] = [
      {
        id: 'voice-notes',
        name: 'Voice Notes',
        description: 'Record and transcribe voice memos',
        component: 'VoiceNoteRecorder',
        isEnabled: true,
        platforms: ['ios', 'android'],
        requiredVersion: '1.0.0',
        permissions: ['microphone'],
        usage: {
          activeUsers: 1250,
          dailyEngagement: 4.2,
          retention: 0.87,
        },
      },
      {
        id: 'photo-memory',
        name: 'Photo Memory',
        description: 'Capture and analyze images for memory creation',
        component: 'PhotoCapture',
        isEnabled: true,
        platforms: ['ios', 'android'],
        requiredVersion: '1.0.0',
        permissions: ['camera', 'storage'],
        usage: {
          activeUsers: 980,
          dailyEngagement: 2.8,
          retention: 0.74,
        },
      },
      {
        id: 'location-context',
        name: 'Location Context',
        description: 'Add location context to memories',
        component: 'LocationTracker',
        isEnabled: false,
        platforms: ['ios', 'android'],
        requiredVersion: '1.1.0',
        permissions: ['location'],
        usage: {
          activeUsers: 0,
          dailyEngagement: 0,
          retention: 0,
        },
      },
      {
        id: 'offline-mode',
        name: 'Offline Mode',
        description: 'Access and edit memories without internet',
        component: 'OfflineManager',
        isEnabled: true,
        platforms: ['ios', 'android'],
        requiredVersion: '1.0.0',
        permissions: ['storage'],
        usage: {
          activeUsers: 1456,
          dailyEngagement: 6.1,
          retention: 0.92,
        },
      },
      {
        id: 'biometric-auth',
        name: 'Biometric Authentication',
        description: 'Secure access with fingerprint/face recognition',
        component: 'BiometricAuth',
        isEnabled: true,
        platforms: ['ios', 'android'],
        requiredVersion: '1.0.0',
        permissions: ['biometric'],
        usage: {
          activeUsers: 1123,
          dailyEngagement: 8.5,
          retention: 0.95,
        },
      },
      {
        id: 'widget-support',
        name: 'Widget Support',
        description: 'Quick access widgets for home screen',
        component: 'HomeWidget',
        isEnabled: false,
        platforms: ['ios', 'android'],
        requiredVersion: '1.2.0',
        permissions: [],
        usage: {
          activeUsers: 0,
          dailyEngagement: 0,
          retention: 0,
        },
      },
    ];

    setDevices(sampleDevices);
    setOfflineOps(sampleOfflineOps);
    setNotifications(sampleNotifications);
    setMobileFeatures(sampleFeatures);
    setSelectedDevice(sampleDevices[0]);
    fetchMemories();
  }, [fetchMemories]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update sync status
      setSyncStatus(prev => ({
        ...prev,
        lastSync: new Date(),
        pendingOperations: Math.max(0, prev.pendingOperations - Math.floor(Math.random() * 3)),
        syncInProgress: Math.random() > 0.7,
      }));

      // Update device battery levels
      setDevices(prev => prev.map(device => ({
        ...device,
        batteryLevel: Math.max(10, device.batteryLevel - Math.floor(Math.random() * 2)),
        isOnline: Math.random() > 0.2,
      })));

      // Process offline operations
      setOfflineOps(prev => prev.map(op => {
        if (op.status === 'pending' && Math.random() > 0.5) {
          return { ...op, status: 'syncing' as const };
        }
        if (op.status === 'syncing' && Math.random() > 0.3) {
          return {
            ...op,
            status: Math.random() > 0.8 ? 'failed' as const : 'completed' as const,
            retryCount: Math.random() > 0.8 ? op.retryCount + 1 : op.retryCount
          };
        }
        return op;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Sync operations
  const triggerSync = () => {
    setSyncStatus(prev => ({ ...prev, syncInProgress: true }));

    setTimeout(() => {
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        lastSync: new Date(),
        pendingOperations: 0,
      }));

      // Mark pending operations as completed
      setOfflineOps(prev => prev.map(op =>
        op.status === 'pending' ? { ...op, status: 'completed' } : op
      ));
    }, 3000);
  };

  const retryFailedOperations = () => {
    setOfflineOps(prev => prev.map(op =>
      op.status === 'failed' ? { ...op, status: 'pending', retryCount: op.retryCount + 1 } : op
    ));
  };

  // Notification management
  const sendNotification = (title: string, message: string, type: PushNotification['type']) => {
    const newNotification: PushNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      priority: 'normal',
      sent: new Date(),
      targetDevices: devices.filter(d => d.isOnline).map(d => d.id),
    };

    setNotifications(prev => [newNotification, ...prev]);
  };

  const toggleFeature = (featureId: string) => {
    setMobileFeatures(prev => prev.map(feature =>
      feature.id === featureId ? { ...feature, isEnabled: !feature.isEnabled } : feature
    ));
  };

  // Get device icon
  const getDeviceIcon = (device: MobileDevice) => {
    if (device.type === 'tablet') return <Tablet className="h-5 w-5" />;
    return <Smartphone className="h-5 w-5" />;
  };

  // Get platform badge color
  const getPlatformColor = (platform: string) => {
    return platform === 'ios' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'syncing': return 'text-blue-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'memory_shared': return <Share2 className="h-4 w-4" />;
      case 'comment_added': return <MessageCircle className="h-4 w-4" />;
      case 'sync_completed': return <RotateCcw className="h-4 w-4" />;
      case 'reminder': return <Bell className="h-4 w-4" />;
      case 'security_alert': return <Shield className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
            <Smartphone className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Mobile App Integration
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              React Native components with offline sync and push notifications
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerSync}
            disabled={syncStatus.syncInProgress}
          >
            {syncStatus.syncInProgress ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>

          <Button
            size="sm"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            onClick={() => sendNotification('Test Notification', 'Testing mobile notifications', 'reminder')}
          >
            <Bell className="h-4 w-4 mr-2" />
            Test Push
          </Button>
        </div>
      </div>

      {/* Mobile Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Connected Devices</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {devices.length}
                </p>
              </div>
              <Smartphone className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Online Devices</p>
                <p className="text-2xl font-bold text-green-600">
                  {devices.filter(d => d.isOnline).length}
                </p>
              </div>
              <Wifi className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Sync</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {offlineOps.filter(op => op.status === 'pending').length}
                </p>
              </div>
              <Upload className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Notifications</p>
                <p className="text-2xl font-bold text-purple-600">
                  {notifications.length}
                </p>
              </div>
              <Bell className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Features</p>
                <p className="text-2xl font-bold text-blue-600">
                  {mobileFeatures.filter(f => f.isEnabled).length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Management */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Smartphone className="h-5 w-5 mr-2" />
                  Connected Devices
                </div>
                <Badge variant="secondary">{devices.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedDevice?.id === device.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  onClick={() => setSelectedDevice(device)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(device)}
                        <div className="relative">
                          <div className={`w-3 h-3 rounded-full ${device.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {!device.isOnline && <WifiOff className="absolute -top-1 -right-1 h-2 w-2 text-red-500" />}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {device.name}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <Badge className={getPlatformColor(device.platform)}>
                            {device.platform.toUpperCase()} {device.version}
                          </Badge>
                          <span>•</span>
                          <span>Last sync: {device.lastSync.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Battery Level */}
                      <div className="flex items-center space-x-1">
                        <Battery className={`h-4 w-4 ${device.batteryLevel > 20 ? 'text-green-600' : 'text-red-600'}`} />
                        <span className="text-sm text-gray-600">{device.batteryLevel}%</span>
                      </div>

                      {/* Storage */}
                      <div className="flex items-center space-x-1">
                        <Database className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-600">
                          {device.storageUsed.toFixed(1)}GB / {device.storageTotal}GB
                        </span>
                      </div>

                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Device Details */}
                  {selectedDevice?.id === device.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Permissions</p>
                          <div className="mt-1 space-y-1">
                            {Object.entries(device.permissions).map(([key, value]) => (
                              <div key={key} className="flex items-center space-x-1">
                                {value ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-red-500" />
                                )}
                                <span className="text-xs capitalize">{key}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {device.location && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Location</p>
                            <div className="mt-1">
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3 text-blue-500" />
                                <span className="text-xs">
                                  {device.location.latitude.toFixed(4)}, {device.location.longitude.toFixed(4)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">±{device.location.accuracy}m</p>
                            </div>
                          </div>
                        )}

                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
                          <div className="mt-1">
                            <div className="flex items-center space-x-1">
                              {device.isOnline ? (
                                <>
                                  <Wifi className="h-3 w-3 text-green-500" />
                                  <span className="text-xs text-green-600">Online</span>
                                </>
                              ) : (
                                <>
                                  <WifiOff className="h-3 w-3 text-red-500" />
                                  <span className="text-xs text-red-600">Offline</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Actions</p>
                          <div className="mt-1 flex space-x-1">
                            <Button variant="outline" size="sm">
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Bell className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Lock className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Offline Operations */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Database className="h-5 w-5 mr-2" />
                  Offline Operations
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {offlineOps.filter(op => op.status === 'pending').length} pending
                  </Badge>
                  {offlineOps.some(op => op.status === 'failed') && (
                    <Button variant="outline" size="sm" onClick={retryFailedOperations}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry Failed
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {offlineOps.map((operation) => (
                  <div
                    key={operation.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-1 rounded ${getStatusColor(operation.status)}`}>
                        {operation.status === 'completed' && <CheckCircle className="h-4 w-4" />}
                        {operation.status === 'pending' && <Clock className="h-4 w-4" />}
                        {operation.status === 'syncing' && <RefreshCw className="h-4 w-4 animate-spin" />}
                        {operation.status === 'failed' && <XCircle className="h-4 w-4" />}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {operation.type} {operation.entityType}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {operation.timestamp.toLocaleString()}
                          {operation.retryCount > 0 && ` • ${operation.retryCount} retries`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getStatusColor(operation.status)}`}
                      >
                        {operation.status}
                      </Badge>

                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}

                {offlineOps.length === 0 && (
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No offline operations
                    </p>
                    <p className="text-sm text-gray-500">
                      All data is synchronized
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Sync Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <RotateCcw className="h-5 w-5 mr-2" />
                Sync Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Connection</span>
                <div className="flex items-center space-x-2">
                  {syncStatus.isOnline ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ${syncStatus.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                    {syncStatus.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Last Sync</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {syncStatus.lastSync.toLocaleTimeString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                <Badge variant="outline">
                  {syncStatus.pendingOperations}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Version</span>
                <Badge variant="secondary">
                  {syncStatus.dataVersion}
                </Badge>
              </div>

              {syncStatus.syncInProgress && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Synchronizing...</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mobile Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Mobile Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mobileFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {feature.name}
                        </h4>
                        {feature.isEnabled ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-gray-400" />
                        )}
                      </div>

                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        {feature.description}
                      </p>

                      {feature.isEnabled && (
                        <div className="flex items-center space-x-3 text-xs text-gray-500">
                          <span>{feature.usage.activeUsers} users</span>
                          <span>•</span>
                          <span>{feature.usage.dailyEngagement.toFixed(1)}min avg</span>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFeature(feature.id)}
                      className={feature.isEnabled ? 'text-green-600' : 'text-gray-600'}
                    >
                      {feature.isEnabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-start space-x-2">
                      <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {notification.type.replace('_', ' ')}
                          </Badge>

                          {notification.sent && (
                            <span className="text-xs text-gray-500">
                              {notification.sent.toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="text-center py-4">
                    <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No notifications
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MobileAppIntegration;

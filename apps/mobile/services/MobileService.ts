'use client'

import { ReactNode } from 'react'

// Mobile Platform Core Types
export interface MobileDevice {
  id: string
  name: string
  os: 'iOS' | 'Android' | 'Web' | 'Desktop'
  version: string
  screenSize: ScreenSize
  capabilities: DeviceCapabilities
  isOnline: boolean
  batteryLevel?: number
  networkType: 'wifi' | '4g' | '5g' | 'offline'
  location?: GeolocationCoordinates
  lastActive: Date
  pushToken?: string
}

export interface ScreenSize {
  width: number
  height: number
  density: number
  isTablet: boolean
  orientation: 'portrait' | 'landscape'
}

export interface DeviceCapabilities {
  hasCamera: boolean
  hasGPS: boolean
  hasBiometrics: boolean
  hasNFC: boolean
  hasPushNotifications: boolean
  hasOfflineStorage: boolean
  maxStorageSize: number
  supportedFormats: string[]
}

export interface MobileApp {
  id: string
  name: string
  bundleId: string
  version: string
  platform: 'iOS' | 'Android' | 'PWA' | 'Universal'
  category: 'productivity' | 'social' | 'finance' | 'gaming' | 'utility' | 'health'
  icon: string
  screenshots: string[]
  description: string
  features: AppFeature[]
  rating: number
  downloads: number
  size: string
  lastUpdate: Date
  compatibility: PlatformCompatibility
  permissions: AppPermission[]
  offlineCapable: boolean
  pwaFeatures?: PWAFeatures
}

export interface AppFeature {
  id: string
  name: string
  description: string
  icon: string
  implemented: boolean
  category: 'core' | 'premium' | 'experimental'
}

export interface PlatformCompatibility {
  minIOSVersion?: string
  minAndroidVersion?: string
  supportedDevices: string[]
  requiresInternet: boolean
  supportedOrientations: ('portrait' | 'landscape')[]
}

export interface AppPermission {
  type: 'camera' | 'location' | 'notifications' | 'storage' | 'contacts' | 'microphone' | 'biometrics'
  required: boolean
  description: string
  purpose: string
}

export interface PWAFeatures {
  installable: boolean
  offlineSupport: boolean
  backgroundSync: boolean
  pushNotifications: boolean
  homeScreenIcon: boolean
  fullscreenMode: boolean
  splashScreen: boolean
}

export interface MobileExperience {
  id: string
  userId: string
  deviceId: string
  appId: string
  sessionId: string
  startTime: Date
  endTime?: Date
  duration: number
  interactions: UserInteraction[]
  performanceMetrics: PerformanceMetrics
  crashes: CrashReport[]
  feedback?: UserFeedback
  offlineTime: number
  dataUsage: DataUsage
}

export interface UserInteraction {
  id: string
  type: 'tap' | 'swipe' | 'pinch' | 'voice' | 'gesture' | 'keyboard'
  element: string
  timestamp: Date
  coordinates?: { x: number; y: number }
  duration: number
  value?: any
  context: string
}

export interface PerformanceMetrics {
  appLaunchTime: number
  memoryUsage: number
  cpuUsage: number
  batteryImpact: number
  networkRequests: number
  renderTime: number
  frameRate: number
  crashCount: number
  errorCount: number
}

export interface CrashReport {
  id: string
  timestamp: Date
  type: 'crash' | 'error' | 'warning'
  message: string
  stackTrace: string
  deviceInfo: MobileDevice
  appVersion: string
  resolved: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface UserFeedback {
  id: string
  rating: number
  comment: string
  category: 'bug' | 'feature' | 'performance' | 'ui' | 'other'
  timestamp: Date
  deviceInfo: MobileDevice
  appVersion: string
  helpful: number
}

export interface DataUsage {
  totalBytes: number
  wifiBytes: number
  cellularBytes: number
  uploadBytes: number
  downloadBytes: number
  cacheHits: number
  cacheMisses: number
}

export interface NotificationConfig {
  id: string
  title: string
  body: string
  icon?: string
  badge?: number
  sound?: string
  vibration?: number[]
  actions?: NotificationAction[]
  data?: any
  tags?: string[]
  scheduledTime?: Date
  priority: 'low' | 'default' | 'high'
  category: string
}

export interface NotificationAction {
  id: string
  title: string
  icon?: string
  type: 'button' | 'input'
  inputPlaceholder?: string
}

export interface OfflineSync {
  id: string
  dataType: string
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: Date
  synced: boolean
  retryCount: number
  lastAttempt?: Date
  priority: number
}

export interface MobileAnalytics {
  deviceMetrics: DeviceMetrics
  usageMetrics: UsageMetrics
  performanceMetrics: PerformanceMetrics
  engagementMetrics: EngagementMetrics
  conversionMetrics: ConversionMetrics
  retentionMetrics: RetentionMetrics
}

export interface DeviceMetrics {
  totalDevices: number
  activeDevices: number
  newDevices: number
  platformDistribution: Record<string, number>
  osVersionDistribution: Record<string, number>
  screenSizeDistribution: Record<string, number>
  topDeviceModels: Array<{ model: string; count: number; percentage: number }>
}

export interface UsageMetrics {
  totalSessions: number
  avgSessionDuration: number
  totalScreenTime: number
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  sessionFrequency: number
  timeInApp: Record<string, number>
}

export interface EngagementMetrics {
  averageRating: number
  reviewCount: number
  featureUsage: Record<string, number>
  userFlows: Array<{ flow: string; completionRate: number; avgTime: number }>
  heatmaps: Array<{ screen: string; interactions: Array<{ x: number; y: number; frequency: number }> }>
}

export interface ConversionMetrics {
  installToRegister: number
  registerToActive: number
  freeToPrerium: number
  goalCompletions: Record<string, number>
  funnelAnalysis: Array<{ step: string; users: number; dropoffRate: number }>
}

export interface RetentionMetrics {
  day1Retention: number
  day7Retention: number
  day30Retention: number
  cohortAnalysis: Array<{ cohort: string; retention: number[] }>
  churnPrediction: Array<{ userId: string; riskScore: number; factors: string[] }>
}

class MobileService {
  private baseUrl = 'http://localhost:4036'
  private wsUrl = 'ws://localhost:4036'
  private socket: WebSocket | null = null
  private deviceInfo: MobileDevice | null = null
  private currentSession: MobileExperience | null = null

  // Device Management
  async detectDevice(): Promise<MobileDevice> {
    try {
      const deviceData = {
        id: this.generateDeviceId(),
        name: this.getDeviceName(),
        os: this.detectOS(),
        version: this.getOSVersion(),
        screenSize: this.getScreenSize(),
        capabilities: await this.detectCapabilities(),
        isOnline: navigator.onLine,
        networkType: await this.getNetworkType(),
        lastActive: new Date(),
      }

      this.deviceInfo = deviceData
      await this.registerDevice(deviceData)
      return deviceData
    } catch (error) {
      console.error('Device detection failed:', error)
      throw error
    }
  }

  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getDeviceName(): string {
    const userAgent = navigator.userAgent
    if (/iPhone/.test(userAgent)) return 'iPhone'
    if (/iPad/.test(userAgent)) return 'iPad'
    if (/Android/.test(userAgent)) return 'Android Device'
    if (/Mac/.test(userAgent)) return 'Mac'
    if (/Windows/.test(userAgent)) return 'Windows PC'
    return 'Unknown Device'
  }

  private detectOS(): 'iOS' | 'Android' | 'Web' | 'Desktop' {
    const userAgent = navigator.userAgent
    if (/iPhone|iPad/.test(userAgent)) return 'iOS'
    if (/Android/.test(userAgent)) return 'Android'
    if (/Mobile/.test(userAgent)) return 'Web'
    return 'Desktop'
  }

  private getOSVersion(): string {
    const userAgent = navigator.userAgent
    const iosMatch = userAgent.match(/OS (\d+)_(\d+)/)
    if (iosMatch) return `${iosMatch[1]}.${iosMatch[2]}`

    const androidMatch = userAgent.match(/Android (\d+\.?\d*)/)
    if (androidMatch) return androidMatch[1]

    return 'Unknown'
  }

  private getScreenSize(): ScreenSize {
    return {
      width: window.screen.width,
      height: window.screen.height,
      density: window.devicePixelRatio || 1,
      isTablet: Math.min(window.screen.width, window.screen.height) >= 768,
      orientation: window.screen.width > window.screen.height ? 'landscape' : 'portrait'
    }
  }

  private async detectCapabilities(): Promise<DeviceCapabilities> {
    const capabilities: DeviceCapabilities = {
      hasCamera: false,
      hasGPS: false,
      hasBiometrics: false,
      hasNFC: false,
      hasPushNotifications: 'Notification' in window,
      hasOfflineStorage: 'serviceWorker' in navigator,
      maxStorageSize: await this.getStorageQuota(),
      supportedFormats: this.getSupportedFormats()
    }

    // Check for camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      capabilities.hasCamera = true
      stream.getTracks().forEach(track => track.stop())
    } catch (error) {
      capabilities.hasCamera = false
    }

    // Check for GPS
    capabilities.hasGPS = 'geolocation' in navigator

    // Check for biometrics (experimental)
    capabilities.hasBiometrics = 'credentials' in navigator && 'create' in navigator.credentials

    // Check for NFC (experimental)
    capabilities.hasNFC = 'nfc' in navigator

    return capabilities
  }

  private async getStorageQuota(): Promise<number> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return estimate.quota || 50 * 1024 * 1024 // Default 50MB
    }
    return 50 * 1024 * 1024
  }

  private getSupportedFormats(): string[] {
    const formats = []
    const video = document.createElement('video')
    const audio = document.createElement('audio')

    // Video formats
    if (video.canPlayType('video/mp4')) formats.push('mp4')
    if (video.canPlayType('video/webm')) formats.push('webm')
    if (video.canPlayType('video/ogg')) formats.push('ogg')

    // Audio formats
    if (audio.canPlayType('audio/mp3')) formats.push('mp3')
    if (audio.canPlayType('audio/wav')) formats.push('wav')
    if (audio.canPlayType('audio/ogg')) formats.push('ogg-audio')

    // Image formats
    formats.push('jpg', 'png', 'gif')
    if (this.supportsWebP()) formats.push('webp')
    if (this.supportsAVIF()) formats.push('avif')

    return formats
  }

  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
  }

  private supportsAVIF(): boolean {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0
  }

  private async getNetworkType(): Promise<'wifi' | '4g' | '5g' | 'offline'> {
    if (!navigator.onLine) return 'offline'

    // Try to use Network Information API if available
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    if (connection) {
      const type = connection.effectiveType
      if (type === '4g' || type === 'slow-2g' || type === '2g' || type === '3g') return '4g'
      if (type === '5g') return '5g'
    }

    return 'wifi' // Default assumption
  }

  // App Management
  async getApps(): Promise<MobileApp[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/mobile/apps`)
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch apps:', error)
      return []
    }
  }

  async getApp(appId: string): Promise<MobileApp | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/mobile/apps/${appId}`)
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch app:', error)
      return null
    }
  }

  async installApp(appId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/mobile/apps/${appId}/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: this.deviceInfo?.id })
      })
      return response.ok
    } catch (error) {
      console.error('App installation failed:', error)
      return false
    }
  }

  async launchApp(appId: string): Promise<MobileExperience> {
    try {
      const session: MobileExperience = {
        id: `session_${Date.now()}`,
        userId: 'current_user',
        deviceId: this.deviceInfo?.id || 'unknown',
        appId,
        sessionId: `${appId}_${Date.now()}`,
        startTime: new Date(),
        duration: 0,
        interactions: [],
        performanceMetrics: {
          appLaunchTime: 0,
          memoryUsage: 0,
          cpuUsage: 0,
          batteryImpact: 0,
          networkRequests: 0,
          renderTime: 0,
          frameRate: 60,
          crashCount: 0,
          errorCount: 0
        },
        crashes: [],
        offlineTime: 0,
        dataUsage: {
          totalBytes: 0,
          wifiBytes: 0,
          cellularBytes: 0,
          uploadBytes: 0,
          downloadBytes: 0,
          cacheHits: 0,
          cacheMisses: 0
        }
      }

      this.currentSession = session
      await this.startSessionTracking()
      return session
    } catch (error) {
      console.error('App launch failed:', error)
      throw error
    }
  }

  // Session & Analytics Tracking
  async startSessionTracking(): Promise<void> {
    if (!this.currentSession) return

    // Track performance metrics
    this.startPerformanceMonitoring()

    // Track user interactions
    this.startInteractionTracking()

    // Track network usage
    this.startNetworkTracking()

    // Send session data periodically
    setInterval(() => {
      this.syncSessionData()
    }, 30000) // Every 30 seconds
  }

  private startPerformanceMonitoring(): void {
    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memInfo = (performance as any).memory
        if (this.currentSession) {
          this.currentSession.performanceMetrics.memoryUsage = memInfo.usedJSHeapSize
        }
      }, 5000)
    }

    // Monitor frame rate
    let frames = 0
    let lastTime = performance.now()

    const countFrames = () => {
      frames++
      const currentTime = performance.now()
      if (currentTime >= lastTime + 1000) {
        if (this.currentSession) {
          this.currentSession.performanceMetrics.frameRate = frames
        }
        frames = 0
        lastTime = currentTime
      }
      requestAnimationFrame(countFrames)
    }
    requestAnimationFrame(countFrames)
  }

  private startInteractionTracking(): void {
    const trackInteraction = (type: string, event: Event) => {
      if (!this.currentSession) return

      const interaction: UserInteraction = {
        id: `interaction_${Date.now()}`,
        type: type as any,
        element: (event.target as HTMLElement)?.tagName || 'unknown',
        timestamp: new Date(),
        duration: 0,
        context: window.location.pathname
      }

      if (event instanceof MouseEvent || event instanceof TouchEvent) {
        const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0]?.clientX || 0
        const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0]?.clientY || 0
        interaction.coordinates = { x: clientX, y: clientY }
      }

      this.currentSession.interactions.push(interaction)
    }

    // Mouse/Touch events
    document.addEventListener('click', (e) => trackInteraction('tap', e))
    document.addEventListener('touchstart', (e) => trackInteraction('touch', e))
    document.addEventListener('keydown', (e) => trackInteraction('keyboard', e))
  }

  private startNetworkTracking(): void {
    // Track network requests
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const startTime = Date.now()
      try {
        const response = await originalFetch(...args)
        const endTime = Date.now()

        if (this.currentSession) {
          this.currentSession.performanceMetrics.networkRequests++
          // Estimate data usage (simplified)
          const estimatedSize = response.headers.get('content-length') || '1000'
          this.currentSession.dataUsage.downloadBytes += parseInt(estimatedSize)
          this.currentSession.dataUsage.totalBytes += parseInt(estimatedSize)
        }

        return response
      } catch (error) {
        if (this.currentSession) {
          this.currentSession.performanceMetrics.errorCount++
        }
        throw error
      }
    }
  }

  async syncSessionData(): Promise<void> {
    if (!this.currentSession) return

    try {
      await fetch(`${this.baseUrl}/api/mobile/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.currentSession)
      })
    } catch (error) {
      console.error('Session sync failed:', error)
    }
  }

  // Notifications
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false

    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  async sendNotification(config: NotificationConfig): Promise<boolean> {
    try {
      if (!('Notification' in window) || Notification.permission !== 'granted') {
        return false
      }

      const notification = new Notification(config.title, {
        body: config.body,
        icon: config.icon,
        badge: config.badge?.toString(),
        tag: config.id,
        data: config.data,
        silent: config.priority === 'low'
      })

      if (config.actions) {
        // Service Worker registration for action buttons
        await this.registerServiceWorker()
      }

      return true
    } catch (error) {
      console.error('Notification send failed:', error)
      return false
    }
  }

  // Offline Support
  async registerServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) return false

    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', registration)
      return true
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return false
    }
  }

  async enableOfflineMode(): Promise<boolean> {
    try {
      await this.registerServiceWorker()
      await this.precacheResources()
      return true
    } catch (error) {
      console.error('Offline mode setup failed:', error)
      return false
    }
  }

  private async precacheResources(): Promise<void> {
    if (!('caches' in window)) return

    const cache = await caches.open('mobile-app-v1')
    const urlsToCache = [
      '/',
      '/static/css/main.css',
      '/static/js/main.js',
      '/manifest.json'
    ]

    await cache.addAll(urlsToCache)
  }

  async queueOfflineAction(action: OfflineSync): Promise<void> {
    const offlineQueue = JSON.parse(localStorage.getItem('offlineQueue') || '[]')
    offlineQueue.push(action)
    localStorage.setItem('offlineQueue', JSON.stringify(offlineQueue))
  }

  async syncOfflineActions(): Promise<void> {
    const offlineQueue: OfflineSync[] = JSON.parse(localStorage.getItem('offlineQueue') || '[]')

    for (const action of offlineQueue) {
      try {
        await this.processOfflineAction(action)
        action.synced = true
      } catch (error) {
        action.retryCount++
        action.lastAttempt = new Date()
        console.error('Offline action sync failed:', error)
      }
    }

    const remainingQueue = offlineQueue.filter(action => !action.synced)
    localStorage.setItem('offlineQueue', JSON.stringify(remainingQueue))
  }

  private async processOfflineAction(action: OfflineSync): Promise<void> {
    const endpoint = `/api/mobile/sync/${action.dataType}`
    await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: action.action,
        data: action.data,
        timestamp: action.timestamp
      })
    })
  }

  // Analytics
  async getAnalytics(timeRange: '1d' | '7d' | '30d' = '7d'): Promise<MobileAnalytics> {
    try {
      const response = await fetch(`${this.baseUrl}/api/mobile/analytics?range=${timeRange}`)
      return await response.json()
    } catch (error) {
      console.error('Analytics fetch failed:', error)
      throw error
    }
  }

  async getUserFlows(): Promise<Array<{ flow: string; completionRate: number; avgTime: number }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/mobile/analytics/flows`)
      return await response.json()
    } catch (error) {
      console.error('User flows fetch failed:', error)
      return []
    }
  }

  // Biometric Authentication
  async authenticateWithBiometrics(): Promise<boolean> {
    if (!('credentials' in navigator)) return false

    try {
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: 'CodAI Mobile' },
          user: {
            id: new Uint8Array(16),
            name: 'user@example.com',
            displayName: 'User'
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required'
          }
        }
      })

      return !!credential
    } catch (error) {
      console.error('Biometric authentication failed:', error)
      return false
    }
  }

  // Real-time Communication
  connectWebSocket(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.wsUrl)

        this.socket.onopen = () => {
          console.log('Mobile WebSocket connected')
          resolve(this.socket!)
        }

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(error)
        }

        this.socket.onmessage = (event) => {
          this.handleWebSocketMessage(JSON.parse(event.data))
        }

        this.socket.onclose = () => {
          console.log('Mobile WebSocket disconnected')
          // Attempt reconnection
          setTimeout(() => this.connectWebSocket(), 5000)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'notification':
        this.sendNotification(message.data)
        break
      case 'app-update':
        this.handleAppUpdate(message.data)
        break
      case 'sync-request':
        this.syncOfflineActions()
        break
      default:
        console.log('Unknown WebSocket message:', message)
    }
  }

  private handleAppUpdate(updateData: any): void {
    // Handle app updates
    console.log('App update available:', updateData)
  }

  // Device Registration
  private async registerDevice(device: MobileDevice): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/mobile/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(device)
      })
    } catch (error) {
      console.error('Device registration failed:', error)
    }
  }

  // Battery Monitoring
  async getBatteryInfo(): Promise<{ level: number; charging: boolean } | null> {
    try {
      // @ts-ignore - Battery API is experimental
      const battery = await navigator.getBattery?.()
      if (battery) {
        return {
          level: Math.round(battery.level * 100),
          charging: battery.charging
        }
      }
      return null
    } catch (error) {
      console.error('Battery info not available:', error)
      return null
    }
  }

  // App Store Integration
  async checkForUpdates(): Promise<{ hasUpdates: boolean; version?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/mobile/updates`)
      return await response.json()
    } catch (error) {
      console.error('Update check failed:', error)
      return { hasUpdates: false }
    }
  }

  // Haptic Feedback
  async vibrate(pattern: number | number[]): Promise<void> {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }

  // Screen Wake Lock
  async keepScreenAwake(): Promise<void> {
    try {
      // @ts-ignore - Wake Lock API is experimental
      const wakeLock = await navigator.wakeLock?.request?.('screen')
      console.log('Screen wake lock acquired:', wakeLock)
    } catch (error) {
      console.error('Wake lock failed:', error)
    }
  }

  // File System Access
  async shareFile(file: File, title: string = 'Share File'): Promise<boolean> {
    try {
      if ('share' in navigator) {
        await (navigator as any).share({
          title,
          files: [file]
        })
        return true
      }
      return false
    } catch (error) {
      console.error('File sharing failed:', error)
      return false
    }
  }

  async shareText(text: string, title: string = 'Share'): Promise<boolean> {
    try {
      if ('share' in navigator) {
        await (navigator as any).share({
          title,
          text
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Text sharing failed:', error)
      return false
    }
  }

  // Cleanup
  disconnect(): void {
    if (this.socket) {
      this.socket.close()
      this.socket = null
    }

    if (this.currentSession) {
      this.currentSession.endTime = new Date()
      this.currentSession.duration = Date.now() - this.currentSession.startTime.getTime()
      this.syncSessionData()
      this.currentSession = null
    }
  }
}

export default new MobileService()

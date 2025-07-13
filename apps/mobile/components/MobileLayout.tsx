'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  Smartphone,
  Tablet,
  Monitor,
  Wifi,
  Battery,
  Signal,
  Download,
  Upload,
  Settings,
  Bell,
  Shield,
  Home,
  Grid3x3,
  Plus,
  User,
  Search,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Share,
  Star,
  Heart,
  MessageCircle,
  Bookmark,
  Play,
  Pause,
  VolumeX,
  Volume2,
  RotateCcw,
  RefreshCw,
  Zap,
  Globe,
  Camera,
  Mic,
  MapPin,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'

interface MobileLayoutProps {
  children: ReactNode
  deviceType?: 'mobile' | 'tablet' | 'desktop'
  orientation?: 'portrait' | 'landscape'
  showStatusBar?: boolean
  showNavigation?: boolean
  showTabBar?: boolean
  theme?: 'light' | 'dark' | 'auto'
  safeArea?: boolean
}

interface StatusBarProps {
  time?: string
  batteryLevel?: number
  signalStrength?: number
  wifiConnected?: boolean
  bluetoothConnected?: boolean
  carrier?: string
}

interface NavigationBarProps {
  title?: string
  showBack?: boolean
  showMenu?: boolean
  onBack?: () => void
  onMenu?: () => void
  rightActions?: Array<{
    icon: ReactNode
    label: string
    onClick: () => void
  }>
}

interface TabBarProps {
  tabs: Array<{
    id: string
    label: string
    icon: ReactNode
    badge?: number
    active?: boolean
    onClick: () => void
  }>
  activeTab?: string
}

interface FloatingActionButtonProps {
  icon: ReactNode
  onClick: () => void
  position?: 'bottom-right' | 'bottom-left' | 'center'
  size?: 'small' | 'medium' | 'large'
  color?: string
}

const StatusBar = ({
  time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  batteryLevel = 85,
  signalStrength = 4,
  wifiConnected = true,
  bluetoothConnected = false,
  carrier = 'CodAI'
}: StatusBarProps) => {
  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-400'
    if (level > 20) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getSignalBars = (strength: number) => {
    return Array.from({ length: 4 }, (_, index) => (
      <div
        key={index}
        className={`w-1 rounded-sm ${index < strength ? 'bg-white' : 'bg-gray-600'
          }`}
        style={{ height: `${4 + index * 2}px` }}
      />
    ))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-6 py-2 bg-black text-white text-sm font-medium"
    >
      {/* Left side - Time and Carrier */}
      <div className="flex items-center gap-2">
        <span className="font-mono">{time}</span>
        <span className="text-xs text-gray-400">{carrier}</span>
      </div>

      {/* Right side - Status icons */}
      <div className="flex items-center gap-3">
        {/* Signal strength */}
        <div className="flex items-end gap-0.5 h-4">
          {getSignalBars(signalStrength)}
        </div>

        {/* WiFi */}
        {wifiConnected && <Wifi className="w-4 h-4" />}

        {/* Bluetooth */}
        {bluetoothConnected && (
          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        )}

        {/* Battery */}
        <div className="flex items-center gap-1">
          <Battery className={`w-4 h-4 ${getBatteryColor(batteryLevel)}`} />
          <span className={`text-xs ${getBatteryColor(batteryLevel)}`}>
            {batteryLevel}%
          </span>
        </div>
      </div>
    </motion.div>
  )
}

const NavigationBar = ({
  title = 'Mobile',
  showBack = false,
  showMenu = true,
  onBack,
  onMenu,
  rightActions = []
}: NavigationBarProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-purple-900 to-blue-900 text-white"
    >
      {/* Left side */}
      <div className="flex items-center gap-3">
        {showBack && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
        )}

        {showMenu && !showBack && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onMenu}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
        )}

        <h1 className="text-lg font-semibold">{title}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {rightActions.map((action, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={action.onClick}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title={action.label}
          >
            {action.icon}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

const TabBar = ({ tabs, activeTab }: TabBarProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-around bg-black/80 backdrop-blur-lg border-t border-gray-800 text-white"
    >
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={tab.onClick}
          className={`flex flex-col items-center gap-1 p-3 min-w-0 flex-1 transition-colors ${activeTab === tab.id ? 'text-purple-400' : 'text-gray-400 hover:text-white'
            }`}
        >
          <div className="relative">
            {tab.icon}
            {tab.badge && tab.badge > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {tab.badge > 99 ? '99+' : tab.badge}
              </div>
            )}
          </div>
          <span className="text-xs truncate">{tab.label}</span>
        </motion.button>
      ))}
    </motion.div>
  )
}

const FloatingActionButton = ({
  icon,
  onClick,
  position = 'bottom-right',
  size = 'medium',
  color = 'bg-purple-500'
}: FloatingActionButtonProps) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6'
      case 'center':
        return 'bottom-6 left-1/2 transform -translate-x-1/2'
      case 'bottom-right':
      default:
        return 'bottom-6 right-6'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-12 h-12'
      case 'large':
        return 'w-16 h-16'
      case 'medium':
      default:
        return 'w-14 h-14'
    }
  }

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`fixed ${getPositionClasses()} ${getSizeClasses()} ${color} hover:${color}/80 text-white rounded-full shadow-lg flex items-center justify-center transition-all z-50`}
    >
      {icon}
    </motion.button>
  )
}

const DeviceFrame = ({
  children,
  deviceType = 'mobile',
  orientation = 'portrait'
}: {
  children: ReactNode
  deviceType?: 'mobile' | 'tablet' | 'desktop'
  orientation?: 'portrait' | 'landscape'
}) => {
  if (deviceType === 'desktop') {
    return <div className="w-full h-full">{children}</div>
  }

  const frameClasses = deviceType === 'tablet'
    ? orientation === 'landscape'
      ? 'w-full max-w-5xl h-[600px]'
      : 'w-full max-w-2xl h-[800px]'
    : orientation === 'landscape'
      ? 'w-full max-w-3xl h-[400px]'
      : 'w-full max-w-md h-[700px]'

  return (
    <div className={`${frameClasses} mx-auto bg-gray-900 rounded-[2rem] p-2 shadow-2xl`}>
      <div className="w-full h-full bg-black rounded-[1.5rem] overflow-hidden relative">
        {/* Device notch/camera (for mobile portrait) */}
        {deviceType === 'mobile' && orientation === 'portrait' && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-xl z-10" />
        )}

        {/* Home indicator (for modern mobile devices) */}
        {deviceType === 'mobile' && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full z-10" />
        )}

        {children}
      </div>
    </div>
  )
}

const AppGrid = ({
  apps,
  onAppClick,
  columns = 4
}: {
  apps: Array<{
    id: string
    name: string
    icon: ReactNode
    category: string
    installed: boolean
    size?: string
    rating?: number
  }>
  onAppClick: (appId: string) => void
  columns?: number
}) => {
  return (
    <div className={`grid grid-cols-${columns} gap-4 p-4`}>
      {apps.map((app, index) => (
        <motion.div
          key={app.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onAppClick(app.id)}
          className="flex flex-col items-center gap-2 p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            {app.icon}
          </div>
          <span className="text-xs text-center text-white truncate w-full">
            {app.name}
          </span>
          {!app.installed && (
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Download className="w-3 h-3" />
              Install
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

const MobileKeyboard = ({
  onKeyPress,
  onBackspace,
  onEnter,
  visible = false
}: {
  onKeyPress: (key: string) => void
  onBackspace: () => void
  onEnter: () => void
  visible?: boolean
}) => {
  const keyboardRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ]

  if (!visible) return null

  return (
    <motion.div
      initial={{ y: 300, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 300, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-50"
    >
      <div className="space-y-2">
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 justify-center">
            {rowIndex === 2 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onBackspace}
                className="flex-1 bg-gray-700 hover:bg-gray-600 rounded p-3 text-center font-medium transition-colors"
              >
                ⌫
              </motion.button>
            )}

            {row.map((key) => (
              <motion.button
                key={key}
                whileTap={{ scale: 0.95 }}
                onClick={() => onKeyPress(key)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 rounded p-3 text-center font-medium transition-colors uppercase"
              >
                {key}
              </motion.button>
            ))}

            {rowIndex === 2 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onEnter}
                className="flex-1 bg-blue-600 hover:bg-blue-500 rounded p-3 text-center font-medium transition-colors"
              >
                ↵
              </motion.button>
            )}
          </div>
        ))}

        {/* Space bar and additional keys */}
        <div className="flex gap-1">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onKeyPress('.')}
            className="bg-gray-700 hover:bg-gray-600 rounded p-3 px-6 text-center font-medium transition-colors"
          >
            .
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onKeyPress(' ')}
            className="flex-1 bg-gray-700 hover:bg-gray-600 rounded p-3 text-center font-medium transition-colors"
          >
            space
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onKeyPress('@')}
            className="bg-gray-700 hover:bg-gray-600 rounded p-3 px-6 text-center font-medium transition-colors"
          >
            @
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default function MobileLayout({
  children,
  deviceType = 'mobile',
  orientation = 'portrait',
  showStatusBar = true,
  showNavigation = true,
  showTabBar = true,
  theme = 'dark',
  safeArea = true
}: MobileLayoutProps) {
  const defaultTabs = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-5 h-5" />,
      active: true,
      onClick: () => console.log('Home clicked')
    },
    {
      id: 'apps',
      label: 'Apps',
      icon: <Grid3x3 className="w-5 h-5" />,
      badge: 3,
      onClick: () => console.log('Apps clicked')
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: <Activity className="w-5 h-5" />,
      onClick: () => console.log('Activity clicked')
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      onClick: () => console.log('Settings clicked')
    }
  ]

  const rightActions = [
    {
      icon: <Search className="w-5 h-5" />,
      label: 'Search',
      onClick: () => console.log('Search clicked')
    },
    {
      icon: <Bell className="w-5 h-5" />,
      label: 'Notifications',
      onClick: () => console.log('Notifications clicked')
    }
  ]

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <DeviceFrame deviceType={deviceType} orientation={orientation}>
        <div className="flex flex-col h-full">
          {/* Status Bar */}
          {showStatusBar && <StatusBar />}

          {/* Navigation Bar */}
          {showNavigation && (
            <NavigationBar
              title="Mobile Experience"
              rightActions={rightActions}
            />
          )}

          {/* Main Content */}
          <div className={`flex-1 overflow-auto ${safeArea ? 'safe-area-inset' : ''}`}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </div>

          {/* Tab Bar */}
          {showTabBar && (
            <TabBar tabs={defaultTabs} activeTab="home" />
          )}

          {/* Floating Action Button */}
          <FloatingActionButton
            icon={<Plus className="w-6 h-6" />}
            onClick={() => console.log('FAB clicked')}
          />
        </div>
      </DeviceFrame>
    </div>
  )
}

// Export additional components for use in other files
export {
  StatusBar,
  NavigationBar,
  TabBar,
  FloatingActionButton,
  DeviceFrame,
  AppGrid,
  MobileKeyboard
}

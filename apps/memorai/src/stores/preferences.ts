import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PreferencesState {
  language: 'en' | 'ro'
  timeFormat: '12h' | '24h'
  dateFormat: 'US' | 'EU' | 'ISO'
  notifications: {
    email: boolean
    push: boolean
    desktop: boolean
  }
  privacy: {
    analytics: boolean
    crashReporting: boolean
    usageData: boolean
  }
  appearance: {
    compactMode: boolean
    showTags: boolean
    cardSize: 'small' | 'medium' | 'large'
  }
}

interface PreferencesActions {
  setLanguage: (language: 'en' | 'ro') => void
  setTimeFormat: (format: '12h' | '24h') => void
  setDateFormat: (format: 'US' | 'EU' | 'ISO') => void
  updateNotifications: (notifications: Partial<PreferencesState['notifications']>) => void
  updatePrivacy: (privacy: Partial<PreferencesState['privacy']>) => void
  updateAppearance: (appearance: Partial<PreferencesState['appearance']>) => void
  resetPreferences: () => void
}

type PreferencesStore = PreferencesState & PreferencesActions

const defaultPreferences: PreferencesState = {
  language: 'en',
  timeFormat: '24h',
  dateFormat: 'ISO',
  notifications: {
    email: true,
    push: true,
    desktop: false
  },
  privacy: {
    analytics: true,
    crashReporting: true,
    usageData: false
  },
  appearance: {
    compactMode: false,
    showTags: true,
    cardSize: 'medium'
  }
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set, get) => ({
      ...defaultPreferences,
      
      setLanguage: (language) => {
        set({ language })
      },
      
      setTimeFormat: (timeFormat) => {
        set({ timeFormat })
      },
      
      setDateFormat: (dateFormat) => {
        set({ dateFormat })
      },
      
      updateNotifications: (notifications) => {
        set((state) => ({
          notifications: { ...state.notifications, ...notifications }
        }))
      },
      
      updatePrivacy: (privacy) => {
        set((state) => ({
          privacy: { ...state.privacy, ...privacy }
        }))
      },
      
      updateAppearance: (appearance) => {
        set((state) => ({
          appearance: { ...state.appearance, ...appearance }
        }))
      },
      
      resetPreferences: () => {
        set(defaultPreferences)
      }
    }),
    {
      name: 'memorai-preferences'
    }
  )
)
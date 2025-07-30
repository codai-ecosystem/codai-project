import { contextBridge, ipcRenderer } from 'electron'

/**
 * METU Electron Preload Script
 * 
 * Safely exposes Electron APIs to the renderer process while maintaining security.
 * This bridge allows the React app to interact with the main process.
 */

// Define the API interface
export interface ElectronAPI {
    // App information
    getVersion: () => Promise<string>
    getName: () => Promise<string>

    // Window controls
    minimizeWindow: () => Promise<void>
    maximizeWindow: () => Promise<void>
    closeWindow: () => Promise<void>

    // Permissions
    checkMicrophonePermission: () => Promise<boolean>

    // Voice engine communication
    sendVoiceStatus: (status: any) => void
    sendVoiceError: (error: string) => void
    onVoiceCommand: (callback: (command: string) => void) => void

    // Platform information
    platform: string
    isWindows: boolean
    isMacOS: boolean
    isLinux: boolean

    // Environment variables (safely exposed)
    env: {
        AZURE_OPENAI_API_KEY?: string
        AZURE_OPENAI_ENDPOINT?: string
        AZURE_OPENAI_GPT4O_DEPLOYMENT?: string
        ROMAI_AGI_ENDPOINT?: string
        ROMAI_AGI_API_KEY?: string
    }
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI: ElectronAPI = {
    // App information
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getName: () => ipcRenderer.invoke('app:getName'),

    // Window controls
    minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
    maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
    closeWindow: () => ipcRenderer.invoke('window:close'),

    // Permissions
    checkMicrophonePermission: () => ipcRenderer.invoke('permissions:microphone'),

    // Voice engine communication
    sendVoiceStatus: (status: any) => {
        ipcRenderer.send('voice:status', status)
    },
    sendVoiceError: (error: string) => {
        ipcRenderer.send('voice:error', error)
    },
    onVoiceCommand: (callback: (command: string) => void) => {
        ipcRenderer.on('voice-command', (_event, command) => callback(command))
    },

    // Platform information
    platform: process.platform,
    isWindows: process.platform === 'win32',
    isMacOS: process.platform === 'darwin',
    isLinux: process.platform === 'linux',

    // Environment variables (safely exposed)
    env: {
        AZURE_OPENAI_API_KEY: process.env.AZURE_OPENAI_API_KEY,
        AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
        AZURE_OPENAI_GPT4O_DEPLOYMENT: process.env.AZURE_OPENAI_GPT4O_DEPLOYMENT,
        ROMAI_AGI_ENDPOINT: process.env.ROMAI_AGI_ENDPOINT,
        ROMAI_AGI_API_KEY: process.env.ROMAI_AGI_API_KEY
    }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electronAPI', electronAPI)
        console.log('🔗 Electron API exposed via context bridge')
    } catch (error) {
        console.error('❌ Failed to expose Electron API:', error)
    }
} else {
    // Fallback for older Electron versions or when context isolation is disabled
    ; (window as any).electronAPI = electronAPI
    console.log('🔗 Electron API exposed globally (fallback)')
}

// Enhance security by removing node integration globals if they exist
delete (window as any).require
delete (window as any).exports
delete (window as any).module

console.log('🛡️ METU preload script loaded securely')

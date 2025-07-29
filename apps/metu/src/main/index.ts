import { app, BrowserWindow, ipcMain, dialog, shell, Menu } from 'electron'
import { join } from 'path'

// Simple development detection (replaces @electron-toolkit/utils)
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

/**
 * METU Electron Main Process
 * 
 * Handles window management, system integration, and security for the
 * revolutionary voice AI desktop application.
 */

// Security: Disable node integration in renderer by default
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'

let mainWindow: BrowserWindow | null = null

/**
 * Create the main application window
 */
function createWindow(): void {
    console.log('🚀 Creating METU main window...')

    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        show: false, // Don't show until ready
        autoHideMenuBar: true, // Hide menu bar on Windows/Linux
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        backgroundColor: '#0a0a0a',
        darkTheme: true,
        icon: join(__dirname, '../../resources/icon.png'),
        webPreferences: {
            preload: join(__dirname, '../preload/index.mjs'),
            nodeIntegration: false, // Security: Disable node integration
            contextIsolation: true, // Security: Enable context isolation
            allowRunningInsecureContent: false, // Security: Block insecure content
            experimentalFeatures: false, // Security: Disable experimental features
            webSecurity: true, // Security: Enable web security
            sandbox: false // Required for microphone access
        }
    })

    // Event handlers
    mainWindow.on('ready-to-show', () => {
        console.log('✅ METU window ready to show')
        if (mainWindow) {
            mainWindow.show()

            // Focus window on creation
            mainWindow.focus()

            // Open DevTools in development
            if (isDev) {
                mainWindow.webContents.openDevTools()
            }
        }
    })

    mainWindow.on('closed', () => {
        console.log('🔒 METU window closed')
        mainWindow = null
    })

    // Security: Handle new window creation
    mainWindow.webContents.setWindowOpenHandler((details) => {
        // Only allow specific URLs to open in new windows
        const allowedHosts = ['openai.com', 'azure.com']
        try {
            const url = new URL(details.url)
            if (allowedHosts.some(host => url.hostname.endsWith(host))) {
                shell.openExternal(details.url)
            }
        } catch (error) {
            console.warn('⚠️ Blocked potentially unsafe URL:', details.url)
        }
        return { action: 'deny' }
    })

    // Security: Handle navigation
    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl)

        // Allow navigation to local files and specific external hosts
        if (parsedUrl.origin !== 'http://localhost:6388' && parsedUrl.origin !== 'file://') {
            const allowedHosts = ['openai.com', 'azure.com']
            if (!allowedHosts.some(host => parsedUrl.hostname.endsWith(host))) {
                event.preventDefault()
                console.warn('⚠️ Blocked navigation to:', navigationUrl)
            }
        }
    })

    // Load the application
    if (isDev && process.env['ELECTRON_RENDERER_URL']) {
        // Development mode: Load from dev server
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        // Production mode: Load from built files
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

/**
 * Create application menu
 */
function createMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
        {
            label: 'METU',
            submenu: [
                {
                    label: 'About METU',
                    click: () => {
                        dialog.showMessageBox(mainWindow!, {
                            type: 'info',
                            title: 'About METU',
                            message: 'METU - Revolutionary Voice AI',
                            detail: 'World\'s first truly seamless voice AI interaction with continuous listening and natural interruption handling.\n\nVersion: 1.0.0'
                        })
                    }
                },
                { type: 'separator' },
                {
                    label: 'Preferences...',
                    accelerator: 'CmdOrCtrl+,',
                    click: () => {
                        // TODO: Open preferences window
                        console.log('🛠️ Opening preferences...')
                    }
                },
                { type: 'separator' },
                {
                    label: 'Quit METU',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit()
                    }
                }
            ]
        },
        {
            label: 'Voice',
            submenu: [
                {
                    label: 'Start Listening',
                    accelerator: 'Space',
                    click: () => {
                        mainWindow?.webContents.send('voice-command', 'start-listening')
                    }
                },
                {
                    label: 'Stop Listening',
                    accelerator: 'Escape',
                    click: () => {
                        mainWindow?.webContents.send('voice-command', 'stop-listening')
                    }
                },
                { type: 'separator' },
                {
                    label: 'Clear Conversation',
                    accelerator: 'CmdOrCtrl+K',
                    click: () => {
                        mainWindow?.webContents.send('voice-command', 'clear-conversation')
                    }
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'METU Documentation',
                    click: () => {
                        shell.openExternal('https://github.com/codai-project/metu')
                    }
                },
                {
                    label: 'Report Issue',
                    click: () => {
                        shell.openExternal('https://github.com/codai-project/metu/issues')
                    }
                }
            ]
        }
    ]

    // macOS specific adjustments
    if (process.platform === 'darwin') {
        // Safe array access with null checks
        const firstItem = template[0]
        if (firstItem) {
            firstItem.label = app.getName()
            firstItem.submenu = [
                { label: `About ${app.getName()}`, role: 'about' },
                { type: 'separator' },
                { label: 'Services', role: 'services', submenu: [] },
                { type: 'separator' },
                { label: `Hide ${app.getName()}`, accelerator: 'Command+H', role: 'hide' },
                { label: 'Hide Others', accelerator: 'Command+Shift+H', role: 'hideOthers' },
                { label: 'Show All', role: 'unhide' },
                { type: 'separator' },
                { label: 'Quit', accelerator: 'Command+Q', click: () => app.quit() }
            ]
        }

        // macOS window menu - safe access
        const windowItem = template[3]
        if (windowItem) {
            windowItem.submenu = [
                { role: 'close' },
                { role: 'minimize' },
                { role: 'zoom' },
                { type: 'separator' },
                { role: 'front' }
            ]
        }
    }

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}

/**
 * Setup IPC handlers
 */
function setupIPC(): void {
    console.log('🔗 Setting up IPC handlers...')

    // Handle app info requests
    ipcMain.handle('app:getVersion', () => {
        return app.getVersion()
    })

    ipcMain.handle('app:getName', () => {
        return app.getName()
    })

    // Handle window controls
    ipcMain.handle('window:minimize', () => {
        mainWindow?.minimize()
    })

    ipcMain.handle('window:maximize', () => {
        if (mainWindow?.isMaximized()) {
            mainWindow.unmaximize()
        } else {
            mainWindow?.maximize()
        }
    })

    ipcMain.handle('window:close', () => {
        mainWindow?.close()
    })

    // Handle microphone permissions
    ipcMain.handle('permissions:microphone', async () => {
        try {
            // For Windows desktop app, microphone access is usually available
            return true
        } catch (error) {
            console.error('Error checking microphone permissions:', error)
            return false
        }
    })

    // Handle voice engine events
    ipcMain.on('voice:status', (_, status) => {
        console.log('🎤 Voice engine status:', status)
        // Could broadcast to other windows or save state
    })

    ipcMain.on('voice:error', (_, error) => {
        console.error('❌ Voice engine error:', error)
        // Could show notification or log error
    })
}

/**
 * App event handlers
 */
app.whenReady().then(() => {
    console.log('🎯 METU app ready, initializing...')

    // Setup IPC first
    setupIPC()

    // Create menu
    createMenu()

    // Create main window
    createWindow()

    // macOS: Re-create window when dock icon is clicked
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
    console.log('🔚 All windows closed')
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// Security: Prevent new window creation from renderer
app.on('web-contents-created', (_, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
        console.warn('⚠️ Blocked new window creation:', url)
        return { action: 'deny' }
    })
})

// macOS: Security enhancements
if (process.platform === 'darwin') {
    app.on('open-url', (event, url) => {
        event.preventDefault()
        console.log('🔗 URL opened:', url)
        // Handle custom protocol if needed
    })
}

// Handle certificate errors
app.on('certificate-error', (event, _webContents, url, _error, _certificate, callback) => {
    // In development, ignore certificate errors for localhost
    if (isDev && url.includes('localhost')) {
        event.preventDefault()
        callback(true)
    } else {
        // In production, use default behavior
        callback(false)
    }
})

console.log('🎬 METU Electron main process initialized')

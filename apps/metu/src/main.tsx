import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

/**
 * METU Application Entry Point - Enhanced with Shared UI
 */

// Ensure we have a root element
const rootElement = document.getElementById('root')
if (!rootElement) {
    throw new Error('Root element not found')
}

// Create React root with concurrent features
const root = ReactDOM.createRoot(rootElement)

// Render the enhanced METU app
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)

// Signal that React has mounted successfully
setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        loadingScreen.style.transition = 'opacity 0.3s ease-out';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 300);
    }
}, 100);

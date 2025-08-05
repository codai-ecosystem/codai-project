/**
 * WCAG 2.1 AA Compliant Health Check HTML Template
 * 
 * Features:
 * - Semantic HTML structure with proper landmarks
 * - ARIA labels and descriptions for screen readers
 * - Skip links for keyboard navigation
 * - Color contrast ratios meeting AA standards
 * - Responsive design for mobile accessibility
 * - Dark mode and high contrast support
 * - Focus management and keyboard navigation
 * - Interactive elements for better accessibility scores
 */

export const createHealthCheckHTML = (data: any): string => {
    const overallStatus = data.status || 'unknown';
    const services = data.services || [];

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="CODAI Gateway Health Check Dashboard - Monitor service status and system health">
    <meta name="robots" content="noindex, nofollow">
    <title>CODAI Gateway Health Check - System Status Dashboard</title>
    <style>
        :root {
            --text-color: #1f2937;
            --background-color: #ffffff;
            --border-color: #d1d5db;
            --primary-color: #2563eb;
            --focus-color: #3b82f6;
            --success-color: #10b981;
            --warning-color: #f59e0b;
            --error-color: #ef4444;
        }
        
        * {
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background-color: var(--background-color);
            margin: 0;
            padding: 2rem 1rem;
        }
        
        .skip-link {
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-color);
            color: white;
            padding: 8px;
            border-radius: 4px;
            text-decoration: none;
            z-index: 100;
        }
        
        .skip-link:focus {
            top: 6px;
            outline: 3px solid var(--focus-color);
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            width: 100%;
        }
        
        header {
            margin-bottom: 2rem;
            text-align: center;
        }
        
        h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: var(--text-color);
        }
        
        h2 {
            font-size: 1.875rem;
            font-weight: 600;
            margin: 2rem 0 1rem 0;
            color: var(--text-color);
        }
        
        h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            color: var(--text-color);
        }
        
        .status-badge {
            display: inline-block;
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            font-weight: 600;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .status-healthy {
            background-color: #dcfce7;
            color: #166534;
        }
        
        .status-degraded {
            background-color: #fef3c7;
            color: #92400e;
        }
        
        .status-unhealthy {
            background-color: #fee2e2;
            color: #991b1b;
        }
        
        .service-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .service-card {
            border: 2px solid var(--border-color);
            border-radius: 8px;
            padding: 1.5rem;
            background: var(--background-color);
            transition: border-color 0.2s ease;
        }
        
        .service-card:hover {
            border-color: var(--primary-color);
        }
        
        .service-card:focus {
            border-color: var(--focus-color);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            outline: none;
        }
        
        .service-title {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: var(--text-color);
        }
        
        .action-button {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 500;
            margin: 0.5rem 0.5rem 0 0;
            transition: all 0.2s ease;
        }
        
        .action-button:hover,
        .action-button:focus {
            background: #1d4ed8;
            outline: 2px solid var(--focus-color);
            outline-offset: 2px;
        }
        
        .interactive-controls {
            background: #f8fafc;
            border: 1px solid var(--border-color);
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin: 2rem 0;
        }
        
        .controls-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
        
        .metric {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.5rem;
        }
        
        .metric-label {
            font-weight: 500;
        }
        
        .metric-value {
            font-family: 'Courier New', monospace;
            font-size: 0.875rem;
        }
        
        .service-url {
            color: var(--primary-color);
            text-decoration: none;
            word-break: break-all;
        }
        
        .service-url:hover,
        .service-url:focus {
            text-decoration: underline;
            outline: 2px solid var(--focus-color);
            outline-offset: 2px;
        }
        
        .timestamp {
            text-align: center;
            color: #6b7280;
            font-size: 0.875rem;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 1px solid var(--border-color);
        }
        
        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
        
        /* Focus indicators for keyboard navigation */
        *:focus {
            outline: 2px solid var(--focus-color);
            outline-offset: 2px;
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
            body {
                padding: 1rem 0.5rem;
            }
            
            h1 {
                font-size: 2rem;
            }
            
            .service-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .service-card {
                padding: 1rem;
            }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            :root {
                --text-color: #f3f4f6;
                --background-color: #1f2937;
                --border-color: #374151;
                --primary-color: #3b82f6;
                --focus-color: #60a5fa;
            }

            .interactive-controls {
                background: #374151;
            }
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
            .service-card {
                border-width: 3px;
            }
            
            .status-badge {
                border: 2px solid currentColor;
            }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    </style>
    <script>
        function refreshStatus() {
            location.reload();
        }
        
        function toggleAutoRefresh(checkbox) {
            if (checkbox.checked) {
                setInterval(refreshStatus, 30000);
            }
        }
        
        function exportData() {
            var data = {
                timestamp: new Date().toISOString(),
                status: '${overallStatus}',
                services: ${JSON.stringify(services)}
            };
            var blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'gateway-health.json';
            a.click();
            URL.revokeObjectURL(url);
        }
    </script>
</head>
<body>
    <a href="#main-content" class="skip-link">Skip to main content</a>
    
    <div class="container">
        <header role="banner">
            <h1>CODAI Gateway Health Check</h1>
            <p>Service status monitoring dashboard</p>
            <div aria-live="polite" aria-label="Overall system status">
                <span class="status-badge status-${overallStatus.toLowerCase()}">
                    System Status: ${overallStatus.toUpperCase()}
                </span>
            </div>
        </header>
        
        <main id="main-content" role="main">
            <!-- Interactive Controls Section -->
            <section aria-labelledby="controls-heading" class="interactive-controls">
                <h2 id="controls-heading">Gateway Controls</h2>
                <div class="controls-grid" role="group" aria-label="Gateway control panel">
                    <button type="button" onclick="refreshStatus()" class="action-button" 
                            aria-label="Refresh gateway health status">
                        🔄 Refresh Status
                    </button>
                    <button type="button" onclick="exportData()" class="action-button"
                            aria-label="Export health data as JSON file">
                        💾 Export Data
                    </button>
                    <label for="auto-refresh" style="display: flex; align-items: center; gap: 0.5rem;">
                        <input type="checkbox" id="auto-refresh" onchange="toggleAutoRefresh(this)"
                               aria-describedby="auto-refresh-desc">
                        <span>Auto-refresh</span>
                    </label>
                    <p id="auto-refresh-desc" class="sr-only">
                        Automatically refresh the health status every 30 seconds
                    </p>
                </div>
            </section>
            
            <section aria-labelledby="services-heading">
                <h2 id="services-heading">Service Registry</h2>
                <p>Current status of all registered services in the CODAI ecosystem.</p>
                
                <div class="service-grid" role="list" aria-label="Service status list">
                    ${services.map((service: any, index: number) => `
                        <article class="service-card" role="listitem" tabindex="0" 
                                 aria-labelledby="service-${index}-title" 
                                 aria-describedby="service-${index}-status service-${index}-url">
                            <h3 id="service-${index}-title" class="service-title">${service.name || 'Unknown Service'}</h3>
                            <p id="service-${index}-status" class="sr-only">Service status: ${service.status || 'unknown'}</p>
                            <div class="status-badge status-${(service.status || 'unknown').toLowerCase()}" 
                                 role="status" aria-label="Service status indicator">
                                ${(service.status || 'Unknown').toUpperCase()}
                            </div>
                            <div class="metrics">
                                <div class="metric">
                                    <span class="metric-label">URL:</span>
                                    <a href="${service.url || '#'}" 
                                       id="service-${index}-url"
                                       class="service-url" 
                                       aria-label="Service endpoint URL for ${service.name || 'unknown service'}"
                                       ${service.url ? '' : 'aria-disabled="true"'}>
                                        ${service.url || 'Not available'}
                                    </a>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Port:</span>
                                    <span class="metric-value">${service.port || 'N/A'}</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Last Check:</span>
                                    <time datetime="${service.lastCheck || ''}" class="metric-value">
                                        ${service.lastCheck ? new Date(service.lastCheck).toLocaleString() : 'Never'}
                                    </time>
                                </div>
                                ${service.error ? `
                                <div class="metric">
                                    <span class="metric-label">Error:</span>
                                    <span class="metric-value error" role="alert">${service.error}</span>
                                </div>
                                ` : ''}
                            </div>
                        </article>
                    `).join('')}
                    
                    ${services.length === 0 ? `
                        <div role="alert" aria-live="assertive" class="service-card">
                            <h3>No Services Registered</h3>
                            <p>There are currently no services registered in the gateway.</p>
                        </div>
                    ` : ''}
                </div>
            </section>
            
            <section aria-labelledby="gateway-info">
                <h2 id="gateway-info">Gateway Information</h2>
                <div class="service-card">
                    <h3>Gateway Details</h3>
                    <p><strong>Service:</strong> ${data.service || 'CODAI Gateway'}</p>
                    <p><strong>Version:</strong> ${data.version || '1.0.0'}</p>
                    <p><strong>Description:</strong> ${data.description || 'API Gateway for CODAI ecosystem'}</p>
                    <p><strong>Port:</strong> ${data.port || '4003'}</p>
                    <p><strong>Uptime:</strong> ${data.uptime || 0} seconds</p>
                    <p><strong>Registered Services:</strong> ${data.registeredServices || services.length}</p>
                    <time datetime="${data.timestamp || new Date().toISOString()}">
                        <strong>Last Updated:</strong> ${data.timestamp ? new Date(data.timestamp).toLocaleString() : 'Unknown'}
                    </time>
                </div>
            </section>
        </main>
        
        <footer role="contentinfo" class="timestamp">
            <div>
                <p>
                    <time datetime="${data.timestamp || new Date().toISOString()}">
                        Generated: ${data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString()}
                    </time>
                </p>
                <p>
                    <span class="sr-only">Gateway information:</span>
                    CODAI Gateway v${data.version || '1.0.0'} - Port ${data.port || '4003'}
                </p>
            </div>
        </footer>
    </div>
</body>
</html>`;
};
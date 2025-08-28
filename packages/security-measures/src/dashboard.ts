import { SecurityEvent, SecurityEventType, SecuritySeverity } from './types';

export class SecurityDashboard {
    constructor() { }

    async generateDashboardData(securityEvents: SecurityEvent[]): Promise<string> {
        const stats = this.calculateSecurityStats(securityEvents);
        const recentEvents = securityEvents
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 50);

        return this.generateHTML(stats, recentEvents);
    }

    private calculateSecurityStats(events: SecurityEvent[]) {
        const now = new Date();
        const last24Hours = events.filter(e =>
            (now.getTime() - e.timestamp.getTime()) < 86400000
        );
        const lastWeek = events.filter(e =>
            (now.getTime() - e.timestamp.getTime()) < 7 * 86400000
        );

        const severityCount = {
            critical: last24Hours.filter(e => e.severity === SecuritySeverity.CRITICAL).length,
            high: last24Hours.filter(e => e.severity === SecuritySeverity.HIGH).length,
            medium: last24Hours.filter(e => e.severity === SecuritySeverity.MEDIUM).length,
            low: last24Hours.filter(e => e.severity === SecuritySeverity.LOW).length
        };

        const eventTypeCount = Object.values(SecurityEventType).reduce((acc, type) => {
            acc[type] = last24Hours.filter(e => e.type === type).length;
            return acc;
        }, {} as Record<SecurityEventType, number>);

        const topSources = this.getTopSources(last24Hours);

        return {
            totalEvents: events.length,
            last24Hours: last24Hours.length,
            lastWeek: lastWeek.length,
            severityCount,
            eventTypeCount,
            topSources
        };
    }

    private getTopSources(events: SecurityEvent[], limit: number = 10) {
        const sourceCounts: Record<string, number> = {};

        events.forEach(event => {
            sourceCounts[event.source] = (sourceCounts[event.source] || 0) + 1;
        });

        return Object.entries(sourceCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([source, count]) => ({ source, count }));
    }

    private generateHTML(stats: any, recentEvents: SecurityEvent[]): string {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodAI Security Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .dashboard {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .stat-card h3 {
            font-size: 1.2rem;
            color: #333;
            margin-bottom: 10px;
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .stat-number.critical { color: #dc3545; }
        .stat-number.high { color: #fd7e14; }
        .stat-number.medium { color: #ffc107; }
        .stat-number.low { color: #28a745; }
        .stat-number.primary { color: #007bff; }
        
        .content {
            padding: 30px;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section h2 {
            font-size: 1.8rem;
            margin-bottom: 20px;
            color: #333;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
        }
        
        .events-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .events-table th {
            background: #007bff;
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 600;
        }
        
        .events-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #eee;
        }
        
        .events-table tr:hover {
            background: #f8f9fa;
        }
        
        .severity-badge {
            padding: 4px 8px;
            border-radius: 4px;
            color: white;
            font-size: 0.8rem;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .severity-critical { background: #dc3545; }
        .severity-high { background: #fd7e14; }
        .severity-medium { background: #ffc107; color: #333; }
        .severity-low { background: #28a745; }
        
        .event-type {
            font-family: monospace;
            background: #f1f3f4;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.9rem;
        }
        
        .timestamp {
            color: #666;
            font-size: 0.9rem;
        }
        
        .top-sources {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .source-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        
        .source-item:last-child {
            border-bottom: none;
        }
        
        .source-ip {
            font-family: monospace;
            font-weight: bold;
        }
        
        .source-count {
            background: #007bff;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.9rem;
        }
        
        .refresh-btn {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #007bff;
            color: white;
            border: none;
            padding: 15px 20px;
            border-radius: 50px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,123,255,0.3);
            font-size: 1rem;
            transition: transform 0.2s;
        }
        
        .refresh-btn:hover {
            transform: scale(1.05);
        }
        
        @media (max-width: 768px) {
            .dashboard {
                margin: 10px;
            }
            
            .stats-grid {
                grid-template-columns: 1fr;
                padding: 20px;
            }
            
            .content {
                padding: 20px;
            }
            
            .events-table {
                font-size: 0.9rem;
            }
            
            .events-table th,
            .events-table td {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>🛡️ CodAI Security Dashboard</h1>
            <p>Real-time security monitoring and threat detection</p>
            <p><small>Last updated: ${new Date().toLocaleString()}</small></p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Events</h3>
                <div class="stat-number primary">${stats.totalEvents}</div>
            </div>
            <div class="stat-card">
                <h3>Last 24 Hours</h3>
                <div class="stat-number primary">${stats.last24Hours}</div>
            </div>
            <div class="stat-card">
                <h3>Critical</h3>
                <div class="stat-number critical">${stats.severityCount.critical}</div>
            </div>
            <div class="stat-card">
                <h3>High</h3>
                <div class="stat-number high">${stats.severityCount.high}</div>
            </div>
            <div class="stat-card">
                <h3>Medium</h3>
                <div class="stat-number medium">${stats.severityCount.medium}</div>
            </div>
            <div class="stat-card">
                <h3>Low</h3>
                <div class="stat-number low">${stats.severityCount.low}</div>
            </div>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>📊 Event Types (Last 24 Hours)</h2>
                <div class="stats-grid">
                    ${Object.entries(stats.eventTypeCount)
                .filter(([, count]) => count > 0)
                .map(([type, count]) => `
                        <div class="stat-card">
                            <h3>${type.replace(/_/g, ' ').toUpperCase()}</h3>
                            <div class="stat-number primary">${count}</div>
                        </div>
                      `).join('')}
                </div>
            </div>
            
            <div class="section">
                <h2>🌍 Top Sources</h2>
                <div class="top-sources">
                    ${stats.topSources.map((source: any) => `
                        <div class="source-item">
                            <span class="source-ip">${source.source}</span>
                            <span class="source-count">${source.count}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="section">
                <h2>🚨 Recent Security Events</h2>
                <table class="events-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Type</th>
                            <th>Severity</th>
                            <th>Source</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recentEvents.map(event => `
                            <tr>
                                <td class="timestamp">${event.timestamp.toLocaleString()}</td>
                                <td><span class="event-type">${event.type}</span></td>
                                <td><span class="severity-badge severity-${event.severity}">${event.severity}</span></td>
                                <td class="source-ip">${event.source}</td>
                                <td>${event.description}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    
    <button class="refresh-btn" onclick="window.location.reload()">
        🔄 Refresh
    </button>
    
    <script>
        // Auto-refresh every 30 seconds
        setTimeout(() => {
            window.location.reload();
        }, 30000);
        
        // Add click handlers for interactive elements
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('click', () => {
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.style.transform = 'scale(1)';
                }, 100);
            });
        });
    </script>
</body>
</html>`;
    }
}
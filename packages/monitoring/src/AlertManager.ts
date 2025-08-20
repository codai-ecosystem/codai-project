import { EventEmitter } from 'events';
import nodemailer from 'nodemailer';
import { WebSocketServer, WebSocket } from 'ws';
import cron from 'node-cron';
import { monitoringSystem, Alert } from './MonitoringSystem';

/**
 * Advanced Alert Management System for MemorAI Platform
 * 
 * Features:
 * - Multiple notification channels (email, webhooks, WebSocket)
 * - Alert escalation rules
 * - Alert grouping and deduplication
 * - Scheduled alert reports
 * - Integration with external systems
 */

interface AlertRule {
    id: string;
    name: string;
    condition: {
        metric: string;
        operator: '>' | '<' | '=' | '!=' | '>=' | '<=';
        threshold: number;
        duration: number; // Duration in seconds
    };
    severity: 'info' | 'warning' | 'critical';
    enabled: boolean;
    channels: string[]; // Notification channels
    escalation?: {
        after: number; // Escalate after X minutes
        to: string[];   // Escalation channels
    };
    throttle?: {
        period: number; // Throttle period in minutes
        maxAlerts: number; // Max alerts per period
    };
}

interface NotificationChannel {
    id: string;
    name: string;
    type: 'email' | 'webhook' | 'websocket' | 'slack' | 'teams';
    config: Record<string, any>;
    enabled: boolean;
}

interface AlertEscalation {
    alertId: string;
    level: number;
    scheduledAt: number;
    executed: boolean;
}

interface AlertGroup {
    id: string;
    title: string;
    alerts: Alert[];
    createdAt: number;
    updatedAt: number;
    status: 'active' | 'resolved';
}

class AlertManager extends EventEmitter {
    private rules = new Map<string, AlertRule>();
    private channels = new Map<string, NotificationChannel>();
    private escalations: AlertEscalation[] = [];
    private alertGroups = new Map<string, AlertGroup>();
    private alertThrottles = new Map<string, { count: number; resetAt: number }>();
    private wsServer?: WebSocketServer;
    private emailTransporter?: nodemailer.Transporter;
    private cronJobs: cron.ScheduledTask[] = [];

    constructor() {
        super();
        this.setupDefaultChannels();
        this.setupDefaultRules();
        this.startEscalationProcessor();
        this.startReports();
        this.listenToMonitoringEvents();
    }

    /**
     * Setup default notification channels
     */
    private setupDefaultChannels(): void {
        // Email channel
        const emailConfig = {
            host: process.env.SMTP_HOST || 'localhost',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        };

        if (emailConfig.auth.user && emailConfig.auth.pass) {
            this.emailTransporter = nodemailer.createTransporter(emailConfig);

            this.addChannel({
                id: 'email-default',
                name: 'Default Email',
                type: 'email',
                enabled: true,
                config: {
                    to: process.env.ALERT_EMAIL || 'admin@memorai.com',
                    from: process.env.SMTP_FROM || 'alerts@memorai.com'
                }
            });
        }

        // WebSocket channel for real-time alerts
        this.addChannel({
            id: 'websocket-realtime',
            name: 'Real-time WebSocket',
            type: 'websocket',
            enabled: true,
            config: {
                port: parseInt(process.env.WEBSOCKET_PORT || '8080')
            }
        });

        // Webhook channel for external integrations
        this.addChannel({
            id: 'webhook-default',
            name: 'Default Webhook',
            type: 'webhook',
            enabled: true,
            config: {
                url: process.env.WEBHOOK_URL || 'http://localhost:3000/alerts',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.WEBHOOK_TOKEN || 'default-token'}`
                }
            }
        });

        console.log('[AlertManager] Default notification channels configured');
    }

    /**
     * Setup default alert rules
     */
    private setupDefaultRules(): void {
        // High CPU usage rule
        this.addRule({
            id: 'high-cpu-usage',
            name: 'High CPU Usage',
            condition: {
                metric: 'cpu_usage',
                operator: '>',
                threshold: 80,
                duration: 300 // 5 minutes
            },
            severity: 'warning',
            enabled: true,
            channels: ['email-default', 'websocket-realtime'],
            escalation: {
                after: 15, // Escalate after 15 minutes
                to: ['webhook-default']
            },
            throttle: {
                period: 30, // 30 minutes
                maxAlerts: 3
            }
        });

        // High memory usage rule
        this.addRule({
            id: 'high-memory-usage',
            name: 'High Memory Usage',
            condition: {
                metric: 'memory_usage',
                operator: '>',
                threshold: 85,
                duration: 180 // 3 minutes
            },
            severity: 'critical',
            enabled: true,
            channels: ['email-default', 'websocket-realtime', 'webhook-default']
        });

        // Service unhealthy rule
        this.addRule({
            id: 'service-unhealthy',
            name: 'Service Unhealthy',
            condition: {
                metric: 'service_health',
                operator: '=',
                threshold: 0, // 0 = unhealthy
                duration: 60 // 1 minute
            },
            severity: 'critical',
            enabled: true,
            channels: ['email-default', 'websocket-realtime', 'webhook-default'],
            escalation: {
                after: 5, // Escalate after 5 minutes
                to: ['webhook-default']
            }
        });

        // High error rate rule
        this.addRule({
            id: 'high-error-rate',
            name: 'High Error Rate',
            condition: {
                metric: 'error_rate',
                operator: '>',
                threshold: 5, // 5% error rate
                duration: 300 // 5 minutes
            },
            severity: 'warning',
            enabled: true,
            channels: ['email-default', 'websocket-realtime']
        });

        console.log('[AlertManager] Default alert rules configured');
    }

    /**
     * Listen to monitoring system events
     */
    private listenToMonitoringEvents(): void {
        monitoringSystem.on('alert', (alert: Alert) => {
            this.processAlert(alert);
        });

        monitoringSystem.on('log', (logEntry) => {
            if (logEntry.level === 'critical' || logEntry.level === 'error') {
                this.evaluateLogAlert(logEntry);
            }
        });

        console.log('[AlertManager] Listening to monitoring events');
    }

    /**
     * Add a new alert rule
     */
    addRule(rule: AlertRule): void {
        this.rules.set(rule.id, rule);
        console.log(`[AlertManager] Added alert rule: ${rule.name}`);
    }

    /**
     * Remove an alert rule
     */
    removeRule(ruleId: string): boolean {
        const removed = this.rules.delete(ruleId);
        if (removed) {
            console.log(`[AlertManager] Removed alert rule: ${ruleId}`);
        }
        return removed;
    }

    /**
     * Add a notification channel
     */
    addChannel(channel: NotificationChannel): void {
        this.channels.set(channel.id, channel);

        // Initialize WebSocket server if needed
        if (channel.type === 'websocket' && !this.wsServer) {
            this.initializeWebSocketServer(channel.config.port);
        }

        console.log(`[AlertManager] Added notification channel: ${channel.name}`);
    }

    /**
     * Process an alert through the alert management pipeline
     */
    private async processAlert(alert: Alert): Promise<void> {
        try {
            // Check if alert should be throttled
            if (this.isThrottled(alert)) {
                console.log(`[AlertManager] Alert throttled: ${alert.title}`);
                return;
            }

            // Group similar alerts
            const group = this.groupAlert(alert);

            // Send notifications
            await this.sendNotifications(alert);

            // Schedule escalation if configured
            this.scheduleEscalation(alert);

            // Update throttle counters
            this.updateThrottle(alert);

            console.log(`[AlertManager] Processed alert: ${alert.title}`);

        } catch (error) {
            console.error('[AlertManager] Error processing alert:', error);
            monitoringSystem.log('error', 'AlertManager', 'Failed to process alert', { alertId: alert.id }, error as Error);
        }
    }

    /**
     * Send notifications through configured channels
     */
    private async sendNotifications(alert: Alert): Promise<void> {
        const applicableRules = this.getApplicableRules(alert);
        const channelIds = new Set<string>();

        // Collect all channels from applicable rules
        applicableRules.forEach(rule => {
            rule.channels.forEach(channelId => channelIds.add(channelId));
        });

        // Send to each channel
        for (const channelId of channelIds) {
            const channel = this.channels.get(channelId);
            if (channel && channel.enabled) {
                try {
                    await this.sendToChannel(alert, channel);
                } catch (error) {
                    console.error(`[AlertManager] Failed to send to channel ${channelId}:`, error);
                }
            }
        }
    }

    /**
     * Send alert to specific channel
     */
    private async sendToChannel(alert: Alert, channel: NotificationChannel): Promise<void> {
        switch (channel.type) {
            case 'email':
                await this.sendEmailAlert(alert, channel);
                break;

            case 'webhook':
                await this.sendWebhookAlert(alert, channel);
                break;

            case 'websocket':
                await this.sendWebSocketAlert(alert, channel);
                break;

            case 'slack':
                await this.sendSlackAlert(alert, channel);
                break;

            case 'teams':
                await this.sendTeamsAlert(alert, channel);
                break;

            default:
                console.warn(`[AlertManager] Unknown channel type: ${channel.type}`);
        }
    }

    /**
     * Send email alert
     */
    private async sendEmailAlert(alert: Alert, channel: NotificationChannel): Promise<void> {
        if (!this.emailTransporter) {
            throw new Error('Email transporter not configured');
        }

        const subject = `[${alert.level.toUpperCase()}] ${alert.title}`;
        const html = this.generateEmailHTML(alert);

        await this.emailTransporter.sendMail({
            from: channel.config.from,
            to: channel.config.to,
            subject,
            html
        });

        console.log(`[AlertManager] Email sent for alert: ${alert.title}`);
    }

    /**
     * Send webhook alert
     */
    private async sendWebhookAlert(alert: Alert, channel: NotificationChannel): Promise<void> {
        const payload = {
            alert,
            timestamp: Date.now(),
            source: 'memorai-platform'
        };

        const response = await fetch(channel.config.url, {
            method: channel.config.method || 'POST',
            headers: channel.config.headers || { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Webhook failed with status: ${response.status}`);
        }

        console.log(`[AlertManager] Webhook sent for alert: ${alert.title}`);
    }

    /**
     * Send WebSocket alert
     */
    private async sendWebSocketAlert(alert: Alert, channel: NotificationChannel): Promise<void> {
        if (!this.wsServer) {
            return;
        }

        const payload = JSON.stringify({
            type: 'alert',
            data: alert,
            timestamp: Date.now()
        });

        this.wsServer.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        });

        console.log(`[AlertManager] WebSocket broadcast for alert: ${alert.title}`);
    }

    /**
     * Send Slack alert (placeholder)
     */
    private async sendSlackAlert(alert: Alert, channel: NotificationChannel): Promise<void> {
        // Implementation would depend on Slack webhook URL or API
        console.log(`[AlertManager] Slack alert: ${alert.title}`);
    }

    /**
     * Send Teams alert (placeholder)
     */
    private async sendTeamsAlert(alert: Alert, channel: NotificationChannel): Promise<void> {
        // Implementation would depend on Teams webhook URL
        console.log(`[AlertManager] Teams alert: ${alert.title}`);
    }

    /**
     * Initialize WebSocket server for real-time alerts
     */
    private initializeWebSocketServer(port: number): void {
        this.wsServer = new WebSocketServer({ port });

        this.wsServer.on('connection', (ws) => {
            console.log('[AlertManager] WebSocket client connected');

            // Send current alert status
            ws.send(JSON.stringify({
                type: 'status',
                data: {
                    activeAlerts: monitoringSystem.getActiveAlerts(),
                    timestamp: Date.now()
                }
            }));

            ws.on('close', () => {
                console.log('[AlertManager] WebSocket client disconnected');
            });
        });

        console.log(`[AlertManager] WebSocket server started on port ${port}`);
    }

    /**
     * Generate HTML for email alerts
     */
    private generateEmailHTML(alert: Alert): string {
        const levelColors = {
            info: '#2196F3',
            warning: '#FF9800',
            critical: '#F44336'
        };

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .alert-container { border-left: 4px solid ${levelColors[alert.level]}; padding: 20px; background: #f9f9f9; }
                .alert-title { color: ${levelColors[alert.level]}; font-size: 20px; font-weight: bold; margin-bottom: 10px; }
                .alert-description { font-size: 16px; margin-bottom: 15px; }
                .alert-details { background: white; padding: 15px; border-radius: 4px; }
                .metadata { font-family: monospace; background: #f0f0f0; padding: 10px; border-radius: 4px; }
            </style>
        </head>
        <body>
            <div class="alert-container">
                <div class="alert-title">${alert.title}</div>
                <div class="alert-description">${alert.description}</div>
                <div class="alert-details">
                    <p><strong>Service:</strong> ${alert.service}</p>
                    <p><strong>Level:</strong> ${alert.level.toUpperCase()}</p>
                    <p><strong>Time:</strong> ${new Date(alert.timestamp).toISOString()}</p>
                    ${alert.metadata ? `<p><strong>Metadata:</strong></p><div class="metadata">${JSON.stringify(alert.metadata, null, 2)}</div>` : ''}
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Group similar alerts together
     */
    private groupAlert(alert: Alert): AlertGroup {
        const groupKey = `${alert.service}-${alert.title}`;
        let group = this.alertGroups.get(groupKey);

        if (!group) {
            group = {
                id: groupKey,
                title: `${alert.service}: ${alert.title}`,
                alerts: [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
                status: 'active'
            };
            this.alertGroups.set(groupKey, group);
        }

        group.alerts.push(alert);
        group.updatedAt = Date.now();

        return group;
    }

    /**
     * Check if alert should be throttled
     */
    private isThrottled(alert: Alert): boolean {
        const rules = this.getApplicableRules(alert);

        for (const rule of rules) {
            if (rule.throttle) {
                const throttleKey = `${rule.id}-${alert.service}`;
                const throttle = this.alertThrottles.get(throttleKey);

                if (throttle) {
                    if (Date.now() < throttle.resetAt) {
                        if (throttle.count >= rule.throttle.maxAlerts) {
                            return true;
                        }
                    } else {
                        // Reset throttle period
                        this.alertThrottles.delete(throttleKey);
                    }
                }
            }
        }

        return false;
    }

    /**
     * Update throttle counters
     */
    private updateThrottle(alert: Alert): void {
        const rules = this.getApplicableRules(alert);

        for (const rule of rules) {
            if (rule.throttle) {
                const throttleKey = `${rule.id}-${alert.service}`;
                const existing = this.alertThrottles.get(throttleKey);

                if (existing && Date.now() < existing.resetAt) {
                    existing.count++;
                } else {
                    this.alertThrottles.set(throttleKey, {
                        count: 1,
                        resetAt: Date.now() + (rule.throttle.period * 60 * 1000)
                    });
                }
            }
        }
    }

    /**
     * Get applicable rules for an alert
     */
    private getApplicableRules(alert: Alert): AlertRule[] {
        return Array.from(this.rules.values()).filter(rule => {
            return rule.enabled && rule.severity === alert.level;
        });
    }

    /**
     * Schedule alert escalation
     */
    private scheduleEscalation(alert: Alert): void {
        const rules = this.getApplicableRules(alert);

        for (const rule of rules) {
            if (rule.escalation) {
                const escalation: AlertEscalation = {
                    alertId: alert.id,
                    level: 1,
                    scheduledAt: Date.now() + (rule.escalation.after * 60 * 1000),
                    executed: false
                };

                this.escalations.push(escalation);
                console.log(`[AlertManager] Escalation scheduled for alert: ${alert.title}`);
            }
        }
    }

    /**
     * Start escalation processor
     */
    private startEscalationProcessor(): void {
        setInterval(() => {
            this.processEscalations();
        }, 60000); // Check every minute

        console.log('[AlertManager] Escalation processor started');
    }

    /**
     * Process due escalations
     */
    private async processEscalations(): Promise<void> {
        const now = Date.now();
        const dueEscalations = this.escalations.filter(e =>
            !e.executed && e.scheduledAt <= now
        );

        for (const escalation of dueEscalations) {
            try {
                // Find the original alert
                const alerts = monitoringSystem.getActiveAlerts();
                const alert = alerts.find(a => a.id === escalation.alertId);

                if (alert && !alert.resolved) {
                    // Send escalated notifications
                    const rules = this.getApplicableRules(alert);
                    for (const rule of rules) {
                        if (rule.escalation) {
                            for (const channelId of rule.escalation.to) {
                                const channel = this.channels.get(channelId);
                                if (channel && channel.enabled) {
                                    await this.sendToChannel({
                                        ...alert,
                                        title: `[ESCALATED] ${alert.title}`,
                                        description: `ESCALATED: ${alert.description}`
                                    }, channel);
                                }
                            }
                        }
                    }

                    escalation.executed = true;
                    console.log(`[AlertManager] Executed escalation for alert: ${alert.title}`);
                }
            } catch (error) {
                console.error('[AlertManager] Error processing escalation:', error);
            }
        }

        // Clean up old executed escalations
        this.escalations = this.escalations.filter(e =>
            !e.executed || (now - e.scheduledAt) < 24 * 60 * 60 * 1000 // Keep for 24 hours
        );
    }

    /**
     * Start scheduled reports
     */
    private startReports(): void {
        // Daily summary report at 8 AM
        const dailyReport = cron.schedule('0 8 * * *', () => {
            this.generateDailyReport();
        }, { scheduled: false });

        // Weekly report on Mondays at 9 AM
        const weeklyReport = cron.schedule('0 9 * * 1', () => {
            this.generateWeeklyReport();
        }, { scheduled: false });

        dailyReport.start();
        weeklyReport.start();

        this.cronJobs.push(dailyReport, weeklyReport);
        console.log('[AlertManager] Scheduled reports configured');
    }

    /**
     * Generate daily alert report
     */
    private async generateDailyReport(): Promise<void> {
        const yesterday = Date.now() - 24 * 60 * 60 * 1000;
        const alerts = monitoringSystem.getLogs({
            timeRange: { start: yesterday, end: Date.now() }
        }).filter(log => log.level === 'error' || log.level === 'warn');

        // Send report via email
        if (this.emailTransporter) {
            const emailChannel = this.channels.get('email-default');
            if (emailChannel) {
                // Generate report content
                const reportHtml = this.generateReportHTML('Daily Alert Report', alerts);

                await this.emailTransporter.sendMail({
                    from: emailChannel.config.from,
                    to: emailChannel.config.to,
                    subject: 'MemorAI Daily Alert Report',
                    html: reportHtml
                });
            }
        }

        console.log('[AlertManager] Daily report generated');
    }

    /**
     * Generate weekly alert report
     */
    private async generateWeeklyReport(): Promise<void> {
        const lastWeek = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const logs = monitoringSystem.getLogs({
            timeRange: { start: lastWeek, end: Date.now() }
        });

        // Generate comprehensive weekly stats
        const stats = {
            totalLogs: logs.length,
            errors: logs.filter(l => l.level === 'error').length,
            warnings: logs.filter(l => l.level === 'warn').length,
            criticals: logs.filter(l => l.level === 'critical').length,
            serviceStats: this.generateServiceStats(logs),
            topErrors: this.getTopErrors(logs)
        };

        console.log('[AlertManager] Weekly report generated:', stats);
    }

    /**
     * Generate service statistics
     */
    private generateServiceStats(logs: any[]): Record<string, number> {
        const stats: Record<string, number> = {};
        logs.forEach(log => {
            stats[log.service] = (stats[log.service] || 0) + 1;
        });
        return stats;
    }

    /**
     * Get top errors from logs
     */
    private getTopErrors(logs: any[]): Array<{ message: string; count: number }> {
        const errorCounts: Record<string, number> = {};

        logs.filter(l => l.level === 'error').forEach(log => {
            errorCounts[log.message] = (errorCounts[log.message] || 0) + 1;
        });

        return Object.entries(errorCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([message, count]) => ({ message, count }));
    }

    /**
     * Generate report HTML
     */
    private generateReportHTML(title: string, data: any[]): string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .report-header { background: #f0f0f0; padding: 20px; border-radius: 4px; margin-bottom: 20px; }
                .stats { display: flex; gap: 20px; margin-bottom: 20px; }
                .stat-card { background: white; padding: 15px; border-radius: 4px; border: 1px solid #ddd; flex: 1; }
                .log-entry { padding: 10px; border-bottom: 1px solid #eee; }
                .error { background: #ffebee; }
                .warning { background: #fff3e0; }
                .critical { background: #fce4ec; }
            </style>
        </head>
        <body>
            <div class="report-header">
                <h1>${title}</h1>
                <p>Generated on: ${new Date().toISOString()}</p>
            </div>
            <div class="stats">
                <div class="stat-card">
                    <h3>Total Events</h3>
                    <p>${data.length}</p>
                </div>
                <div class="stat-card">
                    <h3>Errors</h3>
                    <p>${data.filter(d => d.level === 'error').length}</p>
                </div>
                <div class="stat-card">
                    <h3>Warnings</h3>
                    <p>${data.filter(d => d.level === 'warn').length}</p>
                </div>
            </div>
            <div>
                <h2>Recent Events</h2>
                ${data.slice(0, 20).map(log => `
                    <div class="log-entry ${log.level}">
                        <strong>${new Date(log.timestamp).toLocaleString()}</strong> - 
                        ${log.service}: ${log.message}
                    </div>
                `).join('')}
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Evaluate log entries for alert conditions
     */
    private evaluateLogAlert(logEntry: any): void {
        // This would implement logic to check if log entries match alert conditions
        // For now, just create alerts for critical logs
        if (logEntry.level === 'critical') {
            const alertId = monitoringSystem.createAlert(
                'critical',
                'Critical Log Event',
                logEntry.message,
                logEntry.service,
                logEntry.metadata
            );
        }
    }

    /**
     * Get alert manager statistics
     */
    getStats(): {
        rules: number;
        channels: number;
        activeEscalations: number;
        alertGroups: number;
        throttles: number;
    } {
        return {
            rules: this.rules.size,
            channels: this.channels.size,
            activeEscalations: this.escalations.filter(e => !e.executed).length,
            alertGroups: this.alertGroups.size,
            throttles: this.alertThrottles.size
        };
    }

    /**
     * Cleanup and stop alert manager
     */
    stop(): void {
        // Stop cron jobs
        this.cronJobs.forEach(job => job.stop());

        // Close WebSocket server
        if (this.wsServer) {
            this.wsServer.close();
        }

        console.log('[AlertManager] Alert manager stopped');
    }
}

// Create singleton instance
export const alertManager = new AlertManager();

// Export class and types
export default AlertManager;
export type { AlertRule, NotificationChannel, AlertEscalation, AlertGroup };

/**
 * @fileoverview Security Alerting System
 * @description Manages security alerts and notifications
 */

export interface SecurityAlert {
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: 'authentication' | 'authorization' | 'data_breach' | 'system' | 'compliance';
    timestamp: Date;
    source: {
        component: string;
        ip?: string;
        userId?: string;
    };
    details: Record<string, any>;
    status: 'active' | 'acknowledged' | 'resolved' | 'false_positive';
    assignedTo?: string;
    resolvedAt?: Date;
    actions: Array<{
        action: string;
        timestamp: Date;
        user: string;
        details?: any;
    }>;
}

export interface AlertingRule {
    id: string;
    name: string;
    description: string;
    condition: {
        metric: string;
        operator: '>' | '<' | '==' | '!=' | 'contains';
        threshold: number | string;
        timeWindow: number; // in seconds
    };
    severity: SecurityAlert['severity'];
    enabled: boolean;
    cooldown: number; // in seconds
    actions: Array<{
        type: 'email' | 'slack' | 'webhook' | 'log';
        config: Record<string, any>;
    }>;
}

export class SecurityAlertingSystem {
    private alerts: SecurityAlert[] = [];
    private rules: AlertingRule[] = [];
    private lastAlertTime = new Map<string, Date>();
    private maxAlerts: number = 10000;

    constructor(options: { maxAlerts?: number } = {}) {
        this.maxAlerts = options.maxAlerts || 10000;
        this.initializeDefaultRules();
        
        // Start cleanup task
        setInterval(() => this.cleanup(), 60 * 60 * 1000); // Every hour
    }

    /**
     * Create a security alert
     */
    createAlert(alertData: Omit<SecurityAlert, 'id' | 'status' | 'actions'>): SecurityAlert {
        const alert: SecurityAlert = {
            id: this.generateAlertId(),
            status: 'active',
            actions: [],
            ...alertData
        };

        this.alerts.unshift(alert);

        // Limit alerts array size
        if (this.alerts.length > this.maxAlerts) {
            this.alerts = this.alerts.slice(0, this.maxAlerts);
        }

        // Process alert actions
        this.processAlert(alert);

        return alert;
    }

    /**
     * Acknowledge alert
     */
    acknowledgeAlert(alertId: string, userId: string): boolean {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) return false;

        alert.status = 'acknowledged';
        alert.assignedTo = userId;
        alert.actions.push({
            action: 'acknowledged',
            timestamp: new Date(),
            user: userId
        });

        return true;
    }

    /**
     * Resolve alert
     */
    resolveAlert(alertId: string, userId: string, resolution?: string): boolean {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) return false;

        alert.status = 'resolved';
        alert.resolvedAt = new Date();
        alert.actions.push({
            action: 'resolved',
            timestamp: new Date(),
            user: userId,
            details: { resolution }
        });

        return true;
    }

    /**
     * Mark alert as false positive
     */
    markFalsePositive(alertId: string, userId: string): boolean {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) return false;

        alert.status = 'false_positive';
        alert.resolvedAt = new Date();
        alert.actions.push({
            action: 'false_positive',
            timestamp: new Date(),
            user: userId
        });

        return true;
    }

    /**
     * Get active alerts
     */
    getActiveAlerts(): SecurityAlert[] {
        return this.alerts.filter(alert => alert.status === 'active');
    }

    /**
     * Get alerts by severity
     */
    getAlertsBySeverity(severity: SecurityAlert['severity']): SecurityAlert[] {
        return this.alerts.filter(alert => alert.severity === severity);
    }

    /**
     * Get alerts by category
     */
    getAlertsByCategory(category: SecurityAlert['category']): SecurityAlert[] {
        return this.alerts.filter(alert => alert.category === category);
    }

    /**
     * Check if metrics should trigger alerts
     */
    checkAlertingRules(metrics: Array<{ name: string; value: number; timestamp: Date }>): void {
        for (const rule of this.rules) {
            if (!rule.enabled) continue;

            // Check cooldown
            const lastAlert = this.lastAlertTime.get(rule.id);
            if (lastAlert && (Date.now() - lastAlert.getTime()) < rule.cooldown * 1000) {
                continue;
            }

            if (this.evaluateRule(rule, metrics)) {
                this.triggerAlert(rule);
                this.lastAlertTime.set(rule.id, new Date());
            }
        }
    }

    /**
     * Add custom alerting rule
     */
    addRule(rule: AlertingRule): void {
        this.rules.push(rule);
    }

    /**
     * Remove alerting rule
     */
    removeRule(ruleId: string): void {
        this.rules = this.rules.filter(rule => rule.id !== ruleId);
    }

    private initializeDefaultRules(): void {
        // High failure rate rule
        this.rules.push({
            id: 'high-auth-failure-rate',
            name: 'High Authentication Failure Rate',
            description: 'Triggers when authentication failures exceed threshold',
            condition: {
                metric: 'auth.failed',
                operator: '>',
                threshold: 10,
                timeWindow: 300 // 5 minutes
            },
            severity: 'high',
            enabled: true,
            cooldown: 600, // 10 minutes
            actions: [
                {
                    type: 'log',
                    config: { level: 'warn' }
                }
            ]
        });

        // Critical security event rule
        this.rules.push({
            id: 'critical-security-event',
            name: 'Critical Security Event',
            description: 'Triggers on any critical security event',
            condition: {
                metric: 'security.event.critical',
                operator: '>',
                threshold: 0,
                timeWindow: 60
            },
            severity: 'critical',
            enabled: true,
            cooldown: 300, // 5 minutes
            actions: [
                {
                    type: 'log',
                    config: { level: 'error' }
                }
            ]
        });

        // Brute force attack rule
        this.rules.push({
            id: 'brute-force-detected',
            name: 'Brute Force Attack Detected',
            description: 'Multiple failed login attempts from same source',
            condition: {
                metric: 'security.threat.bruteforce',
                operator: '>',
                threshold: 0,
                timeWindow: 60
            },
            severity: 'high',
            enabled: true,
            cooldown: 1800, // 30 minutes
            actions: [
                {
                    type: 'log',
                    config: { level: 'warn' }
                }
            ]
        });
    }

    private evaluateRule(rule: AlertingRule, metrics: Array<{ name: string; value: number; timestamp: Date }>): boolean {
        const timeWindow = rule.condition.timeWindow * 1000; // Convert to milliseconds
        const cutoff = new Date(Date.now() - timeWindow);

        const relevantMetrics = metrics.filter(metric => 
            metric.name === rule.condition.metric && 
            metric.timestamp >= cutoff
        );

        if (relevantMetrics.length === 0) return false;

        let testValue: number;
        
        // Calculate aggregate value based on operator
        switch (rule.condition.operator) {
            case '>':
            case '<':
                testValue = relevantMetrics.reduce((sum, m) => sum + m.value, 0);
                break;
            case '==':
            case '!=':
                testValue = relevantMetrics.length > 0 ? relevantMetrics[0].value : 0;
                break;
            case 'contains':
                // For string-based conditions
                return relevantMetrics.some(m => 
                    String(m.value).includes(String(rule.condition.threshold))
                );
            default:
                return false;
        }

        // Evaluate condition
        switch (rule.condition.operator) {
            case '>':
                return testValue > Number(rule.condition.threshold);
            case '<':
                return testValue < Number(rule.condition.threshold);
            case '==':
                return testValue === Number(rule.condition.threshold);
            case '!=':
                return testValue !== Number(rule.condition.threshold);
            default:
                return false;
        }
    }

    private triggerAlert(rule: AlertingRule): void {
        const alert = this.createAlert({
            title: rule.name,
            description: rule.description,
            severity: rule.severity,
            category: 'system',
            timestamp: new Date(),
            source: {
                component: 'admin-alerting',
            },
            details: {
                rule: rule.id,
                condition: rule.condition
            }
        });

        // Execute alert actions
        for (const action of rule.actions) {
            this.executeAction(action, alert);
        }
    }

    private executeAction(action: any, alert: SecurityAlert): void {
        try {
            switch (action.type) {
                case 'log':
                    const level = action.config?.level || 'info';
                    console[level](`🚨 Security Alert [${alert.severity.toUpperCase()}]: ${alert.title}`);
                    break;

                case 'email':
                    // Implement email sending
                    console.log(`📧 Email alert would be sent: ${alert.title}`);
                    break;

                case 'slack':
                    // Implement Slack notification
                    console.log(`📱 Slack alert would be sent: ${alert.title}`);
                    break;

                case 'webhook':
                    // Implement webhook call
                    console.log(`🔗 Webhook would be called for: ${alert.title}`);
                    break;
            }
        } catch (error) {
            console.error(`Failed to execute alert action ${action.type}:`, error);
        }
    }

    private generateAlertId(): string {
        return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private cleanup(): void {
        const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
        const originalLength = this.alerts.length;
        
        // Keep active alerts, remove old resolved ones
        this.alerts = this.alerts.filter(alert => 
            alert.status === 'active' || 
            alert.status === 'acknowledged' || 
            alert.timestamp >= cutoff
        );
        
        const cleaned = originalLength - this.alerts.length;
        if (cleaned > 0) {
            console.log(`Cleaned up ${cleaned} old security alerts`);
        }
    }

    /**
     * Get alerting statistics
     */
    getAlertingStats(): {
        totalAlerts: number;
        activeAlerts: number;
        alertsBySeverity: Record<string, number>;
        alertsByCategory: Record<string, number>;
        avgResolutionTime: number;
        falsePositiveRate: number;
    } {
        const totalAlerts = this.alerts.length;
        const activeAlerts = this.alerts.filter(a => a.status === 'active').length;
        
        const alertsBySeverity = {};
        const alertsByCategory = {};
        let totalResolutionTime = 0;
        let resolvedCount = 0;
        let falsePositives = 0;

        this.alerts.forEach(alert => {
            // Count by severity
            alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1;
            
            // Count by category
            alertsByCategory[alert.category] = (alertsByCategory[alert.category] || 0) + 1;
            
            // Calculate resolution time
            if (alert.resolvedAt) {
                totalResolutionTime += alert.resolvedAt.getTime() - alert.timestamp.getTime();
                resolvedCount++;
            }
            
            // Count false positives
            if (alert.status === 'false_positive') {
                falsePositives++;
            }
        });

        return {
            totalAlerts,
            activeAlerts,
            alertsBySeverity,
            alertsByCategory,
            avgResolutionTime: resolvedCount > 0 ? totalResolutionTime / resolvedCount / 1000 : 0, // in seconds
            falsePositiveRate: totalAlerts > 0 ? falsePositives / totalAlerts : 0
        };
    }
}
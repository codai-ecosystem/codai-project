"use strict";
/**
 * ROMAI Advanced Analytics Engine - Day 19
 * TypeScript implementation with comprehensive data analysis
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardManager = exports.PredictionEngine = exports.AlertManager = exports.TrendAnalyzer = exports.AdvancedAnalyticsEngine = void 0;
const events_1 = require("events");
class AdvancedAnalyticsEngine extends events_1.EventEmitter {
    constructor() {
        super();
        this.dataStore = new Map();
        this.trendAnalyzer = new TrendAnalyzer();
        this.alertManager = new AlertManager();
        this.predictionEngine = new PredictionEngine();
        this.dashboardManager = new DashboardManager();
        this.initializeAnalytics();
    }
    initializeAnalytics() {
        console.log('🚀 Advanced Analytics Engine Starting...');
        // Start periodic analysis
        setInterval(() => {
            this.performAnalysis();
        }, 30000); // Every 30 seconds
        // Start trend analysis
        setInterval(() => {
            this.analyzeTrends();
        }, 60000); // Every minute
        console.log('✅ Advanced Analytics Engine Ready');
    }
    ingestData(data) {
        const service = data.service;
        if (!this.dataStore.has(service)) {
            this.dataStore.set(service, []);
        }
        const serviceData = this.dataStore.get(service);
        serviceData.push(data);
        // Keep only last 1000 data points per service
        if (serviceData.length > 1000) {
            serviceData.splice(0, serviceData.length - 1000);
        }
        // Emit real-time event
        this.emit('dataIngested', { service, data });
        // Check alerts
        this.alertManager.checkAlerts(data);
    }
    getServiceMetrics(service, timeframe) {
        const data = this.dataStore.get(service) || [];
        if (!timeframe)
            return data;
        const cutoff = this.getTimeframeCutoff(timeframe);
        return data.filter(d => d.timestamp >= cutoff);
    }
    getAggregatedMetrics(services, timeframe) {
        const allData = [];
        services.forEach(service => {
            const serviceData = this.getServiceMetrics(service, timeframe);
            allData.push(...serviceData);
        });
        if (allData.length === 0)
            return null;
        return {
            avgResponseTime: this.average(allData.map(d => d.metrics.responseTime)),
            avgCpuUsage: this.average(allData.map(d => d.metrics.cpuUsage)),
            avgMemoryUsage: this.average(allData.map(d => d.metrics.memoryUsage)),
            totalErrors: allData.reduce((sum, d) => sum + d.metrics.errorRate, 0),
            totalThroughput: this.average(allData.map(d => d.metrics.throughput)),
            healthyServices: allData.filter(d => d.health.status === 'healthy').length,
            totalServices: new Set(allData.map(d => d.service)).size,
            dataPoints: allData.length,
            timeframe: timeframe
        };
    }
    getTrendAnalysis(metric, timeframe) {
        return this.trendAnalyzer.analyzeTrend(this.dataStore, metric, timeframe);
    }
    getPredictions(service, metric) {
        const data = this.dataStore.get(service) || [];
        return this.predictionEngine.predict(data, metric);
    }
    createAlert(rule) {
        this.alertManager.addRule(rule);
    }
    getActiveAlerts() {
        return this.alertManager.getActiveAlerts();
    }
    createDashboard(widgets) {
        return this.dashboardManager.createDashboard(widgets);
    }
    performAnalysis() {
        const allServices = Array.from(this.dataStore.keys());
        allServices.forEach(service => {
            const recentData = this.getServiceMetrics(service, '1h');
            if (recentData.length > 0) {
                const analysis = this.analyzeServiceHealth(recentData);
                this.emit('serviceAnalysis', { service, analysis });
            }
        });
    }
    analyzeTrends() {
        const metrics = ['responseTime', 'cpuUsage', 'memoryUsage', 'errorRate'];
        const timeframes = ['1h', '6h', '24h'];
        metrics.forEach(metric => {
            timeframes.forEach(timeframe => {
                const trend = this.getTrendAnalysis(metric, timeframe);
                if (trend) {
                    this.emit('trendUpdate', { metric, timeframe, trend });
                }
            });
        });
    }
    analyzeServiceHealth(data) {
        if (data.length === 0)
            return null;
        const latest = data[data.length - 1];
        if (!latest)
            return null;
        const avg = {
            responseTime: this.average(data.map(d => d.metrics.responseTime)),
            cpuUsage: this.average(data.map(d => d.metrics.cpuUsage)),
            memoryUsage: this.average(data.map(d => d.metrics.memoryUsage)),
            errorRate: this.average(data.map(d => d.metrics.errorRate))
        };
        return {
            current: latest.metrics,
            average: avg,
            healthScore: this.calculateHealthScore(latest),
            recommendations: this.generateRecommendations(latest, avg),
            timestamp: new Date()
        };
    }
    calculateHealthScore(data) {
        let score = 100;
        // Response time impact
        if (data.metrics.responseTime > 1000)
            score -= 20;
        else if (data.metrics.responseTime > 500)
            score -= 10;
        // CPU usage impact  
        if (data.metrics.cpuUsage > 80)
            score -= 15;
        else if (data.metrics.cpuUsage > 60)
            score -= 5;
        // Memory usage impact
        if (data.metrics.memoryUsage > 90)
            score -= 15;
        else if (data.metrics.memoryUsage > 70)
            score -= 5;
        // Error rate impact
        if (data.metrics.errorRate > 5)
            score -= 25;
        else if (data.metrics.errorRate > 1)
            score -= 10;
        return Math.max(0, score);
    }
    generateRecommendations(current, avg) {
        const recommendations = [];
        if (current.metrics.responseTime > avg.responseTime * 1.5) {
            recommendations.push('High response time detected - consider scaling or optimization');
        }
        if (current.metrics.cpuUsage > 80) {
            recommendations.push('CPU usage critical - immediate scaling recommended');
        }
        if (current.metrics.memoryUsage > 85) {
            recommendations.push('Memory usage high - check for memory leaks');
        }
        if (current.metrics.errorRate > avg.errorRate * 2) {
            recommendations.push('Error rate spike detected - investigate recent changes');
        }
        return recommendations;
    }
    getTimeframeCutoff(timeframe) {
        const now = new Date();
        switch (timeframe) {
            case '1h': return new Date(now.getTime() - 60 * 60 * 1000);
            case '6h': return new Date(now.getTime() - 6 * 60 * 60 * 1000);
            case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
            case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            default: return new Date(0);
        }
    }
    average(numbers) {
        return numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
    }
}
exports.AdvancedAnalyticsEngine = AdvancedAnalyticsEngine;
class TrendAnalyzer {
    analyzeTrend(dataStore, metric, timeframe) {
        const allData = [];
        dataStore.forEach(serviceData => {
            allData.push(...serviceData);
        });
        if (allData.length < 2)
            return null;
        const cutoff = this.getTimeframeCutoff(timeframe);
        const filteredData = allData.filter(d => d.timestamp >= cutoff);
        if (filteredData.length < 2)
            return null;
        const dataPoints = filteredData.map(d => ({
            timestamp: d.timestamp,
            value: this.extractMetricValue(d, metric),
            metric: metric
        }));
        const trend = this.calculateTrend(dataPoints);
        const changePercent = this.calculateChangePercent(dataPoints);
        return {
            timeframe: timeframe,
            dataPoints: dataPoints,
            trend: trend,
            changePercent: changePercent,
            prediction: this.predictNextValue(dataPoints)
        };
    }
    extractMetricValue(data, metric) {
        switch (metric) {
            case 'responseTime': return data.metrics.responseTime;
            case 'cpuUsage': return data.metrics.cpuUsage;
            case 'memoryUsage': return data.metrics.memoryUsage;
            case 'errorRate': return data.metrics.errorRate;
            case 'throughput': return data.metrics.throughput;
            default: return 0;
        }
    }
    calculateTrend(dataPoints) {
        if (dataPoints.length < 2)
            return 'stable';
        const first = dataPoints[0].value;
        const last = dataPoints[dataPoints.length - 1].value;
        const diff = ((last - first) / first) * 100;
        if (Math.abs(diff) < 5)
            return 'stable';
        return diff > 0 ? 'increasing' : 'decreasing';
    }
    calculateChangePercent(dataPoints) {
        if (dataPoints.length < 2)
            return 0;
        const first = dataPoints[0].value;
        const last = dataPoints[dataPoints.length - 1].value;
        return ((last - first) / first) * 100;
    }
    predictNextValue(dataPoints) {
        if (dataPoints.length < 3)
            return dataPoints[dataPoints.length - 1]?.value || 0;
        // Simple linear regression for prediction
        const recentPoints = dataPoints.slice(-5);
        const values = recentPoints.map(p => p.value);
        const trend = (values[values.length - 1] - values[0]) / values.length;
        return values[values.length - 1] + trend;
    }
    getTimeframeCutoff(timeframe) {
        const now = new Date();
        switch (timeframe) {
            case '1h': return new Date(now.getTime() - 60 * 60 * 1000);
            case '6h': return new Date(now.getTime() - 6 * 60 * 60 * 1000);
            case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
            case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            default: return new Date(0);
        }
    }
}
exports.TrendAnalyzer = TrendAnalyzer;
class AlertManager {
    constructor() {
        this.rules = new Map();
        this.activeAlerts = new Map();
    }
    addRule(rule) {
        this.rules.set(rule.id, rule);
        console.log(`📋 Alert rule added: ${rule.name}`);
    }
    removeRule(ruleId) {
        this.rules.delete(ruleId);
        this.activeAlerts.delete(ruleId);
    }
    checkAlerts(data) {
        this.rules.forEach(rule => {
            if (!rule.enabled)
                return;
            const value = this.extractMetricValue(data, rule.metric);
            const triggered = this.evaluateCondition(value, rule.condition, rule.threshold);
            if (triggered) {
                this.triggerAlert(rule, data, value);
            }
        });
    }
    getActiveAlerts() {
        return Array.from(this.activeAlerts.values());
    }
    extractMetricValue(data, metric) {
        switch (metric) {
            case 'responseTime': return data.metrics.responseTime;
            case 'cpuUsage': return data.metrics.cpuUsage;
            case 'memoryUsage': return data.metrics.memoryUsage;
            case 'errorRate': return data.metrics.errorRate;
            case 'throughput': return data.metrics.throughput;
            default: return 0;
        }
    }
    evaluateCondition(value, condition, threshold) {
        switch (condition) {
            case 'gt': return value > threshold;
            case 'lt': return value < threshold;
            case 'eq': return Math.abs(value - threshold) < 0.01;
            default: return false;
        }
    }
    triggerAlert(rule, data, value) {
        const alert = {
            id: rule.id,
            name: rule.name,
            severity: rule.severity,
            service: data.service,
            metric: rule.metric,
            value: value,
            threshold: rule.threshold,
            triggered: new Date(),
            message: `${rule.name}: ${rule.metric} is ${value} (threshold: ${rule.threshold})`
        };
        this.activeAlerts.set(rule.id, alert);
        rule.lastTriggered = new Date();
        console.log(`🚨 ALERT: ${alert.message}`);
    }
}
exports.AlertManager = AlertManager;
class PredictionEngine {
    predict(data, metric) {
        if (data.length < 10)
            return null;
        const values = data.map(d => this.extractMetricValue(d, metric));
        const predictions = this.generatePredictions(values);
        return {
            metric: metric,
            currentValue: values[values.length - 1],
            predictions: predictions,
            confidence: this.calculateConfidence(values),
            timestamp: new Date()
        };
    }
    extractMetricValue(data, metric) {
        switch (metric) {
            case 'responseTime': return data.metrics.responseTime;
            case 'cpuUsage': return data.metrics.cpuUsage;
            case 'memoryUsage': return data.metrics.memoryUsage;
            case 'errorRate': return data.metrics.errorRate;
            case 'throughput': return data.metrics.throughput;
            default: return 0;
        }
    }
    generatePredictions(values) {
        if (values.length === 0)
            return null;
        const recent = values.slice(-20);
        if (recent.length === 0)
            return null;
        const trend = this.calculateTrend(recent);
        const lastValue = recent[recent.length - 1] || 0;
        return {
            next5min: lastValue + trend * 5,
            next15min: lastValue + trend * 15,
            next1hour: lastValue + trend * 60,
            trend: trend
        };
    }
    calculateTrend(values) {
        if (values.length < 2)
            return 0;
        let sum = 0;
        for (let i = 1; i < values.length; i++) {
            const current = values[i];
            const previous = values[i - 1];
            if (current !== undefined && previous !== undefined) {
                sum += current - previous;
            }
        }
        return sum / (values.length - 1);
    }
    calculateConfidence(values) {
        const variance = this.calculateVariance(values);
        return Math.max(0, Math.min(100, 100 - variance));
    }
    calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    }
}
exports.PredictionEngine = PredictionEngine;
class DashboardManager {
    constructor() {
        this.dashboards = new Map();
    }
    createDashboard(widgets) {
        const dashboardId = `dashboard_${Date.now()}`;
        this.dashboards.set(dashboardId, widgets);
        return dashboardId;
    }
    getDashboard(id) {
        return this.dashboards.get(id) || null;
    }
    updateWidget(dashboardId, widgetId, config) {
        const dashboard = this.dashboards.get(dashboardId);
        if (!dashboard)
            return false;
        const widget = dashboard.find(w => w.id === widgetId);
        if (!widget)
            return false;
        widget.config = { ...widget.config, ...config };
        return true;
    }
}
exports.DashboardManager = DashboardManager;

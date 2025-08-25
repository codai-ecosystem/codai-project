"""
Monitoring Dashboards Module
============================

Real-time monitoring dashboards and visualization system for RomAI's automated
testing pipeline. Provides comprehensive metrics visualization, performance
tracking, and operational insights for the AGI evaluation system.

Features:
- Real-time performance dashboards
- Historical trend analysis
- Competitive advantage tracking
- Romanian compliance monitoring
- Regression detection visualization
- Executive summary reports
- Alert management interface
- System health monitoring

Author: RomAI Excellence Team
Version: 1.0.0
"""

import asyncio
import logging
import json
import os
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from pathlib import Path
import sqlite3
from collections import defaultdict

from romai_automated_testing_infrastructure import (
    ContinuousEvaluationOrchestrator,
    AutomatedTestResult,
    ContinuousEvaluationReport
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class DashboardMetrics:
    """Dashboard metrics data structure."""
    
    # Performance metrics
    current_performance_score: float
    performance_trend: str  # 'improving', 'stable', 'declining'
    performance_change_24h: float
    performance_change_7d: float
    
    # Competitive metrics
    competitive_advantage: Optional[float]
    market_position: int  # Ranking position
    competitive_trend: str
    
    # Romanian compliance
    romanian_compliance_score: float
    compliance_trend: str
    cultural_intelligence_level: str
    
    # System health
    uptime_percentage: float
    tests_executed_24h: int
    success_rate_24h: float
    average_execution_time: float
    
    # Quality metrics
    regression_alerts_active: int
    critical_issues_count: int
    quality_gates_status: str
    
    # Timestamp
    last_updated: datetime

@dataclass
class ChartData:
    """Chart data for dashboard visualization."""
    
    chart_type: str  # 'line', 'bar', 'gauge', 'heatmap'
    title: str
    data_points: List[Dict[str, Any]]
    x_axis_label: str
    y_axis_label: str
    color_scheme: str
    
    # Chart-specific properties
    thresholds: Optional[Dict[str, float]] = None
    annotations: Optional[List[Dict[str, Any]]] = None
    aggregation_period: Optional[str] = None

class MetricsDatabase:
    """SQLite database for storing historical metrics."""
    
    def __init__(self, db_path: str = "romai_metrics.db"):
        """Initialize metrics database."""
        
        self.db_path = db_path
        self._initialize_database()
    
    def _initialize_database(self):
        """Initialize database schema."""
        
        with sqlite3.connect(self.db_path) as conn:
            # Test results table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS test_results (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    test_id TEXT NOT NULL,
                    test_suite TEXT NOT NULL,
                    execution_duration REAL,
                    success BOOLEAN,
                    overall_score REAL,
                    competitive_advantage REAL,
                    romanian_compliance REAL,
                    regression_detected BOOLEAN,
                    critical_issues INTEGER DEFAULT 0,
                    warnings INTEGER DEFAULT 0
                )
            """)
            
            # Performance trends table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS performance_trends (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    metric_name TEXT NOT NULL,
                    metric_value REAL NOT NULL,
                    test_suite TEXT,
                    aggregation_period TEXT DEFAULT 'hourly'
                )
            """)
            
            # System health table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS system_health (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    uptime_seconds INTEGER,
                    cpu_usage REAL,
                    memory_usage REAL,
                    disk_usage REAL,
                    active_tests INTEGER DEFAULT 0
                )
            """)
            
            # Alerts table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS alerts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                    alert_type TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    message TEXT NOT NULL,
                    test_suite TEXT,
                    resolved BOOLEAN DEFAULT FALSE,
                    resolved_timestamp DATETIME
                )
            """)
            
            conn.commit()
    
    def store_test_result(self, result: AutomatedTestResult):
        """Store test result in database."""
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO test_results (
                    test_id, test_suite, execution_duration, success,
                    overall_score, competitive_advantage, romanian_compliance,
                    regression_detected, critical_issues, warnings
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                result.test_id,
                result.test_suite,
                result.execution_duration,
                result.success,
                result.overall_score,
                result.competitive_advantage,
                result.romanian_compliance,
                bool(result.regression_alerts),
                len(result.failures),
                len(result.warnings)
            ))
            conn.commit()
    
    def store_performance_metric(self, metric_name: str, value: float, test_suite: str = None):
        """Store performance metric."""
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                INSERT INTO performance_trends (metric_name, metric_value, test_suite)
                VALUES (?, ?, ?)
            """, (metric_name, value, test_suite))
            conn.commit()
    
    def get_performance_trends(self, 
                             metric_name: str, 
                             hours_back: int = 24,
                             test_suite: str = None) -> List[Dict[str, Any]]:
        """Get performance trends for specified time period."""
        
        with sqlite3.connect(self.db_path) as conn:
            if test_suite:
                query = """
                    SELECT timestamp, metric_value, test_suite
                    FROM performance_trends
                    WHERE metric_name = ? AND test_suite = ?
                    AND timestamp >= datetime('now', '-{} hours')
                    ORDER BY timestamp
                """.format(hours_back)
                cursor = conn.execute(query, (metric_name, test_suite))
            else:
                query = """
                    SELECT timestamp, metric_value, test_suite
                    FROM performance_trends
                    WHERE metric_name = ?
                    AND timestamp >= datetime('now', '-{} hours')
                    ORDER BY timestamp
                """.format(hours_back)
                cursor = conn.execute(query, (metric_name,))
            
            results = []
            for row in cursor.fetchall():
                results.append({
                    'timestamp': row[0],
                    'value': row[1],
                    'test_suite': row[2]
                })
            
            return results

class MonitoringDashboard:
    """Main monitoring dashboard system."""
    
    def __init__(self):
        """Initialize monitoring dashboard."""
        
        self.dashboard_id = f"romai-dashboard-{datetime.now().strftime('%Y%m%d')}"
        self.metrics_db = MetricsDatabase()
        self.orchestrator = ContinuousEvaluationOrchestrator()
        
        # Dashboard configuration
        self.refresh_interval = 30  # seconds
        self.max_data_points = 100
        
        logger.info(f"Initialized Monitoring Dashboard: {self.dashboard_id}")
    
    async def generate_dashboard_metrics(self) -> DashboardMetrics:
        """Generate current dashboard metrics."""
        
        logger.info("📊 Generating dashboard metrics")
        
        try:
            # Get recent test results
            recent_results = self._get_recent_test_results(hours=24)
            
            # Calculate performance metrics
            current_score = self._calculate_current_performance(recent_results)
            performance_trend = self._calculate_performance_trend(hours=24)
            performance_change_24h = self._calculate_performance_change(hours=24)
            performance_change_7d = self._calculate_performance_change(hours=168)
            
            # Calculate competitive metrics
            competitive_advantage = self._calculate_competitive_advantage(recent_results)
            market_position = self._estimate_market_position(competitive_advantage)
            competitive_trend = self._calculate_competitive_trend()
            
            # Calculate Romanian compliance
            romanian_score = self._calculate_romanian_compliance(recent_results)
            compliance_trend = self._calculate_compliance_trend()
            cultural_level = self._determine_cultural_intelligence_level(romanian_score)
            
            # Calculate system health
            uptime_pct = self._calculate_uptime_percentage()
            tests_24h = len(recent_results)
            success_rate = self._calculate_success_rate(recent_results)
            avg_execution_time = self._calculate_average_execution_time(recent_results)
            
            # Quality metrics
            regression_alerts = self._count_active_regression_alerts()
            critical_issues = self._count_critical_issues(recent_results)
            quality_gates_status = self._determine_quality_gates_status(recent_results)
            
            metrics = DashboardMetrics(
                current_performance_score=current_score,
                performance_trend=performance_trend,
                performance_change_24h=performance_change_24h,
                performance_change_7d=performance_change_7d,
                competitive_advantage=competitive_advantage,
                market_position=market_position,
                competitive_trend=competitive_trend,
                romanian_compliance_score=romanian_score,
                compliance_trend=compliance_trend,
                cultural_intelligence_level=cultural_level,
                uptime_percentage=uptime_pct,
                tests_executed_24h=tests_24h,
                success_rate_24h=success_rate,
                average_execution_time=avg_execution_time,
                regression_alerts_active=regression_alerts,
                critical_issues_count=critical_issues,
                quality_gates_status=quality_gates_status,
                last_updated=datetime.now()
            )
            
            logger.info(f"✅ Dashboard metrics generated: {current_score:.3f} performance")
            return metrics
            
        except Exception as e:
            logger.error(f"Error generating dashboard metrics: {e}")
            # Return default metrics
            return DashboardMetrics(
                current_performance_score=0.0,
                performance_trend="unknown",
                performance_change_24h=0.0,
                performance_change_7d=0.0,
                competitive_advantage=None,
                market_position=0,
                competitive_trend="unknown",
                romanian_compliance_score=0.0,
                compliance_trend="unknown",
                cultural_intelligence_level="UNKNOWN",
                uptime_percentage=0.0,
                tests_executed_24h=0,
                success_rate_24h=0.0,
                average_execution_time=0.0,
                regression_alerts_active=0,
                critical_issues_count=0,
                quality_gates_status="UNKNOWN",
                last_updated=datetime.now()
            )
    
    def _get_recent_test_results(self, hours: int = 24) -> List[Dict[str, Any]]:
        """Get recent test results from database."""
        
        with sqlite3.connect(self.metrics_db.db_path) as conn:
            query = """
                SELECT * FROM test_results
                WHERE timestamp >= datetime('now', '-{} hours')
                ORDER BY timestamp DESC
            """.format(hours)
            
            cursor = conn.execute(query)
            columns = [description[0] for description in cursor.description]
            
            results = []
            for row in cursor.fetchall():
                result_dict = dict(zip(columns, row))
                results.append(result_dict)
            
            return results
    
    def _calculate_current_performance(self, results: List[Dict[str, Any]]) -> float:
        """Calculate current performance score."""
        
        if not results:
            return 0.0
        
        # Weight recent results more heavily
        weighted_scores = []
        now = datetime.now()
        
        for result in results[:20]:  # Last 20 results
            if result['overall_score']:
                # Calculate time weight (more recent = higher weight)
                timestamp = datetime.fromisoformat(result['timestamp'])
                hours_ago = (now - timestamp).total_seconds() / 3600
                weight = max(0.1, 1.0 - (hours_ago / 24))  # Linear decay over 24h
                
                weighted_scores.append(result['overall_score'] * weight)
        
        return sum(weighted_scores) / len(weighted_scores) if weighted_scores else 0.0
    
    def _calculate_performance_trend(self, hours: int = 24) -> str:
        """Calculate performance trend direction."""
        
        trends = self.metrics_db.get_performance_trends('overall_score', hours)
        
        if len(trends) < 2:
            return "stable"
        
        # Calculate trend using linear regression-like approach
        recent_values = [t['value'] for t in trends[-10:]]  # Last 10 points
        earlier_values = [t['value'] for t in trends[:10]]   # First 10 points
        
        if not recent_values or not earlier_values:
            return "stable"
        
        recent_avg = sum(recent_values) / len(recent_values)
        earlier_avg = sum(earlier_values) / len(earlier_values)
        
        change_pct = (recent_avg - earlier_avg) / earlier_avg if earlier_avg > 0 else 0
        
        if change_pct > 0.05:  # 5% improvement
            return "improving"
        elif change_pct < -0.05:  # 5% decline
            return "declining"
        else:
            return "stable"
    
    def _calculate_performance_change(self, hours: int) -> float:
        """Calculate performance change over time period."""
        
        trends = self.metrics_db.get_performance_trends('overall_score', hours)
        
        if len(trends) < 2:
            return 0.0
        
        current_value = trends[-1]['value']
        baseline_value = trends[0]['value']
        
        if baseline_value > 0:
            return (current_value - baseline_value) / baseline_value
        else:
            return 0.0
    
    def _calculate_competitive_advantage(self, results: List[Dict[str, Any]]) -> Optional[float]:
        """Calculate current competitive advantage."""
        
        advantages = [r['competitive_advantage'] for r in results 
                     if r['competitive_advantage'] is not None]
        
        if not advantages:
            return None
        
        # Weight recent results more heavily
        weighted_advantages = []
        now = datetime.now()
        
        for i, result in enumerate(results):
            if result['competitive_advantage']:
                timestamp = datetime.fromisoformat(result['timestamp'])
                hours_ago = (now - timestamp).total_seconds() / 3600
                weight = max(0.1, 1.0 - (hours_ago / 24))
                
                weighted_advantages.append(result['competitive_advantage'] * weight)
        
        return sum(weighted_advantages) / len(weighted_advantages) if weighted_advantages else None
    
    def _estimate_market_position(self, competitive_advantage: Optional[float]) -> int:
        """Estimate market position based on competitive advantage."""
        
        if competitive_advantage is None:
            return 0
        
        # Estimate position based on competitive advantage
        if competitive_advantage >= 3.0:  # 300%+ advantage
            return 1
        elif competitive_advantage >= 2.0:  # 200%+ advantage
            return 2
        elif competitive_advantage >= 1.0:  # 100%+ advantage
            return 3
        elif competitive_advantage >= 0.5:  # 50%+ advantage
            return 4
        elif competitive_advantage >= 0.0:  # Positive advantage
            return 5
        else:
            return 10  # Behind competitors
    
    def _calculate_competitive_trend(self) -> str:
        """Calculate competitive advantage trend."""
        
        trends = self.metrics_db.get_performance_trends('competitive_advantage', 168)  # 7 days
        
        if len(trends) < 2:
            return "stable"
        
        # Simple trend calculation
        recent_avg = sum(t['value'] for t in trends[-5:]) / min(5, len(trends))
        earlier_avg = sum(t['value'] for t in trends[:5]) / min(5, len(trends))
        
        change_pct = (recent_avg - earlier_avg) / earlier_avg if earlier_avg > 0 else 0
        
        if change_pct > 0.1:
            return "improving"
        elif change_pct < -0.1:
            return "declining"
        else:
            return "stable"
    
    def _calculate_romanian_compliance(self, results: List[Dict[str, Any]]) -> float:
        """Calculate current Romanian compliance score."""
        
        compliance_scores = [r['romanian_compliance'] for r in results 
                           if r['romanian_compliance'] is not None]
        
        if not compliance_scores:
            return 0.0
        
        return sum(compliance_scores) / len(compliance_scores)
    
    def _calculate_compliance_trend(self) -> str:
        """Calculate compliance trend."""
        
        trends = self.metrics_db.get_performance_trends('romanian_compliance', 72)  # 3 days
        
        if len(trends) < 2:
            return "stable"
        
        recent_avg = sum(t['value'] for t in trends[-3:]) / min(3, len(trends))
        earlier_avg = sum(t['value'] for t in trends[:3]) / min(3, len(trends))
        
        change_pct = (recent_avg - earlier_avg) / earlier_avg if earlier_avg > 0 else 0
        
        if change_pct > 0.05:
            return "improving"
        elif change_pct < -0.05:
            return "declining"
        else:
            return "stable"
    
    def _determine_cultural_intelligence_level(self, score: float) -> str:
        """Determine cultural intelligence level based on score."""
        
        if score >= 0.95:
            return "WORLD_CLASS_CULTURAL_INTELLIGENCE"
        elif score >= 0.90:
            return "ADVANCED_CULTURAL_INTELLIGENCE"
        elif score >= 0.85:
            return "PROFICIENT_CULTURAL_INTELLIGENCE"
        elif score >= 0.75:
            return "DEVELOPING_CULTURAL_INTELLIGENCE"
        elif score >= 0.60:
            return "BASIC_CULTURAL_INTELLIGENCE"
        else:
            return "LIMITED_CULTURAL_INTELLIGENCE"
    
    def _calculate_uptime_percentage(self) -> float:
        """Calculate system uptime percentage."""
        
        # Simple uptime calculation based on recent test executions
        recent_results = self._get_recent_test_results(24)
        
        if not recent_results:
            return 0.0
        
        # If we have recent tests, assume good uptime
        # More sophisticated implementation would track actual system uptime
        success_rate = len([r for r in recent_results if r['success']]) / len(recent_results)
        
        # Estimate uptime based on success rate and execution frequency
        return min(99.9, success_rate * 100)
    
    def _calculate_success_rate(self, results: List[Dict[str, Any]]) -> float:
        """Calculate test success rate."""
        
        if not results:
            return 0.0
        
        successful = len([r for r in results if r['success']])
        return successful / len(results)
    
    def _calculate_average_execution_time(self, results: List[Dict[str, Any]]) -> float:
        """Calculate average test execution time."""
        
        execution_times = [r['execution_duration'] for r in results 
                          if r['execution_duration'] is not None]
        
        if not execution_times:
            return 0.0
        
        return sum(execution_times) / len(execution_times)
    
    def _count_active_regression_alerts(self) -> int:
        """Count active regression alerts."""
        
        with sqlite3.connect(self.metrics_db.db_path) as conn:
            cursor = conn.execute("""
                SELECT COUNT(*) FROM alerts
                WHERE alert_type = 'regression'
                AND resolved = FALSE
                AND timestamp >= datetime('now', '-24 hours')
            """)
            
            return cursor.fetchone()[0]
    
    def _count_critical_issues(self, results: List[Dict[str, Any]]) -> int:
        """Count critical issues in recent results."""
        
        return sum(r['critical_issues'] for r in results if r['critical_issues'])
    
    def _determine_quality_gates_status(self, results: List[Dict[str, Any]]) -> str:
        """Determine overall quality gates status."""
        
        if not results:
            return "UNKNOWN"
        
        # Recent results analysis
        recent_results = results[:10]  # Last 10 results
        
        success_rate = len([r for r in recent_results if r['success']]) / len(recent_results)
        avg_score = sum(r['overall_score'] for r in recent_results if r['overall_score']) / len(recent_results)
        critical_issues = sum(r['critical_issues'] for r in recent_results)
        
        if success_rate >= 0.90 and avg_score >= 0.85 and critical_issues == 0:
            return "ALL_GATES_PASSING"
        elif success_rate >= 0.75 and avg_score >= 0.70 and critical_issues <= 2:
            return "MOST_GATES_PASSING"
        elif success_rate >= 0.50:
            return "SOME_GATES_FAILING"
        else:
            return "CRITICAL_GATES_FAILING"
    
    async def generate_performance_chart(self, hours_back: int = 24) -> ChartData:
        """Generate performance trend chart."""
        
        trends = self.metrics_db.get_performance_trends('overall_score', hours_back)
        
        data_points = []
        for trend in trends:
            data_points.append({
                'x': trend['timestamp'],
                'y': trend['value'],
                'suite': trend['test_suite'] or 'Overall'
            })
        
        return ChartData(
            chart_type='line',
            title='Performance Trends',
            data_points=data_points,
            x_axis_label='Time',
            y_axis_label='Performance Score',
            color_scheme='blue',
            thresholds={'warning': 0.70, 'critical': 0.50},
            aggregation_period='hourly'
        )
    
    async def generate_competitive_chart(self, hours_back: int = 168) -> ChartData:
        """Generate competitive advantage chart."""
        
        trends = self.metrics_db.get_performance_trends('competitive_advantage', hours_back)
        
        data_points = []
        for trend in trends:
            data_points.append({
                'x': trend['timestamp'],
                'y': trend['value'] * 100,  # Convert to percentage
                'suite': trend['test_suite'] or 'Overall'
            })
        
        return ChartData(
            chart_type='line',
            title='Competitive Advantage Trends',
            data_points=data_points,
            x_axis_label='Time',
            y_axis_label='Advantage (%)',
            color_scheme='green',
            thresholds={'excellent': 200.0, 'good': 100.0, 'baseline': 0.0},
            aggregation_period='daily'
        )
    
    async def generate_dashboard_html(self) -> str:
        """Generate HTML dashboard page."""
        
        metrics = await self.generate_dashboard_metrics()
        performance_chart = await self.generate_performance_chart()
        competitive_chart = await self.generate_competitive_chart()
        
        html_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RomAI AGI Monitoring Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }}
        .container {{ max-width: 1400px; margin: 0 auto; }}
        .header {{ text-align: center; margin-bottom: 30px; }}
        .metrics-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }}
        .metric-card {{ background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
        .metric-value {{ font-size: 2em; font-weight: bold; color: #2c3e50; }}
        .metric-label {{ font-size: 0.9em; color: #7f8c8d; margin-top: 5px; }}
        .trend-positive {{ color: #27ae60; }}
        .trend-negative {{ color: #e74c3c; }}
        .trend-stable {{ color: #f39c12; }}
        .charts-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }}
        .chart-container {{ background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }}
        .status-excellent {{ color: #27ae60; }}
        .status-good {{ color: #f39c12; }}
        .status-warning {{ color: #e67e22; }}
        .status-critical {{ color: #e74c3c; }}
        .last-updated {{ text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 0.9em; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤖 RomAI AGI Monitoring Dashboard</h1>
            <h2>World-Class Artificial General Intelligence System</h2>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">{performance_score:.3f}</div>
                <div class="metric-label">Overall Performance</div>
                <div class="trend-{performance_trend_class}">{performance_trend} ({performance_change_24h:+.1%} 24h)</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">{competitive_advantage:.1f}%</div>
                <div class="metric-label">Competitive Advantage</div>
                <div class="metric-value">#{market_position}</div>
                <div class="metric-label">Market Position</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">{romanian_compliance:.1%}</div>
                <div class="metric-label">Romanian Compliance</div>
                <div class="metric-label">{cultural_level}</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">{uptime:.1f}%</div>
                <div class="metric-label">System Uptime</div>
                <div class="metric-value">{tests_24h}</div>
                <div class="metric-label">Tests (24h)</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value">{success_rate:.1%}</div>
                <div class="metric-label">Success Rate (24h)</div>
                <div class="metric-value">{avg_execution_time:.1f}s</div>
                <div class="metric-label">Avg Execution Time</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-value {quality_status_class}">{quality_gates_status}</div>
                <div class="metric-label">Quality Gates</div>
                <div class="metric-value">{critical_issues}</div>
                <div class="metric-label">Critical Issues</div>
            </div>
        </div>
        
        <div class="charts-grid">
            <div class="chart-container">
                <canvas id="performanceChart"></canvas>
            </div>
            <div class="chart-container">
                <canvas id="competitiveChart"></canvas>
            </div>
        </div>
        
        <div class="last-updated">
            Last Updated: {last_updated}
        </div>
    </div>
    
    <script>
        // Performance Chart
        const performanceCtx = document.getElementById('performanceChart').getContext('2d');
        new Chart(performanceCtx, {{
            type: 'line',
            data: {{
                datasets: [{{
                    label: 'Performance Score',
                    data: {performance_data},
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4
                }}]
            }},
            options: {{
                responsive: true,
                plugins: {{
                    title: {{
                        display: true,
                        text: 'Performance Trends'
                    }}
                }},
                scales: {{
                    x: {{
                        type: 'time',
                        time: {{
                            unit: 'hour'
                        }}
                    }},
                    y: {{
                        beginAtZero: true,
                        max: 1.0
                    }}
                }}
            }}
        }});
        
        // Competitive Chart
        const competitiveCtx = document.getElementById('competitiveChart').getContext('2d');
        new Chart(competitiveCtx, {{
            type: 'line',
            data: {{
                datasets: [{{
                    label: 'Competitive Advantage (%)',
                    data: {competitive_data},
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    tension: 0.4
                }}]
            }},
            options: {{
                responsive: true,
                plugins: {{
                    title: {{
                        display: true,
                        text: 'Competitive Advantage Trends'
                    }}
                }},
                scales: {{
                    x: {{
                        type: 'time',
                        time: {{
                            unit: 'day'
                        }}
                    }},
                    y: {{
                        beginAtZero: true
                    }}
                }}
            }}
        }});
        
        // Auto-refresh dashboard
        setTimeout(() => location.reload(), 30000);
    </script>
</body>
</html>
        """
        
        # Format template
        performance_trend_class = metrics.performance_trend.replace('improving', 'positive').replace('declining', 'negative')
        quality_status_class = self._get_quality_status_class(metrics.quality_gates_status)
        
        performance_data = json.dumps([{'x': dp['x'], 'y': dp['y']} for dp in performance_chart.data_points])
        competitive_data = json.dumps([{'x': dp['x'], 'y': dp['y']} for dp in competitive_chart.data_points])
        
        return html_template.format(
            performance_score=metrics.current_performance_score,
            performance_trend=metrics.performance_trend.upper(),
            performance_trend_class=performance_trend_class,
            performance_change_24h=metrics.performance_change_24h,
            competitive_advantage=(metrics.competitive_advantage * 100) if metrics.competitive_advantage else 0,
            market_position=metrics.market_position,
            romanian_compliance=metrics.romanian_compliance_score,
            cultural_level=metrics.cultural_intelligence_level.replace('_', ' ').title(),
            uptime=metrics.uptime_percentage,
            tests_24h=metrics.tests_executed_24h,
            success_rate=metrics.success_rate_24h,
            avg_execution_time=metrics.average_execution_time,
            quality_gates_status=metrics.quality_gates_status.replace('_', ' ').title(),
            quality_status_class=quality_status_class,
            critical_issues=metrics.critical_issues_count,
            last_updated=metrics.last_updated.strftime('%Y-%m-%d %H:%M:%S UTC'),
            performance_data=performance_data,
            competitive_data=competitive_data
        )
    
    def _get_quality_status_class(self, status: str) -> str:
        """Get CSS class for quality status."""
        
        if 'ALL_GATES_PASSING' in status:
            return 'status-excellent'
        elif 'MOST_GATES_PASSING' in status:
            return 'status-good'
        elif 'SOME_GATES_FAILING' in status:
            return 'status-warning'
        else:
            return 'status-critical'

# Export main components
__all__ = ['MonitoringDashboard', 'DashboardMetrics', 'ChartData', 'MetricsDatabase']
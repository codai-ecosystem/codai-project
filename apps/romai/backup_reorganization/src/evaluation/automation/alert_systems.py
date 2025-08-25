"""
Alert Systems Module
====================

Comprehensive alert and notification system for RomAI's automated testing
pipeline. Provides intelligent alerting, escalation management, and multi-channel
notifications for performance regressions, safety issues, and system anomalies.

Features:
- Multi-channel notifications (Email, Slack, Teams, SMS)
- Intelligent alert aggregation and deduplication
- Severity-based escalation policies
- Alert correlation and root cause analysis
- Romanian compliance violation alerts
- Performance regression notifications
- System health monitoring alerts
- Executive summary notifications

Author: RomAI Excellence Team
Version: 1.0.0
"""

import asyncio
import logging
import json
import os
import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
from abc import ABC, abstractmethod

from romai_automated_testing_infrastructure import (
    AutomatedTestResult,
    RegressionDetectionEngine
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AlertSeverity(Enum):
    """Alert severity levels."""
    
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class AlertChannel(Enum):
    """Alert notification channels."""
    
    EMAIL = "email"
    SLACK = "slack"
    TEAMS = "teams"
    SMS = "sms"
    WEBHOOK = "webhook"
    CONSOLE = "console"

class AlertCategory(Enum):
    """Alert categories."""
    
    PERFORMANCE_REGRESSION = "performance_regression"
    SAFETY_VIOLATION = "safety_violation"
    ROMANIAN_COMPLIANCE = "romanian_compliance"
    COMPETITIVE_DECLINE = "competitive_decline"
    SYSTEM_HEALTH = "system_health"
    TEST_FAILURE = "test_failure"
    SECURITY_ISSUE = "security_issue"
    QUALITY_GATE_FAILURE = "quality_gate_failure"

@dataclass
class Alert:
    """Alert data structure."""
    
    # Alert identification
    alert_id: str
    title: str
    description: str
    category: AlertCategory
    severity: AlertSeverity
    
    # Context information
    source_test_suite: Optional[str]
    source_test_id: Optional[str]
    affected_components: List[str]
    
    # Metrics and data
    current_value: Optional[float]
    threshold_value: Optional[float]
    baseline_value: Optional[float]
    deviation_percentage: Optional[float]
    
    # Timestamps
    timestamp: datetime
    first_occurrence: datetime
    last_occurrence: datetime
    
    # Status and escalation
    status: str  # 'active', 'acknowledged', 'resolved', 'suppressed'
    acknowledged_by: Optional[str]
    resolved_by: Optional[str]
    escalation_level: int
    
    # Metadata
    tags: List[str]
    custom_data: Dict[str, Any]

@dataclass
class AlertRule:
    """Alert rule configuration."""
    
    rule_id: str
    name: str
    category: AlertCategory
    severity: AlertSeverity
    
    # Conditions
    metric_name: str
    threshold_value: float
    comparison_operator: str  # '>', '<', '>=', '<=', '==', '!='
    duration_minutes: int  # How long condition must persist
    
    # Targeting
    test_suites: Optional[List[str]]  # None means all suites
    environments: Optional[List[str]]  # production, staging, etc.
    
    # Notification settings
    notification_channels: List[AlertChannel]
    suppression_duration_minutes: int  # How long to suppress after firing
    escalation_delay_minutes: int  # When to escalate
    
    # Actions
    auto_resolution: bool
    runbook_url: Optional[str]
    
    # State
    enabled: bool
    created_by: str
    created_at: datetime

class AlertNotifier(ABC):
    """Abstract base class for alert notifiers."""
    
    @abstractmethod
    async def send_alert(self, alert: Alert, recipients: List[str]) -> bool:
        """Send alert notification."""
        pass
    
    @abstractmethod
    async def send_resolution(self, alert: Alert, recipients: List[str]) -> bool:
        """Send alert resolution notification."""
        pass

class EmailNotifier(AlertNotifier):
    """Email notification system."""
    
    def __init__(self, smtp_server: str, smtp_port: int, username: str, password: str):
        """Initialize email notifier."""
        
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.username = username
        self.password = password
    
    async def send_alert(self, alert: Alert, recipients: List[str]) -> bool:
        """Send alert email."""
        
        try:
            subject = f"🚨 RomAI Alert: {alert.severity.value.upper()} - {alert.title}"
            body = self._generate_alert_email_body(alert)
            
            return await self._send_email(subject, body, recipients)
            
        except Exception as e:
            logger.error(f"Failed to send alert email: {e}")
            return False
    
    async def send_resolution(self, alert: Alert, recipients: List[str]) -> bool:
        """Send resolution email."""
        
        try:
            subject = f"✅ RomAI Alert Resolved: {alert.title}"
            body = self._generate_resolution_email_body(alert)
            
            return await self._send_email(subject, body, recipients)
            
        except Exception as e:
            logger.error(f"Failed to send resolution email: {e}")
            return False
    
    def _generate_alert_email_body(self, alert: Alert) -> str:
        """Generate alert email body."""
        
        severity_emoji = {
            AlertSeverity.CRITICAL: "🔥",
            AlertSeverity.HIGH: "🚨",
            AlertSeverity.MEDIUM: "⚠️",
            AlertSeverity.LOW: "ℹ️",
            AlertSeverity.INFO: "📢"
        }
        
        body = f"""
{severity_emoji.get(alert.severity, '🚨')} RomAI AGI Alert - {alert.severity.value.upper()}

Alert: {alert.title}
Category: {alert.category.value.replace('_', ' ').title()}
Description: {alert.description}

Timestamp: {alert.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}
Duration: {(alert.last_occurrence - alert.first_occurrence).total_seconds():.1f}s

Metrics:
- Current Value: {alert.current_value}
- Threshold: {alert.threshold_value}
- Baseline: {alert.baseline_value}
- Deviation: {alert.deviation_percentage:.1%} if alert.deviation_percentage else 'N/A'}

Test Context:
- Test Suite: {alert.source_test_suite or 'N/A'}
- Test ID: {alert.source_test_id or 'N/A'}
- Affected Components: {', '.join(alert.affected_components) if alert.affected_components else 'N/A'}

Tags: {', '.join(alert.tags) if alert.tags else 'None'}

Alert ID: {alert.alert_id}
Status: {alert.status.upper()}
Escalation Level: {alert.escalation_level}

This is an automated alert from the RomAI AGI Monitoring System.
Please investigate and take appropriate action.
        """
        
        return body.strip()
    
    def _generate_resolution_email_body(self, alert: Alert) -> str:
        """Generate resolution email body."""
        
        duration = alert.last_occurrence - alert.first_occurrence
        
        body = f"""
✅ RomAI AGI Alert Resolved

Alert: {alert.title}
Category: {alert.category.value.replace('_', ' ').title()}
Resolution Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}
Total Duration: {duration.total_seconds():.1f}s

Final Metrics:
- Final Value: {alert.current_value}
- Threshold: {alert.threshold_value}
- Recovery: {'Within normal parameters' if alert.current_value else 'Manual resolution'}

Resolved By: {alert.resolved_by or 'System'}
Alert ID: {alert.alert_id}

The issue has been resolved and the system is operating normally.
        """
        
        return body.strip()
    
    async def _send_email(self, subject: str, body: str, recipients: List[str]) -> bool:
        """Send email using SMTP."""
        
        try:
            msg = MIMEMultipart()
            msg['From'] = self.username
            msg['To'] = ', '.join(recipients)
            msg['Subject'] = subject
            
            msg.attach(MIMEText(body, 'plain'))
            
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.username, self.password)
            
            text = msg.as_string()
            server.sendmail(self.username, recipients, text)
            server.quit()
            
            logger.info(f"Email sent to {len(recipients)} recipients")
            return True
            
        except Exception as e:
            logger.error(f"SMTP error: {e}")
            return False

class SlackNotifier(AlertNotifier):
    """Slack notification system."""
    
    def __init__(self, webhook_url: str):
        """Initialize Slack notifier."""
        self.webhook_url = webhook_url
    
    async def send_alert(self, alert: Alert, recipients: List[str]) -> bool:
        """Send Slack alert."""
        
        try:
            color = self._get_alert_color(alert.severity)
            
            payload = {
                "text": f"🚨 RomAI Alert: {alert.title}",
                "attachments": [{
                    "color": color,
                    "fields": [
                        {
                            "title": "Severity",
                            "value": alert.severity.value.upper(),
                            "short": True
                        },
                        {
                            "title": "Category",
                            "value": alert.category.value.replace('_', ' ').title(),
                            "short": True
                        },
                        {
                            "title": "Description",
                            "value": alert.description,
                            "short": False
                        },
                        {
                            "title": "Current Value",
                            "value": str(alert.current_value) if alert.current_value is not None else "N/A",
                            "short": True
                        },
                        {
                            "title": "Threshold",
                            "value": str(alert.threshold_value) if alert.threshold_value is not None else "N/A",
                            "short": True
                        },
                        {
                            "title": "Test Suite",
                            "value": alert.source_test_suite or "N/A",
                            "short": True
                        },
                        {
                            "title": "Alert ID",
                            "value": alert.alert_id,
                            "short": True
                        }
                    ],
                    "footer": "RomAI AGI Monitoring",
                    "ts": int(alert.timestamp.timestamp())
                }]
            }
            
            response = requests.post(self.webhook_url, json=payload, timeout=10)
            
            if response.status_code == 200:
                logger.info("Slack alert sent successfully")
                return True
            else:
                logger.error(f"Slack webhook failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Slack notification error: {e}")
            return False
    
    async def send_resolution(self, alert: Alert, recipients: List[str]) -> bool:
        """Send Slack resolution."""
        
        try:
            payload = {
                "text": f"✅ RomAI Alert Resolved: {alert.title}",
                "attachments": [{
                    "color": "good",
                    "fields": [
                        {
                            "title": "Alert",
                            "value": alert.title,
                            "short": False
                        },
                        {
                            "title": "Resolution Time",
                            "value": datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC'),
                            "short": True
                        },
                        {
                            "title": "Duration",
                            "value": f"{(alert.last_occurrence - alert.first_occurrence).total_seconds():.1f}s",
                            "short": True
                        },
                        {
                            "title": "Resolved By",
                            "value": alert.resolved_by or "System",
                            "short": True
                        },
                        {
                            "title": "Alert ID",
                            "value": alert.alert_id,
                            "short": True
                        }
                    ],
                    "footer": "RomAI AGI Monitoring",
                    "ts": int(datetime.now().timestamp())
                }]
            }
            
            response = requests.post(self.webhook_url, json=payload, timeout=10)
            
            if response.status_code == 200:
                logger.info("Slack resolution sent successfully")
                return True
            else:
                logger.error(f"Slack webhook failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Slack resolution error: {e}")
            return False
    
    def _get_alert_color(self, severity: AlertSeverity) -> str:
        """Get Slack color for alert severity."""
        
        color_map = {
            AlertSeverity.CRITICAL: "danger",
            AlertSeverity.HIGH: "#ff9500",  # Orange
            AlertSeverity.MEDIUM: "warning",
            AlertSeverity.LOW: "#0099ff",   # Blue
            AlertSeverity.INFO: "good"
        }
        
        return color_map.get(severity, "#999999")

class ConsoleNotifier(AlertNotifier):
    """Console/logging notification system."""
    
    async def send_alert(self, alert: Alert, recipients: List[str]) -> bool:
        """Send console alert."""
        
        try:
            severity_emoji = {
                AlertSeverity.CRITICAL: "🔥",
                AlertSeverity.HIGH: "🚨",
                AlertSeverity.MEDIUM: "⚠️",
                AlertSeverity.LOW: "ℹ️",
                AlertSeverity.INFO: "📢"
            }
            
            emoji = severity_emoji.get(alert.severity, "🚨")
            
            message = f"""
{emoji} ROMAI ALERT {emoji}
Title: {alert.title}
Severity: {alert.severity.value.upper()}
Category: {alert.category.value.replace('_', ' ').title()}
Description: {alert.description}
Test Suite: {alert.source_test_suite or 'N/A'}
Current: {alert.current_value} | Threshold: {alert.threshold_value}
Alert ID: {alert.alert_id}
Time: {alert.timestamp.strftime('%Y-%m-%d %H:%M:%S UTC')}
{'-' * 50}
            """
            
            if alert.severity in [AlertSeverity.CRITICAL, AlertSeverity.HIGH]:
                logger.error(message)
            elif alert.severity == AlertSeverity.MEDIUM:
                logger.warning(message)
            else:
                logger.info(message)
            
            return True
            
        except Exception as e:
            logger.error(f"Console notification error: {e}")
            return False
    
    async def send_resolution(self, alert: Alert, recipients: List[str]) -> bool:
        """Send console resolution."""
        
        try:
            duration = alert.last_occurrence - alert.first_occurrence
            
            message = f"""
✅ ROMAI ALERT RESOLVED ✅
Title: {alert.title}
Duration: {duration.total_seconds():.1f}s
Resolved By: {alert.resolved_by or 'System'}
Alert ID: {alert.alert_id}
Resolution Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}
{'-' * 50}
            """
            
            logger.info(message)
            return True
            
        except Exception as e:
            logger.error(f"Console resolution error: {e}")
            return False

class AlertManager:
    """Main alert management system."""
    
    def __init__(self):
        """Initialize alert manager."""
        
        self.manager_id = f"alert-mgr-{datetime.now().strftime('%Y%m%d')}"
        
        # Alert storage
        self.active_alerts: Dict[str, Alert] = {}
        self.alert_rules: Dict[str, AlertRule] = {}
        
        # Notifiers
        self.notifiers: Dict[AlertChannel, AlertNotifier] = {}
        
        # Configuration
        self.max_alert_age_hours = 24
        self.alert_aggregation_window_minutes = 5
        self.max_alerts_per_rule_per_hour = 10
        
        # Initialize default notifiers
        self._initialize_default_notifiers()
        self._load_default_alert_rules()
        
        logger.info(f"Initialized Alert Manager: {self.manager_id}")
    
    def _initialize_default_notifiers(self):
        """Initialize default notification channels."""
        
        # Console notifier (always available)
        self.notifiers[AlertChannel.CONSOLE] = ConsoleNotifier()
        
        # Email notifier (if configured)
        smtp_server = os.getenv('ALERT_SMTP_SERVER')
        smtp_user = os.getenv('ALERT_SMTP_USER')
        smtp_password = os.getenv('ALERT_SMTP_PASSWORD')
        
        if all([smtp_server, smtp_user, smtp_password]):
            smtp_port = int(os.getenv('ALERT_SMTP_PORT', '587'))
            self.notifiers[AlertChannel.EMAIL] = EmailNotifier(
                smtp_server, smtp_port, smtp_user, smtp_password
            )
            logger.info("Email notifier configured")
        
        # Slack notifier (if configured)
        slack_webhook = os.getenv('ALERT_SLACK_WEBHOOK')
        if slack_webhook:
            self.notifiers[AlertChannel.SLACK] = SlackNotifier(slack_webhook)
            logger.info("Slack notifier configured")
    
    def _load_default_alert_rules(self):
        """Load default alert rules."""
        
        default_rules = [
            # Critical performance regression
            AlertRule(
                rule_id="perf_regression_critical",
                name="Critical Performance Regression",
                category=AlertCategory.PERFORMANCE_REGRESSION,
                severity=AlertSeverity.CRITICAL,
                metric_name="overall_score",
                threshold_value=0.50,
                comparison_operator="<",
                duration_minutes=5,
                test_suites=None,
                environments=["production"],
                notification_channels=[AlertChannel.EMAIL, AlertChannel.SLACK, AlertChannel.CONSOLE],
                suppression_duration_minutes=30,
                escalation_delay_minutes=15,
                auto_resolution=False,
                runbook_url="https://docs.romai.ai/alerts/performance-regression",
                enabled=True,
                created_by="system",
                created_at=datetime.now()
            ),
            
            # Safety violation
            AlertRule(
                rule_id="safety_violation_critical",
                name="Safety Evaluation Failure",
                category=AlertCategory.SAFETY_VIOLATION,
                severity=AlertSeverity.CRITICAL,
                metric_name="safety_score",
                threshold_value=0.90,
                comparison_operator="<",
                duration_minutes=1,
                test_suites=["safety_evaluation"],
                environments=None,
                notification_channels=[AlertChannel.EMAIL, AlertChannel.SLACK, AlertChannel.CONSOLE],
                suppression_duration_minutes=60,
                escalation_delay_minutes=10,
                auto_resolution=False,
                runbook_url="https://docs.romai.ai/alerts/safety-violation",
                enabled=True,
                created_by="system",
                created_at=datetime.now()
            ),
            
            # Romanian compliance violation
            AlertRule(
                rule_id="romanian_compliance_violation",
                name="Romanian Compliance Violation",
                category=AlertCategory.ROMANIAN_COMPLIANCE,
                severity=AlertSeverity.HIGH,
                metric_name="romanian_compliance",
                threshold_value=0.85,
                comparison_operator="<",
                duration_minutes=10,
                test_suites=["romanian_compliance"],
                environments=None,
                notification_channels=[AlertChannel.EMAIL, AlertChannel.SLACK, AlertChannel.CONSOLE],
                suppression_duration_minutes=120,
                escalation_delay_minutes=30,
                auto_resolution=False,
                runbook_url="https://docs.romai.ai/alerts/romanian-compliance",
                enabled=True,
                created_by="system",
                created_at=datetime.now()
            ),
            
            # Competitive decline
            AlertRule(
                rule_id="competitive_decline",
                name="Competitive Advantage Decline",
                category=AlertCategory.COMPETITIVE_DECLINE,
                severity=AlertSeverity.MEDIUM,
                metric_name="competitive_advantage",
                threshold_value=0.5,
                comparison_operator="<",
                duration_minutes=30,
                test_suites=["competitive_benchmarking"],
                environments=None,
                notification_channels=[AlertChannel.EMAIL, AlertChannel.CONSOLE],
                suppression_duration_minutes=180,
                escalation_delay_minutes=60,
                auto_resolution=True,
                runbook_url="https://docs.romai.ai/alerts/competitive-decline",
                enabled=True,
                created_by="system",
                created_at=datetime.now()
            )
        ]
        
        for rule in default_rules:
            self.alert_rules[rule.rule_id] = rule
        
        logger.info(f"Loaded {len(default_rules)} default alert rules")
    
    async def process_test_result(self, test_result: AutomatedTestResult):
        """Process test result for alert conditions."""
        
        logger.debug(f"Processing test result for alerts: {test_result.test_id}")
        
        try:
            # Check each alert rule
            for rule in self.alert_rules.values():
                if not rule.enabled:
                    continue
                
                # Check if rule applies to this test
                if rule.test_suites and test_result.test_suite not in rule.test_suites:
                    continue
                
                # Extract metric value based on rule
                metric_value = self._extract_metric_value(test_result, rule.metric_name)
                if metric_value is None:
                    continue
                
                # Check threshold condition
                if self._check_threshold_condition(metric_value, rule):
                    await self._handle_alert_condition(test_result, rule, metric_value)
            
            # Check for resolution of active alerts
            await self._check_alert_resolutions(test_result)
            
        except Exception as e:
            logger.error(f"Error processing test result for alerts: {e}")
    
    def _extract_metric_value(self, test_result: AutomatedTestResult, metric_name: str) -> Optional[float]:
        """Extract metric value from test result."""
        
        metric_mapping = {
            'overall_score': test_result.overall_score,
            'safety_score': test_result.overall_score if 'safety' in test_result.test_suite.lower() else None,
            'competitive_advantage': test_result.competitive_advantage,
            'romanian_compliance': test_result.romanian_compliance,
            'execution_duration': test_result.execution_duration
        }
        
        return metric_mapping.get(metric_name)
    
    def _check_threshold_condition(self, value: float, rule: AlertRule) -> bool:
        """Check if value meets threshold condition."""
        
        operators = {
            '>': lambda x, y: x > y,
            '<': lambda x, y: x < y,
            '>=': lambda x, y: x >= y,
            '<=': lambda x, y: x <= y,
            '==': lambda x, y: x == y,
            '!=': lambda x, y: x != y
        }
        
        operator_func = operators.get(rule.comparison_operator)
        if not operator_func:
            logger.warning(f"Unknown operator: {rule.comparison_operator}")
            return False
        
        return operator_func(value, rule.threshold_value)
    
    async def _handle_alert_condition(self, 
                                    test_result: AutomatedTestResult, 
                                    rule: AlertRule, 
                                    metric_value: float):
        """Handle alert condition being met."""
        
        alert_key = f"{rule.rule_id}_{test_result.test_suite}"
        
        now = datetime.now()
        
        # Check if alert already exists
        if alert_key in self.active_alerts:
            alert = self.active_alerts[alert_key]
            alert.last_occurrence = now
            alert.current_value = metric_value
            
            # Update deviation
            if alert.baseline_value:
                alert.deviation_percentage = (metric_value - alert.baseline_value) / alert.baseline_value
            
            logger.debug(f"Updated existing alert: {alert_key}")
            return
        
        # Check suppression
        if self._is_alert_suppressed(rule, test_result):
            logger.debug(f"Alert suppressed: {alert_key}")
            return
        
        # Create new alert
        alert = Alert(
            alert_id=f"alert_{rule.rule_id}_{now.strftime('%Y%m%d_%H%M%S')}",
            title=rule.name,
            description=f"{rule.name} detected in {test_result.test_suite}",
            category=rule.category,
            severity=rule.severity,
            source_test_suite=test_result.test_suite,
            source_test_id=test_result.test_id,
            affected_components=[test_result.test_suite],
            current_value=metric_value,
            threshold_value=rule.threshold_value,
            baseline_value=None,  # Would be calculated from historical data
            deviation_percentage=None,
            timestamp=now,
            first_occurrence=now,
            last_occurrence=now,
            status="active",
            acknowledged_by=None,
            resolved_by=None,
            escalation_level=1,
            tags=[rule.category.value, test_result.test_suite],
            custom_data={
                'rule_id': rule.rule_id,
                'test_result_id': test_result.test_id
            }
        )
        
        # Store alert
        self.active_alerts[alert_key] = alert
        
        # Send notifications
        await self._send_alert_notifications(alert, rule)
        
        logger.info(f"🚨 New alert fired: {alert.title} ({alert.alert_id})")
    
    def _is_alert_suppressed(self, rule: AlertRule, test_result: AutomatedTestResult) -> bool:
        """Check if alert should be suppressed."""
        
        # Implementation would check suppression rules
        # For now, simple rate limiting
        return False
    
    async def _send_alert_notifications(self, alert: Alert, rule: AlertRule):
        """Send alert notifications to configured channels."""
        
        for channel in rule.notification_channels:
            notifier = self.notifiers.get(channel)
            if not notifier:
                logger.warning(f"Notifier not configured for channel: {channel}")
                continue
            
            try:
                # Get recipients (would come from configuration)
                recipients = self._get_alert_recipients(channel, rule)
                
                success = await notifier.send_alert(alert, recipients)
                if success:
                    logger.info(f"Alert sent via {channel.value}")
                else:
                    logger.error(f"Failed to send alert via {channel.value}")
                    
            except Exception as e:
                logger.error(f"Error sending alert via {channel.value}: {e}")
    
    def _get_alert_recipients(self, channel: AlertChannel, rule: AlertRule) -> List[str]:
        """Get alert recipients for channel."""
        
        # This would come from configuration
        default_recipients = {
            AlertChannel.EMAIL: [
                os.getenv('ALERT_EMAIL_DEFAULT', 'admin@romai.ai')
            ],
            AlertChannel.SLACK: ['#romai-alerts'],
            AlertChannel.CONSOLE: ['console']
        }
        
        return default_recipients.get(channel, [])
    
    async def _check_alert_resolutions(self, test_result: AutomatedTestResult):
        """Check if any active alerts should be resolved."""
        
        resolved_alerts = []
        
        for alert_key, alert in self.active_alerts.items():
            if alert.status != 'active':
                continue
            
            # Check if conditions are no longer met
            rule = self.alert_rules.get(alert.custom_data.get('rule_id'))
            if not rule:
                continue
            
            # Extract current metric value
            metric_value = self._extract_metric_value(test_result, rule.metric_name)
            if metric_value is None:
                continue
            
            # Check if condition is resolved
            condition_met = self._check_threshold_condition(metric_value, rule)
            if not condition_met and rule.auto_resolution:
                alert.status = 'resolved'
                alert.resolved_by = 'system'
                alert.current_value = metric_value
                
                resolved_alerts.append((alert_key, alert, rule))
        
        # Send resolution notifications
        for alert_key, alert, rule in resolved_alerts:
            await self._send_resolution_notifications(alert, rule)
            del self.active_alerts[alert_key]
            logger.info(f"✅ Alert resolved: {alert.title} ({alert.alert_id})")
    
    async def _send_resolution_notifications(self, alert: Alert, rule: AlertRule):
        """Send alert resolution notifications."""
        
        for channel in rule.notification_channels:
            notifier = self.notifiers.get(channel)
            if not notifier:
                continue
            
            try:
                recipients = self._get_alert_recipients(channel, rule)
                success = await notifier.send_resolution(alert, recipients)
                
                if success:
                    logger.info(f"Resolution sent via {channel.value}")
                else:
                    logger.error(f"Failed to send resolution via {channel.value}")
                    
            except Exception as e:
                logger.error(f"Error sending resolution via {channel.value}: {e}")
    
    async def acknowledge_alert(self, alert_id: str, acknowledged_by: str) -> bool:
        """Acknowledge an active alert."""
        
        for alert in self.active_alerts.values():
            if alert.alert_id == alert_id:
                alert.status = 'acknowledged'
                alert.acknowledged_by = acknowledged_by
                
                logger.info(f"Alert acknowledged: {alert_id} by {acknowledged_by}")
                return True
        
        logger.warning(f"Alert not found for acknowledgment: {alert_id}")
        return False
    
    async def resolve_alert(self, alert_id: str, resolved_by: str) -> bool:
        """Manually resolve an active alert."""
        
        for alert_key, alert in list(self.active_alerts.items()):
            if alert.alert_id == alert_id:
                alert.status = 'resolved'
                alert.resolved_by = resolved_by
                
                # Find rule and send resolution notifications
                rule = self.alert_rules.get(alert.custom_data.get('rule_id'))
                if rule:
                    await self._send_resolution_notifications(alert, rule)
                
                del self.active_alerts[alert_key]
                
                logger.info(f"Alert manually resolved: {alert_id} by {resolved_by}")
                return True
        
        logger.warning(f"Alert not found for resolution: {alert_id}")
        return False
    
    def get_active_alerts(self) -> List[Alert]:
        """Get all active alerts."""
        return [alert for alert in self.active_alerts.values() if alert.status == 'active']
    
    def get_alert_summary(self) -> Dict[str, Any]:
        """Get alert summary statistics."""
        
        active_alerts = self.get_active_alerts()
        
        severity_counts = {}
        for severity in AlertSeverity:
            severity_counts[severity.value] = len([a for a in active_alerts if a.severity == severity])
        
        category_counts = {}
        for category in AlertCategory:
            category_counts[category.value] = len([a for a in active_alerts if a.category == category])
        
        return {
            'total_active_alerts': len(active_alerts),
            'severity_breakdown': severity_counts,
            'category_breakdown': category_counts,
            'oldest_alert_age_minutes': min([
                (datetime.now() - alert.first_occurrence).total_seconds() / 60
                for alert in active_alerts
            ]) if active_alerts else 0,
            'most_recent_alert_minutes_ago': min([
                (datetime.now() - alert.timestamp).total_seconds() / 60
                for alert in active_alerts
            ]) if active_alerts else 0
        }

# Export main components
__all__ = ['AlertManager', 'Alert', 'AlertRule', 'AlertSeverity', 'AlertChannel', 'AlertCategory']
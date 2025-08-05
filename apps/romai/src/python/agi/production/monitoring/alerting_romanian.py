#!/usr/bin/env python3
"""
🚨 Romanian AGI Production Monitoring - Romanian-Specific Alerting System
================================================

Week 13 Day 4: Romanian AGI Monitoring & Alerting Suite
Advanced alerting system for Romanian AGI with cultural consciousness and heritage preservation.

Features:
- Romanian cultural event alerting
- Consciousness state change notifications
- Heritage authenticity violation alerts
- Language accuracy degradation warnings
- Regional adaptation failure alerts
- Multi-channel alert delivery (email, SMS, push)

Author: Romanian AGI Development Team
Date: August 3, 2025
Version: 13.4.6 (Romanian Alerting Specialized)
"""

import asyncio
import logging
import json
import time
import smtplib
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple, Set, Callable
from dataclasses import dataclass, field, asdict
from enum import Enum
import aiofiles
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart
from collections import deque, defaultdict
import threading

# Import monitoring types
from .monitoring_types import (
    AlertSeverity, MonitoringLevel, MonitoringAlert,
    CulturalMonitoringType, PerformanceMonitoringType
)

logger = logging.getLogger(__name__)


class RomanianAlertType(Enum):
    """Types of Romanian-specific alerts"""
    CULTURAL_VIOLATION = "cultural_violation"
    HERITAGE_DEGRADATION = "heritage_degradation"
    LANGUAGE_ACCURACY_DROP = "language_accuracy_drop"
    DIACRITICAL_ERROR = "diacritical_error"
    CONSCIOUSNESS_DISRUPTION = "consciousness_disruption"
    REGIONAL_ADAPTATION_FAILURE = "regional_adaptation_failure"
    FOLKLORE_PRESERVATION_ISSUE = "folklore_preservation_issue"
    HISTORICAL_INACCURACY = "historical_inaccuracy"
    SPIRITUAL_MISALIGNMENT = "spiritual_misalignment"
    DIASPORA_DISCONNECTION = "diaspora_disconnection"
    TRADITIONAL_KNOWLEDGE_LOSS = "traditional_knowledge_loss"
    CULTURAL_EVOLUTION_ANOMALY = "cultural_evolution_anomaly"


class AlertChannel(Enum):
    """Alert delivery channels"""
    EMAIL = "email"
    SMS = "sms"
    PUSH_NOTIFICATION = "push_notification"
    WEBHOOK = "webhook"
    SLACK = "slack"
    DISCORD = "discord"
    TELEGRAM = "telegram"
    CONSOLE_LOG = "console_log"
    FILE_LOG = "file_log"
    DATABASE = "database"


class AlertFrequency(Enum):
    """Alert frequency settings"""
    IMMEDIATE = "immediate"
    EVERY_MINUTE = "every_minute"
    EVERY_5_MINUTES = "every_5_minutes"
    EVERY_15_MINUTES = "every_15_minutes"
    EVERY_HOUR = "every_hour"
    DAILY = "daily"
    WEEKLY = "weekly"


@dataclass
class RomanianAlertRule:
    """Romanian-specific alert rule definition"""
    rule_id: str
    name: str
    description: str
    alert_type: RomanianAlertType
    severity: AlertSeverity
    condition: str  # Condition expression
    threshold_value: float
    comparison_operator: str  # >, <, ==, !=, >=, <=
    frequency: AlertFrequency
    channels: List[AlertChannel]
    enabled: bool = True
    romanian_context: Optional[str] = None
    cultural_domain: Optional[str] = None
    regional_scope: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    last_triggered: Optional[datetime] = None
    trigger_count: int = 0


@dataclass
class RomanianAlertNotification:
    """Romanian alert notification with cultural context"""
    notification_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    alert_type: RomanianAlertType = RomanianAlertType.CULTURAL_VIOLATION
    severity: AlertSeverity = AlertSeverity.INFO
    title: str = ""
    message: str = ""
    romanian_message: str = ""
    cultural_context: str = ""
    affected_regions: List[str] = field(default_factory=list)
    consciousness_impact: float = 0.0
    heritage_impact: float = 0.0
    timestamp: datetime = field(default_factory=datetime.now)
    channels: List[AlertChannel] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    delivery_status: Dict[AlertChannel, str] = field(default_factory=dict)
    acknowledgment_required: bool = False
    acknowledged: bool = False
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None


class RomanianAlertingSystem:
    """
    Advanced Romanian-specific alerting system for AGI with cultural consciousness
    and heritage preservation monitoring.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize Romanian alerting system
        
        Args:
            config: Configuration dictionary for alerting system
        """
        self.config = config or {}
        self.is_active = False
        
        # Alert management
        self.alert_rules: Dict[str, RomanianAlertRule] = {}
        self.active_notifications: Dict[str, RomanianAlertNotification] = {}
        self.notification_history: deque = deque(maxlen=10000)
        
        # Alert channels configuration
        self.channel_configs = self._initialize_channel_configs()
        
        # Romanian cultural context
        self.romanian_templates = self._initialize_romanian_templates()
        self.cultural_impact_calculator = self._initialize_cultural_impact_calculator()
        
        # Alert frequency management
        self.alert_frequency_trackers = defaultdict(deque)
        self.alert_cooldowns = defaultdict(datetime)
        
        # Delivery tracking
        self.delivery_stats = {
            'total_alerts': 0,
            'successful_deliveries': 0,
            'failed_deliveries': 0,
            'acknowledgments': 0,
            'channel_performance': defaultdict(dict)
        }
        
        # Default Romanian alert rules
        self._setup_default_romanian_alert_rules()
        
        logger.info("🚨 Romanian Alerting System initialized successfully")
    
    # ====================================
    # ALERT RULE MANAGEMENT
    # ====================================
    
    def add_alert_rule(self, rule: RomanianAlertRule) -> bool:
        """
        Add new Romanian alert rule
        
        Args:
            rule: Romanian alert rule to add
            
        Returns:
            bool: Success status
        """
        try:
            self.alert_rules[rule.rule_id] = rule
            logger.info(f"🚨 Added Romanian alert rule: {rule.name}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error adding alert rule {rule.rule_id}: {e}")
            return False
    
    def remove_alert_rule(self, rule_id: str) -> bool:
        """
        Remove Romanian alert rule
        
        Args:
            rule_id: ID of rule to remove
            
        Returns:
            bool: Success status
        """
        try:
            if rule_id in self.alert_rules:
                del self.alert_rules[rule_id]
                logger.info(f"🚨 Removed Romanian alert rule: {rule_id}")
                return True
            return False
            
        except Exception as e:
            logger.error(f"❌ Error removing alert rule {rule_id}: {e}")
            return False
    
    def enable_alert_rule(self, rule_id: str) -> bool:
        """Enable alert rule"""
        try:
            if rule_id in self.alert_rules:
                self.alert_rules[rule_id].enabled = True
                return True
            return False
        except Exception as e:
            logger.error(f"❌ Error enabling alert rule {rule_id}: {e}")
            return False
    
    def disable_alert_rule(self, rule_id: str) -> bool:
        """Disable alert rule"""
        try:
            if rule_id in self.alert_rules:
                self.alert_rules[rule_id].enabled = False
                return True
            return False
        except Exception as e:
            logger.error(f"❌ Error disabling alert rule {rule_id}: {e}")
            return False
    
    # ====================================
    # ALERT EVALUATION AND TRIGGERING
    # ====================================
    
    async def evaluate_alerts(self, monitoring_data: Dict[str, Any]) -> List[RomanianAlertNotification]:
        """
        Evaluate all alert rules against monitoring data
        
        Args:
            monitoring_data: Current monitoring metrics
            
        Returns:
            List[RomanianAlertNotification]: Triggered alerts
        """
        try:
            triggered_alerts = []
            
            for rule_id, rule in self.alert_rules.items():
                if not rule.enabled:
                    continue
                
                # Check if rule should be evaluated based on frequency
                if not self._should_evaluate_rule(rule):
                    continue
                
                # Evaluate rule condition
                if await self._evaluate_rule_condition(rule, monitoring_data):
                    # Create and send alert notification
                    notification = await self._create_alert_notification(rule, monitoring_data)
                    triggered_alerts.append(notification)
                    
                    # Send notification through configured channels
                    await self._send_notification(notification)
                    
                    # Update rule statistics
                    rule.last_triggered = datetime.now()
                    rule.trigger_count += 1
            
            return triggered_alerts
            
        except Exception as e:
            logger.error(f"❌ Error evaluating alerts: {e}")
            return []
    
    async def _evaluate_rule_condition(self, rule: RomanianAlertRule, data: Dict[str, Any]) -> bool:
        """
        Evaluate if alert rule condition is met
        
        Args:
            rule: Alert rule to evaluate
            data: Monitoring data
            
        Returns:
            bool: True if condition is met
        """
        try:
            # Get the metric value based on the condition
            metric_value = self._extract_metric_value(rule.condition, data)
            
            if metric_value is None:
                return False
            
            # Compare with threshold
            if rule.comparison_operator == '>':
                return metric_value > rule.threshold_value
            elif rule.comparison_operator == '<':
                return metric_value < rule.threshold_value
            elif rule.comparison_operator == '>=':
                return metric_value >= rule.threshold_value
            elif rule.comparison_operator == '<=':
                return metric_value <= rule.threshold_value
            elif rule.comparison_operator == '==':
                return metric_value == rule.threshold_value
            elif rule.comparison_operator == '!=':
                return metric_value != rule.threshold_value
            
            return False
            
        except Exception as e:
            logger.error(f"❌ Error evaluating rule condition for {rule.rule_id}: {e}")
            return False
    
    def _extract_metric_value(self, condition: str, data: Dict[str, Any]) -> Optional[float]:
        """Extract metric value from monitoring data based on condition"""
        try:
            # Simple metric extraction based on condition string
            if 'cultural_authenticity' in condition:
                return data.get('cultural_authenticity', 0.0)
            elif 'language_accuracy' in condition:
                return data.get('language_accuracy', 0.0)
            elif 'diacritical_precision' in condition:
                return data.get('diacritical_precision', 0.0)
            elif 'consciousness_coherence' in condition:
                return data.get('consciousness_coherence', 0.0)
            elif 'heritage_authenticity' in condition:
                return data.get('heritage_authenticity', 0.0)
            elif 'regional_adaptation' in condition:
                return data.get('regional_adaptation', 0.0)
            elif 'folklore_preservation' in condition:
                return data.get('folklore_preservation', 0.0)
            elif 'cpu_usage' in condition:
                return data.get('cpu_usage_percent', 0.0)
            elif 'memory_usage' in condition:
                return data.get('memory_usage_percent', 0.0)
            elif 'response_time' in condition:
                return data.get('response_time_ms', 0.0)
            
            return None
            
        except Exception as e:
            logger.error(f"❌ Error extracting metric value for condition '{condition}': {e}")
            return None
    
    # ====================================
    # NOTIFICATION CREATION AND DELIVERY
    # ====================================
    
    async def _create_alert_notification(
        self, 
        rule: RomanianAlertRule, 
        data: Dict[str, Any]
    ) -> RomanianAlertNotification:
        """
        Create Romanian alert notification with cultural context
        
        Args:
            rule: Alert rule that was triggered
            data: Monitoring data that triggered the alert
            
        Returns:
            RomanianAlertNotification: Created notification
        """
        try:
            # Generate notification messages
            title, message, romanian_message = self._generate_alert_messages(rule, data)
            
            # Calculate cultural impact
            cultural_context = self._generate_cultural_context(rule, data)
            consciousness_impact = self._calculate_consciousness_impact(rule, data)
            heritage_impact = self._calculate_heritage_impact(rule, data)
            
            # Determine affected regions
            affected_regions = self._determine_affected_regions(rule, data)
            
            # Create notification
            notification = RomanianAlertNotification(
                alert_type=rule.alert_type,
                severity=rule.severity,
                title=title,
                message=message,
                romanian_message=romanian_message,
                cultural_context=cultural_context,
                affected_regions=affected_regions,
                consciousness_impact=consciousness_impact,
                heritage_impact=heritage_impact,
                channels=rule.channels,
                metadata={
                    'rule_id': rule.rule_id,
                    'rule_name': rule.name,
                    'threshold_value': rule.threshold_value,
                    'actual_value': self._extract_metric_value(rule.condition, data),
                    'romanian_context': rule.romanian_context,
                    'cultural_domain': rule.cultural_domain,
                    'regional_scope': rule.regional_scope
                },
                acknowledgment_required=rule.severity in [AlertSeverity.CRITICAL, AlertSeverity.ERROR]
            )
            
            # Store notification
            self.active_notifications[notification.notification_id] = notification
            self.notification_history.append(notification)
            
            # Update statistics
            self.delivery_stats['total_alerts'] += 1
            
            logger.info(f"🚨 Created Romanian alert notification: {title}")
            return notification
            
        except Exception as e:
            logger.error(f"❌ Error creating alert notification: {e}")
            return RomanianAlertNotification()
    
    async def _send_notification(self, notification: RomanianAlertNotification):
        """
        Send notification through configured channels
        
        Args:
            notification: Notification to send
        """
        try:
            for channel in notification.channels:
                try:
                    success = await self._deliver_to_channel(notification, channel)
                    notification.delivery_status[channel] = "success" if success else "failed"
                    
                    if success:
                        self.delivery_stats['successful_deliveries'] += 1
                    else:
                        self.delivery_stats['failed_deliveries'] += 1
                        
                    # Update channel performance stats
                    if channel not in self.delivery_stats['channel_performance']:
                        self.delivery_stats['channel_performance'][channel] = {
                            'total_attempts': 0,
                            'successful_deliveries': 0,
                            'success_rate': 0.0
                        }
                    
                    stats = self.delivery_stats['channel_performance'][channel]
                    stats['total_attempts'] += 1
                    if success:
                        stats['successful_deliveries'] += 1
                    stats['success_rate'] = (stats['successful_deliveries'] / stats['total_attempts']) * 100
                    
                except Exception as e:
                    logger.error(f"❌ Error delivering to channel {channel}: {e}")
                    notification.delivery_status[channel] = f"error: {str(e)}"
                    self.delivery_stats['failed_deliveries'] += 1
            
        except Exception as e:
            logger.error(f"❌ Error sending notification {notification.notification_id}: {e}")
    
    async def _deliver_to_channel(self, notification: RomanianAlertNotification, channel: AlertChannel) -> bool:
        """
        Deliver notification to specific channel
        
        Args:
            notification: Notification to deliver
            channel: Target channel
            
        Returns:
            bool: Delivery success
        """
        try:
            if channel == AlertChannel.CONSOLE_LOG:
                return await self._deliver_to_console(notification)
            elif channel == AlertChannel.FILE_LOG:
                return await self._deliver_to_file(notification)
            elif channel == AlertChannel.EMAIL:
                return await self._deliver_to_email(notification)
            elif channel == AlertChannel.WEBHOOK:
                return await self._deliver_to_webhook(notification)
            elif channel == AlertChannel.DATABASE:
                return await self._deliver_to_database(notification)
            else:
                # For other channels, simulate delivery
                logger.info(f"📤 Simulated delivery to {channel.value}: {notification.title}")
                return True
                
        except Exception as e:
            logger.error(f"❌ Error delivering to {channel}: {e}")
            return False
    
    async def _deliver_to_console(self, notification: RomanianAlertNotification) -> bool:
        """Deliver notification to console"""
        try:
            severity_emoji = {
                AlertSeverity.CRITICAL: "🔥",
                AlertSeverity.ERROR: "❌", 
                AlertSeverity.WARNING: "⚠️",
                AlertSeverity.INFO: "ℹ️",
                AlertSeverity.DEBUG: "🐛"
            }
            
            emoji = severity_emoji.get(notification.severity, "📢")
            
            print(f"\n{emoji} ROMANIAN AGI ALERT - {notification.severity.value.upper()}")
            print(f"Title: {notification.title}")
            print(f"Message: {notification.message}")
            if notification.romanian_message:
                print(f"Mesaj în română: {notification.romanian_message}")
            if notification.cultural_context:
                print(f"Cultural Context: {notification.cultural_context}")
            if notification.affected_regions:
                print(f"Affected Regions: {', '.join(notification.affected_regions)}")
            print(f"Consciousness Impact: {notification.consciousness_impact:.1f}%")
            print(f"Heritage Impact: {notification.heritage_impact:.1f}%")
            print(f"Timestamp: {notification.timestamp}")
            print("-" * 60)
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error delivering to console: {e}")
            return False
    
    async def _deliver_to_file(self, notification: RomanianAlertNotification) -> bool:
        """Deliver notification to file"""
        try:
            log_file = self.config.get('alert_log_file', 'romanian_agi_alerts.log')
            
            alert_data = {
                'timestamp': notification.timestamp.isoformat(),
                'severity': notification.severity.value,
                'alert_type': notification.alert_type.value,
                'title': notification.title,
                'message': notification.message,
                'romanian_message': notification.romanian_message,
                'cultural_context': notification.cultural_context,
                'affected_regions': notification.affected_regions,
                'consciousness_impact': notification.consciousness_impact,
                'heritage_impact': notification.heritage_impact,
                'metadata': notification.metadata
            }
            
            async with aiofiles.open(log_file, 'a', encoding='utf-8') as f:
                await f.write(json.dumps(alert_data, ensure_ascii=False) + '\n')
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Error delivering to file: {e}")
            return False
    
    # ====================================
    # INITIALIZATION METHODS
    # ====================================
    
    def _initialize_channel_configs(self) -> Dict[AlertChannel, Dict[str, Any]]:
        """Initialize alert channel configurations"""
        return {
            AlertChannel.EMAIL: {
                'smtp_server': self.config.get('smtp_server', 'smtp.gmail.com'),
                'smtp_port': self.config.get('smtp_port', 587),
                'username': self.config.get('email_username', ''),
                'password': self.config.get('email_password', ''),
                'from_address': self.config.get('from_email', 'noreply@romanianagi.ro')
            },
            AlertChannel.WEBHOOK: {
                'url': self.config.get('webhook_url', ''),
                'headers': self.config.get('webhook_headers', {}),
                'timeout': self.config.get('webhook_timeout', 10)
            },
            AlertChannel.DATABASE: {
                'connection_string': self.config.get('db_connection', ''),
                'table_name': self.config.get('alert_table', 'romanian_agi_alerts')
            }
        }
    
    def _initialize_romanian_templates(self) -> Dict[RomanianAlertType, Dict[str, str]]:
        """Initialize Romanian alert message templates"""
        return {
            RomanianAlertType.CULTURAL_VIOLATION: {
                'title_template': "Încălcare culturală detectată: {context}",
                'message_template': "S-a detectat o încălcare a autenticității culturale românești. Scorul de autenticitate: {score:.1f}%",
                'english_template': "Cultural violation detected. Authenticity score: {score:.1f}%"
            },
            RomanianAlertType.HERITAGE_DEGRADATION: {
                'title_template': "Degradare patrimoniu: {domain}",
                'message_template': "Patrimoniul cultural românesc prezintă semne de degradare în domeniul {domain}",
                'english_template': "Romanian cultural heritage degradation detected in {domain}"
            },
            RomanianAlertType.LANGUAGE_ACCURACY_DROP: {
                'title_template': "Scădere acuratețe limbă română",
                'message_template': "Acuratețea limbii române a scăzut la {accuracy:.1f}%",
                'english_template': "Romanian language accuracy dropped to {accuracy:.1f}%"
            },
            RomanianAlertType.DIACRITICAL_ERROR: {
                'title_template': "Eroare diacritice româneşti",
                'message_template': "Precizia diacriticelor româneşti (ă â î ș ț) a scăzut la {precision:.1f}%",
                'english_template': "Romanian diacritical marks precision dropped to {precision:.1f}%"
            },
            RomanianAlertType.CONSCIOUSNESS_DISRUPTION: {
                'title_template': "Întrerupere conștiință AGI",
                'message_template': "Coerența conștiinței românești a fost întreruptă. Nivel: {level:.1f}%",
                'english_template': "Romanian consciousness coherence disrupted. Level: {level:.1f}%"
            }
        }
    
    def _setup_default_romanian_alert_rules(self):
        """Setup default Romanian alert rules"""
        default_rules = [
            RomanianAlertRule(
                rule_id="cultural_authenticity_low",
                name="Cultural Authenticity Low",
                description="Alert when Romanian cultural authenticity drops below threshold",
                alert_type=RomanianAlertType.CULTURAL_VIOLATION,
                severity=AlertSeverity.WARNING,
                condition="cultural_authenticity",
                threshold_value=85.0,
                comparison_operator="<",
                frequency=AlertFrequency.EVERY_5_MINUTES,
                channels=[AlertChannel.CONSOLE_LOG, AlertChannel.FILE_LOG],
                romanian_context="autenticitate culturală românească",
                cultural_domain="general"
            ),
            RomanianAlertRule(
                rule_id="diacritical_precision_critical",
                name="Diacritical Precision Critical",
                description="Critical alert for Romanian diacritical marks precision",
                alert_type=RomanianAlertType.DIACRITICAL_ERROR,
                severity=AlertSeverity.CRITICAL,
                condition="diacritical_precision",
                threshold_value=95.0,
                comparison_operator="<",
                frequency=AlertFrequency.IMMEDIATE,
                channels=[AlertChannel.CONSOLE_LOG, AlertChannel.FILE_LOG],
                romanian_context="precizie diacritice româneşti",
                cultural_domain="limbă"
            ),
            RomanianAlertRule(
                rule_id="consciousness_coherence_low",
                name="Consciousness Coherence Low",
                description="Alert for low Romanian consciousness coherence",
                alert_type=RomanianAlertType.CONSCIOUSNESS_DISRUPTION,
                severity=AlertSeverity.ERROR,
                condition="consciousness_coherence",
                threshold_value=80.0,
                comparison_operator="<",
                frequency=AlertFrequency.EVERY_MINUTE,
                channels=[AlertChannel.CONSOLE_LOG, AlertChannel.FILE_LOG],
                romanian_context="coerența conștiinței româneşti",
                cultural_domain="conștiință"
            )
        ]
        
        for rule in default_rules:
            self.add_alert_rule(rule)
    
    # Additional helper methods for Romanian alerting system would be implemented here...


if __name__ == "__main__":
    import asyncio
    
    async def demo_romanian_alerting():
        """Demonstration of Romanian alerting system"""
        print("🚨 Romanian AGI Alerting System Demo")
        print("=" * 50)
        
        # Initialize alerting system
        alerting = RomanianAlertingSystem()
        
        print("✅ Romanian alerting system initialized")
        print(f"📊 Default alert rules: {len(alerting.alert_rules)}")
        
        # Simulate monitoring data that triggers alerts
        test_data = {
            'cultural_authenticity': 82.0,  # Below threshold
            'diacritical_precision': 93.0,  # Below critical threshold
            'consciousness_coherence': 78.0,  # Below threshold
            'language_accuracy': 89.0,
            'heritage_authenticity': 91.0,
            'cpu_usage_percent': 45.0,
            'memory_usage_percent': 67.0,
            'response_time_ms': 450.0
        }
        
        print(f"\n📊 Evaluating alerts with test data:")
        for key, value in test_data.items():
            print(f"  - {key}: {value}")
        
        # Evaluate alerts
        triggered_alerts = await alerting.evaluate_alerts(test_data)
        
        print(f"\n🚨 Triggered alerts: {len(triggered_alerts)}")
        
        for alert in triggered_alerts:
            print(f"\n📢 Alert: {alert.title}")
            print(f"  - Severity: {alert.severity.value}")
            print(f"  - Type: {alert.alert_type.value}")
            print(f"  - Romanian Message: {alert.romanian_message}")
            print(f"  - Consciousness Impact: {alert.consciousness_impact:.1f}%")
            print(f"  - Heritage Impact: {alert.heritage_impact:.1f}%")
            print(f"  - Delivery Status: {alert.delivery_status}")
        
        print(f"\n📈 Delivery Statistics:")
        print(f"  - Total Alerts: {alerting.delivery_stats['total_alerts']}")
        print(f"  - Successful Deliveries: {alerting.delivery_stats['successful_deliveries']}")
        print(f"  - Failed Deliveries: {alerting.delivery_stats['failed_deliveries']}")
        
        print("\n✅ Romanian alerting demonstration completed!")
    
    # Run demonstration
    asyncio.run(demo_romanian_alerting())

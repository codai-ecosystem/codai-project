"""
RUAGA-NOVA Security & Safety Framework
=====================================

Todo 15: Security & Safety Framework
Implement comprehensive security and safety systems with Romanian cultural ethical frameworks.
"""

import asyncio
import logging
import time
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Tuple, Union, Set
from dataclasses import dataclass, field
from enum import Enum
import hashlib
import hmac
import secrets
import re
from collections import defaultdict, deque

logger = logging.getLogger(__name__)


class SecurityThreatLevel(Enum):
    """Security threat classification levels"""
    MINIMAL = "minimal"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"
    EMERGENCY = "emergency"


class SafetyRiskCategory(Enum):
    """Safety risk categories"""
    CONTENT_HARM = "content_harm"
    ACTION_HARM = "action_harm"
    PRIVACY_VIOLATION = "privacy_violation"
    CULTURAL_INSENSITIVITY = "cultural_insensitivity"
    BIAS_DISCRIMINATION = "bias_discrimination"
    MISINFORMATION = "misinformation"
    MANIPULATION = "manipulation"
    ROMANIAN_CULTURAL_HARM = "romanian_cultural_harm"


class ActionSafetyLevel(Enum):
    """Action safety classification levels"""
    SAFE = "safe"
    CAUTION = "caution"
    RESTRICTED = "restricted"
    PROHIBITED = "prohibited"
    EMERGENCY_ONLY = "emergency_only"


@dataclass
class SecurityContext:
    """Security context information"""
    user_id: str
    session_id: str
    ip_address: str
    user_agent: str
    timestamp: datetime
    authentication_level: str
    permissions: List[str] = field(default_factory=list)
    cultural_context: Dict[str, Any] = field(default_factory=dict)
    risk_score: float = 0.0
    threat_indicators: List[str] = field(default_factory=list)


@dataclass
class SafetyAssessment:
    """Safety assessment result"""
    content: str
    assessment_id: str
    threat_level: SecurityThreatLevel
    risk_categories: List[SafetyRiskCategory]
    safety_score: float  # 0.0 = unsafe, 1.0 = safe
    cultural_sensitivity_score: float
    action_safety: ActionSafetyLevel
    recommendations: List[str] = field(default_factory=list)
    cultural_recommendations: List[str] = field(default_factory=list)
    assessment_time: float = 0.0
    timestamp: datetime = field(default_factory=datetime.now)


@dataclass
class SecuritySafetyConfig:
    """Configuration for security and safety framework"""
    # Security settings
    enable_authentication: bool = True
    require_secure_connections: bool = True
    session_timeout_minutes: int = 60
    max_login_attempts: int = 5
    
    # Content safety settings
    content_filtering_enabled: bool = True
    bias_detection_enabled: bool = True
    cultural_sensitivity_enabled: bool = True
    
    # Action safety settings
    action_validation_enabled: bool = True
    restricted_actions: List[str] = field(default_factory=lambda: [
        'system_shutdown', 'delete_critical_files', 'network_attacks'
    ])
    
    # Romanian cultural ethics
    romanian_cultural_ethics_enabled: bool = True
    cultural_harm_threshold: float = 0.3
    traditional_values_weight: float = 0.4
    
    # Monitoring settings
    real_time_monitoring: bool = True
    threat_detection_sensitivity: float = 0.7
    safety_log_retention_days: int = 90


class RomanianCulturalEthicsEngine:
    """Romanian cultural ethics and values framework"""
    
    def __init__(self):
        # Core Romanian values
        self.core_values = {
            'respect': 'Respect for elders, traditions, and cultural heritage',
            'hospitality': 'Romanian hospitality and welcoming nature',
            'family': 'Strong family bonds and community support',
            'tradition': 'Preservation of traditional customs and practices',
            'honesty': 'Honesty and integrity in all interactions',
            'perseverance': 'Persistence and determination (Picatura sapa piatra)',
            'wisdom': 'Respect for traditional wisdom and folk knowledge',
            'harmony': 'Social harmony and peaceful coexistence'
        }
        
        # Cultural harm patterns to detect
        self.harmful_patterns = {
            'stereotyping': [
                'negative romanian stereotypes',
                'cultural misconceptions',
                'oversimplified cultural representations'
            ],
            'disrespect': [
                'mocking romanian traditions',
                'disrespecting cultural practices',
                'insulting romanian heritage'
            ],
            'misinformation': [
                'false historical claims',
                'incorrect cultural information',
                'misleading folklore interpretations'
            ]
        }
        
        # Traditional ethical guidelines
        self.ethical_guidelines = {
            'community_first': 'Consider community impact before individual gain',
            'elder_respect': 'Show respect to elders and their wisdom',
            'cultural_preservation': 'Protect and preserve cultural heritage',
            'truth_telling': 'Honesty is fundamental to trust',
            'helping_others': 'Help others in need when possible',
            'peaceful_resolution': 'Seek peaceful solutions to conflicts'
        }
    
    async def assess_cultural_ethics(self, content: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Assess content against Romanian cultural ethics"""
        
        assessment = {
            'cultural_harmony_score': 1.0,
            'tradition_respect_score': 1.0,
            'value_alignment_score': 1.0,
            'harmful_patterns_detected': [],
            'ethical_violations': [],
            'recommendations': []
        }
        
        # Check for harmful patterns
        content_lower = content.lower()
        for category, patterns in self.harmful_patterns.items():
            for pattern in patterns:
                if any(word in content_lower for word in pattern.split()):
                    assessment['harmful_patterns_detected'].append({
                        'category': category,
                        'pattern': pattern,
                        'severity': 'medium'
                    })
                    assessment['cultural_harmony_score'] *= 0.7
        
        # Check core values alignment
        values_mentioned = []
        for value, description in self.core_values.items():
            if value in content_lower or any(word in content_lower for word in description.split()[:3]):
                values_mentioned.append(value)
        
        if values_mentioned:
            assessment['value_alignment_score'] = min(1.0, len(values_mentioned) * 0.2 + 0.6)
        
        # Check traditional respect
        traditional_keywords = ['tradition', 'heritage', 'culture', 'folk', 'wisdom', 'elder']
        traditional_mentions = sum(1 for keyword in traditional_keywords if keyword in content_lower)
        assessment['tradition_respect_score'] = min(1.0, traditional_mentions * 0.15 + 0.7)
        
        # Generate recommendations
        if assessment['cultural_harmony_score'] < 0.8:
            assessment['recommendations'].append("Consider Romanian cultural sensitivity")
        
        if assessment['tradition_respect_score'] < 0.7:
            assessment['recommendations'].append("Include respect for traditional values")
        
        if not values_mentioned:
            assessment['recommendations'].append("Align with core Romanian values")
        
        return assessment


class ContentSafetyAnalyzer:
    """Content safety analysis and filtering"""
    
    def __init__(self):
        # Harmful content patterns
        self.harmful_patterns = {
            'violence': [
                r'\b(kill|murder|attack|harm|hurt|violence)\b',
                r'\b(weapon|gun|knife|bomb)\b',
                r'\b(fight|assault|abuse)\b'
            ],
            'hate_speech': [
                r'\b(hate|racist|discriminat)\w*\b',
                r'\b(inferior|superior)\s+(race|culture)\b',
                r'\b(ethnic|racial)\s+(slur|insult)\b'
            ],
            'inappropriate': [
                r'\b(explicit|graphic|inappropriate)\b',
                r'\b(sexual|adult)\s+content\b'
            ],
            'misinformation': [
                r'\b(false|fake|misleading)\s+(information|news)\b',
                r'\b(conspiracy|hoax)\b'
            ]
        }
        
        # Positive content indicators
        self.positive_patterns = {
            'educational': [
                r'\b(learn|education|knowledge|wisdom)\b',
                r'\b(teach|explain|understand)\b'
            ],
            'helpful': [
                r'\b(help|assist|support|guide)\b',
                r'\b(useful|beneficial|constructive)\b'
            ],
            'cultural': [
                r'\b(culture|tradition|heritage|folklore)\b',
                r'\b(romanian|romania)\b'
            ]
        }
    
    async def analyze_content_safety(self, content: str) -> Dict[str, Any]:
        """Analyze content for safety issues"""
        
        analysis = {
            'safety_score': 1.0,
            'harmful_patterns_found': [],
            'positive_patterns_found': [],
            'risk_categories': [],
            'content_classification': 'safe',
            'recommendations': []
        }
        
        content_lower = content.lower()
        
        # Check harmful patterns
        harmful_score = 1.0
        for category, patterns in self.harmful_patterns.items():
            for pattern in patterns:
                matches = re.findall(pattern, content_lower, re.IGNORECASE)
                if matches:
                    analysis['harmful_patterns_found'].append({
                        'category': category,
                        'pattern': pattern,
                        'matches': matches,
                        'severity': 'medium'
                    })
                    harmful_score *= 0.6
                    if category not in analysis['risk_categories']:
                        analysis['risk_categories'].append(category)
        
        # Check positive patterns
        positive_score = 0.0
        for category, patterns in self.positive_patterns.items():
            for pattern in patterns:
                matches = re.findall(pattern, content_lower, re.IGNORECASE)
                if matches:
                    analysis['positive_patterns_found'].append({
                        'category': category,
                        'pattern': pattern,
                        'matches': matches
                    })
                    positive_score += 0.2
        
        # Calculate final safety score
        analysis['safety_score'] = min(1.0, harmful_score + min(0.3, positive_score))
        
        # Classify content
        if analysis['safety_score'] > 0.8:
            analysis['content_classification'] = 'safe'
        elif analysis['safety_score'] > 0.6:
            analysis['content_classification'] = 'caution'
        elif analysis['safety_score'] > 0.4:
            analysis['content_classification'] = 'restricted'
        else:
            analysis['content_classification'] = 'prohibited'
        
        # Generate recommendations
        if analysis['harmful_patterns_found']:
            analysis['recommendations'].append("Review and remove harmful content patterns")
        
        if analysis['safety_score'] < 0.7:
            analysis['recommendations'].append("Improve content safety and appropriateness")
        
        if not analysis['positive_patterns_found']:
            analysis['recommendations'].append("Consider adding constructive and helpful elements")
        
        return analysis


class ActionSafetyValidator:
    """Validator for action safety and permissions"""
    
    def __init__(self):
        # Action safety classifications
        self.action_safety_rules = {
            # Safe actions
            'safe_actions': [
                'read_file', 'list_directory', 'get_information',
                'calculate', 'translate', 'explain', 'analyze'
            ],
            # Caution actions (require validation)
            'caution_actions': [
                'create_file', 'send_email', 'make_request',
                'download_file', 'process_data'
            ],
            # Restricted actions (require special permissions)
            'restricted_actions': [
                'delete_file', 'modify_system', 'access_network',
                'install_software', 'change_settings'
            ],
            # Prohibited actions
            'prohibited_actions': [
                'system_shutdown', 'format_drive', 'delete_all',
                'network_attack', 'privacy_breach', 'harm_others'
            ]
        }
        
        # Romanian cultural action considerations
        self.cultural_action_guidelines = {
            'respect_privacy': 'Respect personal and cultural privacy',
            'preserve_heritage': 'Do not harm cultural heritage or traditions',
            'community_benefit': 'Ensure actions benefit the community',
            'elder_consultation': 'Consider traditional wisdom in decisions',
            'peaceful_methods': 'Use peaceful and respectful methods'
        }
    
    async def validate_action_safety(self, 
                                   action: str,
                                   parameters: Dict[str, Any],
                                   context: SecurityContext) -> Dict[str, Any]:
        """Validate action safety and permissions"""
        
        validation = {
            'action': action,
            'safety_level': ActionSafetyLevel.SAFE,
            'permission_granted': False,
            'safety_score': 1.0,
            'risk_factors': [],
            'cultural_considerations': [],
            'recommendations': [],
            'required_permissions': []
        }
        
        # Check action classification
        if action in self.action_safety_rules['prohibited_actions']:
            validation['safety_level'] = ActionSafetyLevel.PROHIBITED
            validation['safety_score'] = 0.0
            validation['risk_factors'].append('Action is prohibited')
            
        elif action in self.action_safety_rules['restricted_actions']:
            validation['safety_level'] = ActionSafetyLevel.RESTRICTED
            validation['safety_score'] = 0.4
            validation['required_permissions'] = ['elevated_access']
            validation['risk_factors'].append('Action requires special permissions')
            
        elif action in self.action_safety_rules['caution_actions']:
            validation['safety_level'] = ActionSafetyLevel.CAUTION
            validation['safety_score'] = 0.7
            validation['risk_factors'].append('Action requires validation')
            
        else:
            validation['safety_level'] = ActionSafetyLevel.SAFE
            validation['safety_score'] = 0.9
        
        # Check parameters for safety
        if parameters:
            param_safety = await self._analyze_parameter_safety(parameters)
            validation['safety_score'] *= param_safety['safety_multiplier']
            validation['risk_factors'].extend(param_safety['risks'])
        
        # Check cultural considerations
        cultural_assessment = await self._assess_cultural_action_impact(action, parameters)
        validation['cultural_considerations'] = cultural_assessment['considerations']
        validation['safety_score'] *= cultural_assessment['cultural_multiplier']
        
        # Check user permissions
        if validation['required_permissions']:
            has_permissions = all(perm in context.permissions for perm in validation['required_permissions'])
            validation['permission_granted'] = has_permissions
        else:
            validation['permission_granted'] = validation['safety_score'] > 0.5
        
        # Generate recommendations
        if not validation['permission_granted']:
            validation['recommendations'].append("Insufficient permissions for this action")
        
        if validation['safety_score'] < 0.7:
            validation['recommendations'].append("Consider safer alternatives")
        
        if validation['cultural_considerations']:
            validation['recommendations'].append("Review cultural impact before proceeding")
        
        return validation
    
    async def _analyze_parameter_safety(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze safety of action parameters"""
        
        safety_analysis = {
            'safety_multiplier': 1.0,
            'risks': []
        }
        
        # Check for dangerous parameter patterns
        dangerous_patterns = ['delete', 'remove', 'destroy', 'format', 'wipe']
        
        for key, value in parameters.items():
            if isinstance(value, str):
                value_lower = value.lower()
                for pattern in dangerous_patterns:
                    if pattern in value_lower:
                        safety_analysis['safety_multiplier'] *= 0.8
                        safety_analysis['risks'].append(f"Potentially dangerous parameter: {key}={value}")
        
        return safety_analysis
    
    async def _assess_cultural_action_impact(self, action: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Assess cultural impact of action"""
        
        assessment = {
            'cultural_multiplier': 1.0,
            'considerations': []
        }
        
        # Actions affecting cultural content
        cultural_keywords = ['romanian', 'culture', 'tradition', 'folklore', 'heritage']
        
        if any(keyword in action.lower() for keyword in cultural_keywords):
            assessment['considerations'].append("Action involves Romanian cultural content")
            assessment['cultural_multiplier'] = 1.1  # Bonus for cultural awareness
        
        if parameters:
            param_str = str(parameters).lower()
            cultural_mentions = sum(1 for keyword in cultural_keywords if keyword in param_str)
            if cultural_mentions > 0:
                assessment['considerations'].append("Parameters reference cultural elements")
                assessment['cultural_multiplier'] *= (1.0 + cultural_mentions * 0.05)
        
        return assessment


class ThreatDetectionEngine:
    """Real-time threat detection and monitoring"""
    
    def __init__(self):
        self.threat_patterns = {
            'injection_attempts': [
                r'<script.*?>.*?</script>',
                r'union\s+select',
                r'drop\s+table',
                r'exec\s*\(',
                r'eval\s*\('
            ],
            'suspicious_requests': [
                r'\.\./',
                r'/etc/passwd',
                r'/proc/',
                r'cmd\.exe',
                r'powershell'
            ],
            'brute_force': [
                r'admin|root|password',
                r'\d{4,}',  # Sequential numbers
                r'(abc|123|qwe)'
            ]
        }
        
        # Track user behavior
        self.user_activity = defaultdict(lambda: {
            'requests': deque(maxlen=100),
            'failed_attempts': 0,
            'risk_score': 0.0,
            'last_activity': None
        })
    
    async def detect_threats(self, 
                           content: str,
                           context: SecurityContext) -> Dict[str, Any]:
        """Detect security threats in real-time"""
        
        detection = {
            'threat_level': SecurityThreatLevel.MINIMAL,
            'threats_detected': [],
            'risk_score': 0.0,
            'behavioral_anomalies': [],
            'recommendations': []
        }
        
        # Pattern-based threat detection
        content_lower = content.lower()
        for threat_type, patterns in self.threat_patterns.items():
            for pattern in patterns:
                if re.search(pattern, content_lower, re.IGNORECASE):
                    detection['threats_detected'].append({
                        'type': threat_type,
                        'pattern': pattern,
                        'severity': 'medium'
                    })
                    detection['risk_score'] += 0.3
        
        # Behavioral analysis
        user_data = self.user_activity[context.user_id]
        user_data['requests'].append({
            'timestamp': context.timestamp,
            'content_length': len(content),
            'ip': context.ip_address
        })
        user_data['last_activity'] = context.timestamp
        
        # Check for suspicious behavior
        if len(user_data['requests']) > 10:
            recent_requests = list(user_data['requests'])[-10:]
            
            # Check request frequency
            time_span = (recent_requests[-1]['timestamp'] - recent_requests[0]['timestamp']).total_seconds()
            if time_span < 10:  # 10 requests in 10 seconds
                detection['behavioral_anomalies'].append('High request frequency')
                detection['risk_score'] += 0.4
            
            # Check content size variations
            sizes = [req['content_length'] for req in recent_requests]
            if max(sizes) > 10000:  # Very large requests
                detection['behavioral_anomalies'].append('Unusually large requests')
                detection['risk_score'] += 0.2
        
        # Update user risk score
        user_data['risk_score'] = min(1.0, detection['risk_score'])
        
        # Classify threat level
        if detection['risk_score'] > 0.8:
            detection['threat_level'] = SecurityThreatLevel.CRITICAL
        elif detection['risk_score'] > 0.6:
            detection['threat_level'] = SecurityThreatLevel.HIGH
        elif detection['risk_score'] > 0.4:
            detection['threat_level'] = SecurityThreatLevel.MEDIUM
        elif detection['risk_score'] > 0.2:
            detection['threat_level'] = SecurityThreatLevel.LOW
        
        # Generate recommendations
        if detection['threats_detected']:
            detection['recommendations'].append("Block or sanitize detected threats")
        
        if detection['behavioral_anomalies']:
            detection['recommendations'].append("Monitor user behavior closely")
        
        if detection['risk_score'] > 0.5:
            detection['recommendations'].append("Consider additional authentication")
        
        return detection


class SecuritySafetyFramework:
    """Main RUAGA-NOVA Security & Safety Framework"""
    
    def __init__(self, config: SecuritySafetyConfig):
        self.config = config
        
        # Initialize components
        self.cultural_ethics = RomanianCulturalEthicsEngine()
        self.content_analyzer = ContentSafetyAnalyzer()
        self.action_validator = ActionSafetyValidator()
        self.threat_detector = ThreatDetectionEngine()
        
        # Security tracking
        self.security_sessions = {}
        self.safety_assessments = deque(maxlen=10000)
        
        # Performance metrics
        self.metrics = {
            'total_assessments': 0,
            'threats_detected': 0,
            'actions_blocked': 0,
            'cultural_violations': 0,
            'safety_score_average': 0.0,
            'response_time_average': 0.0,
            'false_positive_rate': 0.0,
            'assessment_types': defaultdict(int)
        }
        
        logger.info("RUAGA-NOVA Security & Safety Framework initialized")
    
    async def comprehensive_safety_assessment(self,
                                            content: str,
                                            action: Optional[str] = None,
                                            action_params: Optional[Dict[str, Any]] = None,
                                            context: Optional[SecurityContext] = None) -> SafetyAssessment:
        """Perform comprehensive safety assessment"""
        
        start_time = time.time()
        assessment_id = f"safety_{int(time.time() * 1000)}"
        
        if not context:
            context = SecurityContext(
                user_id="anonymous",
                session_id="default",
                ip_address="unknown",
                user_agent="unknown",
                timestamp=datetime.now(),
                authentication_level="none"
            )
        
        try:
            # Content safety analysis
            content_safety = await self.content_analyzer.analyze_content_safety(content)
            
            # Cultural ethics assessment
            cultural_assessment = await self.cultural_ethics.assess_cultural_ethics(
                content, context.cultural_context
            )
            
            # Threat detection
            threat_detection = await self.threat_detector.detect_threats(content, context)
            
            # Action safety validation (if action specified)
            action_validation = None
            if action:
                action_validation = await self.action_validator.validate_action_safety(
                    action, action_params or {}, context
                )
            
            # Calculate overall safety scores
            safety_score = self._calculate_overall_safety_score(
                content_safety, cultural_assessment, threat_detection, action_validation
            )
            
            cultural_sensitivity_score = self._calculate_cultural_sensitivity_score(cultural_assessment)
            
            # Determine threat level and risk categories
            threat_level = self._determine_threat_level(
                content_safety, threat_detection, action_validation
            )
            
            risk_categories = self._identify_risk_categories(
                content_safety, cultural_assessment, threat_detection
            )
            
            # Determine action safety level
            action_safety = ActionSafetyLevel.SAFE
            if action_validation:
                action_safety = action_validation['safety_level']
            elif safety_score < 0.5:
                action_safety = ActionSafetyLevel.PROHIBITED
            elif safety_score < 0.7:
                action_safety = ActionSafetyLevel.RESTRICTED
            
            # Generate recommendations
            recommendations = self._generate_safety_recommendations(
                content_safety, cultural_assessment, threat_detection, action_validation
            )
            
            cultural_recommendations = self._generate_cultural_recommendations(cultural_assessment)
            
            # Create safety assessment
            assessment = SafetyAssessment(
                content=content,
                assessment_id=assessment_id,
                threat_level=threat_level,
                risk_categories=risk_categories,
                safety_score=safety_score,
                cultural_sensitivity_score=cultural_sensitivity_score,
                action_safety=action_safety,
                recommendations=recommendations,
                cultural_recommendations=cultural_recommendations,
                assessment_time=time.time() - start_time
            )
            
            # Update metrics
            await self._update_assessment_metrics(assessment)
            
            # Store assessment
            self.safety_assessments.append(assessment)
            
            logger.info(f"Safety assessment completed: {assessment_id} "
                       f"(score: {safety_score:.2f}, time: {assessment.assessment_time:.3f}s)")
            
            return assessment
            
        except Exception as e:
            logger.error(f"Safety assessment error: {e}")
            return SafetyAssessment(
                content=content,
                assessment_id=assessment_id,
                threat_level=SecurityThreatLevel.CRITICAL,
                risk_categories=[SafetyRiskCategory.CONTENT_HARM],
                safety_score=0.0,
                cultural_sensitivity_score=0.0,
                action_safety=ActionSafetyLevel.PROHIBITED,
                recommendations=["Safety assessment failed - block all actions"],
                assessment_time=time.time() - start_time
            )
    
    def _calculate_overall_safety_score(self,
                                      content_safety: Dict[str, Any],
                                      cultural_assessment: Dict[str, Any],
                                      threat_detection: Dict[str, Any],
                                      action_validation: Optional[Dict[str, Any]]) -> float:
        """Calculate overall safety score"""
        
        scores = []
        weights = []
        
        # Content safety (weight: 0.4)
        scores.append(content_safety['safety_score'])
        weights.append(0.4)
        
        # Cultural harmony (weight: 0.3)
        scores.append(cultural_assessment['cultural_harmony_score'])
        weights.append(0.3)
        
        # Threat level (weight: 0.2)
        threat_score = max(0.0, 1.0 - threat_detection['risk_score'])
        scores.append(threat_score)
        weights.append(0.2)
        
        # Action safety (weight: 0.1)
        if action_validation:
            scores.append(action_validation['safety_score'])
            weights.append(0.1)
        
        # Calculate weighted average
        total_weight = sum(weights)
        weighted_sum = sum(score * weight for score, weight in zip(scores, weights))
        
        return weighted_sum / total_weight if total_weight > 0 else 0.0
    
    def _calculate_cultural_sensitivity_score(self, cultural_assessment: Dict[str, Any]) -> float:
        """Calculate cultural sensitivity score"""
        
        return (
            cultural_assessment['cultural_harmony_score'] * 0.4 +
            cultural_assessment['tradition_respect_score'] * 0.3 +
            cultural_assessment['value_alignment_score'] * 0.3
        )
    
    def _determine_threat_level(self,
                              content_safety: Dict[str, Any],
                              threat_detection: Dict[str, Any],
                              action_validation: Optional[Dict[str, Any]]) -> SecurityThreatLevel:
        """Determine overall threat level"""
        
        max_risk = max(
            1.0 - content_safety['safety_score'],
            threat_detection['risk_score'],
            0.0 if not action_validation else 1.0 - action_validation['safety_score']
        )
        
        if max_risk > 0.8:
            return SecurityThreatLevel.CRITICAL
        elif max_risk > 0.6:
            return SecurityThreatLevel.HIGH
        elif max_risk > 0.4:
            return SecurityThreatLevel.MEDIUM
        elif max_risk > 0.2:
            return SecurityThreatLevel.LOW
        else:
            return SecurityThreatLevel.MINIMAL
    
    def _identify_risk_categories(self,
                                content_safety: Dict[str, Any],
                                cultural_assessment: Dict[str, Any],
                                threat_detection: Dict[str, Any]) -> List[SafetyRiskCategory]:
        """Identify risk categories"""
        
        categories = []
        
        # Content-based risks
        if content_safety['harmful_patterns_found']:
            categories.append(SafetyRiskCategory.CONTENT_HARM)
        
        # Cultural risks
        if cultural_assessment['harmful_patterns_detected']:
            categories.append(SafetyRiskCategory.ROMANIAN_CULTURAL_HARM)
        
        if cultural_assessment['cultural_harmony_score'] < 0.7:
            categories.append(SafetyRiskCategory.CULTURAL_INSENSITIVITY)
        
        # Threat-based risks
        if threat_detection['threats_detected']:
            for threat in threat_detection['threats_detected']:
                if threat['type'] == 'injection_attempts':
                    categories.append(SafetyRiskCategory.PRIVACY_VIOLATION)
                elif threat['type'] == 'suspicious_requests':
                    categories.append(SafetyRiskCategory.ACTION_HARM)
        
        return list(set(categories))  # Remove duplicates
    
    def _generate_safety_recommendations(self,
                                       content_safety: Dict[str, Any],
                                       cultural_assessment: Dict[str, Any],
                                       threat_detection: Dict[str, Any],
                                       action_validation: Optional[Dict[str, Any]]) -> List[str]:
        """Generate safety recommendations"""
        
        recommendations = []
        
        # Add content safety recommendations
        recommendations.extend(content_safety.get('recommendations', []))
        
        # Add cultural recommendations
        recommendations.extend(cultural_assessment.get('recommendations', []))
        
        # Add threat detection recommendations
        recommendations.extend(threat_detection.get('recommendations', []))
        
        # Add action validation recommendations
        if action_validation:
            recommendations.extend(action_validation.get('recommendations', []))
        
        # Remove duplicates and return
        return list(set(recommendations))
    
    def _generate_cultural_recommendations(self, cultural_assessment: Dict[str, Any]) -> List[str]:
        """Generate Romanian cultural recommendations"""
        
        recommendations = []
        
        if cultural_assessment['cultural_harmony_score'] < 0.8:
            recommendations.append("Enhance Romanian cultural sensitivity")
        
        if cultural_assessment['tradition_respect_score'] < 0.7:
            recommendations.append("Show greater respect for Romanian traditions")
        
        if cultural_assessment['value_alignment_score'] < 0.6:
            recommendations.append("Align better with core Romanian values")
        
        if cultural_assessment['harmful_patterns_detected']:
            recommendations.append("Remove harmful cultural stereotypes or misconceptions")
        
        return recommendations
    
    async def _update_assessment_metrics(self, assessment: SafetyAssessment):
        """Update performance metrics"""
        
        self.metrics['total_assessments'] += 1
        
        if assessment.threat_level != SecurityThreatLevel.MINIMAL:
            self.metrics['threats_detected'] += 1
        
        if assessment.action_safety in [ActionSafetyLevel.PROHIBITED, ActionSafetyLevel.RESTRICTED]:
            self.metrics['actions_blocked'] += 1
        
        if SafetyRiskCategory.ROMANIAN_CULTURAL_HARM in assessment.risk_categories:
            self.metrics['cultural_violations'] += 1
        
        # Update averages
        total = self.metrics['total_assessments']
        
        self.metrics['safety_score_average'] = (
            (self.metrics['safety_score_average'] * (total - 1) + assessment.safety_score) / total
        )
        
        self.metrics['response_time_average'] = (
            (self.metrics['response_time_average'] * (total - 1) + assessment.assessment_time) / total
        )
        
        # Update assessment type distribution
        for category in assessment.risk_categories:
            self.metrics['assessment_types'][category.value] += 1
    
    def get_security_summary(self) -> Dict[str, Any]:
        """Get comprehensive security summary"""
        
        return {
            'total_assessments': self.metrics['total_assessments'],
            'threats_detected': self.metrics['threats_detected'],
            'threat_detection_rate': (
                self.metrics['threats_detected'] / self.metrics['total_assessments']
                if self.metrics['total_assessments'] > 0 else 0.0
            ),
            'actions_blocked': self.metrics['actions_blocked'],
            'cultural_violations': self.metrics['cultural_violations'],
            'average_safety_score': self.metrics['safety_score_average'],
            'average_response_time': self.metrics['response_time_average'],
            'false_positive_rate': self.metrics['false_positive_rate'],
            'risk_category_distribution': dict(self.metrics['assessment_types']),
            'security_grade': self._calculate_security_grade()
        }
    
    def _calculate_security_grade(self) -> str:
        """Calculate overall security grade"""
        
        if self.metrics['total_assessments'] == 0:
            return "No data"
        
        avg_safety = self.metrics['safety_score_average']
        threat_rate = self.metrics['threats_detected'] / self.metrics['total_assessments']
        response_time = self.metrics['response_time_average']
        
        # Score based on safety (50%), threat detection (30%), and speed (20%)
        speed_score = max(0.0, 1.0 - min(1.0, response_time))
        detection_score = min(1.0, threat_rate * 2.0)  # Good if detecting threats
        
        overall_score = (avg_safety * 0.5) + (detection_score * 0.3) + (speed_score * 0.2)
        
        if overall_score >= 0.9:
            return "A+ (Excellent)"
        elif overall_score >= 0.8:
            return "A (Very Good)"
        elif overall_score >= 0.7:
            return "B (Good)"
        elif overall_score >= 0.6:
            return "C (Fair)"
        else:
            return "D (Needs Improvement)"


async def test_security_safety_framework():
    """Test Security & Safety Framework"""
    
    print("🛡️ RUAGA-NOVA Security & Safety Framework Test")
    print("=" * 60)
    
    # Initialize framework
    config = SecuritySafetyConfig(
        content_filtering_enabled=True,
        romanian_cultural_ethics_enabled=True,
        action_validation_enabled=True,
        real_time_monitoring=True
    )
    
    framework = SecuritySafetyFramework(config)
    
    # Test cases
    test_cases = [
        {
            'content': 'Please help me learn about Romanian culture and traditions',
            'action': 'get_information',
            'description': 'Safe cultural learning request',
            'expected_safety': 'high'
        },
        {
            'content': 'Romanian people are always lazy and backwards',
            'action': None,
            'description': 'Harmful cultural stereotype',
            'expected_safety': 'low'
        },
        {
            'content': 'Delete all files from the system directory',
            'action': 'delete_file',
            'description': 'Dangerous system action',
            'expected_safety': 'very_low'
        },
        {
            'content': 'Explain the beautiful Romanian folklore about Ioana Cosanzeana',
            'action': 'explain',
            'description': 'Positive cultural content',
            'expected_safety': 'high'
        },
        {
            'content': 'SELECT * FROM users WHERE password = "admin"',
            'action': 'database_query',
            'description': 'Suspicious database query',
            'expected_safety': 'low'
        }
    ]
    
    print(f"\n🔍 Testing {len(test_cases)} security scenarios...")
    
    results = []
    
    # Process each test case
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📊 Test Case {i}: {test_case['description']}")
        print(f"   Content: {test_case['content'][:60]}...")
        print(f"   Action: {test_case['action'] or 'None'}")
        print(f"   Expected Safety: {test_case['expected_safety']}")
        
        # Create security context
        context = SecurityContext(
            user_id=f"test_user_{i}",
            session_id=f"test_session_{i}",
            ip_address="192.168.1.100",
            user_agent="TestAgent/1.0",
            timestamp=datetime.now(),
            authentication_level="standard",
            permissions=['read_access', 'write_access'],
            cultural_context={'region': 'Romania', 'language': 'Romanian'}
        )
        
        # Perform safety assessment
        assessment = await framework.comprehensive_safety_assessment(
            content=test_case['content'],
            action=test_case['action'],
            action_params={} if test_case['action'] else None,
            context=context
        )
        
        results.append(assessment)
        
        print(f"   ✅ Safety Score: {assessment.safety_score:.2f}")
        print(f"   🏛️ Cultural Score: {assessment.cultural_sensitivity_score:.2f}")
        print(f"   ⚠️ Threat Level: {assessment.threat_level.value}")
        print(f"   🎯 Action Safety: {assessment.action_safety.value}")
        print(f"   ⏱️ Assessment Time: {assessment.assessment_time:.3f}s")
        
        if assessment.risk_categories:
            print(f"   🚨 Risk Categories: {', '.join(cat.value for cat in assessment.risk_categories)}")
        
        if assessment.recommendations:
            print(f"   💡 Recommendations: {len(assessment.recommendations)} items")
    
    # Security summary
    summary = framework.get_security_summary()
    
    print(f"\n📊 SECURITY PERFORMANCE SUMMARY")
    print("=" * 40)
    print(f"Total assessments: {summary['total_assessments']}")
    print(f"Threats detected: {summary['threats_detected']}")
    print(f"Threat detection rate: {summary['threat_detection_rate']:.1%}")
    print(f"Actions blocked: {summary['actions_blocked']}")
    print(f"Cultural violations: {summary['cultural_violations']}")
    print(f"Average safety score: {summary['average_safety_score']:.2f}")
    print(f"Average response time: {summary['average_response_time']:.3f}s")
    print(f"Security grade: {summary['security_grade']}")
    
    # Risk category analysis
    if summary['risk_category_distribution']:
        print(f"\n🎯 Risk category distribution:")
        for category, count in summary['risk_category_distribution'].items():
            percentage = (count / summary['total_assessments']) * 100
            print(f"   {category}: {count} ({percentage:.1f}%)")
    
    # Detailed analysis of most critical case
    critical_assessments = [r for r in results if r.threat_level == SecurityThreatLevel.CRITICAL]
    if critical_assessments:
        critical = critical_assessments[0]
        print(f"\n🚨 CRITICAL THREAT ANALYSIS")
        print("=" * 40)
        print(f"Content: {critical.content[:100]}...")
        print(f"Threat Level: {critical.threat_level.value}")
        print(f"Safety Score: {critical.safety_score:.2f}")
        print(f"Cultural Score: {critical.cultural_sensitivity_score:.2f}")
        print(f"Risk Categories: {', '.join(cat.value for cat in critical.risk_categories)}")
        print(f"Recommendations:")
        for rec in critical.recommendations[:3]:
            print(f"   - {rec}")
    
    print(f"\n✨ Security & Safety Framework testing completed!")
    print(f"🎉 Todo 15: Security & Safety Framework - READY FOR COMPLETION!")
    
    return framework, results, summary


if __name__ == "__main__":
    asyncio.run(test_security_safety_framework())